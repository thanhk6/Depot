using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Yard;

/// <summary>Lịch sử di chuyển vị trí container trong bãi (đảo chuyển giữa các Block/Bay/Row/Tier).</summary>
public class YardMoveHistory : FullAuditedEntity<long>
{
    /// <summary>Mã bản ghi (business key).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Số container di chuyển (liên kết logic sang DepotJob.ContainerNo).</summary>
    public string ContainerNo { get; set; } = string.Empty;
    /// <summary>Vị trí xuất phát.</summary>
    public string FromLocation { get; set; } = string.Empty;
    /// <summary>Vị trí đích.</summary>
    public string ToLocation { get; set; } = string.Empty;
    /// <summary>Thời điểm di chuyển.</summary>
    public DateTime MoveDate { get; set; } = DateTime.UtcNow;
    /// <summary>Mã xe nâng thực hiện (nếu có).</summary>
    public string? ForkliftCode { get; set; }
    /// <summary>Người thực hiện/điều độ.</summary>
    public string? PerformedBy { get; set; }
    /// <summary>Lý do di chuyển.</summary>
    public string? Reason { get; set; }
}
