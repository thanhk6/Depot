using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.ApiIntegration.Controllers
{
    [ApiController]
    [Route("api/integration/vietqr")]
    public class VietQRWebhookController : ControllerBase
    {
        private readonly IDepotJobService _depotService;
        private readonly IConfiguration _configuration;

        public VietQRWebhookController(IDepotJobService depotService, IConfiguration configuration)
        {
            _depotService = depotService;
            _configuration = configuration;
        }

        /// <summary>Cùng cơ chế xác thực với WebhooksController bên Depot.BackendApi — trước đây endpoint
        /// này không xác thực nguồn gọi nào cả.</summary>
        private bool IsValidWebhookSecret()
        {
            var expected = _configuration["Webhooks:BankSharedSecret"];
            if (string.IsNullOrWhiteSpace(expected)) return false;
            var provided = Request.Headers["X-Webhook-Secret"].ToString();
            return !string.IsNullOrEmpty(provided) && string.Equals(provided, expected, StringComparison.Ordinal);
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> HandleBankWebhook([FromBody] BankWebhookPaymentRequest webhook)
        {
            if (!IsValidWebhookSecret())
            {
                return Unauthorized(new { success = false, message = "Thiếu hoặc sai header X-Webhook-Secret" });
            }

            var matched = await _depotService.ProcessBankWebhookPaymentAsync(webhook);
            if (!matched)
            {
                return Ok(new { success = false, message = "Không tìm thấy hồ sơ container tương ứng với nội dung chuyển khoản. Đã chuyển vào danh sách chờ kế toán kiểm tra thủ công." });
            }

            return Ok(new { success = true, message = $"✅ Tự động đối chiếu thành công giao dịch {webhook.TransactionRef}. Đã chuyển trạng thái Phiếu thu sang ĐÃ THANH TOÁN." });
        }
    }
}
