using System;
using System.Collections.Generic;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Finance;

/// <summary>
/// Khoản thanh toán công nợ AR của 1 hãng tàu (khác <c>Payment</c> — Payment là thanh toán cấp trả
/// container qua VietQR tại Gate-Out, ArPayment là đối soát công nợ theo kỳ với hãng tàu).
/// </summary>
public class ArPayment : FullAuditedEntity<long>
{
    /// <summary>Mã thanh toán (business key), vd PAY-2026-001.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Mã hãng tàu (liên kết logic sang ShippingLine.Code).</summary>
    public string ShippingLineCode { get; set; } = string.Empty;
    /// <summary>Tên hãng tàu (denormalized).</summary>
    public string ShippingLineName { get; set; } = string.Empty;
    /// <summary>Ngày thanh toán.</summary>
    public DateTime PaymentDate { get; set; }
    /// <summary>Số tiền thanh toán (VNĐ).</summary>
    public decimal PaymentAmountVnd { get; set; }
    /// <summary>Hình thức thanh toán: BANK_TRANSFER, SWIFT, CASH, VIETQR, CREDIT_CARD.</summary>
    public string PaymentMethod { get; set; } = "BANK_TRANSFER";
    /// <summary>Ngân hàng.</summary>
    public string? BankName { get; set; }
    /// <summary>Mã giao dịch/UNC/Swift Ref.</summary>
    public string? ReferenceNo { get; set; }
    /// <summary>Trạng thái: CONFIRMED, REVERSED.</summary>
    public string Status { get; set; } = "CONFIRMED";
    /// <summary>Ghi chú.</summary>
    public string? Notes { get; set; }
    /// <summary>Người ghi nhận thanh toán.</summary>
    public string RecordedBy { get; set; } = string.Empty;
    /// <summary>Người thực hiện huỷ (nếu bị Reverse).</summary>
    public string? ReversedBy { get; set; }
    /// <summary>Thời điểm huỷ.</summary>
    public DateTime? ReversedAt { get; set; }
    /// <summary>Lý do huỷ.</summary>
    public string? ReversalReason { get; set; }

    /// <summary>Danh sách phân bổ khoản thanh toán này cho từng công nợ.</summary>
    public virtual ICollection<PaymentAllocation> Allocations { get; set; } = new List<PaymentAllocation>();
}
