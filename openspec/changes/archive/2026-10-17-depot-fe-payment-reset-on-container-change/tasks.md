# Tasks

## 1. Frontend (`fontend/`)

- [x] 1.1 `PaymentPage.tsx`: thêm `useEffect` theo `currentCont?.id` bỏ tích `transferChecked`, `cashChecked` và xoá `cashReceived`, `paymentError`; xác nhận `npx tsc --noEmit -p .` không lỗi

## 2. Kiểm thử (http://127.0.0.1:3000)

- [x] 2.1 Chuẩn bị 2 container test có phiếu dịch vụ chưa thu tiền (qua API)
- [x] 2.2 Container A tab Tiền mặt: nhập tiền tài xế đưa + tích; chọn container B → ô tích bỏ, ô tiền trống, nút gạch nợ khoá; tab Chuyển khoản tương tự (tích ở A, chọn B → bỏ tích)
- [x] 2.3 Thu tiền container A xong → màn chuyển sang container còn lại với ô tích chưa tích; gạch nợ container còn lại vẫn làm được sau khi tích
- [x] 2.4 Dọn dữ liệu test: xoá hồ sơ, phiếu giám định, lệnh vệ sinh, phiếu dịch vụ, khoản thu, nhật ký của container test; xác nhận bằng truy vấn DB không còn bản ghi nào

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fe-payment-reset-on-container-change` sau khi duyệt; requirement "Kế toán tự tích xác nhận trước khi gạch nợ" trong `openspec/specs/payment/spec.md` có 4 scenario.
