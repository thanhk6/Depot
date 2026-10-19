## ADDED Requirements

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
