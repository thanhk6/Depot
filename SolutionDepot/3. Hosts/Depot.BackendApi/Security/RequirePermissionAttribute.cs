using System;
using System.Linq;
using System.Threading.Tasks;
using Depot.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Depot.BackendApi.Security
{
    /// <summary>
    /// Chỉ cho gọi endpoint khi vai trò trong token có ÍT NHẤT 1 nhóm chức năng được liệt kê
    /// (ma trận ở <see cref="RolePermissions"/>). Đặt ở action sẽ thay thế attribute ở cấp controller
    /// vì ASP.NET Core gộp (AND) mọi [Authorize] — nên controller nào có action cần quyền khác nhau thì
    /// khai báo riêng từng action, không đặt ở cấp class.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public sealed class RequirePermissionAttribute : AuthorizeAttribute
    {
        public const string PolicyPrefix = "perm:";

        public RequirePermissionAttribute(params string[] permissions)
        {
            if (permissions.Length == 0) throw new ArgumentException("Cần ít nhất 1 nhóm quyền.", nameof(permissions));
            Policy = PolicyPrefix + string.Join(',', permissions);
        }
    }

    /// <summary>Dựng policy "perm:a,b" theo yêu cầu thay vì phải đăng ký trước từng tổ hợp trong Program.cs.</summary>
    public sealed class PermissionPolicyProvider : DefaultAuthorizationPolicyProvider
    {
        public PermissionPolicyProvider(IOptions<AuthorizationOptions> options) : base(options) { }

        public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
        {
            if (!policyName.StartsWith(RequirePermissionAttribute.PolicyPrefix, StringComparison.Ordinal))
                return await base.GetPolicyAsync(policyName);

            var required = policyName[RequirePermissionAttribute.PolicyPrefix.Length..]
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            return new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .RequireAssertion(ctx => RolePermissions.HasAny(ctx.User.FindFirst(CurrentUser.RoleClaim)?.Value, required))
                .Build();
        }
    }
}
