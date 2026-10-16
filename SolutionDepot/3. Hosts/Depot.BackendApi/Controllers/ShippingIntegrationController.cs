using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>HTTP boundary cho gửi dữ liệu container sang API hãng tàu.</summary>
    [ApiController]
    // QC được gửi sự kiện QC_PASSED (báo hãng tàu sửa xong) — trước đây chỉ nhóm Báo giá nên nhân viên QC bị 403.
    [RequirePermission(RolePermissions.Estimate, RolePermissions.Qc)]
    [Route("api/shipping")]
    public class ShippingIntegrationController : BaseController
    {
        private readonly IShippingIntegrationService _shippingService;

        public ShippingIntegrationController(IShippingIntegrationService shippingService)
        {
            _shippingService = shippingService;
        }

        /// <summary>Danh sách hãng tàu kèm trạng thái cấu hình kết nối API (không trả khóa bí mật).</summary>
        [HttpGet("carriers")]
        public async Task<IActionResult> Carriers()
        {
            var data = await _shippingService.GetCarriersAsync();
            return Ok(new ResponseSingleContentModel<List<ShippingCarrierStatus>> { StatusCode = 200, Message = "OK", Data = data });
        }

        /// <summary>Nhật ký các lần gửi thật (mới nhất trước).</summary>
        [HttpGet("logs")]
        public async Task<IActionResult> Logs([FromQuery] string? carrierCode, [FromQuery] long? jobId, [FromQuery] int take = 200)
        {
            var data = await _shippingService.GetLogsAsync(carrierCode, jobId, take);
            return Ok(new ResponseSingleContentModel<List<ShippingSyncLogItem>> { StatusCode = 200, Message = "OK", Data = data });
        }

        [HttpPost("sync")]
        public async Task<IActionResult> Sync([FromBody] ShippingSyncRequest request)
        {
            var triggeredBy = User.GetFullName() ?? User.GetUsername();
            var outcome = await _shippingService.SyncJobAsync(request, triggeredBy);
            switch (outcome.Kind)
            {
                case "ATTEMPTED":
                    var result = outcome.Result!;
                    // Hãng tàu từ chối / không kết nối được → 424 (lỗi ở hệ thống hãng tàu, không phải backend) kèm chi tiết; log đã lưu.
                    return result.Success
                        ? Ok(new ResponseSingleContentModel<ShippingSyncResult> { StatusCode = 200, Message = "Đã gửi tới hãng tàu", Data = result })
                        : StatusCode(424, new ResponseSingleContentModel<ShippingSyncResult> { StatusCode = 424, Message = result.ErrorMessage ?? "Gửi tới hãng tàu thất bại", Data = result });
                case "NOT_CONFIGURED":
                    return StatusCode(409, new ResponseSingleContentModel<string> { StatusCode = 409, Message = outcome.Message ?? "Chưa cấu hình kết nối API hãng tàu", Data = null });
                default:
                    return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = outcome.Message ?? "Dữ liệu không hợp lệ", Data = null });
            }
        }
    }
}
