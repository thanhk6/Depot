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
Hệ thống MUST từ chối số tiền duyệt âm, số tiền duyệt lớn hơn tổng báo giá (do server tính), và ngày duyệt ở tương lai.

#### Scenario: Số tiền duyệt âm
- **WHEN** ghi nhận duyệt với số tiền âm
- **THEN** hệ thống từ chối

#### Scenario: Số tiền duyệt vượt tổng báo giá
- **WHEN** ghi nhận duyệt số tiền 999.999.999 cho báo giá có tổng 151.200
- **THEN** hệ thống từ chối và nêu tổng báo giá; báo giá vẫn chờ duyệt

#### Scenario: Số tiền duyệt bằng hoặc thấp hơn tổng
- **WHEN** ghi nhận duyệt số tiền 120.000 cho báo giá có tổng 151.200
- **THEN** hệ thống chấp nhận và lưu số tiền duyệt 120.000

#### Scenario: Ngày duyệt ở tương lai
- **WHEN** ghi nhận duyệt với ngày duyệt sau thời điểm hiện tại
- **THEN** hệ thống từ chối

### Requirement: Hãng tàu từ chối báo giá
Hệ thống SHALL cho ghi nhận hãng tàu từ chối báo giá đang chờ duyệt, MUST yêu cầu lý do, chuyển báo giá sang REJECTED, đưa hồ sơ về ESTIMATING và ghi nhật ký ESTIMATE_REJECTED kèm lý do. Người ghi nhận từ chối SHALL là nhân viên depot đang đăng nhập; thông tin người / mã từ chối phía hãng tàu do người dùng nhập SHALL lưu tách riêng. Sau đó báo giá SHALL sửa và lưu lại được để chờ duyệt lại.

#### Scenario: Từ chối không có lý do
- **WHEN** ghi nhận từ chối mà không nhập lý do
- **THEN** hệ thống từ chối thao tác

#### Scenario: Người ghi nhận từ chối
- **WHEN** nhân viên đăng nhập tài khoản "Phạm Văn D" ghi nhận từ chối, nhập thông tin phía hãng tàu là "MSK-REJ-01"
- **THEN** báo giá lưu người ghi nhận là "Phạm Văn D", thông tin phía hãng tàu "MSK-REJ-01" lưu riêng, nhật ký ghi cả hai cùng lý do

#### Scenario: Sửa sau khi bị từ chối
- **WHEN** báo giá REJECTED được sửa và lưu lại
- **THEN** báo giá trở về chờ duyệt và phải xác nhận lại

### Requirement: Quyền ghi nhận duyệt tách khỏi quyền lập báo giá
Ghi nhận hãng tàu duyệt và ghi nhận hãng tàu từ chối SHALL yêu cầu quyền "Ghi nhận duyệt" riêng, cấp cho quản lý (ADMIN), đại diện hãng tàu (CARRIER), thu ngân / kế toán (CASHIER) và giám sát (SUPERVISOR). Người lập báo giá (ESTIMATOR) MUST NOT có quyền này. Menu *Phê Duyệt Hãng Tàu* SHALL chỉ hiện với tài khoản có quyền này.

#### Scenario: Người lập báo giá tự ghi nhận duyệt
- **WHEN** tài khoản ESTIMATOR gửi ghi nhận duyệt hoặc từ chối cho báo giá đã xác nhận
- **THEN** hệ thống từ chối vì không có quyền, báo giá và hồ sơ không đổi

#### Scenario: Vai trò có quyền ghi nhận duyệt
- **WHEN** tài khoản CARRIER, CASHIER hoặc SUPERVISOR ghi nhận duyệt báo giá đã xác nhận, hồ sơ đang ESTIMATING
- **THEN** báo giá chuyển APPROVED và hồ sơ chuyển REPAIRING

#### Scenario: Menu Phê duyệt theo quyền
- **WHEN** tài khoản ESTIMATOR đăng nhập
- **THEN** menu *Phê Duyệt Hãng Tàu* không hiện, còn menu lập báo giá vẫn hiện

### Requirement: Chỉ ghi nhận từ chối cho báo giá đã xác nhận
Hệ thống MUST từ chối ghi nhận hãng tàu từ chối cho báo giá chưa được người báo giá xác nhận, giống điều kiện của ghi nhận duyệt, và báo rõ phải xác nhận báo giá trước.

#### Scenario: Từ chối báo giá chưa xác nhận
- **WHEN** ghi nhận từ chối (có lý do) cho báo giá đang chờ duyệt nhưng chưa bấm "Xác nhận báo giá"
- **THEN** hệ thống từ chối thao tác, báo phải xác nhận báo giá trước; báo giá vẫn chờ duyệt

#### Scenario: Từ chối báo giá đã xác nhận
- **WHEN** ghi nhận từ chối có lý do cho báo giá đã xác nhận
- **THEN** báo giá chuyển REJECTED và hồ sơ về ESTIMATING
