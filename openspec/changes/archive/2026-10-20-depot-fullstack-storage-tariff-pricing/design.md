# Design

## Context

- `StorageTariffRules` (Code, ShippingLineCode/Name, ContainerTypeCategory, DefaultFreeDays, CalculationUnit, VatPercent, IsActive, SortOrder) + `StorageTariffTier` (TierName, FromDay, ToDay, 6 cột giá `Price20Dry … PriceSpecial`, SortOrder). Bậc là dòng con, xoá thẳng bằng `ExecuteDelete` trong transaction khi sửa.
- Mẫu đã làm: `ServiceTariffPrices` + `ServiceTariffPricing` (Cước Nâng Hạ), `CleaningTariffPrices` + `CleaningTariffPricing` (Vệ Sinh); hàm dùng chung `NormalizeServiceTariffPricesAsync` (loại thuộc DM, không trùng, giá ≥ 0), `ServiceTariffPricing.ResolveContainerTypeAsync` (mã loại của hồ sơ có trong DM). Frontend: `tariffPricing.ts`, `useContainerTypeOptions`, `useShippingLineOptions`.
- `DepotJob`: `IsoSize` (mã loại DM), `ShippingLineId` → `ShippingLines.Code`, `GateInDate` / `GateOutDate` (UTC). Hàm `VietnamDate(...)` đã có trong `DepotJobService`.
- Dữ liệu local: 6 quy tắc đang dùng (5 `ALL` + `STOR_MAERSK_SPECIAL` hãng `MSK`), 8 tạm ngưng (đa số test). DM Hãng Tàu chỉ có `MSCU`. Chưa có phiếu nào có dòng `STORAGE`. Catalog cũ `STORAGE_TARIFF` còn 6 dòng đang dùng; `DbSeeder.SeedStorageTariffsFromLegacyCatalogAsync` chép lại mã nào bảng mới thiếu.

## Goals / Non-Goals

**Goals:**
- Giá mỗi bậc theo từng loại container của DM; một hàm tính phí lưu bãi ở server, dùng cho API xem trước và Gate-Out.
- Quy tắc hợp lệ: một quy tắc đang dùng mỗi hãng, bậc liền nhau sau ngày miễn phí.
- Màn quản lý đúng dữ liệu thật, dọn dữ liệu test.

**Non-Goals:**
- Lập phiếu thu phí lưu bãi, chọn bên trả, chặn Gate-Out khi chưa thu (change sau).
- Tính lại phí cho container đã Gate-Out trước đây.

## Decisions

1. **Bảng `StorageTariffTierPrices`** (`StorageTariffTierId`, `ContainerTypeCode`, `Price`, audit), unique (tier, loại), xoá theo bậc (cascade). API trả mỗi bậc `prices: [{containerTypeCode, price}]` như Cước Nâng Hạ; dùng lại `NormalizeServiceTariffPricesAsync`.
2. **Bỏ cột** 6 giá của `StorageTariffTier` và `ContainerTypeCategory` của quy tắc (quyết định không tách nhóm). `CalculationUnit` giữ cột nhưng server luôn ghi `VND/Cont/Ngày`.
3. **Kiểm tra bậc:** sắp theo `FromDay`; bậc 1 `FromDay = DefaultFreeDays + 1`; bậc i `FromDay = ToDay(i-1) + 1`; chỉ bậc cuối `ToDay = null` và bậc cuối MUST null. Miễn phí 0 ngày → bậc đầu từ ngày 1.
4. **Hãng tàu:** `ALL` hoặc `ShippingLines.Code` chưa xoá; `ShippingLineName` lấy từ DM (`ALL` → "Mọi hãng tàu"). Một quy tắc `IsActive` mỗi `ShippingLineCode` — kiểm ở service (không dùng unique index vì quy tắc tạm ngưng được trùng).
5. **Xoá / tạm ngưng:** `DELETE` = `IsDeleted`; `GET ?includeInactive=true` trả cả tạm ngưng (màn quản lý), mặc định chỉ đang dùng (cổng, phiếu).
6. **Tính phí — `StorageTariffPricing.CalculateAsync(db, job, toUtc)`** trả `StorageFeeResult { gateInDate, toDate, totalDays, freeDays, ruleCode, ruleName, containerTypeCode, lines[{tierName, fromDay, toDay, days, unitPrice, amount}], subtotal, vatPercent, vatAmount, total, ok, message }`:
   - quy tắc: đang dùng, `ShippingLineCode` = mã hãng của hồ sơ, không có thì `ALL`; không có cả hai → `ok=false`;
   - `totalDays = (VietnamDate(to) − VietnamDate(GateInDate)).Days + 1`;
   - ngày tính tiền = các ngày > miễn phí, chia vào bậc chứa ngày đó; bậc có ngày tính tiền mà giá loại container = 0 → `ok=false`, message nêu quy tắc / bậc / loại;
   - tiền làm tròn 2 số lẻ như phiếu dịch vụ.
   - Lỗi nghiệp vụ trả trong kết quả (không ném) để Gate-Out vẫn chạy và hộp vẫn hiện lý do.
