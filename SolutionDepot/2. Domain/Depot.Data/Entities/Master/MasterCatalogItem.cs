using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.Master;

/// <summary>
/// Một dòng trong các danh mục master dùng chung như loại container, hư hỏng, tiêu chuẩn, phòng ban.
/// </summary>
public class MasterCatalogItem : FullAuditedEntity<long>
{
    /// <summary>Loại danh mục mà dòng dữ liệu này thuộc về.</summary>
    public string CatalogType { get; set; } = string.Empty;
    /// <summary>Mã nghiệp vụ của item trong catalog.</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Tên hiển thị tiếng Anh hoặc tên chuẩn.</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Tên tiếng Việt nếu có.</summary>
    public string? NameVi { get; set; }
    /// <summary>Mô tả bổ sung cho danh mục.</summary>
    public string? Description { get; set; }
    /// <summary>Dữ liệu JSON mở rộng cho từng item.</summary>
    public string JsonData { get; set; } = "{}";
    /// <summary>Trạng thái hoạt động của item.</summary>
    public bool IsActive { get; set; } = true;
    /// <summary>Thứ tự hiển thị trong danh sách.</summary>
    public int SortOrder { get; set; }
}
