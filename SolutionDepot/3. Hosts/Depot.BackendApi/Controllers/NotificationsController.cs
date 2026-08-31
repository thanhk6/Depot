using Depot.Application.Services;
using Depot.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Depot.BackendApi.Controllers;

[ApiController]
[Route("api/notifications")]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationService service;
    public NotificationsController(INotificationService service) => this.service = service;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? status, [FromQuery] string? recipientId)
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy thông báo thành công", Data = await service.GetAsync(status, recipientId) });

    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendNotificationRequest request)
    {
        try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Gửi thông báo thành công", Data = await service.SendAsync(request) }); }
        catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Dữ liệu thông báo không hợp lệ" }); }
    }

    [HttpGet("dashboard-kpi")]
    public async Task<IActionResult> GetDashboardKpi()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy KPI thông báo thành công", Data = await service.GetDashboardKpiAsync() });

    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách nhân viên thành công", Data = await service.GetEmployeesAsync() });

    [HttpPut("employees/{username}/subscription")]
    public async Task<IActionResult> UpdateEmployeeSubscription(string username, [FromBody] UpdateEmployeeSubscriptionRequest request)
    {
        var updated = await service.UpdateEmployeeSubscriptionAsync(username, request);
        return updated == null
            ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy nhân viên", Data = username })
            : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật đăng ký nhận thông báo thành công", Data = updated });
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách khách hàng thành công", Data = await service.GetCustomersAsync() });

    [HttpPut("customers/{customerCode}/preferences")]
    public async Task<IActionResult> UpdateCustomerPreference(string customerCode, [FromBody] UpdateCustomerPreferenceRequest request)
    {
        var updated = await service.UpdateCustomerPreferenceAsync(customerCode, request);
        return updated == null
            ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy khách hàng", Data = customerCode })
            : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật tuỳ chọn thông báo thành công", Data = updated });
    }

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách mẫu tin thành công", Data = await service.GetTemplatesAsync() });

    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate([FromBody] NotificationTemplateRequest request)
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tạo mẫu tin thành công", Data = await service.CreateTemplateAsync(request) });

    [HttpPut("templates/{code}")]
    public async Task<IActionResult> UpdateTemplate(string code, [FromBody] NotificationTemplateRequest request)
    {
        var updated = await service.UpdateTemplateAsync(code, request);
        return updated == null
            ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy mẫu tin", Data = code })
            : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật mẫu tin thành công", Data = updated });
    }

    [HttpDelete("templates/{code}")]
    public async Task<IActionResult> DeleteTemplate(string code)
    {
        var deleted = await service.DeleteTemplateAsync(code);
        return deleted
            ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Xoá mẫu tin thành công", Data = code })
            : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy mẫu tin", Data = code });
    }

    [HttpGet("queue")]
    public async Task<IActionResult> GetQueue()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy hàng đợi gửi thành công", Data = await service.GetQueueAsync() });

    [HttpPost("{id:long}/resend")]
    public async Task<IActionResult> Resend(long id)
    {
        var updated = await service.ResendAsync(id);
        return updated == null
            ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy thông báo", Data = id.ToString() })
            : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Gửi lại thông báo thành công", Data = updated });
    }

    [HttpPost("{id:long}/retry")]
    public async Task<IActionResult> Retry(long id)
    {
        var updated = await service.RetryAsync(id);
        return updated == null
            ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy thông báo", Data = id.ToString() })
            : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Thử lại thành công", Data = updated });
    }

    [HttpPost("{id:long}/cancel")]
    public async Task<IActionResult> Cancel(long id)
    {
        var cancelled = await service.CancelQueueItemAsync(id);
        return cancelled
            ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Huỷ thông báo thành công", Data = id.ToString() })
            : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy thông báo", Data = id.ToString() });
    }

    [HttpPost("queue/process-all")]
    public async Task<IActionResult> ProcessAllQueue()
        => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Xử lý hàng đợi thành công", Data = new { processedCount = await service.ProcessAllQueueAsync() } });
}
