# Final Test Report — SolutionDepot

> **Cập nhật 30/09/2026:** đã sửa lỗi và chạy lại toàn bộ bộ test — 55 test case chuyển từ FAIL sang PASS. Trạng thái từng bug: [fix-report.md](fix-report.md). Số liệu dưới đây là kết quả vòng kiểm thử đầu (trước khi sửa).

- Ngày kiểm thử: 29–30/09/2026
- Môi trường: **Local** http://localhost:3000 (chính) · **VPS** http://160.187.146.176:3001 (chỉ phần không cần đăng nhập)
- Phương pháp: API (Node.js), UI (Playwright/Chromium desktop + mobile), đối chiếu dữ liệu. Không sửa code, không đổi DB/API, không stress test.
- Tài liệu liên quan: [test-plan](test-plan.md) · [test-scenarios](test-scenarios.md) · [test-cases](test-cases.md) · [bug-report](bug-report.md) · [api-test](api-test.md) · [security-test](security-test.md)

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---|
| Total Modules | **38** |
| Total Test Cases | **325** |
| Passed | **246** (75.7%) |
| Failed | **70** (21.5%) |
| Blocked | **3** |
| Not Tested | **6** |
| Critical Bugs | **1** |
| High Bugs | **6** |
| Medium Bugs | **15** |
| Low Bugs | **12** |
| Tổng số bug | **34** |

> 70 test case FAIL được gom thành 34 bug (1 bug có thể làm nhiều test case thất bại).

## 2. Đánh giá

**Kết luận: CHƯA ĐẠT tiêu chí phát hành** (còn 1 Critical, 6 High).

Điểm mạnh:
- Xác thực JWT chắc chắn: token giả / alg=none / hết hạn đều bị chặn; khoá tài khoản sau 5 lần sai; 144/144 API trên VPS yêu cầu token.
- Luồng nghiệp vụ chính chạy đúng thứ tự khi đi qua đúng API từng bước: Gate-In → giám định → báo giá → duyệt → sửa → QC → Gate-Out → Gate-In lại.
- Thanh toán chặt: chặn sai số tiền, số âm, thanh toán 2 lần, huỷ phiếu đã thu.
- Upload chặn đúng file nguy hiểm (kiểm tra cả nội dung, không chỉ đuôi); không phát hiện SQL injection / XSS.
- Nhận việc đồng thời (giám định, xe nâng) xử lý khoá đúng; API phản hồi nhanh (< 15 ms trên local).
- 55 menu trên desktop và mobile hiển thị không lỗi (trừ màn Zalo), không tràn ngang trên điện thoại.

Rủi ro chính cần xử lý trước khi vận hành:
1. **BUG-001 + BUG-002** — Phân quyền chỉ có ở tên menu: mọi tài khoản (kể cả hãng tàu bên ngoài) xem/sửa/xoá được công nợ, cước, danh mục, ảnh.
2. **BUG-003** — Container có thể ra bãi mà chưa giám định/thu tiền qua API đổi trạng thái.
3. **BUG-004** — Gate-In đồng thời tạo hồ sơ trùng (đã có dữ liệu trùng thật: TGBU3719842).
4. **BUG-006 / BUG-014** — Production chạy HTTP, bundle chứa mật khẩu mặc định.
5. **BUG-005** — Màn Zalo làm sập toàn bộ ứng dụng.
6. **BUG-007** — Trùng mã vật tư làm tồn kho tách đôi.

Đề xuất thứ tự sửa: BUG-001 → 003 → 004 → 006/014 → 005 → 007 → 002, sau đó nhóm validation Medium (017–022, 008, 009).

## 3. Kết quả theo module

