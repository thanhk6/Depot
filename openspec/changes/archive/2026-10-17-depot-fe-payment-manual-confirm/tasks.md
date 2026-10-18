# Tasks

## 1. Frontend (`fontend/`)

- [x] 1.1 `VietQrCode.tsx`: thêm prop tuỳ chọn `hideWhenNotConfigured` (mặc định `false`) — khi `true` và chưa có tài khoản nhận tiền thì không render gì; 3 modal Khai thác không truyền prop nên giữ nguyên; xác nhận `npx tsc --noEmit -p .` không lỗi
- [x] 1.2 `PaymentPage.tsx` tab Chuyển khoản: hiện số tiền phải thu + nội dung chuyển khoản ngay trên màn, `VietQrCode` truyền `hideWhenNotConfigured`; giữ ô tích + nút khoá như cũ; xác nhận type-check không lỗi
- [x] 1.3 `PaymentPage.tsx` tab Tiền mặt: thêm state `cashChecked` + ô tích "Đã nhận đủ tiền mặt", nút gạch nợ khoá khi chưa tích (vẫn khoá khi tiền đưa < số phải thu), `submitPayment` chặn khi chưa tích; bỏ tích cả hai ô khi đổi tab và sau khi thu xong; xác nhận type-check không lỗi

## 2. Kiểm thử (http://127.0.0.1:3000)

- [x] 2.1 Chuẩn bị 2 container test đã có phiếu dịch vụ chưa thu tiền (Gate-In → giám định → vệ sinh → bàn giao → lập phiếu qua API)
- [x] 2.2 Tab Tiền mặt: chưa tích thì nút khoá; tích rồi gạch nợ → phiếu đã thanh toán, nhật ký thu ghi người thu; xác nhận bằng API / DB
- [x] 2.3 Tab Chuyển khoản: (a) với tài khoản nhận tiền đang có trong danh mục (PAYMENT_ACCOUNT Techcombank) thấy mã QR; (b) tạm tắt tài khoản đó trong danh mục → không có mã QR, không có thông báo "chưa cấu hình", vẫn có số tiền + nội dung; tích rồi gạch nợ thành công; bật lại tài khoản sau khi thử và xác nhận danh mục như ban đầu
- [x] 2.4 Tích ở tab Chuyển khoản rồi đổi sang Tiền mặt: ô tích Tiền mặt chưa tích, nút khoá
- [x] 2.5 Mở modal Khai thác có `VietQrCode` (chi tiết phiếu dịch vụ): vẫn hiện thông báo chưa cấu hình như cũ
- [x] 2.6 Dọn dữ liệu test: xoá hồ sơ, phiếu giám định, lệnh vệ sinh, phiếu dịch vụ, khoản thu, nhật ký của container test; xác nhận bằng truy vấn DB không còn bản ghi nào

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fe-payment-manual-confirm` sau khi duyệt; `openspec/specs/payment/spec.md` sẽ có 9 requirement.
- Cập nhật mục Thanh toán trong `docs/quy-trinh-van-hanh-depot.md` khi archive.
