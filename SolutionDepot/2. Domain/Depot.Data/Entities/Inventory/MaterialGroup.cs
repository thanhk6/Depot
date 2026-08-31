using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Inventory;

/// <summary>Nhóm vật tư sửa chữa EMR (Cửa, Sàn, Vách, Nóc, Khóa, Cao su, Sơn, Hàn, Điện, Tiêu hao...).</summary>
public class MaterialGroup : FullAuditedEntity<long>
{
    /// <summary>Mã nhóm (business key), vd DOOR, FLOOR, PAINT.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Tên nhóm.</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Mô tả.</summary>
    public string? Description { get; set; }
    /// <summary>Thứ tự hiển thị.</summary>
    public int SortOrder { get; set; }
}
