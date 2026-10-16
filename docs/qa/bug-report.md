# Bug Report — SolutionDepot

> **Cập nhật 30/09/2026:** 30/34 bug đã sửa và kiểm lại, 2 bug sửa một phần, BUG-006 (HTTPS) chờ tên miền, BUG-012 xác định không phải lỗi. Xem [fix-report.md](fix-report.md). Nội dung dưới đây giữ nguyên hiện trạng lúc kiểm thử.

34 bug, gom từ 70 test case FAIL (xem [test-cases.md](test-cases.md)). Mỗi bug đã được tái hiện ít nhất 1 lần bằng API
thật hoặc trình duyệt thật; nguyên nhân gốc được đối chiếu trong source code. **Không có dòng code nào bị sửa** — phần
"Suggested Fix" chỉ là đề xuất.

| Mức độ | Số bug |
|---|---|
| Critical | 1 |
| High | 6 |
| Medium | 15 |
| Low | 12 |

**Môi trường chung**

- **Local**: http://localhost:3000 (frontend `npm run dev`, `server.ts`) → Depot.BackendApi http://localhost:50210 (build
  khởi động 29/09/2026 19:29, đúng source hiện tại) → PostgreSQL `SolutionDepotDb` local. Depot.FileServer :50211 được bật
  riêng để test upload. Tài khoản seed mật khẩu `123456`.
- **VPS**: http://160.187.146.176:3001 (image `depot-cms`/`depot-backend` ngày 29/09/2026). Chỉ test được phần không cần
  đăng nhập (xem BLOCKED trong [final-test-report.md](final-test-report.md)).
- Trình duyệt: Chromium (Playwright 1.63), desktop 1440×900 và mobile 390×844.

## Danh sách

