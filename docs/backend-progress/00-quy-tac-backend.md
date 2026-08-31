# Quy tắc phát triển Backend (SolutionDepot)

Tài liệu này đúc kết từ kiến trúc **đã có sẵn** trong code (không phải quy tắc mới áp đặt) —
mục tiêu là mọi thay đổi từ giờ về sau đi đúng khuôn hiện tại, tránh mỗi màn một kiểu.

## 1. Kiến trúc & phân lớp

```
SolutionDepot/
  0. Solution Items/
  1. Infrastructure/   Depot.Utilities, Depot.ViewModels        (không phụ thuộc EF/DB)
  2. Domain/            Depot.Data (EF Core, Entities, DbContext), Depot.Application (Services, luật nghiệp vụ)
  3. Hosts/              Depot.BackendApi (Controllers), Depot.ApiIntegration (webhook), Depot.FileServer (upload)
  4. Test/                Depot.UnitTests, Depot.IntegrationTests
```

- **Controller phải mỏng.** Không viết luật nghiệp vụ trong Controller — chỉ nhận request, gọi 1 method
  Service, map kết quả vào envelope chuẩn, trả về. Toàn bộ điều kiện chuyển trạng thái, validate nghiệp
  vụ nằm trong `Depot.Application/Services/*Service.cs`.
- **Mỗi domain có 1 cặp `IXxxService` / `XxxService`** trong `Depot.Application/Services`.
- **QUY TẮC BẮT BUỘC:** ngay khi tạo interface + class Service mới, phải đăng ký vào DI container tại
  `Depot.BackendApi/Program.cs` (`builder.Services.AddScoped<IXxxService, XxxService>();`) **trong cùng
  commit/thay đổi**. Đây là lỗi thực tế đã gặp: 5 service tồn tại sẵn nhưng quên đăng ký, khiến
  `YardController`, `UsersController` (đăng nhập!), `WarehouseController`, `NotificationsController`,
  `ShippingIntegrationController` bị lỗi 500 khi gọi (xem [00-infrastructure.md](00-infrastructure.md)).

## 2. Response envelope — CHỈ dùng 1 kiểu duy nhất

Toàn bộ frontend (24 file, đã kiểm chứng qua `grep`) đọc response theo hình dạng:

```json
{ "statusCode": 200, "message": "...", "data": { } }
```

tức là dùng `ResponseSingleContentModel<T>` (`Depot.ViewModels/Common/ResponseData.cs`):

```csharp
return Ok(new ResponseSingleContentModel<T> { StatusCode = 200, Message = "...", Data = result });
```

> Lưu ý: `fontend/src/types/common.ts` có khai báo `ApiResponse<T> { success, message, data, errors,
> timestamp }` nhưng **không có nơi nào trong code frontend thực sự dùng field `success`/`errors`/
> `timestamp`** — đó là type khai báo nhưng chưa được áp dụng, không phải hợp đồng thật. **Không** đổi
> backend sang hình dạng đó. Nếu sau này cần chuẩn hoá lại, phải sửa đồng bộ cả 24 file frontend cùng
> lúc và được xác nhận trước — không tự ý đổi khi đang sửa từng màn.

- HTTP status code vẫn dùng đúng theo REST (`Ok`, `BadRequest`, `NotFound`, `Conflict`, `StatusCode(500)`),
  đồng thời field `StatusCode` bên trong body phải khớp — frontend đọc field trong body (`payload.statusCode`)
  chứ không phải status code HTTP để quyết định thành công/thất bại.
- Lỗi hệ thống (`catch (Exception ex)`) trả `StatusCode(500)` kèm `Data = ex.Message` (tiếng Việt ở
  `Message`, chi tiết kỹ thuật ở `Data`) — giữ đúng pattern đang có trong `DepotJobsController`.
- Lỗi nghiệp vụ dự đoán trước (thiếu dữ liệu, sai trạng thái) trả `BadRequest` (400), không ném exception.

## 3. Entity = View Model

