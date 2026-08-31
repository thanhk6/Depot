using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Người dùng portal của khách hàng để truy cập các chức năng trực tuyến.
/// </summary>
public class CustomerPortalUser : FullAuditedEntity<long>
{
    /// <summary>Mã khách hàng sở hữu tài khoản portal.</summary>
    public string CustomerCode { get; set; } = string.Empty;
    /// <summary>Tên đăng nhập portal.</summary>
    public string Username { get; set; } = string.Empty;
    /// <summary>Họ tên hiển thị của người dùng portal.</summary>
    public string FullName { get; set; } = string.Empty;
    /// <summary>Email liên hệ hoặc nhận thông báo.</summary>
    public string? Email { get; set; }
    /// <summary>Số điện thoại liên hệ.</summary>
    public string? Phone { get; set; }
    /// <summary>Vai trò nghiệp vụ của tài khoản portal.</summary>
    public string Role { get; set; } = "CUSTOMER_USER";
    /// <summary>Kiểu tài khoản hoặc phạm vi sử dụng.</summary>
    public string AccountType { get; set; } = "INTERNAL_ORG";
    /// <summary>Trạng thái hoạt động của tài khoản.</summary>
    public string Status { get; set; } = "ACTIVE";
    /// <summary>Thời điểm đăng nhập gần nhất.</summary>
    public DateTime? LastLogin { get; set; }
}
