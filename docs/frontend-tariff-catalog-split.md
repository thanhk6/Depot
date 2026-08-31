# Tách "Cước Nâng Hạ & Lưu Bãi" thành 3 danh mục riêng (2026-08-25)

## Yêu cầu (đợt 1 — tách màn/component)

Người dùng: "tôi muốn cước nâng hạ ra danh mục riêng". Xác nhận qua câu hỏi làm rõ: muốn tách màn
**"Cước Nâng Hạ & Lưu Bãi"** (trước đây 1 component gộp chung `LiftOnLiftOffAndStorageMaster.tsx` với 3
sub-tab nội bộ LOLO/STORAGE/CALCULATOR) thành các mục menu/màn quản lý **riêng biệt**, giống cách các
danh mục khác trong Master Data mỗi loại có 1 màn riêng (Loại Container, Mã Hư Hỏng...).

### Đã làm

Tách thành **3 component/danh mục độc lập hoàn toàn** (mỗi cái tự fetch dữ liệu riêng, không còn phụ
thuộc lẫn nhau qua 1 state cha):

1. **`LoloTariffMaster.tsx`** (mới) — chỉ quản lý Cước Nâng Hạ LOLO: bảng giá, tạo/sửa/xoá, điều chỉnh %
   hàng loạt, xuất JSON.
2. **`StorageTariffMaster.tsx`** (mới) — chỉ quản lý `STORAGE_TARIFF` (Cước Lưu Bãi, vẫn trong catalog
   dùng chung — xem phần "Chưa làm" cuối file): danh sách quy tắc lũy tiến theo hãng tàu, điều chỉnh %
   hàng loạt, xuất JSON. Giữ nguyên hiện trạng nút "+ Thêm Quy Tắc" và "Sửa Biểu Phí" chỉ là `alert(...)`
   (chưa có form thật) — **không** tự ý thêm chức năng mới ngoài phạm vi yêu cầu tách danh mục.
3. **`TariffCalculatorPage.tsx`** (mới) — công cụ tính tổng chi phí Nâng Hạ + Lưu Bãi + VAT, tự fetch cả
   2 nguồn dữ liệu vì công thức cần cả 2 loại cước.

