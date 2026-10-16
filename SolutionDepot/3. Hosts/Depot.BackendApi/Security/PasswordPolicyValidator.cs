using System.Linq;
using Depot.Data.Entities.System;

namespace Depot.BackendApi.Security
{
    /// <summary>Kiểm tra mật khẩu mới theo SystemSecurityPolicy đã lưu (chỉnh được ở màn Hệ thống) —
    /// trước đây chính sách này chỉ để hiển thị, đặt lại mật khẩu thành "1" vẫn được chấp nhận.</summary>
    public static class PasswordPolicyValidator
    {
        /// <summary>Trả về thông báo lỗi tiếng Việt nếu vi phạm, null nếu hợp lệ.</summary>
        public static string? Validate(string? password, SystemSecurityPolicy policy)
        {
            if (string.IsNullOrEmpty(password))
                return "Mật khẩu không được để trống.";
            if (password.Length < policy.PasswordMinLength)
                return $"Mật khẩu phải có tối thiểu {policy.PasswordMinLength} ký tự.";
            if (policy.RequireUppercase && !password.Any(char.IsUpper))
                return "Mật khẩu phải có ít nhất 1 chữ in hoa.";
            if (policy.RequireDigits && !password.Any(char.IsDigit))
                return "Mật khẩu phải có ít nhất 1 chữ số.";
            if (policy.RequireSpecialChar && password.All(c => char.IsLetterOrDigit(c)))
                return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt.";
            return null;
        }
    }
}
