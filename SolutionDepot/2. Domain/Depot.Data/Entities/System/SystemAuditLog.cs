using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.System;

/// <summary>
/// Nhật ký hành động thực hiện trên màn Hệ Thống & Phân Quyền (tạo/sửa/khoá user, đổi quyền,
/// đổi chính sách bảo mật...) — tách biệt với JobAuditLog (chỉ ghi hành động gắn với 1 DepotJob cụ thể).
/// </summary>
public class SystemAuditLog : FullAuditedEntity<long>
{
    /// <summary>Mã bản ghi nhật ký (business key).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Loại hành động: CREATE_USER, UPDATE_USER, DELETE_USER, CHANGE_PERMISSIONS, RESET_PASSWORD, UPDATE_SECURITY_POLICY...</summary>
    public string Action { get; set; } = string.Empty;
    /// <summary>Nhãn hiển thị tiếng Việt của hành động.</summary>
    public string ActionLabel { get; set; } = string.Empty;
    /// <summary>Tài nguyên bị tác động (vd tên tài khoản, tên vai trò).</summary>
    public string TargetResource { get; set; } = string.Empty;
    /// <summary>Chi tiết bổ sung.</summary>
    public string? Details { get; set; }
    /// <summary>Người thực hiện hành động.</summary>
    public string PerformedByName { get; set; } = string.Empty;
    /// <summary>Vai trò của người thực hiện tại thời điểm hành động.</summary>
    public string? PerformedByRole { get; set; }
    /// <summary>Địa chỉ IP nguồn (nếu có).</summary>
    public string? IpAddress { get; set; }
    /// <summary>Thiết bị/trình duyệt nguồn (nếu có).</summary>
    public string? DeviceInfo { get; set; }
    /// <summary>Kết quả hành động: SUCCESS, WARNING, DENIED.</summary>
    public string Status { get; set; } = "SUCCESS";
    /// <summary>Thời điểm hành động xảy ra (khác CreatedAt của bản ghi audit nếu ghi trễ).</summary>
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
}
