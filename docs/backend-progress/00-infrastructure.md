# 00 — Hạ tầng nền (Dependency Injection, JSON, DB)

Đây không phải một màn hình cụ thể trong menu, nhưng là lỗi chặn hầu hết các API —
phải sửa trước khi làm bất kỳ màn nào khác.

## Vấn đề phát hiện

`Depot.BackendApi/Program.cs` chỉ đăng ký 2 service vào DI container:

```csharp
builder.Services.AddScoped<IDepotJobService, DepotJobService>();
builder.Services.AddScoped<IMasterDataService, MasterDataService>();
```

Trong khi đó có 7 controller cần service, 5 service sau **chưa được đăng ký**:

| Interface | Class impl | Controller phụ thuộc |
|---|---|---|
| `IYardService` | `YardService` | `YardController` |
| `IUserService` | `UserService` | `UsersController` (login), `SystemController` |
| `IWarehouseService` | `WarehouseService` | `WarehouseController` |
| `INotificationService` | `NotificationService` | `NotificationsController` |
| `IShippingIntegrationService` | `ShippingIntegrationService` | `ShippingIntegrationController` |

Hậu quả: mọi request tới các controller trên sẽ ném `InvalidOperationException` lúc
ASP.NET Core resolve constructor (lỗi 500), bao gồm cả **đăng nhập** (`UsersController.Login`).

## Đã sửa

`Program.cs` — thêm 5 dòng đăng ký còn thiếu:

```csharp
builder.Services.AddScoped<IYardService, YardService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IShippingIntegrationService, ShippingIntegrationService>();
```

Build lại `Depot.BackendApi` → **0 Warning, 0 Error**.

## Chưa làm (để sau, không chặn các màn tiếp theo)

- JWT chưa cấu hình (login vẫn trả `UserDto` thuần, không có access/refresh token, không có `[Authorize]`).
- `appsettings.json` chưa mask thông tin kết nối DB (đang để plaintext, cần xem lại khi deploy thật).
