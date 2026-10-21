using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>Công nợ phải thu theo hãng tàu (Accounts Receivable) — mục #21 `billing`.</summary>
    [ApiController]
    [RequirePermission(RolePermissions.Billing)]
    [Route("api/billing")]
    public sealed class BillingController : ControllerBase
    {
        private readonly IBillingService service;
        public BillingController(IBillingService service) => this.service = service;

        // Người thao tác = tài khoản đăng nhập; tên người do trình duyệt gửi bị bỏ qua (depot-fullstack-shipping-line-ar-fix).
        private string Actor => User.GetFullName() ?? User.GetUsername() ?? string.Empty;

        [HttpGet("debts")]
        public async Task<IActionResult> GetDebts([FromQuery] string? shippingLineCode, [FromQuery] string? status)
        {
            try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách công nợ thành công", Data = await service.GetDebtsAsync(shippingLineCode, status) }); }
            catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh sách công nợ", Data = ex.Message }); }
        }

        [HttpGet("periods")]
        public async Task<IActionResult> GetPeriods([FromQuery] string? shippingLineCode)
        {
            try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách kỳ công nợ thành công", Data = await service.GetPeriodsAsync(shippingLineCode) }); }
            catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh sách kỳ công nợ", Data = ex.Message }); }
        }

        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments([FromQuery] string? shippingLineCode)
        {
            try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách thanh toán thành công", Data = await service.GetPaymentsAsync(shippingLineCode) }); }
            catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh sách thanh toán", Data = ex.Message }); }
        }

        [HttpGet("sync-candidates")]
        public async Task<IActionResult> GetSyncCandidates()
        {
            try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách ứng viên đồng bộ thành công", Data = await service.GetSyncCandidatesAsync() }); }
            catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy danh sách ứng viên đồng bộ", Data = ex.Message }); }
        }

        [HttpPost("sync")]
        public async Task<IActionResult> SyncDebts([FromBody] SyncDebtsRequest request)
        {
            try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Đồng bộ công nợ thành công", Data = await service.SyncDebtsAsync(request, Actor) }); }
            catch (Exception ex) { return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể đồng bộ công nợ" }); }
        }

        [HttpPost("debts/{debtCode}/invoice")]
        public async Task<IActionResult> IssueInvoice(string debtCode, [FromBody] IssueInvoiceRequest request)
        {
            try
            {
                var debt = await service.IssueInvoiceAsync(debtCode, request, Actor);
                return debt == null
                    ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy khoản công nợ", Data = debtCode })
                    : Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Xuất hóa đơn thành công", Data = debt });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể xuất hóa đơn" });
            }
        }

        [HttpPost("payments")]
        public async Task<IActionResult> RecordPayment([FromBody] RecordArPaymentRequest request)
        {
            try
            {
                var result = await service.RecordPaymentAsync(request, Actor);
                return result.IsSuccessed
                    ? Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = result.Message ?? "Ghi nhận thanh toán thành công", Data = result.ResultObj })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = result.Message ?? "Không thể ghi nhận thanh toán", Data = request.ShippingLineCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi ghi nhận thanh toán", Data = ex.Message });
            }
        }

        [HttpPost("periods/{periodCode}/close")]
        public async Task<IActionResult> ClosePeriod(string periodCode, [FromBody] ClosePeriodRequest request)
        {
            try
            {
                var result = await service.ClosePeriodAsync(periodCode, request, Actor);
                return result.IsSuccessed
                    ? Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = result.Message ?? "Khoá sổ kỳ công nợ thành công", Data = result.ResultObj })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = result.Message ?? "Không thể khoá sổ kỳ công nợ", Data = periodCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi khoá sổ kỳ công nợ", Data = ex.Message });
            }
        }

        [HttpPost("payments/{paymentCode}/reverse")]
        public async Task<IActionResult> ReversePayment(string paymentCode, [FromBody] ReverseArPaymentRequest request)
        {
            try
            {
                var result = await service.ReversePaymentAsync(paymentCode, request, Actor);
                return result.IsSuccessed
                    ? Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = result.Message ?? "Huỷ khoản thanh toán thành công", Data = result.ResultObj })
                    : BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = result.Message ?? "Không thể huỷ khoản thanh toán", Data = paymentCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi huỷ khoản thanh toán", Data = ex.Message });
            }
        }

        [HttpGet("aging")]
        public async Task<IActionResult> GetAgingReport()
        {
            try { return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy báo cáo tuổi nợ thành công", Data = await service.GetAgingReportAsync() }); }
            catch (Exception ex) { return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy báo cáo tuổi nợ", Data = ex.Message }); }
        }
    }
}
