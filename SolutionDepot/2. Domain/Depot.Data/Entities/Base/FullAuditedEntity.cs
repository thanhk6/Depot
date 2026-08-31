using System;

namespace Depot.Data.Entities.Base
{
    /// <summary>
    /// Base entity dùng chung cho toàn bộ model, chứa khóa chính và thông tin audit/xóa mềm.
    /// </summary>
    public abstract class FullAuditedEntity<TKey>
    {
        /// <summary>Khóa chính của bản ghi.</summary>
        public TKey Id { get; set; } = default!;
        /// <summary>Thời điểm tạo bản ghi.</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        /// <summary>Người tạo bản ghi.</summary>
        public string? CreatedBy { get; set; }
        /// <summary>Thời điểm cập nhật gần nhất.</summary>
        public DateTime? LastModifiedAt { get; set; }
        /// <summary>Người cập nhật gần nhất.</summary>
        public string? LastModifiedBy { get; set; }
        /// <summary>Trạng thái xóa mềm.</summary>
        public bool IsDeleted { get; set; } = false;
        /// <summary>Thời điểm xóa mềm.</summary>
        public DateTime? DeletedAt { get; set; }
        /// <summary>Người thực hiện xóa mềm.</summary>
        public string? DeletedBy { get; set; }
    }
}
