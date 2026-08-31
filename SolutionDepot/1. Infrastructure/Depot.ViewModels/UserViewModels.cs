using System;
using System.Collections.Generic;

namespace Depot.ViewModels
{
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public long Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = "GATE_OP";
        public bool IsActive { get; set; } = true;
        public List<string> AllowedTabs { get; set; } = new();
    }

    public class CreateSystemUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
    }

    public class UpdateSystemUserRequest : CreateSystemUserRequest
    {
        public bool IsActive { get; set; } = true;
    }

    public class ResetPasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
        public bool ForceChangeOnNextLogin { get; set; }
        public string? PerformedBy { get; set; }
    }

    public class UpdateRolePermissionsRequest
    {
        public List<string> Permissions { get; set; } = new();
        public string? PerformedBy { get; set; }
    }

    public class SaveSecurityPolicyRequest
    {
        public int PasswordMinLength { get; set; } = 8;
        public bool RequireSpecialChar { get; set; } = true;
        public bool RequireUppercase { get; set; } = true;
        public bool RequireDigits { get; set; } = true;
        public int PasswordExpireDays { get; set; } = 90;
        public int MaxFailedAttempts { get; set; } = 5;
        public int LockoutDurationMinutes { get; set; } = 30;
        public int SessionTimeoutMinutes { get; set; } = 60;
        public bool Enforce2FaForAdmins { get; set; }
        public bool IpWhitelistEnabled { get; set; }
        public List<string> AllowedIpRanges { get; set; } = new();
        public string? PerformedBy { get; set; }
    }

    public class CreateSystemAuditLogRequest
    {
        public string Action { get; set; } = string.Empty;
        public string ActionLabel { get; set; } = string.Empty;
        public string TargetResource { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string PerformedByName { get; set; } = string.Empty;
        public string? PerformedByRole { get; set; }
        public string? IpAddress { get; set; }
        public string? DeviceInfo { get; set; }
        public string Status { get; set; } = "SUCCESS";
    }
}
