# container-survey Specification

## Purpose

Giám định container sau Gate-In: một giám định viên nhận phiếu, ghi hạng, hư hỏng, dịch vụ vệ sinh, checklist và ảnh, lưu nháp hoặc nộp chính thức để chuyển container sang Tổ Vệ Sinh.

## Requirements

### Requirement: Nhận phiếu giám định có khoá
Giám định viên SHALL nhận được container đang SURVEYING để khoá lại cho riêng mình; hệ thống MUST từ chối khi người khác đang giữ khoá chưa quá 30 phút, và hai người nhận đồng thời MUST chỉ một người thành công. Mỗi lần nhận SHALL ghi nhật ký SURVEY_CLAIMED.

#### Scenario: Người khác đang giữ
- **WHEN** giám định viên B nhận container mà A vừa nhận cách đây 10 phút
- **THEN** hệ thống từ chối và báo container đang được A giám định

#### Scenario: Màn Giám định hiện người đang giữ
- **WHEN** giám định viên khác mở danh sách giám định có container đang bị giữ khoá
- **THEN** thẻ container hiện tên người đang giám định và nút mở phiếu bị khoá

#### Scenario: Khoá quá hạn
- **WHEN** giám định viên B nhận container mà A nhận đã quá 30 phút chưa nộp
- **THEN** B nhận được và khoá chuyển sang B

#### Scenario: Container không còn chờ giám định
- **WHEN** nhận phiếu cho container không ở SURVEYING
- **THEN** hệ thống từ chối

### Requirement: Bỏ nhận phiếu
Chỉ người đang giữ khoá SHALL bỏ nhận được phiếu; bỏ nhận SHALL xoá khoá để người khác nhận.

#### Scenario: Người khác bỏ nhận hộ
- **WHEN** giám định viên không giữ khoá bấm bỏ nhận
- **THEN** hệ thống từ chối và khoá giữ nguyên

### Requirement: Kiểm tra nội dung phiếu
Hệ thống MUST từ chối phiếu có hạng container khác A, B, C, D; hư hỏng có số lượng ≤ 0 hoặc giờ công / đơn giá công / vật tư âm; và từ chối giám định cho hồ sơ đang READY_FOR_OUT hoặc GATE_OUT. Giám định viên SHALL là tài khoản đang đăng nhập.

#### Scenario: Hạng không hợp lệ
- **WHEN** nộp phiếu với hạng "E"
- **THEN** hệ thống từ chối và báo chỉ nhận A, B, C hoặc D

#### Scenario: Hư hỏng số lượng 0
- **WHEN** nộp phiếu có hư hỏng số lượng 0
- **THEN** hệ thống từ chối

### Requirement: Lưu nháp không đổi trạng thái
Lưu nháp SHALL lưu toàn bộ nội dung phiếu (thay thế bản trước) nhưng MUST giữ hồ sơ ở SURVEYING và giữ khoá của giám định viên; SHALL ghi nhật ký SURVEY_DRAFT_SAVED. Số phiếu giám định SHALL do hệ thống sinh một lần khi tạo và không đổi khi lưu lại.

#### Scenario: Lưu nháp rồi mở lại
- **WHEN** giám định viên lưu nháp 2 lần
- **THEN** chỉ có một phiếu với nội dung lần lưu sau, cùng số phiếu, hồ sơ vẫn SURVEYING

### Requirement: Nộp phiếu chính thức
Nộp phiếu chính thức MUST có ít nhất một dịch vụ vệ sinh; SHALL chuyển hồ sơ sang CLEANING, giải phóng khoá nhận phiếu và ghi nhật ký SURVEY_SUBMITTED kèm hạng và số hư hỏng.

#### Scenario: Nộp thành công
- **WHEN** nộp phiếu chính thức có 2 hư hỏng và 1 dịch vụ vệ sinh
- **THEN** hồ sơ chuyển CLEANING, khoá được giải phóng, nhật ký ghi hạng và 2 hư hỏng

