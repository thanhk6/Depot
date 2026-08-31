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
  và `Status = "IN_YARD"` trên `DepotJob`, đồng thời tạo/cập nhật `YardPosition` tương ứng
  (`IsOccupied = true`, `OccupiedContainerNo`). `jobId` truyền vào đúng là `containerId` lấy từ
  `ContainerRecord.id` (= `DepotJob.Id`, xem 02-container-list.md) — khớp kiểu Guid. ✅

Không phát hiện lỗi tích hợp — endpoint hoạt động đúng như thiết kế, không cần sửa.

## Trạng thái: ✅ Xong

- [x] `POST /api/DepotJobs/{id}/forklift-move` — khớp, không cần sửa
- [x] Không cần build lại (không đổi code)
- [ ] Ghi chú: hàng đợi/nhận lệnh/lịch sử điều xe hiển thị trên UI là state cục bộ tính lại mỗi lần từ
      `containers`, không có bảng "ForkliftJob" riêng lưu lịch sử ai nhận lệnh lúc nào — nếu sau này cần
      lưu vết đầy đủ (ai claim, claim lúc nào, huỷ bao nhiêu lần...) sẽ là việc lớn tương tự màn 09,
      chưa cần thiết ở phạm vi hiện tại vì nghiệp vụ cốt lõi (ghi nhận vị trí hạ bãi) đã đúng.
