# Proposal

## Why

Kiểm tra Cước Lưu Bãi (20/10/2026) cho thấy biểu giá chỉ để xem, chưa tính tiền đúng ở đâu:
- **Server không tính phí lưu bãi.** Backend không đọc `StorageTariffRules` ở bất kỳ nghiệp vụ nào; không tính số ngày lưu bãi, ngày miễn phí, bậc giá.
- **Phiếu dịch vụ cho chọn tay từng bậc** của mọi quy tắc rồi tự gõ số ngày, đơn giá / VAT sửa tay được; loại không có giá thì lấy giá thay (`priceSpecial` / `price40Dry`).
- **Giá theo 6 cột cứng** (20 / 40 / 45 khô, 20 / 40 lạnh, đặc biệt), không theo DM Loại Container như Cước Nâng Hạ / Biểu Phí Vệ Sinh.
- **Ngày miễn phí khai 2 nơi, mâu thuẫn** (vd `STOR_DRY_STANDARD` miễn phí 5 ngày nhưng bậc giá bắt đầu ngày 1).
- **Màn quản lý:** hãng tàu gõ cứng 4 hãng; nhóm container không khớp dữ liệu (không có Reefer); "Tạm ngưng" = biến mất, không bật lại được; VAT 0% thành 8%; đổi được mã; có USD; điều chỉnh % áp mọi quy tắc, không hỏi.
- **Dữ liệu test** (`QA_STO_*`, `TEST_STORAGE_NEW`, `STOR_TEST_UI`) còn trong bảng; seeder chép lại quy tắc từ catalog cũ `STORAGE_TARIFF` mỗi lần khởi động.

Người dùng quyết định (20/10/2026):
- phí lưu bãi **tính khi Gate-Out**;
- giá **theo từng loại container của DM** như Cước Nâng Hạ;
- **ngày miễn phí khai một nơi**, bậc giá bắt đầu sau ngày miễn phí;
- **không tách theo nhóm container**: mỗi hãng tàu (hoặc "Mọi hãng") một quy tắc, ưu tiên quy tắc của đúng hãng;
- **xoá dữ liệu test**; giữ `STOR_DRY_STANDARD`, tạm ngưng 4 quy tắc "Mọi hãng" còn lại;
- biểu giá **mới nhập giá, chưa dùng thu tiền** → change này chưa lập phiếu thu / chưa chặn ra cổng.

## What Changes

- **Bảng giá theo loại container:** bảng mới `StorageTariffTierPrices` (bậc × mã loại container → đơn giá/ngày); bỏ 6 cột giá và cột `ContainerTypeCategory`.
- **Kiểm tra quy tắc ở server** (`/MasterData/storage-tariffs`):
  - hãng tàu là `ALL` hoặc mã có trong DM Hãng Tàu (tên lấy từ DM); mỗi hãng tối đa 1 quy tắc đang dùng;
  - bậc giá liền nhau: bậc đầu bắt đầu đúng ngày *miễn phí + 1*, không hở / chồng, chỉ bậc cuối không giới hạn và bắt buộc có;
  - giá ≥ 0, loại thuộc DM, không trùng; VAT 0–100; tiền VND; không đổi mã;
  - Xoá = xoá mềm; Tạm ngưng = `IsActive=false`, vẫn hiện để bật lại.
- **Server tính phí lưu bãi** (`StorageTariffPricing`): chọn quy tắc (đúng hãng → `ALL`), số ngày theo lịch Việt Nam tính cả ngày vào và ngày ra, trừ ngày miễn phí, nhân theo từng bậc, VAT theo quy tắc. Thiếu quy tắc / thiếu giá → báo rõ, không dùng giá thay.
- **API xem trước** `GET /DepotJobs/{id}/storage-fee` (đến hôm nay, hoặc đến ngày Gate-Out nếu đã ra).
- **Gate-Out:** hộp cấp vỏ hiện bảng phí lưu bãi (ngày vào, số ngày, miễn phí, từng bậc, tổng); nhật ký `GATE_OUT` ghi số ngày + tổng phí. Chưa chặn ra cổng.
- **Phiếu dịch vụ:** bỏ các dòng "Lưu bãi …" chọn tay; server từ chối hạng mục nhóm `STORAGE` (phí lưu bãi do hệ thống tính khi Gate-Out).
- **Màn Cước Lưu Bãi:** ô giá mỗi bậc theo DM Loại Container; hãng tàu từ DM Hãng Tàu; bỏ nhóm container, USD; hiện quy tắc tạm ngưng; mỗi lần lưu ghi đúng 1 quy tắc; điều chỉnh % chỉ quy tắc đang dùng + đang lọc, có xác nhận. Biểu phí ở cổng hiện giá theo loại.
- **Dữ liệu:** migration chuyển giá cũ sang từng loại container, đưa bậc về sau ngày miễn phí, xoá mềm dữ liệu test, tạm ngưng các quy tắc theo quyết định; bỏ đoạn seeder chép từ catalog cũ.

## Capabilities

### New Capabilities

- `storage-tariff`: biểu cước lưu bãi — quy tắc theo hãng tàu, ngày miễn phí + bậc giá theo loại container của DM, cách server tính phí lưu bãi, màn quản lý.

### Modified Capabilities

- `gate-out`: hộp cấp vỏ hiện phí lưu bãi do server tính, nhật ký ghi số ngày và phí.
- `service-order`: không còn hạng mục lưu bãi chọn tay trên phiếu dịch vụ.

## Impact

- **Màn hình:** *DANH MỤC MASTER DATA → Cước Lưu Bãi (Storage)* (và tab cùng tên ở module Khai thác); hộp cấp vỏ Gate-Out (`GateOutDispatchModal`); form phiếu dịch vụ; biểu phí ở cổng (`GateTariffReference`).
- **API:** `GET / POST / PUT / DELETE /MasterData/storage-tariffs` (đổi request: giá theo loại, bỏ nhóm container; `GET ?includeInactive=true`); mới `GET /DepotJobs/{id}/storage-fee`; `POST / PUT /service-orders` từ chối nhóm `STORAGE`.
- **Dữ liệu:** migration EF Core `StorageTariffPricesPerContainerType` — tạo `StorageTariffTierPrices`, chép giá cũ theo loại (quy tắc ở design.md), sửa bậc trùng ngày miễn phí, bỏ 6 cột giá + `ContainerTypeCategory`, xoá mềm `QA_STO_%` / `TEST_STORAGE_NEW` / `STOR_TEST_UI`, tạm ngưng `STOR_REEFER`, `STOR_45HC`, `STOR_OOG_DG`, `STOR_SPECIAL_EQUIP` và `STOR_MAERSK_SPECIAL` (hãng `MSK` không có trong DM Hãng Tàu), xoá mềm catalog `STORAGE_TARIFF` cũ.
- **Ngoài phạm vi:** lập phiếu thu phí lưu bãi, chọn bên trả (khách / hãng tàu), chặn Gate-Out khi chưa thu — làm ở change sau khi bắt đầu thu thật; phí lưu bãi của container đã Gate-Out trước đây; không đổi phiếu dịch vụ đã lập (chưa có dòng lưu bãi nào).