### Requirement: Tự sinh lệnh vệ sinh từ phiếu giám định
Khi nộp phiếu chính thức và hồ sơ chưa có lệnh vệ sinh đang hoạt động, hệ thống SHALL tạo lệnh vệ sinh chờ thực hiện gồm đúng các dịch vụ vệ sinh đã chọn, kèm loại container theo danh mục, hãng tàu, số e-EIR nhập, lý do / ghi chú vệ sinh và ảnh toàn cảnh làm ảnh trước vệ sinh. Nộp lại phiếu MUST NOT tạo lệnh trùng.

#### Scenario: Nộp lại phiếu
- **WHEN** hồ sơ đã có lệnh vệ sinh chưa bàn giao và phiếu được nộp lại
- **THEN** không tạo thêm lệnh vệ sinh mới

#### Scenario: Thông tin chuyển sang Tổ Vệ Sinh
- **WHEN** nộp phiếu có lý do vệ sinh "dầu mỡ" và ảnh toàn cảnh
- **THEN** lệnh vệ sinh ghi lý do đó trong ghi chú và dùng ảnh toàn cảnh làm ảnh trước vệ sinh

### Requirement: Lịch sử giám định chỉ gồm phiếu đã nộp, dữ liệu thật
Tab Lịch sử Giám định SHALL liệt kê mọi phiếu giám định đã nộp chính thức của mọi hồ sơ, kể cả hồ sơ đã chuyển sang vệ sinh, sửa chữa, QC hay đã ra cổng; phiếu nháp và container chưa giám định MUST NOT xuất hiện. Số phiếu, ngày giám định, người giám định, tình trạng, số hư hỏng SHALL lấy từ phiếu đã lưu, không dùng giá trị tạm; mỗi dòng SHALL hiện trạng thái hiện tại của hồ sơ. Bảng MUST NOT có thao tác nộp lại phiếu.

#### Scenario: Phiếu đã nộp, hồ sơ đã sang bước sau
- **WHEN** container đã nộp phiếu giám định và hồ sơ đang sửa chữa
- **THEN** phiếu hiện trong lịch sử với đúng số phiếu, ngày, người giám định và trạng thái hồ sơ "đang sửa chữa"

#### Scenario: Container chưa giám định
- **WHEN** container vừa Gate-In, đang chờ giám định, chưa nộp phiếu
- **THEN** container không có trong lịch sử giám định

#### Scenario: Phiếu nháp
- **WHEN** giám định viên mới lưu nháp phiếu, hồ sơ vẫn đang chờ giám định
- **THEN** phiếu nháp không có trong lịch sử giám định

#### Scenario: Không còn nút chuyển khai thác
- **WHEN** mở tab Lịch sử Giám định
- **THEN** các dòng không có nút nộp lại phiếu hay chuyển khai thác; xem chi tiết và e-EIR vẫn mở được

#### Scenario: Chưa có phiếu nào
- **WHEN** chưa có phiếu giám định nào được nộp
- **THEN** bảng hiện dòng báo chưa có phiếu giám định đã nộp

### Requirement: Lọc và xuất lịch sử giám định
Bộ lọc Từ ngày / Đến ngày SHALL lọc theo ngày giám định (giờ Việt Nam, tính cả hai đầu), kết hợp với tìm kiếm, hãng tàu và tình trạng. Nút xuất SHALL tải một file CSV thật (UTF-8 có BOM) gồm đúng mọi dòng đang khớp bộ lọc, không chỉ trang đang xem; không có dòng nào thì MUST báo không có dữ liệu để xuất thay vì báo đã xuất.

#### Scenario: Lọc theo ngày
- **WHEN** chọn Từ ngày 17/10/2026 Đến ngày 17/10/2026 khi có phiếu giám định ngày 17/10 và ngày 18/10
- **THEN** chỉ phiếu ngày 17/10 hiện ra

