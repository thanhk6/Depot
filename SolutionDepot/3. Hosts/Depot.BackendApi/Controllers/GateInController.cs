using Depot.Application.Services;
using Depot.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Depot.BackendApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GateInController : ControllerBase
    {
        private readonly IDepotJobService _service;

        public GateInController(IDepotJobService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDepotJobRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.CreateGateInJobAsync(request);
            return Ok(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var item = await _service.GetJobByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }
    }
}
