using System.Collections.Generic;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Quy tắc cước lưu bãi lũy tiến theo hãng tàu / loại container — tách riêng khỏi bảng danh mục dùng
/// chung <see cref="MasterCatalogItem"/> (CatalogType = "STORAGE_TARIFF") vì có cấu trúc lồng (nhiều
/// bậc giá theo khoảng ngày, xem <see cref="StorageTariffTier"/>), không phù hợp nhét vào 1 cột JsonData
/// tự do. Xem docs/frontend-tariff-catalog-split.md.
/// </summary>
public class StorageTariffRule : FullAuditedEntity<long>
{
    /// <summary>Mã quy tắc, business key duy nhất (vd STOR_DRY_STANDARD).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Mã hãng tàu áp dụng — "ALL" nếu áp dụng chung mọi hãng. Không ràng buộc FK vì "ALL"
    /// không phải mã hãng tàu thật trong bảng ShippingLine.</summary>
    public string ShippingLineCode { get; set; } = "ALL";
    /// <summary>Tên hiển thị hãng tàu / nhóm áp dụng.</summary>
    public string ShippingLineName { get; set; } = string.Empty;
    /// <summary>Nhóm loại container áp dụng: DRY_STANDARD, REEFER, IMO_HAZARDOUS, ISO_TANK...</summary>
    public string ContainerTypeCategory { get; set; } = "DRY_STANDARD";
    /// <summary>Số ngày miễn phí lưu bãi mặc định (Free Time).</summary>
    public int DefaultFreeDays { get; set; }
    /// <summary>Đơn vị tính cước (vd "VND/Cont/Day").</summary>
    public string CalculationUnit { get; set; } = "VND/Cont/Day";
    /// <summary>Thuế VAT áp dụng (%).</summary>
    public decimal VatPercent { get; set; } = 8;
    /// <summary>Ghi chú áp dụng.</summary>
    public string? Notes { get; set; }
    /// <summary>Trạng thái hoạt động (vô hiệu hóa thay vì xoá cứng).</summary>
    public bool IsActive { get; set; } = true;
    /// <summary>Thứ tự hiển thị.</summary>
    public int SortOrder { get; set; }
    /// <summary>Danh sách bậc giá lũy tiến theo khoảng ngày — dòng con thuần tuý của quy tắc này.</summary>
    public virtual ICollection<StorageTariffTier> Tiers { get; set; } = new List<StorageTariffTier>();
}
