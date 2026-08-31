# 48-52 — Nhóm BÁO CÁO & HIỆU SUẤT (gộp 1 file)

5 tab (`report_staff_realtime`, `report`, `report_emr`, `report_dwell_time`, `report_revenue`) đều render
`ReportPage.tsx` (`App.tsx` chỉ đổi `initialTab`).

## Hiện trạng trước khi sửa (đã audit ở vòng đầu)

Chỉ 3 số KPI (`totalRevenueVnd, totalJobs, firstPassYieldPercent` qua `GET /reports/kpi`) là thật. Toàn
bộ biểu đồ/bảng chi tiết (throughput 7 ngày, sức chứa bãi A/B/C, phân hạng Grade A-D, cơ cấu hư hỏng
IICL, năng suất tổ thợ, cycle time, container lưu bãi lâu, doanh thu chi tiết, bảng nhật ký) đều là mảng
khai báo cứng trong `ReportPage.tsx`. `report_staff_realtime` (theo dõi việc real-time theo nhân viên)
không có khái niệm tương ứng ở backend.

## Đã làm (2026-08-23, sau khi người dùng xác nhận làm toàn bộ việc lớn còn lại)

**Không tạo bảng mới** — toàn bộ số liệu tính trực tiếp từ dữ liệu thật đã có sẵn
(`DepotJob, Survey, DamageItem, RepairOrder, ServiceOrderItem, YardBlockLayout`), đúng gợi ý trong ghi
chú audit gốc. Thêm `IReportsAnalyticsService`/`ReportsAnalyticsService` + endpoint mới
`GET /api/reports/analytics` (route gộp trong `ReportsController` có sẵn, không đụng `GET /reports/kpi`
đang dùng ở Dashboard #1):

- **Throughput 7 ngày**: group `DepotJob.GateInDate`/`GateOutDate` theo ngày UTC gần nhất.
- **Cơ cấu hư hỏng IICL**: group `DamageItem` theo `Component`, tính % và tổng `TotalCost` thật.
- **Năng suất tổ thợ**: group `RepairOrder` (đã `CompletedAt`) theo `TechnicianName`, tính giờ trung bình
  từ `StartedAt`→`CompletedAt` và FPY từ tỉ lệ `QcStatus = PASS/PASSED`.
- **Container lưu bãi lâu**: `DepotJob` đang `Status != GATE_OUT` có số ngày từ `GateInDate` ≥ 15 ngày.
- **Bảng nhật ký chi tiết**: 100 `DepotJob` gần nhất, ghép `Estimate.GrandTotal` (chi phí EMR),
  `ServiceOrderItem` (phí nâng hạ theo `Category`), `Survey.ConditionRating` (Grade).
- **Sức chứa bãi theo Block**: dùng lại `YardBlockLayout` + occupancy từ `DepotJob` (đúng nguồn đã dựng ở
  [09-yard-map.md](09-yard-map.md), không tính trùng).
- **Phân hạng Grade A-D**: group `Survey.ConditionRating` toàn hệ thống, tính %.
- **Doanh thu theo nhóm dịch vụ**: group `ServiceOrderItem` theo `Category` thật.

**Frontend**: `ReportPage.tsx` gọi `reportApi.getAnalytics()` (client mới) lúc mount, giữ nguyên mảng cũ
làm **fallback** khi backend lỗi/offline — đúng pattern `backendKpi ?? fallback` đã có sẵn cho 3 số KPI.
Throughput, cơ cấu hư hỏng, năng suất tổ thợ, container lưu bãi lâu, bảng nhật ký, sức chứa Block A/B/C,
phân hạng Grade A-D đều đổi sang dữ liệu thật khi có; giữ nguyên toàn bộ giao diện/màu sắc cũ.
Build backend + `tsc --noEmit` frontend đều 0 lỗi.

## Đã làm tiếp (2026-08-23, vòng 2 — sau khi xác nhận danh sách Category thật)

**1. `report_revenue` (3 thẻ chi tiết):** xác nhận `ServiceOrderItem.Category` thật dùng ở module
Operation (#6, `fontend/src/modules/operation/mockData.ts`): `LOLO, STORAGE, CLEANING, REEFER_POWER, PTI,
YARD_SHIFT, CUSTOMS, EXTRA` — không phải "LIFT_ON_OFF"/"REPAIR" như đoán ban đầu. Map lại 3 thẻ:
- Thẻ 1 (Nâng hạ): `Category == LOLO`.
- Thẻ 2 (Sửa chữa EMR): **không** nằm trong `ServiceOrderItem` — lấy tổng `Estimate.GrandTotal` các báo
  giá `Status = APPROVED` (thêm field `EmrRepairRevenueVnd` vào `ReportAnalyticsDto`).
- Thẻ 3 (Vệ sinh & PTI lạnh): `Category IN (CLEANING, REEFER_POWER, PTI)`, tách 2 dòng chi tiết
  (`CLEANING` riêng, `REEFER_POWER + PTI` gộp).
2 dòng chi tiết cũ của Thẻ 1 (Hạ rỗng 40HC/20DC) bỏ vì không có dữ liệu group theo size thật — chỉ giữ số
tổng đúng, không bịa số chi tiết theo size.

**2. `report_staff_realtime`:** thay vì tạo hẳn hệ thống theo dõi tác vụ mới (bảng Task Assignment,
timer, HR profile...), tận dụng đúng tinh thần "không tạo bảng nếu dữ liệu thật đã đủ" — dựng danh sách
nhân sự từ các cột tên tự do đã có sẵn trên 5 bảng nghiệp vụ thật: `Survey.SurveyorName`,
`RepairOrder.TechnicianName` (thợ sửa) và `RepairOrder.InspectorName` (QC), `CleaningRecord.CleaningStaff`,
`ForkliftDispatch.DriverName`, `MaterialStockTransaction.PerformedBy`. Thêm
`IReportsAnalyticsService.GetStaffRealtimeAsync()` + `GET /api/reports/staff-realtime`:
- **Công việc đang làm (currentTask)**: suy từ trạng thái "đã bắt đầu, chưa xong" thật của từng bảng
  (RepairOrder có `StartedAt` mà chưa `CompletedAt`; CleaningRecord `Status IN (PENDING_CLEANING,
  IN_CLEANING)`; ForkliftDispatch `Status = MOVING`). `elapsedMinutes` tính thật từ `now - StartedAt`.
- **Số liệu hôm nay** (assigned/completed/pending): đếm thật theo `CreatedAt`/`CompletedAt` = hôm nay.
- **Thời gian TB/cont & FPY**: tính thật cho REPAIR (đã có sẵn logic từ `BuildTechnicianProductivityAsync`)
  và CLEANING (`CompletedAt - StartedAt` trung bình các lệnh đã bàn giao).
- **Nhật ký hoạt động**: build từ các bản ghi thật trong ngày, không bịa mô tả.

Frontend `StaffRealtimeReportTab.tsx` gọi `reportApi.getStaffRealtime()` thay `MOCK_STAFF_REALTIME_DATA`,
map DTO sang đúng type `StaffRealtimeItem` hiện có (không đổi UI/component khác).
Build backend + `tsc --noEmit` frontend đều 0 lỗi, đã chạy thử thật (`dotnet run` + Postgres) và gọi cả
2 endpoint mới — trả dữ liệu đúng, không exception.

## Còn thiếu thật sự (không có nguồn dữ liệu nào để tính, đã ghi rõ thay vì bịa số)

- **`GATE` và `REPAIR_FLOOR`** không xuất hiện trong danh sách nhân sự — `DepotJob` (Gate-In/Out) không
  có cột lưu tên người thực hiện; `RepairOrder` không phân biệt được thợ hàn/thợ mộc (chỉ có 1
  `TechnicianName` chung) nên gộp hết vào `REPAIR_WELDING`.
- **SĐT, ca trực (shift), chỉ tiêu ca (quota), đánh giá sao (rating), thời lượng dự kiến/tiến độ %** —
  không có nguồn thật (không có bảng "Nhân sự" độc lập với SĐT/ca làm việc). Đã xử lý minh bạch thay vì
  bịa số cố định: `targetQuota` = số việc đã giao thật (khớp = 100% hiệu suất khi hoàn thành hết việc
  giao), `ratingScore` quy đổi tuyến tính từ FPY thật, `estimatedDurationMinutes` lấy từ thời gian trung
  bình lịch sử thật của chính người đó (nếu có) thay vì số cố định, `phone`/`shift` giữ giá trị mặc định
  cố định duy nhất (không phân biệt từng người) — ghi rõ trong code là giới hạn đã biết.
- `penaltyFee` (phí lưu bãi phát sinh) ở bảng "Container lưu bãi lâu" vẫn trả `0` — chưa có công thức
  tính phí phạt theo ngày quá hạn nối với biểu cước thật (#25 `tariff_services`), không bịa số.
- `POST /reports/export-excel` vẫn là stub (không sinh file thật) — không phải lỗi mới.

## Trạng thái: ✅ Xong toàn bộ 5/5 tab (kể cả staff_realtime & revenue chi tiết)

- [x] `totalRevenueVnd`, `totalJobs`, `firstPassYieldPercent` — đã đúng từ trước, không đổi.
- [x] Throughput, cơ cấu hư hỏng IICL, năng suất tổ thợ, container lưu bãi lâu, bảng nhật ký chi tiết,
      sức chứa Block, phân hạng Grade — tính từ dữ liệu thật qua `GET /reports/analytics`.
- [x] `report_staff_realtime` — dựng từ 5 nguồn dữ liệu thật, không tạo module mới, đã chạy thử thật.
- [x] 3 thẻ doanh thu chi tiết (`report_revenue`) — map đúng theo `Category` thật đã xác nhận.
