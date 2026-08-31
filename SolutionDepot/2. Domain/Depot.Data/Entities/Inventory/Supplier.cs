using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Inventory;

/// <summary>Nhà cung cấp vật tư sửa chữa EMR.</summary>
public class Supplier : FullAuditedEntity<long>
{
    /// <summary>Mã nhà cung cấp (business key).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Tên nhà cung cấp.</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Mã số thuế.</summary>
    public string? TaxCode { get; set; }
    /// <summary>Số điện thoại.</summary>
    public string? Phone { get; set; }
    /// <summary>Email.</summary>
    public string? Email { get; set; }
    /// <summary>Địa chỉ.</summary>
    public string? Address { get; set; }
    /// <summary>Người liên hệ.</summary>
    public string? ContactPerson { get; set; }
    /// <summary>Đánh giá chất lượng nhà cung cấp (1-5).</summary>
    public int Rating { get; set; } = 5;
    /// <summary>Còn hợp tác hay đã ngừng.</summary>
    public bool IsActive { get; set; } = true;
    /// <summary>Ghi chú.</summary>
    public string? Notes { get; set; }
}
