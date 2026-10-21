# gate-out Specification

## Purpose

Cấp vỏ và xuất cổng container theo booking của hãng tàu: chỉ cho container rời depot khi có booking hợp lệ, phù hợp với container và còn số lượng (hoặc có lý do ra cổng không theo booking), đồng thời ghi nhận đúng số vỏ đã cấp cho từng booking.

## Requirements

### Requirement: Gate-Out bắt buộc có booking tồn tại
Mặc định Gate-Out SHALL yêu cầu số booking; backend MUST tự tra booking trong cơ sở dữ liệu (không dựa vào kiểm tra ở giao diện), so khớp không phân biệt hoa thường và bỏ khoảng trắng đầu cuối. Thiếu số booking (khi không chọn ra cổng không cần booking) hoặc không tìm thấy booking thì MUST từ chối và báo rõ lý do; hồ sơ không đổi.

#### Scenario: Không nhập booking
- **WHEN** gửi Gate-Out cho hồ sơ READY_FOR_OUT, không có số booking và không chọn "Không cần booking"
- **THEN** hệ thống từ chối, báo "Chưa nhập số Booking cấp vỏ", hồ sơ vẫn READY_FOR_OUT

#### Scenario: Booking không tồn tại
- **WHEN** gửi Gate-Out với số booking "BK-KHONG-CO"
- **THEN** hệ thống từ chối, báo không tìm thấy booking BK-KHONG-CO

#### Scenario: Nhập chữ thường có khoảng trắng
- **WHEN** gửi Gate-Out với " bk-abc-0001 " và booking BK-ABC-0001 hợp lệ
- **THEN** hệ thống nhận đúng booking BK-ABC-0001

### Requirement: Booking phải đang hoạt động
Hệ thống MUST từ chối Gate-Out khi booking không ở trạng thái ACTIVE (vd đã xoá) và báo booking không còn hoạt động.

#### Scenario: Booking đã xoá
- **WHEN** Gate-Out theo booking có trạng thái DELETED
- **THEN** hệ thống từ chối, báo booking không còn hoạt động

### Requirement: Hạn booking theo ngày giờ Việt Nam và cấu hình quản trị
Hạn cuối của booking SHALL là 00:00 ngày `ValidUntil` theo giờ Việt Nam cộng *số giờ hiệu lực booking* do quản trị cấu hình (mặc định 24 giờ khi chưa cấu hình). Gate-Out sau hạn cuối MUST bị từ chối với thông báo chỉ ghi ngày, dạng "Booking BK-ABC-0001 đã hết hạn ngày 23/09/2026". Dữ liệu `ValidUntil` không bị sửa.

#### Scenario: Cuối ngày hết hạn với cấu hình mặc định
- **WHEN** booking có `ValidUntil` 23/09/2026 00:15 giờ Việt Nam, chưa cấu hình số giờ, xe đến lấy vỏ lúc 14:00 ngày 23/09/2026
- **THEN** booking còn hạn và Gate-Out được tiếp tục kiểm tra các điều kiện khác

#### Scenario: Sang ngày hôm sau với cấu hình mặc định
- **WHEN** cùng booking đó, xe đến lúc 08:00 ngày 24/09/2026
- **THEN** hệ thống từ chối, báo "Booking BK-ABC-0001 đã hết hạn ngày 23/09/2026"

#### Scenario: Quản trị cấu hình 30 ngày
- **WHEN** quản trị cấu hình số giờ hiệu lực booking là 720 giờ (30 ngày), booking có `ValidUntil` ngày 23/09/2026, xe đến lúc 10:00 ngày 20/10/2026
- **THEN** booking còn hạn

### Requirement: Cấu hình số giờ hiệu lực booking
Quản trị (tài khoản có quyền danh mục) SHALL xem và sửa được *số giờ hiệu lực booking* trên giao diện; giá trị MUST là số nguyên giờ từ 1 đến 8760. Gate-Out và kiểm tra booking SHALL dùng giá trị đang lưu ở lần gọi tiếp theo, không cần khởi động lại.

#### Scenario: Lưu cấu hình hợp lệ
- **WHEN** quản trị nhập 48 giờ và lưu
- **THEN** cấu hình được lưu, booking có `ValidUntil` ngày 23/09 còn hạn đến hết ngày 24/09

#### Scenario: Giá trị không hợp lệ
- **WHEN** quản trị nhập 0 hoặc số âm
- **THEN** hệ thống từ chối lưu và báo giá trị phải từ 1 đến 8760 giờ

