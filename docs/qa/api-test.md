# API Test — SolutionDepot

Kiểm thử trực tiếp API backend (không qua giao diện), dùng Node.js `fetch` với JWT của từng vai trò. Các test case chi tiết
nằm trong [test-cases.md](test-cases.md); bug nằm trong [bug-report.md](bug-report.md).

## 1. Phạm vi

| Host | Cổng (local) | Số route | Ghi chú |
|---|---|---|---|
| Depot.BackendApi | 50210 | 144 | 17 controller, qua proxy `/api/*` của `fontend/server.ts` |
| Depot.FileServer | 50211 | 3 | `/api/files/*` — lưu file vật lý |
| Depot.ApiIntegration | — | 1 | Webhook VietQR; **không có trong `docker-compose.vps.yml`** nên không test trên VPS |

Danh sách route được trích từ source code (attribute `[Http*]`/`[Route]` của từng controller) — xem Phụ lục.

Quy ước phản hồi: envelope `{ statusCode, message, data }`; HTTP status trùng `statusCode`.

## 2. Kiểm tra xác thực trên toàn bộ route (VPS, không token)

Gọi **144/144** route của BackendApi trên http://160.187.146.176:3001 **không kèm token**, tham số ID dùng `999999999`,
body rỗng — không thay đổi dữ liệu production.

| Controller | Số route | Kết quả |
|---|---|---|
| BillingController | 10 | 401 × 10 |
| CleaningController | 7 | 401 × 7 |
| CustomersController | 20 | 401 × 20 |
| DepotFilesController | 3 | 401 × 3 |
| DepotJobsController | 25 | 401 × 25 |
| MasterDataController | 20 | 401 × 20 |
| NotificationsController | 16 | 401 × 16 |
| PaymentsController | 1 | 401 |
| ReportsController | 4 | 401 × 4 |
| ServiceOrdersController | 4 | 401 × 4 |
| ShippingIntegrationController | 1 | 401 |
| SystemController | 13 | 401 × 13 |
| UsersController (login) | 1 | 401 — body rỗng, "Tên đăng nhập và mật khẩu không được để trống" |
| WarehouseController | 7 | 401 × 7 |
| WebhooksController | 1 | 401 — thiếu secret |
| WorkflowController | 2 | 401 × 2 |
| YardController | 9 | 401 × 9 |

**Kết luận:** không route nào của BackendApi lộ dữ liệu khi không có token (TC-324 PASS). Ngoại lệ nằm ngoài BackendApi:
`GET /api/files/{fileId}/{storedName}` (FileServer, qua proxy của `server.ts`) trả file **không cần token** — BUG-013.

## 3. Xác thực JWT

| Trường hợp | Local | VPS | TC |
|---|---|---|---|
| Không token | 401 | 401 | TC-022, TC-324 |
| Token rác | 401 | 401 | TC-023, TC-325 |
| `alg=none` giả ADMIN | 401 | 401 | TC-024, TC-325 |
| Sửa payload, giữ chữ ký cũ | 401 | 401 | TC-025, TC-325 |
| Token hết hạn | 401 | — | TC-026 |
| Token sau khi đăng xuất | **200** ❌ | — | TC-028 → BUG-011 |
| `POST /api/auth/refresh-token`, `GET /api/auth/me` | **404** ❌ | — | TC-029/030 → BUG-030 |

Đăng nhập (`POST /api/users/login`) — local và VPS cho kết quả như nhau:

| Input | HTTP | Thông báo |
|---|---|---|
| User không tồn tại / sai mật khẩu | 401 | "Tên đăng nhập hoặc mật khẩu không đúng" (giống nhau — không lộ user tồn tại) |
| Bỏ trống username/password, body rỗng | 401 | "Tên đăng nhập và mật khẩu không được để trống" |
| Trường `null`, JSON hỏng | 400 | Lỗi model binding |
| Chuỗi SQL injection, 10.000 ký tự, Unicode | 401 | Không lỗi 500 |
| Sai lần thứ 6 liên tiếp | 429 | "Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 30 phút" |

## 4. Phân quyền theo vai trò (local)

| Nhóm API | Kết quả | TC |
|---|---|---|
| `/api/system/*` (người dùng, vai trò, audit, chính sách) với 9 vai trò không phải ADMIN | 403 ✅ | TC-031…TC-040 |
| `GET /api/system/users` không trả mật khẩu/hash/token | ✅ | TC-041 |
| Các controller còn lại (billing, reports, warehouse, MasterData, depot-files…) với vai trò không liên quan | **200** ❌ | TC-042…TC-049, TC-239 → BUG-001 |

