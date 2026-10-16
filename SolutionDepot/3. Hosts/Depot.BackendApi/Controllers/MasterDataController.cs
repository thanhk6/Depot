using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>API danh mục dùng chung: hãng tàu và vật tư EMR.</summary>
    [ApiController]
    [Route("api/[controller]")]
    public class MasterDataController : BaseController
    {
        private readonly IMasterDataService _masterService;

        public MasterDataController(IMasterDataService masterService)
        {
            _masterService = masterService;
        }

        [HttpGet("shipping-lines")]
        public async Task<IActionResult> GetShippingLines()
        {
            try
            {
                var list = await _masterService.GetAllShippingLinesAsync();
                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = "Lấy danh sách Hãng tàu thành công",
                    Data = list
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi khi lấy danh sách Hãng tàu",
                    Data = ex.Message
                });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpPost("shipping-lines")]
        public async Task<IActionResult> AddShippingLine([FromBody] ShippingLineViewModel model)
        {
            try
            {
                var created = await _masterService.AddShippingLineAsync(model);
                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = "Thêm Hãng tàu mới thành công",
                    Data = created
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string>
                {
                    StatusCode = 400,
                    Message = "Lỗi khi tạo Hãng tàu",
                    Data = ex.Message
                });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpPut("shipping-lines/{id:long}")]
        public async Task<IActionResult> UpdateShippingLine(long id, [FromBody] ShippingLineViewModel model)
        {
            try
            {
                var updated = await _masterService.UpdateShippingLineAsync(id, model);
                return updated == null
                    ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy hãng tàu", Data = id.ToString() })
                    : Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Cập nhật Hãng tàu thành công", Data = updated });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string>
                {
                    StatusCode = 400,
                    Message = "Lỗi khi cập nhật Hãng tàu",
                    Data = ex.Message
                });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpDelete("shipping-lines/{id:long}")]
        public async Task<IActionResult> DeleteShippingLine(long id)
        {
            try
            {
                var success = await _masterService.DeactivateShippingLineAsync(id);
                return success
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Xoá Hãng tàu thành công", Data = id.ToString() })
                    : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy hãng tàu", Data = id.ToString() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi xoá hãng tàu", Data = ex.Message });
            }
        }

        [HttpGet("materials")]
        public async Task<IActionResult> GetMaterials()
        {
            try
            {
                var list = await _masterService.GetAllMaterialsAsync();
                return Ok(new ResponseSingleContentModel<dynamic>
                {
                    StatusCode = 200,
                    Message = "Lấy danh mục vật tư sửa chữa thành công",
                    Data = list
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string>
                {
                    StatusCode = 500,
                    Message = "Lỗi khi lấy danh mục vật tư",
                    Data = ex.Message
                });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var shippingLines = await _masterService.GetAllShippingLinesAsync();
                var materials = await _masterService.GetAllMaterialsAsync();
                var catalogs = new Dictionary<string, object>();
                foreach (var catalogType in new[] { "CONTAINER_TYPE", "DAMAGE_LOCATION", "DAMAGE_CODE", "REPAIR_CODE", "GRADE", "INSPECTION_STANDARD", "CLEANING_TARIFF", "SERVICE_TARIFF", "STORAGE_TARIFF", "DEPARTMENT", "CUSTOMER_CLASSIFICATION" })
                    catalogs[catalogType] = await _masterService.GetCatalogAsync(catalogType);
                return Ok(new ResponseSingleContentModel<object>
                {
                    StatusCode = 200,
                    Message = "Lấy master data từ SQL Server thành công",
                    Data = new { shippingLines, materials, catalogs }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy master data", Data = ex.Message });
            }
        }

        [HttpGet("catalog/{catalogType}")]
        public async Task<IActionResult> GetCatalog(string catalogType, [FromQuery] bool includeInactive = false)
        {
            try
            {
                var items = await _masterService.GetCatalogAsync(catalogType.ToUpperInvariant(), includeInactive);
                return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy catalog thành công", Data = items });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi lấy catalog", Data = ex.Message });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpPost("catalog")]
        public async Task<IActionResult> CreateCatalog([FromBody] MasterCatalogItemRequest request)
        {
            try
            {
                var item = await _masterService.CreateCatalogItemAsync(request);
                return Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Tạo catalog thành công", Data = item });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Catalog không hợp lệ" });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpPut("catalog/{id:long}")]
        public async Task<IActionResult> UpdateCatalog(long id, [FromBody] MasterCatalogItemRequest request)
        {
            try
            {
                var item = await _masterService.UpdateCatalogItemAsync(id, request);
                return item == null
                    ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy catalog", Data = id.ToString() })
                    : Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Cập nhật catalog thành công", Data = item });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Catalog không hợp lệ" });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpDelete("catalog/{id:long}")]
        public async Task<IActionResult> DeleteCatalog(long id)
        {
            try
            {
                var deleted = await _masterService.DeactivateCatalogItemAsync(id);
                return deleted
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã xóa catalog", Data = "DELETED" })
                    : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy catalog", Data = id.ToString() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi vô hiệu hóa catalog", Data = ex.Message });
            }
        }

        // Cước Nâng Hạ (LoLo) — bảng riêng ServiceTariff, tách khỏi catalog "SERVICE_TARIFF" dùng chung
        // cũ (xem docs/frontend-tariff-catalog-split.md).
        [HttpGet("service-tariffs")]
        public async Task<IActionResult> GetServiceTariffs([FromQuery] bool includeInactive = false)
        {
            var items = await _masterService.GetServiceTariffsAsync(includeInactive);
            return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy biểu cước nâng hạ thành công", Data = items });
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpPost("service-tariffs")]
        public async Task<IActionResult> CreateServiceTariff([FromBody] ServiceTariffRequest request)
        {
            try
            {
                var item = await _masterService.CreateServiceTariffAsync(request);
                return Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Tạo biểu cước nâng hạ thành công", Data = item });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Biểu cước không hợp lệ" });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpPut("service-tariffs/{id:long}")]
        public async Task<IActionResult> UpdateServiceTariff(long id, [FromBody] ServiceTariffRequest request)
        {
            try
            {
                var item = await _masterService.UpdateServiceTariffAsync(id, request);
                return item == null
                    ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy biểu cước", Data = id.ToString() })
                    : Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Cập nhật biểu cước nâng hạ thành công", Data = item });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Biểu cước không hợp lệ" });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpDelete("service-tariffs/{id:long}")]
        public async Task<IActionResult> DeleteServiceTariff(long id)
        {
            try
            {
                var deleted = await _masterService.DeactivateServiceTariffAsync(id);
                return deleted
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã xóa biểu cước", Data = "DELETED" })
                    : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy biểu cước", Data = id.ToString() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi vô hiệu hóa biểu cước", Data = ex.Message });
            }
        }

        // Cước Lưu Bãi (Storage) — bảng riêng StorageTariffRule + StorageTariffTier, tách khỏi catalog
        // "STORAGE_TARIFF" dùng chung cũ (xem docs/frontend-tariff-catalog-split.md).
        [HttpGet("storage-tariffs")]
        public async Task<IActionResult> GetStorageTariffs()
        {
            var items = await _masterService.GetStorageTariffsAsync();
            return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy quy tắc lưu bãi thành công", Data = items });
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpPost("storage-tariffs")]
        public async Task<IActionResult> CreateStorageTariff([FromBody] StorageTariffRuleRequest request)
        {
            try
            {
                var item = await _masterService.CreateStorageTariffAsync(request);
                return Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Tạo quy tắc lưu bãi thành công", Data = item });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Quy tắc lưu bãi không hợp lệ" });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpPut("storage-tariffs/{id:long}")]
        public async Task<IActionResult> UpdateStorageTariff(long id, [FromBody] StorageTariffRuleRequest request)
        {
            try
            {
                var item = await _masterService.UpdateStorageTariffAsync(id, request);
                return item == null
                    ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy quy tắc lưu bãi", Data = id.ToString() })
                    : Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Cập nhật quy tắc lưu bãi thành công", Data = item });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Quy tắc lưu bãi không hợp lệ" });
            }
        }

        [RequirePermission(RolePermissions.MasterData)]
        [HttpDelete("storage-tariffs/{id:long}")]
        public async Task<IActionResult> DeleteStorageTariff(long id)
        {
            try
            {
                var deleted = await _masterService.DeactivateStorageTariffAsync(id);
                return deleted
                    ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã vô hiệu hóa quy tắc lưu bãi", Data = "INACTIVE" })
                    : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy quy tắc lưu bãi", Data = id.ToString() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseSingleContentModel<string> { StatusCode = 500, Message = "Lỗi khi vô hiệu hóa quy tắc lưu bãi", Data = ex.Message });
            }
        }

        [RequirePermission(RolePermissions.MasterData, RolePermissions.Inventory)]
        [HttpPost("materials")]
        public async Task<IActionResult> AddMaterial([FromBody] MaterialViewModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Code) || string.IsNullOrWhiteSpace(model.Name) || model.UnitPrice < 0 || model.StockQuantity < 0)
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Dữ liệu vật tư không hợp lệ", Data = "Mã, tên, giá và tồn kho phải hợp lệ" });

            try
            {
                var created = await _masterService.AddMaterialAsync(model);
                return Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Thêm vật tư thành công", Data = created });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể thêm vật tư" });
            }
        }

        [RequirePermission(RolePermissions.MasterData, RolePermissions.Inventory)]
        [HttpPut("materials/{id:long}")]
        public async Task<IActionResult> UpdateMaterial(long id, [FromBody] MaterialViewModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Name) || model.UnitPrice < 0 || model.StockQuantity < 0)
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Dữ liệu vật tư không hợp lệ", Data = "Tên, giá và tồn kho phải hợp lệ" });

            try
            {
                var updated = await _masterService.UpdateMaterialAsync(id, model);
                return updated == null
                    ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy vật tư", Data = id.ToString() })
                    : Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Cập nhật vật tư thành công", Data = updated });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = ex.Message, Data = "Không thể cập nhật vật tư" });
            }
        }
    }
}
