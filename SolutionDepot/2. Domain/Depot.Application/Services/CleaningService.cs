using Depot.Data.EF;
using Depot.Data.Entities.Cleaning;
using Depot.Data.Entities.Depot;
using Depot.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace Depot.Application.Services;

public interface ICleaningService
{
    Task<List<CleaningRecord>> GetAsync(string? status = null);
    Task<CleaningRecord?> GetByIdAsync(long id);
    Task<CleaningRecord> CreateAsync(CreateCleaningRecordRequest request);
    Task<CleaningRecord> ToggleItemAsync(long recordId, long itemId, ToggleCleaningItemRequest request);
    Task<CleaningRecord> CompleteAllItemsAsync(long recordId, CompleteAllCleaningItemsRequest request);
    Task<CleaningRecord> UpdateExecutionAsync(long recordId, UpdateCleaningExecutionRequest request);
    Task<CleaningRecord> HandoverAsync(long recordId, HandoverCleaningRequest request);
}

public sealed class CleaningService : ICleaningService
{
    private readonly DepotDbContext db;
    public CleaningService(DepotDbContext db) => this.db = db;

    private IQueryable<CleaningRecord> Query() => db.CleaningRecords.Include(x => x.Items);

    public async Task<List<CleaningRecord>> GetAsync(string? status = null)
    {
        var query = Query().AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(x => x.Status == status);
        return await query.OrderByDescending(x => x.CreatedAt).ToListAsync();
    }


    public Task<CleaningRecord?> GetByIdAsync(long id) => Query().FirstOrDefaultAsync(x => x.Id == id);

    private async Task<CleaningRecord> GetTrackedOrThrowAsync(long recordId)
        => await Query().FirstOrDefaultAsync(x => x.Id == recordId)
           ?? throw new KeyNotFoundException($"Không tìm thấy lệnh vệ sinh Id={recordId}");

