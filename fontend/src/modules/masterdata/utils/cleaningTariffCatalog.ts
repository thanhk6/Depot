import { CleaningTariffMasterItem } from '../../survey/types';
import { masterDataApi } from '../../../api';
import { priceMapOf, ServiceTariffPriceRow } from './tariffPricing';

// Biểu Phí Vệ Sinh — bảng riêng CleaningTariffs (API /MasterData/cleaning-tariffs), giá theo từng loại container của
// DM Loại Container (depot-fullstack-cleaning-tariff-pricing). Tra giá dùng priceForContainer (tariffPricing.ts) — cùng quy
// tắc với server; giá cuối cùng do server tra khi lưu phiếu giám định / lệnh vệ sinh / phiếu dịch vụ.

/** Map 1 biểu phí từ API sang kiểu dùng ở frontend. */
export const mapCleaningTariff = (item: any): CleaningTariffMasterItem => ({
  id: String(item.id), cleaningCode: item.code, cedexCode: item.cedexCode || '', name: item.nameEn || '',
  vietnameseName: item.nameVi || item.nameEn || item.code, category: item.category || 'GENERAL_SWEEP', description: item.description || '',
  applicableSizes: ['20', '40', '45'], prices: priceMapOf(item.prices as ServiceTariffPriceRow[]),
  currency: 'VND', estimatedDurationMin: item.estimatedDurationMin || 0, waterUsageLiters: item.waterUsageLiters || 0,
  chemicalRequired: item.chemicalRequired || '', equipmentUsed: item.equipmentUsed || '', responsiblePartyDefault: item.responsiblePartyDefault || 'U',
  vatPercent: item.vatPercent ?? 8, status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder ?? 0
} as CleaningTariffMasterItem);

/** Biểu phí ở dạng PricedTariff để tra giá bằng priceForContainer. */
export const asPricedTariff = (tariff: CleaningTariffMasterItem) => ({
  code: tariff.cleaningCode,
  prices: Object.entries(tariff.prices || {}).map(([containerTypeCode, price]) => ({ containerTypeCode, price }))
});

/** Body gửi API tạo / sửa biểu phí (giá > 0; thiếu = chưa có giá). */
export const cleaningTariffRequest = (t: CleaningTariffMasterItem) => ({
  code: t.cleaningCode, nameVi: t.vietnameseName, nameEn: t.name, category: t.category, cedexCode: t.cedexCode,
  description: t.description, vatPercent: t.vatPercent, currency: 'VND', responsiblePartyDefault: t.responsiblePartyDefault,
  estimatedDurationMin: t.estimatedDurationMin || 0, waterUsageLiters: t.waterUsageLiters || 0,
  chemicalRequired: t.chemicalRequired, equipmentUsed: t.equipmentUsed, isActive: t.status !== 'INACTIVE', sortOrder: t.sortOrder ?? 0,
  prices: Object.entries(t.prices || {}).filter(([, p]) => Number(p) > 0).map(([containerTypeCode, price]) => ({ containerTypeCode, price: Number(price) }))
});

/** Biểu phí vệ sinh đang dùng (includeInactive = cả dòng tạm ngưng, cho màn quản lý). */
export const fetchCleaningTariffs = async (includeInactive = false): Promise<CleaningTariffMasterItem[]> => {
  const response: any = await masterDataApi.getCleaningTariffs(includeInactive ? { includeInactive: true } : undefined);
  return (response?.data || []).map(mapCleaningTariff);
};
