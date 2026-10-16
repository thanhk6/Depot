using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [RequirePermission(RolePermissions.Operation, RolePermissions.Payment)]
    [Route("api/service-orders")]
    public class ServiceOrdersController : BaseController
    {
        private readonly IDepotJobService _service;
        public ServiceOrdersController(IDepotJobService service) => _service = service;

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateServiceOrderRequest request)
        {
            try
            {
                var result = await _service.CreateServiceOrderAsync(request);
                return result == null
                    ? BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể tạo phiếu dịch vụ", Data = "Job/Container không hợp lệ hoặc thiếu hạng mục" })
                    : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tạo phiếu dịch vụ thành công", Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = null });
            }
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? jobNo)
        {
            try
            {
                return Ok(new ResponseSingleContentModel<object>
                {
                    StatusCode = 200, Message = "Lấy phiếu dịch vụ thành công",
                    Data = await _service.GetServiceOrdersAsync(jobNo)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy phiếu dịch vụ", Data = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateServiceOrderRequest request)
        {
            try
            {
                var result = await _service.UpdateServiceOrderAsync(id, request);
                return result == null
                    ? BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể sửa phiếu dịch vụ", Data = "Phiếu không tồn tại, đã thanh toán/huỷ, hoặc thiếu hạng mục hợp lệ" })
                    : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Sửa phiếu dịch vụ thành công", Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể sửa phiếu dịch vụ" });
            }
        }

        [HttpPost("{id:long}/cancel")]
        public async Task<IActionResult> Cancel(long id)
        {
            try
            {
                var success = await _service.CancelServiceOrderAsync(id);
                return success
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Huỷ phiếu dịch vụ thành công", Data = "CANCELLED" })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể huỷ phiếu dịch vụ", Data = "Phiếu không tồn tại hoặc đã thanh toán/huỷ trước đó" });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể huỷ phiếu dịch vụ" });
            }
        }
    }
}
