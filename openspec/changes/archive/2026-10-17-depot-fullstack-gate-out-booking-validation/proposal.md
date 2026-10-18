# Proposal

## Why

Ở màn Gate-Out, "cấp vỏ" hiện chỉ kiểm tra trên giao diện. Đã xác nhận bằng code ngày 17/10/2026:
- `GateOutDispatchModal` bắt buộc nhập *Số Booking lệnh cấp vỏ*, nhưng `GateOutPage.handleConfirmGateOut` chỉ gửi biển số xe, tài xế, mooc và seal lên `POST /api/DepotJobs/{id}/gate-out`.
- `GateOutRequest` không có field booking, và `GateOutAsync` không đọc bảng `CustomerBookings`.

Hệ quả: ai cũng cấp được vỏ của bất kỳ hãng tàu nào, sai kích cỡ hay loại, vượt số lượng booking hoặc theo booking đã hết hạn. `CustomerBookings.UsedCount` không bao giờ tăng, và hồ sơ không lưu container được cấp theo booking nào.

Mặt khác, có những lần ra cổng không có booking (trả vỏ về hãng, chuyển depot, mang đi sửa ngoài). Những trường hợp này cần một đường đi rõ ràng, có ghi lý do, thay vì nhập số booking giả.

Bảng `CustomerBookings` đã có sẵn đủ dữ liệu để đối chiếu, không cần tạo bảng hay module booking mới.

## What Changes

- **Mặc định mọi Gate-Out đều cần booking.** `GateOutRequest` thêm `bookingNo`. Backend kiểm tra theo thứ tự sau và dừng ở lỗi đầu tiên, mỗi lỗi có thông báo tiếng Việt riêng:
  1. booking tồn tại (không phân biệt hoa thường, bỏ khoảng trắng đầu cuối);
  2. trạng thái `ACTIVE`;
  3. còn hạn;
  4. đúng hãng tàu của container;
  5. đúng kích cỡ (`ContainerSize` = `IsoSize` của hồ sơ);
  6. đúng loại (`ContainerType` = nhóm loại của mã container trong *DM Loại Container*);
  7. còn số lượng (`UsedCount < ContainerCount`).
- **Hạn booking tính theo ngày giờ Việt Nam và số giờ quản trị cấu hình:**
  - hạn cuối = 00:00 ngày `ValidUntil` (theo giờ Asia/Ho_Chi_Minh) + *số giờ hiệu lực booking*;
  - mặc định 24 giờ, tức còn hạn đến hết ngày `ValidUntil`;
  - thông báo lỗi chỉ ghi ngày, vd "Booking BK-ABC-0001 đã hết hạn ngày 23/09/2026";
  - không sửa dữ liệu, không thêm cột cho booking; `ValidUntil` vẫn giữ giờ phút như hiện tại, chỉ đổi cách so sánh.
- **Cấu hình quản trị "Số giờ hiệu lực booking":**
  - lưu thành một mục danh mục `GATE_OUT_SETTING` trong `MasterCatalogItems`, theo cách `PAYMENT_ACCOUNT` đang làm, qua API danh mục chung (quyền `masterdata`);
  - có ô nhập trên giao diện quản trị danh mục;
  - chưa cấu hình thì dùng 24 giờ.
- **Tích "Không cần booking":**
  - Gate-Out được bỏ qua kiểm tra booking khi tích ô này **và** chọn lý do: *Trả vỏ về hãng*, *Chuyển depot*, *Sửa ngoài depot*, *Khác* (bắt buộc ghi chú);
  - không đụng tới booking nào;
  - nhật ký `GATE_OUT` ghi "không theo booking" kèm lý do, ghi chú và người thực hiện;
  - **chỉ quản lý (ADMIN) và giám sát (SUPERVISOR)** được làm, qua quyền mới `gateout_nobooking`. Nhân viên cổng (GATE_OP) không thấy ô tích và bị chặn (403) nếu gọi thẳng API; gặp trường hợp không có booking thì gọi giám sát;
  - SUPERVISOR được thấy các màn Gate-Out (menu nhận được nhiều nhóm quyền) nhưng không có Gate-In / phiếu dịch vụ; trên màn Gate-Out chỉ làm được nhánh không booking.
- **Gate-Out theo booking thành công trong cùng một transaction:**
  - hồ sơ chuyển `GATE_OUT` kèm số booking;
  - `UsedCount` tăng đúng 1;
  - ô bãi được giải phóng;
  - ghi nhật ký kèm số vỏ còn lại.

  Cả hai bước ghi đều là cập nhật có điều kiện ở DB, nên không cấp vượt khi nhiều xe lấy vỏ cùng lúc, và không ghi hai lần khi một yêu cầu bị gửi lặp.
