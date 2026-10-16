using System;
using System.Security.Cryptography;

namespace Depot.Data.Security
{
    public static class PasswordHashHelper
    {
        private const int Iterations = 100_000;
        private const int SaltSize = 16;
        private const int KeySize = 32;
        private const string TempPasswordChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

        /// <summary>Sinh mật khẩu tạm ngẫu nhiên (không phải hằng số đoán được) cho tài khoản mới tạo —
        /// trước đây mọi user mới đều được gán cứng "123456", ai biết username cũng đăng nhập được ngay
        /// mà không cần biết mật khẩu thật. Bỏ hẳn ký tự dễ nhầm (0/O, 1/l/I) để nhân viên đọc/gõ lại
        /// không lỗi.</summary>
        public static string GenerateTemporaryPassword(int length = 10)
        {
            var bytes = RandomNumberGenerator.GetBytes(length);
            var chars = new char[length];
            for (var i = 0; i < length; i++)
            {
                chars[i] = TempPasswordChars[bytes[i] % TempPasswordChars.Length];
            }
            return new string(chars);
        }

        public static string HashPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Password is required.", nameof(password));
            }

            var salt = RandomNumberGenerator.GetBytes(SaltSize);
            var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);

            return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
        }

        public static bool VerifyPassword(string password, string? passwordHash)
        {
            if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(passwordHash))
            {
                return false;
            }

            var parts = passwordHash.Split('.', 3);
            if (parts.Length != 3 || !int.TryParse(parts[0], out var iterations))
            {
                return false;
            }

            try
            {
                var salt = Convert.FromBase64String(parts[1]);
                var expectedHash = Convert.FromBase64String(parts[2]);
                var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expectedHash.Length);

                return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
            }
            catch (FormatException)
            {
                return false;
            }
        }
    }
}