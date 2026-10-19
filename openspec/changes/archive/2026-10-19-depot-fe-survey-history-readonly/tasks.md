# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 Không sửa backend.

## 2. Frontend (`fontend/`)

- [x] 2.1 `SurveyModulePage`:
  - state `selectedReadOnly`; bảng lịch sử mở phiếu bằng `openHistorySurvey` (không gọi khoá phiếu);
  - truyền `readOnly` + callback lưu no-op khi chỉ xem;
  - *Quay lại* từ chế độ xem về tab Lịch sử.
  - Kiểm tra: type-check không lỗi.
- [x] 2.2 `SurveyDetailForm` prop `readOnly`:
  - dải thông báo "Phiếu đã nộp — chế độ chỉ xem";
  - ẩn Lưu tạm / Hoàn Tất (2 thanh) / thêm nhanh hư hỏng / mở form hư hỏng / thêm-xoá dịch vụ vệ sinh / tải lên-xoá ảnh;
  - bọc thân form trong `<fieldset disabled={readOnly}>`, giữ nút Quay lại và xem ảnh dùng được;
  - chặn `if (readOnly) return;` trong các hàm lưu / ảnh.
  - Kiểm tra: type-check không lỗi.
- [x] 2.3 `DamageListTable` và `SurveyPhotoGallery` (nếu dùng trong form) prop `readOnly`: ẩn thêm / sửa / xoá / tải lên, giữ xem ảnh. Kiểm tra: `npx tsc --noEmit -p .` không lỗi.

## 3. Kiểm thử (giao diện http://127.0.0.1:3000, admin)

- [x] 3.1 Mở phiếu thật SUDU3070783 từ tab Lịch sử (chỉ xem, không lưu gì):
  - thấy dải "chế độ chỉ xem";
  - **0** nút có nhãn Lưu / Hoàn Tất / Thêm / Xoá / Tải ảnh;
  - mọi `input` / `select` / `textarea` trong form đều `disabled`;
  - nội dung phiếu hiện đủ (số phiếu, hư hỏng).
- [x] 3.2 Bấm một ảnh (nếu phiếu có ảnh) → phóng to được; Quay lại → về tab Lịch sử. Truy vấn DB: phiếu và hồ sơ SUDU3070783 không đổi (so `Surveys.LastModifiedAt` và trạng thái hồ sơ trước / sau).
- [x] 3.3 Hàng chờ không đổi: tạo container test `QARO…` Gate-In (SURVEYING), mở từ hàng chờ → có nút Lưu tạm / Hoàn Tất, ô nhập sửa được, không có dải chỉ xem.
- [x] 3.4 Dọn dữ liệu test: xoá hồ sơ / phiếu / nhật ký / khoá giám định của `QARO…`; xác nhận DB không còn bản ghi test và 3 hồ sơ thật không đổi.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fe-survey-history-readonly`; bổ sung câu "xem chi tiết ở lịch sử là chỉ xem" vào đoạn *Tra cứu lịch sử* mục 2 trong `docs/quy-trinh-van-hanh-depot.md`.
