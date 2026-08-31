using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Yard;

/// <summary>
/// Cấu hình khối bãi (Block) hiển thị trên sơ đồ 2D — kích thước lưới Bay/Row/Tier và toạ độ vẽ.
/// <see cref="Code"/> khớp đúng giá trị <c>DepotJob.BlockCode</c>/<c>YardPosition.BlockCode</c> thật
/// (vd "BLOCK_A") để occupancy tính trực tiếp từ dữ liệu container thật, không lưu trùng lặp ở đây.
/// </summary>
public class YardBlockLayout : FullAuditedEntity<long>
{
    /// <summary>Mã block (business key), khớp DepotJob.BlockCode (vd "BLOCK_A").</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Mã vùng cha (YardZone.Code) chứa block này.</summary>
    public string? ZoneCode { get; set; }
    /// <summary>Tên hiển thị của block.</summary>
    public string BlockName { get; set; } = string.Empty;
    /// <summary>Số lượng Bay trong block.</summary>
    public int BayCount { get; set; }
    /// <summary>Số lượng Row trong mỗi Bay.</summary>
    public int RowCount { get; set; }
    /// <summary>Số Tier tối đa xếp chồng.</summary>
    public int MaxTier { get; set; }
    /// <summary>Toạ độ X trên canvas sơ đồ 2D.</summary>
    public int PositionX { get; set; }
    /// <summary>Toạ độ Y trên canvas sơ đồ 2D.</summary>
    public int PositionY { get; set; }
    /// <summary>Chiều rộng khối vẽ.</summary>
    public int Width { get; set; }
    /// <summary>Chiều cao khối vẽ.</summary>
    public int Height { get; set; }
    /// <summary>Trạng thái hoạt động của block: ACTIVE, MAINTENANCE, CLOSED.</summary>
    public string Status { get; set; } = "ACTIVE";
    /// <summary>Mô tả ngắn.</summary>
    public string? Description { get; set; }
}
