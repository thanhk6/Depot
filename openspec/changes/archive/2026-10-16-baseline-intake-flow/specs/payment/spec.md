# Spec Delta

## Purpose

Thu tiền phiếu dịch vụ của hồ sơ container tại quầy hoặc qua VietQR, đúng số tiền phải thu, không thu trùng, và lưu lại mọi lần thu kể cả lần bị từ chối.

## ADDED Requirements

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
