using System;
using System.Collections.Generic;

namespace Depot.ViewModels
{
    // Request/response DTO của workflow. Không dùng EF entity trực tiếp làm input API.
    public class CreateDepotJobRequest
    {
        public string ContainerNo { get; set; } = string.Empty;
        public string IsoSize { get; set; } = "40HC"; // Mã loại (cột Name) trong catalog CONTAINER_TYPE — "DM Loại Container (ISO)"
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
        /// <summary>Số bằng lái tài xế — form Survey/Gate-In có thu thập nhưng trước đây không gửi lên nên
        /// mất trắng.</summary>
        public string? DriverLicense { get; set; }
        /// <summary>Số seal hải quan (khác SealNo là seal hãng tàu).</summary>
        public string? CustomsSealNo { get; set; }
    }

    /// <summary>
    /// Payload phiếu giám định gửi lên từ frontend — ánh xạ 1-1 với <c>Survey</c> và 4 bảng con của nó
    /// (DamageItem/SurveyCleaningItem/SurveyChecklistItem/SurveyPhotoItem) mà SubmitSurveyAsync ghi xuống.
    /// </summary>
    public class SurveyRecordViewModel
    {
        public string SurveyorName { get; set; } = string.Empty;
        public string ConditionRating { get; set; } = "B"; // A, B, C, D
        public string Notes { get; set; } = string.Empty;
        /// <summary>Danh sách hư hỏng phát hiện trong phiếu giám định.</summary>
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
        /// <summary>Danh sách dịch vụ vệ sinh (kèm đơn giá) được chọn — quyết định có tự sinh CleaningRecord
        /// hay không (xem SubmitSurveyAsync), độc lập với ConditionRating.</summary>
        public List<SurveyCleaningItemViewModel> CleaningItems { get; set; } = new();
        /// <summary>Checklist 11 khu vực khảo sát chuẩn IICL-6.</summary>
        public List<SurveyChecklistItemViewModel> Checklist { get; set; } = new();
        /// <summary>Ảnh hiện trường đính kèm phiếu giám định.</summary>
        public List<SurveyPhotoViewModel> Photos { get; set; } = new();

        // Form "Thêm Mới Phiếu Giám Định Container" thu thập đầy đủ các field dưới đây qua 4 tab nhưng
        // trước đây không có field nào ở ViewModel để nhận — mất trắng ngay sau khi nộp phiếu.
        public string? Owner { get; set; }
        public string? ContainerTypeName { get; set; }
        public string? ManufactureMonthYear { get; set; }
        public int? MaxGrossWeightKg { get; set; }
        public string? Material { get; set; }
        public string? FloorType { get; set; }
        public string? CscPlateNo { get; set; }
        public string? Standard { get; set; }
        public string? StandardNotes { get; set; }
        /// <summary>Phân hạng chi tiết khi ConditionRating=A (GRADE_A/FOOD_GRADE/GENERAL_CARGO/SCRAP_GRADE...).</summary>
        public string? QualityGrade { get; set; }
        public string? ActionRequired { get; set; }
        public string? Shift { get; set; }
        /// <summary>Vị trí bãi giám định viên tự ghi nhận — chỉ là ghi chú, không phải vị trí chính thức.</summary>
        public string? YardLocationNote { get; set; }
        public string? CargoStatus { get; set; }

        // Thông số riêng cho container lạnh (Reefer) — PTI/nhiệt độ là dữ liệu vận hành quan trọng, trước
        // đây thu thập đủ 7 field nhưng không lưu field nào.
        public string? ReeferBrand { get; set; }
        public string? ReeferModel { get; set; }
        public int? ReeferSetTemperatureC { get; set; }
        public string? PtiStatus { get; set; }
        public int? CompressorHours { get; set; }
        public int? HumidityPercent { get; set; }
        public int? VentilationCmh { get; set; }
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
        public string? Notes { get; set; }
        public decimal LaborRate { get; set; }
        public string? RepairMode { get; set; }
        public string? Cause { get; set; }
        public string? ShopCode { get; set; }
        public string? VendorRefNo { get; set; }
        public decimal PreparationHours { get; set; }
        public decimal OrdinaryHours { get; set; }
        public decimal Ot1Hours { get; set; }
        public decimal Ot2Hours { get; set; }
        public decimal Ot3Hours { get; set; }
        public string? SurveyReference { get; set; }
        public List<string> InspectionPhotos { get; set; } = new();
        public List<EstimateItemViewModel> Items { get; set; } = new();
    }

