# 23-32 — Nhóm MASTER DATA (gộp, trừ `tariff_services` có bug riêng)

9 tab (`master_data`, `departments`, `tariff_services`, `cleaning_tariffs`, `container_types`,
`damage_locations`, `damage_codes`, `repair_codes`, `grades`, `standards`) đều render **cùng 1
component** `MasterDataPage.tsx` (`App.tsx` chỉ đổi `initialTab`) — gộp audit vào 1 file theo đúng ghi
chú ở `INDEX.md`. Component này cũng phục vụ `customer_classifications` (#34) và `shipping_lines` (#35),
nhưng 2 mục đó audit riêng ở file tương ứng nhóm KHÁCH HÀNG.

## Frontend gọi gì

```ts
masterDataApi.getAll()                               // shipping lines cho tab shipping_lines
masterDataApi.getCatalog(catalogType)                 // đọc 8 loại catalog
masterDataApi.createCatalog/updateCatalog/deactivateCatalog  // ghi qua helper persistCatalog()
```

`catalogType` dùng: `DAMAGE_LOCATION, DAMAGE_CODE, REPAIR_CODE, GRADE, INSPECTION_STANDARD, DEPARTMENT,
CONTAINER_TYPE, CLEANING_TARIFF` — đều nằm trong danh sách hợp lệ backend hỗ trợ
(`MasterDataController`/`GetAllMasterData`).

## Đối chiếu backend

- `GET/POST/PUT/DELETE /api/MasterData/catalog...` — đã audit đúng ở màn 12 (estimate) và ở đây khớp
  tiếp cho 8 catalog type khác. `persistCatalog()` diff đúng theo `id` (Guid thật → update, id tạm →
  create; item bị xoá khỏi danh sách → deactivate) — mọi tab con (`ContainerTypeMaster`,
  `DamageLocationMaster`, `DamageCodeMaster`, `RepairCodeMaster`, `GradeMaster`,
  `InspectionStandardMaster`, `CleaningMaster`, `DepartmentMaster`) đều gọi qua đúng helper này khi
  người dùng lưu. ✅
- Field `jsonData` (JSON tự do trong `MasterCatalogItem`) được dùng nhất quán để chứa các field mở rộng
  riêng của từng loại danh mục (`category`, `severity`, `labourRate`, `lengthMm`...) — đọc/ghi đối xứng
  đúng giữa `load()` (parse `JSON.parse(item.jsonData)`) và `persistCatalog()` (`JSON.stringify(item)`).
  Không phát hiện lệch field. ✅
- Tab `shipping_lines`: phần lớn nội dung là card tĩnh mô tả cấu hình Maersk (Auto-Approve limit, EDI
  protocol...) — hard-code trong JSX, không phải dữ liệu DB; chỉ `shippingLines[0]?.code/name` là dữ
  liệu thật từ `GET /api/MasterData` (đã audit đúng). Card tĩnh không phải lỗi tích hợp — là nội dung
  demo minh hoạ, không có input để lưu nên không có gì để mất dữ liệu.

Không phát hiện lỗi tích hợp ở nhóm 8 catalog type chính — toàn bộ CRUD hoạt động đúng.

## Trạng thái: ✅ Xong (8 catalog chính) — xem 25-tariff-services.md cho phần `tariff_services`

- [x] `master_data`(container_types), `departments`, `cleaning_tariffs`, `container_types`,
      `damage_locations`, `damage_codes`, `repair_codes`, `grades`, `standards` — đều khớp, không cần sửa
- [x] Không cần build lại (không đổi code backend; không đổi các file này)
