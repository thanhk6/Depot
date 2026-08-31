using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Yard;

/// <summary>
/// Vùng chức năng trên sơ đồ bãi 2D (Gate-In, Giám định, Kho bãi, Sửa chữa, Vệ sinh, Hold, Staging...).
/// Thuần dữ liệu layout hiển thị — không lưu occupancy (occupancy tính từ DepotJob/YardBlock thật).
/// </summary>
public class YardZone : FullAuditedEntity<long>
{
    /// <summary>Mã vùng (business key), vd GATE_IN, INSPECTION, STORAGE_BLOCK_A, REPAIR...</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Tên hiển thị của vùng.</summary>
    public string ZoneName { get; set; } = string.Empty;
    /// <summary>Loại vùng: GATE_IN, GATE_OUT, INSPECTION, STORAGE, REPAIR, CLEANING, HOLD, STAGING, FORKLIFT_AREA.</summary>
    public string ZoneType { get; set; } = string.Empty;
    /// <summary>Toạ độ X trên canvas sơ đồ 2D.</summary>
    public int PositionX { get; set; }
    /// <summary>Toạ độ Y trên canvas sơ đồ 2D.</summary>
    public int PositionY { get; set; }
    /// <summary>Chiều rộng khối vẽ.</summary>
    public int Width { get; set; }
    /// <summary>Chiều cao khối vẽ.</summary>
    public int Height { get; set; }
    /// <summary>Mô tả ngắn hiển thị dưới tên vùng.</summary>
    public string? Description { get; set; }
    /// <summary>Thứ tự hiển thị (nếu cần sắp xếp danh sách).</summary>
    public int SortOrder { get; set; }
}
