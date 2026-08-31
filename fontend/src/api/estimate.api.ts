import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

export const estimateApi = {
  createEstimate: async (jobId: string, estimateVm: any) => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.DEPOT_JOBS.ESTIMATE(jobId), estimateVm);
    return res.data;
  },
  approveEstimate: async (jobId: string, approverName = "Hãng Tàu Phê Duyệt") => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.DEPOT_JOBS.APPROVE_ESTIMATE(jobId, approverName));
    return res.data;
  },
  rejectEstimate: async (jobId: string, reason: string, rejectedBy = 'Hãng Tàu') => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.DEPOT_JOBS.REJECT_ESTIMATE(jobId), { reason, rejectedBy });
    return res.data;
  },
};

