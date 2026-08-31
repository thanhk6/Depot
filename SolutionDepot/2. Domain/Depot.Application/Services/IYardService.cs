using System.Collections.Generic;
using System.Threading.Tasks;
using Depot.Data.Entities.Yard;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    public interface IYardService
    {
        Task<List<YardPosition>> GetYardPositionsAsync(string? blockCode = null);
        Task<bool> UpdateYardPositionOccupancyAsync(string blockCode, int bay, int row, int tier, bool isOccupied, string? containerNo);
    }
}
