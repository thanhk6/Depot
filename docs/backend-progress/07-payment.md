# 07 — 5. Thanh Toán VietQR

Menu: `payment` → `PaymentPage.tsx` (`fontend/src/modules/payment/pages/PaymentPage.tsx`), xác nhận qua
`App.tsx` (`case 'payment'`).

## Frontend gọi gì

```ts
paymentApi.getServiceOrders()                                    // load phiếu dịch vụ để tính phí/PAID-UNPAID
paymentApi.processPayment(jobId, method, txRef, amount)           // gạch nợ VietQR hoặc Tiền mặt
```

`jobId` truyền vào là `currentCont.id` — chính là `DepotJob.Id` (Guid), vì `containers` prop được
`App.tsx` build từ `job.id` (xem 02-container-list.md), không phải id của `ServiceOrder`.

## Đối chiếu backend

- `GET /api/service-orders` — dùng chung endpoint đã audit ở màn 06, khớp field `containerNo`,
  `grandTotal`, `totalVat`, `items[].category/total`, `paymentStatus`. ✅
- `POST /api/depot/jobs/{jobId}/payment` → route riêng `PaymentsController`
  (`[Route("api/depot/jobs/{jobId:guid}/payment")]`, không dùng `[controller]` mặc định) — khớp chính
  xác với `API_ENDPOINTS.DEPOT_JOBS.PAYMENT` (`/depot/jobs/${id}/payment`) phía frontend. Ban đầu nghi
  ngờ đây là route sai (không match tên controller `DepotJobsController`), nhưng kiểm tra kỹ thì đây là
  1 controller khác (`PaymentsController`) khai báo route tường minh — đúng chủ đích, không phải lỗi.
  - `ProcessPaymentAsync`: validate `ServiceOrder` tồn tại, chưa `PAID`, `amount == serviceOrder.GrandTotal`
    → tạo/cập nhật `Payment`, set `ServiceOrder.PaymentStatus/Status/PaymentMethod/TransactionId`, và
    `DepotJob.Status = "PAID"`. Đủ để frontend tự làm mới danh sách Pending/Paid ở lần load lại (lọc theo
    `serviceOrder.paymentStatus`). ✅

Không phát hiện lỗi tích hợp — cả 2 endpoint hoạt động đúng, không cần sửa code.

## Trạng thái: ✅ Xong

- [x] `GET /api/service-orders` — khớp, không cần sửa
- [x] `POST /api/depot/jobs/{jobId}/payment` — khớp, không cần sửa (route riêng đã đúng chủ đích)
- [x] Không cần build lại (không đổi code)
