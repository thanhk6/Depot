
# 01 — Tổng quan Executive (Dashboard)

Menu: `dashboard` → route `/dashboard` → `fontend/src/modules/dashboard/pages/DashboardPage.tsx`

## Frontend gọi gì

```ts
Promise.all([reportApi.getKPIStats(), yardApi.getPositions()])
```

- `reportApi.getKPIStats()` → `GET /api/reports/kpi`
- `yardApi.getPositions()` → `GET /api/Yard`

Đọc kết quả theo hình dạng thực tế backend trả (`{ statusCode, message, data }`), **không** theo
type `ApiResponse<T>` khai báo ở `types/common.ts` (type đó không khớp nhưng không có nơi nào dùng
field `success`/`errors`/`timestamp` thật sự — có thể coi là type "lý thuyết" chưa dùng, bỏ qua).

## Đối chiếu backend

- `ReportsController.GetKpi()` (`GET api/reports/kpi`, alias `GET api/dashboard/overview`) → gọi
  `IDepotJobService.GetKpiSummaryAsync()` → trả `KpiSummaryDto { TotalJobs, ActiveJobs,
  ReadyForOutJobs, CompletedJobs, TotalRevenueVnd, FirstPassYieldPercent }`. ✅ khớp field
  `activeJobs`, `completedJobs`, `totalRevenueVnd` mà Dashboard đang đọc.
- `YardController.GetPositions()` (`GET api/Yard`) → trả `List<YardPosition>` (entity thật, có
  `isOccupied`, `blockCode`). ✅ khớp field Dashboard dùng để tính % lấp đầy bãi.
  Phụ thuộc `IYardService` — trước khi sửa mục 00 thì endpoint này **crash 500**, giờ đã chạy được.

## Bug đã sửa

`DepotJobService.GetKpiSummaryAsync()` tính "Doanh Thu Thu Ngân (VietQR)" sai nguồn dữ liệu:

```csharp
// Trước: cộng dồn báo giá ĐÃ DUYỆT (chưa chắc đã thu tiền)
var revenue = await _db.Estimates.Where(x => x.Status == "APPROVED").SumAsync(x => (decimal?)x.GrandTotal) ?? 0;

// Sau: cộng dồn Payment ĐÃ THU THẬT (Status == "PAID"), đúng ý nghĩa "doanh thu thu ngân"
var revenue = await _db.Payments.Where(x => x.Status == "PAID").SumAsync(x => (decimal?)x.TotalAmount) ?? 0;
```

Lý do: nhãn trên UI là "Doanh Thu Thu Ngân (VietQR)" — tức tiền đã thu qua thu ngân/VietQR,
không phải giá trị báo giá đã duyệt (có thể chưa thanh toán). `Payment.Status` được set `"PAID"`
trong `ProcessPaymentAsync` khi thu ngân xác nhận thanh toán thành công.

## Rà lại lần 2 (2026-08-23) — lần này soát cả logic frontend, không chỉ field-shape

Phát hiện 2 lỗi logic ở chính `DashboardPage.tsx` (không phải lỗi field/API, mà lỗi tính toán):

1. **"Gate-In/Gate-Out Hôm Nay" không lọc theo ngày.** Trước đó `gateInToday = containers.length`
   (tổng toàn bộ container đang có, không phải phát sinh hôm nay) và `gateOutToday =
   backendKpi?.completedJobs` (tổng lũy kế `Status == GATE_OUT` từ trước tới giờ — `KpiSummaryDto`
   không có field nào scope theo ngày cả). Đã sửa thành lọc `containers` theo `gateInDate`/
   `gateOutDate` khớp ngày hôm nay (so sánh 10 ký tự đầu `YYYY-MM-DD` của ISO string, dữ liệu
   `gateInDate/gateOutDate` đã có sẵn trên `ContainerRecord` từ `App.tsx` map từ backend).
2. **3 thanh "Sức Chứa Bãi" Block A/B/C tính sai.** Block A và Block B copy-paste cùng 1 công thức
   `yardSlots.filter(isOccupied).length / yardSlots.length` — tức cả 2 thanh đều hiển thị % lấp đầy
   **toàn bãi**, không phải riêng block đó. Block C lọc theo `blockCode === 'BLOCK_C'` — mã này
   **không tồn tại** (seed chỉ có `BLOCK_A, BLOCK_B, BLOCK_Q, BLOCK_R`, xem `DbSeeder.SeedYardAsync`)
   nên luôn ra 0%. Đã sửa: thêm helper `getBlockOccupancy(blockCode)` lọc đúng theo `blockCode` thật,
   áp dụng cho `BLOCK_A`, `BLOCK_B`, `BLOCK_Q` (bỏ nhãn suy diễn "Khu EMR/Khu AV/Khu Reefer" vì
   backend chưa có khái niệm phân loại mục đích từng block — chỉ còn tên block trung lập).

Đã kiểm chứng bằng cách gọi trực tiếp `GET /api/reports/kpi`, `GET /api/Yard`, `GET /api/DepotJobs`
qua backend thật (Postgres) — xác nhận field `blockCode` đúng là `BLOCK_A/BLOCK_Q` (không phải
`BLOCK_C`) và `gateInDate` đúng định dạng ISO để so sánh chuỗi ngày.

**Chưa làm (note liên quan, không sửa ở đây):** card "Container CL" trên Dashboard đọc
`containers.filter(c => c.condition === 'CL')`, nhưng `App.tsx` (dòng map `containerApi.getAll()`)
chỉ suy ra `condition` là `'AV'` hoặc `'DM'` từ `survey.conditionRating`, **không bao giờ gán
`'CL'`** — vì backend (`DepotJobService.SubmitSurveyAsync`) chỉ rẽ 2 nhánh `READY_FOR_OUT`/
`ESTIMATING`, chưa có khái niệm/luồng "cần vệ sinh" (Cleaning) nào cả. Đây là việc lớn (thêm nhánh
nghiệp vụ + có thể cả module Cleaning — thuộc mục 7 quy tắc chung, phải hỏi trước khi làm), đúng
phạm vi màn `survey` (#4) và `cleaning` (#5) sắp rà — không vá tạm ở Dashboard.

**Ngoài ra sửa 1 bug build ảnh hưởng màn `workflow` (#2, đã ✅ trước đó) phát hiện khi chạy
`npm run lint` toàn bộ frontend lần đầu tiên trong cả quy trình:** `fontend/src/api/index.ts` thiếu
`export type { WorkflowStepDto }`, khiến `BusinessWorkflowModal.tsx` không build được (29 lỗi TS
cascade). Đã thêm export — xem chi tiết ở [02-workflow.md](02-workflow.md).

## Trạng thái: ✅ Xong

- [x] DI cho `IYardService` (mục 00)
- [x] Sửa nguồn tính doanh thu KPI
- [x] Sửa "Gate-In/Gate-Out Hôm Nay" tính đúng theo ngày thay vì tổng lũy kế
- [x] Sửa 3 thanh occupancy Block A/B/(Q) tính đúng theo từng block thay vì copy-paste toàn bãi
- [x] Build lại `Depot.BackendApi`: 0 lỗi; `npm run lint` (tsc --noEmit) toàn bộ frontend: 0 lỗi
- [x] Đã chạy thử backend (Postgres) + frontend dev server thật, gọi trực tiếp API xác nhận field
      đúng như code đọc (xem log trong hội thoại) — không chụp được screenshot UI do môi trường
      Windows này không có `chromium-cli`/Playwright cài sẵn để lái trình duyệt thật
