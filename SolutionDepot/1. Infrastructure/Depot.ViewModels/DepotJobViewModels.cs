using System;
using System.Collections.Generic;

namespace Depot.ViewModels
{
    // Request/response DTO của workflow. Không dùng EF entity trực tiếp làm input API.
    public class CreateDepotJobRequest
    {
        public string ContainerNo { get; set; } = string.Empty;
        public string IsoSize { get; set; } = "40HC"; // 20GP, 40GP, 40HC, 45HC, 20RF, 40RH
        public string ShippingLine { get; set; } = string.Empty;
        public int TareWeightKg { get; set; } = 3800;
        public int MaxPayloadKg { get; set; } = 28680;
        public string TruckPlate { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public string DriverPhone { get; set; } = string.Empty;
        public string? TrailerPlate { get; set; }
        public string? SealNo { get; set; }
        public string? BookingNo { get; set; }
        public string? TruckingCompany { get; set; }
        public string? Remarks { get; set; }
        /// <summary>Users.Id của nhân viên đang đăng nhập thực hiện Gate-In — frontend tự lấy từ phiên đăng nhập, không cho nhập tay.</summary>
        public long? GateInStaffId { get; set; }
    }

    public class SurveyRecordViewModel
    {
        public string SurveyorName { get; set; } = string.Empty;
        public string ConditionRating { get; set; } = "B"; // A, B, C, D
        public string Notes { get; set; } = string.Empty;
        public List<DamageItemViewModel> Damages { get; set; } = new();
        /// <summary>Users.Id của giám định viên đang đăng nhập — frontend tự lấy từ phiên đăng nhập, không cho nhập tay. Ghi đè SurveyorName nếu resolve được từ DB.</summary>
        public long? SurveyorStaffId { get; set; }
        /// <summary>true = "Lưu Tạm" (chỉ lưu tiến độ, job vẫn ở SURVEYING để còn hiện trong hàng đợi);
        /// false/mặc định = nộp phiếu thật, chuyển job sang ESTIMATING/READY_FOR_OUT như cũ.</summary>
        public bool IsDraft { get; set; }

        // Trước đây 3 nhóm dữ liệu này chỉ tồn tại trên UI React, KHÔNG gửi lên backend nên mất
        // trắng mỗi khi F5 hoặc tải lại từ SQL Server. Thêm vào đây để lưu thật xuống Postgres.
        public string? CleaningMethod { get; set; }
        public string? CleaningRemarks { get; set; }
        /// <summary>Danh sách lý do cần vệ sinh (DUST, OIL_GREASE...) — service lưu nối chuỗi bằng dấu phẩy.</summary>
        public List<string> CleaningReason { get; set; } = new();
        public List<SurveyCleaningItemViewModel> CleaningItems { get; set; } = new();
        public List<SurveyChecklistItemViewModel> Checklist { get; set; } = new();
        public List<SurveyPhotoViewModel> Photos { get; set; } = new();
    }

    public class DamageItemViewModel
    {
        public string Component { get; set; } = string.Empty;
        public string LocationCode { get; set; } = string.Empty;
        public string DamageCode { get; set; } = string.Empty;
        public string RepairCode { get; set; } = string.Empty;
        public decimal Quantity { get; set; } = 1;
        public string Unit { get; set; } = "vị trí";
        public decimal LaborHours { get; set; } = 1.0m;
        public decimal LaborRate { get; set; } = 150000;
        public decimal MaterialCost { get; set; } = 0;
        public string Severity { get; set; } = "LIGHT"; // LOW/MEDIUM/HIGH/CRITICAL từ frontend
        public string? Notes { get; set; }
        /// <summary>Kích thước tổn thất (mm) — trước đây form Add Damage thu thập nhưng không gửi lên,
        /// mất luôn khi F5 dù IICL-6 yêu cầu ghi nhận kích thước để đánh giá vượt/không vượt dung sai.</summary>
        public decimal? LengthMm { get; set; }
        public decimal? WidthMm { get; set; }
        /// <summary>URL ảnh hiện trường đính kèm riêng cho từng hư hỏng.</summary>
        public string? PhotoUrl { get; set; }
    }

