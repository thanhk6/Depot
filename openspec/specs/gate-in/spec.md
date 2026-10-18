# gate-in Specification

## Purpose

Tiếp nhận container vào depot: kiểm tra thông tin container, xe và tài xế, ghi nhận người tiếp nhận thật, rồi mở hồ sơ mới ở bước chờ giám định.

## Requirements

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

### Requirement: Chọn kiểu nhập nhà xe bằng radio
Ô Đơn Vị Vận Tải / Nhà Xe trên màn Gate-In SHALL có 3 radio: Chọn nhà xe có sẵn (mặc định), Thêm nhà xe mới, Khách vãng lai. Mỗi lúc chỉ hiện ô nhập của radio đang chọn (ô tìm, form thêm mới, hoặc ô tên vãng lai); ô của hai radio còn lại MUST bị ẩn. Đổi radio MUST xoá nhà xe, tên và chữ đã nhập của lựa chọn cũ.

#### Scenario: Mặc định khi mở màn
- **WHEN** nhân viên mở màn Gate-In
- **THEN** radio Chọn nhà xe có sẵn được chọn, chỉ hiện ô gõ để tìm nhà xe; không hiện form thêm mới và ô tên vãng lai

#### Scenario: Chọn Thêm nhà xe mới
- **WHEN** bấm radio Thêm nhà xe mới
- **THEN** ô tìm và ô tên vãng lai bị ẩn, hiện form tên / SĐT / MST với nút Lưu nhà xe

#### Scenario: Chọn Khách vãng lai
- **WHEN** bấm radio Khách vãng lai
- **THEN** ô tìm và form thêm mới bị ẩn, chỉ hiện ô tên nhà xe / chủ xe vãng lai

#### Scenario: Đổi radio xoá lựa chọn cũ
- **WHEN** đã chọn nhà xe XYZ Transport rồi bấm radio Khách vãng lai
- **THEN** XYZ Transport không còn được chọn; Gate-In lúc này chỉ nhận khi đã nhập tên vãng lai

#### Scenario: Lưu nhà xe mới xong
- **WHEN** ở radio Thêm nhà xe mới, lưu được nhà xe mới hoặc bị báo trùng với nhà xe đã có
- **THEN** radio chuyển về Chọn nhà xe có sẵn với nhà xe đó đã được chọn và hiện thông báo

#### Scenario: Gate-In thành công
- **WHEN** Gate-In thành công với bất kỳ radio nào
- **THEN** form xoá trắng và radio về Chọn nhà xe có sẵn
