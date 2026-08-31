using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Finance;

/// <summary>Kỳ đối soát công nợ của 1 hãng tàu (sổ cái theo kỳ, số dư chuyển kỳ tự động).</summary>
public class DebtPeriod : FullAuditedEntity<long>
{
    /// <summary>Mã kỳ (business key), vd MAEU-2026-08-01_2026-08-15.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Mã hãng tàu (liên kết logic sang ShippingLine.Code).</summary>
    public string ShippingLineCode { get; set; } = string.Empty;
    /// <summary>Tên hãng tàu (denormalized).</summary>
    public string ShippingLineName { get; set; } = string.Empty;
    /// <summary>Mã kỳ hiển thị, vd "2026-08-01_2026-08-15".</summary>
    public string PeriodCode { get; set; } = string.Empty;
    /// <summary>Ngày bắt đầu kỳ.</summary>
    public DateTime FromDate { get; set; }
    /// <summary>Ngày kết thúc kỳ.</summary>
    public DateTime ToDate { get; set; }
    /// <summary>Dư đầu kỳ (VNĐ) — lấy từ ClosingBalance kỳ trước.</summary>
    public decimal OpeningBalanceVnd { get; set; }
    /// <summary>Công nợ phát sinh trong kỳ (VNĐ).</summary>
    public decimal PeriodDebitVnd { get; set; }
    /// <summary>Tiền đã thanh toán trong kỳ (VNĐ).</summary>
    public decimal PeriodCreditVnd { get; set; }
    /// <summary>Dư cuối kỳ (VNĐ) = OpeningBalance + PeriodDebit - PeriodCredit.</summary>
    public decimal ClosingBalanceVnd { get; set; }
    /// <summary>Trạng thái: OPEN, CLOSED.</summary>
    public string Status { get; set; } = "OPEN";
    /// <summary>Thời điểm khoá sổ.</summary>
    public DateTime? ClosedAt { get; set; }
    /// <summary>Người khoá sổ.</summary>
    public string? ClosedBy { get; set; }
    /// <summary>Ghi chú khi khoá sổ.</summary>
    public string? ClosingNotes { get; set; }
}
