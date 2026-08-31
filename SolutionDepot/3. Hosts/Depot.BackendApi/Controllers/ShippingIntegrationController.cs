using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>HTTP boundary cho đồng bộ trạng thái container với hãng tàu.</summary>
    [ApiController]
    [Route("api/shipping")]
    public class ShippingIntegrationController : BaseController
    {
        private readonly IShippingIntegrationService _shippingService;

        public ShippingIntegrationController(IShippingIntegrationService shippingService)
        {
            _shippingService = shippingService;
        }

        [HttpPost("sync")]
        public async Task<IActionResult> Sync([FromBody] ShippingSyncRequest request)
        {
            var result = await _shippingService.SyncJobAsync(request);
            return result == null
                ? BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể đồng bộ hãng tàu", Data = "JobId hoặc CarrierCode không hợp lệ" })
                : Ok(new ResponseSingleContentModel<ShippingSyncResult> { StatusCode = 200, Message = "Đồng bộ hãng tàu thành công", Data = result });
        }
    }
}