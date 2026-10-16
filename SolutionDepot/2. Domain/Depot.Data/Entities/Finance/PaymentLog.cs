using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Finance
{
    /// <summary>
    /// Nhật ký thanh toán riêng: mỗi lần thu (tiền mặt / chuyển khoản tại quầy / VietQR webhook) ghi 1 dòng,
    /// kể cả lần bị từ chối kèm lý do. Không bao giờ sửa/ghi đè (khác bảng Payment chỉ giữ 1 dòng mỗi hồ sơ).
    /// </summary>
    public class PaymentLog : FullAuditedEntity<long>
    {
        /// <summary>Hồ sơ container (null nếu webhook không khớp được hồ sơ nào).</summary>
        public long? DepotJobId { get; set; }
        public string? JobNo { get; set; }
        public string? ContainerNo { get; set; }
        /// <summary>Số phiếu dịch vụ được thu.</summary>
        public string? ServiceOrderNo { get; set; }
        /// <summary>Số phiếu thu (Payment.InvoiceNo) khi thành công.</summary>
        public string? InvoiceNo { get; set; }
        /// <summary>CASH | BANK_TRANSFER | VIETQR_WEBHOOK.</summary>
        public string Method { get; set; } = string.Empty;
        /// <summary>SUCCESS | REJECTED.</summary>
        public string Status { get; set; } = "SUCCESS";
        /// <summary>Số tiền yêu cầu / nhận được.</summary>
        public decimal Amount { get; set; }
        /// <summary>Tổng phiếu dịch vụ tại thời điểm thu (để đối chiếu).</summary>
        public decimal? OrderTotal { get; set; }
        /// <summary>Tiền khách đưa (tiền mặt).</summary>
        public decimal? CashReceived { get; set; }
        /// <summary>Tiền thừa trả khách (tiền mặt).</summary>
        public decimal? ChangeAmount { get; set; }
        /// <summary>Mã giao dịch ngân hàng / mã phiếu thu tiền mặt.</summary>
        public string? TransactionRef { get; set; }
        public string? Notes { get; set; }
        /// <summary>Người thu (tài khoản đăng nhập) hoặc "VietQR Webhook".</summary>
        public string? CashierName { get; set; }
        /// <summary>Lý do từ chối / thông điệp kết quả.</summary>
        public string? Message { get; set; }
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
    }
}
