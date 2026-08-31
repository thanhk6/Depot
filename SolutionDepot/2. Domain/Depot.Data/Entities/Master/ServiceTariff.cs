using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Biểu cước nâng hạ (Lift-On / Lift-Off) vỏ container rỗng — tách riêng khỏi bảng danh mục dùng
/// chung <see cref="MasterCatalogItem"/> (CatalogType = "SERVICE_TARIFF") vì nghiệp vụ giá theo từng
/// kích cỡ container khác hẳn các danh mục đơn giản khác (Damage Code, Grade...), cần cột số thật để
/// tính toán/lọc/báo cáo thay vì nhét vào 1 cột JsonData tự do.
/// </summary>
public class ServiceTariff : FullAuditedEntity<long>
{
    /// <summary>Mã biểu cước, business key duy nhất (vd LOLO_MT_NORMAL).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Phân loại dịch vụ vỏ rỗng: LIFT_EMPTY (nâng hạ), SHIFTING (đảo chuyển bãi), NIGHT_SURCHARGE (phụ phí ca đêm).</summary>
    public string ServiceCategory { get; set; } = "LIFT_EMPTY";
    /// <summary>Tên dịch vụ tiếng Việt.</summary>
    public string NameVi { get; set; } = string.Empty;
    /// <summary>Tên dịch vụ tiếng Anh.</summary>
    public string? NameEn { get; set; }
    /// <summary>Đơn vị tính (vd "Lần / Cont").</summary>
    public string Unit { get; set; } = "Lần / Cont";
    /// <summary>Đơn giá container 20' GP/DC.</summary>
    public decimal Price20GP { get; set; }
    /// <summary>Đơn giá container 40' GP/HC.</summary>
    public decimal Price40HC { get; set; }
    /// <summary>Đơn giá container 45' HC.</summary>
    public decimal Price45HC { get; set; }
    /// <summary>Đơn giá container 20' Reefer (lạnh).</summary>
    public decimal Price20RF { get; set; }
    /// <summary>Đơn giá container 40' Reefer (lạnh).</summary>
    public decimal Price40RH { get; set; }
    /// <summary>Đơn giá thiết bị đặc chủng (OOG/Tank/Flat Rack).</summary>
    public decimal PriceSpecial { get; set; }
    /// <summary>Thuế VAT áp dụng (%).</summary>
    public decimal VatPercent { get; set; } = 8;
    /// <summary>Đơn vị tiền tệ.</summary>
    public string Currency { get; set; } = "VND";
    /// <summary>Ca áp dụng: ALL, DAY_ONLY, NIGHT_SURCHARGE.</summary>
    public string ApplicableShift { get; set; } = "ALL";
    /// <summary>Mô tả bổ sung.</summary>
    public string? Description { get; set; }
    /// <summary>Trạng thái hoạt động (vô hiệu hóa thay vì xoá cứng).</summary>
    public bool IsActive { get; set; } = true;
    /// <summary>Thứ tự hiển thị.</summary>
    public int SortOrder { get; set; }
}
