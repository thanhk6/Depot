# Backend Implementation Notes

## Mục đích

Backend trong `SolutionDepot` triển khai các use-case của tài liệu `DEPOT_SOLUTION_DOCUMENTATION` cho frontend React. Controller chỉ nhận request/response; luật nghiệp vụ nằm trong `Depot.Application/Services`.

## Luồng trạng thái chính

```text
GATE_IN
  -> SURVEYING
  -> ESTIMATING
  -> PENDING_APPROVAL
  -> REPAIRING
  -> QC_PENDING
  -> READY_FOR_OUT
  -> GATE_OUT
```

Nhánh từ chối estimate quay lại `ESTIMATING`. QC không đạt quay lại `REPAIRING`.

## API chính

- `POST /api/Users/authenticate`: đăng nhập development.
- `GET /api/DepotJobs`: danh sách hồ sơ container.
- `POST /api/DepotJobs/gate-in`: tiếp nhận container và sinh `EIR-IN`.
- `POST /api/DepotJobs/{id}/survey`: lưu giám định/hư hỏng.
- `POST /api/DepotJobs/{id}/estimate`: lập báo giá.
- `POST /api/DepotJobs/{id}/approve-estimate`: hãng tàu duyệt.
- `POST /api/DepotJobs/{id}/reject-estimate`: hãng tàu từ chối.
- `POST /api/DepotJobs/{id}/repair/assign`: phân công Work Order.
- `POST /api/DepotJobs/{id}/repair/start`: bắt đầu thi công.
- `POST /api/DepotJobs/{id}/repair/complete`: hoàn tất sửa chữa.
- `POST /api/DepotJobs/{id}/qc-complete`: nghiệm thu QC.
- `POST /api/DepotJobs/{id}/gate-out`: cấp vỏ, sinh `EIR-OUT`, giải phóng ô bãi.
- `GET /api/Yard`: sơ đồ vị trí bãi.
- `POST /api/MasterData/materials`: thêm vật tư.
- `POST /api/shipping/sync`: mô phỏng EDI/REST sync và trả ACK token.
- `POST /api/Webhooks/bank-vietqr`: khớp thanh toán VietQR.

## Quy tắc quan trọng

- Không cho tạo container trùng khi hồ sơ cũ chưa `GATE_OUT`.
- Không duyệt estimate nếu chưa có estimate ở trạng thái `PENDING_APPROVAL`.
- Không bắt đầu sửa nếu estimate chưa `APPROVED`.
- Không QC nếu chưa hoàn tất Repair Order.
- Không Gate-Out nếu chưa `READY_FOR_OUT`.
- Không cho di chuyển vào ô bãi đang bị chiếm.
- Các entity aggregate mới được thêm trực tiếp qua `DbSet` để tương thích EF Core InMemory và SQL Server.
- `Program.cs` bật `ReferenceHandler.IgnoreCycles` vì entity EF có navigation hai chiều; về lâu dài nên trả DTO thay vì entity trực tiếp.

## Chạy local

Backend:

```powershell
dotnet run --project "SolutionDepot\3. Hosts\Depot.BackendApi\Depot.BackendApi.csproj"
```

- API: `http://localhost:50210`
- Swagger: `http://localhost:50210/swagger`

Frontend:

```powershell
Set-Location fontend
npm run dev
```

- UI: `http://localhost:3000`
- `fontend/server.ts` forward các route workflow/auth chính sang backend .NET; các module chưa có API backend vẫn dùng fallback development.

## Production follow-up

- Thay InMemory bằng SQL Server và chạy migration.
- Thay token development bằng JWT + refresh token thật.
- Thay ShippingIntegrationService local ACK bằng adapter hãng tàu có retry/HMAC.
- Trả DTO riêng cho list/detail để không expose EF navigation properties.
