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
