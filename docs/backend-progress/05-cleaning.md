# 05 — 3. Tổ Vệ Sinh (Cleaning Bay)

Menu: `cleaning` / `cleaning_history` → `CleaningModulePage.tsx`
(`fontend/src/modules/cleaning/pages/CleaningModulePage.tsx`), xác nhận qua `App.tsx`
(`case 'cleaning'` / `case 'cleaning_history'` đều render component này với `initialTab` khác nhau).

## Frontend gọi gì

Chỉ **1 lệnh gọi backend thật** trong toàn module (đã `grep`):

```ts
containerApi.updateStatus(order.containerId, 'READY_FOR_OUT', 'AV')
```

Toàn bộ phần còn lại — danh sách chờ vệ sinh (`orders`), checklist hạng mục dịch vụ
(`CleaningWorkItem[]`), đơn giá từng hạng mục, cước tổng, KTV phụ trách, phiếu nghiệm thu — đều là
`useState` cục bộ, khởi tạo từ `containers` prop (chính component cha `App.tsx` giữ, không phải từ 1
API riêng) hoặc modal `NewCleaningIntakeModal` (nhập tay). **Không có entity/bảng DB nào cho "Cleaning
Order/Cleaning Work Item"** — khớp với ghi chú trong quy tắc chung (`00-quy-tac-backend.md` mục 7):
Cleaning là 1 trong các domain "đã có UI nhưng backend chưa có gì".

## Đối chiếu backend

- `PATCH /api/DepotJobs/{id}/status` → đã audit đúng ở màn 02/03, hoạt động bình thường cho phần
  `Status` (chuyển `READY_FOR_OUT`). ✅
- **Phát hiện field chết:** `UpdateJobStatusRequest.Condition` (gửi `"AV"` từ màn này) được khai báo
  trong ViewModel nhưng `DepotJobService.UpdateJobStatusAsync` **không bao giờ đọc** field này — chỉ
  dùng `request.Status`. `DepotJob` entity cũng không có cột nào lưu "condition"/"AV-CL-DM" — giá trị
  phân hạng chất lượng hiện chỉ tồn tại trong state React cục bộ của từng màn (`ContainerRecord.condition`
  ở `App.tsx` được tính lại từ `job.survey?.conditionRating`, không đọc từ đâu khác). Nghĩa là cấp Grade
  (Grade A / Food Grade / General Cargo / Scrap Grade) chọn ở màn Cleaning **không được lưu xuống DB**,
  chỉ tồn tại tạm trong session trình duyệt — mất khi tải lại trang.

## Đã làm (2026-08-23, sau khi người dùng xác nhận làm toàn bộ việc lớn còn lại)

Module Cleaning được build hoàn chỉnh theo quy tắc bảng mới (`00b-quy-tac-tao-bang.md`):

- Entity `CleaningRecord` (`Depot.Data/Entities/Cleaning/CleaningRecord.cs`, khóa `long`, business key
  `Code` dạng `CL-yyyyMMddHHmmss-nnn`, liên kết logic sang `DepotJob` qua `JobNo`) + `CleaningWorkItem`
  (dòng con, FK `CleaningRecordCode` trỏ `CleaningRecord.Code`) — đủ field cho checklist, hoá chất, áp
  lực nước, nhiệt độ, ảnh trước/sau, cước phí, Grade nghiệm thu.
- `ICleaningService`/`CleaningService` (`Depot.Application/Services`), đăng ký DI trong `Program.cs`.
- `CleaningController` (`api/cleaning`): `GET /`, `GET /{id}`, `POST /` (tạo lệnh + checklist),
  `PATCH /{id}/items/{itemId}` (toggle 1 hạng mục), `PATCH /{id}/items/complete-all`,
  `PUT /{id}/execution` (cập nhật thông số thi công + Grade), `POST /{id}/handover` (hoàn tất & bàn giao
  Khai Thác — tự đánh dấu hết checklist, tính lại `TotalCostVnd`).
- Migration `AddCleaningModule` đã tạo (`Depot.Data/Migrations/20260822212...`).
- **Frontend đã nối dây thật** (trước đó chỉ audit, code trước có `useState` cục bộ hoàn toàn):
  - `fontend/src/api/cleaning.api.ts` (client mới) + `mapCleaningRecord.ts` (map `CleaningRecordDto` →
    `CleaningExecutionRecord` của frontend, vì field name khác nhau: `totalCostVnd`→`totalCost`,
    `sizeType`→`size`, `typeName`→`type`, `beforeCleaningPhotoUrl`→`beforeCleaningPhoto`...).
  - `NewCleaningIntakeModal.tsx`: `handleSubmit` giờ gọi `cleaningApi.create()` thật (trước đó tự bịa
    `id`/`items` bằng `Math.random()`), có trạng thái loading + hiện lỗi nếu API thất bại.
  - `CleaningModulePage.tsx`: nạp danh sách qua `GET /api/cleaning` lúc mount; container được Survey
    đánh dấu `CL` nhưng CHƯA tạo lệnh vệ sinh hiển thị như placeholder "chờ tiếp nhận" (không checklist,
    không cước — đúng thực tế); toggle hạng mục / hoàn tất tất cả / đổi Grade / bàn giao AV đều gọi API
    thật rồi cập nhật lại state từ response (không còn tự sửa state cục bộ).
- Build backend (`dotnet build Depot.BackendApi`) và `tsc --noEmit` frontend đều 0 lỗi.

## Còn thiếu (không chặn, ghi nhận để làm sau nếu cần)

- `Condition` trong `UpdateJobStatusRequest` (dùng ở nút chuyển `READY_FOR_OUT` cũ) vẫn là field chết —
  không ảnh hưởng vì luồng Cleaning giờ dùng hẳn API riêng (`POST /{id}/handover`), không phụ thuộc field
  này nữa.
- Biểu phí vệ sinh (`cleaning_tariffs`, mục #26 INDEX.md) đã có danh mục riêng từ trước (✅) nhưng
  `NewCleaningIntakeModal` vẫn dùng bảng giá cứng `servicePresets` trong component thay vì đọc từ
  catalog đó — cải tiến nhỏ, không phải lỗi chặn, có thể làm ở vòng sau nếu người dùng muốn giá đồng bộ
  1 nguồn duy nhất.

## Trạng thái: ✅ Xong (backend + frontend đã nối dây, build sạch)

- [x] `PATCH /api/DepotJobs/{id}/status` (phần `Status`) — hoạt động đúng, không cần sửa
- [x] Module Cleaning đầy đủ (entity, migration, service, controller, DI) — đã build
- [x] Frontend `CleaningModulePage.tsx` + `NewCleaningIntakeModal.tsx` nối API thật, không còn mock cục bộ
