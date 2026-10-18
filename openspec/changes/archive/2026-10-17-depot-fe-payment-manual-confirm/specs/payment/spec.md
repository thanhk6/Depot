# Spec Delta

## ADDED Requirements

### Requirement: Kế toán tự tích xác nhận trước khi gạch nợ
Màn Thanh Toán SHALL có ô tích xác nhận của kế toán cho cả hai hình thức: Tiền mặt ("đã nhận đủ tiền mặt") và Chuyển khoản ("đã kiểm tra tiền về tài khoản công ty"). Nút gạch nợ MUST bị khoá cho tới khi ô tích của hình thức đang chọn được tích; đổi hình thức hoặc thu xong SHALL bỏ tích.

#### Scenario: Tiền mặt chưa tích
- **WHEN** kế toán chọn Tiền mặt cho phiếu 328.000 đ mà chưa tích ô xác nhận
- **THEN** nút gạch nợ bị khoá, chưa có khoản thu nào được ghi

#### Scenario: Chuyển khoản đã tích
- **WHEN** kế toán chọn Chuyển khoản, tích "đã kiểm tra tiền về" rồi bấm xác nhận
- **THEN** phiếu được ghi đã thanh toán bằng chuyển khoản, người thu là tài khoản đăng nhập

#### Scenario: Đổi hình thức sau khi tích
- **WHEN** kế toán tích ở tab Chuyển khoản rồi chuyển sang tab Tiền mặt
- **THEN** ô xác nhận của tab Tiền mặt chưa được tích và nút gạch nợ bị khoá

### Requirement: Mã QR chỉ hiện khi đã khai báo tài khoản nhận tiền
Tab Chuyển khoản SHALL luôn hiện số tiền phải thu và nội dung chuyển khoản. Mã QR VietQR (kèm ngân hàng, số tài khoản, tên tài khoản) SHALL chỉ hiện khi danh mục đã khai báo tài khoản nhận tiền; chưa khai báo thì MUST NOT hiện mã QR hay thông báo lỗi cấu hình, và kế toán vẫn xác nhận được.

#### Scenario: Chưa khai báo tài khoản
- **WHEN** danh mục chưa có tài khoản nhận tiền và kế toán mở tab Chuyển khoản
- **THEN** màn hình hiện số tiền và nội dung chuyển khoản, không có mã QR, không có thông báo "chưa cấu hình"

#### Scenario: Đã khai báo tài khoản
- **WHEN** danh mục có tài khoản nhận tiền và kế toán mở tab Chuyển khoản
- **THEN** màn hình hiện mã QR VietQR có sẵn số tiền và nội dung chuyển khoản
