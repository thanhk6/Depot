# Test Scenarios — SolutionDepot

Kịch bản kiểm thử theo module, ở mức "cần kiểm tra điều gì". Mỗi kịch bản trỏ tới các test case đã thực thi trong
[test-cases.md](test-cases.md). Kết quả: ✅ đạt · ❌ có lỗi (kèm bug) · ⛔ BLOCKED · ⏸ NOT TESTED.

## TS-01 Authentication

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-01.1 | Đăng nhập đúng với từng vai trò (10 vai trò), bằng username và email | TC-001…011 | ✅ |
| TS-01.2 | Đăng nhập sai: sai mật khẩu, user không tồn tại, rỗng, null, JSON hỏng, SQLi, 10.000 ký tự | TC-012…020 | ✅ |
| TS-01.3 | Khoá tạm sau 5 lần sai | TC-021, TC-327 | ✅ |
| TS-01.4 | Token: không có, rác, `alg=none`, sửa payload, hết hạn, thời hạn | TC-022…027 | ✅ |
| TS-01.5 | Đăng xuất vô hiệu token | TC-028 | ❌ BUG-011 |
| TS-01.6 | API refresh-token / me mà frontend khai báo | TC-029, TC-030 | ❌ BUG-030 |
| TS-01.7 | UI: đăng nhập → Dashboard, F5 giữ phiên, token hết hạn giữa phiên, đăng xuất, Back sau đăng xuất | TC-249…253 | ✅ |

## TS-02 Phân quyền

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-02.1 | API quản trị hệ thống chỉ ADMIN (9 vai trò khác) | TC-031…040 | ✅ |
| TS-02.2 | Không lộ mật khẩu/hash qua API người dùng | TC-041 | ✅ |
| TS-02.3 | Vai trò không liên quan gọi API công nợ, báo cáo, kho, danh mục, file | TC-042…049, TC-239 | ❌ BUG-001 |
| TS-02.4 | Sidebar chỉ hiện menu được phép; màn không được phép bị chặn | TC-269, TC-270 | ❌ BUG-002 |
| TS-02.5 | Người dùng CRUD: tạo, trùng, vai trò sai, reset mật khẩu, xoá, đăng nhập sau xoá | TC-181…191 | ✅ (trừ email — BUG-024) |
| TS-02.6 | Audit các thao tác quản trị | TC-193 | ❌ BUG-010 |

## TS-03 Gate-In

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-03.1 | Số container: rỗng, sai check digit, sai độ dài, ký tự đặc biệt, chữ thường + khoảng trắng | TC-060…063, TC-075 | ✅ |
| TS-03.2 | Loại container / hãng tàu không tồn tại hoặc rỗng | TC-064…066 | ✅ |
| TS-03.3 | Tare / payload âm hoặc 0 | TC-067…069 | ✅ |
| TS-03.4 | Thông tin xe/tài xế: rỗng, SĐT chữ, tên quá dài, nhân viên không tồn tại | TC-070…074 | ❌ BUG-025 |
| TS-03.5 | Trùng container đang trong bãi (tuần tự, double-submit, đồng thời) | TC-078, TC-079, TC-110 | ❌ BUG-004 |
| TS-03.6 | Sinh JobNo, e-EIR; đọc lại hồ sơ khớp dữ liệu nhập | TC-076, TC-077 | ✅ |
| TS-03.7 | UI: double-click Xác nhận tiếp nhận | TC-258, TC-259 | ✅ |

## TS-04 Vòng đời container (end-to-end)

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-04.1 | Thực hiện bước sau khi chưa qua bước trước (duyệt, báo giá, sửa, QC, Gate-Out khi đang SURVEYING) | TC-080…084 | ✅ |
| TS-04.2 | Đổi trạng thái trực tiếp bỏ qua quy trình rồi Gate-Out | TC-085…087 | ❌ BUG-003 |
| TS-04.3 | Giám định: nhận việc, nhận trùng, mạo danh, dữ liệu sai, hợp lệ | TC-088…092, TC-246 | ❌ BUG-012, BUG-023 |
| TS-04.4 | Báo giá: âm, tổng không khớp, hợp lệ; từ chối không lý do; duyệt, duyệt lại | TC-093…098 | ❌ BUG-008 |
| TS-04.5 | Sửa chữa: bắt đầu, bắt đầu lại, hoàn tất không ảnh, ảnh sau sửa | TC-099…101, TC-240…242 | ❌ BUG-009 |
| TS-04.6 | QC không đạt → sửa lại; QC đạt → sẵn sàng/vệ sinh; id URL ≠ body | TC-102…104 | ✅ |
| TS-04.7 | Gate-Out thiếu thông tin, hợp lệ, lần 2; Gate-In lại vòng đời mới | TC-105…108 | ✅ |
| TS-04.8 | Lịch sử ghi đủ các bước | TC-109 | ✅ |

## TS-05 Khai thác, thanh toán, công nợ

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-05.1 | Phiếu dịch vụ: hợp lệ, âm, rỗng, hồ sơ không tồn tại, công thức tổng tiền | TC-274…278 | ✅ |
| TS-05.2 | Thanh toán: sai tiền, âm, đúng, 2 lần, giữ trạng thái hồ sơ, PAID, huỷ phiếu đã thu | TC-279…285 | ✅ |
| TS-05.3 | Webhook ngân hàng sai secret | TC-286 | ✅ |
| TS-05.4 | Công nợ: đồng bộ, phân bổ sai, số âm, hoá đơn không tồn tại | TC-287…292 | ✅ |
| TS-05.5 | Phân bổ vượt số nợ | TC-291 | ⛔ công nợ = 0 |
| TS-05.6 | Chốt kỳ | TC-293 | ⏸ tránh khoá kỳ |

