# shipping-line-ar Specification

## Purpose

Công nợ phải thu của hãng tàu cho sửa chữa container: ghi nợ theo số tiền hãng duyệt sau khi QC đạt, kỳ công nợ theo tháng, thu tiền và phân bổ cho từng container, huỷ thu, gắn hoá đơn và báo cáo tuổi nợ.

## Requirements

### Requirement: Ghi nợ sửa chữa sau QC đạt theo số tiền hãng duyệt
Hồ sơ chỉ được đồng bộ thành công nợ khi báo giá đã được ghi nhận hãng duyệt và lệnh sửa chữa đã QC đạt. Số tiền nợ MUST là số tiền hãng duyệt đã nhập ở bước ghi nhận duyệt (không phải tổng báo giá); mã duyệt MUST là mã duyệt / số Work Order của hãng; ngày nợ là lúc QC đạt, hạn thanh toán sau 30 ngày. Mỗi hồ sơ MUST có tối đa một khoản nợ còn hiệu lực; hồ sơ có nhiều lệnh sửa chữa hoặc báo giá MUST NOT làm lỗi.

#### Scenario: Hãng duyệt thấp hơn báo giá
- **WHEN** báo giá tổng 151.200, hãng duyệt 120.000, QC đạt, đồng bộ công nợ
- **THEN** khoản nợ là 120.000 và mã duyệt là mã hãng đã nhập

#### Scenario: Chưa QC đạt
- **WHEN** hồ sơ đã sửa xong nhưng đang chờ QC hoặc QC không đạt
- **THEN** hồ sơ không có trong danh sách chờ đồng bộ và gửi đồng bộ hồ sơ đó không tạo nợ

#### Scenario: Đồng bộ lặp
- **WHEN** đồng bộ lại hồ sơ đã có khoản nợ
- **THEN** không tạo khoản nợ thứ hai

### Requirement: Kỳ công nợ theo tháng
Mỗi hãng tàu MUST có một kỳ công nợ cho mỗi tháng lịch (giờ Việt Nam). Khoản nợ MUST vào kỳ của tháng QC đạt, khoản thu vào kỳ của tháng ngày thu; nếu kỳ đó đã khoá, khoản nợ vào kỳ tháng hiện tại. Số dư đầu kỳ MUST bằng số dư cuối kỳ trước của hãng; số dư cuối = đầu kỳ + phát sinh nợ − phát sinh thu. Chỉ khoá được kỳ cũ nhất đang mở của hãng và khi tháng đó đã kết thúc.

#### Scenario: Khoá kỳ chưa hết tháng
- **WHEN** khoá sổ kỳ tháng hiện tại
- **THEN** hệ thống từ chối và báo kỳ chưa kết thúc

#### Scenario: Số dư chuyển kỳ
- **WHEN** kỳ tháng 10 có cuối kỳ 500.000 và kỳ tháng 11 phát sinh nợ 200.000
- **THEN** kỳ tháng 11 có đầu kỳ 500.000, cuối kỳ 700.000

### Requirement: Thu tiền và phân bổ kiểm tra ở server
Khi ghi thu, hệ thống MUST từ chối 400 nếu: không có phân bổ; có phân bổ ≤ 0 hoặc vượt số nợ còn lại; khoản nợ không thuộc hãng của khoản thu, đã thu đủ hoặc đã huỷ; tổng phân bổ khác số tiền thu; ngày thu ở tương lai; hoặc kỳ của ngày thu đã khoá. Ghi thu, cập nhật nợ và kỳ MUST cùng một transaction.

#### Scenario: Phân bổ vượt nợ còn lại
- **WHEN** khoản nợ còn 120.000, phân bổ 150.000
- **THEN** hệ thống từ chối 400 và không đổi nợ

#### Scenario: Tổng phân bổ khác số thu
- **WHEN** thu 200.000 nhưng tổng phân bổ 150.000
- **THEN** hệ thống từ chối 400

#### Scenario: Khoản nợ của hãng khác
- **WHEN** khoản thu của hãng A phân bổ vào nợ của hãng B
- **THEN** hệ thống từ chối 400

### Requirement: Huỷ thu hoàn lại nợ
Huỷ một khoản thu MUST hoàn lại số đã phân bổ cho từng khoản nợ và trừ phát sinh thu của kỳ chứa khoản thu, trong một transaction; khoản thu thuộc kỳ đã khoá MUST bị từ chối. Mỗi khoản thu chỉ huỷ được một lần.

#### Scenario: Huỷ thu kỳ đang mở
- **WHEN** huỷ khoản thu 120.000 đã phân bổ cho 1 khoản nợ
- **THEN** khoản nợ còn lại tăng 120.000, phát sinh thu của kỳ giảm 120.000

#### Scenario: Huỷ thu kỳ đã khoá
- **WHEN** huỷ khoản thu thuộc kỳ đã khoá
- **THEN** hệ thống từ chối và không đổi nợ hay kỳ

### Requirement: Người thao tác và nhật ký công nợ
Người đồng bộ, ghi thu, huỷ thu, gắn hoá đơn, khoá sổ MUST là tài khoản đăng nhập; tên người thao tác do trình duyệt gửi MUST bị bỏ qua. Mỗi thao tác MUST ghi nhật ký: đồng bộ / thu / huỷ thu / hoá đơn ghi vào nhật ký hồ sơ liên quan, khoá sổ ghi nhật ký hệ thống.

#### Scenario: Gửi tên người thao tác giả
- **WHEN** ghi thu với `recordedBy` = "Kế toán AR"
- **THEN** khoản thu lưu người ghi là tài khoản đăng nhập và nhật ký hồ sơ ghi đúng người đó

### Requirement: Gắn hoá đơn cho khoản nợ
Gắn hoá đơn MUST có số hoá đơn; khoản nợ đã có hoá đơn MUST NOT bị ghi đè; một số hoá đơn chỉ dùng cho các khoản nợ cùng hãng. Màn hình MUST NOT tự điền số hoá đơn.

#### Scenario: Ghi đè hoá đơn
- **WHEN** gắn hoá đơn cho khoản nợ đã có hoá đơn
- **THEN** hệ thống từ chối và giữ số hoá đơn cũ

### Requirement: Tuổi nợ và nợ quá hạn theo ngày thật
Báo cáo tuổi nợ MUST tính theo ngày Việt Nam hiện tại, tách nhóm "Chưa đến hạn" và các nhóm quá hạn 1–30, 31–60, 61–90, trên 90 ngày. Màn hình MUST lấy nợ quá hạn từ báo cáo này, MUST NOT dùng ngày gõ cứng; bộ lọc ngày mặc định tháng hiện tại và lọc theo ngày nợ.

#### Scenario: Khoản chưa đến hạn
- **WHEN** khoản nợ còn 120.000, hạn thanh toán sau 10 ngày
- **THEN** khoản đó nằm ở nhóm "Chưa đến hạn", không tính vào nợ quá hạn
