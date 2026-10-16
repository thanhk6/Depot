# Spec Delta

## Purpose

Giám định container sau Gate-In: một giám định viên nhận phiếu, ghi hạng, hư hỏng, dịch vụ vệ sinh, checklist và ảnh, lưu nháp hoặc nộp chính thức để chuyển container sang Tổ Vệ Sinh.

## ADDED Requirements

### Requirement: Nhận phiếu giám định có khoá
Giám định viên SHALL nhận được container đang SURVEYING để khoá lại cho riêng mình; hệ thống MUST từ chối khi người khác đang giữ khoá chưa quá 30 phút, và hai người nhận đồng thời MUST chỉ một người thành công. Mỗi lần nhận SHALL ghi nhật ký SURVEY_CLAIMED.

#### Scenario: Người khác đang giữ
- **WHEN** giám định viên B nhận container mà A vừa nhận cách đây 10 phút
- **THEN** hệ thống từ chối và báo container đang được A giám định

#### Scenario: Màn Giám định hiện người đang giữ
- **WHEN** giám định viên khác mở danh sách giám định có container đang bị giữ khoá
- **THEN** thẻ container hiện tên người đang giám định và nút mở phiếu bị khoá

#### Scenario: Khoá quá hạn
- **WHEN** giám định viên B nhận container mà A nhận đã quá 30 phút chưa nộp
- **THEN** B nhận được và khoá chuyển sang B

#### Scenario: Container không còn chờ giám định
- **WHEN** nhận phiếu cho container không ở SURVEYING
- **THEN** hệ thống từ chối

### Requirement: Bỏ nhận phiếu
Chỉ người đang giữ khoá SHALL bỏ nhận được phiếu; bỏ nhận SHALL xoá khoá để người khác nhận.

#### Scenario: Người khác bỏ nhận hộ
- **WHEN** giám định viên không giữ khoá bấm bỏ nhận
- **THEN** hệ thống từ chối và khoá giữ nguyên

### Requirement: Kiểm tra nội dung phiếu
Hệ thống MUST từ chối phiếu có hạng container khác A, B, C, D; hư hỏng có số lượng ≤ 0 hoặc giờ công / đơn giá công / vật tư âm; và từ chối giám định cho hồ sơ đang READY_FOR_OUT hoặc GATE_OUT. Giám định viên SHALL là tài khoản đang đăng nhập.

#### Scenario: Hạng không hợp lệ
- **WHEN** nộp phiếu với hạng "E"
- **THEN** hệ thống từ chối và báo chỉ nhận A, B, C hoặc D

#### Scenario: Hư hỏng số lượng 0
- **WHEN** nộp phiếu có hư hỏng số lượng 0
- **THEN** hệ thống từ chối

### Requirement: Lưu nháp không đổi trạng thái
Lưu nháp SHALL lưu toàn bộ nội dung phiếu (thay thế bản trước) nhưng MUST giữ hồ sơ ở SURVEYING và giữ khoá của giám định viên; SHALL ghi nhật ký SURVEY_DRAFT_SAVED. Số phiếu giám định SHALL do hệ thống sinh một lần khi tạo và không đổi khi lưu lại.

#### Scenario: Lưu nháp rồi mở lại
- **WHEN** giám định viên lưu nháp 2 lần
- **THEN** chỉ có một phiếu với nội dung lần lưu sau, cùng số phiếu, hồ sơ vẫn SURVEYING

### Requirement: Nộp phiếu chính thức
Nộp phiếu chính thức MUST có ít nhất một dịch vụ vệ sinh; SHALL chuyển hồ sơ sang CLEANING, giải phóng khoá nhận phiếu và ghi nhật ký SURVEY_SUBMITTED kèm hạng và số hư hỏng.

#### Scenario: Nộp thành công
- **WHEN** nộp phiếu chính thức có 2 hư hỏng và 1 dịch vụ vệ sinh
- **THEN** hồ sơ chuyển CLEANING, khoá được giải phóng, nhật ký ghi hạng và 2 hư hỏng

### Requirement: Tự sinh lệnh vệ sinh từ phiếu giám định
Khi nộp phiếu chính thức và hồ sơ chưa có lệnh vệ sinh đang hoạt động, hệ thống SHALL tạo lệnh vệ sinh chờ thực hiện gồm đúng các dịch vụ vệ sinh đã chọn, kèm loại container theo danh mục, hãng tàu, số e-EIR nhập, lý do / ghi chú vệ sinh và ảnh toàn cảnh làm ảnh trước vệ sinh. Nộp lại phiếu MUST NOT tạo lệnh trùng.

#### Scenario: Nộp lại phiếu
- **WHEN** hồ sơ đã có lệnh vệ sinh chưa bàn giao và phiếu được nộp lại
- **THEN** không tạo thêm lệnh vệ sinh mới

#### Scenario: Thông tin chuyển sang Tổ Vệ Sinh
- **WHEN** nộp phiếu có lý do vệ sinh "dầu mỡ" và ảnh toàn cảnh
- **THEN** lệnh vệ sinh ghi lý do đó trong ghi chú và dùng ảnh toàn cảnh làm ảnh trước vệ sinh
