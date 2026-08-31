using System;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    public class BaseController : ControllerBase
    {
        protected long userid(IHttpContextAccessor _httpContextAccessor)
        {
            long id = long.Parse(_httpContextAccessor.HttpContext?.User?.Claims?.FirstOrDefault(x => x.Type.Equals("UserId", StringComparison.OrdinalIgnoreCase))?.Value ?? "0");
            return id;
        }

        protected IActionResult RouteToInternalServerError()
        {
            // Return server error
            return StatusCode(500, new ResponseSingleContentModel<IResponseData>
            {
                StatusCode = 500,
                Message = "Internal Server Error!",
            });
        }

        protected IActionResult RouteToFordbiddenServerError()
        {
            return StatusCode(403, new ResponseSingleContentModel<IResponseData>
            {
                StatusCode = 403,
                Message = "Fordbidden!",
            });
        }

        protected string CurrentAction { get; set; } = string.Empty;
        protected string CurrentController { get; set; } = string.Empty;

        protected string LogPrefix => string.Format("{0}:{1}", CurrentController, CurrentAction);
    }
}
