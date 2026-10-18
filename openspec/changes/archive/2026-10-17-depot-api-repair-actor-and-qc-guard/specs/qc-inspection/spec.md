## MODIFIED Requirements

### Requirement: Ghi kết quả QC
Hệ thống SHALL ghi kết quả QC vào đúng hồ sơ nêu trên đường dẫn và MUST từ chối khi body nêu một hồ sơ khác. Chỉ nhận cho hồ sơ đang QC_PENDING và đã có lệnh sửa; SHALL lưu kết quả (PASSED / FAILED), ghi chú, QC viên là tài khoản đang đăng nhập (MUST NOT lấy theo tên client gửi), thời điểm, và ghi nhật ký QC_PASSED hoặc QC_FAILED.

#### Scenario: QC cho hồ sơ chưa sửa xong
- **WHEN** ghi kết quả QC cho hồ sơ không ở QC_PENDING
- **THEN** hệ thống từ chối

#### Scenario: Ghi nhật ký QC
- **WHEN** QC viên ghi kết quả cho hồ sơ QC_PENDING
- **THEN** nhật ký ghi kết quả, ghi chú và tên QC viên

#### Scenario: Hồ sơ trong body khác đường dẫn
- **WHEN** gửi kết quả QC theo đường dẫn của hồ sơ X nhưng body ghi mã hồ sơ Y
- **THEN** hệ thống từ chối, cả X và Y đều không đổi trạng thái hay kết quả QC

#### Scenario: Body không ghi mã hồ sơ
- **WHEN** gửi kết quả QC theo đường dẫn của hồ sơ X đang QC_PENDING, body không có mã hồ sơ
- **THEN** kết quả được ghi cho hồ sơ X

#### Scenario: QC viên lấy theo tài khoản đăng nhập
- **WHEN** QC viên đăng nhập tài khoản "Lê Thị C" ghi kết quả, yêu cầu gửi kèm tên QC viên "Frontend QC"
- **THEN** lệnh sửa và nhật ký ghi QC viên là "Lê Thị C"
