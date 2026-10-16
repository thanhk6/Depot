# CỔNG XUẤT & CẤP VỎ (GATE-OUT)

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [11. Tổng Quan Cổng Xuất](#11-tổng-quan-cổng-xuất) | `gate_out` | `GateOutPage` |
| [1. Vỏ Chờ Cấp (Ready In Yard)](#1-vỏ-chờ-cấp-ready-in-yard) | `gate_out_ready` | `GateOutPage` |
| [2. Tiếp Nhận Làn Cổng Xuất](#2-tiếp-nhận-làn-cổng-xuất) | `gate_out_lane` | `GateOutPage` |
| [3. Nhật Ký Xuất & Phiếu e-EIR](#3-nhật-ký-xuất--phiếu-e-eir) | `gate_out_history` | `GateOutPage` |

---

## 11. Tổng Quan Cổng Xuất

Tổng quan cổng xuất: container sẵn sàng cấp (`READY_FOR_OUT`), làn cổng, nhật ký xuất.

### Frontend

- Tab id: `gate_out` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'gate_out'`).
- Trang: `GateOutPage` — [`fontend/src/modules/gate_out/pages/GateOutPage.tsx`](../../fontend/src/modules/gate_out/pages/GateOutPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `initialSubTab`, `onNavigateTab`, `onUpdateContainerStatus`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `GateOutPage:220` | POST | `/api/DepotJobs/{id}/gate-out` | `DepotJobs.GateOut` | `DepotJobService.GateOutAsync` | `depot_jobs`, `ServiceOrders`, `YardPositions`, `AuditLogs` |
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |

### Ghi chú

- 4 menu Gate-Out dùng chung `GateOutPage`, khác nhau ở tab con (`OVERVIEW` / `READY_LIST` / `GATE_LANE` / `HISTORY`).
- Cấp vỏ gọi thẳng `apiClient.post('/DepotJobs/{id}/gate-out')` trong `GateOutPage`.

Lịch sử rà soát & sửa lỗi: [17-gate-out.md](../backend-progress/17-gate-out.md)

## 1. Vỏ Chờ Cấp (Ready In Yard)

Danh sách vỏ đạt chuẩn chờ cấp trong bãi.

### Frontend

- Tab id: `gate_out_ready` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'gate_out_ready'`).
- Trang: `GateOutPage` — [`fontend/src/modules/gate_out/pages/GateOutPage.tsx`](../../fontend/src/modules/gate_out/pages/GateOutPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `initialSubTab`, `onNavigateTab`, `onUpdateContainerStatus`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `GateOutPage:220` | POST | `/api/DepotJobs/{id}/gate-out` | `DepotJobs.GateOut` | `DepotJobService.GateOutAsync` | `depot_jobs`, `ServiceOrders`, `YardPositions`, `AuditLogs` |
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |

Lịch sử rà soát & sửa lỗi: [17-gate-out.md](../backend-progress/17-gate-out.md)

## 2. Tiếp Nhận Làn Cổng Xuất

Tiếp nhận xe tại làn cổng xuất, chọn vỏ và cấp e-EIR xuất.

### Frontend

- Tab id: `gate_out_lane` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'gate_out_lane'`).
- Trang: `GateOutPage` — [`fontend/src/modules/gate_out/pages/GateOutPage.tsx`](../../fontend/src/modules/gate_out/pages/GateOutPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `initialSubTab`, `onNavigateTab`, `onUpdateContainerStatus`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `GateOutPage:220` | POST | `/api/DepotJobs/{id}/gate-out` | `DepotJobs.GateOut` | `DepotJobService.GateOutAsync` | `depot_jobs`, `ServiceOrders`, `YardPositions`, `AuditLogs` |
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |

Lịch sử rà soát & sửa lỗi: [17-gate-out.md](../backend-progress/17-gate-out.md)

## 3. Nhật Ký Xuất & Phiếu e-EIR

Nhật ký container đã Gate-Out và phiếu e-EIR xuất.

### Frontend

- Tab id: `gate_out_history` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'gate_out_history'`).
- Trang: `GateOutPage` — [`fontend/src/modules/gate_out/pages/GateOutPage.tsx`](../../fontend/src/modules/gate_out/pages/GateOutPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `initialSubTab`, `onNavigateTab`, `onUpdateContainerStatus`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `GateOutPage:220` | POST | `/api/DepotJobs/{id}/gate-out` | `DepotJobs.GateOut` | `DepotJobService.GateOutAsync` | `depot_jobs`, `ServiceOrders`, `YardPositions`, `AuditLogs` |
| `containerApi.getById` | GET | `/api/DepotJobs/{id}` | `DepotJobs.GetJobById` | `DepotJobService.GetJobByIdAsync`<br>`DepotJobService.GetJobByContainerNoAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |

Lịch sử rà soát & sửa lỗi: [17-gate-out.md](../backend-progress/17-gate-out.md)

