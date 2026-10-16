using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Cleaning;
using Depot.Data.Entities.Yard;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    public sealed class ReportsAnalyticsService : IReportsAnalyticsService
    {
        private readonly DepotDbContext db;
        public ReportsAnalyticsService(DepotDbContext db) => this.db = db;

        public async Task<ReportAnalyticsDto> GetAnalyticsAsync()
        {
            var now = DateTime.UtcNow;
            var jobs = await db.DepotJobs.AsNoTracking().ToListAsync();
            var activeJobs = jobs.Where(x => x.Status != "GATE_OUT").ToList();
            // DepotJob không còn navigation ShippingLine/computed ShippingLineCode — join rời sang
            // ShippingLine.Code 1 lần rồi tra theo ShippingLineId (xem docs/backend-progress/00-quy-tac-backend.md).
            var shippingLineCodes = await db.ShippingLines.AsNoTracking().ToDictionaryAsync(s => s.Id, s => s.Code);

            return new ReportAnalyticsDto
            {
                Throughput = await BuildThroughputAsync(jobs, now),
                DamageCategories = await BuildDamageCategoriesAsync(),
                TechnicianTeams = await BuildTechnicianProductivityAsync(),
                AgingContainers = BuildAgingContainers(activeJobs, now, shippingLineCodes),
                DetailedLogs = await BuildDetailedLogsAsync(jobs, shippingLineCodes),
                RevenueBreakdown = await BuildRevenueBreakdownAsync(),
                EmrRepairRevenueVnd = await db.Estimates.AsNoTracking().Where(x => x.Status == "APPROVED").SumAsync(x => x.GrandTotal),
                BlockCapacity = await BuildBlockCapacityAsync(activeJobs),
                GradeDistribution = await BuildGradeDistributionAsync(),
                AgingTiers = BuildAgingTiers(activeJobs, now),
                AvgDwellDaysInYard = activeJobs.Count > 0 ? Math.Round(activeJobs.Average(j => (now - j.GateInDate).TotalDays), 1) : null
            };
        }

        private static Task<List<ThroughputDayDto>> BuildThroughputAsync(List<DepotJob> jobs, DateTime now)
        {
            var days = Enumerable.Range(0, 7).Select(i => now.Date.AddDays(-6 + i)).ToList();
            var result = days.Select(d =>
            {
                var gateIn = jobs.Count(j => j.GateInDate.Date == d);
                var gateOut = jobs.Count(j => j.GateOutDate.HasValue && j.GateOutDate.Value.Date == d);
                return new ThroughputDayDto
                {
                    Day = d.ToString("dd/MM"),
                    GateIn = gateIn,
                    GateOut = gateOut,
                    Total = gateIn + gateOut
                };
            }).ToList();
            return Task.FromResult(result);
        }

        private async Task<List<DamageCategoryDto>> BuildDamageCategoriesAsync()
        {
            var damages = await db.Set<DamageItem>().AsNoTracking().ToListAsync();
            var total = damages.Count;
            if (total == 0) return new List<DamageCategoryDto>();

            return damages
                .GroupBy(d => string.IsNullOrWhiteSpace(d.Component) ? "Khác" : d.Component)
                .Select(g => new DamageCategoryDto
                {
                    Name = g.Key,
                    Count = g.Count(),
                    Percent = Math.Round((double)g.Count() / total * 100, 1),
                    Cost = g.Sum(x => x.TotalCost)
                })
                .OrderByDescending(x => x.Count)
                .ToList();
        }

        private async Task<List<TechnicianProductivityDto>> BuildTechnicianProductivityAsync()
        {
            var orders = await db.RepairOrders.AsNoTracking()
                .Where(x => x.CompletedAt != null && !string.IsNullOrWhiteSpace(x.TechnicianName))
                .ToListAsync();

            return orders
                .GroupBy(x => x.TechnicianName)
                .Select(g =>
                {
                    var withDuration = g.Where(x => x.StartedAt.HasValue).ToList();
                    var avgHours = withDuration.Count > 0
                        ? withDuration.Average(x => (x.CompletedAt!.Value - x.StartedAt!.Value).TotalHours)
                        : 0;
                    // QcStatus thực tế chỉ được ghi là "PASSED"/"FAILED" (xem RepairOrder.QcStatus ở
                    // DepotJobService.CompleteRepairAsync) — bỏ nhánh "PASS" chết, không nơi nào ghi giá trị đó.
                    var passCount = g.Count(x => x.QcStatus == "PASSED");
                    return new TechnicianProductivityDto
                    {
                        Name = g.Key,
                        Completed = g.Count(),
                        AvgHours = Math.Round(avgHours, 1),
                        FpyPercent = Math.Round((double)passCount / g.Count() * 100, 1)
                    };
                })
                .OrderByDescending(x => x.Completed)
                .ToList();
        }

        // Thay 4 dòng phần trăm gõ cứng ở màn Báo cáo (68% / 2.597 cont...) — đếm trên toàn bộ container trong bãi.
        private static List<AgingTierDto> BuildAgingTiers(List<DepotJob> activeJobs, DateTime now)
        {
            var tiers = new (string Label, int From, int? To)[]
            {
                ("Dưới 8 ngày", 0, 7), ("8 – 14 ngày", 8, 14), ("15 – 30 ngày", 15, 30), ("Trên 30 ngày", 31, null)
            };
            var dwell = activeJobs.Select(j => (int)(now - j.GateInDate).TotalDays).ToList();
            var total = dwell.Count;
            return tiers.Select(t =>
            {
                var count = dwell.Count(d => d >= t.From && (t.To == null || d <= t.To));
                return new AgingTierDto
                {
                    Label = t.Label, FromDay = t.From, ToDay = t.To, Count = count,
                    Percent = total > 0 ? Math.Round((double)count / total * 100, 1) : 0
                };
            }).ToList();
        }

        private static List<AgingContainerDto> BuildAgingContainers(List<DepotJob> activeJobs, DateTime now, Dictionary<long, string> shippingLineCodes, int thresholdDays = 15)
        {
            return activeJobs
                .Select(j => new { Job = j, Dwell = (int)(now - j.GateInDate).TotalDays })
                .Where(x => x.Dwell >= thresholdDays)
                .OrderByDescending(x => x.Dwell)
                .Take(30)
                .Select(x => new AgingContainerDto
                {
                    ContainerNo = x.Job.ContainerNo,
                    ShippingLine = shippingLineCodes.GetValueOrDefault(x.Job.ShippingLineId),
                    IsoSize = x.Job.IsoSize,
                    DwellDays = x.Dwell,
                    Location = string.IsNullOrEmpty(x.Job.BlockCode) ? "Chưa hạ bãi" : $"{x.Job.BlockCode}-{x.Job.Bay:D2}-{x.Job.Row:D2}-{x.Job.Tier:D2}",
                    Status = x.Job.Status
                })
                .ToList();
        }

        private async Task<List<DetailedContainerLogDto>> BuildDetailedLogsAsync(List<DepotJob> jobs, Dictionary<long, string> shippingLineCodes)
        {
            var estimatesByJob = await db.Estimates.AsNoTracking().ToDictionaryAsync(x => x.JobNo, x => x.GrandTotal);
            var surveysByJob = await db.Surveys.AsNoTracking().ToDictionaryAsync(x => x.JobNo, x => x.ConditionRating);
            var liftFeeByJob = await db.ServiceOrders.AsNoTracking()
                .Include(x => x.Items)
                .ToDictionaryAsync(x => x.ContainerNo, x => x.Items.Where(i => i.Category == "LIFT_ON_OFF" || i.Category == "HANDLING").Sum(i => i.Total));

            return jobs
                .OrderByDescending(j => j.GateInDate)
                .Take(100)
                .Select(j =>
                {
                    var dwellDays = ((j.GateOutDate ?? DateTime.UtcNow) - j.GateInDate).TotalDays;
                    return new DetailedContainerLogDto
                    {
                        Id = j.JobNo,
                        ContainerNo = j.ContainerNo,
                        IsoSize = j.IsoSize,
                        ShippingLine = shippingLineCodes.GetValueOrDefault(j.ShippingLineId),
                        GateIn = j.GateInDate.ToString("dd/MM/yyyy HH:mm"),
                        GateOut = j.GateOutDate?.ToString("dd/MM/yyyy HH:mm"),
                        DwellDays = Math.Round(dwellDays, 1),
                        EmrCost = estimatesByJob.TryGetValue(j.JobNo, out var est) ? est : 0,
                        LiftFee = liftFeeByJob.TryGetValue(j.ContainerNo, out var lift) ? lift : 0,
                        Status = j.Status,
                        Grade = surveysByJob.TryGetValue(j.JobNo, out var grade) ? grade : null
                    };
                })
                .ToList();
        }

        private async Task<List<BlockCapacityDto>> BuildBlockCapacityAsync(List<DepotJob> activeJobs)
        {
            var blocks = await db.YardBlockLayouts.AsNoTracking().ToListAsync();
            var countByBlock = activeJobs.GroupBy(j => j.BlockCode).ToDictionary(g => g.Key, g => g.Count());
            return blocks.Select(b =>
            {
                var occupied = countByBlock.TryGetValue(b.Code, out var c) ? c : 0;
                var capacity = b.BayCount * b.RowCount * b.MaxTier;
                return new BlockCapacityDto
                {
                    BlockCode = b.Code,
                    OccupiedCount = occupied,
                    TotalCapacity = capacity,
                    OccupancyPercent = capacity > 0 ? Math.Round((double)occupied / capacity * 100, 1) : 0
                };
            }).ToList();
        }

        private async Task<List<GradeDistributionDto>> BuildGradeDistributionAsync()
        {
            var ratings = await db.Surveys.AsNoTracking().Select(x => x.ConditionRating).ToListAsync();
            var total = ratings.Count;
            if (total == 0) return new List<GradeDistributionDto>();

            return ratings
                .GroupBy(r => r)
                .Select(g => new GradeDistributionDto
                {
                    Grade = g.Key,
                    Count = g.Count(),
                    Percent = Math.Round((double)g.Count() / total * 100, 1)
                })
                .OrderByDescending(x => x.Count)
                .ToList();
        }

        private async Task<List<RevenueCategoryDto>> BuildRevenueBreakdownAsync()
        {
            var items = await db.ServiceOrderItems.AsNoTracking().ToListAsync();
            if (items.Count == 0) return new List<RevenueCategoryDto>();

            return items
                .GroupBy(x => string.IsNullOrWhiteSpace(x.Category) ? "OTHER" : x.Category)
                .Select(g => new RevenueCategoryDto { Category = g.Key, Amount = g.Sum(x => x.Total) })
                .OrderByDescending(x => x.Amount)
                .ToList();
        }

        public async Task<List<StaffRealtimeItemDto>> GetStaffRealtimeAsync()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var containerByJobNo = await db.DepotJobs.AsNoTracking().ToDictionaryAsync(x => x.JobNo, x => x.ContainerNo);
            var result = new List<StaffRealtimeItemDto>();

            result.AddRange(await BuildSurveyStaffAsync(today, containerByJobNo));
            result.AddRange(await BuildRepairStaffAsync(now, today, containerByJobNo));
            result.AddRange(await BuildQcStaffAsync(today, containerByJobNo));
            result.AddRange(await BuildCleaningStaffAsync(now, today));
            result.AddRange(await BuildForkliftStaffAsync(now, today));
            result.AddRange(await BuildWarehouseStaffAsync(today));

            return result;
        }

        private async Task<List<StaffRealtimeItemDto>> BuildSurveyStaffAsync(DateTime today, Dictionary<string, string> containerByJobNo)
        {
            var surveys = await db.Surveys.AsNoTracking()
                .Where(x => !string.IsNullOrWhiteSpace(x.SurveyorName))
                .ToListAsync();

            return surveys.GroupBy(x => x.SurveyorName).Select(g =>
            {
                var todayItems = g.Where(x => x.SurveyDate.Date == today).OrderByDescending(x => x.SurveyDate).ToList();
                return new StaffRealtimeItemDto
                {
                    Id = $"survey-{g.Key}",
                    Name = g.Key,
                    Department = "SURVEY",
                    DepartmentName = "Tổ Giám Định (Survey)",
                    Status = "AVAILABLE",
                    CurrentTask = null,
                    AssignedToday = todayItems.Count,
                    CompletedToday = todayItems.Count,
                    PendingToday = 0,
                    InProgressToday = 0,
                    TodayActivityLogs = todayItems.Take(5).Select(s => new StaffActivityLogDto
                    {
                        Id = s.Id.ToString(),
                        Time = s.SurveyDate.ToString("HH:mm"),
                        Action = $"Giám định container, xếp hạng {s.ConditionRating}",
                        ContainerNo = containerByJobNo.TryGetValue(s.JobNo, out var c) ? c : s.JobNo,
                        Location = "Khu Vực Giám Định Gate-In",
                        Status = "COMPLETED",
                        Note = s.OverallNotes ?? string.Empty
                    }).ToList()
                };
            }).ToList();
        }

        private async Task<List<StaffRealtimeItemDto>> BuildRepairStaffAsync(DateTime now, DateTime today, Dictionary<string, string> containerByJobNo)
        {
            var orders = await db.RepairOrders.AsNoTracking()
                .Where(x => !string.IsNullOrWhiteSpace(x.TechnicianName))
                .ToListAsync();

            return orders.GroupBy(x => x.TechnicianName).Select(g =>
            {
                var list = g.ToList();
                var inProgress = list.Where(x => x.StartedAt != null && x.CompletedAt == null)
                    .OrderByDescending(x => x.StartedAt).FirstOrDefault();
                var completedToday = list.Where(x => x.CompletedAt.HasValue && x.CompletedAt.Value.Date == today).ToList();
                var startedToday = list.Where(x => x.StartedAt.HasValue && x.StartedAt.Value.Date == today).ToList();
                var pendingToday = list.Count(x => x.StartedAt == null && x.CreatedAt.Date == today);
                var completedAll = list.Where(x => x.StartedAt.HasValue && x.CompletedAt.HasValue).ToList();
                var passCount = completedAll.Count(x => x.QcStatus == "PASSED");

                StaffCurrentTaskDto? currentTask = null;
                if (inProgress != null)
                {
                    currentTask = new StaffCurrentTaskDto
                    {
                        TaskName = "Đang sửa chữa container theo Lệnh Sửa Chữa (WO)",
                        ContainerNo = containerByJobNo.TryGetValue(inProgress.JobNo, out var c) ? c : inProgress.JobNo,
                        Location = "Xưởng Sửa Chữa EMR",
                        StartedAt = inProgress.StartedAt!.Value.ToString("HH:mm"),
                        ElapsedMinutes = (int)(now - inProgress.StartedAt!.Value).TotalMinutes
                    };
                }

                return new StaffRealtimeItemDto
                {
                    Id = $"repair-{g.Key}",
                    Name = g.Key,
                    Department = "REPAIR_WELDING",
                    DepartmentName = "Tổ Thợ Sửa Chữa EMR",
                    Status = currentTask != null ? "BUSY" : "AVAILABLE",
                    CurrentTask = currentTask,
                    AssignedToday = startedToday.Count + pendingToday,
                    CompletedToday = completedToday.Count,
                    PendingToday = pendingToday,
                    InProgressToday = currentTask != null ? 1 : 0,
                    AvgMinutesPerContainer = completedAll.Count > 0
                        ? Math.Round(completedAll.Average(x => (x.CompletedAt!.Value - x.StartedAt!.Value).TotalMinutes), 1)
                        : null,
                    FirstPassYieldPercent = completedAll.Count > 0
                        ? Math.Round((double)passCount / completedAll.Count * 100, 1)
                        : null,
                    TodayActivityLogs = completedToday.Concat(startedToday).Distinct()
                        .OrderByDescending(x => x.CompletedAt ?? x.StartedAt)
                        .Take(5)
                        .Select(o => new StaffActivityLogDto
                        {
                            Id = o.Id.ToString(),
                            Time = (o.CompletedAt ?? o.StartedAt ?? o.CreatedAt).ToString("HH:mm"),
                            Action = o.CompletedAt.HasValue ? $"Hoàn tất sửa chữa (QC: {o.QcStatus})" : "Bắt đầu sửa chữa",
                            ContainerNo = containerByJobNo.TryGetValue(o.JobNo, out var c2) ? c2 : o.JobNo,
                            Location = "Xưởng Sửa Chữa EMR",
                            Status = o.CompletedAt.HasValue ? "COMPLETED" : "IN_PROGRESS",
                            Note = o.QcNotes ?? string.Empty
                        }).ToList()
                };
            }).ToList();
        }

        private async Task<List<StaffRealtimeItemDto>> BuildQcStaffAsync(DateTime today, Dictionary<string, string> containerByJobNo)
        {
            var orders = await db.RepairOrders.AsNoTracking()
                .Where(x => !string.IsNullOrWhiteSpace(x.InspectorName))
                .ToListAsync();

            return orders.GroupBy(x => x.InspectorName).Select(g =>
            {
                var list = g.ToList();
                var completedToday = list.Where(x => x.CompletedAt.HasValue && x.CompletedAt.Value.Date == today).ToList();
                var passCount = list.Count(x => x.QcStatus == "PASSED");

                return new StaffRealtimeItemDto
                {
                    Id = $"qc-{g.Key}",
                    Name = g.Key,
                    Department = "QC",
                    DepartmentName = "Tổ KCS Nghiệm Thu",
                    Status = "AVAILABLE",
                    CurrentTask = null,
                    AssignedToday = completedToday.Count,
                    CompletedToday = completedToday.Count,
                    PendingToday = 0,
                    InProgressToday = 0,
                    FirstPassYieldPercent = list.Count > 0 ? Math.Round((double)passCount / list.Count * 100, 1) : null,
                    TodayActivityLogs = completedToday.Take(5).Select(o => new StaffActivityLogDto
                    {
                        Id = o.Id.ToString(),
                        Time = o.CompletedAt!.Value.ToString("HH:mm"),
                        Action = $"Nghiệm thu QC {(o.QcStatus == "PASSED" ? "ĐẠT" : "KHÔNG ĐẠT")}",
                        ContainerNo = containerByJobNo.TryGetValue(o.JobNo, out var c) ? c : o.JobNo,
                        Location = "Khu QC Nghiệm Thu",
                        Status = "COMPLETED",
                        Note = o.QcNotes ?? string.Empty
                    }).ToList()
                };
            }).ToList();
        }

        private async Task<List<StaffRealtimeItemDto>> BuildCleaningStaffAsync(DateTime now, DateTime today)
        {
            var records = await db.CleaningRecords.AsNoTracking()
                .Where(x => x.CleaningStaff != null && x.CleaningStaff != "")
                .ToListAsync();

            return records.GroupBy(x => x.CleaningStaff!).Select(g =>
            {
                var list = g.ToList();
                var inProgress = list.Where(x => x.Status is "PENDING_CLEANING" or "IN_CLEANING")
                    .OrderByDescending(x => x.StartedAt ?? x.CreatedAt).FirstOrDefault();
                var completedToday = list.Where(x => x.Status == "HANDOVER_TO_OPERATION" && x.CompletedAt.HasValue && x.CompletedAt.Value.Date == today).ToList();
                var pendingToday = list.Count(x => x.Status is "PENDING_CLEANING" or "IN_CLEANING" && x.CreatedAt.Date == today);
                var completedAll = list.Where(x => x.Status == "HANDOVER_TO_OPERATION" && x.CompletedAt.HasValue).ToList();
                var avgMinutes = completedAll.Count > 0
                    ? (double?)Math.Round(completedAll.Average(x => (x.CompletedAt!.Value - (x.StartedAt ?? x.CreatedAt)).TotalMinutes), 1)
                    : null;

                StaffCurrentTaskDto? currentTask = null;
                if (inProgress != null)
                {
                    var startedAt = inProgress.StartedAt ?? inProgress.CreatedAt;
                    currentTask = new StaffCurrentTaskDto
                    {
                        TaskName = "Đang vệ sinh container tại bệ rửa",
                        ContainerNo = inProgress.ContainerNo,
                        Location = inProgress.CleaningBay ?? "Khu Vực Vệ Sinh",
                        StartedAt = startedAt.ToString("HH:mm"),
                        ElapsedMinutes = (int)(now - startedAt).TotalMinutes
                    };
                }

                return new StaffRealtimeItemDto
                {
                    Id = $"cleaning-{g.Key}",
                    Name = g.Key,
                    Department = "CLEANING",
                    DepartmentName = "Tổ Vệ Sinh Container",
                    Status = currentTask != null ? "BUSY" : "AVAILABLE",
                    CurrentTask = currentTask,
                    AssignedToday = pendingToday + completedToday.Count,
                    CompletedToday = completedToday.Count,
                    PendingToday = pendingToday,
                    InProgressToday = currentTask != null ? 1 : 0,
                    AvgMinutesPerContainer = avgMinutes,
                    TodayActivityLogs = completedToday.Take(5).Select(r => new StaffActivityLogDto
                    {
                        Id = r.Id.ToString(),
                        Time = r.CompletedAt!.Value.ToString("HH:mm"),
                        Action = "Hoàn tất vệ sinh, bàn giao Khai Thác",
                        ContainerNo = r.ContainerNo,
                        Location = r.CleaningBay ?? "Khu Vực Vệ Sinh",
                        Status = "COMPLETED",
                        Note = r.CleaningNotes ?? string.Empty
                    }).ToList()
                };
            }).ToList();
        }

        private async Task<List<StaffRealtimeItemDto>> BuildForkliftStaffAsync(DateTime now, DateTime today)
        {
            var dispatches = await db.ForkliftDispatches.AsNoTracking()
                .Where(x => x.DriverName != null && x.DriverName != "")
                .ToListAsync();

            return dispatches.GroupBy(x => x.DriverName!).Select(g =>
            {
                var list = g.ToList();
                var inProgress = list.Where(x => x.Status == "MOVING").OrderByDescending(x => x.DispatchedAt).FirstOrDefault();
                var todayItems = list.Where(x => x.DispatchedAt.Date == today).ToList();
                var completedToday = todayItems.Count(x => x.Status == "COMPLETED");

                StaffCurrentTaskDto? currentTask = null;
                if (inProgress != null)
                {
                    currentTask = new StaffCurrentTaskDto
                    {
                        TaskName = $"Đảo chuyển container tới {inProgress.ToLocation}",
                        ContainerNo = inProgress.ContainerNo,
                        Location = inProgress.FromLocation ?? "Bãi Container",
                        StartedAt = inProgress.DispatchedAt.ToString("HH:mm"),
                        ElapsedMinutes = (int)(now - inProgress.DispatchedAt).TotalMinutes
                    };
                }

                return new StaffRealtimeItemDto
                {
                    Id = $"forklift-{g.Key}",
                    Name = g.Key,
                    Department = "FORKLIFT",
                    DepartmentName = "Tổ Lái Xe Nâng Bãi",
                    Status = currentTask != null ? "BUSY" : "AVAILABLE",
                    CurrentTask = currentTask,
                    AssignedToday = todayItems.Count,
                    CompletedToday = completedToday,
                    PendingToday = todayItems.Count(x => x.Status == "MOVING"),
                    InProgressToday = currentTask != null ? 1 : 0,
                    TodayActivityLogs = todayItems.Take(5).Select(d => new StaffActivityLogDto
                    {
                        Id = d.Id.ToString(),
                        Time = d.DispatchedAt.ToString("HH:mm"),
                        Action = $"Điều xe nâng {(d.Status == "COMPLETED" ? "hoàn tất" : "đang thực hiện")}",
                        ContainerNo = d.ContainerNo,
                        Location = d.ToLocation,
                        Status = d.Status == "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
                        Note = string.Empty
                    }).ToList()
                };
            }).ToList();
        }

        private async Task<List<StaffRealtimeItemDto>> BuildWarehouseStaffAsync(DateTime today)
        {
            var transactions = await db.MaterialStockTransactions.AsNoTracking()
                .Where(x => x.PerformedBy != null && x.PerformedBy != "" && x.PerformedBy != "System")
                .ToListAsync();

            return transactions.GroupBy(x => x.PerformedBy).Select(g =>
            {
                var todayItems = g.Where(x => x.PerformedAt.Date == today).OrderByDescending(x => x.PerformedAt).ToList();
                return new StaffRealtimeItemDto
                {
                    Id = $"warehouse-{g.Key}",
                    Name = g.Key,
                    Department = "WAREHOUSE",
                    DepartmentName = "Kho Vật Tư Sửa Chữa EMR",
                    Status = "AVAILABLE",
                    CurrentTask = null,
                    AssignedToday = todayItems.Count,
                    CompletedToday = todayItems.Count,
                    PendingToday = 0,
                    InProgressToday = 0,
                    TodayActivityLogs = todayItems.Take(5).Select(t => new StaffActivityLogDto
                    {
                        Id = t.Id.ToString(),
                        Time = t.PerformedAt.ToString("HH:mm"),
                        Action = t.TransactionType == "RECEIPT" ? "Nhập kho vật tư" : t.TransactionType == "ISSUE" ? "Xuất kho vật tư" : $"Giao dịch kho ({t.TransactionType})",
                        ContainerNo = t.ContainerNo ?? t.MaterialCode,
                        Location = "Kho Vật Tư EMR",
                        Status = "COMPLETED",
                        Note = t.Note ?? string.Empty
                    }).ToList()
                };
            }).ToList();
        }
    }
}