    public class EstimateItemViewModel
    {
        public string ItemDescription { get; set; } = string.Empty;
        public string? LocationCode { get; set; }
        public string? LocationName { get; set; }
        public string? DamageCode { get; set; }
        public string? DamageName { get; set; }
        public string? RepairCode { get; set; }
        public string? RepairMethod { get; set; }
        public string? Unit { get; set; }
        public decimal VatPercent { get; set; }
        public string? Tpi { get; set; }
        public decimal ManHoursPerPiece { get; set; }
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
        /// <summary>CASH (tiền mặt tại quầy) | BANK_TRANSFER (chuyển khoản — thu ngân đối chiếu sao kê rồi ghi nhận).</summary>
        public string Method { get; set; } = "BANK_TRANSFER";
        /// <summary>Mã giao dịch ngân hàng (bắt buộc với BANK_TRANSFER). Với CASH backend tự sinh.</summary>
        public string? TransactionRef { get; set; }
        public decimal Amount { get; set; }
        /// <summary>Tiền khách đưa (CASH) — phải ≥ số tiền phải thu.</summary>
        public decimal? CashReceived { get; set; }
        /// <summary>Ghi chú phiếu thu (ngân hàng / tên tài khoản chuyển, ghi chú quầy...).</summary>
        public string? Notes { get; set; }
    }

