# 53 — HỆ THỐNG & PHÂN QUYỀN — `system` (Phân Quyền RBAC & Users)

Màn cuối cùng trong danh sách 53 màn theo `INDEX.md`. Render `SystemPage.tsx`, 4 sub-tab: Danh Sách
Người Dùng, Ma Trận Phân Quyền (RBAC Matrix), Nhật Ký Hoạt Động, Chính Sách Bảo Mật.

## Đối chiếu backend theo từng phần

### 1. Danh sách người dùng — đọc thật, ghi hoàn toàn không lưu

`useEffect` gọi `userApi.getUsers()` → `GET /api/system/users` (`SystemController.GetUsers` →
`UserService.GetUsersAsync`, đọc bảng `SystemUsers` join `Roles` thật) — hiển thị đúng danh sách user
thật trong DB.

Nhưng **toàn bộ 6 hành động ghi** trên tab này chỉ đổi `useState` cục bộ, không gọi API nào, mất khi
tải lại trang:
- `handleSaveUser` (Tạo mới/Chỉnh sửa) — không gọi `userApi.createUser`/`userApi.updateUser` dù 2 hàm
  này **đã có sẵn** trong `fontend/src/api/user.api.ts` và có endpoint khớp ở backend
  (`POST /api/system/users`, `PUT /api/system/users/{id}` — `SystemController.CreateUser`/`UpdateUser`).
- `handleToggleLockUser` (Khóa/Mở khóa) — cũng nên gọi `userApi.updateUser` (field `isActive`) nhưng
  không gọi.
- `handleDeleteUser` (Xóa) — backend **không có endpoint DELETE** cho `/api/system/users` (chỉ
  GET/POST/PUT) — nút Xóa không có nơi để gọi tới dù có được wiring lại.
- `handleConfirmResetPassword` — backend không có endpoint reset password (chỉ có
  `PasswordHashHelper.HashPassword("123456")` hard-code khi `CreateUserAsync`, không có cách đổi mật
  khẩu cho user đã tồn tại).

**Lý do chưa tự nối `createUser`/`updateUser` dù endpoint có sẵn:** phát hiện lệch dữ liệu giữa
`RoleCode` frontend và backend — xem mục 2 ngay dưới. Nối thẳng vào lúc này sẽ khiến Tạo/Sửa user thất
bại (`BadRequest`) với 7/10 vai trò đang hiển thị trong dropdown, nên đây không phải "sửa nhỏ khớp field"
mà là vấn đề cần xác nhận hướng xử lý trước.

### 2. Lệch dữ liệu Vai trò (RoleCode) — phát hiện quan trọng

`fontend/src/constants/permissions.ts` (`ROLES`, dùng chung cho `UserModal`, ma trận quyền, `AuthProvider.switchRole`)
khai báo 10 role code: `ADMIN, SURVEYOR, GATE_OP, CASHIER, ESTIMATOR, CARRIER, TECHNICIAN, QC_ENG,
FORKLIFT, CLEANING`.

`DbSeeder.cs` (bảng `Roles` thật) seed 11 role code khác: `ADMIN, DEPOT_MANAGER, SURVEYOR, OPERATOR,
ACCOUNTANT, ESTIMATOR, REPAIR_TECH, QC_INSPECTOR, FORKLIFT_DRIVER, SHIPPING_LINE, CLEANING_STAFF`.

Chỉ **3 mã khớp nhau**: `ADMIN`, `SURVEYOR`, `ESTIMATOR`. 7 mã còn lại lệch tên hoàn toàn (`GATE_OP` ↔
`OPERATOR`, `CASHIER` ↔ `ACCOUNTANT`, `CARRIER` ↔ `SHIPPING_LINE`, `TECHNICIAN` ↔ `REPAIR_TECH`,
`QC_ENG` ↔ `QC_INSPECTOR`, `FORKLIFT` ↔ `FORKLIFT_DRIVER`, `CLEANING` ↔ `CLEANING_STAFF`), và
`DEPOT_MANAGER` (backend) không tồn tại trong danh sách vai trò phía frontend.
`UserService.CreateUserAsync`/`UpdateUserAsync` so khớp `request.RoleName.Trim() == Roles.RoleCode` —
không tìm thấy role sẽ trả `null` → `BadRequest 400`.

**Việc lớn, cần hỏi hướng xử lý trước khi sửa** (đổi 1 trong 2 phía sẽ ảnh hưởng chỗ khác):
- Đổi `ROLES` phía frontend theo đúng `RoleCode` backend → ảnh hưởng toàn bộ ma trận quyền hiện có (10
  role định nghĩa sẵn permissions) và `switchRole` trong `AuthProvider` — cần rà lại các nơi dùng `roleId`.
  Sau đó mới nối được `handleSaveUser`/`handleToggleLockUser` vào API thật.

