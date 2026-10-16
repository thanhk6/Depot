# TỔNG QUAN

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Dashboard ERP](#dashboard-erp) | `dashboard` | `DashboardPage` |
| [Sơ Đồ Vòng Đời Nghiệp Vụ](#sơ-đồ-vòng-đời-nghiệp-vụ) | `workflow` | `BusinessWorkflowModal` |

---

## Dashboard ERP

Trang tổng quan: KPI container trong bãi, luồng trạng thái, số liệu hôm nay.

### Frontend

- Tab id: `dashboard` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'dashboard'`).
- Trang: `DashboardPage` — [`fontend/src/modules/dashboard/pages/DashboardPage.tsx`](../../fontend/src/modules/dashboard/pages/DashboardPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `reportApi.getKPIStats` | GET | `/api/reports/kpi` | `Reports.GetKpi` | `DepotJobService.GetKpiSummaryAsync` | `depot_jobs`, `Payments`, `RepairOrders` |
| `yardApi.getPositions` | GET | `/api/yard` | `Yard.GetPositions` | `YardService.GetYardPositionsAsync` | `YardPositions` |

Lịch sử rà soát & sửa lỗi: [01-dashboard.md](../backend-progress/01-dashboard.md)

## Sơ Đồ Vòng Đời Nghiệp Vụ

Sơ đồ vòng đời nghiệp vụ container (Gate-In → … → Gate-Out). Không phải trang riêng: bấm menu sẽ mở modal `BusinessWorkflowModal` (App.tsx `handleSelectTab`), tab đang xem giữ nguyên.

### Frontend

- Tab id: `workflow` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'workflow'`).
- Trang: `BusinessWorkflowModal` — [`fontend/src/modules/system/components/BusinessWorkflowModal.tsx`](../../fontend/src/modules/system/components/BusinessWorkflowModal.tsx)
- Props nhận từ `App.tsx`: `mở dạng modal qua handleSelectTab (không đổi activeTab)`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `workflowApi.getDefinition` | GET | `/api/workflow/definition` | `Workflow.GetDefinition` | — | — |

Lịch sử rà soát & sửa lỗi: [02-workflow.md](../backend-progress/02-workflow.md)

