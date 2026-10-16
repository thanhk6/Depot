using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    // Ngân hàng/cổng thanh toán gọi vào không có JWT của người dùng — được ẩn danh CÓ CHỦ ĐÍCH vì mỗi
    // action đã tự xác thực bằng header X-Webhook-Secret (IsValidWebhookSecret) trước khi xử lý.
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class WebhooksController : ControllerBase
    {
        private readonly IDepotJobService _depotService;
        private readonly IConfiguration _configuration;

        public WebhooksController(IDepotJobService depotService, IConfiguration configuration)
        {
            _depotService = depotService;
            _configuration = configuration;
        }

        /// <summary>Trước đây webhook không xác thực nguồn gọi — bất kỳ ai biết URL đều POST được nội dung
        /// tuỳ ý để tự đánh dấu container đã thanh toán (giả mạo giao dịch ngân hàng). Yêu cầu shared secret
        /// qua header "X-Webhook-Secret", khớp đúng giá trị cấu hình ở appsettings.json (mục
        /// "Webhooks:BankSharedSecret" — thay bằng secret thật do ngân hàng/cổng thanh toán cấp khi tích
        /// hợp thật, hiện tại chỉ là giá trị placeholder).</summary>
        private bool IsValidWebhookSecret()
        {
            var expected = _configuration["Webhooks:BankSharedSecret"];
            if (string.IsNullOrWhiteSpace(expected)) return false;
            var provided = Request.Headers["X-Webhook-Secret"].ToString();
            return !string.IsNullOrEmpty(provided) && string.Equals(provided, expected, StringComparison.Ordinal);
        }

        [HttpPost("bank-vietqr")]
        [HttpPost("payment")]
        public async Task<IActionResult> ProcessBankWebhook([FromBody] BankWebhookPaymentRequest request)
        {
            if (!IsValidWebhookSecret())
            {
                return Unauthorized(new ResponseSingleContentModel<string>
                {
                    StatusCode = 401,
                    Message = "Webhook không xác thực được nguồn gọi",
                    Data = "Thiếu hoặc sai header X-Webhook-Secret"
                });
            }

            try
            {
                if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.Content))
                {
                    return BadRequest(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 400,
                        Message = "Dữ liệu webhook không hợp lệ",
                        Data = "Thiếu nội dung chuyển khoản hoặc mã giao dịch"
                    });
                }

                var success = await _depotService.ProcessBankWebhookPaymentAsync(request);

                if (success)
                {
                    return Ok(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 200,
                        Message = "Khớp nối thanh toán VietQR ngân hàng thành công",
                        Data = $"Đã xác nhận thanh toán tự động cho nội dung '{request.Content}' với số tiền {request.Amount:N0} VNĐ"
                    });
                }

                return BadRequest(new ResponseSingleContentModel<string>
                {
                    StatusCode = 400,
                    Message = "Không thể khớp nối giao dịch",
                    Data = $"Nội dung '{request.Content}' không khớp với bất kỳ JobNo hoặc ContainerNo nào đang chờ thanh toán"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Có lỗi trong quá trình xử lý Webhook ngân hàng",
                    Data = ex.Message
                });
            }
        }
    }
}
