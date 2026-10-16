using System.Collections.Generic;
using System.Threading.Tasks;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Boundary cho cổng gửi dữ liệu sang API hãng tàu. Endpoint + khóa API của từng hãng cấu hình trên
    /// server (CarrierIntegrations:{CODE}), không lưu ở trình duyệt.
    /// </summary>
    public interface IShippingIntegrationService
    {
        Task<List<ShippingCarrierStatus>> GetCarriersAsync();
        Task<ShippingSyncOutcome> SyncJobAsync(ShippingSyncRequest request, string? triggeredBy);
        Task<List<ShippingSyncLogItem>> GetLogsAsync(string? carrierCode, long? jobId, int take);
    }

    /// <summary>Phân biệt: dữ liệu không hợp lệ / hãng chưa cấu hình (không gọi ra ngoài) / đã gửi (thành công hoặc lỗi).</summary>
    public sealed class ShippingSyncOutcome
    {
        public string Kind { get; private init; } = "INVALID";
        public string? Message { get; private init; }
        public ShippingSyncResult? Result { get; private init; }

        public static ShippingSyncOutcome Invalid(string message) => new() { Kind = "INVALID", Message = message };
        public static ShippingSyncOutcome NotConfigured(string message) => new() { Kind = "NOT_CONFIGURED", Message = message };
        public static ShippingSyncOutcome Attempted(ShippingSyncResult result) => new() { Kind = "ATTEMPTED", Result = result };
    }
}
