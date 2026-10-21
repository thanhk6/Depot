# Design

## Context

- **Biểu phí vệ sinh hiện lưu ở `MasterCatalogItems`** (`CatalogType = CLEANING_TARIFF`). Mọi thông tin nằm trong `JsonData`: `price20DC / price40DC / price40HC / price45HC / price20RF / price40HR`, `priceByContainerType?`, `vatPercent`, `currency`, `category`, `cedexCode`, `responsiblePartyDefault`, `estimatedDurationMin`, `waterUsageLiters`, `chemicalRequired`, `equipmentUsed`. Local có 5 dòng: `CLN_GENERAL`, `CLN_CHEMICAL`, `CLN_FOOD_GRADE` (đang dùng), `CLN_ODOR_REMOVAL`, `CLN_FUMIGATION` (tạm ngưng).
- **Lưu qua `persistCatalog`** (ghi lại cả danh sách), API catalog chung không kiểm tra `JsonData`.
- **Giá vệ sinh do trình duyệt gửi:**
  - `DepotJobService.SubmitSurveyAsync` lưu `SurveyCleaningItem.UnitPrice / TotalPrice` rồi tạo `CleaningRecord / CleaningWorkItem` từ đó;
  - `CleaningService.CreateAsync` (vệ sinh thủ công) lấy `UnitPrice` của request;
  - phiếu dịch vụ: form gộp `cleaningDetails.totalCost` thành 1 dòng mang mã biểu phí đầu tiên có giá.
- **Cùng khuôn đã làm cho Cước Nâng Hạ** (`ServiceTariffs` + `ServiceTariffPrices`, `ServiceTariffPricing`, `tariffPricing.ts`, `LoloTariffMaster`), tái dùng được.

## Goals / Non-Goals

**Goals:** server là nguồn giá vệ sinh duy nhất theo loại container; phiếu dịch vụ ghi từng dịch vụ; màn quản lý giống Cước Nâng Hạ.

**Non-Goals:** bên chịu phí (giữ nguyên — mọi dòng vào phiếu khách); lưu bãi; tính lại phiếu giám định / lệnh vệ sinh đã lưu; 2 phiếu đã thu.

## Decisions

- **Bảng:**
  - `CleaningTariffs` (`FullAuditedEntity<long>`): `Code` (unique ≤ 40), `NameVi`, `NameEn`, `Category`, `CedexCode`, `Description`, `VatPercent` (5,2), `Currency` = VND, `ResponsiblePartyDefault`, `EstimatedDurationMin`, `WaterUsageLiters`, `ChemicalRequired`, `EquipmentUsed`, `IsActive`, `SortOrder`.
  - `CleaningTariffPrices` (`CleaningTariffId` FK cascade, `ContainerTypeCode` ≤ 20, `Price` 18,2; unique (biểu phí, loại)). Giống `ServiceTariffPrices`.
  - *Phương án khác:* giữ catalog JSON và thêm `priceByContainerType`. Bỏ vì không kiểm tra / tra giá được ở server một cách chắc chắn, và người dùng chọn làm giống Cước Nâng Hạ.
- **Migration `CleaningTariffTables`:** tạo 2 bảng → chép mỗi dòng catalog `CLEANING_TARIFF` chưa xoá sang `CleaningTariffs` (giữ mã, tên, trạng thái, thứ tự, các trường JSON) → chép giá cho mỗi loại `CONTAINER_TYPE` chưa xoá, chỉ khi > 0:
  1. `priceByContainerType[mã]` nếu có;
  2. nhóm lạnh: cỡ 20 → `price20RF`, cỡ 40 / 45 → `price40HR`;
  3. loại `40HC` → `price40HC`; cỡ 45 → `price45HC`; cỡ 40 → `price40DC`; cỡ 20 → `price20DC`.

  Cách 3 giống hàm `cleaningPriceForType` đang dùng ở tiếp nhận vệ sinh; nhóm đặc biệt (OT / FR / TK…) theo cỡ vì biểu phí vệ sinh không có cột giá đặc biệt. Sau khi chép thì xoá mềm dòng catalog cũ (`IsDeleted = true`), và bỏ `CLEANING_TARIFF` khỏi seeder catalog.
  - `ResponsiblePartyDefault`: giữ nguyên giá trị đang có (O / U / T / C) vì quyết định giữ cách tính bên chịu phí; danh sách hợp lệ = {O, U, T, C}.
