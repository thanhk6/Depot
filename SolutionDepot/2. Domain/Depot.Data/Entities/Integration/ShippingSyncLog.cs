using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Integration
{
    /// <summary>
    /// Nhật ký đồng bộ sự kiện container sang hệ thống hãng tàu hoặc cổng tích hợp.
    /// </summary>
    public class ShippingSyncLog : FullAuditedEntity<long>
    {
        /// <summary>Khóa ngoại trỏ về DepotJob.</summary>
        public long DepotJobId { get; set; }
        /// <summary>Số container được đồng bộ.</summary>
        public string ContainerNo { get; set; } = string.Empty;
        /// <summary>Mã hãng tàu/đối tác nhận đồng bộ.</summary>
        public string CarrierCode { get; set; } = string.Empty;
        /// <summary>Loại sự kiện đồng bộ.</summary>
        public string EventType { get; set; } = string.Empty;
        /// <summary>Trạng thái phản hồi từ hệ thống đích.</summary>
        public string Status { get; set; } = "ACKNOWLEDGED";
        /// <summary>Token xác nhận đồng bộ.</summary>
        public string AckToken { get; set; } = string.Empty;
        /// <summary>Thời điểm ghi nhận đồng bộ.</summary>
        public DateTime SyncedAt { get; set; } = DateTime.UtcNow;
        /// <summary>Thông báo lỗi nếu đồng bộ thất bại.</summary>
        public string? ErrorMessage { get; set; }
    }
}
