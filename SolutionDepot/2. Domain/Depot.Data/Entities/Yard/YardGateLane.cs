using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Yard;

/// <summary>Làn cổng vào/ra hiển thị trên sơ đồ bãi 2D — cấu hình thiết bị và trạng thái hiện tại.</summary>
public class YardGateLane : FullAuditedEntity<long>
{
    /// <summary>Mã làn (business key), vd LANE-IN-01.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Số thứ tự làn trong nhóm Vào/Ra.</summary>
    public int LaneNo { get; set; }
    /// <summary>Loại cổng: IN, OUT.</summary>
    public string GateType { get; set; } = "IN";
    /// <summary>Tên hiển thị của làn.</summary>
    public string LaneName { get; set; } = string.Empty;
    /// <summary>Có trang bị camera OCR đọc số container hay không.</summary>
    public bool HasOcr { get; set; }
    /// <summary>Có đầu đọc RFID hay không.</summary>
    public bool HasRfid { get; set; }
    /// <summary>Có cân điện tử (weighbridge) hay không.</summary>
    public bool HasWeighbridge { get; set; }
    /// <summary>Trạng thái làn: OPEN, BUSY, CLOSED.</summary>
    public string Status { get; set; } = "OPEN";
    /// <summary>Biển số xe đang xử lý tại làn (nếu BUSY).</summary>
    public string? CurrentTruckPlate { get; set; }
    /// <summary>Container đang xử lý tại làn (nếu BUSY).</summary>
    public string? CurrentContainerNo { get; set; }
}