Đã xoá hẳn `LiftOnLiftOffAndStorageMaster.tsx` (component gộp chung cũ) sau khi xác nhận `grep` toàn repo
không còn nơi nào import — kể cả 1 chỗ dùng lại ở module Operation (`OperationPage.tsx`, tab "Biểu Phí
Tariff Niêm Yết & Máy Tính Cước") mà lúc đầu dễ bỏ sót vì không cùng thư mục Master Data.

**Nơi đã cập nhật để trỏ vào 3 màn mới:** `Sidebar.tsx` (1 mục → 3 mục, có badge đếm số thật),
`App.tsx` (1 case → 3 case + bảng tiêu đề), `MasterDataPage.tsx` (1 thẻ điều hướng đếm cứng `count: 24`
→ 3 thẻ đếm thật), `OperationPage.tsx` (xếp chồng cả 3 component mới để giữ nguyên nội dung).

## Yêu cầu (đợt 2 — tạo bảng database riêng)

Ngay sau đó, người dùng: "tôi muốn tạo bảng database riêng vì nghiệp vụ khác nhau nhiều". Làm rõ: muốn
**từng loại catalog có nghiệp vụ riêng** dần dần có bảng SQL thật của chính nó (cột kiểu số/enum thật),
thay vì tất cả đều nhét chung vào 1 bảng `MasterCatalogItem` với cột `JsonData` tự do — phạm vi rộng,
làm dần từng đợt (không chỉ 2 loại LOLO/Storage).

### Đã làm đợt đầu tiên: bảng `ServiceTariffs` (Cước Nâng Hạ)

Chọn `SERVICE_TARIFF` làm catalog đầu tiên chuyển sang bảng riêng (đúng loại vừa tách màn ở đợt 1, có đủ
field số phẳng, không có cấu trúc lồng nhau như Storage nên đơn giản nhất để làm mẫu cho các đợt sau).

**Backend** (theo đúng `docs/backend-progress/00b-quy-tac-tao-bang.md` — bảng mới dùng khóa `long`):
- Entity `ServiceTariff` (`Depot.Data/Entities/Master/ServiceTariff.cs`, kế thừa `FullAuditedEntity<long>`)
  — cột thật: `Code` (unique), `ServiceCategory`, `NameVi/NameEn`, `Unit`, 6 cột giá
  (`Price20GP/Price40HC/Price45HC/Price20RF/Price40RH/PriceSpecial`, `decimal(18,2)`), `VatPercent`
  (`decimal(5,2)`), `Currency`, `ApplicableShift`, `Description`, `IsActive`, `SortOrder`.
- `ServiceTariffConfiguration.cs` — index unique trên `Code`, index thường trên `ServiceCategory`,
  precision cho các cột tiền/phần trăm.
- `ServiceTariffRequest` (`Depot.ViewModels/MasterViewModels.cs`) — DTO request tạo/sửa.
- `IMasterDataService`/`MasterDataService` — 4 method mới (`GetServiceTariffsAsync`,
  `CreateServiceTariffAsync`, `UpdateServiceTariffAsync`, `DeactivateServiceTariffAsync`), theo đúng
  khuôn CRUD catalog cũ (validate Code+NameVi bắt buộc, check trùng Code, soft-delete qua `IsActive`).
- `MasterDataController` — 4 endpoint mới `GET/POST/PUT/DELETE /api/MasterData/service-tariffs[/{id}]`.
- Migration `AddServiceTariffTable` (`dotnet ef migrations add`, không sửa tay).
- **Backfill 1 lần** (`DbSeeder.SeedServiceTariffsFromLegacyCatalogAsync`, chạy trong `SeedAsync`, ngay
  sau `SaveChangesAsync` để đảm bảo đọc được cả những dòng catalog vừa Add ở `SeedCatalogsAsync` trong
  lần chạy đầu trên DB rỗng): đọc toàn bộ dòng `CatalogType = "SERVICE_TARIFF"` đang active trong
  `MasterCatalogItems`, parse `JsonData`, insert sang `ServiceTariffs` nếu `Code` chưa có — idempotent,
  **không đụng/xoá dữ liệu cũ** ở `MasterCatalogItems` (giữ nguyên phòng khi có chỗ khác còn đọc).

**Frontend:**
- `api/endpoints.ts` + `api/master-data.api.ts` — thêm `SERVICE_TARIFFS` endpoint và 4 hàm
  `getServiceTariffs/createServiceTariff/updateServiceTariff/deactivateServiceTariff`.
- `LoloTariffMaster.tsx` + `TariffCalculatorPage.tsx` — đổi từ `masterDataApi.getCatalog('SERVICE_TARIFF')`
  + `JSON.parse(item.jsonData)` sang gọi thẳng `getServiceTariffs()` và map 1-1 (không cần parse JSON
  nữa vì cột đã có kiểu thật). `persistLolo`/`handleDelete` đổi sang gọi
  `createServiceTariff/updateServiceTariff/deactivateServiceTariff`.
- `Sidebar.tsx` + `MasterDataPage.tsx` — 2 chỗ đếm badge số lượng "Cước Nâng Hạ" đổi từ
  `getCatalog('SERVICE_TARIFF')` sang `getServiceTariffs()` để không bị lệch số sau khi 2 bảng tách rời
  (sửa/xoá qua bảng mới không còn phản ánh vào bảng catalog cũ nữa).

### Đã verify thật (2026-08-24/25)

- `dotnet build`: 0 lỗi. `tsc --noEmit`: 0 lỗi.
- Chạy `dotnet run` thật với Postgres thật: migration áp dụng thành công, backfill chuyển đúng 8 dòng
  active từ `MasterCatalogItems` (CatalogType=SERVICE_TARIFF) sang `ServiceTariffs` (khớp đúng dữ liệu đã
  seed trước đó, dòng `YARD_SHIFT` đã vô hiệu hoá trước không bị backfill — đúng logic `WHERE IsActive`).
- Gọi thẳng `GET /api/MasterData/service-tariffs` xác nhận đủ 8 dòng, dữ liệu giá đúng kiểu số thật
  (không còn chuỗi JSON).
- Mô phỏng đúng luồng tạo→sửa→xoá qua endpoint mới: tạo (id=9) → sửa cùng id (đếm tổng vẫn 9, không
  tăng thành 10) → xoá → đếm giảm còn 8. Xác nhận không có bug id-format tái diễn trên bảng mới.
- **Lưu ý runtime khi làm migration:** `dotnet run --no-build` dùng nhầm `Depot.Data.dll` cũ (build từ
  trước khi tạo migration) → migration coi như "chưa từng biết tới", seed backfill crash
  "relation ServiceTariffs does not exist". Phải chạy `dotnet build` lại (không `--no-build`) một lần sau
  khi thêm migration mới thì lần `dotnet run --no-build` tiếp theo mới nhận đúng — bài học lặp lại từ
  vụ Id-type ở `03-gate-in.md` (build phạm vi hẹp/dùng binary cũ có thể che giấu lỗi/thiếu thay đổi).

### Đã làm đợt hai: bảng `StorageTariffRule` + `StorageTariffTier` (Cước Lưu Bãi)

Cùng ngày 2026-08-25, người dùng xác nhận làm tiếp ngay (không đợi lượt sau). Áp dụng đúng khuôn đã làm
cho `ServiceTariff`, khác biệt chính: có **bảng con 1-nhiều** cho cấu trúc bậc giá lũy tiến.

**Backend:**
- Entity `StorageTariffRule` (cha, `FullAuditedEntity<long>`) — `Code` (unique), `ShippingLineCode`
  (string tự do "ALL" hoặc mã hãng tàu, không ràng buộc FK vì "ALL" không phải mã thật),
  `ShippingLineName`, `ContainerTypeCategory`, `DefaultFreeDays`, `CalculationUnit`, `VatPercent`,
  `Notes`, `IsActive`, `SortOrder`, navigation `Tiers`.
- Entity `StorageTariffTier` (con thuần tuý, không có `Code`/DbSet riêng — giống `DamageItem`/
  `EstimateItem`) — `StorageTariffRuleId` (FK theo **`Id` số**, không theo `Code`, vì đây là quan hệ
  composition nội bộ 1 aggregate chứ không phải tham chiếu chéo 2 business entity nên không thuộc phạm
  vi bắt buộc của quy tắc FK-by-Code ở mục 8b), `TierName`, `FromDay`, `ToDay` (nullable = "trở đi"), 6
  cột giá theo loại container, `SortOrder`.
- `StorageTariffRuleConfiguration` — `HasMany(x => x.Tiers).WithOne().HasForeignKey(...).OnDelete(Cascade)`
  (xoá quy tắc thì xoá luôn các bậc giá con).
- `StorageTariffRuleRequest` + `StorageTariffTierViewModel` (DTO request, có `List<Tiers>`).
- Service: `GetStorageTariffsAsync` (Include Tiers, order theo SortOrder), `CreateStorageTariffAsync`,
  `UpdateStorageTariffAsync` (thay toàn bộ tiers bằng `ExecuteDeleteAsync` rồi insert lại mới — **không**
  `Include(x => x.Tiers)` khi load để sửa, tránh entity con "ma" còn sót trong ChangeTracker sau khi
  ExecuteDelete xoá thẳng dưới DB — cùng nguyên tắc đã áp dụng cho `DamageItem` ở `SubmitSurveyAsync`),
  `DeactivateStorageTariffAsync`.
- Controller: `GET/POST/PUT/DELETE /api/MasterData/storage-tariffs[/{id}]`.
- Migration `AddStorageTariffTables`.
- Backfill `DbSeeder.SeedStorageTariffsFromLegacyCatalogAsync`: đọc `MasterCatalogItems`
  (CatalogType=STORAGE_TARIFF), parse `JsonData.tiers[]` (mảng lồng) thành các dòng `StorageTariffTier`
  con; với 5/6 quy tắc cũ không có mảng `tiers` (chỉ có giá phẳng — 2 quy tắc mới thêm hôm trước
  `STOR_MAERSK_SPECIAL`/`STOR_OOG_DG` có `tiers` đầy đủ, còn `STOR_DRY_STANDARD`/`STOR_REEFER`/
  `STOR_45HC`/`STOR_SPECIAL_EQUIP` chỉ có giá phẳng), tự tạo đúng 1 bậc duy nhất từ field phẳng —
  khớp fallback mà component cũ đã dùng, không mất dữ liệu.

**Frontend:** thêm `getStorageTariffs/createStorageTariff/updateStorageTariff/deactivateStorageTariff`
(`master-data.api.ts`), rewire `StorageTariffMaster.tsx` + `TariffCalculatorPage.tsx` (bỏ hẳn
`JSON.parse(item.jsonData)`, map thẳng field thật kể cả mảng `tiers` lồng), cập nhật 2 chỗ đếm badge
(`Sidebar.tsx`, `MasterDataPage.tsx`).

**Đã verify thật:** migration áp dụng + backfill đúng 6/6 quy tắc (kiểm tra riêng `STOR_DRY_STANDARD` có
đủ 3 tier, `STOR_MAERSK_SPECIAL` giữ đúng tên/giá từng bậc). Mô phỏng tạo quy tắc mới kèm 2 tier → sửa
giảm còn 1 tier khác hẳn nội dung (kiểm tra trực tiếp bằng `psql`: đếm đúng 1 dòng trong
`StorageTariffTier`, không phải 3 — xác nhận `ExecuteDelete` thay thế đúng, không trùng lặp/rác) → xoá.
`tsc --noEmit`: 0 lỗi.

### Kế hoạch tiếp theo (làm dần từng đợt)

| # | Catalog | Độ phức tạp | Trạng thái |
|---|---|---|---|
| 1 | `SERVICE_TARIFF` → `ServiceTariffs` | Phẳng, nhiều cột giá | ✅ Xong 2026-08-25 |
| 2 | `STORAGE_TARIFF` → `StorageTariffRules` + `StorageTariffTiers` | Có cấu trúc lồng (bảng con) | ✅ Xong 2026-08-25 |
| 3 | `CLEANING_TARIFF` → `CleaningTariffs` | Nhiều cột giá theo size + field vận hành (thời gian, hoá chất...) | 🔜 |
| 4 | `CONTAINER_TYPE` → `ContainerTypeCatalog` | Rất nhiều field kỹ thuật (kích thước, trọng lượng...) | 🔜 |
| 5 | `DEPARTMENT` → `DepartmentCatalog` | Nhiều field liên hệ + mảng `tags` | 🔜 |
| — | `REPAIR_CODE`, `INSPECTION_STANDARD` | Trung bình, có thể làm sau nếu cần | 🔜 (chưa ưu tiên) |
| — | `DAMAGE_LOCATION`, `DAMAGE_CODE`, `GRADE`, `CUSTOMER_CLASSIFICATION` | Đơn giản (chỉ vài field enum) | Cân nhắc giữ nguyên catalog dùng chung — chi phí tách bảng riêng không đáng so với lợi ích cho các danh mục đơn giản này. |

**Cách tiếp tục ở lượt sau:** lặp lại đúng quy trình đã làm cho `ServiceTariff`/`StorageTariffRule` — đọc
`00b-quy-tac-tao-bang.md`, tạo entity + configuration + ViewModel + service + controller + migration,
viết `DbSeeder` backfill 1 lần từ `MasterCatalogItems`, rồi mới rewire frontend sang endpoint mới, verify
thật bằng `dotnet run` + curl (hoặc `psql` trực tiếp khi cần đếm chính xác bảng con) trước khi coi là
xong. Nhớ: sau `dotnet ef migrations add`, luôn `dotnet build` lại (không `--no-build`) 1 lần trước khi
chạy, tránh lặp lại bug "relation does not exist" đã gặp ở đợt 1.
