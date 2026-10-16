import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { RepairWorkOrder } from '../types/container';
import { DepotFileDto } from './depotFile.api';

// Ảnh sau sửa lưu ở DepotFiles với tên dạng "ITEM-{n}__{tên gốc}" (xem DepotJobsController.UploadRepairPhoto).
export const parseRepairPhotoItemNo = (fileName: string): number | null => {
  const match = /^ITEM-(\d+)__/.exec(fileName || '');
  return match ? Number(match[1]) : null;
};

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
  /** Lưu thật 1 ảnh sau sửa của hạng mục `itemNo` (Depot.FileServer + bảng DepotFiles, gắn RepairOrder). */
  uploadAfterPhoto: async (jobId: string, itemNo: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('itemNo', String(itemNo));
    // Bỏ Content-Type mặc định application/json của apiClient để browser tự set multipart boundary
    // (giải thích chi tiết ở depotFile.api.ts).
    const res = await apiClient.post<ApiResponse<DepotFileDto>>(API_ENDPOINTS.DEPOT_JOBS.REPAIR_PHOTOS(jobId), form, {
      headers: { 'Content-Type': undefined }
    });
    return res.data;
  },
  getAfterPhotos: async (jobId: string) => {
    const res = await apiClient.get<ApiResponse<DepotFileDto[]>>(API_ENDPOINTS.DEPOT_JOBS.REPAIR_PHOTOS(jobId));
    return res.data;
  },
};
