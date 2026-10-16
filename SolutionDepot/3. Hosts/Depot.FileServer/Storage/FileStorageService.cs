using Microsoft.AspNetCore.Http;

namespace Depot.FileServer.Storage;

public sealed record StoredFile(string FileId, string OriginalName, string StoredName, string ContentType, long Length);

public interface IFileStorageService
{
    Task<StoredFile> SaveAsync(IFormFile file, CancellationToken cancellationToken);
    FileStream? OpenRead(string fileId, string storedName);
    bool Delete(string fileId, string storedName);
}

public sealed class FileStorageService : IFileStorageService
{
    private readonly string rootPath;
    private readonly long maxFileSize;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".pdf", ".edi", ".txt", ".csv", ".xlsx"
    };

    public FileStorageService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        var configuredPath = configuration["Storage:RootPath"] ?? "storage-files";
        rootPath = Path.IsPathRooted(configuredPath) ? configuredPath : Path.Combine(environment.ContentRootPath, configuredPath);
        maxFileSize = configuration.GetValue<long>("Storage:MaxFileSizeBytes", 20 * 1024 * 1024);
        Directory.CreateDirectory(rootPath);
    }

    public async Task<StoredFile> SaveAsync(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length <= 0) throw new InvalidOperationException("File rỗng không được phép lưu.");
        if (file.Length > maxFileSize) throw new InvalidOperationException("File vượt quá giới hạn cho phép.");
        var originalName = Path.GetFileName(file.FileName);
        var extension = Path.GetExtension(originalName);
        if (!AllowedExtensions.Contains(extension)) throw new InvalidOperationException("Định dạng file không được hỗ trợ.");
        // Chỉ đổi tên đuôi file (vd: đổi virus.exe -> photo.jpg) vẫn qua được check trên vì check trên
        // chỉ nhìn đuôi tên file. Đọc thật vài byte đầu (magic bytes) để xác nhận NỘI DUNG file đúng
        // đúng là định dạng khai báo — chỉ áp dụng cho các định dạng nhị phân có chữ ký ổn định
        // (ảnh/pdf/xlsx); .txt/.csv/.edi là văn bản thuần không có magic bytes chuẩn nên bỏ qua bước này.
        await ValidateContentMatchesExtensionAsync(file, extension, cancellationToken);

        var fileId = Guid.NewGuid().ToString("N");
        var storedName = fileId + extension.ToLowerInvariant();
        await using var output = new FileStream(GetSafePath(fileId, storedName), FileMode.CreateNew, FileAccess.Write, FileShare.None);
        await file.CopyToAsync(output, cancellationToken);
        return new StoredFile(fileId, originalName, storedName, file.ContentType, file.Length);
    }

    public FileStream? OpenRead(string fileId, string storedName)
    {
        var path = GetSafePath(fileId, storedName);
        return File.Exists(path) ? new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read) : null;
    }

    public bool Delete(string fileId, string storedName)
    {
        var path = GetSafePath(fileId, storedName);
        if (!File.Exists(path)) return false;
        File.Delete(path);
        return true;
    }

    // Chữ ký byte đầu file (magic bytes) đã công bố công khai cho từng định dạng nhị phân — dùng để
    // đối chiếu NỘI DUNG thật với đuôi tên file khai báo, chặn kiểu tấn công đổi tên file độc hại
    // thành đuôi được cho phép (vd. renamed .exe/.html -> .jpg).
    private static readonly Dictionary<string, Func<byte[], bool>> ContentSignatureValidators = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = b => b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF,
        [".jpeg"] = b => b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF,
        [".png"] = b => b.Length >= 8 && b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47
            && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A,
        [".webp"] = b => b.Length >= 12 && b[0] == 0x52 && b[1] == 0x49 && b[2] == 0x46 && b[3] == 0x46
            && b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50, // "RIFF"....."WEBP"
        [".pdf"] = b => b.Length >= 4 && b[0] == 0x25 && b[1] == 0x50 && b[2] == 0x44 && b[3] == 0x46, // "%PDF"
        // .xlsx là file ZIP (Office Open XML) — chữ ký ZIP "PK\x03\x04".
        [".xlsx"] = b => b.Length >= 4 && b[0] == 0x50 && b[1] == 0x4B && b[2] == 0x03 && b[3] == 0x04,
    };

    private static async Task ValidateContentMatchesExtensionAsync(IFormFile file, string extension, CancellationToken cancellationToken)
    {
        if (!ContentSignatureValidators.TryGetValue(extension, out var isValidSignature)) return;

        var header = new byte[12];
        await using var readStream = file.OpenReadStream();
        var bytesRead = await readStream.ReadAsync(header.AsMemory(0, header.Length), cancellationToken);
        var actualHeader = bytesRead == header.Length ? header : header[..bytesRead];

        if (!isValidSignature(actualHeader))
            throw new InvalidOperationException($"Nội dung file không khớp với định dạng '{extension}' đã khai báo (file có thể bị đổi đuôi để né kiểm tra).");
    }

    private string GetSafePath(string fileId, string storedName)
    {
        if (!Guid.TryParseExact(fileId, "N", out _)) throw new InvalidOperationException("FileId không hợp lệ.");
        var safeName = Path.GetFileName(storedName);
        if (!safeName.StartsWith(fileId, StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Tên file không hợp lệ.");
        var root = Path.GetFullPath(rootPath) + Path.DirectorySeparatorChar;
        var path = Path.GetFullPath(Path.Combine(rootPath, safeName));
        if (!path.StartsWith(root, StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Đường dẫn file không hợp lệ.");
        return path;
    }
}
