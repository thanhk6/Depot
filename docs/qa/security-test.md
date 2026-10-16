# Security Test — SolutionDepot

Kiểm thử bảo mật ở mức QA: chỉ đọc, gọi API với dữ liệu test (tiền tố `QA`), **không** tấn công phá hoại, **không** brute-force
hay DoS, không khai thác sâu hơn mức cần để chứng minh lỗi. Trên VPS production chỉ thực hiện các request không cần đăng nhập
và 6 lần đăng nhập sai để xác nhận cơ chế khoá.

Chi tiết từng bug xem [bug-report.md](bug-report.md); các ca kiểm thử xem [test-cases.md](test-cases.md).

## 1. Tổng quan

| Hạng mục | Kết quả |
|---|---|
| Xác thực (JWT, đăng nhập, khoá tài khoản) | ✅ Tốt, trừ đăng xuất không thu hồi token |
| Phân quyền theo vai trò | ❌ **Nghiêm trọng** — chỉ `/api/system/*` được bảo vệ |
| Kiểm soát dữ liệu theo chủ thể (IDOR / mạo danh) | ❌ Nhận việc thay người khác; hãng tàu xem được công nợ của hãng khác |
| Injection (SQL, XSS) | ✅ Không phát hiện |
| Upload file | ✅ Chặn đúng loại nguy hiểm; ❌ tải file không cần đăng nhập |
| Truyền tải | ❌ Không có HTTPS |
| Header / CORS | ⚠️ Thiếu header bảo mật; CORS `*` ở Development |
| Lộ bí mật | ❌ Bundle JS production chứa mật khẩu mặc định và khoá mẫu |
| Audit | ❌ Không ghi nhật ký thao tác quản trị |

---

# SECURITY ISSUE

