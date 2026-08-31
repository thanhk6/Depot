using System.Text.Json;
using Depot.Data.EF;
using Depot.Data.Entities.Integration;
using Depot.Data.Entities.Master;
using Depot.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace Depot.Application.Services;

public interface INotificationService
{
    Task<List<NotificationRecord>> GetAsync(string? status = null, string? recipientId = null);
    Task<NotificationRecord> SendAsync(SendNotificationRequest request);

    Task<List<NotificationEmployeeDto>> GetEmployeesAsync();
    Task<NotificationEmployeeDto?> UpdateEmployeeSubscriptionAsync(string username, UpdateEmployeeSubscriptionRequest request);

    Task<List<NotificationCustomerDto>> GetCustomersAsync();
    Task<NotificationCustomerDto?> UpdateCustomerPreferenceAsync(string customerCode, UpdateCustomerPreferenceRequest request);

    Task<List<NotificationTemplate>> GetTemplatesAsync();
    Task<NotificationTemplate> CreateTemplateAsync(NotificationTemplateRequest request);
    Task<NotificationTemplate?> UpdateTemplateAsync(string code, NotificationTemplateRequest request);
    Task<bool> DeleteTemplateAsync(string code);

    Task<List<NotificationRecord>> GetQueueAsync();
    Task<NotificationRecord?> ResendAsync(long id);
    Task<NotificationRecord?> RetryAsync(long id);
    Task<bool> CancelQueueItemAsync(long id);
    Task<int> ProcessAllQueueAsync();

    Task<NotificationDashboardKpiDto> GetDashboardKpiAsync();
}

public sealed class NotificationService : INotificationService
{
    private readonly DepotDbContext db;
    public NotificationService(DepotDbContext db) => this.db = db;

