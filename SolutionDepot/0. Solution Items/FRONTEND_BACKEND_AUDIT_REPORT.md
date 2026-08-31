# Frontend <-> Backend Integration Audit

## Scope

Audit theo bộ quy tắc `FRONTEND_BACKEND_INTEGRATION_AUDIT_RULES` trên React/Vite frontend và ASP.NET Core/EF Core SQL Server backend.

## Connected and verified

| Feature | Frontend path | API | Backend | Status |
|---|---|---|---|---|
| Login | `src/components/LoginScreen.tsx` | `POST /api/Users/authenticate` | `UsersController -> UserService -> SystemUser` | PASS |
| Container list/detail | `src/api/container.api.ts` | `GET /api/DepotJobs`, `GET /api/DepotJobs/{id}` | `DepotJobsController -> DepotJobService -> DepotJob` | PASS |
| Gate-In | `src/modules/gate/pages/GateInPage.tsx` | `POST /api/DepotJobs/gate-in` | Gate-In validation, EIR, audit, SQL | PASS |
| Survey Queue | `src/modules/survey/pages/SurveyModulePage.tsx` | `GET /api/DepotJobs?status=SURVEYING` | SQL Job/Symptom/Damage | PASS |
| Survey save | `src/api/survey.api.ts` | `POST /api/DepotJobs/{id}/survey` | Survey/Damage persistence by `JobNo` | PASS |
| Estimate save | `src/modules/estimate/pages/EstimatePage.tsx` | `POST /api/DepotJobs/{id}/estimate` | Estimate/EstimateItem | PASS |
| Estimate approval/rejection | `src/api/estimate.api.ts` | `POST approve-estimate/reject-estimate` | Status transition rules | PASS |
| Repair workflow | `src/api/repair.api.ts` | assign/start/complete | RepairOrder | PASS |
| QC | `src/api/qc.api.ts` | `POST /api/DepotJobs/{id}/qc-complete` | QC transition rules | PASS |
| Gate-Out | `src/api/endpoints.ts` | `POST /api/DepotJobs/{id}/gate-out` | EIR-Out and yard release | PASS |
| Payment | `src/modules/payment/pages/PaymentPage.tsx` | `POST /api/depot/jobs/{id}/payment` | Payment and `PAID` status | PASS |
| KPI | `src/api/report.api.ts` | `GET /api/reports/kpi` | SQL aggregate KPI | PASS |
| System users/roles | `src/api/user.api.ts` | `/api/system/users`, `/api/system/roles` | SystemUser/Role business keys | PASS |
| Master shipping/materials | `src/api` | `/api/MasterData/*` | SQL master data | PASS |
| Shipping ACK | `src/api/shipping.api.ts` | `POST /api/shipping/sync` | Shipping integration adapter | PASS |

## Backend entities and database

- SQL Server is active and migrations are applied.
- `Id` remains technical surrogate key only.
- Business keys:
  - `ShippingLine.Code` -> `Container.ShippingLineCode`, `DepotJob.ShippingLineCode`.
  - `DepotJob.JobNo` -> Survey, Estimate, RepairOrder, Payment, AuditLog.
  - `Role.RoleCode` -> `SystemUser.RoleName`.
- Migration: `EnforceBusinessKeys`.
- Development seed: roles, users, shipping lines, materials, yard slots and `JOB-SEED-0001`.

## Automated validation

- Frontend `npm run lint`: PASS.
- Frontend `npm run build`: PASS.
- Backend `dotnet build`: PASS.
- Integration tests: 5 passed, 0 failed.
- End-to-end API workflow: Login -> Gate-In -> Survey -> Estimate -> Approval -> Repair -> QC -> Gate-Out: PASS.
- SQL Server persistence checks: PASS.

## Fixed during audit

- Removed global `INITIAL_MOCK_CONTAINERS` from application startup; containers load from backend.
- Survey Queue starts empty and loads SQL jobs.
- Estimate list starts empty and loads SQL estimates.
- Payment UI calls the real payment API.
- QC client now sends `comments` and `inspectorName`, matching backend DTO.
- Added report export endpoint contract.
- Frontend proxy forwards auth, workflow, reports, system, yard, master data and shipping routes.

## Remaining gaps

The following screens still contain local UI datasets or fallback services and require their own domain tables/API contracts before they can be called backend-only:

- Billing invoice, AR/debt allocation and invoice history.
- Warehouse inventory receipts, issues, returns, stocktake and material transactions.
- Customer companies, drivers, vehicles and portal accounts.
- Notifications/Zalo queues, templates, delivery logs and webhook history.
- Advanced master data: damage locations/codes, repair codes, grades, standards, cleaning tariffs, departments and service tariffs.
- Forklift history/dispatch UI beyond the core DepotJobs move endpoint.
- Gate-Out dispatch/history presentation beyond core Gate-Out endpoint.
- Shipping API log/config presentation beyond the sync ACK endpoint.
- Permission matrix/security policy UI beyond RoleCode and user APIs.
- File/image upload storage and metadata API.

These gaps are intentionally documented rather than silently backed by fake data. They need entity, migration, Application service, controller, API client, form binding, validation and tests per module.

## Integration status

`NEEDS_FIX` for full repository-wide backend-only operation because the remaining gaps above still use local fallback data. Core Depot workflow is `READY` and verified against SQL Server.
