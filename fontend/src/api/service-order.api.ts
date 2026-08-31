import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

export const serviceOrderApi = {
  getAll: async (jobNo?: string) => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.SERVICE_ORDERS.BASE, { params: { jobNo } });
    return response.data;
  },
  create: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.SERVICE_ORDERS.BASE, request);
    return response.data;
  },
  update: async (id: string, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.SERVICE_ORDERS.BASE}/${id}`, request);
    return response.data;
  },
  cancel: async (id: string) => {
    const response = await apiClient.post<ApiResponse<string>>(`${API_ENDPOINTS.SERVICE_ORDERS.BASE}/${id}/cancel`);
    return response.data;
  }
};