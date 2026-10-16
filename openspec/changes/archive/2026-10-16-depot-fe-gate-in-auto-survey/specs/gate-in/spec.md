# Spec Delta

## ADDED Requirements

### Requirement: Xoá form sau Gate-In thành công
Khi Gate-In thành công, màn Gate-In SHALL xoá trắng các ô số container, xe, tài xế, seal, booking, công ty vận tải và ghi chú, đồng thời đưa hãng tàu và loại container (kèm mã ISO, tare weight, max payload) về mục đầu tiên của danh mục. Khi Gate-In thất bại, form MUST giữ nguyên dữ liệu đã nhập và hiện lỗi.

#### Scenario: Quay lại màn Gate-In sau khi thành công
- **WHEN** nhân viên Gate-In thành công rồi mở lại màn Gate-In
- **THEN** các ô số container, biển số, tài xế, số điện thoại, seal đều trống

#### Scenario: Gate-In bị từ chối
- **WHEN** Gate-In bị từ chối vì sai check-digit
- **THEN** form giữ nguyên dữ liệu đã nhập và hiện lỗi ở ô số container

### Requirement: Tự chuyển sang Giám Định sau Gate-In
Khi Gate-In thành công và tài khoản đăng nhập được mở màn Giám Định, hệ thống SHALL tự chuyển sang màn Giám Định và hiện thông báo kèm số container và số e-EIR, không mở hộp thoại e-EIR. Tài khoản không được mở màn Giám Định SHALL ở lại màn Gate-In, thấy thông báo và hộp thoại e-EIR.

#### Scenario: Nhân viên có quyền Giám Định
- **WHEN** tài khoản có quyền màn Giám Định Gate-In thành công container MSCU…
- **THEN** màn hình chuyển sang Giám Định, container vừa nhập có trong hàng chờ giám định và thông báo ghi số container cùng số e-EIR

#### Scenario: Nhân viên không có quyền Giám Định
- **WHEN** tài khoản chỉ có quyền Gate-In thực hiện Gate-In thành công
- **THEN** màn hình ở lại Gate-In với form trống và hiện hộp thoại e-EIR
