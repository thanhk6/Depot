using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>Nhật ký thanh toán riêng (PaymentLogs) — chỉ đọc.</summary>
    [ApiController]
    [RequirePermission(RolePermissions.Payment, RolePermissions.Billing)]
    [Route("api/payment-logs")]
    public class PaymentLogsController : BaseController
    {
        private readonly IDepotJobService _service;
        public PaymentLogsController(IDepotJobService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] PaymentLogFilter filter)
        {
            var data = await _service.GetPaymentLogsAsync(filter);
            return Ok(new ResponseSingleContentModel<List<PaymentLogItem>> { StatusCode = 200, Message = "OK", Data = data });
        }
    }
}
