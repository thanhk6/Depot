# Tài liệu Frontend & Backend theo Menu — SolutionDepot

Tài liệu tra cứu cho lập trình viên: đi theo **đúng thứ tự menu Sidebar** đang chạy trên giao diện, mỗi mục menu
cho biết màn hình React nào hiển thị, gọi những API nào, API đó vào Controller/Service nào của backend .NET và
đọc/ghi những bảng PostgreSQL nào.

> Bảng "API & Backend" trong từng file được **trích tự động từ mã nguồn** (xem [Cách cập nhật](#cach-cap-nhat-tai-lieu)),
> nên khớp với code tại thời điểm sinh. Phần mô tả mục đích, ghi chú nghiệp vụ là viết tay.
> Lịch sử rà soát / sửa lỗi từng màn vẫn nằm ở [`docs/backend-progress/`](../backend-progress/INDEX.md).

## Kiến trúc tổng thể

```
Trình duyệt
  │  React 19 + Vite (fontend/src)
  ▼
fontend/server.ts  (Express, cổng 3000 dev / 3001 VPS)
  ├─ GET /api/files/*  ──────────────►  Depot.FileServer   (127.0.0.1:50211, lưu file vật lý)
  └─ /api/*            ──────────────►  Depot.BackendApi   (127.0.0.1:50210, ASP.NET Core 8)
                                          Controllers  (mỏng, chỉ nhận request + trả envelope)
                                            └─ Services (Depot.Application — luật nghiệp vụ)
                                                 └─ DepotDbContext (EF Core) ─► PostgreSQL SolutionDepotDb
```

| Lớp | Vị trí | Vai trò |
|---|---|---|
| Menu | `fontend/src/components/layout/Sidebar.tsx` | Khai báo nhóm menu, `id` của từng tab, badge đếm |
| Định tuyến | `fontend/src/App.tsx` (`renderContent` → `switch (activeTab)`) | Mỗi `case '<tab id>'` render 1 trang; không dùng React Router |
| Trang / component | `fontend/src/modules/<module>/pages`, `components` | Giao diện từng nghiệp vụ |
| Gọi API | `fontend/src/api/*.api.ts` (+ `modules/yard/services/yardApi.ts`, `modules/notifications/services/notificationService.ts`) | Hàm gọi HTTP; URL gốc ở `api/endpoints.ts` |
| HTTP client | `fontend/src/api/axios.ts` | Gắn `Authorization: Bearer <JWT>`, xử lý 401 chung |
| Proxy | `fontend/server.ts` | Chuyển `/api/*` sang BackendApi, `GET /api/files/*` sang FileServer |
| Controller | `SolutionDepot/3. Hosts/Depot.BackendApi/Controllers` | Route + envelope `{ statusCode, message, data }` |
| Service | `SolutionDepot/2. Domain/Depot.Application/Services` | Toàn bộ luật nghiệp vụ, chuyển trạng thái |
| Entity / DB | `SolutionDepot/2. Domain/Depot.Data` (Entities, Configurations, Migrations) | EF Core + PostgreSQL; migration tự chạy khi backend khởi động (`DbInitializer`) |
| DTO / Request | `SolutionDepot/1. Infrastructure/Depot.ViewModels` | Hình dạng dữ liệu vào/ra API |
| Lưu file | `SolutionDepot/3. Hosts/Depot.FileServer` | Ảnh giám định, ảnh sau sửa… (metadata ở bảng `DepotFiles`) |

## Quy ước chung

- **Envelope duy nhất**: mọi API trả `{ statusCode, message, data }` (`ResponseSingleContentModel<T>`). Frontend
  quyết định thành công theo `statusCode` trong body. Chi tiết: [00-quy-tac-backend.md](../backend-progress/00-quy-tac-backend.md).
- **Đăng nhập**: `POST /api/Users/authenticate` (màn đăng nhập, không thuộc menu) trả JWT; mọi API khác yêu cầu JWT.
  Người thao tác trên các phiếu (thợ, tài xế xe nâng, người tạo phiếu…) lấy từ tài khoản đang đăng nhập
  (`useDepot().loggedInUserProfile`).
- **Không dùng dữ liệu mẫu ở frontend**: màn hình chỉ hiển thị dữ liệu backend; danh mục chưa có backend thì để
  trống / nhập tay kèm dòng "Chưa có dữ liệu". Riêng nhóm Zalo OA vẫn là demo/simulator (quyết định có chủ đích).
- **Trạng thái hồ sơ container** (`depot_jobs.Status`): `GATE_IN` → `SURVEYING` → `ESTIMATING` → `APPROVED` →
  `REPAIRING` → `QC_PENDING` → (`CLEANING`) → `READY_FOR_OUT` → `GATE_OUT`. Chỉ Service được đổi trạng thái.
- **Danh mục dùng chung** `MasterCatalogItems` phân loại theo `CatalogType` (CONTAINER_TYPE, DAMAGE_CODE…).
  `IsActive=false` = *Tạm ngưng*, `IsDeleted=true` = *Đã xóa*; màn quản trị đọc thêm `?includeInactive=true`.
  Cước Nâng Hạ và Cước Lưu Bãi có bảng riêng (`ServiceTariffs`, `StorageTariffRules` / `StorageTariffTiers`).
- Cột "Bảng DB" ghi theo tên bảng thật trong PostgreSQL (vd `depot_jobs`); tên còn dạng entity (vd `DamageItem`)
  là bảng con được truy cập qua `Set<Entity>()` hoặc quan hệ.

<a id="du-lieu-dung-chung-apptsx"></a>
## Dữ liệu dùng chung (App.tsx)

`App.tsx` nạp **một lần** danh sách hồ sơ container (`GET /api/DepotJobs` → `containerApi.getAll`, chuyển sang
`ContainerRecord` bằng `mapJobToContainerRecord`) rồi truyền `containers` xuống các trang Gate-In, Thanh toán,
Phê duyệt, Sửa chữa, QC, Danh sách container, Xe nâng, Gate-Out, Báo cáo. Sau mỗi thao tác nghiệp vụ, trang gọi
callback để `App.tsx` đọc lại đúng 1 hồ sơ (`refreshContainer` → `GET /api/DepotJobs/{id}`) thay vì tự đoán trạng thái.
Các lời gọi này đã được ghi vào bảng của từng menu tương ứng.

<a id="cach-cap-nhat-tai-lieu"></a>
## Cách cập nhật tài liệu

Các bảng API được sinh bằng bộ script đọc mã nguồn (TypeScript AST cho frontend, phân tích Controller/Service C#
cho backend) theo chuỗi: Sidebar → `App.tsx` → component (và mọi file con nó import) → hàm trong `api/*.ts`
(kể cả lời gọi `apiClient` trực tiếp trong component) → URL → route Controller → method Service → `DbSet` được
truy cập. Khi thêm menu/API mới, sinh lại tài liệu bằng `node docs/menu/_tools/generate.cjs` thay vì sửa tay bảng;
chỉ phần mô tả/ghi chú là viết tay (file `docs/menu/_tools/notes.json`).
