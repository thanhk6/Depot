// Ảnh (<img src="/api/files/...">) không gửi được header Authorization, nên JWT được chép thêm vào cookie chỉ
// áp dụng cho đường dẫn /api/files — server.ts kiểm tra cookie này trước khi trả file (BUG-013: trước đây ai có
// link cũng tải được ảnh hồ sơ mà không cần đăng nhập). SameSite=Strict để trang khác không mượn được cookie.
const FILE_COOKIE = 'depot_file_token';
const setFileCookie = (token: string) => {
  document.cookie = `${FILE_COOKIE}=${encodeURIComponent(token)}; Path=/api/files; SameSite=Strict${location.protocol === 'https:' ? '; Secure' : ''}`;
};
const clearFileCookie = () => {
  document.cookie = `${FILE_COOKIE}=; Path=/api/files; Max-Age=0; SameSite=Strict`;
};

export const tokenService = {
  getAccessToken: () => localStorage.getItem('depot_access_token'),
  setAccessToken: (token: string) => {
    localStorage.setItem('depot_access_token', token);
    setFileCookie(token);
  },
  getRefreshToken: () => localStorage.getItem('depot_refresh_token'),
  setRefreshToken: (token: string) => localStorage.setItem('depot_refresh_token', token),
  clearTokens: () => {
    localStorage.removeItem('depot_access_token');
    localStorage.removeItem('depot_refresh_token');
    clearFileCookie();
  },
};

// Phiên đăng nhập từ trước khi có cookie này (token chỉ nằm trong localStorage) vẫn xem được ảnh sau F5.
const existingToken = tokenService.getAccessToken();
if (existingToken) setFileCookie(existingToken);
