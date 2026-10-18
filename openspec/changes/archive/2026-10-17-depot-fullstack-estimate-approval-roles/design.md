# Design

## Context

- `RolePermissions` (Depot.Application) là ma trận vai trò → nhóm quyền, khai báo trong code. Ma trận này dùng chung cho `[RequirePermission]` ở API và cho `allowedTabs` trả về lúc đăng nhập (dựng menu). Cột `Roles.PermissionsJson` trong DB chưa được dùng.
- Các endpoint đang dùng quyền `estimate`:
  - `POST {id}/estimate`, `confirm-estimate`, `approve-estimate`, `reject-estimate`;
  - `EstimateCatalogController` (cùng `masterdata`);
  - `ShippingIntegrationController` (cùng `qc`).
- Menu `approval` (*Phê Duyệt Hãng Tàu*) đang map sang `'estimate'` trong `fontend/src/constants/menuPermissions.ts`. `ApprovalPage` chỉ dùng danh sách hồ sơ (`GET /DepotJobs`, quyền `jobs`) cùng hai API duyệt và từ chối.
- `QC_ENG` có `repair`. Upload ảnh lệnh sửa cho phép `repair` hoặc `qc`; xem ảnh chỉ cần đăng nhập; `DepotFilesController` cho phép `qc`.
- Hai điểm khác nhau giữa duyệt và từ chối:
  - `ApproveEstimateAsync` chặn báo giá chưa xác nhận (ném `EstimateNotAllowedException`, controller trả 400), nhưng chưa so `ApprovedAmount` với `GrandTotal`;
  - `RejectEstimateAsync` không kiểm tra `ConfirmedAt`, và controller `RejectEstimate` không bắt `EstimateNotAllowedException`.
- `DbSeeder.SeedRolesAsync`: mỗi lần khởi động, thêm các `RoleCode` chưa có vào bảng `Roles`. Thêm SUPERVISOR vào danh sách là đủ, cả trên VPS.
- Frontend quy đổi `role` lúc đăng nhập theo chuỗi `RoleCode → RoleType → ROLES.id`:
  - `LoginScreen.mapSystemRoleToRoleType` → `types/depot.ts RoleType` → `AuthProvider.ROLE_ID_BY_PROFILE_ROLE` → `constants/permissions.ts ROLES`;
  - vai trò lạ rơi về `OPERATOR` (nhãn "Khai Thác Cổng").

## Goals / Non-Goals

**Goals:**
- Người lập báo giá không tự ghi nhận duyệt được.
- Hãng tàu không lập hay sửa báo giá được.
- QC không thao tác thay thợ.
- Thêm vai trò SUPERVISOR, dùng được ngay sau khi tạo tài khoản.
- Từ chối báo giá bắt buộc đã xác nhận; số tiền duyệt không vượt tổng báo giá.

**Non-Goals:**
- Không đưa ma trận quyền vào DB, không làm màn cấu hình quyền.
- Không sửa lỗi nhãn "VAI TRÒ" trên sidebar sau đăng nhập.
- Không thêm migration.

## Decisions

- **Hằng quyền mới `Approval = "approval"`:**
  - thêm vào `RolePermissions.All` (nên ADMIN tự có);
  - mã trùng id menu `approval`, giống cách các nhóm khác đặt tên (`repair`, `qc`).
- **Ma trận sau thay đổi** (chỉ liệt kê vai trò bị đổi):

  | Vai trò | Trước | Sau |
  |---|---|---|
  | ADMIN | All | All (gồm `approval`) |
  | CASHIER | dashboard, jobs, payment, billing, inventory, masterdata, report | + `approval` |
  | CARRIER | jobs, estimate | jobs, `approval` |
  | QC_ENG | jobs, qc, repair, survey | jobs, qc, survey |
  | SUPERVISOR (mới) | — | dashboard, jobs, `approval` |

  ESTIMATOR giữ jobs, estimate, survey.
- **Endpoint:**
  - `approve-estimate` và `reject-estimate` đổi sang `[RequirePermission(RolePermissions.Approval)]`;
  - các endpoint `estimate` khác giữ nguyên;
  - `ShippingIntegrationController` giữ `estimate`, `qc`, nên CARRIER mất cổng truyền API. Đây là chức năng của depot gửi đi, không phải của hãng tàu.
- **Từ chối báo giá:**
  - `RejectEstimateAsync` ném `EstimateNotAllowedException("Báo giá {no} chưa được xác nhận — người báo giá phải bấm \"Xác nhận báo giá\" trước khi ghi nhận hãng tàu từ chối.")` khi `ConfirmedAt == null`;
  - kiểm tra này đặt sau kiểm tra trạng thái và lý do;
  - controller `RejectEstimate` bắt exception này, trả 400 kèm thông điệp, như `ApproveEstimate`.
- **Số tiền duyệt:**
  - sau khi tải báo giá, nếu `request.ApprovedAmount > estimate.GrandTotal` thì ném `EstimateNotAllowedException("Số tiền hãng tàu duyệt ({x}) lớn hơn tổng báo giá ({grand} {currency}).")`;
  - so sánh với `GrandTotal` do server tính khi lưu báo giá, không dùng số client gửi.
  - Phương án cho vượt tổng kèm cảnh báo bị loại, vì hãng tàu không duyệt nhiều hơn số depot yêu cầu; muốn tăng tiền thì phải sửa báo giá, hiện chỉ làm được trước khi duyệt.
- **SUPERVISOR:**
  - seeder thêm `new Role { RoleCode = "SUPERVISOR", RoleName = "Giam Sat / Truong Ca", Description = "Ghi nhan hang tau duyet / tu choi bao gia, theo doi ho so" }`;
  - frontend thêm `RoleType 'SUPERVISOR'`, map `SUPERVISOR → 'SUPERVISOR' → 'ROLE_SUPERVISOR'`, và một mục `ROLES` "Giám Sát / Trưởng Ca" (permissions frontend chỉ để hiển thị, menu vẫn theo `allowedTabs`).
- **Menu:** `MENU_PERMISSION.approval = 'approval'`. Các mục `estimate*` và `shipping_api` giữ `'estimate'`.

## Risks / Trade-offs

- **Tài khoản CARRIER và QC_ENG đang dùng mất menu** (BREAKING về quyền): CARRIER mất lập báo giá, danh mục báo giá, cổng API; QC_ENG mất Lệnh sửa chữa.
  - Giảm thiểu: ghi rõ trong tài liệu quy trình. Trên local hiện chỉ có admin.
  - Kiểm tra lại màn QC không gọi API cần `repair`. Đã đối chiếu: ảnh qua `qc`, xem ảnh chỉ cần đăng nhập.
- **CASHIER có thêm quyền ghi nhận duyệt:** người dùng đã chọn. Kế toán đối chiếu email / AEMS, không lập báo giá, nên vẫn tách được người lập với người ghi nhận.
- **Phiên đăng nhập cũ:** `allowedTabs` lấy lúc đăng nhập, nên tài khoản đang mở phải đăng nhập lại mới thấy menu mới. API thì kiểm tra theo vai trò ở mỗi request, nên có hiệu lực ngay.
- **Deploy VPS:** seeder tự thêm SUPERVISOR khi container backend khởi động; không cần chạy SQL tay.
