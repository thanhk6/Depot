using Depot.Data.Entities.Base;

namespace Depot.Data.Entities.System;

/// <summary>
/// Chính sách bảo mật áp dụng toàn hệ thống (độ dài mật khẩu, hết hạn phiên, IP whitelist...).
/// Chỉ có đúng 1 bản ghi hoạt động, phân biệt bằng <see cref="Code"/> cố định "DEFAULT".
/// </summary>
public class SystemSecurityPolicy : FullAuditedEntity<long>
{
    /// <summary>Mã cấu hình (business key), luôn là "DEFAULT" — hệ thống chỉ có 1 chính sách áp dụng.</summary>
    public string Code { get; set; } = "DEFAULT";
    /// <summary>Độ dài tối thiểu của mật khẩu.</summary>
    public int PasswordMinLength { get; set; } = 8;
    /// <summary>Bắt buộc có ký tự đặc biệt trong mật khẩu.</summary>
    public bool RequireSpecialChar { get; set; } = true;
    /// <summary>Bắt buộc có chữ hoa trong mật khẩu.</summary>
    public bool RequireUppercase { get; set; } = true;
    /// <summary>Bắt buộc có chữ số trong mật khẩu.</summary>
    public bool RequireDigits { get; set; } = true;
    /// <summary>Số ngày mật khẩu hết hạn, phải đổi lại.</summary>
    public int PasswordExpireDays { get; set; } = 90;
    /// <summary>Số lần đăng nhập sai tối đa trước khi khoá tài khoản.</summary>
    public int MaxFailedAttempts { get; set; } = 5;
    /// <summary>Thời gian khoá tài khoản sau khi vượt số lần đăng nhập sai (phút).</summary>
    public int LockoutDurationMinutes { get; set; } = 30;
    /// <summary>Thời gian timeout phiên đăng nhập (phút).</summary>
    public int SessionTimeoutMinutes { get; set; } = 60;
    /// <summary>Bắt buộc bật 2FA cho tài khoản Admin.</summary>
    public bool Enforce2FaForAdmins { get; set; }
    /// <summary>Bật giới hạn truy cập theo danh sách IP.</summary>
    public bool IpWhitelistEnabled { get; set; }
    /// <summary>Danh sách dải IP được phép, lưu dạng chuỗi phân tách bởi dấu phẩy.</summary>
    public string? AllowedIpRangesCsv { get; set; }
}
