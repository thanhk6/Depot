# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 Entity + cấu hình `StorageTariffTierPrice`; bỏ 6 cột giá khỏi `StorageTariffTier` và `ContainerTypeCategory` khỏi `StorageTariffRule`; migration `StorageTariffPricesPerContainerType` theo design.md (chép giá theo loại, sửa bậc trong ngày miễn phí, xoá mềm dữ liệu test + catalog `STORAGE_TARIFF`, tạm ngưng 5 quy tắc); bỏ `SeedStorageTariffsFromLegacyCatalogAsync`.
  - Kiểm tra: build không lỗi; sau migration local `STOR_DRY_STANDARD` có 1 bậc từ ngày 6, 20HC 35.000, 40GP / 40HC 60.000; chỉ còn `STOR_DRY_STANDARD` đang dùng; test rules `IsDeleted` (so DB).
- [x] 1.2 API `/MasterData/storage-tariffs`: request giá theo loại mỗi bậc; kiểm tra hãng tàu (ALL / DM), một quy tắc đang dùng mỗi hãng, bậc liền nhau sau ngày miễn phí, giá theo loại (`NormalizeServiceTariffPricesAsync`), VAT 0–100, không đổi mã, đơn vị VND; `GET ?includeInactive`; `DELETE` = xoá mềm. Kiểm tra: build không lỗi.
- [x] 1.3 `StorageTariffPricing.CalculateAsync` + `GET /DepotJobs/{id}/storage-fee` (có `[RequirePermission]`); `GateOutAsync` ghi số ngày + phí vào nhật ký `GATE_OUT`. Kiểm tra: build không lỗi.
- [x] 1.4 `CreateServiceOrderAsync` / `UpdateServiceOrderAsync` từ chối hạng mục `STORAGE`. Kiểm tra: build không lỗi.
- [x] 1.5 Test API (`tests/api/storage-tariff.spec.ts`, mã `QA_T_…`, container `QATS…`):
  - dữ liệu sai (hãng lạ, 2 quy tắc đang dùng cùng hãng, bậc trong ngày miễn phí / hở / chồng, loại lạ, giá âm, đổi mã) → 400; VAT 0 giữ 0;
  - tính phí: đủ ngày miễn phí → 0; quá hạn → đúng số ngày × giá theo bậc; ưu tiên quy tắc của hãng; thiếu giá → `ok=false` có lý do;
  - Gate-Out ghi nhật ký phí lưu bãi; phiếu dịch vụ có hạng mục `STORAGE` → 400.
  - Kiểm tra: `npm run test:api` đạt.

## 2. Frontend (`fontend/`)

- [x] 2.1 `masterDataApi` storage theo request mới (`includeInactive`); `StorageTariffMaster`: ô giá mỗi bậc theo DM Loại Container, hãng tàu từ `useShippingLineOptions`, bỏ nhóm container / USD, hiện quy tắc tạm ngưng, lưu đúng 1 quy tắc, điều chỉnh % chỉ quy tắc đang dùng + đang lọc có xác nhận, VAT 0 giữ 0. Kiểm tra: `npx tsc --noEmit -p .` không lỗi.
- [x] 2.2 `GateTariffReference` hiện giá lưu bãi theo loại; form phiếu dịch vụ bỏ các dòng "Lưu bãi …". Kiểm tra: type-check không lỗi.
- [x] 2.3 `GateOutDispatchModal` gọi `/DepotJobs/{id}/storage-fee`, hiện ngày vào, số ngày, miễn phí, quy tắc, từng bậc, VAT, tổng hoặc lý do không tính được. Kiểm tra: type-check không lỗi.
- [x] 2.4 Test giao diện (`tests/e2e/storage-tariff.spec.ts`): ô giá mỗi bậc = số loại DM; quy tắc tạm ngưng vẫn hiện; hộp cấp vỏ hiện phí lưu bãi của container test. Kiểm tra: `npm test` đạt.

## 3. Kiểm thử & dữ liệu (http://127.0.0.1:3000, admin)

- [x] 3.1 `cd tests && npm test` toàn bộ đạt; dọn dữ liệu test (`support/db.ts` thêm `StorageTariffRules` mã `QA_T_`); container / phiếu thật không đổi (so DB trước / sau).
- [x] 3.2 Tài liệu `docs/quy-trinh-van-hanh-depot.md` (mục 5 Phiếu dịch vụ, 11 Gate-Out) + `docs/menu/08-danh-muc-master-data.md`: giá lưu bãi theo loại container, ngày miễn phí + bậc, cách tính số ngày, phí hiện khi Gate-Out (chưa thu).

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-storage-tariff-pricing` (tạo spec `storage-tariff`, bổ sung `gate-out`, `service-order`).
- Change sau (khi bắt đầu thu): lập phiếu thu phí lưu bãi, bên trả, chặn Gate-Out khi chưa thu.
- Trước deploy VPS: sao lưu DB; xem các quy tắc `ALL` đang dùng trên VPS.
