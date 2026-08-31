# 03 — 1. Tiếp Nhận Cổng (Gate-In)

Menu: `gate` → `GateInPage.tsx` (`fontend/src/modules/gate/pages/GateInPage.tsx`, 1631 dòng, 5 sub-tab
nội bộ: `gate_in`, `gate_out`, `live_queue`, `eir_list`, `tariffs`).

## Frontend gọi gì

Chỉ **2 lệnh gọi backend thật** trong toàn bộ file (đã `grep` xác nhận, không có lệnh nào khác):

```ts
masterDataApi.getShippingLines()      // load danh sách hãng tàu cho <select>
containerApi.createGateIn({...})      // submit form Gate-In (tab 1)
```

4 sub-tab còn lại (`gate_out`, `live_queue`, `eir_list`, `tariffs`) chỉ thao tác state cục bộ trong
component (`gateLanes`, `createdEir`...), **không gọi API nào** — xem mục "Chưa làm" bên dưới.

## Đối chiếu backend

- `GET /api/MasterData/shipping-lines` → `MasterDataController.GetShippingLines` →
  `_masterService.GetAllShippingLinesAsync()` → trả thẳng list entity `ShippingLine` (`Code`, `Name`)
  qua envelope chuẩn. Frontend đọc `response.data[].code/name` — khớp field JSON camelCase. ✅
