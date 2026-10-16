# Fix Report — SolutionDepot

Kết quả sửa 34 bug trong [bug-report.md](bug-report.md), thực hiện ngày 30/09/2026 trên môi trường **Local**.
**Chưa deploy lên VPS.**

## 1. Tổng hợp

| Trạng thái | Số bug | Bug |
|---|---|---|
| ✅ Đã sửa, đã kiểm lại | 30 | 001, 002, 003, 004, 005, 007, 008, 009, 010, 011, 013, 014, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031, 032, 033 |
| 🟡 Sửa một phần | 2 | 015 (đã nén + cache, chưa tách bundle), 034 (API đã phân trang, giao diện vẫn tải toàn bộ) |
| ⛔ Chưa sửa, cần quyết định | 1 | 006 — HTTPS cần tên miền |
| ⚪ Không phải lỗi | 1 | 012 — kiểm thử đánh giá sai (xem mục 3) |

**Cách kiểm lại:**
- Chạy lại toàn bộ bộ test QA (s01–s08b, s07 UI) trên mã đã sửa: **55 test case chuyển từ FAIL sang PASS**.
- Không có hồi quy thật. Các ca còn đánh dấu FAIL/BLOCKED đều là ca đã được đánh giá lại bằng tay ở vòng QA đầu (script kiểm sai), hoặc tiêu chí test đã lỗi thời (xem mục 4).
- Có thêm 3 script kiểm tra riêng:
  - ma trận vai trò × API: **330/330 PASS**;
  - Gate-In đồng thời: **0/6 lần tạo trùng** (trước sửa: 4/6);
  - giao diện: **10/10 PASS**.
- Kiểm tra biên dịch:
  - `dotnet build`: không có lỗi;
  - `tsc --noEmit`: 0 lỗi;
  - `vite build`: thành công, không còn chuỗi bí mật trong bundle.

## 2. Chi tiết từng bug