### Requirement: Booking phải phù hợp với container
Hệ thống MUST từ chối Gate-Out khi hãng tàu của booking khác hãng tàu của hồ sơ container, khi kích cỡ booking khác mã kích cỡ / loại ISO của hồ sơ (vd 40HC), hoặc khi loại booking (vd DRY, REEFER) khác nhóm loại của mã đó trong danh mục loại container. Thông báo SHALL nêu giá trị của booking và của container.

#### Scenario: Sai hãng tàu
- **WHEN** Gate-Out container của hãng MSCU theo booking của hãng khác
- **THEN** hệ thống từ chối, báo booking thuộc hãng tàu khác, nêu hãng của booking và của container

#### Scenario: Sai kích cỡ
- **WHEN** Gate-Out container 20GP theo booking 40HC
- **THEN** hệ thống từ chối, báo booking yêu cầu 40HC còn container là 20GP

#### Scenario: Sai loại
- **WHEN** Gate-Out container 40RH (nhóm REEFER) theo booking 40RH loại DRY
- **THEN** hệ thống từ chối, báo booking yêu cầu DRY còn container là REEFER

### Requirement: Booking phải còn số lượng
Hệ thống MUST chỉ cho Gate-Out khi booking còn vỏ chưa cấp (số đã cấp nhỏ hơn số lượng booking); hết số lượng thì MUST từ chối và báo số lượng booking cùng số đã cấp.

#### Scenario: Booking đã cấp đủ
- **WHEN** Gate-Out theo booking 5 vỏ đã cấp 5
- **THEN** hệ thống từ chối, báo booking đã cấp đủ 5/5 vỏ

### Requirement: Chỉ quản lý và giám sát được ra cổng không cần booking
Gate-Out "Không cần booking" SHALL yêu cầu quyền riêng *Gate-Out không booking*, chỉ cấp cho quản lý (ADMIN) và giám sát (SUPERVISOR); nhân viên khai thác cổng (GATE_OP) MUST NOT thực hiện được dù gọi thẳng API. Giám sát SHALL vào được màn Gate-Out để làm việc này mà không có thêm quyền Gate-In hay phiếu dịch vụ. Ô tích chỉ hiện với tài khoản có quyền.

#### Scenario: Nhân viên cổng gọi thẳng API không booking
- **WHEN** tài khoản GATE_OP gửi Gate-Out với "Không cần booking" và lý do hợp lệ
- **THEN** hệ thống từ chối vì không có quyền, hồ sơ vẫn READY_FOR_OUT

#### Scenario: Nhân viên cổng mở màn Gate-Out
- **WHEN** tài khoản GATE_OP mở hộp cấp vỏ
- **THEN** không thấy ô "Không cần booking", vẫn cấp vỏ theo booking bình thường

#### Scenario: Giám sát cấp vỏ không booking
- **WHEN** tài khoản SUPERVISOR mở màn Gate-Out, tích "Không cần booking", chọn lý do Chuyển depot cho hồ sơ READY_FOR_OUT đã thanh toán
- **THEN** hồ sơ chuyển GATE_OUT, nhật ký ghi lý do và tên giám sát

#### Scenario: Giám sát không có quyền Gate-In
- **WHEN** tài khoản SUPERVISOR đăng nhập
- **THEN** thấy menu Gate-Out nhưng không thấy menu Gate-In hay phiếu dịch vụ

### Requirement: Ra cổng không cần booking phải có lý do
Gate-Out SHALL cho bỏ qua booking khi người có quyền chọn "Không cần booking" và MUST chọn một lý do: Trả vỏ về hãng, Chuyển depot, Sửa ngoài depot, hoặc Khác (bắt buộc ghi chú). Khi đó hệ thống MUST NOT kiểm tra hay cập nhật booking nào, hồ sơ không lưu số booking, và nhật ký GATE_OUT SHALL ghi "không theo booking" kèm lý do, ghi chú và người thực hiện. Các điều kiện hồ sơ (READY_FOR_OUT, xe, tài xế, đã thanh toán) vẫn áp dụng.

#### Scenario: Trả vỏ về hãng
- **WHEN** Gate-Out hồ sơ READY_FOR_OUT đã thanh toán, chọn "Không cần booking" với lý do Trả vỏ về hãng
- **THEN** hồ sơ chuyển GATE_OUT, không booking nào thay đổi, nhật ký ghi không theo booking - Trả vỏ về hãng

#### Scenario: Không chọn lý do
- **WHEN** chọn "Không cần booking" nhưng không chọn lý do
- **THEN** hệ thống từ chối, báo phải chọn lý do ra cổng không theo booking

