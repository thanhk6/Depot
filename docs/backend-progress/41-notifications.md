# 41-47 — Nhóm HỆ THỐNG THÔNG BÁO TỔNG HỢP (gộp 1 file)

7 tab (`notifications`, `notifications_send`, `notifications_employees`, `notifications_customers`,
`notifications_templates`, `notifications_history`, `notifications_queue`) đều render
`NotificationModule.tsx` (`App.tsx` chỉ đổi `initialSubTab`).

## Hiện trạng trước khi sửa (đã audit ở vòng đầu)

Chỉ `sendNotification()`/`getNotificationHistory()` gọi API thật (`POST/GET /api/notifications`, đã
đúng). Toàn bộ phần còn lại (Dashboard KPI, Employees, Customers, Templates CRUD, Queue, resend/retry/
cancel/processAllQueue) đọc/ghi thẳng vào state cục bộ trong `notificationService.ts` — không lưu
Postgres, mất khi tải lại trang. Dashboard KPI lọc cứng theo ngày `'2026-08-17'`.

## Đã làm (2026-08-23, sau khi người dùng xác nhận làm toàn bộ việc lớn còn lại)

**1. Entity mới** (`Depot.Data/Entities/Integration/`, khóa `long`, theo `00b-quy-tac-tao-bang.md`):
`NotificationTemplate` (đã seed 16 mẫu khớp đủ `BusinessEventType`), `EmployeeNotificationSubscription`
(liên kết logic sang `SystemUser.Username` — bảng legacy không có business key riêng nên dùng Username),
`CustomerNotificationPreference` (liên kết logic sang `CustomerCompany.Code` có sẵn). Migration
`AddNotificationExtras`.

**2. Employees/Customers — đọc từ bảng thật, không còn danh sách giả lập:**
`GetEmployeesAsync()` đọc `SystemUsers` thật (Join `Role`) thay vì danh sách nhân viên bịa; department
hiển thị tạm bằng `Role.RoleName` (SystemUser chưa có cột Department/DepartmentCode liên kết bảng
`Department` ở mục #24 — ghi nhận ở phần "Còn thiếu"). `GetCustomersAsync()` đọc `CustomerCompanies`
thật (đã dùng ở module Khách hàng #33, giờ dùng lại đúng 1 nguồn). Field liên quan Zalo
(`zaloConnected/zaloName`) vẫn là placeholder demo vì chưa tích hợp Zalo OA thật (theo quyết định giữ
Zalo Gateway dạng simulator — xem [36-zalo-overview.md](36-zalo-overview.md)).

**3. `NotificationsController` (route `api/notifications`) thêm:**
`GET /dashboard-kpi` (tính từ `NotificationRecord` thật theo ngày UTC hiện tại, không hard-code),
`GET/PUT employees/{username}/subscription`, `GET/PUT customers/{code}/preferences`,
`GET/POST/PUT/DELETE templates`, `GET /queue` (đọc `NotificationRecord.Status IN (PENDING, FAILED)`),
`POST /{id}/resend`, `POST /{id}/retry`, `POST /{id}/cancel`, `POST /queue/process-all` — tất cả thao tác
trực tiếp trên `NotificationRecord` đã có sẵn, không tạo bảng Queue riêng (đúng tinh thần "Status=PENDING
tự nhiên là hàng đợi", theo đúng gợi ý trong ghi chú audit gốc).

**4. Frontend nối dây thật:** viết lại toàn bộ `notificationService.ts` (lớp trung gian UI đang dùng) —
9/10 nhóm hàm chuyển từ state cục bộ (`employeesState/customersState/templatesState/queueState`) sang
gọi API thật qua `notification.api.ts` (10 hàm mới). **Chỉ giữ nguyên dạng demo:** `getZaloSettings`,
`updateZaloSettings`, `testZaloConnection` — đúng quyết định giữ Zalo Gateway simulator, không đụng tới.
Vì lớp `notificationService.ts` là điểm truy cập duy nhất (đã kiểm tra, không component nào import
`mock/notification.mock.ts` trực tiếp), toàn bộ trang con (`NotificationDashboard`, Employees, Customers,
Templates, History, Queue) tự động dùng dữ liệu thật mà không cần sửa từng trang — bug "lọc cứng ngày
2026-08-17" cũng biến mất theo vì logic đó nằm trong bản service cũ đã thay hẳn.
Build backend + `tsc --noEmit` frontend đều 0 lỗi.

## Còn thiếu (không chặn, ghi nhận để làm sau nếu cần)

- `notificationsToday`/`totalReceived` (Employee) và `notificationCount`/`notificationsToday` (Customer)
  trả cố định `0` — chưa tổng hợp từ `NotificationRecord` theo từng người nhận (cần thêm query group-by
  RecipientId, không bịa số).
- Department nhân viên hiển thị tạm bằng tên Role — `SystemUser` chưa liên kết bảng `Department` thật
  (#24 DM Phòng Ban Depot đã có sẵn nhưng chưa nối).
- Zalo OA Settings & test connection vẫn demo — đã xác nhận với người dùng, không phải thiếu sót.

## Trạng thái: ✅ Xong (Employees/Customers/Templates/Queue/Dashboard đều nối API thật, chỉ Zalo giữ demo)

- [x] `notifications_send`, `notifications_history` — có backend thật, không đổi.
- [x] `notifications` (Dashboard KPI) — tính từ dữ liệu thật, không còn hard-code ngày.
- [x] `notifications_employees`, `notifications_customers` — đọc từ `SystemUsers`/`CustomerCompanies` thật.
- [x] `notifications_templates` — CRUD thật, đã seed 16 mẫu.
- [x] `notifications_queue` — thao tác trên `NotificationRecord` thật (resend/retry/cancel/process-all).
