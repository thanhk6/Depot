using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master
{
    /// <summary>
    /// Danh mục hãng tàu khai thác. Code là business key bất biến, được depot job và container tham chiếu.
    /// </summary>
    public class ShippingLine : FullAuditedEntity<long>
    {
        /// <summary>Mã business key của hãng tàu.</summary>
        public string Code { get; set; } = string.Empty;
        /// <summary>Tên hiển thị của hãng tàu.</summary>
        public string Name { get; set; } = string.Empty;
        /// <summary>Email liên hệ của hãng tàu.</summary>
        public string? ContactEmail { get; set; }
        /// <summary>Số điện thoại liên hệ của hãng tàu.</summary>
        public string? Phone { get; set; }
    }
}
