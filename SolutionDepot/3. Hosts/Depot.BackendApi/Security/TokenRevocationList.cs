using System;
using Microsoft.Extensions.Caching.Memory;

namespace Depot.BackendApi.Security
{
    /// <summary>
    /// Danh sách jti của token đã đăng xuất, giữ tới đúng lúc token hết hạn (sau đó token tự vô hiệu).
    /// BUG-011: trước đây đăng xuất chỉ xoá token ở trình duyệt, ai giữ bản sao token vẫn gọi API được tới 8 giờ.
    /// Lưu trong bộ nhớ tiến trình — đủ cho triển khai 1 instance BackendApi hiện tại; khởi động lại backend thì
    /// danh sách mất (token đã đăng xuất dùng lại được tới khi hết hạn). Nhiều instance thì phải chuyển sang Redis/DB.
    /// </summary>
    public sealed class TokenRevocationList
    {
        private readonly IMemoryCache _cache;
        public TokenRevocationList(IMemoryCache cache) => _cache = cache;

        public void Revoke(string jti, DateTime expiresAtUtc)
        {
            var ttl = expiresAtUtc - DateTime.UtcNow;
            if (ttl <= TimeSpan.Zero) return;
            _cache.Set(Key(jti), true, ttl + TimeSpan.FromMinutes(1)); // + ClockSkew
        }

        public bool IsRevoked(string? jti) => !string.IsNullOrEmpty(jti) && _cache.TryGetValue(Key(jti), out _);

        private static string Key(string jti) => "auth:revoked-jti:" + jti;
    }
}
