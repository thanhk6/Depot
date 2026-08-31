using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Yard
{
    /// <summary>
    /// Vị trí bãi container theo block/bay/row/tier, dùng để theo dõi ô đang chiếm dụng.
    /// </summary>
    public class YardPosition : FullAuditedEntity<long>
    {
        /// <summary>Mã block bãi.</summary>
        public string BlockCode { get; set; } = "BLOCK_A";
        /// <summary>Số bay trong block.</summary>
        public int Bay { get; set; } = 1;
        /// <summary>Số row trong bay.</summary>
        public int Row { get; set; } = 1;
        /// <summary>Số tier trong vị trí bãi.</summary>
        public int Tier { get; set; } = 1;
        /// <summary>Cho biết vị trí hiện có container hay chưa.</summary>
        public bool IsOccupied { get; set; } = false;
        /// <summary>Số container đang chiếm vị trí này nếu có.</summary>
        public string? OccupiedContainerNo { get; set; }
    }
}
