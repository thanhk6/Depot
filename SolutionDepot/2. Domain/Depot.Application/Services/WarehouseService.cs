using Depot.Data.EF;
using Depot.Data.Entities.Inventory;
using Depot.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace Depot.Application.Services;

public interface IWarehouseService
{
    Task<List<MaterialStockTransaction>> GetTransactionsAsync(string? materialCode = null);
    Task<MaterialStockTransaction> RecordTransactionAsync(MaterialStockTransactionRequest request);
    Task<List<MaterialGroup>> GetMaterialGroupsAsync();
    Task<List<Supplier>> GetSuppliersAsync();
    Task<List<StockBalanceDto>> GetStockBalancesAsync();
    Task<List<MaterialDocumentDto>> GetDocumentsAsync(string transactionType, string referenceType);
}

public sealed class WarehouseService : IWarehouseService
{
    private readonly DepotDbContext db;
    public WarehouseService(DepotDbContext db) => this.db = db;

    public async Task<List<MaterialStockTransaction>> GetTransactionsAsync(string? materialCode = null)
    {
        var query = db.MaterialStockTransactions.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(materialCode)) query = query.Where(x => x.MaterialCode == materialCode);
        return await query.OrderByDescending(x => x.PerformedAt).ToListAsync();
    }

    public async Task<MaterialStockTransaction> RecordTransactionAsync(MaterialStockTransactionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MaterialCode) || request.Quantity <= 0 || string.IsNullOrWhiteSpace(request.ReferenceId)) throw new ArgumentException("MaterialCode, Quantity và ReferenceId là bắt buộc.");
        // BUG-019: trước đây ghi được giao dịch cho mã vật tư không tồn tại và loại giao dịch tuỳ ý (loại lạ bị
        // tính như xuất kho), để lại dòng mồ côi trong thẻ kho/báo cáo.
        if (request.TransactionType is not ("RECEIPT" or "ISSUE" or "RETURN" or "ADJUSTMENT_IN" or "ADJUSTMENT_OUT"))
            throw new ArgumentException($"Loại giao dịch '{request.TransactionType}' không hợp lệ (RECEIPT, ISSUE, RETURN, ADJUSTMENT_IN, ADJUSTMENT_OUT).");
        if (request.UnitCost < 0) throw new ArgumentException("Đơn giá vật tư không được âm.");
        var materialCode = request.MaterialCode.Trim().ToUpperInvariant();
        var material = await db.Materials.FirstOrDefaultAsync(x => !x.IsDeleted && x.Code.ToUpper() == materialCode)
            ?? throw new ArgumentException($"Mã vật tư '{request.MaterialCode.Trim()}' không có trong danh mục vật tư.");
        // Tồn trước giao dịch đọc theo mã đã chuẩn hoá — trước đây so mã thô client gửi với mã đã UPPER trong DB.
        var before = await db.MaterialStockTransactions.Where(x => x.MaterialCode == materialCode).OrderByDescending(x => x.PerformedAt).Select(x => (decimal?)x.AfterQuantity).FirstOrDefaultAsync() ?? 0;
        var increases = request.TransactionType is "RECEIPT" or "RETURN" or "ADJUSTMENT_IN";
        var after = increases ? before + request.Quantity : before - request.Quantity;
        if (after < 0) throw new InvalidOperationException("Tồn kho không đủ để xuất vật tư.");
        var transaction = new MaterialStockTransaction { MaterialCode = materialCode, TransactionType = request.TransactionType, Quantity = request.Quantity, UnitCost = request.UnitCost, TotalCost = request.Quantity * request.UnitCost, BeforeQuantity = before, AfterQuantity = after, ReferenceType = request.ReferenceType, ReferenceId = request.ReferenceId, WorkOrderNo = request.WorkOrderNo, ContainerNo = request.ContainerNo, SupplierCode = request.SupplierCode, PerformedBy = request.PerformedBy, PerformedAt = DateTime.UtcNow, Note = request.Note };
        db.MaterialStockTransactions.Add(transaction);

        material.StockQuantity = (int)after;
        if (request.TransactionType == "RECEIPT" && request.UnitCost > 0)
        {
            material.LastPurchaseCost = request.UnitCost;
            // Bình quân gia quyền đơn giản: (tồn cũ*giá cũ + nhập mới*giá mới) / tồn mới.
            var beforeValue = before * material.AverageCost;
            var incomingValue = request.Quantity * request.UnitCost;
            material.AverageCost = after > 0 ? (beforeValue + incomingValue) / after : request.UnitCost;
        }

        await db.SaveChangesAsync();
        return transaction;
    }

    public async Task<List<MaterialGroup>> GetMaterialGroupsAsync()
        => await db.MaterialGroups.AsNoTracking().OrderBy(x => x.SortOrder).ToListAsync();

    public async Task<List<Supplier>> GetSuppliersAsync()
        => await db.Suppliers.AsNoTracking().OrderBy(x => x.Name).ToListAsync();

    public async Task<List<StockBalanceDto>> GetStockBalancesAsync()
    {
        var materials = await db.Materials.AsNoTracking().ToListAsync();
        var latestByMaterial = await db.MaterialStockTransactions.AsNoTracking()
            .GroupBy(x => x.MaterialCode)
            .Select(g => g.OrderByDescending(x => x.PerformedAt).First())
            .ToListAsync();
        var latestMap = latestByMaterial.ToDictionary(x => x.MaterialCode, x => x);
        var damagedByMaterial = await db.MaterialStockTransactions.AsNoTracking()
            .Where(x => x.TransactionType == "DAMAGE")
            .GroupBy(x => x.MaterialCode)
            .Select(g => new { MaterialCode = g.Key, Total = g.Sum(x => x.Quantity) })
            .ToDictionaryAsync(x => x.MaterialCode, x => x.Total);

        return materials.Select(m =>
        {
            var latest = latestMap.TryGetValue(m.Code, out var t) ? t : null;
            var quantity = latest?.AfterQuantity ?? m.StockQuantity;
            var damaged = damagedByMaterial.TryGetValue(m.Code, out var d) ? d : 0;
            var available = Math.Max(0, quantity - damaged);
            var status = quantity <= 0 ? "OUT_OF_STOCK" : quantity <= m.ReorderLevel ? "LOW_STOCK" : "IN_STOCK";

            return new StockBalanceDto
            {
                MaterialId = m.Id,
                MaterialCode = m.Code,
                MaterialName = m.Name,
                MaterialGroup = m.MaterialGroupCode,
                Unit = m.Unit,
                Quantity = quantity,
                ReservedQuantity = 0,
                DamagedQuantity = damaged,
                AvailableQuantity = available,
                AverageCost = m.AverageCost,
                TotalValue = quantity * m.AverageCost,
                ReorderLevel = m.ReorderLevel,
                MinimumStock = m.MinimumStock,
                MaximumStock = m.MaximumStock,
                StockStatus = status,
                LastUpdatedAt = (latest?.PerformedAt ?? m.LastModifiedAt ?? m.CreatedAt).ToString("yyyy-MM-dd HH:mm")
            };
        }).ToList();
    }

    /// <summary>
    /// Dựng "chứng từ" (phiếu nhập/xuất/trả/điều chỉnh) bằng cách gom nhóm các dòng
    /// MaterialStockTransaction có cùng ReferenceId — không cần bảng header riêng vì
    /// MaterialStockTransaction đã đủ field (ReferenceId dùng chung cho mọi dòng của 1 chứng từ,
    /// do WarehousePage.tsx đã tạo referenceId dùng chung khi gửi nhiều dòng cùng 1 phiếu).
    /// </summary>
    public async Task<List<MaterialDocumentDto>> GetDocumentsAsync(string transactionType, string referenceType)
    {
        var materials = await db.Materials.AsNoTracking().ToDictionaryAsync(x => x.Code, x => x);
        var rows = await db.MaterialStockTransactions.AsNoTracking()
            .Where(x => x.TransactionType == transactionType && x.ReferenceType == referenceType)
            .OrderByDescending(x => x.PerformedAt)
            .ToListAsync();

        return rows
            .GroupBy(x => x.ReferenceId)
            .Select(g =>
            {
                var first = g.OrderBy(x => x.PerformedAt).First();
                return new MaterialDocumentDto
                {
                    DocumentNo = g.Key,
                    DocumentDate = first.PerformedAt.ToString("yyyy-MM-dd HH:mm"),
                    SupplierCode = first.SupplierCode,
                    WorkOrderNo = first.WorkOrderNo,
                    ContainerNo = first.ContainerNo,
                    PerformedBy = first.PerformedBy,
                    Note = first.Note,
                    TotalAmount = g.Sum(x => x.TotalCost),
                    TotalQuantity = g.Sum(x => x.Quantity),
                    Status = "COMPLETED",
                    Details = g.Select(x => new MaterialDocumentLineDto
                    {
                        MaterialCode = x.MaterialCode,
                        MaterialName = materials.TryGetValue(x.MaterialCode, out var mat) ? mat.Name : x.MaterialCode,
                        Unit = materials.TryGetValue(x.MaterialCode, out var mat2) ? mat2.Unit : string.Empty,
                        Quantity = x.Quantity,
                        UnitCost = x.UnitCost,
                        TotalCost = x.TotalCost,
                        Note = x.Note
                    }).ToList()
                };
            })
            .OrderByDescending(x => x.DocumentDate)
            .ToList();
    }
}