- `POST /api/DepotJobs/gate-in` → `DepotJobsController.CreateGateIn` → `DepotJobService.CreateGateInJobAsync`:
  - Validate: số container 11 ký tự, ISO size hợp lệ, hãng tàu tồn tại trong `ShippingLines.Code`,
    tare/max payload > 0, container không được trùng hồ sơ đang hoạt động (`Status != GATE_OUT`).
  - Thông báo lỗi nghiệp vụ (tiếng Việt: "Thiếu số container", "Thiếu hãng tàu", "Tare weight phải lớn
    hơn 0", "Max payload phải lớn hơn 0"...) khớp đúng regex `mapBackendGateInErrorToField` phía frontend
    (dùng để focus lại đúng field lỗi) — không có field nào bị lệch.
  - Tạo `DepotJob` mới (`Status = SURVEYING`, sinh `JobNo`, `GateInEirNo`), gán thẳng navigation
    `ShippingLine` nên computed property `ShippingLineCode` (`[NotMapped]`, đã có sẵn từ màn 02) trả
    đúng giá trị ngay khi tạo, không cần `Include()` lại.
  - Trả `ResponseSingleContentModel<DepotJob>` — frontend đọc `persistedJob.id/jobNo/gateInEirNo/status/
    containerNo/isoSize/shippingLineCode` đều khớp field entity (camelCase tự động). ✅

Không phát hiện lỗi — cả 2 endpoint đã khớp đúng response shape và validate message với frontend, không
cần sửa gì ở lượt này.

## Bug đã sửa (phát hiện khi so khớp toàn bộ field form ↔ payload gửi backend, 2026-08-23)

**Form Gate-In thu thập 18 field nhưng chỉ 5 field được gửi lên backend** — biển số đầu kéo, biển
rơ-moóc, họ tên/SĐT tài xế, seal no, booking no, đơn vị vận tải, ghi chú chỉ tồn tại tạm trong state
React (`gateLanes`/`createdEir`) để in phiếu e-EIR ngay lúc đó, **F5 lại trang là mất trắng**, không truy
vết được ai giao container vào depot. Trong khi đó `DepotJob` entity đã có sẵn cột tương đương cho
Gate-**Out** (`GateOutTruckPlate/DriverName/TrailerPlate/SealNo`) nhưng thiếu hẳn cho Gate-**In** — bất
đối xứng rõ ràng, không phải thiết kế cố ý.

Đã sửa (người dùng xác nhận triển khai):
- Thêm 8 cột `GateInTruckPlate/TrailerPlate/DriverName/DriverPhone/SealNo/BookingNo/TruckingCompany/Remarks`
  vào `DepotJob` — migration `AddGateInDriverInfo`.
- `CreateDepotJobRequest` DTO thêm `TruckPlate/DriverName/DriverPhone` (bắt buộc) +
  `TrailerPlate/SealNo/BookingNo/TruckingCompany/Remarks` (tuỳ chọn).
- `ValidateGateInRequest` (backend) thêm validate 3 field bắt buộc mới, dùng đúng message tiếng Việt khớp
  với `mapBackendGateInErrorToField` phía frontend (không cần sửa regex).
- Frontend: `container.api.ts` (`CreateGateInRequest`) + `GateInPage.tsx` (payload gửi) +
  `CustomerPage.tsx` (luồng Gate-In thứ 2 từ Customer Portal, dùng `GateInRegistration` đã có sẵn field
  tương ứng) đều gửi đủ field mới.

**Phát hiện phụ nghiêm trọng hơn trong lúc build:** khi build lại sau khi đổi `DepotJob.cs`, lộ ra
**5 entity đã bị sai kiểu khóa chính từ trước** (`DepotJob`, `JobAuditLog`, `Estimate`, `EstimateItem`,
`RepairOrder` khai `FullAuditedEntity<long>`/`<int>` thay vì `<Guid>`) — lỗi này luôn tồn tại trong source
nhưng bị che giấu vì backend đang chạy (`dotnet run --no-build`) dùng binary cũ build từ trước khi lỗi
này xuất hiện trong source, nên chưa từng bị phát hiện qua build hay test runtime trước đó. Xác nhận đúng
là bug (không phải đổi ý thiết kế) bằng cách đối chiếu migration snapshot mới nhất — cả 5 bảng đều là
`uuid` trong DB thật — và toàn bộ code gọi (`Guid jobId` xuyên suốt `DepotJobService.cs`). Đã sửa cả 5
entity về lại `FullAuditedEntity<Guid>`, build lại solution 0 lỗi, migration mới chỉ thêm cột (không
`AlterColumn` gì vì DB vốn đã đúng `uuid`), áp dụng thành công vào Postgres thật.

Đã chạy thử thật qua browser (Playwright) + gọi thẳng `GET /api/DepotJobs` xác nhận cả 6 field
(truckPlate, trailerPlate, driverName, driverPhone, sealNo, remarks) lưu đúng và đọc lại đúng từ Postgres
thật.

## Bug đã sửa thêm — sub-tab "2. Cấp Vỏ & Xuất Cổng (Gate-Out)" là mock, không persist (2026-08-24)

Theo yêu cầu người dùng ("fix màn này cho rồi cả backend"), rà lại sub-tab Gate-Out nằm ngay trong
`GateInPage.tsx` (khác với module `gate_out` thật ở menu "CỔNG XUẤT & GATE-OUT"). Xác nhận đúng như ghi
chú lượt trước: `handleGateOutSubmit` cũ chỉ sinh `EIR-OUT-...` bằng `Math.random()` và lưu vào state
React cục bộ, **không gọi API nào**, F5 mất trắng, không trừ container khỏi bãi thật.

Backend đã có sẵn endpoint thật cho đúng nghiệp vụ này (`POST /api/DepotJobs/{id}/gate-out` →
`DepotJobService.GateOutAsync`, yêu cầu job đang ở `Status = READY_FOR_OUT`, nhận
`truckPlate/driverName/trailerPlate/sealNo`) — module `gate_out` (mục #17-20) đã dùng endpoint này và
audit trước đó đã xác nhận ✅. Vấn đề chỉ nằm ở chỗ sub-tab bên trong `GateInPage` chưa từng gọi tới nó.

Đã sửa (chỉ frontend, không cần đổi backend vì endpoint đã đúng và đủ dùng):
- `container.api.ts` — thêm `GateOutRequest` + `containerApi.gateOut(id, data)` gọi
  `POST /DepotJobs/{id}/gate-out`.
- `GateInPage.tsx`:
  - Sửa bug lọc container khả dụng (`availableGateOutContainers`) — điều kiện cũ so `container.status`
    với `'AV'` (giá trị này thực ra thuộc field `condition`, không phải `status`, nên never match), thiếu
    hẳn trạng thái thật `READY_FOR_OUT` mà backend yêu cầu. Đã sửa thành
    `status === 'READY_FOR_OUT' || status === 'READY_FOR_USE' || condition === 'AV'`.
  - `handleGateOutSubmit` viết lại thành async: validate 3 field bắt buộc (container, biển số, tài xế) →
    `containerApi.getById(containerNo)` lấy `id` thật của job → `containerApi.gateOut(id, {...})` →
    gọi lại `getById` lần 2 để đọc đúng `gateOutEirNo` đã persist thật (thay vì tự bịa số phiếu ở
    client như code cũ, và thay vì tin vào response Gate-Out — response đó chỉ trả `Data: "GATE_OUT"`,
    không kèm số EIR).
  - Thêm banner lỗi + lỗi từng field (giống UX tab Gate-In) + trạng thái loading khi đang ghi
    SQL Server, disable nút submit khi đang gửi.
- Build backend (`dotnet build`) 0 lỗi (không đổi code backend), `tsc --noEmit` frontend 0 lỗi.

**Ghi chú còn lại (không thuộc phạm vi lần này, không tự ý sửa):** `GateOutRequest` (backend) và cả module
`gate_out` thật đều chỉ lưu 4 field (`truckPlate/driverName/trailerPlate/sealNo`) — các field UI khác của
sub-tab này (số lệnh cấp vỏ, số booking, SĐT tài xế, đơn vị vận tải, cảng đích) chỉ hiển thị trên phiếu
e-EIR tại chỗ, chưa có cột DB tương ứng để lưu lâu dài. Đây là gap có sẵn từ module `gate_out` thật
(#17-20, đã ✅ theo audit trước) chứ không phải lỗi mới phát sinh — nếu muốn lưu đủ cần mở rộng
`DepotJob` + `GateOutRequest` (migration mới), ảnh hưởng cả 2 nơi dùng chung endpoint, nên để lại quyết
định cho người dùng ở lượt rà module `gate_out`.

Ngoài ra phát hiện `GateInController.cs` (route `api/GateIn`) là code trùng lặp/chết — gọi đúng
`IDepotJobService.CreateGateInJobAsync` nhưng **không controller/frontend nào gọi tới** (frontend luôn
gọi `POST /api/DepotJobs/gate-in`). Không xoá ở lượt này vì không gây lỗi, chỉ ghi chú để dọn dẹp sau nếu
cần.

## Bug đã sửa thêm — "Kích Thước & Loại Container" hardcode cứng, không lấy từ Master Data (2026-08-24)

Người dùng hỏi trực tiếp khi xem giao diện: 4 nút chọn nhanh "Kích Thước & Loại Container" (40HC/20DC/
40DC/45HC) trong tab Gate-In có lấy từ database chưa. Kiểm tra thấy **chưa** — mảng này hardcode cứng
ngay trong `GateInPage.tsx`, hoàn toàn độc lập với danh mục "DM Loại Container (ISO)" thật đã có sẵn ở
Master Data (`GET /api/MasterData/catalog/CONTAINER_TYPE`, bảng `MasterCatalogItem` Postgres thật — màn
`container_types` #27 trong INDEX.md đã ✅, tự CRUD được qua UI). Nếu ai đó sửa/thêm loại container ở
Master Data, Gate-In vẫn hiển thị 4 mục cũ, không đồng bộ.

Đã sửa theo đúng pattern đã dùng cho `<select>` hãng tàu ngay phía trên (fetch qua `masterDataApi`, có
fallback nếu API lỗi/rỗng để không vỡ UI khi backend down):
- Thêm `useEffect` gọi `masterDataApi.getCatalog('CONTAINER_TYPE')`, map field thật
  (`item.name` → mã hiển thị lớn — DB seed dùng đúng giá trị khớp `validSizes` backend Gate-In như
  `20GP`/`40HC`; `item.nameVi` → mô tả; `jsonData.isoCode` hoặc `item.code` → badge ISO 6346 hiển thị).
- Giữ `DEFAULT_CONTAINER_TYPES` (4 mục cũ) làm fallback khi API lỗi hoặc catalog rỗng — không vỡ form.
- Không cần đổi backend (endpoint đã đúng, đã ✅ từ audit `container_types` #27).

Build backend + `tsc --noEmit` frontend đều 0 lỗi sau khi sửa.

## Trạng thái: ✅ Xong (tab Gate-In chính + sub-tab Gate-Out trong cùng trang đều đã nối backend thật)

- [x] `GET /api/MasterData/shipping-lines` — khớp field, hoạt động đúng
- [x] `POST /api/DepotJobs/gate-in` — khớp request/response/thông báo lỗi; đã bổ sung 8 field driver/truck,
      build + migration + test lại thật đều thành công.
- [x] Đã sửa lỗi Id-type sai kiểu ở 5 entity (`DepotJob`, `JobAuditLog`, `Estimate`, `EstimateItem`,
      `RepairOrder`) — xem chi tiết ở [00-quy-tac-backend.md] hoặc memory dự án.
- [x] Sub-tab `gate_out` trong `GateInPage` — đã nối `POST /api/DepotJobs/{id}/gate-out` thật, không còn
      mock `Math.random()`. Chi tiết ở mục trên.
- [ ] Sub-tab `live_queue`, `eir_list`, `tariffs` vẫn thuần state cục bộ / dữ liệu mẫu tĩnh, không có
      backend tương ứng — không phát hiện endpoint nào bị thiếu vì các tab này chưa từng gọi API, không
      phải lỗi tích hợp.
