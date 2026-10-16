# 14 — Lệnh Sửa Chữa (WO)

Menu: `repair` → `RepairPage.tsx`, xác nhận qua `App.tsx` (`case 'repair'`).

## Frontend gọi gì

```ts
repairApi.startWorkOrder(jobId, technicianId, technicianName)   // POST /DepotJobs/{id}/repair/start
repairApi.completeWorkOrder(jobId, photos)                      // POST /DepotJobs/{id}/repair/complete
masterDataApi.getMaterials()                                    // trong CompleteItemModal
```

`repairApi.assignWorkOrder` (→ `POST /DepotJobs/{id}/repair/assign`) có định nghĩa nhưng **không được
gọi ở đâu trong module `repair`** — backend endpoint tương ứng (`AssignRepair`) vẫn tồn tại đúng, chỉ là
chưa có UI nào kích hoạt (không phải lỗi tích hợp, chỉ ghi nhận).

**Cập nhật 2026-09-06:** gọi thẳng API xác nhận nếu endpoint chết này ĐƯỢC dùng trước `repair/start` (vd
mai sau có ai nối dây UI cho nó) thì sẽ crash 500 không bắt lỗi — cả `AssignRepairAsync` và
`StartRepairAsync` đều tự `_db.RepairOrders.Add(...)` tạo mới, nhưng chỉ `AssignRepairAsync` có check
`existingRepair != null` chặn trùng; `StartRepairAsync` không check nên insert lần 2 vỡ unique constraint
`IX_RepairOrders_JobNo` (`DbUpdateException`/`PostgresException 23505`), lộ nguyên stack trace ra response
vì controller không bọc try/catch cho action này. Không sửa vì không tái hiện được qua UI thật hiện tại
(chỉ `repair/start` được gọi trực tiếp, luồng đó vẫn đúng — xem "Bug đã sửa" bên dưới) — ghi nhận để nếu
sau này có người nối dây nút "Phân Công" thật thì nhớ thêm guard tương tự vào `StartRepairAsync`.

## Đối chiếu backend

- `POST /DepotJobs/{id}/repair/start` → `StartRepairAsync`: yêu cầu `Estimate.Status == "APPROVED"` và
  `Job.Status == "REPAIRING"` (đúng luồng sau khi màn 13 duyệt báo giá) → tạo `RepairOrder`. ✅
- `POST /DepotJobs/{id}/repair/complete` → `CompleteRepairAsync`: yêu cầu có `RepairOrder` và
  `Status == "REPAIRING"` → set `CompletedAt`, `QcStatus = "PENDING"`, `Job.Status = "QC_PENDING"`.
  Request `{ photos }` khớp `RepairCompleteRequest.Photos`. ✅
