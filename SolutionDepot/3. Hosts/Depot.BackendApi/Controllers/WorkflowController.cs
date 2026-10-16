using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [Route("api/workflow")]
    public class WorkflowController : BaseController
    {
        private readonly IDepotJobService _jobService;

        public WorkflowController(IDepotJobService jobService)
        {
            _jobService = jobService;
        }

        [HttpGet("definition")]
        public IActionResult GetDefinition()
        {
            var steps = new List<WorkflowStepDto>
            {
                new() { Id = "GATE_IN", Number = "01", Title = "GATE-IN (Tiếp Nhận Container)", ModuleTarget = "gate", Summary = "Tiếp nhận xe, container, tài xế và hãng tàu.", Details = new() { "Kiểm tra số container và mã hãng tàu.", "Sinh EIR nhập và audit log.", "Chuyển hồ sơ sang Survey Queue." }, NextSteps = new() { "SURVEY" } },
                new() { Id = "SURVEY", Number = "02", Title = "SURVEY – GIÁM ĐỊNH TÌNH TRẠNG VỎ", ModuleTarget = "survey", Summary = "Ghi nhận tình trạng, damage và repair code.", Details = new() { "Kiểm tra checklist.", "Ghi nhận damage location/code.", "Lưu kết quả vào SQL Server." }, NextSteps = new() { "GRADING" } },
                new() { Id = "GRADING", Number = "03", Title = "GRADING – PHÂN LOẠI VỎ", ModuleTarget = "survey", Summary = "Phân loại AV, CL hoặc DM.", Details = new() { "AV: sẵn sàng cấp.", "CL: chuyển Cleaning.", "DM: chuyển Estimate/Repair." }, NextSteps = new() { "CLEANING", "ESTIMATE", "YARD_AV" } },
                new() { Id = "PAYMENT", Number = "04", Title = "INSTANT PAYMENT – THANH TOÁN", ModuleTarget = "payment", Summary = "Ghi nhận thanh toán và cập nhật trạng thái Job.", Details = new() { "Thanh toán VietQR/CASH.", "Lưu Payment theo JobNo.", "Chuyển trạng thái PAID." }, NextSteps = new() { "FORKLIFT_DISPATCH" } },
                new() { Id = "FORKLIFT_DISPATCH", Number = "05", Title = "FORKLIFT DISPATCH – ĐIỀU PHỐI XE NÂNG", ModuleTarget = "forklift", Summary = "Điều phối vị trí và lệnh di chuyển.", Details = new() { "Kiểm tra ô bãi.", "Ghi audit movement.", "Cập nhật vị trí SQL Server." }, NextSteps = new() { "YARD_MANAGEMENT" } },
                new() { Id = "CLEANING", Number = "06", Title = "CLEANING – VỆ SINH VỎ", ModuleTarget = "cleaning", Summary = "Xử lý container cần vệ sinh.", Details = new() { "Xác định cleaning reason.", "Tính phí theo tariff.", "Bàn giao lại workflow." }, NextSteps = new() { "YARD_AV", "GATE_OUT" } },
                new() { Id = "ESTIMATE", Number = "07", Title = "ESTIMATE – LẬP BÁO GIÁ MNR", ModuleTarget = "estimate", Summary = "Lập chi phí nhân công và vật tư.", Details = new() { "Tạo Estimate items.", "Tính tax/tổng tiền.", "Gửi hãng tàu duyệt." }, NextSteps = new() { "APPROVAL" } },
                new() { Id = "APPROVAL", Number = "08", Title = "APPROVAL – HÃNG TÀU DUYỆT", ModuleTarget = "approval", Summary = "Duyệt hoặc từ chối Estimate.", Details = new() { "Duyệt chuyển Repair.", "Từ chối quay lại Estimate.", "Ghi audit." }, NextSteps = new() { "REPAIR" } },
                new() { Id = "REPAIR", Number = "09", Title = "REPAIR – WORK ORDER", ModuleTarget = "repair", Summary = "Phân công và hoàn thành sửa chữa.", Details = new() { "Assign đội sửa chữa.", "Start/Complete Work Order.", "Chuyển QC." }, NextSteps = new() { "QC" } },
                new() { Id = "QC", Number = "10", Title = "QC – NGHIỆM THU", ModuleTarget = "qc", Summary = "Kiểm tra chất lượng sau sửa chữa.", Details = new() { "QC Pass chuyển Ready.", "QC Fail quay lại Repair.", "Ghi kết quả audit." }, NextSteps = new() { "SHIPPING_API" } },
                new() { Id = "SHIPPING_API", Number = "11", Title = "SHIPPING API – ĐỒNG BỘ HÃNG TÀU", ModuleTarget = "shipping_api", Summary = "Gửi trạng thái và nhận ACK.", Details = new() { "Gửi sync request.", "Nhận ACK token.", "Lưu audit gateway." }, NextSteps = new() { "GATE_OUT" } },
                new() { Id = "GATE_OUT", Number = "12", Title = "GATE-OUT – CẤP VỎ", ModuleTarget = "gate_out", Summary = "Cấp vỏ và giải phóng vị trí bãi.", Details = new() { "Khớp xe/tài xế/seal.", "Sinh EIR-Out.", "Chuyển GATE_OUT." }, NextSteps = new() { "YARD_MANAGEMENT", "BILLING" } },
                new() { Id = "YARD_MANAGEMENT", Number = "13", Title = "YARD MANAGEMENT – QUẢN LÝ BÃI", ModuleTarget = "yard_map", Summary = "Theo dõi vị trí và occupancy.", Details = new() { "Đọc vị trí bãi.", "Kiểm tra ô chiếm.", "Giải phóng sau Gate-Out." }, NextSteps = new() { "BILLING" } },
                new() { Id = "BILLING", Number = "14", Title = "BILLING – ĐỐI SOÁT", ModuleTarget = "billing", Summary = "Đối soát dịch vụ và công nợ.", Details = new() { "Đọc Payment/Estimate.", "Đối soát doanh thu.", "Xuất báo cáo." }, NextSteps = new() { "INTEGRATION" } },
                new() { Id = "INTEGRATION", Number = "15", Title = "INTEGRATION – ĐỒNG BỘ EDI/API/WEBHOOK", ModuleTarget = "system", Summary = "Đồng bộ dữ liệu thời gian thực với hãng tàu, cảng biển và ngân hàng.", Details = new() { "Chuẩn EDI hàng hải: CODECO, COARRI, WESTIM.", "RESTful API/Webhook: VietQR, hải quan điện tử.", "Giám sát nhật ký đồng bộ hệ thống." }, NextSteps = new() }
            };
            return Ok(new ResponseSingleContentModel<List<WorkflowStepDto>> { StatusCode = 200, Message = "Lấy định nghĩa workflow thành công", Data = steps });
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                var jobs = await _jobService.GetAllJobsAsync();
                var summary = new WorkflowSummaryDto
                {
                    TotalJobs = jobs.Count,
                    // "GATE_IN" không phải trạng thái thật (CreateGateInJobAsync khởi tạo thẳng
                    // "SURVEYING", không có bước nghỉ riêng ở GATE_IN) — đếm luôn = 0, đã ghi nhận trong
                    // báo cáo QA, cố ý CHƯA đổi ý nghĩa KPI này ở đây (cần quyết định rõ ý nghĩa KPI trước,
                    // ngoài phạm vi lần sửa try/catch này).
                    GateInCount = jobs.Count(j => j.Status == "GATE_IN"),
                    SurveyingCount = jobs.Count(j => j.Status == "SURVEYING"),
                    EstimatingCount = jobs.Count(j => j.Status == "ESTIMATING"),
                    AwaitingApprovalCount = jobs.Count(j => j.Status == "WAITING_APPROVAL" || j.Status == "PENDING_APPROVAL"),
                    RepairingCount = jobs.Count(j => j.Status == "REPAIRING"),
                    QcCount = jobs.Count(j => j.Status == "WAITING_QC" || j.Status == "QC"),
                    ReadyForOutCount = jobs.Count(j => j.Status == "READY_FOR_OUT" || j.Status == "READY_FOR_USE"),
                    GateOutCount = jobs.Count(j => j.Status == "GATE_OUT")
                };

                return Ok(new ResponseSingleContentModel<WorkflowSummaryDto>
                {
                    StatusCode = 200,
                    Message = "Lấy tổng quan workflow thành công",
                    Data = summary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy tổng quan workflow", Data = ex.Message });
            }
        }
    }
}
