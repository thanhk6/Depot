# Gộp "ZALO GATEWAY & CHAT" vào "THÔNG BÁO & ZALO GATEWAY" (2026-08-24)

## Vấn đề

App có 2 màn Zalo Gateway hoạt động song song, độc lập, gây trùng lặp điều hướng:

1. **Module `notifications`** (`NotificationModule.tsx`) — hub chính, tiêu đề banner đã ghi sẵn
   **"THÔNG BÁO & ZALO GATEWAY"**, có 7 sub-tab thông báo + 2 sub-tab Zalo nội bộ (`zalo_settings`,
   `zalo_mode`) chỉ bấm được từ bên trong header của chính nó — **không có mục nào trong Sidebar trỏ tới
   2 sub-tab này** (`App.tsx` có sẵn case `notifications_zalo_settings`/`notifications_zalo_mode` nhưng
   là code chết, không sidebar item nào gọi tới).
2. **Module `zalo`** (`ZaloModule.tsx` + `ZaloHeader.tsx`) — màn hoàn toàn riêng biệt, sidebar riêng
   ("ZALO GATEWAY & CHAT", 5 mục: Tổng Quan/Simulator/Mẫu Tin/Cấu Hình/Nhật Ký), tái sử dụng chéo 2 trang
   `ZaloSettings`/`ZaloSimulatorPage` từ module `notifications`.

Tên banner của module (1) đã tự nhận là bao gồm cả Zalo Gateway, nhưng thực tế Zalo Gateway đầy đủ (5
chức năng) lại nằm ở 1 module/sidebar khác hẳn — người dùng yêu cầu gộp lại cho đúng như tên gọi.

## Đã làm

Gộp toàn bộ 5 chức năng Zalo Gateway (Tổng Quan, Simulator, Mẫu Tin, Cấu Hình, Nhật Ký) vào làm sub-tab
của `NotificationModule`, xoá hẳn module `zalo` cũ:

1. **`NotificationHeader.tsx`** — mở rộng `NotificationSubTab` từ 9 xuống còn 7 (thông báo) + 5 (Zalo,
   đổi tên `zalo_mode` → `zalo_simulator` cho khớp đúng id đã dùng ở Sidebar/App.tsx cũ). Tab list thêm 3
   mục Zalo còn thiếu (`zalo_overview`, `zalo_templates`, `zalo_logs`), copy đúng nhãn/badge từ
   `ZaloHeader.tsx` cũ trước khi xoá.
2. **`NotificationModule.tsx`** — import chéo 3 trang từ module `zalo`
   (`ZaloOverviewPage`/`ZaloTemplatesPage`/`ZaloLogsPage`), thêm nhánh render cho 4 sub-tab mới
   (`zalo_overview`/`zalo_simulator`/`zalo_templates`/`zalo_logs`, giữ nguyên `zalo_settings` đã có sẵn).
   `ZaloTemplatesPage` dùng lại đúng `handleSelectSendWithTemplate` đã có sẵn (trước đây phải nhảy hẳn
   sang app-level `notifications_send`, giờ chỉ là chuyển sub-tab nội bộ, không remount).
3. **`ZaloOverviewPage.tsx`** — đổi type `onNavigateSubTab` từ `ZaloSubTab` (cũ, thuộc `ZaloHeader.tsx`)
   sang `NotificationSubTab` (thuộc `NotificationHeader.tsx`); 5 lệnh gọi nội bộ đổi từ id ngắn
   (`'settings'`, `'simulator'`, `'templates'`, `'logs'`) sang id đầy đủ khớp Sidebar
   (`'zalo_settings'`, `'zalo_simulator'`, `'zalo_templates'`, `'zalo_logs'`); nút "Phát Tin Nhắn Mới"
   trước đây gọi `onNavigateTab('notifications_send')` (nhảy app-level, remount toàn bộ) nay gọi thẳng
   `onNavigateSubTab('send')` (chuyển tab nội bộ, mượt hơn) — bỏ hẳn prop `onNavigateTab` không còn cần.
4. **`App.tsx`** — bỏ import `ZaloModule`; 5 case `zalo_overview/zalo_simulator/zalo_templates/
   zalo_settings/zalo_logs` đổi từ render `<ZaloModule initialSubTab="...">` (id ngắn kiểu cũ) sang
   `<NotificationModule initialSubTab="...">` (dùng thẳng đúng id route, không cần bảng ánh xạ tên riêng
   vì đã cố tình đặt trùng). Xoá 2 case chết `notifications_zalo_settings`/`notifications_zalo_mode`
   (không sidebar item nào gọi tới). Xoá 2 dòng tiêu đề trang tương ứng trong bảng page-title.
5. **`Sidebar.tsx`** — gộp 2 nhóm menu cũ ("ZALO GATEWAY & CHAT" + "HỆ THỐNG THÔNG BÁO TỔNG HỢP") thành 1
   nhóm duy nhất `"THÔNG BÁO & ZALO GATEWAY"` (12 mục, giữ nguyên toàn bộ icon/badge/màu từng mục).
6. **Xoá hẳn** `fontend/src/modules/zalo/ZaloModule.tsx` và
   `fontend/src/modules/zalo/components/ZaloHeader.tsx` — đã xác nhận `grep` toàn repo không còn nơi nào
   import 2 file này trước khi xoá. Thư mục `zalo/pages/` giữ nguyên 3 file còn dùng
   (`ZaloOverviewPage.tsx`, `ZaloTemplatesPage.tsx`, `ZaloLogsPage.tsx`).

## Kết quả

- Chỉ còn **1 module, 1 sidebar group, 1 banner "THÔNG BÁO & ZALO GATEWAY"** cho toàn bộ 12 chức năng
  (7 thông báo + 5 Zalo), đúng với tên gọi ban đầu của banner.
- Không mất chức năng nào — cả 12 sub-tab cũ (dù trước đó nằm rải ở 2 nơi) đều còn nguyên, chỉ đổi chỗ
  render.
- `tsc --noEmit`: 0 lỗi sau toàn bộ thay đổi.

## Việc cố ý chưa làm (ngoài phạm vi yêu cầu lần này)

- Không đổi lại các route/URL bên ngoài (nếu có bookmark/link cũ trỏ `zalo_overview` v.v. vẫn hoạt động
  bình thường vì id giữ nguyên, chỉ đổi component đích).
- Không rà lại UI chi tiết bên trong 5 trang Zalo (Overview/Simulator/Templates/Settings/Logs) — chỉ gộp
  điều hướng, chưa audit riêng nội dung/backend của các trang đó (Zalo vẫn ở dạng demo/simulator theo
  quyết định người dùng trước đây, xem `docs/backend-progress/36-zalo-overview.md`).
