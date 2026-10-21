using System.Collections.Generic;
using System.Threading.Tasks;
using Depot.Data.Entities.Finance;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Công nợ phải thu (Accounts Receivable) theo hãng tàu — mục #21 `billing`. Đồng bộ từ
    /// Estimate/RepairOrder đã hoàn thành, khác hẳn <see cref="IDepotJobService"/> (thanh toán cấp trả
    /// container qua VietQR tại Gate-Out, mục #7 `payment`). Xem docs/backend-progress/21-billing.md.
    /// </summary>
    public interface IBillingService
    {
        Task<List<ShippingLineDebt>> GetDebtsAsync(string? shippingLineCode = null, string? status = null);
        Task<List<DebtPeriod>> GetPeriodsAsync(string? shippingLineCode = null);
        Task<List<ArPayment>> GetPaymentsAsync(string? shippingLineCode = null);
        Task<List<DebtSyncCandidateDto>> GetSyncCandidatesAsync();
        Task<List<ShippingLineDebt>> SyncDebtsAsync(SyncDebtsRequest request, string actor);
        Task<ShippingLineDebt?> IssueInvoiceAsync(string debtCode, IssueInvoiceRequest request, string actor);
        Task<ApiResult<ArPayment>> RecordPaymentAsync(RecordArPaymentRequest request, string actor);
        Task<ApiResult<DebtPeriod>> ClosePeriodAsync(string periodCode, ClosePeriodRequest request, string actor);
        Task<ApiResult<ArPayment>> ReversePaymentAsync(string paymentCode, ReverseArPaymentRequest request, string actor);
        Task<List<DebtAgingBucketDto>> GetAgingReportAsync();
    }
}
