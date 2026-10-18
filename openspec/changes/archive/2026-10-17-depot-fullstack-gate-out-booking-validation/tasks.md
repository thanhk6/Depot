# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 `DepotJob.GateOutBookingNo` (`varchar(50)`, nullable). Migration `AddGateOutBookingNo` (chỉ thêm cột, không sửa dữ liệu cũ). Thêm vào DTO hồ sơ. Kiểm tra: build không lỗi, migration chỉ có `AddColumn`.
- [x] 1.2 DTO:
  - `GateOutRequest` thêm `BookingNo`, `WithoutBooking`, `NoBookingReason` (`OFF_HIRE` / `DEPOT_TRANSFER` / `OFFSITE_REPAIR` / `OTHER`), `NoBookingNote`;
  - `GateOutBookingCheckResult`;
  - `GateOutNotAllowedException(message, kind)`.
- [x] 1.3 Hạn booking.
  - Hàm đọc cấu hình `GATE_OUT_SETTING` / `BOOKING_VALIDITY_HOURS` (mặc định 24 khi thiếu hoặc lỗi).
  - Hàm tính `hạnCuối` và `mốc` so sánh theo giờ Asia/Ho_Chi_Minh, như design.
  - Kiểm tra (test nhỏ hoặc script) các trường hợp: 24h lúc 14:00 cùng ngày còn hạn; 08:00 ngày sau hết hạn; 48h; 720h; đúng nửa đêm.
- [x] 1.4 `MasterDataService` tạo / sửa catalog loại `GATE_OUT_SETTING`: `hours` nguyên 1–8760, chỉ một bản ghi đang dùng. Sai thì báo lỗi tiếng Việt.
- [x] 1.5 `EvaluateGateOutBookingAsync(job, bookingNo, now)`, kiểm tra theo thứ tự trong design:
  - có số → tìm thấy → ACTIVE → còn hạn (thông báo chỉ ghi ngày) → đúng hãng → đúng kích cỡ → đúng nhóm loại theo danh mục (thiếu nhóm loại thì báo lỗi) → còn số lượng;
  - mỗi lỗi nêu giá trị booking và container.
- [x] 1.6 Viết lại `GateOutAsync(jobId, request, actor)` theo transaction:
  - kiểm tra hồ sơ; rẽ nhánh không booking (kiểm tra lý do / ghi chú) hoặc booking (`EvaluateGateOutBookingAsync`);
  - `ExecuteUpdateAsync` hồ sơ với điều kiện READY_FOR_OUT (0 dòng → 409);
  - nhánh booking: `ExecuteUpdateAsync` booking với điều kiện ACTIVE, còn số lượng, `ValidUntil >= mốc`, tăng 1 (0 dòng → rollback, 409);
  - giải phóng ô bãi, nhật ký `GATE_OUT` theo nhánh, commit;
  - cập nhật `IDepotJobService`.
- [x] 1.7 `CheckGateOutBookingAsync(jobId, bookingNo)` (chỉ đọc) và endpoint `GET /api/DepotJobs/{id}/gate-out/booking-check?bookingNo=` (`[RequirePermission(RolePermissions.Operation)]`).
- [x] 1.8 Controller `GateOut`:
  - `RolePermissions` thêm `GateOutNoBooking = "gateout_nobooking"` (ADMIN qua `All`, SUPERVISOR); GATE_OP không có;
  - đổi sang `[RequirePermission(Operation, GateOutNoBooking)]`; nhánh không booking thiếu `gateout_nobooking` → 403, nhánh booking thiếu `operation` → 403;
  - truyền người thực hiện;
  - bắt `GateOutNotAllowedException` trả 400 / 404 / 409 với `Message` cụ thể;
  - bỏ `catch (Exception)` trả `ex.Message`.
  - Kiểm tra: dừng backend, `dotnet build SolutionDepot/SolutionDepot.sln` không lỗi, khởi động lại (migration tự chạy).

## 2. Frontend (`fontend/`)

- [x] 2.0 `constants/menuPermissions.ts`: `MENU_PERMISSION` nhận `string | string[]`; `canAccessMenu` đúng khi có một trong các nhóm; 4 tab Gate-Out = `['operation', 'gateout_nobooking']`. Kiểm tra: type-check không lỗi.
- [x] 2.1 `GateOutDispatchModal`:
  - ô tích **Không cần booking** chỉ hiện khi `allowedTabs` có `gateout_nobooking` (hoặc ADMIN); với GATE_OP hiện dòng nhắc "Không có booking? Gọi giám sát / quản lý cấp vỏ";
  - với tài khoản không có `operation` (SUPERVISOR), mặc định tích sẵn và khoá nhánh booking;
  - khi tích: ẩn ô booking, hiện chọn lý do (Trả vỏ về hãng / Chuyển depot / Sửa ngoài depot / Khác) và ghi chú (bắt buộc khi Khác);
  - nút **Kiểm tra booking** gọi endpoint kiểm tra, hiện hợp lệ / lý do, hạn và số vỏ còn lại;
  - endpoint thêm vào `api/endpoints.ts`.
