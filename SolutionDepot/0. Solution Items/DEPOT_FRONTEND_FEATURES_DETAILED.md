# DEPOT FRONTEND — Danh sách ch?c n?ng & Tài li?u chi ti?t tri?n khai

Phiên b?n: 2026
M?c tiêu: Tài li?u chi ti?t cho các ch?c n?ng frontend c?n tri?n khai trong `Depot.Frontend`. M?i ch?c n?ng có mô t? UI, API contract c?n backend h? tr?, component/feature breakdown, acceptance criteria và test cases.

---

T?ng quan: frontend dùng React + TypeScript + Tailwind. Data fetching b?ng React Query. Real-time b?ng SignalR.

M?c l?c ch?c n?ng (?u tiên):
1. Gate-In (Ti?p nh?n & t?o e-EIR)
2. Survey (Giám ??nh & ch?p ?nh h? h?ng)
3. Cleaning (V? sinh queue & execution)
4. Estimate (T?o & g?i báo giá)
5. Work Orders (Kanban & thao tác th?)
6. QC Inspection (Nghi?m thu)
7. Yard Map 2D (Hi?n th? bãi, pan/zoom, ch?n container)
8. Forklift Tablet UI (Tablet-first job list)
9. Billing & Payment (VietQR, status)
10. File/photo upload (integration v?i Storage-File)
11. Notifications & Zalo OA interactions (duy?t estimate)

Cho m?i ch?c n?ng g?m: M?c tiêu, màn hình UI chính, endpoint API c?n, DTO m?u, components, b??c tri?n khai, acceptance criteria, test cases.

---

1) Gate-In (Ti?p nh?n & t?o e-EIR)
- M?c tiêu: nhân viên c?ng nh?p li?u nhanh thông tin container, nh?n ?nh, t?o e-EIR và phát mã QR.
- Màn hình chính: `GateInPage`
  - Form: `ContainerNo`, `Carrier`, `SealNo`, `TruckPlate`, `DriverName`, `Photos (optional)`, `Notes`.
  - Button: `Create e-EIR` -> show modal with QR and e-EIR id.
- API endpoints (backend c?n):
  - POST `/api/gatein` Request: GateInCreateDto
  - GET `/api/gatein/{id}` Response: GateInDto
  - POST `/api/gatein/{id}/photos` multipart upload -> returns file metadata
- DTO m?u (TS/JSON):
  - GateInCreateDto { containerNo, carrierCode, sealNo, truckPlate, driverName, notes }
  - GateInDto { id, containerNo, status, qrCodeUrl, createdAt }
- Components:
  - `GateInForm`, `PlateOCRPreview` (optional), `PhotoUploader`, `EirQrModal`.
- B??c tri?n khai:
  1. T?o route & page.
  2. Implement `GateInForm` with validation (ISO 6346 check digit helper).
  3. Hook API calls with React Query; optimistic UI not required.
  4. Upload photos using Storage API, attach returned fileIds when creating gatein.
  5. Display QR modal after success.
- Acceptance criteria:
  - Valid `ContainerNo` ???c ch?p nh?n; sai format hi?n th? l?i.
  - T?o e-EIR tr? 201 và modal hi?n th? mã QR.
  - Photos l?u và liên k?t v?i e-EIR.
- Test cases:
  - Valid submission -> 201 -> modal shown.
  - Invalid container no -> client validation error.
  - Photo upload failure -> show retry.

---

2) Survey (Giám ??nh & ch?p ?nh h? h?ng)
- M?c tiêu: giám ??nh viên ghi nh?n h? h?ng theo v? trí IICL, upload ?nh, tính grade provisional.
- Màn hình chính: `SurveyPage`, `SurveyItemEditor`
  - Header: e-EIR info, container no, createdAt
  - Canvas/Diagram: interactive 6-face selector (click face -> add damage item)
  - Form for each damage: `locationCode`, `damageCode`, `severity`, `notes`, `photo`.
  - Button: `Compute Grade`, `Save Survey`, `Send to Estimate`
- API endpoints:
  - POST `/api/surveys` create survey
  - POST `/api/surveys/{id}/items` add damage
  - POST `/api/surveys/{id}/photos` upload
  - POST `/api/surveys/{id}/compute-grade` -> returns Grade
- DTOs:
  - SurveyCreateDto { gateInId, inspectorId }
  - SurveyItemDto { face, locationCode, damageCode, notes, photoIds }
- Components:
  - `ContainerDiagram` (SVG/Canvas), `SurveyItemList`, `DamageForm`, `PhotoGallery`.
- Steps:
  1. Implement `ContainerDiagram` with clickable faces.
  2. Implement modal to add damage items and upload photos.
  3. Call compute-grade and show provisional grade badge.
  4. Save and mark survey complete.
- Acceptance:
  - Damage items persisted with photo references.
  - Grade computed consistently with backend.
- Tests:
  - Add damage item flow, photo upload, compute grade.

---

3) Cleaning (V? sinh queue & execution)
- M?c tiêu: qu?n lý hàng ch? v? sinh, ?ánh d?u completed.
- Screens: `CleaningQueuePage`, `CleaningExecutionPage`
- API:
  - GET `/api/cleaning/queue?page&pageSize&filter`
  - POST `/api/cleaning/{id}/start`, POST `/api/cleaning/{id}/complete`
- Components: `QueueTable`, `CleaningChecklist`, `PhotoAfterUpload`.
- Acceptance: status chuy?n chính xác, time logging.

