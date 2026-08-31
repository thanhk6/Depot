import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { User, JwtTokens } from '../types/auth';

export const authApi = {
  login: async (credentials: { username: string; password?: string; passwordHash?: string }) => {
    const res = await apiClient.post<ApiResponse<User>>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return res.data;
  },
  refreshToken: async (refreshToken: string) => {
    const res = await apiClient.post<ApiResponse<JwtTokens>>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return res.data;
  },
};