## TS-06 Master Data

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-06.1 | Catalog CRUD: tạo, thiếu mã/tên, trùng (khác hoa thường), quá dài, sửa, tạm ngưng, xoá, xoá lại, tạo lại mã đã xoá | TC-111…128 | ✅ |
| TS-06.2 | Xoá bản ghi đang được tham chiếu | TC-129, TC-151 | ⏸ tránh phá dữ liệu thật |
| TS-06.3 | Cước nâng hạ: CRUD, giá âm, VAT | TC-130…139 | ❌ BUG-017 |
| TS-06.4 | Cước lưu bãi: bậc giá sai/chồng lấn/rỗng, ngày miễn phí âm | TC-140…146 | ❌ BUG-018 |
| TS-06.5 | Hãng tàu: CRUD, email | TC-147…152 | ❌ BUG-024 |
| TS-06.6 | Vật tư: trùng mã, min > max | TC-153…156 | ❌ BUG-007, BUG-026 |

## TS-07 Kho, khách hàng, vệ sinh, bãi, thông báo

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-07.1 | Nhập/xuất kho: vượt tồn, 0, âm, vật tư/loại không tồn tại, tồn không âm | TC-157…163 | ❌ BUG-019 |
| TS-07.2 | Khách hàng, tài xế, xe, booking, tài khoản cổng | TC-164…180 | ❌ BUG-020, BUG-024 |
| TS-07.3 | Vệ sinh: tiếp nhận, trùng, không tồn tại, giá âm, bàn giao | TC-294…301 | ❌ BUG-021 |
| TS-07.4 | Block bãi: kích thước/trạng thái sai; di chuyển container vào ô bận/không tồn tại | TC-302…306 | ❌ BUG-022 |
| TS-07.5 | Xe nâng: nhận, nhận trùng, bắt đầu khi không nhận, mạo danh operatorId, huỷ | TC-319…323 | ✅ |
| TS-07.6 | Thông báo & mẫu tin: tạo, rỗng, người nhận không tồn tại, huỷ | TC-194…198, TC-307…310 | ❌ BUG-027 |
| TS-07.7 | Màn Zalo | TC-271 | ❌ BUG-005 |

## TS-08 File

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-08.1 | Upload JPG/PNG hợp lệ | TC-227, TC-228 | ✅ |
| TS-08.2 | Chặn exe, html, svg, exe đổi đuôi, `../`, 0 byte, 21 MB | TC-229…235 | ✅ |
| TS-08.3 | Gắn file vào bản ghi/bảng không tồn tại | TC-236, TC-237 | ❌ BUG-028 |
| TS-08.4 | Tải file không đăng nhập | TC-238, TC-333 | ❌ BUG-013 |
| TS-08.5 | Hiển thị ảnh trên UI local | TC-248 | ⛔ dev server cũ |

## TS-09 Dữ liệu & tìm kiếm

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-09.1 | Số container trong bãi khớp giữa Danh sách / Dashboard / Sơ đồ bãi | TC-199, TC-226 | ✅ |
| TS-09.2 | Không có trạng thái lạ, không trùng hồ sơ hoạt động, hồ sơ ra bãi đều đã giám định | TC-201…203 | ❌ BUG-003, BUG-004 |
| TS-09.3 | API chi tiết với ID không tồn tại | TC-220…225 | ❌ BUG-029 |
| TS-09.4 | Tìm kiếm/lọc API: từ khoá, trạng thái, ký tự đặc biệt | TC-205…218 | ✅ |
| TS-09.5 | Phân trang phía server | TC-219 | ⏸ API không hỗ trợ |
| TS-09.6 | Tìm kiếm / phân trang UI; xuất CSV | TC-261…266 | ✅ (TC-265 ⏸ không có chức năng) |

## TS-10 Giao diện, xử lý lỗi, hiệu năng

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-10.1 | Quét 55 menu desktop/mobile: không lỗi JS, không tràn ngang | TC-271, TC-273 | ❌ BUG-005 (còn lại ✅) |
| TS-10.2 | API lỗi 500 / 403 / mất mạng / chậm | TC-254…257 | ❌ BUG-016, BUG-032 |
| TS-10.3 | Tương phản, nhãn | TC-267, TC-268 | ❌ BUG-033 |
| TS-10.4 | Thời gian phản hồi API chính | TC-311…318 | ✅ |
| TS-10.5 | Kích thước danh sách hồ sơ | TC-204 | ❌ BUG-034 |
| TS-10.6 | Tải trang lần đầu trên VPS | TC-334 | ❌ BUG-015 |

## TS-11 Production (VPS)

| ID | Kịch bản | TC | KQ |
|---|---|---|---|
| TS-11.1 | 144 API không token | TC-324 | ✅ |
| TS-11.2 | Token giả, đăng nhập sai, khoá, double-click, giả phiên | TC-325…329 | ✅ |
| TS-11.3 | HTTPS, header, bí mật trong bundle, file không đăng nhập | TC-330…333 | ❌ BUG-006, 031, 014, 013 |
| TS-11.4 | Giao diện màn đăng nhập | TC-335 | ✅ |
| TS-11.5 | Chức năng cần đăng nhập | TC-336 | ⛔ không có tài khoản hợp lệ |