| Module | Số ca | PASS | FAIL | BLOCKED | NOT TESTED | Bug |
|---|---|---|---|---|---|---|
| Authentication | 30 | 27 | 3 | 0 | 0 | [BUG-011](bug-report.md#bug-011), [BUG-030](bug-report.md#bug-030) |
| Phân quyền (RBAC) | 22 | 11 | 11 | 0 | 0 | [BUG-001](bug-report.md#bug-001), [BUG-002](bug-report.md#bug-002) |
| Gate-In (validation) | 18 | 15 | 3 | 0 | 0 | [BUG-004](bug-report.md#bug-004), [BUG-025](bug-report.md#bug-025) |
| Luồng nghiệp vụ Container | 33 | 27 | 6 | 0 | 0 | [BUG-003](bug-report.md#bug-003), [BUG-008](bug-report.md#bug-008), [BUG-009](bug-report.md#bug-009), [BUG-023](bug-report.md#bug-023) |
| Master Data — Danh mục (catalog) | 19 | 18 | 0 | 0 | 1 | - |
| Master Data — Cước Nâng Hạ | 10 | 7 | 3 | 0 | 0 | [BUG-017](bug-report.md#bug-017) |
| Master Data — Cước Lưu Bãi | 7 | 3 | 4 | 0 | 0 | [BUG-018](bug-report.md#bug-018) |
| Khách hàng & Đối tác — Hãng tàu | 6 | 4 | 1 | 0 | 1 | [BUG-024](bug-report.md#bug-024) |
| Kho vật tư — Danh mục vật tư | 4 | 2 | 2 | 0 | 0 | [BUG-007](bug-report.md#bug-007), [BUG-026](bug-report.md#bug-026) |
| Kho vật tư — Nhập/Xuất | 7 | 5 | 2 | 0 | 0 | [BUG-019](bug-report.md#bug-019) |
| Khách hàng & Đối tác — Khách hàng | 17 | 13 | 4 | 0 | 0 | [BUG-020](bug-report.md#bug-020), [BUG-024](bug-report.md#bug-024) |
| Hệ thống — Người dùng (RBAC) | 13 | 10 | 2 | 0 | 1 | [BUG-010](bug-report.md#bug-010), [BUG-024](bug-report.md#bug-024) |
| Thông báo — Mẫu tin | 5 | 4 | 1 | 0 | 0 | [BUG-027](bug-report.md#bug-027) |
| Dữ liệu — Nhất quán số liệu | 5 | 3 | 2 | 0 | 0 | [BUG-003](bug-report.md#bug-003), [BUG-004](bug-report.md#bug-004) |
| Hiệu năng | 10 | 9 | 1 | 0 | 0 | [BUG-034](bug-report.md#bug-034) |
| Tìm kiếm / Lọc — Danh sách container | 15 | 14 | 0 | 0 | 1 | - |
| API — Đọc chi tiết | 6 | 5 | 1 | 0 | 0 | [BUG-029](bug-report.md#bug-029) |
| Upload file | 14 | 12 | 2 | 0 | 0 | [BUG-028](bug-report.md#bug-028) |
| Bảo mật | 7 | 3 | 4 | 0 | 0 | [BUG-012](bug-report.md#bug-012), [BUG-013](bug-report.md#bug-013), [BUG-031](bug-report.md#bug-031) |
| Môi trường | 1 | 0 | 0 | 1 | 0 | - |
| Authentication (UI) | 5 | 5 | 0 | 0 | 0 | - |
| Xử lý lỗi (UI) | 4 | 0 | 4 | 0 | 0 | [BUG-016](bug-report.md#bug-016), [BUG-032](bug-report.md#bug-032) |
| Gate-In (UI) | 2 | 2 | 0 | 0 | 0 | - |
| Tìm kiếm / Lọc (UI) | 4 | 4 | 0 | 0 | 0 | - |
| Tải xuống (UI) | 2 | 1 | 0 | 0 | 1 | - |
| Giao diện | 2 | 0 | 2 | 0 | 0 | [BUG-033](bug-report.md#bug-033) |
| Thông báo — Zalo | 1 | 0 | 1 | 0 | 0 | [BUG-005](bug-report.md#bug-005) |
| Giao diện (Mobile 390px) | 1 | 1 | 0 | 0 | 0 | - |
| Khai thác — Phiếu dịch vụ & Thanh toán | 13 | 13 | 0 | 0 | 0 | - |
| Công nợ hãng tàu (Billing) | 7 | 5 | 0 | 1 | 1 | - |
| Tổ Vệ sinh | 8 | 6 | 2 | 0 | 0 | [BUG-021](bug-report.md#bug-021) |
| Bãi & Xe nâng | 10 | 7 | 3 | 0 | 0 | [BUG-022](bug-report.md#bug-022) |
| Thông báo — Gửi | 4 | 3 | 1 | 0 | 0 | [BUG-027](bug-report.md#bug-027) |
| VPS — Bảo mật | 6 | 2 | 4 | 0 | 0 | [BUG-006](bug-report.md#bug-006), [BUG-013](bug-report.md#bug-013), [BUG-014](bug-report.md#bug-014), [BUG-031](bug-report.md#bug-031) |
| VPS — Authentication | 4 | 4 | 0 | 0 | 0 | - |
| VPS — Hiệu năng | 1 | 0 | 1 | 0 | 0 | [BUG-015](bug-report.md#bug-015) |
| VPS — Giao diện | 1 | 1 | 0 | 0 | 0 | - |
| VPS — Chức năng | 1 | 0 | 0 | 1 | 0 | - |

## 4. Danh sách bug

| Bug | Severity | Module | Tiêu đề | Test case |
|---|---|---|---|---|
| [BUG-001](bug-report.md#bug-001) | Critical | Phân quyền (Backend API) | API không phân quyền theo vai trò — mọi tài khoản đã đăng nhập đọc/ghi/xoá được dữ liệu ngoài phạm vi | TC-042, TC-043, TC-044, TC-045, TC-046, TC-047, TC-048, TC-049, TC-239 |
| [BUG-002](bug-report.md#bug-002) | High | Phân quyền (Giao diện) | Sidebar không lọc menu theo quyền vai trò — tài xế xe nâng thấy và dùng được toàn bộ 55 menu | TC-270, TC-269 |
| [BUG-003](bug-report.md#bug-003) | High | Luồng nghiệp vụ Container | PATCH /api/DepotJobs/{id}/status cho phép nhảy thẳng sang READY_FOR_OUT rồi Gate-Out container chưa giám định/QC | TC-085, TC-087, TC-203 |
| [BUG-004](bug-report.md#bug-004) | High | Gate-In | Race condition: Gate-In đồng thời tạo nhiều hồ sơ đang hoạt động cho cùng 1 số container (đã xảy ra trên dữ liệu thật TGBU3719842) | TC-110, TC-202 |
| [BUG-005](bug-report.md#bug-005) | High | Thông báo — Zalo | Màn "Cấu Hình Zalo OA & Token" crash toàn bộ ứng dụng (trắng màn) | TC-271 |
| [BUG-006](bug-report.md#bug-006) | High | Hạ tầng VPS | Hệ thống chạy HTTP không mã hoá — mật khẩu và JWT truyền dạng rõ | TC-330 |
| [BUG-007](bug-report.md#bug-007) | High | Kho vật tư | Cho phép tạo vật tư trùng mã — sinh 2 vật tư cùng mã, tồn kho tách làm 2 dòng | TC-156 |
| [BUG-008](bug-report.md#bug-008) | Medium | Báo giá (Estimate) | Backend lưu nguyên GrandTotal do client gửi, không đối chiếu tổng các hạng mục | TC-094 |
| [BUG-009](bug-report.md#bug-009) | Medium | Sửa chữa (Repair) | Bấm "Bắt đầu sửa chữa" lần 2 trả HTTP 500 | TC-100 |
| [BUG-010](bug-report.md#bug-010) | Medium | Hệ thống — Audit log | Nhật ký audit hệ thống không ghi nhận thao tác quản trị người dùng (0 bản ghi) | TC-193 |
| [BUG-011](bug-report.md#bug-011) | Medium | Authentication | Đăng xuất không thu hồi token — token cũ vẫn gọi API được tới khi hết hạn (8 giờ) | TC-028 |
| [BUG-012](bug-report.md#bug-012) | Medium | Giám định (Survey) | Nhận việc giám định thay người khác: backend tin staffId client gửi thay vì lấy từ token | TC-246 |
| [BUG-013](bug-report.md#bug-013) | Medium | File / Ảnh | Ảnh đã upload tải được không cần đăng nhập qua /api/files/* | TC-238, TC-333 |
| [BUG-014](bug-report.md#bug-014) | Medium | Frontend (VPS) | Bundle JS chứa mật khẩu mặc định và khoá API mẫu | TC-332 |
| [BUG-015](bug-report.md#bug-015) | Medium | Hiệu năng (VPS) | Tải trang lần đầu ~9,7 giây: 1 file JS 2,8 MB, không nén, không cache | TC-334 |
| [BUG-016](bug-report.md#bug-016) | Medium | Xử lý lỗi (UI) | Khi API lỗi/mất mạng, nhiều màn hiển thị như "không có dữ liệu" hoặc câu lỗi kỹ thuật tiếng Anh | TC-254, TC-255, TC-256 |
| [BUG-017](bug-report.md#bug-017) | Medium | Master Data — Cước Nâng Hạ | Biểu cước nâng hạ chấp nhận đơn giá âm, VAT âm hoặc > 100% | TC-131, TC-132, TC-133 |
| [BUG-018](bug-report.md#bug-018) | Medium | Master Data — Cước Lưu Bãi | Biểu cước lưu bãi chấp nhận bậc sai (ToDay < FromDay, chồng lấn, không có bậc, ngày miễn phí âm) | TC-141, TC-142, TC-143, TC-144 |
| [BUG-019](bug-report.md#bug-019) | Medium | Kho vật tư — Nhập/Xuất | Ghi giao dịch kho với mã vật tư không tồn tại / loại giao dịch không hợp lệ | TC-161, TC-162 |
| [BUG-020](bug-report.md#bug-020) | Medium | Khách hàng & Đối tác | Khách hàng/tài xế/phương tiện: chấp nhận số âm và tài xế của khách hàng không tồn tại | TC-167, TC-170, TC-173 |
| [BUG-021](bug-report.md#bug-021) | Medium | Tổ Vệ sinh | Tạo lệnh vệ sinh cho container không có trong bãi và đơn giá âm | TC-296, TC-297 |
| [BUG-022](bug-report.md#bug-022) | Medium | Bãi — Quản lý Block | Cập nhật block nhận BayCount = 0, MaxTier âm, trạng thái tuỳ ý | TC-302, TC-303, TC-304 |
| [BUG-023](bug-report.md#bug-023) | Low | Giám định (Survey) | Mọi lỗi nộp giám định đều báo sai "Mã công việc không tồn tại hoặc đã bị hủy" | TC-090, TC-091 |
| [BUG-024](bug-report.md#bug-024) | Low | Nhiều module | Không kiểm tra định dạng email (hãng tàu, khách hàng, người dùng hệ thống) | TC-150, TC-166, TC-184 |
| [BUG-025](bug-report.md#bug-025) | Low | Gate-In | Gate-In chấp nhận SĐT tài xế toàn chữ và tên tài xế 1.000 ký tự | TC-072, TC-073 |
| [BUG-026](bug-report.md#bug-026) | Low | Kho vật tư | Vật tư chấp nhận tồn tối thiểu lớn hơn tồn tối đa | TC-155 |
| [BUG-027](bug-report.md#bug-027) | Low | Thông báo | Mẫu tin nội dung rỗng và thông báo tới người nhận không tồn tại vẫn được lưu | TC-196, TC-309 |
| [BUG-028](bug-report.md#bug-028) | Low | File / Ảnh | Upload file gắn vào IdTable/TableName tuỳ ý — tạo metadata mồ côi | TC-236, TC-237 |
| [BUG-029](bug-report.md#bug-029) | Low | API — Lịch sử container | GET /api/DepotJobs/{id}/history với ID không tồn tại trả 200 thay vì 404 | TC-225 |
| [BUG-030](bug-report.md#bug-030) | Low | Authentication | Frontend khai báo API /auth/refresh-token và /auth/me nhưng backend không có (404) | TC-029, TC-030 |
| [BUG-031](bug-report.md#bug-031) | Low | Bảo mật HTTP | Thiếu header bảo mật (CSP, X-Frame-Options, X-Content-Type-Options), lộ X-Powered-By; CORS * ở Development | TC-247, TC-331, TC-243 |
| [BUG-032](bug-report.md#bug-032) | Low | Master Data — Cước Nâng Hạ | Trong lúc đang tải, màn hiển thị "Chưa có hạng mục" thay vì trạng thái đang tải | TC-257 |
| [BUG-033](bug-report.md#bug-033) | Low | Giao diện | Tiêu đề trang Master Data chữ tối trên nền tối; bộ lọc Công nợ ghi cứng "Tất cả (MAERSK LINE)" | TC-267, TC-268 |
| [BUG-034](bug-report.md#bug-034) | Low | Hiệu năng API | GET /api/DepotJobs trả toàn bộ hồ sơ kèm dữ liệu lồng nhau, không phân trang | TC-204 |

## 5. Lỗi giao diện

| Màn hình | Chức năng | Thao tác | Kết quả thực tế | Kết quả mong đợi | Mức độ |
|---|---|---|---|---|---|
| Cấu Hình Zalo OA & Token | Xem cấu hình Zalo | Bấm menu | Trắng toàn app, lỗi `toLocaleString` of undefined; phải F5 | Hiển thị cấu hình | High (BUG-005) |
| Sidebar (tài khoản forklift) | Menu theo quyền | Đăng nhập forklift | Hiện đủ 55 menu, mở được mọi màn | Chỉ 3 nhóm jobs/forklift/yard | High (BUG-002) |
| Phân Quyền RBAC & Users (forklift) | Thống kê tài khoản | Mở menu | "Tỷ lệ khả dụng: NaN%", tổng 0 | Báo không có quyền truy cập | High (BUG-002) |
| Công Nợ Hãng Tàu | Danh sách công nợ | Mở màn khi mất mạng | "Không tìm thấy khoản công nợ…", tổng 0 đ | Báo lỗi kết nối + nút thử lại | Medium (BUG-016) |
| Kho Vật Tư | Tồn kho | Mở màn khi API trả 403 | Hiển thị như kho rỗng | Báo không có quyền / lỗi | Medium (BUG-016) |
| DM Mã Hư Hỏng IICL | Danh sách | Mở màn khi API trả 500 | Banner "Request failed with status code 500" | Thông báo tiếng Việt, lấy message backend | Medium (BUG-016) |
| Cước Nâng Hạ | Danh sách | Mở màn khi API chậm | "Chưa có hạng mục cước nâng hạ nào…" trong lúc tải | "Đang tải…" | Low (BUG-032) |
| Danh mục hệ thống & Master Data | Tiêu đề trang | Mở màn | Chữ tối trên nền tối, khó đọc | Đủ tương phản | Low (BUG-033) |
| Công Nợ Hãng Tàu | Bộ lọc hãng tàu | Mở dropdown | Ghi cứng "Tất cả (MAERSK LINE)" | "Tất cả hãng tàu" | Low (BUG-033) |

## 6. BLOCKED & NOT TESTED

| ID | Kết quả | Test case | Lý do |
|---|---|---|---|
| TC-129 | NOT TESTED | Xoá loại container đang được hồ sơ container tham chiếu (40HC) | Không xoá loại container thật 40HC (id 2) đang được nhiều hồ sơ tham chiếu — tránh phá dữ liệu dùng chung; cần môi trường có bản sao DB. |
| TC-151 | NOT TESTED | Xoá hãng tàu đang được hồ sơ container tham chiếu | Không xoá hãng tàu thật (MSCU). FK DepotJob→ShippingLine là Restrict theo cấu hình. |
| TC-192 | NOT TESTED | Admin tự xoá chính mình | Không thực hiện: admin (id 1) là tài khoản quản trị duy nhất trên DB dev, nếu backend không chặn sẽ mất quyền quản trị. |
| TC-219 | NOT TESTED | Phân trang / sắp xếp phía server (page, pageSize, sort) | API không hỗ trợ tham số phân trang/sắp xếp; danh sách trả toàn bộ. Phân trang/sắp xếp nếu có chỉ ở client — kiểm tra ở UI. |
| TC-248 | BLOCKED | Hiển thị ảnh đã upload trên giao diện local (cổng 3000) | GET /api/files/* qua localhost:3000 → 401: dev server (node pid 18308, khởi động 29/09 13:27) chạy server.ts cũ chưa có route proxy /api/files. Cần khởi động lại npm run dev. |
| TC-265 | NOT TESTED | Xuất file ở Danh sách container | Màn Danh sách container không có chức năng xuất file |
| TC-291 | BLOCKED | Phân bổ thanh toán vượt số nợ còn lại | Không có khoản nợ nào còn dư để test (công nợ = 0) |
| TC-293 | NOT TESTED | Chốt kỳ công nợ | Không chốt kỳ thật trên DB dev để tránh khoá kỳ kế toán; cần môi trường riêng. |
| TC-336 | BLOCKED | Test chức năng cần đăng nhập trên VPS | Không có tài khoản hợp lệ: mật khẩu trong .env (ADMIN_PASSWORD, SEED_DEFAULT_PASSWORD) đều sai với DB VPS. Người dùng chuyển sang test trên localhost — toàn bộ test chức năng thực hiện trên local cùng source code. |

Để gỡ BLOCKED:
- **TC-336 (VPS)**: cung cấp tài khoản hợp lệ trên VPS, hoặc xác nhận mật khẩu seed của DB production.
- **TC-248**: khởi động lại `npm run dev` ở `fontend/` để nạp route proxy `/api/files` mới.
- **TC-291**: cần 1 khoản công nợ còn dư (đồng bộ công nợ từ hồ sơ đã duyệt báo giá).

## 7. Dữ liệu QA còn lại trên DB local

Dữ liệu tạo trong quá trình test (được phép, tiền tố `QA`). Không có dữ liệu nào trên VPS bị thay đổi.

| Loại | Dữ liệu | Ghi chú |
|---|---|---|
| Hồ sơ container | Các số `QA?U…` (QABU, QARU, QAGU…) | Chỉ xoá được hồ sơ đã GATE_OUT; gồm cả hồ sơ trùng do BUG-004 (id 91–99) và 2 hồ sơ GATE_OUT chưa giám định do BUG-003 |
| Lệnh vệ sinh | id 21 — QAZZ9999999 (đơn giá -1) | Bằng chứng BUG-021 |
| Vật tư | QA-MAT-* (2 bản ghi cùng mã, id 34 & 36), QA-MM-* | Bằng chứng BUG-007/026; có giao dịch kho |
| Khách hàng | QA-CUS-* | Đã khoá (DELETE = khoá mềm) |
| Thông báo | Tiêu đề bắt đầu bằng `QA` | |
| Danh mục / cước / mẫu tin / người dùng QA | Đã xoá (mềm) sau test | |
| Block BLOCK_R | Đã khôi phục 8/4/4 ACTIVE | |

Dữ liệu trùng có sẵn (không do QA tạo): **TGBU3719842** có 2 hồ sơ đang hoạt động (id 58, 59).

## 8. Chi tiết toàn bộ test case

| ID | Module | Test Case | Result | Severity | Bug |
|---|---|---|---|---|---|
| TC-001 | Authentication | Đăng nhập đúng — admin (ADMIN) | PASS | - | - |
| TC-002 | Authentication | Đăng nhập đúng — surveyor (SURVEYOR) | PASS | - | - |
| TC-003 | Authentication | Đăng nhập đúng — operator (GATE_OP) | PASS | - | - |
| TC-004 | Authentication | Đăng nhập đúng — accountant (CASHIER) | PASS | - | - |
| TC-005 | Authentication | Đăng nhập đúng — estimator (ESTIMATOR) | PASS | - | - |
| TC-006 | Authentication | Đăng nhập đúng — maersk (CARRIER) | PASS | - | - |
| TC-007 | Authentication | Đăng nhập đúng — repair (TECHNICIAN) | PASS | - | - |
| TC-008 | Authentication | Đăng nhập đúng — qc (QC_ENG) | PASS | - | - |
| TC-009 | Authentication | Đăng nhập đúng — forklift (FORKLIFT) | PASS | - | - |
| TC-010 | Authentication | Đăng nhập đúng — cleaning (CLEANING) | PASS | - | - |
| TC-011 | Authentication | Đăng nhập bằng email thay cho username | PASS | - | - |
| TC-012 | Authentication | Sai mật khẩu với tài khoản có thật | PASS | - | - |
| TC-013 | Authentication | Username không tồn tại — thông báo giống sai mật khẩu (không lộ user tồn tại) | PASS | - | - |
| TC-014 | Authentication | Bỏ trống username | PASS | - | - |
| TC-015 | Authentication | Bỏ trống password | PASS | - | - |
| TC-016 | Authentication | Username/password = null | PASS | - | - |
| TC-017 | Authentication | Body rỗng | PASS | - | - |
| TC-018 | Authentication | JSON sai định dạng | PASS | - | - |
| TC-019 | Authentication | Chuỗi dạng SQL injection ở form đăng nhập | PASS | - | - |
| TC-020 | Authentication | Username/password 10.000 ký tự | PASS | - | - |
| TC-021 | Authentication | Khoá tạm sau nhiều lần sai (chính sách MaxFailedAttempts) | PASS | - | - |
| TC-022 | Authentication | Gọi API không có token | PASS | - | - |
| TC-023 | Authentication | Token rác | PASS | - | - |
| TC-024 | Authentication | Token alg=none giả quyền ADMIN | PASS | - | - |
| TC-025 | Authentication | Sửa payload token (giữ chữ ký cũ) | PASS | - | - |
| TC-026 | Authentication | Token hết hạn (exp quá 10 phút) | PASS | - | - |
| TC-027 | Authentication | Thời hạn token | PASS | - | - |
| TC-028 | Authentication | Sau khi đăng xuất, token cũ không dùng được nữa | FAIL | Medium | [BUG-011](bug-report.md#bug-011) |
| TC-029 | Authentication | API POST /api/auth/refresh-token (frontend authApi khai báo) | FAIL | Low | [BUG-030](bug-report.md#bug-030) |
| TC-030 | Authentication | API GET /api/auth/me (frontend authApi khai báo) | FAIL | Low | [BUG-030](bug-report.md#bug-030) |
| TC-031 | Phân quyền (RBAC) | surveyor (SURVEYOR) gọi GET /api/system/users (chỉ ADMIN) | PASS | - | - |
| TC-032 | Phân quyền (RBAC) | operator (GATE_OP) gọi GET /api/system/users (chỉ ADMIN) | PASS | - | - |
| TC-033 | Phân quyền (RBAC) | accountant (CASHIER) gọi GET /api/system/users (chỉ ADMIN) | PASS | - | - |
| TC-034 | Phân quyền (RBAC) | estimator (ESTIMATOR) gọi GET /api/system/users (chỉ ADMIN) | PASS | - | - |
| TC-035 | Phân quyền (RBAC) | maersk (CARRIER) gọi GET /api/system/users (chỉ ADMIN) | PASS | - | - |
| TC-036 | Phân quyền (RBAC) | repair (TECHNICIAN) gọi GET /api/system/users (chỉ ADMIN) | PASS | - | - |
| TC-037 | Phân quyền (RBAC) | qc (QC_ENG) gọi GET /api/system/users (chỉ ADMIN) | PASS | - | - |
| TC-038 | Phân quyền (RBAC) | forklift (FORKLIFT) gọi GET /api/system/users (chỉ ADMIN) | PASS | - | - |
| TC-039 | Phân quyền (RBAC) | cleaning (CLEANING) gọi GET /api/system/users (chỉ ADMIN) | PASS | - | - |
| TC-040 | Phân quyền (RBAC) | forklift tạo tài khoản ADMIN qua POST /api/system/users | PASS | - | - |
| TC-041 | Phân quyền (RBAC) | GET /api/system/users không trả mật khẩu tạm / token / hash | PASS | - | - |
| TC-042 | Phân quyền (RBAC) | forklift (FORKLIFT) xem công nợ hãng tàu — GET /api/billing/debts | FAIL | Critical | [BUG-001](bug-report.md#bug-001) |
| TC-043 | Phân quyền (RBAC) | cleaning (CLEANING) xem thanh toán công nợ — GET /api/billing/payments | FAIL | Critical | [BUG-001](bug-report.md#bug-001) |
| TC-044 | Phân quyền (RBAC) | maersk (CARRIER) xem công nợ của MỌI hãng tàu (tài khoản hãng tàu CARRIER) — GET /api/billing/debts | FAIL | Critical | [BUG-001](bug-report.md#bug-001) |
| TC-045 | Phân quyền (RBAC) | surveyor (SURVEYOR) xem báo cáo doanh thu/analytics — GET /api/reports/analytics | FAIL | Critical | [BUG-001](bug-report.md#bug-001) |
| TC-046 | Phân quyền (RBAC) | forklift (FORKLIFT) xem tồn kho vật tư — GET /api/warehouse/stock-balances | FAIL | Critical | [BUG-001](bug-report.md#bug-001) |
| TC-047 | Phân quyền (RBAC) | forklift (FORKLIFT) sửa danh mục Mã hư hỏng — PUT /api/MasterData/catalog/{id} | FAIL | Critical | [BUG-001](bug-report.md#bug-001) |
| TC-048 | Phân quyền (RBAC) | cleaning (CLEANING) xoá danh mục — DELETE /api/MasterData/catalog/{id} | FAIL | Critical | [BUG-001](bug-report.md#bug-001) |
| TC-049 | Phân quyền (RBAC) | maersk (CARRIER — đại diện hãng tàu) tạo biểu cước nâng hạ của Depot | FAIL | Critical | [BUG-001](bug-report.md#bug-001) |
| TC-060 | Gate-In (validation) | Số container bỏ trống | PASS | - | - |
| TC-061 | Gate-In (validation) | Số container sai check-digit | PASS | - | - |
| TC-062 | Gate-In (validation) | Số container 10 ký tự | PASS | - | - |
| TC-063 | Gate-In (validation) | Số container có ký tự đặc biệt | PASS | - | - |
| TC-064 | Gate-In (validation) | Loại container không có trong danh mục | PASS | - | - |
| TC-065 | Gate-In (validation) | Loại container bỏ trống | PASS | - | - |
| TC-066 | Gate-In (validation) | Hãng tàu không tồn tại | PASS | - | - |
| TC-067 | Gate-In (validation) | Tare weight âm | PASS | - | - |
| TC-068 | Gate-In (validation) | Tare weight = 0 | PASS | - | - |
| TC-069 | Gate-In (validation) | Max payload âm | PASS | - | - |
| TC-070 | Gate-In (validation) | Biển số xe bỏ trống | PASS | - | - |
| TC-071 | Gate-In (validation) | Tên tài xế bỏ trống | PASS | - | - |
| TC-072 | Gate-In (validation) | SĐT tài xế sai định dạng (chữ) | FAIL | Low | [BUG-025](bug-report.md#bug-025) |
| TC-073 | Gate-In (validation) | Tên tài xế 1.000 ký tự | FAIL | Low | [BUG-025](bug-report.md#bug-025) |
| TC-074 | Gate-In (validation) | gateInStaffId không tồn tại | PASS | - | - |
| TC-075 | Luồng nghiệp vụ Container | Gate-In hợp lệ (số container chữ thường + khoảng trắng được chuẩn hoá) | PASS | - | - |
| TC-076 | Luồng nghiệp vụ Container | Đọc lại hồ sơ vừa Gate-In — dữ liệu khớp | PASS | - | - |
| TC-077 | Luồng nghiệp vụ Container | Gate-In sinh JobNo + e-EIR nhập | PASS | - | - |
| TC-078 | Gate-In (validation) | Gate-In trùng container đang trong bãi | PASS | - | - |
| TC-079 | Gate-In (validation) | Gửi Gate-In 2 lần đồng thời (double submit) cùng số container | PASS | - | - |
| TC-080 | Luồng nghiệp vụ Container | Duyệt báo giá khi chưa giám định/chưa có báo giá (trạng thái SURVEYING) | PASS | - | - |
| TC-081 | Luồng nghiệp vụ Container | Lập báo giá khi chưa giám định (trạng thái SURVEYING) | PASS | - | - |
| TC-082 | Luồng nghiệp vụ Container | Bắt đầu sửa chữa khi chưa duyệt (trạng thái SURVEYING) | PASS | - | - |
| TC-083 | Luồng nghiệp vụ Container | Hoàn tất QC khi chưa sửa (trạng thái SURVEYING) | PASS | - | - |
| TC-084 | Luồng nghiệp vụ Container | Gate-Out khi container chưa sẵn sàng (trạng thái SURVEYING) | PASS | - | - |
| TC-085 | Luồng nghiệp vụ Container | PATCH /status nhảy thẳng GATE_IN/SURVEYING → READY_FOR_OUT (bỏ qua giám định/QC), gọi bằng tài khoản FORKLIFT | FAIL | High | [BUG-003](bug-report.md#bug-003) |
| TC-086 | Luồng nghiệp vụ Container | PATCH /status với trạng thái không tồn tại | PASS | - | - |
| TC-087 | Luồng nghiệp vụ Container | Gate-Out container chưa từng giám định/QC sau khi bị PATCH status | FAIL | High | [BUG-003](bug-report.md#bug-003) |
| TC-088 | Luồng nghiệp vụ Container | Giám định viên nhận việc (claim) | PASS | - | - |
| TC-089 | Luồng nghiệp vụ Container | Người thứ 2 nhận trùng việc giám định đã có người nhận | PASS | - | - |
| TC-090 | Luồng nghiệp vụ Container | Nộp giám định với ConditionRating không hợp lệ | FAIL | Low | [BUG-023](bug-report.md#bug-023) |
| TC-091 | Luồng nghiệp vụ Container | Nộp giám định có hư hỏng số lượng/giờ công/chi phí âm | FAIL | Low | [BUG-023](bug-report.md#bug-023) |
| TC-092 | Luồng nghiệp vụ Container | Nộp giám định hợp lệ (hạng C + 1 hư hỏng) → ESTIMATING | PASS | - | - |
| TC-093 | Luồng nghiệp vụ Container | Lập báo giá tổng tiền âm | PASS | - | - |
| TC-094 | Luồng nghiệp vụ Container | Báo giá GrandTotal không khớp tổng các hạng mục (999 vs 440.000) | FAIL | Medium | [BUG-008](bug-report.md#bug-008) |
| TC-095 | Luồng nghiệp vụ Container | Lập báo giá hợp lệ | PASS | - | - |
| TC-096 | Luồng nghiệp vụ Container | Từ chối báo giá không nhập lý do | PASS | - | - |
| TC-097 | Luồng nghiệp vụ Container | Hãng tàu duyệt báo giá | PASS | - | - |
| TC-098 | Luồng nghiệp vụ Container | Duyệt lại báo giá đã duyệt (lần 2) | PASS | - | - |
| TC-099 | Luồng nghiệp vụ Container | Bắt đầu sửa chữa | PASS | - | - |
| TC-100 | Luồng nghiệp vụ Container | Bắt đầu sửa chữa lần 2 | FAIL | Medium | [BUG-009](bug-report.md#bug-009) |
| TC-101 | Luồng nghiệp vụ Container | Hoàn tất sửa chữa không có ảnh sau sửa | PASS | - | - |
| TC-102 | Luồng nghiệp vụ Container | QC không đạt → quay lại REPAIRING | PASS | - | - |
| TC-103 | Luồng nghiệp vụ Container | QC đạt → READY_FOR_OUT (hoặc CLEANING nếu còn vệ sinh) | PASS | - | - |
| TC-104 | Luồng nghiệp vụ Container | qc-complete: id trên URL khác JobId trong body | PASS | - | - |
| TC-105 | Luồng nghiệp vụ Container | Gate-Out thiếu biển số/tài xế | PASS | - | - |
| TC-106 | Luồng nghiệp vụ Container | Gate-Out hợp lệ → GATE_OUT + e-EIR xuất | PASS | - | - |
| TC-107 | Luồng nghiệp vụ Container | Gate-Out lần 2 cùng container | PASS | - | - |
| TC-108 | Luồng nghiệp vụ Container | Gate-In lại container đã Gate-Out (vòng đời mới) | PASS | - | - |
| TC-109 | Luồng nghiệp vụ Container | Lịch sử (audit log) ghi đủ các bước | PASS | - | - |
| TC-110 | Gate-In (validation) | Race condition: 3 request Gate-In đồng thời cùng số container, lặp 6 lần | FAIL | High | [BUG-004](bug-report.md#bug-004) |
| TC-111 | Master Data — Danh mục (catalog) | Tạo mới hợp lệ | PASS | - | - |
| TC-112 | Master Data — Danh mục (catalog) | Tạo thiếu mã (code rỗng) | PASS | - | - |
| TC-113 | Master Data — Danh mục (catalog) | Tạo thiếu tên | PASS | - | - |
| TC-114 | Master Data — Danh mục (catalog) | Tạo trùng mã (khác hoa/thường) | PASS | - | - |
| TC-115 | Master Data — Danh mục (catalog) | Mã dài 83 ký tự (giới hạn cột 50) | PASS | - | - |
| TC-116 | Master Data — Danh mục (catalog) | CatalogType rỗng | PASS | - | - |
| TC-117 | Master Data — Danh mục (catalog) | Lưu tên chứa HTML/script (XSS) — backend lưu nguyên, giao diện phải escape | PASS | - | - |
| TC-118 | Master Data — Danh mục (catalog) | Đọc danh sách chứa bản ghi vừa tạo | PASS | - | - |
| TC-119 | Master Data — Danh mục (catalog) | Đọc catalogType không tồn tại | PASS | - | - |
| TC-120 | Master Data — Danh mục (catalog) | Sửa hợp lệ | PASS | - | - |
| TC-121 | Master Data — Danh mục (catalog) | Sửa sang mã trùng bản ghi khác | PASS | - | - |
| TC-122 | Master Data — Danh mục (catalog) | Sửa ID không tồn tại | PASS | - | - |
| TC-123 | Master Data — Danh mục (catalog) | Tạm ngưng (isActive=false) | PASS | - | - |
| TC-124 | Master Data — Danh mục (catalog) | Bản ghi tạm ngưng: ẩn ở danh sách nghiệp vụ, còn ở màn quản trị | PASS | - | - |
| TC-125 | Master Data — Danh mục (catalog) | Xoá | PASS | - | - |
| TC-126 | Master Data — Danh mục (catalog) | Xoá lại bản ghi đã xoá | PASS | - | - |
| TC-127 | Master Data — Danh mục (catalog) | Xoá ID không tồn tại | PASS | - | - |
| TC-128 | Master Data — Danh mục (catalog) | Tạo lại mã đã xoá → khôi phục đúng bản ghi cũ | PASS | - | - |
| TC-129 | Master Data — Danh mục (catalog) | Xoá loại container đang được hồ sơ container tham chiếu (40HC) | NOT TESTED | - | - |
| TC-130 | Master Data — Cước Nâng Hạ | Tạo mới hợp lệ | PASS | - | - |
| TC-131 | Master Data — Cước Nâng Hạ | Đơn giá âm | FAIL | Medium | [BUG-017](bug-report.md#bug-017) |
| TC-132 | Master Data — Cước Nâng Hạ | VAT = 150% | FAIL | Medium | [BUG-017](bug-report.md#bug-017) |
| TC-133 | Master Data — Cước Nâng Hạ | VAT âm | FAIL | Medium | [BUG-017](bug-report.md#bug-017) |
| TC-134 | Master Data — Cước Nâng Hạ | Trùng mã | PASS | - | - |
| TC-135 | Master Data — Cước Nâng Hạ | Mã 63 ký tự (giới hạn 40) | PASS | - | - |
| TC-136 | Master Data — Cước Nâng Hạ | Thiếu tên dịch vụ | PASS | - | - |
| TC-137 | Master Data — Cước Nâng Hạ | Sửa ID không tồn tại | PASS | - | - |
| TC-138 | Master Data — Cước Nâng Hạ | Xoá | PASS | - | - |
| TC-139 | Master Data — Cước Nâng Hạ | Xoá ID không tồn tại | PASS | - | - |
| TC-140 | Master Data — Cước Lưu Bãi | Tạo mới hợp lệ (2 bậc) | PASS | - | - |
| TC-141 | Master Data — Cước Lưu Bãi | Bậc có ToDay < FromDay | FAIL | Medium | [BUG-018](bug-report.md#bug-018) |
| TC-142 | Master Data — Cước Lưu Bãi | 2 bậc chồng lấn khoảng ngày (1-5 và 3-8) | FAIL | Medium | [BUG-018](bug-report.md#bug-018) |
| TC-143 | Master Data — Cước Lưu Bãi | Số ngày miễn phí âm | FAIL | Medium | [BUG-018](bug-report.md#bug-018) |
| TC-144 | Master Data — Cước Lưu Bãi | Không có bậc giá nào | FAIL | Medium | [BUG-018](bug-report.md#bug-018) |
| TC-145 | Master Data — Cước Lưu Bãi | Trùng mã | PASS | - | - |
| TC-146 | Master Data — Cước Lưu Bãi | Xoá | PASS | - | - |
| TC-147 | Khách hàng & Đối tác — Hãng tàu | Tạo hãng tàu hợp lệ | PASS | - | - |
| TC-148 | Khách hàng & Đối tác — Hãng tàu | Trùng mã hãng tàu | PASS | - | - |
| TC-149 | Khách hàng & Đối tác — Hãng tàu | Tên rỗng | PASS | - | - |
| TC-150 | Khách hàng & Đối tác — Hãng tàu | Email sai định dạng | FAIL | Low | [BUG-024](bug-report.md#bug-024) |
| TC-151 | Khách hàng & Đối tác — Hãng tàu | Xoá hãng tàu đang được hồ sơ container tham chiếu | NOT TESTED | - | - |
| TC-152 | Khách hàng & Đối tác — Hãng tàu | Xoá hãng tàu QA không được tham chiếu | PASS | - | - |
| TC-153 | Kho vật tư — Danh mục vật tư | Tạo vật tư hợp lệ | PASS | - | - |
| TC-154 | Kho vật tư — Danh mục vật tư | Đơn giá âm | PASS | - | - |
| TC-155 | Kho vật tư — Danh mục vật tư | Tồn kho tối thiểu > tối đa | FAIL | Low | [BUG-026](bug-report.md#bug-026) |
| TC-156 | Kho vật tư — Danh mục vật tư | Trùng mã vật tư | FAIL | High | [BUG-007](bug-report.md#bug-007) |
| TC-157 | Kho vật tư — Nhập/Xuất | Nhập kho 10 | PASS | - | - |
| TC-158 | Kho vật tư — Nhập/Xuất | Xuất kho 1.000 (vượt tồn 10) | PASS | - | - |
| TC-159 | Kho vật tư — Nhập/Xuất | Số lượng = 0 | PASS | - | - |
| TC-160 | Kho vật tư — Nhập/Xuất | Số lượng âm | PASS | - | - |
| TC-161 | Kho vật tư — Nhập/Xuất | Mã vật tư không tồn tại | FAIL | Medium | [BUG-019](bug-report.md#bug-019) |
| TC-162 | Kho vật tư — Nhập/Xuất | Loại giao dịch không hợp lệ | FAIL | Medium | [BUG-019](bug-report.md#bug-019) |
| TC-163 | Kho vật tư — Nhập/Xuất | Tồn kho sau các giao dịch không âm | PASS | - | - |
| TC-164 | Khách hàng & Đối tác — Khách hàng | Tạo khách hàng hợp lệ | PASS | - | - |
| TC-165 | Khách hàng & Đối tác — Khách hàng | Trùng mã khách hàng | PASS | - | - |
| TC-166 | Khách hàng & Đối tác — Khách hàng | Email sai định dạng | FAIL | Low | [BUG-024](bug-report.md#bug-024) |
| TC-167 | Khách hàng & Đối tác — Khách hàng | Hạn mức công nợ âm | FAIL | Medium | [BUG-020](bug-report.md#bug-020) |
| TC-168 | Khách hàng & Đối tác — Khách hàng | Tên khách hàng rỗng | PASS | - | - |
| TC-169 | Khách hàng & Đối tác — Khách hàng | Thêm tài xế | PASS | - | - |
| TC-170 | Khách hàng & Đối tác — Khách hàng | Thêm tài xế cho khách hàng không tồn tại | FAIL | Medium | [BUG-020](bug-report.md#bug-020) |
| TC-171 | Khách hàng & Đối tác — Khách hàng | Thêm phương tiện | PASS | - | - |
| TC-172 | Khách hàng & Đối tác — Khách hàng | Trùng biển số xe | PASS | - | - |
| TC-173 | Khách hàng & Đối tác — Khách hàng | Tải trọng xe âm | FAIL | Medium | [BUG-020](bug-report.md#bug-020) |
| TC-174 | Khách hàng & Đối tác — Khách hàng | Thêm tài khoản cổng khách hàng | PASS | - | - |
| TC-175 | Khách hàng & Đối tác — Khách hàng | Trùng username cổng khách hàng | PASS | - | - |
| TC-176 | Khách hàng & Đối tác — Khách hàng | Thêm booking | PASS | - | - |
| TC-177 | Khách hàng & Đối tác — Khách hàng | Booking hạn dùng trước ngày phát hành | PASS | - | - |
| TC-178 | Khách hàng & Đối tác — Khách hàng | Booking số lượng container = 0 | PASS | - | - |
| TC-179 | Khách hàng & Đối tác — Khách hàng | Booking đã dùng > tổng số | PASS | - | - |
| TC-180 | Khách hàng & Đối tác — Khách hàng | Xoá khách hàng còn tài xế/xe/tài khoản/booking | PASS | - | - |
| TC-181 | Hệ thống — Người dùng (RBAC) | Tạo người dùng hợp lệ | PASS | - | - |
| TC-182 | Hệ thống — Người dùng (RBAC) | Tạo người dùng trả mật khẩu tạm 1 lần | PASS | - | - |
| TC-183 | Hệ thống — Người dùng (RBAC) | Trùng username | PASS | - | - |
| TC-184 | Hệ thống — Người dùng (RBAC) | Email sai định dạng | FAIL | Low | [BUG-024](bug-report.md#bug-024) |
| TC-185 | Hệ thống — Người dùng (RBAC) | Vai trò không tồn tại | PASS | - | - |
| TC-186 | Hệ thống — Người dùng (RBAC) | Username rỗng | PASS | - | - |
| TC-187 | Hệ thống — Người dùng (RBAC) | Đặt lại mật khẩu yếu ("1") | PASS | - | - |
| TC-188 | Hệ thống — Người dùng (RBAC) | Đặt lại mật khẩu mạnh | PASS | - | - |
| TC-189 | Hệ thống — Người dùng (RBAC) | Đăng nhập bằng mật khẩu mới | PASS | - | - |
| TC-190 | Hệ thống — Người dùng (RBAC) | Xoá người dùng | PASS | - | - |
| TC-191 | Hệ thống — Người dùng (RBAC) | Người dùng đã xoá không đăng nhập được | PASS | - | - |
| TC-192 | Hệ thống — Người dùng (RBAC) | Admin tự xoá chính mình | NOT TESTED | - | - |
| TC-193 | Hệ thống — Người dùng (RBAC) | Audit log ghi nhận tạo/xoá/đặt lại mật khẩu người dùng | FAIL | Medium | [BUG-010](bug-report.md#bug-010) |
| TC-194 | Thông báo — Mẫu tin | Tạo mẫu tin hợp lệ | PASS | - | - |
| TC-195 | Thông báo — Mẫu tin | Trùng mã mẫu tin | PASS | - | - |
| TC-196 | Thông báo — Mẫu tin | Nội dung rỗng | FAIL | Low | [BUG-027](bug-report.md#bug-027) |
| TC-197 | Thông báo — Mẫu tin | Sửa mẫu không tồn tại | PASS | - | - |
| TC-198 | Thông báo — Mẫu tin | Xoá mẫu tin | PASS | - | - |
| TC-199 | Dữ liệu — Nhất quán số liệu | Số container trong bãi: Danh sách hồ sơ vs Thống kê Dashboard vs Sơ đồ bãi | PASS | - | - |
| TC-201 | Dữ liệu — Nhất quán số liệu | Không có hồ sơ mang trạng thái ngoài danh sách chuẩn | PASS | - | - |
| TC-202 | Dữ liệu — Nhất quán số liệu | Không có 2 hồ sơ đang hoạt động cho cùng 1 số container | FAIL | High | [BUG-004](bug-report.md#bug-004) |
| TC-203 | Dữ liệu — Nhất quán số liệu | Hồ sơ READY_FOR_OUT/GATE_OUT đều đã qua giám định | FAIL | High | [BUG-003](bug-report.md#bug-003) |
| TC-204 | Hiệu năng | GET /api/DepotJobs trả toàn bộ 58 hồ sơ, không phân trang | FAIL | Low | [BUG-034](bug-report.md#bug-034) |
| TC-205 | Tìm kiếm / Lọc — Danh sách container | Tìm chính xác số container | PASS | - | - |
| TC-206 | Tìm kiếm / Lọc — Danh sách container | Tìm một phần số container | PASS | - | - |
| TC-207 | Tìm kiếm / Lọc — Danh sách container | Tìm không phân biệt hoa/thường | PASS | - | - |
| TC-208 | Tìm kiếm / Lọc — Danh sách container | Tìm giá trị không tồn tại → rỗng | PASS | - | - |
| TC-209 | Tìm kiếm / Lọc — Danh sách container | Tìm ký tự đặc biệt "%" | PASS | - | - |
| TC-210 | Tìm kiếm / Lọc — Danh sách container | Tìm ký tự đặc biệt "_" | PASS | - | - |
| TC-211 | Tìm kiếm / Lọc — Danh sách container | Tìm ký tự đặc biệt "'" | PASS | - | - |
| TC-212 | Tìm kiếm / Lọc — Danh sách container | Tìm ký tự đặc biệt "\\" | PASS | - | - |
| TC-213 | Tìm kiếm / Lọc — Danh sách container | Tìm ký tự đặc biệt "<script>" | PASS | - | - |
| TC-214 | Tìm kiếm / Lọc — Danh sách container | Tìm ký tự đặc biệt "%' OR 1=1 --" | PASS | - | - |
| TC-215 | Tìm kiếm / Lọc — Danh sách container | Lọc theo trạng thái | PASS | - | - |
| TC-216 | Tìm kiếm / Lọc — Danh sách container | Lọc theo hãng tàu | PASS | - | - |
| TC-217 | Tìm kiếm / Lọc — Danh sách container | Kết hợp nhiều điều kiện lọc | PASS | - | - |
| TC-218 | Tìm kiếm / Lọc — Danh sách container | Lọc trạng thái không tồn tại | PASS | - | - |
| TC-219 | Tìm kiếm / Lọc — Danh sách container | Phân trang / sắp xếp phía server (page, pageSize, sort) | NOT TESTED | - | - |
| TC-220 | API — Đọc chi tiết | GET /api/DepotJobs/999999999 | PASS | - | - |
| TC-221 | API — Đọc chi tiết | GET /api/DepotJobs/abc | PASS | - | - |
| TC-222 | API — Đọc chi tiết | GET /api/DepotJobs/-1 | PASS | - | - |
| TC-223 | API — Đọc chi tiết | GET /api/cleaning/999999999 | PASS | - | - |
| TC-224 | API — Đọc chi tiết | GET /api/yard/containers/999999999 | PASS | - | - |
| TC-225 | API — Đọc chi tiết | GET /api/DepotJobs/999999999/history | FAIL | Low | [BUG-029](bug-report.md#bug-029) |
| TC-226 | Dữ liệu — Nhất quán số liệu | Dashboard "Tồn Bãi Hiện Tại" (reports/kpi.activeJobs) = số hồ sơ chưa Gate-Out | PASS | - | - |
| TC-227 | Upload file | Upload ảnh JPG hợp lệ | PASS | - | - |
| TC-228 | Upload file | Upload ảnh PNG hợp lệ | PASS | - | - |
| TC-229 | Upload file | Từ chối: File .exe | PASS | - | - |
| TC-230 | Upload file | Từ chối: File .html (XSS) | PASS | - | - |
| TC-231 | Upload file | Từ chối: File .svg (có script) | PASS | - | - |
| TC-232 | Upload file | Từ chối: File .exe đổi đuôi thành .jpg | PASS | - | - |
| TC-233 | Upload file | Từ chối: Tên file chứa ../ (path traversal) | PASS | - | - |
| TC-234 | Upload file | Từ chối: File rỗng 0 byte | PASS | - | - |
| TC-235 | Upload file | Từ chối file 21 MB (giới hạn 20 MB) | PASS | - | - |
| TC-236 | Upload file | Upload gắn vào hồ sơ (IdTable) không tồn tại | FAIL | Low | [BUG-028](bug-report.md#bug-028) |
| TC-237 | Upload file | Upload với TableName tuỳ ý | FAIL | Low | [BUG-028](bug-report.md#bug-028) |
| TC-238 | Bảo mật | Tải ảnh đã upload KHÔNG cần đăng nhập (qua /api/files/*) | FAIL | Medium | [BUG-013](bug-report.md#bug-013) |
| TC-239 | Phân quyền (RBAC) | forklift xoá ảnh giám định do surveyor upload | FAIL | Critical | [BUG-001](bug-report.md#bug-001) |
| TC-240 | Upload file | Upload ảnh sau sửa cho hồ sơ đang REPAIRING | PASS | - | - |
| TC-241 | Upload file | Upload ảnh sau sửa với itemNo = 0 | PASS | - | - |
| TC-242 | Upload file | Upload ảnh sau sửa cho hồ sơ chưa sửa chữa | PASS | - | - |
| TC-243 | Bảo mật | CORS backend với Origin lạ | FAIL | Low | [BUG-031](bug-report.md#bug-031) |
| TC-244 | Bảo mật | Lỗi không lộ chi tiết kỹ thuật (stack trace / tên lớp .NET) | PASS | - | - |
| TC-245 | Bảo mật | Thao tác trên ID không tồn tại trả 400/404 (không 500) | PASS | - | - |
| TC-246 | Bảo mật | Nhận việc giám định thay người khác (gửi staffId của user khác) | FAIL | Medium | [BUG-012](bug-report.md#bug-012) |
| TC-247 | Bảo mật | Header bảo mật HTTP (CSP, X-Frame-Options, X-Content-Type-Options) | FAIL | Low | [BUG-031](bug-report.md#bug-031) |
| TC-248 | Môi trường | Hiển thị ảnh đã upload trên giao diện local (cổng 3000) | BLOCKED | - | - |
| TC-249 | Authentication (UI) | Đăng nhập đúng trên giao diện → vào Dashboard | PASS | - | - |
| TC-250 | Authentication (UI) | F5 sau khi đăng nhập vẫn giữ phiên | PASS | - | - |
| TC-251 | Authentication (UI) | Token hết hạn/không hợp lệ giữa phiên → tự quay về màn đăng nhập | PASS | - | - |
| TC-252 | Authentication (UI) | Đăng xuất → về màn đăng nhập, xoá token phía trình duyệt | PASS | - | - |
| TC-253 | Authentication (UI) | Bấm Back sau khi đăng xuất không vào lại được | PASS | - | - |
| TC-254 | Xử lý lỗi (UI) | API trả 500 khi mở Danh mục Mã hư hỏng | FAIL | Medium | [BUG-016](bug-report.md#bug-016) |
| TC-255 | Xử lý lỗi (UI) | API trả 403 khi mở Kho vật tư | FAIL | Medium | [BUG-016](bug-report.md#bug-016) |
| TC-256 | Xử lý lỗi (UI) | Mất mạng khi mở Công nợ hãng tàu | FAIL | Medium | [BUG-016](bug-report.md#bug-016) |
| TC-257 | Xử lý lỗi (UI) | API chậm 6 giây — có trạng thái đang tải | FAIL | Low | [BUG-032](bug-report.md#bug-032) |
| TC-258 | Gate-In (UI) | Bấm Xác nhận khi form trống → báo lỗi, không gửi API | PASS | - | - |
| TC-259 | Gate-In (UI) | Double-click nút Xác nhận tiếp nhận chỉ gửi 1 request | PASS | - | - |
| TC-260 | Bảo mật | Dữ liệu chứa HTML/JS hiển thị an toàn (không thực thi) ở danh mục | PASS | - | - |
| TC-261 | Tìm kiếm / Lọc (UI) | Ô tìm kiếm Danh sách container lọc đúng | PASS | - | - |
| TC-262 | Tìm kiếm / Lọc (UI) | Tìm không có kết quả → hiện thông báo rỗng | PASS | - | - |
| TC-263 | Tìm kiếm / Lọc (UI) | Xoá từ khoá → hiện lại đầy đủ | PASS | - | - |
| TC-264 | Tìm kiếm / Lọc (UI) | Phân trang ở Danh sách container | PASS | - | - |
| TC-265 | Tải xuống (UI) | Xuất file ở Danh sách container | NOT TESTED | - | - |
| TC-266 | Tải xuống (UI) | Xuất CSV DM Loại Container | PASS | - | - |
| TC-267 | Giao diện | Tiêu đề trang Master Data đọc được | FAIL | Low | [BUG-033](bug-report.md#bug-033) |
| TC-268 | Giao diện | Nhãn bộ lọc hãng tàu ở Công nợ | FAIL | Low | [BUG-033](bug-report.md#bug-033) |
| TC-269 | Phân quyền (RBAC) | Tài khoản FORKLIFT mở màn Phân quyền RBAC (chỉ ADMIN) | FAIL | High | [BUG-002](bug-report.md#bug-002) |
| TC-270 | Phân quyền (RBAC) | Menu Sidebar lọc theo quyền của vai trò (allowedTabs) | FAIL | High | [BUG-002](bug-report.md#bug-002) |
| TC-271 | Thông báo — Zalo | Mở màn Cấu Hình Zalo OA & Token | FAIL | High | [BUG-005](bug-report.md#bug-005) |
| TC-272 | Hiệu năng | Số lần gọi API khi mở mỗi màn (dev) | PASS | - | - |
| TC-273 | Giao diện (Mobile 390px) | Quét 55 menu trên màn hình điện thoại | PASS | - | - |
| TC-274 | Khai thác — Phiếu dịch vụ & Thanh toán | Tạo phiếu dịch vụ hợp lệ | PASS | - | - |
| TC-275 | Khai thác — Phiếu dịch vụ & Thanh toán | Phiếu dịch vụ số lượng/đơn giá âm | PASS | - | - |
| TC-276 | Khai thác — Phiếu dịch vụ & Thanh toán | Phiếu dịch vụ không có dòng dịch vụ | PASS | - | - |
| TC-277 | Khai thác — Phiếu dịch vụ & Thanh toán | Phiếu dịch vụ cho hồ sơ không tồn tại | PASS | - | - |
| TC-278 | Khai thác — Phiếu dịch vụ & Thanh toán | Tổng tiền phiếu = đơn giá × SL × (1+VAT) | PASS | - | - |
| TC-279 | Khai thác — Phiếu dịch vụ & Thanh toán | Thanh toán sai số tiền (1 đ) | PASS | - | - |
| TC-280 | Khai thác — Phiếu dịch vụ & Thanh toán | Thanh toán số tiền âm | PASS | - | - |
| TC-281 | Khai thác — Phiếu dịch vụ & Thanh toán | Thanh toán đúng số tiền | PASS | - | - |
| TC-282 | Khai thác — Phiếu dịch vụ & Thanh toán | Thanh toán lần 2 phiếu đã thanh toán | PASS | - | - |
| TC-283 | Khai thác — Phiếu dịch vụ & Thanh toán | Thanh toán không làm mất trạng thái nghiệp vụ của hồ sơ | PASS | - | - |
| TC-284 | Khai thác — Phiếu dịch vụ & Thanh toán | Phiếu dịch vụ chuyển PAID sau thanh toán | PASS | - | - |
| TC-285 | Khai thác — Phiếu dịch vụ & Thanh toán | Huỷ phiếu dịch vụ đã thanh toán | PASS | - | - |
| TC-286 | Khai thác — Phiếu dịch vụ & Thanh toán | Webhook ngân hàng với secret sai | PASS | - | - |
| TC-287 | Công nợ hãng tàu (Billing) | Danh sách hồ sơ đủ điều kiện đồng bộ | PASS | - | - |
| TC-288 | Công nợ hãng tàu (Billing) | Đồng bộ công nợ với danh sách rỗng | PASS | - | - |
| TC-289 | Công nợ hãng tàu (Billing) | Ghi nhận thanh toán phân bổ vào khoản nợ không tồn tại | PASS | - | - |
| TC-290 | Công nợ hãng tàu (Billing) | Ghi nhận thanh toán số tiền âm | PASS | - | - |
| TC-291 | Công nợ hãng tàu (Billing) | Phân bổ thanh toán vượt số nợ còn lại | BLOCKED | - | - |
| TC-292 | Công nợ hãng tàu (Billing) | Xuất hoá đơn cho khoản nợ không tồn tại | PASS | - | - |
| TC-293 | Công nợ hãng tàu (Billing) | Chốt kỳ công nợ | NOT TESTED | - | - |
| TC-294 | Tổ Vệ sinh | Tiếp nhận vệ sinh hợp lệ | PASS | - | - |
| TC-295 | Tổ Vệ sinh | Tiếp nhận vệ sinh trùng container đang vệ sinh | PASS | - | - |
| TC-296 | Tổ Vệ sinh | Tiếp nhận vệ sinh số container không tồn tại | FAIL | Medium | [BUG-021](bug-report.md#bug-021) |
| TC-297 | Tổ Vệ sinh | Đơn giá dịch vụ vệ sinh âm | FAIL | Medium | [BUG-021](bug-report.md#bug-021) |
| TC-298 | Tổ Vệ sinh | Bàn giao khi chưa hoàn thành hạng mục | PASS | - | - |
| TC-299 | Tổ Vệ sinh | Hoàn thành tất cả hạng mục | PASS | - | - |
| TC-300 | Tổ Vệ sinh | Bàn giao sau khi hoàn thành | PASS | - | - |
| TC-301 | Tổ Vệ sinh | Bàn giao lần 2 | PASS | - | - |
| TC-302 | Bãi & Xe nâng | Cập nhật block: BayCount = 0 | FAIL | Medium | [BUG-022](bug-report.md#bug-022) |
| TC-303 | Bãi & Xe nâng | Cập nhật block: MaxTier âm | FAIL | Medium | [BUG-022](bug-report.md#bug-022) |
| TC-304 | Bãi & Xe nâng | Cập nhật block: Trạng thái không hợp lệ | FAIL | Medium | [BUG-022](bug-report.md#bug-022) |
| TC-305 | Bãi & Xe nâng | Di chuyển container vào ô đang có container khác | PASS | - | - |
| TC-306 | Bãi & Xe nâng | Di chuyển container tới vị trí không tồn tại | PASS | - | - |
| TC-307 | Thông báo — Gửi | Gửi thông báo hợp lệ | PASS | - | - |
| TC-308 | Thông báo — Gửi | Gửi thông báo nội dung rỗng | PASS | - | - |
| TC-309 | Thông báo — Gửi | Gửi thông báo tới người nhận không tồn tại | FAIL | Low | [BUG-027](bug-report.md#bug-027) |
| TC-310 | Thông báo — Gửi | Huỷ thông báo | PASS | - | - |
| TC-311 | Hiệu năng | GET /api/DepotJobs — median 5 lần | PASS | - | - |
| TC-312 | Hiệu năng | GET /api/yard/overview — median 5 lần | PASS | - | - |
| TC-313 | Hiệu năng | GET /api/reports/analytics — median 5 lần | PASS | - | - |
| TC-314 | Hiệu năng | GET /api/reports/staff-realtime — median 5 lần | PASS | - | - |
| TC-315 | Hiệu năng | GET /api/MasterData/all — median 5 lần | PASS | - | - |
| TC-316 | Hiệu năng | GET /api/billing/debts — median 5 lần | PASS | - | - |
| TC-317 | Hiệu năng | GET /api/warehouse/transactions — median 5 lần | PASS | - | - |
| TC-318 | Hiệu năng | GET /api/notifications — median 5 lần | PASS | - | - |
| TC-319 | Bãi & Xe nâng | Tài xế A nhận lệnh xe nâng (hồ sơ REPAIRING) | PASS | - | - |
| TC-320 | Bãi & Xe nâng | Tài xế B nhận cùng lệnh đã có người nhận | PASS | - | - |
| TC-321 | Bãi & Xe nâng | Tài xế B (không nhận lệnh) bấm Bắt đầu | PASS | - | - |
| TC-322 | Bãi & Xe nâng | Tài xế A bắt đầu lệnh nhưng gửi operatorId của người khác | PASS | - | - |
| TC-323 | Bãi & Xe nâng | Tài xế A huỷ nhận lệnh | PASS | - | - |
| TC-324 | VPS — Bảo mật | Gọi 144 API BackendApi không có token (ID dùng 999999999) | PASS | - | - |
| TC-325 | VPS — Bảo mật | Token giả / alg=none / chữ ký sai | PASS | - | - |
| TC-326 | VPS — Authentication | Đăng nhập sai/bỏ trống/null/JSON lỗi/SQLi/10.000 ký tự | PASS | - | - |
| TC-327 | VPS — Authentication | Khoá tạm sau 5 lần sai | PASS | - | - |
| TC-328 | VPS — Authentication | Double-click nút Đăng nhập | PASS | - | - |
| TC-329 | VPS — Authentication | Mở URL trực tiếp / giả phiên localStorage khi chưa đăng nhập | PASS | - | - |
| TC-330 | VPS — Bảo mật | Kết nối HTTPS | FAIL | High | [BUG-006](bug-report.md#bug-006) |
| TC-331 | VPS — Bảo mật | Header bảo mật HTTP | FAIL | Low | [BUG-031](bug-report.md#bug-031) |
| TC-332 | VPS — Bảo mật | Bundle JS không chứa mật khẩu / khoá bí mật | FAIL | Medium | [BUG-014](bug-report.md#bug-014) |
| TC-333 | VPS — Bảo mật | Tải ảnh /api/files/* không cần đăng nhập | FAIL | Medium | [BUG-013](bug-report.md#bug-013) |
| TC-334 | VPS — Hiệu năng | Thời gian tải trang lần đầu | FAIL | Medium | [BUG-015](bug-report.md#bug-015) |
| TC-335 | VPS — Giao diện | Màn đăng nhập trên điện thoại 375px | PASS | - | - |
| TC-336 | VPS — Chức năng | Test chức năng cần đăng nhập trên VPS | BLOCKED | - | - |
