import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

export interface ShippingSyncResult {
  ackToken: string;
  status: string;
  syncedAt: string;
}

export const shippingApi = {
  syncJob: async (jobId: string, carrierCode: string, eventType = 'CONTAINER_STATUS_UPDATE') => {
    const res = await apiClient.post<ApiResponse<ShippingSyncResult>>(API_ENDPOINTS.SHIPPING.SYNC, { jobId, carrierCode, eventType });
    return res.data;
  },
};