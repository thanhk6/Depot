# SolutionDepot Local Runbook

## 1. Phạm vi

Tài liệu này hướng dẫn chạy SolutionDepot theo kiến trúc hiện tại:

```text
React/Vite Frontend :3000
        |
        v
Express development proxy :3000
        |
        v
ASP.NET Core Backend :50210
        |
        v
SQL Server - SolutionDepotDb
```

Backend nghiệp vụ nằm trong `2. Domain`, request/response nằm trong `1. Infrastructure/Depot.ViewModels`, API host nằm trong `3. Hosts/Depot.BackendApi`.

## 2. Điều kiện môi trường

- Windows PowerShell
- .NET 8 SDK
- Node.js và npm
- PostgreSQL instance đang chạy ở `localhost:5432`
- Database login được cấu hình trong `appsettings.json` hoặc biến môi trường

Không commit mật khẩu thật vào source control. Với máy khác, ưu tiên dùng User Secrets hoặc biến môi trường:

```powershell
$env:ConnectionStrings__PostgreSqlConnection = 'Host=localhost;Port=5432;Database=SolutionDepotDb;Username=postgres;Password=...;'
```

## 3. Kiểm tra PostgreSQL

Mở terminal tại workspace root trước khi chạy các lệnh tương đối:

```powershell
Set-Location 'D:\New folder\web\anh hoang\Newfolder'
```

```powershell
Get-Service postgresql*
```

Nếu service đang dừng, mở PowerShell với quyền phù hợp và chạy:

```powershell
Start-Service postgresql*
```

## 4. Cấu hình database

File cấu hình:

`SolutionDepot/3. Hosts/Depot.BackendApi/appsettings.json`

Các giá trị bắt buộc:

```json
{
  "ConnectionStrings": {
    "PostgreSqlConnection": "Host=localhost;Port=5432;Database=SolutionDepotDb;Username=postgres;Password=...;"
  }
}
```

Backend không dùng InMemory khi chạy bình thường.

## 5. Restore và build backend

Chạy từ thư mục gốc workspace:

```powershell
dotnet restore "SolutionDepot/3. Hosts/Depot.BackendApi/Depot.BackendApi.csproj"
dotnet build "SolutionDepot/3. Hosts/Depot.BackendApi/Depot.BackendApi.csproj"
```

Nếu build báo DLL đang bị khóa, dừng tiến trình API đang chạy trên port `50210` rồi build lại:

```powershell
$connection = Get-NetTCPConnection -LocalPort 50210 -ErrorAction SilentlyContinue
if ($connection) { Stop-Process -Id $connection.OwningProcess -Force }
```

## 6. Migration và database update

Migration hiện nằm tại:

`SolutionDepot/2. Domain/Depot.Data/Migrations`

Sinh migration mới khi model thay đổi:

```powershell
dotnet ef migrations add <MigrationName> `
  --project "SolutionDepot/2. Domain/Depot.Data/Depot.Data.csproj" `
  --startup-project "SolutionDepot/3. Hosts/Depot.BackendApi/Depot.BackendApi.csproj" `
  --output-dir Migrations
```

Áp dụng migration:

```powershell
dotnet ef database update `
  --project "SolutionDepot/2. Domain/Depot.Data/Depot.Data.csproj" `
  --startup-project "SolutionDepot/3. Hosts/Depot.BackendApi/Depot.BackendApi.csproj"
```

Khi backend khởi động, `DbInitializer` cũng gọi `MigrateAsync` và seed dữ liệu development.

## 7. Chạy backend

```powershell
dotnet run --project "SolutionDepot/3. Hosts/Depot.BackendApi/Depot.BackendApi.csproj"
```

Địa chỉ:

- API: http://localhost:50210
- HTTPS: https://localhost:50209
- Swagger: http://localhost:50210/swagger

Giữ terminal backend chạy trong suốt thời gian dùng frontend.

## 8. Chạy frontend

Mở terminal khác:

```powershell
Set-Location fontend
npm install
npm run lint
npm run dev
```

Địa chỉ giao diện:

- http://localhost:3000

`fontend/server.ts` chuyển các request workflow/auth chính sang backend .NET. Frontend API không gọi SQL Server trực tiếp.

## 9. Đăng nhập kiểm tra

Tài khoản development:

```text
Username: admin
Password: 123456
```

API tương ứng:

```powershell
Invoke-RestMethod -Method Post `
  -Uri 'http://localhost:50210/api/Users/authenticate' `
  -ContentType 'application/json' `
  -Body '{"username":"admin","password":"123456"}'
```

## 10. Smoke test hệ thống

```powershell
$headers = @{ 'Content-Type' = 'application/json' }

$gateIn = Invoke-RestMethod -Method Post `
  -Uri 'http://localhost:3000/api/jobs/gate-in' `
  -Headers $headers `
  -Body '{"containerNo":"MSKU1234501","isoSize":"40HC","shippingLine":"MAEU","tareWeightKg":3820,"maxPayloadKg":28680}'

$gateIn.data.jobNo
$gateIn.data.gateInEirNo

