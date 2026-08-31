# Đăng nhập dùng dữ liệu database thật, bỏ chọn nhanh tài khoản (2026-08-25)

## Yêu cầu

Người dùng: "làm phần đăng nhập là dữ liệu từ database, bỏ phần chọn nhanh tài khoản đi, 1 người chỉ
được login vào 1 tài khoản thôi".

## Phát hiện trước khi sửa

Backend `POST /api/Users/authenticate` (`UsersController.cs` → `UserService.Authencate`) **đã hoàn toàn
thật từ trước** — query bảng `Users` thật, verify `PasswordHash` thật, trả về `UserDto` thật
(Id/Username/FullName/Email/RoleName từ `Role.RoleCode`/AllowedTabs tính theo role). Không cần sửa gì
backend.

Vấn đề nằm ở **frontend `LoginScreen.tsx`**: sau khi gọi API thật thành công, code lại **ghi đè** toàn bộ
kết quả thật bằng 1 hồ sơ trong danh sách hardcode `USER_ACCOUNT_PROFILES` (tìm theo username khớp, nếu
không khớp thì lấy đại `USER_ACCOUNT_PROFILES[0]`) — nghĩa là dù đăng nhập đúng tài khoản thật nào, tên/
email/chức danh hiển thị vẫn có thể là của 1 người khác hoàn toàn (hoặc luôn là tài khoản đầu danh sách).
Ngoài ra màn hình còn có khối "Chọn Nhanh Tài Khoản Mẫu" (9 thẻ) cho phép **bỏ qua xác thực hoàn toàn**,
tự chọn bất kỳ vai trò nào chỉ bằng 1 click. Và `UserAccountMenu.tsx` (mới thêm hôm trước) có mục "Đổi
vai trò tài khoản nhanh" cho phép người đã đăng nhập **tự chuyển thành bất kỳ tài khoản/vai trò nào khác**
mà không cần đăng xuất — vi phạm trực tiếp "1 người chỉ đăng nhập vào 1 tài khoản".

## Đã sửa

1. **`LoginScreen.tsx`** — viết lại hoàn toàn:
   - Bỏ hẳn khối "Chọn Nhanh Tài Khoản Mẫu" (9 thẻ) + hàm `handleQuickLogin` — layout đổi từ lưới 12 cột
     (form + thẻ mẫu) sang 1 cột căn giữa.
   - Sau khi `authService.login()` trả về thật, dùng ĐÚNG dữ liệu thật (`fullName`, `email`, `id`, `role`,
     `allowedTabs`) làm nguồn duy nhất — không còn tra cứu/ghi đè bằng `USER_ACCOUNT_PROFILES` theo
     username nữa.
   - 2 field không có trong bảng `Users` thật (`jobTitle`, `department`) và màu sắc avatar/badge vẫn suy
     ra theo **vai trò** qua `getProfileByRole()` (chỉ là cosmetic hiển thị, không phải danh tính) — chữ
     viết tắt avatar (`avatarText`) đổi sang tính thật từ họ tên thật (`getInitials`) thay vì lấy từ hồ sơ
     mẫu.
   - Thêm `mapSystemRoleToRoleType()` — cầu nối giữa `SystemRole` (kiểu role của `authService`, chuẩn hoá
     từ RoleCode thật) và `RoleType` (kiểu role DepotContext/Sidebar đang dùng) — 2 enum này vốn đã tồn
     tại song song từ trước trong codebase, không phải lỗi mới phát sinh hôm nay.
2. **`DepotContext.tsx`** — thêm state thật `loggedInUserProfile` (khác `userProfiles` — đó là danh sách
   TOÀN BỘ hồ sơ mẫu, không phải "ai đang đăng nhập"). Persist qua `localStorage` key
   `depot_logged_user_profile` để F5 lại trang không mất thông tin, đồng thời **sửa luôn 1 bug có sẵn**:
   `activeRole` trước đây luôn khởi tạo cứng `'DEPOT_MANAGER'` bất kể ai đăng nhập — giờ khởi tạo đúng
   theo vai trò thật đã lưu.
3. **`UserAccountMenu.tsx`** — đổi sang đọc `loggedInUserProfile` thật (thay vì đoán qua
   `userProfiles.find(p => p.role === activeRole)`, có thể ra nhầm người nếu nhiều hồ sơ mẫu trùng vai
   trò). **Bỏ hẳn** mục "Đổi vai trò tài khoản nhanh" — không còn cách nào tự chuyển sang tài khoản/vai
   trò khác ngoài đăng xuất rồi đăng nhập lại đúng tài khoản đó.
4. **`App.tsx`** — `handleLogout` xoá thêm `depot_logged_user_profile` khỏi localStorage cùng lúc với
   `depot_logged_user_id`.

## Đã verify thật

- `tsc --noEmit`: 0 lỗi.
- Gọi thẳng `POST /api/Users/authenticate` với tài khoản seed thật (`surveyor/123456`) — trả đúng
  `fullName: "Trần Văn Bình"`, `email` thật, `roleName: "SURVEYOR"`, `allowedTabs` thật.
- Gọi với mật khẩu sai — trả đúng `401` + thông báo lỗi tiếng Việt, không rò rỉ thông tin tài khoản nào.

## Việc cố ý chưa làm (ngoài phạm vi lần này)

- Không rà thêm các component khác từng có `setActiveRole` (`AccessDeniedScreen.tsx`, `RoleBanner.tsx`,
  `components/tabs/DashboardOverview.tsx`, `components/tabs/PermissionConfigModule.tsx`) vì đã xác nhận
  **không component nào trong số này được `App.tsx` (routing thật) sử dụng** — đều là code cũ mồ côi từ
  phiên bản trước, không ảnh hưởng tới trải nghiệm thật của người dùng.
- `HeaderNavbar.tsx` gốc (nơi lấy ý tưởng dropdown tài khoản hôm trước) vẫn còn mồ côi trong repo, có
  logic "Đổi vai trò nhanh" tương tự đã bỏ ở `UserAccountMenu.tsx` — không sửa vì không được dùng tới,
  nhưng nếu sau này ai vô tình gắn `HeaderNavbar.tsx` vào lại thì cần rà lại đúng nguyên tắc này.
