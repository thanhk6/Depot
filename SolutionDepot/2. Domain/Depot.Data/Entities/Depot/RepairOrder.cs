using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Lệnh sửa chữa phát sinh sau khi hãng tàu phê duyệt báo giá.
    /// </summary>
    public class RepairOrder : FullAuditedEntity<long>
    {
        /// <summary>Khóa ngoại trỏ về DepotJob.</summary>
        public long DepotJobId { get; set; }
        /// <summary>Mã job nghiệp vụ liên quan.</summary>
        public string JobNo { get; set; } = string.Empty;

        /// <summary>Mã nhân sự/đội kỹ thuật phụ trách sửa chữa.</summary>
        public string TechnicianId { get; set; } = string.Empty;
        /// <summary>Tên nhân sự/đội kỹ thuật phụ trách sửa chữa.</summary>
        public string TechnicianName { get; set; } = string.Empty;
        /// <summary>Thời điểm bắt đầu sửa chữa.</summary>
        public DateTime? StartedAt { get; set; }
        /// <summary>Thời điểm hoàn thành sửa chữa.</summary>
        public DateTime? CompletedAt { get; set; }
        /// <summary>Trạng thái kiểm tra chất lượng sau sửa chữa.</summary>
        public string QcStatus { get; set; } = "PENDING";
        /// <summary>Ghi chú QC hoặc nhận xét sau sửa chữa.</summary>
        public string? QcNotes { get; set; }
        /// <summary>Tên người kiểm tra/giám sát.</summary>
        public string? InspectorName { get; set; }
    }
}
