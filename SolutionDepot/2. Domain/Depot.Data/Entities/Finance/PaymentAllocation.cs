using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Finance;

/// <summary>Phân bổ 1 khoản thanh toán (ArPayment) cho 1 khoản công nợ container (ShippingLineDebt).</summary>
public class PaymentAllocation : FullAuditedEntity<long>
{
    /// <summary>Mã phân bổ (business key).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Mã thanh toán cha (ArPayment.Code).</summary>
    public string ArPaymentCode { get; set; } = string.Empty;
    /// <summary>Mã công nợ được phân bổ (ShippingLineDebt.Code).</summary>
    public string ShippingLineDebtCode { get; set; } = string.Empty;
    /// <summary>Số container (denormalized để hiển thị nhanh).</summary>
    public string ContainerNo { get; set; } = string.Empty;
    /// <summary>Số báo giá (denormalized để hiển thị nhanh).</summary>
    public string QuotationNo { get; set; } = string.Empty;
    /// <summary>Số tiền phân bổ (VNĐ).</summary>
    public decimal AllocatedAmountVnd { get; set; }

    /// <summary>Điều hướng tới thanh toán cha.</summary>
    public virtual ArPayment? ArPayment { get; set; }
}
