using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Hồ sơ công ty khách hàng, bao gồm trucking, forwarder hoặc shipper.
/// </summary>
public class CustomerCompany : FullAuditedEntity<long>
{
    /// <summary>Mã khách hàng/công ty trong hệ thống.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Tên đầy đủ của công ty.</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Tên rút gọn hoặc tên giao dịch.</summary>
    public string? ShortName { get; set; }
    /// <summary>Mã số thuế.</summary>
    public string? TaxCode { get; set; }
    /// <summary>Số điện thoại liên hệ.</summary>
    public string? Phone { get; set; }
    /// <summary>Địa chỉ email liên hệ.</summary>
    public string? Email { get; set; }
    /// <summary>Địa chỉ trụ sở hoặc văn phòng giao dịch.</summary>
    public string? Address { get; set; }
    /// <summary>Người liên hệ chính của công ty.</summary>
    public string? ContactPerson { get; set; }
    /// <summary>Số điện thoại của người liên hệ chính.</summary>
    public string? ContactPhone { get; set; }
    /// <summary>Email của người liên hệ chính.</summary>
    public string? ContactEmail { get; set; }
    /// <summary>Loại khách hàng, ví dụ trucking, forwarder hoặc shipper.</summary>
    public string CustomerType { get; set; } = "TRUCKING";
    /// <summary>Trạng thái hoạt động của khách hàng.</summary>
    public string Status { get; set; } = "ACTIVE";
    /// <summary>Hạn mức công nợ được cấp.</summary>
    public decimal CreditLimit { get; set; }
    /// <summary>Công nợ hiện tại đang ghi nhận.</summary>
    public decimal CurrentDebt { get; set; }
    /// <summary>Số ngày công nợ được phép thanh toán.</summary>
    public int PaymentTermDays { get; set; }
    /// <summary>Ghi chú bổ sung về khách hàng.</summary>
    public string? Notes { get; set; }
}
