using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Cleaning;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Master;
using Depot.Data.Entities.Finance;
using Depot.Data.Entities.Storage;
using Depot.Data.Entities.System;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Điều phối toàn bộ vòng đời container từ Gate-In đến Gate-Out.
    /// Mỗi method tương ứng một use-case và tự kiểm tra trạng thái trước khi ghi DB.
    /// </summary>
    public class DepotJobService : IDepotJobService
    {
        private readonly DepotDbContext _db;

        public DepotJobService(DepotDbContext db)
        {
            _db = db;
        }

        /// <summary>Đọc danh sách hồ sơ kèm Survey, Estimate, Repair, Payment và audit để phục vụ màn hình chi tiết.</summary>
        public async Task<List<DepotJobDto>> GetAllJobsAsync(DepotJobFilterRequest? filter = null)
        {
            var query = _db.DepotJobs.AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrWhiteSpace(filter.SearchKeyword))
                {
                    var kw = filter.SearchKeyword.Trim().ToUpper();
                    query = query.Where(j => j.ContainerNo.Contains(kw) || j.JobNo.Contains(kw));
                }

                if (!string.IsNullOrWhiteSpace(filter.ShippingLine))
                {
                    var shippingLineId = await _db.ShippingLines
                        .Where(s => s.Code == filter.ShippingLine)
                        .Select(s => (long?)s.Id)
                        .FirstOrDefaultAsync();
                    query = query.Where(j => shippingLineId != null && j.ShippingLineId == shippingLineId);
                }

                if (!string.IsNullOrWhiteSpace(filter.Status))
                {
                    query = query.Where(j => j.Status == filter.Status);
                }

                if (filter.FromDate.HasValue)
                {
                    query = query.Where(j => j.GateInDate >= filter.FromDate.Value);
                }

                if (filter.ToDate.HasValue)
                {
                    query = query.Where(j => j.GateInDate <= filter.ToDate.Value);
                }
            }

            // BUG-034: hỗ trợ phân trang phía server (tuỳ chọn) — danh sách đầy đủ kèm survey/estimate/audit lồng nhau
            // tăng tuyến tính theo số hồ sơ.
            var ordered = query.OrderByDescending(j => j.GateInDate).ThenByDescending(j => j.Id);
            if (filter?.Page is > 0 && filter.PageSize is > 0)
            {
                filter.TotalCount = await ordered.CountAsync();
                var size = Math.Min(filter.PageSize.Value, 500);
                var paged = await ordered.Skip((filter.Page.Value - 1) * size).Take(size).ToListAsync();
                return await MapToDtosAsync(paged);
            }
            var jobs = await ordered.ToListAsync();
            if (filter != null) filter.TotalCount = jobs.Count;
            return await MapToDtosAsync(jobs);
        }

        /// <summary>Tra cứu theo khóa chính; trả null để Controller phản hồi 404.</summary>
        public async Task<DepotJobDto?> GetJobByIdAsync(long id)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == id);
            if (job == null) return null;
            return (await MapToDtosAsync(new List<DepotJob> { job })).FirstOrDefault();
        }

        /// <summary>Tra cứu theo số container, dùng cho cổng và tìm kiếm vận hành.</summary>
        public async Task<DepotJobDto?> GetJobByContainerNoAsync(string containerNo)
        {
            var upper = containerNo.Trim().ToUpper();
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.ContainerNo == upper);
            if (job == null) return null;
            return (await MapToDtosAsync(new List<DepotJob> { job })).FirstOrDefault();
        }

        /// <summary>Map 1 lô DepotJob sang DTO phẳng — không còn navigation property nên tự query rời từng
        /// bảng con theo FK (DepotJobId/SurveyId/EstimateId) rồi gộp lại trong bộ nhớ, hiệu năng tương đương
        /// AsSplitQuery() cũ (đều là nhiều round-trip SQL riêng thay vì 1 JOIN khổng lồ).</summary>
        private static List<string> ParsePhotoUrls(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new List<string>();
            try { return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>(); }
            catch (System.Text.Json.JsonException) { return new List<string>(); }
        }

        private async Task<List<DepotJobDto>> MapToDtosAsync(List<DepotJob> jobs)
        {
            var jobIds = jobs.Select(j => j.Id).ToList();
            var shippingLineIds = jobs.Select(j => j.ShippingLineId).Distinct().ToList();

            var shippingLineCodes = await _db.ShippingLines
                .Where(s => shippingLineIds.Contains(s.Id))
                .ToDictionaryAsync(s => s.Id, s => s.Code);

            var surveys = await _db.Surveys.Where(s => jobIds.Contains(s.DepotJobId)).ToListAsync();
            var surveyIds = surveys.Select(s => s.Id).ToList();
            var damages = await _db.Set<DamageItem>().Where(d => surveyIds.Contains(d.SurveyId)).ToListAsync();
            var cleaningItems = await _db.Set<SurveyCleaningItem>().Where(c => surveyIds.Contains(c.SurveyId)).ToListAsync();
            var checklistItems = await _db.Set<SurveyChecklistItem>().Where(c => surveyIds.Contains(c.SurveyId)).ToListAsync();
            var photos = await _db.Set<SurveyPhotoItem>().Where(p => surveyIds.Contains(p.SurveyId)).ToListAsync();

            var estimates = await _db.Estimates.Where(e => jobIds.Contains(e.DepotJobId)).ToListAsync();
            var estimateIds = estimates.Select(e => e.Id).ToList();
            var estimateItems = await _db.Set<EstimateItem>().Where(i => estimateIds.Contains(i.EstimateId)).ToListAsync();

            var repairOrders = await _db.RepairOrders.Where(r => jobIds.Contains(r.DepotJobId)).ToListAsync();
            var payments = await _db.Payments.Where(p => jobIds.Contains(p.DepotJobId)).ToListAsync();
            var auditLogs = await _db.AuditLogs.Where(a => jobIds.Contains(a.DepotJobId)).ToListAsync();

            return jobs.Select(j =>
            {
                var survey = surveys.FirstOrDefault(s => s.DepotJobId == j.Id);
                var estimate = estimates.FirstOrDefault(e => e.DepotJobId == j.Id);
                var repairOrder = repairOrders.FirstOrDefault(r => r.DepotJobId == j.Id);
                var payment = payments.FirstOrDefault(p => p.DepotJobId == j.Id);

                return new DepotJobDto
                {
                    Id = j.Id, JobNo = j.JobNo, ContainerNo = j.ContainerNo, IsoSize = j.IsoSize,
                    ShippingLineId = j.ShippingLineId,
                    ShippingLineCode = shippingLineCodes.TryGetValue(j.ShippingLineId, out var code) ? code : null,
                    TareWeightKg = j.TareWeightKg, MaxPayloadKg = j.MaxPayloadKg, Status = j.Status,
                    GateInDate = j.GateInDate, GateOutDate = j.GateOutDate,
                    GateOutTruckPlate = j.GateOutTruckPlate, GateOutDriverName = j.GateOutDriverName,
                    GateOutTrailerPlate = j.GateOutTrailerPlate, GateOutSealNo = j.GateOutSealNo,
                    GateInEirNo = j.GateInEirNo, GateOutEirNo = j.GateOutEirNo, GateOutBookingNo = j.GateOutBookingNo,
                    GateInTruckPlate = j.GateInTruckPlate, GateInTrailerPlate = j.GateInTrailerPlate,
                    GateInDriverName = j.GateInDriverName, GateInDriverPhone = j.GateInDriverPhone,
                    GateInSealNo = j.GateInSealNo, GateInBookingNo = j.GateInBookingNo,
                    GateInDriverLicense = j.GateInDriverLicense, GateInCustomsSealNo = j.GateInCustomsSealNo,
                    GateInTruckingCompany = j.GateInTruckingCompany, GateInTruckingName = j.GateInTruckingName, GateInRemarks = j.GateInRemarks,
                    GateInStaffId = j.GateInStaffId, GateInStaffName = j.GateInStaffName,
                    SurveyClaimedByStaffId = j.SurveyClaimedByStaffId, SurveyClaimedByName = j.SurveyClaimedByName,
                    SurveyClaimedAt = j.SurveyClaimedAt,
                    ForkliftClaimedByOperatorId = j.ForkliftClaimedByOperatorId, ForkliftClaimedByOperatorName = j.ForkliftClaimedByOperatorName,
                    ForkliftAssignedVehicleCode = j.ForkliftAssignedVehicleCode, ForkliftClaimedAt = j.ForkliftClaimedAt, ForkliftStartedAt = j.ForkliftStartedAt,
                    BlockCode = j.BlockCode, Bay = j.Bay, Row = j.Row, Tier = j.Tier,
                    CreatedAt = j.CreatedAt,
                    Survey = survey == null ? null : new SurveyDto
                    {
                        Id = survey.Id, CreatedAt = survey.CreatedAt, DepotJobId = survey.DepotJobId, JobNo = survey.JobNo,
                        SurveyorId = survey.SurveyorId, SurveyorName = survey.SurveyorName, SurveyDate = survey.SurveyDate,
                        ConditionRating = survey.ConditionRating, OverallNotes = survey.OverallNotes,
                        CleaningReason = survey.CleaningReason, CleaningMethod = survey.CleaningMethod, CleaningRemarks = survey.CleaningRemarks,
                        SurveyNo = survey.SurveyNo, Owner = survey.Owner, ContainerTypeName = survey.ContainerTypeName,
                        ManufactureMonthYear = survey.ManufactureMonthYear, MaxGrossWeightKg = survey.MaxGrossWeightKg,
                        Material = survey.Material, FloorType = survey.FloorType, CscPlateNo = survey.CscPlateNo,
                        Standard = survey.Standard, StandardNotes = survey.StandardNotes, QualityGrade = survey.QualityGrade,
                        ActionRequired = survey.ActionRequired, Shift = survey.Shift, YardLocationNote = survey.YardLocationNote,
                        CargoStatus = survey.CargoStatus, ReeferBrand = survey.ReeferBrand, ReeferModel = survey.ReeferModel,
                        ReeferSetTemperatureC = survey.ReeferSetTemperatureC, PtiStatus = survey.PtiStatus,
                        CompressorHours = survey.CompressorHours, HumidityPercent = survey.HumidityPercent, VentilationCmh = survey.VentilationCmh,
                        Damages = damages.Where(d => d.SurveyId == survey.Id).Select(d => new DamageItemDto
                        {
                            Id = d.Id, Component = d.Component, DamageCode = d.DamageCode, DamageNameVi = d.DamageNameVi,
                            LocationCode = d.LocationCode, RepairCode = d.RepairCode, RepairNameVi = d.RepairNameVi,
                            Quantity = d.Quantity, Unit = d.Unit, LaborHours = d.LaborHours, LaborRate = d.LaborRate,
                            MaterialCost = d.MaterialCost, TotalCost = d.TotalCost, Severity = d.Severity, Notes = d.Notes,
                            LengthMm = d.LengthMm, WidthMm = d.WidthMm, PhotoUrl = d.PhotoUrl
                        }).ToList(),
                        CleaningItems = cleaningItems.Where(c => c.SurveyId == survey.Id).Select(c => new SurveyCleaningItemDto
                        {
                            Id = c.Id, CleaningCode = c.CleaningCode, CleaningName = c.CleaningName, Category = c.Category,
                            ChemicalRequired = c.ChemicalRequired, ChemicalName = c.ChemicalName, Quantity = c.Quantity,
                            UnitPrice = c.UnitPrice, TotalPrice = c.TotalPrice, ResponsibleParty = c.ResponsibleParty,
                            Status = c.Status, Notes = c.Notes, WasherName = c.WasherName, CompletedAt = c.CompletedAt
                        }).ToList(),
                        ChecklistItems = checklistItems.Where(c => c.SurveyId == survey.Id).Select(c => new SurveyChecklistItemDto
                        {
                            Id = c.Id, ZoneKey = c.ZoneKey, ZoneName = c.ZoneName, Status = c.Status,
                            Notes = c.Notes, DamageCount = c.DamageCount
                        }).ToList(),
                        Photos = photos.Where(p => p.SurveyId == survey.Id).Select(p => new SurveyPhotoItemDto
                        {
                            Id = p.Id, Url = p.Url, Type = p.Type, Caption = p.Caption, SurveyorName = p.SurveyorName,
                            UploadedAt = p.UploadedAt, FileSizeKb = p.FileSizeKb
                        }).ToList()
                    },
                    Estimate = estimate == null ? null : new EstimateDto
                    {
                        Id = estimate.Id, CreatedAt = estimate.CreatedAt, CreatedBy = estimate.CreatedBy,
                        LastModifiedAt = estimate.LastModifiedAt, LastModifiedBy = estimate.LastModifiedBy, Notes = estimate.Notes,
                        LaborRate = estimate.LaborRate, TotalManHours = estimate.TotalManHours, RepairMode = estimate.RepairMode, Cause = estimate.Cause,
                        ShopCode = estimate.ShopCode, VendorRefNo = estimate.VendorRefNo, PreparationHours = estimate.PreparationHours,
                        OrdinaryHours = estimate.OrdinaryHours, Ot1Hours = estimate.Ot1Hours, Ot2Hours = estimate.Ot2Hours, Ot3Hours = estimate.Ot3Hours,
                        SurveyReference = estimate.SurveyReference, InspectionPhotos = ParsePhotoUrls(estimate.InspectionPhotoUrlsJson),
                        ConfirmedAt = estimate.ConfirmedAt, ConfirmedBy = estimate.ConfirmedBy,
                        CarrierWorkOrderNo = estimate.CarrierWorkOrderNo, CarrierAuthCode = estimate.CarrierAuthCode,
                        CarrierApproverName = estimate.CarrierApproverName, ApprovedAmount = estimate.ApprovedAmount,
                        ApprovalChannel = estimate.ApprovalChannel, ApprovalNotes = estimate.ApprovalNotes, DepotJobId = estimate.DepotJobId, JobNo = estimate.JobNo, EstimateNo = estimate.EstimateNo,
                        TotalLaborCost = estimate.TotalLaborCost, TotalMaterialCost = estimate.TotalMaterialCost,
                        TotalTax = estimate.TotalTax, GrandTotal = estimate.GrandTotal, Currency = estimate.Currency,
                        Status = estimate.Status, ApprovedAt = estimate.ApprovedAt, ApprovedBy = estimate.ApprovedBy,
                        Items = estimateItems.Where(i => i.EstimateId == estimate.Id).Select(i => new EstimateItemDto
                        {
                            Id = i.Id, ItemDescription = i.ItemDescription,
                            LocationCode = i.LocationCode, LocationName = i.LocationName, DamageCode = i.DamageCode, DamageName = i.DamageName,
                            RepairCode = i.RepairCode, RepairMethod = i.RepairMethod, Unit = i.Unit, VatPercent = i.VatPercent,
                            Tpi = i.Tpi, ManHoursPerPiece = i.ManHoursPerPiece,
                            Quantity = i.Quantity, UnitPrice = i.UnitPrice, Amount = i.Amount
                        }).ToList()
                    },
                    RepairOrder = repairOrder == null ? null : new RepairOrderDto
                    {
                        Id = repairOrder.Id, CreatedAt = repairOrder.CreatedAt, DepotJobId = repairOrder.DepotJobId, JobNo = repairOrder.JobNo,
                        TechnicianId = repairOrder.TechnicianId, TechnicianName = repairOrder.TechnicianName,
                        StartedAt = repairOrder.StartedAt, CompletedAt = repairOrder.CompletedAt,
                        QcStatus = repairOrder.QcStatus, QcNotes = repairOrder.QcNotes, InspectorName = repairOrder.InspectorName
                    },
                    Payment = payment == null ? null : new PaymentDto
                    {
                        Id = payment.Id, CreatedAt = payment.CreatedAt, DepotJobId = payment.DepotJobId, InvoiceNo = payment.InvoiceNo, Amount = payment.Amount,
                        Tax = payment.Tax, TotalAmount = payment.TotalAmount, Status = payment.Status, PaidAt = payment.PaidAt,
                        PaymentMethod = payment.PaymentMethod, CashierName = payment.CashierName
                    },
                    AuditLogs = auditLogs.Where(a => a.DepotJobId == j.Id).OrderByDescending(a => a.Timestamp).Select(a => new JobAuditLogDto
                    {
                        Id = a.Id, DepotJobId = a.DepotJobId, JobNo = a.JobNo, Action = a.Action, User = a.User,
                        Timestamp = a.Timestamp, Details = a.Details
                    }).ToList()
                };
            }).ToList();
        }

        // null = hồ sơ không tồn tại (controller trả 404) — trước đây trả 200 danh sách rỗng (BUG-029).
        public async Task<List<DepotJobHistoryDto>?> GetHistoryAsync(long jobId)
        {
            var job = await _db.DepotJobs.Where(j => j.Id == jobId).Select(j => new { j.JobNo, j.ContainerNo }).FirstOrDefaultAsync();
            if (job == null) return null;
            var jobNo = job.JobNo;
            var containerNo = job.ContainerNo;
            return await _db.AuditLogs
                .Where(log => log.DepotJobId == jobId)
                .OrderByDescending(log => log.Timestamp)
                .Select(log => new DepotJobHistoryDto
                {
                    JobNo = jobNo ?? log.JobNo, ContainerNo = containerNo ?? string.Empty, Action = log.Action,
                    User = log.User, Timestamp = log.Timestamp, Details = log.Details
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteJobAsync(long jobId, string deletedBy)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.Id == jobId && !x.IsDeleted);
            if (job == null || job.Status != "GATE_OUT") return false;
            job.IsDeleted = true;
            job.DeletedAt = DateTime.UtcNow;
            job.DeletedBy = string.IsNullOrWhiteSpace(deletedBy) ? "System" : deletedBy;
            await _db.SaveChangesAsync();
            return true;
        }

            public async Task<bool> UpdateJobStatusAsync(long jobId, UpdateJobStatusRequest request, string? actor = null)
            {
                var allowed = new[] { "SURVEYING", "CLEANING", "PAYMENT_PENDING", "WAITING_FORKLIFT", "REPAIRING", "READY_FOR_OUT", "IN_YARD", "CANCELLED" };
                if (!allowed.Contains(request.Status)) return false;
                var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.Id == jobId);
                if (job == null) return false;

                // Hồ sơ đã Gate-Out là vòng đời đã đóng — đưa container vào lại bãi phải Gate-In hồ sơ mới.
                if (job.Status == "GATE_OUT")
                    throw new ArgumentException("Hồ sơ đã Gate-Out, không đổi trạng thái được. Container vào lại bãi phải Gate-In hồ sơ mới.");

                // Trước đây cho phép set thẳng bất kỳ trạng thái nào trong whitelist mà không kiểm tra
                // điều kiện tiên quyết — 1 job đang REPAIRING/QC_PENDING (QC chưa đạt) có thể bị set thẳng
                // "READY_FOR_OUT" qua endpoint chung này, bỏ qua hoàn toàn CompleteQcInspectionAsync, rồi
                // Gate-Out bình thường theo đúng Status. Chặn đúng con đường vòng này: nếu job có
                // RepairOrder (đã đi qua nhánh sửa chữa) mà QC chưa đạt, không cho set thẳng READY_FOR_OUT
                // qua endpoint này — container không qua nhánh sửa chữa (AV/CL) không có RepairOrder nào
                // nên không bị ảnh hưởng, vẫn set được bình thường như trước.
                // Container chưa từng giám định cũng không có RepairOrder nên lọt qua kiểm tra trên — trước đây set
                // thẳng SURVEYING → READY_FOR_OUT rồi Gate-Out được container chưa giám định (BUG-003).
                if (request.Status == "READY_FOR_OUT")
                {
                    if (!await _db.Surveys.AnyAsync(s => s.DepotJobId == job.Id))
                        throw new ArgumentException("Container chưa có phiếu giám định — không thể chuyển sang Sẵn sàng xuất.");
                    var hasUnqualifiedRepair = await _db.RepairOrders.AnyAsync(r => r.DepotJobId == job.Id && r.QcStatus != "PASSED");
                    if (hasUnqualifiedRepair)
                        throw new ArgumentException("Container còn lệnh sửa chữa chưa qua QC đạt — không thể chuyển sang Sẵn sàng xuất.");
                }

                // Chuyển thẳng sang REPAIRING trước đây bỏ qua được bước hãng tàu duyệt báo giá (hồ sơ chưa có
                // báo giá vẫn vào màn Sửa chữa). Chỉ cho khi báo giá đã APPROVED (vd. đưa hồ sơ chờ QC về sửa tiếp).
                if (request.Status == "REPAIRING")
                {
                    var estimateStatus = await _db.Estimates.Where(e => e.DepotJobId == job.Id).Select(e => e.Status).FirstOrDefaultAsync();
                    if (estimateStatus != "APPROVED")
                        throw new ArgumentException("Báo giá chưa được hãng tàu duyệt — không thể chuyển sang Đang sửa chữa.");
                }

                var fromStatus = job.Status;
                job.Status = request.Status;
                _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "STATUS_UPDATED", string.IsNullOrWhiteSpace(actor) ? "Container UI" : actor,
                    $"Đổi trạng thái thủ công {fromStatus} → {request.Status}."));
                await _db.SaveChangesAsync();
                return true;
            }

        /// <summary>Mã nhà xe vãng lai (không có trong danh mục khách hàng) — tên lưu riêng ở GateInTruckingName.</summary>
        public const string WalkInTruckingCode = "VANG_LAI";

        /// <summary>
        /// Chuẩn hoá đơn vị vận tải lúc Gate-In: VANG_LAI bắt buộc tên; mã khác phải là khách hàng ACTIVE và tên lấy
        /// từ danh mục (không tin tên client gửi); trống chỉ được khi không bắt buộc (màn Giám định / cổng khách hàng).
        /// </summary>
        private async Task<(string? Code, string? Name)> ResolveGateInTruckingAsync(CreateDepotJobRequest request)
        {
            var code = request.TruckingCompany?.Trim().ToUpperInvariant();
            if (string.IsNullOrEmpty(code))
            {
                if (request.RequireTrucking)
                    throw new ArgumentException("Chưa chọn đơn vị vận tải / nhà xe.");
                return (null, null);
            }
            if (code == WalkInTruckingCode)
            {
                var name = System.Text.RegularExpressions.Regex.Replace(request.TruckingName ?? string.Empty, @"\s+", " ").Trim();
                if (name.Length == 0)
                    throw new ArgumentException("Chưa nhập tên nhà xe vãng lai.");
                if (name.Length > 200)
                    throw new ArgumentException("Tên nhà xe vãng lai tối đa 200 ký tự.");
                return (WalkInTruckingCode, name);
            }
            var customer = await _db.CustomerCompanies.AsNoTracking().FirstOrDefaultAsync(c => c.Code == code && c.Status == "ACTIVE");
            if (customer == null)
                throw new ArgumentException($"Nhà xe {code} không tồn tại hoặc đã ngưng hoạt động.");
            return (customer.Code, customer.Name);
        }

        /// <summary>Gate-In tạo Job + audit + EIR nhập; container đang hoạt động không được trùng.</summary>
        public async Task<DepotJob> CreateGateInJobAsync(CreateDepotJobRequest request)
        {
            ValidateGateInRequest(request);
            // `isoSize` phải là mã loại (cột Name) của 1 dòng đang áp dụng trong "DM Loại Container (ISO)"
            // — cùng nguồn với các nút chọn trên màn Gate-In, không còn danh sách cứng.
            request.IsoSize = request.IsoSize.Trim().ToUpperInvariant();
            var containerTypeCodes = await _db.MasterCatalogItems
                .Where(x => x.CatalogType == "CONTAINER_TYPE" && x.IsActive && !x.IsDeleted)
                .Select(x => x.Name.ToUpper())
                .ToListAsync();
            if (!containerTypeCodes.Contains(request.IsoSize))
                throw new ArgumentException($"Loại container '{request.IsoSize}' không có (hoặc đang tạm ngưng) trong danh mục DM Loại Container (ISO). Đang áp dụng: {string.Join(", ", containerTypeCodes)}.");
            if (request.IsoSize.Length > 10)
                throw new ArgumentException($"Mã loại container '{request.IsoSize}' dài quá 10 ký tự — sửa lại mã loại trong DM Loại Container (ISO).");
            var containerNo = request.ContainerNo.Trim().ToUpperInvariant();
            var shippingLineCode = request.ShippingLine.Trim().ToUpperInvariant();
            var shippingLine = await _db.ShippingLines.FirstOrDefaultAsync(x => x.Code == shippingLineCode && !x.IsDeleted);
            if (shippingLine == null)
            {
                throw new ArgumentException($"Mã hãng tàu {shippingLineCode} không tồn tại trong danh mục ShippingLine.Code.");
            }

            var duplicate = await _db.DepotJobs.AnyAsync(j => j.ContainerNo == containerNo && !j.IsDeleted && j.Status != "GATE_OUT");
            if (duplicate)
            {
                throw new InvalidOperationException($"Container {containerNo} đã có hồ sơ đang hoạt động trong depot.");
            }

            // Nhân viên tiếp nhận lấy tự động theo phiên đăng nhập (Users.Id) do frontend gửi kèm,
            // không cho phép chọn/nhập tay — tra ngược ra họ tên thật để lưu snapshot cho lịch sử.
            var staff = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.GateInStaffId!.Value && !u.IsDeleted);
            if (staff == null)
            {
                throw new ArgumentException("Không xác định được nhân viên tiếp nhận từ phiên đăng nhập. Vui lòng đăng nhập lại.");
            }

            var (truckingCode, truckingName) = await ResolveGateInTruckingAsync(request);

            var jobNo = $"JOB-{DateTime.UtcNow:yyyy}-{new Random().Next(1000, 9999)}";
            var newJob = new DepotJob
            {
                JobNo = jobNo,
                ContainerNo = containerNo,
                IsoSize = request.IsoSize,
                ShippingLineId = shippingLine.Id,
                TareWeightKg = request.TareWeightKg,
                MaxPayloadKg = request.MaxPayloadKg,
                Status = "SURVEYING",
                GateInDate = DateTime.UtcNow,
                // Chưa có vị trí bãi: sau Gate-In container đứng ở khu giám định (và khu vệ sinh nếu CL), vị trí
                // chỉ ghi khi xe nâng hạ bãi (CompleteForkliftMoveAsync).
                BlockCode = string.Empty,
                Bay = 0,
                Row = 0,
                Tier = 0,
                GateInTruckPlate = request.TruckPlate.Trim().ToUpperInvariant(),
                GateInDriverName = request.DriverName.Trim(),
                GateInDriverPhone = request.DriverPhone.Trim(),
                GateInTrailerPlate = string.IsNullOrWhiteSpace(request.TrailerPlate) ? null : request.TrailerPlate.Trim().ToUpperInvariant(),
                GateInSealNo = string.IsNullOrWhiteSpace(request.SealNo) ? null : request.SealNo.Trim(),
                GateInDriverLicense = string.IsNullOrWhiteSpace(request.DriverLicense) ? null : request.DriverLicense.Trim(),
                GateInCustomsSealNo = string.IsNullOrWhiteSpace(request.CustomsSealNo) ? null : request.CustomsSealNo.Trim(),
                GateInBookingNo = string.IsNullOrWhiteSpace(request.BookingNo) ? null : request.BookingNo.Trim(),
                GateInTruckingCompany = truckingCode,
                GateInTruckingName = truckingName,
                GateInRemarks = string.IsNullOrWhiteSpace(request.Remarks) ? null : request.Remarks.Trim(),
                GateInStaffId = staff.Id,
                GateInStaffName = staff.FullName,
                CreatedBy = staff.FullName
            };
            newJob.GateInEirNo = $"EIR-IN-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";

            _db.DepotJobs.Add(newJob);
            // DepotJob không còn navigation AuditLogs — lưu job trước để có Id thật rồi mới tạo audit log
            // qua DbSet (không còn cơ chế graph-fixup tự nối FK cho 2 entity mới cùng lúc).
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("UX_depot_jobs_ContainerNo_Active") == true)
            {
                // Request Gate-In khác cùng container vừa lưu trước (lọt qua kiểm tra AnyAsync ở trên) — unique index chặn.
                _db.Entry(newJob).State = EntityState.Detached;
                throw new InvalidOperationException($"Container {containerNo} đã có hồ sơ đang hoạt động trong depot.");
            }
            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = newJob.Id,
                JobNo = newJob.JobNo,
                Action = "GATE_IN",
                User = staff.FullName,
                Timestamp = DateTime.UtcNow,
                Details = $"Tiếp nhận Container {newJob.ContainerNo} ({newJob.IsoSize}) Hãng tàu: {shippingLineCode}"
            });
            await _db.SaveChangesAsync();
            return newJob;
        }

        // Checklist 11 khu vực (danh mục SURVEY_CHECKLIST) phải khớp danh mục và khớp hư hỏng thật — áp cho cả lưu
        // nháp lẫn nộp (depot-fullstack-survey-checklist-sync). Mã vị trí hư hỏng phải thuộc DAMAGE_LOCATION; khu vực
        // của vị trí lấy từ khoá "checklistZone" trong JsonData. Số lỗi + tên khu vực do server điền lại, không tin trình duyệt.
        private async Task ValidateAndNormalizeSurveyChecklistAsync(SurveyRecordViewModel surveyVm)
        {
            var catalogs = await _db.MasterCatalogItems.AsNoTracking()
                .Where(x => !x.IsDeleted && (x.CatalogType == "SURVEY_CHECKLIST" || x.CatalogType == "DAMAGE_LOCATION"))
                .ToListAsync();
            var zones = catalogs.Where(x => x.CatalogType == "SURVEY_CHECKLIST" && x.IsActive).OrderBy(x => x.SortOrder).ToList();
            var zoneOfLocation = catalogs.Where(x => x.CatalogType == "DAMAGE_LOCATION")
                .GroupBy(x => x.Code).ToDictionary(g => g.Key, g => ReadChecklistZone(g.First().JsonData));

            var unknownLocations = surveyVm.Damages.Select(d => d.LocationCode).Where(c => !zoneOfLocation.ContainsKey(c ?? "")).Distinct().ToList();
            if (unknownLocations.Count > 0)
                throw new ArgumentException($"Mã vị trí hư hỏng không có trong danh mục Vị trí: {string.Join(", ", unknownLocations.Select(c => $"'{c}'"))}. Chọn lại vị trí trong danh mục.");

            var sent = surveyVm.Checklist.Select(c => c.ZoneKey ?? "").ToList();
            var duplicated = sent.GroupBy(k => k).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            var unknownZones = sent.Where(k => zones.All(z => z.Code != k)).Distinct().ToList();
            var missingZones = zones.Where(z => !sent.Contains(z.Code)).Select(ZoneLabel).ToList();
            if (duplicated.Count > 0 || unknownZones.Count > 0 || missingZones.Count > 0)
            {
                var parts = new List<string>();
                if (missingZones.Count > 0) parts.Add($"thiếu khu vực {string.Join(", ", missingZones)}");
                if (unknownZones.Count > 0) parts.Add($"mã khu vực không có trong danh mục: {string.Join(", ", unknownZones.Select(k => $"'{k}'"))}");
                if (duplicated.Count > 0) parts.Add($"trùng khu vực: {string.Join(", ", duplicated)}");
                throw new ArgumentException($"Checklist khu vực không khớp danh mục ({string.Join("; ", parts)}).");
            }
            var badStatus = surveyVm.Checklist.Where(c => c.Status is not ("PASS" or "FAIL" or "NA")).ToList();
            if (badStatus.Count > 0)
                throw new ArgumentException($"Trạng thái khu vực chỉ nhận PASS, FAIL hoặc NA (sai: {string.Join(", ", badStatus.Select(c => $"{c.ZoneKey}='{c.Status}'"))}).");

            foreach (var item in surveyVm.Checklist)
            {
                var zone = zones.First(z => z.Code == item.ZoneKey);
                var count = surveyVm.Damages.Count(d => zoneOfLocation[d.LocationCode] == item.ZoneKey);
                if (count > 0 && item.Status != "FAIL")
                    throw new ArgumentException($"Khu vực {ZoneLabel(zone)} đang có {count} hư hỏng, phải là Không Đạt.");
                item.DamageCount = count;
                item.ZoneName = ZoneLabel(zone);
            }
        }

        private static string ZoneLabel(MasterCatalogItem zone) => string.IsNullOrWhiteSpace(zone.NameVi) ? zone.Name : zone.NameVi;

        private static string? ReadChecklistZone(string? jsonData)
        {
            if (string.IsNullOrWhiteSpace(jsonData)) return null;
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(jsonData);
                return doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object
                    && doc.RootElement.TryGetProperty("checklistZone", out var v) && v.ValueKind == System.Text.Json.JsonValueKind.String
                    && !string.IsNullOrWhiteSpace(v.GetString()) ? v.GetString() : null;
            }
            catch (System.Text.Json.JsonException) { return null; }
        }

        /// <summary>Survey ghi hư hỏng và chuyển sang ESTIMATING; không có hư hỏng thì chuyển READY_FOR_OUT.</summary>
        public async Task<bool> SubmitSurveyAsync(long jobId, SurveyRecordViewModel surveyVm)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null) return false;
            // Mỗi lỗi báo đúng lý do — trước đây mọi trường hợp đều thành "Mã công việc không tồn tại" (BUG-023).
            if (job.Status is "GATE_OUT" or "READY_FOR_OUT")
                throw new ArgumentException($"Container đang ở trạng thái {job.Status}, không giám định lại được.");
            var existingSurvey = await _db.Surveys.FirstOrDefaultAsync(s => s.DepotJobId == jobId);
            if (surveyVm.ConditionRating is not ("A" or "B" or "C" or "D"))
                throw new ArgumentException($"Hạng container '{surveyVm.ConditionRating}' không hợp lệ — chỉ nhận A, B, C hoặc D.");
            if (surveyVm.Damages.Any(d => d.Quantity <= 0 || d.LaborHours < 0 || d.LaborRate < 0 || d.MaterialCost < 0))
                throw new ArgumentException("Hư hỏng có số lượng phải lớn hơn 0; giờ công, đơn giá công và chi phí vật tư không được âm.");
            // Quy trình (yêu cầu 2026-10-07): hoàn tất giám định thì MỌI container đều chuyển Tổ Vệ Sinh — nên phiếu
            // nộp thật phải có ít nhất 1 dịch vụ vệ sinh (lệnh vệ sinh rỗng không bàn giao Khai thác được).
            if (!surveyVm.IsDraft && surveyVm.CleaningItems.Count == 0)
                throw new ArgumentException("Chọn ít nhất 01 dịch vụ vệ sinh ở tab Vệ Sinh — mọi container sau giám định đều chuyển Tổ Vệ Sinh.");
            await ValidateAndNormalizeSurveyChecklistAsync(surveyVm);
            // Dịch vụ vệ sinh: đơn giá do server tra theo Biểu Phí Vệ Sinh + loại container của hồ sơ (depot-fullstack-cleaning-tariff-pricing).
            await CleaningTariffPricing.ApplyToSurveyAsync(_db, job.IsoSize, surveyVm.CleaningItems);

            // Giám định viên lấy tự động theo tài khoản đang đăng nhập (Users.Id), không cho nhập tay.
            // Bắt buộc phải resolve được thật trong bảng Users, giống nguyên tắc đã áp dụng ở Gate-In.
            if (surveyVm.SurveyorStaffId is null || surveyVm.SurveyorStaffId <= 0)
                throw new ArgumentException("Thiếu giám định viên (phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại).");
            var surveyor = await _db.Users.FirstOrDefaultAsync(u => u.Id == surveyVm.SurveyorStaffId.Value && !u.IsDeleted);
            if (surveyor == null)
                throw new ArgumentException("Không xác định được giám định viên từ phiên đăng nhập. Vui lòng đăng nhập lại.");

            // Survey mới cần lưu riêng 1 bước để lấy Id thật trước khi thêm bảng con (không còn navigation
            // để EF tự nối FK) — bọc cả khối trong 1 transaction tường minh để vẫn giữ tính atomic như khi
            // còn dùng navigation (nếu bước sau lỗi, Survey vừa lưu tạm cũng bị rollback theo).
            await using var tx = await _db.Database.BeginTransactionAsync();

            // Cả 2 thao tác Lưu Nháp và Hoàn Tất đều gọi chung endpoint này, nên phải cập nhật
            // lại đúng bản ghi Survey đã có thay vì tạo mới (tránh trùng DepotJobId).
            var isNewSurvey = existingSurvey == null;
            var survey = existingSurvey ?? new Survey
            {
                DepotJobId = jobId,
                JobNo = job.JobNo
            };
            survey.SurveyorId = surveyor.Id.ToString();
            survey.JobNo = job.JobNo;
            if (isNewSurvey)
            {
                survey.CreatedBy = surveyor.FullName;
            }
            else
            {
                survey.LastModifiedAt = DateTime.UtcNow;
                survey.LastModifiedBy = surveyor.FullName;
            }
            if (!isNewSurvey)
            {
                // Dùng ExecuteDelete để xoá thẳng dưới SQL, không nạp các dòng cũ vào ChangeTracker —
                // tránh xung đột optimistic-concurrency khi lưu nháp nhiều lần liên tiếp. Áp dụng chung
                // cho cả 3 bảng con Cleaning/Checklist/Photo giống nguyên tắc đã dùng cho Damages.
                await _db.Set<DamageItem>().Where(d => d.SurveyId == survey.Id).ExecuteDeleteAsync();
                await _db.Set<SurveyCleaningItem>().Where(c => c.SurveyId == survey.Id).ExecuteDeleteAsync();
                await _db.Set<SurveyChecklistItem>().Where(c => c.SurveyId == survey.Id).ExecuteDeleteAsync();
                await _db.Set<SurveyPhotoItem>().Where(p => p.SurveyId == survey.Id).ExecuteDeleteAsync();
            }

            // Dùng đúng họ tên thật lấy từ Users, bỏ qua ô SurveyorName tự nhập trên UI (nếu còn gửi lên).
            survey.SurveyorName = surveyor.FullName;
            survey.ConditionRating = surveyVm.ConditionRating;
            survey.SurveyDate = DateTime.UtcNow;
            survey.OverallNotes = surveyVm.Notes;
            survey.CleaningMethod = surveyVm.CleaningMethod;
            survey.CleaningRemarks = surveyVm.CleaningRemarks;
            survey.CleaningReason = surveyVm.CleaningReason.Count > 0 ? string.Join(",", surveyVm.CleaningReason) : null;

            // SurveyNo là business key hiển thị/in ấn, backend tự sinh 1 lần duy nhất lúc tạo mới —
            // không nhận số phiếu client tự sinh (tránh trùng/giả mạo), và không sinh lại khi lưu nháp/sửa.
            if (isNewSurvey)
            {
                survey.SurveyNo = $"SRV-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";
            }
            survey.Owner = surveyVm.Owner;
            survey.ContainerTypeName = surveyVm.ContainerTypeName;
            survey.ManufactureMonthYear = surveyVm.ManufactureMonthYear;
            survey.MaxGrossWeightKg = surveyVm.MaxGrossWeightKg;
            survey.Material = surveyVm.Material;
            survey.FloorType = surveyVm.FloorType;
            survey.CscPlateNo = surveyVm.CscPlateNo;
            survey.Standard = surveyVm.Standard;
            survey.StandardNotes = surveyVm.StandardNotes;
            survey.QualityGrade = surveyVm.QualityGrade;
            survey.ActionRequired = surveyVm.ActionRequired;
            survey.Shift = surveyVm.Shift;
            survey.YardLocationNote = surveyVm.YardLocationNote;
            survey.CargoStatus = surveyVm.CargoStatus;
            survey.ReeferBrand = surveyVm.ReeferBrand;
            survey.ReeferModel = surveyVm.ReeferModel;
            survey.ReeferSetTemperatureC = surveyVm.ReeferSetTemperatureC;
            survey.PtiStatus = surveyVm.PtiStatus;
            survey.CompressorHours = surveyVm.CompressorHours;
            survey.HumidityPercent = surveyVm.HumidityPercent;
            survey.VentilationCmh = surveyVm.VentilationCmh;

            // Survey không còn navigation collection (Damages/CleaningItems/ChecklistItems/Photos) nên phải
            // lưu Survey trước để có Id thật rồi mới thêm bảng con qua DbSet — mất cơ chế graph-fixup tự
            // nối FK cho Parent+Children mới cùng lúc (xem docs/backend-progress/00-quy-tac-backend.md).
            if (isNewSurvey)
            {
                _db.Surveys.Add(survey);
                await _db.SaveChangesAsync();
            }

            foreach (var d in surveyVm.Damages)
            {
                var laborTotal = d.LaborHours * d.LaborRate;
                var itemTotal = laborTotal + d.MaterialCost;

                _db.Set<DamageItem>().Add(new DamageItem
                {
                    SurveyId = survey.Id,
                    Component = d.Component,
                    LocationCode = d.LocationCode,
                    DamageCode = d.DamageCode,
                    DamageNameVi = d.DamageCode,
                    RepairCode = d.RepairCode,
                    RepairNameVi = d.RepairCode,
                    Quantity = d.Quantity,
                    Unit = d.Unit,
                    LaborHours = d.LaborHours,
                    LaborRate = d.LaborRate,
                    MaterialCost = d.MaterialCost,
                    TotalCost = itemTotal,
                    Severity = string.IsNullOrWhiteSpace(d.Severity) ? "LIGHT" : d.Severity,
                    Notes = d.Notes,
                    LengthMm = d.LengthMm,
                    WidthMm = d.WidthMm,
                    PhotoUrl = d.PhotoUrl
                });
            }

            foreach (var c in surveyVm.CleaningItems)
            {
                _db.Set<SurveyCleaningItem>().Add(new SurveyCleaningItem
                {
                    SurveyId = survey.Id,
                    CleaningCode = c.CleaningCode,
                    CleaningName = c.CleaningName,
                    Category = c.Category,
                    ChemicalRequired = c.ChemicalRequired,
                    ChemicalName = c.ChemicalName,
                    Quantity = c.Quantity,
                    UnitPrice = c.UnitPrice,
                    TotalPrice = c.TotalPrice,
                    ResponsibleParty = string.IsNullOrWhiteSpace(c.ResponsibleParty) ? "U" : c.ResponsibleParty,
                    Status = string.IsNullOrWhiteSpace(c.Status) ? "REQUIRED" : c.Status,
                    Notes = c.Notes,
                    WasherName = c.WasherName
                });
            }

            foreach (var chk in surveyVm.Checklist)
            {
                _db.Set<SurveyChecklistItem>().Add(new SurveyChecklistItem
                {
                    SurveyId = survey.Id,
                    ZoneKey = chk.ZoneKey,
                    ZoneName = chk.ZoneName,
                    Status = string.IsNullOrWhiteSpace(chk.Status) ? "PASS" : chk.Status,
                    Notes = chk.Notes,
                    DamageCount = chk.DamageCount
                });
            }

            foreach (var p in surveyVm.Photos)
            {
                _db.Set<SurveyPhotoItem>().Add(new SurveyPhotoItem
                {
                    SurveyId = survey.Id,
                    Url = p.Url,
                    Type = string.IsNullOrWhiteSpace(p.Type) ? "OVERVIEW" : p.Type,
                    Caption = p.Caption,
                    SurveyorName = p.SurveyorName,
                    // Npgsql chỉ chấp nhận DateTimeKind.Utc cho cột timestamptz — DateTime.TryParse trả về
                    // Kind=Unspecified nên phải ép rõ ràng, nếu không SaveChangesAsync ném ArgumentException.
                    UploadedAt = DateTime.TryParse(p.UploadedAt, out var uploadedAt) ? DateTime.SpecifyKind(uploadedAt, DateTimeKind.Utc) : DateTime.UtcNow,
                    FileSizeKb = p.FileSizeKb
                });
            }

            // "Lưu Tạm" trước đây gọi CHUNG endpoint này với "Hoàn Tất" nên job luôn bị chuyển khỏi
            // SURVEYING dù chỉ lưu nháp — mà mọi tab hàng đợi (Chờ/Đang/Hoàn Tất) chỉ fetch container
            // status=SURVEYING, nên bấm Lưu Tạm 1 lần là job biến mất khỏi toàn bộ danh sách sau khi F5.
            // Giờ chỉ chuyển trạng thái + giải phóng khóa "nhận giám định" khi nộp phiếu THẬT (IsDraft=false).
            if (!surveyVm.IsDraft)
            {
                // Trước đây chỉ xét Damages.Count, bỏ qua hẳn ConditionRating — container chấm CL (cần vệ
                // sinh, luôn 0 damages vì CL và DM là 2 trục nghiệp vụ khác nhau) bị gắn thẳng
                // READY_FOR_OUT, cho phép Gate-Out ngay mà chưa hề qua bước vệ sinh nào. Theo đúng luồng đã
                // thiết kế (WorkflowController: GRADING → CL chuyển CLEANING), cấp B (CL) phải luôn dừng ở
                // trạng thái CLEANING trước, không được set READY_FOR_OUT/ESTIMATING dựa theo Damages nữa.
                // Mọi container sau giám định đều qua vệ sinh trước (Gate-In → Giám định → Vệ sinh → Khai thác →
                // Thanh toán → Báo giá). Container có hư hỏng được chuyển ESTIMATING khi Tổ Vệ Sinh bàn giao
                // (CleaningService.HandoverAsync), không còn nhảy thẳng sang ESTIMATING/READY_FOR_OUT ở đây.
                job.Status = "CLEANING";
                job.SurveyClaimedByStaffId = null;
                job.SurveyClaimedByName = null;
                job.SurveyClaimedAt = null;

                // CleaningRecord.cs ghi rõ trong doc comment "phát sinh từ e-EIR có kết luận CL" nhưng
                // trước đây KHÔNG nơi nào tự tạo cả — Tổ Vệ Sinh phải tự tra container rồi nhập lại từ đầu
                // toàn bộ lý do/dịch vụ/giá mà surveyor đã chọn sẵn ở tab Vệ Sinh. Giờ tự sinh lệnh vệ sinh
                // ngay khi Hoàn Tất Giám Định, tái dùng đúng cleaningItems đã nhập, để module Cleaning thấy
                // container này ngay mà không cần nhập lại. Chặn tạo trùng nếu job đã có sẵn 1 lệnh vệ sinh
                // còn hoạt động (chưa HANDOVER_TO_OPERATION) — tránh nộp lại phiếu nhiều lần (VD sửa remarks
                // rồi Hoàn Tất lại) sinh ra nhiều lệnh vệ sinh trùng cho cùng 1 job.
                //
                // Trước đây điều kiện là `ConditionRating == "B"` (chỉ cấp CL thuần) — nhưng container vừa
                // hư hỏng (DM) vừa cần vệ sinh (rất phổ biến thực tế) bị `handleAddCleaningItem` phía
                // frontend cố tình giữ condition = 'DM' (ưu tiên định tuyến sang Sửa Chữa, xem comment ở
                // SurveyDetailForm.tsx) nên nhánh này không bao giờ chạy: toàn bộ dịch vụ vệ sinh + chi phí
                // surveyor đã chọn chỉ nằm im trong SurveyCleaningItem, KHÔNG BAO GIỜ sinh lệnh vệ sinh thật
                // — Tổ Vệ Sinh không hề biết container này tồn tại, và CompleteQcInspectionAsync sau đó đưa
                // thẳng job từ QC Passed sang READY_FOR_OUT, bỏ qua hẳn khâu vệ sinh. Giờ xét theo việc
                // surveyor CÓ chọn dịch vụ vệ sinh hay không, độc lập với ConditionRating — nếu vẫn còn
                // damage thì job.Status phía trên vẫn ưu tiên đi ESTIMATING/REPAIRING trước như cũ,
                // CompleteQcInspectionAsync sẽ chuyển tiếp sang CLEANING thay vì READY_FOR_OUT khi QC đạt.
                if (surveyVm.CleaningItems.Count > 0)
                {
                    var hasActiveCleaningRecord = await _db.CleaningRecords
                        .AnyAsync(c => c.JobNo == job.JobNo && c.Status != "HANDOVER_TO_OPERATION");
                    if (!hasActiveCleaningRecord)
                    {
                        var cleaningCode = "CL-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999);
                        var cleaningWorkItems = surveyVm.CleaningItems.Select(c => new CleaningWorkItem
                        {
                            CleaningRecordCode = cleaningCode,
                            CleaningCode = c.CleaningCode,
                            CleaningName = c.CleaningName,
                            ChemicalRequired = c.ChemicalRequired,
                            ChemicalName = c.ChemicalName,
                            UnitPrice = c.UnitPrice,
                            TotalPrice = c.TotalPrice,
                            ResponsibleParty = string.IsNullOrWhiteSpace(c.ResponsibleParty) ? "U" : c.ResponsibleParty,
                            Notes = c.Notes,
                            IsCompleted = false
                        }).ToList();

                        // Tổ Vệ Sinh cần thấy đủ thông tin container + lý do vệ sinh ngay khi nhận việc, không
                        // phải tự tra lại hồ sơ giám định. Trước đây bỏ trống IsoCode/TypeName (hiện "40HC "
                        // cụt lủn không có tên loại trên UI Cleaning) và bỏ hẳn CleaningReason (lý do surveyor
                        // chọn — bụi bẩn/dầu mỡ/mùi...) vì CleaningRecord không có cột riêng cho lý do.
                        // Mã ISO + tên loại tra từ "DM Loại Container (ISO)" theo mã loại của job; chỉ đoán
                        // theo chuỗi IsoSize khi loại đó không còn trong danh mục (job cũ).
                        var jobSize = (job.IsoSize ?? string.Empty).ToUpper();
                        var containerType = await _db.MasterCatalogItems
                            .Where(x => x.CatalogType == "CONTAINER_TYPE" && !x.IsDeleted && x.Name.ToUpper() == jobSize)
                            .Select(x => new { x.Code, x.Name, x.NameVi })
                            .FirstOrDefaultAsync();
                        var isReefer = job.IsoSize?.Contains("RF") == true || job.IsoSize?.Contains("RH") == true;
                        var reasonPrefix = surveyVm.CleaningReason.Count > 0
                            ? $"Lý do cần vệ sinh (từ giám định): {string.Join(", ", surveyVm.CleaningReason)}."
                            : null;
                        var combinedNotes = string.Join(" ", new[] { reasonPrefix, surveyVm.CleaningRemarks }
                            .Where(s => !string.IsNullOrWhiteSpace(s)));
                        // Ảnh toàn cảnh surveyor chụp lúc giám định (bắt buộc phải có, xem validateForm phía
                        // frontend) dùng luôn làm ảnh "trước vệ sinh" thật — trước đây bỏ trống, Tổ Vệ Sinh
                        // không thấy hiện trạng container lúc mới nhận, phải tự chạy sang hỏi lại Survey.
                        var overviewPhotoUrl = surveyVm.Photos.FirstOrDefault(p => p.Type == "OVERVIEW")?.Url;

                        _db.CleaningRecords.Add(new CleaningRecord
                        {
                            Code = cleaningCode,
                            JobNo = job.JobNo,
                            ContainerNo = job.ContainerNo,
                            IsoCode = containerType?.Code ?? (job.IsoSize?.StartsWith("20") == true ? (isReefer ? "22R1" : "22G1") : (isReefer ? "45R1" : "45G1")),
                            SizeType = job.IsoSize,
                            TypeName = containerType?.NameVi ?? containerType?.Name ?? (isReefer ? "Reefer" : "Dry High Cube"),
                            ShippingLine = await _db.ShippingLines.Where(s => s.Id == job.ShippingLineId).Select(s => s.Code).FirstOrDefaultAsync(),
                            // Trước đây bỏ trống — Tổ Vệ Sinh không tra được số e-EIR gốc của lô hàng dù
                            // job đã có sẵn từ lúc Gate-In, khiến UI Cleaning luôn hiện "Số e-EIR:" trống.
                            EeirNo = job.GateInEirNo,
                            Status = "PENDING_CLEANING",
                            CleaningNotes = string.IsNullOrWhiteSpace(combinedNotes) ? null : combinedNotes,
                            BeforeCleaningPhotoUrl = overviewPhotoUrl,
                            BeforePhotoTimestamp = overviewPhotoUrl is not null ? DateTime.UtcNow : null,
                            TotalCostVnd = cleaningWorkItems.Sum(x => x.TotalPrice),
                            Items = cleaningWorkItems
                        });
                    }
                }
            }

            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                Action = surveyVm.IsDraft ? "SURVEY_DRAFT_SAVED" : "SURVEY_SUBMITTED",
                User = survey.SurveyorName,
                Timestamp = DateTime.UtcNow,
                Details = surveyVm.IsDraft
                    ? $"Lưu nháp tiến độ giám định (cấp tạm {surveyVm.ConditionRating}, {surveyVm.Damages.Count} hư hỏng ghi nhận)."
                    : $"Hoàn tất khảo sát giám định cấp {surveyVm.ConditionRating}. Ghi nhận {surveyVm.Damages.Count} hư hỏng."
            });

            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return true;
        }



        /// <summary>
        /// Giám định viên "nhận" một container đang chờ giám định để khóa lại, không cho người khác nhận trùng.
        /// Khóa tự động hết hạn sau <see cref="ClaimLockTimeout"/> nếu người giữ khóa bỏ ngang không nộp phiếu,
        /// tránh 1 hồ sơ bị kẹt vĩnh viễn vì quên bấm "Quay lại".
        /// </summary>
        private static readonly TimeSpan ClaimLockTimeout = TimeSpan.FromMinutes(30);

        public async Task<DepotJob> ClaimSurveyAsync(long jobId, long staffId)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null)
                throw new ArgumentException("Không tìm thấy hồ sơ container.");
            if (job.Status != "SURVEYING")
                throw new ArgumentException("Container không còn ở trạng thái chờ giám định (có thể đã được xử lý xong).");

            var staff = await _db.Users.FirstOrDefaultAsync(u => u.Id == staffId && !u.IsDeleted);
            if (staff == null)
                throw new ArgumentException("Không xác định được giám định viên từ phiên đăng nhập. Vui lòng đăng nhập lại.");

            // Ghi có điều kiện ngay trong 1 câu UPDATE (WHERE ở tầng SQL) thay vì đọc-rồi-ghi — trước đây
            // đọc SurveyClaimedByStaffId ở bộ nhớ rồi mới gán, 2 request "Nhận giám định" gần như đồng
            // thời đều đọc thấy "chưa khoá" trước khi cái nào SaveChangesAsync, khiến người ghi sau âm
            // thầm đè khoá người ghi trước (double-claim, không exception, không cảnh báo). Đẩy điều
            // kiện tranh chấp xuống DB để chỉ 1 request khớp WHERE tại đúng 1 thời điểm.
            var lockCutoff = DateTime.UtcNow - ClaimLockTimeout;
            var claimedRows = await _db.DepotJobs
                .Where(j => j.Id == jobId
                    && (j.SurveyClaimedByStaffId == null
                        || j.SurveyClaimedByStaffId == staffId
                        || j.SurveyClaimedAt == null
                        || j.SurveyClaimedAt < lockCutoff))
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(j => j.SurveyClaimedByStaffId, staff.Id)
                    .SetProperty(j => j.SurveyClaimedByName, staff.FullName)
                    .SetProperty(j => j.SurveyClaimedAt, DateTime.UtcNow));

            if (claimedRows == 0)
            {
                // Đọc lại để báo đúng tên người đang giữ khoá — có thể đã đổi giữa lúc kiểm tra ở trên
                // và lúc UPDATE chạy.
                var currentHolder = await _db.DepotJobs.AsNoTracking().Where(j => j.Id == jobId).Select(j => j.SurveyClaimedByName).FirstOrDefaultAsync();
                throw new InvalidOperationException($"Container đang được giám định bởi {currentHolder}. Vui lòng chọn container khác.");
            }

            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "SURVEY_CLAIMED", staff.FullName, $"Nhận giám định container {job.ContainerNo}."));
            await _db.SaveChangesAsync();

            // job là entity đã tracked từ lần đọc đầu bài hàm — ExecuteUpdateAsync ghi thẳng xuống DB,
            // không tự đồng bộ lại vào entity đang giữ trong bộ nhớ, nên gán lại thủ công để trả về
            // đúng state thật cho caller.
            job.SurveyClaimedByStaffId = staff.Id;
            job.SurveyClaimedByName = staff.FullName;
            job.SurveyClaimedAt = DateTime.UtcNow;
            return job;
        }

        /// <summary>Giải phóng khóa "nhận giám định" — chỉ chính người đang giữ khóa mới được tự bỏ nhận.</summary>
        public async Task<bool> ReleaseSurveyClaimAsync(long jobId, long staffId)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.SurveyClaimedByStaffId != staffId) return false;

            job.SurveyClaimedByStaffId = null;
            job.SurveyClaimedByName = null;
            job.SurveyClaimedAt = null;
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Estimate chỉ được lập sau Survey, tự tính subtotal/tax khi request không gửi đủ tổng tiền.</summary>
        /// <summary>Lỗi nghiệp vụ có lý do rõ ràng khi không được lập báo giá (controller trả 400 kèm thông điệp).</summary>
        public sealed class EstimateNotAllowedException : Exception
        {
            public EstimateNotAllowedException(string message) : base(message) { }
        }

        public async Task<bool> CreateOrUpdateEstimateAsync(long jobId, EstimateViewModel estimateVm)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            var hasSurvey = job != null && await _db.Surveys.AnyAsync(s => s.DepotJobId == jobId);
            var existingEstimate = job == null ? null : await _db.Estimates.FirstOrDefaultAsync(e => e.DepotJobId == jobId);
            if (job == null || !hasSurvey || job.Status != "ESTIMATING") return false;
            if (estimateVm.Items.Count == 0 || estimateVm.Items.Any(i => i.Quantity <= 0 || i.UnitPrice < 0 || i.ManHoursPerPiece < 0)) return false;
            if (estimateVm.LaborRate < 0) return false;
            if (new[] { estimateVm.PreparationHours, estimateVm.OrdinaryHours, estimateVm.Ot1Hours, estimateVm.Ot2Hours, estimateVm.Ot3Hours }.Any(h => h < 0))
                throw new EstimateNotAllowedException("Giờ chuẩn bị / giờ thường / OT không được âm.");
            if (existingEstimate?.Status == "APPROVED")
                throw new EstimateNotAllowedException($"Báo giá {existingEstimate.EstimateNo} đã được hãng tàu duyệt — không sửa được nữa.");
            // Chỉ lập báo giá sửa chữa cho container đã thu tiền phiếu dịch vụ (yêu cầu nghiệp vụ 2026-10-04).
            var paidOrder = await _db.ServiceOrders.AnyAsync(so => so.DepotJobId == jobId && so.Status != "CANCELLED" && so.PaymentStatus == "PAID");
            if (!paidOrder)
                throw new EstimateNotAllowedException($"Container {job.ContainerNo} chưa thu tiền phiếu dịch vụ — thu tiền ở màn Thanh Toán trước khi lập báo giá.");

            // Tổng tiền luôn tính lại ở server từ hạng mục — trước đây lưu nguyên GrandTotal client gửi (BUG-008),
            // gửi 999đ cho báo giá 440.000đ vẫn được lưu và chuyển hãng tàu duyệt. TotalLaborCost/TotalMaterialCost
            // do EstimatePage gửi là phần chia nhỏ (giờ công / vật tư) CỦA CHÍNH các hạng mục, không cộng thêm vào tổng.
            // Cách tính theo Maersk AEMS: mỗi dòng = PCS × (giờ công/PC, vật tư/PC). Tiền công = tổng giờ công × đơn giá
            // giờ; vật tư = Σ PCS × vật tư/PC; trước thuế = công + vật tư; VAT theo thuế suất dòng. Tính hoàn toàn ở server.
            // Tổng giờ công AEMS = Σ PCS × giờ công/PC của các dòng + giờ chuẩn bị (Preparation Time).
            var totalManHours = estimateVm.Items.Sum(i => i.Quantity * i.ManHoursPerPiece) + estimateVm.PreparationHours;
            var laborCost = Math.Round(totalManHours * estimateVm.LaborRate, 0, MidpointRounding.AwayFromZero);
            var materialCost = estimateVm.Items.Sum(i => i.Quantity * i.UnitPrice);
            var calculatedSubtotal = laborCost + materialCost;
            var vatPercent = estimateVm.Items.Max(i => i.VatPercent);
            if (vatPercent < 0 || vatPercent > 100) return false;
            var tax = Math.Round(calculatedSubtotal * vatPercent / 100m, 0, MidpointRounding.AwayFromZero);
            var grandTotal = calculatedSubtotal + tax;

            var isNewEstimate = existingEstimate == null;
            var oldTotal = existingEstimate?.GrandTotal ?? 0;
            var oldItemCount = isNewEstimate ? 0 : await _db.Set<EstimateItem>().CountAsync(i => i.EstimateId == existingEstimate!.Id);
            var estimate = existingEstimate ?? new Estimate
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                EstimateNo = string.IsNullOrWhiteSpace(estimateVm.EstimateNo) ? $"EST-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(100, 999)}" : estimateVm.EstimateNo,
            };

            estimate.TotalLaborCost = laborCost;
            estimate.TotalMaterialCost = materialCost;
            estimate.TotalTax = tax;
            estimate.GrandTotal = grandTotal;
            estimate.Currency = estimateVm.Currency;
            estimate.Notes = string.IsNullOrWhiteSpace(estimateVm.Notes) ? null : estimateVm.Notes.Trim();
            estimate.LaborRate = estimateVm.LaborRate;
            estimate.TotalManHours = totalManHours;
            estimate.RepairMode = string.IsNullOrWhiteSpace(estimateVm.RepairMode) ? null : estimateVm.RepairMode.Trim();
            estimate.Cause = string.IsNullOrWhiteSpace(estimateVm.Cause) ? null : estimateVm.Cause.Trim();
            estimate.ShopCode = string.IsNullOrWhiteSpace(estimateVm.ShopCode) ? null : estimateVm.ShopCode.Trim();
            estimate.VendorRefNo = string.IsNullOrWhiteSpace(estimateVm.VendorRefNo) ? null : estimateVm.VendorRefNo.Trim();
            estimate.PreparationHours = estimateVm.PreparationHours;
            estimate.OrdinaryHours = estimateVm.OrdinaryHours;
            estimate.Ot1Hours = estimateVm.Ot1Hours;
            estimate.Ot2Hours = estimateVm.Ot2Hours;
            estimate.Ot3Hours = estimateVm.Ot3Hours;
            estimate.SurveyReference = string.IsNullOrWhiteSpace(estimateVm.SurveyReference) ? null : estimateVm.SurveyReference.Trim();
            var photoUrls = (estimateVm.InspectionPhotos ?? new List<string>()).Where(u => !string.IsNullOrWhiteSpace(u)).Select(u => u.Trim()).Distinct().ToList();
            estimate.InspectionPhotoUrlsJson = photoUrls.Count == 0 ? null : System.Text.Json.JsonSerializer.Serialize(photoUrls);
            estimate.Status = "PENDING_APPROVAL";
            estimate.ConfirmedAt = null;
            estimate.ConfirmedBy = null;
            // Sửa chỉ hạng mục (tổng không đổi) vẫn phải ghi nhận là bản mới — màn Báo giá dựa vào đây để biết bản này đã gửi hãng tàu chưa.
            if (!isNewEstimate) estimate.LastModifiedAt = DateTime.UtcNow;

            // Estimate không còn navigation Items — Estimate mới phải lưu riêng 1 bước để có Id thật trước
            // khi thêm EstimateItem qua DbSet (cùng nguyên tắc đã áp dụng cho Survey/DamageItem).
            await using var tx = await _db.Database.BeginTransactionAsync();
            if (isNewEstimate)
            {
                _db.Estimates.Add(estimate);
                await _db.SaveChangesAsync();
            }
            else
            {
                await _db.Set<EstimateItem>().Where(i => i.EstimateId == estimate.Id).ExecuteDeleteAsync();
            }
            foreach (var item in estimateVm.Items)
            {
                _db.Set<EstimateItem>().Add(new EstimateItem
                {
                    EstimateId = estimate.Id,
                    ItemDescription = item.ItemDescription,
                    LocationCode = item.LocationCode, LocationName = item.LocationName,
                    DamageCode = item.DamageCode, DamageName = item.DamageName,
                    RepairCode = item.RepairCode, RepairMethod = item.RepairMethod,
                    Unit = item.Unit, VatPercent = item.VatPercent,
                    Tpi = string.IsNullOrWhiteSpace(item.Tpi) ? null : item.Tpi.Trim().ToUpperInvariant(),
                    ManHoursPerPiece = item.ManHoursPerPiece,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    // Item total theo AEMS = PCS × vật tư/PC (tính lại ở server, không tin số client gửi).
                    Amount = item.Quantity * item.UnitPrice
                });
            }

            job.Status = "ESTIMATING";

            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                Action = isNewEstimate ? "ESTIMATE_CREATED" : "ESTIMATE_UPDATED",
                User = "", // AuditActorInterceptor điền người đăng nhập
                Timestamp = DateTime.UtcNow,
                Details = isNewEstimate
                    ? $"Lập báo giá {estimate.EstimateNo}: {estimateVm.Items.Count} hạng mục, tổng cộng {estimate.GrandTotal:N0} {estimate.Currency}"
                    : $"Sửa/bổ sung báo giá {estimate.EstimateNo}: {oldItemCount} → {estimateVm.Items.Count} hạng mục, tổng {oldTotal:N0} → {estimate.GrandTotal:N0} {estimate.Currency}"
            });

            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return true;
        }

        /// <summary>Approval chỉ nhận estimate PENDING_APPROVAL và chuyển hồ sơ sang REPAIRING.</summary>
        public async Task ConfirmEstimateAsync(long jobId, string confirmedBy)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId)
                ?? throw new EstimateNotAllowedException("Không tìm thấy hồ sơ container.");
            var estimate = await _db.Estimates.FirstOrDefaultAsync(e => e.DepotJobId == jobId)
                ?? throw new EstimateNotAllowedException($"Container {job.ContainerNo} chưa có báo giá.");
            if (estimate.Status != "PENDING_APPROVAL")
                throw new EstimateNotAllowedException($"Báo giá {estimate.EstimateNo} đang ở trạng thái {estimate.Status}, không cần xác nhận.");
            if (estimate.ConfirmedAt != null)
                throw new EstimateNotAllowedException($"Báo giá {estimate.EstimateNo} đã được xác nhận lúc {estimate.ConfirmedAt:dd/MM/yyyy HH:mm} (UTC).");

            estimate.ConfirmedAt = DateTime.UtcNow;
            estimate.ConfirmedBy = string.IsNullOrWhiteSpace(confirmedBy) ? null : confirmedBy.Trim();
            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                Action = "ESTIMATE_CONFIRMED",
                User = "", // AuditActorInterceptor điền người đăng nhập
                Timestamp = DateTime.UtcNow,
                Details = $"Xác nhận báo giá {estimate.EstimateNo}: tổng {estimate.GrandTotal:N0} {estimate.Currency} — chờ hãng tàu duyệt."
            });
            await _db.SaveChangesAsync();
        }

        public async Task<bool> ApproveEstimateAsync(long jobId, ApproveEstimateRequest request, string enteredBy)
        {
            request ??= new ApproveEstimateRequest();
            static string? T(string? v) => string.IsNullOrWhiteSpace(v) ? null : v.Trim();
            if (request.ApprovedAmount is < 0)
                throw new EstimateNotAllowedException("Số tiền hãng tàu duyệt không được âm.");
            if (request.ApprovedAt is { } at && at.ToUniversalTime() > DateTime.UtcNow.AddMinutes(5))
                throw new EstimateNotAllowedException("Ngày hãng tàu duyệt không được ở tương lai.");
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            var estimate = job == null ? null : await _db.Estimates.FirstOrDefaultAsync(e => e.DepotJobId == jobId);
            if (job == null || estimate == null || estimate.Status != "PENDING_APPROVAL" || job.Status != "ESTIMATING") return false;
            if (estimate.ConfirmedAt == null)
                throw new EstimateNotAllowedException($"Báo giá {estimate.EstimateNo} chưa được xác nhận — người báo giá phải bấm \"Xác nhận báo giá\" trước khi ghi nhận hãng tàu duyệt.");
            // GrandTotal do server tính khi lưu báo giá; hãng tàu không duyệt nhiều hơn số depot yêu cầu
            // (trước đây ghi nhận được 999.999.999 cho báo giá 151.200).
            if (request.ApprovedAmount is { } amount && amount > estimate.GrandTotal)
                throw new EstimateNotAllowedException($"Số tiền hãng tàu duyệt ({amount:N0}) lớn hơn tổng báo giá ({estimate.GrandTotal:N0} {estimate.Currency}).");

            estimate.Status = "APPROVED";
            estimate.ApprovedAt = request.ApprovedAt?.ToUniversalTime() ?? DateTime.UtcNow;
            // ApprovedBy = nhân viên depot ghi nhận; thông tin phía hãng tàu lưu ở các cột Carrier* riêng.
            estimate.ApprovedBy = T(enteredBy) ?? "Depot";
            estimate.CarrierWorkOrderNo = T(request.CarrierWorkOrderNo);
            estimate.CarrierAuthCode = T(request.CarrierAuthCode);
            estimate.CarrierApproverName = T(request.CarrierApproverName);
            estimate.ApprovedAmount = request.ApprovedAmount ?? estimate.GrandTotal;
            estimate.ApprovalChannel = T(request.ApprovalChannel)?.ToUpperInvariant();
            estimate.ApprovalNotes = T(request.Notes);

            job.Status = "REPAIRING";

            var parts = new List<string>();
            if (estimate.CarrierWorkOrderNo != null) parts.Add($"WO hãng tàu {estimate.CarrierWorkOrderNo}");
            if (estimate.CarrierAuthCode != null) parts.Add($"mã duyệt {estimate.CarrierAuthCode}");
            if (estimate.CarrierApproverName != null) parts.Add($"người duyệt {estimate.CarrierApproverName}");
            parts.Add($"duyệt {estimate.ApprovedAmount:N0} {estimate.Currency}");
            if (estimate.ApprovalChannel != null) parts.Add($"qua {estimate.ApprovalChannel}");
            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                Action = "ESTIMATE_APPROVED",
                User = "", // AuditActorInterceptor điền nhân viên đăng nhập
                Timestamp = DateTime.UtcNow,
                Details = $"Ghi nhận hãng tàu duyệt báo giá {estimate.EstimateNo}: {string.Join(", ", parts)}" +
                          (estimate.ApprovalNotes != null ? $". Ghi chú: {estimate.ApprovalNotes}" : "") + " → chuyển Sửa chữa."
            });

            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Từ chối báo giá và đưa hồ sơ về ESTIMATING để estimator chỉnh sửa,
        /// thay vì chuyển thẳng sang sửa chữa như nhánh Approved.
        /// </summary>
        /// <summary>Reject lưu lý do audit và đưa estimate về ESTIMATING để chỉnh sửa lại.</summary>
        public async Task<bool> RejectEstimateAsync(long jobId, RejectEstimateRequest request, string recordedBy)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            var estimate = job == null ? null : await _db.Estimates.FirstOrDefaultAsync(e => e.DepotJobId == jobId);
            if (job == null || estimate == null || estimate.Status != "PENDING_APPROVAL" || string.IsNullOrWhiteSpace(request.Reason)) return false;
            // Cùng điều kiện với ghi nhận duyệt — trước đây từ chối được cả báo giá người báo giá chưa xác nhận.
            if (estimate.ConfirmedAt == null)
                throw new EstimateNotAllowedException($"Báo giá {estimate.EstimateNo} chưa được xác nhận — người báo giá phải bấm \"Xác nhận báo giá\" trước khi ghi nhận hãng tàu từ chối.");

            // Giống luồng duyệt: ApprovedBy = nhân viên depot ghi nhận (tài khoản đăng nhập); người / mã từ chối
            // phía hãng tàu lưu riêng ở CarrierApproverName. Trước đây ApprovedBy lấy thẳng chuỗi client gửi.
            var carrierSide = request.RejectedBy?.Trim();
            if (string.IsNullOrEmpty(carrierSide) || string.Equals(carrierSide, "Hãng tàu", StringComparison.OrdinalIgnoreCase))
                carrierSide = null;
            if (carrierSide != null && carrierSide.Length > 200) carrierSide = carrierSide[..200];

            estimate.Status = "REJECTED";
            estimate.ApprovedBy = string.IsNullOrWhiteSpace(recordedBy) ? "Depot" : recordedBy;
            estimate.CarrierApproverName = carrierSide;
            estimate.ApprovedAt = DateTime.UtcNow;
            job.Status = "ESTIMATING";
            var details = carrierSide == null
                ? request.Reason.Trim()
                : $"{request.Reason.Trim()} (phía hãng tàu: {carrierSide})";
            _db.AuditLogs.Add(CreateAudit(job.JobNo, jobId, "ESTIMATE_REJECTED", estimate.ApprovedBy, details));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Khớp giao dịch VietQR theo JobNo/container; số tiền không dương bị từ chối.</summary>
        public async Task<bool> ProcessBankWebhookPaymentAsync(BankWebhookPaymentRequest webhook)
        {
            // Mọi lần ngân hàng gọi webhook đều ghi PaymentLogs (kể cả không khớp hồ sơ / sai số tiền).
            var log = new PaymentLog
            {
                Method = "VIETQR_WEBHOOK",
                Amount = webhook.Amount,
                TransactionRef = Truncate(webhook.TransactionRef, 100),
                Notes = Truncate(webhook.Content, 500),
                CashierName = "VietQR Webhook",
                LoggedAt = DateTime.UtcNow
            };
            async Task<bool> Reject(string message)
            {
                log.Status = "REJECTED";
                log.Message = Truncate(message, 500);
                _db.ChangeTracker.Clear();
                _db.PaymentLogs.Add(log);
                await _db.SaveChangesAsync();
                return false;
            }

            var jobs = await _db.DepotJobs.ToListAsync();
            var targetJob = jobs.FirstOrDefault(j =>
                webhook.Content.Contains(j.JobNo, StringComparison.OrdinalIgnoreCase) ||
                webhook.Content.Contains(j.ContainerNo, StringComparison.OrdinalIgnoreCase));

            if (targetJob == null) return await Reject("Nội dung chuyển khoản không khớp số hồ sơ / số container nào.");
            log.DepotJobId = targetJob.Id; log.JobNo = targetJob.JobNo; log.ContainerNo = targetJob.ContainerNo;
            if (webhook.Amount <= 0) return await Reject("Số tiền không hợp lệ.");

            // Idempotency theo TransactionRef — trước đây webhook luôn Add() Payment mới vô điều kiện,
            // không dò trùng giao dịch. Payment.DepotJobId có unique index nên gọi lặp trước đây sẽ crash
            // DbUpdateException (500) thay vì trả 200 idempotent như chuẩn webhook yêu cầu (ngân hàng/cổng
            // thanh toán luôn có cơ chế retry). Nếu đã ghi nhận đúng giao dịch này rồi thì coi như thành
            // công, không ghi lại; nếu job đã PAID bởi 1 giao dịch KHÁC thì từ chối rõ ràng thay vì âm thầm
            // tạo Payment thứ 2 (vẫn sẽ vi phạm unique index).
            var existingPayment = await _db.Payments.FirstOrDefaultAsync(p => p.DepotJobId == targetJob.Id);
            if (existingPayment?.Status == "PAID")
            {
                var sameTransaction = !string.IsNullOrWhiteSpace(webhook.TransactionRef)
                    && existingPayment.TransactionRef == webhook.TransactionRef;
                // Ngân hàng gọi lại cùng giao dịch: trả thành công (idempotent), không ghi log trùng.
                return sameTransaction || await Reject("Hồ sơ đã được thanh toán bởi một giao dịch khác.");
            }

            // Đối chiếu Amount với công nợ thực (ServiceOrder.GrandTotal) — trước đây chỉ kiểm tra
            // Amount > 0, nghĩa là chuyển khoản 1.000đ với đúng nội dung JobNo vẫn đủ đánh dấu TOÀN BỘ
            // job đã thanh toán. Áp dụng đúng kiểu đối chiếu đã có sẵn ở luồng thanh toán thủ công
            // (ProcessPaymentAsync). Nếu job này không có ServiceOrder nào (không phát sinh qua Khai Thác
            // Gate-In), giữ nguyên hành vi cũ — không có "công nợ thực" nào để đối chiếu.
            var serviceOrder = await _db.ServiceOrders.FirstOrDefaultAsync(so => so.DepotJobId == targetJob.Id && so.Status != "CANCELLED");
            if (serviceOrder != null)
            {
                log.ServiceOrderNo = serviceOrder.OrderNo; log.OrderTotal = serviceOrder.GrandTotal;
                if (webhook.Amount != serviceOrder.GrandTotal)
                    return await Reject($"Số tiền {webhook.Amount:N0} đ không khớp tổng phiếu {serviceOrder.OrderNo} ({serviceOrder.GrandTotal:N0} đ).");
            }

            // Payment không còn navigation trên DepotJob — thêm tường minh qua DbSet (giống pattern
            // RepairOrder đã áp dụng) thay vì gán navigation-only.
            if (existingPayment == null)
            {
                existingPayment = new Payment { DepotJobId = targetJob.Id, InvoiceNo = $"INV-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(100, 999)}" };
                _db.Payments.Add(existingPayment);
            }
            // Tiền nhận = tổng phiếu (đã gồm VAT). Trước đây ghi Tax = 10% và Total = 110% số tiền nhận → phiếu thu
            // bị thổi phồng thêm 10% so với số tiền thật.
            existingPayment.Amount = serviceOrder?.Subtotal ?? webhook.Amount;
            existingPayment.Tax = serviceOrder?.TotalVat ?? 0;
            existingPayment.TotalAmount = webhook.Amount;
            existingPayment.Status = "PAID";
            existingPayment.PaidAt = webhook.TransactionTime;
            existingPayment.PaymentMethod = "VIETQR_BANK_TRANSFER";
            existingPayment.CashierName = "Hệ thống VietQR AutoMatch";
            existingPayment.TransactionRef = webhook.TransactionRef;

            if (serviceOrder != null)
            {
                serviceOrder.PaymentStatus = "PAID";
                serviceOrder.Status = "PAID";
                serviceOrder.PaidAt = webhook.TransactionTime;
                serviceOrder.TransactionId = webhook.TransactionRef;
            }
            if (targetJob.Status == "PAYMENT_PENDING") targetJob.Status = "PAID";

            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = targetJob.Id,
                JobNo = targetJob.JobNo,
                Action = "PAYMENT_RECEIVED",
                User = "VietQR Webhook",
                Timestamp = DateTime.UtcNow,
                Details = $"Ghi nhận thanh toán {webhook.Amount:N0} VNĐ qua VietQR. Mã GD: {webhook.TransactionRef}"
            });
            log.Status = "SUCCESS";
            log.Message = "Thanh toán thành công";
            log.InvoiceNo = existingPayment.InvoiceNo;
            _db.PaymentLogs.Add(log);

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<PaymentLogItem>> GetPaymentLogsAsync(PaymentLogFilter filter)
        {
            var query = _db.PaymentLogs.AsNoTracking().Where(x => !x.IsDeleted);
            if (filter.From.HasValue) query = query.Where(x => x.LoggedAt >= filter.From.Value.ToUniversalTime());
            if (filter.To.HasValue) query = query.Where(x => x.LoggedAt < filter.To.Value.ToUniversalTime());
            if (!string.IsNullOrWhiteSpace(filter.Method)) { var m = filter.Method.Trim().ToUpper(); query = query.Where(x => x.Method == m); }
            if (!string.IsNullOrWhiteSpace(filter.Status)) { var st = filter.Status.Trim().ToUpper(); query = query.Where(x => x.Status == st); }
            if (!string.IsNullOrWhiteSpace(filter.Keyword))
            {
                var k = filter.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    (x.ContainerNo != null && x.ContainerNo.ToLower().Contains(k)) ||
                    (x.ServiceOrderNo != null && x.ServiceOrderNo.ToLower().Contains(k)) ||
                    (x.InvoiceNo != null && x.InvoiceNo.ToLower().Contains(k)) ||
                    (x.TransactionRef != null && x.TransactionRef.ToLower().Contains(k)) ||
                    (x.CashierName != null && x.CashierName.ToLower().Contains(k)));
            }
            return await query.OrderByDescending(x => x.LoggedAt).Take(Math.Clamp(filter.Take, 1, 2000))
                .Select(x => new PaymentLogItem
                {
                    Id = x.Id, LoggedAt = x.LoggedAt, DepotJobId = x.DepotJobId, JobNo = x.JobNo, ContainerNo = x.ContainerNo,
                    ServiceOrderNo = x.ServiceOrderNo, InvoiceNo = x.InvoiceNo, Method = x.Method, Status = x.Status,
                    Amount = x.Amount, OrderTotal = x.OrderTotal, CashReceived = x.CashReceived, ChangeAmount = x.ChangeAmount,
                    TransactionRef = x.TransactionRef, Notes = x.Notes, CashierName = x.CashierName, Message = x.Message
                }).ToListAsync();
        }

        /// <summary>Thu tại quầy + luôn ghi 1 dòng PaymentLogs (thành công hoặc bị từ chối kèm lý do).</summary>
        public async Task<ProcessPaymentResult> ProcessPaymentAsync(long jobId, ProcessPaymentRequest request, string? cashierName)
        {
            var log = new PaymentLog
            {
                DepotJobId = jobId,
                Method = Truncate((request.Method ?? string.Empty).Trim().ToUpperInvariant(), 30) ?? string.Empty,
                Amount = request.Amount,
                CashReceived = request.CashReceived,
                Notes = Truncate(request.Notes?.Trim(), 500),
                CashierName = Truncate(string.IsNullOrWhiteSpace(cashierName) ? "Thu ngân" : cashierName.Trim(), 150),
                TransactionRef = Truncate(request.TransactionRef?.Trim(), 100),
                LoggedAt = DateTime.UtcNow
            };
            var result = await ProcessPaymentCoreAsync(jobId, request, cashierName, log);
            log.Status = result.Success ? "SUCCESS" : "REJECTED";
            log.Message = Truncate(result.Message, 500);
            if (result.Success)
            {
                log.TransactionRef = result.TransactionRef;
                log.InvoiceNo = result.InvoiceNo;
                log.Amount = result.Amount;
                if (log.Method == "CASH" && request.CashReceived.HasValue) log.ChangeAmount = request.CashReceived.Value - result.Amount;
            }
            if (log.DepotJobId.HasValue && !await _db.DepotJobs.AnyAsync(j => j.Id == log.DepotJobId.Value)) log.DepotJobId = null;
            _db.PaymentLogs.Add(log);
            await _db.SaveChangesAsync();
            return result;
        }

        private static string? Truncate(string? value, int max) => value == null ? null : value.Length <= max ? value : value[..max];

        private async Task<ProcessPaymentResult> ProcessPaymentCoreAsync(long jobId, ProcessPaymentRequest request, string? cashierName, PaymentLog log)
        {
            static ProcessPaymentResult Fail(string message) => new() { Success = false, Message = message };
            var method = (request.Method ?? string.Empty).Trim().ToUpperInvariant();
            // Thu tại quầy chỉ nhận tiền mặt hoặc chuyển khoản đã đối chiếu; VietQR tự động đi qua webhook ngân hàng.
            if (method is not ("CASH" or "BANK_TRANSFER")) return Fail("Hình thức thanh toán không hợp lệ (chỉ nhận Tiền mặt hoặc Chuyển khoản).");

            var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.Id == jobId);
            if (job == null) return Fail("Không tìm thấy hồ sơ container.");
            log.JobNo = job.JobNo; log.ContainerNo = job.ContainerNo;
            var serviceOrder = await _db.ServiceOrders.FirstOrDefaultAsync(x => x.DepotJobId == job.Id && x.Status != "CANCELLED");
            if (serviceOrder == null) return Fail("Container chưa có phiếu dịch vụ nào để thu tiền.");
            log.ServiceOrderNo = serviceOrder.OrderNo; log.OrderTotal = serviceOrder.GrandTotal;
            if (serviceOrder.PaymentStatus == "PAID") return Fail($"Phiếu {serviceOrder.OrderNo} đã được thanh toán trước đó.");
            if (request.Amount <= 0 || request.Amount != serviceOrder.GrandTotal)
                return Fail($"Số tiền {request.Amount:N0} đ không khớp tổng phiếu {serviceOrder.OrderNo} ({serviceOrder.GrandTotal:N0} đ).");

            string transactionRef;
            if (method == "BANK_TRANSFER")
            {
                // Nhân viên kiểm tra tiền về rồi xác nhận — mã giao dịch ngân hàng không bắt buộc; có thì chống dùng trùng,
                // không có thì tự sinh mã phiếu thu chuyển khoản.
                transactionRef = (request.TransactionRef ?? string.Empty).Trim();
                if (transactionRef.Length > 100) return Fail("Mã giao dịch ngân hàng quá dài.");
                if (transactionRef.Length > 0)
                {
                    var duplicated = await _db.Payments.AnyAsync(p => p.TransactionRef == transactionRef)
                        || await _db.ServiceOrders.AnyAsync(so => so.TransactionId == transactionRef);
                    if (duplicated) return Fail($"Mã giao dịch {transactionRef} đã được dùng cho một khoản thanh toán khác.");
                }
                else
                {
                    transactionRef = $"CK-{DateTime.UtcNow:yyyyMMddHHmmss}-{job.Id}";
                }
            }
            else
            {
                if (request.CashReceived.HasValue && request.CashReceived.Value < serviceOrder.GrandTotal)
                    return Fail($"Tiền khách đưa ({request.CashReceived.Value:N0} đ) chưa đủ số phải thu ({serviceOrder.GrandTotal:N0} đ).");
                transactionRef = $"CASH-{DateTime.UtcNow:yyyyMMddHHmmss}-{job.Id}";
            }
            var cashier = string.IsNullOrWhiteSpace(cashierName) ? "Thu ngân" : cashierName.Trim();

            // Chặn race condition double-payment: đọc PaymentStatus rồi mới ghi (2 bước tách rời) khiến 2
            // request thanh toán đồng thời cho cùng job (double-click, 2 tab) đều có thể đọc "chưa PAID"
            // trước khi cái nào SaveChangesAsync. Đẩy điều kiện "chưa PAID" xuống ngay câu UPDATE để DB
            // đảm bảo chỉ đúng 1 request thắng — request thua trả về false, không tạo thêm Payment nào.
            var paidAt = DateTime.UtcNow;
            var claimedRows = await _db.ServiceOrders
                .Where(so => so.Id == serviceOrder.Id && so.PaymentStatus != "PAID")
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(so => so.PaymentStatus, "PAID")
                    .SetProperty(so => so.Status, "PAID")
                    .SetProperty(so => so.PaymentMethod, method)
                    .SetProperty(so => so.TransactionId, transactionRef)
                    .SetProperty(so => so.PaidAt, paidAt));
            if (claimedRows == 0) return Fail($"Phiếu {serviceOrder.OrderNo} vừa được thanh toán ở nơi khác.");

            var payment = await _db.Payments.FirstOrDefaultAsync(x => x.DepotJobId == job.Id);
            if (payment == null)
            {
                payment = new Payment { DepotJobId = job.Id, InvoiceNo = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100, 999)}" };
                _db.Payments.Add(payment);
            }
            payment.Amount = serviceOrder.Subtotal; payment.Tax = serviceOrder.TotalVat; payment.TotalAmount = serviceOrder.GrandTotal;
            payment.Status = "PAID"; payment.PaidAt = paidAt; payment.PaymentMethod = method; payment.CashierName = cashier;
            payment.TransactionRef = transactionRef;
            // Trước đây ghi đè job.Status = "PAID" vô điều kiện — phiếu dịch vụ Khai Thác Gate-In (LOLO/lưu
            // bãi, không liên quan tới hư hỏng) và luồng Estimate sửa chữa CÙNG dùng chung DepotJob.Status,
            // nên thanh toán phí Gate-In cho 1 container đang ở ESTIMATING (chờ báo giá sửa chữa) sẽ xoá mất
            // trạng thái đó, khiến CreateOrUpdateEstimateAsync (yêu cầu Status == "ESTIMATING") luôn từ chối
            // vĩnh viễn. Không nơi nào khác trong hệ thống đọc DepotJob.Status == "PAID" (chỉ
            // ServiceOrder.PaymentStatus/Payment.Status mới thật sự được dùng để biết đã thu tiền) nên bỏ
            // hẳn dòng ghi đè này, giữ nguyên trạng thái vòng đời thật của job.
            var details = method == "CASH"
                ? $"Thu tiền mặt {serviceOrder.GrandTotal:N0} đ (phiếu {serviceOrder.OrderNo})"
                  + (request.CashReceived.HasValue ? $", khách đưa {request.CashReceived.Value:N0} đ, trả lại {request.CashReceived.Value - serviceOrder.GrandTotal:N0} đ" : string.Empty)
                : $"Nhận chuyển khoản {serviceOrder.GrandTotal:N0} đ (phiếu {serviceOrder.OrderNo}), mã GD ngân hàng {transactionRef}";
            if (!string.IsNullOrWhiteSpace(request.Notes)) details += $". Ghi chú: {request.Notes.Trim()}";
            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "PAYMENT_RECEIVED", cashier, details.Length > 1000 ? details[..1000] : details));
            await _db.SaveChangesAsync();
            return new ProcessPaymentResult
            {
                Success = true,
                Message = "Thanh toán thành công",
                TransactionRef = transactionRef,
                InvoiceNo = payment.InvoiceNo,
                Amount = serviceOrder.GrandTotal,
                CashierName = cashier,
                PaidAt = paidAt
            };
        }

        public async Task<object?> CreateServiceOrderAsync(CreateServiceOrderRequest request)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.JobNo == request.JobNo && x.ContainerNo == request.ContainerNo);
            // VatPercent trước đây không bị chặn biên nào — nhập âm hoặc số vô lý (vd 100000%) vẫn được
            // chấp nhận, tạo hoá đơn sai lệch (VatAmount âm hoặc phóng đại tuỳ tiện GrandTotal).
            // Báo rõ lý do thay vì 400 chung chung "Không thể tạo phiếu dịch vụ".
            if (job == null) throw new InvalidOperationException($"Không tìm thấy hồ sơ {request.JobNo} / container {request.ContainerNo}.");
            // Vòng đời khép kín: Gate-In → Giám định xong → Vệ sinh xong & bàn giao (nếu giám định yêu cầu) → mới lập phiếu
            // dịch vụ. Mỗi hồ sơ chỉ có 1 phiếu nên lập sớm thì phí phát sinh sau (vệ sinh) không còn chỗ thu.
            if (job.Status is "GATE_IN" or "SURVEYING")
                throw new InvalidOperationException($"Container {job.ContainerNo} chưa giám định xong — hoàn tất giám định trước khi lập phiếu dịch vụ.");
            var pendingCleaning = await _db.CleaningRecords.AsNoTracking()
                .FirstOrDefaultAsync(c => c.JobNo == job.JobNo && c.Status != "HANDOVER_TO_OPERATION" && !c.IsDeleted);
            if (job.Status == "CLEANING" || pendingCleaning != null)
                throw new InvalidOperationException($"Container {job.ContainerNo} đang vệ sinh{(pendingCleaning != null ? $" (lệnh {pendingCleaning.Code})" : string.Empty)} — chờ Tổ Vệ Sinh làm xong và bàn giao Khai thác rồi mới lập phiếu.");
            if (request.Items.Count == 0) throw new InvalidOperationException("Phiếu dịch vụ phải có ít nhất 1 hạng mục.");
            if (request.Items.Any(x => x.Quantity <= 0 || x.UnitPrice < 0 || x.VatPercent < 0 || x.VatPercent > 100))
                throw new InvalidOperationException("Hạng mục không hợp lệ: số lượng phải > 0, đơn giá ≥ 0, VAT 0–100%.");
            // Hạng mục biểu cước nâng hạ: server tự tra đơn giá / VAT theo loại container của HỒ SƠ (không theo cỡ / giá
            // trình duyệt gửi) — depot-fullstack-lolo-tariff-pricing.
            await RejectStorageItemsAsync(request.Items);
            await ServiceTariffPricing.ApplyAsync(_db, job.IsoSize, request.Items);
            await CleaningTariffPricing.ApplyToServiceOrderAsync(_db, job.IsoSize, request.Items);
            // Mỗi hồ sơ chỉ có 1 phiếu dịch vụ (DB có unique index DepotJobId, kể cả phiếu đã huỷ).
            var existingOrder = await _db.ServiceOrders.AsNoTracking().FirstOrDefaultAsync(x => x.DepotJobId == job.Id);
            if (existingOrder != null)
                throw new InvalidOperationException($"Container {job.ContainerNo} đã có phiếu dịch vụ {existingOrder.OrderNo} ({(existingOrder.Status == "CANCELLED" ? "đã huỷ" : existingOrder.PaymentStatus == "PAID" ? "đã thu tiền" : "chưa thu tiền")}) — mỗi hồ sơ chỉ lập 1 phiếu.");
            var order = new Depot.Data.Entities.Finance.ServiceOrder
            {
                OrderNo = $"SO-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100, 999)}",
                DepotJobId = job.Id, ContainerNo = job.ContainerNo,
                ShippingLineCode = request.ShippingLineCode, IsoCode = request.IsoCode, Size = job.IsoSize, Type = request.Type,
                CustomerName = request.CustomerName, CustomerTaxCode = request.CustomerTaxCode,
                DriverName = request.DriverName, TruckPlate = request.TruckPlate, DriverPhone = request.DriverPhone,
                Condition = request.Condition, SurveyNote = request.SurveyNote, CleaningNote = request.CleaningNote, Notes = request.Notes
            };
            foreach (var item in request.Items)
            {
                var amount = item.Quantity * item.UnitPrice;
                var vatAmount = amount * item.VatPercent / 100m;
                order.Items.Add(new Depot.Data.Entities.Finance.ServiceOrderItem
                {
                    ServiceCode = item.ServiceCode, ServiceName = item.ServiceName,
                    Category = item.Category, Quantity = item.Quantity, Unit = item.Unit, UnitPrice = item.UnitPrice,
                    VatPercent = item.VatPercent, Amount = amount, VatAmount = vatAmount, Total = amount + vatAmount, Remarks = item.Remarks
                });
            }
            order.Subtotal = order.Items.Sum(x => x.Amount); order.TotalVat = order.Items.Sum(x => x.VatAmount); order.GrandTotal = order.Items.Sum(x => x.Total);
            _db.ServiceOrders.Add(order);
            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "SERVICE_ORDER_CREATED", "Operation", $"Tạo phiếu dịch vụ {order.OrderNo}."));

            // Nhân viên Khai Thác Gate-In có thể tự thêm hạng mục CLEANING vào phiếu dịch vụ (độc lập với
            // luồng Giám Định) — trước đây hành động này không tạo/không cập nhật gì bên Tổ Vệ Sinh, nên
            // Cleaning không bao giờ thấy các container được lập phiếu vệ sinh theo đường này. Áp dụng đúng
            // guard đã dùng ở SubmitSurveyAsync: chỉ tạo nếu chưa có lệnh vệ sinh nào đang hoạt động cho job.
            var cleaningItemsInOrder = request.Items.Where(i => i.Category == "CLEANING").ToList();
            if (cleaningItemsInOrder.Count > 0)
            {
                // Chỉ tạo lệnh vệ sinh khi hồ sơ CHƯA TỪNG có lệnh vệ sinh. Container đã vệ sinh xong & bàn giao thì dòng phí
                // vệ sinh trên phiếu là thu tiền cho việc đã làm — trước đây vẫn tạo thêm lệnh mới, đẩy container quay lại
                // hàng đợi vệ sinh.
                var hasAnyCleaningRecord = await _db.CleaningRecords
                    .AnyAsync(c => c.JobNo == job.JobNo && !c.IsDeleted);
                if (!hasAnyCleaningRecord)
                {
                    var cleaningCode = "CL-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999);
                    var cleaningWorkItems = cleaningItemsInOrder.Select(i => new CleaningWorkItem
                    {
                        CleaningRecordCode = cleaningCode,
                        CleaningCode = i.ServiceCode,
                        CleaningName = i.ServiceName,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = i.Quantity * i.UnitPrice,
                        ResponsibleParty = "U",
                        Notes = i.Remarks,
                        IsCompleted = false
                    }).ToList();

                    _db.CleaningRecords.Add(new CleaningRecord
                    {
                        Code = cleaningCode,
                        JobNo = job.JobNo,
                        ContainerNo = job.ContainerNo,
                        IsoCode = request.IsoCode,
                        SizeType = job.IsoSize,
                        TypeName = request.Type,
                        ShippingLine = request.ShippingLineCode,
                        Status = "PENDING_CLEANING",
                        CleaningNotes = request.CleaningNote,
                        TotalCostVnd = cleaningWorkItems.Sum(x => x.TotalPrice),
                        Items = cleaningWorkItems
                    });
                }
            }

            await _db.SaveChangesAsync();
            return order;
        }

        public async Task<List<Depot.Data.Entities.Finance.ServiceOrder>> GetServiceOrdersAsync(string? jobNo = null)
        {
            var query = _db.ServiceOrders.Include(x => x.Items).Include(x => x.DepotJob).AsNoTracking();
            if (!string.IsNullOrWhiteSpace(jobNo)) query = query.Where(x => x.DepotJob!.JobNo == jobNo);
            return await query.OrderByDescending(x => x.IssuedAt).ToListAsync();
        }

        /// <summary>Sửa phiếu dịch vụ — chặn nếu đã PAID/CANCELLED (không cho sửa phiếu đã chốt tiền/đã huỷ).
        /// Thay toàn bộ Items giống nguyên tắc SubmitSurveyAsync xoá-nạp-lại Damages.</summary>
        public async Task<Depot.Data.Entities.Finance.ServiceOrder?> UpdateServiceOrderAsync(long orderId, UpdateServiceOrderRequest request)
        {
            var order = await _db.ServiceOrders.Include(x => x.Items).Include(x => x.DepotJob).FirstOrDefaultAsync(x => x.Id == orderId);
            if (order == null || order.Status is "PAID" or "CANCELLED") return null;
            if (request.Items.Count == 0 || request.Items.Any(x => x.Quantity <= 0 || x.UnitPrice < 0 || x.VatPercent < 0 || x.VatPercent > 100)) return null;
            // Sửa phiếu cũng tra lại giá biểu cước nâng hạ theo loại container của hồ sơ (depot-fullstack-lolo-tariff-pricing).
            var jobIsoSize = order.DepotJob?.IsoSize ?? order.Size;
            await RejectStorageItemsAsync(request.Items);
            await ServiceTariffPricing.ApplyAsync(_db, jobIsoSize, request.Items);
            await CleaningTariffPricing.ApplyToServiceOrderAsync(_db, jobIsoSize, request.Items);
            order.Size = jobIsoSize;

            if (request.CustomerName is not null) order.CustomerName = request.CustomerName;
            if (request.CustomerTaxCode is not null) order.CustomerTaxCode = request.CustomerTaxCode;
            if (request.DriverName is not null) order.DriverName = request.DriverName;
            if (request.TruckPlate is not null) order.TruckPlate = request.TruckPlate;
            if (request.DriverPhone is not null) order.DriverPhone = request.DriverPhone;
            if (request.SurveyNote is not null) order.SurveyNote = request.SurveyNote;
            if (request.CleaningNote is not null) order.CleaningNote = request.CleaningNote;
            if (request.Notes is not null) order.Notes = request.Notes;

            _db.ServiceOrderItems.RemoveRange(order.Items);
            order.Items.Clear();
            foreach (var item in request.Items)
            {
                var amount = item.Quantity * item.UnitPrice;
                var vatAmount = amount * item.VatPercent / 100m;
                order.Items.Add(new Depot.Data.Entities.Finance.ServiceOrderItem
                {
                    ServiceCode = item.ServiceCode, ServiceName = item.ServiceName,
                    Category = item.Category, Quantity = item.Quantity, Unit = item.Unit, UnitPrice = item.UnitPrice,
                    VatPercent = item.VatPercent, Amount = amount, VatAmount = vatAmount, Total = amount + vatAmount, Remarks = item.Remarks
                });
            }
            order.Subtotal = order.Items.Sum(x => x.Amount); order.TotalVat = order.Items.Sum(x => x.VatAmount); order.GrandTotal = order.Items.Sum(x => x.Total);
            _db.AuditLogs.Add(CreateAudit(order.DepotJob?.JobNo ?? "", order.DepotJobId, "SERVICE_ORDER_UPDATED", "Operation", $"Sửa phiếu dịch vụ {order.OrderNo}."));
            await _db.SaveChangesAsync();
            return order;
        }

        /// <summary>Huỷ phiếu dịch vụ — chặn nếu đã PAID (đã thu tiền thì không thể huỷ đơn thuần, phải xử lý
        /// qua nghiệp vụ hoàn tiền/điều chỉnh công nợ riêng, ngoài phạm vi module này).</summary>
        public async Task<bool> CancelServiceOrderAsync(long orderId)
        {
            var order = await _db.ServiceOrders.Include(x => x.DepotJob).FirstOrDefaultAsync(x => x.Id == orderId);
            if (order == null || order.Status is "PAID" or "CANCELLED") return false;
            order.Status = "CANCELLED";
            _db.AuditLogs.Add(CreateAudit(order.DepotJob?.JobNo ?? "", order.DepotJobId, "SERVICE_ORDER_CANCELLED", "Operation", $"Huỷ phiếu dịch vụ {order.OrderNo}."));
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CompleteForkliftMoveAsync(long jobId, ForkliftMoveRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TargetBlock) || request.TargetBay <= 0 || request.TargetRow <= 0 || request.TargetTier <= 0) return false;
            var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.Id == jobId);
            if (job == null) return false;

            // Trước đây không kiểm tra gì trước khi hạ bãi: container đã Gate-Out vẫn "hạ bãi" lại được
            // (tạo dữ liệu ma), Block không tồn tại trong danh mục vẫn ghi được, và ô đích đã có container
            // khác chiếm vẫn bị ghi đè vô điều kiện (2 container "cùng 1 ô" thật sự xảy ra). Áp dụng đúng
            // 3 lớp kiểm tra đã có sẵn ở YardOverviewService.MoveContainerAsync cho cùng nghiệp vụ "đổi vị
            // trí container", để 2 endpoint không còn lệch mức kiểm tra với nhau.
            if (job.Status == "GATE_OUT") return false;

            var targetBlockCode = request.TargetBlock.Trim().ToUpperInvariant();
            var blockLayout = await _db.YardBlockLayouts.AsNoTracking().FirstOrDefaultAsync(x => x.Code == targetBlockCode);
            if (blockLayout == null) return false;
            if (request.TargetTier > blockLayout.MaxTier || request.TargetBay > blockLayout.BayCount || request.TargetRow > blockLayout.RowCount) return false;

            var occupant = await _db.DepotJobs.AsNoTracking().FirstOrDefaultAsync(x =>
                x.Status != "GATE_OUT" && x.BlockCode == targetBlockCode && x.Bay == request.TargetBay
                && x.Row == request.TargetRow && x.Tier == request.TargetTier && x.Id != job.Id);
            if (occupant != null) return false;

            // Điểm lấy container ghi vào nhật ký (vd "từ Khu vệ sinh") để dòng thời gian thể hiện đúng đường đi.
            var fromLabel = !string.IsNullOrEmpty(job.BlockCode)
                ? $"{job.BlockCode}-{job.Bay}-{job.Row}-{job.Tier}"
                : await _db.CleaningRecords.AnyAsync(c => c.JobNo == job.JobNo) ? "Khu vệ sinh" : "khu giám định / hạ tạm";
            job.BlockCode = targetBlockCode;
            job.Bay = request.TargetBay; job.Row = request.TargetRow; job.Tier = request.TargetTier;
            // Trước đây ghi đè job.Status = "IN_YARD" vô điều kiện — xe nâng có thể đảo chuyển vị trí
            // container ở BẤT KỲ giai đoạn nào trong vòng đời (kể cả khi đang REPAIRING, hoặc đang
            // READY_FOR_OUT chờ xe tới lấy), không riêng lúc mới hạ bãi sau Gate-In. Ghi đè status như cũ
            // sẽ xoá mất trạng thái nghiệp vụ thật đang có — cùng loại lỗi với `job.Status = "PAID"` đã sửa
            // ở ProcessPaymentAsync. Ví dụ thật: container đã QC đạt (READY_FOR_OUT) nhưng bị dời chỗ trong
            // lúc chờ xe tới nhận thì sẽ kẹt mãi ở IN_YARD, GateOutAsync (yêu cầu đúng READY_FOR_OUT) từ
            // chối vĩnh viễn. Không nơi nào khác đọc DepotJob.Status == "IN_YARD" làm điều kiện thật (chỉ
            // xuất hiện trong danh sách "allowed" của endpoint set-status thủ công) nên bỏ hẳn dòng ghi đè,
            // vị trí vật lý đã được cập nhật đủ qua BlockCode/Bay/Row/Tier + YardPosition bên dưới.
            var slot = await _db.YardPositions.FirstOrDefaultAsync(x => x.BlockCode == job.BlockCode && x.Bay == job.Bay && x.Row == job.Row && x.Tier == job.Tier);
            if (slot == null) _db.YardPositions.Add(new Depot.Data.Entities.Yard.YardPosition { BlockCode = job.BlockCode, Bay = job.Bay, Row = job.Row, Tier = job.Tier, IsOccupied = true, OccupiedContainerNo = job.ContainerNo });
            else { slot.IsOccupied = true; slot.OccupiedContainerNo = job.ContainerNo; }
            // Di chuyển đã hoàn tất — trả khoá nhận lệnh xe nâng về trống để job sẵn sàng cho lần di
            // chuyển KẾ TIẾP trong vòng đời container (vd. Bãi -> Xưởng sửa chữa sau khi vừa Vệ sinh ->
            // Bãi xong). Không xoá thì job kẹt mãi ở trạng thái "đã nhận" dù việc đã xong.
            job.ForkliftClaimedByOperatorId = null;
            job.ForkliftClaimedByOperatorName = null;
            job.ForkliftAssignedVehicleCode = null;
            job.ForkliftClaimedAt = null;
            job.ForkliftStartedAt = null;
            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "FORKLIFT_MOVE_COMPLETED", request.OperatorName ?? "Forklift", $"Từ {fromLabel} hạ bãi {job.BlockCode}-{job.Bay}-{job.Row}-{job.Tier}, xe {request.ForkliftCode ?? "-"}."));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Các trạng thái DepotJob.Status đang chờ 1 lần di chuyển xe nâng — khớp đúng 3 case
        /// ForkliftPage.tsx tự suy ra phía frontend (Vệ sinh/Thanh toán xong -> Bãi; Nhận sửa -> Xưởng;
        /// Sửa+QC xong -> Bãi). Dùng để chặn nhận lệnh cho job không thật sự cần xe nâng lúc này.</summary>
        private static readonly string[] ForkliftPendingStatuses = { "PAYMENT_SUCCESS", "WAITING_FORKLIFT", "REPAIRING", "APPROVED", "READY_FOR_OUT" };

        /// <summary>Tài xế xe nâng "nhận" 1 lệnh di chuyển đang chờ để khoá lại, không cho tài xế khác trên
        /// tablet khác nhận trùng. Trước đây việc "nhận lệnh" hoàn toàn cục bộ trên trình duyệt (state React
        /// riêng từng tablet) — 2 tài xế mở 2 tablet khác nhau có thể cùng nhận và cùng di chuyển 1 container
        /// mà hệ thống không hề hay biết. Dùng đúng pattern ExecuteUpdateAsync có điều kiện WHERE đã áp dụng
        /// cho ClaimSurveyAsync để tránh race condition đọc-rồi-ghi.</summary>
        public async Task<DepotJob> ClaimForkliftJobAsync(long jobId, string operatorId, string operatorName, string vehicleCode)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null)
                throw new ArgumentException("Không tìm thấy hồ sơ container.");
            // Vệ sinh bàn giao xong mà chưa hạ bãi = container còn nằm ở Khu vệ sinh, chờ xe nâng đưa vào bãi
            // (hồ sơ lúc này ở ESTIMATING/READY_FOR_OUT tuỳ có hư hỏng hay không).
            var awaitingFromCleaning = string.IsNullOrEmpty(job.BlockCode) && job.Status is not ("GATE_OUT" or "CLEANING")
                && await _db.CleaningRecords.AnyAsync(c => c.JobNo == job.JobNo && c.Status == "HANDOVER_TO_OPERATION");
            if (!awaitingFromCleaning && !ForkliftPendingStatuses.Contains(job.Status))
                throw new ArgumentException("Container không còn ở trạng thái chờ xe nâng di chuyển (có thể đã được xử lý xong).");

            var claimedRows = await _db.DepotJobs
                .Where(j => j.Id == jobId && j.ForkliftClaimedByOperatorId == null)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(j => j.ForkliftClaimedByOperatorId, operatorId)
                    .SetProperty(j => j.ForkliftClaimedByOperatorName, operatorName)
                    .SetProperty(j => j.ForkliftAssignedVehicleCode, vehicleCode)
                    .SetProperty(j => j.ForkliftClaimedAt, DateTime.UtcNow));

            if (claimedRows == 0)
            {
                var currentHolder = await _db.DepotJobs.AsNoTracking().Where(j => j.Id == jobId).Select(j => j.ForkliftClaimedByOperatorName).FirstOrDefaultAsync();
                throw new InvalidOperationException($"Container đã được tài xế {currentHolder} nhận lệnh trước đó. Vui lòng chọn container khác.");
            }

            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "FORKLIFT_CLAIMED", operatorName, $"Nhận lệnh xe nâng container {job.ContainerNo}, xe {vehicleCode}."));
            await _db.SaveChangesAsync();

            job.ForkliftClaimedByOperatorId = operatorId;
            job.ForkliftClaimedByOperatorName = operatorName;
            job.ForkliftAssignedVehicleCode = vehicleCode;
            job.ForkliftClaimedAt = DateTime.UtcNow;
            return job;
        }

        /// <summary>Tài xế đã nhận lệnh bấm "Bắt đầu thực hiện" — chỉ chính người đang giữ khoá mới được thao tác.</summary>
        public async Task<bool> StartForkliftExecutionAsync(long jobId, string operatorId)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.ForkliftClaimedByOperatorId != operatorId) return false;

            job.ForkliftStartedAt = DateTime.UtcNow;
            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "FORKLIFT_STARTED", job.ForkliftClaimedByOperatorName ?? operatorId, $"Bắt đầu di chuyển container {job.ContainerNo}."));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Huỷ nhận lệnh, trả container về hàng đợi chờ — chỉ chính người đang giữ khoá mới được tự huỷ.</summary>
        public async Task<bool> CancelForkliftClaimAsync(long jobId, string operatorId)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.ForkliftClaimedByOperatorId != operatorId) return false;

            job.ForkliftClaimedByOperatorId = null;
            job.ForkliftClaimedByOperatorName = null;
            job.ForkliftAssignedVehicleCode = null;
            job.ForkliftClaimedAt = null;
            job.ForkliftStartedAt = null;
            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "FORKLIFT_CLAIM_CANCELLED", operatorId, $"Huỷ nhận lệnh xe nâng container {job.ContainerNo}, trả về hàng đợi."));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Tạo Work Order bắt đầu thi công; chỉ chạy sau khi hãng tàu duyệt estimate.</summary>
        public async Task<bool> StartRepairAsync(long jobId, string technicianId, string technicianName)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            var estimateStatus = job == null ? null : await _db.Estimates.Where(e => e.DepotJobId == jobId).Select(e => e.Status).FirstOrDefaultAsync();
            if (job == null || estimateStatus != "APPROVED" || job.Status != "REPAIRING") return false;
            // Bấm "Bắt đầu" lần 2 (hoặc 2 thợ cùng bấm) trước đây thêm RepairOrder thứ 2 cho cùng hồ sơ, vi phạm
            // quan hệ 1-1 → HTTP 500 (BUG-009).
            if (await _db.RepairOrders.AnyAsync(r => r.DepotJobId == jobId))
                throw new InvalidOperationException("Lệnh sửa chữa của container này đã được bắt đầu.");

            var repairOrder = new RepairOrder
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                TechnicianId = technicianId,
                TechnicianName = technicianName,
                StartedAt = DateTime.UtcNow,
                QcStatus = "IN_PROGRESS"
            };
            // Thêm tường minh qua DbSet (giống pattern Survey/Estimate) thay vì chỉ gán navigation
            // property job.RepairOrder = new RepairOrder{...} — cách gán navigation-only từng gây
            // DbUpdateConcurrencyException ("affected 0 row(s)") khi SaveChanges gộp chung với UPDATE
            // AuditLogs trong cùng 1 batch, phát hiện khi chạy thử thật với Postgres.
            _db.RepairOrders.Add(repairOrder);

            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                Action = "REPAIR_STARTED",
                User = technicianName,
                Timestamp = DateTime.UtcNow,
                Details = $"Bắt đầu sửa chữa container bởi kỹ thuật viên {technicianName}"
            });

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // 2 yêu cầu bắt đầu đồng thời cùng qua kiểm tra AnyAsync ở trên; yêu cầu thứ 2 vướng unique
                // IX_RepairOrders_JobNo — trước đây thành HTTP 500. Kiểm tra lại: đã có lệnh sửa thì báo 409.
                _db.ChangeTracker.Clear();
                if (await _db.RepairOrders.AnyAsync(r => r.DepotJobId == jobId))
                    throw new InvalidOperationException("Lệnh sửa chữa của container này đã được bắt đầu.");
                throw;
            }
            return true;
        }

        /// <summary>Phân công đội/thợ cho hồ sơ đã duyệt; tách query scalar để tránh tracking graph EF không cần thiết.</summary>
        public async Task<bool> AssignRepairAsync(long jobId, RepairAssignRequest request)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            var estimateStatus = await _db.Estimates
                .Where(e => e.JobNo == job!.JobNo)
                .Select(e => e.Status)
                .FirstOrDefaultAsync();
            var existingRepair = await _db.RepairOrders.FirstOrDefaultAsync(r => r.JobNo == job!.JobNo);
            if (job == null || estimateStatus != "APPROVED" || existingRepair != null || string.IsNullOrWhiteSpace(request.Team)) return false;

            var repairOrder = new RepairOrder
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                TechnicianId = request.Team,
                TechnicianName = request.Workers.FirstOrDefault() ?? request.Team,
                QcStatus = "ASSIGNED"
            };
            _db.RepairOrders.Add(repairOrder);
            job.Status = "REPAIRING";
            _db.AuditLogs.Add(CreateAudit(job.JobNo, jobId, "REPAIR_ASSIGNED", "", $"Phân công đội {request.Team}, {request.Workers.Count} kỹ thuật viên."));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Đóng Work Order và chuyển sang QC_PENDING; ảnh được ghi nhận ở audit note hiện tại.</summary>
        public async Task<bool> CompleteRepairAsync(long jobId, RepairCompleteRequest request)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            var repairOrder = job == null ? null : await _db.RepairOrders.FirstOrDefaultAsync(r => r.DepotJobId == jobId);
            if (job == null || repairOrder == null || job.Status != "REPAIRING") return false;

            // Ảnh trước / sau sửa đã được lưu thật từng tấm lúc chụp (bảng DepotFiles, TableName="RepairOrder") —
            // đếm theo DB thay vì tin `request.Photos`. Mỗi hạng mục (= 1 dòng báo giá đã duyệt, theo thứ tự Id như
            // frontend dựng danh sách) phải có ≥ 1 ảnh trước sửa và ≥ 1 ảnh sau sửa mới được chuyển QC.
            var photoNames = await _db.Set<DepotFile>()
                .Where(f => f.TableName == RepairAfterPhotoTable && f.IdTable == repairOrder.Id && !f.IsDeleted)
                .Select(f => f.Name)
                .ToListAsync();
            var photos = photoNames.Select(ParseRepairPhoto).Where(p => p != null).Select(p => p!.Value).ToList();
            var beforeCount = photos.Count(p => p.Kind == RepairPhotoKindBefore);
            var afterCount = photos.Count(p => p.Kind == RepairPhotoKindAfter);

            var approvedEstimateId = await _db.Estimates
                .Where(e => e.DepotJobId == jobId && e.Status == "APPROVED")
                .Select(e => (long?)e.Id)
                .FirstOrDefaultAsync();
            var itemCount = approvedEstimateId == null ? 0 : await _db.Set<EstimateItem>().CountAsync(i => i.EstimateId == approvedEstimateId.Value);
            var missing = new List<string>();
            if (itemCount > 0)
            {
                for (var n = 1; n <= itemCount; n++)
                {
                    var hasBefore = photos.Any(p => p.ItemNo == n && p.Kind == RepairPhotoKindBefore);
                    var hasAfter = photos.Any(p => p.ItemNo == n && p.Kind == RepairPhotoKindAfter);
                    if (!hasBefore && !hasAfter) missing.Add($"hạng mục #{n} thiếu ảnh trước sửa và ảnh sau sửa");
                    else if (!hasBefore) missing.Add($"hạng mục #{n} thiếu ảnh trước sửa");
                    else if (!hasAfter) missing.Add($"hạng mục #{n} thiếu ảnh sau sửa");
                }
            }
            else
            {
                // Hồ sơ cũ không có báo giá đã duyệt: không xác định được hạng mục, yêu cầu tối thiểu cho cả lệnh.
                if (beforeCount == 0) missing.Add("lệnh sửa chưa có ảnh trước sửa");
                if (afterCount == 0) missing.Add("lệnh sửa chưa có ảnh sau sửa");
            }
            if (missing.Count > 0)
                throw new RepairPhotosMissingException($"Chưa đủ ảnh để chuyển QC: {string.Join("; ", missing)}.");

            repairOrder.StartedAt ??= DateTime.UtcNow;
            repairOrder.CompletedAt = DateTime.UtcNow;
            repairOrder.QcStatus = "PENDING";
            repairOrder.QcNotes = $"Đã đính kèm {beforeCount} ảnh trước sửa, {afterCount} ảnh sau sửa.";
            job.Status = "QC_PENDING";
            _db.AuditLogs.Add(CreateAudit(job.JobNo, jobId, "REPAIR_COMPLETED", repairOrder.TechnicianName,
                $"Hoàn tất thi công, chuyển QC ({beforeCount} ảnh trước sửa, {afterCount} ảnh sau sửa)."));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>TableName trong DepotFiles cho ảnh lệnh sửa (trước + sau sửa) — IdTable = RepairOrder.Id.</summary>
        public const string RepairAfterPhotoTable = "RepairOrder";
        public const string RepairPhotoKindBefore = "BEFORE";
        public const string RepairPhotoKindAfter = "AFTER";

        /// <summary>Tiền tố tên file ảnh lệnh sửa: sau sửa "ITEM-{n}__" (giữ như dữ liệu cũ), trước sửa "BEFORE-ITEM-{n}__".</summary>
        public static string RepairPhotoPrefix(string kind, int itemNo) =>
            kind == RepairPhotoKindBefore ? $"BEFORE-ITEM-{itemNo}__" : $"ITEM-{itemNo}__";

        private static readonly System.Text.RegularExpressions.Regex RepairPhotoNameRegex =
            new(@"^(BEFORE-)?ITEM-(\d+)__", System.Text.RegularExpressions.RegexOptions.Compiled);

        /// <summary>Đọc loại ảnh + số hạng mục từ tên file; null nếu không đúng khuôn.</summary>
        public static (string Kind, int ItemNo)? ParseRepairPhoto(string? fileName)
        {
            var m = RepairPhotoNameRegex.Match(fileName ?? string.Empty);
            if (!m.Success) return null;
            return (m.Groups[1].Success ? RepairPhotoKindBefore : RepairPhotoKindAfter, int.Parse(m.Groups[2].Value));
        }

        /// <summary>Lỗi nghiệp vụ khi hoàn tất lệnh sửa mà còn hạng mục thiếu ảnh trước / sau sửa (controller trả 400 kèm lý do).</summary>
        public sealed class RepairPhotosMissingException : Exception
        {
            public RepairPhotosMissingException(string message) : base(message) { }
        }

        public async Task<long?> GetRepairOrderIdAsync(long jobId, bool requireRepairing)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId && !j.IsDeleted);
            if (job == null || (requireRepairing && job.Status != "REPAIRING")) return null;
            return await _db.RepairOrders.Where(r => r.DepotJobId == jobId).Select(r => (long?)r.Id).FirstOrDefaultAsync();
        }

        /// <summary>QC đạt chuyển READY_FOR_OUT, QC trượt chuyển ngược REPAIRING để sửa lại.</summary>
        public async Task<bool> CompleteQcInspectionAsync(long jobId, QcInspectionRequest qcReq, string inspector)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            var repairOrder = job == null ? null : await _db.RepairOrders.FirstOrDefaultAsync(r => r.DepotJobId == jobId);
            if (job == null || repairOrder == null || job.Status != "QC_PENDING") return false;

            repairOrder.CompletedAt = DateTime.UtcNow;
            repairOrder.QcStatus = qcReq.Passed ? "PASSED" : "FAILED";
            repairOrder.QcNotes = qcReq.Comments;
            // QC viên = tài khoản đăng nhập (controller truyền vào); InspectorName client gửi bị bỏ qua.
            repairOrder.InspectorName = inspector;

            // QC đạt trước đây luôn cho READY_FOR_OUT ngay — nhưng container vừa sửa chữa vừa có lệnh vệ
            // sinh song song (tự sinh từ SubmitSurveyAsync khi surveyor chọn dịch vụ vệ sinh cho container
            // vừa hư hỏng) thì phải dừng ở CLEANING để Tổ Vệ Sinh xử lý trước, không được bỏ qua khâu vệ
            // sinh chỉ vì QC sửa chữa đã đạt.
            var hasActiveCleaningRecord = qcReq.Passed && await _db.CleaningRecords
                .AnyAsync(c => c.JobNo == job.JobNo && c.Status != "HANDOVER_TO_OPERATION");
            job.Status = qcReq.Passed ? (hasActiveCleaningRecord ? "CLEANING" : "READY_FOR_OUT") : "REPAIRING";

            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                Action = qcReq.Passed ? "QC_PASSED" : "QC_FAILED",
                User = inspector,
                Timestamp = DateTime.UtcNow,
                Details = $"Kết quả kiểm định QC: {(qcReq.Passed ? "ĐẠT (PASSED)" : "KHÔNG ĐẠT (FAILED)")}. Ghi chú: {qcReq.Comments}"
            });

            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Đổi vị trí yard sau khi kiểm tra tọa độ và không cho phép vào ô đang bị chiếm.</summary>
        public async Task<bool> DispatchForkliftMoveAsync(ForkliftMoveOrderRequest moveReq)
        {
            if (!long.TryParse(moveReq.JobId, out var jobId)) return false;

            var job = await _db.DepotJobs.FindAsync(jobId);
            if (job == null || job.Status == "GATE_OUT") return false;
            if (moveReq.TargetBay <= 0 || moveReq.TargetRow <= 0 || moveReq.TargetTier <= 0 || moveReq.TargetTier > 5) return false;
            var occupied = await _db.YardPositions.AnyAsync(p => p.IsOccupied && p.BlockCode == moveReq.TargetBlock && p.Bay == moveReq.TargetBay && p.Row == moveReq.TargetRow && p.Tier == moveReq.TargetTier && p.OccupiedContainerNo != job.ContainerNo);
            if (occupied) return false;

            var oldPos = string.IsNullOrEmpty(job.BlockCode) ? "Ngoài bãi (khu giám định/vệ sinh)" : $"Block {job.BlockCode} Bay {job.Bay}-Row {job.Row}-Tier {job.Tier}";

            job.BlockCode = moveReq.TargetBlock;
            job.Bay = moveReq.TargetBay;
            job.Row = moveReq.TargetRow;
            job.Tier = moveReq.TargetTier;

            var newPos = $"Block {job.BlockCode} Bay {job.Bay}-Row {job.Row}-Tier {job.Tier}";

            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                Action = "YARD_MOVED",
                User = moveReq.ForkliftId,
                Timestamp = DateTime.UtcNow,
                Details = $"Điều độ xe nâng {moveReq.ForkliftId} di chuyển container từ [{oldPos}] tới [{newPos}] (Mục đích: {moveReq.Purpose})"
            });

            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Loại lỗi nghiệp vụ Gate-Out — controller đổi sang mã HTTP tương ứng.</summary>
        public enum GateOutErrorKind { Validation, NotFound, Conflict, Forbidden }

        /// <summary>Gate-Out bị từ chối kèm thông báo tiếng Việt cụ thể (thay cho bool chung chung trước đây).</summary>
        public sealed class GateOutNotAllowedException : Exception
        {
            public GateOutErrorKind Kind { get; }
            public GateOutNotAllowedException(string message, GateOutErrorKind kind = GateOutErrorKind.Validation) : base(message) { Kind = kind; }
        }

        /// <summary>Cấu hình "Số giờ hiệu lực booking" lưu thành 1 mục danh mục (giống PAYMENT_ACCOUNT), không có bảng setting riêng.</summary>
        public const string GateOutSettingCatalog = "GATE_OUT_SETTING";
        public const string BookingValidityHoursCode = "BOOKING_VALIDITY_HOURS";
        public const int DefaultBookingValidityHours = 24;
        public const int MaxBookingValidityHours = 8760;

        /// <summary>Lý do ra cổng không theo booking (chỉ ADMIN / SUPERVISOR).</summary>
        public static readonly IReadOnlyDictionary<string, string> NoBookingReasons = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["OFF_HIRE"] = "Trả vỏ về hãng",
            ["DEPOT_TRANSFER"] = "Chuyển depot",
            ["OFFSITE_REPAIR"] = "Sửa ngoài depot",
            ["OTHER"] = "Khác"
        };

        private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");

        private static DateTime VietnamDate(DateTime utc) =>
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), VietnamTimeZone).Date;

        private static DateTime VietnamMidnightToUtc(DateTime vietnamDate) =>
            TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(vietnamDate.Date, DateTimeKind.Unspecified), VietnamTimeZone);

        /// <summary>Hạn cuối booking = 00:00 ngày ValidUntil (giờ Việt Nam) + số giờ hiệu lực cấu hình.
        /// ValidUntil giữ nguyên giờ phút như dữ liệu cũ — chỉ lấy NGÀY để so.</summary>
        public static DateTime BookingDeadlineUtc(DateTime validUntilUtc, int validityHours) =>
            VietnamMidnightToUtc(VietnamDate(validUntilUtc)).AddHours(validityHours);

        /// <summary>Mốc nhỏ nhất của ValidUntil để booking còn hạn tại <paramref name="nowUtc"/>:
        /// ValidUntil &gt;= mốc ⇔ BookingDeadlineUtc(ValidUntil) &gt; now. Dùng được trong UPDATE ... WHERE (không cần hàm múi giờ ở DB).</summary>
        public static DateTime BookingMinValidUntilUtc(DateTime nowUtc, int validityHours) =>
            VietnamMidnightToUtc(VietnamDate(nowUtc.AddHours(-validityHours)).AddDays(1));

        /// <summary>Đọc "hours" từ JsonData của mục cấu hình; ngoài 1–8760 coi như không hợp lệ.</summary>
        public static bool TryReadBookingValidityHours(string? json, out int hours)
        {
            hours = 0;
            if (string.IsNullOrWhiteSpace(json)) return false;
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                if (doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object
                    && doc.RootElement.TryGetProperty("hours", out var p)
                    && p.ValueKind == System.Text.Json.JsonValueKind.Number
                    && p.TryGetInt32(out var h) && h >= 1 && h <= MaxBookingValidityHours)
                {
                    hours = h;
                    return true;
                }
            }
            catch (System.Text.Json.JsonException) { }
            return false;
        }

        /// <summary>Số giờ hiệu lực booking đang áp dụng — chưa cấu hình / cấu hình lỗi thì 24 giờ (hết ngày ValidUntil).</summary>
        public async Task<int> GetBookingValidityHoursAsync()
        {
            var json = await _db.MasterCatalogItems.AsNoTracking()
                .Where(x => x.CatalogType == GateOutSettingCatalog && x.Code == BookingValidityHoursCode && x.IsActive && !x.IsDeleted)
                .OrderByDescending(x => x.Id)
                .Select(x => x.JsonData)
                .FirstOrDefaultAsync();
            return TryReadBookingValidityHours(json, out var hours) ? hours : DefaultBookingValidityHours;
        }

        /// <summary>Nhóm loại (DRY, REEFER…) của mã container lấy từ JsonData.category trong DM Loại Container — không đoán theo ký tự trong mã.</summary>
        private async Task<string?> GetContainerCategoryAsync(string isoSize)
        {
            var code = isoSize.Trim().ToUpperInvariant();
            var jsons = await _db.MasterCatalogItems.AsNoTracking()
                .Where(x => x.CatalogType == "CONTAINER_TYPE" && !x.IsDeleted && x.Name.ToUpper() == code)
                .OrderBy(x => x.Id)
                .Select(x => x.JsonData)
                .ToListAsync();
            foreach (var json in jsons)
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(json);
                    if (doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object
                        && doc.RootElement.TryGetProperty("category", out var c)
                        && c.ValueKind == System.Text.Json.JsonValueKind.String
                        && !string.IsNullOrWhiteSpace(c.GetString()))
                        return c.GetString()!.Trim().ToUpperInvariant();
                }
                catch (System.Text.Json.JsonException) { }
            }
            return null;
        }

        private sealed record GateOutBookingMatch(CustomerBooking Booking, string ShippingLineCode, string Category);

        /// <summary>Kiểm tra booking cho 1 hồ sơ theo đúng thứ tự: có số → tồn tại → ACTIVE → còn hạn → đúng hãng →
        /// đúng kích cỡ → đúng nhóm loại → còn số lượng. Dùng chung cho Gate-Out và API kiểm tra (chỉ đọc).</summary>
        private async Task<GateOutBookingMatch> EvaluateGateOutBookingAsync(DepotJob job, string? bookingNo, DateTime nowUtc, int validityHours)
        {
            var no = bookingNo?.Trim().ToUpperInvariant();
            if (string.IsNullOrEmpty(no))
                throw new GateOutNotAllowedException("Chưa nhập số Booking cấp vỏ.");

            var booking = await _db.CustomerBookings.AsNoTracking().FirstOrDefaultAsync(b => b.BookingNo.ToUpper() == no);
            if (booking == null)
                throw new GateOutNotAllowedException($"Không tìm thấy booking {no}.", GateOutErrorKind.NotFound);
            if (!string.Equals(booking.Status, "ACTIVE", StringComparison.OrdinalIgnoreCase))
                throw new GateOutNotAllowedException($"Booking {booking.BookingNo} không còn hoạt động (trạng thái {booking.Status}).");
            if (booking.ValidUntil < BookingMinValidUntilUtc(nowUtc, validityHours))
                throw new GateOutNotAllowedException($"Booking {booking.BookingNo} đã hết hạn ngày {VietnamDate(booking.ValidUntil):dd/MM/yyyy}.");

            var lineCodes = await _db.ShippingLines.AsNoTracking()
                .Where(s => s.Id == booking.ShippingLineId || s.Id == job.ShippingLineId)
                .ToDictionaryAsync(s => s.Id, s => s.Code);
            var bookingLine = lineCodes.GetValueOrDefault(booking.ShippingLineId, booking.ShippingLineId.ToString());
            if (booking.ShippingLineId != job.ShippingLineId)
            {
                var jobLine = lineCodes.GetValueOrDefault(job.ShippingLineId, job.ShippingLineId.ToString());
                throw new GateOutNotAllowedException($"Booking {booking.BookingNo} thuộc hãng tàu {bookingLine}, container {job.ContainerNo} thuộc hãng tàu {jobLine}.");
            }

            var bookingSize = (booking.ContainerSize ?? string.Empty).Trim().ToUpperInvariant();
            var jobSize = (job.IsoSize ?? string.Empty).Trim().ToUpperInvariant();
            if (bookingSize != jobSize)
                throw new GateOutNotAllowedException($"Booking {booking.BookingNo} yêu cầu container {bookingSize}, container {job.ContainerNo} là {jobSize}.");

            var bookingType = (booking.ContainerType ?? string.Empty).Trim().ToUpperInvariant();
            var category = await GetContainerCategoryAsync(jobSize)
                ?? throw new GateOutNotAllowedException($"Loại container {jobSize} chưa khai báo nhóm loại trong DM Loại Container — không đối chiếu được với loại {bookingType} của booking {booking.BookingNo}.");
            if (bookingType != category)
                throw new GateOutNotAllowedException($"Booking {booking.BookingNo} yêu cầu loại {bookingType}, container {job.ContainerNo} thuộc loại {category}.");

            if (booking.UsedCount >= booking.ContainerCount)
                throw new GateOutNotAllowedException($"Booking {booking.BookingNo} đã cấp đủ {booking.UsedCount}/{booking.ContainerCount} vỏ.");

            return new GateOutBookingMatch(booking, bookingLine, category);
        }

        /// <summary>Phí lưu bãi do hệ thống tính khi Gate-Out — phiếu dịch vụ không nhận hạng mục nhóm STORAGE hay mã bậc lưu bãi
        /// mẫu cũ "&lt;mã quy tắc&gt;_T&lt;n&gt;" (depot-fullstack-storage-tariff-pricing).</summary>
        private async Task RejectStorageItemsAsync(IEnumerable<ServiceOrderItemRequest> items)
        {
            var ruleCodes = await _db.StorageTariffRules.AsNoTracking().Select(r => r.Code).ToListAsync();
            var bad = items.FirstOrDefault(i =>
                string.Equals(i.Category?.Trim(), "STORAGE", StringComparison.OrdinalIgnoreCase)
                || ruleCodes.Any(code => (i.ServiceCode ?? string.Empty).Trim().ToUpperInvariant() == code
                    || (i.ServiceCode ?? string.Empty).Trim().ToUpperInvariant().StartsWith(code + "_T")));
            if (bad != null)
                throw new ArgumentException($"Hạng mục '{bad.ServiceName}' là phí lưu bãi — phí lưu bãi do hệ thống tính khi Gate-Out, không lập trên phiếu dịch vụ.");
        }

        public async Task<StorageFeeResult?> GetStorageFeeAsync(long jobId)
        {
            var job = await _db.DepotJobs.AsNoTracking().FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null) return null;
            return await StorageTariffPricing.CalculateAsync(_db, job, job.GateOutDate ?? DateTime.UtcNow);
        }

        /// <summary>Kiểm tra trước 1 booking cho 1 hồ sơ — chỉ đọc, không đổi booking hay hồ sơ.</summary>
        public async Task<GateOutBookingCheckResult> CheckGateOutBookingAsync(long jobId, string? bookingNo)
        {
            var job = await _db.DepotJobs.AsNoTracking().FirstOrDefaultAsync(j => j.Id == jobId)
                ?? throw new GateOutNotAllowedException("Không tìm thấy hồ sơ container.", GateOutErrorKind.NotFound);
            var hours = await GetBookingValidityHoursAsync();
            try
            {
                var m = await EvaluateGateOutBookingAsync(job, bookingNo, DateTime.UtcNow, hours);
                var b = m.Booking;
                return new GateOutBookingCheckResult
                {
                    Valid = true,
                    Message = $"Booking {b.BookingNo} hợp lệ — còn {b.ContainerCount - b.UsedCount}/{b.ContainerCount} vỏ.",
                    BookingNo = b.BookingNo,
                    ShippingLineCode = m.ShippingLineCode,
                    ContainerSize = b.ContainerSize,
                    ContainerType = b.ContainerType,
                    ValidUntilDate = VietnamDate(b.ValidUntil).ToString("dd/MM/yyyy"),
                    ContainerCount = b.ContainerCount,
                    UsedCount = b.UsedCount,
                    Remaining = b.ContainerCount - b.UsedCount
                };
            }
            catch (GateOutNotAllowedException ex)
            {
                return new GateOutBookingCheckResult { Valid = false, Message = ex.Message, BookingNo = bookingNo?.Trim().ToUpperInvariant() };
            }
        }

        /// <summary>
        /// Cấp vỏ / Gate-Out. Mặc định bắt buộc booking hợp lệ (EvaluateGateOutBookingAsync); "không cần booking" phải có lý do
        /// (quyền gateout_nobooking kiểm ở controller). Ghi trong 1 transaction bằng UPDATE có điều kiện: hồ sơ chỉ đổi khi còn
        /// READY_FOR_OUT (chống gửi lặp), booking chỉ tăng khi UsedCount &lt; ContainerCount (chống cấp vượt khi nhiều xe cùng lấy).
        /// </summary>
        public async Task GateOutAsync(long jobId, GateOutRequest request, string actor)
        {
            request ??= new GateOutRequest();
            var nowUtc = DateTime.UtcNow;
            var by = Truncate(string.IsNullOrWhiteSpace(actor) ? "Gate-Out" : actor.Trim(), 200)!;

            var job = await _db.DepotJobs.AsNoTracking().FirstOrDefaultAsync(j => j.Id == jobId)
                ?? throw new GateOutNotAllowedException("Không tìm thấy hồ sơ container.", GateOutErrorKind.NotFound);
            if (job.Status == "GATE_OUT")
                throw new GateOutNotAllowedException($"Container {job.ContainerNo} đã Gate-Out (EIR {job.GateOutEirNo}).", GateOutErrorKind.Conflict);
            if (job.Status != "READY_FOR_OUT")
                throw new GateOutNotAllowedException($"Container {job.ContainerNo} chưa sẵn sàng xuất (trạng thái hiện tại {job.Status}).");
            if (string.IsNullOrWhiteSpace(request.TruckPlate) || string.IsNullOrWhiteSpace(request.DriverName))
                throw new GateOutNotAllowedException("Thiếu biển số xe đầu kéo hoặc tên tài xế.");

            // Container còn nợ phí (ServiceOrder có phí, chưa thu) không được ra cổng — AV không có phiếu nào vẫn ra bình thường.
            var hasUnpaidServiceOrder = await _db.ServiceOrders.AnyAsync(so =>
                so.DepotJobId == job.Id && so.Status != "CANCELLED" && so.GrandTotal > 0 && so.PaymentStatus != "PAID");
            if (hasUnpaidServiceOrder)
                throw new GateOutNotAllowedException($"Container {job.ContainerNo} còn phiếu dịch vụ chưa thanh toán — thu tiền ở màn Thanh Toán trước khi Gate-Out.");

            GateOutBookingMatch? match = null;
            var validityHours = 0;
            string? reasonLabel = null;
            var note = request.NoBookingNote?.Trim();
            if (request.WithoutBooking)
            {
                var reason = request.NoBookingReason?.Trim();
                if (string.IsNullOrEmpty(reason) || !NoBookingReasons.TryGetValue(reason, out reasonLabel))
                    throw new GateOutNotAllowedException("Phải chọn lý do ra cổng không theo booking (Trả vỏ về hãng / Chuyển depot / Sửa ngoài depot / Khác).");
                if (string.Equals(reason, "OTHER", StringComparison.OrdinalIgnoreCase) && string.IsNullOrEmpty(note))
                    throw new GateOutNotAllowedException("Lý do \"Khác\" phải ghi chú cụ thể.");
            }
            else
            {
                validityHours = await GetBookingValidityHoursAsync();
                match = await EvaluateGateOutBookingAsync(job, request.BookingNo, nowUtc, validityHours);
            }

            var truckPlate = request.TruckPlate.Trim().ToUpperInvariant();
            var driverName = request.DriverName.Trim();
            var trailerPlate = request.TrailerPlate;
            var sealNo = request.SealNo;
            var eirNo = $"EIR-OUT-{nowUtc:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";
            var bookingNo = match?.Booking.BookingNo;
            // Phí lưu bãi tính tới lúc ra cổng — ghi nhật ký, chưa chặn ra cổng (depot-fullstack-storage-tariff-pricing).
            var storageFee = await StorageTariffPricing.CalculateAsync(_db, job, nowUtc);

            await using var tx = await _db.Database.BeginTransactionAsync();

            var updatedJobs = await _db.DepotJobs
                .Where(j => j.Id == jobId && j.Status == "READY_FOR_OUT")
                .ExecuteUpdateAsync(s => s
                    .SetProperty(j => j.Status, "GATE_OUT")
                    .SetProperty(j => j.GateOutDate, nowUtc)
                    .SetProperty(j => j.GateOutTruckPlate, truckPlate)
                    .SetProperty(j => j.GateOutDriverName, driverName)
                    .SetProperty(j => j.GateOutTrailerPlate, trailerPlate)
                    .SetProperty(j => j.GateOutSealNo, sealNo)
                    .SetProperty(j => j.GateOutEirNo, eirNo)
                    .SetProperty(j => j.GateOutBookingNo, bookingNo)
                    .SetProperty(j => j.LastModifiedBy, by)
                    .SetProperty(j => j.LastModifiedAt, nowUtc));
            if (updatedJobs == 0)
            {
                await tx.RollbackAsync();
                throw new GateOutNotAllowedException($"Container {job.ContainerNo} vừa được Gate-Out hoặc đổi trạng thái bởi thao tác khác — tải lại để xem.", GateOutErrorKind.Conflict);
            }

            string details;
            if (match != null)
            {
                var bookingId = match.Booking.Id;
                var minValidUntil = BookingMinValidUntilUtc(nowUtc, validityHours);
                var took = await _db.CustomerBookings
                    .Where(b => b.Id == bookingId && b.Status == "ACTIVE" && b.UsedCount < b.ContainerCount && b.ValidUntil >= minValidUntil)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(b => b.UsedCount, b => b.UsedCount + 1)
                        .SetProperty(b => b.LastModifiedBy, by)
                        .SetProperty(b => b.LastModifiedAt, nowUtc));
                var fresh = await _db.CustomerBookings.AsNoTracking().FirstAsync(b => b.Id == bookingId);
                if (took == 0)
                {
                    await tx.RollbackAsync();
                    var reasonText = fresh.UsedCount >= fresh.ContainerCount
                        ? $"Booking {fresh.BookingNo} đã cấp đủ {fresh.UsedCount}/{fresh.ContainerCount} vỏ."
                        : !string.Equals(fresh.Status, "ACTIVE", StringComparison.OrdinalIgnoreCase)
                            ? $"Booking {fresh.BookingNo} không còn hoạt động (trạng thái {fresh.Status})."
                            : $"Booking {fresh.BookingNo} đã hết hạn ngày {VietnamDate(fresh.ValidUntil):dd/MM/yyyy}.";
                    throw new GateOutNotAllowedException(reasonText, GateOutErrorKind.Conflict);
                }
                details = $"Cấp vỏ theo booking {fresh.BookingNo} cho xe {truckPlate}, tài xế {driverName}, EIR {eirNo}. " +
                          $"Booking đã cấp {fresh.UsedCount}/{fresh.ContainerCount}, còn {fresh.ContainerCount - fresh.UsedCount} vỏ.";
            }
            else
            {
                details = $"Cấp vỏ KHÔNG theo booking — lý do: {reasonLabel}{(string.IsNullOrEmpty(note) ? string.Empty : $" ({note})")}. " +
                          $"Xe {truckPlate}, tài xế {driverName}, EIR {eirNo}.";
            }

            details += " " + StorageTariffPricing.AuditText(storageFee);

            var position = await _db.YardPositions.FirstOrDefaultAsync(p => p.IsOccupied && p.OccupiedContainerNo == job.ContainerNo);
            if (position != null)
            {
                position.IsOccupied = false;
                position.OccupiedContainerNo = null;
            }
            _db.AuditLogs.Add(CreateAudit(job.JobNo, jobId, "GATE_OUT", "", Truncate(details, 1000)!));
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
        }

        private static JobAuditLog CreateAudit(string jobNo, long jobId, string action, string user, string details) => new()
        {
            DepotJobId = jobId, JobNo = jobNo, Action = action, User = user,
            Timestamp = DateTime.UtcNow, Details = details
        };

        private static void ValidateGateInRequest(CreateDepotJobRequest request)
        {
            var containerNo = request.ContainerNo.Trim().ToUpperInvariant().Replace("-", string.Empty);
            if (string.IsNullOrWhiteSpace(request.ContainerNo))
                throw new ArgumentException("Thiếu số container.");

            if (containerNo.Length != 11 || !containerNo.All(char.IsLetterOrDigit))
                throw new ArgumentException("Số container phải có đúng 11 ký tự, chỉ gồm chữ và số.");

            // Trước đây chỉ kiểm tra độ dài + toàn chữ/số — số container gõ sai 1 ký tự (vd nhầm 0/O,
            // 1/I) vẫn qua được nếu đủ 11 ký tự, không hề tính check-digit thật theo chuẩn ISO 6346.
            if (!TryGetIso6346CheckDigit(containerNo, out var expectedCheckDigit))
                throw new ArgumentException($"Số container '{containerNo}' không đúng định dạng ISO 6346 (4 chữ cái + 6 số + 1 số kiểm tra).");
            var actualCheckDigit = containerNo[10] - '0';
            if (actualCheckDigit != expectedCheckDigit)
                throw new ArgumentException($"Số container '{containerNo}' sai check-digit ISO 6346 — số kiểm tra đúng phải là {expectedCheckDigit}, không phải {actualCheckDigit}. Kiểm tra lại có gõ nhầm ký tự nào không.");

            if (string.IsNullOrWhiteSpace(request.IsoSize))
                throw new ArgumentException("Thiếu kích thước & loại container.");
            // Loại container có hợp lệ hay không kiểm tra theo danh mục CONTAINER_TYPE thật trong
            // CreateGateInJobAsync (trước đây là danh sách cứng 6 loại ở đây).

            if (string.IsNullOrWhiteSpace(request.ShippingLine))
                throw new ArgumentException("Thiếu hãng tàu.");

            if (request.TareWeightKg <= 0)
                throw new ArgumentException("Tare weight phải lớn hơn 0.");

            if (request.MaxPayloadKg <= 0)
                throw new ArgumentException("Max payload phải lớn hơn 0.");

            if (string.IsNullOrWhiteSpace(request.TruckPlate))
                throw new ArgumentException("Thiếu biển số đầu kéo.");

            if (string.IsNullOrWhiteSpace(request.DriverName))
                throw new ArgumentException("Thiếu họ tên bác tài.");

            if (string.IsNullOrWhiteSpace(request.DriverPhone))
                throw new ArgumentException("Thiếu số điện thoại bác tài.");

            // BUG-025: trước đây nhận SĐT toàn chữ ("abcxyz") và tên dài 1.000 ký tự, in thẳng lên e-EIR.
            if (request.DriverName.Trim().Length > 150)
                throw new ArgumentException("Họ tên bác tài tối đa 150 ký tự.");
            var phoneDigits = new string(request.DriverPhone.Where(char.IsDigit).ToArray());
            if (!request.DriverPhone.Trim().All(c => char.IsDigit(c) || c is ' ' or '.' or '-' or '+' or '(' or ')')
                || phoneDigits.Length is < 9 or > 15)
                throw new ArgumentException($"Số điện thoại bác tài '{request.DriverPhone.Trim()}' không hợp lệ (9–15 chữ số).");

            // Trường này KHÔNG cho gõ tay ngoài UI — frontend tự gắn Id tài khoản đang đăng nhập vào request.
            // Nếu thiếu tức là phiên đăng nhập bị mất (localStorage bị xoá, gọi thẳng API...) nên chặn ngay.
            if (request.GateInStaffId is null || request.GateInStaffId <= 0)
                throw new ArgumentException("Thiếu nhân viên tiếp nhận (phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại).");
        }

        // Bảng quy đổi chữ cái → số theo đúng chuẩn ISO 6346 (bỏ qua bội số của 11: không có giá trị nào
        // là 11, 22, 33...).
        private static readonly Dictionary<char, int> Iso6346LetterValues = new()
        {
            ['A'] = 10, ['B'] = 12, ['C'] = 13, ['D'] = 14, ['E'] = 15, ['F'] = 16, ['G'] = 17, ['H'] = 18,
            ['I'] = 19, ['J'] = 20, ['K'] = 21, ['L'] = 23, ['M'] = 24, ['N'] = 25, ['O'] = 26, ['P'] = 27,
            ['Q'] = 28, ['R'] = 29, ['S'] = 30, ['T'] = 31, ['U'] = 32, ['V'] = 34, ['W'] = 35, ['X'] = 36,
            ['Y'] = 37, ['Z'] = 38
        };

        /// <summary>Tính check-digit chuẩn ISO 6346 (4 chữ cái chủ sở hữu+loại, 6 số serial, trọng số 2^n
        /// theo thứ tự, tổng mod 11 rồi mod 10) cho 10 ký tự đầu của <paramref name="containerNo"/> (đã
        /// chuẩn hoá, đúng 11 ký tự). Trả false nếu không đúng khuôn dạng 4 chữ cái + 6 số.</summary>
        private static bool TryGetIso6346CheckDigit(string containerNo, out int checkDigit)
        {
            checkDigit = 0;
            if (containerNo.Length != 11) return false;
            if (!containerNo.Substring(0, 4).All(char.IsLetter)) return false;
            if (!containerNo.Substring(4, 6).All(char.IsDigit)) return false;

            var sum = 0;
            for (var i = 0; i < 10; i++)
            {
                var ch = containerNo[i];
                var value = char.IsDigit(ch) ? ch - '0' : Iso6346LetterValues[ch];
                sum += value * (1 << i);
            }
            checkDigit = (sum % 11) % 10;
            return true;
        }

        /// <summary>Tổng hợp KPI từ dữ liệu SQL Server cho Dashboard.</summary>
        public async Task<DepotStatisticsSummaryDto> GetDashboardStatsAsync()
        {
            var jobs = await _db.DepotJobs.ToListAsync();

            var totalJobs = jobs.Count;
            var gateIn = jobs.Count(j => j.Status == "GATE_IN");
            var surveying = jobs.Count(j => j.Status == "SURVEYING");
            var estimating = jobs.Count(j => j.Status == "ESTIMATING");
            var repairing = jobs.Count(j => j.Status == "REPAIRING");
            var readyForOut = jobs.Count(j => j.Status == "READY_FOR_OUT");

            var totalRev = await _db.Estimates.SumAsync(e => (decimal?)e.GrandTotal) ?? 0;

            return new DepotStatisticsSummaryDto
            {
                TotalJobs = totalJobs,
                GateInJobs = gateIn,
                SurveyingJobs = surveying,
                EstimatingJobs = estimating,
                RepairingJobs = repairing,
                ReadyForOutJobs = readyForOut,
                TotalRevenueVnd = totalRev,
                SqlDatabaseStatus = "ONLINE",
                EfCoreVersion = "8.0.2"
            };
        }

        public async Task<KpiSummaryDto> GetKpiSummaryAsync()
        {
            var total = await _db.DepotJobs.CountAsync();
            var active = await _db.DepotJobs.CountAsync(x => x.Status != "GATE_OUT");
            var ready = await _db.DepotJobs.CountAsync(x => x.Status == "READY_FOR_OUT");
            var completed = await _db.DepotJobs.CountAsync(x => x.Status == "GATE_OUT");
            var revenue = await _db.Payments.Where(x => x.Status == "PAID").SumAsync(x => (decimal?)x.TotalAmount) ?? 0;
            var qcTotal = await _db.RepairOrders.CountAsync(x => x.QcStatus == "PASSED" || x.QcStatus == "FAILED");
            var qcPassed = await _db.RepairOrders.CountAsync(x => x.QcStatus == "PASSED");
            return new KpiSummaryDto { TotalJobs = total, ActiveJobs = active, ReadyForOutJobs = ready, CompletedJobs = completed, TotalRevenueVnd = revenue, FirstPassYieldPercent = qcTotal == 0 ? 0 : qcPassed * 100m / qcTotal };
        }
    }
}
