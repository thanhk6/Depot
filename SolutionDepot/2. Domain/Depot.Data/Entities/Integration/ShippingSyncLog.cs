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
        /// <summary>SENT (hãng tàu trả 2xx) / FAILED. Bản ghi cũ "ACKNOWLEDGED" là ACK tự sinh của adapter giả lập trước đây.</summary>
        public string Status { get; set; } = "FAILED";
        /// <summary>Mã xác nhận lấy từ phản hồi của hãng tàu (rỗng nếu hãng tàu không trả).</summary>
        public string AckToken { get; set; } = string.Empty;
        /// <summary>Thời điểm ghi nhận đồng bộ.</summary>
        public DateTime SyncedAt { get; set; } = DateTime.UtcNow;
        /// <summary>Thông báo lỗi nếu đồng bộ thất bại.</summary>
        public string? ErrorMessage { get; set; }
        /// <summary>Endpoint đã gọi.</summary>
        public string? EndpointUrl { get; set; }
        /// <summary>Mã HTTP hãng tàu trả về (null nếu không kết nối được / timeout).</summary>
        public int? HttpStatusCode { get; set; }
        /// <summary>Thời gian chờ phản hồi (ms).</summary>
        public int? LatencyMs { get; set; }
        /// <summary>Nội dung JSON đã gửi.</summary>
        public string? RequestBody { get; set; }
        /// <summary>Nội dung phản hồi của hãng tàu (cắt tối đa 8000 ký tự).</summary>
        public string? ResponseBody { get; set; }
        /// <summary>Tài khoản thực hiện gửi.</summary>
        public string? TriggeredBy { get; set; }
    }
}
