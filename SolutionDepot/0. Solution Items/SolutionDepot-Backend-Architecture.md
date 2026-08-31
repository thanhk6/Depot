# SolutionDepot - Backend Architecture (Tài liệu)

Phiên bản: 2026
Ngôn ngữ: Tiếng Việt
Mục tiêu: Mô tả cấu trúc solution, quy ước phát triển, trách nhiệm các project, và hướng dẫn nhanh để đội phát triển thực hiện backend cho hệ thống Depot EMR theo .NET 8 + Clean Architecture.

1. Tổng quan
- Solution: `SolutionDepot`
- Công nghệ: .NET 8, ASP.NET Core Web API, EF Core, SQL Server, TypeScript (frontend), React.
- Nguyên tắc: Clean Architecture, không dùng CQRS/MediatR/GenericRepository/UnitOfWork.
- Ưu tiên: code rõ ràng, dễ bảo trì, có thể triển khai trên IIS, tách File Storage service, mở rộng tích hợp API bên ngoài.

2. Cấu trúc Solution (thư mục & project)
SolutionDepot
│
├── `0. Solution Items`  <-- tài liệu, templates, diagrams, roadmaps, backlog
│    └── `SolutionDepot-Backend-Architecture.md` (bản này)
│
├── `1. Infrastructure`
│   ├── `Depot.Utilities`         -- helper, extensions chung, logging adapters, time providers
│   └── `Depot.ViewModels`       -- DTO/VM dùng cho API layer (mapping từ Domain)
│
├── `2. Domain`
│   ├── `Depot.Application`      -- application services, use-cases, DTOs cụ thể business, validators
│   └── `Depot.Data`             -- persistence layer
│       ├── `Configurations`     -- EF Core entity type configurations
│       ├── `EF`                 -- DbContext và các helper liên quan EF
│       ├── `Entities`           -- domain entities (POCO)
│       ├── `Enums`              -- enum dùng chung
│       ├── `Extensions`         -- extension methods chuyên biệt cho domain
│       └── `Migrations`         -- EF Core migrations (project chứa Migrations)
│
├── `3. Hosts`
│   ├── `Storage-File`           -- file storage microservice / host (tách biệt), có API upload/download
│   ├── `Depot.BackendApi`       -- main Web API host (IIS deploy target)
│   └── `Depot.ApiIntegration`   -- background jobs, EDI gateway, scheduled tasks, message consumers
│
└── `Tests`
    └── `Depot.Tests`            -- unit & integration tests

3. Quy ước phụ thuộc (Dependency rules)
- `Depot.BackendApi` -> `Depot.Application` -> `Depot.Data` (hướng đi một chiều)
- `Depot.Application` không reference `Microsoft.AspNetCore.*` hoặc `EFCore` provider trực tiếp (chỉ reference interfaces nếu cần)
- `Depot.Data` là nơi chứa `DbContext` và cấu hình EF core; `Entities` là POCO domain models
- `Infrastructure` chứa các tiện ích không chứa business logic (logging adapters, mail, payment integration helpers)

4. Project responsibilities (tóm tắt)
- `Depot.Application`: use-cases, transaction scripts, services, validators, DTOs mapping
- `Depot.Data`: EF Core DbContext, entity configurations, repository-like queries (thực hiện trực tiếp trên DbContext)
- `Depot.Utilities`: helpers, constants, shared exceptions, result types
- `Depot.ViewModels`: input/output models dành cho controllers
- `Depot.BackendApi`: controllers, model binding, authentication, authorization, swagger, DI composition
- `Depot.ApiIntegration`: EDI/EDIFACT client, external API integrations (Maersk, Zalo, Payment gateway), background workers
- `Storage-File`: file server host (REST API + storage provider abstraction)

5. EF Core & Database
- Primary keys: `BIGINT IDENTITY` hoặc `INT IDENTITY` theo entity scale. Không dùng GUID làm PK nếu không cần.
- Configurations: mỗi entity có `EntityTypeConfiguration<T>` trong folder `Configurations`.
- Migrations: đặt trong `Depot.Data.Migrations` hoặc root `Depot.Data` dựa theo chuẩn repository.
- Query rules: read-only queries dùng `.AsNoTracking()`. Tránh load-to-memory, áp dụng paging, filtering ở DB.

6. API & Controllers
- Controllers phải mỏng: validate ModelState -> gọi `Application Service` -> trả HTTP response.
- REST conventions: routes `api/{module}`; actions: GET list/paged, GET by id, POST create, PUT update, DELETE.
- Business actions: explicit endpoints e.g. `POST /api/estimates/{id}/submit`.

7. Security & Auth
- JWT authentication. Tokens chứa `UserId`, `CustomerId`, `Role`.
- RBAC: role-driven authorization; không hard-code quyền trong controllers (sử dụng attribute + policy).
- Secrets: lưu trong environment variables hoặc secret manager của CI/CD. Không commit secrets.

8. Integrations (EDI, Maersk, Payment, Zalo)
- Tách client implementations vào `Depot.ApiIntegration` hoặc `Infrastructure/Integrations`.
- Giao tiếp EDI: support JSON REST và EDIFACT (CODECO, WESTIM, DESTIM). Cấu hình mapping và retry policy.
- Payment gateway: webhook endpoint trong `Depot.BackendApi` để nhận callback thanh toán (verify signature).

9. File Storage
- Tách `Storage-File` host để dễ scale và bảo mật. `Depot.BackendApi` lưu metadata (URL, path, fileId) trong DB.
- Storage provider abstraction để chuyển giữa local filesystem, S3-compatible hoặc Azure Blob.

