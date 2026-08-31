namespace Depot.ViewModels;

public sealed class MaterialStockTransactionRequest
{
    public string MaterialCode { get; set; } = string.Empty;
    public string TransactionType { get; set; } = "RECEIPT";
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string ReferenceType { get; set; } = "RECEIPT";
    public string ReferenceId { get; set; } = string.Empty;
    public string? WorkOrderNo { get; set; }
    public string? ContainerNo { get; set; }
    public string? SupplierCode { get; set; }
    public string PerformedBy { get; set; } = "Warehouse User";
    public string? Note { get; set; }
}

public sealed class StockBalanceDto
{
    public long MaterialId { get; set; }
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string? MaterialGroup { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal DamagedQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }
    public decimal AverageCost { get; set; }
    public decimal TotalValue { get; set; }
    public int ReorderLevel { get; set; }
    public int MinimumStock { get; set; }
    public int MaximumStock { get; set; }
    public string StockStatus { get; set; } = "IN_STOCK";
    public string LastUpdatedAt { get; set; } = string.Empty;
}

public sealed class MaterialDocumentLineDto
{
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public string? Note { get; set; }
}

public sealed class MaterialDocumentDto
{
    public string DocumentNo { get; set; } = string.Empty;
    public string DocumentDate { get; set; } = string.Empty;
    public string? SupplierCode { get; set; }
    public string? WorkOrderNo { get; set; }
    public string? ContainerNo { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
    public string? Note { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalQuantity { get; set; }
    public string Status { get; set; } = "COMPLETED";
    public List<MaterialDocumentLineDto> Details { get; set; } = new();
}
