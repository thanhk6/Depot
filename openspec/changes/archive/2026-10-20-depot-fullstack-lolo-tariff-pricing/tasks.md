# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 `MasterDataService.ValidateServiceTariff`: phân loại / ca / tiền tệ VND / đơn vị tính; hàm sửa không cho đổi mã (bỏ nhánh giải phóng mã). Kiểm tra: `dotnet build` BackendApi không lỗi.
- [x] 1.2 Hàm tra giá `ServiceTariffPricing` (đọc `CONTAINER_TYPE` theo `IsoSize` → cột giá; tạm ngưng / giá 0 / loại không có trong danh mục → `ArgumentException` nêu mã + cỡ). Kiểm tra: build không lỗi.
- [x] 1.3 `CreateServiceOrderAsync` / `UpdateServiceOrderAsync`: ghi đè đơn giá / VAT / ĐVT / tên cho dòng thuộc `ServiceTariffs`; `Size` lấy `job.IsoSize`. Kiểm tra: build không lỗi.
- [x] 1.4 Test API trong `tests/api/` (chạy `npm run test:api`):
  - `service-tariff.spec.ts`: giá trị lạ, đổi mã, giá âm / VAT → 400.
  - `service-order.pricing.spec.ts` với biểu cước test `QA_T_…` và container `QATS…` đã qua giám định + vệ sinh:
    - giá gửi lên 1đ → lưu theo biểu cước;
    - cỡ chưa có giá → 400;
    - biểu cước tạm ngưng → 400;
    - cỡ gửi sai → tra theo hồ sơ;
    - sửa phiếu cũng tra lại.
  - Kiểm tra: tất cả đạt, dữ liệu test được dọn.

## 2. Frontend (`fontend/`)

- [x] 2.1 `modules/masterdata/utils/tariffPricing.ts` (`priceForContainer`) theo bảng ánh xạ trong design.md. Kiểm tra: `npx tsc --noEmit -p .` không lỗi.
- [x] 2.2 `ServiceOrderFormModal`:
  - dùng `priceForContainer`;
  - khoá ô đơn giá / VAT của dòng biểu cước nâng hạ;
  - dòng tự thêm chỉ lấy `LIFT_EMPTY`; nhóm theo `serviceCategory` thật;
  - chưa có giá thì báo, không thêm dòng.
  - Kiểm tra: type-check không lỗi.
- [x] 2.3 `TariffCalculatorPage` + `GateTariffReference` dùng `priceForContainer`, hiện "chưa có giá" thay cho 0đ / giá thay thế. Kiểm tra: type-check không lỗi. *(Máy tính cước sau đó bị bỏ ở 2.6.)*
- [x] 2.4 `LoloTariffMaster`:
  - khoá ô mã khi sửa;
  - "Điều Chỉnh %" chỉ áp dòng đang dùng + đang lọc, xác nhận kèm số dòng, lưu tuần tự và báo dòng lỗi;
  - bỏ nhãn "VAT 8%" cứng.
  - Kiểm tra: type-check không lỗi.
- [x] 2.5 Test giao diện `tests/e2e/service-order.pricing.spec.ts`:
  - form phiếu cho container test: ô đơn giá / VAT dòng nâng hạ bị khoá;
  - đúng 1 dòng nhóm vỏ rỗng; cỡ chưa có giá thì báo và không có dòng.
  - Kiểm tra: `npm test` đạt.
- [x] 2.6 Bỏ màn Máy tính cước (yêu cầu 20/10/2026): xoá `TariffCalculatorPage.tsx`, gỡ menu `tariff_calculator` (Sidebar, App, menuPermissions), thẻ ở Tất Cả Danh Mục, khối trong tab Khai thác (đổi tên tab "Biểu Phí Tariff Niêm Yết"); cập nhật `docs/menu/`. Kiểm tra: type-check không lỗi; e2e "Không còn Máy tính cước" đạt.

## 3. Kiểm thử & dữ liệu thật (http://127.0.0.1:3000, admin)

- [x] 3.1 Chạy `cd tests && npm test`: toàn bộ (cũ + mới) đạt; dữ liệu test được dọn; 3 hồ sơ thật và 2 phiếu đã thu không đổi (so DB trước / sau).
- [x] 3.2 *(Đã làm 20/10/2026 sau khi người dùng nhập giá 45HC = 120.000 — qua API sửa phiếu vì không có màn sửa phiếu; tổng mới 1.458.001 đ, nhật ký SERVICE_ORDER_UPDATED)* Mở phiếu `SO-20261018-761` trên giao diện, lưu lại → dòng nâng hạ theo giá mới, tổng tiền tính lại, có nhật ký `SERVICE_ORDER_UPDATED`. 2 phiếu đã thu giữ nguyên.
- [x] 3.3 `docs/quy-trinh-van-hanh-depot.md`: giá nâng hạ do hệ thống tra theo biểu cước, không sửa tay; cỡ chưa có giá thì chặn; ghi chú 2 phiếu đã thu trước 20/10/2026 tính theo giá 40HC.

## 4. Giá theo từng loại container (DM Loại Container) — bổ sung 20/10/2026

- [x] 4.1 Backend: entity + cấu hình `ServiceTariffPrice`, migration `ServiceTariffPricesPerContainerType` (tạo bảng, chép giá theo quy tắc 6 nhóm, xoá 6 cột cũ); seeder bỏ giá mẫu. Kiểm tra: build không lỗi; sau khi chạy migration local, LOLO_EMPTY có giá 20HC 290.000, 40HC + 40GP 420.000, 45HC 120.000, 20RF + 20HR 12.222, 40RF + 40RH 155.555, các loại khác 166.666 (so DB).
- [x] 4.2 Backend: API biểu cước nhận / trả `prices` (kiểm tra loại thuộc DM, không trùng, giá ≥ 0); `ServiceTariffPricing` tra theo mã loại. Kiểm tra: build không lỗi.
- [x] 4.3 Frontend: `tariffPricing.ts` theo mã loại; `LoloTariffMaster` cột / ô theo DM Loại Container; form phiếu dịch vụ, `GateTariffReference` theo `prices`. Kiểm tra: type-check không lỗi.
- [x] 4.4 Test (`tests/`): cập nhật test cũ sang `prices`; thêm: 40HC và 40GP giá khác nhau; loại chưa nhập giá → 400; giá cho loại không có trong DM / trùng / âm → 400; màn Cước Nâng Hạ có đúng số cột = số loại đang dùng. Kiểm tra: `npm test` đạt; dữ liệu thật (hồ sơ, 3 phiếu) không đổi.
- [x] 4.5 Phiếu `SO-20261018-761` vẫn 1.458.001 đ sau migration (không tính lại). Tài liệu `docs/quy-trinh-van-hanh-depot.md` + `docs/menu/08-danh-muc-master-data.md`: giá nhập theo từng loại container của DM.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-lolo-tariff-pricing` (tạo spec mới `service-tariff`, bổ sung `service-order`).
- Trước khi deploy VPS: kiểm tra biểu cước đang dùng trên VPS có đủ giá cho các cỡ trên hồ sơ, và không có biểu cước tiền USD; báo người dùng.
