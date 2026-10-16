import { tokenService } from './token.service';

// Xoá toàn bộ dấu vết phiên đăng nhập ở client và quay về màn hình đăng nhập. Gọi khi backend trả 401
// (token hết hạn/bị thu hồi/không hợp lệ). Màn hình đăng nhập hiển thị khi không còn `depot_logged_user_id`.
let redirecting = false;

export const sessionService = {
  clear: () => {
    tokenService.clearTokens();
    localStorage.removeItem('depot_current_user');
    localStorage.removeItem('depot_logged_user_id');
    localStorage.removeItem('depot_logged_user_profile');
  },
  expire: () => {
    // Không có token nghĩa là chưa đăng nhập (vd DepotProvider bọc cả màn hình đăng nhập và gọi API lúc
    // mount → 401 là bình thường), không có phiên nào để hết hạn — không được chuyển trang, nếu không sẽ
    // lặp vô hạn: tải trang → 401 → chuyển trang → tải trang...
    if (!tokenService.getAccessToken()) return;
    if (redirecting) return;
    redirecting = true;
    sessionService.clear();
    window.location.assign('/');
  },
};
