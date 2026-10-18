# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 Không sửa backend. Xác nhận `POST /api/Users/login` trả `roleName` là RoleCode cho cả 11 vai trò (dùng tài khoản tạm ở bước 3.1).

## 2. Frontend (`fontend/`)

- [x] 2.1 `constants/roles.ts`: `SYSTEM_ROLES` = 11 RoleCode thật cộng `UNKNOWN`. Kiểm tra: type-check, sửa chỗ còn dùng mã cũ nếu có.
- [x] 2.2 `services/auth.service.ts` `normalizeRole`: giữ nguyên 11 mã thật; đổi mã cũ sang mã mới (OPERATOR / GATE_IN → GATE_OP, ACCOUNTANT → CASHIER, REPAIR_TECH → TECHNICIAN, QC_INSPECTOR → QC_ENG, CLEANING_STAFF → CLEANING, FORKLIFT_DRIVER → FORKLIFT, SHIPPING_LINE → CARRIER, DEPOT_MANAGER → ADMIN); mã khác → `UNKNOWN`. Kiểm tra: type-check không lỗi.
- [x] 2.3 `types/depot.ts`: thêm `'UNKNOWN'` vào `RoleType`.
  - `LoginScreen.mapSystemRoleToRoleType`: mặc định → `'UNKNOWN'`.
  - Khi `UNKNOWN`, hồ sơ hiển thị dùng giá trị trung tính (huy hiệu "—", chức danh trống) thay cho `getProfileByRole`; `allowedTabs` vẫn từ backend.
  - Cập nhật comment đầu hàm (11 RoleCode).
  - Kiểm tra: `npx tsc --noEmit -p .` không lỗi.

## 3. Kiểm thử (giao diện http://127.0.0.1:3000)

- [x] 3.1 Tạo tài khoản tạm `qa_rl_*` cho 10 vai trò (trừ ADMIN, dùng admin thật), đăng nhập qua API để xác nhận `roleName` (việc 1.1).
- [x] 3.2 Playwright, mỗi tài khoản một phiên trình duyệt mới:
  - đăng nhập, đọc nhãn "VAI TRÒ" trên sidebar và huy hiệu / chức danh ở menu tài khoản;
  - tải lại trang rồi đọc lại;
  - kỳ vọng mỗi vai trò hiện đúng tên của nó, không vai trò nào hiện "Khai Thác Cổng" trừ GATE_OP.
- [x] 3.3 Vai trò lạ: trong trình duyệt test, chặn response đăng nhập và đổi `roleName` thành mã lạ (`page.route`, không sửa DB). Kỳ vọng: nhãn "—", menu theo `allowedTabs` của response.
- [x] 3.4 Phiên cũ: đặt sẵn `depot_current_user.role = 'REPAIR_TECH'` trong localStorage rồi mở app; kỳ vọng không lỗi trang, đăng nhập lại thì hiện đúng.
- [x] 3.5 Dọn dữ liệu test: xoá tài khoản `qa_rl_*`; truy vấn DB xác nhận không còn tài khoản test, và 2 hồ sơ thật SUDU3070783 và BMOU1675248 không đổi.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fe-role-label-mapping` (tạo spec chính mới `openspec/specs/access-control/`).
