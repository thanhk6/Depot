using System;
using System.Collections.Generic;

namespace Depot.ViewModels
{
    /// <summary>Ứng viên đồng bộ công nợ — báo giá đã ghi nhận hãng duyệt + lệnh sửa chữa QC đạt, chưa có nợ hiệu lực.
    /// Amount = số tiền hãng duyệt; CompletedDate = ngày QC đạt (ngày Việt Nam).</summary>
    public class DebtSyncCandidateDto
    {
        public long DepotJobId { get; set; }
        public string JobNo { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string ShippingLineCode { get; set; } = string.Empty;
        public string ShippingLineName { get; set; } = string.Empty;
        public string QuotationNo { get; set; } = string.Empty;
        public string RepairNo { get; set; } = string.Empty;
        public DateTime CompletedDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        /// <summary>Tổng báo giá (để đối chiếu với số tiền hãng duyệt).</summary>
        public decimal QuotationTotal { get; set; }
        public string? ApprovalRef { get; set; }
    }

    public class SyncDebtsRequest
    {
        public List<string> JobNos { get; set; } = new();
        /// <summary>Bỏ qua — người thao tác lấy từ tài khoản đăng nhập.</summary>
        public string? PerformedBy { get; set; }
    }

    public class IssueInvoiceRequest
    {
        public string InvoiceNo { get; set; } = string.Empty;
    }

    public class PaymentAllocationRequest
    {
        public string DebtCode { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string QuotationNo { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class RecordArPaymentRequest
    {
        public string ShippingLineCode { get; set; } = string.Empty;
        public decimal PaymentAmount { get; set; }
        public string PaymentMethod { get; set; } = "BANK_TRANSFER";
        public string? BankName { get; set; }
        public string? ReferenceNo { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        /// <summary>Bỏ qua — người ghi thu lấy từ tài khoản đăng nhập.</summary>
        public string? RecordedBy { get; set; }
        public List<PaymentAllocationRequest> Allocations { get; set; } = new();
    }

    public class ClosePeriodRequest
    {
        public string? ClosingNotes { get; set; }
        /// <summary>Bỏ qua — người khoá sổ lấy từ tài khoản đăng nhập.</summary>
        public string? ClosedBy { get; set; }
    }

    public class ReverseArPaymentRequest
    {
        public string Reason { get; set; } = string.Empty;
        /// <summary>Bỏ qua — người huỷ lấy từ tài khoản đăng nhập.</summary>
        public string? ReversedBy { get; set; }
    }

    public class DebtAgingBucketDto
    {
        public string ShippingLineCode { get; set; } = string.Empty;
        public string ShippingLineName { get; set; } = string.Empty;
        /// <summary>Chưa đến hạn thanh toán.</summary>
        public decimal BucketNotDue { get; set; }
        /// <summary>Quá hạn 1–30 ngày (tên giữ nguyên để không vỡ client).</summary>
        public decimal Bucket0_30 { get; set; }
        public decimal Bucket31_60 { get; set; }
        public decimal Bucket61_90 { get; set; }
        public decimal BucketOver90 { get; set; }
        /// <summary>Tổng nợ quá hạn (các nhóm quá hạn).</summary>
        public decimal OverdueTotal { get; set; }
        public decimal TotalReceivable { get; set; }
    }
}