### 3. Ma trận phân quyền (`PermissionMatrixTable`) — 100% frontend, không có nơi lưu

`handleUpdateRolePermissions` chỉ đổi `useState roles` cục bộ. Backend `GET /api/system/permissions`
tồn tại nhưng chỉ trả **danh sách permission tĩnh hard-code trong `SystemController.GetPermissions()`**
(không đọc từ DB) — không có bảng `RolePermissions` hay cột permissions trên entity `Role`, không có
endpoint ghi. Cần entity mới (`Role` thêm quan hệ N-N với `Permission`, hoặc cột JSON) — **việc lớn, cần
hỏi**.

### 4. Nhật ký hoạt động (Audit) — nửa thật nửa giả, dễ gây hiểu lầm

`auditLogs` khởi tạo từ `containerApi.getAll()` → lấy `job.auditLogs` thật (bảng `JobAuditLog` thật, đã
audit ở các màn trước) — phần này đúng dữ liệu thật. Nhưng **mọi hành động thực hiện ngay trên trang
System** (tạo/sửa/khóa user, đổi quyền, đổi chính sách bảo mật) gọi `addAuditLog()` chỉ thêm vào
`useState` cục bộ, **không ghi xuống bảng `JobAuditLog` hay bảng audit nào khác** — mất khi tải lại
trang, dù giao diện trông như đã ghi log vĩnh viễn (có thể gây hiểu lầm nghiêm trọng cho người quản trị
thật khi tưởng hành động đã được truy vết).

### 5. Chính sách bảo mật (`SecurityPolicyConfigView`) — 100% frontend

`handleSaveSecurityPolicy` chỉ đổi `useState` cục bộ (`INITIAL_SECURITY_POLICY` từ `rbacMockData.ts`).
Không có entity/Controller nào cho cấu hình bảo mật (password policy, session timeout, IP whitelist) ở
backend — **việc lớn, cần hỏi** có thật sự cần áp dụng các policy này (session timeout, IP whitelist)
vào middleware thật hay chỉ là màn cấu hình demo.

### 6. Menu API không được dùng

`GET /api/system/menus` tồn tại (trả danh sách menu tĩnh, chỉ 12 mục) nhưng không có nơi nào trong
frontend gọi `menuApi.getMenus()` — Sidebar dùng cấu hình cứng trong `Sidebar.tsx` (đúng theo quy tắc
chung đã ghi ở đầu `INDEX.md`). Không phải lỗi, chỉ ghi nhận endpoint mồ côi không dùng tới.

## Đã làm (2026-08-23, sau khi người dùng xác nhận hướng đồng bộ "sửa backend theo frontend")

**1. Đồng bộ RoleCode (nguyên nhân gốc chặn Tạo/Sửa/Xoá User):**
`DbSeeder.SeedRolesAsync` viết lại theo đúng 10 RoleCode của `fontend/src/constants/permissions.ts`
(`ADMIN, SURVEYOR, GATE_OP, CASHIER, ESTIMATOR, CARRIER, TECHNICIAN, QC_ENG, FORKLIFT, CLEANING`).
Xử lý dữ liệu cũ an toàn (không phá FK `SystemUser.RoleId` đã gán): đổi tên tại chỗ 7 RoleCode cũ
(`OPERATOR→GATE_OP, ACCOUNTANT→CASHIER, REPAIR_TECH→TECHNICIAN, QC_INSPECTOR→QC_ENG,
FORKLIFT_DRIVER→FORKLIFT, SHIPPING_LINE→CARRIER, CLEANING_STAFF→CLEANING`), gộp `DEPOT_MANAGER` vào
`ADMIN` (chuyển hết `SystemUser` đang gán role đó sang `ADMIN` rồi xoá role thừa). `UserService.GetRoleTabs`
và seed user mẫu (`admin/operator/accountant/...`) cũng đổi theo RoleCode mới.

**2. Module RBAC mở rộng (entity mới, theo `00b-quy-tac-tao-bang.md`):**
- `Role.PermissionsJson` (cột mới, nullable) — lưu mảng permission code đã gán cho role, null = chưa
  từng lưu (frontend dùng bộ quyền tĩnh mặc định).
- `SystemAuditLog` (long PK, Code business key) — nhật ký hành động trên trang System (tạo/sửa/khoá/xoá
  user, đổi quyền, đổi chính sách bảo mật), tách biệt với `JobAuditLog` (chỉ gắn 1 DepotJob).
