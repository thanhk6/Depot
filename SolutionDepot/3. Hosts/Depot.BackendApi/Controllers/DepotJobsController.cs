using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>
    /// HTTP boundary của workflow Depot. Controller giữ mỏng; luật chuyển trạng thái nằm trong IDepotJobService.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DepotJobsController : BaseController
    {
        private readonly IDepotJobService _depotService;

        public DepotJobsController(IDepotJobService depotService)
        {
            _depotService = depotService;
        }

        /// <summary>Danh sách Job có filter tìm kiếm, hãng tàu và trạng thái.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAllJobs([FromQuery] string? searchKeyword, [FromQuery] string? shippingLine, [FromQuery] string? status)
        {
            try
            {
                var filter = new DepotJobFilterRequest
                {
                    SearchKeyword = searchKeyword,
                    ShippingLine = shippingLine,
                    Status = status
                };
                var jobs = await _depotService.GetAllJobsAsync(filter);
                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = "Lấy danh sách hồ sơ công việc Depot thành công",
                    Data = jobs
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi khi lấy danh sách công việc",
                    Data = ex.Message
                });
            }
        }

        /// <summary>Tra cứu theo Id số hoặc số container.</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetJobById(string id)
        {
            try
            {
                Depot.Data.Entities.Depot.DepotJob? job = null;
                if (long.TryParse(id, out var longId))
                {
                    job = await _depotService.GetJobByIdAsync(longId);
                }
                else
                {
                    job = await _depotService.GetJobByContainerNoAsync(id);
                }

                if (job == null)
                {
                    return NotFound(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 404,
                        Message = "Không tìm thấy hồ sơ container",
                        Data = $"Không tồn tại hồ sơ với mã hoặc số cont: {id}"
                    });
                }

                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = "Lấy thông tin chi tiết công việc thành công",
                    Data = job
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi hệ thống khi tìm kiếm công việc",
                    Data = ex.Message
                });
            }
        }

        [HttpGet("{id:long}/history")]
        public async Task<IActionResult> GetHistory(long id)
        {
            return Ok(new ResponseSingleContentModel<List<DepotJobHistoryDto>>
            {
                StatusCode = 200, Message = "Lấy lịch sử container thành công",
                Data = await _depotService.GetHistoryAsync(id)
            });
        }

        [HttpPost("{id:long}/forklift-move")]
        public async Task<IActionResult> CompleteForkliftMove(long id, [FromBody] ForkliftMoveRequest request)
        {
            var success = await _depotService.CompleteForkliftMoveAsync(id, request);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã xác nhận hạ bãi", Data = "IN_YARD" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể xác nhận hạ bãi", Data = "Job hoặc vị trí bãi không hợp lệ" });
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteJob(long id, [FromQuery] string deletedBy = "System")
        {
            var success = await _depotService.DeleteJobAsync(id, deletedBy);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã xóa mềm hồ sơ container", Data = "DELETED" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể xóa hồ sơ", Data = "Chỉ được xóa hồ sơ đã Gate-Out hoặc Job không tồn tại" });
        }

        [HttpPatch("{id:long}/status")]
        public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateJobStatusRequest request)
        {
            var success = await _depotService.UpdateJobStatusAsync(id, request);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Cập nhật trạng thái container thành công", Data = request.Status })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể cập nhật trạng thái", Data = "Trạng thái hoặc Job không hợp lệ" });
        }

        /// <summary>Tiếp nhận xe/container vào depot và sinh EIR nhập.</summary>
        [HttpPost("gate-in")]
        public async Task<IActionResult> CreateGateIn([FromBody] CreateDepotJobRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var modelErrors = string.Join("; ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? "Dữ liệu đầu vào không hợp lệ" : e.ErrorMessage));

                    return BadRequest(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 400,
                        Message = "Dữ liệu Gate-In không hợp lệ",
                        Data = string.IsNullOrWhiteSpace(modelErrors) ? "Vui lòng kiểm tra lại dữ liệu nhập vào." : modelErrors
                    });
                }

                var created = await _depotService.CreateGateInJobAsync(request);
                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = $"Tiếp nhận Gate-In thành công Container {created.ContainerNo}",
                    Data = created
                });
            }
            catch (Exception ex)
            {
                if (ex is ArgumentException)
                {
                    return BadRequest(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 400,
                        Message = "Dữ liệu Gate-In không hợp lệ",
                        Data = ex.Message
                    });
                }

                if (ex is InvalidOperationException)
                {
                    return Conflict(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 409,
                        Message = "Container đang có hồ sơ hoạt động",
                        Data = ex.Message
                    });
                }

                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Có lỗi xảy ra khi Gate-In container",
                    Data = ex.Message
                });
            }
        }


        /// <summary>Giám định viên nhận (khóa) container để bắt đầu giám định, chặn người khác nhận trùng.</summary>
        [HttpPost("{id:long}/survey/claim")]
        public async Task<IActionResult> ClaimSurvey(long id, [FromBody] ClaimSurveyRequest request)
        {
            try
            {
                var job = await _depotService.ClaimSurveyAsync(id, request.StaffId);
                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = $"Đã nhận giám định container {job.ContainerNo}",
                    Data = new
                    {
                        job.SurveyClaimedByStaffId,
                        job.SurveyClaimedByName,
                        job.SurveyClaimedAt
                    }
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string>
                {
                    StatusCode = 400,
                    Message = "Không thể nhận giám định",
                    Data = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new ResponseSingleContentModel<string>
                {
                    StatusCode = 409,
                    Message = "Container đang được giám định bởi người khác",
                    Data = ex.Message
                });
            }
        }

        /// <summary>Giám định viên tự bỏ nhận (mở khóa) container đã nhận trước đó nhưng chưa nộp phiếu.</summary>
        [HttpPost("{id:long}/survey/release")]
        public async Task<IActionResult> ReleaseSurveyClaim(long id, [FromQuery] long staffId)
        {
            var success = await _depotService.ReleaseSurveyClaimAsync(id, staffId);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã bỏ nhận giám định", Data = "RELEASED" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể bỏ nhận giám định", Data = "Bạn không phải người đang giữ khóa hồ sơ này hoặc hồ sơ không tồn tại" });
        }

        /// <summary>Lưu biên bản Survey và danh sách damage.</summary>
        [HttpPost("{id}/survey")]
        public async Task<IActionResult> SubmitSurvey(long id, [FromBody] SurveyRecordViewModel surveyVm)
        {
            try
            {
                var success = await _depotService.SubmitSurveyAsync(id, surveyVm);
                if (!success)
                {
                    return BadRequest(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 400,
                        Message = "Không thể ghi nhận khảo sát",
                        Data = "Mã công việc không tồn tại hoặc đã bị hủy"
                    });
                }

                return Ok(new ResponseSingleContentModel<string>
                {
                    StatusCode = 200,
                    Message = "Lưu thông tin giám định hư hỏng thành công",
                    Data = "Chuyển trạng thái sang ESTIMATING (Chờ báo giá)"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string>
                {
                    StatusCode = 400,
                    Message = "Dữ liệu giám định không hợp lệ",
                    Data = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi xử lý giám định container",
                    Data = ex.Message
                });
            }
        }



        /// <summary>Tạo hoặc cập nhật báo giá sửa chữa.</summary>
        [HttpPost("{id}/estimate")]
        public async Task<IActionResult> CreateEstimate(long id, [FromBody] EstimateViewModel estimateVm)
        {
            try
            {
                var success = await _depotService.CreateOrUpdateEstimateAsync(id, estimateVm);
                if (!success)
                {
                    return BadRequest(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 400,
                        Message = "Không thể tạo báo giá",
                        Data = "Hồ sơ công việc không hợp lệ"
                    });
                }

                return Ok(new ResponseSingleContentModel<string>
                {
                    StatusCode = 200,
                    Message = "Lập báo giá sửa chữa container thành công",
                    Data = "Gửi báo giá cho Hãng tàu chờ phê duyệt"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi khi lập báo giá",
                    Data = ex.Message
                });
            }
        }

        /// <summary>Hãng tàu duyệt báo giá.</summary>
        [HttpPost("{id}/approve-estimate")]
        public async Task<IActionResult> ApproveEstimate(long id, [FromQuery] string approverName = "Hãng Tàu Phê Duyệt")
        {
            try
            {
                var success = await _depotService.ApproveEstimateAsync(id, approverName);
                if (!success)
                {
                    return BadRequest(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 400,
                        Message = "Phê duyệt thất bại",
                        Data = "Hồ sơ chưa có báo giá hoặc bị lỗi"
                    });
                }

                return Ok(new ResponseSingleContentModel<string>
                {
                    StatusCode = 200,
                    Message = "Hãng tàu đã chấp thuận báo giá sửa chữa thành công",
                    Data = "Chuyển trạng thái sang REPAIRING"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi khi phê duyệt báo giá",
                    Data = ex.Message
                });
            }
        }

        /// <summary>Hãng tàu từ chối báo giá và bắt buộc ghi lý do.</summary>
        [HttpPost("{id}/reject-estimate")]
        public async Task<IActionResult> RejectEstimate(long id, [FromBody] RejectEstimateRequest request)
        {
            var success = await _depotService.RejectEstimateAsync(id, request);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã từ chối báo giá", Data = "ESTIMATING" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể từ chối báo giá", Data = "Báo giá không ở trạng thái chờ duyệt hoặc thiếu lý do" });
        }

        /// <summary>Ghi kết quả nghiệm thu QC.</summary>
        [HttpPost("{id}/qc-complete")]
        public async Task<IActionResult> CompleteQc([FromBody] QcInspectionRequest qcReq)
        {
            try
            {
                var success = await _depotService.CompleteQcInspectionAsync(qcReq);
                if (!success)
                {
                    return BadRequest(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 400,
                        Message = "Cập nhật QC thất bại",
                        Data = "Không tìm thấy hồ sơ sửa chữa"
                    });
                }

                return Ok(new ResponseSingleContentModel<string>
                {
                    StatusCode = 200,
                    Message = qcReq.Passed ? "Kiểm định QC ĐẠT chuẩn" : "Kiểm định QC KHÔNG ĐẠT",
                    Data = qcReq.Passed ? "Chuyển sang READY_FOR_OUT (Chờ Gate-Out)" : "Yêu cầu sửa bổ sung"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi khi lưu kết quả QC",
                    Data = ex.Message
                });
            }
        }

        /// <summary>Phân công Work Order cho đội sửa chữa.</summary>
        [HttpPost("{id}/repair/assign")]
        public async Task<IActionResult> AssignRepair(long id, [FromBody] RepairAssignRequest request)
        {
            var success = await _depotService.AssignRepairAsync(id, request);
            return success ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã phân công lệnh sửa chữa", Data = "REPAIRING" }) : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể phân công sửa chữa", Data = "Kiểm tra trạng thái estimate và đội sửa chữa" });
        }

        /// <summary>Bắt đầu thời gian thi công Work Order.</summary>
        [HttpPost("{id}/repair/start")]
        public async Task<IActionResult> StartRepair(long id, [FromBody] StartRepairRequest request)
        {
            var success = await _depotService.StartRepairAsync(id, request.TechnicianId, request.TechnicianName);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã bắt đầu Work Order", Data = "REPAIRING" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể bắt đầu Work Order", Data = "Estimate chưa được duyệt hoặc hồ sơ không hợp lệ" });
        }

        /// <summary>Hoàn tất thi công và chuyển hồ sơ sang QC.</summary>
        [HttpPost("{id}/repair/complete")]
        public async Task<IActionResult> CompleteRepair(long id, [FromBody] RepairCompleteRequest request)
        {
            var success = await _depotService.CompleteRepairAsync(id, request);
            return success ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Hoàn tất sửa chữa", Data = "QC_PENDING" }) : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể hoàn tất sửa chữa", Data = "Chưa có lệnh sửa chữa đang thực hiện" });
        }

        /// <summary>Cấp vỏ cho xe, sinh EIR xuất và giải phóng ô bãi.</summary>
        [HttpPost("{id}/gate-out")]
        public async Task<IActionResult> GateOut(long id, [FromBody] GateOutRequest request)
        {
            var success = await _depotService.GateOutAsync(id, request);
            return success ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Cấp vỏ và Gate-Out thành công", Data = "GATE_OUT" }) : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể Gate-Out", Data = "Container chưa READY_FOR_OUT hoặc thiếu thông tin xe" });
        }

        /// <summary>Điều độ xe nâng đổi tọa độ Block/Bay/Row/Tier.</summary>
        [HttpPost("forklift-move")]
        public async Task<IActionResult> MoveYard([FromBody] ForkliftMoveOrderRequest moveReq)
        {
            try
            {
                var success = await _depotService.DispatchForkliftMoveAsync(moveReq);
                if (!success)
                {
                    return BadRequest(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 400,
                        Message = "Không thể đảo chuyển bãi",
                        Data = "Vị trí bãi hoặc công việc không hợp lệ"
                    });
                }

                return Ok(new ResponseSingleContentModel<string>
                {
                    StatusCode = 200,
                    Message = "Đã phát lệnh cho xe nâng di chuyển Container thành công",
                    Data = $"Vị trí mới: Block {moveReq.TargetBlock} Bay {moveReq.TargetBay}-Row {moveReq.TargetRow}-Tier {moveReq.TargetTier}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi khi điều độ xe nâng",
                    Data = ex.Message
                });
            }
        }

        /// <summary>Trả KPI tổng quan phục vụ Dashboard.</summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var stats = await _depotService.GetDashboardStatsAsync();
                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = "Lấy dữ liệu thống kê tổng quan Depot thành công",
                    Data = stats
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi khi tính toán thống kê",
                    Data = ex.Message
                });
            }
        }
    }
}
