using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : BaseController
    {
        private readonly IUserService _userService;
        private readonly IJwtTokenService _tokenService;
        private readonly LoginAttemptTracker _loginAttempts;
        private readonly TokenRevocationList _revokedTokens;

        public UsersController(IUserService userService, IJwtTokenService tokenService, LoginAttemptTracker loginAttempts, TokenRevocationList revokedTokens)
        {
            _userService = userService;
            _tokenService = tokenService;
            _loginAttempts = loginAttempts;
            _revokedTokens = revokedTokens;
        }

        /// <summary>Thu hồi token đang dùng (BUG-011) — frontend gọi khi bấm Đăng xuất.</summary>
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var jti = User.FindFirst("jti")?.Value;
            var exp = User.FindFirst("exp")?.Value;
            if (jti != null && long.TryParse(exp, out var expSeconds))
                _revokedTokens.Revoke(jti, DateTimeOffset.FromUnixTimeSeconds(expSeconds).UtcDateTime);
            return Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã đăng xuất", Data = "LOGGED_OUT" });
        }

        /// <summary>Hồ sơ + quyền menu hiện tại của chủ token (BUG-030 — frontend authApi.getProfile trước đây gọi vào 404).</summary>
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var profile = await _userService.GetProfileAsync(User.GetUserId() ?? 0);
            return profile == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy tài khoản", Data = null })
                : Ok(new ResponseSingleContentModel<UserDto> { StatusCode = 200, Message = "Lấy thông tin tài khoản thành công", Data = profile });
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ResponseSingleContentModel<string>
                    {
                        StatusCode = 400,
                        Message = "Dữ liệu không hợp lệ",
                        Data = "Vui lòng kiểm tra lại thông tin đầu vào"
                    });
                }

                // Chặn dò mật khẩu: sai quá ngưỡng của SystemSecurityPolicy thì khoá tên đăng nhập đó tạm
                // thời — áp dụng đồng nhất cho cả tên không tồn tại nên không lộ tài khoản nào có thật.
                var username = request.Username?.Trim() ?? string.Empty;
                var lockedMinutes = username.Length > 0 ? _loginAttempts.RemainingLockMinutes(username) : 0;
                if (lockedMinutes > 0)
                {
                    return StatusCode(429, new ResponseSingleContentModel<string>
                    {
                        StatusCode = 429,
                        Message = "Tài khoản tạm thời bị khoá",
                        Data = $"Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau {lockedMinutes} phút."
                    });
                }

                var result = await _userService.Authencate(request);

                if (result.IsSuccessed && result.ResultObj != null)
                {
                    _loginAttempts.RegisterSuccess(username);
                    var (token, expiresAt) = _tokenService.CreateToken(result.ResultObj);
                    result.ResultObj.AccessToken = token;
                    result.ResultObj.AccessTokenExpiresAt = expiresAt;

                    return Ok(new ResponseSingleContentModel<dynamic>
                    {
                        StatusCode = 200,
                        Message = "Đăng nhập thành công",
                        Data = result.ResultObj
                    });
                }

                if (username.Length > 0)
                {
                    var policy = await _userService.GetSecurityPolicyAsync();
                    _loginAttempts.RegisterFailure(username, policy.MaxFailedAttempts, policy.LockoutDurationMinutes);
                }

                return Unauthorized(new ResponseSingleContentModel<string>
                {
                    StatusCode = 401,
                    Message = "Đăng nhập thất bại",
                    Data = result.Message ?? "Tên đăng nhập hoặc mật khẩu không đúng"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string>
                {
                    StatusCode = 400,
                    Message = "Yêu cầu không hợp lệ",
                    Data = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Có lỗi trong quá trình xử lý",
                    Data = ex.Message
                });
            }
        }
    }
}
