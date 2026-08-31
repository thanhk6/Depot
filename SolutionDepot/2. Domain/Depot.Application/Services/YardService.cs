using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Yard;

namespace Depot.Application.Services
{
    public class YardService : IYardService
    {
        private readonly DepotDbContext _db;

        public YardService(DepotDbContext db)
        {
            _db = db;
        }

        public async Task<List<YardPosition>> GetYardPositionsAsync(string? blockCode = null)
        {
            // Yard map chỉ đọc dữ liệu vị trí; không expose business transition ở Controller.
            var query = _db.YardPositions.AsQueryable();
            if (!string.IsNullOrWhiteSpace(blockCode))
            {
                query = query.Where(y => y.BlockCode == blockCode);
            }
            return await query.ToListAsync();
        }

        public async Task<bool> UpdateYardPositionOccupancyAsync(string blockCode, int bay, int row, int tier, bool isOccupied, string? containerNo)
        {
            var pos = await _db.YardPositions.FirstOrDefaultAsync(y =>
                y.BlockCode == blockCode && y.Bay == bay && y.Row == row && y.Tier == tier);

            if (pos == null)
            {
                pos = new YardPosition
                {
                    BlockCode = blockCode,
                    Bay = bay,
                    Row = row,
                    Tier = tier,
                    IsOccupied = isOccupied,
                    OccupiedContainerNo = containerNo
                };
                _db.YardPositions.Add(pos);
            }
            else
            {
                pos.IsOccupied = isOccupied;
                pos.OccupiedContainerNo = containerNo;
            }

            await _db.SaveChangesAsync();
            return true;
        }
    }
}
