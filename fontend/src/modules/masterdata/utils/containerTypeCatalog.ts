import { useEffect, useState } from 'react';
import { ContainerTypeMasterItem } from '../../survey/types';
import { masterDataApi } from '../../../api';

const readJson = (value: unknown): Record<string, any> => {
  try { return JSON.parse(String(value || '{}')); } catch { return {}; }
};

// Quy ước lưu của catalog CONTAINER_TYPE (DbSeeder + GateInPage đều dựa vào): `Code` = mã ISO 6346
// (22G1, 45R1...), `Name` = mã loại nội bộ (20GP, 40HC...), tên tiếng Anh nằm trong jsonData.name.
export const mapContainerTypeCatalogItem = (item: any): ContainerTypeMasterItem => {
  const data = readJson(item.jsonData);
  return {
    id: item.id, typeCode: item.name, isoCode: item.code, name: typeof data.name === 'string' && data.name !== item.name ? data.name : '',
    vietnameseName: item.nameVi || item.name, size: data.size || '20', category: data.category || 'DRY',
    isReefer: Boolean(data.isReefer), lengthMm: data.lengthMm || 0, widthMm: data.widthMm || 0,
    heightMm: data.heightMm || 0, internalLengthMm: data.internalLengthMm || 0, internalWidthMm: data.internalWidthMm || 0,
    internalHeightMm: data.internalHeightMm || 0, doorWidthMm: data.doorWidthMm || 0, doorHeightMm: data.doorHeightMm || 0,
    cbm: data.cbm || 0, tareWeightKg: data.tareWeightKg || 0, maxPayloadKg: data.maxPayloadKg || 0,
    maxGrossWeightKg: data.maxGrossWeightKg || 0, teuRatio: data.teuRatio || 1,
    tempRangeMin: typeof data.tempRangeMin === 'number' ? data.tempRangeMin : undefined,
    tempRangeMax: typeof data.tempRangeMax === 'number' ? data.tempRangeMax : undefined,
    material: data.material || 'CORTEN_STEEL',
    floorType: data.floorType || 'WOOD_PLYWOOD', description: item.description || '', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder
  } as ContainerTypeMasterItem;
};

/** Danh mục "DM Loại Container (ISO)" thật từ backend; mặc định chỉ các loại đang áp dụng. */
export const fetchContainerTypes = async (includeInactive = false): Promise<ContainerTypeMasterItem[]> => {
  const response: any = await masterDataApi.getCatalog('CONTAINER_TYPE', includeInactive ? { includeInactive: true } : undefined);
  return (response?.data || []).map(mapContainerTypeCatalogItem);
};

// Dùng chung 1 lần tải cho các ô chọn/lọc loại container (thay danh sách 20DC/40HC... gõ cứng ở từng màn).
let activeTypesCache: Promise<ContainerTypeMasterItem[]> | null = null;
export const useContainerTypeOptions = (): ContainerTypeMasterItem[] => {
  const [options, setOptions] = useState<ContainerTypeMasterItem[]>([]);
  useEffect(() => {
    let alive = true;
    activeTypesCache ??= fetchContainerTypes().catch(() => { activeTypesCache = null; return []; });
    activeTypesCache.then((list) => { if (alive) setOptions(list); });
    return () => { alive = false; };
  }, []);
  return options;
};
