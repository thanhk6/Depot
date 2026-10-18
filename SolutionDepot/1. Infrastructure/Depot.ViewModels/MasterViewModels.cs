using System;
using System.Collections.Generic;

namespace Depot.ViewModels
{
    public class ShippingLineViewModel
    {
        public long Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ContactEmail { get; set; }
        public string? Phone { get; set; }
    }

    public class MaterialViewModel
    {
        public long Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Unit { get; set; } = "miếng";
        public decimal UnitPrice { get; set; }
        public int StockQuantity { get; set; }
        public string? MaterialGroupCode { get; set; }
        public string MaterialType { get; set; } = "MATERIAL";
        public string? Specification { get; set; }
        public string? Brand { get; set; }
        public string? Manufacturer { get; set; }
        public string? Barcode { get; set; }
        public int MinimumStock { get; set; }
        public int MaximumStock { get; set; }
        public int ReorderLevel { get; set; }
        public decimal AverageCost { get; set; }
        public decimal LastPurchaseCost { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class YardSlotViewModel
    {
        public string BlockCode { get; set; } = "BLOCK_A";
        public int Bay { get; set; }
        public int Row { get; set; }
        public int Tier { get; set; }
        public bool IsOccupied { get; set; }
        public string? OccupiedContainerNo { get; set; }
    }

    /// <summary>
    /// Request tạo/sửa biểu cước nâng hạ (Lift-On/Off) — bảng riêng <c>ServiceTariff</c>, thay cho
    /// catalog dùng chung "SERVICE_TARIFF" cũ (xem docs/frontend-tariff-catalog-split.md).
    /// </summary>
    public class ServiceTariffRequest
    {
        public string Code { get; set; } = string.Empty;
        public string ServiceCategory { get; set; } = "LIFT_EMPTY";
        public string NameVi { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string Unit { get; set; } = "Lần / Cont";
        public decimal Price20GP { get; set; }
        public decimal Price40HC { get; set; }
        public decimal Price45HC { get; set; }
        public decimal Price20RF { get; set; }
        public decimal Price40RH { get; set; }
        public decimal PriceSpecial { get; set; }
        public decimal VatPercent { get; set; } = 8;
        public string Currency { get; set; } = "VND";
        public string ApplicableShift { get; set; } = "ALL";
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; }
    }

    /// <summary>1 bậc giá lũy tiến gửi trong request tạo/sửa <see cref="StorageTariffRuleRequest"/>.</summary>
    public class StorageTariffTierViewModel
    {
        public string TierName { get; set; } = string.Empty;
        public int FromDay { get; set; }
        public int? ToDay { get; set; }
        public decimal Price20Dry { get; set; }
        public decimal Price40Dry { get; set; }
        public decimal Price45Dry { get; set; }
        public decimal Price20Reefer { get; set; }
        public decimal Price40Reefer { get; set; }
        public decimal PriceSpecial { get; set; }
        public int SortOrder { get; set; }
    }

    /// <summary>
    /// Request tạo/sửa quy tắc cước lưu bãi — bảng riêng <c>StorageTariffRule</c> + bảng con
    /// <c>StorageTariffTier</c>, thay cho catalog dùng chung "STORAGE_TARIFF" cũ (xem
    /// docs/frontend-tariff-catalog-split.md).
    /// </summary>
    public class StorageTariffRuleRequest
    {
        public string Code { get; set; } = string.Empty;
        public string ShippingLineCode { get; set; } = "ALL";
        public string ShippingLineName { get; set; } = string.Empty;
        public string ContainerTypeCategory { get; set; } = "DRY_STANDARD";
        public int DefaultFreeDays { get; set; }
        public string CalculationUnit { get; set; } = "VND/Cont/Day";
        public decimal VatPercent { get; set; } = 8;
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; }
        public List<StorageTariffTierViewModel> Tiers { get; set; } = new();
    }

    public class MasterCatalogItemRequest
    {
        public string CatalogType { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? NameVi { get; set; }
        public string? Description { get; set; }
        public string JsonData { get; set; } = "{}";
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; }
    }

    /// <summary>Thêm nhanh nhà xe tại cổng Gate-In (quyền cổng) — chỉ tên bắt buộc, mã tự sinh NX-xxxx.</summary>
    public class TruckingQuickCreateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? TaxCode { get; set; }
    }

    public class CustomerCompanyRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ShortName { get; set; }
        public string? TaxCode { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string CustomerType { get; set; } = "TRUCKING";
        public string Status { get; set; } = "ACTIVE";
        public decimal CreditLimit { get; set; }
        public int PaymentTermDays { get; set; }
        public string? Notes { get; set; }
    }

    public class CustomerDriverRequest
    {
        public string CustomerCode { get; set; } = string.Empty;
        public string DriverCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? CitizenId { get; set; }
        public string? LicenseNumber { get; set; }
        public string LicenseGrade { get; set; } = "FC";
        public DateTime? LicenseExpiryDate { get; set; }
        public string? Address { get; set; }
        public string Status { get; set; } = "ACTIVE";
    }

    public class CustomerVehicleRequest
    {
        public string CustomerCode { get; set; } = string.Empty;
        public string PlateNumber { get; set; } = string.Empty;
        public string VehicleType { get; set; } = "TRACTOR";
        public string? Brand { get; set; }
        public decimal PayloadTon { get; set; }
        public string? OwnerName { get; set; }
        public string? DefaultDriverCode { get; set; }
        public DateTime? InspectionExpiry { get; set; }
        public string Status { get; set; } = "ACTIVE";
    }

    public class CustomerPortalUserRequest
    {
        public string CustomerCode { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "CUSTOMER_USER";
        public string AccountType { get; set; } = "INTERNAL_ORG";
        public string Status { get; set; } = "ACTIVE";
    }

    public class CustomerBookingRequest
    {
        public string BookingNo { get; set; } = string.Empty;
        public string CustomerCode { get; set; } = string.Empty;
        public string ShippingLineCode { get; set; } = string.Empty;
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

    public class SendNotificationRequest
    {
        public string TemplateCode { get; set; } = "CUSTOM";
        public string EventType { get; set; } = "IN_APP";
        public string RecipientType { get; set; } = "ALL";
        public string RecipientId { get; set; } = string.Empty;
        public string? RecipientName { get; set; }
        public string? RecipientPhone { get; set; }
        public string Channel { get; set; } = "IN_APP";
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Priority { get; set; } = "NORMAL";
        public string? EntityType { get; set; }
        public string? EntityId { get; set; }
        public string? EntityReference { get; set; }
    }
}
