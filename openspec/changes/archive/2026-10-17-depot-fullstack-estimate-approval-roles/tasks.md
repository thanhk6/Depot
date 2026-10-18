# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 Sửa `RolePermissions.cs`.
  - Thêm hằng `Approval = "approval"` vào `All`.
  - Cập nhật ma trận: CASHIER + `approval`; CARRIER = jobs, `approval`; QC_ENG bỏ `repair`; thêm `SUPERVISOR` = dashboard, jobs, `approval`.
  - Sửa comment hằng `Estimate`: chỉ còn lập và xác nhận báo giá.
  - Kiểm tra: build không lỗi.
- [x] 1.2 `DepotJobsController`: `ApproveEstimate` và `RejectEstimate` đổi sang `[RequirePermission(RolePermissions.Approval)]`; `RejectEstimate` bắt `EstimateNotAllowedException` và trả 400 kèm thông điệp. Kiểm tra: build không lỗi.
- [x] 1.3 `DepotJobService.RejectEstimateAsync`: báo giá chưa xác nhận (`ConfirmedAt == null`) thì ném `EstimateNotAllowedException` nêu phải xác nhận trước. Kiểm tra: build không lỗi.
- [x] 1.4 `DepotJobService.ApproveEstimateAsync`: `ApprovedAmount > GrandTotal` thì ném `EstimateNotAllowedException` nêu tổng báo giá. Bỏ trống số tiền thì vẫn lấy bằng tổng. Kiểm tra: build không lỗi.
- [x] 1.5 `DbSeeder.SeedRolesAsync`: thêm vai trò SUPERVISOR.
  - Dừng backend, chạy `dotnet build SolutionDepot/SolutionDepot.sln` không lỗi, rồi khởi động lại.
  - Xác nhận bảng `Roles` có SUPERVISOR và không có dòng trùng.

## 2. Frontend (`fontend/`)

- [x] 2.1 `constants/menuPermissions.ts`: `approval: 'approval'`. Kiểm tra: type-check không lỗi.
- [x] 2.2 Nhận diện vai trò SUPERVISOR.
  - Thêm `'SUPERVISOR'` vào `RoleType` (`types/depot.ts`).
  - `LoginScreen.mapSystemRoleToRoleType`: `SUPERVISOR → 'SUPERVISOR'`.
  - `AuthProvider.ROLE_ID_BY_PROFILE_ROLE`: `SUPERVISOR → 'ROLE_SUPERVISOR'`.
  - Thêm mục `ROLE_SUPERVISOR` "Giám Sát / Trưởng Ca" vào `constants/permissions.ts`.
  - Sửa các chỗ `switch` / `Record<RoleType, …>` bị type-check báo thiếu.
  - `services/auth.service.ts normalizeRole` + `constants/roles.ts SYSTEM_ROLES`: giữ mã SUPERVISOR (trước đây vai trò lạ bị quy về DEPOT_MANAGER rồi thành "Khai Thác Cổng"); thêm hồ sơ hiển thị SUPERVISOR trong `data/roleMenuConfig.ts`.
  - Kiểm tra: `npx tsc --noEmit -p .` không lỗi.

## 3. Kiểm thử (API trên local + giao diện http://127.0.0.1:3000)

- [x] 3.1 Chuẩn bị.
  - Bật đủ BackendApi (:50210), FileServer (:50211) và frontend (:3000).
  - Tạo tài khoản tạm theo vai trò ESTIMATOR, CARRIER, CASHIER, SUPERVISOR, QC_ENG, TECHNICIAN.
  - Tạo container test `QAAR…` qua API: hồ sơ ESTIMATING đã thu tiền, có báo giá đã xác nhận / chưa xác nhận; hồ sơ REPAIRING có lệnh sửa.
- [x] 3.2 Phân quyền duyệt:
  - ESTIMATOR ghi nhận duyệt hoặc từ chối → 403;
  - CARRIER, CASHIER, SUPERVISOR ghi nhận duyệt báo giá đã xác nhận → 200, hồ sơ REPAIRING; ESTIMATOR vẫn lập và xác nhận được;
  - CARRIER và SUPERVISOR lưu hoặc xác nhận báo giá → 403.
- [x] 3.3 Từ chối báo giá chưa xác nhận → 400 nêu phải xác nhận, báo giá vẫn chờ duyệt. Từ chối báo giá đã xác nhận → 200.
- [x] 3.4 Duyệt số tiền 999.999.999 cho báo giá tổng nhỏ hơn → 400 nêu tổng. Duyệt số tiền thấp hơn tổng → 200 và lưu đúng số. Bỏ trống → lưu bằng tổng.
- [x] 3.5 QC_ENG bắt đầu, phân công, hoàn tất lệnh sửa → 403. QC_ENG upload ảnh lệnh sửa → 200. TECHNICIAN vẫn bắt đầu và hoàn tất được.
- [x] 3.6 Giao diện (đăng nhập từng tài khoản):
  - ESTIMATOR không thấy menu *Phê Duyệt Hãng Tàu*;
  - CASHIER và SUPERVISOR thấy menu và duyệt được 1 báo giá trên màn;
  - CARRIER không thấy menu lập báo giá;
  - QC_ENG không thấy *Lệnh Sửa Chữa* nhưng nghiệm thu QC được;
  - SUPERVISOR không bị hiện là vai trò khác ở màn đăng nhập hay hồ sơ người dùng.
- [x] 3.7 Dọn dữ liệu test:
  - xoá hồ sơ, giám định, vệ sinh, phiếu dịch vụ, khoản thu, báo giá, lệnh sửa, file ảnh (qua API, gồm file vật lý) và nhật ký của container `QAAR…`;
  - xoá tài khoản tạm;
  - giữ dòng vai trò SUPERVISOR (dữ liệu seed thật);
  - truy vấn DB xác nhận không còn bản ghi test, và 2 hồ sơ thật SUDU3070783 và BMOU1675248 không đổi.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-estimate-approval-roles`; cập nhật mục 8, 9 và *Phụ lục A — Vai trò và màn hình* trong `docs/quy-trinh-van-hanh-depot.md`.
- Khi deploy VPS (**BREAKING về quyền**): báo người dùng CARRIER và QC_ENG về menu bị bỏ; tài khoản đang mở cần đăng nhập lại.
