using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Yard;

/// <summary>Lệnh điều động xe nâng di chuyển 1 container tới vị trí mới trong bãi.</summary>
public class ForkliftDispatch : FullAuditedEntity<long>
{
    /// <summary>Số lệnh điều xe (business key), vd DISP-2026-001.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Mã xe nâng thực hiện (Forklift.Code).</summary>
    public string ForkliftCode { get; set; } = string.Empty;
    /// <summary>Số container cần di chuyển (liên kết logic sang DepotJob.ContainerNo).</summary>
    public string ContainerNo { get; set; } = string.Empty;
    /// <summary>Vị trí xuất phát.</summary>
    public string? FromLocation { get; set; }
    /// <summary>Vị trí đích.</summary>
    public string ToLocation { get; set; } = string.Empty;
    /// <summary>Thời điểm phát lệnh.</summary>
    public DateTime DispatchedAt { get; set; } = DateTime.UtcNow;
    /// <summary>Thời điểm hoàn tất (nếu đã xong).</summary>
    public DateTime? CompletedAt { get; set; }
    /// <summary>Trạng thái: MOVING, COMPLETED, CANCELLED.</summary>
    public string Status { get; set; } = "MOVING";
    /// <summary>Tên tài xế thực hiện.</summary>
    public string? DriverName { get; set; }
    /// <summary>Độ ưu tiên: NORMAL, HIGH, URGENT.</summary>
    public string Priority { get; set; } = "NORMAL";

    /// <summary>Xe nâng điều hướng tới (chỉ đọc, không FK cứng vì Forklift.Code là business key).</summary>
    public virtual Forklift? Forklift { get; set; }
}
