using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
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

        [HttpDelete("shipping-lines/{id:long}")]
        public async Task<IActionResult> DeleteShippingLine(long id)
        {
            var success = await _masterService.DeactivateShippingLineAsync(id);
            return success
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Xoá Hãng tàu thành công", Data = id.ToString() })
                : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy hãng tàu", Data = id.ToString() });
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

        [HttpGet("catalog/{catalogType}")]
        public async Task<IActionResult> GetCatalog(string catalogType)
        {
            var items = await _masterService.GetCatalogAsync(catalogType.ToUpperInvariant());
            return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy catalog thành công", Data = items });
        }

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

        [HttpPut("catalog/{id:long}")]
        public async Task<IActionResult> UpdateCatalog(long id, [FromBody] MasterCatalogItemRequest request)
        {
            var item = await _masterService.UpdateCatalogItemAsync(id, request);
            return item == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy catalog", Data = id.ToString() })
                : Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Cập nhật catalog thành công", Data = item });
        }

        [HttpDelete("catalog/{id:long}")]
        public async Task<IActionResult> DeleteCatalog(long id)
        {
            var deleted = await _masterService.DeactivateCatalogItemAsync(id);
            return deleted
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã vô hiệu hóa catalog", Data = "INACTIVE" })
                : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy catalog", Data = id.ToString() });
        }

        // Cước Nâng Hạ (LoLo) — bảng riêng ServiceTariff, tách khỏi catalog "SERVICE_TARIFF" dùng chung
        // cũ (xem docs/frontend-tariff-catalog-split.md).
        [HttpGet("service-tariffs")]
        public async Task<IActionResult> GetServiceTariffs()
        {
            var items = await _masterService.GetServiceTariffsAsync();
            return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy biểu cước nâng hạ thành công", Data = items });
        }

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

        [HttpPut("service-tariffs/{id:long}")]
        public async Task<IActionResult> UpdateServiceTariff(long id, [FromBody] ServiceTariffRequest request)
        {
            var item = await _masterService.UpdateServiceTariffAsync(id, request);
            return item == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy biểu cước", Data = id.ToString() })
                : Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Cập nhật biểu cước nâng hạ thành công", Data = item });
        }

        [HttpDelete("service-tariffs/{id:long}")]
        public async Task<IActionResult> DeleteServiceTariff(long id)
        {
            var deleted = await _masterService.DeactivateServiceTariffAsync(id);
            return deleted
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã vô hiệu hóa biểu cước", Data = "INACTIVE" })
                : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy biểu cước", Data = id.ToString() });
        }

        // Cước Lưu Bãi (Storage) — bảng riêng StorageTariffRule + StorageTariffTier, tách khỏi catalog
        // "STORAGE_TARIFF" dùng chung cũ (xem docs/frontend-tariff-catalog-split.md).
        [HttpGet("storage-tariffs")]
        public async Task<IActionResult> GetStorageTariffs()
        {
            var items = await _masterService.GetStorageTariffsAsync();
            return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy quy tắc lưu bãi thành công", Data = items });
        }

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

        [HttpPut("storage-tariffs/{id:long}")]
        public async Task<IActionResult> UpdateStorageTariff(long id, [FromBody] StorageTariffRuleRequest request)
        {
            var item = await _masterService.UpdateStorageTariffAsync(id, request);
            return item == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy quy tắc lưu bãi", Data = id.ToString() })
                : Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Cập nhật quy tắc lưu bãi thành công", Data = item });
        }

        [HttpDelete("storage-tariffs/{id:long}")]
        public async Task<IActionResult> DeleteStorageTariff(long id)
        {
            var deleted = await _masterService.DeactivateStorageTariffAsync(id);
            return deleted
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Đã vô hiệu hóa quy tắc lưu bãi", Data = "INACTIVE" })
                : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy quy tắc lưu bãi", Data = id.ToString() });
        }

        [HttpPost("materials")]
        public async Task<IActionResult> AddMaterial([FromBody] MaterialViewModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Code) || string.IsNullOrWhiteSpace(model.Name) || model.UnitPrice < 0 || model.StockQuantity < 0)
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Dữ liệu vật tư không hợp lệ", Data = "Mã, tên, giá và tồn kho phải hợp lệ" });

            var created = await _masterService.AddMaterialAsync(model);
            return Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Thêm vật tư thành công", Data = created });
        }

        [HttpPut("materials/{id:long}")]
        public async Task<IActionResult> UpdateMaterial(long id, [FromBody] MaterialViewModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Name) || model.UnitPrice < 0 || model.StockQuantity < 0)
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Dữ liệu vật tư không hợp lệ", Data = "Tên, giá và tồn kho phải hợp lệ" });

            var updated = await _masterService.UpdateMaterialAsync(id, model);
            return updated == null
                ? NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy vật tư", Data = id.ToString() })
                : Ok(new ResponseSingleContentModel<dynamic> { StatusCode = 200, Message = "Cập nhật vật tư thành công", Data = updated });
        }
    }
}
