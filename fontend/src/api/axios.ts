import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from './endpoints';
import { sessionService } from '../services/session.service';

// Gắn JWT vào mọi request và xử lý 401 chung cho 1 axios instance.
const attachAuth = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('depot_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // 401 ở mọi API TRỪ chính request đăng nhập (đăng nhập sai mật khẩu cũng trả 401 nhưng phải giữ nguyên
      // màn hình để hiện lỗi) = token hết hạn/bị thu hồi → xoá phiên và về màn hình đăng nhập.
      const isLoginRequest = String(error.config?.url || '').toLowerCase().includes('users/authenticate');
      if (error.response?.status === 401 && !isLoginRequest) {
        sessionService.expire();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = attachAuth(
  axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  })
);

// Instance không có baseURL — cho các module tự ghép URL tuyệt đối dạng '/api/...' (vd modules/yard/services/yardApi.ts).
export const rootApiClient = attachAuth(
  axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  })
);

export default apiClient;
