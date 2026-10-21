# Design

## Context

- **Bảng `ServiceTariffs`** có các cột giá `Price20GP`, `Price40HC` (40' GP/HC), `Price45HC`, `Price20RF`, `Price40RH`, `PriceSpecial`, cùng `VatPercent`, `ServiceCategory`, `ApplicableShift`, `Currency`, `Unit`.
  - `MasterDataService.ValidateServiceTariff` chỉ kiểm tra giá ≥ 0 và VAT 0–100%.
  - Hàm sửa cho đổi mã (`ApplyServiceTariffRequest` gán `item.Code = code`).
- **Danh mục `CONTAINER_TYPE`** (`MasterCatalogItems`):
  - `Name` là mã loại dùng trên hồ sơ, ví dụ `40HC`, `40GP`, `20HC`, `40RH`, `20RF`, `20HR`, `40OT`, `20FR`, `20TK`, `20VH`, `20OS`, `20DD`, `45HC`;
  - `JsonData` có `size` (20/40/45), `category` (DRY / REEFER / OPEN_TOP / FLAT_RACK / TANK / VENTILATED / SPECIAL), `isReefer`.
  - Hồ sơ lưu cỡ ở `depot_jobs.IsoSize`.
- **Phiếu dịch vụ (`DepotJobService.CreateServiceOrderAsync` / `UpdateServiceOrderAsync`):**
  - lưu `request.Size` từ trình duyệt;
  - mỗi dòng tính `Quantity × UnitPrice` và VAT theo số trình duyệt gửi.
- **Frontend:** 3 nơi tự ánh xạ cỡ theo cách khác nhau:
  - `ServiceOrderFormModal`: map theo khoá `20DC/40DC/40HC/45HC/20RF/40HR/DEFAULT` và dùng `||`;
  - `TariffCalculatorPage`: map theo danh sách cỡ cố định;
  - `GateTariffReference`: hiện 5 cột thô.

## Goals / Non-Goals

**Goals:** một quy tắc tra giá duy nhất (server là chuẩn, frontend chỉ để hiển thị); không sửa tay giá biểu cước nâng hạ trên phiếu; dữ liệu biểu cước sạch.

**Non-Goals:** lưu bãi / vệ sinh / dòng khác; phụ phí ca đêm tự động theo giờ; điều chỉnh tiền cho phiếu đã thu.

## Decisions

- **Ánh xạ loại container → cột giá:**
  - đọc `CONTAINER_TYPE` theo `Name = depot_jobs.IsoSize`, lấy `size` và `category`;
  - `DRY` + 20 → `Price20GP`; `DRY` + 40 → `Price40HC`; `DRY` + 45 → `Price45HC`;
  - `REEFER` + 20 → `Price20RF`; `REEFER` + 40/45 → `Price40RH`;
  - mọi nhóm khác → `PriceSpecial`;
  - loại không có trong danh mục → lỗi "Loại container X không có trong DM Loại Container".
  - *Phương án khác:* đoán theo chuỗi (`includes('RF')`). Bỏ vì đây chính là nguồn lỗi hiện tại; danh mục đã có `size` / `category` chuẩn.
- **Server (`ServiceTariffPricing`, hàm tĩnh trong Application, dùng chung cho lập + sửa phiếu):**
  - với mỗi item, nếu `ServiceCode` trùng mã một `ServiceTariff` chưa xoá: tạm ngưng → 400; giá theo ánh xạ = 0 → 400 "Biểu cước {code} chưa có giá cho cỡ {IsoSize}";
  - nếu hợp lệ thì ghi đè `UnitPrice`, `VatPercent` (và `Unit`, `ServiceName` theo biểu cước) trước khi tính tiền;
  - `order.Size` lấy từ `job.IsoSize`;
  - item có mã không thuộc `ServiceTariffs` giữ cách xử lý cũ.
  - *Phương án khác:* từ chối khi giá gửi lên khác giá biểu cước. Bỏ vì ghi đè bằng giá chuẩn đơn giản hơn; form đã khoá ô giá nên chỉ người gọi API trực tiếp mới gửi giá khác.
- **Kiểm tra biểu cước** (`ValidateServiceTariff` mở rộng):
  - phân loại ∈ 7 giá trị; ca ∈ {ALL, DAY_ONLY, NIGHT_SURCHARGE}; tiền tệ = VND; đơn vị tính không rỗng;
  - khi sửa, mã khác mã cũ → 400.
  - Nhánh hồi sinh mã đã xoá mềm vẫn qua cùng kiểm tra. Bỏ đoạn "giải phóng mã" của hàm sửa vì không còn đổi mã được.
- **Frontend:**
  - `modules/masterdata/utils/tariffPricing.ts` gồm `priceForContainer(tariff, containerType)`, trả `{ ok, price, priceKey, reason }`. Dùng ở `ServiceOrderFormModal`; `GateTariffReference` dùng cùng nhãn / cột giá.
  - **Bỏ `TariffCalculatorPage`** (yêu cầu người dùng 20/10/2026): xoá file, gỡ id menu `tariff_calculator` khỏi `Sidebar`, `App.tsx`, `menuPermissions.ts`, thẻ ở `MasterDataPage`, khối trong tab biểu phí `OperationPage` (đổi tên tab "Biểu Phí Tariff Niêm Yết"). Không có phần backend riêng nào cần gỡ.
  - Danh mục loại container lấy qua hook danh mục dùng chung sẵn có (`CONTAINER_TYPE`).
  - Form phiếu:
    - dòng có `serviceCode` thuộc biểu cước nâng hạ thì input đơn giá / VAT `disabled`, kèm chú thích "Giá theo biểu cước";
    - dòng tự thêm chỉ lấy biểu cước `LIFT_EMPTY` đang dùng đầu tiên theo `SortOrder`;
    - nhóm hiển thị theo `serviceCategory` thật thay vì gộp "LOLO";
    - chưa có giá thì hiện cảnh báo, không thêm dòng.
  - Màn Cước Nâng Hạ:
    - ô mã `disabled` khi sửa;
    - "Điều Chỉnh %" lọc `status === 'ACTIVE'` trên `filteredTariffs`, gọi `confirm` kèm số dòng, lưu tuần tự từng dòng và báo dòng lỗi;
    - bỏ nhãn "VAT 8%" cứng.
- **Phiếu thật:**
  - `SO-20261018-761` (chưa thu): sau khi người dùng nhập giá 45HC, mở phiếu trên giao diện, bấm lưu → server tính lại → nhật ký `SERVICE_ORDER_UPDATED`. Không sửa DB trực tiếp.
  - 2 phiếu đã thu: không đụng; ghi chú vào `docs/quy-trinh-van-hanh-depot.md` (mục Khai thác) rằng phiếu lập trước 20/10/2026 cho 45HC / 40RH đã tính theo giá 40HC.

- **Giá theo từng loại container (bổ sung 20/10/2026):**
  - Bảng `ServiceTariffPrices` (`FullAuditedEntity<long>`): `ServiceTariffId` (FK, cascade), `ContainerTypeCode` (= `CONTAINER_TYPE.Name`, ≤ 20), `Price` (18,2); unique (`ServiceTariffId`, `ContainerTypeCode`). Chỉ lưu dòng có giá > 0; không có dòng = chưa có giá.
    - *Phương án khác:* thêm cột cho mỗi loại / JSON trong `ServiceTariffs`. Bỏ vì số loại do admin quyết, và cần kiểm tra loại thuộc DM.
  - Migration `ServiceTariffPricesPerContainerType`: tạo bảng → `INSERT … SELECT` mỗi biểu cước chưa xoá × mỗi loại `CONTAINER_TYPE` chưa xoá, giá lấy theo quy tắc 6 nhóm (khô 20/40/45 → Price20GP/40HC/45HC; lạnh 20 → Price20RF, lạnh 40/45 → Price40RH; nhóm khác → PriceSpecial), chỉ khi > 0 → xoá 6 cột cũ. `Down` thêm lại cột (không khôi phục giá — khôi phục bằng bản sao lưu DB).
  - API: `ServiceTariffRequest.Prices: [{ containerTypeCode, price }]` thay 6 field; phản hồi kèm `prices`. Kiểm tra: mã loại thuộc `CONTAINER_TYPE` chưa xoá, không trùng, giá ≥ 0. Lưu = thay toàn bộ danh sách giá của biểu cước.
  - `ServiceTariffPricing`: giá = dòng `ServiceTariffPrices` có `ContainerTypeCode = job.IsoSize`; không có / 0 → 400 "Biểu cước {code} chưa có giá cho loại {IsoSize}". Loại không có trong DM vẫn báo như cũ. Bỏ hàm quy đổi 6 nhóm.
  - Frontend: `tariffPricing.ts` tra theo `prices[typeCode]`; `LoloTariffMaster` dựng cột bảng + ô form theo `useContainerTypeOptions()` (loại đang dùng, theo `SortOrder`), nhóm ô theo nhóm loại (khô / lạnh / khác) cho dễ nhập; giá của loại đã tạm ngưng vẫn giữ khi lưu. Điều chỉnh % nhân mọi giá của biểu cước. `GateTariffReference`, form phiếu dịch vụ dùng cùng dữ liệu.
  - Seeder: `ServiceTariffs` gieo không kèm giá (giá do người dùng nhập — không preset).

## Risks / Trade-offs

- **Phiếu chưa thu khác đang dùng biểu cước tạm ngưng, hoặc cỡ chưa có giá,** sẽ không sửa được cho tới khi bật lại / nhập giá → thông báo nêu rõ mã và cỡ. Đúng ý "chặn, báo chưa có giá".
- **`SO-20261018-761` chưa tính lại được** nếu người dùng chưa nhập giá 45HC → task tương ứng chờ người dùng; các task khác không phụ thuộc.
- **VPS có thể có biểu cước / loại container khác local** → trước deploy kiểm tra các biểu cước đang dùng có đủ giá cho các cỡ đang có trên hồ sơ, báo người dùng.
- **Biểu cước có `Currency = USD`** (nếu có trên VPS) sẽ không sửa được cho tới khi đổi sang VND. Trước deploy kiểm tra và báo.

- **Bảng rộng khi có nhiều loại** (17 loại) → bảng cuộn ngang, cột mã biểu cước / tên cố định bên trái.
- **Migration xoá cột cũ** → rollback cần khôi phục DB từ bản sao lưu (quy trình deploy luôn sao lưu trước khi pull).

## Migration Plan

- Không migration. Sau deploy: người dùng nhập giá còn thiếu, rồi tính lại các phiếu chưa thu bị sai bằng cách mở và lưu lại.
- Rollback: deploy lại image trước. Dữ liệu không đổi cấu trúc.