    public async Task<CleaningRecord> CreateAsync(CreateCleaningRecordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ContainerNo))
            throw new ArgumentException("ContainerNo là bắt buộc.");

        var containerNoNormalized = request.ContainerNo.Trim().ToUpperInvariant();
        // Không có ràng buộc UNIQUE nào ở DB cho ContainerNo — trước đây bấm "+ Tiếp Nhận" cho 1 container
        // đã có sẵn lệnh vệ sinh đang hoạt động (tự sinh từ Survey khi giám định chấm CL, hoặc bấm nhầm 2
        // lần) sẽ tạo thêm 1 bản ghi trùng, cả 2 độc lập không đồng bộ tiến độ với nhau.
        var hasActiveRecord = await db.CleaningRecords
            .AnyAsync(x => x.ContainerNo == containerNoNormalized && x.Status != "HANDOVER_TO_OPERATION");
        if (hasActiveRecord)
            throw new ArgumentException($"Container {containerNoNormalized} đã có lệnh vệ sinh đang hoạt động, không thể tạo trùng.");

        // Trước đây JobNo (nếu có gửi lên) không được kiểm tra tồn tại — JobNo sai chính tả hoặc trỏ tới
        // job đã xoá vẫn tạo được CleaningRecord bình thường, và lỗi chỉ lộ ra âm thầm ở bước bàn giao
        // sau này (HandoverAsync không tìm thấy job tương ứng nên bỏ qua, DepotJob.Status không bao giờ
        // chuyển sang READY_FOR_OUT, Gate-Out bị kẹt không rõ nguyên nhân). Chặn ngay từ lúc tạo.
        if (!string.IsNullOrWhiteSpace(request.JobNo))
        {
            var jobExists = await db.DepotJobs.AnyAsync(j => j.JobNo == request.JobNo && !j.IsDeleted);
            if (!jobExists)
                throw new ArgumentException($"JobNo '{request.JobNo}' không tồn tại trong hệ thống.");
        }

        // BUG-021: trước đây tạo được lệnh vệ sinh cho số container không có trong bãi (không có hồ sơ nào).
        var activeJob = await db.DepotJobs.AsNoTracking().FirstOrDefaultAsync(j => j.ContainerNo == containerNoNormalized && j.Status != "GATE_OUT");
        if (activeJob == null)
            throw new ArgumentException($"Container {containerNoNormalized} không có hồ sơ nào đang trong bãi.");
        if (request.Items.Any(i => i.UnitPrice < 0 || i.EstimatedDurationMin < 0))
            throw new ArgumentException("Đơn giá và thời gian dự kiến của hạng mục vệ sinh không được âm.");
        // Đơn giá do server tra theo Biểu Phí Vệ Sinh + loại container của hồ sơ, bỏ qua giá gửi lên (depot-fullstack-cleaning-tariff-pricing).
        await CleaningTariffPricing.ApplyToCleaningRecordAsync(db, activeJob.IsoSize, request.Items);

        var now = DateTime.UtcNow;
        var code = "CL-" + now.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999);

        var items = request.Items.Select(i => new CleaningWorkItem
        {
            CleaningRecordCode = code,
            CleaningCode = i.CleaningCode,
            CleaningName = i.CleaningName,
            ChemicalRequired = i.ChemicalRequired,
            ChemicalName = i.ChemicalName,
            EstimatedDurationMin = i.EstimatedDurationMin,
            UnitPrice = i.UnitPrice,
            TotalPrice = i.UnitPrice,
            ResponsibleParty = i.ResponsibleParty,
            Notes = i.Notes,
            IsCompleted = false
        }).ToList();

        var record = new CleaningRecord
        {
            Code = code,
            JobNo = request.JobNo,
            ContainerNo = containerNoNormalized,
            IsoCode = request.IsoCode,
            SizeType = request.SizeType,
            TypeName = request.TypeName,
            ShippingLine = request.ShippingLine,
            EeirNo = request.EeirNo,
            CleaningBay = request.CleaningBay,
            Status = "PENDING_CLEANING",
            CleaningStaff = request.CleaningStaff,
            TargetQualityGrade = request.TargetQualityGrade,
            CleaningNotes = request.Notes,
            // Không gán ảnh mẫu (trước đây là 1 ảnh Unsplash cố định) — chỉ lưu ảnh thật khi có.
            BeforeCleaningPhotoUrl = null,
            BeforePhotoTimestamp = now,
            TotalCostVnd = items.Sum(x => x.TotalPrice),
            Items = items
        };

        db.CleaningRecords.Add(record);
        await AddJobAuditAsync(record.JobNo, containerNoNormalized, "CLEANING_RECEIVED", request.CleaningStaff ?? "Tổ Vệ Sinh",
            $"Tiếp nhận vệ sinh {code}: {items.Count} hạng mục, dự kiến {record.TotalCostVnd:N0} đ.");
        await db.SaveChangesAsync();
        return record;
    }

    /// <summary>Ghi nhật ký vào vòng đời container (JobAuditLog) — tìm hồ sơ theo JobNo, không có thì theo số
    /// container đang trong bãi. Trước đây bước vệ sinh không ghi gì nên timeline container thiếu hẳn công đoạn này.</summary>
    private async Task AddJobAuditAsync(string? jobNo, string containerNo, string action, string user, string details)
    {
        var job = !string.IsNullOrWhiteSpace(jobNo)
            ? await db.DepotJobs.FirstOrDefaultAsync(j => j.JobNo == jobNo)
            : await db.DepotJobs.Where(j => j.ContainerNo == containerNo && j.Status != "GATE_OUT")
                .OrderByDescending(j => j.Id).FirstOrDefaultAsync();
        if (job is null) return;
        db.AuditLogs.Add(new JobAuditLog
        {
            DepotJobId = job.Id,
            JobNo = job.JobNo,
            Action = action,
            // Người thao tác thật = tài khoản đăng nhập (AuditActorInterceptor gán khi lưu); đây chỉ là dự phòng.
            User = string.IsNullOrWhiteSpace(user) ? "Tổ Vệ Sinh" : user,
            Timestamp = DateTime.UtcNow,
            Details = details
        });
    }

    public async Task<CleaningRecord> ToggleItemAsync(long recordId, long itemId, ToggleCleaningItemRequest request)
    {
        var record = await GetTrackedOrThrowAsync(recordId);
        var item = record.Items.FirstOrDefault(x => x.Id == itemId)
            ?? throw new KeyNotFoundException($"Không tìm thấy hạng mục Id={itemId} trong lệnh vệ sinh {recordId}");

        item.IsCompleted = request.IsCompleted;
        item.CompletedAt = request.IsCompleted ? DateTime.UtcNow : null;
        item.CompletedBy = request.IsCompleted ? request.PerformedBy : null;

        if (record.Status is "PENDING_CLEANING" or "IN_CLEANING")
            record.Status = record.Items.Any(x => x.IsCompleted) ? "IN_CLEANING" : "PENDING_CLEANING";

        // Ghi lại từng lần đánh dấu tiến độ (người thao tác = tài khoản đăng nhập, gán khi lưu).
        await AddJobAuditAsync(record.JobNo, record.ContainerNo, request.IsCompleted ? "CLEANING_ITEM_DONE" : "CLEANING_ITEM_UNDONE", request.PerformedBy ?? "",
            $"{(request.IsCompleted ? "Xong" : "Bỏ đánh dấu")} hạng mục '{item.CleaningName}' ({record.Items.Count(x => x.IsCompleted)}/{record.Items.Count}) — lệnh {record.Code}.");
        await db.SaveChangesAsync();
        return record;
    }

    public async Task<CleaningRecord> CompleteAllItemsAsync(long recordId, CompleteAllCleaningItemsRequest request)
    {
        var record = await GetTrackedOrThrowAsync(recordId);
        var allDone = record.Items.Count > 0 && record.Items.All(x => x.IsCompleted);
        var now = DateTime.UtcNow;

        foreach (var item in record.Items)
        {
            item.IsCompleted = !allDone;
            item.CompletedAt = !allDone ? now : null;
            item.CompletedBy = !allDone ? request.PerformedBy : null;
        }

        if (record.Status is "PENDING_CLEANING" or "IN_CLEANING")
            record.Status = !allDone ? "IN_CLEANING" : "PENDING_CLEANING";

        await AddJobAuditAsync(record.JobNo, record.ContainerNo, !allDone ? "CLEANING_ALL_DONE" : "CLEANING_ALL_UNDONE", request.PerformedBy ?? "",
            $"{(!allDone ? "Đánh dấu xong tất cả" : "Bỏ đánh dấu tất cả")} {record.Items.Count} hạng mục — lệnh {record.Code}.");
        await db.SaveChangesAsync();
        return record;
    }

    public async Task<CleaningRecord> UpdateExecutionAsync(long recordId, UpdateCleaningExecutionRequest request)
    {
        var record = await GetTrackedOrThrowAsync(recordId);

        if (request.CleaningStaff is not null) record.CleaningStaff = request.CleaningStaff;
        if (request.WaterPressureBar is not null) record.WaterPressureBar = request.WaterPressureBar.Value;
        if (request.ChemicalUsed is not null) record.ChemicalUsed = request.ChemicalUsed;
        if (request.ChemicalVolumeLiters is not null) record.ChemicalVolumeLiters = request.ChemicalVolumeLiters;
        if (request.TemperatureCelsius is not null) record.TemperatureCelsius = request.TemperatureCelsius;
        if (request.TargetQualityGrade is not null) record.TargetQualityGrade = request.TargetQualityGrade;
        if (request.CleaningNotes is not null) record.CleaningNotes = request.CleaningNotes;
        if (request.AfterCleaningPhotoUrl is not null)
        {
            record.AfterCleaningPhotoUrl = request.AfterCleaningPhotoUrl;
            record.AfterPhotoTimestamp = DateTime.UtcNow;
        }

        // Ghi lại thông số thi công đã cập nhật.
        var changes = new List<string>();
        if (request.CleaningStaff is not null) changes.Add($"nhân viên {request.CleaningStaff}");
        if (request.WaterPressureBar is not null) changes.Add($"áp lực {request.WaterPressureBar} bar");
        if (request.ChemicalUsed is not null) changes.Add($"hoá chất {request.ChemicalUsed}");
        if (request.ChemicalVolumeLiters is not null) changes.Add($"{request.ChemicalVolumeLiters} lít");
        if (request.TemperatureCelsius is not null) changes.Add($"nhiệt độ {request.TemperatureCelsius}°C");
        if (request.TargetQualityGrade is not null) changes.Add($"hạng mục tiêu {request.TargetQualityGrade}");
        if (request.CleaningNotes is not null) changes.Add("ghi chú");
        if (request.AfterCleaningPhotoUrl is not null) changes.Add("ảnh sau vệ sinh");
        if (changes.Count > 0)
            await AddJobAuditAsync(record.JobNo, record.ContainerNo, "CLEANING_EXECUTION_UPDATED", request.CleaningStaff ?? "",
                $"Cập nhật thi công vệ sinh {record.Code}: {string.Join(", ", changes)}.");
        await db.SaveChangesAsync();
        return record;
    }

    public async Task<CleaningRecord> HandoverAsync(long recordId, HandoverCleaningRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.HandoverActor))
            throw new ArgumentException("HandoverActor là bắt buộc.");

        var record = await GetTrackedOrThrowAsync(recordId);

        // Trước đây không chặn gọi Handover lần 2 — vì mọi Item đã IsCompleted=true từ lần đầu,
        // pendingCount luôn = 0 nên lần gọi sau vẫn "chạy thành công", ghi đè HandoverToOperationDate/
        // HandoverActor, làm sai lệch lịch sử bàn giao (tưởng có 2 lần bàn giao thật).
        if (record.Status == "HANDOVER_TO_OPERATION")
            throw new ArgumentException("Lệnh vệ sinh này đã được bàn giao trước đó, không thể bàn giao lại.");

        // Trước đây bàn giao TỰ ĐỘNG đánh dấu hoàn thành mọi hạng mục còn dang dở (`item.IsCompleted = true`
        // vô điều kiện, bất kể trạng thái thật) — nghĩa là KTV bấm "Hoàn Tất Vệ Sinh & Chuyển Qua Khai Thác"
        // được ngay cả khi CHƯA làm hạng mục nào, hệ thống vẫn âm thầm coi như đã xong hết rồi cấp AV. Theo
        // yêu cầu người dùng: phải tự tay đánh dấu xong (qua ToggleItemAsync/CompleteAllItemsAsync) HẾT toàn
        // bộ hạng mục thật thì mới cho phép bàn giao — chặn ở đây để không bên nào bỏ qua được, kể cả khi
        // frontend có bug/bị bypass.
        if (record.Items.Count == 0)
            throw new ArgumentException("Lệnh vệ sinh chưa có hạng mục dịch vụ nào, không thể bàn giao.");
        var pendingCount = record.Items.Count(x => !x.IsCompleted);
        if (pendingCount > 0)
            throw new ArgumentException(
                $"Còn {pendingCount}/{record.Items.Count} hạng mục vệ sinh chưa hoàn thành — phải đánh dấu xong tất cả trước khi bàn giao Khai Thác.");

        var now = DateTime.UtcNow;
        record.Status = "HANDOVER_TO_OPERATION";
        record.CleaningStaff ??= request.HandoverActor;
        record.CompletedAt = now;
        record.AfterPhotoTimestamp ??= now;
        record.HandoverToOperationDate = now;
        record.HandoverActor = request.HandoverActor;
        record.TotalCostVnd = record.Items.Sum(x => x.TotalPrice);

        // Bàn giao vệ sinh phải tự chuyển DepotJob.Status → READY_FOR_OUT ngay trong cùng transaction,
        // giống nguyên tắc SubmitSurveyAsync đã dùng cho ESTIMATING/READY_FOR_OUT — trước đây việc này
        // giao cho frontend gọi thêm 1 API riêng (containerApi.updateStatus) bằng `containerNo` (chuỗi)
        // thay vì `DepotJob.Id` (số) mà route yêu cầu, nên luôn 404 âm thầm và job kẹt mãi ở CLEANING dù
        // CleaningRecord đã báo hoàn tất, khiến Gate-Out sau đó luôn bị từ chối. Chỉ chuyển khi job đang
        // đúng ở CLEANING (bỏ qua lệnh vệ sinh không gắn JobNo — walk-in không qua Gate-In thật).
        if (!string.IsNullOrWhiteSpace(record.JobNo))
        {
            var job = await db.DepotJobs.FirstOrDefaultAsync(j => j.JobNo == record.JobNo);
            if (job is not null && job.Status == "CLEANING")
            {
                // Container giám định có hư hỏng → chờ báo giá sửa chữa (sau khi Khai thác lập phiếu + thu tiền);
                // không hư hỏng → sẵn sàng xuất.
                var hasDamages = await db.Surveys
                    .Where(s => s.DepotJobId == job.Id)
                    .AnyAsync(s => db.Set<DamageItem>().Any(d => d.SurveyId == s.Id));
                job.Status = hasDamages ? "ESTIMATING" : "READY_FOR_OUT";
            }
        }
        await AddJobAuditAsync(record.JobNo, record.ContainerNo, "CLEANING_HANDOVER", request.HandoverActor,
            $"Hoàn tất vệ sinh {record.Code} ({record.Items.Count} hạng mục, {record.TotalCostVnd:N0} đ) — bàn giao Khai thác lập phiếu dịch vụ.");

        await db.SaveChangesAsync();
        return record;
    }
}
