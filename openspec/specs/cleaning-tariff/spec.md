# cleaning-tariff Specification

## Purpose

Biểu phí vệ sinh container (vệ sinh tổng quát, hoá chất, chuẩn thực phẩm, khử mùi, hun trùng…): dữ liệu biểu phí hợp lệ và đơn giá riêng cho từng loại container trong DM Loại Container, dùng chung cho phiếu giám định, lệnh vệ sinh, phiếu dịch vụ và biểu phí ở cổng.

## Requirements

### Requirement: Dữ liệu biểu phí vệ sinh hợp lệ
Biểu phí vệ sinh MUST có mã và tên tiếng Việt; VAT trong 0–100%; tiền tệ MUST là VND; nhóm dịch vụ và bên chịu phí mặc định MUST thuộc danh sách quy định. Mã biểu phí MUST NOT đổi sau khi tạo. Vi phạm thì hệ thống MUST từ chối 400 nêu lý do. Mỗi lần lưu SHALL chỉ ghi đúng biểu phí đang sửa.

#### Scenario: Giá trị sai
- **WHEN** lưu biểu phí có VAT 150%, tiền USD hoặc thiếu tên tiếng Việt
- **THEN** hệ thống từ chối 400 và không lưu

#### Scenario: Đổi mã
- **WHEN** sửa biểu phí CLN_GENERAL và đổi mã thành CLN_GENERAL2
- **THEN** hệ thống từ chối 400, mã vẫn là CLN_GENERAL

#### Scenario: Sửa một dòng
- **WHEN** sửa giá của CLN_CHEMICAL
- **THEN** chỉ dòng CLN_CHEMICAL thay đổi, các biểu phí khác giữ nguyên thời điểm sửa cuối

### Requirement: Đơn giá vệ sinh theo từng loại container
Mỗi biểu phí vệ sinh SHALL có đơn giá riêng cho từng loại container trong DM Loại Container. Đơn giá MUST ≥ 0, MUST thuộc loại có trong DM và không trùng loại; vi phạm thì từ chối 400. Giá trống hoặc 0 SHALL là chưa có giá cho loại đó; hệ thống MUST NOT lấy giá loại khác thay thế.

#### Scenario: Hai loại cùng cỡ giá khác nhau
- **WHEN** CLN_CHEMICAL có giá 40HC 450.000 đ và 40GP 420.000 đ
- **THEN** container 40HC tính 450.000 đ, container 40GP tính 420.000 đ

#### Scenario: Loại chưa có giá
- **WHEN** tra giá CLN_GENERAL cho container 45HC khi chưa nhập giá 45HC
- **THEN** kết quả là "chưa có giá cho loại 45HC", không phải 0 đ hay giá loại khác

#### Scenario: Giá sai
- **WHEN** lưu biểu phí có giá -1 cho 40HC, hoặc giá cho loại "99ZZ", hoặc 40HC hai lần
- **THEN** hệ thống từ chối 400

#### Scenario: Giữ giá khi chuyển sang bảng mới
- **WHEN** nâng cấp hệ thống trong khi CLN_CHEMICAL có giá 20' khô 280.000, 40' thường 420.000, 40HC 450.000, 45HC 480.001, 20' lạnh 350.000, 40' lạnh 520.000
- **THEN** sau nâng cấp CLN_CHEMICAL có giá 20HC 280.000; 40GP 420.000; 40HC 450.000; 45HC 480.001; 20RF và 20HR 350.000; 40RF và 40RH 520.000; các loại khác theo cỡ (20' → 280.000, 40' → 420.000)

### Requirement: Màn Biểu Phí Vệ Sinh theo DM Loại Container
Màn Biểu Phí Vệ Sinh SHALL hiện và cho nhập giá theo đúng danh sách loại đang dùng của DM Loại Container, theo thứ tự DM; loại mới thêm ở DM SHALL tự có ô giá trống. Màn MUST NOT còn mục đơn giá thoả thuận theo hãng tàu. Điều chỉnh % SHALL chỉ áp cho biểu phí đang dùng và đang hiện theo bộ lọc, sau khi người dùng xác nhận số dòng.

#### Scenario: Màn hiện đúng danh sách loại
- **WHEN** mở màn Biểu Phí Vệ Sinh khi DM Loại Container có 17 loại đang dùng
- **THEN** bảng và form có đúng 17 cột / ô giá mang mã các loại đó

#### Scenario: Không còn giá theo hãng tàu
- **WHEN** mở màn Biểu Phí Vệ Sinh
- **THEN** không có mục "Đơn giá thỏa thuận riêng cho Hãng Tàu"

#### Scenario: Điều chỉnh % bỏ qua dịch vụ tạm ngưng
- **WHEN** điều chỉnh +10% khi bộ lọc có 2 biểu phí đang dùng và 1 biểu phí tạm ngưng
- **THEN** hộp xác nhận báo 2 dòng; chỉ 2 biểu phí đang dùng được tăng giá
