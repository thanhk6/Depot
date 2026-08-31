using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Finance;

/// <summary>
/// Khoản công nợ phải thu của 1 hãng tàu phát sinh từ 1 container/báo giá sửa chữa đã duyệt
/// (Accounts Receivable line item). Đồng bộ từ <c>Estimate</c> (Status=APPROVED) + <c>RepairOrder</c>
/// đã hoàn thành, không nhập tay số tiền.
/// </summary>
public class ShippingLineDebt : FullAuditedEntity<long>
{
    /// <summary>Mã công nợ (business key).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Mã hãng tàu (liên kết logic sang ShippingLine.Code).</summary>
    public string ShippingLineCode { get; set; } = string.Empty;
    /// <summary>Tên hãng tàu (denormalized để hiển thị nhanh).</summary>
    public string ShippingLineName { get; set; } = string.Empty;
    /// <summary>Mã job depot liên kết (liên kết logic sang DepotJob.JobNo).</summary>
    public string JobNo { get; set; } = string.Empty;
    /// <summary>Số container phát sinh công nợ.</summary>
    public string ContainerNo { get; set; } = string.Empty;
    /// <summary>Số báo giá đã duyệt (Estimate.EstimateNo).</summary>
    public string QuotationNo { get; set; } = string.Empty;
    /// <summary>Số lệnh sửa chữa liên quan (hiện dùng lại JobNo vì RepairOrder chưa có mã riêng).</summary>
    public string RepairNo { get; set; } = string.Empty;
    /// <summary>Số hóa đơn VAT đã xuất (nếu có).</summary>
    public string? InvoiceNo { get; set; }
    /// <summary>Mã kỳ công nợ chứa khoản này (liên kết logic sang DebtPeriod.Code).</summary>
    public string DebtPeriodCode { get; set; } = string.Empty;
    /// <summary>Ngày phát sinh nợ (ngày sửa chữa hoàn thành).</summary>
    public DateTime DebtDate { get; set; }
    /// <summary>Hạn thanh toán (mặc định Net 30).</summary>
    public DateTime DueDate { get; set; }
    /// <summary>Loại dịch vụ: REPAIR, STORAGE, HANDLING, CLEANING, PTI.</summary>
    public string ServiceType { get; set; } = "REPAIR";
    /// <summary>Nội dung công việc.</summary>
    public string Description { get; set; } = string.Empty;
    /// <summary>Tổng tiền phải thu (VNĐ).</summary>
    public decimal TotalAmountVnd { get; set; }
    /// <summary>Số tiền đã thanh toán (VNĐ).</summary>
    public decimal PaidAmountVnd { get; set; }
    /// <summary>Số tiền còn nợ (VNĐ) = TotalAmountVnd - PaidAmountVnd.</summary>
    public decimal RemainingAmountVnd { get; set; }
    /// <summary>Trạng thái: UNPAID, PARTIAL, PAID, CANCELLED.</summary>
    public string Status { get; set; } = "UNPAID";
    /// <summary>Mã phê duyệt của hãng tàu (EDI Auth code) nếu có.</summary>
    public string? ApprovalRef { get; set; }
    /// <summary>Ghi chú.</summary>
    public string? Notes { get; set; }
}
