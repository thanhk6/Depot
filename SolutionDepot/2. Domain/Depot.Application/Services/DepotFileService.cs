using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Depot.Data.EF;
using Depot.Data.Entities.Storage;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    public sealed class DepotFileService : IDepotFileService
    {
        private readonly DepotDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _fileServerBaseUrl;

        public DepotFileService(DepotDbContext db, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
            // Depot.FileServer là host riêng biệt, không chung DB với Depot.BackendApi — chỉ gọi qua HTTP,
            // giữ đúng ranh giới đã vẽ trong docs/backend-progress/00-quy-tac-backend.md mục 1 (FileServer
            // = "upload", tách khỏi BackendApi). BaseUrl cấu hình được (khác server/CDN sau này) thay vì hardcode.
            _fileServerBaseUrl = configuration["FileServer:BaseUrl"] ?? "http://localhost:50211";
            // Địa chỉ TRÌNH DUYỆT dùng để tải file — khác BaseUrl (địa chỉ nội bộ backend gọi FileServer).
            // Mặc định rỗng = URL tương đối "/api/files/..." đi qua frontend server.ts (proxy sang FileServer),
            // chạy được cả dev lẫn VPS. Trước đây URL trả về luôn là "http://localhost:50211/..." nên trên VPS
            // trình duyệt người dùng không mở được ảnh.
            _publicBaseUrl = (configuration["FileServer:PublicBaseUrl"] ?? string.Empty).TrimEnd('/');
        }

        private readonly string _publicBaseUrl;

        public async Task<DepotFileDto> UploadAsync(Stream content, string fileName, long idTable, string tableName, byte type)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                throw new ArgumentException("Thiếu TableName — không xác định được file đính kèm vào bản ghi nào.");

            // BUG-028: trước đây gắn được file vào TableName/IdTable tuỳ ý, để lại metadata + file vật lý mồ côi.
            // Chỉ nhận các bảng thật sự có ảnh đính kèm, và bản ghi đích phải tồn tại.
            var targetExists = tableName switch
            {
                "DepotJob" => await _db.DepotJobs.AnyAsync(x => x.Id == idTable),
                "RepairOrder" => await _db.RepairOrders.AnyAsync(x => x.Id == idTable),
                "CleaningRecord" => await _db.CleaningRecords.AnyAsync(x => x.Id == idTable),
                _ => throw new ArgumentException($"TableName '{tableName}' không hỗ trợ đính kèm file (DepotJob, RepairOrder, CleaningRecord).")
            };
            if (!targetExists)
                throw new ArgumentException($"Không tìm thấy bản ghi {tableName} #{idTable} để đính kèm file.");

            var client = _httpClientFactory.CreateClient("FileServer");
            using var form = new MultipartFormDataContent();
            using var streamContent = new StreamContent(content);
            streamContent.Headers.ContentType = MediaTypeHeaderValue.Parse(GuessContentType(fileName));
            form.Add(streamContent, "file", fileName);

            var response = await client.PostAsync("/api/files/upload", form);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                // FileServer trả lỗi nghiệp vụ (file rỗng, quá size, sai định dạng) dạng { message } —
                // đẩy nguyên văn lý do thật lên thay vì nuốt mất thành lỗi 500 chung chung.
                var reason = TryReadMessage(body) ?? $"Depot.FileServer từ chối upload (HTTP {(int)response.StatusCode}).";
                throw new InvalidOperationException(reason);
            }

            var stored = JsonSerializer.Deserialize<UploadResponseEnvelope>(body, JsonOptions)?.Data
                ?? throw new InvalidOperationException("Depot.FileServer trả về phản hồi không hợp lệ.");

            var extension = Path.GetExtension(stored.StoredName).TrimStart('.').ToLowerInvariant();
            var file = new DepotFile
            {
                IdTable = idTable,
                TableName = tableName,
                NameGuid = stored.StoredName,
                Name = stored.OriginalName,
                IpServer = _fileServerBaseUrl,
                Type = type,
                Path = $"/api/files/{stored.FileId}/{stored.StoredName}",
                FileType = extension
            };
            _db.Set<DepotFile>().Add(file);
            await _db.SaveChangesAsync();

            return MapToDto(file);
        }

        public async Task<List<DepotFileDto>> GetFilesAsync(string tableName, long idTable)
        {
            var files = await _db.Set<DepotFile>()
                .Where(f => f.TableName == tableName && f.IdTable == idTable && !f.IsDeleted)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
            return files.Select(MapToDto).ToList();
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var file = await _db.Set<DepotFile>().FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);
            if (file == null) return false;

            // Xóa vật lý bên FileServer trước — nếu lỗi mạng/file không còn thì vẫn tiếp tục soft-delete
            // record để không kẹt lại rác hiển thị trên UI (ưu tiên gọn dữ liệu nghiệp vụ hơn dọn đĩa ngay).
            try
            {
                var client = _httpClientFactory.CreateClient("FileServer");
                var fileId = file.Path.Split('/', StringSplitOptions.RemoveEmptyEntries).ElementAtOrDefault(2) ?? string.Empty;
                await client.DeleteAsync($"/api/files/{fileId}/{file.NameGuid}");
            }
            catch (HttpRequestException)
            {
                // Best-effort — record vẫn được đánh dấu xóa mềm bên dưới.
            }

            file.IsDeleted = true;
            file.DeletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        private DepotFileDto MapToDto(DepotFile file) => new()
        {
            Id = file.Id,
            IdTable = file.IdTable,
            TableName = file.TableName,
            Name = file.Name,
            Type = file.Type,
            FileType = file.FileType,
            Url = _publicBaseUrl + file.Path,
            CreatedAt = file.CreatedAt
        };

        private static string? TryReadMessage(string body)
        {
            try { return JsonDocument.Parse(body).RootElement.GetProperty("message").GetString(); }
            catch { return null; }
        }

        private static string GuessContentType(string fileName) => Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".pdf" => "application/pdf",
            ".csv" => "text/csv",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ => "application/octet-stream"
        };

        private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

        private sealed class UploadResponseEnvelope
        {
            [JsonPropertyName("data")]
            public StoredFileDto? Data { get; set; }
        }

        private sealed class StoredFileDto
        {
            [JsonPropertyName("fileId")]
            public string FileId { get; set; } = string.Empty;
            [JsonPropertyName("originalName")]
            public string OriginalName { get; set; } = string.Empty;
            [JsonPropertyName("storedName")]
            public string StoredName { get; set; } = string.Empty;
        }
    }
}
