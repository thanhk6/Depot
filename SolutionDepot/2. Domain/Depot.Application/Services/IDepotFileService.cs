using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using Depot.ViewModels;

namespace Depot.Application.Services
{
    /// <summary>
    /// Điều phối upload file: đẩy nội dung file vật lý sang Depot.FileServer (host riêng, không chạm DB),
    /// rồi lưu metadata (ai/ở đâu/loại gì) xuống bảng DepotFiles để tra cứu lại sau này.
    /// </summary>
    public interface IDepotFileService
    {
        Task<DepotFileDto> UploadAsync(Stream content, string fileName, long idTable, string tableName, byte type);
        Task<List<DepotFileDto>> GetFilesAsync(string tableName, long idTable);
        Task<bool> DeleteAsync(long id);
    }
}
