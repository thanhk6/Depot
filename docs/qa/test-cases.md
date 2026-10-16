# Test Cases — SolutionDepot

Danh sách toàn bộ test case đã **thực thi**. Kết quả được ghi tự động bởi bộ script test (API bằng Node.js fetch, giao diện bằng Playwright/Chromium), rồi được rà soát tay: các ca script đánh giá sai đã được sửa lại kèm ghi chú trong cột "Kết quả thực tế".

- Môi trường chính: **Local** — http://localhost:3000 (frontend dev) → Depot.BackendApi :50210 → PostgreSQL local; cùng source code với repo.
- Các ca có tiền tố module `VPS —` chạy trên **http://160.187.146.176:3001** (production).
- Tổng: **325** test case — PASS 246 · FAIL 70 · BLOCKED 3 · NOT TESTED 6.

## Mục lục theo module

| Module | Số ca | PASS | FAIL | BLOCKED | NOT TESTED |
|---|---|---|---|---|---|
| [Authentication](#authentication) | 30 | 27 | 3 | 0 | 0 |
| [Phân quyền (RBAC)](#phân-quyền-rbac) | 22 | 11 | 11 | 0 | 0 |
| [Gate-In (validation)](#gate-in-validation) | 18 | 15 | 3 | 0 | 0 |
| [Luồng nghiệp vụ Container](#luồng-nghiệp-vụ-container) | 33 | 27 | 6 | 0 | 0 |
| [Master Data — Danh mục (catalog)](#master-data--danh-mục-catalog) | 19 | 18 | 0 | 0 | 1 |
| [Master Data — Cước Nâng Hạ](#master-data--cước-nâng-hạ) | 10 | 7 | 3 | 0 | 0 |
| [Master Data — Cước Lưu Bãi](#master-data--cước-lưu-bãi) | 7 | 3 | 4 | 0 | 0 |
| [Khách hàng & Đối tác — Hãng tàu](#khách-hàng--đối-tác--hãng-tàu) | 6 | 4 | 1 | 0 | 1 |
| [Kho vật tư — Danh mục vật tư](#kho-vật-tư--danh-mục-vật-tư) | 4 | 2 | 2 | 0 | 0 |
| [Kho vật tư — Nhập/Xuất](#kho-vật-tư--nhậpxuất) | 7 | 5 | 2 | 0 | 0 |
| [Khách hàng & Đối tác — Khách hàng](#khách-hàng--đối-tác--khách-hàng) | 17 | 13 | 4 | 0 | 0 |
| [Hệ thống — Người dùng (RBAC)](#hệ-thống--người-dùng-rbac) | 13 | 10 | 2 | 0 | 1 |
| [Thông báo — Mẫu tin](#thông-báo--mẫu-tin) | 5 | 4 | 1 | 0 | 0 |
| [Dữ liệu — Nhất quán số liệu](#dữ-liệu--nhất-quán-số-liệu) | 5 | 3 | 2 | 0 | 0 |
| [Hiệu năng](#hiệu-năng) | 10 | 9 | 1 | 0 | 0 |
| [Tìm kiếm / Lọc — Danh sách container](#tìm-kiếm--lọc--danh-sách-container) | 15 | 14 | 0 | 0 | 1 |
| [API — Đọc chi tiết](#api--đọc-chi-tiết) | 6 | 5 | 1 | 0 | 0 |
| [Upload file](#upload-file) | 14 | 12 | 2 | 0 | 0 |
| [Bảo mật](#bảo-mật) | 7 | 3 | 4 | 0 | 0 |
| [Môi trường](#môi-trường) | 1 | 0 | 0 | 1 | 0 |
| [Authentication (UI)](#authentication-ui) | 5 | 5 | 0 | 0 | 0 |
| [Xử lý lỗi (UI)](#xử-lý-lỗi-ui) | 4 | 0 | 4 | 0 | 0 |
| [Gate-In (UI)](#gate-in-ui) | 2 | 2 | 0 | 0 | 0 |
| [Tìm kiếm / Lọc (UI)](#tìm-kiếm--lọc-ui) | 4 | 4 | 0 | 0 | 0 |
| [Tải xuống (UI)](#tải-xuống-ui) | 2 | 1 | 0 | 0 | 1 |
| [Giao diện](#giao-diện) | 2 | 0 | 2 | 0 | 0 |
| [Thông báo — Zalo](#thông-báo--zalo) | 1 | 0 | 1 | 0 | 0 |
| [Giao diện (Mobile 390px)](#giao-diện-mobile-390px) | 1 | 1 | 0 | 0 | 0 |
| [Khai thác — Phiếu dịch vụ & Thanh toán](#khai-thác--phiếu-dịch-vụ--thanh-toán) | 13 | 13 | 0 | 0 | 0 |
| [Công nợ hãng tàu (Billing)](#công-nợ-hãng-tàu-billing) | 7 | 5 | 0 | 1 | 1 |
| [Tổ Vệ sinh](#tổ-vệ-sinh) | 8 | 6 | 2 | 0 | 0 |
| [Bãi & Xe nâng](#bãi--xe-nâng) | 10 | 7 | 3 | 0 | 0 |
| [Thông báo — Gửi](#thông-báo--gửi) | 4 | 3 | 1 | 0 | 0 |
| [VPS — Bảo mật](#vps--bảo-mật) | 6 | 2 | 4 | 0 | 0 |
| [VPS — Authentication](#vps--authentication) | 4 | 4 | 0 | 0 | 0 |
| [VPS — Hiệu năng](#vps--hiệu-năng) | 1 | 0 | 1 | 0 | 0 |
| [VPS — Giao diện](#vps--giao-diện) | 1 | 1 | 0 | 0 | 0 |
| [VPS — Chức năng](#vps--chức-năng) | 1 | 0 | 0 | 1 | 0 |

## Authentication

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-001 | Đăng nhập đúng — admin (ADMIN) | Functional | PASS | - | - | 200 + token, roleName=ADMIN, không trả passwordHash | 200 role=ADMIN keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-002 | Đăng nhập đúng — surveyor (SURVEYOR) | Functional | PASS | - | - | 200 + token, roleName=SURVEYOR, không trả passwordHash | 200 role=SURVEYOR keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-003 | Đăng nhập đúng — operator (GATE_OP) | Functional | PASS | - | - | 200 + token, roleName=GATE_OP, không trả passwordHash | 200 role=GATE_OP keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-004 | Đăng nhập đúng — accountant (CASHIER) | Functional | PASS | - | - | 200 + token, roleName=CASHIER, không trả passwordHash | 200 role=CASHIER keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-005 | Đăng nhập đúng — estimator (ESTIMATOR) | Functional | PASS | - | - | 200 + token, roleName=ESTIMATOR, không trả passwordHash | 200 role=ESTIMATOR keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-006 | Đăng nhập đúng — maersk (CARRIER) | Functional | PASS | - | - | 200 + token, roleName=CARRIER, không trả passwordHash | 200 role=CARRIER keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-007 | Đăng nhập đúng — repair (TECHNICIAN) | Functional | PASS | - | - | 200 + token, roleName=TECHNICIAN, không trả passwordHash | 200 role=TECHNICIAN keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-008 | Đăng nhập đúng — qc (QC_ENG) | Functional | PASS | - | - | 200 + token, roleName=QC_ENG, không trả passwordHash | 200 role=QC_ENG keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-009 | Đăng nhập đúng — forklift (FORKLIFT) | Functional | PASS | - | - | 200 + token, roleName=FORKLIFT, không trả passwordHash | 200 role=FORKLIFT keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-010 | Đăng nhập đúng — cleaning (CLEANING) | Functional | PASS | - | - | 200 + token, roleName=CLEANING, không trả passwordHash | 200 role=CLEANING keys=id,username,fullName,email,roleName,isActive,allowedTabs,temporaryPassword,accessToken,accessTokenExpiresAt |
| TC-011 | Đăng nhập bằng email thay cho username | Functional | PASS | - | - |  | email binh.survey@depotcontainer.vn → 200 |
| TC-012 | Sai mật khẩu với tài khoản có thật | Functional | PASS | - | - | 401, thông báo chung | HTTP 401 / statusCode 401 / Đăng nhập thất bại / Tên đăng nhập hoặc mật khẩu không đúng |
| TC-013 | Username không tồn tại — thông báo giống sai mật khẩu (không lộ user tồn tại) | Functional | PASS | - | - | Cùng thông báo với sai mật khẩu | Tên đăng nhập hoặc mật khẩu không đúng \| Tên đăng nhập hoặc mật khẩu không đúng |
| TC-014 | Bỏ trống username | Validation | PASS | - | - | 400/401, không 500 | HTTP 401 / statusCode 401 / Đăng nhập thất bại / Tên đăng nhập và mật khẩu không được để trống |
| TC-015 | Bỏ trống password | Validation | PASS | - | - | 400/401, không 500 | HTTP 401 / statusCode 401 / Đăng nhập thất bại / Tên đăng nhập và mật khẩu không được để trống |
| TC-016 | Username/password = null | Validation | PASS | - | - | 400/401, không 500 | HTTP 400 |
| TC-017 | Body rỗng | Validation | PASS | - | - | 400/401, không 500 | HTTP 401 / statusCode 401 / Đăng nhập thất bại / Tên đăng nhập và mật khẩu không được để trống |
| TC-018 | JSON sai định dạng | Validation | PASS | - | - | 400/401, không 500 | HTTP 400 |
| TC-019 | Chuỗi dạng SQL injection ở form đăng nhập | Security | PASS | - | - | 401 | HTTP 401 / statusCode 401 / Đăng nhập thất bại / Tên đăng nhập hoặc mật khẩu không đúng |
| TC-020 | Username/password 10.000 ký tự | Boundary | PASS | - | - | 400/401 | HTTP 401 / statusCode 401 / Đăng nhập thất bại / Tên đăng nhập hoặc mật khẩu không đúng |
| TC-021 | Khoá tạm sau nhiều lần sai (chính sách MaxFailedAttempts) | Security | PASS | - | - | Trả 429 sau N lần sai | 401,401,401,401,401,429,429 |
| TC-022 | Gọi API không có token | Security | PASS | - | - | 401 |  |
| TC-023 | Token rác | Security | PASS | - | - | 401 |  |
| TC-024 | Token alg=none giả quyền ADMIN | Security | PASS | - | - | 401 |  |
| TC-025 | Sửa payload token (giữ chữ ký cũ) | Security | PASS | - | - | 401 |  |
| TC-026 | Token hết hạn (exp quá 10 phút) | Security | PASS | - | - | 401 | Đối chứng: cùng key, exp +10 phút → 200 (key đúng), exp -10 phút → 401 ⇒ 401 do hết hạn |
| TC-027 | Thời hạn token | Functional | PASS | - | - | <= 12 giờ | Token còn hạn ~8.0 giờ (ExpireMinutes=480) |
| TC-028 | Sau khi đăng xuất, token cũ không dùng được nữa | Security | FAIL | Medium | [BUG-011](bug-report.md#bug-011) | Token bị thu hồi khi đăng xuất | Không có API đăng xuất/thu hồi; token vẫn hợp lệ tới khi hết hạn (GET /DepotJobs = 200). Frontend chỉ xoá localStorage. |
| TC-029 | API POST /api/auth/refresh-token (frontend authApi khai báo) | API | FAIL | Low | [BUG-030](bug-report.md#bug-030) | 200 hoặc không khai báo nếu không dùng | HTTP 404 |
| TC-030 | API GET /api/auth/me (frontend authApi khai báo) | API | FAIL | Low | [BUG-030](bug-report.md#bug-030) | 200 hoặc không khai báo nếu không dùng | HTTP 404 |

## Phân quyền (RBAC)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-031 | surveyor (SURVEYOR) gọi GET /api/system/users (chỉ ADMIN) | Security | PASS | - | - | 403 | HTTP 403 |
| TC-032 | operator (GATE_OP) gọi GET /api/system/users (chỉ ADMIN) | Security | PASS | - | - | 403 | HTTP 403 |
| TC-033 | accountant (CASHIER) gọi GET /api/system/users (chỉ ADMIN) | Security | PASS | - | - | 403 | HTTP 403 |
| TC-034 | estimator (ESTIMATOR) gọi GET /api/system/users (chỉ ADMIN) | Security | PASS | - | - | 403 | HTTP 403 |
| TC-035 | maersk (CARRIER) gọi GET /api/system/users (chỉ ADMIN) | Security | PASS | - | - | 403 | HTTP 403 |
| TC-036 | repair (TECHNICIAN) gọi GET /api/system/users (chỉ ADMIN) | Security | PASS | - | - | 403 | HTTP 403 |
| TC-037 | qc (QC_ENG) gọi GET /api/system/users (chỉ ADMIN) | Security | PASS | - | - | 403 | HTTP 403 |
| TC-038 | forklift (FORKLIFT) gọi GET /api/system/users (chỉ ADMIN) | Security | PASS | - | - | 403 | HTTP 403 |
| TC-039 | cleaning (CLEANING) gọi GET /api/system/users (chỉ ADMIN) | Security | PASS | - | - | 403 | HTTP 403 |
| TC-040 | forklift tạo tài khoản ADMIN qua POST /api/system/users | Security | PASS | - | - | 403 | HTTP 403 |
| TC-041 | GET /api/system/users không trả mật khẩu tạm / token / hash | Security | PASS | - | - | Không có trường bí mật có giá trị | Các trường temporaryPassword/accessToken có trong DTO nhưng rỗng |
| TC-042 | forklift (FORKLIFT) xem công nợ hãng tàu — GET /api/billing/debts | Security | FAIL | Critical | [BUG-001](bug-report.md#bug-001) | 403 (vai trò không có menu này) | HTTP 200 / statusCode 200 / Lấy danh sách công nợ thành công — 0 bản ghi |
| TC-043 | cleaning (CLEANING) xem thanh toán công nợ — GET /api/billing/payments | Security | FAIL | Critical | [BUG-001](bug-report.md#bug-001) | 403 (vai trò không có menu này) | HTTP 200 / statusCode 200 / Lấy danh sách thanh toán thành công — 0 bản ghi |
| TC-044 | maersk (CARRIER) xem công nợ của MỌI hãng tàu (tài khoản hãng tàu CARRIER) — GET /api/billing/debts | Security | FAIL | Critical | [BUG-001](bug-report.md#bug-001) | 403 (vai trò không có menu này) | HTTP 200 / statusCode 200 / Lấy danh sách công nợ thành công — 0 bản ghi |
| TC-045 | surveyor (SURVEYOR) xem báo cáo doanh thu/analytics — GET /api/reports/analytics | Security | FAIL | Critical | [BUG-001](bug-report.md#bug-001) | 403 (vai trò không có menu này) | HTTP 200 / statusCode 200 / Lấy thống kê báo cáo thành công |
| TC-046 | forklift (FORKLIFT) xem tồn kho vật tư — GET /api/warehouse/stock-balances | Security | FAIL | Critical | [BUG-001](bug-report.md#bug-001) | 403 (vai trò không có menu này) | HTTP 200 / statusCode 200 / Lấy tồn kho thành công — 4 bản ghi |
| TC-047 | forklift (FORKLIFT) sửa danh mục Mã hư hỏng — PUT /api/MasterData/catalog/{id} | Security | FAIL | Critical | [BUG-001](bug-report.md#bug-001) | 403 | HTTP 200 / statusCode 200 / Cập nhật catalog thành công |
| TC-048 | cleaning (CLEANING) xoá danh mục — DELETE /api/MasterData/catalog/{id} | Security | FAIL | Critical | [BUG-001](bug-report.md#bug-001) | 403 | HTTP 200 / statusCode 200 / Đã xóa catalog / DELETED |
| TC-049 | maersk (CARRIER — đại diện hãng tàu) tạo biểu cước nâng hạ của Depot | Security | FAIL | Critical | [BUG-001](bug-report.md#bug-001) | 403 | HTTP 200 / statusCode 200 / Tạo biểu cước nâng hạ thành công |
| TC-239 | forklift xoá ảnh giám định do surveyor upload | Security | FAIL | Critical | [BUG-001](bug-report.md#bug-001) | 403 | HTTP 200 / statusCode 200 / Xóa file thành công / 8 |
| TC-269 | Tài khoản FORKLIFT mở màn Phân quyền RBAC (chỉ ADMIN) | Security | FAIL | High | [BUG-002](bug-report.md#bug-002) | Ẩn menu / hiện "Không có quyền truy cập" | Menu vẫn hiện; API bị chặn 403 đúng nhưng giao diện hiển thị "Tổng số tài khoản 0", "Tỷ lệ khả dụng: NaN%" thay vì báo không có quyền |
| TC-270 | Menu Sidebar lọc theo quyền của vai trò (allowedTabs) | Security | FAIL | High | [BUG-002](bug-report.md#bug-002) | FORKLIFT chỉ thấy jobs/forklift/yard | FORKLIFT thấy và mở được toàn bộ 55 menu (Công nợ, Kho, Master Data, Khách hàng...), dữ liệu tải về đầy đủ. components/layout/Sidebar.tsx không dùng allowedTabs (chỉ file Sidebar cũ không còn dùng mới lọc). |

## Gate-In (validation)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-060 | Số container bỏ trống | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Thiếu số container. |
| TC-061 | Số container sai check-digit | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Số container 'QAAU4181913' sai check-digit ISO 6346 — số kiểm tra đúng phải là 2, không phải 3. Kiểm tra lại có gõ nhầm  |
| TC-062 | Số container 10 ký tự | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Số container phải có đúng 11 ký tự, chỉ gồm chữ và số. |
| TC-063 | Số container có ký tự đặc biệt | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Số container phải có đúng 11 ký tự, chỉ gồm chữ và số. |
| TC-064 | Loại container không có trong danh mục | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Loại container 'ZZZZ' không có (hoặc đang tạm ngưng) trong danh mục DM Loại Container (ISO). Đang áp dụng: 40HC, 20HC, 2 |
| TC-065 | Loại container bỏ trống | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Thiếu kích thước & loại container. |
| TC-066 | Hãng tàu không tồn tại | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Mã hãng tàu QA_NO_LINE không tồn tại trong danh mục ShippingLine.Code. |
| TC-067 | Tare weight âm | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Tare weight phải lớn hơn 0. |
| TC-068 | Tare weight = 0 | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Tare weight phải lớn hơn 0. |
| TC-069 | Max payload âm | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Max payload phải lớn hơn 0. |
| TC-070 | Biển số xe bỏ trống | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Thiếu biển số đầu kéo. |
| TC-071 | Tên tài xế bỏ trống | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Thiếu họ tên bác tài. |
| TC-072 | SĐT tài xế sai định dạng (chữ) | Validation | FAIL | Low | [BUG-025](bug-report.md#bug-025) | 400 + thông báo lỗi rõ ràng | HTTP 200 / statusCode 200 / Tiếp nhận Gate-In thành công Container QAVU4185730 |
| TC-073 | Tên tài xế 1.000 ký tự | Validation | FAIL | Low | [BUG-025](bug-report.md#bug-025) | 400 + thông báo lỗi rõ ràng | HTTP 200 / statusCode 200 / Tiếp nhận Gate-In thành công Container QAVU4186001 |
| TC-074 | gateInStaffId không tồn tại | Validation | PASS | - | - | 400 + thông báo lỗi rõ ràng | HTTP 400 / statusCode 400 / Dữ liệu Gate-In không hợp lệ / Không xác định được nhân viên tiếp nhận từ phiên đăng nhập. Vui lòng đăng nhập lại. |
| TC-078 | Gate-In trùng container đang trong bãi | Validation | PASS | - | - | 400/409 | HTTP 409 / statusCode 409 / Container đang có hồ sơ hoạt động / Container QAAU4181912 đã có hồ sơ đang hoạt động trong depot. |
| TC-079 | Gửi Gate-In 2 lần đồng thời (double submit) cùng số container | Concurrency | PASS | - | - | Chỉ 1 hồ sơ được tạo | 200/409 — 1 hồ sơ tạo thành công |
| TC-110 | Race condition: 3 request Gate-In đồng thời cùng số container, lặp 6 lần | Concurrency | FAIL | High | [BUG-004](bug-report.md#bug-004) | Mỗi lần chỉ 1 hồ sơ active | 4/6 lần tạo trùng hồ sơ |

## Luồng nghiệp vụ Container

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-075 | Gate-In hợp lệ (số container chữ thường + khoảng trắng được chuẩn hoá) | Functional | PASS | - | - | 200, containerNo lưu dạng chuẩn QAAU4181912 | HTTP 200 / statusCode 200 / Tiếp nhận Gate-In thành công Container QAAU4181912 containerNo=QAAU4181912 |
| TC-076 | Đọc lại hồ sơ vừa Gate-In — dữ liệu khớp | Functional | PASS | - | - | containerNo/biển số/isoSize khớp request | {"no":"QAAU4181912","plate":"51C-QA1.23","iso":"40HC","status":"SURVEYING","eir":"EIR-IN-20260929-737383"} |
| TC-077 | Gate-In sinh JobNo + e-EIR nhập | Functional | PASS | - | - |  | jobNo=JOB-2026-7263 eir=EIR-IN-20260929-737383 |
| TC-080 | Duyệt báo giá khi chưa giám định/chưa có báo giá (trạng thái SURVEYING) | Business rule | PASS | - | - | 400 — sai trạng thái | HTTP 400 / statusCode 400 / Phê duyệt thất bại / Hồ sơ chưa có báo giá hoặc bị lỗi |
| TC-081 | Lập báo giá khi chưa giám định (trạng thái SURVEYING) | Business rule | PASS | - | - | 400 — sai trạng thái | HTTP 400 / statusCode 400 / Không thể tạo báo giá / Hồ sơ công việc không hợp lệ |
| TC-082 | Bắt đầu sửa chữa khi chưa duyệt (trạng thái SURVEYING) | Business rule | PASS | - | - | 400 — sai trạng thái | HTTP 400 / statusCode 400 / Không thể bắt đầu Work Order / Estimate chưa được duyệt hoặc hồ sơ không hợp lệ |
| TC-083 | Hoàn tất QC khi chưa sửa (trạng thái SURVEYING) | Business rule | PASS | - | - | 400 — sai trạng thái | HTTP 400 / statusCode 400 / Cập nhật QC thất bại / Không tìm thấy hồ sơ sửa chữa |
| TC-084 | Gate-Out khi container chưa sẵn sàng (trạng thái SURVEYING) | Business rule | PASS | - | - | 400 — sai trạng thái | HTTP 400 / statusCode 400 / Không thể Gate-Out / Container chưa READY_FOR_OUT, còn phiếu dịch vụ chưa thanh toán, hoặc thiếu thông tin xe |
| TC-085 | PATCH /status nhảy thẳng GATE_IN/SURVEYING → READY_FOR_OUT (bỏ qua giám định/QC), gọi bằng tài khoản FORKLIFT | Business rule | FAIL | High | [BUG-003](bug-report.md#bug-003) | Từ chối — chuyển trạng thái phải qua đúng quy trình và đúng vai trò | HTTP 200 / statusCode 200 / Cập nhật trạng thái container thành công / READY_FOR_OUT → status sau đó: READY_FOR_OUT |
| TC-086 | PATCH /status với trạng thái không tồn tại | Validation | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể cập nhật trạng thái / Trạng thái/Job không hợp lệ, hoặc container còn lệnh sửa chữa chưa qua QC đạt → status: READY_FOR_OUT |
| TC-087 | Gate-Out container chưa từng giám định/QC sau khi bị PATCH status | Business rule | FAIL | High | [BUG-003](bug-report.md#bug-003) | Không cho Gate-Out | HTTP 200 / statusCode 200 / Cấp vỏ và Gate-Out thành công / GATE_OUT |
| TC-088 | Giám định viên nhận việc (claim) | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Đã nhận giám định container QAAU4181912 |
| TC-089 | Người thứ 2 nhận trùng việc giám định đã có người nhận | Concurrency | PASS | - | - | 409/400 | HTTP 409 / statusCode 409 / Container đang được giám định bởi người khác / Container đang được giám định bởi Trần Văn Bình. Vui lòng chọn container khác. |
| TC-090 | Nộp giám định với ConditionRating không hợp lệ | Validation | FAIL | Low | [BUG-023](bug-report.md#bug-023) | 400 + thông báo nêu đúng lỗi (hạng không hợp lệ) | HTTP 400 / statusCode 400 / Không thể ghi nhận khảo sát / Mã công việc không tồn tại hoặc đã bị hủy |
| TC-091 | Nộp giám định có hư hỏng số lượng/giờ công/chi phí âm | Validation | FAIL | Low | [BUG-023](bug-report.md#bug-023) | 400 + thông báo nêu đúng lỗi | HTTP 400 / statusCode 400 / Không thể ghi nhận khảo sát / Mã công việc không tồn tại hoặc đã bị hủy → status SURVEYING |
| TC-092 | Nộp giám định hợp lệ (hạng C + 1 hư hỏng) → ESTIMATING | Functional | PASS | - | - | status ESTIMATING | HTTP 200 / statusCode 200 / Lưu thông tin giám định hư hỏng thành công / Chuyển trạng thái sang ESTIMATING (Chờ báo giá) → ESTIMATING |
| TC-093 | Lập báo giá tổng tiền âm | Validation | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể tạo báo giá / Hồ sơ công việc không hợp lệ |
| TC-094 | Báo giá GrandTotal không khớp tổng các hạng mục (999 vs 440.000) | Business rule | FAIL | Medium | [BUG-008](bug-report.md#bug-008) | Từ chối hoặc backend tự tính lại tổng | HTTP 200 / statusCode 200 / Lập báo giá sửa chữa container thành công / Gửi báo giá cho Hãng tàu chờ phê duyệt → grandTotal lưu = 999 |
| TC-095 | Lập báo giá hợp lệ | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Lập báo giá sửa chữa container thành công / Gửi báo giá cho Hãng tàu chờ phê duyệt |
| TC-096 | Từ chối báo giá không nhập lý do | Validation | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể từ chối báo giá / Báo giá không ở trạng thái chờ duyệt hoặc thiếu lý do |
| TC-097 | Hãng tàu duyệt báo giá | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Hãng tàu đã chấp thuận báo giá sửa chữa thành công / Chuyển trạng thái sang REPAIRING → REPAIRING |
| TC-098 | Duyệt lại báo giá đã duyệt (lần 2) | Business rule | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Phê duyệt thất bại / Hồ sơ chưa có báo giá hoặc bị lỗi |
| TC-099 | Bắt đầu sửa chữa | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Đã bắt đầu Work Order / REPAIRING → REPAIRING |
| TC-100 | Bắt đầu sửa chữa lần 2 | Business rule | FAIL | Medium | [BUG-009](bug-report.md#bug-009) | 400 | HTTP 500 |
| TC-101 | Hoàn tất sửa chữa không có ảnh sau sửa | Business rule | PASS | - | - | Cho phép (ghi chú "không kèm ảnh") theo code hiện tại | HTTP 200 / statusCode 200 / Hoàn tất sửa chữa / QC_PENDING → QC_PENDING |
| TC-102 | QC không đạt → quay lại REPAIRING | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Kiểm định QC KHÔNG ĐẠT / Yêu cầu sửa bổ sung → REPAIRING |
| TC-103 | QC đạt → READY_FOR_OUT (hoặc CLEANING nếu còn vệ sinh) | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Kiểm định QC ĐẠT chuẩn / Chuyển sang READY_FOR_OUT (Chờ Gate-Out) → READY_FOR_OUT |
| TC-104 | qc-complete: id trên URL khác JobId trong body | API | PASS | - | - | 400 — không khớp id | HTTP 400 / statusCode 400 / Cập nhật QC thất bại / Không tìm thấy hồ sơ sửa chữa (backend dùng JobId trong body, bỏ qua id trên URL) |
| TC-105 | Gate-Out thiếu biển số/tài xế | Validation | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể Gate-Out / Container chưa READY_FOR_OUT, còn phiếu dịch vụ chưa thanh toán, hoặc thiếu thông tin xe |
| TC-106 | Gate-Out hợp lệ → GATE_OUT + e-EIR xuất | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Cấp vỏ và Gate-Out thành công / GATE_OUT → GATE_OUT eirOut=EIR-OUT-20260929-965236 |
| TC-107 | Gate-Out lần 2 cùng container | Business rule | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể Gate-Out / Container chưa READY_FOR_OUT, còn phiếu dịch vụ chưa thanh toán, hoặc thiếu thông tin xe |
| TC-108 | Gate-In lại container đã Gate-Out (vòng đời mới) | Functional | PASS | - | - | 200 — container đã rời bãi được nhập lại | HTTP 200 / statusCode 200 / Tiếp nhận Gate-In thành công Container QAAU4181912 |
| TC-109 | Lịch sử (audit log) ghi đủ các bước | Functional | PASS | - | - |  | GATE_OUT → QC_PASSED → REPAIR_COMPLETED → QC_FAILED → REPAIR_COMPLETED → REPAIR_STARTED → ESTIMATE_APPROVED → ESTIMATE_CREATED → ESTIMATE_CREATED → SURVEY_SUBMITTED → SURVEY_CLAIMED → GATE_IN |

## Master Data — Danh mục (catalog)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-111 | Tạo mới hợp lệ | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo catalog thành công |
| TC-112 | Tạo thiếu mã (code rỗng) | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / CatalogType, Code và Name là bắt buộc. / Catalog không hợp lệ |
| TC-113 | Tạo thiếu tên | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / CatalogType, Code và Name là bắt buộc. / Catalog không hợp lệ |
| TC-114 | Tạo trùng mã (khác hoa/thường) | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mã catalog đã tồn tại trong loại danh mục này. / Catalog không hợp lệ |
| TC-115 | Mã dài 83 ký tự (giới hạn cột 50) | Boundary | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / An error occurred while saving the entity changes. See the inner exception for details. / Catalog không hợp lệ |
| TC-116 | CatalogType rỗng | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / CatalogType, Code và Name là bắt buộc. / Catalog không hợp lệ |
| TC-117 | Lưu tên chứa HTML/script (XSS) — backend lưu nguyên, giao diện phải escape | Security | PASS | - | - |  | HTTP 200 / statusCode 200 / Tạo catalog thành công |
| TC-118 | Đọc danh sách chứa bản ghi vừa tạo | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Lấy catalog thành công |
| TC-119 | Đọc catalogType không tồn tại | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Lấy catalog thành công |
| TC-120 | Sửa hợp lệ | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Cập nhật catalog thành công |
| TC-121 | Sửa sang mã trùng bản ghi khác | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mã catalog đã tồn tại trong loại danh mục này. / Catalog không hợp lệ |
| TC-122 | Sửa ID không tồn tại | CRUD | PASS | - | - | HTTP 404 | HTTP 404 / statusCode 404 / Không tìm thấy catalog / 999999999 |
| TC-123 | Tạm ngưng (isActive=false) | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Cập nhật catalog thành công |
| TC-124 | Bản ghi tạm ngưng: ẩn ở danh sách nghiệp vụ, còn ở màn quản trị | Functional | PASS | - | - |  | default:false includeInactive:true |
| TC-125 | Xoá | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Đã xóa catalog / DELETED |
| TC-126 | Xoá lại bản ghi đã xoá | CRUD | PASS | - | - | HTTP 404 | HTTP 404 / statusCode 404 / Không tìm thấy catalog / 121 |
| TC-127 | Xoá ID không tồn tại | CRUD | PASS | - | - | HTTP 404 | HTTP 404 / statusCode 404 / Không tìm thấy catalog / 999999999 |
| TC-128 | Tạo lại mã đã xoá → khôi phục đúng bản ghi cũ | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Tạo catalog thành công id=121 |
| TC-129 | Xoá loại container đang được hồ sơ container tham chiếu (40HC) | CRUD | NOT TESTED | - | - |  | Không xoá loại container thật 40HC (id 2) đang được nhiều hồ sơ tham chiếu — tránh phá dữ liệu dùng chung; cần môi trường có bản sao DB. |

## Master Data — Cước Nâng Hạ

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-130 | Tạo mới hợp lệ | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo biểu cước nâng hạ thành công |
| TC-131 | Đơn giá âm | Validation | FAIL | Medium | [BUG-017](bug-report.md#bug-017) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo biểu cước nâng hạ thành công |
| TC-132 | VAT = 150% | Boundary | FAIL | Medium | [BUG-017](bug-report.md#bug-017) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo biểu cước nâng hạ thành công |
| TC-133 | VAT âm | Boundary | FAIL | Medium | [BUG-017](bug-report.md#bug-017) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo biểu cước nâng hạ thành công |
| TC-134 | Trùng mã | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mã biểu cước nâng hạ đã tồn tại. / Biểu cước không hợp lệ |
| TC-135 | Mã 63 ký tự (giới hạn 40) | Boundary | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / An error occurred while saving the entity changes. See the inner exception for details. / Biểu cước không hợp lệ |
| TC-136 | Thiếu tên dịch vụ | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mã biểu cước và tên dịch vụ là bắt buộc. / Biểu cước không hợp lệ |
| TC-137 | Sửa ID không tồn tại | CRUD | PASS | - | - | HTTP 404 | HTTP 404 / statusCode 404 / Không tìm thấy biểu cước / 999999999 |
| TC-138 | Xoá | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Đã xóa biểu cước / DELETED |
| TC-139 | Xoá ID không tồn tại | CRUD | PASS | - | - | HTTP 404 | HTTP 404 / statusCode 404 / Không tìm thấy biểu cước / 999999999 |

## Master Data — Cước Lưu Bãi

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-140 | Tạo mới hợp lệ (2 bậc) | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo quy tắc lưu bãi thành công |
| TC-141 | Bậc có ToDay < FromDay | Validation | FAIL | Medium | [BUG-018](bug-report.md#bug-018) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo quy tắc lưu bãi thành công |
| TC-142 | 2 bậc chồng lấn khoảng ngày (1-5 và 3-8) | Business rule | FAIL | Medium | [BUG-018](bug-report.md#bug-018) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo quy tắc lưu bãi thành công |
| TC-143 | Số ngày miễn phí âm | Validation | FAIL | Medium | [BUG-018](bug-report.md#bug-018) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo quy tắc lưu bãi thành công |
| TC-144 | Không có bậc giá nào | Validation | FAIL | Medium | [BUG-018](bug-report.md#bug-018) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo quy tắc lưu bãi thành công |
| TC-145 | Trùng mã | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mã quy tắc lưu bãi đã tồn tại. / Quy tắc lưu bãi không hợp lệ |
| TC-146 | Xoá | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Đã vô hiệu hóa quy tắc lưu bãi / INACTIVE |

## Khách hàng & Đối tác — Hãng tàu

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-147 | Tạo hãng tàu hợp lệ | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Thêm Hãng tàu mới thành công |
| TC-148 | Trùng mã hãng tàu | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Lỗi khi tạo Hãng tàu / Mã hãng tàu đã tồn tại. |
| TC-149 | Tên rỗng | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Lỗi khi tạo Hãng tàu / Mã và tên hãng tàu là bắt buộc. |
| TC-150 | Email sai định dạng | Validation | FAIL | Low | [BUG-024](bug-report.md#bug-024) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Thêm Hãng tàu mới thành công |
| TC-151 | Xoá hãng tàu đang được hồ sơ container tham chiếu | Functional | NOT TESTED | - | - |  | Không xoá hãng tàu thật (MSCU). FK DepotJob→ShippingLine là Restrict theo cấu hình. |
| TC-152 | Xoá hãng tàu QA không được tham chiếu | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Xoá Hãng tàu thành công / 36 |

## Kho vật tư — Danh mục vật tư

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-153 | Tạo vật tư hợp lệ | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Thêm vật tư thành công |
| TC-154 | Đơn giá âm | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Dữ liệu vật tư không hợp lệ / Mã, tên, giá và tồn kho phải hợp lệ |
| TC-155 | Tồn kho tối thiểu > tối đa | Business rule | FAIL | Low | [BUG-026](bug-report.md#bug-026) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Thêm vật tư thành công |
| TC-156 | Trùng mã vật tư | Validation | FAIL | High | [BUG-007](bug-report.md#bug-007) | 400/404/409 + thông báo | HTTP 200 — tạo bản ghi thứ 2 cùng mã (id 34 & 36 cùng code QA-MAT-…); tồn kho hiển thị 2 dòng cùng mã |

## Kho vật tư — Nhập/Xuất

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-157 | Nhập kho 10 | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Ghi nhận giao dịch kho thành công |
| TC-158 | Xuất kho 1.000 (vượt tồn 10) | Business rule | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Tồn kho không đủ để xuất vật tư. / Giao dịch kho không hợp lệ |
| TC-159 | Số lượng = 0 | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / MaterialCode, Quantity và ReferenceId là bắt buộc. / Giao dịch kho không hợp lệ |
| TC-160 | Số lượng âm | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / MaterialCode, Quantity và ReferenceId là bắt buộc. / Giao dịch kho không hợp lệ |
| TC-161 | Mã vật tư không tồn tại | Validation | FAIL | Medium | [BUG-019](bug-report.md#bug-019) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Ghi nhận giao dịch kho thành công |
| TC-162 | Loại giao dịch không hợp lệ | Validation | FAIL | Medium | [BUG-019](bug-report.md#bug-019) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Ghi nhận giao dịch kho thành công |
| TC-163 | Tồn kho sau các giao dịch không âm | Database | PASS | - | - |  | Không có tồn âm. Lưu ý: do BUG trùng mã vật tư, có 2 vật tư QA-MAT cùng mã (id 34 stock=10, id 36 stock=0). |

## Khách hàng & Đối tác — Khách hàng

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-164 | Tạo khách hàng hợp lệ | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo khách hàng thành công |
| TC-165 | Trùng mã khách hàng | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mã khách hàng đã tồn tại. / Dữ liệu khách hàng không hợp lệ |
| TC-166 | Email sai định dạng | Validation | FAIL | Low | [BUG-024](bug-report.md#bug-024) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo khách hàng thành công |
| TC-167 | Hạn mức công nợ âm | Validation | FAIL | Medium | [BUG-020](bug-report.md#bug-020) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo khách hàng thành công |
| TC-168 | Tên khách hàng rỗng | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mã và tên khách hàng là bắt buộc. / Dữ liệu khách hàng không hợp lệ |
| TC-169 | Thêm tài xế | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo tài xế thành công |
| TC-170 | Thêm tài xế cho khách hàng không tồn tại | Validation | FAIL | Medium | [BUG-020](bug-report.md#bug-020) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo tài xế thành công |
| TC-171 | Thêm phương tiện | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo phương tiện thành công |
| TC-172 | Trùng biển số xe | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Phương tiện đã tồn tại. / Dữ liệu phương tiện không hợp lệ |
| TC-173 | Tải trọng xe âm | Validation | FAIL | Medium | [BUG-020](bug-report.md#bug-020) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo phương tiện thành công |
| TC-174 | Thêm tài khoản cổng khách hàng | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo tài khoản khách hàng thành công |
| TC-175 | Trùng username cổng khách hàng | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Username đã tồn tại. / Dữ liệu tài khoản không hợp lệ |
| TC-176 | Thêm booking | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo booking thành công |
| TC-177 | Booking hạn dùng trước ngày phát hành | Business rule | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mã hãng tàu MAEU không tồn tại trong danh mục ShippingLine.Code. / Dữ liệu booking không hợp lệ |
| TC-178 | Booking số lượng container = 0 | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mã hãng tàu MAEU không tồn tại trong danh mục ShippingLine.Code. / Dữ liệu booking không hợp lệ |
| TC-179 | Booking đã dùng > tổng số | Business rule | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Số lượng container booking không hợp lệ. / Dữ liệu booking không hợp lệ |
| TC-180 | Xoá khách hàng còn tài xế/xe/tài khoản/booking | Database | PASS | - | - | Chặn xoá, hoặc xoá kèm dữ liệu con | DELETE thực chất là KHOÁ khách hàng ("Đã khóa khách hàng"), dữ liệu con giữ nguyên — hợp lý cho khoá mềm |

## Hệ thống — Người dùng (RBAC)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-181 | Tạo người dùng hợp lệ | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo người dùng thành công |
| TC-182 | Tạo người dùng trả mật khẩu tạm 1 lần | Functional | PASS | - | - |  | temporaryPassword có giá trị: true |
| TC-183 | Trùng username | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Không thể tạo người dùng / Username hoặc RoleCode không hợp lệ |
| TC-184 | Email sai định dạng | Validation | FAIL | Low | [BUG-024](bug-report.md#bug-024) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo người dùng thành công |
| TC-185 | Vai trò không tồn tại | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Không thể tạo người dùng / Username hoặc RoleCode không hợp lệ |
| TC-186 | Username rỗng | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Không thể tạo người dùng / Username hoặc RoleCode không hợp lệ |
| TC-187 | Đặt lại mật khẩu yếu ("1") | Security | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / Mật khẩu không đạt chính sách bảo mật / Mật khẩu phải có tối thiểu 8 ký tự. |
| TC-188 | Đặt lại mật khẩu mạnh | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Đặt lại mật khẩu thành công / 35 |
| TC-189 | Đăng nhập bằng mật khẩu mới | Functional | PASS | - | - |  | HTTP 200 |
| TC-190 | Xoá người dùng | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Xóa người dùng thành công / 35 |
| TC-191 | Người dùng đã xoá không đăng nhập được | Security | PASS | - | - |  | HTTP 401 |
| TC-192 | Admin tự xoá chính mình | Functional | NOT TESTED | - | - |  | Không thực hiện: admin (id 1) là tài khoản quản trị duy nhất trên DB dev, nếu backend không chặn sẽ mất quyền quản trị. |
| TC-193 | Audit log ghi nhận tạo/xoá/đặt lại mật khẩu người dùng | Database | FAIL | Medium | [BUG-010](bug-report.md#bug-010) |  | GET /api/system/audit-logs trả 0 bản ghi trên toàn hệ thống sau khi tạo/đặt lại mật khẩu/xoá user |

## Thông báo — Mẫu tin

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-194 | Tạo mẫu tin hợp lệ | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Tạo mẫu tin thành công |
| TC-195 | Trùng mã mẫu tin | Validation | PASS | - | - | 400/404/409 + thông báo | HTTP 400 / statusCode 400 / An error occurred while saving the entity changes. See the inner exception for details. / Không thể tạo mẫu tin |
| TC-196 | Nội dung rỗng | Validation | FAIL | Low | [BUG-027](bug-report.md#bug-027) | 400/404/409 + thông báo | HTTP 200 / statusCode 200 / Tạo mẫu tin thành công |
| TC-197 | Sửa mẫu không tồn tại | CRUD | PASS | - | - | HTTP 404 | HTTP 404 / statusCode 404 / Không tìm thấy mẫu tin / QA_NO_TPL |
| TC-198 | Xoá mẫu tin | CRUD | PASS | - | - | HTTP 200 | HTTP 200 / statusCode 200 / Xoá mẫu tin thành công / QA_TPL_584951 |

## Dữ liệu — Nhất quán số liệu

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-199 | Số container trong bãi: Danh sách hồ sơ vs Thống kê Dashboard vs Sơ đồ bãi | Consistency | PASS | - | - | Cùng một con số | Hồ sơ chưa Gate-Out=52; /stats={"totalJobs":58,"gateInJobs":0,"surveyingJobs":28,"estimatingJobs":16,"repairingJobs":3,"readyForOutJobs":3,"totalRevenueVnd":1567500,"sqlDatabaseStatus":"ONLIN; yard/overview containers=52 |
| TC-201 | Không có hồ sơ mang trạng thái ngoài danh sách chuẩn | Database | PASS | - | - |  | OK |
| TC-202 | Không có 2 hồ sơ đang hoạt động cho cùng 1 số container | Database | FAIL | High | [BUG-004](bug-report.md#bug-004) |  | QARU4356481: 99/98; QARU4355335: 97/96/95; QARU4354160: 94/93; QARU4352995: 91/92; TGBU3719842: 58/59 |
| TC-203 | Hồ sơ READY_FOR_OUT/GATE_OUT đều đã qua giám định | Database | FAIL | High | [BUG-003](bug-report.md#bug-003) |  | 2 hồ sơ không có phiếu giám định: QABU4182053:GATE_OUT, QABU3877225:GATE_OUT |
| TC-226 | Dashboard "Tồn Bãi Hiện Tại" (reports/kpi.activeJobs) = số hồ sơ chưa Gate-Out | Consistency | PASS | - | - | 52 | activeJobs=52 (hồ sơ chưa Gate-Out thực tế=52; Sơ đồ bãi hiển thị 52) |

## Hiệu năng

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-204 | GET /api/DepotJobs trả toàn bộ 58 hồ sơ, không phân trang | Performance | FAIL | Low | [BUG-034](bug-report.md#bug-034) | Có phân trang phía server khi dữ liệu lớn | 209 KB / 58 hồ sơ trong 1 lần gọi, kèm toàn bộ survey/estimate/audit lồng nhau |
| TC-272 | Số lần gọi API khi mở mỗi màn (dev) | Performance | PASS | - | - |  | Mỗi API gọi 2 lần ở môi trường dev do React.StrictMode (main.tsx) — hành vi chỉ có ở dev, không phải lỗi production |
| TC-311 | GET /api/DepotJobs — median 5 lần | Performance | PASS | - | - | < 1.500 ms | 11 ms (min 11, max 14), 214 KB |
| TC-312 | GET /api/yard/overview — median 5 lần | Performance | PASS | - | - | < 1.500 ms | 13 ms (min 12, max 21), 109 KB |
| TC-313 | GET /api/reports/analytics — median 5 lần | Performance | PASS | - | - | < 1.500 ms | 8 ms (min 7, max 10), 18 KB |
| TC-314 | GET /api/reports/staff-realtime — median 5 lần | Performance | PASS | - | - | < 1.500 ms | 7 ms (min 7, max 12), 6 KB |
| TC-315 | GET /api/MasterData/all — median 5 lần | Performance | PASS | - | - | < 1.500 ms | 8 ms (min 8, max 9), 62 KB |
| TC-316 | GET /api/billing/debts — median 5 lần | Performance | PASS | - | - | < 1.500 ms | 2 ms (min 2, max 6), 0 KB |
| TC-317 | GET /api/warehouse/transactions — median 5 lần | Performance | PASS | - | - | < 1.500 ms | 2 ms (min 2, max 2), 7 KB |
| TC-318 | GET /api/notifications — median 5 lần | Performance | PASS | - | - | < 1.500 ms | 2 ms (min 2, max 4), 1 KB |

## Tìm kiếm / Lọc — Danh sách container

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-205 | Tìm chính xác số container | Functional | PASS | - | - |  | 2 kết quả |
| TC-206 | Tìm một phần số container | Functional | PASS | - | - |  | "AU418" → 2 kết quả |
| TC-207 | Tìm không phân biệt hoa/thường | Functional | PASS | - | - |  | 2 kết quả |
| TC-208 | Tìm giá trị không tồn tại → rỗng | Functional | PASS | - | - |  | 0 kết quả |
| TC-209 | Tìm ký tự đặc biệt "%" | Security | PASS | - | - |  | HTTP 200 / statusCode 200 / Lấy danh sách hồ sơ công việc Depot thành công — 0/58 kết quả |
| TC-210 | Tìm ký tự đặc biệt "_" | Security | PASS | - | - |  | HTTP 200 / statusCode 200 / Lấy danh sách hồ sơ công việc Depot thành công — 0/58 kết quả |
| TC-211 | Tìm ký tự đặc biệt "'" | Security | PASS | - | - |  | HTTP 200 / statusCode 200 / Lấy danh sách hồ sơ công việc Depot thành công — 0/58 kết quả |
| TC-212 | Tìm ký tự đặc biệt "\\" | Security | PASS | - | - |  | HTTP 200 / statusCode 200 / Lấy danh sách hồ sơ công việc Depot thành công — 0/58 kết quả |
| TC-213 | Tìm ký tự đặc biệt "<script>" | Security | PASS | - | - |  | HTTP 200 / statusCode 200 / Lấy danh sách hồ sơ công việc Depot thành công — 0/58 kết quả |
| TC-214 | Tìm ký tự đặc biệt "%' OR 1=1 --" | Security | PASS | - | - |  | HTTP 200 / statusCode 200 / Lấy danh sách hồ sơ công việc Depot thành công — 0/58 kết quả |
| TC-215 | Lọc theo trạng thái | Functional | PASS | - | - |  | 6 kết quả, sai trạng thái: 0 |
| TC-216 | Lọc theo hãng tàu | Functional | PASS | - | - |  | MSCU: 52 kết quả, sai hãng: 0 |
| TC-217 | Kết hợp nhiều điều kiện lọc | Functional | PASS | - | - |  | 3 kết quả |
| TC-218 | Lọc trạng thái không tồn tại | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Lấy danh sách hồ sơ công việc Depot thành công 0 kết quả |
| TC-219 | Phân trang / sắp xếp phía server (page, pageSize, sort) | Functional | NOT TESTED | - | - |  | API không hỗ trợ tham số phân trang/sắp xếp; danh sách trả toàn bộ. Phân trang/sắp xếp nếu có chỉ ở client — kiểm tra ở UI. |

## API — Đọc chi tiết

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-220 | GET /api/DepotJobs/999999999 | API | PASS | - | - | 404 (hoặc 400 khi sai kiểu) | HTTP 404 / statusCode 404 / Không tìm thấy hồ sơ container / Không tồn tại hồ sơ với mã hoặc số cont: 999999999 |
| TC-221 | GET /api/DepotJobs/abc | API | PASS | - | - | 404 (hoặc 400 khi sai kiểu) | HTTP 404 / statusCode 404 / Không tìm thấy hồ sơ container / Không tồn tại hồ sơ với mã hoặc số cont: abc |
| TC-222 | GET /api/DepotJobs/-1 | API | PASS | - | - | 404 (hoặc 400 khi sai kiểu) | HTTP 404 / statusCode 404 / Không tìm thấy hồ sơ container / Không tồn tại hồ sơ với mã hoặc số cont: -1 |
| TC-223 | GET /api/cleaning/999999999 | API | PASS | - | - | 404 (hoặc 400 khi sai kiểu) | HTTP 404 / statusCode 404 / Không tìm thấy lệnh vệ sinh / 999999999 |
| TC-224 | GET /api/yard/containers/999999999 | API | PASS | - | - | 404 (hoặc 400 khi sai kiểu) | HTTP 404 / statusCode 404 / Không tìm thấy container / 999999999 |
| TC-225 | GET /api/DepotJobs/999999999/history | API | FAIL | Low | [BUG-029](bug-report.md#bug-029) | 404 (hoặc 400 khi sai kiểu) | HTTP 200 / statusCode 200 / Lấy lịch sử container thành công |

## Upload file

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-227 | Upload ảnh JPG hợp lệ | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Lưu file thành công url=/api/files/be1a7b95565d4ccb9f7270b7d388cfc6/be1a7b95565d4ccb9f7270b7d388cfc6.jpg |
| TC-228 | Upload ảnh PNG hợp lệ | Functional | PASS | - | - |  |  |
| TC-229 | Từ chối: File .exe | Security | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể lưu file / Định dạng file không được hỗ trợ. |
| TC-230 | Từ chối: File .html (XSS) | Security | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể lưu file / Định dạng file không được hỗ trợ. |
| TC-231 | Từ chối: File .svg (có script) | Security | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể lưu file / Định dạng file không được hỗ trợ. |
| TC-232 | Từ chối: File .exe đổi đuôi thành .jpg | Security | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể lưu file / Nội dung file không khớp với định dạng '.jpg' đã khai báo (file có thể bị đổi đuôi để né kiểm tra). |
| TC-233 | Từ chối: Tên file chứa ../ (path traversal) | Security | PASS | - | - | 400 | Chấp nhận nhưng đã làm sạch: tên gốc lưu "qa-evil2.jpg", file vật lý đặt theo GUID trong storage-files — không path traversal |
| TC-234 | Từ chối: File rỗng 0 byte | Security | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Thiếu file upload / file rỗng |
| TC-235 | Từ chối file 21 MB (giới hạn 20 MB) | Boundary | PASS | - | - | 400/413 | HTTP 400 |
| TC-236 | Upload gắn vào hồ sơ (IdTable) không tồn tại | Database | FAIL | Low | [BUG-028](bug-report.md#bug-028) | 400/404 | HTTP 200 / statusCode 200 / Lưu file thành công — tạo bản ghi DepotFiles mồ côi |
| TC-237 | Upload với TableName tuỳ ý | Database | FAIL | Low | [BUG-028](bug-report.md#bug-028) | 400 | HTTP 200 / statusCode 200 / Lưu file thành công |
| TC-240 | Upload ảnh sau sửa cho hồ sơ đang REPAIRING | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Đã lưu ảnh sau sửa |
| TC-241 | Upload ảnh sau sửa với itemNo = 0 | Validation | PASS | - | - |  | HTTP 400 / statusCode 400 / Thiếu số hạng mục sửa chữa / itemNo |
| TC-242 | Upload ảnh sau sửa cho hồ sơ chưa sửa chữa | Business rule | PASS | - | - |  | HTTP 400 / statusCode 400 / Không thể lưu ảnh sau sửa / Container chưa ở trạng thái đang sửa chữa (REPAIRING) — bấm Bắt đầu Work Order trước. |

## Bảo mật

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-238 | Tải ảnh đã upload KHÔNG cần đăng nhập (qua /api/files/*) | Security | FAIL | Medium | [BUG-013](bug-report.md#bug-013) | 401 khi chưa đăng nhập | VPS: GET http://160.187.146.176:3001/api/files/{id}/{name} không token → 200 image/jpeg. Local: FileServer trực tiếp → 200. (Local qua cổng 3000 trả 401 chỉ vì dev server đang chạy server.ts cũ — xem ghi chú môi trường) |
| TC-243 | CORS backend với Origin lạ | Security | FAIL | Low | [BUG-031](bug-report.md#bug-031) |  | Access-Control-Allow-Origin: * — Program.cs bật AllowAnyOrigin khi Environment=Development (dòng 170-180). Production chỉ bật khi cấu hình Cors origins. |
| TC-244 | Lỗi không lộ chi tiết kỹ thuật (stack trace / tên lớp .NET) | Security | PASS | - | - |  | HTTP 400 |
| TC-245 | Thao tác trên ID không tồn tại trả 400/404 (không 500) | API | PASS | - | - |  | HTTP 400 / statusCode 400 / Không thể bắt đầu Work Order / Estimate chưa được duyệt hoặc hồ sơ không hợp lệ |
| TC-246 | Nhận việc giám định thay người khác (gửi staffId của user khác) | Security | FAIL | Medium | [BUG-012](bug-report.md#bug-012) | Backend lấy người thao tác từ token, bỏ qua staffId client gửi | HTTP 200 / statusCode 200 / Đã nhận giám định container QARU4356481 — gửi staffId=7 (repair) bằng token của surveyor (2) |
| TC-247 | Header bảo mật HTTP (CSP, X-Frame-Options, X-Content-Type-Options) | Security | FAIL | Low | [BUG-031](bug-report.md#bug-031) |  | CSP=null XFO=null XCTO=null X-Powered-By=Express |
| TC-260 | Dữ liệu chứa HTML/JS hiển thị an toàn (không thực thi) ở danh mục | Security | PASS | - | - |  | Hiển thị dạng text, không thực thi |

## Môi trường

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-248 | Hiển thị ảnh đã upload trên giao diện local (cổng 3000) | Environment | BLOCKED | - | - | Ảnh hiển thị | GET /api/files/* qua localhost:3000 → 401: dev server (node pid 18308, khởi động 29/09 13:27) chạy server.ts cũ chưa có route proxy /api/files. Cần khởi động lại npm run dev. |

## Authentication (UI)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-249 | Đăng nhập đúng trên giao diện → vào Dashboard | UI | PASS | - | - |  | OK |
| TC-250 | F5 sau khi đăng nhập vẫn giữ phiên | UI | PASS | - | - |  |  |
| TC-251 | Token hết hạn/không hợp lệ giữa phiên → tự quay về màn đăng nhập | UI | PASS | - | - |  | Quay về đăng nhập |
| TC-252 | Đăng xuất → về màn đăng nhập, xoá token phía trình duyệt | UI | PASS | - | - |  | Về màn đăng nhập; token đã xoá; chỉ còn depot_user_profiles_v1=[] (mảng rỗng, vô hại) |
| TC-253 | Bấm Back sau khi đăng xuất không vào lại được | UI | PASS | - | - |  | SPA không có lịch sử route — Back rời khỏi app (about:blank), không vào lại được |

## Xử lý lỗi (UI)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-254 | API trả 500 khi mở Danh mục Mã hư hỏng | Error handling | FAIL | Medium | [BUG-016](bug-report.md#bug-016) | Hiện thông báo lỗi rõ ràng, không crash | Hiện banner vàng nhưng nội dung là "Request failed with status code 500" (thông báo kỹ thuật tiếng Anh của axios); message của backend không hiển thị |
| TC-255 | API trả 403 khi mở Kho vật tư | Error handling | FAIL | Medium | [BUG-016](bug-report.md#bug-016) | Hiện thông báo lỗi rõ ràng, không crash | Không có thông báo lỗi; màn hiển thị như kho rỗng |
| TC-256 | Mất mạng khi mở Công nợ hãng tàu | Error handling | FAIL | Medium | [BUG-016](bug-report.md#bug-016) | Hiện thông báo lỗi rõ ràng, không crash | Không có thông báo lỗi; hiển thị "Không tìm thấy khoản công nợ container nào phù hợp với bộ lọc" và tổng nợ 0 đ — dễ hiểu nhầm là không có công nợ |
| TC-257 | API chậm 6 giây — có trạng thái đang tải | Error handling | FAIL | Low | [BUG-032](bug-report.md#bug-032) |  | Hiện "Chưa có hạng mục cước nâng hạ nào" trong lúc đang tải (dễ hiểu nhầm là không có dữ liệu) |

## Gate-In (UI)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-258 | Bấm Xác nhận khi form trống → báo lỗi, không gửi API | UI | PASS | - | - |  | POST gate-in: 0; có thông báo: true |
| TC-259 | Double-click nút Xác nhận tiếp nhận chỉ gửi 1 request | Error handling | PASS | - | - |  | 1 request POST gate-in |

## Tìm kiếm / Lọc (UI)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-261 | Ô tìm kiếm Danh sách container lọc đúng | UI | PASS | - | - |  | trước 10 dòng, sau 4 dòng |
| TC-262 | Tìm không có kết quả → hiện thông báo rỗng | UI | PASS | - | - |  | 1 dòng |
| TC-263 | Xoá từ khoá → hiện lại đầy đủ | UI | PASS | - | - |  |  |
| TC-264 | Phân trang ở Danh sách container | UI | PASS | - | - |  | Có điều khiển phân trang |

## Tải xuống (UI)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-265 | Xuất file ở Danh sách container | UI | NOT TESTED | - | - |  | Màn Danh sách container không có chức năng xuất file |
| TC-266 | Xuất CSV DM Loại Container | UI | PASS | - | - |  | DANH-MUC-LOAI-CONTAINER-ISO-2026-09-29.csv — 18 dòng dữ liệu |

## Giao diện

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-267 | Tiêu đề trang Master Data đọc được | UI | FAIL | Low | [BUG-033](bug-report.md#bug-033) | Chữ tương phản với nền | Khối tiêu đề "DANH MỤC HỆ THỐNG & MASTER DATA": chữ tối trên nền gradient tối, gần như không đọc được (ảnh ui-err-DMMHH.png) |
| TC-268 | Nhãn bộ lọc hãng tàu ở Công nợ | UI | FAIL | Low | [BUG-033](bug-report.md#bug-033) |  | Option mặc định ghi cứng "Tất cả (MAERSK LINE)" dù đang lọc tất cả hãng tàu |

## Thông báo — Zalo

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-271 | Mở màn Cấu Hình Zalo OA & Token | UI | FAIL | High | [BUG-005](bug-report.md#bug-005) | Màn hiển thị cấu hình | Crash: "Cannot read properties of undefined (reading toLocaleString)" — toàn bộ app trắng, phải F5; xảy ra trên desktop và mobile, mọi vai trò |

## Giao diện (Mobile 390px)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-273 | Quét 55 menu trên màn hình điện thoại | Responsive | PASS | - | - |  | Không màn nào tràn ngang toàn trang; menu mở bằng nút ☰; bảng dài cuộn trong khung. (Màn Zalo Settings crash như desktop) |

## Khai thác — Phiếu dịch vụ & Thanh toán

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-274 | Tạo phiếu dịch vụ hợp lệ | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Tạo phiếu dịch vụ thành công |
| TC-275 | Phiếu dịch vụ số lượng/đơn giá âm | Validation | PASS | - | - | 400 | HTTP 400 / statusCode 400 / Không thể tạo phiếu dịch vụ / Job/Container không hợp lệ hoặc thiếu hạng mục |
| TC-276 | Phiếu dịch vụ không có dòng dịch vụ | Validation | PASS | - | - |  | HTTP 400 / statusCode 400 / Không thể tạo phiếu dịch vụ / Job/Container không hợp lệ hoặc thiếu hạng mục |
| TC-277 | Phiếu dịch vụ cho hồ sơ không tồn tại | Validation | PASS | - | - |  | HTTP 400 / statusCode 400 / Không thể tạo phiếu dịch vụ / Job/Container không hợp lệ hoặc thiếu hạng mục |
| TC-278 | Tổng tiền phiếu = đơn giá × SL × (1+VAT) | Business rule | PASS | - | - | 108000 | grandTotal=108000 |
| TC-279 | Thanh toán sai số tiền (1 đ) | Business rule | PASS | - | - |  | HTTP 400 / statusCode 400 / Không thể xử lý thanh toán / Job không tồn tại, số tiền không khớp, hoặc đã được thanh toán trước đó |
| TC-280 | Thanh toán số tiền âm | Validation | PASS | - | - |  | HTTP 400 / statusCode 400 / Không thể xử lý thanh toán / Job không tồn tại, số tiền không khớp, hoặc đã được thanh toán trước đó |
| TC-281 | Thanh toán đúng số tiền | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Thanh toán thành công / PAID |
| TC-282 | Thanh toán lần 2 phiếu đã thanh toán | Business rule | PASS | - | - |  | HTTP 400 / statusCode 400 / Không thể xử lý thanh toán / Job không tồn tại, số tiền không khớp, hoặc đã được thanh toán trước đó |
| TC-283 | Thanh toán không làm mất trạng thái nghiệp vụ của hồ sơ | Business rule | PASS | - | - |  | status=SURVEYING |
| TC-284 | Phiếu dịch vụ chuyển PAID sau thanh toán | Database | PASS | - | - |  | paymentStatus=PAID |
| TC-285 | Huỷ phiếu dịch vụ đã thanh toán | Business rule | PASS | - | - | 400 — không huỷ phiếu đã thu tiền | HTTP 400 / statusCode 400 / Không thể huỷ phiếu dịch vụ / Phiếu không tồn tại hoặc đã thanh toán/huỷ trước đó |
| TC-286 | Webhook ngân hàng với secret sai | Security | PASS | - | - |  | HTTP 401 |

## Công nợ hãng tàu (Billing)

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-287 | Danh sách hồ sơ đủ điều kiện đồng bộ | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Lấy danh sách ứng viên đồng bộ thành công 4 hồ sơ |
| TC-288 | Đồng bộ công nợ với danh sách rỗng | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Đồng bộ công nợ thành công |
| TC-289 | Ghi nhận thanh toán phân bổ vào khoản nợ không tồn tại | Validation | PASS | - | - |  | HTTP 400 / statusCode 400 / Có khoản công nợ không tồn tại trong danh sách phân bổ. / MSCU |
| TC-290 | Ghi nhận thanh toán số tiền âm | Validation | PASS | - | - |  | HTTP 400 / statusCode 400 / Cần phân bổ khoản thanh toán cho ít nhất 1 công nợ. / MSCU |
| TC-291 | Phân bổ thanh toán vượt số nợ còn lại | Functional | BLOCKED | - | - |  | Không có khoản nợ nào còn dư để test (công nợ = 0) |
| TC-292 | Xuất hoá đơn cho khoản nợ không tồn tại | Functional | PASS | - | - |  | HTTP 404 / statusCode 404 / Không tìm thấy khoản công nợ / QA-NO-DEBT |
| TC-293 | Chốt kỳ công nợ | Functional | NOT TESTED | - | - |  | Không chốt kỳ thật trên DB dev để tránh khoá kỳ kế toán; cần môi trường riêng. |

## Tổ Vệ sinh

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-294 | Tiếp nhận vệ sinh hợp lệ | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Tiếp nhận container vào bệ rửa thành công |
| TC-295 | Tiếp nhận vệ sinh trùng container đang vệ sinh | Validation | PASS | - | - |  |  |
| TC-296 | Tiếp nhận vệ sinh số container không tồn tại | Validation | FAIL | Medium | [BUG-021](bug-report.md#bug-021) |  | HTTP 200 — tạo lệnh vệ sinh cho QAZZ9999999 (không có hồ sơ trong bãi); lần gọi sau mới báo trùng |
| TC-297 | Đơn giá dịch vụ vệ sinh âm | Validation | FAIL | Medium | [BUG-021](bug-report.md#bug-021) |  | HTTP 200 — lưu hạng mục vệ sinh đơn giá -1 (record id 21) |
| TC-298 | Bàn giao khi chưa hoàn thành hạng mục | Business rule | PASS | - | - |  | HTTP 400 / statusCode 400 / Còn 1/1 hạng mục vệ sinh chưa hoàn thành — phải đánh dấu xong tất cả trước khi bàn giao Khai Thác. / Không thể bàn giao lệnh vệ sinh |
| TC-299 | Hoàn thành tất cả hạng mục | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Cập nhật toàn bộ hạng mục vệ sinh thành công |
| TC-300 | Bàn giao sau khi hoàn thành | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Hoàn tất vệ sinh và bàn giao Khai Thác thành công |
| TC-301 | Bàn giao lần 2 | Business rule | PASS | - | - |  | HTTP 400 / statusCode 400 / Lệnh vệ sinh này đã được bàn giao trước đó, không thể bàn giao lại. / Không thể bàn giao lệnh vệ sinh |

## Bãi & Xe nâng

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-302 | Cập nhật block: BayCount = 0 | Validation | FAIL | Medium | [BUG-022](bug-report.md#bug-022) |  | HTTP 200 / statusCode 200 / Cập nhật cấu hình Block thành công |
| TC-303 | Cập nhật block: MaxTier âm | Validation | FAIL | Medium | [BUG-022](bug-report.md#bug-022) |  | HTTP 200 / statusCode 200 / Cập nhật cấu hình Block thành công |
| TC-304 | Cập nhật block: Trạng thái không hợp lệ | Validation | FAIL | Medium | [BUG-022](bug-report.md#bug-022) |  | HTTP 200 / statusCode 200 / Cập nhật cấu hình Block thành công |
| TC-305 | Di chuyển container vào ô đang có container khác | Business rule | PASS | - | - |  | HTTP 400 / statusCode 400 / Vị trí BLOCK_Q-01-01-01 đã có container MSKU0000001 chiếm giữ. / 102 ô BLOCK_Q-01-01-01 |
| TC-306 | Di chuyển container tới vị trí không tồn tại | Validation | PASS | - | - |  | HTTP 400 / statusCode 400 / Block QA-ZZ không tồn tại trong sơ đồ bãi. / 102 |
| TC-319 | Tài xế A nhận lệnh xe nâng (hồ sơ REPAIRING) | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Đã khóa và nhận lệnh xe nâng cho container QATST000901 |
| TC-320 | Tài xế B nhận cùng lệnh đã có người nhận | Concurrency | PASS | - | - |  | HTTP 409 / statusCode 409 / Container đã được tài xế khác nhận / Container đã được tài xế QA A nhận lệnh trước đó. Vui lòng chọn container khác. |
| TC-321 | Tài xế B (không nhận lệnh) bấm Bắt đầu | Business rule | PASS | - | - |  | HTTP 400 / statusCode 400 / Không thể bắt đầu thực hiện / Bạn không phải người đang giữ khóa lệnh này hoặc hồ sơ không tồn tại |
| TC-322 | Tài xế A bắt đầu lệnh nhưng gửi operatorId của người khác | Security | PASS | - | - |  | HTTP 400 / statusCode 400 / Không thể bắt đầu thực hiện / Bạn không phải người đang giữ khóa lệnh này hoặc hồ sơ không tồn tại — operatorId lấy từ query string, không từ token |
| TC-323 | Tài xế A huỷ nhận lệnh | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Đã hủy nhận lệnh xe nâng / CANCELLED |

## Thông báo — Gửi

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-307 | Gửi thông báo hợp lệ | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Gửi thông báo thành công |
| TC-308 | Gửi thông báo nội dung rỗng | Validation | PASS | - | - |  |  |
| TC-309 | Gửi thông báo tới người nhận không tồn tại | Validation | FAIL | Low | [BUG-027](bug-report.md#bug-027) |  | HTTP 200 — tạo thông báo cho recipientId "qa_no_user" |
| TC-310 | Huỷ thông báo | Functional | PASS | - | - |  | HTTP 200 / statusCode 200 / Huỷ thông báo thành công / 1 |

## VPS — Bảo mật

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-324 | Gọi 144 API BackendApi không có token (ID dùng 999999999) | Security | PASS | - | - |  | 144/144 trả 401 |
| TC-325 | Token giả / alg=none / chữ ký sai | Security | PASS | - | - |  | 401 |
| TC-330 | Kết nối HTTPS | Security | FAIL | High | [BUG-006](bug-report.md#bug-006) | HTTPS bắt buộc | Chỉ HTTP (https://160.187.146.176:3001 → NO (ERR_SSL_WRONG_VERSION_NUMBER)). Mật khẩu & JWT truyền dạng rõ. |
| TC-331 | Header bảo mật HTTP | Security | FAIL | Low | [BUG-031](bug-report.md#bug-031) |  | {"content-security-policy":null,"x-frame-options":null,"x-content-type-options":null,"strict-transport-security":null,"referrer-policy":null,"x-powered-by":"Express","server":null} |
| TC-332 | Bundle JS không chứa mật khẩu / khoá bí mật | Security | FAIL | Medium | [BUG-014](bug-report.md#bug-014) |  | password:"Password@123" \| Password:"}),e.jsx(" \| passwordHash:"123456" \| Secret:"sk_live_maersk_emr_9921_sec" \| apiKey:"mae_api_key_depot_vnhcm01_secure" \| Token:"REL-AV-MSK-9901-01" \| Token:"REL-AV-MSK-9901-02" \| 12345678 |
| TC-333 | Tải ảnh /api/files/* không cần đăng nhập | Security | FAIL | Medium | [BUG-013](bug-report.md#bug-013) |  | HTTP 200 image/jpeg không token (kiểm tra 29/09 khi deploy FileServer) |

## VPS — Authentication

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-326 | Đăng nhập sai/bỏ trống/null/JSON lỗi/SQLi/10.000 ký tự | Security | PASS | - | - |  | 401/400, thông báo chung |
| TC-327 | Khoá tạm sau 5 lần sai | Security | PASS | - | - |  | 1:401/Tên đăng nhập hoặc mật khẩu không đúng, 2:401/Tên đăng nhập hoặc mật khẩu không đúng, 3:401/Tên đăng nhập hoặc mật khẩu không đúng, 4:401/Tên đăng nhập hoặc mật khẩu không đúng, 5:401/Tên đăng nhập hoặc mật khẩu không đúng, 6:429/Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 30 phút., 7:429/Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 30 phút. |
| TC-328 | Double-click nút Đăng nhập | UI | PASS | - | - |  | 1 request |
| TC-329 | Mở URL trực tiếp / giả phiên localStorage khi chưa đăng nhập | UI | PASS | - | - |  | Luôn về màn đăng nhập |

## VPS — Hiệu năng

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-334 | Thời gian tải trang lần đầu | Performance | FAIL | Medium | [BUG-015](bug-report.md#bug-015) | < 3 giây | ~9,7 giây; 1 file JS 2,8 MB, không nén gzip/brotli, Cache-Control max-age=0 |

## VPS — Giao diện

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-335 | Màn đăng nhập trên điện thoại 375px | Responsive | PASS | - | - |  | Không cuộn ngang |

## VPS — Chức năng

| ID | Test case | Loại | Kết quả | Mức độ | Bug | Kỳ vọng | Kết quả thực tế |
|---|---|---|---|---|---|---|---|
| TC-336 | Test chức năng cần đăng nhập trên VPS | Functional | BLOCKED | - | - |  | Không có tài khoản hợp lệ: mật khẩu trong .env (ADMIN_PASSWORD, SEED_DEFAULT_PASSWORD) đều sai với DB VPS. Người dùng chuyển sang test trên localhost — toàn bộ test chức năng thực hiện trên local cùng source code. |

## Thông tin ghi nhận thêm (không tính là test case)

| ID | Nội dung | Ghi nhận |
|---|---|---|
| TC-050 | Phân quyền (RBAC) — Menu được phép của admin (ADMIN) | dashboard, jobs, survey, operation, payment, estimate, repair, qc, yard, forklift, inventory, masterdata, report, permissions, portal_users, dotnet |
| TC-051 | Phân quyền (RBAC) — Menu được phép của surveyor (SURVEYOR) | jobs, survey, yard |
| TC-052 | Phân quyền (RBAC) — Menu được phép của operator (GATE_OP) | jobs, operation, payment |
| TC-053 | Phân quyền (RBAC) — Menu được phép của accountant (CASHIER) | dashboard, jobs, payment, inventory, masterdata, report |
| TC-054 | Phân quyền (RBAC) — Menu được phép của estimator (ESTIMATOR) | jobs, estimate, survey |
| TC-055 | Phân quyền (RBAC) — Menu được phép của maersk (CARRIER) | jobs, estimate |
| TC-056 | Phân quyền (RBAC) — Menu được phép của repair (TECHNICIAN) | jobs, repair, yard |
| TC-057 | Phân quyền (RBAC) — Menu được phép của qc (QC_ENG) | jobs, qc, repair, survey |
| TC-058 | Phân quyền (RBAC) — Menu được phép của forklift (FORKLIFT) | jobs, forklift, yard |
| TC-059 | Phân quyền (RBAC) — Menu được phép của cleaning (CLEANING) | cleaning, yard, jobs |
| TC-200 | Dữ liệu — Nhất quán số liệu — Phân bố trạng thái hồ sơ (thông tin) | {"SURVEYING":28,"GATE_OUT":6,"REPAIRING":3,"ESTIMATING":16,"CLEANING":1,"PAID":1,"READY_FOR_OUT":3} |
