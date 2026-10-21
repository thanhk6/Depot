using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Finance;
using Depot.Data.Entities.System;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Công nợ hãng tàu cho sửa chữa (depot-fullstack-shipping-line-ar-fix):
    /// - ghi nợ khi báo giá đã ghi nhận hãng duyệt + lệnh sửa chữa QC đạt, số tiền = số tiền hãng duyệt (nhập tay ở bước duyệt);
    /// - kỳ công nợ theo tháng lịch Việt Nam, mỗi hãng mỗi tháng 1 kỳ; nợ / thu vào kỳ theo ngày của nó;
    /// - server kiểm tra thu / phân bổ / huỷ / hoá đơn; người thao tác = tài khoản đăng nhập; mỗi thao tác ghi nhật ký.
    /// Ngày nợ / hạn / ngày thu / ngày kỳ lưu dạng ngày lịch Việt Nam (00:00, Kind = Utc) để màn hình hiện đúng ngày.
    /// </summary>
    public sealed class BillingService : IBillingService
    {
        private readonly DepotDbContext db;
        public BillingService(DepotDbContext db) => this.db = db;

        private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
        private const int PaymentTermDays = 30;

        /// <summary>Ngày lịch Việt Nam của 1 thời điểm UTC, trả về dạng 00:00 Kind=Utc.</summary>
        private static DateTime VnDate(DateTime utc) =>
            DateTime.SpecifyKind(TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), VietnamTimeZone).Date, DateTimeKind.Utc);
        private static DateTime VnToday() => VnDate(DateTime.UtcNow);
        /// <summary>Ngày client gửi (vd "2026-10-21") là ngày lịch Việt Nam; giá trị có giờ UTC thì quy về ngày Việt Nam.</summary>
        private static DateTime ClientDate(DateTime value) =>
            value.Kind == DateTimeKind.Utc && value.TimeOfDay != TimeSpan.Zero ? VnDate(value) : DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
        private static DateTime MonthStart(DateTime vnDate) => DateTime.SpecifyKind(new DateTime(vnDate.Year, vnDate.Month, 1), DateTimeKind.Utc);
        private static string Actor(string? actor) => string.IsNullOrWhiteSpace(actor) ? "unknown" : actor.Trim();

        public async Task<List<ShippingLineDebt>> GetDebtsAsync(string? shippingLineCode = null, string? status = null)
        {
            var query = db.ShippingLineDebts.AsNoTracking().Where(x => !x.IsDeleted);
            if (!string.IsNullOrWhiteSpace(shippingLineCode)) query = query.Where(x => x.ShippingLineCode == shippingLineCode);
            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(x => x.Status == status);
            return await query.OrderByDescending(x => x.DebtDate).ToListAsync();
        }

        public async Task<List<DebtPeriod>> GetPeriodsAsync(string? shippingLineCode = null)
        {
            var query = db.DebtPeriods.AsNoTracking().Where(x => !x.IsDeleted);
            if (!string.IsNullOrWhiteSpace(shippingLineCode)) query = query.Where(x => x.ShippingLineCode == shippingLineCode);
            return await query.OrderByDescending(x => x.FromDate).ToListAsync();
        }

        public async Task<List<ArPayment>> GetPaymentsAsync(string? shippingLineCode = null)
        {
            var query = db.ArPayments.AsNoTracking().Include(x => x.Allocations).Where(x => !x.IsDeleted);
            if (!string.IsNullOrWhiteSpace(shippingLineCode)) query = query.Where(x => x.ShippingLineCode == shippingLineCode);
            return await query.OrderByDescending(x => x.PaymentDate).ToListAsync();
        }

        // ---------- Đồng bộ công nợ ----------

        public async Task<List<DebtSyncCandidateDto>> GetSyncCandidatesAsync()
        {
            var debtJobNos = (await db.ShippingLineDebts.AsNoTracking()
                .Where(x => !x.IsDeleted && x.Status != "CANCELLED").Select(x => x.JobNo).ToListAsync()).ToHashSet();

            // Mỗi hồ sơ: báo giá đã duyệt mới nhất + lệnh sửa chữa mới nhất (hồ sơ có thể có nhiều báo giá / lệnh).
            var estimates = (await db.Estimates.AsNoTracking().Where(x => x.Status == "APPROVED" && !x.IsDeleted).ToListAsync())
                .GroupBy(e => e.DepotJobId).Select(g => g.OrderByDescending(e => e.Id).First()).ToList();
            var jobIds = estimates.Select(e => e.DepotJobId).Distinct().ToList();
            var repairOrders = (await db.RepairOrders.AsNoTracking().Where(r => jobIds.Contains(r.DepotJobId) && !r.IsDeleted).ToListAsync())
                .GroupBy(r => r.DepotJobId).ToDictionary(g => g.Key, g => g.OrderByDescending(r => r.Id).First());
            var jobs = await db.DepotJobs.AsNoTracking().Where(j => jobIds.Contains(j.Id)).ToDictionaryAsync(j => j.Id);
            var shippingLineIds = jobs.Values.Select(j => j.ShippingLineId).Distinct().ToList();
            var shippingLines = await db.ShippingLines.AsNoTracking().Where(s => shippingLineIds.Contains(s.Id)).ToDictionaryAsync(s => s.Id);

            var result = new List<DebtSyncCandidateDto>();
            foreach (var e in estimates)
            {
                if (debtJobNos.Contains(e.JobNo) || !jobs.TryGetValue(e.DepotJobId, out var job)) continue;
                // Ghi nợ chỉ sau QC đạt (QcStatus = PASSED, CompletedAt = lúc QC).
                if (!repairOrders.TryGetValue(e.DepotJobId, out var ro) || ro.QcStatus != "PASSED" || ro.CompletedAt == null) continue;
                var line = shippingLines.GetValueOrDefault(job.ShippingLineId);
                if (line == null) continue;
                result.Add(new DebtSyncCandidateDto
                {
                    DepotJobId = job.Id,
                    JobNo = e.JobNo,
                    ContainerNo = job.ContainerNo,
                    ShippingLineCode = line.Code,
                    ShippingLineName = line.Name,
                    QuotationNo = e.EstimateNo,
                    RepairNo = e.JobNo,
                    CompletedDate = VnDate(ro.CompletedAt.Value),
                    Description = $"Sửa chữa container {job.ContainerNo} theo báo giá {e.EstimateNo}",
                    // Số tiền hãng duyệt (nhập tay ở bước Ghi nhận hãng tàu duyệt; mặc định = tổng báo giá).
                    Amount = e.ApprovedAmount ?? e.GrandTotal,
                    QuotationTotal = e.GrandTotal,
                    ApprovalRef = !string.IsNullOrWhiteSpace(e.CarrierAuthCode) ? e.CarrierAuthCode
                        : !string.IsNullOrWhiteSpace(e.CarrierWorkOrderNo) ? e.CarrierWorkOrderNo : null
                });
            }
            return result.OrderBy(c => c.CompletedDate).ToList();
        }

        public async Task<List<ShippingLineDebt>> SyncDebtsAsync(SyncDebtsRequest request, string actor)
        {
            var by = Actor(actor);
            var wanted = (request.JobNos ?? new()).Select(x => x.Trim()).ToHashSet();
            var toSync = (await GetSyncCandidatesAsync()).Where(c => wanted.Contains(c.JobNo)).ToList();
            var created = new List<ShippingLineDebt>();
            if (toSync.Count == 0) return created;

            var now = DateTime.UtcNow;
            var today = VnToday();
            await using var tx = await db.Database.BeginTransactionAsync();
            var seq = 0;
            foreach (var c in toSync)
            {
                var period = await GetOrCreatePeriodAsync(c.ShippingLineCode, c.ShippingLineName, c.CompletedDate);
                string? note = null;
                if (period.Status == "CLOSED")
                {
                    // Kỳ của tháng QC đạt đã khoá → ghi vào kỳ tháng hiện tại.
                    note = $"Kỳ {period.PeriodCode} đã khoá sổ — ghi vào kỳ tháng hiện tại.";
                    period = await GetOrCreatePeriodAsync(c.ShippingLineCode, c.ShippingLineName, today);
                    if (period.Status == "CLOSED") throw new InvalidOperationException($"Kỳ công nợ {period.PeriodCode} của {c.ShippingLineCode} đã khoá sổ.");
                }

                var debt = new ShippingLineDebt
                {
                    Code = $"DEBT-{now:yyyyMMddHHmmss}-{++seq:D2}{Random.Shared.Next(10, 99)}",
                    ShippingLineCode = c.ShippingLineCode,
                    ShippingLineName = c.ShippingLineName,
                    JobNo = c.JobNo,
                    ContainerNo = c.ContainerNo,
                    QuotationNo = c.QuotationNo,
                    RepairNo = c.RepairNo,
                    DebtPeriodCode = period.Code,
                    DebtDate = c.CompletedDate,
                    DueDate = c.CompletedDate.AddDays(PaymentTermDays),
                    ServiceType = "REPAIR",
                    Description = c.Description,
                    TotalAmountVnd = c.Amount,
                    PaidAmountVnd = 0,
                    RemainingAmountVnd = c.Amount,
                    Status = "UNPAID",
                    ApprovalRef = c.ApprovalRef,
                    Notes = "Đồng bộ từ báo giá đã duyệt (số tiền hãng duyệt) + QC đạt." + (note == null ? string.Empty : " " + note)
                };
                db.ShippingLineDebts.Add(debt);
                created.Add(debt);
                period.PeriodDebitVnd += c.Amount;
                AddJobAudit(c.DepotJobId, c.JobNo, "DEBT_SYNCED", by,
                    $"Ghi công nợ hãng {c.ShippingLineCode} {c.Amount:#,##0.##} đ (báo giá {c.QuotationNo}, mã duyệt {c.ApprovalRef ?? "—"}), kỳ {period.PeriodCode}, hạn {debt.DueDate:dd/MM/yyyy}.");
            }
            foreach (var line in toSync.Select(c => c.ShippingLineCode).Distinct()) await RecalculateBalancesAsync(line);
            await db.SaveChangesAsync();
            await tx.CommitAsync();
            return created;
        }

        // ---------- Kỳ công nợ theo tháng ----------

        /// <summary>Kỳ của hãng cho tháng chứa ngày vnDate (ngày lịch Việt Nam); thiếu thì tạo (chưa lưu).</summary>
        private async Task<DebtPeriod> GetOrCreatePeriodAsync(string shippingLineCode, string shippingLineName, DateTime vnDate)
        {
            var from = MonthStart(vnDate);
            var code = $"{shippingLineCode}-{from:yyyyMM}";
            var period = db.DebtPeriods.Local.FirstOrDefault(x => x.Code == code)
                ?? await db.DebtPeriods.FirstOrDefaultAsync(x => x.Code == code);
            if (period != null) return period;
            period = new DebtPeriod
            {
                Code = code,
                ShippingLineCode = shippingLineCode,
                ShippingLineName = shippingLineName,
                PeriodCode = $"{from:yyyy-MM}",
                FromDate = from,
                ToDate = from.AddMonths(1).AddDays(-1),
                Status = "OPEN"
            };
            db.DebtPeriods.Add(period);
            return period;
        }

        /// <summary>Đầu kỳ = cuối kỳ trước của hãng (kỳ đầu = 0), cuối kỳ = đầu + nợ − thu; kỳ đã khoá giữ nguyên.</summary>
        private async Task RecalculateBalancesAsync(string shippingLineCode)
        {
            await db.DebtPeriods.Where(x => x.ShippingLineCode == shippingLineCode && !x.IsDeleted).LoadAsync();
            DebtPeriod? prev = null;
            foreach (var p in db.DebtPeriods.Local.Where(x => x.ShippingLineCode == shippingLineCode && !x.IsDeleted).OrderBy(x => x.FromDate))
            {
                if (p.Status != "CLOSED")
                {
                    p.OpeningBalanceVnd = prev?.ClosingBalanceVnd ?? 0;
                    p.ClosingBalanceVnd = p.OpeningBalanceVnd + p.PeriodDebitVnd - p.PeriodCreditVnd;
                }
                prev = p;
            }
        }

        public async Task<ApiResult<DebtPeriod>> ClosePeriodAsync(string periodCode, ClosePeriodRequest request, string actor)
        {
            var by = Actor(actor);
            var period = await db.DebtPeriods.FirstOrDefaultAsync(x => x.Code == periodCode && !x.IsDeleted);
            if (period == null) return ApiResult<DebtPeriod>.Failure("Không tìm thấy kỳ công nợ.");
            if (period.Status == "CLOSED") return ApiResult<DebtPeriod>.Failure("Kỳ công nợ đã được khoá sổ trước đó.");
            if (VnToday() <= period.ToDate)
                return ApiResult<DebtPeriod>.Failure($"Kỳ {period.PeriodCode} chưa kết thúc (đến hết ngày {period.ToDate:dd/MM/yyyy}) — chưa khoá sổ được.");
            var older = await db.DebtPeriods.AsNoTracking()
                .Where(x => x.ShippingLineCode == period.ShippingLineCode && !x.IsDeleted && x.Status != "CLOSED" && x.FromDate < period.FromDate)
                .OrderBy(x => x.FromDate).Select(x => x.PeriodCode).FirstOrDefaultAsync();
            if (older != null) return ApiResult<DebtPeriod>.Failure($"Phải khoá sổ kỳ cũ hơn {older} trước.");

            var now = DateTime.UtcNow;
            await using var tx = await db.Database.BeginTransactionAsync();
            await RecalculateBalancesAsync(period.ShippingLineCode);
            await db.SaveChangesAsync();
            // Chốt CLOSED bằng UPDATE có điều kiện — 2 request khoá cùng lúc chỉ 1 request thắng.
            var claimed = await db.DebtPeriods
                .Where(x => x.Code == periodCode && x.Status != "CLOSED")
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Status, "CLOSED")
                    .SetProperty(x => x.ClosedAt, now)
                    .SetProperty(x => x.ClosedBy, by)
                    .SetProperty(x => x.ClosingNotes, request.ClosingNotes));
            if (claimed == 0)
            {
                await tx.RollbackAsync();
                return ApiResult<DebtPeriod>.Failure("Kỳ công nợ đã được khoá sổ trước đó.");
            }
            db.SystemAuditLogs.Add(new SystemAuditLog
            {
                Code = "AUD-" + now.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999),
                Action = "AR_PERIOD_CLOSED",
                ActionLabel = "Khoá sổ kỳ công nợ hãng tàu",
                TargetResource = $"Kỳ công nợ {period.Code}",
                Details = $"Khoá sổ kỳ {period.PeriodCode} hãng {period.ShippingLineCode}: đầu kỳ {period.OpeningBalanceVnd:#,##0.##}, nợ {period.PeriodDebitVnd:#,##0.##}, thu {period.PeriodCreditVnd:#,##0.##}, cuối kỳ {period.ClosingBalanceVnd:#,##0.##} đ.",
                PerformedByName = by,
                Status = "SUCCESS",
                OccurredAt = now
            });
            await db.SaveChangesAsync();
            await tx.CommitAsync();

            period.Status = "CLOSED"; period.ClosedAt = now; period.ClosedBy = by; period.ClosingNotes = request.ClosingNotes;
            return ApiResult<DebtPeriod>.Success(period,
                $"Đã khoá sổ kỳ {period.PeriodCode}! Số dư cuối kỳ {period.ClosingBalanceVnd:N0} đ chuyển làm đầu kỳ tháng sau.");
        }

        // ---------- Thu tiền ----------

        public async Task<ApiResult<ArPayment>> RecordPaymentAsync(RecordArPaymentRequest request, string actor)
        {
            var by = Actor(actor);
            var lineCode = (request.ShippingLineCode ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(lineCode)) return ApiResult<ArPayment>.Failure("Thiếu hãng tàu của khoản thu.");
            if (request.PaymentAmount <= 0) return ApiResult<ArPayment>.Failure("Số tiền thu phải lớn hơn 0.");
            var allocations = request.Allocations ?? new();
            if (allocations.Count == 0) return ApiResult<ArPayment>.Failure("Cần phân bổ khoản thanh toán cho ít nhất 1 công nợ.");
            if (allocations.Any(a => a.Amount <= 0)) return ApiResult<ArPayment>.Failure("Số tiền phân bổ cho từng container phải lớn hơn 0.");
            if (allocations.Select(a => a.DebtCode).Distinct().Count() != allocations.Count) return ApiResult<ArPayment>.Failure("Một khoản công nợ bị phân bổ hai lần.");
            var totalAllocated = allocations.Sum(a => a.Amount);
            if (totalAllocated != request.PaymentAmount)
                return ApiResult<ArPayment>.Failure($"Tổng phân bổ {totalAllocated:N0} đ khác số tiền thu {request.PaymentAmount:N0} đ.");
            var paymentDate = ClientDate(request.PaymentDate);
            if (paymentDate > VnToday()) return ApiResult<ArPayment>.Failure("Ngày thu không được ở tương lai.");

            var debtCodes = allocations.Select(a => a.DebtCode).ToList();
            var debts = await db.ShippingLineDebts.Where(x => debtCodes.Contains(x.Code) && !x.IsDeleted).ToListAsync();
            if (debts.Count != debtCodes.Count) return ApiResult<ArPayment>.Failure("Có khoản công nợ không tồn tại trong danh sách phân bổ.");
            foreach (var a in allocations)
            {
                var d = debts.First(x => x.Code == a.DebtCode);
                if (d.ShippingLineCode != lineCode) return ApiResult<ArPayment>.Failure($"Khoản nợ {d.ContainerNo} thuộc hãng {d.ShippingLineCode}, không phải {lineCode}.");
                if (d.Status is "PAID" or "CANCELLED" || d.RemainingAmountVnd <= 0) return ApiResult<ArPayment>.Failure($"Khoản nợ {d.ContainerNo} đã thu đủ hoặc đã huỷ.");
                if (a.Amount > d.RemainingAmountVnd) return ApiResult<ArPayment>.Failure($"Phân bổ {a.Amount:N0} đ cho {d.ContainerNo} vượt số nợ còn lại {d.RemainingAmountVnd:N0} đ.");
            }

            var lineName = debts[0].ShippingLineName;
            await using var tx = await db.Database.BeginTransactionAsync();
            var period = await GetOrCreatePeriodAsync(lineCode, lineName, paymentDate);
            if (period.Status == "CLOSED") return ApiResult<ArPayment>.Failure($"Kỳ công nợ {period.PeriodCode} đã khoá sổ — không ghi thu vào kỳ này.");

            var now = DateTime.UtcNow;
            var payment = new ArPayment
            {
                Code = "PAY-" + now.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999),
                ShippingLineCode = lineCode,
                ShippingLineName = lineName,
                PaymentDate = paymentDate,
                PaymentAmountVnd = request.PaymentAmount,
                PaymentMethod = request.PaymentMethod,
                BankName = request.BankName,
                ReferenceNo = request.ReferenceNo,
                Status = "CONFIRMED",
                Notes = request.Notes,
                RecordedBy = by
            };
            db.ArPayments.Add(payment);

            var jobIds = await JobIdsAsync(debts.Select(d => d.JobNo));
            var seq = 0;
            foreach (var a in allocations)
            {
                var debt = debts.First(x => x.Code == a.DebtCode);
                debt.PaidAmountVnd += a.Amount;
                debt.RemainingAmountVnd = debt.TotalAmountVnd - debt.PaidAmountVnd;
                debt.Status = debt.RemainingAmountVnd == 0 ? "PAID" : "PARTIAL";
                db.PaymentAllocations.Add(new PaymentAllocation
                {
                    Code = $"ALC-{now:yyyyMMddHHmmss}-{++seq:D2}{Random.Shared.Next(10, 99)}",
                    ArPaymentCode = payment.Code,
                    ShippingLineDebtCode = debt.Code,
                    ContainerNo = debt.ContainerNo,
                    QuotationNo = debt.QuotationNo,
                    AllocatedAmountVnd = a.Amount
                });
                AddJobAudit(jobIds.GetValueOrDefault(debt.JobNo), debt.JobNo, "AR_PAYMENT_RECORDED", by,
                    $"Thu công nợ hãng {lineCode} phiếu {payment.Code} ngày {paymentDate:dd/MM/yyyy}: phân bổ {a.Amount:#,##0.##} đ, còn nợ {debt.RemainingAmountVnd:#,##0.##} đ.");
            }

            period.PeriodCreditVnd += request.PaymentAmount;
            await RecalculateBalancesAsync(lineCode);
            await db.SaveChangesAsync();
            await tx.CommitAsync();
            return ApiResult<ArPayment>.Success(payment,
                $"Đã ghi nhận thanh toán {request.PaymentAmount:N0} đ và phân bổ thành công cho {allocations.Count} container!");
        }

        public async Task<ApiResult<ArPayment>> ReversePaymentAsync(string paymentCode, ReverseArPaymentRequest request, string actor)
        {
            var by = Actor(actor);
            if (string.IsNullOrWhiteSpace(request.Reason)) return ApiResult<ArPayment>.Failure("Phải nhập lý do huỷ thanh toán.");
            var payment = await db.ArPayments.Include(x => x.Allocations).FirstOrDefaultAsync(x => x.Code == paymentCode && !x.IsDeleted);
            if (payment == null) return ApiResult<ArPayment>.Failure("Không tìm thấy khoản thanh toán.");
            if (payment.Status == "REVERSED") return ApiResult<ArPayment>.Failure("Khoản thanh toán này đã bị huỷ trước đó.");

            var period = await GetOrCreatePeriodAsync(payment.ShippingLineCode, payment.ShippingLineName, payment.PaymentDate);
            if (period.Status == "CLOSED")
                return ApiResult<ArPayment>.Failure($"Khoản thu thuộc kỳ {period.PeriodCode} đã khoá sổ — không huỷ được.");

            var now = DateTime.UtcNow;
            await using var tx = await db.Database.BeginTransactionAsync();
            // Chốt REVERSED bằng UPDATE có điều kiện trước khi hoàn nợ — chỉ 1 request huỷ thắng; cùng transaction với hoàn nợ.
            var claimed = await db.ArPayments
                .Where(x => x.Code == paymentCode && x.Status != "REVERSED")
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.Status, "REVERSED")
                    .SetProperty(x => x.ReversedBy, by)
                    .SetProperty(x => x.ReversedAt, now)
                    .SetProperty(x => x.ReversalReason, request.Reason.Trim()));
            if (claimed == 0)
            {
                await tx.RollbackAsync();
                return ApiResult<ArPayment>.Failure("Khoản thanh toán này đã bị huỷ trước đó.");
            }

            var debtCodes = payment.Allocations.Select(a => a.ShippingLineDebtCode).ToList();
            var debts = await db.ShippingLineDebts.Where(x => debtCodes.Contains(x.Code)).ToListAsync();
            var jobIds = await JobIdsAsync(debts.Select(d => d.JobNo));
            foreach (var alloc in payment.Allocations)
            {
                var debt = debts.FirstOrDefault(x => x.Code == alloc.ShippingLineDebtCode);
                if (debt == null) continue;
                debt.PaidAmountVnd = Math.Max(0, debt.PaidAmountVnd - alloc.AllocatedAmountVnd);
                debt.RemainingAmountVnd = debt.TotalAmountVnd - debt.PaidAmountVnd;
                debt.Status = debt.PaidAmountVnd == 0 ? "UNPAID" : debt.RemainingAmountVnd > 0 ? "PARTIAL" : "PAID";
                AddJobAudit(jobIds.GetValueOrDefault(debt.JobNo), debt.JobNo, "AR_PAYMENT_REVERSED", by,
                    $"Huỷ phiếu thu {payment.Code}: hoàn {alloc.AllocatedAmountVnd:#,##0.##} đ, còn nợ {debt.RemainingAmountVnd:#,##0.##} đ. Lý do: {request.Reason.Trim()}");
            }

            period.PeriodCreditVnd = Math.Max(0, period.PeriodCreditVnd - payment.PaymentAmountVnd);
            await RecalculateBalancesAsync(payment.ShippingLineCode);
            payment.Status = "REVERSED"; payment.ReversedBy = by; payment.ReversedAt = now; payment.ReversalReason = request.Reason.Trim();
            await db.SaveChangesAsync();
            await tx.CommitAsync();
            return ApiResult<ArPayment>.Success(payment, $"Đã huỷ khoản thanh toán {payment.Code} thành công.");
        }

        // ---------- Hoá đơn ----------

        public async Task<ShippingLineDebt?> IssueInvoiceAsync(string debtCode, IssueInvoiceRequest request, string actor)
        {
            var by = Actor(actor);
            var invoiceNo = (request.InvoiceNo ?? string.Empty).Trim();
            if (invoiceNo.Length == 0) throw new ArgumentException("Phải nhập số hoá đơn.");
            if (invoiceNo.Length > 50) throw new ArgumentException("Số hoá đơn tối đa 50 ký tự.");
            var debt = await db.ShippingLineDebts.FirstOrDefaultAsync(x => x.Code == debtCode && !x.IsDeleted);
            if (debt == null) return null;
            if (!string.IsNullOrWhiteSpace(debt.InvoiceNo))
                throw new ArgumentException($"Khoản nợ {debt.ContainerNo} đã có hoá đơn {debt.InvoiceNo} — không ghi đè.");
            var otherLine = await db.ShippingLineDebts.AsNoTracking()
                .Where(x => x.InvoiceNo == invoiceNo && !x.IsDeleted && x.ShippingLineCode != debt.ShippingLineCode)
                .Select(x => x.ShippingLineCode).FirstOrDefaultAsync();
            if (otherLine != null) throw new ArgumentException($"Số hoá đơn {invoiceNo} đã dùng cho hãng {otherLine}.");

            debt.InvoiceNo = invoiceNo;
            var jobIds = await JobIdsAsync(new[] { debt.JobNo });
            AddJobAudit(jobIds.GetValueOrDefault(debt.JobNo), debt.JobNo, "DEBT_INVOICE_ISSUED", by,
                $"Gắn hoá đơn {invoiceNo} cho công nợ {debt.Code} ({debt.TotalAmountVnd:#,##0.##} đ, hãng {debt.ShippingLineCode}).");
            await db.SaveChangesAsync();
            return debt;
        }

        // ---------- Tuổi nợ ----------

        public async Task<List<DebtAgingBucketDto>> GetAgingReportAsync()
        {
            var today = VnToday();
            var activeDebts = await db.ShippingLineDebts.AsNoTracking()
                .Where(x => !x.IsDeleted && x.Status != "CANCELLED" && x.RemainingAmountVnd > 0)
                .ToListAsync();

            return activeDebts
                .GroupBy(d => (d.ShippingLineCode, d.ShippingLineName))
                .Select(g =>
                {
                    var bucket = new DebtAgingBucketDto { ShippingLineCode = g.Key.ShippingLineCode, ShippingLineName = g.Key.ShippingLineName };
                    foreach (var d in g)
                    {
                        var daysOverdue = (today - DateTime.SpecifyKind(d.DueDate.Date, DateTimeKind.Utc)).Days;
                        if (daysOverdue <= 0) bucket.BucketNotDue += d.RemainingAmountVnd;
                        else if (daysOverdue <= 30) bucket.Bucket0_30 += d.RemainingAmountVnd;
                        else if (daysOverdue <= 60) bucket.Bucket31_60 += d.RemainingAmountVnd;
                        else if (daysOverdue <= 90) bucket.Bucket61_90 += d.RemainingAmountVnd;
                        else bucket.BucketOver90 += d.RemainingAmountVnd;
                    }
                    bucket.OverdueTotal = bucket.Bucket0_30 + bucket.Bucket31_60 + bucket.Bucket61_90 + bucket.BucketOver90;
                    bucket.TotalReceivable = bucket.BucketNotDue + bucket.OverdueTotal;
                    return bucket;
                })
                .ToList();
        }

        // ---------- Nhật ký ----------

        private async Task<Dictionary<string, long>> JobIdsAsync(IEnumerable<string> jobNos)
        {
            var list = jobNos.Distinct().ToList();
            return (await db.DepotJobs.AsNoTracking().IgnoreQueryFilters().Where(j => list.Contains(j.JobNo))
                .Select(j => new { j.JobNo, j.Id }).ToListAsync())
                .GroupBy(x => x.JobNo).ToDictionary(g => g.Key, g => g.Max(x => x.Id));
        }

        private void AddJobAudit(long jobId, string jobNo, string action, string user, string details) =>
            db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId, JobNo = jobNo, Action = action, User = user,
                Timestamp = DateTime.UtcNow, Details = details.Length > 1000 ? details[..1000] : details
            });
    }
}