#### Scenario: Lý do Khác không ghi chú
- **WHEN** chọn "Không cần booking" với lý do Khác và để trống ghi chú
- **THEN** hệ thống từ chối, báo phải ghi chú lý do

### Requirement: Ghi nhận cấp vỏ theo booking
Khi mọi điều kiện hợp lệ, Gate-Out theo booking SHALL trong cùng một giao dịch: chuyển hồ sơ sang GATE_OUT, lưu số booking vào hồ sơ, tăng số đã cấp của booking đúng 1, giải phóng ô bãi và ghi nhật ký GATE_OUT kèm số booking và số vỏ còn lại. Một bước lỗi thì MUST không bước nào được lưu.

#### Scenario: Gate-Out hợp lệ
- **WHEN** Gate-Out container MSCU 40HC đã READY_FOR_OUT, đã thanh toán, theo booking MSCU 40HC DRY 10 vỏ đã cấp 3, còn hạn
- **THEN** hồ sơ chuyển GATE_OUT với số booking đó, booking ghi đã cấp 4, nhật ký ghi booking và còn 6 vỏ

#### Scenario: Điều kiện khác không đạt
- **WHEN** booking hợp lệ nhưng container còn phiếu dịch vụ chưa thanh toán
- **THEN** hệ thống từ chối, số đã cấp của booking không đổi

### Requirement: Không cấp vượt và không ghi hai lần
Hệ thống MUST bảo đảm số đã cấp của booking không vượt số lượng booking khi nhiều yêu cầu Gate-Out đến cùng lúc, và một hồ sơ chỉ được Gate-Out (và tính vào booking) một lần dù yêu cầu bị gửi lặp. Yêu cầu bị chặn vì lý do này SHALL nhận thông báo rõ ràng, không phải lỗi hệ thống.

#### Scenario: Hai xe tranh vỏ cuối cùng
- **WHEN** booking còn đúng 1 vỏ và hai yêu cầu Gate-Out cho hai container khác nhau theo booking đó đến đồng thời
- **THEN** đúng một yêu cầu thành công, yêu cầu còn lại bị từ chối báo booking đã cấp đủ, số đã cấp bằng số lượng booking

#### Scenario: Gửi lặp cùng một Gate-Out
- **WHEN** cùng một yêu cầu Gate-Out cho một hồ sơ được gửi hai lần (đồng thời hoặc nối tiếp)
- **THEN** chỉ một lần được ghi nhận, lần còn lại báo container đã Gate-Out, số đã cấp của booking chỉ tăng 1

### Requirement: Kiểm tra booking trước khi cấp vỏ
Hệ thống SHALL cho kiểm tra một số booking với một hồ sơ trước khi Gate-Out, theo đúng các điều kiện booking của Gate-Out, và trả về hợp lệ hay không, lý do và số vỏ còn lại; kiểm tra MUST NOT thay đổi booking hay hồ sơ. Màn Gate-Out SHALL hiện kết quả này và hiện đúng thông báo lỗi khi Gate-Out bị từ chối.

#### Scenario: Kiểm tra booking hợp lệ
- **WHEN** nhân viên cổng kiểm tra booking 10 vỏ đã cấp 3 cho container phù hợp
- **THEN** màn hình báo booking hợp lệ, còn 7 vỏ; số đã cấp vẫn là 3

#### Scenario: Kiểm tra booking sai kích cỡ
- **WHEN** kiểm tra booking 40HC cho container 20GP
- **THEN** màn hình hiện lý do sai kích cỡ; số đã cấp không đổi

### Requirement: Hiện phí lưu bãi khi cấp vỏ
Hộp cấp vỏ Gate-Out MUST hiện phí lưu bãi do server tính đến hôm nay: ngày Gate-In, số ngày lưu bãi, số ngày miễn phí, quy tắc áp dụng, từng bậc (số ngày, đơn giá, thành tiền), VAT và tổng; thiếu quy tắc hoặc thiếu giá thì hiện đúng lý do. Nhật ký `GATE_OUT` MUST ghi số ngày lưu bãi và tổng phí (hoặc lý do không tính được). Phí lưu bãi chưa chặn ra cổng.

#### Scenario: Xem phí khi cấp vỏ
- **WHEN** mở hộp cấp vỏ cho container đã lưu bãi quá số ngày miễn phí
- **THEN** hộp hiện số ngày, từng bậc và tổng phí lưu bãi theo biểu cước

#### Scenario: Ghi nhật ký khi ra cổng
- **WHEN** xác nhận Gate-Out
- **THEN** nhật ký `GATE_OUT` có số ngày lưu bãi và tổng phí lưu bãi tính đến lúc ra cổng
