# Tiến độ đồng bộ Backend (SolutionDepot) theo Menu Frontend

📐 Quy tắc chung bắt buộc đọc trước: [00-quy-tac-backend.md](00-quy-tac-backend.md)
📐 Quy tắc tạo bảng (entity + EF Core): [00b-quy-tac-tao-bang.md](00b-quy-tac-tao-bang.md)

Quy trình: đi theo đúng thứ tự **menu thật đang chạy trên UI** (`fontend/src/components/layout/Sidebar.tsx`,
không phải `constants/menus.ts` — file đó là cấu hình cũ không được `App.tsx` dùng), từ trên xuống dưới,
với mỗi màn hình: kiểm tra endpoint frontend đang gọi → đối chiếu controller/service/entity backend
tương ứng → sửa/bổ sung nếu thiếu hoặc sai → build lại để xác nhận không lỗi → ghi lại vào file `.md` riêng.

Ký hiệu trạng thái: ✅ Xong · ⚠️ Xong một phần / có ghi chú · ❌ Chưa làm · 🔜 Chưa tới lượt

| # | Nhóm | Màn hình (tab id) | File chi tiết | Trạng thái |
|---|---|---|---|---|
| 0 | — | Hạ tầng nền (DI, JSON, DB) | [00-infrastructure.md](00-infrastructure.md) | ✅ |
| 1 | TỔNG QUAN | `dashboard` — Dashboard ERP | [01-dashboard.md](01-dashboard.md) | ✅ |
| 2 | TỔNG QUAN | `workflow` — Sơ Đồ Vòng Đời Nghiệp Vụ | [02-workflow.md](02-workflow.md) | ✅ |
| 3 | KHAI THÁC & GATE-IN | `gate` — 1. Tiếp Nhận Cổng (Gate-In) | [03-gate-in.md](03-gate-in.md) | ✅ |
| 4 | KHAI THÁC & GATE-IN | `survey` — 2. Giám Định (Survey e-EIR) | [04-survey.md](04-survey.md) | ✅ |
| 5 | KHAI THÁC & GATE-IN | `cleaning` — 3. Tổ Vệ Sinh (Cleaning Bay) | [05-cleaning.md](05-cleaning.md) | ✅ |
| 6 | KHAI THÁC & GATE-IN | `operation` — 4. Khai Thác Gate-In (Tariff) | [06-operation.md](06-operation.md) | ✅ |
| 7 | KHAI THÁC & GATE-IN | `payment` — 5. Thanh Toán VietQR | [07-payment.md](07-payment.md) | ✅ |
| 8 | QUẢN LÝ CONTAINER & BÃI | `container` — Danh Sách Container | [08-container-list.md](02-container-list.md) | ✅ |
| 9 | QUẢN LÝ CONTAINER & BÃI | `yard_map` — Sơ Đồ Bãi 2D (Konva) | [09-yard-map.md](09-yard-map.md) | ✅ |
| 10 | QUẢN LÝ CONTAINER & BÃI | `yard_blocks` — Quản Lý Vị Trí Block | [10-yard-blocks.md](10-yard-blocks.md) | ✅ |
| 11 | QUẢN LÝ CONTAINER & BÃI | `forklift` — Lệnh Điều Xe Nâng | [11-forklift.md](11-forklift.md) | ✅ |
| 12 | BÁO GIÁ & SỬA CHỮA | `estimate` — Lập Báo Giá Estimate | [12-estimate.md](12-estimate.md) | ✅ |
| 13 | BÁO GIÁ & SỬA CHỮA | `approval` — Phê Duyệt Hãng Tàu | [13-approval.md](13-approval.md) | ✅ |
| 14 | BÁO GIÁ & SỬA CHỮA | `repair` — Lệnh Sửa Chữa (WO) | [14-repair.md](14-repair.md) | ✅ |
| 15 | BÁO GIÁ & SỬA CHỮA | `qc` — 9. QC Nghiệm Thu (AV Grade) | [15-qc.md](15-qc.md) | ✅ |
| 16 | BÁO GIÁ & SỬA CHỮA | `shipping_api` — 10. Truyền API Hãng Tàu | [16-shipping-api.md](16-shipping-api.md) | ✅ |
| 17 | CỔNG XUẤT & GATE-OUT | `gate_out` — 11. Tổng Quan Cổng Xuất | [17-gate-out.md](17-gate-out.md) | ✅ |
| 18 | CỔNG XUẤT & GATE-OUT | `gate_out_ready` — 1. Vỏ Chờ Cấp | [17-gate-out.md](17-gate-out.md) | ✅ |
| 19 | CỔNG XUẤT & GATE-OUT | `gate_out_lane` — 2. Tiếp Nhận Làn Cổng Xuất | [17-gate-out.md](17-gate-out.md) | ✅ |
| 20 | CỔNG XUẤT & GATE-OUT | `gate_out_history` — 3. Nhật Ký Xuất & Phiếu e-EIR | [17-gate-out.md](17-gate-out.md) | ✅ |
| 21 | CÔNG NỢ & BILLING | `billing` — Công Nợ Hãng Tàu (AR) | [21-billing.md](21-billing.md) | ✅ |
| 22 | KHO VẬT TƯ | `warehouse` — Kho Vật Tư Sửa Chữa EMR | [22-warehouse.md](22-warehouse.md) | ✅ |
| 23 | MASTER DATA | `master_data` — Tất Cả Danh Mục | [23-master-data.md](23-master-data.md) | ✅ |
| 24 | MASTER DATA | `departments` — DM Phòng Ban Depot | [23-master-data.md](23-master-data.md) | ✅ |
| 25 | MASTER DATA | `tariff_services` — Cước Nâng Hạ & Lưu Bãi | [23-master-data.md](23-master-data.md) | ✅ |
| 26 | MASTER DATA | `cleaning_tariffs` — Biểu Phí Vệ Sinh Container | [23-master-data.md](23-master-data.md) | ✅ |
| 27 | MASTER DATA | `container_types` — DM Loại Container (ISO) | [23-master-data.md](23-master-data.md) | ✅ |
| 28 | MASTER DATA | `damage_locations` — DM Vị Trí Cấu Kiện | [23-master-data.md](23-master-data.md) | ✅ |
| 29 | MASTER DATA | `damage_codes` — DM Mã Hư Hỏng IICL | [23-master-data.md](23-master-data.md) | ✅ |
| 30 | MASTER DATA | `repair_codes` — DM Phương Án Sửa Chữa | [23-master-data.md](23-master-data.md) | ✅ |
| 31 | MASTER DATA | `grades` — DM Phân Hạng Vỏ | [23-master-data.md](23-master-data.md) | ✅ |
| 32 | MASTER DATA | `standards` — DM Tiêu Chuẩn Giám Định | [23-master-data.md](23-master-data.md) | ✅ |
| 33 | KHÁCH HÀNG & ĐỐI TÁC | `customer_list` — Khách Hàng (Trucking & FWD) | [33-customer-list.md](33-customer-list.md) | ✅ |
| 34 | KHÁCH HÀNG & ĐỐI TÁC | `customer_classifications` — DM Phân Loại Khách Hàng | [34-customer-classifications.md](34-customer-classifications.md) | ✅ |
| 35 | KHÁCH HÀNG & ĐỐI TÁC | `shipping_lines` — Hãng Tàu | [35-shipping-lines.md](35-shipping-lines.md) | ✅ |
| 36 | ZALO GATEWAY | `zalo_overview` — Tổng Quan Zalo OA | [36-zalo-overview.md](36-zalo-overview.md) | ✅ |
| 37 | ZALO GATEWAY | `zalo_simulator` — Zalo Simulator & Chat | [36-zalo-overview.md](36-zalo-overview.md) | ✅ |
| 38 | ZALO GATEWAY | `zalo_templates` — Mẫu Tin ZNS & OA | [36-zalo-overview.md](36-zalo-overview.md) | ✅ |
| 39 | ZALO GATEWAY | `zalo_settings` — Cấu Hình Zalo OA & Token | [36-zalo-overview.md](36-zalo-overview.md) | ✅ |
| 40 | ZALO GATEWAY | `zalo_logs` — Nhật Ký Webhook & API | [36-zalo-overview.md](36-zalo-overview.md) | ✅ |
| 41 | THÔNG BÁO | `notifications` — Dashboard Thông Báo | [41-notifications.md](41-notifications.md) | ✅ |
| 42 | THÔNG BÁO | `notifications_send` — Gửi Thông Báo Mới | [41-notifications.md](41-notifications.md) | ✅ |
| 43 | THÔNG BÁO | `notifications_employees` — Thông Báo Nhân Viên | [41-notifications.md](41-notifications.md) | ✅ |
| 44 | THÔNG BÁO | `notifications_customers` — Thông Báo Khách Hàng | [41-notifications.md](41-notifications.md) | ✅ |
| 45 | THÔNG BÁO | `notifications_templates` — Thư Viện Mẫu Tin | [41-notifications.md](41-notifications.md) | ✅ |
| 46 | THÔNG BÁO | `notifications_history` — Lịch Sử Gửi Toàn Hệ Thống | [41-notifications.md](41-notifications.md) | ✅ |
| 47 | THÔNG BÁO | `notifications_queue` — Hàng Đợi Gửi (Queue) | [41-notifications.md](41-notifications.md) | ✅ |
| 48 | BÁO CÁO & HIỆU SUẤT | `report_staff_realtime` — Công Việc Từng Người (Real-time) | [48-report.md](48-report.md) | ✅ |
| 49 | BÁO CÁO & HIỆU SUẤT | `report` — Tổng Quan & Thông Lượng Bãi | [48-report.md](48-report.md) | ✅ |
| 50 | BÁO CÁO & HIỆU SUẤT | `report_emr` — Năng Suất Sửa Chữa EMR | [48-report.md](48-report.md) | ✅ |
| 51 | BÁO CÁO & HIỆU SUẤT | `report_dwell_time` — Thời Gian Lưu Bãi (Dwell Time) | [48-report.md](48-report.md) | ✅ |
| 52 | BÁO CÁO & HIỆU SUẤT | `report_revenue` — Doanh Thu & Biểu Cước | [48-report.md](48-report.md) | ✅ |




