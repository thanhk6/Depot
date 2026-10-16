import apiClient from './axios';
import { ApiResponse } from '../types/common';

export interface DepotFileDto {
  id: number;
  idTable: number;
  tableName: string;
  name: string;
  type: number;
  fileType: string;
  url: string;
  createdAt: string;
}

export const depotFileApi = {
  /** Upload 1 file thật lên Depot.FileServer + lưu metadata vào bảng DepotFiles, gắn với 1 bản ghi
   * nghiệp vụ qua (tableName, idTable). type: 1 = ảnh, 2 = video, 3 = chứng chỉ. */
  upload: async (file: File, idTable: number, tableName: string, type: number) => {
    const form = new FormData();
    form.append('file', file);
    form.append('idTable', String(idTable));
    form.append('tableName', tableName);
    form.append('type', String(type));
    // apiClient tạo với default header Content-Type: application/json (axios.ts) — header này ĐÈ LÊN
    // header multipart/boundary mà browser cần tự sinh cho FormData, khiến ASP.NET Core từ chối thẳng
    // với 415 Unsupported Media Type trước khi kịp vào action. Phải set về `undefined` tường minh ở đây
    // để axios bỏ hẳn header instance-default, nhường cho XHR tự set đúng "multipart/form-data; boundary=...".
    const res = await apiClient.post<ApiResponse<DepotFileDto>>('/depot-files/upload', form, {
      headers: { 'Content-Type': undefined }
    });
    return res.data;
  },
  getFiles: async (tableName: string, idTable: number) => {
    const res = await apiClient.get<ApiResponse<DepotFileDto[]>>('/depot-files', { params: { tableName, idTable } });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<string>>(`/depot-files/${id}`);
    return res.data;
  }
};

/** Ảnh lưu trước khi đổi sang URL tương đối có dạng "http://localhost:50211/api/files/..." (địa chỉ nội
 * bộ FileServer) — trình duyệt trên VPS không mở được. Chuyển về "/api/files/..." để đi qua proxy của
 * frontend server.ts. URL khác (ảnh ngoài, base64...) giữ nguyên. */
export const toPublicFileUrl = (url: string | null | undefined): string =>
  (url || '').replace(/^https?:\/\/[^/]+(\/api\/files\/)/i, '$1');
