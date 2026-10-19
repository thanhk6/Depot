## ADDED Requirements

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
