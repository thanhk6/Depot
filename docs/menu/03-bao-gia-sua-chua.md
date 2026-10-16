# BÁO GIÁ & SỬA CHỮA

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Lập Báo Giá Estimate](#lập-báo-giá-estimate) | `estimate` | `EstimatePage` |
| [Phê Duyệt Hãng Tàu](#phê-duyệt-hãng-tàu) | `approval` | `ApprovalPage` |
| [Lệnh Sửa Chữa (WO)](#lệnh-sửa-chữa-wo) | `repair` | `RepairPage` |
| [9. QC Nghiệm Thu (AV Grade)](#9-qc-nghiệm-thu-av-grade) | `qc` | `QCPage` |
| [10. Truyền API Hãng Tàu](#10-truyền-api-hãng-tàu) | `shipping_api` | `ShippingApiPage` |

---

## Lập Báo Giá Estimate

Lập báo giá sửa chữa (Estimate) từ hư hỏng giám định theo mã IICL/CEDEX, gửi hãng tàu duyệt.

### Frontend

- Tab id: `estimate` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'estimate'`).
- Trang: `EstimatePage` — [`fontend/src/modules/estimate/pages/EstimatePage.tsx`](../../fontend/src/modules/estimate/pages/EstimatePage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.getAll` | GET | `/api/DepotJobs` | `DepotJobs.GetAllJobs` | `DepotJobService.GetAllJobsAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `estimateApi.approveEstimate` | POST | `/api/DepotJobs/{jobId}/approve-estimate?approverName={approverName}` | `DepotJobs.ApproveEstimate` | `DepotJobService.ApproveEstimateAsync` | `depot_jobs`, `Estimates`, `AuditLogs` |
| `estimateApi.createEstimate` | POST | `/api/DepotJobs/{jobId}/estimate` | `DepotJobs.CreateEstimate` | `DepotJobService.CreateOrUpdateEstimateAsync` | `depot_jobs`, `Surveys`, `Estimates`, `AuditLogs`, `EstimateItem` |
| `estimateApi.rejectEstimate` | POST | `/api/DepotJobs/{jobId}/reject-estimate` | `DepotJobs.RejectEstimate` | `DepotJobService.RejectEstimateAsync` | `depot_jobs`, `Estimates`, `AuditLogs` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |

Lịch sử rà soát & sửa lỗi: [12-estimate.md](../backend-progress/12-estimate.md)

## Phê Duyệt Hãng Tàu

Hãng tàu phê duyệt / từ chối báo giá; duyệt xong hồ sơ chuyển `APPROVED` để mở lệnh sửa chữa.

### Frontend

- Tab id: `approval` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'approval'`).
- Trang: `ApprovalPage` — [`fontend/src/modules/approval/pages/ApprovalPage.tsx`](../../fontend/src/modules/approval/pages/ApprovalPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onApproveEstimate`, `onRejectEstimate`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `estimateApi.approveEstimate` | POST | `/api/DepotJobs/{jobId}/approve-estimate?approverName={approverName}` | `DepotJobs.ApproveEstimate` | `DepotJobService.ApproveEstimateAsync` | `depot_jobs`, `Estimates`, `AuditLogs` |
| `estimateApi.rejectEstimate` | POST | `/api/DepotJobs/{jobId}/reject-estimate` | `DepotJobs.RejectEstimate` | `DepotJobService.RejectEstimateAsync` | `depot_jobs`, `Estimates`, `AuditLogs` |

### Ghi chú

- Trang không tự gọi API: nút Duyệt/Từ chối gọi callback, `App.tsx` gọi `estimateApi.approveEstimate` / `rejectEstimate`.

Lịch sử rà soát & sửa lỗi: [13-approval.md](../backend-progress/13-approval.md)

## Lệnh Sửa Chữa (WO)

Lệnh sửa chữa (Work Order): bắt đầu thi công, cập nhật hạng mục, chụp ảnh sau sửa, hoàn tất chuyển QC.

### Frontend

- Tab id: `repair` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'repair'`).
- Trang: `RepairPage` — [`fontend/src/modules/repair/pages/RepairPage.tsx`](../../fontend/src/modules/repair/pages/RepairPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onCompleteRepair`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `depotFileApi.delete` | DELETE | `/api/depot-files/{id}` | `DepotFiles.Delete` | `DepotFileService.DeleteAsync` | `DepotFiles` |
| `masterDataApi.getMaterials` | GET | `/api/MasterData/materials` | `MasterData.GetMaterials` | `MasterDataService.GetAllMaterialsAsync` | `Materials` |
| `repairApi.completeWorkOrder` | POST | `/api/DepotJobs/{jobId}/repair/complete` | `DepotJobs.CompleteRepair` | `DepotJobService.CompleteRepairAsync` | `depot_jobs`, `RepairOrders`, `AuditLogs`, `DepotFiles` |
| `repairApi.getAfterPhotos` | GET | `/api/DepotJobs/{jobId}/repair/photos` | `DepotJobs.GetRepairPhotos` | `DepotJobService.GetRepairOrderIdAsync`<br>`DepotFileService.GetFilesAsync` | `depot_jobs`, `RepairOrders`, `DepotFiles` |
| `repairApi.startWorkOrder` | POST | `/api/DepotJobs/{jobId}/repair/start` | `DepotJobs.StartRepair` | `DepotJobService.StartRepairAsync` | `depot_jobs`, `Estimates`, `RepairOrders`, `AuditLogs` |
| `repairApi.uploadAfterPhoto` | POST | `/api/DepotJobs/{jobId}/repair/photos` | `DepotJobs.UploadRepairPhoto` | `DepotJobService.GetRepairOrderIdAsync`<br>`DepotFileService.UploadAsync` | `depot_jobs`, `RepairOrders`, `DepotFiles` |

### Ghi chú

- Ảnh sau sửa lưu thật ngay khi chụp: `POST /api/DepotJobs/{id}/repair/photos` (FileServer + `DepotFiles`, `TableName=RepairOrder`, số hạng mục ghi trong tên file `ITEM-{n}__…`).
- Hạng mục sửa chữa dựng từ hư hỏng giám định thật; tiến độ từng hạng mục/vật tư hiện chưa có bảng backend riêng.

Lịch sử rà soát & sửa lỗi: [14-repair.md](../backend-progress/14-repair.md)

## 9. QC Nghiệm Thu (AV Grade)

QC nghiệm thu sau sửa chữa: đạt → `READY_FOR_OUT` (hoặc `CLEANING` nếu còn lệnh vệ sinh), không đạt → quay lại `REPAIRING`.

### Frontend

- Tab id: `qc` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'qc'`).
- Trang: `QCPage` — [`fontend/src/modules/qc/pages/QCPage.tsx`](../../fontend/src/modules/qc/pages/QCPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onQCResult`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `qcApi.completeQc` | POST | `/api/DepotJobs/{jobId}/qc-complete` | `DepotJobs.CompleteQc` | `DepotJobService.CompleteQcInspectionAsync` | `depot_jobs`, `RepairOrders`, `CleaningRecords`, `AuditLogs` |
| `shippingApi.syncJob` | POST | `/api/shipping/sync` | `ShippingIntegration.Sync` | `ShippingIntegrationService.SyncJobAsync` | `depot_jobs`, `ShippingSyncLogs`, `AuditLogs` |

Lịch sử rà soát & sửa lỗi: [15-qc.md](../backend-progress/15-qc.md)

## 10. Truyền API Hãng Tàu

Truyền kết quả (container đạt QC) sang API hãng tàu; lưu nhật ký truyền trong phiên.

### Frontend

- Tab id: `shipping_api` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'shipping_api'`).
- Trang: `ShippingApiPage` — [`fontend/src/modules/shipping_api/pages/ShippingApiPage.tsx`](../../fontend/src/modules/shipping_api/pages/ShippingApiPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `shippingApi.syncJob` | POST | `/api/shipping/sync` | `ShippingIntegration.Sync` | `ShippingIntegrationService.SyncJobAsync` | `depot_jobs`, `ShippingSyncLogs`, `AuditLogs` |

Lịch sử rà soát & sửa lỗi: [16-shipping-api.md](../backend-progress/16-shipping-api.md)

