# Test Plan — SolutionDepot

## 1. Mục tiêu

Đánh giá chất lượng toàn hệ thống quản lý Depot container (SolutionDepot) trước khi đưa vào vận hành: chức năng, luồng nghiệp vụ,
dữ liệu, phân quyền, bảo mật, API, giao diện, hiệu năng cơ bản. Chỉ **kiểm thử và báo cáo** — không sửa code, không đổi
database/API, không refactor.

## 2. Đối tượng kiểm thử

| Thành phần | Công nghệ | Vị trí |
|---|---|---|
| Frontend CMS | React 19 + Vite, Express `server.ts` (proxy `/api/*`) | `fontend/` |
| Depot.BackendApi | ASP.NET Core 8, EF Core, PostgreSQL | `SolutionDepot/3. Hosts/Depot.BackendApi` |
| Depot.FileServer | ASP.NET Core 8, lưu file vật lý | `SolutionDepot/3. Hosts/Depot.FileServer` |
| Depot.ApiIntegration | Webhook VietQR | Không deploy trên VPS — chỉ đọc mã |

Tài liệu tham chiếu: [docs/menu/](../menu/README.md) (chức năng theo menu), `docs/backend-progress/`.

## 3. Môi trường

| Môi trường | URL | Dùng cho |
|---|---|---|
| **Local** (chính) | http://localhost:3000 → BackendApi :50210 → PostgreSQL `SolutionDepotDb` local; FileServer :50211 | Toàn bộ test chức năng, API, phân quyền, dữ liệu, UI |
| **VPS** (production) | http://160.187.146.176:3001 | Chỉ test không cần đăng nhập: xác thực API, đăng nhập sai, khoá tài khoản, HTTPS, header, bundle, hiệu năng tải trang |

- Local chạy **cùng source code** với repo tại ngày 29–30/09/2026. VPS chạy image build ngày 29/09 (trước đợt xoá dữ liệu mẫu frontend).
- Trình duyệt: Chromium (Playwright), desktop 1440×900 và mobile 390×844.
- Công cụ: Node.js 22 (`fetch`) cho API, Playwright cho UI, `psql`/API đọc để đối chiếu dữ liệu.

## 4. Tài khoản test

| Tài khoản | Vai trò | Menu được phép |
|---|---|---|
| admin | ADMIN | toàn bộ |
| surveyor | SURVEYOR | jobs, survey, yard |
| operator | GATE_OP | jobs, operation, payment |
| accountant | CASHIER | dashboard, jobs, payment, inventory, masterdata, report |
| estimator | ESTIMATOR | jobs, estimate, survey |
| maersk | CARRIER | jobs, estimate |
| repair | TECHNICIAN | jobs, repair, yard |
| qc | QC_ENG | jobs, qc, repair, survey |
| forklift | FORKLIFT | jobs, forklift, yard |
| cleaning | CLEANING | cleaning, yard, jobs |

Tài khoản trên VPS: **không có** (mật khẩu trong `.env` không khớp DB VPS) → các chức năng cần đăng nhập trên VPS BLOCKED.

## 5. Phạm vi

### Trong phạm vi

1. Authentication (đăng nhập, token, đăng xuất, khoá tài khoản)
2. Phân quyền: API theo vai trò, menu theo vai trò
3. Luồng nghiệp vụ container: Gate-In → Giám định → Báo giá → Duyệt → Sửa chữa → QC → Vệ sinh → Sẵn sàng → Gate-Out → Gate-In lại
4. Validation dữ liệu đầu vào các form/API
5. CRUD Master Data: danh mục, cước nâng hạ, cước lưu bãi, hãng tàu, vật tư, khách hàng, người dùng, mẫu tin
6. Khai thác, phiếu dịch vụ, thanh toán, công nợ
7. Bãi, block, xe nâng, vệ sinh, thông báo
8. Upload/tải file
9. Tìm kiếm, lọc, tải xuống
10. Nhất quán dữ liệu giữa các màn (Dashboard, danh sách, sơ đồ bãi)
11. Bảo mật mức QA (OWASP cơ bản)
12. Xử lý lỗi, trạng thái tải, responsive
13. Hiệu năng cơ bản (thời gian phản hồi 1 người dùng)

### Ngoài phạm vi