#### Scenario: Xuất CSV theo bộ lọc
- **WHEN** lọc còn 3 phiếu rồi bấm xuất
- **THEN** trình duyệt tải file CSV có dòng tiêu đề và đúng 3 dòng phiếu đó, mở bằng Excel đọc đúng tiếng Việt

#### Scenario: Xuất khi không có dữ liệu
- **WHEN** bộ lọc không khớp phiếu nào và bấm xuất
- **THEN** không tải file, hiện thông báo không có dữ liệu để xuất

### Requirement: Xem phiếu từ lịch sử ở chế độ chỉ xem
Mở một phiếu từ tab Lịch sử Giám định SHALL hiện đầy đủ nội dung phiếu ở chế độ chỉ xem, có dòng báo phiếu đã nộp. Ở chế độ này MUST NOT có nút hay thao tác nào lưu tạm, hoàn tất / nộp phiếu, chuyển vệ sinh, thêm / sửa / xoá hư hỏng hay dịch vụ vệ sinh, tải lên / xoá ảnh; mọi ô nhập MUST bị khoá. Ảnh vẫn phóng to xem được và nút Quay lại SHALL về tab Lịch sử. Mở phiếu từ hàng chờ giám định SHALL vẫn sửa và nộp được như trước.

#### Scenario: Mở phiếu từ lịch sử
- **WHEN** bấm nút xem ở một phiếu trong tab Lịch sử Giám định
- **THEN** form hiện đủ nội dung phiếu với dòng báo "Phiếu đã nộp — chế độ chỉ xem", không có nút Lưu tạm hay Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh

#### Scenario: Không sửa được
- **WHEN** đang xem phiếu từ lịch sử
- **THEN** các ô nhập, chọn, checkbox đều bị khoá; không có nút thêm / sửa / xoá hư hỏng, dịch vụ vệ sinh hay tải lên / xoá ảnh

#### Scenario: Xem ảnh và quay lại
- **WHEN** đang xem phiếu từ lịch sử, bấm một ảnh rồi bấm Quay lại
- **THEN** ảnh phóng to được, và Quay lại đưa về tab Lịch sử Giám định; hồ sơ và phiếu không thay đổi

#### Scenario: Hàng chờ vẫn sửa được
- **WHEN** mở một container từ hàng chờ giám định
- **THEN** form vẫn có đủ nút lưu tạm, hoàn tất và các ô nhập sửa được như trước

### Requirement: Checklist khu vực đúng theo danh mục
Mỗi lần lưu nháp hoặc nộp phiếu, checklist MUST gồm đúng mỗi khu vực đang dùng của danh mục Checklist giám định một lần, với trạng thái PASS, FAIL hoặc NA. Hệ thống MUST từ chối (400, nêu lý do) khi thiếu khu vực, có mã khu vực không thuộc danh mục, trùng khu vực hoặc trạng thái khác ba giá trị trên. Tên khu vực lưu SHALL lấy từ danh mục.

#### Scenario: Checklist đủ và hợp lệ
- **WHEN** lưu phiếu có đủ 11 khu vực của danh mục, mỗi khu vực một trạng thái PASS / FAIL / NA
- **THEN** phiếu được lưu, tên khu vực theo danh mục

#### Scenario: Thiếu, thừa hoặc trùng khu vực
- **WHEN** lưu phiếu có checklist rỗng, chỉ 3 khu vực, có mã khu vực "XYZ" hoặc có khu vực Nóc hai lần
- **THEN** hệ thống từ chối 400 và không lưu gì

#### Scenario: Trạng thái lạ
- **WHEN** lưu phiếu có khu vực trạng thái "BAD"
- **THEN** hệ thống từ chối 400

