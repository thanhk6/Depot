using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Inventory;

/// <summary>
/// Giao dịch nhập/xuất/tăng giảm tồn kho vật tư.
/// </summary>
public class MaterialStockTransaction : FullAuditedEntity<long>
{
    /// <summary>Mã vật tư liên quan đến giao dịch.</summary>
    public string MaterialCode { get; set; } = string.Empty;
    /// <summary>Loại giao dịch tồn kho, ví dụ nhập, xuất, điều chỉnh.</summary>
    public string TransactionType { get; set; } = string.Empty;
    /// <summary>Số lượng thay đổi.</summary>
    public decimal Quantity { get; set; }
    /// <summary>Đơn giá tại thời điểm giao dịch.</summary>
    public decimal UnitCost { get; set; }
    /// <summary>Tổng chi phí của giao dịch.</summary>
    public decimal TotalCost { get; set; }
    /// <summary>Số lượng trước giao dịch.</summary>
    public decimal BeforeQuantity { get; set; }
    /// <summary>Số lượng sau giao dịch.</summary>
    public decimal AfterQuantity { get; set; }
    /// <summary>Loại đối tượng tham chiếu, ví dụ WorkOrder hoặc Container.</summary>
    public string ReferenceType { get; set; } = string.Empty;
    /// <summary>Mã định danh đối tượng tham chiếu.</summary>
    public string ReferenceId { get; set; } = string.Empty;
    /// <summary>Số lệnh sửa chữa nếu giao dịch gắn với work order.</summary>
    public string? WorkOrderNo { get; set; }
    /// <summary>Số container liên quan nếu có.</summary>
    public string? ContainerNo { get; set; }
    /// <summary>Mã nhà cung cấp nếu giao dịch là nhập kho (liên kết logic sang Supplier.Code).</summary>
    public string? SupplierCode { get; set; }
    /// <summary>Người thực hiện giao dịch.</summary>
    public string PerformedBy { get; set; } = "System";
    /// <summary>Thời điểm thực hiện giao dịch.</summary>
    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    /// <summary>Ghi chú bổ sung.</summary>
    public string? Note { get; set; }
}
