using Depot.FileServer.Storage;
using Microsoft.AspNetCore.Mvc;

namespace Depot.FileServer.Controllers;

[ApiController]
[Route("api/files")]
public sealed class FilesController : ControllerBase
{
    private readonly IFileStorageService storage;
    public FilesController(IFileStorageService storage) => this.storage = storage;

    [HttpPost("upload")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken cancellationToken)
    {
        if (file is null) return BadRequest(new { statusCode = 400, message = "Thiếu file upload." });
        try
        {
            var result = await storage.SaveAsync(file, cancellationToken);
            return Ok(new { statusCode = 200, message = "Lưu file thành công", data = result });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { statusCode = 400, message = exception.Message });
        }
    }

    [HttpGet("{fileId}/{storedName}")]
    public IActionResult Download(string fileId, string storedName)
    {
        try
        {
            var stream = storage.OpenRead(fileId, storedName);
            return stream is null ? NotFound() : File(stream, GetContentType(storedName), storedName);
        }
        catch (InvalidOperationException) { return BadRequest(); }
    }

    [HttpDelete("{fileId}/{storedName}")]
    public IActionResult Delete(string fileId, string storedName)
    {
        try
        {
            return storage.Delete(fileId, storedName)
                ? Ok(new { statusCode = 200, message = "Xóa file thành công" })
                : NotFound();
        }
        catch (InvalidOperationException) { return BadRequest(); }
    }

    private static string GetContentType(string name) => Path.GetExtension(name).ToLowerInvariant() switch
    {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".webp" => "image/webp",
        ".pdf" => "application/pdf",
        ".edi" or ".txt" => "text/plain",
        ".csv" => "text/csv",
        ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        _ => "application/octet-stream"
    };
}
