import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { KPIStats } from '../types/report';

export const reportApi = {
  getKPIStats: async () => {
    const res = await apiClient.get<ApiResponse<KPIStats>>(API_ENDPOINTS.REPORTS.KPI);
    return res.data;
  },
  exportExcel: async (params: any) => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.REPORTS.EXPORT_EXCEL, params);
    return res.data;
  },
  getAnalytics: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/analytics');
    return res.data;
  },
  getStaffRealtime: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/reports/staff-realtime');
    return res.data;
  },
};

export const dashboardApi = {
  getOverview: async () => {
    const res = await apiClient.get<ApiResponse<KPIStats>>(API_ENDPOINTS.REPORTS.DASHBOARD_OVERVIEW);
    return res.data;
  },
};

