# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 `DepotJobsController.UploadRepairPhoto`: nhận field form tuỳ chọn `kind` (`BEFORE` | `AFTER`, mặc định `AFTER`, giá trị khác → 400); ảnh trước sửa đặt tên `BEFORE-ITEM-{n}__…`, thông điệp trả về theo loại; xác nhận `dotnet build SolutionDepot/SolutionDepot.sln` không lỗi
- [x] 1.2 `DepotJobService.CompleteRepairAsync`: đếm ảnh theo loại + số hạng mục (dòng `EstimateItem` của báo giá APPROVED, sắp theo `Id`); thiếu ảnh trước / sau ở hạng mục nào thì ném `RepairPhotosMissingException` liệt kê hạng mục; hồ sơ không có báo giá đã duyệt thì yêu cầu ≥ 1 ảnh mỗi loại cho cả lệnh; ghi chú lệnh sửa + nhật ký REPAIR_COMPLETED ghi số ảnh trước / sau; build không lỗi
- [x] 1.3 `DepotJobsController.CompleteRepair`: bắt `RepairPhotosMissingException` trả 400 với đúng thông điệp; build không lỗi, khởi động lại backend
- [x] 1.4 Kiểm thử API: upload `kind=BEFORE` khi chưa bắt đầu lệnh sửa → 400; lệnh 2 hạng mục chỉ có ảnh ở hạng mục #1 → hoàn tất bị từ chối, nêu hạng mục #2; thiếu ảnh sau sửa → từ chối; đủ ảnh → QC_PENDING, nhật ký ghi số ảnh trước / sau; upload không gửi `kind` → vẫn là ảnh sau sửa

## 2. Frontend (`fontend/`)

- [x] 2.1 `api/repair.api.ts`: `uploadRepairPhoto(jobId, itemNo, file, kind)` + `parseRepairPhoto(fileName) → { kind, itemNo } | null` (giữ `parseRepairPhotoItemNo` cho chỗ cũ hoặc thay hết); type-check không lỗi
- [x] 2.2 `RepairPage.tsx`: khi tải ảnh lệnh sửa, gán đúng `BEFORE` / `AFTER` theo tên file; nhánh dự phòng đổi ảnh giám định sang `ADDITIONAL`; type-check không lỗi
- [x] 2.3 Tổng quát `CaptureAfterPhotoModal` theo `kind` (tiêu đề, mô tả, lọc ảnh đã có, gọi upload đúng loại); `RepairItemCard` thêm nút chụp ảnh trước sửa ở ô "Ảnh trước sửa"; type-check không lỗi
- [x] 2.4 Khoá nút chụp ảnh sau sửa và nút hoàn thành hạng mục khi hạng mục chưa có ảnh trước sửa (kèm dòng nhắc) ở `RepairItemCard` / `CompleteItemModal`; `WorkOrderDetailView` chỉ cho hoàn tất lệnh khi mọi hạng mục có đủ hai loại ảnh và hiện thông điệp lỗi backend nếu bị từ chối; type-check không lỗi

## 3. Kiểm thử giao diện (http://127.0.0.1:3000)

- [x] 3.1 Chuẩn bị container test ở REPAIRING có báo giá đã duyệt 2 hạng mục (qua API)
- [x] 3.2 Bắt đầu lệnh sửa; hạng mục chưa có ảnh trước: nút chụp ảnh sau + hoàn thành bị khoá; chụp ảnh trước (file ảnh mẫu) → nút mở; tải lại trang ảnh trước vẫn còn; xoá được ảnh vừa chụp
- [x] 3.3 Đủ ảnh trước + sau cả 2 hạng mục → hoàn tất lệnh → QC_PENDING; màn đối chiếu trước / sau hiện đúng ảnh hai loại
- [x] 3.4 Dọn dữ liệu test: xoá hồ sơ, giám định, vệ sinh, phiếu dịch vụ, khoản thu, báo giá, lệnh sửa, file ảnh (DepotFiles + file vật lý trên FileServer), nhật ký của container test; xác nhận bằng truy vấn DB không còn bản ghi nào

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-repair-before-after-photos`; cập nhật mục "9. Sửa chữa" trong `docs/quy-trinh-van-hanh-depot.md`.
- Khi deploy VPS: lệnh sửa đang dở cần chụp bổ sung ảnh trước sửa (BREAKING).
