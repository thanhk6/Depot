# Design

## Context

- Ảnh sau sửa: `POST /api/DepotJobs/{id}/repair/photos` (form `file`, `itemNo`) → Depot.FileServer + bảng `DepotFiles` (TableName `RepairOrder`, IdTable = RepairOrder.Id), tên file `ITEM-{n}__{tên gốc}`; chỉ nhận khi hồ sơ REPAIRING và đã có RepairOrder. `GET` cùng đường dẫn trả mọi file của lệnh sửa. Xoá qua `DELETE /api/DepotFiles/{id}` (quyền Repair có sẵn).
- Frontend `RepairPage` tải file, lọc theo `/^ITEM-(\d+)__/` thành ảnh `AFTER`; hạng mục = các dòng báo giá đã duyệt theo thứ tự trả về (`itemNo = idx + 1`). Kiểu `RepairPhoto.type` đã có `'BEFORE' | 'AFTER' | 'ADDITIONAL'`; `RepairItemCard` đã có ô "Ảnh trước sửa" (chỉ hiển thị); `PhotoCompareModal` đã đối chiếu BEFORE / AFTER.
- `CompleteRepairAsync` trả `bool`, controller luôn báo "Chưa có lệnh sửa chữa đang thực hiện" khi `false`; hiện chỉ đếm ảnh sau sửa để ghi ghi chú, không chặn.
- Nhánh dự phòng (hồ sơ cũ không có báo giá đã duyệt) gán ảnh hư hỏng giám định là `BEFORE`.

## Goals / Non-Goals

**Goals:**
- Ảnh trước sửa lưu thật theo hạng mục, cùng cơ chế ảnh sau sửa.
- Backend là chốt chặn cuối: không đủ ảnh thì không sang QC.

**Non-Goals:**
- Không thêm bảng / cột, không đổi FileServer, không gửi ảnh lên AEMS.

## Decisions

- **Phân loại bằng tiền tố tên file**: ảnh trước sửa `BEFORE-ITEM-{n}__…`, ảnh sau sửa giữ `ITEM-{n}__…`. Thêm field form tuỳ chọn `kind` (`BEFORE` | `AFTER`, mặc định `AFTER`) cho endpoint upload — client cũ vẫn chạy, ảnh cũ vẫn là ảnh sau sửa, không cần migration. Phương án thêm TableName mới (`RepairOrderBefore`) bị loại vì phải thêm hằng số / truy vấn thứ hai mà không lợi gì; thêm cột vào `DepotFiles` bị loại vì cần migration cho cả bảng file dùng chung.
- **Regex lọc ảnh sau sửa hiện tại (`^ITEM-`) không khớp `BEFORE-ITEM-`**, nên tách hai loại không ảnh hưởng dữ liệu cũ. Thêm hàm `parseRepairPhoto(fileName) → { kind, itemNo }` dùng chung ở frontend.
- **Số hạng mục ở backend = số dòng `EstimateItem` của báo giá APPROVED, sắp theo `Id`** — cùng thứ tự frontend nhận qua DTO. Nếu không có báo giá đã duyệt (hồ sơ cũ), backend bỏ qua kiểm tra theo hạng mục và chỉ yêu cầu ≥ 1 ảnh trước + ≥ 1 ảnh sau cho cả lệnh.
- **Báo lý do thiếu ảnh**: `CompleteRepairAsync` ném `RepairPhotosMissingException` (thông điệp liệt kê hạng mục thiếu ảnh trước / sau); controller bắt và trả 400 với đúng thông điệp. Các trường hợp `false` cũ giữ thông điệp cũ.
- **Ảnh giám định không tính**: nhánh dự phòng đổi loại ảnh giám định từ `BEFORE` sang `ADDITIONAL` (vẫn hiện để đối chiếu, có nhãn "ảnh giám định").
- **Modal chụp ảnh dùng chung cho hai loại**: tổng quát `CaptureAfterPhotoModal` thành nhận `kind` (tiêu đề, mô tả, lọc ảnh đã có theo loại) thay vì nhân bản thành modal mới.

## Risks / Trade-offs

- [Thứ tự dòng báo giá ở frontend khác backend → kiểm tra sai hạng mục] → cả hai cùng lấy theo thứ tự `Id` của `EstimateItem`; kiểm thử lệnh 2 hạng mục với ảnh chỉ ở hạng mục #1.
- [Lệnh sửa đang dở trên VPS chưa có ảnh trước sửa sẽ bị chặn hoàn tất] → chấp nhận (BREAKING đã ghi ở proposal); thợ chụp bổ sung trước khi hoàn tất.
- [Xoá ảnh qua `DepotFiles` không kiểm tra trạng thái lệnh] → giữ nguyên như ảnh sau sửa hiện tại.

## Migration Plan

Không có migration. Deploy backend + frontend cùng lúc (frontend mới gửi `kind=BEFORE`; backend cũ sẽ coi là ảnh sau sửa). Rollback: deploy lại bản cũ — ảnh `BEFORE-ITEM-` vẫn nằm trong DepotFiles nhưng bị bỏ qua.
