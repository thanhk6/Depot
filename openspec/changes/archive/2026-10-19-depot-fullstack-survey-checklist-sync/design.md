# Design

## Context

- **Danh mục:** cả 2 danh mục dùng bảng `MasterCatalogItems`.
  - `SURVEY_CHECKLIST`: 11 dòng, mã ROOF, FRONT_WALL, LEFT_WALL, RIGHT_WALL, DOOR, FLOOR, FRAME, CORNER_CASTING, UNDERSTRUCTURE, REEFER_UNIT, CLEANING. `JsonData` chứa `defaultStatus`.
  - `DAMAGE_LOCATION`: 15 dòng (DR1, FL1, RF1, SW1, SW2, FW1, CP1, CC1, CR1, TR1, BR1, DS1, DH1, LG1, FP1), seed ở `DbSeeder.SeedCatalogsAsync`, `JsonData` chỉ có `category`.
- **Màn *Danh mục Damage Location*** lưu qua `persistCatalog` với `jsonData = JSON.stringify(item)`, tức lưu nguyên đối tượng. Khi đọc, `SurveyModulePage` chỉ lấy ra `category`.
- **Form giám định (`SurveyDetailForm`):**
  - `ZONE_LOCATION_CODES` gõ cứng mã mẫu cũ, dùng trong `recomputeChecklistFromDamages`;
  - thanh nhập nhanh khởi tạo state `RIGHT_W` / `BENT` / `RP_STR_PANEL` và có 8 nút mẫu;
  - `handleToggleChecklistStatus`: FAIL ở CLEANING đặt CL, ở khu vực khác đặt DM.
  - `DamageFormModal` mặc định `RIGHT_W`.
- **`DepotJobService.SubmitSurveyAsync`** đã có khối kiểm tra đầu hàm (hạng, số lượng, dịch vụ vệ sinh, giám định viên) ném `ArgumentException`, controller trả 400. Checklist lưu nguyên văn từ `surveyVm.Checklist`.

## Goals / Non-Goals

**Goals:**
- Server là nguồn đúng cho checklist: kiểm tra cấu trúc, tự tính số lỗi, chặn mâu thuẫn hư hỏng ↔ khu vực.
- Ánh xạ vị trí → khu vực lấy từ danh mục, không còn ở code.

**Non-Goals:** không sửa phiếu đã lưu; không kiểm tra mã hư hỏng / sửa chữa; không đổi cách tính hạng.

## Decisions

- **Khoá `checklistZone` trong `JsonData` của `DAMAGE_LOCATION`**, giá trị là mã `SURVEY_CHECKLIST` hoặc rỗng.
  - Không thêm cột / bảng nên không cần migration, và màn danh mục tự lưu vì đã lưu nguyên đối tượng.
  - *Phương án khác:* bảng ánh xạ riêng. Bỏ vì quá nặng cho quan hệ 1 vị trí → 1 khu vực.
- **Seeder điền mặc định** cho dòng `DAMAGE_LOCATION` có mã trong bảng dưới và `JsonData` **chưa có** khoá `checklistZone`. Giữ các khoá khác, không đụng dòng admin đã đặt khu vực (kể cả đặt rỗng). Chạy lại nhiều lần không đổi gì.

  | Khu vực | Vị trí |
  | :--- | :--- |
  | ROOF | RF1 |
  | FRONT_WALL | FW1 |
  | LEFT_WALL | SW1 |
  | RIGHT_WALL | SW2 |
  | DOOR | DR1, DS1, DH1, LG1 |
  | FLOOR | FL1 |
  | FRAME | CR1, TR1, BR1 |
  | CORNER_CASTING | CP1, CC1 |
  | UNDERSTRUCTURE | FP1 |
  | REEFER_UNIT, CLEANING | (không vị trí nào; chỉ đánh dấu tay) |

