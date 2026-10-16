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

## Mục lục theo menu

| # | Nhóm menu | Số mục | Tài liệu |
|---|---|---|---|
| 1 | TỔNG QUAN | 2 | [01-tong-quan.md](01-tong-quan.md) |
| 2 | KHAI THÁC & GATE-IN | 5 | [02-khai-thac-gate-in.md](02-khai-thac-gate-in.md) |
| 3 | BÁO GIÁ & SỬA CHỮA | 5 | [03-bao-gia-sua-chua.md](03-bao-gia-sua-chua.md) |
| 4 | QUẢN LÝ CONTAINER & BÃI | 4 | [04-quan-ly-container-bai.md](04-quan-ly-container-bai.md) |
| 5 | CỔNG XUẤT & CẤP VỎ (GATE-OUT) | 4 | [05-cong-xuat-cap-vo-gate-out.md](05-cong-xuat-cap-vo-gate-out.md) |
| 6 | CÔNG NỢ HÃNG TÀU & BILLING | 1 | [06-cong-no-hang-tau-billing.md](06-cong-no-hang-tau-billing.md) |
| 7 | KHO VẬT TƯ & CƠ SỞ VẬT CHẤT | 1 | [07-kho-vat-tu-co-so-vat-chat.md](07-kho-vat-tu-co-so-vat-chat.md) |
| 8 | DANH MỤC MASTER DATA | 12 | [08-danh-muc-master-data.md](08-danh-muc-master-data.md) |
| 9 | KHÁCH HÀNG & ĐỐI TÁC | 3 | [09-khach-hang-doi-tac.md](09-khach-hang-doi-tac.md) |
| 10 | THÔNG BÁO & ZALO GATEWAY | 12 | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md) |
| 11 | BÁO CÁO & HIỆU SUẤT NHÂN SỰ | 5 | [11-bao-cao-hieu-suat-nhan-su.md](11-bao-cao-hieu-suat-nhan-su.md) |
| 12 | HỆ THỐNG & PHÂN QUYỀN | 1 | [12-he-thong-phan-quyen.md](12-he-thong-phan-quyen.md) |

## Tra nhanh: tab id → màn hình

