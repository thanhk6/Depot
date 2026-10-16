# qc-inspection Specification

## Purpose

Nghiệm thu chất lượng container sau sửa chữa: ghi kết quả đạt / không đạt kèm người kiểm tra, quyết định container được xuất hay phải sửa lại, và báo hãng tàu khi kết nối đã sẵn sàng.

## Requirements

### Requirement: Ghi kết quả QC
Hệ thống SHALL chỉ nhận kết quả QC cho hồ sơ đang QC_PENDING và đã có lệnh sửa; SHALL lưu kết quả (PASSED / FAILED), ghi chú, người kiểm tra, thời điểm và ghi nhật ký QC_PASSED hoặc QC_FAILED.

#### Scenario: QC cho hồ sơ chưa sửa xong
- **WHEN** ghi kết quả QC cho hồ sơ không ở QC_PENDING
- **THEN** hệ thống từ chối

#### Scenario: Ghi nhật ký QC
- **WHEN** QC viên ghi kết quả cho hồ sơ QC_PENDING
- **THEN** nhật ký ghi kết quả, ghi chú và tên QC viên

### Requirement: Kết quả QC quyết định bước tiếp theo
QC đạt SHALL chuyển hồ sơ sang READY_FOR_OUT (hoặc CLEANING nếu còn lệnh vệ sinh chưa bàn giao); QC không đạt SHALL đưa hồ sơ về REPAIRING để sửa lại.

#### Scenario: QC đạt
- **WHEN** QC đạt cho hồ sơ không còn lệnh vệ sinh dở dang
- **THEN** hồ sơ chuyển READY_FOR_OUT

#### Scenario: QC không đạt
- **WHEN** QC không đạt
- **THEN** hồ sơ về REPAIRING và lệnh sửa ghi FAILED

### Requirement: Màn QC hiện đúng container thuộc phân hệ QC
Màn QC SHALL hiện container đang chờ QC và container đã có kết quả QC (đạt / không đạt theo nhật ký QC gần nhất); container chưa từng vào QC MUST NOT xuất hiện.

#### Scenario: Container chưa sửa xong
- **WHEN** container đang REPAIRING chưa từng qua QC
- **THEN** container không hiện ở màn QC

### Requirement: Báo hãng tàu sửa xong chỉ sau QC đạt
Gửi sự kiện "sửa xong · QC đạt" tới hãng tàu MUST bị từ chối khi container chưa có lệnh sửa QC đạt. Nút gửi SHALL chỉ hiện khi hãng tàu của container đã được cấu hình và bật kết nối; mỗi lần gửi SHALL lưu nhật ký gửi (nội dung, mã HTTP, phản hồi, thời gian, người gửi).

#### Scenario: Gửi khi QC chưa đạt
- **WHEN** gửi sự kiện QC đạt cho container chưa có kết quả QC đạt
- **THEN** hệ thống từ chối và không gọi hãng tàu

#### Scenario: Hãng tàu chưa cấu hình
- **WHEN** mở container QC đạt thuộc hãng chưa cấu hình kết nối
- **THEN** không hiện nút gửi hãng tàu
