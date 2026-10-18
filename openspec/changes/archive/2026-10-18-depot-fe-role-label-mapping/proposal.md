# Proposal

## Why

Sau khi đăng nhập, nhãn "VAI TRÒ" trên sidebar, chức danh và huy hiệu ở menu tài khoản hiện sai vai trò.
- Đã xác nhận ngày 17/10/2026 bằng giao diện và localStorage: các tài khoản Kỹ thuật viên (TECHNICIAN), Kỹ sư QC (QC_ENG), Hãng tàu (CARRIER), Tổ vệ sinh (CLEANING) và Xe nâng (FORKLIFT) đều hiện "Khai Thác Cổng (Gate Operator)".
- Nguyên nhân: `fontend/src/services/auth.service.ts` (`normalizeRole`) vẫn quy đổi theo bộ mã vai trò cũ. Mã thật mà backend trả về (`roleName` = RoleCode) bị đổi thành mã cũ (vd TECHNICIAN thành REPAIR_TECH) hoặc rơi về mặc định `DEPOT_MANAGER`. Sau đó `LoginScreen` không nhận ra các mã đó và quy tiếp về Khai Thác Cổng. Riêng GATE_OP hiện đúng là do tình cờ.

Nhân viên nhìn nhãn sai thì tưởng mình bị gán nhầm vai trò. Quản lý cũng không kiểm tra được ai đang dùng tài khoản gì.

## What Changes

- `normalizeRole` giữ nguyên 11 RoleCode thật của backend: ADMIN, SURVEYOR, GATE_OP, CASHIER, ESTIMATOR, TECHNICIAN, QC_ENG, FORKLIFT, CARRIER, CLEANING, SUPERVISOR.
  - Mã cũ (OPERATOR, GATE_IN, REPAIR_TECH, QC_INSPECTOR, CLEANING_STAFF, FORKLIFT_DRIVER, SHIPPING_LINE, ACCOUNTANT, DEPOT_MANAGER) chỉ còn để đọc phiên đăng nhập cũ, và được đổi sang mã mới tương ứng.
  - Mã không biết **không** còn bị quy thành `DEPOT_MANAGER` (quản lý).
- Kiểu `SystemRole` (`constants/roles.ts`) đổi sang đúng 11 RoleCode thật.
- Vai trò lạ (không thuộc 11 mã):
  - nhãn vai trò hiện "—", không mượn nhãn của vai trò khác;
  - menu vẫn theo quyền backend trả về (`allowedTabs`), không đổi.
- Không đổi phân quyền: menu và API vẫn lấy từ `RolePermissions` ở backend. Change này chỉ sửa phần **hiển thị**.

## Capabilities

### New Capabilities

- `access-control`: hiển thị đúng vai trò của tài khoản đang đăng nhập (nhãn sidebar, chức danh, huy hiệu). Đây là spec đầu tiên của nhóm phân quyền; các requirement nền (ma trận quyền, chặn API) sẽ bổ sung ở đợt baseline sau.

### Modified Capabilities

(không có)

## Impact

- **Frontend (`fontend/`):**
  - `services/auth.service.ts`: `normalizeRole`;
  - `constants/roles.ts`: `SYSTEM_ROLES`;
  - `components/LoginScreen.tsx`: `mapSystemRoleToRoleType` (bỏ nhánh mã cũ không còn tới; vai trò lạ không quy về Khai Thác Cổng);
  - nếu cần, các chỗ đang dùng `RoleType` mặc định (`AuthProvider`, `roleMenuConfig.getProfileByRole`).
- **Backend, API, bảng dữ liệu:** không đổi, không có migration.
- **Phiên đăng nhập cũ:** `depot_current_user` và `depot_logged_user_profile` trong localStorage có thể còn mã cũ. Đọc lại vẫn hiện đúng nhờ bảng đổi mã cũ sang mã mới; đăng nhập lại thì sạch hẳn.
- **Ngoài phạm vi:**
  - dọn các danh sách vai trò mẫu không còn dùng (`modules/system/data/rbacMockData.ts`, `context/DepotContext.tsx` cho chế độ demo);
  - chuyển ma trận quyền sang DB.
