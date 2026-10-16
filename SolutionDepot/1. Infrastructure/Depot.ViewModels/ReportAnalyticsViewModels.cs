using System.Collections.Generic;

namespace Depot.ViewModels
{
    public class ThroughputDayDto
    {
        public string Day { get; set; } = string.Empty;
        public int GateIn { get; set; }
        public int GateOut { get; set; }
        public int Total { get; set; }
    }

    public class DamageCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percent { get; set; }
        public decimal Cost { get; set; }
    }

    public class TechnicianProductivityDto
    {
        public string Name { get; set; } = string.Empty;
        public int Completed { get; set; }
        public double AvgHours { get; set; }
        public double FpyPercent { get; set; }
    }

    public class AgingContainerDto
    {
        public string ContainerNo { get; set; } = string.Empty;
        public string? ShippingLine { get; set; }
        public string IsoSize { get; set; } = string.Empty;
        public int DwellDays { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class DetailedContainerLogDto
    {
        public string Id { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string IsoSize { get; set; } = string.Empty;
        public string? ShippingLine { get; set; }
        public string? GateIn { get; set; }
        public string? GateOut { get; set; }
        public double DwellDays { get; set; }
        public decimal EmrCost { get; set; }
        public decimal LiftFee { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Grade { get; set; }
    }

    public class RevenueCategoryDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class BlockCapacityDto
    {
        public string BlockCode { get; set; } = string.Empty;
        public int OccupiedCount { get; set; }
        public int TotalCapacity { get; set; }
        public double OccupancyPercent { get; set; }
    }

    public class AgingTierDto
    {
        public string Label { get; set; } = string.Empty;
        public int FromDay { get; set; }
        public int? ToDay { get; set; }
        public int Count { get; set; }
        public double Percent { get; set; }
    }

    public class GradeDistributionDto
    {
        public string Grade { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percent { get; set; }
    }

    public class StaffCurrentTaskDto
    {
        public string TaskName { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string StartedAt { get; set; } = string.Empty;
        public int ElapsedMinutes { get; set; }
    }

    public class StaffActivityLogDto
    {
        public string Id { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = "COMPLETED";
        public string Note { get; set; } = string.Empty;
    }

    public class StaffRealtimeItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string Status { get; set; } = "AVAILABLE";
        public StaffCurrentTaskDto? CurrentTask { get; set; }
        public int AssignedToday { get; set; }
        public int CompletedToday { get; set; }
        public int PendingToday { get; set; }
        public int InProgressToday { get; set; }
        public double? AvgMinutesPerContainer { get; set; }
        public double? FirstPassYieldPercent { get; set; }
        public List<StaffActivityLogDto> TodayActivityLogs { get; set; } = new();
    }

    public class ReportAnalyticsDto
    {
        public List<ThroughputDayDto> Throughput { get; set; } = new();
        public List<DamageCategoryDto> DamageCategories { get; set; } = new();
        public List<TechnicianProductivityDto> TechnicianTeams { get; set; } = new();
        public List<AgingContainerDto> AgingContainers { get; set; } = new();
        public List<DetailedContainerLogDto> DetailedLogs { get; set; } = new();
        public List<RevenueCategoryDto> RevenueBreakdown { get; set; } = new();
        public decimal EmrRepairRevenueVnd { get; set; }
        public List<BlockCapacityDto> BlockCapacity { get; set; } = new();
        public List<GradeDistributionDto> GradeDistribution { get; set; } = new();
        /// <summary>Phân tầng tuổi lưu bãi của MỌI container đang trong bãi (không giới hạn như DetailedLogs).</summary>
        public List<AgingTierDto> AgingTiers { get; set; } = new();
        /// <summary>Số ngày lưu bãi trung bình của container đang trong bãi; null khi bãi trống.</summary>
        public double? AvgDwellDaysInYard { get; set; }
    }
}
