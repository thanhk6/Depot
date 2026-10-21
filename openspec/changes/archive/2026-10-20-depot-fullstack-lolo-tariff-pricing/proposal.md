# Proposal

## Why

Kiểm tra Cước Nâng Hạ (20/10/2026) cho thấy giá trên phiếu dịch vụ không theo đúng biểu cước:
- **Server không tra giá.** Server nhận nguyên đơn giá / VAT trình duyệt gửi, và ô đơn giá / VAT trên phiếu sửa tay tự do.
- **Form ra sai giá:**
  - tên cỡ trong form (`20DC`, `40DC`, `40HR`) không khớp *DM Loại Container* (`20HC`, `40GP`, `40RH`…);
  - giá 0 bị coi là "chưa có" rồi thay bằng giá đặc biệt hoặc giá 40'.
  - Hậu quả: 3 phiếu thật (container 45HC và 40RH) bị tính 420.000đ, là giá 40HC, trong khi biểu cước `LOLO_EMPTY` chưa có giá cho 2 cỡ này.
- **Ba màn ra ba giá khác nhau** cho cùng một container: máy tính cước, phiếu dịch vụ, biểu phí ở cổng.
- **API biểu cước nhận giá trị tự do:** phân loại / ca / tiền tệ lạ, và cho đổi mã.

