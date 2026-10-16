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

### Ghi chú

- Ngân hàng nhận tiền nhập tay (chưa có danh mục tài khoản ngân hàng ở backend).

Lịch sử rà soát & sửa lỗi: [21-billing.md](../backend-progress/21-billing.md)

