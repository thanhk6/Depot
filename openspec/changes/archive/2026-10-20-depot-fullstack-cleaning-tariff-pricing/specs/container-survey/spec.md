## ADDED Requirements

### Requirement: Giá dịch vụ vệ sinh trên phiếu giám định do server tra
Khi lưu nháp hoặc nộp phiếu giám định, mỗi dịch vụ vệ sinh MUST thuộc biểu phí vệ sinh đang dùng; hệ thống SHALL tự tra đơn giá theo loại container của hồ sơ và tính thành tiền = số lượng × đơn giá, bỏ qua đơn giá / thành tiền trình duyệt gửi. Dịch vụ không có trong danh mục, đang tạm ngưng hoặc chưa có giá cho loại container đó MUST bị từ chối 400 nêu mã dịch vụ và loại. Lệnh vệ sinh tạo từ phiếu SHALL dùng đúng giá đã tra.

#### Scenario: Trình duyệt gửi giá khác
- **WHEN** nộp phiếu container 40HC với dịch vụ CLN_CHEMICAL đơn giá gửi lên 1 đ, biểu phí 40HC là 450.000 đ
- **THEN** phiếu và lệnh vệ sinh lưu CLN_CHEMICAL 450.000 đ

#### Scenario: Chưa có giá
- **WHEN** nộp phiếu container 45HC với dịch vụ CLN_GENERAL chưa có giá 45HC
- **THEN** hệ thống từ chối 400 "Biểu phí vệ sinh CLN_GENERAL chưa có giá cho loại 45HC" và không lưu

#### Scenario: Dịch vụ không có trong danh mục
- **WHEN** nộp phiếu có dịch vụ vệ sinh mã "CL-XYZ" không có trong biểu phí
- **THEN** hệ thống từ chối 400 nêu mã CL-XYZ

#### Scenario: Form không thêm dịch vụ chưa có giá
- **WHEN** giám định viên bấm thêm một dịch vụ vệ sinh chưa có giá cho loại container của hồ sơ
- **THEN** form báo chưa có giá và không thêm dịch vụ đó