- [x] 2.2 `GateOutPage.handleConfirmGateOut` gửi `bookingNo` (đã trim) hoặc `withoutBooking`, `noBookingReason`, `noBookingNote`; lỗi hiện đúng `message` backend. Kiểm tra: type-check không lỗi.
- [x] 2.3 Màn **Cấu hình cấp vỏ** (menu `gate_out_settings`, quyền `masterdata` trong `menuPermissions.ts` và `Sidebar`):
  - ô *Số giờ hiệu lực booking*, đọc / lưu qua API danh mục chung;
  - gợi ý cách tính; báo lỗi khi ngoài 1–8760.
  - Kiểm tra: `npx tsc --noEmit -p .` không lỗi.

## 3. Kiểm thử (API trên local + giao diện http://127.0.0.1:3000)

- [x] 3.1 Chuẩn bị:
  - container test `QAGO…` đưa tới READY_FOR_OUT qua API (AV, đã thu tiền phiếu dịch vụ), gồm 40HC, 20GP, 40RH, cùng hãng MSCU;
  - booking test `QA-GO-*` qua API `/Customers/bookings`: hợp lệ, `ValidUntil` = hôm nay 00:15 giờ VN, `ValidUntil` = hôm qua, DELETED, hãng khác, sai kích cỡ, 40RH loại DRY, đã cấp đủ, còn đúng 1 vỏ;
  - ghi lại giá trị cấu hình `GATE_OUT_SETTING` hiện có (nếu có) để khôi phục.
- [x] 3.2 Từng lỗi, mỗi lỗi kiểm tra mã HTTP, thông báo tiếng Việt, và hồ sơ cùng `UsedCount` không đổi:
  - không nhập booking; không tồn tại; DELETED; sai hãng; sai kích cỡ; sai loại; đã cấp đủ;
  - booking hợp lệ nhưng còn phiếu chưa thu.
- [x] 3.3 Hạn booking:
  - cấu hình mặc định: booking hạn hôm nay 00:15 còn hạn; booking hạn hôm qua bị chặn với thông báo đúng dạng "đã hết hạn ngày dd/MM/yyyy";
  - lưu cấu hình 48 giờ: booking hạn hôm qua còn hạn;
  - cấu hình 0 hoặc 9000 bị từ chối;
  - khôi phục cấu hình ban đầu.
- [x] 3.4 Gate-Out theo booking hợp lệ (nhập chữ thường có khoảng trắng):
  - hồ sơ GATE_OUT, `GateOutBookingNo` đúng, `UsedCount` +1;
  - ô bãi giải phóng; nhật ký ghi booking, số còn lại và người thực hiện.
- [x] 3.5 Không cần booking:
  - lý do Trả vỏ về hãng → GATE_OUT, `GateOutBookingNo` trống, không booking nào đổi, nhật ký ghi lý do;
  - không chọn lý do → 400; Khác không ghi chú → 400;
  - hồ sơ chưa thanh toán vẫn bị chặn;
  - phân quyền (tài khoản tạm `qa_go_gate` GATE_OP, `qa_go_sup` SUPERVISOR):
    - GATE_OP gửi không booking → 403;
    - SUPERVISOR gửi không booking → 200, nhật ký ghi tên giám sát;
    - SUPERVISOR gửi theo booking → 403;
    - GATE_OP theo booking → 200.
- [x] 3.6 Đồng thời:
  - booking còn 1 vỏ, 2 container gửi song song (lặp 5 lần với dữ liệu mới) → mỗi lần 200 + 409, `UsedCount = ContainerCount`, không có 500;
  - cùng 1 hồ sơ gửi 2 lần song song và 1 lần nối tiếp → chỉ 1 lần thành công, `UsedCount` +1.
- [x] 3.7 Endpoint kiểm tra: hợp lệ trả `valid` + `remaining`; sai kích cỡ trả lý do; `UsedCount` và hồ sơ không đổi sau khi kiểm tra.
- [x] 3.8 Giao diện:
  - nhập booking sai → Kiểm tra thấy lý do → cấp vỏ thấy đúng thông báo backend;
  - booking đúng → Kiểm tra thấy số còn lại → cấp vỏ thành công;
  - đăng nhập GATE_OP: không thấy ô "Không cần booking", thấy dòng nhắc gọi giám sát;
  - đăng nhập SUPERVISOR: thấy menu Gate-Out, không thấy Gate-In / Phiếu dịch vụ; tích Không cần booking + lý do → cấp vỏ thành công;
  - màn Cấu hình cấp vỏ lưu được 48 rồi đặt lại.
- [x] 3.9 Dọn dữ liệu test:
  - xoá hồ sơ, giám định, vệ sinh, phiếu dịch vụ, khoản thu, nhật ký của container `QAGO…`;
  - xoá booking `QA-GO-*`, khách hàng test nếu tạo, và tài khoản tạm `qa_go_*`;
  - khôi phục hoặc xoá mục `GATE_OUT_SETTING` test;
  - truy vấn DB xác nhận không còn bản ghi test, 2 hồ sơ thật SUDU3070783 và BMOU1675248 không đổi, `UsedCount` của `BK-ABC-0001` / `BK-XYZ-0001` không đổi.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-gate-out-booking-validation` (tạo spec chính mới `openspec/specs/gate-out/`); cập nhật mục *11. Xuất cổng (Gate-Out)* và *Phụ lục B* (cấu hình cấp vỏ) trong `docs/quy-trinh-van-hanh-depot.md`.
- Khi deploy VPS: có migration `AddGateOutBookingNo` (sao lưu DB trước); cần booking ACTIVE còn hạn hoặc dùng "Không cần booking" có lý do (**BREAKING**).
