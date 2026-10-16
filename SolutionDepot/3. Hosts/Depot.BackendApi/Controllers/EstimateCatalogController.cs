using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>
    /// Danh mục riêng của phân hệ Báo giá (cấu trúc Maersk AEMS) — lưu trong MasterCatalogItems nhưng chỉ cho
    /// thao tác trên đúng các loại danh mục báo giá, nên mở cho nhóm quyền Báo giá (người báo giá tự quản lý mã)
    /// thay vì bắt buộc quyền Master Data như API catalog chung.
    /// </summary>
    [ApiController]
    [RequirePermission(RolePermissions.Estimate, RolePermissions.MasterData)]
    [Route("api/estimate-catalog")]
    public class EstimateCatalogController : BaseController
    {
        /// <summary>Loại danh mục báo giá được phép.</summary>
        public static readonly IReadOnlyCollection<string> AllowedTypes = new[]
        {
            "EST_DAMAGE_CODE",     // Damage code AEMS (CO, BR, BT, HO, LO…)
            "EST_REPAIR_CODE",     // Repair code AEMS (7892, 6525…) + giờ công/PC, vật tư/PC mặc định
            "EST_REPAIR_LOCATION", // Rep. loc CEDEX (TX2N, BX5N…)
            "EST_LABOR_RATE",      // Đơn giá giờ công theo hãng tàu (Code = mã hãng tàu)
            "EST_TPI",             // TPI (O/U/T/W)
            "EST_CAUSE",           // Cause (Wear and Tear, Third Party…)
            "EST_MODE",            // Mode (01 BOX REPAIR…)
            "EST_SHOP_CODE"        // Shop Code AEMS của depot (3HY…)
        };

        private readonly IMasterDataService _masterService;
        public EstimateCatalogController(IMasterDataService masterService) => _masterService = masterService;

        private static string? Normalize(string type)
        {
            var t = (type ?? string.Empty).Trim().ToUpperInvariant();
            return AllowedTypes.Contains(t) ? t : null;
        }

        private IActionResult InvalidType(string type) =>
            BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = $"Loại danh mục báo giá '{type}' không hợp lệ.", Data = string.Join(", ", AllowedTypes) });

        [HttpGet("{type}")]
        public async Task<IActionResult> Get(string type, [FromQuery] bool includeInactive = false)
        {
            var t = Normalize(type);
            if (t == null) return InvalidType(type);
            var items = await _masterService.GetCatalogAsync(t, includeInactive);
            return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "OK", Data = items });
        }

        [HttpPost("{type}")]
        public async Task<IActionResult> Create(string type, [FromBody] MasterCatalogItemRequest request)
        {
            var t = Normalize(type);
            if (t == null) return InvalidType(type);
            try
            {
                request.CatalogType = t;
                var item = await _masterService.CreateCatalogItemAsync(request);
                return Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Đã thêm vào danh mục", Data = item });
            }
            catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Danh mục không hợp lệ" });
            }
        }

        [HttpPut("{type}/{id:long}")]
        public async Task<IActionResult> Update(string type, long id, [FromBody] MasterCatalogItemRequest request)
        {
            var t = Normalize(type);
            if (t == null) return InvalidType(type);
            if (!await BelongsToType(t, id)) return NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy mục trong danh mục này", Data = id.ToString() });
            try
            {
                request.CatalogType = t;
                var item = await _masterService.UpdateCatalogItemAsync(id, request);
                return Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Đã cập nhật", Data = item });
            }
            catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Danh mục không hợp lệ" });
            }
        }

        [HttpDelete("{type}/{id:long}")]
        public async Task<IActionResult> Delete(string type, long id)
        {
            var t = Normalize(type);
            if (t == null) return InvalidType(type);
            if (!await BelongsToType(t, id)) return NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy mục trong danh mục này", Data = id.ToString() });
            await _masterService.DeactivateCatalogItemAsync(id);
            return Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã xoá khỏi danh mục", Data = "DELETED" });
        }

        private async Task<bool> BelongsToType(string type, long id) =>
            (await _masterService.GetCatalogAsync(type, includeInactive: true)).Any(x => x.Id == id);
    }
}
