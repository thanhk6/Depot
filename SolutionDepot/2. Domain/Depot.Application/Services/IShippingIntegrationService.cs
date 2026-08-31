using System.Threading.Tasks;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Boundary cho EDI/REST Gateway. Khi tích hợp hãng tàu thật, thay implementation
    /// bằng adapter HTTP/EDIFACT nhưng giữ nguyên contract của Application layer.
    /// </summary>
    public interface IShippingIntegrationService
    {
        Task<ShippingSyncResult?> SyncJobAsync(ShippingSyncRequest request);
    }
}