10. Logging, Monitoring, Health
- Logging: Serilog (structured logging), log to file + console + centralized sink.
- Health checks: `/health` endpoint, kiểm tra DB, Storage, EDI endpoint connectivity.
- Tracing: phân tích request id, correlation id header middleware.

11. Error handling & Validation
- Global exception middleware trả chuẩn problem details (RFC 7807).
- Validation bằng FluentValidation hoặc custom validators trong `Depot.Application`.

12. Tests
- Unit tests cho `Depot.Application` và helpers.
- Integration tests cho `Depot.Data` (in-memory hoặc test DB) và API endpoints (test server).
- Mocks/stubs cho external integrations trong `ApiIntegration` khi unit-testing.

13. CI/CD & Deployment
- CI pipeline: build, restore, lint, run tests, run static analysis, publish artifacts.
- CD pipeline: deploy `Depot.BackendApi` (IIS) và `Storage-File` (separate host). Migrations chạy trong controlled step (reviewed).
- Environments: `dev`, `staging`, `prod` with separate connection strings and secrets.

14. Conventions & development guidelines
- Coding style: use analyzer rules (EditorConfig + Roslyn analyzers). Follow consistent naming.
- DTO vs Entity: Controllers accept/return DTOs (`Depot.ViewModels`), do not expose EF entities.
- Transactions: manage via `DbContext` inside `Application Service`. Keep transaction boundaries explicit.
- No generic repository: write explicit queries in `Depot.Data` or use specific application services.

15. Onboarding checklist (quick)
- Clone repo, open solution in VS/VSCode.
- Configure local `appsettings.Development.json` (DB connection to local SQL Express / Docker SQL).
- Run EF migrations (`dotnet ef database update` in `Depot.Data`).
- Run backend: `Depot.BackendApi` and `Storage-File` (if needed).
- Seed master data (scripts in `0. Solution Items/seed`).

16. How to add a new module (feature)
- Create folder/module under `Depot.Application` and corresponding `Entities` + `Configurations` in `Depot.Data`.
- Add DTOs in `Depot.ViewModels`.
- Implement application service method in `Depot.Application`.
- Add controller in `Depot.BackendApi` that calls the service.
- Add EF migration, test cases, and PR with description & acceptance criteria.

17. Files to include in `0. Solution Items`
- `SolutionDepot-Backend-Architecture.md` (bản này)
- `CONTRIBUTING.md` (quy ước commit, branch, PR)
- `PR_TEMPLATE.md`
- `ISSUE_TEMPLATE.md`
- `seed/` scripts để seed master data
- `diagrams/` ERD và sequence diagrams

18. Frontend (Giao diện)
- Project: `Depot.Frontend` (thêm vào Solution nếu cần). Single Page Application (SPA) được xây dựng bằng:
  - React (v18/19) + TypeScript
  - Vite (hoặc Next.js nếu cần SSR cho SEO) — khuyến nghị Vite cho tốc độ dev
  - Tailwind CSS cho hệ thống style utility
  - React Query (TanStack Query) cho data fetching / caching
  - State management: useContext + hooks / optional lightweight store (Zustand) — tránh Redux nếu không cần thiết

- Cấu trúc thư mục (gợi ý)
  - `src/`
    - `pages/` (route-based pages)
    - `components/` (UI components, atomic)
    - `features/` (domain features: containers, estimates, yard)
    - `services/api/` (API client wrappers, axios instance, auth interceptors)
    - `hooks/` (custom hooks: useAuth, usePolling, useSignalR)
    - `stores/` (optional global stores)
    - `assets/`, `styles/`
    - `utils/` (formatters, validators)

- Giao tiếp với backend
  - Sử dụng OpenAPI / Swagger generated types nếu có, hoặc hand-written DTOs trong `Depot.ViewModels` để đồng bộ.
  - Các gọi API phải xử lý lỗi rõ ràng, hiển thị trạng thái loading và retry policy.
  - Xác thực: JWT stored in secure httpOnly cookie (prefer) hoặc in-memory + refresh token flow.

- Real-time & Bản đồ bãi 2D
  - Sử dụng WebSocket / SignalR để cập nhật trạng thái bãi, vị trí xe nâng, tiến độ work order trong thời gian thực.
  - Bản đồ bãi 2D: HTML5 Canvas hoặc SVG vector rendering; tách lớp rendering và interaction logic. Hỗ trợ pan/zoom và layering (blocks, bays, containers, highlights).

- UX & Responsive
  - Giao diện tablet-first cho thao tác xe nâng/nhân viên vận hành; desktop cho quản lý.
  - Accessibility: keyboard navigation, aria-* attributes cho các control chính.

- Testing & Quality
  - Unit tests: Jest + React Testing Library.
  - E2E: Playwright hoặc Cypress cho workflow chính (gate-in, estimate, QC, gate-out).
  - Linting & formatting: ESLint + Prettier + Tailwind lint rules.

- Build & Deployment
  - Build static assets (`npm run build`) và serve từ CDN / static host hoặc tích hợp vào `Depot.BackendApi` để trả static files (IIS). Khuyến nghị deploy static riêng (CDN) để dễ scale.
  - CI: lint -> test -> build -> publish artifacts. CD: deploy to staging/prod buckets or static host.


---

File này là bản tóm tắt kiến trúc backend cho `SolutionDepot`. Có thể mở rộng thêm: ERD chi tiết, API contract (OpenAPI), mẫu PR/Issue template, CI YAML mẫu. Nếu bạn muốn tôi tạo các file đó, chỉ định mục nào trước.
