using Depot.Application.Services;
using Depot.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Depot.BackendApi.Controllers;

[ApiController]
[Route("api/cleaning")]
public sealed class CleaningController : ControllerBase
{
    private readonly ICleaningService service;
    public CleaningController(ICleaningService service) => this.service = service;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? status)
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách lệnh vệ sinh thành công", Data = await service.GetAsync(status) });

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var record = await service.GetByIdAsync(id);
        return record is null
            ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy lệnh vệ sinh", Data = id.ToString() })
            : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy lệnh vệ sinh thành công", Data = record });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCleaningRecordRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tiếp nhận container vào bệ rửa thành công", Data = await service.CreateAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu tiếp nhận vệ sinh không hợp lệ" }); }
    }

    [HttpPatch("{id:long}/items/{itemId:long}")]
    public async Task<IActionResult> ToggleItem(long id, long itemId, [FromBody] ToggleCleaningItemRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật hạng mục vệ sinh thành công", Data = await service.ToggleItemAsync(id, itemId, request) }); }
        catch (KeyNotFoundException ex) { return NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = ex.Message, Data = id.ToString() }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể cập nhật hạng mục" }); }
    }

    [HttpPatch("{id:long}/items/complete-all")]
    public async Task<IActionResult> CompleteAllItems(long id, [FromBody] CompleteAllCleaningItemsRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật toàn bộ hạng mục vệ sinh thành công", Data = await service.CompleteAllItemsAsync(id, request) }); }
        catch (KeyNotFoundException ex) { return NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = ex.Message, Data = id.ToString() }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể cập nhật hạng mục" }); }
    }

    [HttpPut("{id:long}/execution")]
    public async Task<IActionResult> UpdateExecution(long id, [FromBody] UpdateCleaningExecutionRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật thông số thi công vệ sinh thành công", Data = await service.UpdateExecutionAsync(id, request) }); }
        catch (KeyNotFoundException ex) { return NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = ex.Message, Data = id.ToString() }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể cập nhật thông số thi công" }); }
    }

    [HttpPost("{id:long}/handover")]
    public async Task<IActionResult> Handover(long id, [FromBody] HandoverCleaningRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Hoàn tất vệ sinh và bàn giao Khai Thác thành công", Data = await service.HandoverAsync(id, request) }); }
        catch (KeyNotFoundException ex) { return NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = ex.Message, Data = id.ToString() }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể bàn giao lệnh vệ sinh" }); }
    }
}