Ghi chú:
- Cột "File chi tiết" của mục 8 trỏ về file cũ `02-container-list.md` (đã viết trước khi phát hiện thứ
  tự menu thật) — không đổi tên file, chỉ số thứ tự trong bảng này đổi từ 2 → 8 cho khớp vị trí thật.
- Nhiều tab (`yard_blocks`, `gate_out_ready/lane/history`, toàn bộ nhóm Zalo, nhóm Thông báo con,
  nhóm Báo cáo con...) nhiều khả năng dùng chung 1 vài endpoint backend — khi rà sẽ gộp nhận xét vào
  cùng 1 file nếu đúng là trùng lặp, không tạo file rỗng cho mỗi tab.

## Tổng kết đợt "làm hết việc lớn" (2026-08-23)

Sau khi rà xong toàn bộ 53/53 màn (session trước), người dùng xác nhận triển khai toàn bộ "việc lớn"
còn tồn đọng (trừ Zalo OA giữ dạng demo). Đã hoàn thành **6 module lớn** trong 1 phiên liên tục — mỗi
module đều build sạch (`dotnet build` toàn solution 0 lỗi, `tsc --noEmit` frontend 0 lỗi) và có migration
riêng:

1. **Cleaning** (#5) — `AddCleaningModule` (đã có từ trước, chỉ nối dây frontend đợt này).
2. **System/RBAC** (#53) — đồng bộ RoleCode 10 mã, CRUD User/Permissions/Audit Log/Security Policy —
   `AddSystemRbacExtras`.
3. **Yard Overview** (#9-10) — Sơ đồ bãi 2D + Quản lý Block dùng dữ liệu DepotJob thật —
   `AddYardOverviewModule`.
4. **Billing/AR** (#21) — Công nợ hãng tàu đồng bộ từ Estimate/RepairOrder thật — `AddBillingModule`.
5. **Warehouse** (#22) — Material mở rộng 17 field, tồn kho + phiếu nhập/xuất thật —
   `ExtendWarehouseModule`.
6. **Notifications** (#41-47) — Employees/Customers/Templates/Queue/Dashboard nối `SystemUsers`/
   `CustomerCompanies`/`NotificationRecord` thật — `AddNotificationExtras`.
7. **Reports** (#48-52) — 6/7 nhóm số liệu (throughput, hư hỏng, năng suất, lưu bãi, sức chứa, Grade)
   tính từ dữ liệu thật qua `GET /reports/analytics` mới (không cần migration riêng, chỉ đọc).

**Cập nhật (cùng ngày, vòng 2):** 2 mục còn lại cũng đã hoàn tất theo yêu cầu người dùng ("làm tiếp"):
- `report_staff_realtime` (#48) — không tạo module task-tracking mới; dựng danh sách nhân sự + công việc
  đang làm từ 5 nguồn dữ liệu thật đã có sẵn (`Survey.SurveyorName`, `RepairOrder.TechnicianName/
  InspectorName`, `CleaningRecord.CleaningStaff`, `ForkliftDispatch.DriverName`,
  `MaterialStockTransaction.PerformedBy`) qua `GET /reports/staff-realtime` mới. Các field không có nguồn
  thật (SĐT, ca trực, chỉ tiêu, rating) xử lý minh bạch (suy ra từ số liệu thật khác) thay vì bịa số cố
  định — chi tiết xem [48-report.md](48-report.md).
- 3 thẻ chi tiết `report_revenue` (#52) — đã xác nhận `ServiceOrderItem.Category` thật
  (`LOLO, STORAGE, CLEANING, REEFER_POWER, PTI, YARD_SHIFT, CUSTOMS, EXTRA`) và map đúng; doanh thu EMR
  lấy từ `Estimate.GrandTotal` (APPROVED) vì không nằm trong `ServiceOrderItem`.

Đã build + chạy thử thật (`dotnet run` + Postgres) cả 2 endpoint mới, không lỗi. **Toàn bộ 53/53 màn nay
đã ✅.**

Zalo Gateway (#36-40) giữ nguyên dạng demo/simulator theo quyết định người dùng — không phải thiếu sót.

## Chạy thử thật (live end-to-end test) qua frontend thật (2026-08-23)

Sau khi 53/53 màn đã ✅ theo audit tĩnh, người dùng yêu cầu chạy thử thật (không chỉ đọc code) qua đúng
đường frontend → backend thật (port 3000 proxy → port 50210 → Postgres thật), bắt đầu từ màn Gate-In rồi
tiếp tục cả chuỗi vòng đời container:

**Gate-In (#1)** — tạo container mới hợp lệ ✅ (toast thành công, job xuất hiện đúng); thử trùng số
container ✅ báo lỗi đúng; thử thiếu field bắt buộc ✅ validate đúng.

**Chuỗi vòng đời tiếp theo (Survey #4 → Estimate #12 → Approval #13 → Repair #14 → QC #15 →
Billing #21 → Gate-Out #17)** — chạy thật từng bước qua Postgres thật:
- Survey, Estimate, Approval, QC, Billing sync-candidates, Gate-Out: ✅ tất cả đúng như audit tĩnh đã ghi.
- **Repair Start (#14): phát hiện bug thật** — `POST /DepotJobs/{id}/repair/start` crash 500
  (`DbUpdateConcurrencyException`) do gán navigation property thay vì `_db.RepairOrders.Add(...)` tường
  minh. Bug này **không lộ ra khi chỉ `dotnet build`/audit tĩnh** — audit trước đó (mục 14) đã đánh giá
  sai là "khớp, không cần sửa". Đã sửa, build lại, test lại thành công. Chi tiết:
  [14-repair.md](14-repair.md#bug-đã-sửa-phát-hiện-khi-chạy-thử-thật-2026-08-23).

**Bài học:** audit tĩnh (đọc code, so khớp field/endpoint) không đủ để bắt bug runtime kiểu
concurrency/EF Core tracking — cần chạy thử thật với DB thật ít nhất 1 lần cho mỗi luồng nghiệp vụ chính
trước khi coi là "Xong" thật sự.
