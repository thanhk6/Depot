using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [Route("api/depot/jobs/{jobId:long}/payment")]
    public class PaymentsController : BaseController
    {
        private readonly IDepotJobService _service;
        public PaymentsController(IDepotJobService service) => _service = service;

        [HttpPost]
        public async Task<IActionResult> Process(long jobId, [FromBody] ProcessPaymentRequest request)
        {
            var success = await _service.ProcessPaymentAsync(jobId, request);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Thanh toán thành công", Data = "PAID" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể xử lý thanh toán", Data = "Job không tồn tại hoặc số tiền không hợp lệ" });
        }
    }
}
