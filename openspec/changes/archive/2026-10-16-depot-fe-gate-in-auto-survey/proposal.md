# Proposal

## Why

Sau Gate-In, container đã ở trạng thái chờ giám định nhưng nhân viên vẫn phải đóng hộp thoại e-EIR, tự xoá từng ô của form và tự bấm sang màn Giám Định. Người dùng muốn Gate-In xong thì tự chuyển sang Giám Định và form được xoá sạch cho container kế tiếp.

## What Changes

- Gate-In thành công: form Gate-In được xoá trắng (hãng tàu và loại container về mục đầu tiên của danh mục, như lúc mới mở màn).
- Gate-In thành công và tài khoản được mở màn Giám Định: tự chuyển sang màn **2. Giám Định**, hiện thông báo kèm số container và số e-EIR; không mở hộp thoại e-EIR nữa.
- Tài khoản không được mở màn Giám Định: ở lại màn Gate-In, hiện thông báo và hộp thoại e-EIR như hiện tại (form vẫn được xoá).
- Gate-In thất bại: giữ nguyên form và lỗi như hiện tại.

## Capabilities

### New Capabilities
- (không có)

### Modified Capabilities
- `gate-in`: thêm hành vi sau khi Gate-In thành công — xoá form và tự chuyển sang Giám Định theo quyền.

## Impact

- Màn hình: **1. Tiếp Nhận Cổng (Gate-In)** — `fontend/src/modules/gate/pages/GateInPage.tsx`; điều hướng tab ở `fontend/src/App.tsx`.
- Không đổi API, backend, bảng dữ liệu; không có migration EF Core.
- Phân quyền: dùng quyền menu `survey` sẵn có (`fontend/src/constants/menuPermissions.ts`), không thêm quyền mới.
- Ngoài phạm vi: in phiếu e-EIR, tự nhận phiếu giám định thay giám định viên, chuyển màn cho các công đoạn khác.
