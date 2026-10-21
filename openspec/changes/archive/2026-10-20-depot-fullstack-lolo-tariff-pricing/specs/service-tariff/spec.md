## Purpose

Biểu cước nâng hạ và dịch vụ vỏ container (nâng hạ rỗng / có hàng, đảo chuyển, phụ phí đêm, PTI, hải quan, cân): dữ liệu biểu cước hợp lệ và đơn giá riêng cho từng loại container trong DM Loại Container, dùng chung cho phiếu dịch vụ và biểu phí ở cổng.

## ADDED Requirements

### Requirement: Dữ liệu biểu cước hợp lệ
Biểu cước MUST có mã và tên; VAT trong 0–100%. Phân loại MUST thuộc LIFT_EMPTY, LIFT_LADEN, SHIFTING, NIGHT_SURCHARGE, PTI, CUSTOMS, WEIGHING; ca áp dụng MUST thuộc ALL, DAY_ONLY, NIGHT_SURCHARGE; tiền tệ MUST là VND; đơn vị tính MUST không rỗng. Mã biểu cước MUST NOT đổi sau khi tạo. Vi phạm thì hệ thống MUST từ chối 400 nêu lý do.

#### Scenario: Giá trị lạ
- **WHEN** lưu biểu cước có phân loại "ABC", ca "XYZ", tiền tệ "EUR" hoặc đơn vị tính rỗng
- **THEN** hệ thống từ chối 400 và không lưu

#### Scenario: Đổi mã
- **WHEN** sửa biểu cước LOLO_EMPTY và đổi mã thành LOLO_EMPTY2
- **THEN** hệ thống từ chối 400, mã vẫn là LOLO_EMPTY

#### Scenario: VAT ngoài khoảng
- **WHEN** lưu biểu cước có VAT 150%
- **THEN** hệ thống từ chối 400

### Requirement: Đơn giá theo từng loại container
Mỗi biểu cước SHALL có đơn giá riêng cho từng loại container trong DM Loại Container. Đơn giá MUST ≥ 0 và MUST thuộc một loại có trong DM, không trùng loại trong cùng biểu cước; vi phạm thì từ chối 400. Giá trống hoặc 0 SHALL là chưa có giá cho loại đó; hệ thống MUST NOT lấy giá của loại khác thay thế. Phiếu dịch vụ và biểu phí ở cổng SHALL tra giá theo đúng mã loại container.

#### Scenario: Hai loại cùng cỡ giá khác nhau
- **WHEN** biểu cước có giá 40HC 420.000 đ và 40GP 400.000 đ
- **THEN** container 40HC tính 420.000 đ, container 40GP tính 400.000 đ

#### Scenario: Loại chưa có giá
- **WHEN** tra giá cho container 20OT với biểu cước chưa nhập giá 20OT
- **THEN** kết quả là "chưa có giá cho loại 20OT", không phải 0 đ hay giá loại khác

#### Scenario: Giá sai
- **WHEN** lưu biểu cước có giá -1 cho 40HC, hoặc giá cho loại "99ZZ" không có trong DM, hoặc 40HC hai lần
- **THEN** hệ thống từ chối 400

#### Scenario: Giữ giá đã nhập khi chuyển đổi
- **WHEN** nâng cấp hệ thống trong khi LOLO_EMPTY đang có giá 20' khô 290.000, 40' khô 420.000, 45' 120.000, 20' lạnh 12.222, 40' lạnh 155.555, đặc biệt 166.666
- **THEN** sau nâng cấp LOLO_EMPTY có giá 20HC 290.000; 40HC và 40GP 420.000; 45HC 120.000; 20RF và 20HR 12.222; 40RF và 40RH 155.555; các loại mở nóc / mặt bằng / bồn / thông gió / đặc biệt 166.666

### Requirement: Màn Cước Nâng Hạ theo DM Loại Container
Màn Cước Nâng Hạ SHALL hiện và cho nhập giá theo đúng danh sách loại đang dùng của DM Loại Container, theo thứ tự của DM; loại mới thêm ở DM SHALL tự có ô giá trống (chưa có giá). Hệ thống MUST NOT còn màn Máy tính cước.

#### Scenario: Màn hiện đúng danh sách loại
- **WHEN** mở màn Cước Nâng Hạ trong khi DM Loại Container có 17 loại đang dùng
- **THEN** bảng và form có đúng 17 ô / cột giá mang mã các loại đó, theo thứ tự của DM

#### Scenario: Loại mới thêm ở DM
- **WHEN** admin thêm loại 45RF ở DM Loại Container rồi mở lại màn Cước Nâng Hạ
- **THEN** có thêm ô giá 45RF đang trống; lập phiếu cho container 45RF bị chặn cho tới khi nhập giá

#### Scenario: Không còn Máy tính cước
- **WHEN** mở sidebar, trang Tất Cả Danh Mục hoặc tab biểu phí ở màn Khai thác
- **THEN** không còn mục / khối Máy tính cước nâng hạ & lưu bãi

### Requirement: Điều chỉnh giá hàng loạt
Điều chỉnh % biểu giá SHALL chỉ áp cho các biểu cước đang dùng và đang hiện theo bộ lọc, đổi giá của mọi loại container trong biểu cước đó, sau khi người dùng xác nhận số dòng sẽ đổi. Biểu cước tạm ngưng MUST NOT bị đổi giá.

#### Scenario: Có biểu cước tạm ngưng
- **WHEN** điều chỉnh +5% khi bảng có 2 biểu cước đang dùng và 3 biểu cước tạm ngưng
- **THEN** hộp xác nhận báo 2 dòng, chỉ 2 biểu cước đang dùng được tăng giá (mọi loại container), 3 dòng tạm ngưng giữ nguyên