| Bug | Mức | Trạng thái | Cách sửa | Kiểm lại |
|---|---|---|---|---|
| BUG-001 | Critical | ✅ | Thêm ma trận vai trò → nhóm chức năng `RolePermissions` (Depot.Application), dùng chung cho menu lúc đăng nhập và API. Thêm `[RequirePermission(...)]` + `PermissionPolicyProvider` cho từng endpoint ghi/dữ liệu nhạy cảm. Đọc danh mục dùng chung vẫn mở cho mọi tài khoản đã đăng nhập. 403 trả envelope tiếng Việt. | 330/330 tổ hợp vai trò × API đúng; TC-042…049, TC-239 PASS |
| BUG-002 | High | ✅ | Thêm `constants/menuPermissions.ts` (menu → nhóm quyền). Sidebar ẩn menu không có quyền. `App.tsx` chặn màn không có quyền và vào màn đầu tiên được phép. Sửa hiển thị "NaN%" ở màn RBAC. | forklift thấy 5 menu, maersk 5, operator 9, admin 55; bấm hết menu không có 403 |
| BUG-003 | High | ✅ | `PATCH /status` chỉ ADMIN. Không đổi trạng thái hồ sơ đã GATE_OUT. READY_FOR_OUT bắt buộc có phiếu giám định. Audit ghi người thao tác từ token. 2 hồ sơ QA sai (QABU4182053, QABU3877225) đã xoá mềm. | TC-085, TC-087 PASS; 0 hồ sơ ra bãi thiếu giám định |
| BUG-004 | High | ✅ | Unique index có điều kiện `UX_depot_jobs_ContainerNo_Active` (migration `UniqueActiveContainerJob`); vi phạm → 409. Migration xoá mềm hồ sơ trùng sẵn có (giữ hồ sơ đi xa nhất) và ghi AuditLogs. Thêm global query filter `IsDeleted` cho DepotJob. | 6 lần × 3 request đồng thời: luôn 1 hồ sơ, còn lại 409. TGBU3719842 còn 1 hồ sơ |
| BUG-005 | High | ✅ | `ZaloSettings` chịu được `monthlyUsage` rỗng. Thêm `ScreenErrorBoundary` để 1 màn lỗi không làm trắng cả app. | Mở màn Zalo không lỗi JS |
| BUG-006 | High | ⛔ | Chưa sửa — cần tên miền trỏ về VPS để cấp chứng chỉ, sau đó đặt Caddy/Nginx trước cổng 3001. | — |
| BUG-007 | High | ✅ | Kiểm tra trùng mã (không phân biệt hoa/thường). Unique index `upper(Code)` (migration `UniqueMaterialCode`). Migration đổi mã dòng trùng sẵn có thành `<mã>-DUP<Id>`, không xoá, để giữ tồn kho. | TC-156 PASS; QA-MAT id 36 → `QA-MAT-584951-DUP36` |
| BUG-008 | Medium | ✅ | Tổng báo giá luôn tính ở server = Σ(SL × đơn giá) + thuế; thuế không vượt tạm tính. Sửa luôn công thức cũ cộng trùng giờ công/vật tư. | TC-094 PASS |
| BUG-009 | Medium | ✅ | Đã có RepairOrder → 409 "Lệnh sửa chữa đã được bắt đầu" thay cho 500. | TC-100 trả 409 |
| BUG-010 | Medium | ✅ | `SystemController` tự ghi audit: tạo/sửa/xoá người dùng, đặt lại mật khẩu, đổi quyền vai trò, chính sách bảo mật. Chặn admin tự xoá chính mình. | TC-193 PASS |
| BUG-011 | Medium | ✅ | `POST /api/Users/logout` thu hồi `jti` (TokenRevocationList, giữ tới lúc token hết hạn); `OnTokenValidated` từ chối token đã thu hồi. Nút Đăng xuất gọi API này. | Qua API và qua giao diện: token cũ → 401 |
| BUG-012 | Medium | ⚪ | Không phải lỗi (xem mục 3). Bổ sung: `SurveyorStaffId` khi nộp giám định giờ cũng lấy từ token. | Người nhận việc = chủ token |
| BUG-013 | Medium | ✅ | JWT được chép vào cookie `depot_file_token` (Path=/api/files, SameSite=Strict). `server.ts` hỏi `GET /api/depot-files/access-check` trước khi trả file (cache 60 giây). | Không cookie → 401; cookie sai → 401; cookie đúng → 200 |
| BUG-014 | Medium | ✅ | Bỏ mật khẩu cố định `Password@123`: mỗi tài khoản đối tác sinh mật khẩu ngẫu nhiên (`customer/utils/tempPassword.ts`). Bỏ `clientSecret`/`apiKey` mẫu của Maersk. | `vite build` + quét bundle: không còn chuỗi bí mật |
| BUG-015 | Medium | 🟡 | Bật gzip (`compression`). File `/assets/*` cache 1 năm (immutable), `index.html` no-cache. **Chưa tách bundle theo màn** (React.lazy). | JS 2,73 MB → 602 KB khi gzip (−78%) |
| BUG-016 | Medium | ✅ | Thêm `utils/apiError.ts` (thông báo tiếng Việt, ưu tiên message backend) + `LoadErrorBanner` có nút Thử lại. Áp dụng cho Công nợ, Kho, Master Data. | 500 / 403 / mất mạng đều hiện banner lỗi rõ ràng |
| BUG-017 | Medium | ✅ | Giá cước ≥ 0; VAT trong 0–100% (khi tạo và khi sửa). | TC-131…133 PASS |
| BUG-018 | Medium | ✅ | Bậc lưu bãi: đến ngày ≥ từ ngày, không chồng lấn, bậc không giới hạn phải là bậc cuối, ≥ 1 bậc, giá ≥ 0, ngày miễn phí ≥ 0. | TC-141…144 PASS |
| BUG-019 | Medium | ✅ | Giao dịch kho: mã vật tư phải tồn tại; loại giao dịch thuộc danh sách; đơn giá ≥ 0. Sửa luôn lỗi đọc tồn trước giao dịch theo mã chưa chuẩn hoá. | TC-161, TC-162 PASS |
| BUG-020 | Medium | ✅ | Tài xế/xe/tài khoản/booking phải thuộc khách hàng đang hoạt động. Hạn mức, số ngày thanh toán, tải trọng ≥ 0. | TC-167, TC-170, TC-173 PASS |
| BUG-021 | Medium | ✅ | Lệnh vệ sinh phải có hồ sơ container đang trong bãi; đơn giá, thời gian ≥ 0. Bỏ ảnh mẫu Unsplash gán sẵn cho "ảnh trước vệ sinh". | TC-296, TC-297 PASS |
| BUG-022 | Medium | ✅ | Block: bay/hàng/tầng ≥ 1; trạng thái ACTIVE/MAINTENANCE; không cho thu nhỏ khi còn container ở phần bị cắt. Sửa block chỉ ADMIN. | TC-302…304 PASS |
| BUG-023 | Low | ✅ | Mỗi lỗi nộp giám định báo đúng lý do (hạng không hợp lệ, số lượng âm, trạng thái). | TC-090, TC-091 PASS |
| BUG-024 | Low | ✅ | Kiểm tra định dạng email: hãng tàu, khách hàng, tài xế, tài khoản đối tác, người dùng hệ thống. | TC-150, TC-166, TC-184 PASS |
| BUG-025 | Low | ✅ | SĐT tài xế 9–15 chữ số; họ tên ≤ 150 ký tự. | TC-072, TC-073 PASS |
| BUG-026 | Low | ✅ | Tồn tối thiểu ≤ tối đa; mức đặt lại ≤ tối đa; không âm. | TC-155 PASS |
| BUG-027 | Low | ✅ | Mẫu tin bắt buộc tên + nội dung, không trùng mã; người nhận phải là nhân viên hoặc khách hàng có thật. | TC-196, TC-309 PASS |
| BUG-028 | Low | ✅ | Upload chỉ nhận TableName DepotJob / RepairOrder / CleaningRecord, và bản ghi đích phải tồn tại. | TC-236, TC-237 PASS |
| BUG-029 | Low | ✅ | `GET /DepotJobs/{id}/history` với ID không tồn tại → 404. | TC-225 PASS |
| BUG-030 | Low | ✅ | Thêm `GET /api/Users/me`; bỏ endpoint `refresh-token` không tồn tại khỏi frontend (backend không dùng refresh token). | TC-030 PASS |
| BUG-031 | Low | ✅ | `server.ts`: bỏ X-Powered-By; thêm X-Content-Type-Options, X-Frame-Options, CSP `frame-ancestors`, Referrer-Policy. CORS dev chỉ mở cho localhost:3000. | Header có đủ; Origin lạ không được CORS |
| BUG-032 | Low | ✅ | Cước Nâng Hạ hiện "Đang tải biểu cước nâng hạ…" trong lúc chờ API. | API chậm 5 giây: hiện đúng trạng thái đang tải |
| BUG-033 | Low | ✅ | Tiêu đề Master Data chuyển nền trắng. Bộ lọc hãng tàu ở Công nợ lấy từ danh mục thật — nhãn cũ "MAERSK" còn làm bộ lọc không bao giờ khớp. | Nền `rgb(255,255,255)`; lựa chọn "Tất cả hãng tàu · Maersk (MSCU)" |
| BUG-034 | Low | 🟡 | `GET /api/DepotJobs?page=&pageSize=` (tối đa 500/trang) + header `X-Total-Count`, được `server.ts` chuyển tiếp. Không truyền tham số thì trả toàn bộ như cũ. **Giao diện chưa chuyển sang tải theo trang.** | page=2&pageSize=5 → 5 hồ sơ, X-Total-Count=68 |

