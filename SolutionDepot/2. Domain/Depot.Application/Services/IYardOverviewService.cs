using System.Collections.Generic;
using System.Threading.Tasks;
using Depot.Data.Entities.Yard;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Tổng hợp dữ liệu cho Sơ Đồ Bãi 2D (mục #9 yard_map) và Quản Lý Vị Trí Block (mục #10 yard_blocks)
    /// — khác <see cref="IYardService"/> (chỉ đọc/ghi occupancy phẳng dùng chung Operation/Forklift #6/#11).
    /// Container/vị trí luôn lấy trực tiếp từ DepotJob thật, Zone/Block/Forklift/GateLane là layout/fleet
    /// lưu ở bảng riêng (xem docs/backend-progress/09-yard-map.md).
    /// </summary>
    public interface IYardOverviewService
    {
        Task<YardOverviewDto> GetOverviewAsync();
        Task<List<YardContainerDto>> SearchContainersAsync(string? containerNo);
        Task<YardContainerDto?> GetContainerByIdAsync(string idOrContainerNo);
        Task<List<YardMoveHistory>> GetMoveHistoryAsync(string? containerId);
        Task<ApiResult<YardContainerDto>> MoveContainerAsync(MoveYardContainerRequest request);
        Task<ApiResult<ForkliftDispatch>> DispatchForkliftAsync(DispatchForkliftRequest request);
        Task<YardBlockDto?> UpdateBlockLayoutAsync(string blockCode, UpdateYardBlockLayoutRequest request);
    }
}
