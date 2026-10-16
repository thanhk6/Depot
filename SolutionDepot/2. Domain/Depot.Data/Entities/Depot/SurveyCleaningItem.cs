using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Một dòng dịch vụ vệ sinh (kèm đơn giá) được chọn áp dụng cho phiếu giám định khi phân loại CL.
    /// Là bảng con thuộc Survey (composition) — xoá/ghi lại toàn bộ mỗi lần lưu, không tự đứng riêng.
    /// </summary>
    public class SurveyCleaningItem : FullAuditedEntity<long>
    {
        public long SurveyId { get; set; }

        public string CleaningCode { get; set; } = string.Empty;
        public string CleaningName { get; set; } = string.Empty;
        public string? Category { get; set; }
        public bool ChemicalRequired { get; set; }
        public string? ChemicalName { get; set; }
        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        /// <summary>Bên chịu phí: O = Chủ vỏ/Hãng tàu, U = Chủ hàng, T = Nhà xe.</summary>
        public string ResponsibleParty { get; set; } = "U";
        public string Status { get; set; } = "REQUIRED";
        public string? Notes { get; set; }
        public string? WasherName { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
