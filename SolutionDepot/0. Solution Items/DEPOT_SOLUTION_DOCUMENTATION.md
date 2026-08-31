# DEPOT SOLUTION DOCUMENTATION - Backend

Phiên b?n: 2026
Ngôn ng?: Ti?ng Vi?t
M?c tiêu: Tài li?u h??ng d?n chi ti?t cho ph?n backend c?a `SolutionDepot` (project .NET 8) ??t trong th? m?c `0. Solution Items` ?? làm tài li?u tham kh?o cho phát tri?n, tri?n khai và b?o trì.

---

## 1. T?ng quan
Solution: `SolutionDepot`
Ph?n Backend tri?n khai các service chính: Gate-In, Survey, EMR Estimate, Work Orders, QC, Yard Management, Billing, EDI Gateway, Payment Webhook.

Công ngh? chính:
- .NET 8 (C#)
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server (production)
- Serilog (logging)
- JWT + RBAC (authentication & authorization)

---

## 2. C?u trúc solution (tóm t?t d? án liên quan backend)
- `1. Infrastructure/Depot.Utilities` - Helpers, adapters chung (logging adapter, time provider, common exceptions)
- `1. Infrastructure/Depot.ViewModels` - DTOs và ViewModels dùng cho Controllers
- `2. Domain/Depot.Application` - Application services, validators, use-cases, business logic orchestration
- `2. Domain/Depot.Data` - Ef  DepotDbContext DepotDbContextFactory, Entities, Configurations, Migrations
- `3. Hosts/Depot.BackendApi` - Main Web API (controllers, swagger, DI composition, authentication)
- `3. Hosts/Depot.ApiIntegration` - Background jobs, EDI/External API clients, scheduled workers
- `3. Hosts/Storage-File` - File storage host (upload/download)
- `Tests/Depot.Tests` - Unit and integration tests

---

## 3. H??ng d?n kh?i ??ng d? án c?c b?
1. Chu?n b? môi tr??ng:
   - .NET 8 SDK
   - SQL Server local (SQL Express, LocalDB ho?c Docker SQL Server)
   - Node.js (n?u ch?y frontend ??a ph??ng)

2. Thi?t l?p bi?n môi tr??ng (development):
   - `ASPNETCORE_ENVIRONMENT=Development`
   - `ConnectionStrings__DefaultConnection` = `Server=localhost;Database=SolutionDepot.Dev;User Id=sa;Password=YourStrong!Pass;` (ví d? - không commit)
   - `Jwt__Issuer`, `Jwt__Audience`, `Jwt__Secret` (dùng test secret trong dev)

3. Áp d?ng migration và seed data:
   - M? terminal t?i th? m?c `2. Domain/Depot.Data`
   - Ch?y: `dotnet ef database update --project Depot.Data --startup-project ../../3. Hosts/Depot.BackendApi`
   - Ch?y script seed (n?u có): `dotnet run --project 0. Solution Items/seed/SeedRunner` (ho?c h??ng d?n t??ng ?ng)

4. Ch?y d?ch v? API:
   - Start `Depot.BackendApi` t? Visual Studio / `dotnet run --project 3. Hosts/Depot.BackendApi`
   - Start `Storage-File` n?u c?n upload files: `dotnet run --project 3. Hosts/Storage-File`

5. Ki?m tra:
   - Swagger: `https://localhost:5001/swagger`
   - Health: `https://localhost:5001/health`

---

## 4. Quy ??c thi?t k? & phát tri?n
- Clean Architecture: `Host -> Application -> Data` m?t chi?u.
- Controllers m?ng, g?i Application Services.
- DTOs/ViewModels trong `Depot.ViewModels` — không tr? EF entities tr?c ti?p.
- Primary keys: `BIGINT IDENTITY` (?u tiên) ho?c `INT IDENTITY`.
- Không dùng CQRS/MediatR/GenericRepository/UnitOfWork.
- Transactions: qu?n lý qua `DbContext` trong application service khi c?n atomic.
- Read queries: `.AsNoTracking()` khi ch? ??c.

---

## 5. Database & EF Core
- `Depot.Data/EF/DepotDbContext.cs` ch?a DbSet và c?u hình DbContext.
- Các entity configurations n?m trong `Configurations` (implement `IEntityTypeConfiguration<T>`).
- Migrations: l?u trong `Depot.Data/Migrations` ho?c project riêng `Depot.Data.Migrations`.
- Migration commands (ví d?):
  - Add migration: `dotnet ef migrations add AddContainers --project 2. Domain/Depot.Data --startup-project 3. Hosts/Depot.BackendApi`
  - Update database: `dotnet ef database update --project 2. Domain/Depot.Data --startup-project 3. Hosts/Depot.BackendApi`

---

## 6. API Design & Contracts
- RESTful endpoints under `/api/*`.
- Controllers must validate ModelState and delegate to application services.
- Pagination: support `page` and `pageSize` and filters for list endpoints.
- Business actions use explicit routes: e.g. `POST /api/estimates/{id}/submit`.
- Error responses: follow RFC 7807 Problem Details schema.

OpenAPI/Swagger:
- Enable Swagger in Development only by default; publish OpenAPI spec artifact in CI pipeline for frontend and integration teams.

---

## 7. Authentication & Authorization
- JWT Bearer authentication.
- Token claims: `sub` (UserId), `customerId`, `role`.
- Policies: implement policy-based authorization for sensitive operations (billing, invoice, audit).
- Store refresh tokens securely and implement refresh flow in `Depot.Application`.

---

## 8. Integrations & External Interfaces
- EDI Gateway (EDIFACT): implemented in `Depot.ApiIntegration` with retry and poison-message handling.
- Shipping Line APIs (Maersk, MSC): client wrappers with configurable endpoints and credentials stored in config/secret manager.
- Payment gateway webhook: secure endpoint validating signature, mark invoice `PAID` on success.
- Zalo/Notification: integration adapter in `Infrastructure` or `ApiIntegration`.

---

## 9. File Storage
- `Storage-File` host provides secure upload/download APIs.
- Metadata (fileId, path, ownerId, mimeType) stored in DB.
- Storage provider abstraction to swap local filesystem / S3 / Azure Blob.

---

## 10. Logging, Monitoring, Health
- Serilog configuration: write to console, file and optional external sink (ELK/Seq).
- CorrelationId middleware to propagate request id.
- Health checks: `/health` verify DB, Storage, external endpoints.
- Metrics: integrate Prometheus exporter if required.

---

## 11. Testing Strategy
- Unit tests: `Depot.Application` logic and utilities.
- Integration tests: `Depot.Data` (in-memory or test SQL) and controllers via `WebApplicationFactory`.
- E2E tests: simulate major flows (Gate-In -> Survey -> Estimate -> Approval -> WorkOrder -> QC -> Gate-Out).
- Use CI to run tests on PRs.

---

## 12. CI/CD
- CI: restore -> build -> lint (analyzers) -> test -> publish artifacts.
- CD: deploy API host to IIS or container. Run migrations in controlled release step.
- Secrets: use pipeline secret store (Azure Key Vault / GitHub Secrets / Jenkins Credentials).

---

## 13. Operational runbooks (ng?n)
- ??ng nh?p l?i sever: ki?m tra logs Serilog -> correlation id -> trace through services.
- DB migration rollback: t?o migration ??o chi?u và deploy theo quy trình review.
- Restore DB trong tr??ng h?p kh?n c?p: luôn dùng backup snapshot và validate.

---

## 14. Contribution & Coding Guidelines
- PSR-like conventions: use EditorConfig and Roslyn analyzers.
- PR must include: description, change scope, migration steps (if any), test instructions, checklist.
- At least one reviewer (Team Lead) must approve Copilot-generated code.

---

## 15. T?p tài li?u b? sung trong `0. Solution Items`
- `SolutionDepot-Backend-Architecture.md`
- `DEPOT_SOLUTION_DOCUMENTATION.md` (b?n này)
- `CONTRIBUTING.md`, `PR_TEMPLATE.md`, `ISSUE_TEMPLATE.md`
- `seed/` scripts
- `diagrams/` ERD, sequence diagrams

---

N?u c?n, tôi có th?: t?o m?u `Dockerfile` cho `Depot.BackendApi`, t?o m?u `appsettings.Development.json`, ho?c sinh script seed/EF migration sample. H?i ph?n c? th? b?n mu?n tôi th?c hi?n ti?p.
