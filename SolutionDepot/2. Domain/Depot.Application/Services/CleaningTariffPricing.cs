using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Master;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Tra đơn giá biểu phí vệ sinh (bảng CleaningTariffs + CleaningTariffPrices) theo loại container của hồ sơ — server là
    /// nguồn giá duy nhất, không tin đơn giá trình duyệt gửi (depot-fullstack-cleaning-tariff-pricing). Cùng quy tắc với
    /// <see cref="ServiceTariffPricing"/>: chưa có giá / giá 0 cho loại đó → từ chối, không lấy giá loại khác thay thế.
    /// </summary>
    public static class CleaningTariffPricing
    {
        private sealed record Priced(CleaningTariff Tariff, decimal Price);

        /// <summary>Tra giá cho các mã dịch vụ; <paramref name="requireAll"/> = mã không có trong danh mục cũng bị từ chối.</summary>
        private static async Task<Dictionary<string, Priced>> PriceAsync(DepotDbContext db, string? isoSize, IEnumerable<string?> rawCodes, bool requireAll)
        {
            var codes = rawCodes.Select(c => (c ?? string.Empty).Trim().ToUpperInvariant()).Where(c => c.Length > 0).Distinct().ToList();
            var result = new Dictionary<string, Priced>();
            if (codes.Count == 0) return result;
            var tariffs = await db.CleaningTariffs.AsNoTracking().Include(x => x.Prices)
                .Where(x => !x.IsDeleted && codes.Contains(x.Code)).ToListAsync();
            if (requireAll)
            {
                var unknown = codes.Where(c => tariffs.All(t => t.Code != c)).ToList();
                if (unknown.Count > 0)
                    throw new ArgumentException($"Dịch vụ vệ sinh không có trong Biểu Phí Vệ Sinh: {string.Join(", ", unknown)}.");
            }
            if (tariffs.Count == 0) return result;
            var containerType = await ServiceTariffPricing.ResolveContainerTypeAsync(db, isoSize);
            foreach (var t in tariffs)
            {
                if (!t.IsActive)
                    throw new ArgumentException($"Biểu phí vệ sinh {t.Code} đang tạm ngưng — không dùng được.");
                var price = t.Prices.FirstOrDefault(p => !p.IsDeleted && string.Equals(p.ContainerTypeCode, containerType, StringComparison.OrdinalIgnoreCase))?.Price ?? 0m;
                if (price <= 0)
                    throw new ArgumentException($"Biểu phí vệ sinh {t.Code} chưa có giá cho loại {containerType} — nhập giá ở DANH MỤC MASTER DATA → Biểu Phí Vệ Sinh Container.");
                result[t.Code] = new Priced(t, price);
            }
            return result;
        }

        /// <summary>Dịch vụ vệ sinh trên phiếu giám định: mọi mã phải thuộc danh mục; đơn giá / thành tiền theo biểu phí.</summary>
        public static async Task ApplyToSurveyAsync(DepotDbContext db, string? isoSize, List<SurveyCleaningItemViewModel> items)
        {
            var priced = await PriceAsync(db, isoSize, items.Select(i => i.CleaningCode), requireAll: true);
            foreach (var item in items)
            {
                var p = priced[(item.CleaningCode ?? string.Empty).Trim().ToUpperInvariant()];
                item.CleaningCode = p.Tariff.Code;
                item.CleaningName = p.Tariff.NameVi;
                item.UnitPrice = p.Price;
                item.TotalPrice = Math.Max(item.Quantity, 0) * p.Price;
            }
        }

        /// <summary>Hạng mục lệnh vệ sinh thủ công: mọi mã phải thuộc danh mục; đơn giá theo biểu phí.</summary>
        public static async Task ApplyToCleaningRecordAsync(DepotDbContext db, string? isoSize, List<CreateCleaningWorkItemRequest> items)
        {
            var priced = await PriceAsync(db, isoSize, items.Select(i => i.CleaningCode), requireAll: true);
            foreach (var item in items)
            {
                var p = priced[(item.CleaningCode ?? string.Empty).Trim().ToUpperInvariant()];
                item.CleaningCode = p.Tariff.Code;
                item.CleaningName = p.Tariff.NameVi;
                item.UnitPrice = p.Price;
            }
        }

        /// <summary>Phiếu dịch vụ: dòng có mã thuộc biểu phí vệ sinh → đơn giá / VAT / tên theo biểu phí; dòng khác giữ nguyên.</summary>
        public static async Task ApplyToServiceOrderAsync(DepotDbContext db, string? isoSize, List<ServiceOrderItemRequest> items)
        {
            var priced = await PriceAsync(db, isoSize, items.Select(i => i.ServiceCode), requireAll: false);
            foreach (var item in items)
            {
                if (!priced.TryGetValue((item.ServiceCode ?? string.Empty).Trim().ToUpperInvariant(), out var p)) continue;
                item.ServiceCode = p.Tariff.Code;
                item.ServiceName = p.Tariff.NameVi;
                item.Category = "CLEANING";
                item.UnitPrice = p.Price;
                item.VatPercent = p.Tariff.VatPercent;
            }
        }
    }
}