### Requirement: Khu vực checklist khớp hư hỏng
Mỗi vị trí trong danh mục Vị trí hư hỏng SHALL có thể gắn một khu vực checklist; admin chỉnh được ở màn danh mục. Số lỗi mỗi khu vực MUST do server tính lại bằng số hư hỏng có vị trí thuộc khu vực đó, không lấy số trình duyệt gửi. Khu vực có ít nhất một hư hỏng MUST là FAIL; nếu gửi PASS hoặc NA, hệ thống MUST từ chối 400. Khu vực FAIL không có hư hỏng vẫn hợp lệ.

#### Scenario: Hư hỏng ở Nóc nhưng khu vực Nóc Đạt
- **WHEN** lưu phiếu có hư hỏng ở vị trí RF1 (gắn khu vực Nóc) trong khi khu vực Nóc gửi PASS
- **THEN** hệ thống từ chối 400 nêu khu vực Nóc đang có hư hỏng

#### Scenario: Số lỗi do server tính
- **WHEN** lưu phiếu khu vực Nóc FAIL kèm số lỗi 9 (hoặc -5) nhưng chỉ có 1 hư hỏng ở RF1
- **THEN** phiếu lưu khu vực Nóc FAIL với số lỗi 1

#### Scenario: Đánh dấu tay Không Đạt
- **WHEN** lưu phiếu có khu vực Gầm FAIL mà không có hư hỏng nào thuộc khu vực Gầm
- **THEN** phiếu được lưu, khu vực Gầm FAIL với số lỗi 0

#### Scenario: Form tự cập nhật khu vực
- **WHEN** giám định viên thêm một hư hỏng ở vị trí RF1 trên form, rồi xoá hư hỏng đó
- **THEN** khu vực Nóc chuyển "Không Đạt" kèm "1 lỗi", và sau khi xoá thì về "Đạt"

### Requirement: Mã vị trí hư hỏng thuộc danh mục
Mỗi hư hỏng trong phiếu MUST có mã vị trí thuộc danh mục Vị trí hư hỏng; hệ thống MUST từ chối 400 khi lưu nháp hoặc nộp phiếu có mã vị trí khác. Form nhập hư hỏng (thanh nhập nhanh và form chi tiết) MUST chỉ đưa ra các vị trí, mã hư hỏng, mã sửa chữa lấy từ danh mục; giá trị đang hiển thị ở ô chọn SHALL đúng là giá trị được lưu, và MUST NOT có nút mẫu hư hỏng gõ cứng.

#### Scenario: Mã vị trí không có trong danh mục
- **WHEN** lưu phiếu có hư hỏng vị trí "RIGHT_W"
- **THEN** hệ thống từ chối 400 nêu mã vị trí không có trong danh mục

#### Scenario: Thêm nhanh không chỉnh ô chọn
- **WHEN** mở form giám định và bấm "+ Thêm Mã Lỗi" ngay mà không đổi ô Vị trí
- **THEN** hư hỏng thêm vào mang đúng mã vị trí đang hiện ở ô chọn (một mã của danh mục)

### Requirement: Khu vực Vệ sinh không hạ phân loại DM
Chọn "Không Đạt" ở khu vực Vệ sinh SHALL đổi phân loại vỏ từ AV sang CL, nhưng MUST NOT đổi phân loại DM thành CL. Chọn "Không Đạt" ở khu vực khác SHALL đặt phân loại DM. Đổi một khu vực về Đạt hoặc N/A MUST NOT tự đổi phân loại.

#### Scenario: Container đang DM
- **WHEN** phân loại đang DM và giám định viên chọn "Không Đạt" ở khu vực Vệ sinh
- **THEN** phân loại vẫn là DM

#### Scenario: Container đang AV
- **WHEN** phân loại đang AV và giám định viên chọn "Không Đạt" ở khu vực Vệ sinh
- **THEN** phân loại chuyển CL

