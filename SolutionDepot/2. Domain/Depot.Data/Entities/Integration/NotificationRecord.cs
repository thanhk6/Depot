using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Integration;

/// <summary>
/// Bản ghi thông báo hệ thống, lưu nội dung gửi đi, trạng thái và dữ liệu phản hồi.
/// </summary>
public class NotificationRecord : FullAuditedEntity<long>
{
    /// <summary>Mã tracking cho lần gửi thông báo.</summary>
    public string TrackingCode { get; set; } = string.Empty;
    /// <summary>Mã template đã sử dụng.</summary>
    public string TemplateCode { get; set; } = string.Empty;
    /// <summary>Loại sự kiện kích hoạt thông báo.</summary>
    public string EventType { get; set; } = string.Empty;
    /// <summary>Kiểu người nhận, ví dụ ALL, CUSTOMER, DRIVER.</summary>
    public string RecipientType { get; set; } = "ALL";
    /// <summary>Mã định danh người nhận.</summary>
    public string RecipientId { get; set; } = string.Empty;
    /// <summary>Tên người nhận nếu có.</summary>
    public string? RecipientName { get; set; }
    /// <summary>Số điện thoại người nhận nếu có.</summary>
    public string? RecipientPhone { get; set; }
    /// <summary>Kênh gửi thông báo.</summary>
    public string Channel { get; set; } = "IN_APP";
    /// <summary>Tiêu đề thông báo.</summary>
    public string Title { get; set; } = string.Empty;
    /// <summary>Nội dung thông báo.</summary>
    public string Content { get; set; } = string.Empty;
    /// <summary>Trạng thái xử lý thông báo.</summary>
    public string Status { get; set; } = "PENDING";
    /// <summary>Mức độ ưu tiên của thông báo.</summary>
    public string Priority { get; set; } = "NORMAL";
    /// <summary>Loại entity liên quan đến thông báo.</summary>
    public string? EntityType { get; set; }
    /// <summary>Mã định danh entity liên quan.</summary>
    public string? EntityId { get; set; }
    /// <summary>Chuỗi tham chiếu nghiệp vụ bổ sung.</summary>
    public string? EntityReference { get; set; }
    /// <summary>Số lần đã thử gửi lại.</summary>
    public int RetryCount { get; set; }
    /// <summary>Số lần thử tối đa trước khi đánh dấu lỗi.</summary>
    public int MaxRetries { get; set; } = 3;
    /// <summary>Thời điểm gửi thành công.</summary>
    public DateTime? SentAt { get; set; }
    /// <summary>Thời điểm thất bại gần nhất.</summary>
    public DateTime? FailedAt { get; set; }
    /// <summary>Thông báo lỗi nếu gửi thất bại.</summary>
    public string? ErrorMessage { get; set; }
    /// <summary>Dữ liệu request đã gửi đi.</summary>
    public string? RequestPayload { get; set; }
    /// <summary>Dữ liệu response nhận về.</summary>
    public string? ResponsePayload { get; set; }
    /// <summary>Cờ đã đọc của thông báo.</summary>
    public bool IsRead { get; set; }
}
