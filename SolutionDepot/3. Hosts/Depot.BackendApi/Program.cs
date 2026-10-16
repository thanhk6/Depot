using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using Depot.BackendApi.Security;
using Depot.Data.EF;
using Depot.Application.Services;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Composition root: chỉ đăng ký dependency và middleware; business rule nằm ở Application.
// PostgreSQL là database chính, không dùng InMemory khi chạy ứng dụng.
var connectionString = builder.Configuration.GetConnectionString("PostgreSqlConnection");

// Ghi "ai thao tác" (tài khoản đăng nhập) vào nhật ký vòng đời + CreatedBy/LastModifiedBy ở 1 chỗ khi lưu.
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<Depot.BackendApi.Security.AuditActorInterceptor>();
builder.Services.AddDbContext<DepotDbContext>((sp, options) =>
{
    options.AddInterceptors(sp.GetRequiredService<Depot.BackendApi.Security.AuditActorInterceptor>());
    if (string.IsNullOrWhiteSpace(connectionString))
        throw new InvalidOperationException("ConnectionStrings:PostgreSqlConnection chưa được cấu hình.");

    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.MigrationsAssembly("Depot.Data");
    });
});

// ===== Xác thực JWT =====
// Key ký token bắt buộc ≥ 32 ký tự và, ngoài môi trường Development, KHÔNG được là key mẫu trong
// appsettings.json — nếu không ai đọc được source cũng tự ký được token ADMIN hợp lệ.
var jwtOptions = JwtOptions.From(builder.Configuration);
if (jwtOptions.Key.Length < 32)
    throw new InvalidOperationException("Jwt:Key chưa cấu hình hoặc ngắn hơn 32 ký tự.");
if (!builder.Environment.IsDevelopment() && jwtOptions.Key == JwtOptions.DevPlaceholderKey)
    throw new InvalidOperationException("Jwt:Key đang là key mẫu của môi trường dev — phải đặt Jwt__Key riêng khi chạy Production.");

// Mật khẩu mặc định của tài khoản seed: Production bắt buộc cấu hình riêng (Seed:DefaultPassword).
var seedPassword = builder.Configuration["Seed:DefaultPassword"];
if (string.IsNullOrWhiteSpace(seedPassword))
{
    if (!builder.Environment.IsDevelopment())
        throw new InvalidOperationException("Seed:DefaultPassword bắt buộc khi chạy Production (mật khẩu ban đầu của tài khoản seed).");
    seedPassword = "123456";
}
else if (seedPassword.Length < 8)
{
    throw new InvalidOperationException("Seed:DefaultPassword phải dài tối thiểu 8 ký tự.");
}

builder.Services.AddSingleton(jwtOptions);
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddSingleton<LoginAttemptTracker>();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<TokenRevocationList>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = jwtOptions.SigningKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = CurrentUser.NameClaim,
            RoleClaimType = CurrentUser.RoleClaim
        };
        options.Events = new JwtBearerEvents
        {
            // Trả 403 cùng envelope {statusCode,message} như mọi API khác để giao diện hiện được lý do.
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    statusCode = 403,
                    message = "Bạn không có quyền thực hiện chức năng này",
                    data = (object?)null
                });
            },
            // Token còn hạn chưa đủ: tài khoản bị khoá/xoá hoặc bị đổi vai trò sau khi cấp token thì token
            // cũ phải mất hiệu lực. Tra DB tối đa 1 lần/phút/tài khoản (cache) để không tốn 1 query mỗi request.
            OnTokenValidated = async context =>
            {
                var userId = context.Principal?.GetUserId();
                var tokenRole = context.Principal?.FindFirst(CurrentUser.RoleClaim)?.Value;
                if (userId is null)
                {
                    context.Fail("Token thiếu UserId.");
                    return;
                }

                var services = context.HttpContext.RequestServices;
                // Token đã đăng xuất (POST /api/Users/logout) không dùng được nữa dù còn hạn.
                if (services.GetRequiredService<TokenRevocationList>().IsRevoked(context.Principal?.FindFirst("jti")?.Value))
                {
                    context.Fail("Phiên đăng nhập đã đăng xuất.");
                    return;
                }
                var cache = services.GetRequiredService<IMemoryCache>();
                var currentRole = await cache.GetOrCreateAsync($"auth:user-role:{userId}", async entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60);
                    var db = services.GetRequiredService<DepotDbContext>();
                    return await db.Users.AsNoTracking()
                        .Where(u => u.Id == userId && u.IsActive && !u.IsDeleted)
                        .Select(u => u.Role != null ? u.Role.RoleCode : string.Empty)
                        .FirstOrDefaultAsync();
                });

                if (currentRole is null || !string.Equals(currentRole, tokenRole, StringComparison.OrdinalIgnoreCase))
                    context.Fail("Tài khoản không còn hiệu lực hoặc đã đổi vai trò — vui lòng đăng nhập lại.");
            }
        };
    });

