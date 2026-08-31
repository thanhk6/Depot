using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Integration;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Adapter local tạo ACK deterministic để frontend và môi trường development
    /// kiểm thử được workflow trước khi cấu hình endpoint hãng tàu thật.
    /// </summary>
    public class ShippingIntegrationService : IShippingIntegrationService
    {
        private readonly DepotDbContext _db;

        public ShippingIntegrationService(DepotDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Development adapter: tạo ACK và audit log local. Production thay phần này
        /// bằng HTTP/EDIFACT client có HMAC, timeout, retry và poison-message handling.
        /// </summary>
        public async Task<ShippingSyncResult?> SyncJobAsync(ShippingSyncRequest request)
        {
            if (!long.TryParse(request.JobId, out var jobId) || string.IsNullOrWhiteSpace(request.CarrierCode))
                return null;

            var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.Id == jobId);
            if (job == null || job.Status is "GATE_OUT" or "SCRAP_UNFIT") return null;

            var ack = $"ACK-{request.CarrierCode.ToUpperInvariant()}-{job.JobNo}-{DateTime.UtcNow:yyyyMMddHHmmss}";
            _db.ShippingSyncLogs.Add(new ShippingSyncLog
            {
                DepotJobId = job.Id, ContainerNo = job.ContainerNo,
                CarrierCode = request.CarrierCode.ToUpperInvariant(), EventType = request.EventType,
                Status = "ACKNOWLEDGED", AckToken = ack, SyncedAt = DateTime.UtcNow
            });
            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = job.Id,
                JobNo = job.JobNo,
                Action = "SHIPPING_SYNC_ACK",
                User = "EDI Gateway",
                Timestamp = DateTime.UtcNow,
                Details = $"Đồng bộ {request.EventType} tới {request.CarrierCode}, ACK: {ack}"
            });
            await _db.SaveChangesAsync();

            return new ShippingSyncResult { AckToken = ack };
        }
    }
}