# 11 — Lệnh Điều Xe Nâng

Menu: `forklift` → `ForkliftPage.tsx` (`fontend/src/modules/forklift/pages/ForkliftPage.tsx`), xác nhận
qua `App.tsx` (`case 'forklift'`). Dùng `yardApi` từ `fontend/src/api/yard.api.ts` (API thật, **khác**
với mock `yardApi` trong `modules/yard/services/yardApi.ts` dùng ở màn 09/10 — xem ghi chú trùng tên ở
09-yard-map.md).

## Frontend gọi gì

```ts
yardApi.forkliftMove(jobId, targetBlock, targetBay, targetRow, targetTier, operatorName, forkliftCode)
```

Toàn bộ hàng đợi công việc (`jobs`), thao tác "Nhận lệnh"/"Hủy nhận lệnh" chỉ là state cục bộ tính lại
từ `containers` prop (dữ liệu Depot Job thật đã tải từ SQL Server ở `App.tsx`) — chỉ bước "Xác Nhận Hạ
Bãi" (`handleConfirmDrop`) mới thật sự ghi xuống DB.

## Đối chiếu backend

- `POST /api/DepotJobs/{id}/forklift-move` → `DepotJobsController.CompleteForkliftMove` →
  `CompleteForkliftMoveAsync`: validate toạ độ Block/Bay/Row/Tier > 0, cập nhật `BlockCode/Bay/Row/Tier`
  trên `DepotJob`, đồng thời tạo/cập nhật `YardPosition` tương ứng (`IsOccupied = true`,
  `OccupiedContainerNo`). `jobId` truyền vào đúng là `containerId` lấy từ `ContainerRecord.id`
  (= `DepotJob.Id`, xem 02-container-list.md). ✅

## Cập nhật 2026-09-06: chạy thử thật phát hiện bug cross-module (cùng loại với màn 07-payment), đã sửa

`CompleteForkliftMoveAsync` trước đây còn ghi đè `job.Status = "IN_YARD"` **vô điều kiện** mỗi lần xe nâng
dời container, bất kể job đang ở trạng thái nghiệp vụ nào. Xe nâng có thể đảo chuyển vị trí ở bất kỳ giai
đoạn nào trong vòng đời — kể cả 1 container đã QC đạt (`READY_FOR_OUT`) bị dời chỗ trong lúc chờ xe tới
lấy — ghi đè status như cũ sẽ xoá mất `READY_FOR_OUT`, khiến `GateOutAsync` (yêu cầu đúng
`Status == "READY_FOR_OUT"`) từ chối vĩnh viễn, container kẹt mãi không Gate-Out được. Grep toàn backend
xác nhận không nơi nào khác đọc `DepotJob.Status == "IN_YARD"` làm điều kiện thật (chỉ xuất hiện trong
danh sách "allowed" của endpoint set-status thủ công) — đã xoá dòng ghi đè, vị trí vật lý vẫn cập nhật đủ
qua `BlockCode/Bay/Row/Tier` + `YardPosition`.

Verify thật: đưa 1 job về `READY_FOR_OUT` → gọi forklift-move dời vị trí → job vẫn `READY_FOR_OUT` (trước
khi sửa sẽ thành `IN_YARD`) → gọi `POST .../gate-out` thành công (trước khi sửa sẽ luôn thất bại).
`dotnet build` solution 0 lỗi.

## Trạng thái: ✅ Xong (đã sửa bug 2026-09-06)

- [x] `POST /api/DepotJobs/{id}/forklift-move` — đã sửa: bỏ `job.Status = "IN_YARD"` ghi đè sai
- [x] `dotnet build` solution 0 lỗi, verify thật qua Postgres (forklift-move → gate-out liên tiếp)
- [ ] Ghi chú: hàng đợi/nhận lệnh/lịch sử điều xe hiển thị trên UI là state cục bộ tính lại mỗi lần từ
      `containers`, không có bảng "ForkliftJob" riêng lưu lịch sử ai nhận lệnh lúc nào — nếu sau này cần
      lưu vết đầy đủ (ai claim, claim lúc nào, huỷ bao nhiêu lần...) sẽ là việc lớn tương tự màn 09,
      chưa cần thiết ở phạm vi hiện tại vì nghiệp vụ cốt lõi (ghi nhận vị trí hạ bãi) đã đúng.
