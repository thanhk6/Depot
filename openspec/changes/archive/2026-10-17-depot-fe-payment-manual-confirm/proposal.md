# Proposal

## Why

Depot chưa kết nối API ngân hàng, nên việc thu tiền phiếu dịch vụ là kế toán tự kiểm tra tiền (tiền mặt nhận tại quầy, hoặc tiền chuyển khoản đã về tài khoản) rồi tự xác nhận trên hệ thống. Màn Thanh Toán hiện chưa thống nhất: chuyển khoản phải tích "đã kiểm tra" nhưng tiền mặt bấm là gạch nợ ngay; tab chuyển khoản báo "VietQR chưa cấu hình" như một lỗi khi chưa khai báo tài khoản ngân hàng.

## What Changes

- Cả hai hình thức **Tiền mặt** và **Chuyển khoản** đều có ô tích xác nhận của kế toán; chưa tích thì nút gạch nợ bị khoá.
- Tab Chuyển khoản luôn hiện số tiền phải thu và nội dung chuyển khoản; mã QR VietQR chỉ hiện khi đã khai báo tài khoản nhận tiền trong danh mục, chưa khai báo thì ẩn (không báo lỗi).
- Tiền mặt giữ nguyên ô "tiền tài xế đưa" và tiền thối như hiện tại.
- Không đổi backend: kiểm tra số tiền, chống thu trùng, nhật ký thu giữ nguyên; webhook VietQR không bị đụng tới.

## Capabilities

### New Capabilities
- (không có)

### Modified Capabilities
- `payment`: thêm hành vi màn Thanh Toán — kế toán tự tích xác nhận cho cả hai hình thức; mã QR chỉ hiện khi đã khai báo tài khoản.

## Impact

- Màn hình **5. Thanh Toán VietQR** — `fontend/src/modules/payment/pages/PaymentPage.tsx`.
- Component dùng chung `fontend/src/components/common/VietQrCode.tsx`: thêm tuỳ chọn ẩn khi chưa khai báo tài khoản; 3 chỗ dùng ở module Khai thác (`QuickQrModal`, `ServiceOrderDetailModal`, `ServiceOrderFormModal`) giữ nguyên hành vi.
- Không đổi API, bảng dữ liệu; không có migration EF Core.
- Ngoài phạm vi: bắt buộc nhập mã giao dịch ngân hàng, giới hạn vai trò được xác nhận, tắt webhook VietQR, kết nối API ngân hàng.