Project **không có lớp DTO/mapping riêng (AutoMapper...)** cho phần lớn API đọc dữ liệu — Controller trả
thẳng entity EF Core ra JSON (xem `DepotJobsController.GetAllJobs`, `YardController.GetPositions`...).

Hệ quả và quy tắc đi kèm:
- Khi frontend cần 1 field phẳng không có sẵn trên entity (vd. `shippingLineCode` thay vì object
  `shippingLine.code`), thêm **computed property `[NotMapped]`** ngay trên entity thay vì tạo DTO mới:
  ```csharp
  [NotMapped]
  public string? ShippingLineCode => ShippingLine?.Code;
  ```
  (đã áp dụng ở `DepotJob.cs` — xem [02-container-list.md](02-container-list.md)).
- Khi trả ra 1 navigation property, **phải `.Include()`** ở Service, nếu không sẽ luôn `null` dù entity
  có quan hệ trong DB.
- Chỉ tách sang ViewModel/DTO riêng (`Depot.ViewModels`) khi: (a) endpoint là ghi/nhận input (Request
  models đã có sẵn dùng cách này — `CreateDepotJobRequest`, `SurveyRecordViewModel`...), hoặc (b) entity
  chứa field nhạy cảm không được lộ ra API, hoặc (c) response cần tổng hợp từ nhiều entity (KPI, thống kê).
- Đừng thêm AutoMapper/MediatR "cho chuẩn" nếu không ai yêu cầu — không khớp pattern hiện tại của dự án,
  sẽ làm code không đồng nhất.

## 3b. Dữ liệu đầu vào từ frontend → luôn định nghĩa trong `Depot.ViewModels`

**Mọi class nhận dữ liệu request từ frontend (body/query của POST/PUT/PATCH) phải khai báo trong project
`Depot.ViewModels`, không được khai báo inline trong Controller, Service hay Entity.** Đây là pattern
100% nhất quán hiện tại — đã kiểm tra, không có Controller nào tự khai báo request class riêng.

- Vị trí: `1. Infrastructure/Depot.ViewModels/<Domain>ViewModels.cs` — 1 file gộp theo domain, chứa cả
  request lẫn vài response DTO tổng hợp của domain đó. File hiện có: `UserViewModels.cs`,
  `DepotJobViewModels.cs`, `MasterViewModels.cs`, `WarehouseViewModels.cs`, `WorkflowViewModels.cs`,
  cộng `Common/ResponseData.cs` + `Common/ApiErrorResult.cs` cho envelope dùng chung toàn hệ thống.
  Domain mới (Billing, Cleaning, Department...) → tạo file mới `<Domain>ViewModels.cs` cùng thư mục,
  không nhét vào file domain khác.
- Đặt tên class theo hành động, hậu tố `Request` cho input ghi dữ liệu (`CreateDepotJobRequest`,
  `RejectEstimateRequest`, `ProcessPaymentRequest`...), hậu tố `ViewModel` khi input là 1 bản ghi/biểu
  mẫu phức tạp có cấu trúc lồng nhau (`SurveyRecordViewModel`, `EstimateViewModel`), hậu tố `FilterRequest`
  cho tham số lọc danh sách (`DepotJobFilterRequest`).
  Response DTO tổng hợp dùng hậu tố `Dto` (`KpiSummaryDto`, `DepotJobHistoryDto`).
- `Depot.ViewModels` KHÔNG phụ thuộc EF Core/`Depot.Data` (xem sơ đồ mục 1) — chỉ chứa property đơn giản,
  không entity, không navigation, không logic. Giữ layer này thuần làm hợp đồng dữ liệu (contract) giữa
  frontend và Controller.
- Controller nhận request qua `[FromBody]`/`[FromQuery]` trỏ thẳng tới class trong `Depot.ViewModels`,
  Service nhận đúng class đó làm tham số — không map sang class trung gian khác giữa Controller và Service.

## 4. Naming & kiểu dữ liệu

