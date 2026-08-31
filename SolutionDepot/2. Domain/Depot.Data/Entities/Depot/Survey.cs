using System;
using System.Collections.Generic;
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
        /// <summary>Thực thể job gốc.</summary>
        public virtual DepotJob? DepotJob { get; set; }

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

        /// <summary>Danh sách hư hỏng phát hiện trong phiếu giám định.</summary>
        public virtual ICollection<DamageItem> Damages { get; set; } = new List<DamageItem>();
        /// <summary>Danh sách dịch vụ vệ sinh (kèm đơn giá) được chọn khi phân loại CL.</summary>
        public virtual ICollection<SurveyCleaningItem> CleaningItems { get; set; } = new List<SurveyCleaningItem>();
        /// <summary>Checklist 11 khu vực khảo sát chuẩn IICL-6.</summary>
        public virtual ICollection<SurveyChecklistItem> ChecklistItems { get; set; } = new List<SurveyChecklistItem>();
        /// <summary>Ảnh hiện trường đính kèm phiếu giám định.</summary>
        public virtual ICollection<SurveyPhotoItem> Photos { get; set; } = new List<SurveyPhotoItem>();
    }
}
