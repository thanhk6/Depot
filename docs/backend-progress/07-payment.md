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
    → tạo/cập nhật `Payment`, set `ServiceOrder.PaymentStatus/Status/PaymentMethod/TransactionId`. ✅

## Cập nhật 2026-09-06: chạy thử thật phát hiện bug cross-module nghiêm trọng, đã sửa

Chạy thử thật chuỗi Gate-In→Survey→Cleaning→Operation→**Payment**→Estimate cho cùng 1 container (thay vì
audit tĩnh từng màn riêng lẻ) lộ ra: `ProcessPaymentAsync` trước đây còn 1 dòng `job.Status = "PAID"` ghi
đè **vô điều kiện**, bất kể job đang ở trạng thái nào. Phí Khai Thác Gate-In (LOLO/lưu bãi, thanh toán ở
màn này) và Estimate sửa chữa (màn kế tiếp trong menu) là 2 luồng độc lập nhưng dùng chung
`DepotJob.Status` — thanh toán phí Gate-In cho 1 container đang `ESTIMATING` (chờ báo giá vì Survey phát
hiện hư hỏng) sẽ xoá mất trạng thái đó, khiến `CreateOrUpdateEstimateAsync` (yêu cầu đúng
`Status == "ESTIMATING"`) từ chối vĩnh viễn — container không bao giờ lập được báo giá sửa chữa nữa.

Grep toàn backend xác nhận không nơi nào khác đọc `DepotJob.Status == "PAID"` làm điều kiện thật (chỉ
`ServiceOrder.PaymentStatus`/`Payment.Status` mới thật sự được dùng để biết đã thu tiền) — đã xoá hẳn dòng
`job.Status = "PAID"`, giữ nguyên trạng thái vòng đời thật của job. Verify thật: tạo job mới → Survey (C,
có damage) → tạo ServiceOrder → thanh toán qua đúng endpoint này → job vẫn `ESTIMATING` → tạo Estimate
thành công (trước khi sửa thì bước cuối luôn trả 400 "Hồ sơ công việc không hợp lệ"). `dotnet build` toàn
solution 0 lỗi.

**Bài học:** audit tĩnh từng màn riêng lẻ (đúng như đã làm ở đợt trước, ghi "không cần sửa") không đủ để
bắt bug loại "2 luồng nghiệp vụ độc lập ghi đè chung 1 field trạng thái" — chỉ lộ ra khi chạy thật đúng thứ
tự menu cho CÙNG 1 container xuyên suốt nhiều màn liên tiếp.

## Trạng thái: ✅ Xong (đã sửa bug 2026-09-06)

- [x] `GET /api/service-orders` — khớp, không cần sửa
- [x] `POST /api/depot/jobs/{jobId}/payment` — đã sửa: bỏ `job.Status = "PAID"` ghi đè sai
- [x] `dotnet build` solution 0 lỗi, verify thật qua Postgres
