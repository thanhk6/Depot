# SolutionDepot - H??ng d?n t?ng b??c (Step-by-step)

Phiên b?n: 2026
Ngôn ng?: Ti?ng Vi?t
M?c ?ích: Tài li?u h??ng d?n chi ti?t các b??c th?c hi?n tính n?ng, tri?n khai và v?n hành cho `SolutionDepot` (backend + frontend) ??t trong `SolutionDepot\0. Solution Items`.

---

1) Chu?n b? môi tr??ng (Setup)
- 1.1 Clone repository và m? solution:
  - `git clone <repo-url>`
  - M? `SolutionDepot.sln` trong Visual Studio / VS Code.
- 1.2 Cài ??t công c?:
  - .NET 8 SDK, Node.js (frontend), Docker (tu? ch?n), SQL Server (LocalDB/ Docker).
- 1.3 Restore & build:
  - `dotnet restore` t?i th? m?c solution
  - `dotnet build`
- 1.4 Thi?t l?p env dev (example):
  - `ASPNETCORE_ENVIRONMENT=Development`
  - `ConnectionStrings__DefaultConnection=Server=localhost;Database=SolutionDepot.Dev;User Id=sa;Password=YourStrong!Pass;`
  - `Jwt__Secret` v.v.

Acceptance: solution build thành công, có th? ch?y `Depot.BackendApi` local.

---

2) Thi?t l?p database & migrations
- 2.1 T?o DbContext và Entities (n?u ch?a có): file: `2. Domain/Depot.Data/EF/DepotDbContext.cs` và `Entities/*`.
- 2.2 Thêm c?u hình entity: `Configurations/<Entity>Configuration.cs` implement `IEntityTypeConfiguration<T>`.
- 2.3 T?o migration:
  - `dotnet ef migrations add InitDepot --project 2. Domain/Depot.Data --startup-project 3. Hosts/Depot.BackendApi`
- 2.4 Áp d?ng migration:
  - `dotnet ef database update --project 2. Domain/Depot.Data --startup-project 3. Hosts/Depot.BackendApi`

Acceptance: B?ng c? s? d? li?u ???c t?o và k?t n?i thành công.

---

3) Cách tri?n khai m?t feature m?i (m?u: Gate-In Container)
- M?c tiêu: t?o endpoint `POST /api/gatein` l?u e-EIR và tr? e-EIR id.

B??c th?c hi?n:
- 3.1 Thi?t k? domain model:
  - File: `2. Domain/Depot.Data/Entities/GateIn.cs` (Id BIGINT, ContainerNo, SealNo, DriverName, Plate, Status, CreatedAt)
- 3.2 Thêm `GateInConfiguration` trong `Configurations` (PK, Index ContainerNo, Max lengths).
- 3.3 T?o migration & c?p nh?t DB (xem b??c 2).
- 3.4 Application service:
  - Thêm interface `IGateInService` vào `Depot.Application` và implement `GateInService`.
  - Logic: validate ContainerNo (ISO 6346 check digit), check duplicate open EIR, create entity, save via `Depot.Data` DbContext.
- 3.5 ViewModels / DTOs:
  - `1. Infrastructure/Depot.ViewModels/GateInDto.cs` (Request/Response models).
- 3.6 Controller:
  - `3. Hosts/Depot.BackendApi/Controllers/GateInController.cs` endpoints: `POST /api/gatein`, `GET /api/gatein/{id}`.
  - Validate ModelState, call `IGateInService`.
- 3.7 Unit tests:
  - `Tests/Depot.Tests/GateInServiceTests.cs` - tests: valid create, invalid container no, duplicate e-EIR.
- 3.8 Integration test (optional):
  - `WebApplicationFactory` test to POST /api/gatein and assert 201 and DB record.
- 3.9 Frontend contract:
  - Document request/response fields in OpenAPI.
- 3.10 Acceptance Criteria:
  - API tr? 201 và body ch?a `id`, d? li?u l?u trong DB, ContainerNo h?p l?, duplicate tr? 400.

---

4) Survey (Giám ??nh) - b??c th?c hi?n
- 4.1 Domain: `Survey`, `SurveyItem` entities (containerId, inspectorId, damageCode, locationCode, photoUrls, notes).
- 4.2 Application: `ISurveyService` ?? t?o survey, add items, upload photos (via Storage-File service), compute Grade.
- 4.3 API: `POST /api/surveys`, `PUT /api/surveys/{id}/items`, `POST /api/surveys/{id}/photos`.
- 4.4 Tests: unit tests for damage code mapping, grade calculation.
- Acceptance: survey stored, photos uploaded (metadata stored), grade computed per rules.

