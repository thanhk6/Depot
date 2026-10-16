import apiClient from './axios';
import { ApiResponse } from '../types/common';

// Danh mục riêng của phân hệ Báo giá (cấu trúc Maersk AEMS) — backend EstimateCatalogController
// (api/estimate-catalog/{type}), mở cho nhóm quyền Báo giá + Master Data.
export type EstimateCatalogType =
  | 'EST_DAMAGE_CODE'
  | 'EST_REPAIR_CODE'
  | 'EST_REPAIR_LOCATION'
  | 'EST_LABOR_RATE'
  | 'EST_TPI'
  | 'EST_CAUSE'
  | 'EST_MODE'
  | 'EST_SHOP_CODE';

export interface EstimateCatalogItem {
  id: number;
  catalogType: string;
  code: string;
  name: string;
  nameVi?: string | null;
  description?: string | null;
  jsonData?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface EstimateCatalogRequest {
  code: string;
  name: string;
  nameVi?: string | null;
  description?: string | null;
  jsonData?: string;
  isActive: boolean;
  sortOrder: number;
}

const base = (type: EstimateCatalogType) => `/estimate-catalog/${type}`;

export const estimateCatalogApi = {
  list: async (type: EstimateCatalogType, includeInactive = false): Promise<EstimateCatalogItem[]> => {
    const res = await apiClient.get<ApiResponse<EstimateCatalogItem[]>>(base(type), {
      params: includeInactive ? { includeInactive: true } : undefined
    });
    return ((res.data as any)?.data || []) as EstimateCatalogItem[];
  },
  create: async (type: EstimateCatalogType, request: EstimateCatalogRequest) => {
    const res = await apiClient.post<ApiResponse<EstimateCatalogItem>>(base(type), request);
    return res.data;
  },
  update: async (type: EstimateCatalogType, id: number, request: EstimateCatalogRequest) => {
    const res = await apiClient.put<ApiResponse<EstimateCatalogItem>>(`${base(type)}/${id}`, request);
    return res.data;
  },
  remove: async (type: EstimateCatalogType, id: number) => {
    const res = await apiClient.delete<ApiResponse<string>>(`${base(type)}/${id}`);
    return res.data;
  }
};

/** Đọc JsonData an toàn. */
export const readCatalogJson = (raw?: string | null): Record<string, any> => {
  if (!raw) return {};
  try { return JSON.parse(raw) || {}; } catch { return {}; }
};
