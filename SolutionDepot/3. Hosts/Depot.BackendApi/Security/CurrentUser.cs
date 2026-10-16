using System.Security.Claims;

namespace Depot.BackendApi.Security
{
    /// <summary>Đọc danh tính người gọi từ JWT — luôn dùng thay cho ID/tên do client tự gửi trong body/query.</summary>
    public static class CurrentUser
    {
        public const string UserIdClaim = "UserId";
        public const string NameClaim = "unique_name";
        public const string RoleClaim = "role";

        public static long? GetUserId(this ClaimsPrincipal principal) =>
            long.TryParse(principal.FindFirst(UserIdClaim)?.Value, out var id) ? id : null;

        public static string? GetUsername(this ClaimsPrincipal principal) => principal.FindFirst(NameClaim)?.Value;

        public static string? GetFullName(this ClaimsPrincipal principal) => principal.FindFirst("FullName")?.Value;
    }
}