---

5) EMR Estimate (Báo giá) - b??c th?c hi?n
- 5.1 Build model: `Estimate`, `EstimateLine` (damageCode, labourHours, materialCost, responsibleParty).
- 5.2 Business rules: apply tariff table, labor rates by contract, auto-approval threshold.
- 5.3 API: `POST /api/estimates` (create), `POST /api/estimates/{id}/submit` (send to shipping line via EDI/API), `GET /api/estimates/{id}/status`.
- 5.4 Integration: queue outgoing message to `Depot.ApiIntegration` for EDI push.
- Acceptance: estimate total calculated, persisted, outgoing message queued.

---

6) EDI / Shipping Line Integration
- 6.1 Implement adapter in `Depot.ApiIntegration/Integrations/`.
- 6.2 Support formats: JSON REST and EDIFACT (WESTIM/DESTIM). Use mapping classes and tests.
- 6.3 Delivery guarantees: use retry with backoff, record attempts, mark final state (APPROVED/REJECTED/REVISED).
- Acceptance: outbound messages logged, retries attempted, response handled to update Estimate status.

---

7) Work Order & Repair Flow
- 7.1 On Estimate approval -> create `WorkOrder` with lines, assign to team.
- 7.2 Reserve materials: check & decrement stock in one transaction.
- 7.3 Kanban board: implement minimal columns (Pending, InProgress, Completed, QC Passed).
- Acceptance: work order lifecycle transitions recorded; stock decremented when WO moves to InProgress.

---

8) QC & Gate-Out
- 8.1 QC tests: Light Test, Water-tight Test, Structure Test - model results in `QcResult` entity.
- 8.2 On QC Passed: mark container `AV` and make it available for Gate-Out.
- 8.3 Gate-Out controller verifies Booking/RO and container Grade before issuing e-EIR Out.
- Acceptance: QC record present; Gate-Out only for AV containers.

---

9) File Storage & Photos
- 9.1 Use `Storage-File` host to upload photos. Backend stores metadata (fileId, url) in DB.
- 9.2 For local dev: configure storage provider to local filesystem; for prod switch to S3/Azure Blob.
- Acceptance: photos accessible via signed URL or internal proxy; metadata persisted.

---

10) Billing, SOA & Invoicing
- 10.1 Batch approved and QC-passed EMR items into Monthly SOA generator.
- 10.2 Generate invoice records and send to Accounting; integrate VAT e-invoice export.
- 10.3 Payment webhook marks invoice PAID.
- Acceptance: SOA batch created with correct totals, invoice emitted, payment reconciled.

---

11) Tests & QA
- 11.1 Unit tests: cover application services and utility functions.
- 11.2 Integration tests: DbContext using test DB or in-memory provider for queries.
- 11.3 E2E tests: Playwright or Cypress for frontend flows (Gate-In -> Survey -> Estimate -> Approval -> Gate-Out).
- Acceptance: All PRs pass unit tests; major flows have E2E coverage.

---

12) CI/CD & Release
- 12.1 CI for PR: `dotnet build` -> linters -> run unit tests -> publish test reports -> build docker image (optional).
- 12.2 CD: deploy to staging, run smoke tests, approve to prod. Migration step is manual/controlled.
- Acceptance: green pipeline, successful staging smoke tests before production deployment.

---

13) Monitoring, Logging & Runbooks
- 13.1 Instrument logging with Serilog and correlation id.
- 13.2 Health checks for DB, Storage, EDI.
- 13.3 Runbooks: Recovery (service restart), DB restore, payment webhook retry handling.

---

14) PR checklist (t?i thi?u)
- Build succeeds
- Unit tests added/updated and pass
- Integration tests (if DB change) pass
- Migration included and documented
- Security scan OK
- README / docs updated if necessary
- Reviewer assigned and approved

---

15) M?o & l?u ý
- Gi? các change nh?, atomic.
- Luôn seed master data khi c?n test tính n?ng.
- Document API contract (OpenAPI) cho frontend tr??c khi thay ??i.
- Không commit secrets.

---

File này là b?n tóm t?t b??c công vi?c cho các tính n?ng chính. Tôi có th?: sinh checklist chi ti?t cho m?t feature c? th? (ví d? Gate-In), t?o mã sample (entity + config + service + controller) ho?c t?o m?u migration script. Ch?n m?c b?n mu?n tôi th?c hi?n ti?p.
