# BÁO CÁO & HIỆU SUẤT NHÂN SỰ

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [⚡ Công Việc Từng Người (Real-time)](#-công-việc-từng-người-real-time) | `report_staff_realtime` | `StaffRealtimeReportTab` |
| [Tổng Quan & Thông Lượng Bãi](#tổng-quan--thông-lượng-bãi) | `report` | `ReportPage` |
| [Năng Suất Sửa Chữa EMR](#năng-suất-sửa-chữa-emr) | `report_emr` | `ReportPage` |
| [Thời Gian Lưu Bãi (Dwell Time)](#thời-gian-lưu-bãi-dwell-time) | `report_dwell_time` | `ReportPage` |
| [Doanh Thu & Biểu Cước](#doanh-thu--biểu-cước) | `report_revenue` | `ReportPage` |

---

## ⚡ Công Việc Từng Người (Real-time)

Công việc từng người theo thời gian thực, dựng từ dữ liệu thật (giám định viên, thợ, tổ vệ sinh, tài xế…).

### Frontend

- Tab id: `report_staff_realtime` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'report_staff_realtime'`).
- Trang: `ReportPage` — [`fontend/src/modules/report/pages/ReportPage.tsx`](../../fontend/src/modules/report/pages/ReportPage.tsx)
- Nội dung tab `staff_realtime`: `StaffRealtimeReportTab` — [`fontend/src/modules/report/components/StaffRealtimeReportTab.tsx`](../../fontend/src/modules/report/components/StaffRealtimeReportTab.tsx)
- Props nhận từ `App.tsx`: `containers`, `initialTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `reportApi.exportExcel` | POST | `/api/reports/export-excel` | `Reports.Export` | — | — |
| `reportApi.getAnalytics` | GET | `/api/reports/analytics` | `Reports.GetAnalytics` | `ReportsAnalyticsService.GetAnalyticsAsync` | `depot_jobs`, `ShippingLines`, `Estimates`, `DamageItem`, `RepairOrders`, `Surveys`, `ServiceOrders`, `ServiceOrderItems`, `YardBlockLayouts` |
| `reportApi.getKPIStats` | GET | `/api/reports/kpi` | `Reports.GetKpi` | `DepotJobService.GetKpiSummaryAsync` | `depot_jobs`, `Payments`, `RepairOrders` |
| `reportApi.getStaffRealtime` | GET | `/api/reports/staff-realtime` | `Reports.GetStaffRealtime` | `ReportsAnalyticsService.GetStaffRealtimeAsync` | `depot_jobs`, `Surveys`, `RepairOrders`, `CleaningRecords`, `ForkliftDispatches`, `MaterialStockTransactions` |

Lịch sử rà soát & sửa lỗi: [48-report.md](../backend-progress/48-report.md)

## Tổng Quan & Thông Lượng Bãi

Tổng quan & thông lượng bãi (throughput, sức chứa block…).

### Frontend

- Tab id: `report` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'report'`).
- Trang: `ReportPage` — [`fontend/src/modules/report/pages/ReportPage.tsx`](../../fontend/src/modules/report/pages/ReportPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `initialTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `reportApi.exportExcel` | POST | `/api/reports/export-excel` | `Reports.Export` | — | — |
| `reportApi.getAnalytics` | GET | `/api/reports/analytics` | `Reports.GetAnalytics` | `ReportsAnalyticsService.GetAnalyticsAsync` | `depot_jobs`, `ShippingLines`, `Estimates`, `DamageItem`, `RepairOrders`, `Surveys`, `ServiceOrders`, `ServiceOrderItems`, `YardBlockLayouts` |
| `reportApi.getKPIStats` | GET | `/api/reports/kpi` | `Reports.GetKpi` | `DepotJobService.GetKpiSummaryAsync` | `depot_jobs`, `Payments`, `RepairOrders` |

Lịch sử rà soát & sửa lỗi: [48-report.md](../backend-progress/48-report.md)

## Năng Suất Sửa Chữa EMR

Năng suất sửa chữa EMR, cơ cấu hư hỏng IICL.

### Frontend

- Tab id: `report_emr` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'report_emr'`).
- Trang: `ReportPage` — [`fontend/src/modules/report/pages/ReportPage.tsx`](../../fontend/src/modules/report/pages/ReportPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `initialTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `reportApi.exportExcel` | POST | `/api/reports/export-excel` | `Reports.Export` | — | — |
| `reportApi.getAnalytics` | GET | `/api/reports/analytics` | `Reports.GetAnalytics` | `ReportsAnalyticsService.GetAnalyticsAsync` | `depot_jobs`, `ShippingLines`, `Estimates`, `DamageItem`, `RepairOrders`, `Surveys`, `ServiceOrders`, `ServiceOrderItems`, `YardBlockLayouts` |
| `reportApi.getKPIStats` | GET | `/api/reports/kpi` | `Reports.GetKpi` | `DepotJobService.GetKpiSummaryAsync` | `depot_jobs`, `Payments`, `RepairOrders` |

Lịch sử rà soát & sửa lỗi: [48-report.md](../backend-progress/48-report.md)

## Thời Gian Lưu Bãi (Dwell Time)

Thời gian lưu bãi của container.

### Frontend

- Tab id: `report_dwell_time` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'report_dwell_time'`).
- Trang: `ReportPage` — [`fontend/src/modules/report/pages/ReportPage.tsx`](../../fontend/src/modules/report/pages/ReportPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `initialTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `reportApi.exportExcel` | POST | `/api/reports/export-excel` | `Reports.Export` | — | — |
| `reportApi.getAnalytics` | GET | `/api/reports/analytics` | `Reports.GetAnalytics` | `ReportsAnalyticsService.GetAnalyticsAsync` | `depot_jobs`, `ShippingLines`, `Estimates`, `DamageItem`, `RepairOrders`, `Surveys`, `ServiceOrders`, `ServiceOrderItems`, `YardBlockLayouts` |
| `reportApi.getKPIStats` | GET | `/api/reports/kpi` | `Reports.GetKpi` | `DepotJobService.GetKpiSummaryAsync` | `depot_jobs`, `Payments`, `RepairOrders` |

Lịch sử rà soát & sửa lỗi: [48-report.md](../backend-progress/48-report.md)

## Doanh Thu & Biểu Cước

Doanh thu theo nhóm dịch vụ và biểu cước.

### Frontend

- Tab id: `report_revenue` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'report_revenue'`).
- Trang: `ReportPage` — [`fontend/src/modules/report/pages/ReportPage.tsx`](../../fontend/src/modules/report/pages/ReportPage.tsx)
- Props nhận từ `App.tsx`: `containers`, `initialTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `reportApi.exportExcel` | POST | `/api/reports/export-excel` | `Reports.Export` | — | — |
| `reportApi.getAnalytics` | GET | `/api/reports/analytics` | `Reports.GetAnalytics` | `ReportsAnalyticsService.GetAnalyticsAsync` | `depot_jobs`, `ShippingLines`, `Estimates`, `DamageItem`, `RepairOrders`, `Surveys`, `ServiceOrders`, `ServiceOrderItems`, `YardBlockLayouts` |
| `reportApi.getKPIStats` | GET | `/api/reports/kpi` | `Reports.GetKpi` | `DepotJobService.GetKpiSummaryAsync` | `depot_jobs`, `Payments`, `RepairOrders` |

Lịch sử rà soát & sửa lỗi: [48-report.md](../backend-progress/48-report.md)

