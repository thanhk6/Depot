using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Báo giá sửa chữa/khai thác được tạo từ kết quả khảo sát của một DepotJob.
    /// </summary>
    public class Estimate : FullAuditedEntity<long>
    {
        /// <summary>Khóa ngoại trỏ về DepotJob gốc.</summary>
        public long DepotJobId { get; set; }
        /// <summary>Mã job nghiệp vụ liên kết với báo giá.</summary>
        public string JobNo { get; set; } = string.Empty;

        /// <summary>Số báo giá nội bộ.</summary>
        public string EstimateNo { get; set; } = string.Empty;
        /// <summary>Tổng chi phí nhân công.</summary>
        public decimal TotalLaborCost { get; set; }
        /// <summary>Tổng chi phí vật tư.</summary>
        public decimal TotalMaterialCost { get; set; }
        /// <summary>Tổng thuế VAT.</summary>
        public decimal TotalTax { get; set; }
        /// <summary>Tổng giá trị cuối cùng của báo giá.</summary>
        public decimal GrandTotal { get; set; }
        /// <summary>Đơn vị tiền tệ của báo giá.</summary>
        public string Currency { get; set; } = "VND";
        /// <summary>Trạng thái duyệt báo giá.</summary>
        public string Status { get; set; } = "PENDING_APPROVAL";
        /// <summary>Thời điểm hãng tàu phê duyệt.</summary>
        public DateTime? ApprovedAt { get; set; }
        /// <summary>Người phê duyệt báo giá.</summary>
        public string? ApprovedBy { get; set; }
        /// <summary>Ghi chú kỹ thuật / nội dung bổ sung của người báo giá.</summary>
        public string? Notes { get; set; }
        /// <summary>Đơn giá giờ công (theo tiền tệ báo giá / giờ) — tiền công = tổng giờ công × đơn giá (chuẩn Maersk AEMS).</summary>
        public decimal LaborRate { get; set; }
        /// <summary>Tổng giờ công = Σ (số PCS × giờ công/PC) của các dòng.</summary>
        public decimal TotalManHours { get; set; }
        /// <summary>Mode sửa chữa AEMS (vd 03).</summary>
        public string? RepairMode { get; set; }
        /// <summary>Nguyên nhân (Cause) AEMS, vd "Wear and Tear", "Third Party".</summary>
        public string? Cause { get; set; }
        /// <summary>Shop Code AEMS của depot/xưởng (vd 3HY).</summary>
        public string? ShopCode { get; set; }
        /// <summary>Vendor Ref No. (tuỳ chọn) — số tham chiếu nội bộ depot gửi kèm Work Order.</summary>
        public string? VendorRefNo { get; set; }
        /// <summary>Giờ chuẩn bị (Preparation Time) — cộng vào tổng giờ công ngoài giờ của các dòng.</summary>
        public decimal PreparationHours { get; set; }
        /// <summary>Phân bổ giờ công theo ca: giờ thường, OT1, OT2, OT3 (chuẩn AEMS).</summary>
        public decimal OrdinaryHours { get; set; }
        public decimal Ot1Hours { get; set; }
        public decimal Ot2Hours { get; set; }
        public decimal Ot3Hours { get; set; }
        /// <summary>Mã giám định / tham chiếu e-EIR người báo giá ghi kèm.</summary>
        public string? SurveyReference { get; set; }
        /// <summary>Link ảnh giám định đính kèm báo giá (JSON mảng chuỗi).</summary>
        public string? InspectionPhotoUrlsJson { get; set; }
        /// <summary>Thời điểm người báo giá xác nhận báo giá (chốt bản gửi hãng tàu). Sửa báo giá thì xoá, phải xác nhận lại.
        /// Gửi API hãng tàu thành công cũng tính là xác nhận. Hãng tàu chỉ duyệt được báo giá đã xác nhận.</summary>
        public DateTime? ConfirmedAt { get; set; }
        public string? ConfirmedBy { get; set; }

        // ===== Lệnh duyệt của hãng tàu (nhập tay khi chưa có API) =====
        /// <summary>Số Work Order / lệnh duyệt bên hãng tàu (vd AEMS 511183390).</summary>
        public string? CarrierWorkOrderNo { get; set; }
        /// <summary>Mã duyệt (authorization code) hãng tàu cấp, nếu có.</summary>
        public string? CarrierAuthCode { get; set; }
        /// <summary>Người duyệt phía hãng tàu.</summary>
        public string? CarrierApproverName { get; set; }
        /// <summary>Số tiền hãng tàu duyệt (có thể khác tổng báo giá).</summary>
        public decimal? ApprovedAmount { get; set; }
        /// <summary>Kênh nhận duyệt: EMAIL / AEMS / PHONE / DOCUMENT / API.</summary>
        public string? ApprovalChannel { get; set; }
        public string? ApprovalNotes { get; set; }
    }
}
