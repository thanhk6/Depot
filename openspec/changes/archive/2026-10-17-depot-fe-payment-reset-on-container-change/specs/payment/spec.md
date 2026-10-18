# Spec Delta

## MODIFIED Requirements

### Requirement: Kế toán tự tích xác nhận trước khi gạch nợ
Màn Thanh Toán SHALL có ô tích xác nhận của kế toán cho cả hai hình thức: Tiền mặt ("đã nhận đủ tiền mặt") và Chuyển khoản ("đã kiểm tra tiền về tài khoản công ty"). Nút gạch nợ MUST bị khoá cho tới khi ô tích của hình thức đang chọn được tích; đổi hình thức, đổi sang container khác hoặc thu xong SHALL bỏ tích. Đổi sang container khác SHALL xoá cả số tiền tài xế đưa đã nhập.

#### Scenario: Tiền mặt chưa tích
- **WHEN** kế toán chọn Tiền mặt cho phiếu 328.000 đ mà chưa tích ô xác nhận
- **THEN** nút gạch nợ bị khoá, chưa có khoản thu nào được ghi

#### Scenario: Chuyển khoản đã tích
- **WHEN** kế toán chọn Chuyển khoản, tích "đã kiểm tra tiền về" rồi bấm xác nhận
- **THEN** phiếu được ghi đã thanh toán bằng chuyển khoản, người thu là tài khoản đăng nhập

#### Scenario: Đổi hình thức sau khi tích
- **WHEN** kế toán tích ở tab Chuyển khoản rồi chuyển sang tab Tiền mặt
- **THEN** ô xác nhận của tab Tiền mặt chưa được tích và nút gạch nợ bị khoá

#### Scenario: Đổi container sau khi tích
- **WHEN** kế toán tích xác nhận và nhập tiền tài xế đưa cho container A rồi chọn container B trong danh sách
- **THEN** ô xác nhận của container B chưa được tích, ô tiền tài xế đưa trống và nút gạch nợ bị khoá
