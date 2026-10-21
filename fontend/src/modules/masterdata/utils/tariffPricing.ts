import { ContainerTypeMasterItem } from '../../survey/types';

// Tra đơn giá biểu cước nâng hạ (ServiceTariffs) theo loại container — CÙNG quy tắc với server
// (Depot.Application/Services/ServiceTariffPricing.cs, depot-fullstack-lolo-tariff-pricing). Dùng chung cho phiếu dịch vụ,
// màn Cước Nâng Hạ và biểu phí ở cổng. Server vẫn là nguồn giá cuối cùng khi lưu phiếu.
// Mỗi biểu cước có giá riêng cho từng loại container trong DM Loại Container (mã = typeCode, vd 40HC, 40GP, 20RF).
// Chưa có giá / giá 0 = chưa có giá cho loại đó — KHÔNG lấy giá loại khác thay thế.

/** 1 đơn giá theo loại container, đúng tên field API (`/MasterData/service-tariffs` → `prices`). */
export interface ServiceTariffPriceRow {
  containerTypeCode: string;
  price: number;
}

/** Biểu cước tối thiểu để tra giá. */
export interface PricedTariff {
  code?: string;
  prices: ServiceTariffPriceRow[];
}

/** Bảng giá { mã loại → đơn giá } từ danh sách `prices` của API. */
export const priceMapOf = (prices: ServiceTariffPriceRow[] | undefined): Record<string, number> =>
  Object.fromEntries((prices || []).map((p) => [String(p.containerTypeCode || '').toUpperCase(), Number(p.price) || 0]));

/** ok = có giá; ngược lại `reason` nêu lý do (price = 0). Một interface (dự án không bật strict nên union không thu hẹp được). */
export interface TariffPriceResult {
  ok: boolean;
  price: number;
  reason?: string;
}

/** Đơn giá của biểu cước cho mã loại container (vd "45HC"), hoặc lý do không tra được. */
export const priceForContainer = (
  tariff: PricedTariff,
  typeCode: string,
  containerTypes: Pick<ContainerTypeMasterItem, 'typeCode'>[]
): TariffPriceResult => {
  const code = String(typeCode || '').toUpperCase();
  if (!containerTypes.some((t) => t.typeCode?.toUpperCase() === code))
    return { ok: false, price: 0, reason: `Loại container ${typeCode || '(trống)'} không có trong DM Loại Container` };
  const price = priceMapOf(tariff.prices)[code] || 0;
  if (price <= 0) return { ok: false, price: 0, reason: `Biểu cước ${tariff.code ?? ''} chưa có giá cho loại ${code}`.replace('  ', ' ') };
  return { ok: true, price };
};
