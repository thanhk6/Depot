using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Depot.BackendApi.Controllers;

[ApiController]
[RequirePermission(RolePermissions.Notifications)]
[Route("api/notifications")]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationService service;
    public NotificationsController(INotificationService service) => this.service = service;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? status, [FromQuery] string? recipientId)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy thông báo thành công", Data = await service.GetAsync(status, recipientId) }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy thông báo", Data = ex.Message }); }
    }

    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendNotificationRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Gửi thông báo thành công", Data = await service.SendAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu thông báo không hợp lệ" }); }
    }

    [HttpGet("dashboard-kpi")]
    public async Task<IActionResult> GetDashboardKpi()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy KPI thông báo thành công", Data = await service.GetDashboardKpiAsync() }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy KPI thông báo", Data = ex.Message }); }
    }

    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách nhân viên thành công", Data = await service.GetEmployeesAsync() }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh sách nhân viên", Data = ex.Message }); }
    }

    [HttpPut("employees/{username}/subscription")]
    public async Task<IActionResult> UpdateEmployeeSubscription(string username, [FromBody] UpdateEmployeeSubscriptionRequest request)
    {
        try
        {
            var updated = await service.UpdateEmployeeSubscriptionAsync(username, request);
            return updated == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy nhân viên", Data = username })
                : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật đăng ký nhận thông báo thành công", Data = updated });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể cập nhật đăng ký nhận thông báo" }); }
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách khách hàng thành công", Data = await service.GetCustomersAsync() }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh sách khách hàng", Data = ex.Message }); }
    }

    [HttpPut("customers/{customerCode}/preferences")]
    public async Task<IActionResult> UpdateCustomerPreference(string customerCode, [FromBody] UpdateCustomerPreferenceRequest request)
    {
        try
        {
            var updated = await service.UpdateCustomerPreferenceAsync(customerCode, request);
            return updated == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy khách hàng", Data = customerCode })
                : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật tuỳ chọn thông báo thành công", Data = updated });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể cập nhật tuỳ chọn thông báo" }); }
    }

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách mẫu tin thành công", Data = await service.GetTemplatesAsync() }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh sách mẫu tin", Data = ex.Message }); }
    }

    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate([FromBody] NotificationTemplateRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tạo mẫu tin thành công", Data = await service.CreateTemplateAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể tạo mẫu tin" }); }
    }

    [HttpPut("templates/{code}")]
    public async Task<IActionResult> UpdateTemplate(string code, [FromBody] NotificationTemplateRequest request)
    {
        try
        {
            var updated = await service.UpdateTemplateAsync(code, request);
            return updated == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy mẫu tin", Data = code })
                : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật mẫu tin thành công", Data = updated });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể cập nhật mẫu tin" }); }
    }

    [HttpDelete("templates/{code}")]
    public async Task<IActionResult> DeleteTemplate(string code)
    {
        try
        {
            var deleted = await service.DeleteTemplateAsync(code);
            return deleted
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Xoá mẫu tin thành công", Data = code })
                : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy mẫu tin", Data = code });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể xoá mẫu tin" }); }
    }

    [HttpGet("queue")]
    public async Task<IActionResult> GetQueue()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy hàng đợi gửi thành công", Data = await service.GetQueueAsync() }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy hàng đợi gửi", Data = ex.Message }); }
    }

    [HttpPost("{id:long}/resend")]
    public async Task<IActionResult> Resend(long id)
    {
        try
        {
            var updated = await service.ResendAsync(id);
            return updated == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy thông báo", Data = id.ToString() })
                : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Gửi lại thông báo thành công", Data = updated });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể gửi lại thông báo" }); }
    }

    [HttpPost("{id:long}/retry")]
    public async Task<IActionResult> Retry(long id)
    {
        try
        {
            var updated = await service.RetryAsync(id);
            return updated == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy thông báo", Data = id.ToString() })
                : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Thử lại thành công", Data = updated });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể thử lại" }); }
    }

    [HttpPost("{id:long}/cancel")]
    public async Task<IActionResult> Cancel(long id)
    {
        try
        {
            var cancelled = await service.CancelQueueItemAsync(id);
            return cancelled
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Huỷ thông báo thành công", Data = id.ToString() })
                : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy thông báo", Data = id.ToString() });
        }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể huỷ thông báo" }); }
    }

    [HttpPost("queue/process-all")]
    public async Task<IActionResult> ProcessAllQueue()
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Xử lý hàng đợi thành công", Data = new { processedCount = await service.ProcessAllQueueAsync() } }); }
        catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi xử lý hàng đợi", Data = ex.Message }); }
    }
}
