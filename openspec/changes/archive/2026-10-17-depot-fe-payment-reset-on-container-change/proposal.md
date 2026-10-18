# Proposal

## Why

Sau change `depot-fe-payment-manual-confirm`, ô tích xác nhận của kế toán tự bỏ khi đổi hình thức và khi thu xong, nhưng **không** bỏ khi chọn sang container khác trong danh sách chờ thanh toán. Kế toán có thể tích cho container A rồi bấm sang container B và gạch nợ B mà chưa kiểm tra tiền của B.

## What Changes

- Khi container đang thanh toán trên màn Thanh Toán đổi sang container khác (bấm chọn trong danh sách, hoặc tự chuyển sang container kế tiếp sau khi thu xong), cả hai ô tích xác nhận (Tiền mặt, Chuyển khoản) được bỏ tích.
- Ô "tiền tài xế đưa" cũng được xoá khi đổi container, để tiền thối không tính theo số tiền của container trước.
- Không đổi backend, API hay dữ liệu.

## Capabilities

### New Capabilities
- (không có)

### Modified Capabilities
- `payment`: requirement "Kế toán tự tích xác nhận trước khi gạch nợ" — thêm điều kiện bỏ tích khi đổi container.

## Impact

- Màn hình **5. Thanh Toán VietQR** — `fontend/src/modules/payment/pages/PaymentPage.tsx`.
- Không có migration EF Core, không đổi API.
- Ngoài phạm vi: ô ghi chú phiếu thu tiền mặt (giữ nguyên giá trị mặc định), các màn khác.
