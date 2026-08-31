using System;
using System.Collections.Generic;

namespace Depot.ViewModels
{
    /// <summary>Ứng viên đồng bộ công nợ — Estimate đã duyệt + RepairOrder đã hoàn thành, chưa có ShippingLineDebt.</summary>
    public class DebtSyncCandidateDto
    {
        public string JobNo { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string ShippingLineCode { get; set; } = string.Empty;
        public string ShippingLineName { get; set; } = string.Empty;
        public string QuotationNo { get; set; } = string.Empty;
        public string RepairNo { get; set; } = string.Empty;
        public DateTime CompletedDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? ApprovalRef { get; set; }
    }

    public class SyncDebtsRequest
    {
        public List<string> JobNos { get; set; } = new();
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
        public string RecordedBy { get; set; } = string.Empty;
        public List<PaymentAllocationRequest> Allocations { get; set; } = new();
    }

    public class ClosePeriodRequest
    {
        public string? ClosingNotes { get; set; }
        public string ClosedBy { get; set; } = string.Empty;
    }

    public class ReverseArPaymentRequest
    {
        public string Reason { get; set; } = string.Empty;
        public string ReversedBy { get; set; } = string.Empty;
    }

    public class DebtAgingBucketDto
    {
        public string ShippingLineCode { get; set; } = string.Empty;
        public string ShippingLineName { get; set; } = string.Empty;
        public decimal Bucket0_30 { get; set; }
        public decimal Bucket31_60 { get; set; }
        public decimal Bucket61_90 { get; set; }
        public decimal BucketOver90 { get; set; }
        public decimal TotalReceivable { get; set; }
    }
}
