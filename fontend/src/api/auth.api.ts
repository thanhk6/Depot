import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { User } from '../types/auth';

export const authApi = {
  login: async (credentials: { username: string; password?: string; passwordHash?: string }) => {
    const res = await apiClient.post<ApiResponse<User>>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return res.data;
  },
  // Truyền token tường minh: người gọi xoá token khỏi localStorage ngay sau đó, interceptor có thể chạy muộn hơn.
  logout: async (accessToken: string) => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.AUTH.LOGOUT, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return res.data;
  },
};

