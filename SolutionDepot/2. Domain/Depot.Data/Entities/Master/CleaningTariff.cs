using System.Collections.Generic;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Biểu phí vệ sinh container (vệ sinh tổng quát, hoá chất, chuẩn thực phẩm, khử mùi, hun trùng...) — bảng riêng thay
/// catalog dùng chung CLEANING_TARIFF (MasterCatalogItems.JsonData), giống ServiceTariffs (depot-fullstack-cleaning-tariff-pricing).
/// Đơn giá theo từng loại container nằm ở <see cref="Prices"/>.
/// </summary>
public class CleaningTariff : FullAuditedEntity<long>
{
    /// <summary>Mã biểu phí, business key duy nhất (vd CLN_GENERAL). Không đổi sau khi tạo.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Tên tiếng Việt.</summary>
    public string NameVi { get; set; } = string.Empty;
    /// <summary>Tên tiếng Anh.</summary>
    public string? NameEn { get; set; }
    /// <summary>Nhóm dịch vụ vệ sinh (GENERAL_SWEEP, CHEMICAL_WASH, FOOD_GRADE...).</summary>
    public string Category { get; set; } = "GENERAL_SWEEP";
    /// <summary>Mã CEDEX (vd CW, FG).</summary>
    public string? CedexCode { get; set; }
    /// <summary>Mô tả.</summary>
    public string? Description { get; set; }
    /// <summary>Thuế VAT (%).</summary>
    public decimal VatPercent { get; set; } = 8;
    /// <summary>Đơn vị tiền tệ (chỉ VND).</summary>
    public string Currency { get; set; } = "VND";
    /// <summary>Bên chịu phí mặc định (O / U / T / C) — giữ nguyên cách dùng hiện tại.</summary>
    public string ResponsiblePartyDefault { get; set; } = "U";
    /// <summary>Thời gian thực hiện dự kiến (phút).</summary>
    public int EstimatedDurationMin { get; set; }
    /// <summary>Lượng nước tiêu thụ (lít).</summary>
    public int WaterUsageLiters { get; set; }
    /// <summary>Hoá chất sử dụng.</summary>
    public string? ChemicalRequired { get; set; }
    /// <summary>Thiết bị sử dụng.</summary>
    public string? EquipmentUsed { get; set; }
    /// <summary>Đang dùng (false = tạm ngưng).</summary>
    public bool IsActive { get; set; } = true;
    /// <summary>Thứ tự hiển thị.</summary>
    public int SortOrder { get; set; }
    /// <summary>Đơn giá theo từng loại container trong DM Loại Container.</summary>
    public virtual ICollection<CleaningTariffPrice> Prices { get; set; } = new List<CleaningTariffPrice>();
}
