# 13 — Phê Duyệt Hãng Tàu

Menu: `approval` → `ApprovalPage.tsx`, xác nhận qua `App.tsx` (`case 'approval'`).

## Frontend gọi gì

`ApprovalPage.tsx` tự nó **không gọi API nào** — chỉ phát 2 callback prop `onApproveEstimate` /
`onRejectEstimate`, được `App.tsx` implement bằng cách gọi lại đúng 2 endpoint đã audit ở màn 12:

```ts
estimateApi.approveEstimate(id, notes)   // POST /DepotJobs/{id}/approve-estimate
estimateApi.rejectEstimate(id, reason, rejectCode)  // POST /DepotJobs/{id}/reject-estimate
```

`id` truyền vào là `c.id` (DepotJob Guid) — khớp đúng kiểu backend cần.

## Đối chiếu backend

Dùng lại đúng 2 endpoint đã xác nhận đúng ở 12-estimate.md — không có endpoint riêng nào khác cho màn
này, không cần audit lại phần backend.

## Quan sát (nit nhỏ, không sửa)

- `App.tsx` cập nhật lạc quan (`optimistic update`) state cục bộ sau khi reject thành công thành
  `status: 'WAITING_ESTIMATE'`, nhưng backend `RejectEstimateAsync` thực tế set
  `job.Status = "ESTIMATING"` (xem 12-estimate.md) — 2 chuỗi khác nhau. Không gây lỗi hiển thị ngay vì
  `ApprovalPage` còn fallback lọc theo `condition === 'DM'`, nhưng nếu tải lại danh sách từ backend,
  trạng thái thật sẽ là `ESTIMATING` chứ không phải `WAITING_ESTIMATE` (giá trị này không tồn tại ở bất
  kỳ đâu trong luật chuyển trạng thái backend). Chỉ là nhãn optimistic-update không khớp tên, không phải
  lỗi tích hợp — không sửa vì nằm ngoài phạm vi 1 endpoint cụ thể và không ảnh hưởng chức năng chính.

## Trạng thái: ✅ Xong

- [x] Dùng lại 2 endpoint đã đúng ở màn 12, không cần sửa
- [x] Không cần build lại (không đổi code)
