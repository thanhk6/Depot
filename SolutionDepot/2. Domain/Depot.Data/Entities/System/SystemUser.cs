using System;
using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.System
{
    /// <summary>
    /// Tài khoản đăng nhập nội bộ của hệ thống depot, gắn với một vai trò RBAC.
    /// </summary>
    public class SystemUser : FullAuditedEntity<long>
    {
        /// <summary>Tên đăng nhập.</summary>
        public string Username { get; set; } = string.Empty;
        /// <summary>Mật khẩu đã hash.</summary>
        public string PasswordHash { get; set; } = string.Empty;
        /// <summary>Họ tên hiển thị.</summary>
        public string FullName { get; set; } = string.Empty;
        /// <summary>Email liên hệ.</summary>
        public string Email { get; set; } = string.Empty;
        /// <summary>Khóa ngoại trỏ tới Role.Id.</summary>
        public long RoleId { get; set; }
        /// <summary>Thực thể role liên kết.</summary>
        public virtual Role? Role { get; set; }
        /// <summary>Trạng thái hoạt động của tài khoản.</summary>
        public bool IsActive { get; set; } = true;
    }
}
