using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>Công nợ phải thu theo hãng tàu (Accounts Receivable) — mục #21 `billing`.</summary>
    [ApiController]
    [Route("api/billing")]
    public sealed class BillingController : ControllerBase
    {
        private readonly IBillingService service;
        public BillingController(IBillingService service) => this.service = service;

        [HttpGet("debts")]
        public async Task<IActionResult> GetDebts([FromQuery] string? shippingLineCode, [FromQuery] string? status)
            => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách công nợ thành công", Data = await service.GetDebtsAsync(shippingLineCode, status) });

        [HttpGet("periods")]
        public async Task<IActionResult> GetPeriods([FromQuery] string? shippingLineCode)
            => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách kỳ công nợ thành công", Data = await service.GetPeriodsAsync(shippingLineCode) });

        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments([FromQuery] string? shippingLineCode)
            => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách thanh toán thành công", Data = await service.GetPaymentsAsync(shippingLineCode) });

        [HttpGet("sync-candidates")]
        public async Task<IActionResult> GetSyncCandidates()
            => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách ứng viên đồng bộ thành công", Data = await service.GetSyncCandidatesAsync() });

        [HttpPost("sync")]
        public async Task<IActionResult> SyncDebts([FromBody] SyncDebtsRequest request)
            => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Đồng bộ công nợ thành công", Data = await service.SyncDebtsAsync(request) });

        [HttpPost("debts/{debtCode}/invoice")]
        public async Task<IActionResult> IssueInvoice(string debtCode, [FromBody] IssueInvoiceRequest request)
        {
            var debt = await service.IssueInvoiceAsync(debtCode, request);
            return debt == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy khoản công nợ", Data = debtCode })
                : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Xuất hóa đơn thành công", Data = debt });
        }

        [HttpPost("payments")]
        public async Task<IActionResult> RecordPayment([FromBody] RecordArPaymentRequest request)
        {
            var result = await service.RecordPaymentAsync(request);
            return result.IsSuccessed
                ? Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = result.Message ?? "Ghi nhận thanh toán thành công", Data = result.ResultObj })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = result.Message ?? "Không thể ghi nhận thanh toán", Data = request.ShippingLineCode });
        }

        [HttpPost("periods/{periodCode}/close")]
        public async Task<IActionResult> ClosePeriod(string periodCode, [FromBody] ClosePeriodRequest request)
        {
            var result = await service.ClosePeriodAsync(periodCode, request);
            return result.IsSuccessed
                ? Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = result.Message ?? "Khoá sổ kỳ công nợ thành công", Data = result.ResultObj })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = result.Message ?? "Không thể khoá sổ kỳ công nợ", Data = periodCode });
        }

        [HttpPost("payments/{paymentCode}/reverse")]
        public async Task<IActionResult> ReversePayment(string paymentCode, [FromBody] ReverseArPaymentRequest request)
        {
            var result = await service.ReversePaymentAsync(paymentCode, request);
            return result.IsSuccessed
                ? Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = result.Message ?? "Huỷ khoản thanh toán thành công", Data = result.ResultObj })
                : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = result.Message ?? "Không thể huỷ khoản thanh toán", Data = paymentCode });
        }

        [HttpGet("aging")]
        public async Task<IActionResult> GetAgingReport()
            => Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy báo cáo tuổi nợ thành công", Data = await service.GetAgingReportAsync() });
    }
}
