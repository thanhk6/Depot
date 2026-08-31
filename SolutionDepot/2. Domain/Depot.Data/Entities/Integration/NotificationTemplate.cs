using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Integration;

/// <summary>Mẫu tin thông báo (ZNS/OA/In-App) theo sự kiện nghiệp vụ.</summary>
public class NotificationTemplate : FullAuditedEntity<long>
{
    /// <summary>Mã mẫu tin (business key), thường trùng BusinessEventType, vd GATE_IN_COMPLETED.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Tên hiển thị.</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Loại sự kiện kích hoạt.</summary>
    public string EventType { get; set; } = string.Empty;
    /// <summary>Đối tượng nhận mặc định: EMPLOYEE, CUSTOMER, ALL.</summary>
    public string TargetAudience { get; set; } = "ALL";
    /// <summary>Kênh gửi mặc định.</summary>
    public string Channel { get; set; } = "IN_APP";
    /// <summary>Mẫu tiêu đề (có thể chứa placeholder {{...}}).</summary>
    public string TitleTemplate { get; set; } = string.Empty;
    /// <summary>Mẫu nội dung (có thể chứa placeholder {{...}}).</summary>
    public string ContentTemplate { get; set; } = string.Empty;
    /// <summary>Danh sách biến placeholder, lưu dạng JSON mảng chuỗi.</summary>
    public string? VariablesJson { get; set; }
    /// <summary>Còn dùng hay đã ngừng.</summary>
    public bool IsActive { get; set; } = true;
    /// <summary>Nhãn nút CTA (nếu có).</summary>
    public string? CtaButtonText { get; set; }
    /// <summary>Đường dẫn nút CTA (nếu có).</summary>
    public string? CtaButtonUrl { get; set; }
}
