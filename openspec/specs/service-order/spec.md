# service-order Specification

## Purpose

Cho Khai thác lập phiếu dịch vụ (phí nâng hạ, lưu bãi, vệ sinh…) cho từng hồ sơ container sau khi giám định và vệ sinh xong, làm căn cứ thu tiền.

## Requirements

### Requirement: Điều kiện lập phiếu dịch vụ
Hệ thống MUST từ chối lập phiếu khi không tìm thấy hồ sơ khớp cả số hồ sơ và số container, khi hồ sơ còn ở Gate-In / SURVEYING, hoặc khi hồ sơ đang CLEANING hay còn lệnh vệ sinh chưa bàn giao.

#### Scenario: Container còn đang vệ sinh
- **WHEN** lập phiếu cho container có lệnh vệ sinh chưa bàn giao
- **THEN** hệ thống từ chối và báo chờ Tổ Vệ Sinh bàn giao, kèm mã lệnh vệ sinh

#### Scenario: Chưa giám định xong
- **WHEN** lập phiếu cho hồ sơ đang SURVEYING
- **THEN** hệ thống từ chối

### Requirement: Mỗi hồ sơ một phiếu
Mỗi hồ sơ MUST chỉ có một phiếu dịch vụ, kể cả phiếu đã huỷ; lập phiếu thứ hai MUST bị từ chối kèm số phiếu cũ và tình trạng của nó.

#### Scenario: Đã có phiếu huỷ
- **WHEN** lập phiếu cho hồ sơ đã có phiếu bị huỷ
- **THEN** hệ thống từ chối và báo phiếu cũ đã huỷ

### Requirement: Hạng mục và tiền tính ở server
Phiếu MUST có ít nhất một hạng mục với số lượng > 0, đơn giá ≥ 0, VAT 0–100%. Hệ thống SHALL tính thành tiền = số lượng × đơn giá, tiền VAT theo thuế suất từng dòng, và tổng phiếu = tổng các dòng. Phiếu mới SHALL có số phiếu do hệ thống sinh và ghi nhật ký SERVICE_ORDER_CREATED.

#### Scenario: VAT ngoài khoảng
- **WHEN** lập phiếu có hạng mục VAT 150%
- **THEN** hệ thống từ chối

#### Scenario: Tính tiền nhiều thuế suất
- **WHEN** phiếu có dòng 100.000 đ VAT 8% và dòng 200.000 đ VAT 10%
- **THEN** tiền VAT là 28.000 đ và tổng phiếu là 328.000 đ

### Requirement: Hạng mục vệ sinh tạo lệnh vệ sinh
Khi phiếu có hạng mục nhóm vệ sinh và hồ sơ chưa từng có lệnh vệ sinh nào, hệ thống SHALL tạo lệnh vệ sinh chờ thực hiện từ các hạng mục đó; hồ sơ đã từng có lệnh vệ sinh MUST NOT bị tạo thêm lệnh.

#### Scenario: Thu phí vệ sinh đã làm
- **WHEN** lập phiếu có phí vệ sinh cho container đã vệ sinh và bàn giao
- **THEN** không tạo lệnh vệ sinh mới, container không quay lại hàng đợi vệ sinh

### Requirement: Sửa và huỷ phiếu
Hệ thống SHALL cho sửa phiếu (thông tin khách hàng, tài xế, ghi chú và thay toàn bộ hạng mục, tính lại tiền) hoặc huỷ phiếu khi phiếu chưa thu tiền và chưa huỷ; MUST từ chối với phiếu đã thu tiền hoặc đã huỷ. Mỗi lần sửa / huỷ SHALL ghi nhật ký.

#### Scenario: Sửa phiếu đã thu tiền
- **WHEN** sửa phiếu đã thanh toán
- **THEN** hệ thống từ chối

#### Scenario: Huỷ phiếu chưa thu
- **WHEN** huỷ phiếu chưa thanh toán
- **THEN** phiếu chuyển đã huỷ và nhật ký ghi SERVICE_ORDER_CANCELLED

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

### Requirement: Không lập phí lưu bãi trên phiếu dịch vụ
Phiếu dịch vụ MUST NOT có hạng mục lưu bãi chọn tay: form MUST NOT liệt kê các bậc lưu bãi, và server MUST từ chối 400 hạng mục nhóm `STORAGE` hoặc mã thuộc biểu cước lưu bãi khi lập / sửa phiếu, vì phí lưu bãi do hệ thống tính khi Gate-Out.

#### Scenario: Gửi hạng mục lưu bãi
- **WHEN** lập phiếu dịch vụ có hạng mục nhóm `STORAGE`
- **THEN** hệ thống từ chối 400, báo phí lưu bãi tính khi Gate-Out

#### Scenario: Form không còn dòng lưu bãi
- **WHEN** mở danh sách chọn hạng mục trên form phiếu dịch vụ
- **THEN** không có dòng "Lưu bãi …"
