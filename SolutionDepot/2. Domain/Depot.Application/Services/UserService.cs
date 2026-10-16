using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Depot.Data.EF;
using Depot.Data.Entities.System;
using Depot.Data.Security;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    public class UserService : IUserService
    {
        private readonly DepotDbContext _db;

        public UserService(DepotDbContext db)
        {
            _db = db;
        }

        public async Task<ApiResult<UserDto>> Authencate(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return ApiResult<UserDto>.Failure("Tên đăng nhập và mật khẩu không được để trống");
            }

            var usernameLower = request.Username.Trim().ToLower();
            var dbUser = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u =>
                    u.Username.ToLower() == usernameLower || u.Email.ToLower() == usernameLower);

            if (dbUser == null || !dbUser.IsActive)
            {
                return ApiResult<UserDto>.Failure("Tên đăng nhập hoặc mật khẩu không đúng");
            }

            if (!PasswordHashHelper.VerifyPassword(request.Password, dbUser.PasswordHash))
            {
                return ApiResult<UserDto>.Failure("Tên đăng nhập hoặc mật khẩu không đúng");
            }

            var userDto = new UserDto
            {
                Id = dbUser.Id,
                Username = dbUser.Username,
                FullName = dbUser.FullName,
                Email = dbUser.Email,
                RoleName = dbUser.Role?.RoleCode ?? string.Empty,
                IsActive = dbUser.IsActive,
                AllowedTabs = GetRoleTabs(dbUser.Role?.RoleCode ?? string.Empty)
            };

            return ApiResult<UserDto>.Success(userDto, "Đăng nhập thành công");
        }

        public async Task<List<UserDto>> GetUsersAsync()
        {
            var users = await _db.Users.AsNoTracking().Include(x => x.Role).Where(x => !x.IsDeleted).OrderBy(x => x.Username).ToListAsync();
            return users.Select(ToDto).ToList();
        }

        public async Task<UserDto?> GetProfileAsync(long id)
        {
            var user = await _db.Users.AsNoTracking().Include(x => x.Role).FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted && x.IsActive);
            if (user == null) return null;
            var dto = ToDto(user);
            dto.AllowedTabs = GetRoleTabs(user.Role?.RoleCode ?? string.Empty);
            return dto;
        }

        public async Task<UserDto?> CreateUserAsync(CreateSystemUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.RoleName)) return null;
            var role = await _db.Roles.FirstOrDefaultAsync(x => x.RoleCode == request.RoleName.Trim());
            if (role == null || await _db.Users.AnyAsync(x => x.Username == request.Username)) return null;
            ValidateEmail(request.Email);
            // Trước đây gán cứng "123456" cho MỌI tài khoản mới — ai biết username cũng đăng nhập được
            // ngay mà không cần biết mật khẩu thật (brute-force/đoán mật khẩu tầm thường). Sinh mật khẩu
            // tạm ngẫu nhiên, chỉ trả về đúng 1 lần trong response tạo tài khoản để admin gửi cho nhân
            // viên — không lưu plaintext trong DB.
            var temporaryPassword = PasswordHashHelper.GenerateTemporaryPassword();
            var entity = new Depot.Data.Entities.System.SystemUser
            {
                Username = request.Username.Trim(),
                PasswordHash = PasswordHashHelper.HashPassword(temporaryPassword),
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim(),
                RoleId = role.Id,
                Role = role,
                IsActive = true
            };
            _db.Users.Add(entity);
            await _db.SaveChangesAsync();
            var dto = ToDto(entity);
            dto.TemporaryPassword = temporaryPassword;
            return dto;
        }

        public async Task<UserDto?> UpdateUserAsync(long id, UpdateSystemUserRequest request)
        {
            var entity = await _db.Users.FirstOrDefaultAsync(x => x.Id == id);
            var role = await _db.Roles.FirstOrDefaultAsync(x => x.RoleCode == request.RoleName.Trim());
            if (entity == null || role == null) return null;
            ValidateEmail(request.Email);
            entity.Username = request.Username.Trim(); entity.FullName = request.FullName.Trim();
            entity.Email = request.Email.Trim(); entity.RoleId = role.Id; entity.Role = role; entity.IsActive = request.IsActive;
            await _db.SaveChangesAsync();
            return ToDto(entity);
        }

        public async Task<bool> DeleteUserAsync(long id)
        {
            // Xoá mềm (IsDeleted) thay vì Remove() cứng — trước đây xoá cứng để lại FK "ma" trên
            // DepotJob.GateInStaffId/SurveyClaimedByStaffId (cột chỉ lưu số tham chiếu, KHÔNG có FK
            // constraint thật ở DB, xem comment DepotJobConfiguration.cs), khiến các job cũ tra ngược
            // ra nhân viên sẽ nhận null âm thầm sau khi tài khoản bị xoá. Đồng bộ đúng pattern soft-delete
            // đã dùng cho Customer/Driver/Vehicle/PortalUser ở MasterDataService.cs.
            var entity = await _db.Users.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (entity == null) return false;
            entity.IsDeleted = true;
            entity.IsActive = false;
            entity.DeletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetPasswordAsync(long id, ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword)) return false;
            var entity = await _db.Users.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return false;
            entity.PasswordHash = PasswordHashHelper.HashPassword(request.NewPassword);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<object>> GetRolesAsync()
        {
            var roles = await _db.Roles.AsNoTracking().OrderBy(x => x.RoleCode).ToListAsync();
            return roles.Select(x => (object)new
            {
                x.Id,
                x.RoleCode,
                x.RoleName,
                x.Description,
                Permissions = string.IsNullOrWhiteSpace(x.PermissionsJson)
                    ? null
                    : JsonSerializer.Deserialize<List<string>>(x.PermissionsJson)
            }).ToList();
        }

        public async Task<bool> UpdateRolePermissionsAsync(string roleCode, UpdateRolePermissionsRequest request)
        {
            var role = await _db.Roles.FirstOrDefaultAsync(x => x.RoleCode == roleCode.Trim());
            if (role == null) return false;
            role.PermissionsJson = JsonSerializer.Serialize(request.Permissions);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<SystemSecurityPolicy> GetSecurityPolicyAsync()
        {
            var policy = await _db.SystemSecurityPolicies.FirstOrDefaultAsync(x => x.Code == "DEFAULT");
            if (policy != null) return policy;

            policy = new SystemSecurityPolicy { Code = "DEFAULT" };
            _db.SystemSecurityPolicies.Add(policy);
            await _db.SaveChangesAsync();
            return policy;
        }

        public async Task<SystemSecurityPolicy> SaveSecurityPolicyAsync(SaveSecurityPolicyRequest request)
        {
            var policy = await _db.SystemSecurityPolicies.FirstOrDefaultAsync(x => x.Code == "DEFAULT");
            if (policy == null)
            {
                policy = new SystemSecurityPolicy { Code = "DEFAULT" };
                _db.SystemSecurityPolicies.Add(policy);
            }

            policy.PasswordMinLength = request.PasswordMinLength;
            policy.RequireSpecialChar = request.RequireSpecialChar;
            policy.RequireUppercase = request.RequireUppercase;
            policy.RequireDigits = request.RequireDigits;
            policy.PasswordExpireDays = request.PasswordExpireDays;
            policy.MaxFailedAttempts = request.MaxFailedAttempts;
            policy.LockoutDurationMinutes = request.LockoutDurationMinutes;
            policy.SessionTimeoutMinutes = request.SessionTimeoutMinutes;
            policy.Enforce2FaForAdmins = request.Enforce2FaForAdmins;
            policy.IpWhitelistEnabled = request.IpWhitelistEnabled;
            policy.AllowedIpRangesCsv = string.Join(",", request.AllowedIpRanges ?? new List<string>());

            await _db.SaveChangesAsync();
            return policy;
        }

        public async Task<List<SystemAuditLog>> GetAuditLogsAsync(int take = 200)
        {
            return await _db.SystemAuditLogs.AsNoTracking()
                .OrderByDescending(x => x.OccurredAt)
                .Take(take)
                .ToListAsync();
        }

        public async Task<SystemAuditLog> CreateAuditLogAsync(CreateSystemAuditLogRequest request)
        {
            var now = DateTime.UtcNow;
            var log = new SystemAuditLog
            {
                Code = "AUD-" + now.ToString("yyyyMMddHHmmss") + "-" + Random.Shared.Next(100, 999),
                Action = request.Action,
                ActionLabel = request.ActionLabel,
                TargetResource = request.TargetResource,
                Details = request.Details,
                PerformedByName = request.PerformedByName,
                PerformedByRole = request.PerformedByRole,
                IpAddress = request.IpAddress,
                DeviceInfo = request.DeviceInfo,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "SUCCESS" : request.Status,
                OccurredAt = now
            };
            _db.SystemAuditLogs.Add(log);
            await _db.SaveChangesAsync();
            return log;
        }

        // BUG-024: email người dùng trước đây lưu được chuỗi bất kỳ ("abc").
        private static void ValidateEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email)) return;
            if (!System.Net.Mail.MailAddress.TryCreate(email.Trim(), out var parsed) || parsed.Address != email.Trim() || !parsed.Host.Contains('.'))
                throw new ArgumentException($"Email '{email}' không đúng định dạng.");
        }

        private static UserDto ToDto(Depot.Data.Entities.System.SystemUser user) => new()
        {
            Id = user.Id, Username = user.Username, FullName = user.FullName, Email = user.Email,
            RoleName = user.Role?.RoleCode ?? string.Empty, IsActive = user.IsActive, AllowedTabs = new List<string>()
        };

        // Cùng ma trận với phân quyền API ([RequirePermission]) để menu và API không bao giờ lệch nhau.
        private static List<string> GetRoleTabs(string role) => RolePermissions.ForRole(role).ToList();
    }
}
