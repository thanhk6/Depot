using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// 1 bậc giá lũy tiến của <see cref="StorageTariffRule"/> (vd "Bậc 1: ngày 1-5 miễn phí", "Bậc 2: ngày
/// 6-15 giá X"). Dòng con thuần tuý của quy tắc cha — không có business key riêng, chỉ truy cập qua
/// <c>StorageTariffRule.Tiers</c> (không cần DbSet riêng, giống DamageItem/EstimateItem — xem
/// docs/backend-progress/00b-quy-tac-tao-bang.md mục 8). FK tới cha dùng <c>Id</c> số (không dùng
/// <c>Code</c>) vì đây là quan hệ composition nội bộ 1 aggregate, không phải tham chiếu chéo giữa 2
/// business entity như quy tắc FK-by-Code ở mục 8b.
/// </summary>
public class StorageTariffTier : FullAuditedEntity<long>
{
    /// <summary>Khóa ngoại trỏ tới StorageTariffRule.Id.</summary>
    public long StorageTariffRuleId { get; set; }
    /// <summary>Thực thể quy tắc cha.</summary>
    public virtual StorageTariffRule? StorageTariffRule { get; set; }
    /// <summary>Tên hiển thị bậc giá (vd "Bậc 1 (Free Time)").</summary>
    public string TierName { get; set; } = string.Empty;
    /// <summary>Ngày bắt đầu áp dụng bậc này (tính từ ngày Gate-In).</summary>
    public int FromDay { get; set; }
    /// <summary>Ngày kết thúc bậc này — null nghĩa là "từ ngày FromDay trở đi", không giới hạn.</summary>
    public int? ToDay { get; set; }
    /// <summary>Đơn giá/ngày container 20' hàng khô.</summary>
    public decimal Price20Dry { get; set; }
    /// <summary>Đơn giá/ngày container 40'/45' hàng khô.</summary>
    public decimal Price40Dry { get; set; }
    /// <summary>Đơn giá/ngày container 45' HC hàng khô.</summary>
    public decimal Price45Dry { get; set; }
    /// <summary>Đơn giá/ngày container 20' Reefer (lạnh).</summary>
    public decimal Price20Reefer { get; set; }
    /// <summary>Đơn giá/ngày container 40' Reefer (lạnh).</summary>
    public decimal Price40Reefer { get; set; }
    /// <summary>Đơn giá/ngày thiết bị đặc chủng (OOG/Tank/Flat Rack).</summary>
    public decimal PriceSpecial { get; set; }
    /// <summary>Thứ tự hiển thị bậc giá trong quy tắc cha.</summary>
    public int SortOrder { get; set; }
}
