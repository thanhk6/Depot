using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.ApiIntegration.Controllers
{
    [ApiController]
    [Route("api/integration/vietqr")]
    public class VietQRWebhookController : ControllerBase
    {
        private readonly IDepotJobService _depotService;

        public VietQRWebhookController(IDepotJobService depotService)
        {
            _depotService = depotService;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> HandleBankWebhook([FromBody] BankWebhookPaymentRequest webhook)
        {
            var matched = await _depotService.ProcessBankWebhookPaymentAsync(webhook);
            if (!matched)
            {
                return Ok(new { success = false, message = "Không tìm thấy hồ sơ container tương ứng với nội dung chuyển khoản. Đã chuyển vào danh sách chờ kế toán kiểm tra thủ công." });
            }

            return Ok(new { success = true, message = $"✅ Tự động đối chiếu thành công giao dịch {webhook.TransactionRef}. Đã chuyển trạng thái Phiếu thu sang ĐÃ THANH TOÁN." });
        }
    }
}
