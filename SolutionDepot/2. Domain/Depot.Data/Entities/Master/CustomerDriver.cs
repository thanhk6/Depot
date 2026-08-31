using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Tài xế thuộc một khách hàng, dùng cho luồng đăng nhập và gate-in online.
/// </summary>
public class CustomerDriver : FullAuditedEntity<long>
{
    /// <summary>Mã khách hàng sở hữu tài xế này.</summary>
    public string CustomerCode { get; set; } = string.Empty;
    /// <summary>Mã tài xế nội bộ của khách hàng.</summary>
    public string DriverCode { get; set; } = string.Empty;
    /// <summary>Họ tên đầy đủ của tài xế.</summary>
    public string FullName { get; set; } = string.Empty;
    /// <summary>Số điện thoại liên hệ của tài xế.</summary>
    public string? Phone { get; set; }
    /// <summary>Email của tài xế.</summary>
    public string? Email { get; set; }
    /// <summary>Số định danh công dân hoặc CCCD.</summary>
    public string? CitizenId { get; set; }
    /// <summary>Số giấy phép lái xe.</summary>
    public string? LicenseNumber { get; set; }
    /// <summary>Hạng giấy phép lái xe.</summary>
    public string LicenseGrade { get; set; } = "FC";
    /// <summary>Ngày hết hạn giấy phép lái xe.</summary>
    public DateTime? LicenseExpiryDate { get; set; }
    /// <summary>Địa chỉ cư trú hoặc thông tin địa chỉ liên hệ.</summary>
    public string? Address { get; set; }
    /// <summary>Trạng thái hoạt động của tài xế.</summary>
    public string Status { get; set; } = "ACTIVE";
}
