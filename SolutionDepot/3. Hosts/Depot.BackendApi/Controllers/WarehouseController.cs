using Depot.Application.Services;
using Depot.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Depot.BackendApi.Controllers;

[ApiController]
[Route("api/warehouse")]
public sealed class WarehouseController : ControllerBase
{
    private readonly IWarehouseService service;
    public WarehouseController(IWarehouseService service) => this.service = service;

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] string? materialCode)
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy giao dịch kho thành công", Data = await service.GetTransactionsAsync(materialCode) });

    [HttpPost("transactions")]
    public async Task<IActionResult> Record([FromBody] MaterialStockTransactionRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Ghi nhận giao dịch kho thành công", Data = await service.RecordTransactionAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Giao dịch kho không hợp lệ" }); }
    }

    [HttpGet("material-groups")]
    public async Task<IActionResult> GetMaterialGroups()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh mục nhóm vật tư thành công", Data = await service.GetMaterialGroupsAsync() });

    [HttpGet("suppliers")]
    public async Task<IActionResult> GetSuppliers()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh mục nhà cung cấp thành công", Data = await service.GetSuppliersAsync() });

    [HttpGet("stock-balances")]
    public async Task<IActionResult> GetStockBalances()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy tồn kho thành công", Data = await service.GetStockBalancesAsync() });

    [HttpGet("receipts")]
    public async Task<IActionResult> GetReceipts()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy phiếu nhập kho thành công", Data = await service.GetDocumentsAsync("RECEIPT", "RECEIPT") });

    [HttpGet("issues")]
    public async Task<IActionResult> GetIssues()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy phiếu xuất kho thành công", Data = await service.GetDocumentsAsync("ISSUE", "WORK_ORDER") });
}