## 5. Mã lỗi & validation

### 5.1 Tài nguyên không tồn tại

| Request | HTTP | Kết quả |
|---|---|---|
| `GET /api/DepotJobs/999999999`, `/abc`, `/-1` | 404 | ✅ TC-220…TC-222 |
| `GET /api/cleaning/999999999` | 404 | ✅ TC-223 |
| `GET /api/yard/containers/999999999` | 404 | ✅ TC-224 |
| `GET /api/DepotJobs/999999999/history` | **200** | ❌ TC-225 → BUG-029 |
| Thao tác ghi trên ID không tồn tại | 400 | ✅ TC-245 |

### 5.2 HTTP 500 phát hiện được

| Request | Điều kiện | TC |
|---|---|---|
| `POST /api/DepotJobs/{id}/repair/start` | Gọi lần 2 khi đã có RepairOrder | TC-100 → BUG-009 |

Không phát hiện 500 nào khác trong 325 test case. Phản hồi lỗi không lộ stack trace hay tên lớp .NET (TC-244).

### 5.3 Validation — tổng hợp

| API | Validation đúng (400/409) | Validation thiếu (200) |
|---|---|---|
| `POST /DepotJobs/gate-in` | Số container sai check digit/định dạng, trùng container đang trong bãi, thiếu hãng tàu/loại, hạng sai | SĐT chữ, tên 1.000 ký tự (BUG-025); gửi đồng thời (BUG-004) |
| `PATCH /DepotJobs/{id}/status` | Trạng thái ngoài danh sách | Nhảy cóc quy trình (BUG-003) |
| `POST /DepotJobs/{id}/survey` | Sai trạng thái, thiếu dữ liệu | Có chặn nhưng thông báo sai (BUG-023) |
| `POST /DepotJobs/{id}/estimate` | Sai trạng thái | GrandTotal client tuỳ ý (BUG-008) |
| `POST /DepotJobs/{id}/survey/claim` | Nhận trùng → 409 | staffId của người khác (BUG-012) |
| `POST /api/payments`, service orders | Sai số tiền, số âm, trả 2 lần, huỷ phiếu đã thu | — |
| `MasterData/service-tariffs` | Thiếu mã/tên, trùng mã | Giá âm, VAT ngoài 0–100 (BUG-017) |
| `MasterData/storage-tariffs` | Thiếu mã | Bậc sai / chồng lấn / rỗng (BUG-018) |
| `MasterData/materials` | Thiếu mã | Trùng mã (BUG-007), min > max (BUG-026) |
| `warehouse/transactions` | Xuất vượt tồn, số lượng 0/âm | Vật tư/loại không tồn tại (BUG-019) |
| `customers/*` | Booking: ngày, số lượng | Số âm, khách hàng không tồn tại (BUG-020), email (BUG-024) |
| `cleaning` | Thiếu dữ liệu | Container không có trong bãi, giá âm (BUG-021) |
| `Yard/blocks/{code}` | — | Kích thước 0/âm, trạng thái tuỳ ý (BUG-022) |
| `notifications/*` | Thiếu kênh/tiêu đề | Nội dung rỗng, người nhận không tồn tại (BUG-027) |
| `depot-files/upload` | exe, html, svg, exe đổi đuôi, 0 byte, > 20 MB, tên chứa `../` | IdTable/TableName tuỳ ý (BUG-028) |

## 6. Đồng thời (concurrency)

| Kịch bản | Kết quả | TC |
|---|---|---|
| 2 request Gate-In cùng container | 1 tạo được, 1 bị 409 | ✅ TC-079 |
| 3 request Gate-In đồng thời × 6 lần | **Tạo trùng 4/6 lần** | ❌ TC-110 → BUG-004 |
| 2 người nhận cùng việc giám định | 409 cho người sau | ✅ TC-089 |
| 2 tài xế nhận cùng lệnh xe nâng | 409 cho người sau | ✅ TC-320 |

## 7. Thời gian phản hồi (local, trung vị 5 lần, không tải nặng)

