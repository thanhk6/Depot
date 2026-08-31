using System;
using Depot.Data.Entities.Base;
using Depot.Data.Entities.Depot;

namespace Depot.Data.Entities.Finance
{
    /// <summary>
    /// Phiếu thanh toán công nợ cho một DepotJob, bao gồm tổng tiền, VAT và trạng thái trả tiền.
    /// </summary>
    public class Payment : FullAuditedEntity<long>
    {
        /// <summary>Khóa ngoại trỏ về DepotJob.</summary>
        public long DepotJobId { get; set; }
        /// <summary>Thực thể DepotJob gốc.</summary>
        public virtual DepotJob? DepotJob { get; set; }

        /// <summary>Số hóa đơn thanh toán.</summary>
        public string InvoiceNo { get; set; } = string.Empty;
        /// <summary>Số tiền trước thuế.</summary>
        public decimal Amount { get; set; }
        /// <summary>Số tiền thuế VAT.</summary>
        public decimal Tax { get; set; }
        /// <summary>Tổng tiền phải thanh toán.</summary>
        public decimal TotalAmount { get; set; }
        /// <summary>Trạng thái thanh toán.</summary>
        public string Status { get; set; } = "UNPAID";
        /// <summary>Thời điểm đã thanh toán.</summary>
        public DateTime? PaidAt { get; set; }
        /// <summary>Phương thức thanh toán.</summary>
        public string? PaymentMethod { get; set; }
        /// <summary>Nhân viên thu ngân hoặc người ghi nhận thanh toán.</summary>
        public string? CashierName { get; set; }
    }
}
