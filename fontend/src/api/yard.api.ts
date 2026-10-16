import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

export const yardApi = {
  getPositions: async (blockCode?: string) => {
    const res = await apiClient.get<ApiResponse<any[]>>(API_ENDPOINTS.YARD.BASE, { params: { blockCode } });
    return res.data;
  },
  forkliftMove: async (jobId: string, targetBlock: string, targetBay: number, targetRow: number, targetTier: number, operatorName?: string, forkliftCode?: string) => {
    const res = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.DEPOT_JOBS.FORKLIFT_MOVE(jobId), { targetBlock, targetBay, targetRow, targetTier, operatorName, forkliftCode });
    return res.data;
  },
  claimForkliftJob: async (jobId: string, operatorId: string, operatorName: string, vehicleCode: string) => {
    const res = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.DEPOT_JOBS.FORKLIFT_CLAIM(jobId), { operatorId, operatorName, vehicleCode });
    return res.data;
  },
  startForkliftExecution: async (jobId: string, operatorId: string) => {
    const res = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.DEPOT_JOBS.FORKLIFT_START(jobId, operatorId));
    return res.data;
  },
  cancelForkliftClaim: async (jobId: string, operatorId: string) => {
    const res = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.DEPOT_JOBS.FORKLIFT_CANCEL_CLAIM(jobId, operatorId));
    return res.data;
  },
};