    public class PaymentLogFilter
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        /// <summary>CASH | BANK_TRANSFER | VIETQR_WEBHOOK.</summary>
        public string? Method { get; set; }
        /// <summary>SUCCESS | REJECTED.</summary>
        public string? Status { get; set; }
        /// <summary>Tìm theo số container / số phiếu / mã giao dịch / người thu.</summary>
        public string? Keyword { get; set; }
        public int Take { get; set; } = 500;
    }

    public class PaymentLogItem
    {
        public long Id { get; set; }
        public DateTime LoggedAt { get; set; }
        public long? DepotJobId { get; set; }
        public string? JobNo { get; set; }
        public string? ContainerNo { get; set; }
        public string? ServiceOrderNo { get; set; }
        public string? InvoiceNo { get; set; }
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal? OrderTotal { get; set; }
        public decimal? CashReceived { get; set; }
        public decimal? ChangeAmount { get; set; }
        public string? TransactionRef { get; set; }
        public string? Notes { get; set; }
        public string? CashierName { get; set; }
        public string? Message { get; set; }
    }

    public class ProcessPaymentResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? TransactionRef { get; set; }
        public string? InvoiceNo { get; set; }
        public decimal Amount { get; set; }
        public string? CashierName { get; set; }
        public DateTime? PaidAt { get; set; }
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

    /// <summary>Tài xế xe nâng nhận (khóa) 1 lệnh di chuyển đang chờ — OperatorId/Name lấy từ hồ sơ ca
    /// trực đang chọn trên tablet (chưa có tài khoản đăng nhập thật, xem comment DepotJob.ForkliftClaimedByOperatorId).</summary>
    public class ClaimForkliftJobRequest
    {
        public string OperatorId { get; set; } = string.Empty;
        public string OperatorName { get; set; } = string.Empty;
        public string VehicleCode { get; set; } = string.Empty;
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

    /// <summary>Lệnh duyệt của hãng tàu do nhân viên depot nhập tay.</summary>
    public class ApproveEstimateRequest
    {
        public string? CarrierWorkOrderNo { get; set; }
        public string? CarrierAuthCode { get; set; }
        public string? CarrierApproverName { get; set; }
        /// <summary>Thời điểm hãng tàu duyệt (theo email / AEMS); bỏ trống = lúc nhập.</summary>
        public DateTime? ApprovedAt { get; set; }
        public decimal? ApprovedAmount { get; set; }
        public string? ApprovalChannel { get; set; }
        public string? Notes { get; set; }
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
        /// <summary>Mã hãng tàu nhận; bỏ trống thì lấy theo hãng tàu của hồ sơ container.</summary>
        public string CarrierCode { get; set; } = string.Empty;
        public string EventType { get; set; } = "CONTAINER_STATUS_UPDATE";
    }

    /// <summary>Kết quả 1 lần gửi thật tới endpoint hãng tàu (không còn ACK tự sinh như adapter cũ).</summary>
    public class ShippingSyncResult
    {
        public long LogId { get; set; }
        public bool Success { get; set; }
        /// <summary>SENT (hãng tàu trả 2xx) / FAILED (lỗi HTTP, timeout, không kết nối được).</summary>
        public string Status { get; set; } = "FAILED";
        public string CarrierCode { get; set; } = string.Empty;
        public string EndpointUrl { get; set; } = string.Empty;
        public int? HttpStatusCode { get; set; }
        /// <summary>Mã xác nhận lấy từ phản hồi của hãng tàu (nếu có), không tự sinh.</summary>
        public string AckToken { get; set; } = string.Empty;
        public int? LatencyMs { get; set; }
        public string? RequestBody { get; set; }
        public string? ResponseBody { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime SyncedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>Trạng thái cấu hình kết nối API của 1 hãng tàu (không trả về khóa bí mật).</summary>
    public class ShippingCarrierStatus
    {
        public string CarrierCode { get; set; } = string.Empty;
        public string CarrierName { get; set; } = string.Empty;
        public bool Configured { get; set; }
        public bool Enabled { get; set; }
        public string? EndpointUrl { get; set; }
        public string? AuthType { get; set; }
        public bool HasSecret { get; set; }
        public int TimeoutSeconds { get; set; }
    }

    public class ShippingSyncLogItem
    {
        public long Id { get; set; }
        public long DepotJobId { get; set; }
        public string ContainerNo { get; set; } = string.Empty;
        public string CarrierCode { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? EndpointUrl { get; set; }
        public int? HttpStatusCode { get; set; }
        public string? AckToken { get; set; }
        public int? LatencyMs { get; set; }
        public string? RequestBody { get; set; }
        public string? ResponseBody { get; set; }
        public string? ErrorMessage { get; set; }
        public string? TriggeredBy { get; set; }
        public DateTime SyncedAt { get; set; }
    }

    public class DepotJobFilterRequest
    {
        public string? SearchKeyword { get; set; }
        public string? ShippingLine { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        /// <summary>Trang (từ 1). Bỏ trống Page/PageSize = trả toàn bộ như trước (các màn hiện tại vẫn cần cả danh sách).</summary>
        public int? Page { get; set; }
        public int? PageSize { get; set; }
        /// <summary>Tổng số hồ sơ khớp bộ lọc (trước phân trang) — service điền vào để controller trả header X-Total-Count.</summary>
        public int TotalCount { get; set; }
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

    // ===== Response DTO cho GetAllJobs/GetJobById/GetJobByContainerNo =====
    // DepotJob/Survey/Estimate/RepairOrder/Payment/JobAuditLog không còn navigation property (chỉ giữ
    // FK-ID) — Service tự query rời từng bảng theo FK rồi map thủ công sang các DTO này. Field name/casing
    // giữ đúng như entity cũ để JSON trả về frontend không đổi shape (xem docs/backend-progress/00-quy-tac-backend.md
    // mục Entity/ViewModel).

    public class DepotJobDto
    {
        public long Id { get; set; }
        public string JobNo { get; set; } = string.Empty;
        public string ContainerNo { get; set; } = string.Empty;
        public string IsoSize { get; set; } = string.Empty;
        public long ShippingLineId { get; set; }
        /// <summary>Mã hãng tàu dạng phẳng — Service tự join sang ShippingLine.Code, không còn tính qua navigation.</summary>
        public string? ShippingLineCode { get; set; }
        public int TareWeightKg { get; set; }
        public int MaxPayloadKg { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime GateInDate { get; set; }
        public DateTime? GateOutDate { get; set; }
        public string? GateOutTruckPlate { get; set; }
        public string? GateOutDriverName { get; set; }
        public string? GateOutTrailerPlate { get; set; }
        public string? GateOutSealNo { get; set; }
        public string? GateInEirNo { get; set; }
        public string? GateOutEirNo { get; set; }
        public string? GateInTruckPlate { get; set; }
        public string? GateInTrailerPlate { get; set; }
        public string? GateInDriverName { get; set; }
        public string? GateInDriverPhone { get; set; }
        public string? GateInSealNo { get; set; }
        public string? GateInDriverLicense { get; set; }
        public string? GateInCustomsSealNo { get; set; }
        public string? GateInBookingNo { get; set; }
        public string? GateInTruckingCompany { get; set; }
        public string? GateInRemarks { get; set; }
        public long? GateInStaffId { get; set; }
        public string? GateInStaffName { get; set; }
        public long? SurveyClaimedByStaffId { get; set; }
        public string? SurveyClaimedByName { get; set; }
        public DateTime? SurveyClaimedAt { get; set; }
        public string? ForkliftClaimedByOperatorId { get; set; }
        public string? ForkliftClaimedByOperatorName { get; set; }
        public string? ForkliftAssignedVehicleCode { get; set; }
        public DateTime? ForkliftClaimedAt { get; set; }
        public DateTime? ForkliftStartedAt { get; set; }
        public string BlockCode { get; set; } = string.Empty;
        public int Bay { get; set; }
        public int Row { get; set; }
        public int Tier { get; set; }
        public DateTime CreatedAt { get; set; }
        public SurveyDto? Survey { get; set; }
        public EstimateDto? Estimate { get; set; }
        public RepairOrderDto? RepairOrder { get; set; }
        public PaymentDto? Payment { get; set; }
        public List<JobAuditLogDto> AuditLogs { get; set; } = new();
    }

    public class SurveyDto
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public long DepotJobId { get; set; }
        public string JobNo { get; set; } = string.Empty;
        public string SurveyorId { get; set; } = string.Empty;
        public string SurveyorName { get; set; } = string.Empty;
        public DateTime SurveyDate { get; set; }
        public string ConditionRating { get; set; } = string.Empty;
        public string? OverallNotes { get; set; }
        public string? CleaningReason { get; set; }
        public string? CleaningMethod { get; set; }
        public string? CleaningRemarks { get; set; }
        public List<DamageItemDto> Damages { get; set; } = new();
        public List<SurveyCleaningItemDto> CleaningItems { get; set; } = new();
        public List<SurveyChecklistItemDto> ChecklistItems { get; set; } = new();
        public List<SurveyPhotoItemDto> Photos { get; set; } = new();

        public string? SurveyNo { get; set; }
        public string? Owner { get; set; }
        public string? ContainerTypeName { get; set; }
        public string? ManufactureMonthYear { get; set; }
        public int? MaxGrossWeightKg { get; set; }
        public string? Material { get; set; }
        public string? FloorType { get; set; }
        public string? CscPlateNo { get; set; }
        public string? Standard { get; set; }
        public string? StandardNotes { get; set; }
        public string? QualityGrade { get; set; }
        public string? ActionRequired { get; set; }
        public string? Shift { get; set; }
        public string? YardLocationNote { get; set; }
        public string? CargoStatus { get; set; }
        public string? ReeferBrand { get; set; }
        public string? ReeferModel { get; set; }
        public int? ReeferSetTemperatureC { get; set; }
        public string? PtiStatus { get; set; }
        public int? CompressorHours { get; set; }
        public int? HumidityPercent { get; set; }
        public int? VentilationCmh { get; set; }
    }

    public class DamageItemDto
    {
        public long Id { get; set; }
        public string Component { get; set; } = string.Empty;
        public string DamageCode { get; set; } = string.Empty;
        public string DamageNameVi { get; set; } = string.Empty;
        public string LocationCode { get; set; } = string.Empty;
        public string RepairCode { get; set; } = string.Empty;
        public string RepairNameVi { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal LaborHours { get; set; }
        public decimal LaborRate { get; set; }
        public decimal MaterialCost { get; set; }
        public decimal TotalCost { get; set; }
        public string Severity { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public decimal? LengthMm { get; set; }
        public decimal? WidthMm { get; set; }
        public string? PhotoUrl { get; set; }
    }

    public class SurveyCleaningItemDto
    {
        public long Id { get; set; }
        public string CleaningCode { get; set; } = string.Empty;
        public string CleaningName { get; set; } = string.Empty;
        public string? Category { get; set; }
        public bool ChemicalRequired { get; set; }
        public string? ChemicalName { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string ResponsibleParty { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? WasherName { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class SurveyChecklistItemDto
    {
        public long Id { get; set; }
        public string ZoneKey { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public int DamageCount { get; set; }
    }

    public class SurveyPhotoItemDto
    {
        public long Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public string? SurveyorName { get; set; }
        public DateTime UploadedAt { get; set; }
        public int? FileSizeKb { get; set; }
    }

    public class EstimateDto
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? LastModifiedBy { get; set; }
        public string? Notes { get; set; }
        public decimal LaborRate { get; set; }
        public decimal TotalManHours { get; set; }
        public string? RepairMode { get; set; }
        public string? Cause { get; set; }
        public string? ShopCode { get; set; }
        public string? VendorRefNo { get; set; }
        public decimal PreparationHours { get; set; }
        public decimal OrdinaryHours { get; set; }
        public decimal Ot1Hours { get; set; }
        public decimal Ot2Hours { get; set; }
        public decimal Ot3Hours { get; set; }
        public string? SurveyReference { get; set; }
        public List<string> InspectionPhotos { get; set; } = new();
        public DateTime? ConfirmedAt { get; set; }
        public string? ConfirmedBy { get; set; }
        public string? CarrierWorkOrderNo { get; set; }
        public string? CarrierAuthCode { get; set; }
        public string? CarrierApproverName { get; set; }
        public decimal? ApprovedAmount { get; set; }
        public string? ApprovalChannel { get; set; }
        public string? ApprovalNotes { get; set; }
        public long DepotJobId { get; set; }
        public string JobNo { get; set; } = string.Empty;
        public string EstimateNo { get; set; } = string.Empty;
        public decimal TotalLaborCost { get; set; }
        public decimal TotalMaterialCost { get; set; }
        public decimal TotalTax { get; set; }
        public decimal GrandTotal { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? ApprovedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public List<EstimateItemDto> Items { get; set; } = new();
    }

    public class EstimateItemDto
    {
        public long Id { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public string? LocationCode { get; set; }
        public string? LocationName { get; set; }
        public string? DamageCode { get; set; }
        public string? DamageName { get; set; }
        public string? RepairCode { get; set; }
        public string? RepairMethod { get; set; }
        public string? Unit { get; set; }
        public decimal VatPercent { get; set; }
        public string? Tpi { get; set; }
        public decimal ManHoursPerPiece { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Amount { get; set; }
    }

    public class RepairOrderDto
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public long DepotJobId { get; set; }
        public string JobNo { get; set; } = string.Empty;
        public string TechnicianId { get; set; } = string.Empty;
        public string TechnicianName { get; set; } = string.Empty;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string QcStatus { get; set; } = string.Empty;
        public string? QcNotes { get; set; }
        public string? InspectorName { get; set; }
    }

    public class PaymentDto
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public long DepotJobId { get; set; }
        public string InvoiceNo { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Tax { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? PaidAt { get; set; }
        public string? PaymentMethod { get; set; }
        public string? CashierName { get; set; }
    }

    public class JobAuditLogDto
    {
        public long Id { get; set; }
        public long DepotJobId { get; set; }
        public string JobNo { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string User { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Details { get; set; } = string.Empty;
    }
}
