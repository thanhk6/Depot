# 02 — Danh sách Container

Menu: `jobs` → route `/container` → `App.tsx` (fetch) + `ContainerListPage` / `ContainerDetailPage`.

## Frontend gọi gì

`App.tsx` gọi **trực tiếp** `containerApi.getAll()` → `GET /api/DepotJobs` (không dùng `DepotContext`,
context đó là code cũ chạy trên `types/depot` + `fetch('/api/jobs')`/`/api/jobs/gate-in` — các route
này **không tồn tại** ở backend hiện tại, có vẻ là tàn dư chưa dọn, không phải luồng dữ liệu thật sự
đang chạy trên UI chính. Không đụng tới phần này ở bước này).

`App.tsx` map raw response `job` (JSON của entity `DepotJob`) sang `ContainerRecord` dùng chung cho
toàn bộ các trang container:

```ts
shippingLine: job.shippingLineCode,
condition: job.survey?.conditionRating === 'A' ? 'AV' : job.survey ? 'DM' : 'AV',
yardLocation: job.blockCode ? { block: job.blockCode, bay: job.bay, row: job.row, tier: job.tier } : undefined,
timeline: (job.auditLogs || []).map(log => ({ status: log.action, time: log.timestamp, actor: log.user, note: log.details })),
```

## Bug đã sửa

1. **`job.shippingLineCode` luôn `undefined`** — entity `DepotJob` chỉ có `ShippingLineId` (FK) và
   nav `ShippingLine` (object), không có field phẳng `ShippingLineCode`, và nav này **chưa được
   `Include()`** trong `GetAllJobsAsync/GetJobByIdAsync/GetJobByContainerNoAsync`. Hậu quả: cột "Hãng
   Tàu" trên danh sách container luôn trống.
   - Thêm `.Include(j => j.ShippingLine)` vào cả 3 query trong `DepotJobService`.
   - Thêm computed property vào entity `DepotJob` (đồng nhất với cách project đang dùng entity làm
     luôn view model cho API, không có lớp DTO mapping riêng):
     ```csharp
     [NotMapped]
     public string? ShippingLineCode => ShippingLine?.Code;
     ```

2. `job.survey?.conditionRating`, `job.auditLogs[].action/user/timestamp/details` — đã đúng sẵn vì
   `Survey` và `AuditLogs` đã được `Include()` từ trước, field name khớp (camelCase tự động).

## Đối chiếu backend còn lại

- `GET /api/DepotJobs/{id}` — dùng cho tra cứu, chưa có consumer trực tiếp ở màn danh sách (trang
  chi tiết dùng lại dữ liệu đã load từ danh sách, không gọi lại API). ✅ hoạt động sau khi sửa Include.
- `DELETE /api/DepotJobs/{id}`, `PATCH /api/DepotJobs/{id}/status` — dùng bởi `onUpdateStatus`/xoá từ
  danh sách. ✅ đã có sẵn, không cần sửa.

## Trạng thái: ✅ Xong

- [x] Include `ShippingLine` ở 3 query đọc DepotJob
- [x] Thêm `ShippingLineCode` computed property
- [x] Build lại: 0 lỗi (5 warning nullable có sẵn từ trước, không liên quan)
- [ ] `DepotContext.tsx` + `types/depot.ts` là một bộ state/action gần như trùng lặp hoàn toàn với
      luồng `App.tsx` + `types/container.ts`, gọi các route backend không tồn tại
      (`/api/jobs`, `/api/jobs/gate-in`). Nghi là code cũ chưa dọn — **không sửa ở bước này**, sẽ hỏi
      lại người dùng khi rà xong toàn bộ menu xem có cần dọn dẹp hay không.
