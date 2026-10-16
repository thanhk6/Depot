using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Depot.ViewModels;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Depot.BackendApi.Security
{
    public sealed class JwtOptions
    {
        public const string DevPlaceholderKey = "DEV_ONLY_INSECURE_JWT_KEY_REPLACE_IN_PRODUCTION_0123456789";

        public string Key { get; init; } = string.Empty;
        public string Issuer { get; init; } = string.Empty;
        public string Audience { get; init; } = string.Empty;
        public int ExpireMinutes { get; init; } = 480;

        public static JwtOptions From(IConfiguration configuration) => new()
        {
            Key = configuration["Jwt:Key"] ?? string.Empty,
            Issuer = configuration["Jwt:Issuer"] ?? "SolutionDepot.Api",
            Audience = configuration["Jwt:Audience"] ?? "SolutionDepot.Client",
            ExpireMinutes = int.TryParse(configuration["Jwt:ExpireMinutes"], out var m) && m > 0 ? m : 480
        };

        public SymmetricSecurityKey SigningKey => new(Encoding.UTF8.GetBytes(Key));
    }

    public interface IJwtTokenService
    {
        (string Token, DateTime ExpiresAt) CreateToken(UserDto user);
    }

    public sealed class JwtTokenService : IJwtTokenService
    {
        private readonly JwtOptions _options;

        public JwtTokenService(JwtOptions options) => _options = options;

        public (string Token, DateTime ExpiresAt) CreateToken(UserDto user)
        {
            var expiresAt = DateTime.UtcNow.AddMinutes(_options.ExpireMinutes);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                // BaseController.userid() đọc claim tên "UserId" — giữ đúng tên đó.
                new Claim(CurrentUser.UserIdClaim, user.Id.ToString()),
                new Claim(CurrentUser.NameClaim, user.Username),
                new Claim("FullName", user.FullName),
                new Claim(CurrentUser.RoleClaim, user.RoleName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
            };

            var token = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: expiresAt,
                signingCredentials: new SigningCredentials(_options.SigningKey, SecurityAlgorithms.HmacSha256));

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }
    }
}
