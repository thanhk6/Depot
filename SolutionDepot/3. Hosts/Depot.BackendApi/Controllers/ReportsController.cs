using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
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

        [HttpGet("reports/analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            return Ok(new ResponseSingleContentModel<object>
            {
                StatusCode = 200,
                Message = "Lấy thống kê báo cáo thành công",
                Data = await _analyticsService.GetAnalyticsAsync()
            });
        }

        [HttpGet("reports/staff-realtime")]
        public async Task<IActionResult> GetStaffRealtime()
        {
            return Ok(new ResponseSingleContentModel<object>
            {
                StatusCode = 200,
                Message = "Lấy danh sách nhân sự thời gian thực thành công",
                Data = await _analyticsService.GetStaffRealtimeAsync()
            });
        }

        [HttpGet("reports/kpi")]
        [HttpGet("dashboard/overview")]
        public async Task<IActionResult> GetKpi()
        {
            return Ok(new ResponseSingleContentModel<KpiSummaryDto>
            {
                StatusCode = 200,
                Message = "Lấy KPI Depot thành công",
                Data = await _service.GetKpiSummaryAsync()
            });
        }

        [HttpPost("reports/export-excel")]
        public IActionResult Export([FromBody] object request)
        {
            // The report UI currently expects a response contract; file storage/export
            // can be attached here without changing the frontend service signature.
            return Ok(new ResponseSingleContentModel<string>
            {
                StatusCode = 200,
                Message = "Yêu cầu xuất báo cáo đã được tiếp nhận",
                Data = "Report export endpoint ready"
            });
        }
    }
}