---

4) Estimate (T?o & g?i báo giá)
- M?c tiêu: t? survey ho?c manual t?o estimate, show breakdown, send to shipping line.
- Screens: `EstimateEditorPage`, `EstimateListPage`, `EstimateDetailPage`
- API:
  - POST `/api/estimates` create
  - POST `/api/estimates/{id}/submit` submit to carrier
  - GET `/api/estimates/{id}`
- DTOs: EstimateCreateDto { surveyId, lines:[{damageCode, qty, labourHours, materialCost, responsible}] }
- Components: `EstimateLinesTable`, `PriceCalcSummary`, `SendToCarrierModal`.
- Steps:
  1. From survey, prefill estimate lines.
  2. Allow edit lines, apply tariff lookup via API endpoint `/api/tariffs/{damageCode}`.
  3. Submit -> show status and history.
- Acceptance:
  - Accurate calculation, saved, submit queues EDI and shows status updates.
- Tests: compute totals, submit status handling.

---

5) Work Orders (Kanban & thao tác th?)
- M?c tiêu: qu?n lý ti?n ?? s?a ch?a.
- Screens: `WorkOrdersKanbanPage`, `WorkOrderDetailPage`
- API:
  - GET `/api/workorders?filter`
  - POST `/api/workorders` create
  - PATCH `/api/workorders/{id}/move` change status
- Components: `KanbanBoard`, `WOCard`, `AssignModal`.
- Acceptance: drag-drop tr?ng thái, assign ng??i, link PXK (xu?t kho).

---

6) QC Inspection (Nghi?m thu)
- M?c tiêu: QC th?c hi?n Light/Water/Structure tests, upload report, pass/rework.
- Screens: `QcInspectionPage`
- API:
  - POST `/api/qc/{workOrderId}/inspect` with test results and photos
- Acceptance: QC Passed changes container status to AV and triggers notification.

---

7) Yard Map 2D (Hi?n th? bãi)
- M?c tiêu: hi?n th? bãi, tìm container, suggest nearest Grade A for Gate-Out.
- Components: `YardCanvas` (pan/zoom), `ContainerMarker`, `SearchBar`
- API:
  - GET `/api/yard/blocks`
  - GET `/api/yard/containers?filter&bbox` for visible area
- Real-time: subscribe to SignalR hub `/hubs/yard` for moves
- Acceptance: smooth pan/zoom, select container shows detail panel.

---

8) Forklift Tablet UI
- M?c tiêu: tablet-first UI for drivers: job list, map view, confirm pick/drop with 1 tap.
- Screens: `TabletJobsPage`, `JobDetailModal`
- Requirements: large touch targets, offline-friendly minimal caching
- API: GET `/api/forklift/jobs?driverId` PATCH `/api/forklift/jobs/{id}/complete`
- Acceptance: one-tap confirm updates server and map.

---

9) Billing & Payment (VietQR)
- Screens: `InvoiceList`, `InvoiceDetail` (shows VietQR), `PaymentStatus`
- API:
  - GET `/api/billing/invoices`
  - POST `/api/billing/invoices/{id}/generate-vietqr` -> returns image/URL
  - Webhook handling on backend updates invoice status
- Acceptance: QR generated, after webhook invoice marked PAID.

---

10) File/photo upload (Storage-File)
- Integration: use pre-signed URLs or direct multipart to `Storage-File`.
- Client flow: upload -> get fileId -> include fileId in create calls.
- Components: `FileUploader` with progress and retry.
- Acceptance: files accessible and linked in DB.

---

11) Notifications & Zalo OA
- Flow: estimates can be sent to carriers; UI shows status and actions.
- Components: `NotificationCenter`, `ZaloActionModal`.
- API: GET `/api/notifications`, POST `/api/notifications/{id}/action`
- Acceptance: clicking approve in Zalo triggers backend callback and UI updates.

---

Cross-cutting concerns
- Auth: use `AuthProvider` context, redirect to login if 401.
- Error handling: toast notifications, global error boundary, friendly messages.
- Forms: use React Hook Form + Zod for validation.
- Types: sync DTO types from `Depot.ViewModels` (generate from OpenAPI when available).
- Tests: unit tests for components, integration tests for hooks/services, E2E flows.

---

Roadmap & Implementation plan (sprints)
- Sprint 1: Gate-In (form, photo, QR) + Storage integration
- Sprint 2: Survey (diagram, items, photo, grade compute)
- Sprint 3: Cleaning + Estimate basic editor
- Sprint 4: Estimate submit + EDI integration (visibility)
- Sprint 5: Work Orders Kanban + Material reservation
- Sprint 6: QC + Gate-Out flow
- Sprint 7: Yard Map + Forklift Tablet
- Sprint 8: Billing + VietQR + Zalo integration

---

Deliverables per feature (PR checklist)
- UI components + pages
- API client + types
- Unit tests (coverage >= 70% for feature code)
- E2E tests for main happy path
- Accessibility checks for tablet views
- OpenAPI changes documented and published

---

File này mô t? chi ti?t các ch?c n?ng frontend c?n làm. Tôi có th?:
- Sinh s?n skeleton `Depot.Frontend` (Vite + React + TS) v?i pages/components placeholders.
- T?o m?u API client (`src/services/api/axios.ts`) và m?u hook (`useGateIn`) và m?t m?u page `GateInPage`.
Ch?n tác v? b?n mu?n tôi th?c hi?n ti?p.