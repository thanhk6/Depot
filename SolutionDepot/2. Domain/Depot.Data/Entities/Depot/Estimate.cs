using System;
using System.Collections.Generic;
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
        /// <summary>Thực thể DepotJob được báo giá.</summary>
        public virtual DepotJob? DepotJob { get; set; }

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

        /// <summary>Các dòng chi tiết cấu thành báo giá.</summary>
        public virtual ICollection<EstimateItem> Items { get; set; } = new List<EstimateItem>();
    }
}