- **API kiểm tra booking trước khi cấp** (chỉ đọc): `GET /api/DepotJobs/{id}/gate-out/booking-check?bookingNo=…`, dùng chung bộ kiểm tra với Gate-Out.
- **Hồ sơ lưu số booking cấp vỏ:** cột mới `DepotJob.GateOutBookingNo` (migration `AddGateOutBookingNo`). Gate-Out không booking thì để trống.
- **Frontend:**
  - `GateOutPage` gửi `bookingNo` hoặc cờ không booking kèm lý do, và hiện đúng thông báo lỗi backend;
  - modal có nút kiểm tra booking và ô tích "Không cần booking";
  - màn danh mục có ô cấu hình số giờ hiệu lực booking.
- **BREAKING:** `POST /gate-out` không có `bookingNo` và cũng không tích "không cần booking" kèm lý do sẽ bị từ chối (400). Hiện chỉ có màn Gate-Out gọi API này.

## Capabilities

### New Capabilities

- `gate-out`: cấp vỏ / xuất cổng container theo booking hãng tàu, gồm điều kiện booking hợp lệ, hạn booking theo cấu hình, ngoại lệ không cần booking có lý do, ghi nhận số đã cấp và an toàn khi đồng thời. Đây là spec đầu tiên của nhóm Gate-Out.

### Modified Capabilities

(không có; requirement "Gate-Out chỉ cho container sẵn sàng và đã thanh toán" trong `container-lifecycle` giữ nguyên, booking là điều kiện **thêm** đặc tả ở `gate-out`)

## Impact

- **Backend (`SolutionDepot/`):**
  - `Depot.ViewModels/DepotJobViewModels.cs`: `GateOutRequest` thêm `BookingNo`, `WithoutBooking`, `NoBookingReason`, `NoBookingNote`; DTO hồ sơ thêm `GateOutBookingNo`; DTO kết quả kiểm tra booking mới.
  - `Depot.Application/Services/DepotJobService.cs` và `IDepotJobService.cs`: `GateOutAsync` viết lại theo transaction; hàm kiểm tra booking dùng chung; đọc cấu hình `GATE_OUT_SETTING`.
  - `Depot.BackendApi/Controllers/DepotJobsController.cs`: `GateOut` nhận quyền `operation` hoặc `gateout_nobooking` và kiểm tra theo nhánh; trả đúng mã lỗi (400 / 403 / 404 / 409) và thông điệp; thêm endpoint `booking-check` (quyền `operation`).
  - `Depot.Application/Services/RolePermissions.cs`: hằng `GateOutNoBooking`; SUPERVISOR thêm quyền này.
  - `Depot.Data`: `DepotJob.GateOutBookingNo` (`varchar(50)`, nullable) và migration `AddGateOutBookingNo`, chỉ thêm cột, **không sửa dữ liệu cũ**. Bảng `CustomerBookings` không đổi cấu trúc.
- **Frontend (`fontend/`):**
  - `modules/gate_out/pages/GateOutPage.tsx`, `components/GateOutDispatchModal.tsx` (ô tích chỉ hiện khi có quyền `gateout_nobooking`);
  - `constants/menuPermissions.ts`: `MENU_PERMISSION` nhận mảng nhóm; 4 tab Gate-Out = `['operation', 'gateout_nobooking']`;
  - một khối cấu hình "Số giờ hiệu lực booking" ở màn danh mục (dùng hook / API danh mục chung, quyền `masterdata`).
- **Bảng dữ liệu:**
  - `depot_jobs` (+1 cột);
  - `MasterCatalogItems` có thêm mục `GATE_OUT_SETTING` khi quản trị lưu cấu hình (không seed);
  - `CustomerBookings.UsedCount` bắt đầu được cập nhật thật.
- **Ngoài phạm vi** (làm sau):
  - kiểm tra ngày phát hành booking, khách hàng / nhà xe, mã depot; tự đóng booking khi cấp đủ;
  - huỷ Gate-Out / hoàn số đã dùng; phí lưu bãi; lệnh xe nâng ra cổng;
  - sửa số EIR, lịch sử Gate-Out, giờ UTC, các thông tin xe / tài xế bị bỏ (change `depot-fullstack-gate-out-record-fix`).
