using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Yard;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    public sealed class YardOverviewService : IYardOverviewService
    {
        private readonly DepotDbContext db;
        public YardOverviewService(DepotDbContext db) => this.db = db;

        private static string BuildLocationCode(string blockCode, int bay, int row, int tier)
            => $"{blockCode}-{bay:D2}-{row:D2}-{tier:D2}";

        private static string DeriveCondition(string status) => status switch
        {
            "REPAIRING" => "DM",
            _ => "AV"
        };

        private static YardContainerDto MapContainer(DepotJob job, HashSet<string> cleaningContainerNos)
        {
            var condition = cleaningContainerNos.Contains(job.ContainerNo) ? "CL" : DeriveCondition(job.Status);
            return new YardContainerDto
            {
                Id = job.Id.ToString(),
                ContainerNo = job.ContainerNo,
                IsoType = job.IsoSize,
                ShippingLine = job.ShippingLineCode,
                Condition = condition,
                Status = job.Status,
                LocationCode = BuildLocationCode(job.BlockCode, job.Bay, job.Row, job.Tier),
                BlockId = job.BlockCode,
                BayNo = job.Bay,
                RowNo = job.Row,
                TierNo = job.Tier,
                TareWeightKg = job.TareWeightKg,
                MaxPayloadKg = job.MaxPayloadKg,
                GateInDate = job.GateInDate.ToString("yyyy-MM-dd HH:mm"),
                Notes = null
            };
        }

        private static YardBlockDto BuildBlockDto(YardBlockLayout b, List<DepotJob> jobsInBlock, HashSet<string> cleaningContainerNos)
        {
            var totalCapacity = b.BayCount * b.RowCount * b.MaxTier;
            var occupied = jobsInBlock.Count;
            var repairCount = jobsInBlock.Count(x => x.Status == "REPAIRING");
            var cleaningCount = jobsInBlock.Count(x => cleaningContainerNos.Contains(x.ContainerNo));

            return new YardBlockDto
            {
                Id = b.Code,
                ZoneId = b.ZoneCode,
                BlockCode = b.Code,
                BlockName = b.BlockName,
                BayCount = b.BayCount,
                RowCount = b.RowCount,
                MaxTier = b.MaxTier,
                PositionX = b.PositionX,
                PositionY = b.PositionY,
                Width = b.Width,
                Height = b.Height,
                Status = b.Status,
                Description = b.Description,
                TotalCapacity = totalCapacity,
                OccupiedCount = occupied,
                AvailableCount = Math.Max(0, totalCapacity - occupied),
                RepairCount = repairCount,
                CleaningCount = cleaningCount,
                HoldCount = 0
            };
        }

        private static YardZoneDto MapZone(YardZone z) => new()
        {
            Id = z.Code,
            ZoneCode = z.Code,
            ZoneName = z.ZoneName,
            ZoneType = z.ZoneType,
            PositionX = z.PositionX,
            PositionY = z.PositionY,
            Width = z.Width,
            Height = z.Height,
            Description = z.Description
        };

        private static ForkliftDto MapForklift(Forklift f) => new()
        {
            Id = f.Id.ToString(),
            Code = f.Code,
            Name = f.Name,
            Status = f.Status,
            CurrentLocation = f.CurrentLocation,
            PositionX = f.PositionX,
            PositionY = f.PositionY,
            TargetPositionX = f.TargetPositionX,
            TargetPositionY = f.TargetPositionY,
            DriverName = f.DriverName,
            DriverPhone = f.DriverPhone,
            BatteryPercent = f.BatteryPercent,
            MaxCapacityTons = f.MaxCapacityTons,
            CurrentTask = f.CurrentTask
        };

        private static ForkliftDispatchDto MapDispatch(ForkliftDispatch d, Dictionary<string, long> forkliftIdsByCode, Dictionary<string, long> jobIdsByContainerNo) => new()
        {
            Id = d.Id.ToString(),
            DispatchNo = d.Code,
            ForkliftId = forkliftIdsByCode.TryGetValue(d.ForkliftCode, out var flId) ? flId.ToString() : d.ForkliftCode,
            ForkliftCode = d.ForkliftCode,
            ContainerId = jobIdsByContainerNo.TryGetValue(d.ContainerNo, out var jobId) ? jobId.ToString() : d.ContainerNo,
            ContainerNo = d.ContainerNo,
            FromLocation = d.FromLocation,
            ToLocation = d.ToLocation,
            DispatchedAt = d.DispatchedAt.ToString("yyyy-MM-dd HH:mm"),
            CompletedAt = d.CompletedAt?.ToString("yyyy-MM-dd HH:mm"),
            Status = d.Status,
            DriverName = d.DriverName,
            Priority = d.Priority
        };

        private static YardGateLaneDto MapGateLane(YardGateLane l) => new()
        {
            Id = l.Code,
            LaneNo = l.LaneNo,
            GateType = l.GateType,
            LaneName = l.LaneName,
            HasOcr = l.HasOcr,
            HasRfid = l.HasRfid,
            HasWeighbridge = l.HasWeighbridge,
            Status = l.Status,
            CurrentTruckPlate = l.CurrentTruckPlate,
            CurrentContainerNo = l.CurrentContainerNo
        };

        private async Task<HashSet<string>> GetActiveCleaningContainerNosAsync()
        {
            var nos = await db.CleaningRecords
                .Where(x => x.Status == "PENDING_CLEANING" || x.Status == "IN_CLEANING")
                .Select(x => x.ContainerNo)
                .ToListAsync();
            return nos.ToHashSet();
        }

        public async Task<YardOverviewDto> GetOverviewAsync()
        {
            var activeJobs = await db.DepotJobs.AsNoTracking()
                .Include(x => x.ShippingLine)
                .Where(x => x.Status != "GATE_OUT")
                .ToListAsync();
            var blockLayouts = await db.YardBlockLayouts.AsNoTracking().ToListAsync();
            var zones = await db.YardZones.AsNoTracking().OrderBy(x => x.SortOrder).ToListAsync();
            var forklifts = await db.Forklifts.AsNoTracking().ToListAsync();
            var dispatches = await db.ForkliftDispatches.AsNoTracking()
                .OrderByDescending(x => x.DispatchedAt).Take(50).ToListAsync();
            var gateLanes = await db.YardGateLanes.AsNoTracking().ToListAsync();
            var cleaningContainerNos = await GetActiveCleaningContainerNosAsync();

            var containers = activeJobs.Select(j => MapContainer(j, cleaningContainerNos)).ToList();
            var jobsByBlock = activeJobs.GroupBy(x => x.BlockCode).ToDictionary(g => g.Key, g => g.ToList());

            var blocks = blockLayouts.Select(b =>
            {
                var jobsInBlock = jobsByBlock.TryGetValue(b.Code, out var list) ? list : new List<DepotJob>();
                return BuildBlockDto(b, jobsInBlock, cleaningContainerNos);
            }).ToList();

            var locations = new List<YardLocationDto>();
            foreach (var b in blockLayouts)
            {
                var jobsInBlock = jobsByBlock.TryGetValue(b.Code, out var list) ? list : new List<DepotJob>();
                // GroupBy + lấy bản ghi mới nhất, không dùng ToDictionary trực tiếp — dữ liệu thật có thể
                // có nhiều DepotJob trùng (Bay,Row,Tier) trong cùng Block (vd job mới tạo còn giữ giá trị
                // mặc định Bay=1/Row=1/Tier=1 trước khi được Forklift hạ bãi thật), không phải lỗi hệ thống.
                var byPosition = jobsInBlock
                    .GroupBy(j => (j.Bay, j.Row, j.Tier))
                    .ToDictionary(g => g.Key, g => g.OrderByDescending(j => j.GateInDate).First());
                for (var bay = 1; bay <= b.BayCount; bay++)
                for (var row = 1; row <= b.RowCount; row++)
                for (var tier = 1; tier <= b.MaxTier; tier++)
                {
                    byPosition.TryGetValue((bay, row, tier), out var occupant);
                    locations.Add(new YardLocationDto
                    {
                        Id = $"LOC-{BuildLocationCode(b.Code, bay, row, tier)}",
                        BlockId = b.Code,
                        BayNo = bay,
                        RowNo = row,
                        TierNo = tier,
                        PositionCode = BuildLocationCode(b.Code, bay, row, tier),
                        ContainerNo = occupant?.ContainerNo,
                        Status = occupant != null ? "OCCUPIED" : "AVAILABLE",
                        IsOccupied = occupant != null
                    });
                }
            }

            var totalCapacityAll = blocks.Sum(b => b.TotalCapacity);
            var totalContainers = containers.Count;

            var statistics = new YardStatisticsDto
            {
                TotalCapacity = totalCapacityAll,
                TotalContainers = totalContainers,
                AvailableSlots = Math.Max(0, totalCapacityAll - totalContainers),
                OccupancyRate = totalCapacityAll > 0 ? Math.Round((double)totalContainers / totalCapacityAll * 100, 1) : 0,
                RepairCount = activeJobs.Count(x => x.Status == "REPAIRING"),
                CleaningCount = activeJobs.Count(x => cleaningContainerNos.Contains(x.ContainerNo)),
                HoldCount = 0,
                WaitingGateInCount = activeJobs.Count(x => x.Status == "GATE_IN"),
                WaitingGateOutCount = activeJobs.Count(x => x.Status == "READY_FOR_OUT"),
                ActiveForklifts = forklifts.Count(x => x.Status == "AVAILABLE" || x.Status == "MOVING")
            };

            var forkliftIdsByCode = forklifts.ToDictionary(f => f.Code, f => f.Id);
            var jobIdsByContainerNo = activeJobs.GroupBy(j => j.ContainerNo).ToDictionary(g => g.Key, g => g.First().Id);

            return new YardOverviewDto
            {
                Zones = zones.Select(MapZone).ToList(),
                Blocks = blocks,
                Containers = containers,
                Locations = locations,
                Forklifts = forklifts.Select(MapForklift).ToList(),
                Dispatches = dispatches.Select(d => MapDispatch(d, forkliftIdsByCode, jobIdsByContainerNo)).ToList(),
                GateLanes = gateLanes.Select(MapGateLane).ToList(),
                Statistics = statistics
            };
        }

        public async Task<List<YardContainerDto>> SearchContainersAsync(string? containerNo)
        {
            var query = db.DepotJobs.AsNoTracking().Include(x => x.ShippingLine).Where(x => x.Status != "GATE_OUT");
            if (!string.IsNullOrWhiteSpace(containerNo))
            {
                var q = containerNo.Trim().ToUpperInvariant();
                query = query.Where(x => x.ContainerNo.ToUpper().Contains(q));
            }
            var jobs = await query.Take(50).ToListAsync();
            var cleaningContainerNos = await GetActiveCleaningContainerNosAsync();
            return jobs.Select(j => MapContainer(j, cleaningContainerNos)).ToList();
        }

        public async Task<YardContainerDto?> GetContainerByIdAsync(string idOrContainerNo)
        {
            IQueryable<DepotJob> query = db.DepotJobs.AsNoTracking().Include(x => x.ShippingLine);
            var job = long.TryParse(idOrContainerNo, out var parsedId)
                ? await query.FirstOrDefaultAsync(x => x.Id == parsedId)
                : await query.FirstOrDefaultAsync(x => x.ContainerNo == idOrContainerNo.ToUpperInvariant());
            if (job == null) return null;
            var cleaningContainerNos = await GetActiveCleaningContainerNosAsync();
            return MapContainer(job, cleaningContainerNos);
        }

        public async Task<List<YardMoveHistory>> GetMoveHistoryAsync(string? containerId)
        {
            var query = db.YardMoveHistories.AsNoTracking().OrderByDescending(x => x.MoveDate).AsQueryable();
            if (!string.IsNullOrWhiteSpace(containerId))
            {
                query = query.Where(x => x.ContainerNo == containerId.ToUpperInvariant());
            }
            return await query.Take(200).ToListAsync();
        }

        public async Task<ApiResult<YardContainerDto>> MoveContainerAsync(MoveYardContainerRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ContainerId) || string.IsNullOrWhiteSpace(request.TargetLocation))
                return ApiResult<YardContainerDto>.Failure("Thiếu container hoặc vị trí đích.");

            var job = long.TryParse(request.ContainerId, out var parsedId)
                ? await db.DepotJobs.Include(x => x.ShippingLine).FirstOrDefaultAsync(x => x.Id == parsedId)
                : await db.DepotJobs.Include(x => x.ShippingLine).FirstOrDefaultAsync(x => x.ContainerNo == request.ContainerId.ToUpperInvariant());
            if (job == null) return ApiResult<YardContainerDto>.Failure("Không tìm thấy Container trong hệ thống.");

            var parts = request.TargetLocation.ToUpperInvariant().Split('-');
            if (parts.Length < 4 || !int.TryParse(parts[^3], out var bay) || !int.TryParse(parts[^2], out var row) || !int.TryParse(parts[^1], out var tier))
                return ApiResult<YardContainerDto>.Failure("Định dạng mã vị trí không hợp lệ (Chuẩn: BLOCK-BAY-ROW-TIER).");
            var blockCode = string.Join("-", parts.Take(parts.Length - 3));

            var block = await db.YardBlockLayouts.AsNoTracking().FirstOrDefaultAsync(x => x.Code == blockCode);
            if (block == null) return ApiResult<YardContainerDto>.Failure($"Block {blockCode} không tồn tại trong sơ đồ bãi.");
            if (tier > block.MaxTier || bay > block.BayCount || row > block.RowCount)
                return ApiResult<YardContainerDto>.Failure($"Vị trí vượt quá giới hạn Block (Max Bay {block.BayCount} / Row {block.RowCount} / Tier {block.MaxTier}).");

            var occupant = await db.DepotJobs.AsNoTracking().FirstOrDefaultAsync(x =>
                x.Status != "GATE_OUT" && x.BlockCode == blockCode && x.Bay == bay && x.Row == row && x.Tier == tier && x.Id != job.Id);
            if (occupant != null)
                return ApiResult<YardContainerDto>.Failure($"Vị trí {request.TargetLocation} đã có container {occupant.ContainerNo} chiếm giữ.");

            var fromLocation = BuildLocationCode(job.BlockCode, job.Bay, job.Row, job.Tier);
            job.BlockCode = blockCode;
            job.Bay = bay;
            job.Row = row;
            job.Tier = tier;

            var forklift = string.IsNullOrWhiteSpace(request.ForkliftCode)
                ? null
                : await db.Forklifts.FirstOrDefaultAsync(x => x.Code == request.ForkliftCode);

            db.YardMoveHistories.Add(new YardMoveHistory
            {
                Code = "MV-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999),
                ContainerNo = job.ContainerNo,
                FromLocation = fromLocation,
                ToLocation = request.TargetLocation.ToUpperInvariant(),
                MoveDate = DateTime.UtcNow,
                ForkliftCode = forklift?.Code,
                PerformedBy = request.OperatorName,
                Reason = request.Reason ?? "Điều chuyển vị trí theo kế hoạch xếp bãi"
            });

            db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = job.Id,
                JobNo = job.JobNo,
                Action = "YARD_MOVE",
                User = request.OperatorName ?? "Điều Độ Bãi",
                Timestamp = DateTime.UtcNow,
                Details = $"Di chuyển {fromLocation} -> {request.TargetLocation.ToUpperInvariant()} ({request.Reason ?? "-"})"
            });

            await db.SaveChangesAsync();

            var cleaningContainerNos = await GetActiveCleaningContainerNosAsync();
            return ApiResult<YardContainerDto>.Success(MapContainer(job, cleaningContainerNos),
                $"Đã di chuyển Container {job.ContainerNo} từ {fromLocation} tới {request.TargetLocation.ToUpperInvariant()} thành công!");
        }

        public async Task<ApiResult<ForkliftDispatch>> DispatchForkliftAsync(DispatchForkliftRequest request)
        {
            var forklift = long.TryParse(request.ForkliftId, out var forkliftDbId)
                ? await db.Forklifts.FirstOrDefaultAsync(x => x.Id == forkliftDbId)
                : await db.Forklifts.FirstOrDefaultAsync(x => x.Code == request.ForkliftId);
            if (forklift == null) return ApiResult<ForkliftDispatch>.Failure("Xe nâng không hợp lệ.");

            var job = long.TryParse(request.ContainerId, out var parsedId)
                ? await db.DepotJobs.FirstOrDefaultAsync(x => x.Id == parsedId)
                : await db.DepotJobs.FirstOrDefaultAsync(x => x.ContainerNo == request.ContainerId.ToUpperInvariant());
            if (job == null) return ApiResult<ForkliftDispatch>.Failure("Container không hợp lệ.");

            var dispatch = new ForkliftDispatch
            {
                Code = $"DISP-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(100, 999)}",
                ForkliftCode = forklift.Code,
                ContainerNo = job.ContainerNo,
                FromLocation = BuildLocationCode(job.BlockCode, job.Bay, job.Row, job.Tier),
                ToLocation = request.TargetLocation.ToUpperInvariant(),
                DispatchedAt = DateTime.UtcNow,
                Status = "MOVING",
                DriverName = forklift.DriverName,
                Priority = string.IsNullOrWhiteSpace(request.Priority) ? "NORMAL" : request.Priority
            };
            db.ForkliftDispatches.Add(dispatch);

            forklift.Status = "MOVING";
            forklift.CurrentTask = $"Đang chuyển Cont {job.ContainerNo} từ {dispatch.FromLocation} sang {dispatch.ToLocation}";

            await db.SaveChangesAsync();
            return ApiResult<ForkliftDispatch>.Success(dispatch,
                $"Đã phát lệnh điều xe nâng {forklift.Code} ({forklift.DriverName}) di chuyển Container {job.ContainerNo}!");
        }

        public async Task<YardBlockDto?> UpdateBlockLayoutAsync(string blockCode, UpdateYardBlockLayoutRequest request)
        {
            var block = await db.YardBlockLayouts.FirstOrDefaultAsync(x => x.Code == blockCode);
            if (block == null) return null;

            block.BlockName = request.BlockName;
            block.Description = request.Description;
            block.BayCount = request.BayCount;
            block.RowCount = request.RowCount;
            block.MaxTier = request.MaxTier;
            block.Status = request.Status;
            await db.SaveChangesAsync();

            var jobsInBlock = await db.DepotJobs.AsNoTracking()
                .Where(x => x.Status != "GATE_OUT" && x.BlockCode == blockCode)
                .ToListAsync();
            var cleaningContainerNos = await GetActiveCleaningContainerNosAsync();
            return BuildBlockDto(block, jobsInBlock, cleaningContainerNos);
        }
    }
}