- `GET /api/MasterData/materials` — dùng trong `CompleteItemModal` để chọn vật tư khi nghiệm thu từng
  hạng mục sửa chữa; endpoint tồn tại sẵn (đã thấy ở `MasterDataController.GetMaterials`), không kiểm
  tra sâu ở đây vì thuộc nhóm KHO VẬT TƯ (#22), sẽ đối chiếu kỹ khi rà tới đó.

## Quan sát (nit nhỏ, không sửa)

- `App.tsx` cập nhật lạc quan `status: 'WAITING_QC'` sau khi complete thành công, nhưng backend thực tế
  set `Job.Status = "QC_PENDING"` — cùng kiểu lệch nhãn optimistic-update như đã ghi nhận ở màn 13
  (`WAITING_ESTIMATE` vs `ESTIMATING`). Không sửa vì không ảnh hưởng dữ liệu thật trong DB, chỉ là nhãn
  tạm trên UI cho tới lần tải lại kế tiếp.

## Bug đã sửa (phát hiện khi chạy thử thật, 2026-08-23)

**`POST /DepotJobs/{id}/repair/start` luôn crash 500** (`DbUpdateConcurrencyException`: "expected to
affect 1 row(s), but actually affected 0 row(s)") — không lộ ra khi chỉ `dotnet build`/audit tĩnh, chỉ
phát hiện khi chạy thử thật với Postgres qua toàn bộ chuỗi Gate-In → Survey → Estimate → Approve → Repair.
Nguyên nhân: `StartRepairAsync` tạo `RepairOrder` mới bằng cách gán thẳng navigation property
(`job.RepairOrder = new RepairOrder {...}`) thay vì `_db.RepairOrders.Add(...)` tường minh như
`SubmitSurveyAsync`/`CreateOrUpdateEstimateAsync` đang làm đúng — khi SaveChanges gộp chung INSERT
RepairOrder với INSERT AuditLog trong cùng 1 batch, Npgsql/EF Core hiểu sai thành lệnh UPDATE/DELETE cần
kiểm tra số dòng ảnh hưởng, dẫn tới exception dù không có xung đột dữ liệu thật. Đã sửa: đổi sang
`_db.RepairOrders.Add(repairOrder)` tường minh, đồng thời bỏ dòng `job.Status = "REPAIRING"` thừa (đã
được guard clause đầu hàm đảm bảo giá trị này rồi). Build lại `Depot.BackendApi`: 0 Error. Đã chạy thử
lại toàn bộ chuỗi Start → Complete → QC Pass qua Postgres thật, thành công.

## Trạng thái: ✅ Xong (đã chạy thử thật, phát hiện + sửa 1 bug runtime)

- [x] `POST /DepotJobs/{id}/repair/start` — sửa bug crash 500 khi tạo RepairOrder, đã build + test lại.
- [x] `POST /DepotJobs/{id}/repair/complete` — khớp, không cần sửa, đã test thật thành công.
- [x] Đã chạy thử thật (không chỉ static review): Gate-In → Survey → Estimate → Approve → Repair Start
      → Repair Complete → QC Pass → Billing sync-candidates → Gate-Out, toàn bộ chuỗi hoạt động đúng.

## Ảnh sau sửa bị mất — đã lưu thật (2026-09-29)

**Bug:** `CaptureAfterPhotoModal` đọc ảnh thành base64 trong trình duyệt, gửi kèm `POST /repair/complete`;
`CompleteRepairAsync` bỏ ảnh đi, chỉ ghi "Đã đính kèm N ảnh." vào `QcNotes` → F5 là mất hết ảnh. Ngoài ra
Work Order tự gán ảnh "sau sửa" mẫu Unsplash cho hạng mục đã hoàn thành, và modal có "kho ảnh mẫu".

**Sửa:**
- `POST /api/DepotJobs/{id}/repair/photos` (multipart `file` + `itemNo`) — chỉ khi job `REPAIRING`; lưu vật lý
  qua Depot.FileServer, metadata `DepotFiles` với `TableName="RepairOrder"`, `IdTable=RepairOrder.Id`, tên file
  `ITEM-{itemNo}__{tên gốc}` (DepotFiles không có cột phân nhóm con nên số hạng mục nằm trong tên).
- `GET /api/DepotJobs/{id}/repair/photos` — mọi trạng thái (QC cũng xem được). Xóa dùng `DELETE /api/depot-files/{id}`.
- `CompleteRepairAsync` đếm ảnh theo `DepotFiles` thay vì `request.Photos`.
- Frontend: modal upload ngay từng ảnh (có trạng thái đang lưu/lỗi), xóa ảnh = xóa thật; bỏ kho ảnh mẫu và
  ảnh AFTER giả trong `initialWorkOrders.ts`; `RepairPage` nạp ảnh thật khi mở 1 Work Order, gắn theo `itemNo`.

**Verify:** backend vá chạy cổng 50299 + FileServer 50211, Postgres thật, job 70 (REPAIRING): upload 2 ảnh
(item 1, 2) → 200; job 68 (ESTIMATING) → 400 đúng; list trả 2 ảnh đúng tên; tải lại ảnh từ FileServer đúng
388536 byte; xóa → list rỗng, file vật lý 404. `tsc` 0 lỗi. Chưa test qua UI thật vì backend 50210 chạy bản cũ.
