# Design

## Context

- **Danh mục:** `SURVEY_CHECKLIST` nằm trong bảng `MasterCatalogItems` (Code, Name, NameVi, SortOrder, IsActive, IsDeleted, `JsonData = {"defaultStatus":"PASS|NA"}`). Seeder chỉ thêm mã chưa có, nên sửa trên màn không bị ghi đè khi khởi động lại.
- **API dùng chung** (quyền `MasterData`):
  - `POST /MasterData/catalog` (tạo, hoặc hồi sinh mã đã xoá mềm);
  - `PUT /MasterData/catalog/{id}` (sửa, kể cả đổi mã);
  - `DELETE /MasterData/catalog/{id}` (xoá mềm).
  - Hiện chỉ có kiểm tra riêng cho `GATE_OUT_SETTING` (`ValidateGateOutSetting`).
- **Nơi dùng danh mục:**
  - `DepotJobService.ValidateAndNormalizeSurveyChecklistAsync` bắt checklist đúng bằng tập khu vực đang dùng;
  - `DAMAGE_LOCATION.JsonData.checklistZone` trỏ tới mã khu vực;
  - frontend đọc qua `fetchSurveyChecklistTemplate` (cache cấp module, không bao giờ làm mới);
  - form giám định lấy checklist đã lưu, nếu trống thì lấy mẫu.
- **`MasterDataPage`:** có `masterGroups` (thẻ ở *Tất Cả Danh Mục*) và render theo `activeMasterTab`. `App.tsx` chuyển các id menu master sang `MasterDataPage initialTab`. Sidebar nhóm *DANH MỤC MASTER DATA* có map `catalogTypesByMenuId` để đếm badge.

## Goals / Non-Goals

**Goals:** admin tự quản lý khu vực checklist mà không phá vị trí đang gắn, phiếu đang dở hay lịch sử.

**Non-Goals:** không thêm endpoint / bảng; không đổi `persistCatalog` của các màn cũ.

## Decisions

- **Kiểm tra trong `MasterDataService`** (`ValidateSurveyChecklistAsync`, gọi ở Create / Update / Deactivate khi `CatalogType = SURVEY_CHECKLIST`), cạnh `ValidateGateOutSetting`.
  - Tạo: mã khớp `^[A-Z0-9_]{1,40}$`.
  - Cả tạo lẫn sửa: `JsonData.defaultStatus` ∈ {PASS, NA}, thiếu thì coi là PASS. Sửa mà mã khác mã cũ thì 400 "Không đổi mã khu vực…".
  - Sửa sang `IsActive = false`, hoặc Delete: từ chối nếu có `DAMAGE_LOCATION` chưa xoá mà `checklistZone` = mã này (nêu mã vị trí), hoặc nếu đây là khu vực đang dùng cuối cùng.
  - Delete còn từ chối nếu `SurveyChecklistItems` có `ZoneKey` = mã này.
  - Tạo lại một mã đã xoá mềm (nhánh hồi sinh có sẵn) vẫn phải qua cùng kiểm tra.
  - *Phương án khác:* endpoint riêng `/survey-checklist`. Bỏ vì thêm phân quyền mới trong khi API chung đã đủ.
- **Màn `SurveyChecklistMaster.tsx`** (`modules/masterdata/components/`), theo khuôn bảng + cửa sổ của các màn danh mục hiện có (theme sáng).
  - Dữ liệu từ `getCatalog('SURVEY_CHECKLIST', { includeInactive: true })`, kèm `getCatalog('DAMAGE_LOCATION')` để đếm "Số vị trí gắn".
  - Mỗi thao tác gọi đúng 1 API của dòng đó (không dùng `persistCatalog`). Ô mã khoá khi sửa.
  - Lỗi 400 hiện nguyên thông báo server. Xong thì tải lại bảng và gọi `resetSurveyChecklistCache()`.
- **Gắn vào menu:**
  - id `survey_checklist`, nhãn "DM Khu Vực Checklist Giám Định", thêm vào sidebar nhóm *DANH MỤC MASTER DATA* (sau *DM Vị Trí Cấu Kiện*) và `catalogTypesByMenuId` (badge);
  - `menuPermissions.ts` `survey_checklist: 'masterdata'`; `App.tsx` thêm case;
  - `MasterDataPage` thêm thẻ trong nhóm *Danh mục khai thác & kỹ thuật vỏ* và nhánh render.
- **Cache frontend:** `checklistCatalog.ts` export `resetSurveyChecklistCache()`. `useSurveyChecklistTemplate` nhận thêm tham số làm mới (hoặc lắng nghe sự kiện `survey-checklist-changed` phát từ màn mới) để *DM Vị Trí Cấu Kiện* và form giám định thấy danh mục mới mà không cần F5.
- **Đồng bộ phiếu nháp:** hàm `mergeChecklistWithTemplate(saved, template)` trong `utils/checklistSync.ts` — giữ khu vực còn trong mẫu (trạng thái đã lưu), thêm khu vực mới của mẫu, bỏ khu vực không còn trong mẫu, sắp theo thứ tự mẫu.
  - `SurveyDetailForm` gọi khi mở ở chế độ sửa (cùng chỗ đồng bộ hư hỏng hiện có), trước `recomputeChecklistFromDamages`. Chế độ chỉ xem không gọi.
- **Tiêu đề:** dùng `formData.checklist.length` / `checklist.length` thay cho số gõ cứng 11 / 9.

## Risks / Trade-offs

- **Admin đổi danh mục khi giám định viên đang mở form** → lần lưu đó bị server từ chối vì thiếu / thừa khu vực, thông báo nêu rõ. Mở lại phiếu thì form tự đồng bộ. Chấp nhận, hiếm gặp.
- **Đếm "Số vị trí gắn" ở frontend có thể lệch** khi có người khác vừa sửa → chỉ để hiển thị; chốt chặn thật là kiểm tra server.
- **Mã `CLEANING` có ý nghĩa riêng** (Vệ sinh → CL). Tạm ngưng nó thì mất tự đổi CL, không gây lỗi. Màn hiện ghi chú cho mã này.
