using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Inventory
{
    /// <summary>
    /// Danh mục vật tư sửa chữa/vệ sinh dùng trong depot.
    /// </summary>
    public class Material : FullAuditedEntity<long>
    {
        /// <summary>Mã vật tư.</summary>
        public string Code { get; set; } = string.Empty;
        /// <summary>Tên vật tư.</summary>
        public string Name { get; set; } = string.Empty;
        /// <summary>Đơn vị tính của vật tư.</summary>
        public string Unit { get; set; } = "miếng";
        /// <summary>Đơn giá hiện hành của vật tư.</summary>
        public decimal UnitPrice { get; set; }
        /// <summary>Số lượng tồn kho.</summary>
        public int StockQuantity { get; set; }
        /// <summary>Mã nhóm vật tư (liên kết logic sang MaterialGroup.Code), vd DOOR, FLOOR, PAINT...</summary>
        public string? MaterialGroupCode { get; set; }
        /// <summary>Loại vật tư: PART, MATERIAL, CONSUMABLE, TOOL, OTHER.</summary>
        public string MaterialType { get; set; } = "MATERIAL";
        /// <summary>Quy cách kỹ thuật.</summary>
        public string? Specification { get; set; }
        /// <summary>Thương hiệu.</summary>
        public string? Brand { get; set; }
        /// <summary>Nhà sản xuất.</summary>
        public string? Manufacturer { get; set; }
        /// <summary>Mã vạch.</summary>
        public string? Barcode { get; set; }
        /// <summary>Tồn kho tối thiểu (ngưỡng cảnh báo LOW_STOCK).</summary>
        public int MinimumStock { get; set; }
        /// <summary>Tồn kho tối đa khuyến nghị.</summary>
        public int MaximumStock { get; set; }
        /// <summary>Ngưỡng đặt hàng lại.</summary>
        public int ReorderLevel { get; set; }
        /// <summary>Giá vốn bình quân gia quyền hiện tại.</summary>
        public decimal AverageCost { get; set; }
        /// <summary>Giá nhập gần nhất.</summary>
        public decimal LastPurchaseCost { get; set; }
        /// <summary>Còn sử dụng hay đã ngừng danh mục.</summary>
        public bool IsActive { get; set; } = true;
    }
}
