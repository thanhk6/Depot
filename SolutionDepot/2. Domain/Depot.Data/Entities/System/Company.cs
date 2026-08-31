using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.System
{
    /// <summary>
    /// Công ty nội bộ của hệ thống depot, thường dùng cho cấu hình tổ chức hoặc thông tin pháp lý.
    /// </summary>
    public class Company : FullAuditedEntity<long>
    {
        /// <summary>Mã công ty nội bộ.</summary>
        public string Code { get; set; } = string.Empty;
        /// <summary>Tên công ty.</summary>
        public string Name { get; set; } = string.Empty;
        /// <summary>Mã số thuế công ty.</summary>
        public string TaxCode { get; set; } = string.Empty;
        /// <summary>Địa chỉ công ty.</summary>
        public string? Address { get; set; }
        /// <summary>Số điện thoại liên hệ.</summary>
        public string? Phone { get; set; }
    }
}
