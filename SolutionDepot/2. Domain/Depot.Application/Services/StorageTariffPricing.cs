using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Depot;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Tính phí lưu bãi của 1 hồ sơ theo biểu cước lưu bãi (StorageTariffRules / StorageTariffTier / StorageTariffTierPrices) —
    /// server là nguồn tính duy nhất (depot-fullstack-storage-tariff-pricing):
    /// - quy tắc đang dùng của đúng hãng tàu hồ sơ, không có thì quy tắc "ALL";
    /// - số ngày = số ngày lịch Việt Nam từ ngày Gate-In tới ngày tính, tính cả hai đầu; ngày ≤ miễn phí là 0đ;
    /// - ngày còn lại nhân đơn giá của bậc chứa ngày đó theo loại container (DM Loại Container), VAT theo quy tắc.
    /// Thiếu quy tắc / thiếu giá → Ok=false kèm lý do, không lấy giá loại khác thay. Không ném lỗi nghiệp vụ để Gate-Out
    /// vẫn chạy và màn cấp vỏ vẫn hiện được lý do.
    /// </summary>
    public static class StorageTariffPricing
    {
        private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");

        public static DateTime VietnamDate(DateTime utc) =>
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), VietnamTimeZone).Date;

        public static async Task<StorageFeeResult> CalculateAsync(DepotDbContext db, DepotJob job, DateTime toUtc)
        {
            var gateIn = VietnamDate(job.GateInDate);
            var to = VietnamDate(toUtc);
            var result = new StorageFeeResult
            {
                JobNo = job.JobNo,
                ContainerNo = job.ContainerNo,
                ContainerTypeCode = (job.IsoSize ?? string.Empty).Trim().ToUpperInvariant(),
                GateInDate = gateIn.ToString("dd/MM/yyyy"),
                ToDate = to.ToString("dd/MM/yyyy"),
                TotalDays = Math.Max(1, (to - gateIn).Days + 1)
            };

            var lineCode = await db.ShippingLines.AsNoTracking().Where(l => l.Id == job.ShippingLineId).Select(l => l.Code).FirstOrDefaultAsync();
            result.ShippingLineCode = lineCode;
            var rules = await db.StorageTariffRules.AsNoTracking()
                .Include(r => r.Tiers.Where(t => !t.IsDeleted).OrderBy(t => t.FromDay))
                .ThenInclude(t => t.Prices.Where(p => !p.IsDeleted))
                .Where(r => !r.IsDeleted && r.IsActive && (r.ShippingLineCode == "ALL" || (lineCode != null && r.ShippingLineCode == lineCode)))
                .ToListAsync();
            var rule = rules.FirstOrDefault(r => lineCode != null && r.ShippingLineCode == lineCode) ?? rules.FirstOrDefault(r => r.ShippingLineCode == "ALL");
            if (rule == null)
            {
                result.Message = $"Chưa có quy tắc lưu bãi đang dùng cho hãng {lineCode ?? "(không rõ)"} hoặc Mọi hãng tàu — khai báo ở Danh mục › Cước Lưu Bãi.";
                return result;
            }

            result.RuleCode = rule.Code;
            result.RuleName = rule.ShippingLineName;
            result.FreeDays = rule.DefaultFreeDays;
            result.VatPercent = rule.VatPercent;
            result.ChargeableDays = Math.Max(0, result.TotalDays - rule.DefaultFreeDays);

            var missing = new List<string>();
            foreach (var tier in rule.Tiers.OrderBy(t => t.FromDay))
            {
                var from = Math.Max(tier.FromDay, rule.DefaultFreeDays + 1);
                var until = Math.Min(tier.ToDay ?? int.MaxValue, result.TotalDays);
                if (until < from) continue;
                var days = until - from + 1;
                var price = tier.Prices.FirstOrDefault(p => string.Equals(p.ContainerTypeCode, result.ContainerTypeCode, StringComparison.OrdinalIgnoreCase))?.Price ?? 0m;
                if (price <= 0)
                {
                    missing.Add($"{tier.TierName} (ngày {tier.FromDay}{(tier.ToDay.HasValue ? $"–{tier.ToDay}" : " trở đi")})");
                    continue;
                }
                result.Lines.Add(new StorageFeeLine
                {
                    TierName = tier.TierName, FromDay = from, ToDay = until, Days = days,
                    UnitPrice = price, Amount = Math.Round(price * days, 2)
                });
            }

            var covered = result.Lines.Sum(l => l.Days);
            if (missing.Count > 0)
            {
                result.Message = $"Quy tắc {rule.Code} chưa có giá {result.ContainerTypeCode} cho {string.Join(", ", missing)} — nhập giá ở Danh mục › Cước Lưu Bãi.";
                result.Lines.Clear();
                return result;
            }
            if (covered < result.ChargeableDays)
            {
                result.Message = $"Quy tắc {rule.Code} không có bậc giá phủ hết {result.ChargeableDays} ngày tính tiền.";
                result.Lines.Clear();
                return result;
            }

            result.Subtotal = result.Lines.Sum(l => l.Amount);
            result.VatAmount = Math.Round(result.Subtotal * rule.VatPercent / 100m, 2);
            result.Total = result.Subtotal + result.VatAmount;
            result.Ok = true;
            result.Message = result.ChargeableDays == 0
                ? $"Lưu bãi {result.TotalDays} ngày, trong {rule.DefaultFreeDays} ngày miễn phí — không tính phí."
                : $"Lưu bãi {result.TotalDays} ngày (miễn phí {rule.DefaultFreeDays}), tính {result.ChargeableDays} ngày theo quy tắc {rule.Code}.";
            return result;
        }

        /// <summary>Câu ngắn ghi vào nhật ký GATE_OUT.</summary>
        public static string AuditText(StorageFeeResult r) => r.Ok
            ? $"Lưu bãi {r.TotalDays} ngày (miễn phí {r.FreeDays}, tính {r.ChargeableDays}) — {r.Total:#,##0.##} đ gồm VAT ({r.RuleCode})."
            : $"Lưu bãi {r.TotalDays} ngày — chưa tính được phí: {r.Message}";
    }
}
