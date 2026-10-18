## ADDED Requirements

### Requirement: Gate-In bắt buộc có đơn vị vận tải
Gate-In từ màn Gate-In MUST có đơn vị vận tải / nhà xe theo một trong hai dạng: mã một khách hàng đang hoạt động, hoặc vãng lai (`VANG_LAI`) kèm tên; backend MUST chặn khi thiếu. Gate-In từ màn Giám định hoặc cổng khách hàng được để trống. Với mọi nơi gọi, nhà xe có gửi mà không hợp lệ (mã không tồn tại / không hoạt động, vãng lai thiếu tên) MUST bị từ chối. Tên nhà xe có mã SHALL lấy từ danh mục, không theo tên client gửi.

#### Scenario: Không chọn nhà xe ở màn Gate-In
- **WHEN** Gate-In từ màn Gate-In không có đơn vị vận tải
- **THEN** hệ thống từ chối, báo phải chọn đơn vị vận tải / nhà xe, không tạo hồ sơ

#### Scenario: Tạo hồ sơ từ màn Giám định không có nhà xe
- **WHEN** màn Giám định tạo hồ sơ Gate-In mới không gửi đơn vị vận tải
- **THEN** hồ sơ được tạo bình thường, nhà xe để trống

#### Scenario: Chọn nhà xe đã có
- **WHEN** Gate-In với nhà xe CUST-XYZ02 (XYZ Transport, đang hoạt động)
- **THEN** hồ sơ lưu mã CUST-XYZ02 và tên XYZ Transport

#### Scenario: Mã nhà xe đã xoá
- **WHEN** Gate-In với mã một khách hàng đã xoá
- **THEN** hệ thống từ chối, báo nhà xe không tồn tại hoặc đã ngưng

#### Scenario: Nhà xe vãng lai
- **WHEN** Gate-In chọn "Khác (vãng lai)" với tên "Xe anh Tư Bình Dương"
- **THEN** hồ sơ lưu mã VANG_LAI và tên "Xe anh Tư Bình Dương", không có khách hàng mới nào được tạo

#### Scenario: Vãng lai không ghi tên
- **WHEN** Gate-In chọn "Khác (vãng lai)" nhưng để trống tên
- **THEN** hệ thống từ chối, báo phải nhập tên nhà xe vãng lai

### Requirement: Thêm nhanh nhà xe tại cổng
Nhân viên có quyền Gate-In SHALL thêm được nhà xe mới ngay trên màn Gate-In chỉ với tên (bắt buộc), số điện thoại và mã số thuế (tuỳ chọn). Hệ thống SHALL tạo khách hàng loại TRUCKING, đang hoạt động, mã tự sinh dạng NX-0001 tăng dần, ghi chú tạo tại cổng kèm người tạo, và trả về để màn hình chọn luôn. Không cần quyền quản trị danh mục.

#### Scenario: Thêm nhà xe mới
- **WHEN** nhân viên cổng thêm nhà xe "Vận Tải Minh Phát" khi danh mục chưa có
- **THEN** hệ thống tạo khách hàng mã NX-xxxx loại TRUCKING, ô nhà xe tự chọn khách hàng này

#### Scenario: Mã tự sinh tăng dần
- **WHEN** đã có nhà xe NX-0007 và thêm một nhà xe mới
- **THEN** nhà xe mới có mã NX-0008

#### Scenario: Thiếu tên
- **WHEN** thêm nhà xe mới với tên để trống
- **THEN** hệ thống từ chối, báo phải nhập tên nhà xe

### Requirement: Không tạo trùng nhà xe
Khi thêm nhanh, hệ thống MUST NOT tạo nhà xe mới nếu tên (so không phân biệt hoa thường, bỏ khoảng trắng thừa) hoặc mã số thuế trùng với một khách hàng đang hoạt động; khi đó SHALL báo trùng và trả về khách hàng đã có để chọn. Hai yêu cầu thêm cùng lúc MUST NOT tạo hai mã trùng nhau.

#### Scenario: Trùng tên khác hoa thường
- **WHEN** đã có "XYZ Transport" và thêm nhanh "  xyz   transport "
- **THEN** hệ thống không tạo mới, báo đã có nhà xe CUST-XYZ02 - XYZ Transport để chọn

#### Scenario: Trùng mã số thuế
- **WHEN** thêm nhanh nhà xe tên khác nhưng mã số thuế 0318765432 trùng XYZ Transport
- **THEN** hệ thống không tạo mới, báo trùng mã số thuế với CUST-XYZ02

#### Scenario: Hai người thêm cùng lúc
- **WHEN** hai yêu cầu thêm nhanh hai nhà xe khác tên được gửi đồng thời
- **THEN** cả hai được tạo với hai mã NX khác nhau, không lỗi hệ thống
