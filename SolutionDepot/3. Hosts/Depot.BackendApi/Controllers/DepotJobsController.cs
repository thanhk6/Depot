using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
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
        private readonly IDepotFileService _fileService;

        public DepotJobsController(IDepotJobService depotService, IDepotFileService fileService)
        {
            _depotService = depotService;
            _fileService = fileService;
        }

        /// <summary>Danh sách Job có filter tìm kiếm, hãng tàu và trạng thái.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAllJobs([FromQuery] string? searchKeyword, [FromQuery] string? shippingLine, [FromQuery] string? status,
            [FromQuery] int? page, [FromQuery] int? pageSize)
        {
            try
            {
                var filter = new DepotJobFilterRequest
                {
                    SearchKeyword = searchKeyword,
                    ShippingLine = shippingLine,
                    Status = status,
                    Page = page,
                    PageSize = pageSize
                };
                var jobs = await _depotService.GetAllJobsAsync(filter);
                Response.Headers["X-Total-Count"] = filter.TotalCount.ToString();
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
                DepotJobDto? job = null;
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
            var history = await _depotService.GetHistoryAsync(id);
            if (history == null)
                return NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy hồ sơ container", Data = id.ToString() });
            return Ok(new ResponseSingleContentModel<List<DepotJobHistoryDto>>
            {
                StatusCode = 200, Message = "Lấy lịch sử container thành công",
                Data = history
            });
        }

        [RequirePermission(RolePermissions.Forklift)]
        [HttpPost("{id:long}/forklift-move")]
        public async Task<IActionResult> CompleteForkliftMove(long id, [FromBody] ForkliftMoveRequest request)
        {
            try
            {
                var success = await _depotService.CompleteForkliftMoveAsync(id, request);
                return success
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã xác nhận hạ bãi", Data = "OK" })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể xác nhận hạ bãi", Data = "Container đã Gate-Out, Block không tồn tại/vượt giới hạn, hoặc ô đích đã có container khác chiếm giữ" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi xác nhận hạ bãi", Data = ex.Message });
            }
        }

        /// <summary>Tài xế xe nâng nhận (khóa) 1 lệnh di chuyển đang chờ, chặn tài xế khác trên tablet khác nhận trùng.</summary>
        [RequirePermission(RolePermissions.Forklift)]
        [HttpPost("{id:long}/forklift/claim")]
        public async Task<IActionResult> ClaimForkliftJob(long id, [FromBody] ClaimForkliftJobRequest request)
        {
            try
            {
                var job = await _depotService.ClaimForkliftJobAsync(id, request.OperatorId, request.OperatorName, request.VehicleCode);
                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = $"Đã khóa và nhận lệnh xe nâng cho container {job.ContainerNo}",
                    Data = new
                    {
                        job.ForkliftClaimedByOperatorId,
                        job.ForkliftClaimedByOperatorName,
                        job.ForkliftAssignedVehicleCode,
                        job.ForkliftClaimedAt
                    }
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể nhận lệnh xe nâng", Data = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new ResponseSingleContentModel<string> { StatusCode = 409, Message = "Container đã được tài xế khác nhận", Data = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi nhận lệnh xe nâng", Data = ex.Message });
            }
        }

        /// <summary>Tài xế đã nhận lệnh bấm "Bắt đầu thực hiện".</summary>
        [RequirePermission(RolePermissions.Forklift)]
        [HttpPost("{id:long}/forklift/start")]
        public async Task<IActionResult> StartForkliftExecution(long id, [FromQuery] string operatorId)
        {
            try
            {
                var success = await _depotService.StartForkliftExecutionAsync(id, operatorId);
                return success
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã bắt đầu thực hiện di chuyển", Data = "IN_PROGRESS" })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể bắt đầu thực hiện", Data = "Bạn không phải người đang giữ khóa lệnh này hoặc hồ sơ không tồn tại" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi bắt đầu thực hiện", Data = ex.Message });
            }
        }

        /// <summary>Tài xế tự hủy nhận lệnh, trả container về hàng đợi chờ.</summary>
        [RequirePermission(RolePermissions.Forklift)]
        [HttpPost("{id:long}/forklift/cancel-claim")]
        public async Task<IActionResult> CancelForkliftClaim(long id, [FromQuery] string operatorId)
        {
            try
            {
                var success = await _depotService.CancelForkliftClaimAsync(id, operatorId);
                return success
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã hủy nhận lệnh xe nâng", Data = "CANCELLED" })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể hủy nhận lệnh", Data = "Bạn không phải người đang giữ khóa lệnh này hoặc hồ sơ không tồn tại" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi hủy nhận lệnh", Data = ex.Message });
            }
        }

        [RequirePermission(RolePermissions.Permissions)]
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteJob(long id, [FromQuery] string deletedBy = "System")
        {
            var success = await _depotService.DeleteJobAsync(id, deletedBy);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã xóa mềm hồ sơ container", Data = "DELETED" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể xóa hồ sơ", Data = "Chỉ được xóa hồ sơ đã Gate-Out hoặc Job không tồn tại" });
        }

        [RequirePermission(RolePermissions.Permissions)]
        [HttpPatch("{id:long}/status")]
        public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateJobStatusRequest request)
        {
            try
            {
                var success = await _depotService.UpdateJobStatusAsync(id, request, User.GetFullName() ?? User.GetUsername());
                return success
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Cập nhật trạng thái container thành công", Data = request.Status })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể cập nhật trạng thái", Data = "Trạng thái không hợp lệ hoặc hồ sơ không tồn tại" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể cập nhật trạng thái", Data = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi cập nhật trạng thái", Data = ex.Message });
            }
        }

        /// <summary>Tiếp nhận xe/container vào depot và sinh EIR nhập.</summary>
        // Nhóm Giám định cũng được tạo hồ sơ: "Thêm mới giám định" cho container chưa có hồ sơ sẽ Gate-In trước
        // (SurveyModulePage.handleCreateNewSurvey) — chỉ cho Operation thì Giám định viên luôn bị 403 ở bước này.
        [RequirePermission(RolePermissions.Operation, RolePermissions.Survey)]
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
        [RequirePermission(RolePermissions.Survey)]
        [HttpPost("{id:long}/survey/claim")]
        public async Task<IActionResult> ClaimSurvey(long id, [FromBody] ClaimSurveyRequest request)
        {
            try
            {
                // Danh tính giám định viên lấy từ JWT, KHÔNG tin request.StaffId do client gửi — trước đây
                // ai cũng nhận hộ được container dưới danh nghĩa nhân viên khác bằng cách đổi StaffId.
                var staffId = User.GetUserId() ?? throw new ArgumentException("Không xác định được tài khoản từ phiên đăng nhập.");
                var job = await _depotService.ClaimSurveyAsync(id, staffId);
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
        [RequirePermission(RolePermissions.Survey)]
        [HttpPost("{id:long}/survey/release")]
        public async Task<IActionResult> ReleaseSurveyClaim(long id, [FromQuery] long staffId)
        {
            // Tham số query staffId giữ lại để tương thích client cũ nhưng bị bỏ qua — chỉ chính chủ token mới nhả được khoá.
            var success = await _depotService.ReleaseSurveyClaimAsync(id, User.GetUserId() ?? 0);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã bỏ nhận giám định", Data = "RELEASED" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể bỏ nhận giám định", Data = "Bạn không phải người đang giữ khóa hồ sơ này hoặc hồ sơ không tồn tại" });
        }

        /// <summary>Lưu biên bản Survey và danh sách damage.</summary>
        [RequirePermission(RolePermissions.Survey)]
        [HttpPost("{id}/survey")]
        public async Task<IActionResult> SubmitSurvey(long id, [FromBody] SurveyRecordViewModel surveyVm)
        {
            try
            {
                // Giám định viên = chủ token, giống ClaimSurvey — không tin SurveyorStaffId trong body.
                surveyVm.SurveyorStaffId = User.GetUserId();
                var success = await _depotService.SubmitSurveyAsync(id, surveyVm);
                if (!success)
                {
                    return NotFound(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 404,
                        Message = "Không thể ghi nhận khảo sát",
                        Data = "Mã công việc không tồn tại hoặc đã bị hủy"
                    });
                }

                // Báo đúng trạng thái sau khi lưu — trước đây luôn ghi "ESTIMATING" dù hạng A đã chuyển READY_FOR_OUT,
                // hạng B sang CLEANING hoặc lưu nháp vẫn giữ SURVEYING.
                var status = (await _depotService.GetJobByIdAsync(id))?.Status ?? string.Empty;
                return Ok(new ResponseSingleContentModel<string>
                {
                    StatusCode = 200,
                    Message = surveyVm.IsDraft ? "Đã lưu tạm phiếu giám định" : "Lưu thông tin giám định hư hỏng thành công",
                    Data = $"Trạng thái hồ sơ: {status}"
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
        [RequirePermission(RolePermissions.Estimate)]
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
            catch (DepotJobService.EstimateNotAllowedException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = null });
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

        /// <summary>Người báo giá xác nhận báo giá trên hệ thống (khi chưa có API hãng tàu — lưu người + thời điểm).</summary>
        [RequirePermission(RolePermissions.Estimate)]
        [HttpPost("{id}/confirm-estimate")]
        public async Task<IActionResult> ConfirmEstimate(long id)
        {
            try
            {
                var by = User.GetFullName() ?? User.GetUsername() ?? string.Empty;
                await _depotService.ConfirmEstimateAsync(id, by);
                return Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã xác nhận báo giá — chờ hãng tàu duyệt", Data = "CONFIRMED" });
            }
            catch (DepotJobService.EstimateNotAllowedException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = null });
            }
        }

        /// <summary>Hãng tàu duyệt báo giá.</summary>
        [RequirePermission(RolePermissions.Estimate)]
        [HttpPost("{id}/approve-estimate")]
        public async Task<IActionResult> ApproveEstimate(long id, [FromBody] ApproveEstimateRequest? request)
        {
            try
            {
                var by = User.GetFullName() ?? User.GetUsername() ?? string.Empty;
                var success = await _depotService.ApproveEstimateAsync(id, request ?? new ApproveEstimateRequest(), by);
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
            catch (DepotJobService.EstimateNotAllowedException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = null });
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
        [RequirePermission(RolePermissions.Estimate)]
        [HttpPost("{id}/reject-estimate")]
        public async Task<IActionResult> RejectEstimate(long id, [FromBody] RejectEstimateRequest request)
        {
            var success = await _depotService.RejectEstimateAsync(id, request);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã từ chối báo giá", Data = "ESTIMATING" })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể từ chối báo giá", Data = "Báo giá không ở trạng thái chờ duyệt hoặc thiếu lý do" });
        }

        /// <summary>Ghi kết quả nghiệm thu QC.</summary>
        [RequirePermission(RolePermissions.Qc)]
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
        [RequirePermission(RolePermissions.Repair)]
        [HttpPost("{id}/repair/assign")]
        public async Task<IActionResult> AssignRepair(long id, [FromBody] RepairAssignRequest request)
        {
            var success = await _depotService.AssignRepairAsync(id, request);
            return success ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã phân công lệnh sửa chữa", Data = "REPAIRING" }) : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể phân công sửa chữa", Data = "Kiểm tra trạng thái estimate và đội sửa chữa" });
        }

        /// <summary>Bắt đầu thời gian thi công Work Order.</summary>
        [RequirePermission(RolePermissions.Repair)]
        [HttpPost("{id}/repair/start")]
        public async Task<IActionResult> StartRepair(long id, [FromBody] StartRepairRequest request)
        {
            try
            {
                var success = await _depotService.StartRepairAsync(id, request.TechnicianId, request.TechnicianName);
                return success
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã bắt đầu Work Order", Data = "REPAIRING" })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể bắt đầu Work Order", Data = "Estimate chưa được duyệt hoặc hồ sơ không hợp lệ" });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new ResponseSingleContentModel<string> { StatusCode = 409, Message = "Không thể bắt đầu Work Order", Data = ex.Message });
            }
        }

        /// <summary>Hoàn tất thi công và chuyển hồ sơ sang QC.</summary>
        [RequirePermission(RolePermissions.Repair)]
        [HttpPost("{id}/repair/complete")]
        public async Task<IActionResult> CompleteRepair(long id, [FromBody] RepairCompleteRequest request)
        {
            var success = await _depotService.CompleteRepairAsync(id, request);
            return success ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Hoàn tất sửa chữa", Data = "QC_PENDING" }) : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể hoàn tất sửa chữa", Data = "Chưa có lệnh sửa chữa đang thực hiện" });
        }

        /// <summary>
        /// Upload 1 ảnh sau sửa cho hạng mục <paramref name="itemNo"/> — lưu vật lý ở Depot.FileServer, metadata
        /// ở DepotFiles (TableName="RepairOrder", IdTable=RepairOrder.Id). Số hạng mục ghi vào đầu tên file
        /// ("ITEM-{n}__tên gốc") vì DepotFiles không có cột phân nhóm con. Chỉ nhận khi job đang REPAIRING.
        /// </summary>
        [RequirePermission(RolePermissions.Repair, RolePermissions.Qc)]
        [HttpPost("{id}/repair/photos")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<IActionResult> UploadRepairPhoto(long id, IFormFile file, [FromForm] int itemNo)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Thiếu file ảnh", Data = "file rỗng" });
            if (itemNo <= 0)
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Thiếu số hạng mục sửa chữa", Data = "itemNo" });

            var repairOrderId = await _depotService.GetRepairOrderIdAsync(id, requireRepairing: true);
            if (repairOrderId == null)
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể lưu ảnh sau sửa", Data = "Container chưa ở trạng thái đang sửa chữa (REPAIRING) — bấm Bắt đầu Work Order trước." });

            try
            {
                await using var stream = file.OpenReadStream();
                var fileName = $"ITEM-{itemNo}__{System.IO.Path.GetFileName(file.FileName)}";
                var result = await _fileService.UploadAsync(stream, fileName, repairOrderId.Value, DepotJobService.RepairAfterPhotoTable, 1);
                return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Đã lưu ảnh sau sửa", Data = result });
            }
            catch (Exception ex) when (ex is ArgumentException or InvalidOperationException or System.Net.Http.HttpRequestException)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể lưu ảnh sau sửa", Data = ex is System.Net.Http.HttpRequestException ? "Không kết nối được Depot.FileServer." : ex.Message });
            }
        }

        /// <summary>Danh sách ảnh sau sửa đã lưu của lệnh sửa chữa (mọi trạng thái — QC cũng cần xem).</summary>
        [HttpGet("{id}/repair/photos")]
        public async Task<IActionResult> GetRepairPhotos(long id)
        {
            var repairOrderId = await _depotService.GetRepairOrderIdAsync(id, requireRepairing: false);
            var files = repairOrderId == null
                ? new System.Collections.Generic.List<DepotFileDto>()
                : await _fileService.GetFilesAsync(DepotJobService.RepairAfterPhotoTable, repairOrderId.Value);
            return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy ảnh sau sửa thành công", Data = files });
        }

        /// <summary>Cấp vỏ cho xe, sinh EIR xuất và giải phóng ô bãi.</summary>
        [RequirePermission(RolePermissions.Operation)]
        [HttpPost("{id}/gate-out")]
        public async Task<IActionResult> GateOut(long id, [FromBody] GateOutRequest request)
        {
            try
            {
                var success = await _depotService.GateOutAsync(id, request);
                return success
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Cấp vỏ và Gate-Out thành công", Data = "GATE_OUT" })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể Gate-Out", Data = "Container chưa READY_FOR_OUT, còn phiếu dịch vụ chưa thanh toán, hoặc thiếu thông tin xe" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi Gate-Out", Data = ex.Message });
            }
        }

        /// <summary>Điều độ xe nâng đổi tọa độ Block/Bay/Row/Tier.</summary>
        [RequirePermission(RolePermissions.Forklift, RolePermissions.Yard)]
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