- Stress/load test, DoS, brute-force, quét cổng (cấm theo yêu cầu).
- Tích hợp thật với Zalo OA, ngân hàng, API hãng tàu (không có môi trường sandbox).
- Chốt kỳ kế toán thật (khoá dữ liệu kỳ).

## 6. Chiến lược

| Loại test | Cách làm |
|---|---|
| API | Gọi trực tiếp từng endpoint với token từng vai trò; kiểm tra HTTP status, envelope, dữ liệu đọc lại |
| Luồng nghiệp vụ | Script end-to-end trên container QA mới (số container hợp lệ ISO 6346), đọc lại trạng thái sau mỗi bước |
| Validation / Boundary | Rỗng, null, âm, 0, cực lớn, sai định dạng, trùng, không tồn tại |
| Phân quyền | Ma trận vai trò × API; đăng nhập từng vai trò trên UI |
| Concurrency | 2–3 request song song cùng tài nguyên (không tải nặng) |
| UI | Playwright quét toàn bộ 55 menu (admin desktop, admin mobile, forklift desktop), bắt lỗi JS console, chụp ảnh; giả lập API lỗi/chậm/mất mạng bằng `page.route` |
| Dữ liệu | Đối chiếu số liệu giữa các API/màn; kiểm tra trùng, mồ côi, trạng thái bất thường |
| Bảo mật | Token giả, IDOR, XSS, SQLi, upload độc hại, header, HTTPS, bundle |
| Hiệu năng | Trung vị 5 lần gọi các API chính; thời gian tải trang VPS |

## 7. Dữ liệu test

- Mọi dữ liệu do QA tạo có tiền tố `QA` (container `QA?U…`, vật tư `QA-MAT`/`QA-MM`, khách hàng `QA-CUS`, thông báo `QA…`) — được người dùng cho phép.
- Dữ liệu thật không bị sửa; cấu hình bị đổi tạm để test (block `BLOCK_R`) được khôi phục ngay.
- Hồ sơ container chỉ xoá được khi đã Gate-Out → các hồ sơ QA đang ở trạng thái khác **vẫn còn trên DB local** (xem [final-test-report.md](final-test-report.md)).

## 8. Tiêu chí

| Tiêu chí | Định nghĩa |
|---|---|
| PASS | Kết quả thực tế khớp kỳ vọng |
| FAIL | Sai kỳ vọng — gắn mã bug |
| BLOCKED | Không thể thực thi vì thiếu tài khoản/dữ liệu/điều kiện — ghi rõ lý do |
| NOT TESTED | Chủ động không thực thi (rủi ro phá dữ liệu, chức năng không có) — ghi rõ lý do |

Mức độ bug:

| Mức | Định nghĩa |
|---|---|
| Critical | Mất an toàn dữ liệu diện rộng / sai tiền / chặn vận hành |
| High | Sai nghiệp vụ chính, crash màn hình, lỗ hổng bảo mật lớn |
| Medium | Sai dữ liệu có giới hạn, validation thiếu ở nghiệp vụ tiền/kho, UX lỗi gây hiểu nhầm |
| Low | Thông báo sai, validation định dạng, giao diện |

Tiêu chí phát hành đề xuất: 0 Critical, 0 High mở.

## 9. Sản phẩm bàn giao

| File | Nội dung |
|---|---|
| [test-plan.md](test-plan.md) | Kế hoạch (file này) |
| [test-scenarios.md](test-scenarios.md) | Kịch bản kiểm thử theo module |
| [test-cases.md](test-cases.md) | 325 test case đã thực thi + kết quả |
| [bug-report.md](bug-report.md) | 34 bug theo format chuẩn |
| [api-test.md](api-test.md) | Kết quả kiểm thử API, danh sách 148 route |
| [security-test.md](security-test.md) | Kết quả bảo mật, mục SECURITY ISSUE |
| [final-test-report.md](final-test-report.md) | Báo cáo tổng |

## 10. Rủi ro & giới hạn

- Không có tài khoản VPS → chức năng production chỉ được suy ra từ local (cùng mã nguồn, nhưng VPS là build cũ hơn).
- Dev server local chạy `server.ts` cũ (khởi động trước khi thêm route proxy `/api/files`) → không xem được ảnh trên UI local.
- React StrictMode ở dev gọi mỗi API 2 lần — không phản ánh production.
- DB local là dữ liệu demo/test, khối lượng nhỏ (58 hồ sơ) → hiệu năng đo được không đại diện cho dữ liệu lớn.
