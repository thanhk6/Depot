using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Yard;

/// <summary>Xe nâng vận hành trong bãi — theo dõi vị trí, trạng thái và tài xế phụ trách.</summary>
public class Forklift : FullAuditedEntity<long>
{
    /// <summary>Mã xe nâng (business key), vd FL-001.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Tên/nhãn hiển thị của xe nâng.</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Trạng thái: AVAILABLE, MOVING, MAINTENANCE, OFFLINE.</summary>
    public string Status { get; set; } = "AVAILABLE";
    /// <summary>Mã vị trí hiện tại (block/bay hoặc khu vực).</summary>
    public string? CurrentLocation { get; set; }
    /// <summary>Toạ độ X hiện tại trên sơ đồ 2D.</summary>
    public int PositionX { get; set; }
    /// <summary>Toạ độ Y hiện tại trên sơ đồ 2D.</summary>
    public int PositionY { get; set; }
    /// <summary>Toạ độ X mục tiêu đang di chuyển tới (nếu đang MOVING).</summary>
    public int? TargetPositionX { get; set; }
    /// <summary>Toạ độ Y mục tiêu đang di chuyển tới (nếu đang MOVING).</summary>
    public int? TargetPositionY { get; set; }
    /// <summary>Tên tài xế phụ trách.</summary>
    public string? DriverName { get; set; }
    /// <summary>Số điện thoại tài xế.</summary>
    public string? DriverPhone { get; set; }
    /// <summary>Phần trăm pin/nhiên liệu còn lại.</summary>
    public int BatteryPercent { get; set; } = 100;
    /// <summary>Tải trọng tối đa (tấn).</summary>
    public decimal MaxCapacityTons { get; set; }
    /// <summary>Mô tả công việc đang thực hiện.</summary>
    public string? CurrentTask { get; set; }
}
