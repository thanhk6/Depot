## ADDED Requirements

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