    public class SurveyCleaningItemViewModel
    {
        public string CleaningCode { get; set; } = string.Empty;
        public string CleaningName { get; set; } = string.Empty;
        public string? Category { get; set; }
        public bool ChemicalRequired { get; set; }
        public string? ChemicalName { get; set; }
        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string ResponsibleParty { get; set; } = "U";
        public string Status { get; set; } = "REQUIRED";
        public string? Notes { get; set; }
        public string? WasherName { get; set; }
    }

    public class SurveyChecklistItemViewModel
    {
        public string ZoneKey { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        public string Status { get; set; } = "PASS";
        public string? Notes { get; set; }
        public int DamageCount { get; set; }
    }

    public class SurveyPhotoViewModel
    {
        public string Url { get; set; } = string.Empty;
        public string Type { get; set; } = "OVERVIEW";
        public string? Caption { get; set; }
        public string? SurveyorName { get; set; }
        public string? UploadedAt { get; set; }
        public int? FileSizeKb { get; set; }
    }

    public class EstimateViewModel
    {
        public string EstimateNo { get; set; } = string.Empty;
        public decimal TotalLaborCost { get; set; }
        public decimal TotalMaterialCost { get; set; }
        public decimal TotalTax { get; set; }
        public decimal GrandTotal { get; set; }
        public string Currency { get; set; } = "VND";
        public List<EstimateItemViewModel> Items { get; set; } = new();
    }

    public class EstimateItemViewModel
    {
        public string ItemDescription { get; set; } = string.Empty;
        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; } = 0;
        public decimal Amount { get; set; } = 0;
    }

    public class QcInspectionRequest
    {
        public string JobId { get; set; } = string.Empty;
        public bool Passed { get; set; }
        public string InspectorName { get; set; } = string.Empty;
        public string Comments { get; set; } = string.Empty;
    }

    public class BankWebhookPaymentRequest
    {
        public string TransactionRef { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty; // e.g. "DEPOT JOB-2026-001"
        public decimal Amount { get; set; }
        public DateTime TransactionTime { get; set; } = DateTime.Now;
    }

    public class ProcessPaymentRequest
    {
        public string Method { get; set; } = "BANK_TRANSFER";
        public string? TransactionRef { get; set; }
        public decimal Amount { get; set; }
    }

    public class UpdateJobStatusRequest
    {
        public string Status { get; set; } = string.Empty;
        public string? Condition { get; set; }
    }

    /// <summary>Giám định viên xin khóa "nhận giám định" một container — StaffId lấy từ phiên đăng nhập, không cho nhập tay.</summary>
    public class ClaimSurveyRequest
    {
        public long StaffId { get; set; }
    }