| ID | Mức độ | Module | Tiêu đề |
|---|---|---|---|
| [BUG-001](#bug-001) | Critical | Phân quyền (Backend API) | API không phân quyền theo vai trò |
| [BUG-002](#bug-002) | High | Phân quyền (Giao diện) | Sidebar không lọc menu theo quyền |
| [BUG-003](#bug-003) | High | Luồng nghiệp vụ | PATCH status bỏ qua giám định/QC rồi Gate-Out |
| [BUG-004](#bug-004) | High | Gate-In | Race condition tạo hồ sơ trùng |
| [BUG-005](#bug-005) | High | Thông báo — Zalo | Màn Cấu hình Zalo crash toàn app |
| [BUG-006](#bug-006) | High | Hạ tầng VPS | Không có HTTPS |
| [BUG-007](#bug-007) | High | Kho vật tư | Tạo được vật tư trùng mã |
| [BUG-008](#bug-008) | Medium | Báo giá | Tin GrandTotal từ client |
| [BUG-009](#bug-009) | Medium | Sửa chữa | Bắt đầu sửa chữa lần 2 → HTTP 500 |
| [BUG-010](#bug-010) | Medium | Audit log | Không ghi nhật ký quản trị người dùng |
| [BUG-011](#bug-011) | Medium | Authentication | Đăng xuất không thu hồi token |
| [BUG-012](#bug-012) | Medium | Giám định | Nhận việc thay người khác qua staffId |
| [BUG-013](#bug-013) | Medium | File / Ảnh | Tải ảnh không cần đăng nhập |
| [BUG-014](#bug-014) | Medium | Frontend (VPS) | Bundle JS chứa mật khẩu/khoá mẫu |
| [BUG-015](#bug-015) | Medium | Hiệu năng (VPS) | Tải trang lần đầu ~9,7 giây |
| [BUG-016](#bug-016) | Medium | Xử lý lỗi (UI) | Lỗi API hiển thị như "không có dữ liệu" |
| [BUG-017](#bug-017) | Medium | Cước Nâng Hạ | Chấp nhận giá âm, VAT sai |
| [BUG-018](#bug-018) | Medium | Cước Lưu Bãi | Chấp nhận bậc giá sai |
| [BUG-019](#bug-019) | Medium | Kho — Nhập/Xuất | Giao dịch với vật tư/loại không tồn tại |
| [BUG-020](#bug-020) | Medium | Khách hàng | Số âm, tài xế của khách hàng không tồn tại |
| [BUG-021](#bug-021) | Medium | Tổ Vệ sinh | Lệnh vệ sinh cho container không có trong bãi |
| [BUG-022](#bug-022) | Medium | Bãi — Block | Cấu hình block không hợp lệ vẫn lưu |
| [BUG-023](#bug-023) | Low | Giám định | Thông báo lỗi sai lệch |
| [BUG-024](#bug-024) | Low | Nhiều module | Không kiểm tra định dạng email |
| [BUG-025](#bug-025) | Low | Gate-In | SĐT chữ, tên 1.000 ký tự |
| [BUG-026](#bug-026) | Low | Kho vật tư | Tồn tối thiểu > tối đa |
| [BUG-027](#bug-027) | Low | Thông báo | Mẫu tin rỗng, người nhận không tồn tại |
| [BUG-028](#bug-028) | Low | File / Ảnh | Metadata file mồ côi |
| [BUG-029](#bug-029) | Low | API lịch sử | ID không tồn tại trả 200 |
| [BUG-030](#bug-030) | Low | Authentication | API frontend khai báo nhưng không tồn tại |
| [BUG-031](#bug-031) | Low | Bảo mật HTTP | Thiếu header bảo mật, CORS * ở dev |
| [BUG-032](#bug-032) | Low | Cước Nâng Hạ | Không có trạng thái đang tải |
| [BUG-033](#bug-033) | Low | Giao diện | Tiêu đề khó đọc, nhãn lọc ghi cứng |
| [BUG-034](#bug-034) | Low | Hiệu năng API | Không phân trang danh sách hồ sơ |

---

<a id="bug-001"></a>
## BUG-001 — API không phân quyền theo vai trò

- **Title:** Mọi tài khoản đã đăng nhập (kể cả tài xế xe nâng, tổ vệ sinh, đại diện hãng tàu) đọc/ghi/xoá được dữ liệu ngoài phạm vi qua API.
- **Module:** Phân quyền (Backend API) — ảnh hưởng Công nợ, Báo cáo, Kho, Master Data, File…
- **URL:** `/api/billing/*`, `/api/reports/*`, `/api/warehouse/*`, `/api/MasterData/*`, `/api/depot-files/*`, … (mọi controller trừ `/api/system/*`)
- **Severity:** Critical
- **Environment:** Local
- **Precondition:** Đăng nhập `forklift` (role FORKLIFT, quyền menu `jobs, forklift, yard`), `cleaning` (CLEANING), `maersk` (CARRIER), `surveyor` (SURVEYOR).
- **Steps to Reproduce:**
  1. Đăng nhập `forklift`, lấy token.
  2. `GET /api/billing/debts` → xem công nợ hãng tàu.
  3. `PUT /api/MasterData/catalog/{id}` → sửa danh mục mã hư hỏng.
  4. Đăng nhập `cleaning`, `DELETE /api/MasterData/catalog/{id}` → xoá danh mục.
  5. Đăng nhập `maersk` (đại diện hãng tàu), `POST /api/MasterData/service-tariffs` → tạo biểu cước của Depot.
  6. Đăng nhập `forklift`, `DELETE /api/depot-files/{id}` → xoá ảnh giám định do surveyor upload.
- **Expected Result:** 403 cho mọi thao tác ngoài quyền của vai trò.
- **Actual Result:** Tất cả trả **200** và dữ liệu bị đọc/sửa/xoá thật. Tài khoản hãng tàu Maersk xem được công nợ của **mọi** hãng tàu.
- **Evidence:** TC-042…TC-049, TC-239. Đối chứng: `/api/system/*` trả 403 đúng cho 9/9 vai trò (TC-031…TC-040).
- **Root Cause:** `Program.cs:115-117` chỉ đặt `FallbackPolicy = RequireAuthenticatedUser()`. Chỉ `SystemController` có `[Authorize(Roles = "ADMIN")]`; các controller khác không khai báo role/policy nào. Quyền menu (`allowedTabs`, bảng `Roles.PermissionsJson`) chỉ dùng ở frontend.
- **Suggested Fix:** Định nghĩa policy theo quyền (vd `billing.read`, `masterdata.write`) ánh xạ từ `Role.PermissionsJson`, gắn `[Authorize(Policy=...)]` cho từng controller/action; với CARRIER lọc dữ liệu theo hãng tàu của tài khoản.

<a id="bug-002"></a>
## BUG-002 — Sidebar không lọc menu theo quyền vai trò

- **Title:** Tài xế xe nâng thấy và mở được toàn bộ 55 menu; màn chỉ-ADMIN hiển thị số liệu rác thay vì báo không có quyền.
- **Module:** Phân quyền (Giao diện)
- **URL:** http://localhost:3000/ (mọi menu)
- **Severity:** High
- **Environment:** Local, Chromium desktop
- **Precondition:** Đăng nhập `forklift` (allowedTabs = `jobs, forklift, yard`).
- **Steps to Reproduce:**
  1. Đăng nhập `forklift`.
  2. Quan sát Sidebar; lần lượt bấm "Công Nợ Hãng Tàu (AR)", "Kho Vật Tư", "DM Loại Container", "Khách Hàng"…
  3. Bấm "Phân Quyền RBAC & Users".
- **Expected Result:** Chỉ hiện 3 nhóm menu được phép; màn không có quyền hiện "Không có quyền truy cập".
- **Actual Result:** Hiện đủ 55 menu, mọi màn tải dữ liệu thật (do BUG-001). Màn RBAC: API 403 nhưng giao diện hiện "Tổng số tài khoản 0", "Tỷ lệ khả dụng: **NaN%**".
- **Evidence:** TC-270, TC-269; quét 55 menu bằng tài khoản forklift (sweep-forklift-desktop.json).
- **Root Cause:** `fontend/src/components/layout/Sidebar.tsx` (sidebar đang dùng) không đọc `allowedTabs`. Chỉ file cũ `components/Sidebar.tsx` (không còn được import) có lọc theo `allowedTabs`. `App.tsx` `renderContent` không kiểm tra quyền trước khi render.
- **Suggested Fix:** Lọc `menuGroups` theo `loggedInUserProfile.allowedTabs`; trong `App.tsx` chặn `activeTab` không thuộc `allowedTabs` (hiện `AccessDeniedScreen` có sẵn). Việc này chỉ là lớp giao diện — phải sửa cùng BUG-001.

<a id="bug-003"></a>
## BUG-003 — PATCH status bỏ qua quy trình, Gate-Out container chưa giám định/QC

- **Title:** `PATCH /api/DepotJobs/{id}/status` cho phép chuyển thẳng sang `READY_FOR_OUT` rồi Gate-Out.
- **Module:** Luồng nghiệp vụ Container
- **URL:** `PATCH /api/DepotJobs/{id}/status`, `POST /api/DepotJobs/{id}/gate-out`
- **Severity:** High
- **Environment:** Local
- **Precondition:** Container vừa Gate-In (trạng thái `SURVEYING`), chưa giám định, chưa báo giá, chưa QC.
- **Steps to Reproduce:**
  1. Đăng nhập `forklift`.
  2. `PATCH /api/DepotJobs/{id}/status` body `{"status":"READY_FOR_OUT","condition":"AV"}` → 200.
  3. `POST /api/DepotJobs/{id}/gate-out` body `{"truckPlate":"51C-QA9.99","driverName":"QA"}` → 200.
- **Expected Result:** Từ chối — chỉ được đổi trạng thái theo đúng chuỗi quy trình và đúng vai trò.
- **Actual Result:** Hồ sơ thành `GATE_OUT` dù không có phiếu giám định. Trên DB hiện có 2 hồ sơ QA như vậy (QABU4182053, QABU3877225).
- **Evidence:** TC-085, TC-087, TC-203.
- **Root Cause:** `DepotJobService.UpdateJobStatusAsync` (dòng 243-262) chỉ kiểm tra trạng thái đích có trong danh sách `allowed` và riêng `READY_FOR_OUT` thì chặn khi có RepairOrder chưa đạt — hồ sơ chưa từng sửa chữa (không có RepairOrder) lọt qua. Không kiểm tra trạng thái nguồn, không kiểm tra vai trò (BUG-001).
- **Suggested Fix:** Bảng chuyển trạng thái hợp lệ (from → to) và điều kiện bắt buộc (có Survey, QC PASSED…); giới hạn endpoint cho vai trò quản lý; ghi audit.

<a id="bug-004"></a>
## BUG-004 — Race condition Gate-In tạo hồ sơ trùng

- **Title:** Gửi Gate-In đồng thời cùng số container tạo nhiều hồ sơ đang hoạt động.
- **Module:** Gate-In
- **URL:** `POST /api/DepotJobs/gate-in`
- **Severity:** High
- **Environment:** Local
- **Precondition:** Số container chưa có trong bãi.
- **Steps to Reproduce:**
  1. Gửi đồng thời 3 request `POST /api/DepotJobs/gate-in` cùng `containerNo`.
  2. `GET /api/DepotJobs?searchKeyword=<containerNo>`.
  3. Lặp lại 6 lần với 6 số container khác nhau.
- **Expected Result:** Chỉ 1 hồ sơ được tạo, các request sau trả 409.
- **Actual Result:** **4/6 lần tạo trùng** (có lần 3/3 request đều tạo). Dữ liệu thật đã bị trùng từ trước khi test: **TGBU3719842** có 2 hồ sơ đang hoạt động (id 58 và 59). Gửi tuần tự thì bị chặn đúng (TC-078 PASS); giao diện chặn double-click đúng (TC-259 PASS) — lỗi nằm ở backend.
- **Evidence:** TC-110, TC-202.
- **Root Cause:** `CreateGateInJobAsync` kiểm tra trùng bằng `AnyAsync(...)` rồi mới `Add` (check-then-insert, không transaction/khoá). `DepotJobConfiguration.cs:28` chỉ có `HasIndex(x => x.ContainerNo)` thường, không unique.
- **Suggested Fix:** Unique index có điều kiện trên `depot_jobs(ContainerNo) WHERE Status <> 'GATE_OUT' AND NOT IsDeleted`, bắt lỗi vi phạm → 409; xử lý dữ liệu trùng hiện có (TGBU3719842).

<a id="bug-005"></a>
## BUG-005 — Màn Cấu hình Zalo crash toàn ứng dụng

- **Title:** Mở "Cấu Hình Zalo OA & Token" làm trắng toàn bộ app.
- **Module:** Thông báo — Zalo Gateway
- **URL:** http://localhost:3000/ → menu "Cấu Hình Zalo OA & Token" (cũng xảy ra trên VPS vì cùng mã)
- **Severity:** High
- **Environment:** Local, desktop & mobile, mọi vai trò
- **Precondition:** Đăng nhập bất kỳ.
- **Steps to Reproduce:**
  1. Bấm menu "Cấu Hình Zalo OA & Token".
- **Expected Result:** Hiển thị cấu hình Zalo OA.
- **Actual Result:** Lỗi JS `Cannot read properties of undefined (reading 'toLocaleString')`, toàn trang trắng, mọi menu khác không bấm được cho tới khi F5.
- **Evidence:** TC-271; quét UI desktop/mobile/forklift đều dừng tại màn này.
- **Root Cause:** `modules/notifications/pages/ZaloSettings.tsx:251` gọi `settings.monthlyUsage.toLocaleString()`; `monthlyUsage` là trường tuỳ chọn (`notification.types.ts:184`) và cấu hình Zalo (`MOCK_ZALO_SETTINGS`) không có trường này — có sẵn từ bản commit gốc.
- **Suggested Fix:** `(settings.monthlyUsage ?? 0).toLocaleString()`; thêm Error Boundary quanh vùng nội dung để 1 màn lỗi không làm sập cả app.

<a id="bug-006"></a>
## BUG-006 — Không có HTTPS

- **Title:** Website production chỉ chạy HTTP.
- **Module:** Hạ tầng VPS
- **URL:** http://160.187.146.176:3001/
- **Severity:** High
- **Environment:** VPS
- **Steps to Reproduce:**
  1. Mở `https://160.187.146.176:3001/`.
- **Expected Result:** HTTPS, HTTP chuyển hướng sang HTTPS.
- **Actual Result:** Lỗi SSL (`ERR_SSL_WRONG_VERSION_NUMBER`); chỉ có HTTP — mật khẩu đăng nhập và JWT truyền dạng rõ.
- **Evidence:** TC-330.
- **Root Cause:** `docker-compose.vps.yml` publish frontend Express trực tiếp trên cổng 3001, không có reverse proxy/TLS.
- **Suggested Fix:** Đặt Nginx/Caddy + chứng chỉ (Let's Encrypt, cần tên miền) trước cổng 3001; bật HSTS.

<a id="bug-007"></a>
## BUG-007 — Tạo được vật tư trùng mã

- **Title:** `POST /api/MasterData/materials` với mã đã tồn tại tạo thêm bản ghi thứ 2.
- **Module:** Kho vật tư
- **URL:** `POST /api/MasterData/materials`
- **Severity:** High
- **Environment:** Local
- **Steps to Reproduce:**
  1. Tạo vật tư `QA-MAT-xxxxxx`.
  2. Gửi lại đúng request.
  3. `GET /api/MasterData/materials`, `GET /api/warehouse/stock-balances`.
- **Expected Result:** 400/409 "Mã vật tư đã tồn tại".
- **Actual Result:** 200 — có 2 vật tư cùng mã (id 34 và 36); giao dịch nhập kho rơi vào 1 bản ghi (id 34 tồn 10, id 36 tồn 0); bảng tồn kho hiện 2 dòng cùng mã.
- **Evidence:** TC-156.
- **Root Cause:** `MasterDataService.AddMaterialAsync` (dòng 75-82) thêm thẳng, không kiểm tra trùng; bảng không có unique index trên `Code`.
- **Suggested Fix:** Kiểm tra trùng + unique index `Materials(Code)`; gộp dữ liệu trùng hiện có.

<a id="bug-008"></a>
## BUG-008 — Báo giá tin GrandTotal từ client

- **Title:** Tổng báo giá lưu theo số client gửi, không khớp tổng hạng mục.
- **Module:** Báo giá (Estimate)
- **URL:** `POST /api/DepotJobs/{id}/estimate`
- **Severity:** Medium
- **Environment:** Local
- **Precondition:** Hồ sơ ở `ESTIMATING`.
- **Steps to Reproduce:**
  1. Gửi báo giá với 1 hạng mục 400.000, thuế 40.000 nhưng `grandTotal: 999`.
  2. `GET /api/DepotJobs/{id}` xem `estimate.grandTotal`.
- **Expected Result:** Từ chối, hoặc backend tự tính lại = 440.000.
- **Actual Result:** 200, lưu `grandTotal = 999` và gửi hãng tàu duyệt với số này.
- **Evidence:** TC-094.
- **Root Cause:** `DepotJobService.cs:729` `var grandTotal = estimateVm.GrandTotal > 0 ? estimateVm.GrandTotal : <tự tính>` — ưu tiên số client.
- **Suggested Fix:** Luôn tính tổng phía server từ hạng mục/labor/material/tax; bỏ qua các trường tổng client gửi.

<a id="bug-009"></a>
## BUG-009 — Bắt đầu sửa chữa lần 2 trả HTTP 500

- **Module:** Sửa chữa (Repair)
- **URL:** `POST /api/DepotJobs/{id}/repair/start`
- **Severity:** Medium
- **Environment:** Local
- **Precondition:** Hồ sơ đã bắt đầu sửa chữa (`REPAIRING`, đã có RepairOrder).
- **Steps to Reproduce:**
  1. `POST /repair/start` lần 1 → 200.
  2. `POST /repair/start` lần 2 (vd bấm 2 lần / 2 thợ cùng bấm).
- **Expected Result:** 400 "Lệnh sửa chữa đã bắt đầu".
- **Actual Result:** **HTTP 500**.
- **Evidence:** TC-100.
- **Root Cause:** `StartRepairAsync` (dòng ~1206-1225) chỉ kiểm tra `job.Status == "REPAIRING"` rồi luôn `Add(new RepairOrder)`; lần 2 trạng thái vẫn là REPAIRING nên thêm RepairOrder thứ 2 cho cùng `DepotJobId` → vi phạm ràng buộc 1-1 khi SaveChanges → exception không được bắt.
- **Suggested Fix:** Kiểm tra đã có RepairOrder thì trả 400; bắt `DbUpdateException` trả lỗi nghiệp vụ.

<a id="bug-010"></a>
## BUG-010 — Nhật ký audit không ghi thao tác quản trị

- **Module:** Hệ thống — Audit log
- **URL:** `GET /api/system/audit-logs`
- **Severity:** Medium
- **Environment:** Local
- **Steps to Reproduce:**
  1. Admin tạo người dùng, đặt lại mật khẩu, xoá người dùng qua `/api/system/users`.
  2. `GET /api/system/audit-logs?take=200`.
- **Expected Result:** Có bản ghi cho từng thao tác.
- **Actual Result:** 0 bản ghi trên toàn hệ thống.
- **Evidence:** TC-193.
- **Root Cause:** `UserService.CreateAuditLogAsync` chỉ được gọi khi frontend chủ động `POST /api/system/audit-logs`; các thao tác tạo/sửa/xoá/đặt lại mật khẩu ở `UserService` không tự ghi audit.
- **Suggested Fix:** Ghi audit phía server trong từng thao tác quản trị (người thực hiện lấy từ token), không phụ thuộc frontend.

<a id="bug-011"></a>
## BUG-011 — Đăng xuất không thu hồi token

- **Module:** Authentication
- **Severity:** Medium
- **Environment:** Local
- **Steps to Reproduce:**
  1. Đăng nhập, lưu token. 2. Bấm Đăng xuất trên giao diện. 3. Gọi `GET /api/DepotJobs` bằng token đã lưu.
- **Expected Result:** 401.
- **Actual Result:** 200 — token còn hiệu lực tới 8 giờ (`Jwt:ExpireMinutes = 480`).
- **Evidence:** TC-028 (frontend chỉ xoá localStorage — TC-252 PASS).
- **Root Cause:** Không có API đăng xuất / danh sách thu hồi; JWT stateless.
- **Suggested Fix:** Rút ngắn thời hạn access token + refresh token có thu hồi, hoặc lưu `jti` bị thu hồi khi đăng xuất/khoá tài khoản.

<a id="bug-012"></a>
## BUG-012 — Nhận việc giám định thay người khác

- **Module:** Giám định (Survey)
- **URL:** `POST /api/DepotJobs/{id}/survey/claim`
- **Severity:** Medium
- **Environment:** Local
- **Steps to Reproduce:**
  1. Đăng nhập `surveyor` (id 2).
  2. `POST /survey/claim` body `{"staffId": 7}` (id của tài khoản `repair`).
- **Expected Result:** Người nhận việc = người trong token; từ chối staffId khác.
- **Actual Result:** 200 — hồ sơ được ghi là do tài khoản `repair` nhận.
- **Evidence:** TC-246. (Đối chứng: lệnh xe nâng `forklift/start` với operatorId người khác bị từ chối đúng — TC-322.)
- **Root Cause:** `ClaimSurvey` dùng `request.StaffId` từ body.
- **Suggested Fix:** Lấy user id từ claim của JWT (`CurrentUser`), bỏ `staffId` trong request.

<a id="bug-013"></a>
## BUG-013 — Tải ảnh không cần đăng nhập

- **Module:** File / Ảnh
- **URL:** `GET /api/files/{fileId}/{storedName}` (qua `server.ts`) và Depot.FileServer
- **Severity:** Medium
- **Environment:** VPS (xác nhận 29/09), Local (FileServer trực tiếp)
- **Steps to Reproduce:**
  1. Upload 1 ảnh giám định, lấy URL `/api/files/...`.
  2. Mở URL ở trình duyệt chưa đăng nhập.
- **Expected Result:** 401.
- **Actual Result:** 200 image/jpeg. Link dạng GUID khó đoán nhưng ai có link (log, chia sẻ nhầm) đều xem được ảnh hồ sơ container.
- **Evidence:** TC-238, TC-333.
- **Root Cause:** Route `app.get("/api/files/:fileId/:storedName")` trong `fontend/server.ts` chuyển thẳng sang FileServer, không kiểm tra JWT; `FilesController` của FileServer không có xác thực.
- **Suggested Fix:** Kiểm tra JWT ở `server.ts` trước khi proxy, hoặc phát URL ký có hạn (signed URL).

<a id="bug-014"></a>
## BUG-014 — Bundle JS chứa mật khẩu / khoá mẫu

- **Module:** Frontend (VPS)
- **URL:** http://160.187.146.176:3001/assets/*.js
- **Severity:** Medium
- **Environment:** VPS (bản deploy 29/09)
- **Steps to Reproduce:**
  1. Tải file JS của trang, tìm `Password`, `passwordHash`, `Secret`, `apiKey`.
- **Expected Result:** Không có mật khẩu/khoá trong mã phía client.
- **Actual Result:** Tìm thấy `password:"Password@123"` (mật khẩu mặc định cấp cho tài khoản tài xế tạo ở màn Khách hàng), `passwordHash:"123456"`, `clientSecret:"sk_live_maersk_emr_9921_sec"`, `apiKey:"mae_api_key_depot_vnhcm01_secure"`.
- **Evidence:** TC-332.
- **Root Cause:** `modules/customer/components/CustomerAccountsTab.tsx:82,152,269` (mật khẩu mặc định `Password@123`); `modules/estimate/services/maerskIntegrationService.ts:7-8` (khoá mẫu); `passwordHash:"123456"` từ `data/roleMenuConfig.ts` — **đã xoá khỏi source ngày 29/09 nhưng VPS chưa deploy lại**.
- **Suggested Fix:** Mật khẩu tài khoản mới do backend sinh ngẫu nhiên; khoá tích hợp hãng tàu để ở backend; deploy lại frontend.

<a id="bug-015"></a>
## BUG-015 — Tải trang lần đầu ~9,7 giây

- **Module:** Hiệu năng (VPS)
- **Severity:** Medium
- **Environment:** VPS, Chromium, mạng từ máy tester
- **Steps to Reproduce:** Mở http://160.187.146.176:3001/ với cache trống, đo tới `networkidle`.
- **Expected Result:** < 3 giây.
- **Actual Result:** ~9,7 giây; 1 file JS 2,8 MB, **không nén** (không có `Content-Encoding`), `Cache-Control: max-age=0`.
- **Evidence:** TC-334.
- **Root Cause:** Vite build 1 chunk duy nhất; Express `server.ts` serve static không bật compression/cache dài hạn cho file có hash.
- **Suggested Fix:** Bật `compression`, `Cache-Control: immutable` cho `/assets/*`; code-split theo module (dynamic import cho từng trang).

<a id="bug-016"></a>
## BUG-016 — Lỗi API hiển thị như "không có dữ liệu"

- **Module:** Xử lý lỗi (UI) — Công nợ, Kho, Master Data
- **Severity:** Medium
- **Environment:** Local, Playwright chặn API (`route.fulfill 500/403`, `route.abort`)
- **Steps to Reproduce:**
  1. Làm API `/api/billing/*` lỗi mạng → mở "Công Nợ Hãng Tàu".
  2. Làm API `/api/warehouse/*` trả 403 → mở "Kho Vật Tư".
  3. Làm API catalog trả 500 → mở "DM Mã Hư Hỏng IICL".
- **Expected Result:** Thông báo lỗi rõ ràng bằng tiếng Việt, nút thử lại.
- **Actual Result:** (1) Hiện "Không tìm thấy khoản công nợ… phù hợp", tổng nợ 0 đ — dễ hiểu nhầm là không có nợ. (2) Kho hiển thị như rỗng. (3) Banner "Request failed with status code 500" (câu kỹ thuật tiếng Anh), không hiện message backend.
- **Evidence:** TC-254, TC-255, TC-256; ảnh `ui-err-*.png`.
- **Root Cause:** Các trang `catch` lỗi rồi để danh sách rỗng hoặc hiển thị `error.message` của axios.
- **Suggested Fix:** Trạng thái lỗi riêng cho từng trang (khác trạng thái rỗng), ưu tiên `response.data.message` của backend.

<a id="bug-017"></a>
## BUG-017 — Cước nâng hạ chấp nhận giá âm, VAT sai

- **Module:** Master Data — Cước Nâng Hạ
- **URL:** `POST/PUT /api/MasterData/service-tariffs`
- **Severity:** Medium
- **Environment:** Local
- **Steps to Reproduce:** Tạo biểu cước với `price20GP: -50000`; với `vatPercent: 150`; với `vatPercent: -8`.
- **Expected Result:** 400.
- **Actual Result:** 200 cả 3 trường hợp (đã xoá mềm dữ liệu test).
- **Evidence:** TC-131, TC-132, TC-133.
- **Root Cause:** `MasterDataService.CreateServiceTariffAsync/UpdateServiceTariffAsync` chỉ kiểm tra `Code`/`NameVi`.
- **Suggested Fix:** Giá ≥ 0, 0 ≤ VAT ≤ 100 ở backend và form.

<a id="bug-018"></a>
## BUG-018 — Cước lưu bãi chấp nhận bậc sai

- **Module:** Master Data — Cước Lưu Bãi
- **URL:** `POST /api/MasterData/storage-tariffs`
- **Severity:** Medium
- **Environment:** Local
- **Steps to Reproduce:** Tạo quy tắc với bậc `fromDay 10 / toDay 2`; 2 bậc `1-5` và `3-8`; `tiers: []`; `defaultFreeDays: -3`.
- **Expected Result:** 400 — bậc phải liên tục, không chồng lấn, có ít nhất 1 bậc.
- **Actual Result:** 200 cả 4 trường hợp → Máy tính cước có thể tính sai tiền lưu bãi.
- **Evidence:** TC-141…TC-144.
- **Root Cause:** `CreateStorageTariffAsync` không kiểm tra `Tiers`.
- **Suggested Fix:** Kiểm tra `ToDay ≥ FromDay`, không chồng lấn, ≥ 1 bậc, `DefaultFreeDays ≥ 0`.

<a id="bug-019"></a>
## BUG-019 — Giao dịch kho với vật tư/loại không tồn tại

- **Module:** Kho vật tư — Nhập/Xuất
- **URL:** `POST /api/warehouse/transactions`
- **Severity:** Medium
- **Environment:** Local
- **Steps to Reproduce:** Gửi giao dịch `materialCode: "QA-NO-SUCH"`; gửi `transactionType: "QA_BAD"`.
- **Expected Result:** 400.
- **Actual Result:** 200 — lưu giao dịch mồ côi / loại không hợp lệ vào `MaterialStockTransactions` (ảnh hưởng thẻ kho, báo cáo).
- **Evidence:** TC-161, TC-162. (Đối chứng: xuất vượt tồn, số lượng 0/âm bị chặn đúng — TC-158…TC-160 PASS.)
- **Root Cause:** `WarehouseService` không kiểm tra `MaterialCode` tồn tại và `TransactionType` thuộc danh sách hợp lệ.
- **Suggested Fix:** Kiểm tra 2 trường trên trước khi ghi.

<a id="bug-020"></a>
## BUG-020 — Khách hàng/tài xế/phương tiện: số âm, khách hàng không tồn tại

- **Module:** Khách hàng & Đối tác
- **URL:** `POST /api/customers`, `/api/customers/drivers`, `/api/customers/vehicles`
- **Severity:** Medium
- **Environment:** Local
- **Steps to Reproduce:** Tạo khách hàng `creditLimit: -100`; tạo tài xế `customerCode: "QA-NO-CUS"`; tạo xe `payloadTon: -1`.
- **Expected Result:** 400.
- **Actual Result:** 200 cả 3 — có tài xế thuộc khách hàng không tồn tại.
- **Evidence:** TC-167, TC-170, TC-173. (Booking: ngày hết hạn trước ngày phát hành, số lượng 0, đã dùng > tổng bị chặn đúng.)
- **Root Cause:** `MasterDataService` (nhóm Customer) không kiểm tra số âm và `CustomerCode` tồn tại.
- **Suggested Fix:** Kiểm tra giá trị ≥ 0 và khách hàng tồn tại/đang hoạt động.

<a id="bug-021"></a>
## BUG-021 — Lệnh vệ sinh cho container không có trong bãi, đơn giá âm

- **Module:** Tổ Vệ sinh
- **URL:** `POST /api/cleaning`
- **Severity:** Medium
- **Environment:** Local
- **Steps to Reproduce:** Tạo lệnh vệ sinh `containerNo: "QAZZ9999999"` (không có hồ sơ); tạo lệnh với hạng mục `unitPrice: -1`.
- **Expected Result:** 400.
- **Actual Result:** 200 cả 2 (record id 21 có đơn giá -1).
- **Evidence:** TC-296, TC-297.
- **Root Cause:** `CleaningService.CreateAsync` không đối chiếu container với `depot_jobs` đang hoạt động và không kiểm tra đơn giá.
- **Suggested Fix:** Bắt buộc có hồ sơ container đang trong bãi; đơn giá ≥ 0.

<a id="bug-022"></a>
## BUG-022 — Cấu hình block bãi không hợp lệ vẫn lưu

- **Module:** Bãi — Quản lý Block
- **URL:** `PUT /api/Yard/blocks/{blockCode}`
- **Severity:** Medium
- **Environment:** Local
- **Steps to Reproduce:** Cập nhật `BLOCK_R` với `bayCount: 0`; `maxTier: -3`; `status: "QA_BAD"`.
- **Expected Result:** 400.
- **Actual Result:** 200 cả 3 (đã khôi phục cấu hình gốc 8/4/4 ACTIVE ngay sau test).
- **Evidence:** TC-302, TC-303, TC-304.
- **Root Cause:** Service cập nhật block không kiểm tra giá trị; không chặn giảm kích thước dưới số container đang xếp.
- **Suggested Fix:** Bay/Row/Tier ≥ 1, trạng thái thuộc danh sách, không cho thu nhỏ khi còn container ở vị trí bị cắt.

<a id="bug-023"></a>
## BUG-023 — Thông báo lỗi giám định sai lệch

- **Module:** Giám định — `POST /api/DepotJobs/{id}/survey`
- **Severity:** Low · **Environment:** Local
- **Steps to Reproduce:** Nộp giám định với `conditionRating: "QA_BAD"` hoặc hư hỏng số lượng âm.
- **Expected Result:** 400 kèm lý do đúng (hạng không hợp lệ / số lượng âm).
- **Actual Result:** 400 nhưng luôn báo "Mã công việc không tồn tại hoặc đã bị hủy".
- **Evidence:** TC-090, TC-091.
- **Root Cause:** `SubmitSurveyAsync` trả `false` cho mọi lỗi (dòng 358-361); `DepotJobsController.cs:347` ánh xạ `false` thành 1 câu duy nhất.
- **Suggested Fix:** Trả lỗi cụ thể (ArgumentException với message) thay vì bool.

<a id="bug-024"></a>
## BUG-024 — Không kiểm tra định dạng email

- **Module:** Hãng tàu, Khách hàng, Người dùng hệ thống · **Severity:** Low · **Environment:** Local
- **Steps to Reproduce:** Tạo hãng tàu `contactEmail: "not-an-email"`; khách hàng `email: "abc"`; người dùng `email: "abc"`.
- **Expected Result:** 400. · **Actual Result:** 200 cả 3.
- **Evidence:** TC-150, TC-166, TC-184.
- **Suggested Fix:** `[EmailAddress]` trên request + kiểm tra ở form.

<a id="bug-025"></a>
## BUG-025 — Gate-In chấp nhận SĐT toàn chữ, tên tài xế 1.000 ký tự

- **Module:** Gate-In — `POST /api/DepotJobs/gate-in` · **Severity:** Low · **Environment:** Local
- **Steps to Reproduce:** Gate-In với `driverPhone: "abcxyz"`; với `driverName` 1.000 ký tự.
- **Expected Result:** 400. · **Actual Result:** 200, tạo hồ sơ (e-EIR in ra SĐT sai).
- **Evidence:** TC-072, TC-073.
- **Suggested Fix:** Regex SĐT, giới hạn độ dài tên (khớp độ dài cột).

<a id="bug-026"></a>
## BUG-026 — Vật tư tồn tối thiểu > tối đa

- **Module:** Kho vật tư — `POST /api/MasterData/materials` · **Severity:** Low · **Environment:** Local
- **Steps to Reproduce:** Tạo vật tư `minimumStock: 500, maximumStock: 10`.
- **Expected Result:** 400. · **Actual Result:** 200.
- **Evidence:** TC-155.
- **Suggested Fix:** Kiểm tra `MinimumStock ≤ ReorderLevel ≤ MaximumStock`.

<a id="bug-027"></a>
## BUG-027 — Mẫu tin rỗng, thông báo tới người nhận không tồn tại

- **Module:** Thông báo — `POST /api/notifications/templates`, `POST /api/notifications` · **Severity:** Low · **Environment:** Local
- **Steps to Reproduce:** Tạo mẫu tin `contentTemplate: ""`; gửi thông báo `recipientId: "qa_no_user"`.
- **Expected Result:** 400. · **Actual Result:** 200 cả 2.
- **Evidence:** TC-196, TC-309.
- **Suggested Fix:** Bắt buộc nội dung; kiểm tra người nhận tồn tại.

<a id="bug-028"></a>
## BUG-028 — Upload file gắn IdTable/TableName tuỳ ý

- **Module:** File — `POST /api/depot-files/upload` · **Severity:** Low · **Environment:** Local
- **Steps to Reproduce:** Upload ảnh với `idTable: 999999999`; với `tableName: "QA_ANY_TABLE"`.
- **Expected Result:** 400. · **Actual Result:** 200 — tạo bản ghi `DepotFiles` mồ côi và file vật lý (đã xoá sau test).
- **Evidence:** TC-236, TC-237. (Đối chứng: chặn đúng file .exe, .html, .svg, exe đổi đuôi .jpg, file rỗng, file 21 MB — TC-229…TC-235.)
- **Suggested Fix:** Danh sách `TableName` hợp lệ + kiểm tra bản ghi đích tồn tại.

<a id="bug-029"></a>
## BUG-029 — Lịch sử ID không tồn tại trả 200

- **Module:** API — `GET /api/DepotJobs/999999999/history` · **Severity:** Low · **Environment:** Local
- **Expected Result:** 404. · **Actual Result:** 200 với danh sách rỗng.
- **Evidence:** TC-225. (Các API chi tiết khác trả 404 đúng — TC-220…TC-224.)
- **Suggested Fix:** Kiểm tra hồ sơ tồn tại trước khi trả lịch sử.

<a id="bug-030"></a>
## BUG-030 — API xác thực frontend khai báo nhưng backend không có

- **Module:** Authentication — `fontend/src/api/auth.api.ts` · **Severity:** Low · **Environment:** Local
- **Steps to Reproduce:** Gọi `POST /api/auth/refresh-token`, `GET /api/auth/me` với token hợp lệ.
- **Expected Result:** 200 (hoặc không khai báo). · **Actual Result:** 404 cả 2.
- **Evidence:** TC-029, TC-030.
- **Suggested Fix:** Xoá `authApi.refreshToken/getProfile` hoặc bổ sung endpoint (liên quan BUG-011).

<a id="bug-031"></a>
## BUG-031 — Thiếu header bảo mật; CORS * ở Development

- **Module:** Bảo mật HTTP · **Severity:** Low · **Environment:** Local & VPS
- **Actual Result:** Không có `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`; lộ `X-Powered-By: Express`. Backend trả `Access-Control-Allow-Origin: *` khi chạy Development (`Program.cs:170-180`).
- **Evidence:** TC-247, TC-331, TC-243.
- **Suggested Fix:** `helmet` cho Express, `app.disable('x-powered-by')`; giữ CORS chỉ cho origin cấu hình.

<a id="bug-032"></a>
## BUG-032 — Không có trạng thái đang tải ở Cước Nâng Hạ

- **Module:** Master Data — Cước Nâng Hạ · **Severity:** Low · **Environment:** Local (API bị làm chậm 6 giây)
- **Actual Result:** Trong lúc chờ, bảng hiện "Chưa có hạng mục cước nâng hạ nào khớp bộ lọc" — dễ hiểu nhầm là chưa có dữ liệu.
- **Evidence:** TC-257.
- **Suggested Fix:** Cờ `isLoading` + skeleton/"Đang tải…".

<a id="bug-033"></a>
## BUG-033 — Tiêu đề khó đọc; nhãn lọc ghi cứng

- **Module:** Giao diện · **Severity:** Low · **Environment:** Local
- **Actual Result:** Khối tiêu đề "DANH MỤC HỆ THỐNG & MASTER DATA" chữ tối trên nền gradient tối (ảnh `ui-err-DMMHH.png`); bộ lọc hãng tàu ở Công nợ ghi cứng "Tất cả (MAERSK LINE)".
- **Evidence:** TC-267, TC-268.
- **Suggested Fix:** Đổi màu chữ/nền theo chuẩn sáng; nhãn "Tất cả hãng tàu".

<a id="bug-034"></a>
## BUG-034 — Không phân trang danh sách hồ sơ

- **Module:** Hiệu năng API — `GET /api/DepotJobs` · **Severity:** Low · **Environment:** Local
- **Actual Result:** Trả toàn bộ 58 hồ sơ kèm survey/estimate/audit lồng nhau (209 KB) trong 1 lần; hiện nhanh (< 1,5 s) nhưng tăng tuyến tính theo dữ liệu.
- **Evidence:** TC-204.
- **Suggested Fix:** Tham số `page/pageSize/sort` phía server; danh sách chỉ trả trường tóm tắt.
