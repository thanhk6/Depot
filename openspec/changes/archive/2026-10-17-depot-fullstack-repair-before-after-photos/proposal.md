# Proposal

## Why

Người dùng muốn thợ sửa chữa chụp ảnh **trước khi sửa** và **sau khi sửa** cho từng hạng mục, làm bằng chứng cho QC và hãng tàu (Maersk AEMS yêu cầu ảnh theo từng dòng hư hỏng). Hiện tại màn Sửa chữa không có chỗ chụp ảnh trước sửa (ô "Ảnh trước sửa" luôn trống với hạng mục lấy từ báo giá), còn ảnh sau sửa chỉ bị bắt buộc ở giao diện — gọi thẳng API vẫn hoàn tất lệnh sửa không cần ảnh.

## What Changes

- Mỗi hạng mục của lệnh sửa có nút chụp / chọn **ảnh trước sửa**, lưu thật lên Depot.FileServer ngay khi chụp, xoá được khi lệnh còn đang sửa.
- Hạng mục chưa có ảnh trước sửa: khoá nút chụp ảnh sau sửa và nút hoàn thành hạng mục.
- Ảnh sau sửa giữ như hiện tại (≥ 1 ảnh mỗi hạng mục).
- **Backend chặn hoàn tất lệnh sửa** (chuyển QC) khi còn hạng mục thiếu ảnh trước sửa hoặc ảnh sau sửa; báo rõ hạng mục nào thiếu. Nhật ký REPAIR_COMPLETED ghi số ảnh trước / sau.
- Màn QC và màn đối chiếu trước / sau hiện đúng ảnh trước sửa thợ đã chụp.
- **BREAKING (hành vi):** lệnh sửa đang làm dở mà chưa có ảnh trước sửa sẽ không hoàn tất được cho tới khi chụp bổ sung.

## Capabilities

### New Capabilities
- (không có)

### Modified Capabilities
- `repair-work-order`: thêm requirement chụp ảnh trước / sau theo hạng mục; sửa requirement "Hoàn tất sửa chuyển QC" để chặn khi thiếu ảnh.

## Impact

- Backend: `DepotJobsController` (upload / danh sách / xoá ảnh lệnh sửa nhận loại ảnh BEFORE / AFTER), `DepotJobService.CompleteRepairAsync` (kiểm tra đủ ảnh theo hạng mục của báo giá đã duyệt).
- Frontend: `fontend/src/api/repair.api.ts`, `modules/repair` (`RepairPage`, `RepairItemCard`, `CompleteItemModal`, `WorkOrderDetailView`, modal chụp ảnh), `modules/qc/pages/QCPage.tsx` nếu đang đọc ảnh lệnh sửa.
- Dữ liệu: dùng bảng `DepotFiles` sẵn có (TableName `RepairOrder`), phân loại bằng tiền tố tên file; **không có migration EF Core**, không sửa dữ liệu cũ (ảnh sau sửa đã lưu vẫn đọc được).
- Ngoài phạm vi: gửi ảnh lên Maersk AEMS, nén / giới hạn số ảnh, ảnh cho hạng mục phát sinh thêm.
