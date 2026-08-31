using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebhooksController : ControllerBase
    {
        private readonly IDepotJobService _depotService;

        public WebhooksController(IDepotJobService depotService)
        {
            _depotService = depotService;
        }

        [HttpPost("bank-vietqr")]
        [HttpPost("payment")]
        public async Task<IActionResult> ProcessBankWebhook([FromBody] BankWebhookPaymentRequest request)
        {
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
