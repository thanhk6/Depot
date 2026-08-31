using System;
using System.Collections.Generic;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Finance
{
    /// <summary>
    /// Phiếu dịch vụ khai thác depot do hệ thống phát hành cho khách hàng hoặc hãng tàu.
    /// </summary>
    public class ServiceOrder : FullAuditedEntity<long>
    {
        public string OrderNo { get; set; } = string.Empty;
        public long DepotJobId { get; set; }
        public virtual DepotJob? DepotJob { get; set; }
        public string ContainerNo { get; set; } = string.Empty;
        public string? ShippingLineCode { get; set; }
        public string? IsoCode { get; set; }
        /// <summary>Cỡ/loại container (vd 40HC) — đặt tên Size (không phải SizeType) để khớp thẳng field
        /// `size` phía frontend, tránh phải map lại tên field giữa 2 tầng.</summary>
        public string? Size { get; set; }
        /// <summary>Tên loại container hiển thị (vd "Dry High Cube") — đặt tên Type để khớp field `type`.</summary>
        public string? Type { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerTaxCode { get; set; }
        public string? DriverName { get; set; }
        public string? TruckPlate { get; set; }
        public string? DriverPhone { get; set; }
        /// <summary>Kết quả phân loại từ Giám Định: AV/CL/DM.</summary>
        public string? Condition { get; set; }
        /// <summary>Ghi chú tình trạng container từ Giám Định, do nhân viên Khai Thác Gate-In nhập/chỉnh khi lập phiếu.</summary>
        public string? SurveyNote { get; set; }
        /// <summary>Ghi chú nghiệp vụ vệ sinh, do nhân viên Khai Thác Gate-In nhập/chỉnh khi lập phiếu.</summary>
        public string? CleaningNote { get; set; }
        public string? Notes { get; set; }
        public decimal Subtotal { get; set; }
        public decimal TotalVat { get; set; }
        public decimal GrandTotal { get; set; }
        public string PaymentStatus { get; set; } = "UNPAID";
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public DateTime? PaidAt { get; set; }
        public string Status { get; set; } = "ISSUED";
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<ServiceOrderItem> Items { get; set; } = new List<ServiceOrderItem>();
    }

    /// <summary>
    /// Chi tiết từng dịch vụ trong ServiceOrder.
    /// </summary>
    public class ServiceOrderItem : FullAuditedEntity<long>
    {
        public long ServiceOrderId { get; set; }
        public virtual ServiceOrder? ServiceOrder { get; set; }
        public string ServiceCode { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string Category { get; set; } = "OTHER";
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public decimal VatPercent { get; set; }
        public decimal Amount { get; set; }
        public decimal VatAmount { get; set; }
        public decimal Total { get; set; }
        public string? Remarks { get; set; }
    }
}
