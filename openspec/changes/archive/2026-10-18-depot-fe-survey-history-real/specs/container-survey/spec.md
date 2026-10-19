## ADDED Requirements

### Requirement: Lịch sử giám định chỉ gồm phiếu đã nộp, dữ liệu thật
Tab Lịch sử Giám định SHALL liệt kê mọi phiếu giám định đã nộp chính thức của mọi hồ sơ, kể cả hồ sơ đã chuyển sang vệ sinh, sửa chữa, QC hay đã ra cổng; phiếu nháp và container chưa giám định MUST NOT xuất hiện. Số phiếu, ngày giám định, người giám định, tình trạng, số hư hỏng SHALL lấy từ phiếu đã lưu, không dùng giá trị tạm; mỗi dòng SHALL hiện trạng thái hiện tại của hồ sơ. Bảng MUST NOT có thao tác nộp lại phiếu.

#### Scenario: Phiếu đã nộp, hồ sơ đã sang bước sau
- **WHEN** container đã nộp phiếu giám định và hồ sơ đang sửa chữa
- **THEN** phiếu hiện trong lịch sử với đúng số phiếu, ngày, người giám định và trạng thái hồ sơ "đang sửa chữa"

#### Scenario: Container chưa giám định
- **WHEN** container vừa Gate-In, đang chờ giám định, chưa nộp phiếu
- **THEN** container không có trong lịch sử giám định

#### Scenario: Phiếu nháp
- **WHEN** giám định viên mới lưu nháp phiếu, hồ sơ vẫn đang chờ giám định
- **THEN** phiếu nháp không có trong lịch sử giám định

#### Scenario: Không còn nút chuyển khai thác
- **WHEN** mở tab Lịch sử Giám định
- **THEN** các dòng không có nút nộp lại phiếu hay chuyển khai thác; xem chi tiết và e-EIR vẫn mở được

#### Scenario: Chưa có phiếu nào
- **WHEN** chưa có phiếu giám định nào được nộp
- **THEN** bảng hiện dòng báo chưa có phiếu giám định đã nộp

### Requirement: Lọc và xuất lịch sử giám định
Bộ lọc Từ ngày / Đến ngày SHALL lọc theo ngày giám định (giờ Việt Nam, tính cả hai đầu), kết hợp với tìm kiếm, hãng tàu và tình trạng. Nút xuất SHALL tải một file CSV thật (UTF-8 có BOM) gồm đúng mọi dòng đang khớp bộ lọc, không chỉ trang đang xem; không có dòng nào thì MUST báo không có dữ liệu để xuất thay vì báo đã xuất.

#### Scenario: Lọc theo ngày
- **WHEN** chọn Từ ngày 17/10/2026 Đến ngày 17/10/2026 khi có phiếu giám định ngày 17/10 và ngày 18/10
- **THEN** chỉ phiếu ngày 17/10 hiện ra

#### Scenario: Xuất CSV theo bộ lọc
- **WHEN** lọc còn 3 phiếu rồi bấm xuất
- **THEN** trình duyệt tải file CSV có dòng tiêu đề và đúng 3 dòng phiếu đó, mở bằng Excel đọc đúng tiếng Việt

#### Scenario: Xuất khi không có dữ liệu
- **WHEN** bộ lọc không khớp phiếu nào và bấm xuất
- **THEN** không tải file, hiện thông báo không có dữ liệu để xuất
