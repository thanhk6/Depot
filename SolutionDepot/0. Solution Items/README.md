# SolutionDepot - Hệ Thống Quản Lý Depot Container (.NET Core 8.0)

## Kiến Trúc Solution (.NET 8.0 Clean Architecture)

### Quy ước đọc code

- `Depot.ViewModels`: contract JSON của request/response, không chứa truy vấn database.
- `Depot.Application/Services`: use-case và business rule; comment XML tập trung vào điều kiện chuyển trạng thái.
- `Depot.Data/Entities`: mô hình dữ liệu SQL Server và quan hệ aggregate.
- `Depot.BackendApi/Controllers`: lớp HTTP mỏng, validate input cơ bản rồi gọi service.
- `Program.cs`: composition root, chỉ đăng ký DI, database, middleware và startup migration.

Khi thêm nghiệp vụ, đọc `DEPOT_LOCAL_RUNBOOK.md` và comment trên `IDepotJobService` trước khi sửa Controller.

Hệ thống Quản lý Depot Container được thiết kế theo mô hình Clean Architecture / Layered Architecture đáp ứng 7 quy trình nghiệp vụ:


---

## Cấu Trúc Thư Mục Solution (`SolutionDepot.sln`)

```text
SolutionDepot/
├── 0. Solution Items/
│   └── README.md
├── 1. Infrastructure/
│   ├── Depot.Utilities/           (Mã hóa, VietQR generator, QR Code, String Extension)
│   └── Depot.ViewModels/          (Data Transfer Objects / ViewModels / Request Contracts)
├── 2. Domain/
│   ├── Depot.Data/                (EF Core DbContext, Entities, Migrations, Repositories)
│   └── Depot.Application/         (Business Logic Services, Interfaces, AutoMapper)
└── 3. Hosts/
    ├── Depot.BackendApi/          (ASP.NET Core Web API, Swagger, JWT Auth Controllers)
    ├── Depot.ApiIntegration/      (VietQR Bank Webhook Listener, Shipping Line Gateway API)
    └── Depot.AdminApp/            (Admin Dashboard Web App Client / Management)
```

---

## Yêu Cầu Môi Trường
- .NET 8.0 SDK
- PostgreSQL 15+ / SQL Server 2022
- Entity Framework Core 8.0

## Lệnh Chạy Ứng Dụng Backend (.NET 8)
```bash
# Build Solution
dotnet build SolutionDepot.sln

# Run Backend Web API
cd "3. Hosts/Depot.BackendApi"
dotnet run
```
