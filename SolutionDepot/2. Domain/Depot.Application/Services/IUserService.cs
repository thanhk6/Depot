using System.Collections.Generic;
using System.Threading.Tasks;
using Depot.Data.Entities.System;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    public interface IUserService
    {
        Task<ApiResult<UserDto>> Authencate(LoginRequest request);
        Task<List<UserDto>> GetUsersAsync();
        Task<UserDto?> GetProfileAsync(long id);
        Task<UserDto?> CreateUserAsync(CreateSystemUserRequest request);
        Task<UserDto?> UpdateUserAsync(long id, UpdateSystemUserRequest request);
        Task<bool> DeleteUserAsync(long id);
        Task<bool> ResetPasswordAsync(long id, ResetPasswordRequest request);
        Task<List<object>> GetRolesAsync();
        Task<bool> UpdateRolePermissionsAsync(string roleCode, UpdateRolePermissionsRequest request);
        Task<SystemSecurityPolicy> GetSecurityPolicyAsync();
        Task<SystemSecurityPolicy> SaveSecurityPolicyAsync(SaveSecurityPolicyRequest request);
        Task<List<SystemAuditLog>> GetAuditLogsAsync(int take = 200);
        Task<SystemAuditLog> CreateAuditLogAsync(CreateSystemAuditLogRequest request);
    }
}
