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

        /// <summary>Mô tả nội dung hạng mục tính phí.</summary>
        public string ItemDescription { get; set; } = string.Empty;
        /// <summary>Mã / tên vị trí hư hỏng (CEDEX location).</summary>
        public string? LocationCode { get; set; }
        public string? LocationName { get; set; }
        /// <summary>Mã / tên loại hư hỏng (CEDEX damage).</summary>
        public string? DamageCode { get; set; }
        public string? DamageName { get; set; }
        /// <summary>Mã / phương pháp sửa chữa (CEDEX repair).</summary>
        public string? RepairCode { get; set; }
        public string? RepairMethod { get; set; }
        /// <summary>Đơn vị tính của hạng mục.</summary>
        public string? Unit { get; set; }
        /// <summary>Thuế suất VAT (%) của dòng.</summary>
        public decimal VatPercent { get; set; } = 0;
        /// <summary>TPI — bên chịu chi phí theo AEMS (O = Owner, U = User, T = Third Party, W = Wear and Tear).</summary>
        public string? Tpi { get; set; }
        /// <summary>Giờ công cho mỗi PC (Man hrs/PC). Đơn giá (UnitPrice) là vật tư / PC, Amount = PCS × vật tư/PC.</summary>
        public decimal ManHoursPerPiece { get; set; }
        /// <summary>Số lượng áp dụng cho hạng mục.</summary>
        public decimal Quantity { get; set; } = 1;
        /// <summary>Đơn giá cho mỗi đơn vị.</summary>
        public decimal UnitPrice { get; set; } = 0;
        /// <summary>Thành tiền của dòng hạng mục.</summary>
        public decimal Amount { get; set; } = 0;
    }
}