Invoke-RestMethod -Method Get -Uri 'http://localhost:3000/api/jobs'
```

Kết quả đúng phải có:

- HTTP `200`
- JobNo được sinh tự động
- EIR dạng `EIR-IN-yyyyMMdd-xxxxxx`
- Job xuất hiện lại khi gọi danh sách

## 11. Luồng nghiệp vụ đầy đủ

1. Gate-In: `POST /api/DepotJobs/gate-in`
2. Survey: `POST /api/DepotJobs/{id}/survey`
3. Estimate: `POST /api/DepotJobs/{id}/estimate`
4. Approve: `POST /api/DepotJobs/{id}/approve-estimate`
5. Assign Repair: `POST /api/DepotJobs/{id}/repair/assign`
6. Start Repair: `POST /api/DepotJobs/{id}/repair/start`
7. Complete Repair: `POST /api/DepotJobs/{id}/repair/complete`
8. QC: `POST /api/DepotJobs/{id}/qc-complete`
9. Shipping ACK: `POST /api/shipping/sync`
10. Gate-Out: `POST /api/DepotJobs/{id}/gate-out`

Các trạng thái chính:

```text
GATE_IN -> SURVEYING -> ESTIMATING -> REPAIRING
         -> QC_PENDING -> READY_FOR_OUT -> GATE_OUT
```

## 12. Kiểm tra nhanh endpoint

```powershell
Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing
Invoke-WebRequest -Uri 'http://localhost:50210/swagger/index.html' -UseBasicParsing
Invoke-RestMethod -Uri 'http://localhost:50210/api/DepotJobs'
Invoke-RestMethod -Uri 'http://localhost:50210/api/Yard'
Invoke-RestMethod -Uri 'http://localhost:50210/api/MasterData/shipping-lines'
Invoke-RestMethod -Uri 'http://localhost:50210/api/MasterData/materials'
```

## 13. Chạy integration tests

Bộ test dùng SQLite in-memory để kiểm tra Application Service độc lập với dữ liệu
development trong SQL Server, nhưng vẫn xác nhận các business rule và quan hệ Business Key:

```powershell
dotnet test "4.Test\Depot.IntegrationTests\Depot.IntegrationTests.csproj"
```

Các nhóm test hiện có:

- Gate-In lưu JobNo, ShippingLineCode, EIR và AuditLog.
- Từ chối ShippingLine.Code không tồn tại.
- Từ chối container đang hoạt động bị trùng.
- Survey chuyển Job sang `ESTIMATING` và lưu Damage theo JobNo.
- Payment chuyển Job sang `PAID` và lưu Payment theo JobNo.

## 13. Sự cố thường gặp

### Port đã được dùng

```powershell
Get-NetTCPConnection -LocalPort 3000,50210
```

Dừng đúng process đang giữ port, không dùng `git reset` hoặc xóa source.

### DLL bị khóa khi build

Dừng backend đang chạy, sau đó build lại. Backend phải được khởi động sau build thành công.

### SQL login thất bại

Kiểm tra:

- SQL Server service đang chạy.
- Tên instance đúng.
- Database login có quyền tạo database/table.
- Connection string không có ký tự escape sai.
- Dùng `TrustServerCertificate=True` cho local development.

### Migration lỗi

Không dùng `EnsureCreated` để che lỗi migration. Đọc lỗi SQL, sửa model/migration, rồi chạy lại `dotnet ef database update`.

## 14. Quy tắc phát triển

- Controller mỏng, không viết business logic trong Controller.
- Business rule đặt trong `Depot.Application/Services`.
- DTO đặt trong `Depot.ViewModels`, không trả entity EF ở API mới nếu có thể tránh.
- Mọi thay đổi entity phải tạo migration.
- Giá tiền và số đo decimal dùng precision `18,2`.
- Kiểm thử API sau mỗi thay đổi workflow.
- Không commit mật khẩu production.

## 15. Quy tắc Business Key

`Id` chỉ là surrogate key kỹ thuật. Không dùng `Id` để liên kết nghiệp vụ.

- Hãng tàu: `ShippingLine.Code` là principal key; `Container.ShippingLineCode` và `DepotJob.ShippingLineCode` là foreign key.
- Hồ sơ container: `DepotJob.JobNo` là principal business key; Survey, Estimate, RepairOrder, Payment và AuditLog tham chiếu bằng `JobNo`.
- Phân quyền: `Role.RoleCode` là principal key; `SystemUser.RoleName` tham chiếu bằng `RoleCode`.
- Business Code/JobNo bắt buộc, có độ dài chuẩn, unique index và không được đổi sau khi phát sinh giao dịch.
- Migration `EnforceBusinessKeys` backfill mã từ các quan hệ `...Id` cũ trước khi tạo FK business key.

Không xóa các cột `...Id` tương thích cũ nếu chưa có kế hoạch migration dữ liệu và code client hoàn chỉnh; chúng không còn là FK nghiệp vụ.

## 15. Lần chạy đã xác nhận

Ngày `2026-08-18`, quy trình này đã được chạy thành công trên máy development:

- SQL Server service `MSSQL$SQLEXPRESS`: `Running`.
- `dotnet restore`: thành công.
- Backend build: thành công.
- `dotnet ef database update`: database up to date.
- Backend startup: kết nối SQL Server, migration và seed thành công.
- Frontend root: HTTP `200`.
- Swagger: HTTP `200`.
- Login `admin/123456`: HTTP `200`.
- Gate-In qua frontend proxy: HTTP `200`.
- Job kiểm chứng: `JOB-2026-9821`.
- EIR kiểm chứng: `EIR-IN-20260818-626293`.
- Tra cứu lại container từ backend SQL: HTTP `200`, trạng thái `SURVEYING`.