Người dùng quyết định (20/10/2026):
- **không cho sửa tay giá** trên phiếu;
- cỡ chưa có giá thì **chặn và báo**;
- **giữ nguyên 2 phiếu đã thu tiền**, chỉ tính lại phiếu chưa thu;
- **giá nâng hạ do người dùng tự nhập** trên màn Cước Nâng Hạ.
- **mỗi loại container trong DM Loại Container có giá riêng** (bổ sung 20/10/2026) — thay cho 6 nhóm giá cố định (20' GP/DC, 40' GP/HC, 45' HC, 20' RF, 40' RH, OOG): nhãn nhóm gõ cứng không khớp danh mục (danh mục không có 20GP/20DC; nhóm "OOG" gộp cả thông gió, đặc biệt…), và hai loại cùng cỡ (40HC / 40GP) không đặt được giá khác nhau.

## What Changes

- **Server tự tra giá** cho mọi hạng mục có mã thuộc biểu cước nâng hạ (bảng `ServiceTariffs`), khi lập và khi sửa phiếu:
  - đơn giá theo cỡ container của **hồ sơ Gate-In** (không lấy cỡ trình duyệt gửi), quy đổi qua *DM Loại Container* (cỡ 20 / 40 / 45, nhóm khô / lạnh / đặc biệt);
  - VAT lấy từ biểu cước; đơn giá / VAT trình duyệt gửi cho các dòng này bị bỏ qua;
  - biểu cước tạm ngưng / không tồn tại, hoặc cỡ đó giá = 0 → từ chối 400 kèm lý do ("Biểu cước X chưa có giá cho cỡ 45HC").
- **Phiếu dịch vụ (frontend):**
  - dòng biểu cước nâng hạ **khoá ô đơn giá và VAT**, chỉ sửa số lượng;
  - tra giá bằng một hàm dùng chung theo *DM Loại Container*; cỡ chưa có giá thì không thêm dòng và báo "chưa có giá";
  - dòng nâng hạ tự thêm chỉ lấy biểu cước nhóm **Nâng hạ vỏ rỗng** (`LIFT_EMPTY`) đang dùng, theo thứ tự;
  - các nhóm khác (có hàng, phụ phí đêm, cân, PTI, hải quan, đảo chuyển) giữ đúng nhóm, chọn thêm từ danh sách.
- **Biểu phí ở cổng** dùng cùng cột giá với hàm tra giá, hiện "chưa có giá" thay cho 0đ hoặc giá thay thế.
- **Bỏ màn Máy tính cước nâng hạ & lưu bãi** (yêu cầu người dùng 20/10/2026): gỡ khỏi sidebar *DANH MỤC MASTER DATA*, trang *Tất Cả Danh Mục* và tab biểu phí của màn Khai thác (tab đổi tên "Biểu Phí Tariff Niêm Yết").
- **API biểu cước** (`/MasterData/service-tariffs`):
  - phân loại chỉ nhận 7 nhóm đang có; ca chỉ nhận ALL / DAY_ONLY / NIGHT_SURCHARGE; tiền tệ chỉ VND; đơn vị tính bắt buộc;
  - **không đổi mã** sau khi tạo.
- **Màn Cước Nâng Hạ:**
  - ô mã khoá khi sửa;
  - "Điều Chỉnh % Biểu Giá" chỉ áp cho các dòng **đang dùng và đang hiện theo bộ lọc**, hỏi xác nhận kèm số dòng;
  - bỏ nhãn cứng "VAT 8%".
- **Phiếu thật:**
  - `SO-20261018-761` (WHLU4254283, chưa thu) được tính lại sau khi người dùng nhập giá 45HC;
  - 2 phiếu đã thu (`SO-20261016-645`, `SO-20261016-756`) giữ nguyên, ghi nhận trong tài liệu là đã tính theo giá 40HC.

- **Giá theo từng loại container (DM Loại Container):**
  - bảng giá mới `ServiceTariffPrices` (biểu cước × mã loại container → đơn giá); bỏ 6 cột giá cũ của `ServiceTariffs`;
  - migration chuyển giá đang có sang từng loại theo đúng quy tắc 6 nhóm hiện tại → giá đã nhập không đổi;
  - màn Cước Nâng Hạ: cột / ô giá = các loại đang dùng của DM Loại Container (loại mới tự có ô trống);
  - server, form phiếu dịch vụ, biểu phí ở cổng tra giá theo mã loại của hồ sơ; chưa có giá → chặn như trước.

## Capabilities

### New Capabilities

- `service-tariff`: biểu cước nâng hạ và dịch vụ vỏ (bảng `ServiceTariffs`) — dữ liệu hợp lệ, tra đơn giá theo cỡ container.

### Modified Capabilities

- `service-order`: đơn giá / VAT của hạng mục biểu cước nâng hạ do server tra, không sửa tay; cỡ container lấy từ hồ sơ.

## Impact

- **Màn hình:**
  - *Khai thác Gate-In → Phiếu dịch vụ* (`ServiceOrderFormModal`);
  - *DANH MỤC MASTER DATA → Cước Nâng Hạ (LoLo)* (`LoloTariffMaster`);
  - *Máy Tính Cước* (`TariffCalculatorPage`) — **gỡ bỏ** (xoá file, menu `tariff_calculator`, thẻ ở Tất Cả Danh Mục, khối trong tab Khai thác);
  - biểu phí tham khảo ở cổng (`GateTariffReference`).
- **API:**
  - `POST /ServiceOrders` / sửa phiếu: thêm tra giá và kiểm tra;
  - `POST / PUT /MasterData/service-tariffs`: thêm kiểm tra.
  - Không thêm endpoint, không đổi phân quyền.
- **Code:**
  - backend: `DepotJobService` (lập / sửa phiếu), `MasterDataService` (kiểm tra biểu cước);
  - frontend: hàm tra giá dùng chung mới trong `modules/masterdata/utils/`.
- **Dữ liệu (giá theo loại):** migration EF Core `ServiceTariffPricesPerContainerType` — tạo bảng `ServiceTariffPrices`, **chép giá cũ sang từng loại** (không đổi giá), xoá 6 cột giá cũ. Có sửa dữ liệu cũ (chuyển chỗ lưu giá), không đổi giá trị. Seeder không gieo giá mẫu nữa.
- **Dữ liệu:**
  - không migration EF Core;
  - không tự đổi giá biểu cước;
  - chỉ tính lại phiếu chưa thu `SO-20261018-761` qua đường sửa phiếu bình thường, có ghi nhật ký `SERVICE_ORDER_UPDATED`, sau khi người dùng nhập giá.
- **Ngoài phạm vi:**
  - dòng lưu bãi, vệ sinh và các dòng không thuộc `ServiceTariffs` vẫn như hiện tại (nếu cần khoá giá thì làm change riêng);
  - tự áp phụ phí ca đêm theo giờ;
  - chức năng thu thêm / hoàn tiền cho phiếu đã thu;
  - dọn dòng test `TEST_NEW_TABLE`.