## 3. Điều chỉnh kết quả QA — BUG-012 không phải lỗi

Test TC-246 chỉ chấm PASS khi API trả 400/403. Thực tế `ClaimSurvey` đã lấy người nhận việc từ JWT và bỏ qua `staffId` client gửi, nên API trả 200 và ghi đúng giám định viên đang đăng nhập. Kết quả FAIL ở vòng QA đầu là do tiêu chí test, không phải do hệ thống. Test đã được sửa để kiểm người nhận việc thực tế và hiện PASS.

## 4. Các ca còn FAIL khi chạy lại — không phải lỗi mới

| Ca (vòng đầu) | Lý do |
|---|---|
| TC-029 refresh-token | Endpoint đã bỏ khỏi frontend (BUG-030) — tiêu chí test lỗi thời |
| TC-100 bắt đầu sửa chữa lần 2 | Trả 409 (xung đột) thay vì 400 — đúng ngữ nghĩa, không còn 500 |
| TC-204 phân trang | Test gọi API không kèm tham số trang; đã kiểm riêng với `page/pageSize` |
| TC-011, TC-027, TC-163, TC-180, TC-233, TC-252, TC-253 | Đã đánh giá lại bằng tay ở vòng QA đầu (script kiểm sai trường/tiêu chí); đã kiểm lại tay, kết quả không đổi |
| TC-265 xuất file danh sách container | Chức năng không tồn tại (NOT TESTED như trước) |

