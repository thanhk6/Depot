# repair-work-order Specification

## Purpose

Quản lý lệnh sửa chữa cho container đã được hãng tàu duyệt báo giá: hiện đúng container cần sửa, giao việc theo hạng mục đã duyệt, và chuyển sang QC khi sửa xong.

## Requirements

### Requirement: Màn Sửa chữa chỉ hiện container đã được duyệt
Danh sách lệnh sửa chữa SHALL chỉ gồm hồ sơ đang REPAIRING hoặc QC_PENDING; container còn ở bước báo giá (ESTIMATING) MUST NOT xuất hiện.

#### Scenario: Container đang báo giá
- **WHEN** container đang ESTIMATING, báo giá chưa được hãng tàu duyệt
- **THEN** container không hiện ở màn Sửa chữa

#### Scenario: Container vừa được duyệt
- **WHEN** báo giá của container được ghi nhận duyệt
- **THEN** container hiện ở màn Sửa chữa với trạng thái chờ bắt đầu

### Requirement: Hạng mục sửa lấy từ báo giá đã duyệt
Hạng mục công việc của lệnh sửa SHALL lấy từ các dòng của báo giá đã APPROVED, kèm số báo giá và tổng giờ công dự kiến.

#### Scenario: Mở lệnh sửa
- **WHEN** mở lệnh sửa của container có báo giá đã duyệt
- **THEN** danh sách hạng mục đúng bằng các dòng báo giá đã duyệt

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

### Requirement: Kỹ sư QC không thao tác thay thợ trên lệnh sửa
Bắt đầu, phân công và hoàn tất lệnh sửa SHALL yêu cầu quyền sửa chữa, cấp cho quản lý (ADMIN) và thợ sửa chữa (TECHNICIAN). Kỹ sư QC (QC_ENG) MUST NOT bắt đầu, phân công hay hoàn tất lệnh sửa, nhưng SHALL vẫn xem và chụp được ảnh của lệnh sửa để nghiệm thu.

#### Scenario: Kỹ sư QC hoàn tất lệnh sửa
- **WHEN** tài khoản QC_ENG gửi hoàn tất sửa cho hồ sơ đang REPAIRING
- **THEN** hệ thống từ chối vì không có quyền, hồ sơ vẫn REPAIRING

#### Scenario: Kỹ sư QC chụp ảnh lệnh sửa
- **WHEN** tài khoản QC_ENG chụp ảnh cho lệnh sửa đang REPAIRING
- **THEN** ảnh được lưu như bình thường

#### Scenario: Menu Lệnh sửa chữa
- **WHEN** tài khoản QC_ENG đăng nhập
- **THEN** menu *Lệnh Sửa Chữa* không hiện, menu *QC Nghiệm Thu* vẫn hiện