| # | Vấn đề | Mức độ | Bug | Môi trường |
|---|---|---|---|---|
| S-01 | API không phân quyền theo vai trò: mọi tài khoản đã đăng nhập đọc/sửa/xoá được công nợ, báo cáo, kho, danh mục, file | **Critical** | [BUG-001](bug-report.md#bug-001) | Local (cùng mã với VPS) |
| S-02 | Giao diện không ẩn menu theo quyền — che giấu thông tin không có hiệu lực, làm lộ toàn bộ chức năng | High | [BUG-002](bug-report.md#bug-002) | Local |
| S-03 | Bỏ qua quy trình bằng `PATCH /status` — mọi vai trò có thể đưa container chưa giám định ra khỏi bãi | High | [BUG-003](bug-report.md#bug-003) | Local |
| S-04 | Không có HTTPS — mật khẩu và JWT truyền dạng rõ | High | [BUG-006](bug-report.md#bug-006) | VPS |
| S-05 | Đăng xuất không thu hồi token, token sống 8 giờ | Medium | [BUG-011](bug-report.md#bug-011) | Local |
| S-06 | Mạo danh khi nhận việc giám định (`staffId` từ client) | Medium | [BUG-012](bug-report.md#bug-012) | Local |
| S-07 | Tải ảnh hồ sơ không cần đăng nhập | Medium | [BUG-013](bug-report.md#bug-013) | VPS + Local |
| S-08 | Bundle JS chứa `Password@123` (mật khẩu mặc định tài khoản tài xế), `passwordHash:"123456"`, `clientSecret`, `apiKey` mẫu | Medium | [BUG-014](bug-report.md#bug-014) | VPS |
| S-09 | Báo giá tin tổng tiền từ client — có thể sửa số tiền gửi hãng tàu | Medium | [BUG-008](bug-report.md#bug-008) | Local |
| S-10 | Không ghi audit thao tác quản trị người dùng (tạo, xoá, đặt lại mật khẩu) | Medium | [BUG-010](bug-report.md#bug-010) | Local |
| S-11 | Thiếu header bảo mật, lộ `X-Powered-By: Express`; CORS `*` ở Development | Low | [BUG-031](bug-report.md#bug-031) | VPS + Local |
| S-12 | Upload gắn file vào bảng/bản ghi tuỳ ý | Low | [BUG-028](bug-report.md#bug-028) | Local |

### Chi tiết các vấn đề quan trọng

**S-01 — Broken Access Control (OWASP A01).**
Tài khoản `maersk` (vai trò CARRIER — đại diện hãng tàu, người ngoài công ty) gọi `GET /api/billing/debts` nhận công nợ của
**mọi** hãng tàu và gọi được `POST /api/MasterData/service-tariffs` để tạo biểu cước của Depot. Tài khoản `forklift` xoá được ảnh
giám định do surveyor upload (`DELETE /api/depot-files/{id}`). Nguyên nhân: `Program.cs` chỉ có
`FallbackPolicy = RequireAuthenticatedUser()`, không controller nào (trừ `SystemController`) khai báo role/policy. Kết hợp với S-02:
người dùng thường **chỉ cần bấm menu** là thấy dữ liệu, không cần công cụ gì.

**S-03 — Bỏ qua kiểm soát nghiệp vụ.**
Tài khoản FORKLIFT: `PATCH /api/DepotJobs/{id}/status {"status":"READY_FOR_OUT"}` rồi `POST /gate-out` → container vừa Gate-In
ra khỏi bãi, không có phiếu giám định, không thanh toán. Hai hồ sơ QA (QABU4182053, QABU3877225) đang ở trạng thái này.

**S-04 / S-08 — Production.**
Website production chạy HTTP thuần trên cổng 3001; thêm vào đó bundle production còn chứa mật khẩu mặc định `Password@123` gán cho
tài khoản tài xế tạo từ màn Khách hàng — ai tải file JS cũng biết mật khẩu ban đầu của các tài khoản này.

---

## 2. Các kiểm tra đạt (PASS)

| Kiểm tra | Kết quả | TC |
|---|---|---|
| Đăng nhập sai / user không tồn tại trả cùng thông báo (không lộ user tồn tại) | ✅ | TC-012, TC-013 |
| Khoá tạm sau 5 lần sai (HTTP 429, 30 phút) — local và VPS | ✅ | TC-021, TC-327 |
| SQL injection ở form đăng nhập và ô tìm kiếm (`' OR 1=1 --`, `%`, `_`, `\`) | ✅ Không lỗi, không lộ dữ liệu | TC-019, TC-209…TC-214 |
| Token rác, `alg=none`, sửa payload giữ chữ ký cũ, hết hạn | ✅ 401 | TC-023…TC-026, TC-325 |
| 144/144 API BackendApi trên VPS không token → 401 | ✅ | TC-324 |
| `/api/system/*` chỉ ADMIN — 9/9 vai trò khác nhận 403, kể cả tạo tài khoản ADMIN | ✅ | TC-031…TC-040 |
| Danh sách người dùng không trả hash / mật khẩu tạm | ✅ | TC-041 |
| Người dùng bị xoá không đăng nhập được | ✅ | TC-191 |
| XSS lưu trữ: tên danh mục chứa `<img onerror>` / `<script>` hiển thị dạng văn bản | ✅ | TC-117, TC-260 |
| Upload: chặn `.exe`, `.html`, `.svg` có script, exe đổi đuôi `.jpg` (kiểm tra magic bytes), file 0 byte, 21 MB | ✅ | TC-229…TC-235 |
| Path traversal ở tên file upload và URL tải file (`..%2F`) | ✅ Tên file được làm sạch; URL trả 400 | TC-233, VPS |
| Lỗi không lộ stack trace / tên lớp .NET | ✅ | TC-244 |
| Webhook ngân hàng với secret sai → 401 | ✅ | TC-286 |
| Tài xế xe nâng gửi `operatorId` người khác → bị từ chối | ✅ | TC-322 |
| Giao diện: token hết hạn giữa phiên → về màn đăng nhập; Back sau đăng xuất không vào lại được; giả phiên bằng localStorage không lấy được dữ liệu | ✅ | TC-251, TC-253, TC-329 |

## 3. Ghi chú

- **Đặt lại mật khẩu yếu:** mật khẩu `"1"` bị từ chối "Mật khẩu phải có tối thiểu 8 ký tự" (TC-187) — chính sách độ dài đang có hiệu lực.
- **JWT key**: `appsettings.Development.json` dùng key `DEV_ONLY_INSECURE_JWT_KEY_...`; trên VPS key lấy từ `.env`. Test `alg=none`/chữ ký
  giả trên VPS đều bị từ chối — không có dấu hiệu dùng key dev trên production (không thử đoán key).
- **Mật khẩu root VPS** đã được gửi qua kênh chat trong quá trình làm việc — khuyến nghị đổi mật khẩu và chuyển sang đăng nhập bằng SSH key.
- Không thực hiện: brute-force mật khẩu, quét cổng, fuzzing khối lượng lớn, DoS/load test (theo yêu cầu).
