import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

/** Kết quả 1 lần gửi thật tới endpoint hãng tàu (backend gọi HTTP, không còn ACK tự sinh). */
export interface ShippingSyncResult {
  logId: number;
  success: boolean;
  status: 'SENT' | 'FAILED';
  carrierCode: string;
  endpointUrl: string;
  httpStatusCode?: number | null;
  ackToken: string;
  latencyMs?: number | null;
  requestBody?: string | null;
  responseBody?: string | null;
  errorMessage?: string | null;
  syncedAt: string;
}

/** Trạng thái cấu hình kết nối API của 1 hãng tàu — khóa bí mật chỉ nằm trên server. */
export interface ShippingCarrierStatus {
  carrierCode: string;
  carrierName: string;
  configured: boolean;
  enabled: boolean;
  endpointUrl?: string | null;
  authType?: string | null;
  hasSecret: boolean;
  timeoutSeconds: number;
}

export interface ShippingSyncLogItem {
  id: number;
  depotJobId: number;
  containerNo: string;
  carrierCode: string;
  eventType: string;
  /** SENT / FAILED; SIMULATED = bản ghi cũ do adapter giả lập tự sinh, chưa từng gửi thật. */
  status: 'SENT' | 'FAILED' | 'SIMULATED' | string;
  endpointUrl?: string | null;
  httpStatusCode?: number | null;
  ackToken?: string | null;
  latencyMs?: number | null;
  requestBody?: string | null;
  responseBody?: string | null;
  errorMessage?: string | null;
  triggeredBy?: string | null;
  syncedAt: string;
}

export const shippingApi = {
  /**
   * Gửi sự kiện của hồ sơ container tới API hãng tàu. `carrierCode` rỗng = hãng tàu của hồ sơ.
   * Hãng chưa cấu hình → 409, hãng tàu từ chối / không kết nối được → 424 (axios ném lỗi, dùng getApiErrorMessage).
   */
  syncJob: async (jobId: string, carrierCode = '', eventType = 'CONTAINER_STATUS_UPDATE') => {
    const res = await apiClient.post<ApiResponse<ShippingSyncResult>>(API_ENDPOINTS.SHIPPING.SYNC, { jobId, carrierCode, eventType },
      // Backend chờ hãng tàu tối đa 120s (TimeoutSeconds từng hãng) — dài hơn timeout mặc định 15s của apiClient.
      { timeout: 130000 });
    return res.data;
  },
  getCarriers: async (): Promise<ShippingCarrierStatus[]> => {
    const res = await apiClient.get<ApiResponse<ShippingCarrierStatus[]>>(API_ENDPOINTS.SHIPPING.CARRIERS);
    return (res.data as any)?.data || [];
  },
  getLogs: async (params?: { carrierCode?: string; jobId?: string; take?: number }): Promise<ShippingSyncLogItem[]> => {
    const res = await apiClient.get<ApiResponse<ShippingSyncLogItem[]>>(API_ENDPOINTS.SHIPPING.LOGS, { params });
    return (res.data as any)?.data || [];
  },
};
