using System;
using System.Collections.Generic;

namespace Depot.ViewModels
{
    /// <summary>Container hiển thị trên Sơ Đồ Bãi 2D — tổng hợp từ DepotJob thật (không phải dữ liệu giả lập).</summary>
    public class YardContainerDto
    {
        public string Id { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string IsoType { get; set; } = string.Empty;
        public string? ShippingLine { get; set; }
        public string Condition { get; set; } = "AV";
        public string Status { get; set; } = string.Empty;
        public string LocationCode { get; set; } = string.Empty;
        public string BlockId { get; set; } = string.Empty;
        public int BayNo { get; set; }
        public int RowNo { get; set; }
        public int TierNo { get; set; }
        public int TareWeightKg { get; set; }
        public int MaxPayloadKg { get; set; }
        public string GateInDate { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class YardLocationDto
    {
        public string Id { get; set; } = string.Empty;
        public string BlockId { get; set; } = string.Empty;
        public int BayNo { get; set; }
        public int RowNo { get; set; }
        public int TierNo { get; set; }
        public string PositionCode { get; set; } = string.Empty;
        public string? ContainerNo { get; set; }
        public string Status { get; set; } = "AVAILABLE";
        public bool IsOccupied { get; set; }
    }

    public class YardBlockDto
    {
        public string Id { get; set; } = string.Empty;
        public string? ZoneId { get; set; }
        public string BlockCode { get; set; } = string.Empty;
        public string BlockName { get; set; } = string.Empty;
        public int BayCount { get; set; }
        public int RowCount { get; set; }
        public int MaxTier { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string Status { get; set; } = "ACTIVE";
        public string? Description { get; set; }
        public int TotalCapacity { get; set; }
        public int OccupiedCount { get; set; }
        public int AvailableCount { get; set; }
        public int RepairCount { get; set; }
        public int CleaningCount { get; set; }
        public int HoldCount { get; set; }
    }

    public class YardStatisticsDto
    {
        public int TotalCapacity { get; set; }
        public int TotalContainers { get; set; }
        public int AvailableSlots { get; set; }
        public double OccupancyRate { get; set; }
        public int RepairCount { get; set; }
        public int CleaningCount { get; set; }
        public int HoldCount { get; set; }
        public int WaitingGateInCount { get; set; }
        public int WaitingGateOutCount { get; set; }
        public int ActiveForklifts { get; set; }
    }

    public class YardZoneDto
    {
        public string Id { get; set; } = string.Empty;
        public string ZoneCode { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        public string ZoneType { get; set; } = string.Empty;
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string? Description { get; set; }
    }

    public class ForkliftDto
    {
        public string Id { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? CurrentLocation { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public int? TargetPositionX { get; set; }
        public int? TargetPositionY { get; set; }
        public string? DriverName { get; set; }
        public string? DriverPhone { get; set; }
        public int BatteryPercent { get; set; }
        public decimal MaxCapacityTons { get; set; }
        public string? CurrentTask { get; set; }
    }

    public class ForkliftDispatchDto
    {
        public string Id { get; set; } = string.Empty;
        public string DispatchNo { get; set; } = string.Empty;
        public string ForkliftId { get; set; } = string.Empty;
        public string ForkliftCode { get; set; } = string.Empty;
        public string ContainerId { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string? FromLocation { get; set; }
        public string ToLocation { get; set; } = string.Empty;
        public string DispatchedAt { get; set; } = string.Empty;
        public string? CompletedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? DriverName { get; set; }
        public string Priority { get; set; } = "NORMAL";
    }

    public class YardGateLaneDto
    {
        public string Id { get; set; } = string.Empty;
        public int LaneNo { get; set; }
        public string GateType { get; set; } = string.Empty;
        public string LaneName { get; set; } = string.Empty;
        public bool HasOcr { get; set; }
        public bool HasRfid { get; set; }
        public bool HasWeighbridge { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? CurrentTruckPlate { get; set; }
        public string? CurrentContainerNo { get; set; }
    }

    public class YardOverviewDto
    {
        public List<YardZoneDto> Zones { get; set; } = new();
        public List<YardBlockDto> Blocks { get; set; } = new();
        public List<YardContainerDto> Containers { get; set; } = new();
        public List<YardLocationDto> Locations { get; set; } = new();
        public List<ForkliftDto> Forklifts { get; set; } = new();
        public List<ForkliftDispatchDto> Dispatches { get; set; } = new();
        public List<YardGateLaneDto> GateLanes { get; set; } = new();
        public YardStatisticsDto Statistics { get; set; } = new();
    }

    public class MoveYardContainerRequest
    {
        public string ContainerId { get; set; } = string.Empty;
        public string TargetLocation { get; set; } = string.Empty;
        public string? ForkliftCode { get; set; }
        public string? Reason { get; set; }
        public string? OperatorName { get; set; }
    }

    public class DispatchForkliftRequest
    {
        public string ForkliftId { get; set; } = string.Empty;
        public string ContainerId { get; set; } = string.Empty;
        public string TargetLocation { get; set; } = string.Empty;
        public string Priority { get; set; } = "NORMAL";
    }

    public class UpdateYardBlockLayoutRequest
    {
        public string BlockName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int BayCount { get; set; }
        public int RowCount { get; set; }
        public int MaxTier { get; set; }
        public string Status { get; set; } = "ACTIVE";
    }
}
