using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Depot.Application.Services;
using Depot.BackendApi.Security;
using Depot.ViewModels;

namespace Depot.BackendApi.Controllers
{
    /// <summary>
    /// Quản lý metadata file đính kèm (bảng DepotFiles) — file vật lý thật sự nằm ở Depot.FileServer,
    /// controller này chỉ điều phối: nhận upload từ frontend, forward sang FileServer, rồi lưu/tra/xóa
    /// bản ghi liên kết (IdTable, TableName) trong DB chính.
    /// </summary>
    [ApiController]
    [Route("api/depot-files")]
    public class DepotFilesController : ControllerBase
    {
        private readonly IDepotFileService _service;
        public DepotFilesController(IDepotFileService service)
        {
            _service = service;
        }

        /// <summary>Upload 1 file, gắn vào bản ghi nghiệp vụ qua (tableName, idTable). Vd tableName="DamageItem",
        /// idTable=5, type=1 (ảnh mô tả) khi surveyor chụp ảnh hư hỏng.</summary>
        [RequirePermission(RolePermissions.Survey, RolePermissions.Repair, RolePermissions.Qc, RolePermissions.Operation, RolePermissions.Cleaning, RolePermissions.Estimate)]
        [HttpPost("upload")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<IActionResult> Upload(IFormFile file, [FromForm] long idTable, [FromForm] string tableName, [FromForm] byte type)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Thiếu file upload", Data = "file rỗng" });

            try
            {
                await using var stream = file.OpenReadStream();
                var result = await _service.UploadAsync(stream, file.FileName, idTable, tableName, type);
                return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lưu file thành công", Data = result });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Dữ liệu upload không hợp lệ", Data = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ResponseSingleContentModel<string> { StatusCode = 400, Message = "Không thể lưu file", Data = ex.Message });
            }
        }

        /// <summary>Danh sách file đã đính kèm 1 bản ghi nghiệp vụ, mới nhất trước.</summary>
        /// <summary>server.ts gọi để xác nhận cookie JWT trước khi trả file ảnh — mọi tài khoản đã đăng nhập đều được xem.</summary>
        [HttpGet("access-check")]
        public IActionResult AccessCheck() => NoContent();

        [HttpGet]
        public async Task<IActionResult> GetFiles([FromQuery] string tableName, [FromQuery] long idTable)
        {
            var files = await _service.GetFilesAsync(tableName, idTable);
            return Ok(new ResponseSingleContentModel<object> { StatusCode = 200, Message = "Lấy danh sách file thành công", Data = files });
        }

        /// <summary>Xóa mềm 1 file — cố gắng xóa vật lý bên FileServer trước, best-effort.</summary>
        [RequirePermission(RolePermissions.Survey, RolePermissions.Repair, RolePermissions.Qc, RolePermissions.Operation, RolePermissions.Cleaning, RolePermissions.Estimate)]
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted
                ? Ok(new ResponseSingleContentModel<string> { StatusCode = 200, Message = "Xóa file thành công", Data = id.ToString() })
                : NotFound(new ResponseSingleContentModel<string> { StatusCode = 404, Message = "Không tìm thấy file", Data = id.ToString() });
        }
    }
}
