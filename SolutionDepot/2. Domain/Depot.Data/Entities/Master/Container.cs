using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master
{
    /// <summary>
    /// Hồ sơ master của container, tách riêng khỏi dòng nghiệp vụ DepotJob.
    /// </summary>
    public class Container : FullAuditedEntity<long>
    {
        public string ContainerNo { get; set; } = string.Empty;
        public string IsoSize { get; set; } = "40HC";
        public long ShippingLineId { get; set; }
        public int TareWeightKg { get; set; } = 3820;
        public int MaxPayloadKg { get; set; } = 28680;
        public DateTime? ManufactureDate { get; set; }
    }
}
