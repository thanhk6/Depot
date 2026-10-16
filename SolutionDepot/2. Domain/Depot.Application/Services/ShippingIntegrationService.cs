using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Depot.Data.EF;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Integration;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Gửi sự kiện container sang API hãng tàu bằng HTTP POST thật tới endpoint cấu hình trên server
    /// (section "CarrierIntegrations" trong appsettings / biến môi trường). Trước đây là adapter giả lập
    /// tự sinh ACK "ACKNOWLEDGED" mà không gọi ra ngoài — màn hình báo "đã gửi thành công" dù hãng tàu
    /// không hề nhận được gì. Hãng chưa cấu hình thì từ chối rõ ràng, không giả lập phản hồi.
    /// </summary>
    public class ShippingIntegrationService : IShippingIntegrationService
    {
        public const string HttpClientName = "CarrierGateway";
        private const int MaxStoredBodyLength = 8000;
        private static readonly string[] AckFieldNames = { "ackToken", "ackReference", "ackRef", "ack", "referenceNo", "reference", "transactionId", "id" };

        private readonly DepotDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public ShippingIntegrationService(DepotDbContext db, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        private sealed record CarrierEndpoint(string Code, string? Name, string EndpointUrl, string AuthType, string ApiKeyHeader, string? Secret, int TimeoutSeconds, bool Enabled);

        /// <summary>
        /// Đọc cấu hình 1 hãng: CarrierIntegrations:{CODE}:EndpointUrl / AuthType (BEARER | API_KEY | NONE) /
        /// ApiKeyHeader / Secret / TimeoutSeconds / Enabled / Name. Khóa bí mật chỉ nằm trên server.
        /// </summary>
        private IEnumerable<CarrierEndpoint> ReadCarrierEndpoints()
        {
            foreach (var section in _configuration.GetSection("CarrierIntegrations").GetChildren())
            {
                var url = section["EndpointUrl"];
                if (string.IsNullOrWhiteSpace(url)) continue;
                yield return new CarrierEndpoint(
                    section.Key.Trim().ToUpperInvariant(),
                    section["Name"],
                    url.Trim(),
                    (section["AuthType"] ?? "BEARER").Trim().ToUpperInvariant(),
                    string.IsNullOrWhiteSpace(section["ApiKeyHeader"]) ? "X-API-Key" : section["ApiKeyHeader"]!.Trim(),
                    section["Secret"],
                    int.TryParse(section["TimeoutSeconds"], out var t) && t > 0 ? Math.Min(t, 120) : 15,
                    !bool.TryParse(section["Enabled"], out var enabled) || enabled);
            }
        }

        private CarrierEndpoint? FindEndpoint(string carrierCode) =>
            ReadCarrierEndpoints().FirstOrDefault(x => string.Equals(x.Code, carrierCode.Trim(), StringComparison.OrdinalIgnoreCase));

        public async Task<List<ShippingCarrierStatus>> GetCarriersAsync()
        {
            var endpoints = ReadCarrierEndpoints().ToList();
            var lines = await _db.ShippingLines.AsNoTracking().Where(x => !x.IsDeleted)
                .OrderBy(x => x.Code).Select(x => new { x.Code, x.Name }).ToListAsync();

            var result = lines.Select(l =>
            {
                var ep = endpoints.FirstOrDefault(e => string.Equals(e.Code, l.Code, StringComparison.OrdinalIgnoreCase));
                return ToStatus(l.Code, l.Name, ep);
            }).ToList();
            // Hãng có cấu hình endpoint nhưng chưa có trong danh mục hãng tàu vẫn hiển thị để biết cấu hình thừa/sai mã.
            result.AddRange(endpoints
                .Where(e => !lines.Any(l => string.Equals(l.Code, e.Code, StringComparison.OrdinalIgnoreCase)))
                .Select(e => ToStatus(e.Code, e.Name ?? e.Code, e)));
            return result;
        }

        private static ShippingCarrierStatus ToStatus(string code, string name, CarrierEndpoint? ep) => new()
        {
            CarrierCode = code,
            CarrierName = name,
            Configured = ep != null,
            Enabled = ep?.Enabled ?? false,
            EndpointUrl = ep?.EndpointUrl,
            AuthType = ep?.AuthType,
            HasSecret = !string.IsNullOrWhiteSpace(ep?.Secret),
            TimeoutSeconds = ep?.TimeoutSeconds ?? 0
        };

        public async Task<ShippingSyncOutcome> SyncJobAsync(ShippingSyncRequest request, string? triggeredBy)
        {
            if (!long.TryParse(request.JobId, out var jobId))
                return ShippingSyncOutcome.Invalid("Mã hồ sơ container không hợp lệ.");

            var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.Id == jobId && !x.IsDeleted);
            if (job == null) return ShippingSyncOutcome.Invalid("Không tìm thấy hồ sơ container.");

            var line = await _db.ShippingLines.AsNoTracking().FirstOrDefaultAsync(x => x.Id == job.ShippingLineId);
            var carrierCode = string.IsNullOrWhiteSpace(request.CarrierCode) ? line?.Code ?? string.Empty : request.CarrierCode.Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(carrierCode))
                return ShippingSyncOutcome.Invalid("Hồ sơ container chưa có hãng tàu.");

            var endpoint = FindEndpoint(carrierCode);
            if (endpoint == null)
                return ShippingSyncOutcome.NotConfigured(
                    $"Chưa cấu hình kết nối API cho hãng tàu {carrierCode}. Khai báo endpoint + khóa API của hãng tại mục CarrierIntegrations:{carrierCode} trên server (appsettings hoặc biến môi trường).");
            if (!endpoint.Enabled)
                return ShippingSyncOutcome.NotConfigured($"Kết nối API hãng tàu {carrierCode} đang tắt (CarrierIntegrations:{carrierCode}:Enabled = false).");

            var eventType = string.IsNullOrWhiteSpace(request.EventType) ? "CONTAINER_STATUS_UPDATE" : request.EventType.Trim().ToUpperInvariant();
            if (eventType == "QC_PASSED")
            {
                var qcPassed = await _db.RepairOrders.AsNoTracking()
                    .AnyAsync(r => r.DepotJobId == job.Id && !r.IsDeleted && r.QcStatus == "PASSED");
                if (!qcPassed)
                    return ShippingSyncOutcome.Invalid($"Container {job.ContainerNo} chưa có kết quả QC đạt — chỉ báo hãng tàu sửa xong sau khi QC nghiệm thu đạt.");
            }
            var payload = await BuildPayloadAsync(job, line, carrierCode, eventType);
            var requestBody = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });

            var log = new ShippingSyncLog
            {
                DepotJobId = job.Id,
                ContainerNo = job.ContainerNo,
                CarrierCode = carrierCode,
                EventType = eventType,
                EndpointUrl = endpoint.EndpointUrl,
                RequestBody = requestBody,
                TriggeredBy = Truncate(triggeredBy, 150),
                SyncedAt = DateTime.UtcNow,
                Status = "FAILED"
            };

            var sw = Stopwatch.StartNew();
            try
            {
                using var message = new HttpRequestMessage(HttpMethod.Post, endpoint.EndpointUrl)
                {
                    Content = new StringContent(requestBody, Encoding.UTF8, "application/json")
                };
                message.Headers.TryAddWithoutValidation("Accept", "application/json");
                message.Headers.TryAddWithoutValidation("X-Depot-Job-No", job.JobNo);
                message.Headers.TryAddWithoutValidation("X-Event-Type", eventType);
                if (!string.IsNullOrWhiteSpace(endpoint.Secret))
                {
                    if (endpoint.AuthType == "API_KEY")
                        message.Headers.TryAddWithoutValidation(endpoint.ApiKeyHeader, endpoint.Secret);
                    else if (endpoint.AuthType != "NONE")
                        message.Headers.TryAddWithoutValidation("Authorization", $"Bearer {endpoint.Secret}");
                }

                var client = _httpClientFactory.CreateClient(HttpClientName);
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(endpoint.TimeoutSeconds));
                using var response = await client.SendAsync(message, cts.Token);
                var body = await response.Content.ReadAsStringAsync(cts.Token);
                sw.Stop();

                log.HttpStatusCode = (int)response.StatusCode;
                log.ResponseBody = Truncate(body, MaxStoredBodyLength);
                log.LatencyMs = (int)sw.ElapsedMilliseconds;
                if (response.IsSuccessStatusCode)
                {
                    log.Status = "SENT";
                    log.AckToken = Truncate(ExtractAck(body), 150) ?? string.Empty;
                }
                else
                {
                    log.ErrorMessage = Truncate($"Hãng tàu trả HTTP {(int)response.StatusCode} {response.ReasonPhrase}", 1000);
                }
            }
            catch (OperationCanceledException)
            {
                sw.Stop();
                log.LatencyMs = (int)sw.ElapsedMilliseconds;
                log.ErrorMessage = $"Quá thời gian chờ phản hồi ({endpoint.TimeoutSeconds}s) từ {endpoint.EndpointUrl}.";
            }
            catch (Exception ex) when (ex is HttpRequestException or InvalidOperationException or UriFormatException)
            {
                sw.Stop();
                log.LatencyMs = (int)sw.ElapsedMilliseconds;
                log.ErrorMessage = Truncate($"Không kết nối được tới {endpoint.EndpointUrl}: {ex.Message}", 1000);
            }

            _db.ShippingSyncLogs.Add(log);
            if (log.Status == "SENT" && eventType == "ESTIMATE_SUBMITTED")
            {
                // Gửi báo giá tới hãng tàu thành công = báo giá đã được xác nhận (chốt bản gửi).
                var sentEstimate = await _db.Estimates.FirstOrDefaultAsync(e => e.DepotJobId == job.Id && e.Status == "PENDING_APPROVAL");
                if (sentEstimate != null && sentEstimate.ConfirmedAt == null)
                {
                    sentEstimate.ConfirmedAt = DateTime.UtcNow;
                    sentEstimate.ConfirmedBy = triggeredBy;
                }
            }
            if (log.Status == "SENT")
            {
                _db.AuditLogs.Add(new JobAuditLog
                {
                    DepotJobId = job.Id,
                    JobNo = job.JobNo,
                    Action = "SHIPPING_SYNC_SENT",
                    User = triggeredBy ?? "EDI Gateway",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Gửi {eventType} tới {carrierCode} (HTTP {log.HttpStatusCode})" +
                              (string.IsNullOrEmpty(log.AckToken) ? string.Empty : $", mã xác nhận: {log.AckToken}")
                });
            }
            await _db.SaveChangesAsync();

            return ShippingSyncOutcome.Attempted(new ShippingSyncResult
            {
                LogId = log.Id,
                Success = log.Status == "SENT",
                Status = log.Status,
                CarrierCode = carrierCode,
                EndpointUrl = endpoint.EndpointUrl,
                HttpStatusCode = log.HttpStatusCode,
                AckToken = log.AckToken,
                LatencyMs = log.LatencyMs,
                RequestBody = log.RequestBody,
                ResponseBody = log.ResponseBody,
                ErrorMessage = log.ErrorMessage,
                SyncedAt = log.SyncedAt
            });
        }

        public async Task<List<ShippingSyncLogItem>> GetLogsAsync(string? carrierCode, long? jobId, int take)
        {
            var query = _db.ShippingSyncLogs.AsNoTracking().Where(x => !x.IsDeleted);
            if (!string.IsNullOrWhiteSpace(carrierCode))
            {
                var code = carrierCode.Trim().ToUpper();
                query = query.Where(x => x.CarrierCode == code);
            }
            if (jobId.HasValue) query = query.Where(x => x.DepotJobId == jobId.Value);

            return await query.OrderByDescending(x => x.SyncedAt).Take(Math.Clamp(take, 1, 500))
                .Select(x => new ShippingSyncLogItem
                {
                    Id = x.Id,
                    DepotJobId = x.DepotJobId,
                    ContainerNo = x.ContainerNo,
                    CarrierCode = x.CarrierCode,
                    EventType = x.EventType,
                    Status = x.Status,
                    EndpointUrl = x.EndpointUrl,
                    HttpStatusCode = x.HttpStatusCode,
                    AckToken = x.AckToken,
                    LatencyMs = x.LatencyMs,
                    RequestBody = x.RequestBody,
                    ResponseBody = x.ResponseBody,
                    ErrorMessage = x.ErrorMessage,
                    TriggeredBy = x.TriggeredBy,
                    SyncedAt = x.SyncedAt
                }).ToListAsync();
        }

        /// <summary>Nội dung gửi lấy hoàn toàn từ DB (không tin dữ liệu client gửi lên).</summary>
        private async Task<object> BuildPayloadAsync(DepotJob job, Depot.Data.Entities.Master.ShippingLine? line, string carrierCode, string eventType)
        {
            var survey = await _db.Surveys.AsNoTracking().Where(x => x.DepotJobId == job.Id && !x.IsDeleted)
                .OrderByDescending(x => x.SurveyDate).FirstOrDefaultAsync();
            var estimate = await _db.Estimates.AsNoTracking().Where(x => x.DepotJobId == job.Id && !x.IsDeleted)
                .OrderByDescending(x => x.Id).FirstOrDefaultAsync();
            var estimateItems = estimate == null
                ? new List<EstimateItem>()
                : await _db.Set<EstimateItem>().AsNoTracking().Where(x => x.EstimateId == estimate.Id && !x.IsDeleted).OrderBy(x => x.Id).ToListAsync();
            var repairOrder = await _db.RepairOrders.AsNoTracking().Where(x => x.DepotJobId == job.Id && !x.IsDeleted)
                .OrderByDescending(x => x.Id).FirstOrDefaultAsync();
            var lastQcLog = await _db.AuditLogs.AsNoTracking()
                .Where(x => x.DepotJobId == job.Id && (x.Action == "QC_PASSED" || x.Action == "QC_FAILED"))
                .OrderByDescending(x => x.Timestamp).FirstOrDefaultAsync();

            return new
            {
                eventType,
                sentAt = DateTime.UtcNow,
                carrierCode,
                container = new
                {
                    jobNo = job.JobNo,
                    containerNo = job.ContainerNo,
                    isoSize = job.IsoSize,
                    shippingLineCode = line?.Code,
                    shippingLineName = line?.Name,
                    status = job.Status,
                    gateInDate = job.GateInDate,
                    gateOutDate = job.GateOutDate,
                    tareWeightKg = job.TareWeightKg,
                    maxPayloadKg = job.MaxPayloadKg,
                    yardLocation = string.IsNullOrEmpty(job.BlockCode) ? null : new { block = job.BlockCode, bay = job.Bay, row = job.Row, tier = job.Tier }
                },
                survey = survey == null ? null : new
                {
                    surveyNo = survey.SurveyNo,
                    surveyDate = survey.SurveyDate,
                    surveyor = survey.SurveyorName,
                    conditionRating = survey.ConditionRating,
                    qualityGrade = survey.QualityGrade,
                    standard = survey.Standard,
                    notes = survey.OverallNotes
                },
                // Sửa chữa + QC nghiệm thu — dùng cho sự kiện QC_PASSED (báo hãng tàu container đã sửa xong, QC đạt).
                repair = repairOrder == null ? null : new
                {
                    technician = repairOrder.TechnicianName,
                    startedAt = repairOrder.StartedAt,
                    completedAt = repairOrder.CompletedAt,
                    qcStatus = repairOrder.QcStatus,
                    qcInspector = repairOrder.InspectorName,
                    qcNotes = repairOrder.QcNotes,
                    qcInspectedAt = lastQcLog?.Timestamp
                },
                estimate = estimate == null ? null : new
                {
                    estimateNo = estimate.EstimateNo,
                    status = estimate.Status,
                    currency = estimate.Currency,
                    shopCode = estimate.ShopCode,
                    vendorRefNo = estimate.VendorRefNo,
                    repairMode = estimate.RepairMode,
                    cause = estimate.Cause,
                    preparationHours = estimate.PreparationHours,
                    ordinaryHours = estimate.OrdinaryHours,
                    ot1Hours = estimate.Ot1Hours,
                    ot2Hours = estimate.Ot2Hours,
                    ot3Hours = estimate.Ot3Hours,
                    totalManHours = estimate.TotalManHours,
                    laborRate = estimate.LaborRate,
                    totalLaborCost = estimate.TotalLaborCost,
                    totalMaterialCost = estimate.TotalMaterialCost,
                    totalTax = estimate.TotalTax,
                    grandTotal = estimate.GrandTotal,
                    approvedAt = estimate.ApprovedAt,
                    approvedBy = estimate.ApprovedBy,
                    // Dòng sửa chữa theo cấu trúc AEMS: Damage code, Repair code, Rep. loc, TPI, PCS, man hrs/PC, mat. cost/PC, item total.
                    items = estimateItems.Select(i => new
                    {
                        damageCode = i.DamageCode,
                        repairCode = i.RepairCode,
                        description = i.ItemDescription,
                        repairLocation = i.LocationCode,
                        tpi = i.Tpi,
                        pieces = i.Quantity,
                        manHoursPerPiece = i.ManHoursPerPiece,
                        materialCostPerPiece = i.UnitPrice,
                        itemTotal = i.Amount,
                        // giữ tên trường cũ cho hệ thống đã tích hợp trước đây
                        quantity = i.Quantity, unitPrice = i.UnitPrice, amount = i.Amount
                    })
                }
            };
        }

        private static string? ExtractAck(string body)
        {
            if (string.IsNullOrWhiteSpace(body)) return null;
            try
            {
                using var doc = JsonDocument.Parse(body);
                return FindAck(doc.RootElement, 0);
            }
            catch (JsonException)
            {
                return null;
            }
        }

        private static string? FindAck(JsonElement el, int depth)
        {
            if (el.ValueKind != JsonValueKind.Object || depth > 2) return null;
            foreach (var name in AckFieldNames)
                foreach (var prop in el.EnumerateObject())
                    if (string.Equals(prop.Name, name, StringComparison.OrdinalIgnoreCase) &&
                        prop.Value.ValueKind is JsonValueKind.String or JsonValueKind.Number)
                        return prop.Value.ToString();
            foreach (var prop in el.EnumerateObject())
            {
                var nested = FindAck(prop.Value, depth + 1);
                if (nested != null) return nested;
            }
            return null;
        }

        private static string? Truncate(string? value, int max) =>
            value == null ? null : value.Length <= max ? value : value[..max];
    }
}
