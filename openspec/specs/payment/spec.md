# payment Specification

## Purpose

Thu tiền phiếu dịch vụ của hồ sơ container tại quầy hoặc qua VietQR, đúng số tiền phải thu, không thu trùng, và lưu lại mọi lần thu kể cả lần bị từ chối.

## Requirements

### Requirement: Thu tại quầy chỉ tiền mặt hoặc chuyển khoản
Thu tại quầy SHALL chỉ nhận hình thức tiền mặt hoặc chuyển khoản; MUST từ chối khi hồ sơ không có phiếu dịch vụ (chưa huỷ), phiếu đã thanh toán, hoặc số tiền khác đúng tổng phiếu.

#### Scenario: Thu thiếu tiền
- **WHEN** thu 300.000 đ cho phiếu tổng 328.000 đ
- **THEN** hệ thống từ chối và báo số tiền không khớp tổng phiếu

#### Scenario: Hình thức khác
- **WHEN** thu tại quầy với hình thức VietQR
- **THEN** hệ thống từ chối

### Requirement: Tiền mặt và tiền thối
Khi thu tiền mặt có nhập tiền khách đưa, hệ thống MUST từ chối nếu tiền khách đưa nhỏ hơn tổng phiếu, và SHALL ghi số tiền trả lại.

#### Scenario: Khách đưa dư
- **WHEN** thu tiền mặt phiếu 328.000 đ, khách đưa 500.000 đ
- **THEN** thu thành công và ghi trả lại 172.000 đ

### Requirement: Chuyển khoản tại quầy
Mã giao dịch ngân hàng SHALL là tuỳ chọn (tối đa 100 ký tự); khi có nhập, hệ thống MUST từ chối mã đã dùng cho khoản thu khác; khi không nhập, hệ thống SHALL tự sinh mã phiếu thu chuyển khoản.

#### Scenario: Mã giao dịch trùng
- **WHEN** xác nhận chuyển khoản với mã giao dịch đã dùng cho phiếu khác
- **THEN** hệ thống từ chối

### Requirement: Không thu trùng
Hai lần thu đồng thời cho cùng phiếu MUST chỉ một lần thành công; lần còn lại báo phiếu vừa được thanh toán ở nơi khác.

#### Scenario: Bấm thu hai lần
- **WHEN** thu ngân bấm thu hai lần liên tiếp cho cùng phiếu
- **THEN** chỉ một khoản thu được ghi nhận

### Requirement: Kết quả thu tiền
Thu thành công SHALL đánh dấu phiếu đã thanh toán (hình thức, mã giao dịch, thời điểm), tạo hoặc cập nhật biên lai có số hoá đơn, tiền trước thuế, VAT và tổng, người thu là tài khoản đăng nhập, ghi nhật ký PAYMENT_RECEIVED, và MUST NOT đổi trạng thái vòng đời của hồ sơ.

#### Scenario: Thu tiền container đang chờ báo giá
- **WHEN** thu tiền phiếu của hồ sơ đang ESTIMATING
- **THEN** phiếu đã thanh toán, hồ sơ vẫn ESTIMATING

### Requirement: VietQR qua webhook ngân hàng
Webhook ngân hàng SHALL khớp hồ sơ theo số hồ sơ hoặc số container trong nội dung chuyển khoản; MUST từ chối khi không khớp hồ sơ nào, số tiền ≤ 0, hoặc số tiền khác tổng phiếu dịch vụ. Gọi lại cùng mã giao dịch đã ghi nhận SHALL trả thành công mà không ghi trùng; hồ sơ đã thanh toán bằng giao dịch khác MUST bị từ chối.

#### Scenario: Ngân hàng gọi lại
- **WHEN** webhook gửi lại đúng mã giao dịch đã ghi nhận
- **THEN** trả thành công, không tạo khoản thu thứ hai

#### Scenario: Nội dung không khớp
- **WHEN** nội dung chuyển khoản không chứa số hồ sơ hay số container nào
- **THEN** hệ thống từ chối và ghi nhật ký thu tiền bị từ chối

### Requirement: Nhật ký mọi lần thu
Mọi lần thu (tại quầy hoặc webhook), thành công hay bị từ chối, SHALL ghi một dòng nhật ký thu tiền gồm hình thức, số tiền, tổng phiếu, mã giao dịch, người thu, kết quả và lý do; danh sách nhật ký SHALL lọc được theo thời gian, hình thức, kết quả và từ khoá.

#### Scenario: Thu bị từ chối vẫn có nhật ký
- **WHEN** thu tại quầy bị từ chối vì sai số tiền
- **THEN** có dòng nhật ký kết quả "bị từ chối" kèm lý do

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

### Requirement: Mã QR chỉ hiện khi đã khai báo tài khoản nhận tiền
Tab Chuyển khoản SHALL luôn hiện số tiền phải thu và nội dung chuyển khoản. Mã QR VietQR (kèm ngân hàng, số tài khoản, tên tài khoản) SHALL chỉ hiện khi danh mục đã khai báo tài khoản nhận tiền; chưa khai báo thì MUST NOT hiện mã QR hay thông báo lỗi cấu hình, và kế toán vẫn xác nhận được.

#### Scenario: Chưa khai báo tài khoản
- **WHEN** danh mục chưa có tài khoản nhận tiền và kế toán mở tab Chuyển khoản
- **THEN** màn hình hiện số tiền và nội dung chuyển khoản, không có mã QR, không có thông báo "chưa cấu hình"

#### Scenario: Đã khai báo tài khoản
- **WHEN** danh mục có tài khoản nhận tiền và kế toán mở tab Chuyển khoản
- **THEN** màn hình hiện mã QR VietQR có sẵn số tiền và nội dung chuyển khoản
