# Design

## Context

- `BillingService` (+ `BillingController`, quyền `billing`) quản lý `ShippingLineDebts`, `DebtPeriods`, `ArPayments`, `PaymentAllocations`. 4 bảng đang trống (local 20/10/2026).
- Báo giá: `Estimates.Status = APPROVED`, `ApprovedAmount` (nhập tay ở bước ghi nhận duyệt, mặc định = tổng báo giá; spec `carrier-approval`), `CarrierAuthCode`, `CarrierWorkOrderNo`.
- QC: `CompleteQcInspectionAsync` đặt `RepairOrder.QcStatus = PASSED/FAILED` và `CompletedAt = lúc QC`. Một hồ sơ có thể có nhiều `RepairOrders` / `Estimates`.
- Nhật ký: `JobAuditLog` (`_db.AuditLogs`, theo `DepotJobId` + `JobNo`); `SystemAuditLogs` cho thao tác không gắn hồ sơ (UserService).
- Controller lấy người đăng nhập bằng `User.GetFullName() ?? User.GetUsername()`.

## Goals / Non-Goals

**Goals:** tiền nợ đúng số hãng duyệt sau QC đạt; kỳ theo tháng đúng số dư; server kiểm tra thu / phân bổ / huỷ / hoá đơn; người thao tác thật + nhật ký; màn hình hết số gõ cứng.

**Non-Goals:** công nợ lưu bãi / nâng hạ / vệ sinh; gửi API hãng; hoá đơn điện tử thật; đổi cách sinh mã chứng từ.

## Decisions

1. **Ứng viên đồng bộ:** báo giá APPROVED mới nhất (Id lớn nhất) mỗi hồ sơ + lệnh sửa chữa mới nhất của hồ sơ có `QcStatus = PASSED`; loại hồ sơ đã có nợ chưa huỷ (`Status != CANCELLED`). Số tiền = `ApprovedAmount ?? GrandTotal`; `ApprovalRef = CarrierAuthCode ?? CarrierWorkOrderNo` (trống thì null); `DebtDate = RepairOrder.CompletedAt` (lúc QC đạt); `DueDate = DebtDate + 30 ngày`. `SyncDebtsAsync` tính lại ứng viên ở server, chỉ nhận JobNo có trong danh sách.
2. **Kỳ tháng:** `FromDate` = ngày 1, `ToDate` = ngày cuối tháng, lưu dạng **ngày lịch Việt Nam 00:00 (Kind=Utc)** — cùng cách lưu `DebtDate` / `DueDate` / `PaymentDate` để màn hình (cắt `yyyy-MM-dd`) hiện đúng ngày; `Code = <hãng>-<yyyyMM>`, `PeriodCode = yyyy-MM`. `GetOrCreatePeriodAsync(line, monthOf(date))`: thiếu thì tạo. Sau mỗi phát sinh gọi `RecalculateBalancesAsync(line)`: duyệt các kỳ theo `FromDate`, kỳ đang mở có `Opening = Closing kỳ trước` (kỳ đầu = 0), `Closing = Opening + Debit − Credit`; kỳ đã khoá giữ nguyên.
3. **Nợ vào kỳ đã khoá** → kỳ tháng hiện tại (ghi chú trong `Notes`). **Thu / huỷ thu** thuộc kỳ đã khoá → 400.
4. **Khoá sổ:** chỉ kỳ đang mở có `FromDate` nhỏ nhất của hãng và ngày VN hiện tại > ngày cuối tháng; không tự tạo kỳ kế tiếp (tạo khi có phát sinh). Chốt trạng thái bằng `ExecuteUpdate` có điều kiện, trong transaction với nhật ký.
5. **Ghi thu:** kiểm tra theo spec; ngày thu chuẩn hoá theo ngày VN, không quá hôm nay; transaction gồm thu + phân bổ + nợ + kỳ + nhật ký từng hồ sơ (`AR_PAYMENT_RECORDED`).
6. **Huỷ thu:** kiểm tra kỳ của `PaymentDate` chưa khoá; transaction: `ExecuteUpdate` REVERSED có điều kiện → hoàn nợ → trừ `PeriodCredit` của kỳ chứa khoản thu → tính lại số dư → nhật ký (`AR_PAYMENT_REVERSED`).
7. **Người thao tác:** service nhận `actor` từ controller; trường `RecordedBy / ClosedBy / ReversedBy / PerformedBy` trong request bị bỏ qua (giữ thuộc tính để không vỡ client cũ). Nhật ký: `DEBT_SYNCED`, `AR_PAYMENT_RECORDED`, `AR_PAYMENT_REVERSED`, `DEBT_INVOICE_ISSUED` (JobAuditLog theo `JobNo` của khoản nợ); khoá sổ → `SystemAuditLogs` (`AR_PERIOD_CLOSED`).
8. **Hoá đơn:** trim, bắt buộc, ≤ 50 ký tự; nợ đã có `InvoiceNo` → 400; số hoá đơn đã dùng cho hãng khác → 400.
9. **Tuổi nợ:** `today = ngày VN`; `daysOverdue = today − ngày VN(DueDate)`; `≤ 0` → `BucketNotDue`, 1–30, 31–60, 61–90, > 90. Thêm `BucketNotDue`, `OverdueTotal` vào `DebtAgingBucketDto`.
10. **Frontend:** KPI / bảng hãng lấy nợ quá hạn từ `/billing/aging`; bộ lọc ngày mặc định ngày 1 → cuối tháng hiện tại, lọc `debtDate`; ô số hoá đơn trống; bỏ gửi tên người; tab tuổi nợ thêm cột "Chưa đến hạn"; kỳ hiển thị theo tháng.

## Risks / Trade-offs

- Kỳ cũ (15 ngày) nếu có trên VPS sẽ lệch quy tắc mới — bảng đang trống ở local; trước deploy kiểm tra VPS, nếu có dữ liệu thì báo người dùng trước.
- Bắt buộc tổng phân bổ = số tiền thu: không ghi nhận được tiền thừa chưa phân bổ (ngoài phạm vi).
