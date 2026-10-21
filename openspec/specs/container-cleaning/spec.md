# container-cleaning Specification

## Purpose

Quản lý lệnh vệ sinh container của Tổ Vệ Sinh: tiếp nhận, theo dõi tiến độ từng hạng mục, ghi thông số thi công và bàn giao Khai thác khi đã làm xong thật.

## Requirements

### Requirement: Tạo lệnh vệ sinh thủ công
Tổ Vệ Sinh SHALL tạo được lệnh vệ sinh cho container đang có hồ sơ chưa Gate-Out; hệ thống MUST từ chối khi container đã có lệnh vệ sinh chưa bàn giao, khi số hồ sơ gửi kèm không tồn tại, hoặc khi đơn giá / thời gian dự kiến âm. Lệnh mới SHALL ở trạng thái chờ vệ sinh và ghi nhật ký CLEANING_RECEIVED.

#### Scenario: Container không có trong bãi
- **WHEN** tạo lệnh vệ sinh cho số container không có hồ sơ đang hoạt động
- **THEN** hệ thống từ chối

#### Scenario: Đã có lệnh đang làm
- **WHEN** tạo lệnh vệ sinh cho container đang có lệnh chưa bàn giao
- **THEN** hệ thống từ chối tạo trùng

### Requirement: Đánh dấu tiến độ hạng mục
Tổ Vệ Sinh SHALL đánh dấu xong / bỏ đánh dấu từng hạng mục hoặc tất cả hạng mục; hệ thống SHALL lưu người và thời điểm hoàn thành, chuyển lệnh sang đang vệ sinh khi có ít nhất một hạng mục xong (về chờ vệ sinh khi không còn hạng mục nào xong), và ghi nhật ký cho mỗi lần đánh dấu.

#### Scenario: Xong hạng mục đầu tiên
- **WHEN** đánh dấu xong 1 trong 3 hạng mục của lệnh đang chờ
- **THEN** lệnh chuyển sang đang vệ sinh và nhật ký ghi tiến độ 1/3

#### Scenario: Đánh dấu tất cả khi đã xong hết
- **WHEN** bấm đánh dấu tất cả cho lệnh mà mọi hạng mục đã xong
- **THEN** mọi hạng mục bị bỏ đánh dấu và lệnh về chờ vệ sinh

### Requirement: Cập nhật thông số thi công
Tổ Vệ Sinh SHALL cập nhật nhân viên thực hiện, áp lực nước, hoá chất và lượng dùng, nhiệt độ, hạng mục tiêu, ghi chú và ảnh sau vệ sinh (kèm thời điểm chụp); mỗi lần có thay đổi SHALL ghi nhật ký liệt kê các mục đã đổi.

#### Scenario: Thêm ảnh sau vệ sinh
- **WHEN** cập nhật ảnh sau vệ sinh
- **THEN** lệnh lưu ảnh, thời điểm chụp và nhật ký ghi "ảnh sau vệ sinh"

### Requirement: Bàn giao Khai thác chỉ khi làm xong thật
Bàn giao MUST yêu cầu người bàn giao, MUST từ chối lệnh không có hạng mục, lệnh còn hạng mục chưa đánh dấu xong, và lệnh đã bàn giao trước đó. Bàn giao SHALL không tự đánh dấu xong hạng mục nào.

#### Scenario: Còn hạng mục dở
- **WHEN** bàn giao lệnh còn 1/3 hạng mục chưa xong
- **THEN** hệ thống từ chối và báo còn 1/3 hạng mục chưa hoàn thành

#### Scenario: Bàn giao lần hai
- **WHEN** bàn giao lệnh đã bàn giao
- **THEN** hệ thống từ chối

### Requirement: Kết quả bàn giao
Bàn giao hợp lệ SHALL chuyển lệnh sang đã bàn giao Khai thác, lưu người và thời điểm bàn giao, tính lại tổng tiền từ các hạng mục và ghi nhật ký CLEANING_HANDOVER. Trạng thái hồ sơ sau bàn giao theo đặc tả `container-lifecycle`.

#### Scenario: Bàn giao thành công
- **WHEN** bàn giao lệnh có 3 hạng mục đã xong, tổng 300.000 đ
- **THEN** lệnh ghi đã bàn giao, tổng 300.000 đ và nhật ký CLEANING_HANDOVER có người bàn giao

### Requirement: Giá lệnh vệ sinh thủ công do server tra
Khi tạo lệnh vệ sinh thủ công, mỗi hạng mục MUST thuộc biểu phí vệ sinh đang dùng; hệ thống SHALL tự tra đơn giá theo loại container của hồ sơ, bỏ qua đơn giá trình duyệt gửi. Hạng mục không có trong danh mục, tạm ngưng hoặc chưa có giá cho loại container MUST bị từ chối 400 nêu mã và loại.

#### Scenario: Giá theo biểu phí
- **WHEN** tạo lệnh vệ sinh thủ công cho container 40GP với CLN_CHEMICAL đơn giá gửi lên 0 đ, biểu phí 40GP là 420.000 đ
- **THEN** lệnh vệ sinh lưu CLN_CHEMICAL 420.000 đ và tổng chi phí 420.000 đ

#### Scenario: Chưa có giá
- **WHEN** tạo lệnh vệ sinh thủ công với dịch vụ chưa có giá cho loại container của hồ sơ
- **THEN** hệ thống từ chối 400 và không tạo lệnh