- **API `MasterDataService`:** `Get / Create / Update / DeactivateCleaningTariff` theo đúng khuôn Service Tariff:
  - transaction + `ExecuteDelete` giá cũ;
  - kiểm tra giá bằng hàm dùng chung với Service Tariff (tách `NormalizeTariffPricesAsync`);
  - nhóm ∈ {GENERAL_SWEEP, WATER_WASH, HOT_WASH, CHEMICAL_WASH, FOOD_GRADE, ODOR_REMOVAL, FUMIGATION, …} lấy theo các giá trị `CleaningCategoryType` đang có ở frontend;
  - không đổi mã.
- **Tra giá server `CleaningTariffPricing`** (khuôn `ServiceTariffPricing`): `ApplyAsync(db, isoSize, items)` cho survey cleaning items, cleaning record request items và service order items (`Category = CLEANING` hoặc mã thuộc `CleaningTariffs`). Mã không thuộc danh mục:
  - ở phiếu giám định / lệnh vệ sinh → 400;
  - ở phiếu dịch vụ → chỉ xử lý mã thuộc danh mục, dòng khác giữ như cũ.
- **Phiếu dịch vụ:** form dựng dòng vệ sinh từ `cleaningDetails.items` (hạng mục của lệnh vệ sinh đã bàn giao): mỗi hạng mục một dòng `{ serviceCode, quantity }`, giá tra bằng `priceForContainer`, khoá giá / VAT; server tra lại khi lưu. Bỏ dòng gộp `totalCost`.
- **Frontend:**
  - `cleaningTariffCatalog.ts` đọc API mới, trả `prices`;
  - mọi nơi tra giá dùng `priceForContainer` của `tariffPricing.ts`: form giám định, Thêm mới giám định, `NewCleaningIntakeModal`, form phiếu dịch vụ, `GateTariffReference`;
  - `CleaningMaster` dựng lại theo khuôn `LoloTariffMaster` (cột / ô theo DM, lưu từng dòng, điều chỉnh % có xác nhận), bỏ mục hãng tàu và `shippingLinePricing`;
  - `MasterDataPage` / `SurveyModulePage` bỏ `persistCatalog` cho biểu phí vệ sinh; Sidebar đếm badge từ API mới.
- **Phiếu `SO-20261018-761`:**
  - sau migration, gọi API sửa phiếu với dòng nâng hạ + 3 dòng vệ sinh lấy từ lệnh vệ sinh đã bàn giao `CL-20261018065734-785`; server tra giá, ghi nhật ký `SERVICE_ORDER_UPDATED`;
  - **`CLN_GENERAL` hiện chưa có giá 45HC** (giá cũ = 0), nên server sẽ chặn → task này **chờ người dùng nhập giá** `CLN_GENERAL` cho 45HC trên màn Biểu Phí Vệ Sinh.

## Risks / Trade-offs

- **Phiếu giám định đang dở (nháp)** có dịch vụ chưa có giá cho loại container sẽ không lưu được → thông báo nêu mã + loại; nhập giá rồi lưu lại.
- **Giá vệ sinh trên phiếu dịch vụ** lấy giá biểu phí lúc lập phiếu, có thể khác giá đã ghi lúc giám định nếu biểu phí đổi giữa chừng → chấp nhận (cùng cách làm của Cước Nâng Hạ); ghi trong tài liệu.
- **Migration xoá mềm catalog cũ** → rollback cần khôi phục DB từ bản sao lưu; quy trình deploy luôn sao lưu.
- **VPS có thể có biểu phí khác local** → trước deploy kiểm tra giá sẽ chép sang từng loại, và các nháp giám định dở có dịch vụ chưa có giá.

## Migration Plan

- Deploy: sao lưu DB → pull → migration tự chạy → người dùng kiểm tra / bổ sung giá trên màn Biểu Phí Vệ Sinh.
- Rollback: deploy image cũ + khôi phục DB từ bản sao lưu (catalog cũ đã bị xoá mềm).
