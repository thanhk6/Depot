using System;
using System.Collections.Concurrent;

namespace Depot.BackendApi.Security
{
    /// <summary>
    /// Đếm số lần đăng nhập sai theo tên đăng nhập (không theo IP — mọi request đi qua proxy frontend nên
    /// IP nguồn luôn là 127.0.0.1) và khoá tạm khi vượt ngưỡng của SystemSecurityPolicy. Lưu trong bộ nhớ:
    /// mất khi restart backend, đủ cho mục tiêu chặn dò mật khẩu hàng loạt.
    /// </summary>
    public sealed class LoginAttemptTracker
    {
        private sealed class Entry
        {
            public int Failures;
            public DateTime LockedUntilUtc;
            public DateTime LastFailureUtc;
        }

        private readonly ConcurrentDictionary<string, Entry> _entries = new();

        private static string Key(string username) => username.Trim().ToLowerInvariant();

        /// <summary>Số phút còn bị khoá, 0 nếu không bị khoá.</summary>
        public int RemainingLockMinutes(string username)
        {
            if (!_entries.TryGetValue(Key(username), out var entry)) return 0;
            lock (entry)
            {
                var remaining = entry.LockedUntilUtc - DateTime.UtcNow;
                return remaining > TimeSpan.Zero ? (int)Math.Ceiling(remaining.TotalMinutes) : 0;
            }
        }

        public void RegisterFailure(string username, int maxFailures, int lockoutMinutes)
        {
            // Chống phình bộ nhớ khi bị phun hàng loạt tên đăng nhập ngẫu nhiên: quá ngưỡng thì dọn các
            // mục đã không còn khoá và không sai thêm trong 1 giờ.
            if (_entries.Count > 5000)
            {
                var cutoff = DateTime.UtcNow.AddHours(-1);
                foreach (var pair in _entries)
                {
                    if (pair.Value.LastFailureUtc < cutoff && pair.Value.LockedUntilUtc < DateTime.UtcNow)
                        _entries.TryRemove(pair.Key, out _);
                }
            }

            var entry = _entries.GetOrAdd(Key(username), _ => new Entry());
            lock (entry)
            {
                var now = DateTime.UtcNow;
                // Lần sai cuối đã quá lâu (hết hạn khoá + 1 chu kỳ) thì đếm lại từ đầu, tránh cộng dồn vĩnh viễn.
                if (entry.LastFailureUtc != default && now - entry.LastFailureUtc > TimeSpan.FromMinutes(Math.Max(lockoutMinutes, 1)))
                    entry.Failures = 0;
                entry.Failures++;
                entry.LastFailureUtc = now;
                if (maxFailures > 0 && entry.Failures >= maxFailures)
                {
                    entry.LockedUntilUtc = now.AddMinutes(Math.Max(lockoutMinutes, 1));
                    entry.Failures = 0;
                }
            }
        }

        public void RegisterSuccess(string username) => _entries.TryRemove(Key(username), out _);
    }
}
