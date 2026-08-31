# Frontend / Backend Integration Status

## Đã kết nối SQL Server thật

- Authentication: `POST /api/Users/authenticate`
- Gate-In và Job list/detail: `/api/DepotJobs/*`
- Survey save/update: `/api/DepotJobs/{id}/survey`
- Payment: `/api/depot/jobs/{id}/payment`
- KPI/Dashboard: `/api/reports/kpi`, `/api/dashboard/overview`
- System users/roles: `/api/system/users`, `/api/system/roles`
- Yard read/occupancy: `/api/Yard`
- Shipping sync ACK: `/api/shipping/sync`
- Master ShippingLine/Material: `/api/MasterData/*`
- Bank webhook: `/api/Webhooks/bank-vietqr`

## Entity relationship policy

- `ShippingLine.Code` -> `Container.ShippingLineCode`, `DepotJob.ShippingLineCode`
- `DepotJob.JobNo` -> Survey, Estimate, RepairOrder, Payment, JobAuditLog
- `Role.RoleCode` -> `SystemUser.RoleName`
- `Id` remains only a technical surrogate primary key.
- Migration: `20260818153210_EnforceBusinessKeys`.

## Frontend modules còn cần chuyển khỏi mock

Các màn dưới đây vẫn có state/mock data riêng và chưa hoàn tất API integration end-to-end:

- Billing/invoice and debt allocation
- Warehouse inventory receipts/issues/stocktakes
- Customer portal, customer companies, drivers and vehicles
- Notification/Zalo simulator and notification queue
- Estimate page local estimate list
- Forklift history and some yard dispatch dialogs
- Gate-Out page local dispatch list
- Master-data damage/repair/grade/checklist catalogs
- Shipping API page local API log/config state
- System permission matrix and security policy UI

Không xóa mock data trong các module này cho đến khi API tương ứng đã có migration, service, controller và UI adapter.

## Validation đã chạy

- Backend build: success.
- Frontend lint/build: success.
- SQL Server migration: applied.
- Login/KPI/Roles/Users/Yard/Jobs: HTTP 200.
- Payment: HTTP 200, payment persisted and Job became `PAID`.