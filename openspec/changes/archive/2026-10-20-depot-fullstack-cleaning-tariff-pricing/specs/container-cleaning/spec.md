## ADDED Requirements

### Requirement: Giá lệnh vệ sinh thủ công do server tra
Khi tạo lệnh vệ sinh thủ công, mỗi hạng mục MUST thuộc biểu phí vệ sinh đang dùng; hệ thống SHALL tự tra đơn giá theo loại container của hồ sơ, bỏ qua đơn giá trình duyệt gửi. Hạng mục không có trong danh mục, tạm ngưng hoặc chưa có giá cho loại container MUST bị từ chối 400 nêu mã và loại.

#### Scenario: Giá theo biểu phí
- **WHEN** tạo lệnh vệ sinh thủ công cho container 40GP với CLN_CHEMICAL đơn giá gửi lên 0 đ, biểu phí 40GP là 420.000 đ
- **THEN** lệnh vệ sinh lưu CLN_CHEMICAL 420.000 đ và tổng chi phí 420.000 đ

#### Scenario: Chưa có giá
- **WHEN** tạo lệnh vệ sinh thủ công với dịch vụ chưa có giá cho loại container của hồ sơ
- **THEN** hệ thống từ chối 400 và không tạo lệnh
