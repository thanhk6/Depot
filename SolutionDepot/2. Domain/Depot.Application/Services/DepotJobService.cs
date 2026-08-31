using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.Cleaning;
using Depot.Data.Entities.Depot;
using Depot.Data.Entities.Finance;
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
        public async Task<List<DepotJob>> GetAllJobsAsync(DepotJobFilterRequest? filter = null)
        {
            var query = _db.DepotJobs
                .Include(j => j.ShippingLine)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.Damages)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.CleaningItems)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.ChecklistItems)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.Photos)
                .Include(j => j.Estimate)
                    .ThenInclude(e => e!.Items)
                .Include(j => j.RepairOrder)
                .Include(j => j.Payment)
                .Include(j => j.AuditLogs)
                .AsSplitQuery()
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrWhiteSpace(filter.SearchKeyword))
                {
                    var kw = filter.SearchKeyword.Trim().ToUpper();
                    query = query.Where(j => j.ContainerNo.Contains(kw) || j.JobNo.Contains(kw));
                }

                if (!string.IsNullOrWhiteSpace(filter.ShippingLine))
                {
                    query = query.Where(j => j.ShippingLine != null && j.ShippingLine.Code == filter.ShippingLine);
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

            return await query.OrderByDescending(j => j.GateInDate).ToListAsync();
        }

        /// <summary>Tra cứu theo khóa chính; trả null để Controller phản hồi 404.</summary>
        public async Task<DepotJob?> GetJobByIdAsync(long id)
        {
            return await _db.DepotJobs
                .Include(j => j.ShippingLine)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.Damages)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.CleaningItems)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.ChecklistItems)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.Photos)
                .Include(j => j.Estimate)
                    .ThenInclude(e => e!.Items)
                .Include(j => j.RepairOrder)
                .Include(j => j.Payment)
                .Include(j => j.AuditLogs)
                .AsSplitQuery()
                .FirstOrDefaultAsync(j => j.Id == id);
        }

        /// <summary>Tra cứu theo số container, dùng cho cổng và tìm kiếm vận hành.</summary>
        public async Task<DepotJob?> GetJobByContainerNoAsync(string containerNo)
        {
            var upper = containerNo.Trim().ToUpper();
            return await _db.DepotJobs
                .Include(j => j.ShippingLine)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.Damages)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.CleaningItems)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.ChecklistItems)
                .Include(j => j.Survey)
                    .ThenInclude(s => s!.Photos)
                .Include(j => j.Estimate)
                    .ThenInclude(e => e!.Items)
                .Include(j => j.RepairOrder)
                .Include(j => j.Payment)
                .Include(j => j.AuditLogs)
                .AsSplitQuery()
                .FirstOrDefaultAsync(j => j.ContainerNo == upper);
        }

        public async Task<List<DepotJobHistoryDto>> GetHistoryAsync(long jobId)
        {
            return await _db.DepotJobs
                .Where(j => j.Id == jobId)
                .SelectMany(j => j.AuditLogs.Select(log => new DepotJobHistoryDto
                {
                    JobNo = j.JobNo, ContainerNo = j.ContainerNo, Action = log.Action,
                    User = log.User, Timestamp = log.Timestamp, Details = log.Details
                }))
                .OrderByDescending(x => x.Timestamp)
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

            public async Task<bool> UpdateJobStatusAsync(long jobId, UpdateJobStatusRequest request)
            {
                var allowed = new[] { "SURVEYING", "CLEANING", "PAYMENT_PENDING", "WAITING_FORKLIFT", "REPAIRING", "READY_FOR_OUT", "IN_YARD", "CANCELLED" };
                if (!allowed.Contains(request.Status)) return false;
                var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.Id == jobId);
                if (job == null) return false;
                job.Status = request.Status;
                _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "STATUS_UPDATED", "Container UI", $"Đổi trạng thái sang {request.Status}."));
                await _db.SaveChangesAsync();
                return true;
            }

        /// <summary>Gate-In tạo Job + audit + EIR nhập; container đang hoạt động không được trùng.</summary>
        public async Task<DepotJob> CreateGateInJobAsync(CreateDepotJobRequest request)
        {
            ValidateGateInRequest(request);
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

            var jobNo = $"JOB-{DateTime.UtcNow:yyyy}-{new Random().Next(1000, 9999)}";
            var newJob = new DepotJob
            {
                JobNo = jobNo,
                ContainerNo = containerNo,
                IsoSize = request.IsoSize,
                ShippingLineId = shippingLine.Id,
                ShippingLine = shippingLine,
                TareWeightKg = request.TareWeightKg,
                MaxPayloadKg = request.MaxPayloadKg,
                Status = "SURVEYING",
                GateInDate = DateTime.UtcNow,
                BlockCode = "BLOCK_A",
                Bay = 1,
                Row = 1,
                Tier = 1,
                GateInTruckPlate = request.TruckPlate.Trim().ToUpperInvariant(),
                GateInDriverName = request.DriverName.Trim(),
                GateInDriverPhone = request.DriverPhone.Trim(),
                GateInTrailerPlate = string.IsNullOrWhiteSpace(request.TrailerPlate) ? null : request.TrailerPlate.Trim().ToUpperInvariant(),
                GateInSealNo = string.IsNullOrWhiteSpace(request.SealNo) ? null : request.SealNo.Trim(),
                GateInBookingNo = string.IsNullOrWhiteSpace(request.BookingNo) ? null : request.BookingNo.Trim(),
                GateInTruckingCompany = string.IsNullOrWhiteSpace(request.TruckingCompany) ? null : request.TruckingCompany.Trim(),
                GateInRemarks = string.IsNullOrWhiteSpace(request.Remarks) ? null : request.Remarks.Trim(),
                GateInStaffId = staff.Id,
                GateInStaffName = staff.FullName,
                CreatedBy = staff.FullName
            };
            newJob.GateInEirNo = $"EIR-IN-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";

            newJob.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = newJob.Id,
                JobNo = newJob.JobNo,
                Action = "GATE_IN",
                User = staff.FullName,
                Timestamp = DateTime.UtcNow,
                Details = $"Tiếp nhận Container {newJob.ContainerNo} ({newJob.IsoSize}) Hãng tàu: {newJob.ShippingLine?.Code ?? shippingLineCode}"
            });

            _db.DepotJobs.Add(newJob);
            await _db.SaveChangesAsync();
            return newJob;
        }

        /// <summary>Survey ghi hư hỏng và chuyển sang ESTIMATING; không có hư hỏng thì chuyển READY_FOR_OUT.</summary>
        public async Task<bool> SubmitSurveyAsync(long jobId, SurveyRecordViewModel surveyVm)
        {
            var job = await _db.DepotJobs.Include(j => j.Survey).Include(j => j.ShippingLine).FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.Status is "GATE_OUT" or "READY_FOR_OUT") return false;
            if (surveyVm.ConditionRating is not ("A" or "B" or "C" or "D")) return false;
            if (surveyVm.Damages.Any(d => d.Quantity <= 0 || d.LaborHours < 0 || d.LaborRate < 0 || d.MaterialCost < 0)) return false;

            // Giám định viên lấy tự động theo tài khoản đang đăng nhập (Users.Id), không cho nhập tay.
            // Bắt buộc phải resolve được thật trong bảng Users, giống nguyên tắc đã áp dụng ở Gate-In.
            if (surveyVm.SurveyorStaffId is null || surveyVm.SurveyorStaffId <= 0)
                throw new ArgumentException("Thiếu giám định viên (phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại).");
            var surveyor = await _db.Users.FirstOrDefaultAsync(u => u.Id == surveyVm.SurveyorStaffId.Value && !u.IsDeleted);
            if (surveyor == null)
                throw new ArgumentException("Không xác định được giám định viên từ phiên đăng nhập. Vui lòng đăng nhập lại.");

            // Cả 2 thao tác Lưu Nháp và Hoàn Tất đều gọi chung endpoint này, nên phải cập nhật
            // lại đúng bản ghi Survey đã có thay vì tạo mới (tránh trùng DepotJobId).
            var survey = job.Survey ?? new Survey
            {
                DepotJobId = jobId,
                JobNo = job.JobNo
            };
            survey.SurveyorId = surveyor.Id.ToString();
            survey.JobNo = job.JobNo;
            if (job.Survey == null)
            {
                survey.CreatedBy = surveyor.FullName;
            }
            else
            {
                survey.LastModifiedAt = DateTime.UtcNow;
                survey.LastModifiedBy = surveyor.FullName;
            }
            if (job.Survey != null)
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

            foreach (var d in surveyVm.Damages)
            {
                var laborTotal = d.LaborHours * d.LaborRate;
                var itemTotal = laborTotal + d.MaterialCost;

                survey.Damages.Add(new DamageItem
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
                survey.CleaningItems.Add(new SurveyCleaningItem
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
                survey.ChecklistItems.Add(new SurveyChecklistItem
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
                survey.Photos.Add(new SurveyPhotoItem
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
                job.Status = surveyVm.ConditionRating == "B"
                    ? "CLEANING"
                    : surveyVm.Damages.Count == 0 ? "READY_FOR_OUT" : "ESTIMATING";
                job.SurveyClaimedByStaffId = null;
                job.SurveyClaimedByName = null;
                job.SurveyClaimedAt = null;

                // CleaningRecord.cs ghi rõ trong doc comment "phát sinh từ e-EIR có kết luận CL" nhưng
                // trước đây KHÔNG nơi nào tự tạo cả — Tổ Vệ Sinh phải tự tra container rồi nhập lại từ đầu
                // toàn bộ lý do/dịch vụ/giá mà surveyor đã chọn sẵn ở tab Vệ Sinh. Giờ tự sinh lệnh vệ sinh
                // ngay khi Hoàn Tất Giám Định với cấp B (CL), tái dùng đúng cleaningItems đã nhập, để module
                // Cleaning thấy container này ngay mà không cần nhập lại. Chặn tạo trùng nếu job đã có sẵn 1
                // lệnh vệ sinh còn hoạt động (chưa HANDOVER_TO_OPERATION) — tránh nộp lại phiếu nhiều lần
                // (VD sửa remarks rồi Hoàn Tất lại) sinh ra nhiều lệnh vệ sinh trùng cho cùng 1 job.
                if (surveyVm.ConditionRating == "B")
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
                            IsoCode = job.IsoSize?.StartsWith("20") == true ? (isReefer ? "22R1" : "22G1") : (isReefer ? "45R1" : "45G1"),
                            SizeType = job.IsoSize,
                            TypeName = isReefer ? "Reefer" : "Dry High Cube",
                            ShippingLine = job.ShippingLine?.Code,
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
            if (job.Survey == null)
            {
                _db.Surveys.Add(survey);
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

            var lockedByAnotherActive = job.SurveyClaimedByStaffId.HasValue
                && job.SurveyClaimedByStaffId.Value != staffId
                && job.SurveyClaimedAt.HasValue
                && DateTime.UtcNow - job.SurveyClaimedAt.Value < ClaimLockTimeout;
            if (lockedByAnotherActive)
                throw new InvalidOperationException($"Container đang được giám định bởi {job.SurveyClaimedByName}. Vui lòng chọn container khác.");

            job.SurveyClaimedByStaffId = staff.Id;
            job.SurveyClaimedByName = staff.FullName;
            job.SurveyClaimedAt = DateTime.UtcNow;

            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "SURVEY_CLAIMED", staff.FullName, $"Nhận giám định container {job.ContainerNo}."));
            await _db.SaveChangesAsync();
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
        public async Task<bool> CreateOrUpdateEstimateAsync(long jobId, EstimateViewModel estimateVm)
        {
            var job = await _db.DepotJobs
                .Include(j => j.Survey)
                .Include(j => j.Estimate)
                .FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.Survey == null || job.Status != "ESTIMATING") return false;
            if (estimateVm.Items.Any(i => i.Quantity <= 0 || i.UnitPrice < 0)) return false;

            var calculatedSubtotal = estimateVm.Items.Sum(i => i.Quantity * i.UnitPrice);
            var laborCost = estimateVm.TotalLaborCost >= 0 ? estimateVm.TotalLaborCost : 0;
            var materialCost = estimateVm.TotalMaterialCost >= 0 ? estimateVm.TotalMaterialCost : 0;
            var tax = estimateVm.TotalTax >= 0 ? estimateVm.TotalTax : (calculatedSubtotal + laborCost + materialCost) * 0.1m;
            var grandTotal = estimateVm.GrandTotal > 0 ? estimateVm.GrandTotal : calculatedSubtotal + laborCost + materialCost + tax;

            var estimate = job.Estimate ?? new Estimate
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
            estimate.Status = "PENDING_APPROVAL";

            if (job.Estimate != null)
            {
                estimate.Items.Clear();
            }
            foreach (var item in estimateVm.Items)
            {
                estimate.Items.Add(new EstimateItem
                {
                    EstimateId = estimate.Id,
                    ItemDescription = item.ItemDescription,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Amount = item.Amount
                });
            }

            if (job.Estimate == null)
            {
                _db.Estimates.Add(estimate);
            }
            job.Status = "ESTIMATING";

            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                Action = "ESTIMATE_CREATED",
                User = "Phòng Báo Giá",
                Timestamp = DateTime.UtcNow,
                Details = $"Lập báo giá {estimate.EstimateNo} tổng cộng {estimate.GrandTotal:N0} {estimate.Currency}"
            });

            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Approval chỉ nhận estimate PENDING_APPROVAL và chuyển hồ sơ sang REPAIRING.</summary>
        public async Task<bool> ApproveEstimateAsync(long jobId, string approverName)
        {
            var job = await _db.DepotJobs.Include(j => j.Estimate).FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.Estimate == null || job.Estimate.Status != "PENDING_APPROVAL" || job.Status != "ESTIMATING") return false;

            job.Estimate.Status = "APPROVED";
            job.Estimate.ApprovedAt = DateTime.UtcNow;
            job.Estimate.ApprovedBy = string.IsNullOrWhiteSpace(approverName) ? "Hãng tàu" : approverName;

            job.Status = "REPAIRING";

            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                Action = "ESTIMATE_APPROVED",
                User = approverName,
                Timestamp = DateTime.UtcNow,
                Details = $"Phê duyệt báo giá sửa chữa. Chuyển trạng thái sang REPAIRING"
            });

            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Từ chối báo giá và đưa hồ sơ về ESTIMATING để estimator chỉnh sửa,
        /// thay vì chuyển thẳng sang sửa chữa như nhánh Approved.
        /// </summary>
        /// <summary>Reject lưu lý do audit và đưa estimate về ESTIMATING để chỉnh sửa lại.</summary>
        public async Task<bool> RejectEstimateAsync(long jobId, RejectEstimateRequest request)
        {
            var job = await _db.DepotJobs
                .Include(j => j.Estimate)
                .FirstOrDefaultAsync(j => j.Id == jobId);
            if (job?.Estimate == null || job.Estimate.Status != "PENDING_APPROVAL" || string.IsNullOrWhiteSpace(request.Reason)) return false;

            job.Estimate.Status = "REJECTED";
            job.Estimate.ApprovedBy = string.IsNullOrWhiteSpace(request.RejectedBy) ? "Hãng tàu" : request.RejectedBy;
            job.Estimate.ApprovedAt = DateTime.UtcNow;
            job.Status = "ESTIMATING";
            _db.AuditLogs.Add(CreateAudit(job.JobNo, jobId, "ESTIMATE_REJECTED", job.Estimate.ApprovedBy, request.Reason.Trim()));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Khớp giao dịch VietQR theo JobNo/container; số tiền không dương bị từ chối.</summary>
        public async Task<bool> ProcessBankWebhookPaymentAsync(BankWebhookPaymentRequest webhook)
        {
            var jobs = await _db.DepotJobs.Include(j => j.Payment).ToListAsync();
            var targetJob = jobs.FirstOrDefault(j =>
                webhook.Content.Contains(j.JobNo, StringComparison.OrdinalIgnoreCase) ||
                webhook.Content.Contains(j.ContainerNo, StringComparison.OrdinalIgnoreCase));

            if (targetJob == null) return false;
            if (webhook.Amount <= 0) return false;

            targetJob.Payment = new Payment
            {
                DepotJobId = targetJob.Id,
                InvoiceNo = $"INV-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(100, 999)}",
                Amount = webhook.Amount,
                Tax = webhook.Amount * 0.1m,
                TotalAmount = webhook.Amount * 1.1m,
                Status = "PAID",
                PaidAt = webhook.TransactionTime,
                PaymentMethod = "VIETQR_BANK_TRANSFER",
                CashierName = "Hệ thống VietQR AutoMatch"
            };
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

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ProcessPaymentAsync(long jobId, ProcessPaymentRequest request)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.Id == jobId);
            if (job == null || request.Amount <= 0) return false;
            var serviceOrder = await _db.ServiceOrders.FirstOrDefaultAsync(x => x.DepotJobId == job.Id && x.Status != "CANCELLED");
            if (serviceOrder == null || serviceOrder.PaymentStatus == "PAID" || request.Amount != serviceOrder.GrandTotal) return false;
            var payment = await _db.Payments.FirstOrDefaultAsync(x => x.DepotJobId == job.Id);
            if (payment == null)
            {
                payment = new Payment { DepotJobId = job.Id, InvoiceNo = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100, 999)}" };
                _db.Payments.Add(payment);
            }
            payment.Amount = serviceOrder.Subtotal; payment.Tax = serviceOrder.TotalVat; payment.TotalAmount = serviceOrder.GrandTotal;
            payment.Status = "PAID"; payment.PaidAt = DateTime.UtcNow; payment.PaymentMethod = request.Method; payment.CashierName = "System";
            serviceOrder.PaymentStatus = "PAID"; serviceOrder.Status = "PAID";
            serviceOrder.PaymentMethod = request.Method; serviceOrder.TransactionId = request.TransactionRef; serviceOrder.PaidAt = payment.PaidAt;
            job.Status = "PAID";
            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "PAYMENT_RECEIVED", "System", $"Thanh toán {request.Amount:N0} qua {request.Method}."));
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<object?> CreateServiceOrderAsync(CreateServiceOrderRequest request)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(x => x.JobNo == request.JobNo && x.ContainerNo == request.ContainerNo);
            if (job == null || request.Items.Count == 0 || request.Items.Any(x => x.Quantity <= 0 || x.UnitPrice < 0)) return null;
            var existingOrder = await _db.ServiceOrders.AnyAsync(x => x.DepotJobId == job.Id);
            if (existingOrder) return null;
            var order = new Depot.Data.Entities.Finance.ServiceOrder
            {
                OrderNo = $"SO-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100, 999)}",
                DepotJobId = job.Id, ContainerNo = job.ContainerNo,
                ShippingLineCode = request.ShippingLineCode, IsoCode = request.IsoCode, Size = request.Size, Type = request.Type,
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
                var hasActiveCleaningRecord = await _db.CleaningRecords
                    .AnyAsync(c => c.JobNo == job.JobNo && c.Status != "HANDOVER_TO_OPERATION");
                if (!hasActiveCleaningRecord)
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
                        SizeType = request.Size ?? job.IsoSize,
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
            if (request.Items.Count == 0 || request.Items.Any(x => x.Quantity <= 0 || x.UnitPrice < 0)) return null;

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
            job.BlockCode = request.TargetBlock.Trim().ToUpperInvariant();
            job.Bay = request.TargetBay; job.Row = request.TargetRow; job.Tier = request.TargetTier;
            job.Status = "IN_YARD";
            var slot = await _db.YardPositions.FirstOrDefaultAsync(x => x.BlockCode == job.BlockCode && x.Bay == job.Bay && x.Row == job.Row && x.Tier == job.Tier);
            if (slot == null) _db.YardPositions.Add(new Depot.Data.Entities.Yard.YardPosition { BlockCode = job.BlockCode, Bay = job.Bay, Row = job.Row, Tier = job.Tier, IsOccupied = true, OccupiedContainerNo = job.ContainerNo });
            else { slot.IsOccupied = true; slot.OccupiedContainerNo = job.ContainerNo; }
            _db.AuditLogs.Add(CreateAudit(job.JobNo, job.Id, "FORKLIFT_MOVE_COMPLETED", request.OperatorName ?? "Forklift", $"Hạ bãi {job.BlockCode}-{job.Bay}-{job.Row}-{job.Tier}, xe {request.ForkliftCode ?? "-"}."));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Tạo Work Order bắt đầu thi công; chỉ chạy sau khi hãng tàu duyệt estimate.</summary>
        public async Task<bool> StartRepairAsync(long jobId, string technicianId, string technicianName)
        {
            var job = await _db.DepotJobs
                .Include(j => j.Estimate)
                .Include(j => j.RepairOrder)
                .FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.Estimate?.Status != "APPROVED" || job.Status != "REPAIRING") return false;

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

            await _db.SaveChangesAsync();
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
            _db.AuditLogs.Add(CreateAudit(job.JobNo, jobId, "REPAIR_ASSIGNED", request.Team, $"Phân công đội {request.Team}, {request.Workers.Count} kỹ thuật viên."));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>Đóng Work Order và chuyển sang QC_PENDING; ảnh được ghi nhận ở audit note hiện tại.</summary>
        public async Task<bool> CompleteRepairAsync(long jobId, RepairCompleteRequest request)
        {
            var job = await _db.DepotJobs.Include(j => j.RepairOrder).FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.RepairOrder == null || job.Status != "REPAIRING") return false;

            job.RepairOrder.StartedAt ??= DateTime.UtcNow;
            job.RepairOrder.CompletedAt = DateTime.UtcNow;
            job.RepairOrder.QcStatus = "PENDING";
            job.RepairOrder.QcNotes = request.Photos.Count == 0 ? "Hoàn thành không kèm ảnh." : $"Đã đính kèm {request.Photos.Count} ảnh.";
            job.Status = "QC_PENDING";
            _db.AuditLogs.Add(CreateAudit(job.JobNo, jobId, "REPAIR_COMPLETED", job.RepairOrder.TechnicianName, "Hoàn tất thi công, chuyển QC."));
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>QC đạt chuyển READY_FOR_OUT, QC trượt chuyển ngược REPAIRING để sửa lại.</summary>
        public async Task<bool> CompleteQcInspectionAsync(QcInspectionRequest qcReq)
        {
            if (!long.TryParse(qcReq.JobId, out var jobId)) return false;

            var job = await _db.DepotJobs.Include(j => j.RepairOrder).FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.RepairOrder == null || job.Status != "QC_PENDING") return false;

            if (job.RepairOrder != null)
            {
                job.RepairOrder.CompletedAt = DateTime.UtcNow;
                job.RepairOrder.QcStatus = qcReq.Passed ? "PASSED" : "FAILED";
                job.RepairOrder.QcNotes = qcReq.Comments;
                job.RepairOrder.InspectorName = qcReq.InspectorName;
            }

            job.Status = qcReq.Passed ? "READY_FOR_OUT" : "REPAIRING";

            _db.AuditLogs.Add(new JobAuditLog
            {
                DepotJobId = jobId,
                JobNo = job.JobNo,
                Action = qcReq.Passed ? "QC_PASSED" : "QC_FAILED",
                User = qcReq.InspectorName,
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

            var oldPos = $"Block {job.BlockCode} Bay {job.Bay}-Row {job.Row}-Tier {job.Tier}";

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

        /// <summary>Gate-Out chỉ nhận container READY_FOR_OUT, sinh EIR xuất và giải phóng vị trí bãi.</summary>
        public async Task<bool> GateOutAsync(long jobId, GateOutRequest request)
        {
            var job = await _db.DepotJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null || job.Status != "READY_FOR_OUT" || string.IsNullOrWhiteSpace(request.TruckPlate) || string.IsNullOrWhiteSpace(request.DriverName)) return false;

            job.Status = "GATE_OUT";
            job.GateOutDate = DateTime.UtcNow;
            job.GateOutTruckPlate = request.TruckPlate.Trim().ToUpperInvariant();
            job.GateOutDriverName = request.DriverName.Trim();
            job.GateOutTrailerPlate = request.TrailerPlate;
            job.GateOutSealNo = request.SealNo;
            job.GateOutEirNo = $"EIR-OUT-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";

            var position = await _db.YardPositions.FirstOrDefaultAsync(p => p.IsOccupied && p.OccupiedContainerNo == job.ContainerNo);
            if (position != null)
            {
                position.IsOccupied = false;
                position.OccupiedContainerNo = null;
            }
            _db.AuditLogs.Add(CreateAudit(job.JobNo, jobId, "GATE_OUT", request.DriverName, $"Cấp vỏ cho xe {job.GateOutTruckPlate}, EIR {job.GateOutEirNo}."));
            await _db.SaveChangesAsync();
            return true;
        }

        private static JobAuditLog CreateAudit(string jobNo, long jobId, string action, string user, string details) => new()
        {
            DepotJobId = jobId, JobNo = jobNo, Action = action, User = user,
            Timestamp = DateTime.UtcNow, Details = details
        };

        private static void ValidateGateInRequest(CreateDepotJobRequest request)
        {
            var containerNo = request.ContainerNo.Trim().ToUpperInvariant().Replace("-", string.Empty);
            var validSizes = new[] { "20GP", "40GP", "40HC", "45HC", "20RF", "40RH" };
            if (string.IsNullOrWhiteSpace(request.ContainerNo))
                throw new ArgumentException("Thiếu số container.");

            if (containerNo.Length != 11 || !containerNo.All(char.IsLetterOrDigit))
                throw new ArgumentException("Số container phải có đúng 11 ký tự, chỉ gồm chữ và số.");

            if (!validSizes.Contains(request.IsoSize.ToUpperInvariant()))
                throw new ArgumentException($"Loại ISO '{request.IsoSize}' không hợp lệ. Hỗ trợ: {string.Join(", ", validSizes)}.");

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

            // Trường này KHÔNG cho gõ tay ngoài UI — frontend tự gắn Id tài khoản đang đăng nhập vào request.
            // Nếu thiếu tức là phiên đăng nhập bị mất (localStorage bị xoá, gọi thẳng API...) nên chặn ngay.
            if (request.GateInStaffId is null || request.GateInStaffId <= 0)
                throw new ArgumentException("Thiếu nhân viên tiếp nhận (phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại).");
        }

        /// <summary>Tổng hợp KPI từ dữ liệu SQL Server cho Dashboard.</summary>
        public async Task<DepotStatisticsSummaryDto> GetDashboardStatsAsync()
        {
            var jobs = await _db.DepotJobs.Include(j => j.Estimate).ToListAsync();

            var totalJobs = jobs.Count;
            var gateIn = jobs.Count(j => j.Status == "GATE_IN");
            var surveying = jobs.Count(j => j.Status == "SURVEYING");
            var estimating = jobs.Count(j => j.Status == "ESTIMATING");
            var repairing = jobs.Count(j => j.Status == "REPAIRING");
            var readyForOut = jobs.Count(j => j.Status == "READY_FOR_OUT");

            var totalRev = jobs.Where(j => j.Estimate != null).Sum(j => j.Estimate!.GrandTotal);

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
