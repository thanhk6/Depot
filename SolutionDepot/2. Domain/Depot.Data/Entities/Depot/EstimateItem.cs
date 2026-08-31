using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Depot
{
    /// <summary>
    /// Chi tiết từng hạng mục trong báo giá Estimate.
    /// </summary>
    public class EstimateItem : FullAuditedEntity<long>
    {
        /// <summary>Khóa ngoại trỏ về báo giá cha.</summary>
        public long EstimateId { get; set; }
        /// <summary>Thực thể báo giá cha.</summary>
        public virtual Estimate? Estimate { get; set; }

        /// <summary>Mô tả nội dung hạng mục tính phí.</summary>
        public string ItemDescription { get; set; } = string.Empty;
        /// <summary>Số lượng áp dụng cho hạng mục.</summary>
        public decimal Quantity { get; set; } = 1;
        /// <summary>Đơn giá cho mỗi đơn vị.</summary>
        public decimal UnitPrice { get; set; } = 0;
        /// <summary>Thành tiền của dòng hạng mục.</summary>
        public decimal Amount { get; set; } = 0;
    }
}
