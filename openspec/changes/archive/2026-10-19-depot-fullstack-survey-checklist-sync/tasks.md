# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 `DbSeeder`: điền `checklistZone` mặc định (bảng trong design.md) cho dòng `DAMAGE_LOCATION` chưa có khoá này, giữ các khoá JSON khác.
  - Kiểm tra: khởi động BackendApi, truy vấn DB thấy 15 dòng có `checklistZone` đúng bảng, `category` còn nguyên.
  - Khởi động lần 2 không đổi `LastModifiedAt`.
- [x] 1.2 `SubmitSurveyAsync` (cả nháp và nộp): kiểm tra mã vị trí thuộc `DAMAGE_LOCATION`; checklist đúng tập mã `SURVEY_CHECKLIST`, không trùng; trạng thái PASS / FAIL / NA; khu vực có hư hỏng phải FAIL. Báo lỗi tiếng Việt nêu mã / khu vực.
  - Kiểm tra: `dotnet build SolutionDepot/SolutionDepot.sln` không lỗi.
- [x] 1.3 Khi lưu `SurveyChecklistItem`: `DamageCount` do server đếm theo `checklistZone`, `ZoneName` lấy từ danh mục.
  - Kiểm tra: build không lỗi.
- [x] 1.4 Kiểm thử API (container test `QACK…`, admin), chạy lại 9 trường hợp K1–K9 của đợt kiểm tra:
  - K1–K5, K7 (RF1 + Nóc Đạt) và hư hỏng mã `RIGHT_W` → 400, không lưu gì;
  - K6 / K8 → lưu với số lỗi do server đếm;
  - Gầm FAIL không hư hỏng → lưu, số lỗi 0;
  - phiếu hợp lệ đủ 11 khu vực → 200.

## 2. Frontend (`fontend/`)

- [x] 2.1 `DamageLocationMasterItem.checklistZone`. `SurveyModulePage` đọc từ `JsonData`. Màn *Danh mục Damage Location* thêm ô chọn "Khu vực checklist" (danh sách từ `SURVEY_CHECKLIST` + "(không gắn)") và hiện ở bảng.
  - Kiểm tra: `npx tsc --noEmit -p .` không lỗi.
- [x] 2.2 `SurveyDetailForm`: bỏ `ZONE_LOCATION_CODES`; `recomputeChecklistFromDamages` dùng `checklistZone` của danh mục vị trí; `handleToggleChecklistStatus` theo quy tắc AV → CL, không hạ DM.
  - Kiểm tra: type-check không lỗi.
- [x] 2.3 Thanh nhập nhanh và `DamageFormModal`: bỏ 8 nút mẫu và mã mặc định gõ cứng. Mặc định dòng đầu của danh mục khi tải xong; khoá nút thêm khi chưa có danh mục.
  - Kiểm tra: type-check không lỗi; `grep` không còn `RIGHT_W` / `RP_STR_PANEL` trong `modules/survey/components`.

## 3. Kiểm thử (giao diện http://127.0.0.1:3000, admin, container `QACK…`)

- [x] 3.1 Mở `QACK…` từ hàng chờ, bấm "+ Thêm Mã Lỗi" không đổi ô Vị trí → hư hỏng mang đúng mã đang hiện. Chọn RF1 thêm hư hỏng → Nóc "Không Đạt · 1 lỗi". Xoá → Nóc về "Đạt".
- [x] 3.2 Phân loại DM + "Không Đạt" Vệ sinh → vẫn DM. Phân loại AV + "Không Đạt" Vệ sinh → CL. Lưu nháp thành công; DB lưu số lỗi đúng.
- [x] 3.3 Màn danh mục: đổi khu vực của một vị trí rồi đổi lại như cũ → lưu được, form giám định dùng khu vực mới. Kết thúc phải trả về giá trị ban đầu.
- [x] 3.4 Phiếu thật mở từ Lịch sử vẫn hiện bình thường (chỉ xem). Ảnh chụp DB của SUDU3070783, BMOU1675248, WHLU4254283 trước / sau giống hệt.
- [x] 3.5 Dọn dữ liệu test: xoá hồ sơ / phiếu / hư hỏng / checklist / nhật ký / khoá của `QACK…`; xác nhận DB không còn bản ghi test và danh mục `DAMAGE_LOCATION` đúng như sau bước 1.1.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-survey-checklist-sync`; cập nhật đoạn giám định trong `docs/quy-trinh-van-hanh-depot.md` (checklist tự theo hư hỏng; admin gắn khu vực ở danh mục vị trí).
- Trước khi deploy VPS: kiểm tra nháp SURVEYING có mã vị trí ngoài danh mục (design.md → Migration Plan).
