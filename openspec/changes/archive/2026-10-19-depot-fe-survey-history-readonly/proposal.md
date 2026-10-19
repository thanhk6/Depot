# Proposal

## Why

Ở tab *Lịch sử Giám định* (vừa sửa ở change `depot-fe-survey-history-real`, archive 18/10/2026), nút **Xem chi tiết** (biểu tượng con mắt) mở **form giám định đầy đủ** (`SurveyDetailForm`). Form này vẫn cho:
- sửa mọi ô; thêm / sửa / xoá hư hỏng;
- tải lên / xoá ảnh (gọi API ngay khi bấm);
- bấm *Lưu tạm* và *Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh*.

Như vậy người xem lịch sử có thể vô tình nộp lại phiếu cũ của hồ sơ đang vệ sinh / sửa chữa. Người dùng yêu cầu: *"đây là lịch sử chỉ xem thôi"*. Mở từ lịch sử thì form phải **chỉ xem**: không sửa, không nộp, không chuyển vệ sinh.

## What Changes

- **Form giám định có chế độ chỉ xem** (`readOnly`), bật khi mở từ tab Lịch sử:
  - dải thông báo đầu form: *"Phiếu đã nộp — chế độ chỉ xem"*, kèm số phiếu và trạng thái hồ sơ hiện tại;
  - **ẩn** mọi nút ghi dữ liệu: *Lưu tạm*, *Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh* (thanh trên và thanh dưới), thêm / sửa / xoá hư hỏng, thêm nhanh hư hỏng, tải lên / chụp / xoá ảnh, thêm / xoá dịch vụ vệ sinh;
  - mọi ô nhập, chọn, checkbox, textarea **bị khoá**;
  - **vẫn xem được**: toàn bộ nội dung phiếu, danh sách hư hỏng, ảnh (phóng to), checklist, dịch vụ vệ sinh; nút *Quay lại* về đúng tab Lịch sử.
- **Hàng chờ giám định không đổi:** mở từ hàng chờ vẫn sửa / lưu / hoàn tất như hiện nay.
- Không đổi backend.

## Capabilities

### New Capabilities

(không có)

### Modified Capabilities

- `container-survey`: thêm requirement *xem phiếu từ lịch sử ở chế độ chỉ xem* (không sửa, không lưu, không nộp / chuyển vệ sinh, không tải lên / xoá ảnh), bổ sung cho requirement lịch sử vừa thêm.

## Impact

- **Frontend (`fontend/`):**
  - `modules/survey/pages/SurveyModulePage.tsx`: ghi nhận phiếu đang mở là từ lịch sử (`selectedReadOnly`), truyền `readOnly`; *Quay lại* về tab Lịch sử;
  - `modules/survey/components/SurveyDetailForm.tsx`: prop `readOnly`, ẩn nút ghi, khoá ô nhập, dải thông báo;
  - `components/DamageListTable.tsx`, `components/SurveyPhotoGallery.tsx` (nếu được dùng trong form): prop `readOnly` để ẩn thêm / sửa / xoá / tải lên, giữ xem ảnh.
- **Backend / DB:** không đổi.
- **Ngoài phạm vi:** chặn ở backend việc nộp lại phiếu cho hồ sơ đã rời SURVEYING. Hiện backend chỉ chặn hồ sơ READY_FOR_OUT / GATE_OUT; nên làm ở change `depot-api-*` riêng nếu cần chốt chặn ở server.
