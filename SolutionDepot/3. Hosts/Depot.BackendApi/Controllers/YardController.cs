using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>API đọc sơ đồ bãi và cập nhật occupancy của từng ô.</summary>
    [ApiController]
    [Route("api/[controller]")]
    public class YardController : BaseController
    {
        private readonly IYardService _yardService;
        private readonly IYardOverviewService _overviewService;

        public YardController(IYardService yardService, IYardOverviewService overviewService)
        {
            _yardService = yardService;
            _overviewService = overviewService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPositions([FromQuery] string? blockCode)
        {
            try
            {
                var positions = await _yardService.GetYardPositionsAsync(blockCode);
                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = "Lấy sơ đồ vị trí bãi thành công",
                    Data = positions
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy sơ đồ vị trí bãi", Data = ex.Message });
            }
        }

        [RequirePermission(RolePermissions.Yard, RolePermissions.Forklift)]
        [HttpPost("occupancy")]
        public async Task<IActionResult> UpdateOccupancy([FromBody] YardSlotViewModel request)
        {
            if (request.Bay <= 0 || request.Row <= 0 || request.Tier <= 0)
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Vị trí bãi không hợp lệ", Data = "Bay, Row, Tier phải lớn hơn 0" });

            try
            {
                await _yardService.UpdateYardPositionOccupancyAsync(request.BlockCode, request.Bay, request.Row, request.Tier, request.IsOccupied, request.OccupiedContainerNo);
                return Ok(new ResponseSingleContentModel<YardSlotViewModel> { StatusCode = 200, Message = "Cập nhật vị trí bãi thành công", Data = request });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể cập nhật vị trí bãi" });
            }
        }

        /// <summary>Tổng hợp Zone/Block/Container/Location/Forklift/Dispatch/GateLane cho Sơ Đồ Bãi 2D (mục #9-10).</summary>
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy tổng quan sơ đồ bãi thành công", Data = await _overviewService.GetOverviewAsync() }); }
            catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy tổng quan sơ đồ bãi", Data = ex.Message }); }
        }

        [HttpGet("containers/search")]
        public async Task<IActionResult> SearchContainers([FromQuery] string? containerNo)
        {
            try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Tìm container thành công", Data = await _overviewService.SearchContainersAsync(containerNo) }); }
            catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi tìm container", Data = ex.Message }); }
        }

        [HttpGet("containers/{id}")]
        public async Task<IActionResult> GetContainerById(string id)
        {
            try
            {
                var container = await _overviewService.GetContainerByIdAsync(id);
                return container == null
                    ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy container", Data = id })
                    : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy container thành công", Data = container });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy container", Data = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetMoveHistory([FromQuery] string? containerId)
        {
            try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy lịch sử di chuyển thành công", Data = await _overviewService.GetMoveHistoryAsync(containerId) }); }
            catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy lịch sử di chuyển", Data = ex.Message }); }
        }

        [RequirePermission(RolePermissions.Yard, RolePermissions.Forklift)]
        [HttpPost("container/move")]
        public async Task<IActionResult> MoveContainer([FromBody] MoveYardContainerRequest request)
        {
            try
            {
                var result = await _overviewService.MoveContainerAsync(request);
                return result.IsSuccessed
                    ? Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = result.Message ?? "Di chuyển thành công", Data = result.ResultObj })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = result.Message ?? "Không thể di chuyển container", Data = request.ContainerId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi di chuyển container", Data = ex.Message });
            }
        }

        [RequirePermission(RolePermissions.Permissions)]
        [HttpPut("blocks/{blockCode}")]
        public async Task<IActionResult> UpdateBlockLayout(string blockCode, [FromBody] UpdateYardBlockLayoutRequest request)
        {
            try
            {
                var block = await _overviewService.UpdateBlockLayoutAsync(blockCode, request);
                return block == null
                    ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy Block", Data = blockCode })
                    : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Cập nhật cấu hình Block thành công", Data = block });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể cập nhật cấu hình Block" });
            }
        }

        [RequirePermission(RolePermissions.Yard, RolePermissions.Operation, RolePermissions.Forklift)]
        [HttpPost("forklift/dispatch")]
        public async Task<IActionResult> DispatchForklift([FromBody] DispatchForkliftRequest request)
        {
            try
            {
                var result = await _overviewService.DispatchForkliftAsync(request);
                return result.IsSuccessed
                    ? Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = result.Message ?? "Phát lệnh điều xe nâng thành công", Data = result.ResultObj })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = result.Message ?? "Không thể phát lệnh điều xe nâng", Data = request.ContainerId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi phát lệnh điều xe nâng", Data = ex.Message });
            }
        }
    }
}