# Proposal

## Why

Đợt kiểm tra module Sửa chữa ngày 17/10/2026 cho thấy quyền `estimate` đang gộp ba việc vào một: lập báo giá, xác nhận báo giá, và ghi nhận hãng tàu duyệt hoặc từ chối. Hệ quả đã tái hiện được qua API:
- **G3:** người lập báo giá (ESTIMATOR) tự ghi nhận hãng tàu duyệt báo giá của chính mình.
- **G5:** đại diện hãng tàu (CARRIER) qua được kiểm tra quyền khi sửa nội dung báo giá của depot.
- **G6:** kỹ sư QC có quyền `repair`, nên hoàn tất được lệnh sửa thay thợ.

Ngoài ra luồng duyệt còn hai lỗ hổng:
- **C3:** từ chối được báo giá chưa xác nhận.
- **C10:** ghi nhận được số tiền duyệt lớn hơn tổng báo giá (đã thử 999.999.999 cho báo giá 151.200).

Người dùng chọn tách thành quyền riêng "Ghi nhận duyệt", gán cho CARRIER, CASHIER và một vai trò mới SUPERVISOR.

## What Changes

- **Quyền mới `approval`** (Ghi nhận hãng tàu duyệt / từ chối):
  - `POST /api/DepotJobs/{id}/approve-estimate` và `reject-estimate` chuyển sang yêu cầu `approval`, thay cho `estimate`;
  - menu *Phê Duyệt Hãng Tàu* (`approval`) đổi nhóm sang `approval`.
- **Ma trận vai trò** (`RolePermissions`), danh sách đầy đủ ở design:
  - ADMIN: thêm `approval`;
  - ESTIMATOR: không có `approval`;
  - CARRIER: bỏ `estimate`, thêm `approval` (**BREAKING** cho CARRIER: mất menu lập báo giá, danh mục báo giá và cổng truyền API hãng tàu);
  - CASHIER: thêm `approval`;
  - QC_ENG: bỏ `repair` (**BREAKING** cho QC_ENG: mất menu *Lệnh Sửa Chữa*, không gọi được bắt đầu, phân công, hoàn tất sửa; vẫn chụp ảnh và xem ảnh lệnh sửa được qua quyền `qc`);
  - vai trò mới **SUPERVISOR** (Giám sát / Trưởng ca): `dashboard`, `jobs`, `approval`.
- **Vai trò SUPERVISOR:**
  - thêm vào danh sách vai trò seed, nên backend khởi động sẽ tự thêm dòng vào bảng `Roles` (cả local lẫn VPS);
  - frontend nhận diện được vai trò này: nhãn vai trò, không bị coi là "Khai Thác Cổng".
- **Từ chối báo giá** phải giống duyệt: báo giá phải đã được xác nhận, ngược lại thì từ chối kèm thông báo rõ.
- **Số tiền duyệt** lớn hơn tổng báo giá bị từ chối kèm thông báo nêu tổng báo giá. Bỏ trống số tiền duyệt thì vẫn lấy bằng tổng như hiện nay.

## Capabilities

### New Capabilities

(không có; `access-control` chưa có đặc tả nền, nên quyền theo từng nghiệp vụ ghi vào capability của nghiệp vụ đó)

### Modified Capabilities

- `carrier-approval`:
  - thêm requirement: quyền ghi nhận duyệt / từ chối tách khỏi quyền lập báo giá, kèm danh sách vai trò;
  - sửa "Hãng tàu từ chối báo giá": bắt buộc báo giá đã xác nhận;
  - sửa "Kiểm tra dữ liệu lệnh duyệt": chặn số tiền duyệt vượt tổng báo giá.
- `repair-estimate`: thêm requirement chỉ bộ phận báo giá (quyền `estimate`) được lập, sửa, xác nhận báo giá; hãng tàu và người ghi nhận duyệt không có quyền này.
- `repair-work-order`: thêm requirement chỉ vai trò có quyền `repair` (thợ, quản lý) được bắt đầu, phân công, hoàn tất lệnh sửa; kỹ sư QC không có quyền này.

## Impact

- **Backend (`SolutionDepot/`):**
  - `Depot.Application/Services/RolePermissions.cs`: thêm hằng `Approval`, cập nhật ma trận, thêm SUPERVISOR;
  - `Depot.BackendApi/Controllers/DepotJobsController.cs`: đổi quyền của `ApproveEstimate` và `RejectEstimate`;
  - `Depot.Application/Services/DepotJobService.cs`: `RejectEstimateAsync` kiểm tra đã xác nhận; `ApproveEstimateAsync` chặn số tiền vượt tổng;
  - `Depot.Data/EF/DbSeeder.cs`: thêm vai trò SUPERVISOR vào danh sách seed.
- **Frontend (`fontend/`):**
  - `constants/menuPermissions.ts`: `approval` → `'approval'`;
  - nhận diện SUPERVISOR ở `components/LoginScreen.tsx`, `types/depot.ts` (`RoleType`), `app/providers/AuthProvider.tsx`, `constants/permissions.ts` (`ROLES`).
- **Bảng dữ liệu:**
  - không đổi cấu trúc, **không cần migration**;
  - bảng `Roles` có thêm 1 dòng SUPERVISOR do seeder thêm khi khởi động;
  - không sửa dữ liệu cũ: báo giá đã duyệt hoặc từ chối giữ nguyên, tài khoản đang có giữ nguyên vai trò.
- **Ngoài phạm vi:**
  - chuyển ma trận quyền sang cấu hình trong DB (`Roles.PermissionsJson`), vì hiện ma trận vẫn khai báo trong code;
  - lỗi nhãn "VAI TRÒ" trên sidebar hiện sai sau khi đăng nhập (tài khoản QC hiện "Khai Thác Cổng"), để cho một change `depot-fe-*` riêng;
  - thông báo lỗi chung chung khi lập báo giá (A3, B2); kiểm tra mã theo danh mục (B5, B6);
  - mã lý do từ chối (vd `CEDEX_PRICE_EXCEEDED`) đang được màn Phê duyệt gửi vào field `rejectedBy`.
