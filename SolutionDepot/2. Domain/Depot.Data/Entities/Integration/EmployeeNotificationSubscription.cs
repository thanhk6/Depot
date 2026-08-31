using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Integration;

/// <summary>
/// Đăng ký nhận thông báo của 1 nhân viên (liên kết logic sang SystemUser.Username — SystemUser là
/// bảng legacy khoá int, không có business key Code riêng nên dùng Username làm khoá liên kết).
/// </summary>
public class EmployeeNotificationSubscription : FullAuditedEntity<long>
{
    /// <summary>Mã bản ghi (business key).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Username nhân viên (liên kết logic sang SystemUser.Username).</summary>
    public string Username { get; set; } = string.Empty;
    /// <summary>Danh sách mã sự kiện đã đăng ký nhận, lưu dạng JSON mảng chuỗi.</summary>
    public string SubscribedEventsJson { get; set; } = "[]";
    /// <summary>Đã liên kết Zalo cá nhân hay chưa (demo — chưa có tích hợp Zalo OA thật).</summary>
    public bool ZaloConnected { get; set; }
    /// <summary>Tên hiển thị Zalo (demo).</summary>
    public string? ZaloName { get; set; }
}
