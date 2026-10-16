# carrier-approval Specification

## Purpose

Ghi nhận vào hệ thống kết quả hãng tàu duyệt hoặc từ chối báo giá sửa chữa, nhập tay theo lệnh hãng tàu gửi về, khi chưa có tích hợp API tự động.

## Requirements

### Requirement: Chỉ ghi nhận duyệt cho báo giá đã xác nhận
Hệ thống SHALL chỉ cho ghi nhận hãng tàu duyệt khi báo giá đang chờ duyệt (PENDING_APPROVAL), hồ sơ đang ESTIMATING và báo giá đã được xác nhận; MUST từ chối báo giá chưa xác nhận.

#### Scenario: Báo giá chưa xác nhận
- **WHEN** ghi nhận duyệt cho báo giá chưa bấm "Xác nhận báo giá"
- **THEN** hệ thống từ chối và báo người báo giá phải xác nhận trước

#### Scenario: Báo giá đã xác nhận
- **WHEN** ghi nhận duyệt cho báo giá đã xác nhận, hồ sơ đang ESTIMATING
- **THEN** báo giá chuyển APPROVED và hồ sơ chuyển REPAIRING

### Requirement: Thông tin lệnh duyệt nhập tay
Khi ghi nhận duyệt, hệ thống SHALL lưu số Work Order hãng tàu, mã duyệt, tên người duyệt phía hãng tàu, số tiền duyệt, kênh duyệt, ghi chú và ngày duyệt; người ghi nhận SHALL là nhân viên depot đang đăng nhập, lưu tách biệt với người duyệt phía hãng tàu.

#### Scenario: Không nhập số tiền duyệt
- **WHEN** ghi nhận duyệt không nhập số tiền duyệt
- **THEN** số tiền duyệt lấy bằng tổng báo giá

#### Scenario: Ghi nhật ký duyệt
- **WHEN** ghi nhận duyệt thành công
- **THEN** nhật ký ESTIMATE_APPROVED ghi số WO, mã duyệt, người duyệt, số tiền, kênh (nếu có) và người ghi nhận

### Requirement: Kiểm tra dữ liệu lệnh duyệt
Hệ thống MUST từ chối số tiền duyệt âm và ngày duyệt ở tương lai.

#### Scenario: Số tiền duyệt âm
- **WHEN** ghi nhận duyệt với số tiền âm
- **THEN** hệ thống từ chối

#### Scenario: Ngày duyệt ở tương lai
- **WHEN** ghi nhận duyệt với ngày duyệt sau thời điểm hiện tại
- **THEN** hệ thống từ chối

### Requirement: Hãng tàu từ chối báo giá
Hệ thống SHALL cho ghi nhận hãng tàu từ chối báo giá đang chờ duyệt, MUST yêu cầu lý do, chuyển báo giá sang REJECTED, đưa hồ sơ về ESTIMATING và ghi nhật ký ESTIMATE_REJECTED kèm lý do. Sau đó báo giá SHALL sửa và lưu lại được để chờ duyệt lại.

#### Scenario: Từ chối không có lý do
- **WHEN** ghi nhận từ chối mà không nhập lý do
- **THEN** hệ thống từ chối thao tác

#### Scenario: Sửa sau khi bị từ chối
- **WHEN** báo giá REJECTED được sửa và lưu lại
- **THEN** báo giá trở về chờ duyệt và phải xác nhận lại
