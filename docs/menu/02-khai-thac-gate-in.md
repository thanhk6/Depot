# KHAI THÁC & GATE-IN

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [1. Tiếp Nhận Cổng (Gate-In)](#1-tiếp-nhận-cổng-gate-in) | `gate` | `GateInPage` |
| [2. Giám Định (Survey e-EIR)](#2-giám-định-survey-e-eir) | `survey` | `SurveyModulePage` |
| [3. Tổ Vệ Sinh (Cleaning Bay)](#3-tổ-vệ-sinh-cleaning-bay) | `cleaning` | `CleaningModulePage` |
| [4. Khai Thác Gate-In (Tariff)](#4-khai-thác-gate-in-tariff) | `operation` | `OperationPage` |
| [5. Thanh Toán VietQR](#5-thanh-toán-vietqr) | `payment` | `PaymentPage` |

---

## 1. Tiếp Nhận Cổng (Gate-In)

Tiếp nhận container hạ vỏ rỗng tại cổng: nhập số container (kiểm tra check-digit ISO 6346), loại container (lấy từ DM Loại Container), hãng tàu, nhà xe, tài xế; tạo hồ sơ `depot_jobs` + e-EIR nhập.

### Frontend

- Tab id: `gate` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'gate'`).
- Trang: `GateInPage` — [`fontend/src/modules/gate/pages/GateInPage.tsx`](../../fontend/src/modules/gate/pages/GateInPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onAddGateIn`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.createGateIn` | POST | `/api/DepotJobs/gate-in` | `DepotJobs.CreateGateIn` | `DepotJobService.CreateGateInJobAsync` | `MasterCatalogItems`, `ShippingLines`, `depot_jobs`, `Users`, `AuditLogs` |
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `customerApi.getAll` | GET | `/api/customers` | `Customers.GetAll` | `MasterDataService.GetCustomersAsync` | `CustomerCompanies` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getShippingLines` | GET | `/api/MasterData/shipping-lines` | `MasterData.GetShippingLines` | `MasterDataService.GetAllShippingLinesAsync` | `ShippingLines` |

### Ghi chú

- Loại container hợp lệ = các dòng đang áp dụng trong catalog `CONTAINER_TYPE` (cột `Name`); backend kiểm tra lại trong `CreateGateInJobAsync`.
- Tab "2. Biểu Phí Dịch Vụ Cổng" (component `modules/gate/components/GateTariffReference.tsx`) chỉ đọc, hiển thị biểu phí đang áp dụng từ 3 nguồn thật: `GET /api/MasterData/service-tariffs` (bảng `ServiceTariffs` — cước nâng hạ), `GET /api/MasterData/storage-tariffs` (`StorageTariffRules` + `StorageTariffTier` — cước lưu bãi), `GET /api/MasterData/catalog/CLEANING_TARIFF` (`MasterCatalogItems` — biểu phí vệ sinh). Trước 30/09/2026 tab này là số gõ cứng và không có phần vệ sinh.

Lịch sử rà soát & sửa lỗi: [03-gate-in.md](../backend-progress/03-gate-in.md)

## 2. Giám Định (Survey e-EIR)

Giám định container sau Gate-In theo IICL-6: checklist, hư hỏng, phân hạng, ảnh hiện trường, chỉ định vệ sinh; nộp phiếu chuyển hồ sơ sang `ESTIMATING`.

### Frontend

- Tab id: `survey` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'survey'`).
- Trang: `SurveyModulePage` — [`fontend/src/modules/survey/pages/SurveyModulePage.tsx`](../../fontend/src/modules/survey/pages/SurveyModulePage.tsx)
- Props nhận từ `App.tsx`: `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.createGateIn` | POST | `/api/DepotJobs/gate-in` | `DepotJobs.CreateGateIn` | `DepotJobService.CreateGateInJobAsync` | `MasterCatalogItems`, `ShippingLines`, `depot_jobs`, `Users`, `AuditLogs` |
| `containerApi.getAll` | GET | `/api/DepotJobs` | `DepotJobs.GetAllJobs` | `DepotJobService.GetAllJobsAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `depotFileApi.upload` | POST | `/api/depot-files/upload` | `DepotFiles.Upload` | `DepotFileService.UploadAsync` | `DepotFiles` |
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |
| `surveyApi.claimSurvey` | POST | `/api/DepotJobs/{jobId}/survey/claim` | `DepotJobs.ClaimSurvey` | `DepotJobService.ClaimSurveyAsync` | `depot_jobs`, `Users`, `AuditLogs` |
| `surveyApi.releaseSurveyClaim` | POST | `/api/DepotJobs/{jobId}/survey/release?staffId={staffId}` | `DepotJobs.ReleaseSurveyClaim` | `DepotJobService.ReleaseSurveyClaimAsync` | `depot_jobs` |
| `surveyApi.submitSurvey` | POST | `/api/DepotJobs/{jobId}/survey` | `DepotJobs.SubmitSurvey` | `DepotJobService.SubmitSurveyAsync` | `depot_jobs`, `Surveys`, `Users`, `CleaningRecords`, `MasterCatalogItems`, `ShippingLines`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem` |

### Ghi chú

- Ảnh upload thật qua `depotFileApi.upload` (FileServer + bảng `DepotFiles`, gắn `DepotJob`).
- Nhận việc / trả việc giám định (`survey/claim`, `survey/release`) để 2 giám định viên không làm trùng 1 container.
- Các tab danh mục (vị trí, mã hư hỏng, phương án sửa, phân hạng, tiêu chuẩn, biểu phí vệ sinh) trong trang này dùng chung API catalog với nhóm Master Data.

Lịch sử rà soát & sửa lỗi: [04-survey.md](../backend-progress/04-survey.md)

## 3. Tổ Vệ Sinh (Cleaning Bay)

Tổ vệ sinh: hàng đợi container cần vệ sinh (sinh tự động khi giám định chọn vệ sinh), tiếp nhận thủ công, thực hiện từng hạng mục, bàn giao cho khai thác.

### Frontend

- Tab id: `cleaning` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'cleaning'`).
- Trang: `CleaningModulePage` — [`fontend/src/modules/cleaning/pages/CleaningModulePage.tsx`](../../fontend/src/modules/cleaning/pages/CleaningModulePage.tsx)
- Props nhận từ `App.tsx`: `initialTab`, `containers`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `cleaningApi.completeAllItems` | PATCH | `/api/cleaning/{recordId}/items/complete-all` | `Cleaning.CompleteAllItems` | `CleaningService.CompleteAllItemsAsync` | `CleaningRecords` |
| `cleaningApi.create` | POST | `/api/cleaning` | `Cleaning.Create` | `CleaningService.CreateAsync` | `CleaningRecords`, `depot_jobs` |
| `cleaningApi.getAll` | GET | `/api/cleaning` | `Cleaning.Get` | `CleaningService.GetAsync` | `CleaningRecords` |
| `cleaningApi.handover` | POST | `/api/cleaning/{recordId}/handover` | `Cleaning.Handover` | `CleaningService.HandoverAsync` | `depot_jobs`, `CleaningRecords` |
| `cleaningApi.toggleItem` | PATCH | `/api/cleaning/{recordId}/items/{itemId}` | `Cleaning.ToggleItem` | `CleaningService.ToggleItemAsync` | `CleaningRecords` |
| `cleaningApi.updateExecution` | PUT | `/api/cleaning/{recordId}/execution` | `Cleaning.UpdateExecution` | `CleaningService.UpdateExecutionAsync` | `CleaningRecords` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |

### Ghi chú

- Danh sách dịch vụ + đơn giá khi tiếp nhận lấy từ Biểu Phí Vệ Sinh (`CLEANING_TARIFF`), giá theo loại container.

Lịch sử rà soát & sửa lỗi: [05-cleaning.md](../backend-progress/05-cleaning.md)

## 4. Khai Thác Gate-In (Tariff)

Khai thác Gate-In: lập phiếu dịch vụ (Service Order) cho container — nâng hạ, lưu bãi, vệ sinh, PTI… — tính tiền theo biểu cước thật.

### Frontend

- Tab id: `operation` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'operation'`).
- Trang: `OperationPage` — [`fontend/src/modules/operation/pages/OperationPage.tsx`](../../fontend/src/modules/operation/pages/OperationPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `masterDataApi.createServiceTariff` | POST | `/api/MasterData/service-tariffs` | `MasterData.CreateServiceTariff` | `MasterDataService.CreateServiceTariffAsync` | `ServiceTariffs` |
| `masterDataApi.createStorageTariff` | POST | `/api/MasterData/storage-tariffs` | `MasterData.CreateStorageTariff` | `MasterDataService.CreateStorageTariffAsync` | `StorageTariffRules` |
| `masterDataApi.deactivateServiceTariff` | DELETE | `/api/MasterData/service-tariffs/{id}` | `MasterData.DeleteServiceTariff` | `MasterDataService.DeactivateServiceTariffAsync` | `ServiceTariffs` |
| `masterDataApi.deactivateStorageTariff` | DELETE | `/api/MasterData/storage-tariffs/{id}` | `MasterData.DeleteStorageTariff` | `MasterDataService.DeactivateStorageTariffAsync` | `StorageTariffRules` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateServiceTariff` | PUT | `/api/MasterData/service-tariffs/{id}` | `MasterData.UpdateServiceTariff` | `MasterDataService.UpdateServiceTariffAsync` | `ServiceTariffs` |
| `masterDataApi.updateStorageTariff` | PUT | `/api/MasterData/storage-tariffs/{id}` | `MasterData.UpdateStorageTariff` | `MasterDataService.UpdateStorageTariffAsync` | `StorageTariffRules`, `StorageTariffTier` |
| `paymentApi.processPayment` | POST | `/api/depot/jobs/{jobId}/payment` | `Payments.Process` | `DepotJobService.ProcessPaymentAsync` | `depot_jobs`, `ServiceOrders`, `Payments`, `AuditLogs`, `Surveys`, `Estimates`, `EstimateItem` |
| `serviceOrderApi.cancel` | POST | `/api/service-orders/{id}/cancel` | `ServiceOrders.Cancel` | `DepotJobService.CancelServiceOrderAsync` | `ServiceOrders`, `AuditLogs` |
| `serviceOrderApi.create` | POST | `/api/service-orders` | `ServiceOrders.Create` | `DepotJobService.CreateServiceOrderAsync` | `depot_jobs`, `ServiceOrders`, `AuditLogs`, `CleaningRecords` |
| `serviceOrderApi.getAll` | GET | `/api/service-orders` | `ServiceOrders.Get` | `DepotJobService.GetServiceOrdersAsync` | `ServiceOrders` |

Lịch sử rà soát & sửa lỗi: [06-operation.md](../backend-progress/06-operation.md)

## 5. Thanh Toán VietQR

Thu phí dịch vụ Gate-In bằng VietQR / tiền mặt; ngân hàng gọi webhook xác nhận thanh toán.

### Frontend

- Tab id: `payment` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'payment'`).
- Trang: `PaymentPage` — [`fontend/src/modules/payment/pages/PaymentPage.tsx`](../../fontend/src/modules/payment/pages/PaymentPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onConfirmPayment`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `paymentApi.getServiceOrders` | GET | `/api/service-orders` | `ServiceOrders.Get` | `DepotJobService.GetServiceOrdersAsync` | `ServiceOrders` |
| `paymentApi.processPayment` | POST | `/api/depot/jobs/{jobId}/payment` | `Payments.Process` | `DepotJobService.ProcessPaymentAsync` | `depot_jobs`, `ServiceOrders`, `Payments`, `AuditLogs`, `Surveys`, `Estimates`, `EstimateItem` |

### Ghi chú

- Webhook ngân hàng: `POST /api/integration/vietqr/webhook` và `POST /api/Webhooks/bank-vietqr` (không do giao diện gọi).

Lịch sử rà soát & sửa lỗi: [07-payment.md](../backend-progress/07-payment.md)

