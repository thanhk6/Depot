# Proposal

## Why

Kiểm tra phần Checklist 11 khu vực IICL-6 (19/10/2026) cho thấy checklist không phản ánh đúng hư hỏng thật:
- Bảng ánh xạ vị trí → khu vực ở giao diện dùng mã mẫu cũ (`ROOF`, `FRONT_W`…), trong khi danh mục vị trí trong DB là `RF1`, `FW1`, `SW1`… Thêm hư hỏng không làm khu vực nào "Không Đạt". Ví dụ: WHLU4254283 có 2 hư hỏng ở `RF1` nhưng khu vực Nóc vẫn lưu "Đạt".
- Thanh nhập nhanh và form hư hỏng mặc định mã `RIGHT_W` (không có trong danh mục), kèm 8 nút mẫu gõ cứng. Không chỉnh mà bấm thêm thì hư hỏng bị lưu với mã sai.
- Backend nhận mọi checklist: rỗng, thiếu khu vực, mã lạ, trùng, trạng thái lạ, số lỗi âm, có hư hỏng mà khu vực vẫn "Đạt" (9/9 trường hợp sai đều được lưu).
- Bấm "Không Đạt" ở khu vực Vệ sinh hạ phân loại từ DM xuống CL.

## What Changes

- **Danh mục Vị trí hư hỏng (`DAMAGE_LOCATION`)** có thêm thông tin "Khu vực checklist" (một mã của danh mục `SURVEY_CHECKLIST`, có thể để trống).
  - Màn *Danh mục Damage Location* có ô chọn khu vực.
  - 15 vị trí đang có được gán khu vực mặc định khi backend khởi động, **chỉ** điền cho dòng chưa có, không ghi đè cấu hình admin đã sửa. Bảng gán ở design.md.
- **Form giám định**:
  - khu vực có hư hỏng tự chuyển "Không Đạt" và đếm số lỗi theo khu vực của danh mục vị trí, bỏ bảng ánh xạ gõ cứng;
  - bỏ 8 nút mẫu hư hỏng và mã mặc định `RIGHT_W` / `BENT` / `RP_STR_PANEL`; ô chọn mặc định lấy dòng đầu của danh mục thật, và giá trị hiển thị luôn khớp giá trị sẽ lưu;
  - "Không Đạt" ở khu vực Vệ sinh chỉ đổi AV → CL, **không** hạ DM xuống CL.
- **Backend (lưu nháp và nộp phiếu)** trả 400 khi:
  - checklist không đúng các khu vực đang dùng của danh mục `SURVEY_CHECKLIST` (thiếu, thừa, mã lạ, trùng);
  - trạng thái khác PASS / FAIL / NA;
  - hư hỏng dùng mã vị trí không có trong danh mục `DAMAGE_LOCATION`;
  - khu vực có hư hỏng mà không phải FAIL.
- **Backend tự tính lại** số lỗi mỗi khu vực từ danh sách hư hỏng và lấy tên khu vực từ danh mục, không tin số trình duyệt gửi.

## Capabilities

### New Capabilities

(không có)

### Modified Capabilities

- `container-survey`: thêm yêu cầu về checklist khu vực (đủ theo danh mục, đồng bộ với hư hỏng, server tính số lỗi), mã vị trí hư hỏng phải thuộc danh mục, và phân loại CL không ghi đè DM.

## Impact

- **Màn hình:**
  - Giám định → form chi tiết: tab *Nhập & Quản Lý Mã Lỗi Tổn Thất* (thanh nhập nhanh, form hư hỏng) và tab *Checklist 11 Khu Vực*;
  - Giám định → *Danh mục Damage Location*.
- **API:** `POST /DepotJobs/{id}/survey` (lưu nháp + nộp) thêm kiểm tra. Không thêm endpoint, không đổi phân quyền.
- **Code:**
  - `DepotJobService.SubmitSurveyAsync` (kiểm tra + tính lại);
  - `DbSeeder` (điền khu vực mặc định cho `DAMAGE_LOCATION`);
  - `SurveyDetailForm.tsx`, `DamageFormModal.tsx`, `DamageLocationMaster.tsx`, kiểu `DamageLocationMasterItem`.
- **Dữ liệu:**
  - **Không cần migration EF Core**, vì khu vực nằm trong cột `JsonData` sẵn có của `MasterCatalogItems`.
  - Seeder chỉ bổ sung khoá khu vực vào `JsonData` của các dòng `DAMAGE_LOCATION` chưa có (cấu hình danh mục, không phải dữ liệu nghiệp vụ).
- **Ngoài phạm vi:**
  - **Không sửa dữ liệu phiếu thật**. WHLU4254283, SUDU3070783, BMOU1675248 giữ nguyên checklist và mã `RIGHT_W` đã lưu. Các phiếu này đã qua bước giám định nên không bị kiểm tra lại.
  - Không kiểm tra hạng A/B/C/D so với checklist.
  - Không kiểm tra mã hư hỏng / mã sửa chữa thuộc danh mục.
  - Không chặn nộp lại phiếu (thuộc `depot-api-survey-submit-guard`).
  - Không đổi trường "category" đang lệch giữa seed và màn danh mục.
