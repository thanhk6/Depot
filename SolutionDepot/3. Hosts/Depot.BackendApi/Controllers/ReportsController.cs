using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>
    /// Endpoint tổng hợp báo cáo/KPI cho màn Report và Dashboard — thuần đọc dữ liệu, không có action ghi.
    /// Đã 100% trả DTO (`Depot.ViewModels`), không trả entity trực tiếp — xem
    /// docs/backend-progress/00-quy-tac-backend.md mục 3.
    /// </summary>
    [ApiController]
    [Route("api")]
    public class ReportsController : BaseController
    {
        private readonly IDepotJobService _service;
        private readonly IReportsAnalyticsService _analyticsService;
        public ReportsController(IDepotJobService service, IReportsAnalyticsService analyticsService)
        {
            _service = service;
            _analyticsService = analyticsService;
        }

        /// <summary>Bộ số liệu phân tích tổng hợp cho màn Report chính: throughput theo ngày, phân loại hư
        /// hỏng, năng suất tổ kỹ thuật, container tồn bãi lâu, doanh thu, tỷ lệ lấp đầy bãi, phân bố Grade.</summary>
        [RequirePermission(RolePermissions.Report)]
        [HttpGet("reports/analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            try
            {
                return Ok(new ResponseSingleContentModel<object>
                {
                    StatusCode = 200,
                    Message = "Lấy thống kê báo cáo thành công",
                    Data = await _analyticsService.GetAnalyticsAsync()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy thống kê báo cáo", Data = ex.Message });
            }
        }

        /// <summary>Trạng thái nhân sự thời gian thực (đang làm nhiệm vụ gì, ở đâu) phục vụ bảng theo dõi
        /// nhân sự trực tiếp trên màn Report — không cache, gọi lại là có dữ liệu mới nhất.</summary>
        [RequirePermission(RolePermissions.Report)]
        [HttpGet("reports/staff-realtime")]
        public async Task<IActionResult> GetStaffRealtime()
        {
            try
            {
                return Ok(new ResponseSingleContentModel<object>
                {
                    StatusCode = 200,
                    Message = "Lấy danh sách nhân sự thời gian thực thành công",
                    Data = await _analyticsService.GetStaffRealtimeAsync()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh sách nhân sự thời gian thực", Data = ex.Message });
            }
        }

        /// <summary>Cùng 1 bộ KPI tổng quan (tổng job, job đang hoạt động, doanh thu, tỷ lệ QC đạt lần đầu...)
        /// nhưng được cả màn Report lẫn Dashboard gọi tới qua 2 route khác nhau — gắn 2 attribute route lên
        /// chung 1 action thay vì tách đôi để tránh trùng lặp logic tính KPI.</summary>
        [RequirePermission(RolePermissions.Dashboard, RolePermissions.Report)]
        [HttpGet("reports/kpi")]
        [HttpGet("dashboard/overview")]
        public async Task<IActionResult> GetKpi()
        {
            try
            {
                return Ok(new ResponseSingleContentModel<KpiSummaryDto>
                {
                    StatusCode = 200,
                    Message = "Lấy KPI Depot thành công",
                    Data = await _service.GetKpiSummaryAsync()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy KPI Depot", Data = ex.Message });
            }
        }

        /// <summary>Endpoint xuất báo cáo ra Excel — hiện CHƯA sinh file thật, chỉ trả về xác nhận đã tiếp
        /// nhận yêu cầu để khớp đúng hợp đồng response mà frontend đang gọi tới. Khi cần xuất file thật, gắn
        /// logic tạo/lưu file ngay trong action này, không cần đổi chữ ký API nên frontend không phải sửa.</summary>
        [RequirePermission(RolePermissions.Report)]
        [HttpPost("reports/export-excel")]
        public IActionResult Export([FromBody] object request)
        {
            return Ok(new ResponseSingleContentModel<string>
            {
                StatusCode = 200,
                Message = "Yêu cầu xuất báo cáo đã được tiếp nhận",
                Data = "Report export endpoint ready"
            });
        }
    }
}
