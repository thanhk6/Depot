using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Depot.Data.Entities.Depot;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Depot.BackendApi.Security
{
    /// <summary>
    /// Mỗi bước trong vòng đời container phải ghi được "ai thao tác". Trước đây người thao tác trong nhật ký lấy từ
    /// tên cố định ("Operation", "Phòng Báo Giá", "Container UI") hoặc tên client tự gửi lên (tài xế, kỹ thuật viên,
    /// mã xe nâng...) — không phải tài khoản thật. Interceptor này chạy ở 1 chỗ duy nhất khi lưu:
    ///  - JobAuditLog mới: User = tài khoản đang đăng nhập (họ tên · tên đăng nhập); tên khai báo khác (nếu có) giữ
    ///    lại trong Details.
    ///  - Mọi bản ghi thêm/sửa: điền CreatedBy / LastModifiedBy.
    /// Không có người đăng nhập (webhook ngân hàng, khởi tạo dữ liệu) → giữ nguyên.
    /// </summary>
    public sealed class AuditActorInterceptor : SaveChangesInterceptor
    {
        private static readonly string[] GenericActors =
        {
            "Operation", "Phòng Báo Giá", "Container UI", "System", "Forklift", "Điều Độ Bãi", "EDI Gateway", "Thu ngân", "Tổ Vệ Sinh"
        };

        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditActorInterceptor(IHttpContextAccessor httpContextAccessor) => _httpContextAccessor = httpContextAccessor;

        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            Apply(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            Apply(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void Apply(DbContext? context)
        {
            var principal = _httpContextAccessor.HttpContext?.User;
            if (context == null || principal?.Identity?.IsAuthenticated != true) return;

            var username = principal.GetUsername();
            var fullName = principal.GetFullName();
            if (string.IsNullOrWhiteSpace(username) && string.IsNullOrWhiteSpace(fullName)) return;
            var actor = string.IsNullOrWhiteSpace(fullName) ? username! : string.IsNullOrWhiteSpace(username) ? fullName : $"{fullName} ({username})";
            var by = username ?? fullName!;

            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Added)
                {
                    SetIfExists(entry, "CreatedBy", by);
                    if (entry.Entity is JobAuditLog log)
                    {
                        var declared = log.User?.Trim();
                        var isOwnName = !string.IsNullOrEmpty(declared)
                            && (string.Equals(declared, fullName, StringComparison.OrdinalIgnoreCase)
                                || string.Equals(declared, username, StringComparison.OrdinalIgnoreCase));
                        if (!string.IsNullOrEmpty(declared) && !isOwnName && !GenericActors.Contains(declared, StringComparer.OrdinalIgnoreCase))
                        {
                            log.Details = string.IsNullOrWhiteSpace(log.Details)
                                ? $"Khai báo thực hiện: {declared}"
                                : $"{log.Details} · Khai báo thực hiện: {declared}";
                        }
                        log.User = actor.Length > 200 ? actor[..200] : actor;
                    }
                }
                else if (entry.State == EntityState.Modified)
                {
                    SetIfExists(entry, "LastModifiedBy", by);
                    // Thời điểm sửa — trước đây chỉ ghi người sửa, LastModifiedAt luôn trống.
                    var modifiedAt = entry.Metadata.FindProperty("LastModifiedAt");
                    if (modifiedAt != null && (modifiedAt.ClrType == typeof(DateTime?) || modifiedAt.ClrType == typeof(DateTime)))
                        entry.Property("LastModifiedAt").CurrentValue = DateTime.UtcNow;
                }
            }
        }

        private static void SetIfExists(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry, string property, string value)
        {
            var prop = entry.Metadata.FindProperty(property);
            if (prop == null || prop.ClrType != typeof(string)) return;
            entry.Property(property).CurrentValue = value;
        }
    }
}
