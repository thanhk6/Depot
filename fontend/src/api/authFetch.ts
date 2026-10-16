import { tokenService } from '../services/token.service';
import { sessionService } from '../services/session.service';

// fetch() có đính kèm JWT — dùng cho những chỗ còn gọi API bằng fetch thô thay vì apiClient (axios).
// Thiếu header Authorization thì backend trả 401 cho mọi endpoint (trừ đăng nhập/health).
export const authFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(init.headers);
  const token = tokenService.getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) sessionService.expire();
  return response;
};
