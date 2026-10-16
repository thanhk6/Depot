import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

export interface CarrierApprovalInput {
  carrierWorkOrderNo?: string | null;
  carrierAuthCode?: string | null;
  carrierApproverName?: string | null;
  /** ISO — thời điểm hãng tàu duyệt; bỏ trống = lúc nhập. */
  approvedAt?: string | null;
  approvedAmount?: number | null;
  approvalChannel?: string | null;
  notes?: string | null;
}

export const estimateApi = {
  // Xác nhận báo giá trên hệ thống (chưa có API hãng tàu) — backend lưu người + thời điểm xác nhận.
  confirmEstimate: async (jobId: string) => {
    const res = await apiClient.post<ApiResponse<string>>(`/DepotJobs/${jobId}/confirm-estimate`);
    return res.data;
  },
  createEstimate: async (jobId: string, estimateVm: any) => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.DEPOT_JOBS.ESTIMATE(jobId), estimateVm);
    return res.data;
  },
  // Ghi nhận lệnh duyệt của hãng tàu (nhập tay khi chưa có API) — mỗi thông tin lưu 1 cột riêng.
  approveEstimate: async (jobId: string, approval: CarrierApprovalInput) => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.DEPOT_JOBS.APPROVE_ESTIMATE(jobId), approval);
    return res.data;
  },
  rejectEstimate: async (jobId: string, reason: string, rejectedBy = 'Hãng Tàu') => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.DEPOT_JOBS.REJECT_ESTIMATE(jobId), { reason, rejectedBy });
    return res.data;
  },
};

