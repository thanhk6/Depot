# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 `MasterDataService.ValidateSurveyChecklistAsync` (chỉ `SURVEY_CHECKLIST`):
  - mã `^[A-Z0-9_]{1,40}$`; `defaultStatus` PASS / NA; không đổi mã khi sửa;
  - tạm ngưng / xoá bị chặn khi còn vị trí gắn hoặc là khu vực đang dùng cuối cùng; xoá bị chặn khi đã có trong phiếu;
  - gọi ở Create (kể cả nhánh hồi sinh), Update, Deactivate.
  - Kiểm tra: `dotnet build` BackendApi không lỗi.
- [x] 1.2 Kiểm thử API (admin + 1 tài khoản không có quyền masterdata), danh mục test mã `QA_ZONE…`:
  - tạo hợp lệ → 200; mã sai ký tự / mặc định FAIL → 400; đổi mã ROOF → 400;
  - tạm ngưng DOOR (còn DR1…) → 400 nêu mã vị trí; xoá ROOF (đã có trong phiếu) → 400;
  - tạm ngưng rồi bật lại `QA_ZONE` → 200;
  - tài khoản không quyền → 403.

## 2. Frontend (`fontend/`)

- [x] 2.1 `checklistCatalog.ts`: `resetSurveyChecklistCache()` + cơ chế làm mới cho `useSurveyChecklistTemplate`.
  - `utils/checklistSync.ts`: `mergeChecklistWithTemplate`.
  - Kiểm tra: `npx tsc --noEmit -p .` không lỗi.
- [x] 2.2 Màn `SurveyChecklistMaster.tsx`:
  - bảng (thứ tự, mã, tên VI / EN, mặc định, số vị trí gắn, trạng thái);
  - thêm / sửa (khoá mã) / tạm ngưng / bật lại / xoá, mỗi thao tác gọi 1 API; hiện lỗi server; ghi chú mã CLEANING.
  - Kiểm tra: type-check không lỗi.
- [x] 2.3 Gắn menu:
  - sidebar nhóm *DANH MỤC MASTER DATA* + badge (`catalogTypesByMenuId`);
  - `menuPermissions.ts` `survey_checklist: 'masterdata'`; `App.tsx` case;
  - `MasterDataPage` thẻ trong *Danh mục khai thác & kỹ thuật vỏ* + nhánh render.
  - Kiểm tra: type-check không lỗi.
- [x] 2.4 `SurveyDetailForm`: khi mở ở chế độ sửa thì `mergeChecklistWithTemplate` rồi đồng bộ hư hỏng. Tiêu đề theo số khu vực thật ở form giám định và *Thêm mới giám định*.
  - Kiểm tra: type-check không lỗi.

## 3. Kiểm thử (giao diện http://127.0.0.1:3000, admin)

- [x] 3.1 Sidebar *DANH MỤC MASTER DATA* có "DM Khu Vực Checklist Giám Định" với badge 11; thẻ có ở *Tất Cả Danh Mục*; bảng hiện 11 khu vực, đúng số vị trí gắn (vd Cửa = 4).
- [x] 3.2 Thêm khu vực `QA_ZONE_UI` (mặc định N/A) → hiện trong bảng và ô chọn của *DM Vị Trí Cấu Kiện* (không F5). Sửa tên được, ô mã bị khoá. Tạm ngưng Cửa → thấy thông báo nêu DR1, DS1, DH1, LG1.
- [x] 3.3 Phiếu nháp test `QACL…` lưu với 11 khu vực → thêm `QA_ZONE_UI` → mở lại phiếu: 12 khu vực, tiêu đề "Checklist 12 Khu Vực", Hoàn tất thành công. Tạm ngưng `QA_ZONE_UI` → phiếu mới 11 khu vực.
- [x] 3.4 Phiếu thật từ Lịch sử vẫn hiện đúng checklist đã lưu. Ảnh chụp DB 3 hồ sơ thật trước / sau giống hệt.
- [x] 3.5 Dọn dữ liệu test:
  - xoá hẳn khu vực `QA_ZONE…` (SQL, vì đã có trong phiếu test);
  - xoá hồ sơ / phiếu / lệnh vệ sinh / ảnh / nhật ký của `QACL…` và tài khoản test;
  - xác nhận `SURVEY_CHECKLIST` còn đúng 11 dòng như trước.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-survey-checklist-catalog`. Cập nhật `docs/quy-trinh-van-hanh-depot.md` (admin quản lý khu vực checklist ở Danh mục Master Data).
- Nên archive `depot-fullstack-survey-checklist-sync` trước, vì change này dựa trên yêu cầu của change đó.