| API | Trung vị | Dung lượng |
|---|---|---|
| `GET /api/DepotJobs` | 11 ms | 214 KB (không phân trang — BUG-034) |
| `GET /api/yard/overview` | 13 ms | 109 KB |
| `GET /api/reports/analytics` | 8 ms | 18 KB |
| `GET /api/reports/staff-realtime` | 7 ms | 6 KB |
| `GET /api/MasterData/all` | 8 ms | 62 KB |
| `GET /api/billing/debts` | 2 ms | 0 KB |
| `GET /api/warehouse/transactions` | 2 ms | 7 KB |
| `GET /api/notifications` | 2 ms | 1 KB |

Trên VPS, 144 request không token có thời gian 35–110 ms. **Không chạy stress/load test** theo yêu cầu.

## Phụ lục — Danh sách route

Trích từ source code ngày 30/09/2026. Cột "Không token (VPS)" là kết quả mục 2.


### VietQRWebhookController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| POST | `/api/integration/vietqr/webhook` | HandleBankWebhook | không test — Depot.ApiIntegration không deploy |

### BillingController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/billing/debts` | GetDebts | 401 |
| GET | `/api/billing/periods` | GetPeriods | 401 |
| GET | `/api/billing/payments` | GetPayments | 401 |
| GET | `/api/billing/sync-candidates` | GetSyncCandidates | 401 |
| POST | `/api/billing/sync` | SyncDebts | 401 |
| POST | `/api/billing/debts/{debtCode}/invoice` | IssueInvoice | 401 |
| POST | `/api/billing/payments` | RecordPayment | 401 |
| POST | `/api/billing/periods/{periodCode}/close` | ClosePeriod | 401 |
| POST | `/api/billing/payments/{paymentCode}/reverse` | ReversePayment | 401 |
| GET | `/api/billing/aging` | GetAgingReport | 401 |

### CleaningController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/cleaning` | Get | 401 |
| GET | `/api/cleaning/{id:long}` | GetById | 401 |
| POST | `/api/cleaning` | Create | 401 |
| PATCH | `/api/cleaning/{id:long}/items/{itemId:long}` | ToggleItem | 401 |
| PATCH | `/api/cleaning/{id:long}/items/complete-all` | CompleteAllItems | 401 |
| PUT | `/api/cleaning/{id:long}/execution` | UpdateExecution | 401 |
| POST | `/api/cleaning/{id:long}/handover` | Handover | 401 |

### CustomersController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/customers` | GetAll | 401 |
| POST | `/api/customers` | Create | 401 |
| PUT | `/api/customers/{id:long}` | Update | 401 |
| DELETE | `/api/customers/{id:long}` | Delete | 401 |
| GET | `/api/customers/{customerCode}/drivers` | GetDrivers | 401 |
| POST | `/api/customers/drivers` | CreateDriver | 401 |
| PUT | `/api/customers/drivers/{id:long}` | UpdateDriver | 401 |
| DELETE | `/api/customers/drivers/{id:long}` | DeleteDriver | 401 |
| GET | `/api/customers/{customerCode}/vehicles` | GetVehicles | 401 |
| POST | `/api/customers/vehicles` | CreateVehicle | 401 |
| PUT | `/api/customers/vehicles/{id:long}` | UpdateVehicle | 401 |
| DELETE | `/api/customers/vehicles/{id:long}` | DeleteVehicle | 401 |
| GET | `/api/customers/{customerCode}/users` | GetUsers | 401 |
| POST | `/api/customers/users` | CreateUser | 401 |
| PUT | `/api/customers/users/{id:long}` | UpdateUser | 401 |
| DELETE | `/api/customers/users/{id:long}` | DeleteUser | 401 |
| GET | `/api/customers/{customerCode}/bookings` | GetBookings | 401 |
| POST | `/api/customers/bookings` | CreateBooking | 401 |
| PUT | `/api/customers/bookings/{id:long}` | UpdateBooking | 401 |
| DELETE | `/api/customers/bookings/{id:long}` | DeleteBooking | 401 |

### DepotFilesController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| POST | `/api/depot-files/upload` | Upload | 401 |
| GET | `/api/depot-files` | GetFiles | 401 |
| DELETE | `/api/depot-files/{id:long}` | Delete | 401 |

