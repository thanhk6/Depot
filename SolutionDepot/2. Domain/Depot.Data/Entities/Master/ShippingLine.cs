using System.Collections.Generic;
using Depot.Data.Entities.Base;
using Depot.Data.Entities.Depot;

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

        /// <summary>Danh sách container đang tham chiếu hãng tàu này.</summary>
        public virtual ICollection<Container> Containers { get; set; } = new List<Container>();
        /// <summary>Danh sách DepotJob liên kết với hãng tàu này.</summary>
        public virtual ICollection<DepotJob> DepotJobs { get; set; } = new List<DepotJob>();
    }
}
