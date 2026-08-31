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
