# 16 — 10. Truyền API Hãng Tàu

Menu: `shipping_api` → `ShippingApiPage.tsx`, xác nhận qua `App.tsx` (`case 'shipping_api'`). Cùng dùng
`shippingApi.syncJob` với modal `ShippingLineDispatchModal` ở màn `qc` (#15).

## Frontend gọi gì

```ts
shippingApi.syncJob(jobId, carrierCode, eventType)   // POST /api/shipping/sync
```

## Đối chiếu backend

- `POST /api/shipping/sync` → `ShippingIntegrationController.Sync` → `SyncJobAsync`
  (`ShippingIntegrationService`, đã đăng ký DI đúng ở `Program.cs` — mục này từng bị lỗi thiếu DI, đã
  sửa từ vòng hạ tầng #0, xem `00-infrastructure.md`): validate `JobId` là Guid hợp lệ, `CarrierCode`
  không rỗng, Job chưa `GATE_OUT`/`SCRAP_UNFIT` → ghi `ShippingSyncLog` + `JobAuditLog`, trả về
  `{ ackToken }`. ✅

## Quan sát (không sửa — thiết kế chủ đích)

- Sau khi gọi backend thật và nhận `ackToken`, `executeApiDispatch` **tự tạo thêm 1 lớp mô phỏng**
  (`simulateCarrierApiResponse`) để dựng log hiển thị chi tiết HTTP request/response giả lập gửi tới
  hãng tàu (không có API hãng tàu thật nào được gọi ra ngoài) — đây là phần demo giao diện "trông giống"
  1 lần gọi EDI thật, tách biệt khỏi phần ghi nhận thật ở backend (`ShippingSyncLog`). Không phải lỗi
  tích hợp, chỉ là 2 lớp khác mục đích (ghi nhận thật + hiển thị demo) cùng tồn tại trong 1 thao tác.

## Trạng thái: ✅ Xong

- [x] `POST /api/shipping/sync` — khớp, không cần sửa
- [x] Không cần build lại (không đổi code)
