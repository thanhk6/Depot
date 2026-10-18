import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { DepotJob } from '../types/container';

export interface CreateGateInRequest {
  containerNo: string;
  isoSize: string;
  shippingLine: string;
  tareWeightKg: number;
  maxPayloadKg: number;
  truckPlate: string;
  driverName: string;
  driverPhone: string;
  trailerPlate?: string;
  sealNo?: string;
  driverLicense?: string;
  customsSealNo?: string;
  bookingNo?: string;
  truckingCompany?: string;
  /** Tên nhà xe — chỉ dùng khi truckingCompany = VANG_LAI (nhà xe có mã lấy tên từ danh mục ở backend). */
  truckingName?: string;
  /** Màn Gate-In gửi true: backend bắt buộc có nhà xe. */
  requireTrucking?: boolean;
  remarks?: string;
  /** Users.Id của nhân viên đang đăng nhập — lấy tự động từ phiên đăng nhập, không cho nhập tay. */
  gateInStaffId?: number;
}

export interface GateOutRequest {
  truckPlate: string;
  driverName: string;
  trailerPlate?: string;
  sealNo?: string;
}

export const containerApi = {
  getAll: async (params?: { searchKeyword?: string; shippingLine?: string; status?: string }) => {
    const res = await apiClient.get<ApiResponse<DepotJob[]>>(API_ENDPOINTS.DEPOT_JOBS.BASE, { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<DepotJob>>(API_ENDPOINTS.DEPOT_JOBS.GET_BY_ID(id));
    return res.data;
  },
  getHistory: async (id: string) => {
    const res = await apiClient.get<ApiResponse<any[]>>(API_ENDPOINTS.DEPOT_JOBS.HISTORY(id));
    return res.data;
  },
  delete: async (id: string, deletedBy = 'Frontend User') => {
    const res = await apiClient.delete<ApiResponse<string>>(API_ENDPOINTS.DEPOT_JOBS.DELETE(id), { params: { deletedBy } });
    return res.data;
  },
  updateStatus: async (id: string, status: string, condition?: string) => {
    const res = await apiClient.patch<ApiResponse<string>>(API_ENDPOINTS.DEPOT_JOBS.UPDATE_STATUS(id), { status, condition });
    return res.data;
  },
  createGateIn: async (data: CreateGateInRequest) => {
    const res = await apiClient.post<ApiResponse<DepotJob>>(API_ENDPOINTS.DEPOT_JOBS.GATE_IN, data);
    return res.data;
  },
  gateOut: async (id: string | number, data: GateOutRequest) => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.DEPOT_JOBS.GATE_OUT(String(id)), data);
    return res.data;
  },
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.DEPOT_JOBS.STATS);
    return res.data;
  },
};

