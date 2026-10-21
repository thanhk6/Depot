# Proposal

## Why

Kiểm tra Biểu Phí Vệ Sinh (20/10/2026) cho thấy các lỗi giống Cước Nâng Hạ trước khi sửa:
- **Server không tra giá.** Đơn giá vệ sinh do trình duyệt gửi khi nộp phiếu giám định / tiếp nhận vệ sinh / lập phiếu dịch vụ; backend không đọc danh mục `CLEANING_TARIFF` ở đâu. Giá 0 cũng không bị chặn (`CLN_GENERAL` 45HC lưu 0đ).
- **Phiếu dịch vụ gộp mọi dịch vụ vệ sinh vào 1 dòng** mang tên dịch vụ đầu tiên. Ba phiếu thật có dòng "Vệ sinh tổng quát" 1.230.001 / 1.325.000đ, thực chất là tổng 3 dịch vụ.
- **Bốn nơi tính giá theo bốn cách**, theo 6 nhóm cố định (20DC / 40DC / 40HC / 45HC / 20RF / 40HR) không khớp DM Loại Container.
- **API danh mục nhận dữ liệu sai** (giá âm, VAT 150%, USD, JSON rác).
- **Mục "đơn giá thoả thuận theo hãng tàu" là giả**: không nhập / lưu / áp dụng được.
- **Lưu một dòng ghi lại cả danh sách** (`persistCatalog`); điều chỉnh % áp cả dịch vụ tạm ngưng.

Người dùng quyết định (20/10/2026):
- làm **giống Cước Nâng Hạ**;
- **bỏ** mục giá theo hãng tàu;
- **giữ** cách tính bên chịu phí hiện tại (mọi dòng vẫn tính vào phiếu của khách);
- **tách lại** phiếu chưa thu `SO-20261018-761` thành từng dòng dịch vụ vệ sinh.

## What Changes

- **Bảng riêng cho biểu phí vệ sinh:**
  - `CleaningTariffs` (mã, tên VI / EN, nhóm, mã CEDEX, mô tả, VAT, tiền VND, bên chịu phí mặc định, thời gian / nước / hoá chất / thiết bị, trạng thái, thứ tự);
  - `CleaningTariffPrices` (biểu phí × mã loại container → đơn giá).
  - Migration chuyển dữ liệu từ `MasterCatalogItems` (`CLEANING_TARIFF`) sang bảng mới, **giữ nguyên giá** (quy tắc chuyển ở design.md), rồi xoá mềm các dòng catalog cũ. Seeder không gieo giá mẫu.
- **API `/MasterData/cleaning-tariffs`** (quyền `masterdata`), kiểm tra:
  - mã / tên bắt buộc; nhóm, bên chịu phí thuộc danh sách; VAT 0–100; tiền VND;
  - không đổi mã sau khi tạo;
  - giá ≥ 0, loại thuộc DM, không trùng.
- **Server tự tra giá** dịch vụ vệ sinh theo loại container của hồ sơ, bỏ qua đơn giá trình duyệt gửi; dịch vụ tạm ngưng / không có trong danh mục / chưa có giá → 400. Áp ở:
  - nộp / lưu nháp phiếu giám định (`SurveyCleaningItem` → lệnh vệ sinh);
  - tạo lệnh vệ sinh thủ công;
  - lập / sửa phiếu dịch vụ.
- **Phiếu dịch vụ:**
  - mỗi dịch vụ vệ sinh của lệnh vệ sinh đã bàn giao là **một dòng riêng** (đúng mã, tên, số lượng), giá theo biểu phí;
  - ô đơn giá / VAT của dòng vệ sinh bị **khoá**.
- **Frontend dùng một hàm tra giá** (`tariffPricing.ts`, theo mã loại) ở form giám định, Thêm mới giám định, tiếp nhận vệ sinh, phiếu dịch vụ, biểu phí ở cổng. Chưa có giá → báo, không thêm dịch vụ.
- **Màn Biểu Phí Vệ Sinh:**
  - cột / ô giá theo DM Loại Container (giống Cước Nâng Hạ);
  - mỗi lần lưu chỉ ghi đúng dòng đó;
  - điều chỉnh % chỉ áp dịch vụ đang dùng + đang lọc, có xác nhận;
  - **bỏ mục giá theo hãng tàu**.
- **Phiếu `SO-20261018-761`** (chưa thu): tách dòng "Vệ sinh tổng quát" gộp thành 3 dòng `CLN_GENERAL`, `CLN_CHEMICAL`, `CLN_FOOD_GRADE` theo giá biểu phí. Hai phiếu đã thu giữ nguyên.

## Capabilities

### New Capabilities

- `cleaning-tariff`: biểu phí vệ sinh container — dữ liệu hợp lệ, giá theo từng loại container của DM, màn quản lý, điều chỉnh hàng loạt.

### Modified Capabilities

- `container-survey`: giá dịch vụ vệ sinh trên phiếu giám định do server tra theo biểu phí.
- `container-cleaning`: lệnh vệ sinh thủ công lấy giá do server tra theo biểu phí.
- `service-order`: dịch vụ vệ sinh là từng dòng riêng, giá do server tra, không sửa tay.

## Impact

- **Màn hình:**
  - *DANH MỤC MASTER DATA → Biểu Phí Vệ Sinh Container* (và tab "Biểu Phí Vệ Sinh (Cleaning)" trong module Giám định);
  - form giám định, Thêm mới giám định, tiếp nhận vệ sinh thủ công, form phiếu dịch vụ, biểu phí ở cổng.
- **API:**
  - mới `GET / POST / PUT / DELETE /MasterData/cleaning-tariffs`;
  - kiểm tra thêm ở `POST /DepotJobs/{id}/survey`, `POST /cleaning`, `POST / PUT /service-orders`.
  - Catalog `CLEANING_TARIFF` không còn dùng.
- **Dữ liệu:** migration EF Core `CleaningTariffTables` — tạo 2 bảng, chép dữ liệu + giá, xoá mềm dòng catalog cũ. Sửa phiếu chưa thu `SO-20261018-761` (tách dòng, có nhật ký).
- **Ngoài phạm vi:**
  - lưu bãi; bên chịu phí (giữ như cũ);
  - không tính lại phiếu giám định / lệnh vệ sinh đã lưu;
  - 2 phiếu đã thu giữ nguyên.
