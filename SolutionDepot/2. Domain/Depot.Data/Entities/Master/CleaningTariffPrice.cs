using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Đơn giá của 1 <see cref="CleaningTariff"/> cho 1 loại container (ContainerTypeCode = CONTAINER_TYPE.Name, vd 40HC).
/// Dòng con thuần tuý của biểu phí (giống ServiceTariffPrice). Không có dòng = chưa có giá cho loại đó.
/// </summary>
public class CleaningTariffPrice : FullAuditedEntity<long>
{
    /// <summary>Khóa ngoại trỏ tới CleaningTariff.Id.</summary>
    public long CleaningTariffId { get; set; }
    /// <summary>Mã loại container (CONTAINER_TYPE.Name).</summary>
    public string ContainerTypeCode { get; set; } = string.Empty;
    /// <summary>Đơn giá cho loại container này.</summary>
    public decimal Price { get; set; }
}
