# Design

## Context

- `PaymentPage.tsx`: tab `BANK_TRANSFER` có state `transferChecked` + ô tích, nút khoá khi chưa tích; tab `CASH` không có ô tích, nút chỉ khoá khi tiền khách đưa nhỏ hơn số phải thu (ô trống = đưa đúng số tiền).
- `VietQrCode.tsx` tự tải tài khoản nhận tiền từ danh mục (`masterDataApi`); không có tài khoản thì render `VietQrNotConfigured` (thông báo chưa cấu hình). Mã QR sinh ngay trên trình duyệt, không gọi ngân hàng.
- `VietQrCode` còn được dùng ở 3 modal module Khai thác — những chỗ đó vẫn muốn thấy thông báo chưa cấu hình.
- Backend `ProcessPaymentAsync` không cần đổi: đã kiểm tra số tiền, chống thu trùng, ghi người thu và nhật ký.

## Goals / Non-Goals

**Goals:**
- Một kiểu thao tác cho cả hai hình thức: xem số tiền → tự kiểm tra → tích → gạch nợ.

**Non-Goals:**
- Không bắt buộc mã giao dịch ngân hàng, không đổi phân quyền, không tắt webhook.

## Decisions

- **Ô tích chỉ ở giao diện, không gửi lên backend.** Backend không kiểm chứng được việc kế toán đã nhìn thấy tiền; ô tích là bước chặn bấm nhầm. Phương án gửi cờ `confirmed` lên API bị loại vì không thêm bảo đảm nào mà phải đổi API.
- **Dùng một state xác nhận riêng cho mỗi hình thức** (`transferChecked` sẵn có + `cashChecked` mới), cùng bỏ tích khi đổi tab và sau khi thu xong — tránh tích ở tab này nhưng gạch nợ ở tab kia.
- **Thêm prop `hideWhenNotConfigured` cho `VietQrCode`** (mặc định `false`) thay vì sửa hành vi chung: màn Thanh Toán truyền `true` để ẩn khi chưa có tài khoản; 3 modal Khai thác không đổi. Số tiền và nội dung chuyển khoản hiện ở PaymentPage (dùng `buildTransferContent` / `normalizeTransferContent` sẵn có) để vẫn có khi QR bị ẩn.
- **Giữ ô tiền tài xế đưa / tiền thối** theo lựa chọn của người dùng; kiểm tra "tiền đưa ≥ số phải thu" vẫn áp dụng cùng với ô tích.

## Risks / Trade-offs

- [Khi QR đã hiện, thông tin số tiền bị lặp ở QR và ở dòng số tiền] → chấp nhận; dòng số tiền là thông tin chính kế toán đối chiếu.
- [Ô tích không chống được việc kế toán tích bừa] → ngoài phạm vi; nhật ký thu vẫn ghi người xác nhận để truy vết.

## Migration Plan

Chỉ đổi frontend. Rollback = bỏ ô tích tiền mặt và bỏ `hideWhenNotConfigured` ở PaymentPage.
