import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { RepairWorkOrder } from '../types/container';
import { DepotFileDto } from './depotFile.api';

export type RepairPhotoKind = 'BEFORE' | 'AFTER';

// Ảnh lệnh sửa lưu ở DepotFiles với tên "ITEM-{n}__{tên gốc}" (sau sửa) hoặc "BEFORE-ITEM-{n}__{tên gốc}"
// (trước sửa) — xem DepotJobsController.UploadRepairPhoto.
export const parseRepairPhoto = (fileName: string): { kind: RepairPhotoKind; itemNo: number } | null => {
  const match = /^(BEFORE-)?ITEM-(\d+)__/.exec(fileName || '');
  return match ? { kind: match[1] ? 'BEFORE' : 'AFTER', itemNo: Number(match[2]) } : null;
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
  /** Lưu thật 1 ảnh trước / sau sửa của hạng mục `itemNo` (Depot.FileServer + bảng DepotFiles, gắn RepairOrder). */
  uploadRepairPhoto: async (jobId: string, itemNo: number, file: File, kind: RepairPhotoKind) => {
    const form = new FormData();
    form.append('file', file);
    form.append('itemNo', String(itemNo));
    form.append('kind', kind);
    // Bỏ Content-Type mặc định application/json của apiClient để browser tự set multipart boundary
    // (giải thích chi tiết ở depotFile.api.ts).
    const res = await apiClient.post<ApiResponse<DepotFileDto>>(API_ENDPOINTS.DEPOT_JOBS.REPAIR_PHOTOS(jobId), form, {
      headers: { 'Content-Type': undefined }
    });
    return res.data;
  },
  /** Mọi ảnh (trước + sau sửa) của lệnh sửa — phân loại bằng `parseRepairPhoto(f.name)`. */
  getRepairPhotos: async (jobId: string) => {
    const res = await apiClient.get<ApiResponse<DepotFileDto[]>>(API_ENDPOINTS.DEPOT_JOBS.REPAIR_PHOTOS(jobId));
    return res.data;
  },
};
