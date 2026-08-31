using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json.Serialization;
using Depot.Data.EF;
using Depot.Application.Services;
using Microsoft.AspNetCore.Hosting.Server.Features;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Composition root: chỉ đăng ký dependency và middleware; business rule nằm ở Application.
// PostgreSQL là database chính, không dùng InMemory khi chạy ứng dụng.
var connectionString = builder.Configuration.GetConnectionString("PostgreSqlConnection");

builder.Services.AddDbContext<DepotDbContext>(options =>
{
    if (string.IsNullOrWhiteSpace(connectionString))
        throw new InvalidOperationException("ConnectionStrings:PostgreSqlConnection chưa được cấu hình.");

    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.MigrationsAssembly("Depot.Data");
    });
});

// Register minimal application services required for the skeleton.
// Keep registrations small to avoid build errors when other services are not yet implemented.
builder.Services.AddScoped<IDepotJobService, DepotJobService>();
builder.Services.AddScoped<IMasterDataService, MasterDataService>();
builder.Services.AddScoped<IYardService, YardService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IShippingIntegrationService, ShippingIntegrationService>();
builder.Services.AddScoped<ICleaningService, CleaningService>();
builder.Services.AddScoped<IYardOverviewService, YardOverviewService>();
builder.Services.AddScoped<IBillingService, BillingService>();
builder.Services.AddScoped<IReportsAnalyticsService, ReportsAnalyticsService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Frontend dev server :3000 cần gọi API :50210 trong local development.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p =>
        p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.DocumentTitle = "Depot Backend API";
    options.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseAuthorization();

app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapGet("/api/health", () => Results.Ok(new
{
    statusCode = 200,
    status = "ONLINE",
    backendService = "SolutionDepot API",
    database = "PostgreSQL",
    timestamp = DateTime.UtcNow
}));
app.MapControllers();

// Migration và seed phải hoàn tất trước khi API nhận request đầu tiên.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DepotDbContext>();
    await DbInitializer.InitializeAsync(dbContext);
}

// Start the web app and then open Swagger in the default browser for developer convenience.
// This will attempt to open the first server address and navigate to /swagger.

await app.StartAsync();

// Open a fixed Swagger URL in the default browser for developer convenience.
// This is a best-effort action and will be ignored on headless environments.
try
{
    var fixedUrl = "https://localhost:5001/swagger";
    var psi = new ProcessStartInfo
    {
        FileName = fixedUrl,
        UseShellExecute = true
    };
    Process.Start(psi);
}
catch
{
    // ignore if cannot open browser
}

await app.WaitForShutdownAsync();
