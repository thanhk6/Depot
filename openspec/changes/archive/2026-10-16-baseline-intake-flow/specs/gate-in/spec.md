# Spec Delta

## Purpose

Tiếp nhận container vào depot: kiểm tra thông tin container, xe và tài xế, ghi nhận người tiếp nhận thật, rồi mở hồ sơ mới ở bước chờ giám định.

## ADDED Requirements

### Requirement: Số container đúng chuẩn ISO 6346
Hệ thống MUST từ chối Gate-In khi số container (sau khi bỏ dấu gạch và viết hoa) không đủ 11 ký tự chữ / số, không theo khuôn 4 chữ cái + 6 số + 1 số kiểm tra, hoặc sai số kiểm tra (check-digit) ISO 6346.

#### Scenario: Sai số kiểm tra
- **WHEN** nhập số container đúng khuôn nhưng chữ số cuối khác số kiểm tra tính theo ISO 6346
- **THEN** hệ thống từ chối và báo số kiểm tra đúng phải là bao nhiêu

#### Scenario: Sai khuôn dạng
- **WHEN** nhập số container không đủ 11 ký tự hoặc 4 ký tự đầu không phải chữ cái
- **THEN** hệ thống từ chối và báo sai định dạng

### Requirement: Loại container và hãng tàu theo danh mục
Loại container MUST là một mã đang áp dụng (không tạm ngưng, không xoá) trong danh mục Loại Container (ISO) và không dài quá 10 ký tự; hãng tàu MUST tồn tại trong danh mục hãng tàu.

#### Scenario: Loại container đang tạm ngưng
- **WHEN** Gate-In với loại container đã tạm ngưng trong danh mục
- **THEN** hệ thống từ chối và liệt kê các loại đang áp dụng

#### Scenario: Hãng tàu không có trong danh mục
- **WHEN** Gate-In với mã hãng tàu không tồn tại
- **THEN** hệ thống từ chối

### Requirement: Thông tin xe, tài xế và trọng lượng bắt buộc
Hệ thống MUST yêu cầu biển số đầu kéo, họ tên tài xế (tối đa 150 ký tự), số điện thoại tài xế (9–15 chữ số, chỉ chứa số và ký tự `+ - . ( )` hoặc khoảng trắng), tare weight và max payload lớn hơn 0. Rơ-moóc, seal, seal hải quan, số booking, bằng lái, công ty vận tải và ghi chú là tuỳ chọn.

#### Scenario: Số điện thoại có chữ
- **WHEN** nhập số điện thoại tài xế chứa chữ cái
- **THEN** hệ thống từ chối và báo số điện thoại không hợp lệ

#### Scenario: Thiếu tare weight
- **WHEN** Gate-In với tare weight bằng 0
- **THEN** hệ thống từ chối

### Requirement: Người tiếp nhận lấy từ phiên đăng nhập
Nhân viên tiếp nhận SHALL là tài khoản đang đăng nhập (tra trong danh sách nhân viên chưa xoá), không nhập tay; thiếu hoặc không tra được MUST bị từ chối với yêu cầu đăng nhập lại.

#### Scenario: Phiên đăng nhập mất
- **WHEN** Gate-In không kèm được tài khoản nhân viên hợp lệ
- **THEN** hệ thống từ chối và yêu cầu đăng nhập lại

### Requirement: Không trùng hồ sơ đang hoạt động
Mỗi số container MUST chỉ có một hồ sơ chưa Gate-Out; hai yêu cầu Gate-In đồng thời cho cùng container MUST chỉ có một thành công.

#### Scenario: Container đang trong bãi
- **WHEN** Gate-In container đang có hồ sơ chưa Gate-Out
- **THEN** hệ thống từ chối và báo container đã có hồ sơ đang hoạt động

#### Scenario: Container đã Gate-Out quay lại
- **WHEN** Gate-In container mà hồ sơ cũ đã GATE_OUT
- **THEN** hệ thống mở hồ sơ mới

### Requirement: Mở hồ sơ và e-EIR nhập
Gate-In hợp lệ SHALL tạo hồ sơ mới ở trạng thái SURVEYING, chưa có vị trí bãi, sinh số hồ sơ và số e-EIR nhập, lưu thông tin xe / tài xế / người tiếp nhận, và ghi nhật ký GATE_IN.

#### Scenario: Gate-In thành công
- **WHEN** Gate-In với đầy đủ thông tin hợp lệ
- **THEN** hồ sơ mới ở SURVEYING, có số e-EIR nhập, chưa có vị trí bãi và nhật ký GATE_IN ghi người tiếp nhận