### DepotJobsController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/DepotJobs` | GetAllJobs | 401 |
| GET | `/api/DepotJobs/{id}` | GetJobById | 401 |
| GET | `/api/DepotJobs/{id:long}/history` | GetHistory | 401 |
| POST | `/api/DepotJobs/{id:long}/forklift-move` | CompleteForkliftMove | 401 |
| POST | `/api/DepotJobs/{id:long}/forklift/claim` | ClaimForkliftJob | 401 |
| POST | `/api/DepotJobs/{id:long}/forklift/start` | StartForkliftExecution | 401 |
| POST | `/api/DepotJobs/{id:long}/forklift/cancel-claim` | CancelForkliftClaim | 401 |
| DELETE | `/api/DepotJobs/{id:long}` | DeleteJob | 401 |
| PATCH | `/api/DepotJobs/{id:long}/status` | UpdateStatus | 401 |
| POST | `/api/DepotJobs/gate-in` | CreateGateIn | 401 |
| POST | `/api/DepotJobs/{id:long}/survey/claim` | ClaimSurvey | 401 |
| POST | `/api/DepotJobs/{id:long}/survey/release` | ReleaseSurveyClaim | 401 |
| POST | `/api/DepotJobs/{id}/survey` | SubmitSurvey | 401 |
| POST | `/api/DepotJobs/{id}/estimate` | CreateEstimate | 401 |
| POST | `/api/DepotJobs/{id}/approve-estimate` | ApproveEstimate | 401 |
| POST | `/api/DepotJobs/{id}/reject-estimate` | RejectEstimate | 401 |
| POST | `/api/DepotJobs/{id}/qc-complete` | CompleteQc | 401 |
| POST | `/api/DepotJobs/{id}/repair/assign` | AssignRepair | 401 |
| POST | `/api/DepotJobs/{id}/repair/start` | StartRepair | 401 |
| POST | `/api/DepotJobs/{id}/repair/complete` | CompleteRepair | 401 |
| POST | `/api/DepotJobs/{id}/repair/photos` | UploadRepairPhoto | 401 |
| GET | `/api/DepotJobs/{id}/repair/photos` | GetRepairPhotos | 401 |
| POST | `/api/DepotJobs/{id}/gate-out` | GateOut | 401 |
| POST | `/api/DepotJobs/forklift-move` | MoveYard | 401 |
| GET | `/api/DepotJobs/stats` | GetStats | 401 |

### MasterDataController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/MasterData/shipping-lines` | GetShippingLines | 401 |
| POST | `/api/MasterData/shipping-lines` | AddShippingLine | 401 |
| PUT | `/api/MasterData/shipping-lines/{id:long}` | UpdateShippingLine | 401 |
| DELETE | `/api/MasterData/shipping-lines/{id:long}` | DeleteShippingLine | 401 |
| GET | `/api/MasterData/materials` | GetMaterials | 401 |
| GET | `/api/MasterData/all` | GetAll | 401 |
| GET | `/api/MasterData/catalog/{catalogType}` | GetCatalog | 401 |
| POST | `/api/MasterData/catalog` | CreateCatalog | 401 |
| PUT | `/api/MasterData/catalog/{id:long}` | UpdateCatalog | 401 |
| DELETE | `/api/MasterData/catalog/{id:long}` | DeleteCatalog | 401 |
| GET | `/api/MasterData/service-tariffs` | GetServiceTariffs | 401 |
| POST | `/api/MasterData/service-tariffs` | CreateServiceTariff | 401 |
| PUT | `/api/MasterData/service-tariffs/{id:long}` | UpdateServiceTariff | 401 |
| DELETE | `/api/MasterData/service-tariffs/{id:long}` | DeleteServiceTariff | 401 |
| GET | `/api/MasterData/storage-tariffs` | GetStorageTariffs | 401 |
| POST | `/api/MasterData/storage-tariffs` | CreateStorageTariff | 401 |
| PUT | `/api/MasterData/storage-tariffs/{id:long}` | UpdateStorageTariff | 401 |
| DELETE | `/api/MasterData/storage-tariffs/{id:long}` | DeleteStorageTariff | 401 |
| POST | `/api/MasterData/materials` | AddMaterial | 401 |
| PUT | `/api/MasterData/materials/{id:long}` | UpdateMaterial | 401 |

### NotificationsController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/notifications` | Get | 401 |
| POST | `/api/notifications` | Send | 401 |
| GET | `/api/notifications/dashboard-kpi` | GetDashboardKpi | 401 |
| GET | `/api/notifications/employees` | GetEmployees | 401 |
| PUT | `/api/notifications/employees/{username}/subscription` | UpdateEmployeeSubscription | 401 |
| GET | `/api/notifications/customers` | GetCustomers | 401 |
| PUT | `/api/notifications/customers/{customerCode}/preferences` | UpdateCustomerPreference | 401 |
| GET | `/api/notifications/templates` | GetTemplates | 401 |
| POST | `/api/notifications/templates` | CreateTemplate | 401 |
| PUT | `/api/notifications/templates/{code}` | UpdateTemplate | 401 |
| DELETE | `/api/notifications/templates/{code}` | DeleteTemplate | 401 |
| GET | `/api/notifications/queue` | GetQueue | 401 |
| POST | `/api/notifications/{id:long}/resend` | Resend | 401 |
| POST | `/api/notifications/{id:long}/retry` | Retry | 401 |
| POST | `/api/notifications/{id:long}/cancel` | Cancel | 401 |
| POST | `/api/notifications/queue/process-all` | ProcessAllQueue | 401 |