// Mặc định MỌI endpoint đều yêu cầu đăng nhập; endpoint công khai phải khai báo [AllowAnonymous] tường minh
// (đăng nhập, health, webhook ngân hàng — webhook có xác thực riêng bằng shared secret).
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
});
// Phân quyền theo vai trò: từng endpoint khai báo [RequirePermission(...)] theo ma trận RolePermissions.
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();

// Register minimal application services required for the skeleton.
// Keep registrations small to avoid build errors when other services are not yet implemented.
builder.Services.AddScoped<IDepotJobService, DepotJobService>();
builder.Services.AddScoped<IMasterDataService, MasterDataService>();
builder.Services.AddScoped<IYardService, YardService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IShippingIntegrationService, ShippingIntegrationService>();
// Gửi HTTP thật tới endpoint API hãng tàu (CarrierIntegrations:{CODE}); timeout đặt theo từng hãng trong service.
builder.Services.AddHttpClient(ShippingIntegrationService.HttpClientName, client => client.Timeout = System.Threading.Timeout.InfiniteTimeSpan);
builder.Services.AddScoped<ICleaningService, CleaningService>();
builder.Services.AddScoped<IYardOverviewService, YardOverviewService>();
builder.Services.AddScoped<IBillingService, BillingService>();
builder.Services.AddScoped<IReportsAnalyticsService, ReportsAnalyticsService>();
builder.Services.AddScoped<IDepotFileService, DepotFileService>();
// Depot.FileServer là host độc lập (chỉ lo lưu file vật lý, không đụng DB) — gọi qua HttpClient thay vì
// project reference thẳng, giữ đúng ranh giới 2 host đã tách trong solution.
builder.Services.AddHttpClient("FileServer", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["FileServer:BaseUrl"] ?? "http://localhost:50211");
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Đăng nhập qua POST /api/Users/login, dán accessToken vào đây."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// CORS: Production chạy sau proxy cùng origin của frontend nên KHÔNG mở CORS. Chỉ mở khi cấu hình rõ
// Cors:AllowedOrigins (danh sách origin được phép), hoặc ở Development cho frontend dev server :3000.
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var corsEnabled = corsOrigins.Length > 0 || builder.Environment.IsDevelopment();
if (corsEnabled)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("Frontend", policy =>
        {
            // Dev chỉ mở cho frontend dev server — trước đây AllowAnyOrigin cho mọi site gọi API (BUG-031).
            policy.WithOrigins(corsOrigins.Length > 0 ? corsOrigins : new[] { "http://localhost:3000", "http://127.0.0.1:3000" })
                .AllowAnyMethod().AllowAnyHeader();
        });
    });
}

var app = builder.Build();

// Swagger liệt kê toàn bộ API nên chỉ bật ở Development (hoặc khi đặt Swagger:Enabled=true).
var swaggerEnabled = builder.Configuration.GetValue<bool?>("Swagger:Enabled") ?? app.Environment.IsDevelopment();
if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.DocumentTitle = "Depot Backend API";
        options.RoutePrefix = "swagger";
    });
    app.MapGet("/", () => Results.Redirect("/swagger")).AllowAnonymous();
}

if (corsEnabled) app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new
{
    statusCode = 200,
    status = "ONLINE",
    backendService = "SolutionDepot API",
    database = "PostgreSQL",
    timestamp = DateTime.UtcNow
})).AllowAnonymous();
app.MapControllers();

// Migration và seed phải hoàn tất trước khi API nhận request đầu tiên.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DepotDbContext>();
    await DbInitializer.InitializeAsync(dbContext, seedPassword);
}

await app.StartAsync();

// Mở Swagger trong trình duyệt mặc định chỉ để tiện cho dev trên máy cá nhân.
if (app.Environment.IsDevelopment())
{
    try
    {
        var psi = new ProcessStartInfo
        {
            FileName = "https://localhost:5001/swagger",
            UseShellExecute = true
        };
        Process.Start(psi);
    }
    catch
    {
        // ignore if cannot open browser
    }
}

await app.WaitForShutdownAsync();
