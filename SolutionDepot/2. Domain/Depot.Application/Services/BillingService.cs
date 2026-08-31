using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Finance;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    public sealed class BillingService : IBillingService
    {
        private readonly DepotDbContext db;
        public BillingService(DepotDbContext db) => this.db = db;

        public async Task<List<ShippingLineDebt>> GetDebtsAsync(string? shippingLineCode = null, string? status = null)
        {
            var query = db.ShippingLineDebts.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(shippingLineCode)) query = query.Where(x => x.ShippingLineCode == shippingLineCode);
            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(x => x.Status == status);
            return await query.OrderByDescending(x => x.DebtDate).ToListAsync();
        }

        public async Task<List<DebtPeriod>> GetPeriodsAsync(string? shippingLineCode = null)
        {
            var query = db.DebtPeriods.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(shippingLineCode)) query = query.Where(x => x.ShippingLineCode == shippingLineCode);
            return await query.OrderByDescending(x => x.FromDate).ToListAsync();
        }

        public async Task<List<ArPayment>> GetPaymentsAsync(string? shippingLineCode = null)
        {
            var query = db.ArPayments.AsNoTracking().Include(x => x.Allocations).AsQueryable();
            if (!string.IsNullOrWhiteSpace(shippingLineCode)) query = query.Where(x => x.ShippingLineCode == shippingLineCode);
            return await query.OrderByDescending(x => x.PaymentDate).ToListAsync();
        }

        public async Task<List<DebtSyncCandidateDto>> GetSyncCandidatesAsync()
        {
            var syncedJobNos = await db.ShippingLineDebts.Select(x => x.JobNo).ToListAsync();

            var estimates = await db.Estimates.AsNoTracking()
                .Include(x => x.DepotJob).ThenInclude(j => j!.ShippingLine)
                .Include(x => x.DepotJob).ThenInclude(j => j!.RepairOrder)
                .Where(x => x.Status == "APPROVED" && x.DepotJob != null && x.DepotJob!.RepairOrder != null && x.DepotJob!.RepairOrder!.CompletedAt != null)
                .ToListAsync();

            return estimates
                .Where(e => !syncedJobNos.Contains(e.JobNo))
                .Select(e => new DebtSyncCandidateDto
                {
                    JobNo = e.JobNo,
                    ContainerNo = e.DepotJob!.ContainerNo,
                    ShippingLineCode = e.DepotJob!.ShippingLineCode ?? string.Empty,
                    ShippingLineName = e.DepotJob!.ShippingLine?.Name ?? string.Empty,
                    QuotationNo = e.EstimateNo,
                    RepairNo = e.JobNo,
                    CompletedDate = e.DepotJob!.RepairOrder!.CompletedAt!.Value,
                    Description = $"Sửa chữa container {e.DepotJob!.ContainerNo} theo báo giá {e.EstimateNo}",
                    Amount = e.GrandTotal,
                    ApprovalRef = e.ApprovedBy
                })
                .ToList();
        }

        private async Task<DebtPeriod> GetOrCreateOpenPeriodAsync(string shippingLineCode, string shippingLineName)
        {
            var open = await db.DebtPeriods.FirstOrDefaultAsync(x => x.ShippingLineCode == shippingLineCode && x.Status == "OPEN");
            if (open != null) return open;

            var lastClosed = await db.DebtPeriods
                .Where(x => x.ShippingLineCode == shippingLineCode && x.Status == "CLOSED")
                .OrderByDescending(x => x.ToDate)
                .FirstOrDefaultAsync();

            var from = lastClosed?.ToDate.AddDays(1) ?? DateTime.UtcNow.Date;
            var to = from.AddDays(14);
            var opening = lastClosed?.ClosingBalanceVnd ?? 0;

            var period = new DebtPeriod
            {
                Code = $"{shippingLineCode}-{from:yyyyMMdd}_{to:yyyyMMdd}",
                ShippingLineCode = shippingLineCode,
                ShippingLineName = shippingLineName,
                PeriodCode = $"{from:yyyy-MM-dd}_{to:yyyy-MM-dd}",
                FromDate = from,
                ToDate = to,
                OpeningBalanceVnd = opening,
                PeriodDebitVnd = 0,
                PeriodCreditVnd = 0,
                ClosingBalanceVnd = opening,
                Status = "OPEN"
            };
            db.DebtPeriods.Add(period);
            return period;
        }

        public async Task<List<ShippingLineDebt>> SyncDebtsAsync(SyncDebtsRequest request)
        {
            var candidates = await GetSyncCandidatesAsync();
            var toSync = candidates.Where(c => request.JobNos.Contains(c.JobNo)).ToList();
            var created = new List<ShippingLineDebt>();
            var now = DateTime.UtcNow;

            foreach (var c in toSync)
            {
                var period = await GetOrCreateOpenPeriodAsync(c.ShippingLineCode, c.ShippingLineName);

                var debt = new ShippingLineDebt
                {
                    Code = "DEBT-" + now.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999),
                    ShippingLineCode = c.ShippingLineCode,
                    ShippingLineName = c.ShippingLineName,
                    JobNo = c.JobNo,
                    ContainerNo = c.ContainerNo,
                    QuotationNo = c.QuotationNo,
                    RepairNo = c.RepairNo,
                    DebtPeriodCode = period.Code,
                    DebtDate = c.CompletedDate,
                    DueDate = c.CompletedDate.AddDays(30),
                    ServiceType = "REPAIR",
                    Description = c.Description,
                    TotalAmountVnd = c.Amount,
                    PaidAmountVnd = 0,
                    RemainingAmountVnd = c.Amount,
                    Status = "UNPAID",
                    ApprovalRef = c.ApprovalRef,
                    Notes = "Tự động đồng bộ từ Báo giá đã duyệt & Sửa chữa hoàn thành."
                };
                db.ShippingLineDebts.Add(debt);
                created.Add(debt);

                period.PeriodDebitVnd += c.Amount;
                period.ClosingBalanceVnd = period.OpeningBalanceVnd + period.PeriodDebitVnd - period.PeriodCreditVnd;
            }

            await db.SaveChangesAsync();
            return created;
        }

        public async Task<ShippingLineDebt?> IssueInvoiceAsync(string debtCode, IssueInvoiceRequest request)
        {
            var debt = await db.ShippingLineDebts.FirstOrDefaultAsync(x => x.Code == debtCode);
            if (debt == null) return null;
            debt.InvoiceNo = request.InvoiceNo;
            await db.SaveChangesAsync();
            return debt;
        }

        public async Task<ApiResult<ArPayment>> RecordPaymentAsync(RecordArPaymentRequest request)
        {
            if (request.Allocations.Count == 0)
                return ApiResult<ArPayment>.Failure("Cần phân bổ khoản thanh toán cho ít nhất 1 công nợ.");

            var debtCodes = request.Allocations.Select(a => a.DebtCode).ToList();
            var debts = await db.ShippingLineDebts.Where(x => debtCodes.Contains(x.Code)).ToListAsync();
            if (debts.Count != debtCodes.Distinct().Count())
                return ApiResult<ArPayment>.Failure("Có khoản công nợ không tồn tại trong danh sách phân bổ.");

            var now = DateTime.UtcNow;
            var payment = new ArPayment
            {
                Code = "PAY-" + now.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999),
                ShippingLineCode = request.ShippingLineCode,
                ShippingLineName = debts.FirstOrDefault()?.ShippingLineName ?? request.ShippingLineCode,
                PaymentDate = request.PaymentDate,
                PaymentAmountVnd = request.PaymentAmount,
                PaymentMethod = request.PaymentMethod,
                BankName = request.BankName,
                ReferenceNo = request.ReferenceNo,
                Status = "CONFIRMED",
                Notes = request.Notes,
                RecordedBy = request.RecordedBy
            };
            db.ArPayments.Add(payment);

            foreach (var alloc in request.Allocations)
            {
                var debt = debts.First(x => x.Code == alloc.DebtCode);
                debt.PaidAmountVnd += alloc.Amount;
                debt.RemainingAmountVnd = Math.Max(0, debt.TotalAmountVnd - debt.PaidAmountVnd);
                debt.Status = debt.RemainingAmountVnd == 0 ? "PAID" : debt.PaidAmountVnd > 0 ? "PARTIAL" : "UNPAID";

                db.PaymentAllocations.Add(new PaymentAllocation
                {
                    Code = "ALC-" + now.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(1000, 9999),
                    ArPaymentCode = payment.Code,
                    ShippingLineDebtCode = debt.Code,
                    ContainerNo = alloc.ContainerNo,
                    QuotationNo = alloc.QuotationNo,
                    AllocatedAmountVnd = alloc.Amount
                });
            }

            var period = await GetOrCreateOpenPeriodAsync(request.ShippingLineCode, payment.ShippingLineName);
            period.PeriodCreditVnd += request.PaymentAmount;
            period.ClosingBalanceVnd = period.OpeningBalanceVnd + period.PeriodDebitVnd - period.PeriodCreditVnd;

            await db.SaveChangesAsync();
            return ApiResult<ArPayment>.Success(payment,
                $"Đã ghi nhận thanh toán {request.PaymentAmount:N0} đ và phân bổ thành công cho {request.Allocations.Count} container!");
        }

        public async Task<ApiResult<DebtPeriod>> ClosePeriodAsync(string periodCode, ClosePeriodRequest request)
        {
            var period = await db.DebtPeriods.FirstOrDefaultAsync(x => x.Code == periodCode);
            if (period == null) return ApiResult<DebtPeriod>.Failure("Không tìm thấy kỳ công nợ.");
            if (period.Status == "CLOSED") return ApiResult<DebtPeriod>.Failure("Kỳ công nợ đã được khoá sổ trước đó.");

            var now = DateTime.UtcNow;
            period.Status = "CLOSED";
            period.ClosedAt = now;
            period.ClosedBy = request.ClosedBy;
            period.ClosingNotes = request.ClosingNotes;

            var nextFrom = period.ToDate.AddDays(1);
            var nextTo = nextFrom.AddDays(14);
            var nextPeriod = new DebtPeriod
            {
                Code = $"{period.ShippingLineCode}-{nextFrom:yyyyMMdd}_{nextTo:yyyyMMdd}",
                ShippingLineCode = period.ShippingLineCode,
                ShippingLineName = period.ShippingLineName,
                PeriodCode = $"{nextFrom:yyyy-MM-dd}_{nextTo:yyyy-MM-dd}",
                FromDate = nextFrom,
                ToDate = nextTo,
                OpeningBalanceVnd = period.ClosingBalanceVnd,
                PeriodDebitVnd = 0,
                PeriodCreditVnd = 0,
                ClosingBalanceVnd = period.ClosingBalanceVnd,
                Status = "OPEN"
            };
            db.DebtPeriods.Add(nextPeriod);

            await db.SaveChangesAsync();
            return ApiResult<DebtPeriod>.Success(period,
                $"Đã khoá sổ kỳ {period.PeriodCode}! Số dư cuối kỳ {period.ClosingBalanceVnd:N0} đ đã chuyển sang kỳ mới.");
        }

        public async Task<ApiResult<ArPayment>> ReversePaymentAsync(string paymentCode, ReverseArPaymentRequest request)
        {
            var payment = await db.ArPayments.Include(x => x.Allocations).FirstOrDefaultAsync(x => x.Code == paymentCode);
            if (payment == null) return ApiResult<ArPayment>.Failure("Không tìm thấy khoản thanh toán.");
            if (payment.Status == "REVERSED") return ApiResult<ArPayment>.Failure("Khoản thanh toán này đã bị huỷ trước đó.");

            var debtCodes = payment.Allocations.Select(a => a.ShippingLineDebtCode).ToList();
            var debts = await db.ShippingLineDebts.Where(x => debtCodes.Contains(x.Code)).ToListAsync();

            foreach (var alloc in payment.Allocations)
            {
                var debt = debts.FirstOrDefault(x => x.Code == alloc.ShippingLineDebtCode);
                if (debt == null) continue;
                debt.PaidAmountVnd = Math.Max(0, debt.PaidAmountVnd - alloc.AllocatedAmountVnd);
                debt.RemainingAmountVnd = debt.TotalAmountVnd - debt.PaidAmountVnd;
                debt.Status = debt.RemainingAmountVnd >= debt.TotalAmountVnd ? "UNPAID" : debt.RemainingAmountVnd > 0 ? "PARTIAL" : "PAID";
            }

            payment.Status = "REVERSED";
            payment.ReversedBy = request.ReversedBy;
            payment.ReversedAt = DateTime.UtcNow;
            payment.ReversalReason = request.Reason;

            var openPeriod = await db.DebtPeriods.FirstOrDefaultAsync(x => x.ShippingLineCode == payment.ShippingLineCode && x.Status == "OPEN");
            if (openPeriod != null)
            {
                openPeriod.PeriodCreditVnd = Math.Max(0, openPeriod.PeriodCreditVnd - payment.PaymentAmountVnd);
                openPeriod.ClosingBalanceVnd = openPeriod.OpeningBalanceVnd + openPeriod.PeriodDebitVnd - openPeriod.PeriodCreditVnd;
            }

            await db.SaveChangesAsync();
            return ApiResult<ArPayment>.Success(payment, $"Đã huỷ khoản thanh toán {payment.Code} thành công.");
        }

        public async Task<List<DebtAgingBucketDto>> GetAgingReportAsync()
        {
            var today = DateTime.UtcNow.Date;
            var activeDebts = await db.ShippingLineDebts.AsNoTracking()
                .Where(x => x.Status != "CANCELLED" && x.RemainingAmountVnd > 0)
                .ToListAsync();

            return activeDebts
                .GroupBy(d => (d.ShippingLineCode, d.ShippingLineName))
                .Select(g =>
                {
                    var bucket = new DebtAgingBucketDto { ShippingLineCode = g.Key.ShippingLineCode, ShippingLineName = g.Key.ShippingLineName };
                    foreach (var d in g)
                    {
                        var daysOverdue = (today - d.DueDate.Date).Days;
                        if (daysOverdue <= 30) bucket.Bucket0_30 += d.RemainingAmountVnd;
                        else if (daysOverdue <= 60) bucket.Bucket31_60 += d.RemainingAmountVnd;
                        else if (daysOverdue <= 90) bucket.Bucket61_90 += d.RemainingAmountVnd;
                        else bucket.BucketOver90 += d.RemainingAmountVnd;
                    }
                    bucket.TotalReceivable = bucket.Bucket0_30 + bucket.Bucket31_60 + bucket.Bucket61_90 + bucket.BucketOver90;
                    return bucket;
                })
                .ToList();
        }
    }
}
