## ADDED Requirements

### Requirement: Đơn giá biểu cước nâng hạ do server tra
Với mỗi hạng mục có mã thuộc biểu cước nâng hạ, khi lập và khi sửa phiếu, hệ thống SHALL tự tra đơn giá theo loại container của hồ sơ Gate-In và lấy VAT của biểu cước, bỏ qua đơn giá / VAT / loại container trình duyệt gửi. Hệ thống MUST từ chối (400, nêu mã biểu cước và loại container) khi biểu cước tạm ngưng, hoặc loại container đó chưa có giá. Trên form phiếu dịch vụ, ô đơn giá và VAT của các hạng mục này MUST bị khoá; chỉ sửa được số lượng.

#### Scenario: Trình duyệt gửi giá khác biểu cước
- **WHEN** lập phiếu cho container 40GP có hạng mục LOLO_EMPTY (biểu cước có giá 40GP 420.000 đ, VAT 8%) với đơn giá gửi lên 1 đ và VAT 0%
- **THEN** phiếu lưu đơn giá 420.000 đ và VAT 8% theo biểu cước, tổng tiền tính theo giá đó

#### Scenario: Loại chưa có giá
- **WHEN** lập phiếu cho container 45HC có hạng mục LOLO_EMPTY trong khi biểu cước chưa có giá cho loại 45HC
- **THEN** hệ thống từ chối 400 báo "Biểu cước LOLO_EMPTY chưa có giá cho loại 45HC" và không tạo phiếu

#### Scenario: Biểu cước tạm ngưng
- **WHEN** lập phiếu có hạng mục mang mã biểu cước đang tạm ngưng
- **THEN** hệ thống từ chối 400 nêu mã biểu cước

#### Scenario: Loại container theo hồ sơ
- **WHEN** hồ sơ Gate-In là 40GP nhưng trình duyệt gửi loại 20HC
- **THEN** đơn giá vẫn tra theo 40GP

#### Scenario: Form khoá giá
- **WHEN** Khai thác mở form phiếu dịch vụ có dòng nâng hạ
- **THEN** ô đơn giá và VAT của dòng đó không sửa được; ô số lượng vẫn sửa được

#### Scenario: Dòng nâng hạ tự thêm
- **WHEN** mở form phiếu cho container mà biểu cước nâng hạ vỏ rỗng đang dùng có giá cho loại đó
- **THEN** form tự thêm đúng một dòng của biểu cước nhóm Nâng hạ vỏ rỗng, không lấy biểu cước nhóm khác; nếu chưa có giá thì không thêm dòng và báo chưa có giá
