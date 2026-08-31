using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [Route("api/service-orders")]
    public class ServiceOrdersController : BaseController
    {
        private readonly IDepotJobService _service;
        public ServiceOrdersController(IDepotJobService service) => _service = service;

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateServiceOrderRequest request)
        {
            var result = await _service.CreateServiceOrderAsync(request);
            return result == null
                ? BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể tạo phiếu dịch vụ", Data = "Job/Container không hợp lệ hoặc thiếu hạng mục" })
                : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tạo phiếu dịch vụ thành công", Data = result });
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? jobNo)
        {
            return Ok(new ResponseSingleContentModel<object>
            {
                StatusCode = 200, Message = "Lấy phiếu dịch vụ thành công",
                Data = await _service.GetServiceOrdersAsync(jobNo)
            });
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateServiceOrderRequest request)
        {
            var result = await _service.UpdateServiceOrderAsync(id, request);
            return result == null
                ? BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể sửa phiếu dịch vụ", Data = "Phiếu không tồn tại, đã thanh toán/huỷ, hoặc thiếu hạng mục hợp lệ" })
                : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Sửa phiếu dịch vụ thành công", Data = result });
        }

        [HttpPost("{id:long}/cancel")]
        public async Task<IActionResult> Cancel(long id)
        {
            var success = await _service.CancelServiceOrderAsync(id);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Huỷ phiếu dịch vụ thành công", Data = "CANCELLED" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể huỷ phiếu dịch vụ", Data = "Phiếu không tồn tại hoặc đã thanh toán/huỷ trước đó" });
        }
    }
}