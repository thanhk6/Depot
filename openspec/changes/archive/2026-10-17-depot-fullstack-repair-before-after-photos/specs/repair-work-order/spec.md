# Spec Delta

## ADDED Requirements

### Requirement: Chụp ảnh trước sửa theo hạng mục
Khi lệnh sửa đã bắt đầu và hồ sơ đang REPAIRING, thợ SHALL chụp hoặc chọn được ảnh **trước sửa** cho từng hạng mục; mỗi ảnh SHALL được lưu thật lên máy chủ ngay khi chụp, gắn với lệnh sửa và số hạng mục, và xoá được nếu chụp nhầm. Ảnh hư hỏng của phiếu giám định MUST NOT được tính là ảnh trước sửa.

#### Scenario: Chụp ảnh trước sửa
- **WHEN** thợ chụp 2 ảnh trước sửa cho hạng mục #1 của lệnh sửa đang REPAIRING
- **THEN** hạng mục #1 hiện 2 ảnh trước sửa và vẫn còn sau khi tải lại trang

#### Scenario: Chưa bắt đầu lệnh sửa
- **WHEN** gửi ảnh trước sửa cho hồ sơ chưa bấm bắt đầu lệnh sửa
- **THEN** hệ thống từ chối và báo phải bắt đầu lệnh sửa trước

#### Scenario: Hạng mục chỉ có ảnh giám định
- **WHEN** hạng mục chưa có ảnh trước sửa nào do thợ chụp, chỉ có ảnh hư hỏng lúc giám định
- **THEN** hạng mục vẫn được coi là thiếu ảnh trước sửa

### Requirement: Ảnh trước sửa là điều kiện của ảnh sau sửa
Màn Sửa chữa MUST khoá nút chụp ảnh sau sửa và nút hoàn thành hạng mục cho tới khi hạng mục có ít nhất 1 ảnh trước sửa. Hoàn thành hạng mục SHALL tiếp tục yêu cầu ít nhất 1 ảnh sau sửa.

#### Scenario: Chưa có ảnh trước sửa
- **WHEN** thợ mở hạng mục chưa có ảnh trước sửa
- **THEN** nút chụp ảnh sau sửa và nút hoàn thành hạng mục bị khoá, kèm nhắc chụp ảnh trước sửa

#### Scenario: Đủ ảnh trước và sau
- **WHEN** hạng mục có 1 ảnh trước sửa và 1 ảnh sau sửa
- **THEN** thợ hoàn thành được hạng mục

## MODIFIED Requirements

### Requirement: Hoàn tất sửa chuyển QC
Hoàn tất sửa SHALL yêu cầu hồ sơ đang REPAIRING và đã có lệnh sửa; hệ thống MUST từ chối khi còn hạng mục (theo các dòng của báo giá đã duyệt) chưa có ít nhất 1 ảnh trước sửa và 1 ảnh sau sửa đã lưu thật, và báo rõ các hạng mục còn thiếu. Khi đủ ảnh, hệ thống SHALL lưu thời điểm hoàn tất, ghi số ảnh trước sửa và sau sửa theo ảnh đã lưu thật, đặt lệnh sửa chờ QC, chuyển hồ sơ sang QC_PENDING và ghi nhật ký REPAIR_COMPLETED.

#### Scenario: Hoàn tất có ảnh
- **WHEN** kỹ thuật viên hoàn tất sửa lệnh có 2 hạng mục, mỗi hạng mục đã có ảnh trước sửa và ảnh sau sửa (tổng 2 ảnh trước, 3 ảnh sau)
- **THEN** hồ sơ chuyển QC_PENDING và lệnh sửa ghi đã đính kèm 2 ảnh trước sửa, 3 ảnh sau sửa

#### Scenario: Thiếu ảnh trước sửa
- **WHEN** hoàn tất sửa khi hạng mục #2 chưa có ảnh trước sửa
- **THEN** hệ thống từ chối, báo hạng mục #2 thiếu ảnh trước sửa, hồ sơ vẫn REPAIRING

#### Scenario: Thiếu ảnh sau sửa
- **WHEN** hoàn tất sửa khi hạng mục #1 có ảnh trước sửa nhưng chưa có ảnh sau sửa
- **THEN** hệ thống từ chối, báo hạng mục #1 thiếu ảnh sau sửa

#### Scenario: Hoàn tất khi chưa bắt đầu
- **WHEN** hoàn tất sửa cho hồ sơ chưa có lệnh sửa
- **THEN** hệ thống từ chối
