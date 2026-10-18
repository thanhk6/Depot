## MODIFIED Requirements

### Requirement: Bắt đầu và phân công sửa chữa
Hệ thống SHALL chỉ tạo lệnh sửa khi báo giá đã APPROVED; mỗi hồ sơ MUST chỉ có một lệnh sửa, kể cả khi nhiều yêu cầu bắt đầu đến cùng lúc. Bắt đầu sửa SHALL yêu cầu hồ sơ đang REPAIRING, lưu kỹ thuật viên là tài khoản đang đăng nhập (MUST NOT lấy theo tên client gửi) và thời điểm bắt đầu, ghi nhật ký REPAIR_STARTED. Phân công SHALL yêu cầu tên đội và ghi nhật ký REPAIR_ASSIGNED.

#### Scenario: Bấm bắt đầu lần hai
- **WHEN** bắt đầu sửa cho hồ sơ đã có lệnh sửa
- **THEN** hệ thống từ chối và báo lệnh sửa đã được bắt đầu

#### Scenario: Hai yêu cầu bắt đầu cùng lúc
- **WHEN** hai yêu cầu bắt đầu sửa cho cùng một hồ sơ được gửi đồng thời
- **THEN** đúng một yêu cầu thành công, yêu cầu còn lại bị từ chối với thông báo lệnh sửa đã được bắt đầu (không phải lỗi hệ thống), và hồ sơ chỉ có một lệnh sửa

#### Scenario: Kỹ thuật viên lấy theo tài khoản đăng nhập
- **WHEN** thợ đăng nhập tài khoản "Trần Văn B" bắt đầu sửa và yêu cầu gửi kèm tên kỹ thuật viên "Người khác"
- **THEN** lệnh sửa và nhật ký REPAIR_STARTED ghi kỹ thuật viên là "Trần Văn B"

#### Scenario: Báo giá chưa duyệt
- **WHEN** bắt đầu hoặc phân công sửa cho hồ sơ có báo giá chưa APPROVED
- **THEN** hệ thống từ chối
