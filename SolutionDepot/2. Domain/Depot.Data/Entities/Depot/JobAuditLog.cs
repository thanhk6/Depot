using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Nhật ký nghiệp vụ theo từng bước xử lý của một DepotJob.
    /// </summary>
    public class JobAuditLog : FullAuditedEntity<long>
    {
        /// <summary>Khóa ngoại trỏ về DepotJob.</summary>
        public long DepotJobId { get; set; }
        /// <summary>Mã job nghiệp vụ mà log này thuộc về.</summary>
        public string JobNo { get; set; } = string.Empty;

        /// <summary>Tên hành động đã thực hiện.</summary>
        public string Action { get; set; } = string.Empty;
        /// <summary>Người thực hiện hành động.</summary>
        public string User { get; set; } = string.Empty;
        /// <summary>Thời điểm ghi nhận log.</summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        /// <summary>Chi tiết bổ sung cho hành động.</summary>
        public string Details { get; set; } = string.Empty;
    }
}
