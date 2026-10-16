using System;

namespace Depot.ViewModels
{
    /// <summary>Metadata 1 file đã upload — trả về sau khi lưu thành công hoặc khi tra danh sách file
    /// đính kèm 1 bản ghi nghiệp vụ.</summary>
    public class DepotFileDto
    {
        public long Id { get; set; }
        public long IdTable { get; set; }
        public string TableName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public byte Type { get; set; }
        public string FileType { get; set; } = string.Empty;
        /// <summary>URL đầy đủ để tải file (ghép từ IpServer + Path) — frontend dùng thẳng làm `src` ảnh/link tải.</summary>
        public string Url { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>Yêu cầu xóa 1 file đính kèm.</summary>
    public class DeleteDepotFileRequest
    {
        public long Id { get; set; }
    }
}
