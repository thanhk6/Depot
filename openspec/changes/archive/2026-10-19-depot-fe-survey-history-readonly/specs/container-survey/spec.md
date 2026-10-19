## ADDED Requirements

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