    public class CreateServiceOrderRequest
    {
        public string JobNo { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string ShippingLineCode { get; set; } = string.Empty;
        public string? IsoCode { get; set; }
        public string? Size { get; set; }
        public string? Type { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerTaxCode { get; set; }
        public string? DriverName { get; set; }
        public string? TruckPlate { get; set; }
        public string? DriverPhone { get; set; }
        public string? Condition { get; set; }
        public string? SurveyNote { get; set; }
        public string? CleaningNote { get; set; }
        public string? Notes { get; set; }
        public List<ServiceOrderItemRequest> Items { get; set; } = new();
    }

    /// <summary>Sửa phiếu dịch vụ đã tạo — chỉ cho phép khi phiếu chưa PAID/CANCELLED. Thay toàn bộ Items
    /// (giống nguyên tắc SubmitSurveyAsync xoá-nạp-lại Damages), không hỗ trợ sửa từng dòng lẻ.</summary>
    public class UpdateServiceOrderRequest
    {
        public string? CustomerName { get; set; }
        public string? CustomerTaxCode { get; set; }
        public string? DriverName { get; set; }
        public string? TruckPlate { get; set; }
        public string? DriverPhone { get; set; }
        public string? SurveyNote { get; set; }
        public string? CleaningNote { get; set; }
        public string? Notes { get; set; }
        public List<ServiceOrderItemRequest> Items { get; set; } = new();
    }

    public class ForkliftMoveRequest
    {
        public string TargetBlock { get; set; } = string.Empty;
        public int TargetBay { get; set; }
        public int TargetRow { get; set; }
        public int TargetTier { get; set; }
        public string? OperatorName { get; set; }
        public string? ForkliftCode { get; set; }
    }

    public class ServiceOrderItemRequest
    {
        public string ServiceCode { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string Category { get; set; } = "OTHER";
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public decimal VatPercent { get; set; }
        public string? Remarks { get; set; }
    }

    public class DepotJobHistoryDto
    {
        public string JobNo { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string User { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Details { get; set; } = string.Empty;
    }

    public class KpiSummaryDto
    {
        public int TotalJobs { get; set; }
        public int ActiveJobs { get; set; }
        public int ReadyForOutJobs { get; set; }
        public int CompletedJobs { get; set; }
        public decimal TotalRevenueVnd { get; set; }
        public decimal FirstPassYieldPercent { get; set; }
    }

    public class ForkliftMoveOrderRequest
    {
        public string JobId { get; set; } = string.Empty;
        public string TargetBlock { get; set; } = "BLOCK_A";
        public int TargetBay { get; set; } = 1;
        public int TargetRow { get; set; } = 1;
        public int TargetTier { get; set; } = 1;
        public string ForkliftId { get; set; } = "FL-01";
        public string Purpose { get; set; } = "YARD_STORAGE";
    }

    public class RepairAssignRequest
    {
        public string Team { get; set; } = string.Empty;
        public List<string> Workers { get; set; } = new();
        public List<RepairMaterialRequest> Materials { get; set; } = new();
    }

    public class RepairMaterialRequest
    {
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = "unit";
    }

    public class RepairCompleteRequest
    {
        public List<string> Photos { get; set; } = new();
    }

    public class GateOutRequest
    {
        public string TruckPlate { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public string? TrailerPlate { get; set; }
        public string? SealNo { get; set; }
    }

    public class RejectEstimateRequest
    {
        public string Reason { get; set; } = string.Empty;
        public string RejectedBy { get; set; } = "Hãng tàu";
    }

    public class StartRepairRequest
    {
        public string TechnicianId { get; set; } = string.Empty;
        public string TechnicianName { get; set; } = string.Empty;
    }

    public class ShippingSyncRequest
    {
        public string JobId { get; set; } = string.Empty;
        public string CarrierCode { get; set; } = string.Empty;
        public string EventType { get; set; } = "CONTAINER_STATUS_UPDATE";
    }

    public class ShippingSyncResult
    {
        public string AckToken { get; set; } = string.Empty;
        public string Status { get; set; } = "ACCEPTED";
        public DateTime SyncedAt { get; set; } = DateTime.UtcNow;
    }

    public class DepotJobFilterRequest
    {
        public string? SearchKeyword { get; set; }
        public string? ShippingLine { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class DepotStatisticsSummaryDto
    {
        public int TotalJobs { get; set; }
        public int GateInJobs { get; set; }
        public int SurveyingJobs { get; set; }
        public int EstimatingJobs { get; set; }
        public int RepairingJobs { get; set; }
        public int ReadyForOutJobs { get; set; }
        public decimal TotalRevenueVnd { get; set; }
        public string SqlDatabaseStatus { get; set; } = "ONLINE";
        public string EfCoreVersion { get; set; } = "8.0.2";
    }
}
