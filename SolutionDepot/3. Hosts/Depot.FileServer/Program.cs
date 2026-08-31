using Depot.FileServer.Storage;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IFileStorageService, FileStorageService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("Frontend");
app.MapGet("/api/health", () => Results.Ok(new
{
    statusCode = 200,
    status = "ONLINE",
    service = "Depot File Server",
    timestamp = DateTime.UtcNow
}));
app.MapControllers();
app.Run();
