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
