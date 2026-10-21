# CÔNG NỢ HÃNG TÀU & BILLING

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Công Nợ Hãng Tàu (AR)](#công-nợ-hãng-tàu-ar) | `billing` | `BillingPage` |

---

## Công Nợ Hãng Tàu (AR)

Công nợ hãng tàu (AR): đồng bộ công nợ từ báo giá/lệnh sửa đã duyệt, xuất hóa đơn, ghi nhận & phân bổ thanh toán, kỳ công nợ, tuổi nợ.

### Frontend

- Tab id: `billing` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'billing'`).
- Trang: `BillingPage` — [`fontend/src/modules/billing/pages/BillingPage.tsx`](../../fontend/src/modules/billing/pages/BillingPage.tsx)

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `billingApi.closePeriod` | POST | `/api/billing/periods/{periodCode}/close` | `Billing.ClosePeriod` | `BillingService.ClosePeriodAsync` | `DebtPeriods` |
| `billingApi.getAgingReport` | GET | `/api/billing/aging` | `Billing.GetAgingReport` | `BillingService.GetAgingReportAsync` | `ShippingLineDebts` |
| `billingApi.getDebts` | GET | `/api/billing/debts` | `Billing.GetDebts` | `BillingService.GetDebtsAsync` | `ShippingLineDebts` |
| `billingApi.getPayments` | GET | `/api/billing/payments` | `Billing.GetPayments` | `BillingService.GetPaymentsAsync` | `ArPayments` |
| `billingApi.getPeriods` | GET | `/api/billing/periods` | `Billing.GetPeriods` | `BillingService.GetPeriodsAsync` | `DebtPeriods` |
| `billingApi.getSyncCandidates` | GET | `/api/billing/sync-candidates` | `Billing.GetSyncCandidates` | `BillingService.GetSyncCandidatesAsync` | `ShippingLineDebts`, `Estimates`, `depot_jobs`, `RepairOrders`, `ShippingLines` |
| `billingApi.issueInvoice` | POST | `/api/billing/debts/{debtCode}/invoice` | `Billing.IssueInvoice` | `BillingService.IssueInvoiceAsync` | `ShippingLineDebts` |
| `billingApi.recordPayment` | POST | `/api/billing/payments` | `Billing.RecordPayment` | `BillingService.RecordPaymentAsync` | `ShippingLineDebts`, `ArPayments`, `PaymentAllocations`, `DebtPeriods` |
| `billingApi.reversePayment` | POST | `/api/billing/payments/{paymentCode}/reverse` | `Billing.ReversePayment` | `BillingService.ReversePaymentAsync` | `ArPayments`, `ShippingLineDebts`, `DebtPeriods` |
| `billingApi.syncDebts` | POST | `/api/billing/sync` | `Billing.SyncDebts` | `BillingService.SyncDebtsAsync` | `ShippingLineDebts`, `Estimates`, `depot_jobs`, `RepairOrders`, `ShippingLines`, `DebtPeriods` |
| `masterDataApi.getShippingLines` | GET | `/api/MasterData/shipping-lines` | `MasterData.GetShippingLines` | `MasterDataService.GetAllShippingLinesAsync` | `ShippingLines` |

### Quy tắc nghiệp vụ (từ 21/10/2026, `depot-fullstack-shipping-line-ar-fix`)

- **Ghi nợ:** chỉ hồ sơ có báo giá đã ghi nhận hãng duyệt **và QC đạt**; số tiền = **số tiền hãng duyệt** (nhập tay ở *Ghi nhận hãng tàu duyệt*), mã duyệt = mã duyệt / số WO của hãng; ngày nợ = ngày QC đạt, hạn +30 ngày; mỗi hồ sơ một khoản nợ (lấy báo giá / lệnh sửa chữa mới nhất).
- **Kỳ công nợ theo tháng** (giờ Việt Nam), mỗi hãng mỗi tháng một kỳ (mã `<hãng>-yyyyMM`): nợ vào kỳ tháng QC đạt (kỳ đó đã khoá thì vào kỳ tháng hiện tại), tiền thu vào kỳ tháng ngày thu; đầu kỳ = cuối kỳ trước; cuối kỳ = đầu kỳ + nợ − thu.
- **Khoá sổ:** chỉ kỳ cũ nhất còn mở của hãng và chỉ khi tháng đó đã hết; khoá xong không ghi thu / huỷ thu vào kỳ đó.
- **Thu tiền:** tổng phân bổ phải bằng số tiền thu; từng phân bổ > 0, không vượt nợ còn lại, đúng hãng, khoản chưa thu đủ / chưa huỷ; ngày thu không ở tương lai.
- **Huỷ thu:** hoàn lại nợ từng container, trừ phát sinh thu của kỳ chứa khoản thu; mỗi phiếu chỉ huỷ một lần.
- **Hoá đơn:** bắt buộc nhập số (màn hình không tự điền); khoản đã có hoá đơn không ghi đè; một số hoá đơn chỉ dùng cho cùng hãng.
- **Tuổi nợ** theo ngày Việt Nam: *Chưa đến hạn*, quá hạn 1–30, 31–60, 61–90, > 90 ngày; thẻ *Nợ quá hạn* lấy từ báo cáo này. Bộ lọc ngày nợ mặc định tháng hiện tại.
- **Người thao tác** (đồng bộ, thu, huỷ thu, hoá đơn, khoá sổ) = tài khoản đăng nhập; nhật ký hồ sơ: `DEBT_SYNCED`, `AR_PAYMENT_RECORDED`, `AR_PAYMENT_REVERSED`, `DEBT_INVOICE_ISSUED`; khoá sổ ghi nhật ký hệ thống `AR_PERIOD_CLOSED`.
- Chỉ công nợ **sửa chữa**; lưu bãi / nâng hạ / vệ sinh chưa vào công nợ hãng.

### Ghi chú

- Ngân hàng nhận tiền nhập tay (chưa có danh mục tài khoản ngân hàng ở backend).

Lịch sử rà soát & sửa lỗi: [21-billing.md](../backend-progress/21-billing.md)

