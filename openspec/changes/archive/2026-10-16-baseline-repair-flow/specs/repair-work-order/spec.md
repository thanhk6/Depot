# Spec Delta

## Purpose

Quản lý lệnh sửa chữa cho container đã được hãng tàu duyệt báo giá: hiện đúng container cần sửa, giao việc theo hạng mục đã duyệt, và chuyển sang QC khi sửa xong.

## ADDED Requirements

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
Hệ thống SHALL chỉ tạo lệnh sửa khi báo giá đã APPROVED; mỗi hồ sơ MUST chỉ có một lệnh sửa. Bắt đầu sửa SHALL yêu cầu hồ sơ đang REPAIRING, lưu kỹ thuật viên và thời điểm bắt đầu, ghi nhật ký REPAIR_STARTED. Phân công SHALL yêu cầu tên đội và ghi nhật ký REPAIR_ASSIGNED.

#### Scenario: Bấm bắt đầu lần hai
- **WHEN** bắt đầu sửa cho hồ sơ đã có lệnh sửa
- **THEN** hệ thống từ chối và báo lệnh sửa đã được bắt đầu

#### Scenario: Báo giá chưa duyệt
- **WHEN** bắt đầu hoặc phân công sửa cho hồ sơ có báo giá chưa APPROVED
- **THEN** hệ thống từ chối

### Requirement: Hoàn tất sửa chuyển QC
Hoàn tất sửa SHALL yêu cầu hồ sơ đang REPAIRING và đã có lệnh sửa; hệ thống SHALL lưu thời điểm hoàn tất, ghi số ảnh sau sửa theo ảnh đã lưu thật, đặt lệnh sửa chờ QC, chuyển hồ sơ sang QC_PENDING và ghi nhật ký REPAIR_COMPLETED.

#### Scenario: Hoàn tất có ảnh
- **WHEN** kỹ thuật viên hoàn tất sửa sau khi đã chụp 3 ảnh sau sửa
- **THEN** hồ sơ chuyển QC_PENDING và lệnh sửa ghi đã đính kèm 3 ảnh

#### Scenario: Hoàn tất khi chưa bắt đầu
- **WHEN** hoàn tất sửa cho hồ sơ chưa có lệnh sửa
- **THEN** hệ thống từ chối
