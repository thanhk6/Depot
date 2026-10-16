using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Phiếu giám định container, lưu đánh giá tình trạng và danh sách hư hỏng.
    /// </summary>
    public class Survey : FullAuditedEntity<long>
    {
        /// <summary>Khóa ngoại trỏ về DepotJob.</summary>
        public long DepotJobId { get; set; }
        /// <summary>Mã job nghiệp vụ của phiếu giám định.</summary>
        public string JobNo { get; set; } = string.Empty;

        /// <summary>Mã giám định viên thực hiện khảo sát.</summary>
        public string SurveyorId { get; set; } = string.Empty;
        /// <summary>Tên giám định viên thực hiện khảo sát.</summary>
        public string SurveyorName { get; set; } = string.Empty;
        /// <summary>Ngày thực hiện giám định.</summary>
        public DateTime SurveyDate { get; set; } = DateTime.UtcNow;
        /// <summary>Xếp hạng tình trạng container sau giám định.</summary>
        public string ConditionRating { get; set; } = "B";
        /// <summary>Nhận xét tổng quan của giám định viên.</summary>
        public string? OverallNotes { get; set; }

        /// <summary>Lý do cần vệ sinh khi phân loại CL, lưu dạng chuỗi nối bằng dấu phẩy (vd "DUST,OIL_GREASE").</summary>
        public string? CleaningReason { get; set; }
        /// <summary>Phương pháp tẩy rửa áp dụng khi phân loại CL.</summary>
        public string? CleaningMethod { get; set; }
        /// <summary>Ghi chú riêng cho công đoạn vệ sinh.</summary>
        public string? CleaningRemarks { get; set; }

        // Các field dưới đây form "Thêm Mới Phiếu Giám Định Container" (CreateSurveyModal.tsx) thu thập
        // đầy đủ qua 4 tab (Container/Vận Hành/Phân Hạng/Hư Hỏng) nhưng trước đây KHÔNG có cột nào lưu —
        // SubmitSurveyAsync chỉ nhận ConditionRating/Notes/Damages/Cleaning*, toàn bộ phần còn lại mất
        // trắng ngay sau khi nộp phiếu, không lỗi không cảnh báo. Thêm đủ cột để không mất dữ liệu nữa.

        /// <summary>Số phiếu giám định nghiệp vụ (business key hiển thị/in ấn), backend tự sinh dạng
        /// "SRV-{yyyyMMdd}-{ngẫu nhiên}" — không nhận số phiếu client tự sinh để tránh trùng/giả mạo.</summary>
        public string? SurveyNo { get; set; }
        /// <summary>Chủ sở hữu container (thường là hãng tàu, có thể khác Owner công ty mẹ).</summary>
        public string? Owner { get; set; }
        /// <summary>Tên loại container hiển thị (vd "Dry High Cube").</summary>
        public string? ContainerTypeName { get; set; }
        /// <summary>Tháng/năm sản xuất container (dạng chuỗi "MM/yyyy" theo đúng form nhập).</summary>
        public string? ManufactureMonthYear { get; set; }
        /// <summary>Tổng trọng tải tối đa (Max Gross Weight), khác MaxPayloadKg của DepotJob (không tính vỏ).</summary>
        public int? MaxGrossWeightKg { get; set; }
        /// <summary>Vật liệu vỏ container.</summary>
        public string? Material { get; set; }
        /// <summary>Loại sàn container.</summary>
        public string? FloorType { get; set; }
        /// <summary>Số biển CSC (Convention for Safe Containers).</summary>
        public string? CscPlateNo { get; set; }
        /// <summary>Tiêu chuẩn giám định áp dụng (IICL-6, MCIC, MRIC, CARRIER_CUSTOM).</summary>
        public string? Standard { get; set; }
        /// <summary>Ghi chú riêng về tiêu chuẩn áp dụng.</summary>
        public string? StandardNotes { get; set; }
        /// <summary>Phân hạng chất lượng chi tiết khi ConditionRating=A (GRADE_A/FOOD_GRADE/GENERAL_CARGO/SCRAP_GRADE...).</summary>
        public string? QualityGrade { get; set; }
        /// <summary>Hành động đề xuất sau giám định (AVAILABLE_FOR_DISPATCH/SEND_TO_WASHING/SEND_TO_REPAIR/HOLD_FOR_SURVEYOR_REVIEW).</summary>
        public string? ActionRequired { get; set; }
        /// <summary>Ca trực thực hiện giám định.</summary>
        public string? Shift { get; set; }
        /// <summary>Vị trí bãi do giám định viên tự ghi nhận/đề xuất — chỉ là ghi chú tham khảo, KHÔNG phải
        /// vị trí chính thức (vị trí chính thức do module Xe Nâng/Yard cập nhật qua BlockCode/Bay/Row/Tier
        /// của DepotJob khi thật sự di chuyển container).</summary>
        public string? YardLocationNote { get; set; }
        /// <summary>Tình trạng hàng hoá lúc giám định (EMPTY/FULL_IMPORT/FULL_EXPORT/LCL).</summary>
        public string? CargoStatus { get; set; }

        // Thông số kỹ thuật riêng cho container lạnh (Reefer) — trước đây thu thập đủ 7 field trên form
        // nhưng KHÔNG lưu field nào, kể cả PTI/nhiệt độ cài đặt là dữ liệu vận hành quan trọng nhất.
        /// <summary>Hãng sản xuất cụm máy lạnh (CARRIER/THERMO_KING/DAIKIN/STAR_COOL).</summary>
        public string? ReeferBrand { get; set; }
        /// <summary>Model cụm máy lạnh.</summary>
        public string? ReeferModel { get; set; }
        /// <summary>Nhiệt độ cài đặt (độ C, có thể âm).</summary>
        public int? ReeferSetTemperatureC { get; set; }
        /// <summary>Kết quả kiểm tra PTI (PASSED/PENDING/FAILED/NOT_REQUIRED).</summary>
        public string? PtiStatus { get; set; }
        /// <summary>Số giờ vận hành máy nén lạnh lũy kế.</summary>
        public int? CompressorHours { get; set; }
        /// <summary>Độ ẩm cài đặt (%).</summary>
        public int? HumidityPercent { get; set; }
        /// <summary>Lưu lượng thông gió cài đặt (CMH - cubic meter per hour).</summary>
        public int? VentilationCmh { get; set; }
    }
}
