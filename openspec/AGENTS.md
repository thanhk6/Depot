# Hướng dẫn OpenSpec cho dự án SolutionDepot

Repo này quản lý toàn bộ hệ thống Depot container bằng một khung OpenSpec chung:
1. `SolutionDepot/`: backend .NET 8 (BackendApi, FileServer, ApiIntegration, Application, Data, ViewModels)
2. `fontend/`: frontend React 19 + Vite + TypeScript
3. `docker-compose*.yml`, `Dockerfile.*`: đóng gói và deploy VPS
4. `docs/`: quy trình nghiệp vụ (`docs/quy-trinh-van-hanh-depot.md`), tài liệu Maersk AEMS (`docs/maersk/`)

---

## 1. Quy ước đặt tên change

Mọi change MUST đặt tên theo tiền tố phạm vi:

| Phạm vi | Mẫu tên | Ví dụ |
| :--- | :--- | :--- |
| **Backend** | `depot-api-<tinh-nang>` | `depot-api-estimate-vat-per-line` |
| **Frontend** | `depot-fe-<tinh-nang>` | `depot-fe-estimate-bulk-modal` |
| **Cả hai** | `depot-fullstack-<tinh-nang>` | `depot-fullstack-aems-submit-order` |
| **Tích hợp hãng tàu / ngân hàng** | `depot-integration-<tinh-nang>` | `depot-integration-maersk-aems-token` |
| **Deploy / hạ tầng** | `depot-ops-<tinh-nang>` | `depot-ops-https-api-domain` |
| **Đặc tả nền (không đổi code)** | `baseline-<nhom>` | `baseline-repair-flow` |

Tên capability trong `openspec/specs/` đặt theo hành vi nghiệp vụ bền vững, không theo tên việc:
`container-lifecycle`, `repair-estimate`, `carrier-approval`, `repair-work-order`, `qc-inspection`…

---

## 2. Đề xuất change

Dùng `/opsx:propose` (Claude Code) hoặc `/opsx-propose` (Cursor / Antigravity):
- `proposal.md` nêu rõ phạm vi: `SolutionDepot/`, `fontend/`, hay cả hai; màn hình / API / bảng bị ảnh hưởng; phần ngoài phạm vi.
- Cần migration EF Core thì ghi tên migration và có sửa dữ liệu cũ hay không.
- `tasks.md` nhóm việc theo phần:
  ```markdown
  ## 1. Backend (`SolutionDepot/`)
  - [ ] 1.1 Sửa service / controller
  - [ ] 1.2 Thêm migration (nếu có)
  ## 2. Frontend (`fontend/`)
  - [ ] 2.1 Sửa api / màn hình
  ## 3. Kiểm thử
  - [ ] 3.1 Build backend, type-check frontend, thử trên http://127.0.0.1:3000
  - [ ] 3.2 Dọn dữ liệu test
  ```
- `specs/` dùng `## ADDED Requirements` / `## MODIFIED Requirements`, mỗi requirement có ít nhất 1 `#### Scenario:`.

---

## 3. Lệnh build & kiểm thử

- **Backend** (dừng `Depot.BackendApi` đang chạy trước khi build):
  ```bash
  dotnet build SolutionDepot/SolutionDepot.sln
  ```
- **Migration EF Core**:
  ```bash
  cd SolutionDepot
  dotnet ef migrations add <TenMigration> --project "2. Domain/Depot.Data" --startup-project "3. Hosts/Depot.BackendApi"
  ```
  Migration tự chạy khi BackendApi khởi động.
- **Frontend**:
  ```bash
  cd fontend && npx tsc --noEmit -p . && npm run dev
  ```
- **Kiểm tra OpenSpec**:
  ```bash
  openspec validate <ten-change> --strict
  ```

---

## 4. Deploy lên VPS

Quy trình chi tiết: `docs/deploy-vps.md`. Tóm tắt:
1. Chỉ deploy khi người dùng yêu cầu rõ ràng; change đã apply + kiểm thử xong trên local.
2. Build backend + type-check frontend sạch; liệt kê migration EF Core mới sẽ chạy trên VPS.
3. Build 3 image `thanhnguyenit89/depot-{backend,fileserver,cms}`, gắn tag `latest` + `YYYYMMDD`, push lên Docker Hub.
4. Trên VPS `/opt/depot`: sao lưu DB + `storage-files` → `docker compose pull && docker compose up -d` → kiểm tra health.
5. Báo lại tag, migration, bản sao lưu.

Bước deploy KHÔNG đưa vào `tasks.md` của change trừ khi người dùng yêu cầu deploy trong chính change đó.

---

## 5. Lưu ý bắt buộc

- Chỉ làm và kiểm thử trên local; KHÔNG deploy VPS khi chưa được yêu cầu.
- Không đưa khoá API (Maersk, ngân hàng) hoặc mật khẩu vào code, đặc tả hay Git.
- Archive change xong phải kiểm tra `openspec/specs/` phản ánh đúng hành vi mới.
