# QUẢN LÝ CONTAINER & BÃI

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Danh Sách Container](#danh-sách-container) | `container` | `ContainerListPage` |
| [Sơ Đồ Bãi 2D (Konva)](#sơ-đồ-bãi-2d-konva) | `yard_map` | `YardMapPage` |
| [Quản Lý Vị Trí Block](#quản-lý-vị-trí-block) | `yard_blocks` | `YardBlocksPage` |
| [Lệnh Điều Xe Nâng](#lệnh-điều-xe-nâng) | `forklift` | `ForkliftPage` |

---

## Danh Sách Container

Danh sách toàn bộ hồ sơ container, lọc/tìm kiếm, cập nhật trạng thái thủ công.

### Frontend

- Tab id: `container` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'container'`).
- Trang: `ContainerListPage` — [`fontend/src/modules/container/pages/ContainerListPage.tsx`](../../fontend/src/modules/container/pages/ContainerListPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onUpdateStatus`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.updateStatus` | PATCH | `/api/DepotJobs/{id}/status` | `DepotJobs.UpdateStatus` | `DepotJobService.UpdateJobStatusAsync` | `depot_jobs`, `RepairOrders`, `AuditLogs` |

Lịch sử rà soát & sửa lỗi: [02-container-list.md](../backend-progress/02-container-list.md)

## Sơ Đồ Bãi 2D (Konva)

Sơ đồ bãi 2D (Konva): khu, block, vị trí container, xe nâng; di chuyển container giữa các ô.

### Frontend

- Tab id: `yard_map` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'yard_map'`).
- Trang: `YardMapPage` — [`fontend/src/modules/yard/pages/YardMapPage.tsx`](../../fontend/src/modules/yard/pages/YardMapPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onSelectContainer`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `yardApi.dispatchForklift` | POST | `/api/yard/forklift/dispatch` | `Yard.DispatchForklift` | `YardOverviewService.DispatchForkliftAsync` | `Forklifts`, `depot_jobs`, `ForkliftDispatches` |
| `yardApi.getMoveHistories` | GET | `/api/yard/history` | `Yard.GetMoveHistory` | `YardOverviewService.GetMoveHistoryAsync` | `YardMoveHistories` |
| `yardApi.getYardOverview` | GET | `/api/yard/overview` | `Yard.GetOverview` | `YardOverviewService.GetOverviewAsync` | `depot_jobs`, `YardBlockLayouts`, `YardZones`, `Forklifts`, `ForkliftDispatches`, `YardGateLanes`, `ShippingLines`, `CleaningRecords` |
| `yardApi.moveContainer` | POST | `/api/yard/container/move` | `Yard.MoveContainer` | `YardOverviewService.MoveContainerAsync` | `depot_jobs`, `YardBlockLayouts`, `Forklifts`, `YardMoveHistories`, `AuditLogs`, `ShippingLines`, `CleaningRecords` |

### Ghi chú

- Chỉ hiển thị dữ liệu `GET /api/yard/overview`; chưa tải xong/không có dữ liệu thì sơ đồ trống.

Lịch sử rà soát & sửa lỗi: [09-yard-map.md](../backend-progress/09-yard-map.md)

## Quản Lý Vị Trí Block

Quản lý block bãi: sức chứa, trạng thái bảo trì, cấu hình layout bay/row/tier.

### Frontend

- Tab id: `yard_blocks` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'yard_blocks'`).
- Trang: `YardBlocksPage` — [`fontend/src/modules/yard/pages/YardBlocksPage.tsx`](../../fontend/src/modules/yard/pages/YardBlocksPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `yardApi.getYardOverview` | GET | `/api/yard/overview` | `Yard.GetOverview` | `YardOverviewService.GetOverviewAsync` | `depot_jobs`, `YardBlockLayouts`, `YardZones`, `Forklifts`, `ForkliftDispatches`, `YardGateLanes`, `ShippingLines`, `CleaningRecords` |
| `yardApi.updateBlockLayout` | PUT | `/api/yard/blocks/{blockCode}` | `Yard.UpdateBlockLayout` | `YardOverviewService.UpdateBlockLayoutAsync` | `YardBlockLayouts`, `depot_jobs`, `CleaningRecords` |

### Ghi chú

- Chính sách xếp bãi theo block chưa có bảng backend — phần này để trống.

Lịch sử rà soát & sửa lỗi: [10-yard-blocks.md](../backend-progress/10-yard-blocks.md)

## Lệnh Điều Xe Nâng

Hàng đợi lệnh xe nâng cho tài xế trên tablet: nhận lệnh (khóa container), bắt đầu, xác nhận hạ vị trí.

### Frontend

- Tab id: `forklift` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'forklift'`).
- Trang: `ForkliftPage` — [`fontend/src/modules/forklift/pages/ForkliftPage.tsx`](../../fontend/src/modules/forklift/pages/ForkliftPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onRefreshContainer`, `onConfirmMove`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `yardApi.cancelForkliftClaim` | POST | `/api/DepotJobs/{jobId}/forklift/cancel-claim?operatorId={operatorId}` | `DepotJobs.CancelForkliftClaim` | `DepotJobService.CancelForkliftClaimAsync` | `depot_jobs`, `AuditLogs` |
| `yardApi.claimForkliftJob` | POST | `/api/DepotJobs/{jobId}/forklift/claim` | `DepotJobs.ClaimForkliftJob` | `DepotJobService.ClaimForkliftJobAsync` | `depot_jobs`, `AuditLogs` |
| `yardApi.forkliftMove` | POST | `/api/DepotJobs/{jobId}/forklift-move` | `DepotJobs.CompleteForkliftMove` | `DepotJobService.CompleteForkliftMoveAsync` | `depot_jobs`, `YardBlockLayouts`, `YardPositions`, `AuditLogs`, `ServiceOrders` |
| `yardApi.startForkliftExecution` | POST | `/api/DepotJobs/{jobId}/forklift/start?operatorId={operatorId}` | `DepotJobs.StartForkliftExecution` | `DepotJobService.StartForkliftExecutionAsync` | `depot_jobs`, `AuditLogs` |

### Ghi chú

- Tài xế = tài khoản đang đăng nhập; mã xe nâng nhập tay (chưa có danh mục xe nâng ở backend).

Lịch sử rà soát & sửa lỗi: [11-forklift.md](../backend-progress/11-forklift.md)