- `SystemSecurityPolicy` (long PK, Code cố định "DEFAULT" — 1 bản ghi duy nhất) — độ dài mật khẩu, hết
  hạn, khoá tài khoản, session timeout, IP whitelist.
- Migration `AddSystemRbacExtras` đã tạo.
- `SystemController` thêm: `DELETE /users/{id}`, `POST /users/{id}/reset-password`,
  `PUT /roles/{roleCode}/permissions`, `GET/PUT /security-policy`, `GET/POST /audit-logs`.

**3. Frontend nối dây thật (`SystemPage.tsx`):**
- Tạo/Sửa/Khoá-Mở khoá/Xoá User đều gọi API thật (`userApi.createUser/updateUser/deleteUser`), báo lỗi
  rõ ràng nếu backend từ chối thay vì âm thầm sửa state cục bộ.
- Reset mật khẩu gọi `userApi.resetPassword` (mật khẩu admin nhập tay được lưu thật, không còn chỉ hiện
  toast).
- Ma trận phân quyền: nạp `Permissions` đã lưu từ `GET /api/system/roles` đè lên bộ quyền tĩnh mặc định;
  `handleUpdateRolePermissions` gọi `PUT /roles/{roleCode}/permissions` lưu thật.
- Audit Log: nạp cả `JobAuditLog` (qua `containerApi.getAll()`, giữ nguyên) lẫn `SystemAuditLog` mới
  (`GET /audit-logs`), gộp và sắp theo thời gian; `addAuditLog()` vẫn cập nhật UI ngay (optimistic) đồng
  thời `POST /audit-logs` lưu thật xuống DB (best-effort, không chặn UI nếu lỗi mạng).
- Chính sách bảo mật: nạp từ `GET /security-policy` lúc mount, `handleSaveSecurityPolicy` gọi
  `PUT /security-policy` lưu thật.
- Client mới: `roleApi.updatePermissions`, `securityPolicyApi.get/save`, `systemAuditLogApi.getAll/create`,
  `userApi.deleteUser/resetPassword` (`fontend/src/api/user.api.ts`).
- Build backend + `tsc --noEmit` frontend đều 0 lỗi.

## Còn thiếu (không chặn, ghi nhận để làm sau nếu cần)

- Mật khẩu mặc định khi tạo user mới vẫn cố định `123456` (như trước) — chưa có luồng gửi mật khẩu qua
  email/SMS, admin phải tự thông báo cho nhân viên.
- `ForceChangeOnNextLogin` trong `ResetPasswordRequest` nhận nhưng chưa lưu/enforce (chưa có cột
  `MustChangePassword` trên `SystemUser` và chưa có middleware kiểm tra lúc đăng nhập) — không ảnh hưởng
  luồng reset mật khẩu chính, chỉ là cờ chưa có tác dụng.
- Chính sách bảo mật (session timeout, IP whitelist) đã lưu DB thật nhưng CHƯA được áp dụng vào middleware
  đăng nhập/JWT thật (hệ thống chưa có JWT — xem `00-infrastructure.md`) — đây vẫn là màn cấu hình, chưa
  phải enforcement thật.

## Trạng thái: ✅ Xong (RoleCode đồng bộ, CRUD User + RBAC + Audit Log + Security Policy đều nối API thật)

- [x] Đọc danh sách User (`GET /api/system/users`) — đúng dữ liệu thật.
- [x] RoleCode backend đồng bộ đúng 10 mã frontend, dữ liệu cũ được di chuyển an toàn (không mất user).
- [x] Tạo/Sửa/Khóa/Xoá User + Reset mật khẩu — nối API thật.
- [x] Ma trận phân quyền lưu xuống DB (`Role.PermissionsJson`).
- [x] Audit log hành động trên trang System ghi xuống DB thật (`SystemAuditLog`), không còn chỉ ảo trên UI.
- [x] Chính sách bảo mật lưu DB thật (`SystemSecurityPolicy`).

---

Đã rà xong toàn bộ 53/53 màn hình theo `INDEX.md`. "Việc lớn" còn lại sau khi hoàn thành `cleaning` (5)
và `system` (53): `yard_map`/`yard_blocks` (9-10), `billing` (21), `warehouse` (22), nhóm Zalo Gateway
(36-40 — theo quyết định người dùng, giữ nguyên dạng demo/simulator, không xây backend thật), phần lớn
nhóm Thông Báo (41/43/44/45/47), nhóm Báo Cáo (48-52).