- **Kiểm tra ở `SubmitSurveyAsync`**, áp cho cả nháp và nộp, đặt trong khối kiểm tra đầu hàm trước khi ghi gì:
  1. Tải `SURVEY_CHECKLIST` (đang dùng, chưa xoá) và `DAMAGE_LOCATION` (chưa xoá) một lần.
  2. Mỗi hư hỏng: `LocationCode` phải có trong `DAMAGE_LOCATION`, nếu không thì báo "Mã vị trí 'X' không có trong danh mục".
  3. Checklist: tập mã gửi lên phải đúng bằng tập mã danh mục, không trùng; trạng thái thuộc {PASS, FAIL, NA}.
  4. Đếm hư hỏng theo `checklistZone` của vị trí. Khu vực có số lỗi > 0 mà trạng thái ≠ FAIL thì báo "Khu vực <tên> đang có N hư hỏng, phải là Không Đạt".
  5. Khi lưu: `DamageCount` lấy theo số đếm ở bước 4, `ZoneName` lấy theo danh mục (`NameVi`, nếu trống thì `Name`).
  - Nháp cũng bị kiểm tra, vì form luôn gửi đủ 11 khu vực từ mẫu danh mục. Cho nháp lỏng hơn chỉ dời lỗi sang lúc nộp.
- **Frontend:**
  - `DamageLocationMasterItem.checklistZone?: string`. `SurveyModulePage` đọc từ `JsonData`. Màn danh mục thêm ô chọn "Khu vực checklist", danh sách lấy từ `SURVEY_CHECKLIST` qua `fetchSurveyChecklistTemplate`, có lựa chọn "(không gắn)".
  - `recomputeChecklistFromDamages(checklist, damages, locations)` dùng `checklistZone` của danh mục, bỏ `ZONE_LOCATION_CODES`.
    - Giữ quy tắc cũ: khu vực có lỗi thì FAIL; khu vực do hệ thống đặt FAIL (số lỗi > 0) mà hết lỗi thì về PASS; khu vực tick tay FAIL (số lỗi 0) giữ nguyên.
  - Thanh nhập nhanh: bỏ 8 nút mẫu. State khởi tạo rỗng; khi danh mục tải xong mà state rỗng / không còn trong danh mục thì đặt bằng dòng đầu của danh mục. Nút "+ Thêm Mã Lỗi" khoá khi chưa có danh mục. `DamageFormModal` cũng vậy (mặc định dòng đầu `locations`).
  - `handleToggleChecklistStatus`: FAIL ở CLEANING chỉ đổi AV → CL; FAIL ở khu vực khác đặt DM; PASS / NA không đổi phân loại.
  - Lỗi 400 từ server hiện nguyên thông báo như các lỗi kiểm tra hiện có.

## Risks / Trade-offs

- **Nháp đang dở có mã vị trí cũ (`RIGHT_W`…) sẽ bị chặn lưu** → thông báo nêu rõ mã. Giám định viên chọn lại vị trí trong form. Trên local không còn nháp nào như vậy; trên VPS cần kiểm tra trước khi deploy (ghi ở Migration Plan).
- **Admin đổi / xoá khu vực của một vị trí** làm phiếu cũ (đã nộp) lệch với quy tắc mới → không ảnh hưởng: phiếu đã nộp không bị kiểm tra lại, lịch sử chỉ xem.
- **Danh mục `SURVEY_CHECKLIST` thêm / tắt khu vực** làm nháp đang mở (giữ checklist cũ) bị từ chối → thông báo nêu khu vực thiếu / thừa. Hiếm gặp, chấp nhận.

## Migration Plan

- Không có migration EF Core. Seeder chạy khi BackendApi khởi động và tự điền `checklistZone`.
- Trước khi deploy VPS (khi được yêu cầu): truy vấn hồ sơ đang SURVEYING có hư hỏng dùng mã vị trí ngoài danh mục để báo người dùng.
- Rollback: deploy lại image trước. Khoá `checklistZone` thừa trong `JsonData` vô hại với bản cũ.
