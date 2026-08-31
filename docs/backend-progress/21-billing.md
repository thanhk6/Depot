# 21 — Công Nợ Hãng Tàu (AR)

Menu: `billing` → `BillingPage.tsx`, xác nhận qua `App.tsx` (`case 'billing'`).

## Hiện trạng trước khi sửa (đã audit ở vòng đầu)

Chỉ 1 lệnh gọi backend thật (`masterDataApi.getShippingLines()`, đã đúng từ trước). Toàn bộ nghiệp vụ
chính — sổ cái công nợ theo container, phát hành hoá đơn, phân bổ thanh toán, báo cáo tuổi nợ, đóng kỳ
kế toán — dùng `mockData.ts` + state cục bộ, không có API nào khác. Không có `BillingController`/entity
Invoice-AR nào trong `SolutionDepot`.

## Đã làm (2026-08-23, sau khi người dùng xác nhận làm toàn bộ việc lớn còn lại)

**1. Entity mới** (`Depot.Data/Entities/Finance/`, khóa `long`, business key `Code`, theo
`00b-quy-tac-tao-bang.md`): `ShippingLineDebt` (khoản công nợ/dòng AR theo container), `DebtPeriod`
(kỳ đối soát theo hãng tàu, số dư chuyển kỳ tự động), `ArPayment` (thanh toán AR — **khác** entity
`Payment` cũ dùng cho cấp trả container qua VietQR ở Gate-Out #7, đặt tên `ArPayment` để tránh nhầm lẫn),
`PaymentAllocation` (phân bổ 1 `ArPayment` cho nhiều `ShippingLineDebt`). Migration `AddBillingModule`.

**2. Nguồn dữ liệu công nợ — đồng bộ từ nghiệp vụ thật, không nhập tay số tiền:**
`GetSyncCandidatesAsync()` (`BillingService`) truy vấn `Estimate` (Status=APPROVED) join `DepotJob` join
`RepairOrder` (CompletedAt đã có), loại trừ JobNo đã tồn tại `ShippingLineDebt` (chống trùng). Khi đồng
bộ, số tiền công nợ lấy đúng `Estimate.GrandTotal` đã duyệt — không bịa số.

**3. `BillingService` + `BillingController` (route `api/billing`):**
- `GET /debts`, `GET /periods`, `GET /payments` (kèm `Allocations`), `GET /sync-candidates`, `GET /aging`.
- `POST /sync` — tạo `ShippingLineDebt` từ danh sách JobNo được chọn, tự tạo/tìm `DebtPeriod` đang `OPEN`
  cho hãng tàu đó (nếu chưa có: mở kỳ mới 14 ngày, dư đầu kỳ lấy từ kỳ đã đóng gần nhất), cộng dồn
  `PeriodDebitVnd`.
- `POST /debts/{code}/invoice` — gắn số hoá đơn VAT.
- `POST /payments` — tạo `ArPayment` + N `PaymentAllocation`, cập nhật `PaidAmount/RemainingAmount/Status`
  từng công nợ, cộng `PeriodCreditVnd` vào kỳ đang mở.
- `POST /periods/{code}/close` — khoá kỳ hiện tại, tự tạo kỳ kế tiếp với `OpeningBalance` = `ClosingBalance`
  kỳ vừa đóng (đúng quy tắc kế toán số dư chuyển kỳ).
- `POST /payments/{code}/reverse` — huỷ thanh toán, hoàn trả `PaidAmount` từng công nợ theo đúng phân bổ
  gốc, trừ lại `PeriodCreditVnd` của kỳ đang mở.
- `GET /aging` — tính bucket 0-30/31-60/61-90/90+ ngày từ `DueDate` thật của từng công nợ còn nợ.

**4. Frontend nối dây thật:**
- `fontend/src/api/billing.api.ts` (client mới, 10 hàm khớp 10 endpoint).
- `fontend/src/modules/billing/utils/mapBilling.ts` — map DTO backend (field `...Vnd`, `Code` làm khoá)
  sang type frontend hiện có (`ShippingLineDebt/DebtPeriod/Payment/PaymentAllocation/DebtAgingBucket`).
- `BillingPage.tsx`: nạp `debts/periods/payments/agingData` qua `Promise.all` lúc mount + hàm
  `reloadBillingData()` gọi lại sau mỗi thao tác ghi (đồng bộ, thanh toán, xuất hoá đơn, đóng kỳ, huỷ
  thanh toán) — cả 5 handler đều chuyển từ tự sửa `useState` sang gọi API thật rồi reload.
- `SyncDebtModal.tsx`: bỏ hẳn `candidatePool` bịa cứng 3 container mẫu, gọi
  `billingApi.getSyncCandidates()` thật lúc mở modal; đổi hợp đồng callback `onSyncDebts` từ nhận
  `ShippingLineDebt[]` tự dựng sang nhận `string[]` (danh sách JobNo được chọn) — khớp đúng
  `SyncDebtsRequest.JobNos` backend.
- Build backend + `tsc --noEmit` frontend đều 0 lỗi.

## Còn thiếu (không chặn, ghi nhận để làm sau nếu cần)

- `serviceType` trên `ShippingLineDebt` luôn ghi cứng `"REPAIR"` khi đồng bộ — vì nguồn ứng viên hiện chỉ
  lấy từ Estimate/RepairOrder (sửa chữa). Công nợ phát sinh từ STORAGE/HANDLING/CLEANING/PTI (đã khai báo
  sẵn trong `DebtStatus`/`serviceType` type phía frontend) chưa có nguồn dữ liệu thật tương ứng để đồng bộ
  — không tự bịa, để lại làm sau nếu cần mở rộng nguồn AR.
- `ContainerDebtDetailModal` (xem chi tiết 1 công nợ) chưa kiểm tra riêng — dùng chung dữ liệu đã nạp từ
  `GET /debts`, không có endpoint chi tiết riêng (không cần thiết vì danh sách đã đủ field).
- Xuất Excel/PDF báo cáo công nợ (`onExportExcel`/`onExportPDF` trong `DebtDashboardKPI`) vẫn chỉ hiện
  toast, chưa sinh file thật — giống tình trạng chung của `POST /reports/export-excel` (xem mục #48-52),
  không phải lỗi riêng của Billing.

## Trạng thái: ✅ Xong (backend + frontend đã nối dây, đồng bộ từ Estimate/RepairOrder thật, build sạch)

- [x] `GET /api/MasterData/shipping-lines` — đã đúng từ trước, không cần sửa.
- [x] Module AR đầy đủ (4 entity, migration, service, controller, DI) — đã build.
- [x] `BillingPage.tsx` + `SyncDebtModal.tsx` nối API thật cho cả 5 luồng: đồng bộ, xuất hoá đơn,
      thanh toán + phân bổ, đóng kỳ, huỷ thanh toán.