### Requirement: Quản lý danh mục khu vực Checklist
Người có quyền danh mục (masterdata) SHALL thêm, sửa tên / thứ tự / trạng thái mặc định, tạm ngưng, bật lại và xoá khu vực Checklist giám định ở màn "DM Khu Vực Checklist Giám Định" thuộc nhóm Danh mục Master Data. Mã khu vực MUST chỉ gồm chữ in hoa, số, gạch dưới và MUST NOT đổi sau khi tạo. Trạng thái mặc định MUST là Đạt hoặc N/A. Vi phạm thì hệ thống MUST từ chối 400 nêu lý do.

#### Scenario: Thêm khu vực mới
- **WHEN** admin thêm khu vực mã "TANK_VALVE", tên "Van bồn", mặc định N/A
- **THEN** khu vực được lưu, hiện trong bảng và trong Checklist của phiếu giám định mới với trạng thái N/A

#### Scenario: Đổi mã khu vực đã có
- **WHEN** admin sửa khu vực ROOF và đổi mã thành "ROOF2"
- **THEN** hệ thống từ chối 400, mã vẫn là ROOF

#### Scenario: Trạng thái mặc định sai
- **WHEN** lưu khu vực có trạng thái mặc định "Không Đạt"
- **THEN** hệ thống từ chối 400

#### Scenario: Người không có quyền danh mục
- **WHEN** tài khoản không có quyền masterdata gọi API thêm / sửa khu vực
- **THEN** hệ thống từ chối 403 và sidebar không hiện màn này

### Requirement: Giữ toàn vẹn khi tạm ngưng hoặc xoá khu vực
Hệ thống MUST từ chối (400, nêu các mã vị trí) tạm ngưng hoặc xoá khu vực đang được vị trí hư hỏng gắn vào, và MUST từ chối tạm ngưng / xoá khu vực đang dùng cuối cùng. Khu vực đã xuất hiện trong bất kỳ phiếu giám định nào MUST NOT xoá được, chỉ được tạm ngưng. Khu vực tạm ngưng SHALL không còn trong checklist của phiếu mới và bật lại được.

#### Scenario: Khu vực còn vị trí gắn
- **WHEN** admin tạm ngưng khu vực Cửa trong khi DR1, DS1, DH1, LG1 đang gắn vào Cửa
- **THEN** hệ thống từ chối 400 nêu 4 mã vị trí đó

#### Scenario: Xoá khu vực đã dùng trong phiếu
- **WHEN** admin xoá khu vực Nóc đã có trong phiếu giám định
- **THEN** hệ thống từ chối 400 và gợi ý tạm ngưng

#### Scenario: Tạm ngưng khu vực không còn dùng
- **WHEN** admin tạm ngưng khu vực không có vị trí gắn
- **THEN** khu vực chuyển "Tạm ngưng", phiếu giám định mới không còn khu vực này, và bật lại được

### Requirement: Phiếu nháp theo danh mục khu vực mới nhất
Khi mở một phiếu đang giám định (chưa nộp), form SHALL thêm các khu vực đang dùng mà phiếu chưa có (theo trạng thái mặc định) và bỏ các khu vực đã tạm ngưng / xoá, giữ nguyên trạng thái các khu vực còn lại. Phiếu đã nộp (xem từ Lịch sử) MUST hiện đúng checklist đã lưu. Tiêu đề checklist SHALL hiện đúng số khu vực.

#### Scenario: Danh mục thêm khu vực sau khi lưu nháp
- **WHEN** phiếu đã lưu nháp với 11 khu vực, admin thêm khu vực thứ 12, rồi giám định viên mở lại phiếu và lưu
- **THEN** form có 12 khu vực (khu vực mới theo mặc định), tiêu đề "Checklist 12 Khu Vực", lưu thành công

#### Scenario: Phiếu đã nộp không đổi
- **WHEN** mở từ Lịch sử một phiếu đã nộp trước khi danh mục đổi
- **THEN** checklist hiện đúng các khu vực và trạng thái đã lưu
