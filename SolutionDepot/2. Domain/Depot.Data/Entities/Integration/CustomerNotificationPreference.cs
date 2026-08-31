using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Integration;

/// <summary>Tuỳ chọn nhận thông báo của 1 khách hàng (liên kết logic sang CustomerCompany.Code).</summary>
public class CustomerNotificationPreference : FullAuditedEntity<long>
{
    /// <summary>Mã bản ghi (business key).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Mã khách hàng (liên kết logic sang CustomerCompany.Code).</summary>
    public string CustomerCode { get; set; } = string.Empty;
    public bool GateIn { get; set; } = true;
    public bool Inspection { get; set; } = true;
    public bool Estimate { get; set; } = true;
    public bool Repair { get; set; } = true;
    public bool Qc { get; set; } = true;
    public bool GateOut { get; set; } = true;
    public bool Invoice { get; set; } = true;
    public bool Payment { get; set; } = true;
    public bool DebtReminder { get; set; } = true;
    /// <summary>Kênh nhận ưu tiên.</summary>
    public string PreferredChannel { get; set; } = "ZALO_ZNS";
    /// <summary>Tự động gửi ZNS hay không.</summary>
    public bool AutoZnsEnabled { get; set; } = true;
    /// <summary>Đã liên kết Zalo hay chưa (demo — chưa có tích hợp Zalo OA thật).</summary>
    public bool ZaloConnected { get; set; }
    /// <summary>Tên hiển thị Zalo (demo).</summary>
    public string? ZaloName { get; set; }
}
