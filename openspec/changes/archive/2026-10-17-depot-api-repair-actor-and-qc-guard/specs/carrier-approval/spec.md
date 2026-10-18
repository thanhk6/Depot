## MODIFIED Requirements

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
