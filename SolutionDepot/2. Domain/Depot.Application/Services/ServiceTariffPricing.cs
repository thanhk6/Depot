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
    /// Tra đơn giá biểu cước nâng hạ (bảng ServiceTariffs) theo loại container của hồ sơ — server là nguồn giá duy nhất,
    /// không tin đơn giá / VAT trình duyệt gửi (depot-fullstack-lolo-tariff-pricing). Mỗi biểu cước có giá riêng cho từng loại
    /// trong DM Loại Container (bảng ServiceTariffPrices, mã = CONTAINER_TYPE.Name). Chưa có dòng giá / giá 0 = chưa có giá
    /// cho loại đó → từ chối, không lấy giá của loại khác thay thế.
    /// </summary>
    public static class ServiceTariffPricing
    {
        /// <summary>Mã loại container chuẩn hoá; báo lỗi nếu loại không có trong DM Loại Container.</summary>
        public static async Task<string> ResolveContainerTypeAsync(DepotDbContext db, string? isoSize)
        {
            var typeCode = (isoSize ?? string.Empty).Trim().ToUpperInvariant();
            var names = await db.MasterCatalogItems.AsNoTracking()
                .Where(x => x.CatalogType == "CONTAINER_TYPE" && !x.IsDeleted).Select(x => x.Name).ToListAsync();
            if (!names.Any(n => string.Equals(n?.Trim(), typeCode, StringComparison.OrdinalIgnoreCase)))
                throw new ArgumentException($"Loại container '{typeCode}' không có trong DM Loại Container — không tra được giá biểu cước.");
            return typeCode;
        }

        /// <summary>Đơn giá của biểu cước cho loại container (0 = chưa có giá cho loại này).</summary>
        public static decimal PriceFor(ServiceTariff t, string containerTypeCode) =>
            t.Prices.FirstOrDefault(p => !p.IsDeleted && string.Equals(p.ContainerTypeCode, containerTypeCode, StringComparison.OrdinalIgnoreCase))?.Price ?? 0m;

        /// <summary>
        /// Ghi đè đơn giá / VAT / đơn vị / tên cho mọi hạng mục có mã thuộc ServiceTariffs (chưa xoá); hạng mục khác giữ nguyên.
        /// Biểu cước tạm ngưng hoặc chưa có giá cho loại container → ArgumentException nêu mã + loại.
        /// </summary>
        public static async Task ApplyAsync(DepotDbContext db, string? isoSize, IEnumerable<ServiceOrderItemRequest> items)
        {
            var list = items.ToList();
            var codes = list.Select(i => (i.ServiceCode ?? string.Empty).Trim().ToUpperInvariant()).Distinct().ToList();
            var tariffs = await db.ServiceTariffs.AsNoTracking().Include(x => x.Prices)
                .Where(x => !x.IsDeleted && codes.Contains(x.Code)).ToListAsync();
            if (tariffs.Count == 0) return;

            var containerType = await ResolveContainerTypeAsync(db, isoSize);
            foreach (var item in list)
            {
                var tariff = tariffs.FirstOrDefault(t => t.Code == (item.ServiceCode ?? string.Empty).Trim().ToUpperInvariant());
                if (tariff == null) continue;
                if (!tariff.IsActive)
                    throw new ArgumentException($"Biểu cước {tariff.Code} đang tạm ngưng — không dùng được trên phiếu dịch vụ.");
                var price = PriceFor(tariff, containerType);
                if (price <= 0)
                    throw new ArgumentException($"Biểu cước {tariff.Code} chưa có giá cho loại {containerType} — nhập giá ở DANH MỤC MASTER DATA → Cước Nâng Hạ.");
                item.ServiceCode = tariff.Code;
                item.ServiceName = tariff.NameVi;
                item.Unit = tariff.Unit;
                item.UnitPrice = price;
                item.VatPercent = tariff.VatPercent;
            }
        }
    }
}