    public async Task<List<NotificationRecord>> GetAsync(string? status = null, string? recipientId = null)
    {
        var query = db.NotificationRecords.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(recipientId)) query = query.Where(x => x.RecipientId == recipientId);
        return await query.OrderByDescending(x => x.CreatedAt).ToListAsync();
    }

    public async Task<NotificationRecord> SendAsync(SendNotificationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Content)) throw new ArgumentException("Title và Content là bắt buộc.");
        var record = new NotificationRecord
        {
            TrackingCode = $"NTF-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}",
            TemplateCode = request.TemplateCode, EventType = request.EventType, RecipientType = request.RecipientType,
            RecipientId = request.RecipientId, RecipientName = request.RecipientName, RecipientPhone = request.RecipientPhone,
            Channel = request.Channel, Title = request.Title, Content = request.Content, Status = "SENT", Priority = request.Priority,
            EntityType = request.EntityType, EntityId = request.EntityId, EntityReference = request.EntityReference,
            SentAt = DateTime.UtcNow, IsRead = false
        };
        db.NotificationRecords.Add(record);
        await db.SaveChangesAsync();
        return record;
    }

    // ===================== EMPLOYEES =====================

    public async Task<List<NotificationEmployeeDto>> GetEmployeesAsync()
    {
        var users = await db.Users.AsNoTracking().Include(x => x.Role).Where(x => x.IsActive).ToListAsync();
        var subs = await db.EmployeeNotificationSubscriptions.AsNoTracking().ToListAsync();
        var subsByUsername = subs.ToDictionary(x => x.Username, x => x);

        return users.Select(u =>
        {
            subsByUsername.TryGetValue(u.Username, out var sub);
            return new NotificationEmployeeDto
            {
                Id = u.Username,
                Name = u.FullName,
                Department = u.Role?.RoleName ?? string.Empty,
                Role = u.Role?.RoleCode ?? string.Empty,
                Phone = string.Empty,
                Email = u.Email,
                ZaloId = string.Empty,
                ZaloName = sub?.ZaloName ?? string.Empty,
                ZaloConnected = sub?.ZaloConnected ?? false,
                ZaloStatus = (sub?.ZaloConnected ?? false) ? "CONNECTED" : "DISCONNECTED",
                IsActive = u.IsActive,
                SubscribedEvents = sub != null ? JsonSerializer.Deserialize<List<string>>(sub.SubscribedEventsJson) ?? new() : new()
            };
        }).ToList();
    }

    public async Task<NotificationEmployeeDto?> UpdateEmployeeSubscriptionAsync(string username, UpdateEmployeeSubscriptionRequest request)
    {
        var user = await db.Users.AsNoTracking().Include(x => x.Role).FirstOrDefaultAsync(x => x.Username == username);
        if (user == null) return null;

        var sub = await db.EmployeeNotificationSubscriptions.FirstOrDefaultAsync(x => x.Username == username);
        if (sub == null)
        {
            sub = new EmployeeNotificationSubscription
            {
                Code = "ENS-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999),
                Username = username
            };
            db.EmployeeNotificationSubscriptions.Add(sub);
        }
        sub.SubscribedEventsJson = JsonSerializer.Serialize(request.SubscribedEvents);
        await db.SaveChangesAsync();

        return new NotificationEmployeeDto
        {
            Id = user.Username,
            Name = user.FullName,
            Department = user.Role?.RoleName ?? string.Empty,
            Role = user.Role?.RoleCode ?? string.Empty,
            Email = user.Email,
            ZaloName = sub.ZaloName ?? string.Empty,
            ZaloConnected = sub.ZaloConnected,
            ZaloStatus = sub.ZaloConnected ? "CONNECTED" : "DISCONNECTED",
            IsActive = user.IsActive,
            SubscribedEvents = request.SubscribedEvents
        };
    }

    // ===================== CUSTOMERS =====================

    private static NotificationCustomerDto MapCustomer(CustomerCompany c, CustomerNotificationPreference? pref) => new()
    {
        Id = c.Code,
        Code = c.Code,
        Name = c.Name,
        CustomerType = c.CustomerType,
        ContactPerson = c.ContactPerson ?? string.Empty,
        Phone = c.Phone ?? string.Empty,
        Email = c.Email ?? string.Empty,
        ZaloConnected = pref?.ZaloConnected ?? false,
        ZaloStatus = (pref?.ZaloConnected ?? false) ? "CONNECTED" : "DISCONNECTED",
        IsActive = c.Status == "ACTIVE",
        Preferences = pref != null
            ? new CustomerNotificationPreferenceDto
            {
                GateIn = pref.GateIn, Inspection = pref.Inspection, Estimate = pref.Estimate, Repair = pref.Repair,
                Qc = pref.Qc, GateOut = pref.GateOut, Invoice = pref.Invoice, Payment = pref.Payment,
                DebtReminder = pref.DebtReminder, PreferredChannel = pref.PreferredChannel, AutoZnsEnabled = pref.AutoZnsEnabled
            }
            : new CustomerNotificationPreferenceDto()
    };

    public async Task<List<NotificationCustomerDto>> GetCustomersAsync()
    {
        var customers = await db.CustomerCompanies.AsNoTracking().Where(x => x.Status == "ACTIVE").ToListAsync();
        var prefs = await db.CustomerNotificationPreferences.AsNoTracking().ToListAsync();
        var prefsByCode = prefs.ToDictionary(x => x.CustomerCode, x => x);
        return customers.Select(c => MapCustomer(c, prefsByCode.TryGetValue(c.Code, out var p) ? p : null)).ToList();
    }

    public async Task<NotificationCustomerDto?> UpdateCustomerPreferenceAsync(string customerCode, UpdateCustomerPreferenceRequest request)
    {
        var customer = await db.CustomerCompanies.AsNoTracking().FirstOrDefaultAsync(x => x.Code == customerCode);
        if (customer == null) return null;

        var pref = await db.CustomerNotificationPreferences.FirstOrDefaultAsync(x => x.CustomerCode == customerCode);
        if (pref == null)
        {
            pref = new CustomerNotificationPreference
            {
                Code = "CNP-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999),
                CustomerCode = customerCode
            };
            db.CustomerNotificationPreferences.Add(pref);
        }
        pref.GateIn = request.GateIn; pref.Inspection = request.Inspection; pref.Estimate = request.Estimate;
        pref.Repair = request.Repair; pref.Qc = request.Qc; pref.GateOut = request.GateOut;
        pref.Invoice = request.Invoice; pref.Payment = request.Payment; pref.DebtReminder = request.DebtReminder;
        pref.PreferredChannel = request.PreferredChannel; pref.AutoZnsEnabled = request.AutoZnsEnabled;
        await db.SaveChangesAsync();

        return MapCustomer(customer, pref);
    }

    // ===================== TEMPLATES =====================

    public async Task<List<NotificationTemplate>> GetTemplatesAsync()
        => await db.NotificationTemplates.AsNoTracking().OrderBy(x => x.Code).ToListAsync();

    public async Task<NotificationTemplate> CreateTemplateAsync(NotificationTemplateRequest request)
    {
        var template = new NotificationTemplate { Code = request.Code };
        ApplyTemplateFields(template, request);
        db.NotificationTemplates.Add(template);
        await db.SaveChangesAsync();
        return template;
    }

    public async Task<NotificationTemplate?> UpdateTemplateAsync(string code, NotificationTemplateRequest request)
    {
        var template = await db.NotificationTemplates.FirstOrDefaultAsync(x => x.Code == code);
        if (template == null) return null;
        ApplyTemplateFields(template, request);
        await db.SaveChangesAsync();
        return template;
    }

    private static void ApplyTemplateFields(NotificationTemplate template, NotificationTemplateRequest request)
    {
        template.Name = request.Name;
        template.EventType = request.EventType;
        template.TargetAudience = request.TargetAudience;
        template.Channel = request.Channel;
        template.TitleTemplate = request.TitleTemplate;
        template.ContentTemplate = request.ContentTemplate;
        template.VariablesJson = JsonSerializer.Serialize(request.Variables);
        template.IsActive = request.IsActive;
        template.CtaButtonText = request.CtaButtonText;
        template.CtaButtonUrl = request.CtaButtonUrl;
    }

    public async Task<bool> DeleteTemplateAsync(string code)
    {
        var template = await db.NotificationTemplates.FirstOrDefaultAsync(x => x.Code == code);
        if (template == null) return false;
        db.NotificationTemplates.Remove(template);
        await db.SaveChangesAsync();
        return true;
    }

    // ===================== QUEUE =====================

    public async Task<List<NotificationRecord>> GetQueueAsync()
        => await db.NotificationRecords.AsNoTracking()
            .Where(x => x.Status == "PENDING" || x.Status == "FAILED")
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

    public async Task<NotificationRecord?> ResendAsync(long id)
    {
        var record = await db.NotificationRecords.FirstOrDefaultAsync(x => x.Id == id);
        if (record == null) return null;
        record.Status = "SENT";
        record.RetryCount += 1;
        record.SentAt = DateTime.UtcNow;
        record.ErrorMessage = null;
        await db.SaveChangesAsync();
        return record;
    }

    public async Task<NotificationRecord?> RetryAsync(long id) => await ResendAsync(id);

    public async Task<bool> CancelQueueItemAsync(long id)
    {
        var record = await db.NotificationRecords.FirstOrDefaultAsync(x => x.Id == id);
        if (record == null) return false;
        record.Status = "CANCELLED";
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<int> ProcessAllQueueAsync()
    {
        var pending = await db.NotificationRecords.Where(x => x.Status == "PENDING").ToListAsync();
        foreach (var record in pending)
        {
            record.Status = "SENT";
            record.SentAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync();
        return pending.Count;
    }

    // ===================== DASHBOARD =====================

    public async Task<NotificationDashboardKpiDto> GetDashboardKpiAsync()
    {
        var today = DateTime.UtcNow.Date;
        var todayRecords = await db.NotificationRecords.AsNoTracking().Where(x => x.CreatedAt >= today).ToListAsync();
        var totalToday = todayRecords.Count;
        var sentSuccess = todayRecords.Count(x => x.Status == "SENT");
        var failedCount = todayRecords.Count(x => x.Status == "FAILED");
        var pendingQueue = await db.NotificationRecords.CountAsync(x => x.Status == "PENDING");
        var activeEmployeesZalo = await db.EmployeeNotificationSubscriptions.CountAsync(x => x.ZaloConnected);
        var activeCustomersZalo = await db.CustomerNotificationPreferences.CountAsync(x => x.ZaloConnected);

        return new NotificationDashboardKpiDto
        {
            TotalToday = totalToday,
            SentSuccess = sentSuccess,
            PendingQueue = pendingQueue,
            FailedCount = failedCount,
            ActiveEmployeesZalo = activeEmployeesZalo,
            ActiveCustomersZalo = activeCustomersZalo,
            SuccessRate = totalToday > 0 ? Math.Round((double)sentSuccess / totalToday * 100, 1) : 100
        };
    }
}
