import apiClient from './axios';
import { ApiResponse } from '../types/common';

export const notificationApi = {
  getAll: async (params?: { status?: string; recipientId?: string }) => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/notifications', { params });
    return response.data;
  },
  send: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>('/notifications', request);
    return response.data;
  },
  getDashboardKpi: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>('/notifications/dashboard-kpi');
    return response.data;
  },
  getEmployees: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/notifications/employees');
    return response.data;
  },
  updateEmployeeSubscription: async (username: string, subscribedEvents: string[]) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`/notifications/employees/${username}/subscription`, { subscribedEvents });
    return response.data;
  },
  getCustomers: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/notifications/customers');
    return response.data;
  },
  updateCustomerPreference: async (customerCode: string, preferences: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`/notifications/customers/${customerCode}/preferences`, preferences);
    return response.data;
  },
  getTemplates: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/notifications/templates');
    return response.data;
  },
  createTemplate: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>('/notifications/templates', request);
    return response.data;
  },
  updateTemplate: async (code: string, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`/notifications/templates/${code}`, request);
    return response.data;
  },
  deleteTemplate: async (code: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`/notifications/templates/${code}`);
    return response.data;
  },
  getQueue: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/notifications/queue');
    return response.data;
  },
  resend: async (id: string) => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/notifications/${id}/resend`);
    return response.data;
  },
  retry: async (id: string) => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/notifications/${id}/retry`);
    return response.data;
  },
  cancel: async (id: string) => {
    const response = await apiClient.post<ApiResponse<string>>(`/notifications/${id}/cancel`);
    return response.data;
  },
  processAllQueue: async () => {
    const response = await apiClient.post<ApiResponse<{ processedCount: number }>>('/notifications/queue/process-all');
    return response.data;
  }
};
