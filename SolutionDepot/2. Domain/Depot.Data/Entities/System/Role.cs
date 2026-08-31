using System.Collections.Generic;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.System
{
    /// <summary>
    /// Vai trò hệ thống RBAC; RoleCode là khóa nghiệp vụ mà SystemUser.RoleName tham chiếu.
    /// </summary>
    public class Role : FullAuditedEntity<long>
    {
        /// <summary>Mã role nghiệp vụ.</summary>
        public string RoleCode { get; set; } = string.Empty;
        /// <summary>Tên hiển thị của role.</summary>
        public string RoleName { get; set; } = string.Empty;
        /// <summary>Mô tả vai trò.</summary>
        public string? Description { get; set; }
        /// <summary>Danh sách mã quyền (permission code) được gán cho role này, lưu dạng mảng JSON string.
        /// Null nghĩa là chưa từng lưu qua Ma Trận Phân Quyền — frontend tự dùng bộ quyền mặc định tĩnh.</summary>
        public string? PermissionsJson { get; set; }
        /// <summary>Các tài khoản được gán role này.</summary>
        public virtual ICollection<SystemUser> Users { get; set; } = new List<SystemUser>();
    }
}
