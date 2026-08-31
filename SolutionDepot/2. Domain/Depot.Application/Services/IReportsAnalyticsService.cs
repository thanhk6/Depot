using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Thống kê chi tiết cho màn Báo Cáo & Hiệu Suất (mục #48-52) — khác
    /// <see cref="IDepotJobService.GetKpiSummaryAsync"/> (chỉ 6 số KPI tổng dùng chung Dashboard).
    /// Toàn bộ số liệu tính trực tiếp từ DepotJob/Survey/DamageItem/RepairOrder/ServiceOrder thật,
    /// không dữ liệu giả lập. Xem docs/backend-progress/48-report.md.
    /// </summary>
    public interface IReportsAnalyticsService
    {
        Task<ReportAnalyticsDto> GetAnalyticsAsync();

        /// <summary>
        /// Danh sách nhân sự đang hoạt động, dựng từ tên tự do trên các bảng nghiệp vụ thật
        /// (RepairOrder.TechnicianName/InspectorName, Survey.SurveyorName, CleaningRecord.CleaningStaff,
        /// ForkliftDispatch.DriverName, MaterialStockTransaction.PerformedBy) — hệ thống chưa có bảng
        /// "Nhân sự" độc lập nên không liên kết theo SystemUser.Id. Không có nguồn thật cho ca trực/SĐT/
        /// định mức/rating — các field đó trả rỗng, KHÔNG bịa số (xem docs/backend-progress/48-report.md).
        /// </summary>
        Task<List<StaffRealtimeItemDto>> GetStaffRealtimeAsync();
    }
}