7. **API `GET /DepotJobs/{id}/storage-fee`**: `to` = `GateOutDate` nếu đã ra, ngược lại hiện tại. Quyền: như xem hồ sơ Gate-Out (`RolePermissions` của màn Cổng Xuất); cập nhật `menuPermissions.ts` nếu cần.
8. **Gate-Out:** `GateOutAsync` gọi `CalculateAsync(job, nowUtc)` trước khi ghi; nối vào `details` nhật ký: "Lưu bãi N ngày (miễn phí F) — X đ gồm VAT" hoặc "Lưu bãi N ngày — chưa tính được: …". Không chặn.
9. **Phiếu dịch vụ:** server từ chối hạng mục `Category == "STORAGE"` hoặc mã bắt đầu bằng mã một quy tắc lưu bãi + `_T` (mẫu cũ); form bỏ khối `storage`.
10. **Migration `StorageTariffPricesPerContainerType`** (thứ tự: tạo bảng → SQL chép / sửa → drop cột):
    - chép giá > 0 cho mỗi loại DM (`CONTAINER_TYPE` chưa xoá, đọc `JsonData` `size`, `category`, `isReefer`): reefer → size 20 ? `Price20Reefer` : `Price40Reefer`; category `OPEN_TOP` / `FLAT_RACK` / `TANK` / `SPECIAL` → `PriceSpecial`; còn lại theo size 45 → `Price45Dry`, 40 → `Price40Dry`, 20 → `Price20Dry`;
    - bậc nằm trọn trong ngày miễn phí (`ToDay ≤ DefaultFreeDays`) → xoá; bậc vắt qua → `FromDay = DefaultFreeDays + 1`;
    - xoá mềm `QA_STO_%`, `TEST_STORAGE_NEW`, `STOR_TEST_UI` (`DeletedBy='migration'`); tạm ngưng `STOR_REEFER`, `STOR_45HC`, `STOR_OOG_DG`, `STOR_SPECIAL_EQUIP`, `STOR_MAERSK_SPECIAL`; xoá mềm catalog `STORAGE_TARIFF`;
    - `now()` cho thời gian; Down thêm lại cột, chép ngược giá theo cùng quy tắc (lấy giá của loại đầu tiên khớp), bỏ xoá mềm.
    - Kết quả mong đợi local: `STOR_DRY_STANDARD` miễn phí 5 ngày, một bậc từ ngày 6: 35.000 cho loại 20' khô / thông gió (20HC, 20VH…), 60.000 cho 40GP / 40HC; 45HC / reefer / đặc biệt chưa có giá.
    - Bỏ `SeedStorageTariffsFromLegacyCatalogAsync` khỏi seeder.

## Risks / Trade-offs

- **Đổi nghĩa bậc cũ:** `STOR_DRY_STANDARD` trước tính từ ngày 1, sau migration tính từ ngày 6 — đúng quyết định "ngày miễn phí khai một nơi", ghi vào tài liệu. Biểu giá chưa dùng thu tiền nên không ảnh hưởng phiếu.
- **VPS khác dữ liệu local:** migration theo mã cố định; mã không có thì bỏ qua. Trước deploy cần sao lưu và xem lại các quy tắc `ALL` đang dùng trên VPS (nếu còn > 1 quy tắc `ALL` đang dùng, lần sửa sau sẽ bị chặn cho đến khi tạm ngưng bớt).
- **Container chưa có hãng trong DM / loại lạ:** kết quả `ok=false` kèm lý do, không ước giá.
