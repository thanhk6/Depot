using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Đơn đặt chỗ container của khách hàng, gắn với hãng tàu và depot khai thác.
/// </summary>
public class CustomerBooking : FullAuditedEntity<long>
{
    public string BookingNo { get; set; } = string.Empty;
    public string CustomerCode { get; set; } = string.Empty;
    public long ShippingLineId { get; set; }
    public virtual ShippingLine? ShippingLine { get; set; }
    public string DepotCode { get; set; } = "DEPOT-HCM";
    public int ContainerCount { get; set; }
    public int UsedCount { get; set; }
    public string ContainerSize { get; set; } = "40HC";
    public string ContainerType { get; set; } = "DRY";
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime ValidUntil { get; set; } = DateTime.UtcNow.AddDays(30);
    public string Status { get; set; } = "ACTIVE";
    public string? SpecialInstructions { get; set; }
}
