using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Depot.BackendApi.Controllers;

[ApiController]
[RequirePermission(RolePermissions.Inventory)]
[Route("api/warehouse")]
public sealed class WarehouseController : ControllerBase
{
    private readonly IWarehouseService service;
    public WarehouseController(IWarehouseService service) => this.service = service;

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] string? materialCode)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy giao dịch kho thành công", Data = await service.GetTransactionsAsync(materialCode) }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy giao dịch kho", Data = ex.Message }); }
    }

    [HttpPost("transactions")]
    public async Task<IActionResult> Record([FromBody] MaterialStockTransactionRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Ghi nhận giao dịch kho thành công", Data = await service.RecordTransactionAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Giao dịch kho không hợp lệ" }); }
    }

    [HttpGet("material-groups")]
    public async Task<IActionResult> GetMaterialGroups()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh mục nhóm vật tư thành công", Data = await service.GetMaterialGroupsAsync() }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh mục nhóm vật tư", Data = ex.Message }); }
    }

    [HttpGet("suppliers")]
    public async Task<IActionResult> GetSuppliers()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh mục nhà cung cấp thành công", Data = await service.GetSuppliersAsync() }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh mục nhà cung cấp", Data = ex.Message }); }
    }

    [HttpGet("stock-balances")]
    public async Task<IActionResult> GetStockBalances()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy tồn kho thành công", Data = await service.GetStockBalancesAsync() }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy tồn kho", Data = ex.Message }); }
    }

    [HttpGet("receipts")]
    public async Task<IActionResult> GetReceipts()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy phiếu nhập kho thành công", Data = await service.GetDocumentsAsync("RECEIPT", "RECEIPT") }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy phiếu nhập kho", Data = ex.Message }); }
    }

    [HttpGet("issues")]
    public async Task<IActionResult> GetIssues()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy phiếu xuất kho thành công", Data = await service.GetDocumentsAsync("ISSUE", "WORK_ORDER") }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy phiếu xuất kho", Data = ex.Message }); }
    }
}
