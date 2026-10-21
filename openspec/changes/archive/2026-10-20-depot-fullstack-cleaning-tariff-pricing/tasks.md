# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 Entity + cấu hình `CleaningTariff`, `CleaningTariffPrice`; migration `CleaningTariffTables` (tạo bảng, chép từ catalog `CLEANING_TARIFF` + giá theo quy tắc ở design.md, xoá mềm catalog cũ); bỏ `CLEANING_TARIFF` khỏi seeder.
  - Kiểm tra: build không lỗi; sau migration local, CLN_CHEMICAL có giá 20HC 280.000, 40GP 420.000, 40HC 450.000, 45HC 480.001, 20RF / 20HR 350.000, 40RF / 40RH 520.000 (so DB); catalog cũ `IsDeleted`.
- [x] 1.2 API `/MasterData/cleaning-tariffs` (Get / Create / Update / Delete, quyền `masterdata`) + kiểm tra dữ liệu, không đổi mã, giá theo loại dùng chung hàm kiểm tra với Service Tariff. Kiểm tra: build không lỗi.
- [x] 1.3 `CleaningTariffPricing.ApplyAsync` + gọi trong `SubmitSurveyAsync`, `CleaningService.CreateAsync`, `CreateServiceOrderAsync` / `UpdateServiceOrderAsync`. Kiểm tra: build không lỗi.
- [x] 1.4 Test API (`tests/api/cleaning-tariff.spec.ts`, mã test `QA_T_…`, container `QATS…`):
  - dữ liệu sai / đổi mã / giá sai → 400;
  - nộp giám định giá gửi 1đ → lưu theo biểu phí; chưa có giá / mã lạ → 400;
  - vệ sinh thủ công tra giá;
  - phiếu dịch vụ dòng vệ sinh tra giá, tạm ngưng → 400.
  - Kiểm tra: `npm run test:api` đạt.

## 2. Frontend (`fontend/`)

- [x] 2.1 `cleaningTariffCatalog.ts` đọc API mới (`prices`); `masterDataApi` thêm `get / create / update / deleteCleaningTariff`; Sidebar badge. Kiểm tra: `npx tsc --noEmit -p .` không lỗi.
- [x] 2.2 `CleaningMaster`:
  - cột / ô giá theo DM Loại Container;
  - lưu từng dòng qua API mới (bỏ `persistCatalog` ở `MasterDataPage` + `SurveyModulePage`);
  - điều chỉnh % chỉ dòng đang dùng + đang lọc, có xác nhận;
  - bỏ mục đơn giá theo hãng tàu và `shippingLinePricing`.
  - Kiểm tra: type-check không lỗi.
- [x] 2.3 Tra giá bằng `priceForContainer` ở form giám định, Thêm mới giám định, `NewCleaningIntakeModal`, `GateTariffReference`; chưa có giá → báo, không thêm. Kiểm tra: type-check không lỗi.
- [x] 2.4 Form phiếu dịch vụ: mỗi hạng mục vệ sinh của lệnh đã bàn giao một dòng (bỏ dòng gộp), khoá đơn giá / VAT. Kiểm tra: type-check không lỗi.
- [x] 2.5 Test giao diện (`tests/e2e/cleaning-tariff.spec.ts`):
  - màn có đúng số cột = số loại DM, không còn mục hãng tàu;
  - điều chỉnh % bỏ qua dòng tạm ngưng;
  - form phiếu dịch vụ có 3 dòng vệ sinh bị khoá giá cho container test có 3 dịch vụ.
  - Kiểm tra: `npm test` đạt.

## 3. Kiểm thử & dữ liệu thật (http://127.0.0.1:3000, admin)

- [x] 3.1 `cd tests && npm test` toàn bộ đạt; dữ liệu test được dọn; 3 hồ sơ thật, 2 phiếu đã thu, phiếu giám định / lệnh vệ sinh thật không đổi (so DB trước / sau).
- [x] 3.2 *(Chờ người dùng nhập giá CLN_GENERAL cho 45HC)* Tách phiếu `SO-20261018-761` thành dòng nâng hạ + 3 dòng vệ sinh theo lệnh `CL-20261018065734-785`, qua API sửa phiếu; kiểm tra tổng mới, nhật ký `SERVICE_ORDER_UPDATED`.
- [x] 3.3 Tài liệu `docs/quy-trinh-van-hanh-depot.md` (mục 2 Giám định, 3 Vệ sinh, 5 Phiếu dịch vụ) + `docs/menu/08-danh-muc-master-data.md`: giá vệ sinh theo từng loại container, server tra giá, mỗi dịch vụ một dòng.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-cleaning-tariff-pricing` (tạo spec mới `cleaning-tariff`, bổ sung `container-survey`, `container-cleaning`, `service-order`).
- Trước khi deploy VPS: sao lưu DB; kiểm tra giá biểu phí vệ sinh trên VPS sẽ chép sang từng loại, và nháp giám định dở có dịch vụ chưa có giá.
