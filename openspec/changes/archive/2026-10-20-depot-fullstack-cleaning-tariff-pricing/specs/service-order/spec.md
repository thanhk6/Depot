## ADDED Requirements

### Requirement: Dòng vệ sinh trên phiếu dịch vụ theo từng dịch vụ
Phiếu dịch vụ SHALL có một dòng riêng cho mỗi dịch vụ vệ sinh của lệnh vệ sinh đã bàn giao (đúng mã, tên, số lượng), không gộp nhiều dịch vụ vào một dòng. Với mỗi dòng có mã thuộc biểu phí vệ sinh, khi lập và khi sửa phiếu, hệ thống SHALL tự tra đơn giá theo loại container của hồ sơ và lấy VAT của biểu phí, bỏ qua giá / VAT trình duyệt gửi; dịch vụ tạm ngưng hoặc chưa có giá MUST bị từ chối 400. Trên form, ô đơn giá và VAT của dòng vệ sinh MUST bị khoá.

#### Scenario: Ba dịch vụ vệ sinh thành ba dòng
- **WHEN** lập phiếu cho container có lệnh vệ sinh đã bàn giao gồm CLN_GENERAL, CLN_CHEMICAL, CLN_FOOD_GRADE
- **THEN** form có đúng 3 dòng vệ sinh mang 3 mã đó, mỗi dòng giá theo biểu phí, không có dòng gộp tổng

#### Scenario: Trình duyệt gửi giá vệ sinh khác
- **WHEN** lập phiếu có dòng CLN_CHEMICAL đơn giá gửi lên 1 đ cho container 40HC, biểu phí 450.000 đ VAT 8%
- **THEN** phiếu lưu 450.000 đ, VAT 8%

#### Scenario: Form khoá giá vệ sinh
- **WHEN** Khai thác mở form phiếu có dòng vệ sinh
- **THEN** ô đơn giá và VAT của dòng vệ sinh không sửa được; số lượng vẫn sửa được

#### Scenario: Tách phiếu chưa thu đã gộp
- **WHEN** sửa lại phiếu chưa thu SO-20261018-761 (WHLU4254283, 45HC) sau nâng cấp
- **THEN** dòng "Vệ sinh tổng quát" gộp được thay bằng 3 dòng CLN_GENERAL, CLN_CHEMICAL, CLN_FOOD_GRADE theo giá biểu phí; dòng nâng hạ giữ nguyên; có nhật ký sửa phiếu