- JSON camelCase tự động (ASP.NET Core mặc định) — không cần cấu hình `PropertyNamingPolicy`.
- Khóa chính: `Guid` cho hầu hết entity nghiệp vụ (`DepotJob`, `Survey`, `Estimate`, `Payment`,
  `RepairOrder`...); `int` cho vài entity danh mục/hệ thống cũ hơn (`SystemUser`, `YardPosition`,
  `ShippingLine`, `Company`) — **kiểm tra đúng kiểu id trước khi thêm route mới**, đã có 1 lỗi lệch kiểu
  ở `/system/users/{id}` (int) trong khi frontend gửi string/Guid.
- Trạng thái nghiệp vụ (`Status`) lưu dạng `string` UPPER_SNAKE_CASE trực tiếp trong cột, KHÔNG dùng
  C# `enum` + số nguyên. Danh sách giá trị hiện có: `GATE_IN, SURVEYING, ESTIMATING, REPAIRING,
  READY_FOR_OUT, GATE_OUT, PAID, ...` — khi thêm trạng thái mới, đặt tên theo đúng convention này và
  cập nhật nơi generate audit log tương ứng.
- Field tiền tệ: `decimal`, đơn vị VNĐ, hậu tố tên `...Vnd` (`TotalRevenueVnd`, `GrandTotalVnd`).
- Comment XML (`/// <summary>`) bằng tiếng Việt trên entity/property — giữ nguyên văn phong đang có.

## 5. Database & Migration

> Quy tắc chi tiết khi tạo bảng mới (entity, Configuration, index, precision, OnDelete...):
> xem [00b-quy-tac-tao-bang.md](00b-quy-tac-tao-bang.md).

- PostgreSQL là database chính, qua `Npgsql`. Không dùng InMemory khi chạy thật.
- Sửa entity → tạo migration mới bằng `dotnet ef migrations add <Tên>` trong `Depot.Data`, KHÔNG sửa tay
  file migration cũ, KHÔNG sửa tay schema trên DB.
- `DbInitializer.InitializeAsync` chạy migration + seed lúc `Program.cs` khởi động — mọi migration mới
  phải chạy sạch qua đường này (test bằng `dotnet build` là chưa đủ, cần chạy thử API để migration áp
  dụng thật khi có Postgres).

## 6. Quy trình rà theo từng màn (đang áp dụng cho toàn bộ menu)

1. Đọc trang frontend + file `*.api.ts` liên quan → xác định chính xác endpoint, field response đang
   được đọc (ưu tiên đọc **usage thực tế** trong component, không chỉ tin vào type khai báo — 2 cái có
   thể lệch nhau, xem mục 2).
2. Đối chiếu Controller/Service/Entity backend tương ứng.
3. Sửa/bổ sung nếu thiếu hoặc field không khớp, theo đúng mục 1–5 ở trên.
4. `dotnet build` lại project bị đổi — phải 0 Error mới coi là xong.
5. Ghi lại vào `docs/backend-progress/NN-ten-man.md`, cập nhật trạng thái trong `INDEX.md`.
6. Không tự ý sửa các phần "trông có vẻ sai" nhưng nằm ngoài màn đang làm nếu chưa xác nhận — ghi chú
   lại trong mục "Chưa làm" của file .md để xử lý đúng lượt.

## 7. Việc lớn — không tự quyết, phải hỏi trước khi làm

- Đổi response envelope toàn hệ thống.
- Thêm module hoàn toàn mới (entity + migration + controller) cho các màn frontend đã có UI nhưng backend
  chưa có gì (Billing, Cleaning, Department...).
- Bổ sung Auth/JWT thật (login hiện chưa sinh token, chưa có `[Authorize]`).
- Xoá/viết lại `DepotContext.tsx` (nghi là code cũ trùng lặp, gọi route backend không tồn tại) — việc này
  thuộc phía frontend, ngoài phạm vi "làm backend theo frontend", chỉ nêu lại khi rà xong toàn bộ menu.
