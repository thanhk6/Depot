import { CleaningTariffMasterItem } from '../../survey/types';
import { masterDataApi } from '../../../api';

const readJson = (value: unknown): Record<string, any> => {
  try { return JSON.parse(String(value || '{}')); } catch { return {}; }
};

/** Map 1 dòng catalog CLEANING_TARIFF (MasterCatalogItem) sang kiểu dùng ở frontend. */
export const mapCleaningTariffCatalogItem = (item: any): CleaningTariffMasterItem => {
  const data = readJson(item.jsonData);
  return {
    id: item.id, cleaningCode: item.code, cedexCode: data.cedexCode || '', name: item.name,
    vietnameseName: item.nameVi || item.name, category: data.category || 'GENERAL_SWEEP', description: item.description || '',
    applicableSizes: data.applicableSizes || ['20', '40', '45'], price20DC: data.price20DC || 0, price40DC: data.price40DC || 0,
    price40HC: data.price40HC || 0, price45HC: data.price45HC || 0, price20RF: data.price20RF || 0, price40HR: data.price40HR || 0,
    priceByContainerType: data.priceByContainerType || undefined,
    currency: data.currency || 'VND', estimatedDurationMin: data.estimatedDurationMin || 0, waterUsageLiters: data.waterUsageLiters || 0,
    chemicalRequired: data.chemicalRequired || '', equipmentUsed: data.equipmentUsed || '', responsiblePartyDefault: data.responsiblePartyDefault || 'U',
    vatPercent: data.vatPercent ?? 8, status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder
  } as CleaningTariffMasterItem;
};

/** Đơn giá 1 dịch vụ vệ sinh theo mã loại container (20GP, 40HC, 20RF...). */
export const cleaningPriceForType = (tariff: CleaningTariffMasterItem, typeCode: string): number => {
  const code = (typeCode || '').toUpperCase();
  const specific = tariff.priceByContainerType?.[code];
  if (typeof specific === 'number') return specific;
  if (code === '40HC') return tariff.price40HC;
  if (code === '45HC') return tariff.price45HC;
  if (code === '20RF' || code === '20HR') return tariff.price20RF;
  if (code === '40RF' || code === '40RH' || code === '40HR') return tariff.price40HR;
  if (code.startsWith('45')) return tariff.price45HC;
  if (code.startsWith('40')) return tariff.price40DC;
  return tariff.price20DC;
};

export const fetchCleaningTariffs = async (): Promise<CleaningTariffMasterItem[]> => {
  const response: any = await masterDataApi.getCatalog('CLEANING_TARIFF');
  return (response?.data || []).map(mapCleaningTariffCatalogItem);
};
