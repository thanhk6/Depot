using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Đơn giá/ngày của 1 <see cref="StorageTariffTier"/> cho 1 loại container (ContainerTypeCode = CONTAINER_TYPE.Name, vd 40HC).
/// Dòng con thuần tuý của bậc giá (giống ServiceTariffPrice). Không có dòng = chưa có giá cho loại đó.
/// </summary>
public class StorageTariffTierPrice : FullAuditedEntity<long>
{
    /// <summary>Khóa ngoại trỏ tới StorageTariffTier.Id.</summary>
    public long StorageTariffTierId { get; set; }
    /// <summary>Mã loại container (CONTAINER_TYPE.Name).</summary>
    public string ContainerTypeCode { get; set; } = string.Empty;
    /// <summary>Đơn giá/ngày cho loại container này.</summary>
    public decimal Price { get; set; }
}