| Tab id | Menu | Component | Tài liệu |
|---|---|---|---|
| `dashboard` | Dashboard ERP | `DashboardPage` | [01-tong-quan.md](01-tong-quan.md#dashboard-erp) |
| `workflow` | Sơ Đồ Vòng Đời Nghiệp Vụ | `BusinessWorkflowModal` | [01-tong-quan.md](01-tong-quan.md#sơ-đồ-vòng-đời-nghiệp-vụ) |
| `gate` | 1. Tiếp Nhận Cổng (Gate-In) | `GateInPage` | [02-khai-thac-gate-in.md](02-khai-thac-gate-in.md#1-tiếp-nhận-cổng-gate-in) |
| `survey` | 2. Giám Định (Survey e-EIR) | `SurveyModulePage` | [02-khai-thac-gate-in.md](02-khai-thac-gate-in.md#2-giám-định-survey-e-eir) |
| `cleaning` | 3. Tổ Vệ Sinh (Cleaning Bay) | `CleaningModulePage` | [02-khai-thac-gate-in.md](02-khai-thac-gate-in.md#3-tổ-vệ-sinh-cleaning-bay) |
| `operation` | 4. Khai Thác Gate-In (Tariff) | `OperationPage` | [02-khai-thac-gate-in.md](02-khai-thac-gate-in.md#4-khai-thác-gate-in-tariff) |
| `payment` | 5. Thanh Toán VietQR | `PaymentPage` | [02-khai-thac-gate-in.md](02-khai-thac-gate-in.md#5-thanh-toán-vietqr) |
| `estimate` | Lập Báo Giá Estimate | `EstimatePage` | [03-bao-gia-sua-chua.md](03-bao-gia-sua-chua.md#lập-báo-giá-estimate) |
| `approval` | Phê Duyệt Hãng Tàu | `ApprovalPage` | [03-bao-gia-sua-chua.md](03-bao-gia-sua-chua.md#phê-duyệt-hãng-tàu) |
| `repair` | Lệnh Sửa Chữa (WO) | `RepairPage` | [03-bao-gia-sua-chua.md](03-bao-gia-sua-chua.md#lệnh-sửa-chữa-wo) |
| `qc` | 9. QC Nghiệm Thu (AV Grade) | `QCPage` | [03-bao-gia-sua-chua.md](03-bao-gia-sua-chua.md#9-qc-nghiệm-thu-av-grade) |
| `shipping_api` | 10. Truyền API Hãng Tàu | `ShippingApiPage` | [03-bao-gia-sua-chua.md](03-bao-gia-sua-chua.md#10-truyền-api-hãng-tàu) |
| `container` | Danh Sách Container | `ContainerListPage` | [04-quan-ly-container-bai.md](04-quan-ly-container-bai.md#danh-sách-container) |
| `yard_map` | Sơ Đồ Bãi 2D (Konva) | `YardMapPage` | [04-quan-ly-container-bai.md](04-quan-ly-container-bai.md#sơ-đồ-bãi-2d-konva) |
| `yard_blocks` | Quản Lý Vị Trí Block | `YardBlocksPage` | [04-quan-ly-container-bai.md](04-quan-ly-container-bai.md#quản-lý-vị-trí-block) |
| `forklift` | Lệnh Điều Xe Nâng | `ForkliftPage` | [04-quan-ly-container-bai.md](04-quan-ly-container-bai.md#lệnh-điều-xe-nâng) |
| `gate_out` | 11. Tổng Quan Cổng Xuất | `GateOutPage` | [05-cong-xuat-cap-vo-gate-out.md](05-cong-xuat-cap-vo-gate-out.md#11-tổng-quan-cổng-xuất) |
| `gate_out_ready` | 1. Vỏ Chờ Cấp (Ready In Yard) | `GateOutPage` | [05-cong-xuat-cap-vo-gate-out.md](05-cong-xuat-cap-vo-gate-out.md#1-vỏ-chờ-cấp-ready-in-yard) |
| `gate_out_lane` | 2. Tiếp Nhận Làn Cổng Xuất | `GateOutPage` | [05-cong-xuat-cap-vo-gate-out.md](05-cong-xuat-cap-vo-gate-out.md#2-tiếp-nhận-làn-cổng-xuất) |
| `gate_out_history` | 3. Nhật Ký Xuất & Phiếu e-EIR | `GateOutPage` | [05-cong-xuat-cap-vo-gate-out.md](05-cong-xuat-cap-vo-gate-out.md#3-nhật-ký-xuất--phiếu-e-eir) |
| `billing` | Công Nợ Hãng Tàu (AR) | `BillingPage` | [06-cong-no-hang-tau-billing.md](06-cong-no-hang-tau-billing.md#công-nợ-hãng-tàu-ar) |
| `warehouse` | Kho Vật Tư Sửa Chữa EMR | `WarehousePage` | [07-kho-vat-tu-co-so-vat-chat.md](07-kho-vat-tu-co-so-vat-chat.md#kho-vật-tư-sửa-chữa-emr) |
| `master_data` | Tất Cả Danh Mục | `ContainerTypeMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#tất-cả-danh-mục) |
| `departments` | DM Phòng Ban Depot | `DepartmentMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#dm-phòng-ban-depot) |
| `tariff_lolo` | Cước Nâng Hạ (LoLo) | `LoloTariffMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#cước-nâng-hạ-lolo) |
| `tariff_storage` | Cước Lưu Bãi (Storage) | `StorageTariffMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#cước-lưu-bãi-storage) |
| `tariff_calculator` | Máy Tính Cước Nâng Hạ & Lưu Bãi | `TariffCalculatorPage` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#máy-tính-cước-nâng-hạ--lưu-bãi) |
| `cleaning_tariffs` | Biểu Phí Vệ Sinh Container | `CleaningMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#biểu-phí-vệ-sinh-container) |
| `container_types` | DM Loại Container (ISO) | `ContainerTypeMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#dm-loại-container-iso) |
| `damage_locations` | DM Vị Trí Cấu Kiện | `DamageLocationMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#dm-vị-trí-cấu-kiện) |
| `damage_codes` | DM Mã Hư Hỏng IICL | `DamageCodeMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#dm-mã-hư-hỏng-iicl) |
| `repair_codes` | DM Phương Án Sửa Chữa | `RepairCodeMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#dm-phương-án-sửa-chữa) |
| `grades` | DM Phân Hạng Vỏ (Grade) | `GradeMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#dm-phân-hạng-vỏ-grade) |
| `standards` | DM Tiêu Chuẩn Giám Định | `InspectionStandardMaster` | [08-danh-muc-master-data.md](08-danh-muc-master-data.md#dm-tiêu-chuẩn-giám-định) |
| `customer_list` | Khách Hàng (Trucking & FWD) | `CustomerPage` | [09-khach-hang-doi-tac.md](09-khach-hang-doi-tac.md#khách-hàng-trucking--fwd) |
| `customer_classifications` | DM Phân Loại Khách Hàng | `CustomerClassificationMaster` | [09-khach-hang-doi-tac.md](09-khach-hang-doi-tac.md#dm-phân-loại-khách-hàng) |
| `shipping_lines` | Hãng Tàu (Maersk Line) | `ShippingLineMaster` | [09-khach-hang-doi-tac.md](09-khach-hang-doi-tac.md#hãng-tàu-maersk-line) |
| `notifications` | Dashboard Thông Báo | `NotificationDashboard` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#dashboard-thông-báo) |
| `notifications_send` | Gửi Thông Báo Mới | `SendNotification` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#gửi-thông-báo-mới) |
| `notifications_employees` | Thông Báo Nhân Viên | `EmployeeNotifications` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#thông-báo-nhân-viên) |
| `notifications_customers` | Thông Báo Khách Hàng | `CustomerNotifications` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#thông-báo-khách-hàng) |
| `notifications_templates` | Thư Viện Mẫu Tin | `NotificationTemplates` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#thư-viện-mẫu-tin) |
| `notifications_history` | Lịch Sử Gửi Toàn Hệ Thống | `NotificationHistory` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#lịch-sử-gửi-toàn-hệ-thống) |
| `notifications_queue` | Hàng Đợi Gửi (Queue) | `NotificationQueue` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#hàng-đợi-gửi-queue) |
| `zalo_overview` | Tổng Quan Zalo OA | `ZaloOverviewPage` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#tổng-quan-zalo-oa) |
| `zalo_simulator` | Zalo Simulator & Chat | `ZaloSimulatorPage` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#zalo-simulator--chat) |
| `zalo_templates` | Mẫu Tin ZNS & OA | `ZaloTemplatesPage` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#mẫu-tin-zns--oa) |
| `zalo_settings` | Cấu Hình Zalo OA & Token | `ZaloSettings` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#cấu-hình-zalo-oa--token) |
| `zalo_logs` | Nhật Ký Webhook & API | `ZaloLogsPage` | [10-thong-bao-zalo-gateway.md](10-thong-bao-zalo-gateway.md#nhật-ký-webhook--api) |
| `report_staff_realtime` | ⚡ Công Việc Từng Người (Real-time) | `StaffRealtimeReportTab` | [11-bao-cao-hieu-suat-nhan-su.md](11-bao-cao-hieu-suat-nhan-su.md#-công-việc-từng-người-real-time) |
| `report` | Tổng Quan & Thông Lượng Bãi | `ReportPage` | [11-bao-cao-hieu-suat-nhan-su.md](11-bao-cao-hieu-suat-nhan-su.md#tổng-quan--thông-lượng-bãi) |
| `report_emr` | Năng Suất Sửa Chữa EMR | `ReportPage` | [11-bao-cao-hieu-suat-nhan-su.md](11-bao-cao-hieu-suat-nhan-su.md#năng-suất-sửa-chữa-emr) |
| `report_dwell_time` | Thời Gian Lưu Bãi (Dwell Time) | `ReportPage` | [11-bao-cao-hieu-suat-nhan-su.md](11-bao-cao-hieu-suat-nhan-su.md#thời-gian-lưu-bãi-dwell-time) |
| `report_revenue` | Doanh Thu & Biểu Cước | `ReportPage` | [11-bao-cao-hieu-suat-nhan-su.md](11-bao-cao-hieu-suat-nhan-su.md#doanh-thu--biểu-cước) |
| `system` | Phân Quyền RBAC & Users | `SystemPage` | [12-he-thong-phan-quyen.md](12-he-thong-phan-quyen.md#phân-quyền-rbac--users) |

## Endpoint backend không được menu nào gọi trực tiếp

Các route dưới đây tồn tại ở backend nhưng không màn hình nào trong menu gọi tới (webhook bên ngoài, API phụ trợ, hoặc endpoint cũ). Liệt kê để tránh hiểu nhầm là thiếu tài liệu.

| HTTP | Route | Controller.Action |
|---|---|---|
| POST | `/api/integration/vietqr/webhook` | `VietQRWebhook.HandleBankWebhook` |
| GET | `/api/cleaning/{id:long}` | `Cleaning.GetById` |
| DELETE | `/api/customers/{id:long}` | `Customers.Delete` |
| DELETE | `/api/customers/drivers/{id:long}` | `Customers.DeleteDriver` |
| PUT | `/api/customers/vehicles/{id:long}` | `Customers.UpdateVehicle` |
| DELETE | `/api/customers/vehicles/{id:long}` | `Customers.DeleteVehicle` |
| POST | `/api/customers/bookings` | `Customers.CreateBooking` |
| PUT | `/api/customers/bookings/{id:long}` | `Customers.UpdateBooking` |
| DELETE | `/api/customers/bookings/{id:long}` | `Customers.DeleteBooking` |
| GET | `/api/depot-files` | `DepotFiles.GetFiles` |
| GET | `/api/DepotJobs/{id:long}/history` | `DepotJobs.GetHistory` |
| DELETE | `/api/DepotJobs/{id:long}` | `DepotJobs.DeleteJob` |
| POST | `/api/DepotJobs/{id}/repair/assign` | `DepotJobs.AssignRepair` |
| POST | `/api/DepotJobs/forklift-move` | `DepotJobs.MoveYard` |
| GET | `/api/DepotJobs/stats` | `DepotJobs.GetStats` |
| PUT | `/api/service-orders/{id:long}` | `ServiceOrders.Update` |
| GET | `/api/system/permissions` | `System.GetPermissions` |
| GET | `/api/system/menus` | `System.GetMenus` |
| POST | `/api/Users/authenticate` | `Users.Login` |
| POST | `/api/Webhooks/bank-vietqr` | `Webhooks.ProcessBankWebhook` |
| GET | `/api/workflow/summary` | `Workflow.GetSummary` |
| POST | `/api/Yard/occupancy` | `Yard.UpdateOccupancy` |
| GET | `/api/Yard/containers/search` | `Yard.SearchContainers` |
| GET | `/api/Yard/containers/{id}` | `Yard.GetContainerById` |
| POST | `/api/files/upload` | `Files.Upload` |
| GET | `/api/files/{fileId}/{storedName}` | `Files.Download` |
| DELETE | `/api/files/{fileId}/{storedName}` | `Files.Delete` |
