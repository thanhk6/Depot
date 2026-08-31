using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : BaseController
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

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

                var result = await _userService.Authencate(request);

                if (result.IsSuccessed && result.ResultObj != null)
                {
                    return Ok(new ResponseSingleContentModel<dynamic>
                    {
                        StatusCode = 200,
                        Message = "Đăng nhập thành công",
                        Data = result.ResultObj
                    });
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
