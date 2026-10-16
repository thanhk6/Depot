using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [RequirePermission(RolePermissions.Payment)]
    [Route("api/depot/jobs/{jobId:long}/payment")]
    public class PaymentsController : BaseController
    {
        private readonly IDepotJobService _service;
        public PaymentsController(IDepotJobService service) => _service = service;

        [HttpPost]
        public async Task<IActionResult> Process(long jobId, [FromBody] ProcessPaymentRequest request)
        {
            try
            {
                // Người thu = tài khoản đang đăng nhập (trước đây luôn ghi "System").
                var cashier = User.GetFullName() ?? User.GetUsername();
                var result = await _service.ProcessPaymentAsync(jobId, request, cashier);
                return result.Success
                    ? Ok(new ResponseSingleContentModel<ProcessPaymentResult> { StatusCode = 200, Message = result.Message, Data = result })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = result.Message, Data = null });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi xử lý thanh toán", Data = ex.Message });
            }
        }
    }
}
