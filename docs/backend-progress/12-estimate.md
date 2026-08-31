# 12 — Lập Báo Giá Estimate

Menu: `estimate` → `EstimatePage.tsx`, xác nhận qua `App.tsx` (`case 'estimate'`).

## Frontend gọi gì

```ts
containerApi.getAll()                         // load estimates từ job.estimate
containerApi.getById(newEst.containerNo)      // tra Job SQL trước khi tạo estimate
estimateApi.createEstimate(jobId, {...})      // POST /DepotJobs/{id}/estimate
estimateApi.approveEstimate(jobId, approver)  // POST /DepotJobs/{id}/approve-estimate
estimateApi.rejectEstimate(jobId, reason, by) // POST /DepotJobs/{id}/reject-estimate
masterDataApi.getCatalog('DAMAGE_LOCATION' | 'DAMAGE_CODE' | 'REPAIR_CODE')  // trong CreateEstimateModal
```

## Đối chiếu backend

- `GET /api/DepotJobs` (đã `Include(Estimate).ThenInclude(Items)` từ trước) → `job.estimate.items[]`
  đọc đúng field (`itemDescription`, `quantity`, `unitPrice`, `amount`), `grandTotal`, `totalTax`,
  `status`. ✅
- `POST /api/DepotJobs/{id}/estimate` → `CreateOrUpdateEstimateAsync`: yêu cầu `Job.Status ==
  "ESTIMATING"` và đã có `Survey` (đúng luồng nghiệp vụ: Survey → Estimate), validate item
  `Quantity/UnitPrice`, tính lại `GrandTotal` nếu FE không gửi đủ. ✅
- `POST /api/DepotJobs/{id}/approve-estimate`, `POST /api/DepotJobs/{id}/reject-estimate` — chuyển
  đúng trạng thái (`APPROVED` → Job sang `REPAIRING`; `REJECTED` → Job quay lại `ESTIMATING`). `jobId`
  frontend truyền là `targetEstimate.containerId`, thực chất là `String(job.id)` (DepotJob Guid, đặt
  tên field hơi gây nhầm vì trông giống "container id") — khớp đúng kiểu Guid backend cần. ✅
- `GET /api/MasterData/catalog/{catalogType}` (dùng trong `CreateEstimateModal` cho 3 danh mục
  DAMAGE_LOCATION/DAMAGE_CODE/REPAIR_CODE) → trả `MasterCatalogItem[]` với field `code`, `name`,
  `nameVi` — khớp đúng cách frontend đọc (`item.code`, `item.nameVi || item.name`). Đây là danh mục
  **dùng chung**, đã sẵn có dữ liệu thật trong DB (không phải mock) — khác với các tab danh mục cùng
  tên ở màn `survey` (#4) đang dùng mock cục bộ chưa nối dây; sẽ đối chiếu kỹ hơn phần ghi (POST/PUT)
  khi rà tới nhóm MASTER DATA (#28-30).

Không phát hiện lỗi tích hợp — toàn bộ luồng Estimate → Approve/Reject hoạt động đúng, không cần sửa.

## Trạng thái: ✅ Xong

- [x] 5 endpoint trên đều khớp, không cần sửa
- [x] Không cần build lại (không đổi code)