### PaymentsController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| POST | `/api/depot/jobs/{jobId:long}/payment` | Process | 401 |

### ReportsController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/reports/analytics` | GetAnalytics | 401 |
| GET | `/api/reports/staff-realtime` | GetStaffRealtime | 401 |
| GET | `/api/reports/kpi` | GetKpi | 401 |
| POST | `/api/reports/export-excel` | Export | 401 |

### ServiceOrdersController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| POST | `/api/service-orders` | Create | 401 |
| GET | `/api/service-orders` | Get | 401 |
| PUT | `/api/service-orders/{id:long}` | Update | 401 |
| POST | `/api/service-orders/{id:long}/cancel` | Cancel | 401 |

### ShippingIntegrationController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| POST | `/api/shipping/sync` | Sync | 401 |

### SystemController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/system/users` | GetUsers | 401 |
| POST | `/api/system/users` | CreateUser | 401 |
| PUT | `/api/system/users/{id:long}` | UpdateUser | 401 |
| DELETE | `/api/system/users/{id:long}` | DeleteUser | 401 |
| POST | `/api/system/users/{id:long}/reset-password` | ResetPassword | 401 |
| GET | `/api/system/roles` | GetRoles | 401 |
| PUT | `/api/system/roles/{roleCode}/permissions` | UpdateRolePermissions | 401 |
| GET | `/api/system/security-policy` | GetSecurityPolicy | 401 |
| PUT | `/api/system/security-policy` | SaveSecurityPolicy | 401 |
| GET | `/api/system/audit-logs` | GetAuditLogs | 401 |
| POST | `/api/system/audit-logs` | CreateAuditLog | 401 |
| GET | `/api/system/permissions` | GetPermissions | 401 |
| GET | `/api/system/menus` | GetMenus | 401 |

### UsersController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| POST | `/api/Users/authenticate` | Login | 401 |

### WarehouseController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/warehouse/transactions` | GetTransactions | 401 |
| POST | `/api/warehouse/transactions` | Record | 401 |
| GET | `/api/warehouse/material-groups` | GetMaterialGroups | 401 |
| GET | `/api/warehouse/suppliers` | GetSuppliers | 401 |
| GET | `/api/warehouse/stock-balances` | GetStockBalances | 401 |
| GET | `/api/warehouse/receipts` | GetReceipts | 401 |
| GET | `/api/warehouse/issues` | GetIssues | 401 |

### WebhooksController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| POST | `/api/Webhooks/bank-vietqr` | ProcessBankWebhook | 401 |

### WorkflowController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/workflow/definition` | GetDefinition | 401 |
| GET | `/api/workflow/summary` | GetSummary | 401 |

### YardController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| GET | `/api/Yard` | GetPositions | 401 |
| POST | `/api/Yard/occupancy` | UpdateOccupancy | 401 |
| GET | `/api/Yard/overview` | GetOverview | 401 |
| GET | `/api/Yard/containers/search` | SearchContainers | 401 |
| GET | `/api/Yard/containers/{id}` | GetContainerById | 401 |
| GET | `/api/Yard/history` | GetMoveHistory | 401 |
| POST | `/api/Yard/container/move` | MoveContainer | 401 |
| PUT | `/api/Yard/blocks/{blockCode}` | UpdateBlockLayout | 401 |
| POST | `/api/Yard/forklift/dispatch` | DispatchForklift | 401 |

### FilesController

| Method | Route | Action | Không token (VPS) |
|---|---|---|---|
| POST | `/api/files/upload` | Upload | không gọi trực tiếp — chỉ BackendApi gọi nội bộ |
| GET | `/api/files/{fileId}/{storedName}` | Download | **200 — không cần token (BUG-013)** |
| DELETE | `/api/files/{fileId}/{storedName}` | Delete | không gọi trực tiếp — chỉ BackendApi gọi nội bộ |
