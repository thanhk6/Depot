# CLAUDE.md

Hướng dẫn cho Claude Code (và các AI agent khác) khi làm việc trong repo này.

## Tổng quan

**SolutionDepot** — hệ thống quản lý depot container (ERP bãi rỗng / M&R). Vòng đời container khép kín:
Gate-In → Giám định → Vệ sinh → Xe nâng vào bãi → Khai thác lập phiếu dịch vụ → Thu tiền → Báo giá sửa chữa (chuẩn Maersk AEMS)
→ Xác nhận báo giá → Ghi nhận hãng tàu duyệt → Lệnh sửa chữa → QC nghiệm thu → Gate-Out.
Chi tiết từng công đoạn: `docs/quy-trinh-van-hanh-depot.md`.

## Cấu trúc thư mục

```
Newfolder/
├── SolutionDepot/                    # Backend .NET 8 (SolutionDepot.sln)
│   ├── 1. Infrastructure/            # Depot.ViewModels (DTO)
│   ├── 2. Domain/                    # Depot.Application (service), Depot.Data (EF Core + PostgreSQL, migration)
│   └── 3. Hosts/                     # Depot.BackendApi (:50210), Depot.FileServer (:50211), Depot.ApiIntegration
├── fontend/                          # Frontend React 19 + Vite + TypeScript + Tailwind (server.ts, :3000)
├── docs/                             # Quy trình nghiệp vụ, tài liệu Maersk AEMS (docs/maersk/), QA, kế hoạch
├── openspec/                         # Spec-Driven Development
│   ├── config.yaml                   # Ngữ cảnh + quy tắc dự án
│   ├── AGENTS.md                     # Quy ước đặt tên change, lệnh build/kiểm thử
│   ├── specs/                        # Đặc tả nền (source of truth về hành vi)
│   └── changes/                      # Change đang làm (+ archive/)
├── .claude/ .cursor/ .agents/        # Lệnh /opsx (OpenSpec) cho Claude Code, Cursor, Antigravity
├── docker-compose.yml                # Chạy local bằng Docker
├── docker-compose.vps.yml            # Deploy VPS (depot-backend, depot-frontend, depot-fileserver)
└── Dockerfile.backend / Dockerfile.fileserver
```

## Lệnh thường dùng

```bash
# Backend (dừng Depot.BackendApi đang chạy trước khi build)
dotnet build SolutionDepot/SolutionDepot.sln

# Migration EF Core (tự chạy khi BackendApi khởi động)
cd SolutionDepot
dotnet ef migrations add <TenMigration> --project "2. Domain/Depot.Data" --startup-project "3. Hosts/Depot.BackendApi"

# Frontend
cd fontend
npx tsc --noEmit -p .      # type-check
npm run dev                # http://127.0.0.1:3000 (tự chuyển /api sang backend)
```

## Quy trình OpenSpec

| Lệnh (Claude Code) | Cursor / Antigravity | Dùng khi |
| :--- | :--- | :--- |
| `/opsx:explore` | `/opsx-explore` | Bàn ý tưởng, đọc code, chưa viết gì |
| `/opsx:propose` | `/opsx-propose` | Tạo change: proposal, specs, design, tasks |
| `/opsx:apply` | `/opsx-apply` | Làm theo tasks của change |
| `/opsx:archive` | `/opsx-archive` | Xong change → gộp đặc tả vào `openspec/specs/` |

Tên change theo tiền tố `depot-api-*`, `depot-fe-*`, `depot-fullstack-*`, `depot-integration-*`, `depot-ops-*`, `baseline-*` — xem `openspec/AGENTS.md`.

## Quy tắc bắt buộc

- Mọi dữ liệu lấy từ database: không mock, không số gõ cứng, không preset / fallback bịa.
- Phân quyền: `RolePermissions` (backend) là nguồn duy nhất cho menu và API; màn / endpoint mới phải gắn `[RequirePermission]` và cập nhật `fontend/src/constants/menuPermissions.ts`.
- Mỗi thao tác nghiệp vụ ghi `JobAuditLog`; người thực hiện lấy từ tài khoản đăng nhập.
- Tiền / giờ công luôn tính lại ở server.
- Khoá API và mật khẩu chỉ khai báo trên server (biến môi trường), không đưa vào code / Git / đặc tả.
- Chỉ làm trên local; KHÔNG deploy VPS khi chưa được yêu cầu. Kiểm thử ở `http://127.0.0.1:3000`.
- Deploy (khi được yêu cầu): build + push image lên Docker Hub (tag `latest` + `YYYYMMDD`) → sao lưu VPS → `docker compose pull && docker compose up -d` trên `/opt/depot`. Quy trình đầy đủ: `docs/deploy-vps.md`.
- Giao diện tiếng Việt, theme sáng chuẩn Dashboard ERP.