## 5. Thay đổi cơ sở dữ liệu (migration tự chạy khi backend khởi động)

| Migration | Tác động dữ liệu |
|---|---|
| `20260930041815_UniqueActiveContainerJob` | Với mỗi số container có > 1 hồ sơ đang hoạt động: giữ hồ sơ đã giám định/báo giá (hoặc Id nhỏ nhất), **xoá mềm** các hồ sơ còn lại, ghi `AuditLogs` action `DUPLICATE_REMOVED`. Tạo unique index có điều kiện. |
| `20260930042424_UniqueMaterialCode` | Vật tư trùng mã (không phân biệt hoa/thường): giữ Id nhỏ nhất, **đổi mã** các dòng còn lại thành `<mã>-DUP<Id>`. Tạo unique index trên `upper(Code)`. |

Trên local: đã gỡ 5 nhóm hồ sơ trùng (TGBU3719842 và 4 container QA) và đổi mã 1 vật tư QA. **Khi deploy, 2 migration này sẽ tự chạy trên dữ liệu VPS.**

## 6. Việc còn lại

1. **BUG-006 HTTPS**: cần tên miền trỏ về 160.187.146.176; sau đó thêm Caddy/Nginx và chứng chỉ vào `docker-compose.vps.yml`.
2. **BUG-015**: tách bundle theo màn (React.lazy trong `App.tsx`) để giảm dung lượng tải lần đầu.
3. **BUG-034**: chuyển các màn danh sách sang gọi `?page=&pageSize=`.
4. **Phân quyền chi tiết hơn**: CARRIER đang có nhóm `estimate` nên vẫn gọi được API *lập* báo giá, ESTIMATOR gọi được *duyệt* báo giá — ma trận gốc gộp 2 việc này vào 1 nhóm. Nên tách nhóm `approval`. Màn "Phân quyền RBAC" (sửa `Roles.PermissionsJson`) chưa có tác dụng — quyền thật lấy từ `RolePermissions` trong mã nguồn.
5. **Dữ liệu danh mục**: có 1 dòng DM Loại Container (mã `20FR`) mang tên mô tả dài làm Gate-In báo lỗi "dài quá 10 ký tự" khi chọn loại đó — cần sửa lại dữ liệu.
6. **Tài khoản cổng đối tác**: backend không lưu mật khẩu của tài khoản đối tác (`CustomerPortalUserRequest` không có trường mật khẩu) — mật khẩu hiện trên màn chỉ là hiển thị.
7. **Deploy VPS**: build lại 3 image rồi pull về VPS. Frontend cần `npm ci`, vì đã thêm package `compression`.
