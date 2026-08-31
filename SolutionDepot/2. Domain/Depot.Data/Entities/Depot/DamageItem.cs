using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Một dòng hư hỏng phát hiện trong biên bản giám định container.
    /// </summary>
    public class DamageItem : FullAuditedEntity<long>
    {
        public long SurveyId { get; set; }
        public virtual Survey? Survey { get; set; }

        public string Component { get; set; } = string.Empty;
        public string DamageCode { get; set; } = string.Empty;
        public string DamageNameVi { get; set; } = string.Empty;
        public string LocationCode { get; set; } = string.Empty;
        public string RepairCode { get; set; } = string.Empty;
        public string RepairNameVi { get; set; } = string.Empty;
        public decimal Quantity { get; set; } = 1;
        public string Unit { get; set; } = "vị trí";
        public decimal LaborHours { get; set; } = 1.0m;
        public decimal LaborRate { get; set; } = 150000;
        public decimal MaterialCost { get; set; } = 0;
        public decimal TotalCost { get; set; } = 0;
        public string Severity { get; set; } = "LIGHT";
        public string? Notes { get; set; }
        /// <summary>Kích thước tổn thất (mm) ghi nhận tại hiện trường, phục vụ đối chiếu dung sai IICL-6.</summary>
        public decimal? LengthMm { get; set; }
        public decimal? WidthMm { get; set; }
        /// <summary>URL ảnh hiện trường đính kèm riêng cho từng hư hỏng.</summary>
        public string? PhotoUrl { get; set; }
    }
}
