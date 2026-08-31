using System.Collections.Generic;

namespace Depot.ViewModels
{
    public class NotificationEmployeeDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string ZaloId { get; set; } = string.Empty;
        public string ZaloName { get; set; } = string.Empty;
        public bool ZaloConnected { get; set; }
        public string ZaloStatus { get; set; } = "DISCONNECTED";
        public bool IsActive { get; set; } = true;
        public List<string> SubscribedEvents { get; set; } = new();
    }

    public class UpdateEmployeeSubscriptionRequest
    {
        public List<string> SubscribedEvents { get; set; } = new();
    }

    public class NotificationCustomerDto
    {
        public string Id { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string CustomerType { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool ZaloConnected { get; set; }
        public string ZaloStatus { get; set; } = "DISCONNECTED";
        public bool IsActive { get; set; } = true;
        public CustomerNotificationPreferenceDto Preferences { get; set; } = new();
    }

    public class CustomerNotificationPreferenceDto
    {
        public bool GateIn { get; set; } = true;
        public bool Inspection { get; set; } = true;
        public bool Estimate { get; set; } = true;
        public bool Repair { get; set; } = true;
        public bool Qc { get; set; } = true;
        public bool GateOut { get; set; } = true;
        public bool Invoice { get; set; } = true;
        public bool Payment { get; set; } = true;
        public bool DebtReminder { get; set; } = true;
        public string PreferredChannel { get; set; } = "ZALO_ZNS";
        public bool AutoZnsEnabled { get; set; } = true;
    }

    public class UpdateCustomerPreferenceRequest : CustomerNotificationPreferenceDto
    {
    }

    public class NotificationTemplateRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string TargetAudience { get; set; } = "ALL";
        public string Channel { get; set; } = "IN_APP";
        public string TitleTemplate { get; set; } = string.Empty;
        public string ContentTemplate { get; set; } = string.Empty;
        public List<string> Variables { get; set; } = new();
        public bool IsActive { get; set; } = true;
        public string? CtaButtonText { get; set; }
        public string? CtaButtonUrl { get; set; }
    }

    public class NotificationDashboardKpiDto
    {
        public int TotalToday { get; set; }
        public int SentSuccess { get; set; }
        public int PendingQueue { get; set; }
        public int FailedCount { get; set; }
        public int ActiveEmployeesZalo { get; set; }
        public int ActiveCustomersZalo { get; set; }
        public double SuccessRate { get; set; }
    }
}
