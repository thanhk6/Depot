# container-lifecycle Specification

## Purpose

Quy định các trạng thái của hồ sơ container trong depot và điều kiện chuyển giữa chúng, để không bước nghiệp vụ nào bị bỏ qua hoặc làm sai thứ tự.

## Requirements

### Requirement: Hoàn tất giám định luôn chuyển sang vệ sinh
Khi giám định viên nộp phiếu giám định chính thức (không phải nháp), hệ thống SHALL chuyển hồ sơ sang trạng thái CLEANING và MUST từ chối phiếu không có ít nhất một dịch vụ vệ sinh.

#### Scenario: Nộp phiếu có dịch vụ vệ sinh
- **WHEN** giám định viên nộp phiếu chính thức có ít nhất 1 dịch vụ vệ sinh
- **THEN** hồ sơ chuyển sang CLEANING và một lệnh vệ sinh được tạo cho container

#### Scenario: Nộp phiếu không có dịch vụ vệ sinh
- **WHEN** giám định viên nộp phiếu chính thức không chọn dịch vụ vệ sinh nào
- **THEN** hệ thống từ chối và báo phải chọn ít nhất 01 dịch vụ vệ sinh

#### Scenario: Giám định lại container đã sẵn sàng xuất
- **WHEN** nộp phiếu giám định cho hồ sơ đang READY_FOR_OUT hoặc GATE_OUT
- **THEN** hệ thống từ chối và không thay đổi trạng thái

### Requirement: Bàn giao vệ sinh rẽ nhánh theo hư hỏng
Khi lệnh vệ sinh được bàn giao Khai thác và hồ sơ đang CLEANING, hệ thống SHALL chuyển hồ sơ sang ESTIMATING nếu phiếu giám định có hư hỏng, ngược lại sang READY_FOR_OUT.

#### Scenario: Container có hư hỏng
- **WHEN** bàn giao vệ sinh cho hồ sơ có ít nhất 1 hư hỏng trong phiếu giám định
- **THEN** hồ sơ chuyển sang ESTIMATING

#### Scenario: Container không hư hỏng
- **WHEN** bàn giao vệ sinh cho hồ sơ không có hư hỏng nào
- **THEN** hồ sơ chuyển sang READY_FOR_OUT

### Requirement: Nhánh sửa chữa đi đúng thứ tự
Hồ sơ có hư hỏng SHALL đi qua chuỗi ESTIMATING → REPAIRING (khi ghi nhận hãng tàu duyệt) → QC_PENDING (khi hoàn tất sửa) → READY_FOR_OUT (khi QC đạt); QC không đạt SHALL đưa hồ sơ về REPAIRING.

#### Scenario: Đi hết nhánh sửa chữa
- **WHEN** báo giá được duyệt, lệnh sửa hoàn tất và QC đạt
- **THEN** hồ sơ lần lượt qua REPAIRING, QC_PENDING rồi READY_FOR_OUT

#### Scenario: QC đạt nhưng còn lệnh vệ sinh chưa bàn giao
- **WHEN** QC đạt cho hồ sơ còn lệnh vệ sinh chưa bàn giao Khai thác
- **THEN** hồ sơ chuyển sang CLEANING thay vì READY_FOR_OUT

### Requirement: Đổi trạng thái thủ công không được đi đường vòng
Endpoint đổi trạng thái thủ công SHALL chỉ nhận các trạng thái trong danh sách cho phép, MUST từ chối hồ sơ đã GATE_OUT, và MUST từ chối chuyển sang READY_FOR_OUT khi hồ sơ chưa có phiếu giám định hoặc còn lệnh sửa chữa chưa QC đạt. Mỗi lần đổi SHALL ghi nhật ký kèm trạng thái cũ và mới.

#### Scenario: Ép sẵn sàng xuất khi QC chưa đạt
- **WHEN** đổi thủ công sang READY_FOR_OUT cho hồ sơ có lệnh sửa chữa chưa QC đạt
- **THEN** hệ thống từ chối

#### Scenario: Đổi trạng thái hồ sơ đã Gate-Out
- **WHEN** đổi trạng thái thủ công cho hồ sơ đang GATE_OUT
- **THEN** hệ thống từ chối và yêu cầu Gate-In hồ sơ mới

### Requirement: Gate-Out chỉ cho container sẵn sàng và đã thanh toán
Hệ thống SHALL chỉ cho Gate-Out hồ sơ đang READY_FOR_OUT, có biển số xe và tên tài xế, và MUST từ chối khi còn phiếu dịch vụ có phí (tổng > 0) chưa thu tiền.

#### Scenario: Còn nợ phiếu dịch vụ
- **WHEN** Gate-Out hồ sơ READY_FOR_OUT có phiếu dịch vụ chưa thanh toán
- **THEN** hệ thống từ chối Gate-Out

#### Scenario: Gate-Out hợp lệ
- **WHEN** Gate-Out hồ sơ READY_FOR_OUT đã thanh toán đủ, có biển số và tài xế
- **THEN** hồ sơ chuyển sang GATE_OUT và lưu thời điểm, biển số, tài xế
