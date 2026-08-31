import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

export const qcApi = {
  completeQc: async (jobId: string, passed: boolean, inspectorNotes?: string) => {
    const res = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.DEPOT_JOBS.QC_COMPLETE(jobId), { jobId, passed, comments: inspectorNotes, inspectorName: 'Frontend QC' });
    return res.data;
  },
};

