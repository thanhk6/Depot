import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { RepairWorkOrder } from '../types/container';

export const repairApi = {
  assignWorkOrder: async (jobId: string, team: string, workers: string[], materials: any[]) => {
    const res = await apiClient.post<ApiResponse<RepairWorkOrder>>(API_ENDPOINTS.DEPOT_JOBS.REPAIR_ASSIGN(jobId), { team, workers, materials });
    return res.data;
  },
  startWorkOrder: async (jobId: string, technicianId: string, technicianName: string) => {
    const res = await apiClient.post<ApiResponse<RepairWorkOrder>>(API_ENDPOINTS.DEPOT_JOBS.REPAIR_START(jobId), { technicianId, technicianName });
    return res.data;
  },
  completeWorkOrder: async (jobId: string, photos: any[]) => {
    const res = await apiClient.post<ApiResponse<RepairWorkOrder>>(API_ENDPOINTS.DEPOT_JOBS.REPAIR_COMPLETE(jobId), { photos });
    return res.data;
  },
};
