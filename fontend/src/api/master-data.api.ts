import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

export interface MasterDataAggregate {
  shippingLines: Array<{ code: string; name: string; country?: string; isActive?: boolean }>;
  materials: unknown[];
  damageCodes: unknown[];
  components: unknown[];
  tariffs: unknown[];
  forklifts: unknown[];
  userProfiles: unknown[];
}

export const masterDataApi = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<MasterDataAggregate>>(API_ENDPOINTS.MASTER_DATA.ALL);
    return response.data;
  },
  getShippingLines: async () => {
    const response = await apiClient.get<ApiResponse<MasterDataAggregate['shippingLines']>>(API_ENDPOINTS.MASTER_DATA.SHIPPING_LINES);
    return response.data;
  },
  createShippingLine: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.MASTER_DATA.SHIPPING_LINES, request);
    return response.data;
  },
  updateShippingLine: async (id: number | string, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.MASTER_DATA.SHIPPING_LINES}/${id}`, request);
    return response.data;
  },
  deleteShippingLine: async (id: number | string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${API_ENDPOINTS.MASTER_DATA.SHIPPING_LINES}/${id}`);
    return response.data;
  },
  getMaterials: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.MASTER_DATA.MATERIALS);
    return response.data;
  },
  createMaterial: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>('/MasterData/materials', request);
    return response.data;
  },
  updateMaterial: async (id: number, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`/MasterData/materials/${id}`, request);
    return response.data;
  },
  // `includeInactive: true` chỉ dành cho màn quản trị Master Data (cần thấy cả dòng "Tạm ngưng" để bật
  // lại); các màn nghiệp vụ gọi mặc định để chỉ nhận dòng đang áp dụng.
  getCatalog: async (catalogType: string, options?: { includeInactive?: boolean }) => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`${API_ENDPOINTS.MASTER_DATA.CATALOG}/${encodeURIComponent(catalogType)}`, {
      params: options?.includeInactive ? { includeInactive: true } : undefined
    });
    return response.data;
  },
  createCatalog: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.MASTER_DATA.CATALOG, request);
    return response.data;
  },
  updateCatalog: async (id: string, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.MASTER_DATA.CATALOG}/${id}`, request);
    return response.data;
  },
  deactivateCatalog: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${API_ENDPOINTS.MASTER_DATA.CATALOG}/${id}`);
    return response.data;
  },
  // Cước Nâng Hạ (LoLo) — bảng riêng ServiceTariff, tách khỏi catalog "SERVICE_TARIFF" dùng chung cũ.
  // Xem docs/frontend-tariff-catalog-split.md.
  // `includeInactive` chỉ cho màn quản trị Cước Nâng Hạ (cần thấy cả hạng mục "Tạm Ngưng").
  getServiceTariffs: async (options?: { includeInactive?: boolean }) => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.MASTER_DATA.SERVICE_TARIFFS, {
      params: options?.includeInactive ? { includeInactive: true } : undefined
    });
    return response.data;
  },
  createServiceTariff: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.MASTER_DATA.SERVICE_TARIFFS, request);
    return response.data;
  },
  updateServiceTariff: async (id: string | number, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.MASTER_DATA.SERVICE_TARIFFS}/${id}`, request);
    return response.data;
  },
  deactivateServiceTariff: async (id: string | number) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${API_ENDPOINTS.MASTER_DATA.SERVICE_TARIFFS}/${id}`);
    return response.data;
  },
  // Cước Lưu Bãi (Storage) — bảng riêng StorageTariffRule + StorageTariffTier. Xem
  // docs/frontend-tariff-catalog-split.md.
  getStorageTariffs: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.MASTER_DATA.STORAGE_TARIFFS);
    return response.data;
  },
  createStorageTariff: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.MASTER_DATA.STORAGE_TARIFFS, request);
    return response.data;
  },
  updateStorageTariff: async (id: string | number, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.MASTER_DATA.STORAGE_TARIFFS}/${id}`, request);
    return response.data;
  },
  deactivateStorageTariff: async (id: string | number) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${API_ENDPOINTS.MASTER_DATA.STORAGE_TARIFFS}/${id}`);
    return response.data;
  }
};
