## MODIFIED Requirements

### Requirement: Đổi trạng thái thủ công không được đi đường vòng
Endpoint đổi trạng thái thủ công SHALL chỉ nhận các trạng thái trong danh sách cho phép, MUST từ chối hồ sơ đã GATE_OUT, MUST từ chối chuyển sang READY_FOR_OUT khi hồ sơ chưa có phiếu giám định hoặc còn lệnh sửa chữa chưa QC đạt, và MUST từ chối chuyển sang REPAIRING khi báo giá của hồ sơ chưa được hãng tàu duyệt (APPROVED). Mỗi lần đổi SHALL ghi nhật ký kèm trạng thái cũ và mới.

#### Scenario: Ép sẵn sàng xuất khi QC chưa đạt
- **WHEN** đổi thủ công sang READY_FOR_OUT cho hồ sơ có lệnh sửa chữa chưa QC đạt
- **THEN** hệ thống từ chối

#### Scenario: Đổi trạng thái hồ sơ đã Gate-Out
- **WHEN** đổi trạng thái thủ công cho hồ sơ đang GATE_OUT
- **THEN** hệ thống từ chối và yêu cầu Gate-In hồ sơ mới

#### Scenario: Ép sang sửa chữa khi chưa duyệt báo giá
- **WHEN** đổi thủ công sang REPAIRING cho hồ sơ ESTIMATING chưa có báo giá hoặc báo giá chưa APPROVED
- **THEN** hệ thống từ chối, báo báo giá chưa được hãng tàu duyệt, hồ sơ giữ nguyên trạng thái

#### Scenario: Đưa về sửa chữa khi báo giá đã duyệt
- **WHEN** đổi thủ công sang REPAIRING cho hồ sơ có báo giá APPROVED
- **THEN** hệ thống chấp nhận và ghi nhật ký trạng thái cũ và mới
