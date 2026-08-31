using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Phương tiện vận tải của khách hàng, thường là đầu kéo hoặc xe phục vụ depot.
/// </summary>
public class CustomerVehicle : FullAuditedEntity<long>
{
    /// <summary>Mã khách hàng sở hữu phương tiện.</summary>
    public string CustomerCode { get; set; } = string.Empty;
    /// <summary>Biển số xe đầu kéo hoặc phương tiện.</summary>
    public string PlateNumber { get; set; } = string.Empty;
    /// <summary>Loại phương tiện, ví dụ tractor.</summary>
    public string VehicleType { get; set; } = "TRACTOR";
    /// <summary>Hãng xe hoặc thương hiệu phương tiện.</summary>
    public string? Brand { get; set; }
    /// <summary>Tải trọng cho phép tính theo tấn.</summary>
    public decimal PayloadTon { get; set; }
    /// <summary>Tên chủ sở hữu phương tiện.</summary>
    public string? OwnerName { get; set; }
    /// <summary>Mã tài xế mặc định gắn với phương tiện.</summary>
    public string? DefaultDriverCode { get; set; }
    /// <summary>Ngày hết hạn kiểm định phương tiện.</summary>
    public DateTime? InspectionExpiry { get; set; }
    /// <summary>Trạng thái hoạt động của phương tiện.</summary>
    public string Status { get; set; } = "ACTIVE";
}
