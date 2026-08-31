using Depot.Data.EF;
using Depot.Data.Entities.Cleaning;
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
            BeforeCleaningPhotoUrl = "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
            BeforePhotoTimestamp = now,
            TotalCostVnd = items.Sum(x => x.TotalPrice),
            Items = items
        };

        db.CleaningRecords.Add(record);
        await db.SaveChangesAsync();
        return record;
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

        await db.SaveChangesAsync();
        return record;
    }

    public async Task<CleaningRecord> HandoverAsync(long recordId, HandoverCleaningRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.HandoverActor))
            throw new ArgumentException("HandoverActor là bắt buộc.");

        var record = await GetTrackedOrThrowAsync(recordId);

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
                job.Status = "READY_FOR_OUT";
            }
        }

        await db.SaveChangesAsync();
        return record;
    }
}
