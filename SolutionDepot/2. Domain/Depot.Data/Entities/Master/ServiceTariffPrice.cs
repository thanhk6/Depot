using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Đơn giá của 1 <see cref="ServiceTariff"/> cho 1 loại container trong DM Loại Container (catalog CONTAINER_TYPE,
/// <c>ContainerTypeCode</c> = <c>MasterCatalogItem.Name</c>, vd 40HC, 40GP, 20RF) — thay 6 cột giá cố định cũ
/// (depot-fullstack-lolo-tariff-pricing). Dòng con thuần tuý của biểu cước (giống StorageTariffTier): chỉ truy cập qua
/// <c>ServiceTariff.Prices</c>. Không có dòng cho 1 loại = chưa có giá cho loại đó.
/// </summary>
public class ServiceTariffPrice : FullAuditedEntity<long>
{
    /// <summary>Khóa ngoại trỏ tới ServiceTariff.Id.</summary>
    public long ServiceTariffId { get; set; }
    /// <summary>Mã loại container (CONTAINER_TYPE.Name), vd "40HC".</summary>
    public string ContainerTypeCode { get; set; } = string.Empty;
    /// <summary>Đơn giá cho loại container này.</summary>
    public decimal Price { get; set; }
}
