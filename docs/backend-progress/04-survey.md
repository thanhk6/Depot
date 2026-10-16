# 04 — 2. Giám Định (Survey e-EIR)

Menu: `survey` → `SurveyModulePage.tsx` (`fontend/src/modules/survey/pages/SurveyModulePage.tsx`) — xác
nhận qua `App.tsx` (`case 'survey': return <SurveyModulePage .../>`). `SurveyPage.tsx` cùng thư mục
**không được route tới**, là file cũ không dùng, không đụng tới.

## Frontend gọi gì

Chỉ 2 lệnh gọi backend thật trong toàn module (đã `grep` toàn bộ `fontend/src/modules/survey`):

```ts
containerApi.getAll({ status: 'SURVEYING' })     // load Survey Queue
surveyApi.submitSurvey(jobId, { ... })           // lưu biên bản giám định + damages
```

10 sub-tab danh mục (`damage_locations`, `damage_codes`, `repair_codes`, `grades`, `standards`,
`cleaning_tariffs`...) chỉ thao tác `useState` cục bộ khởi tạo từ `mockData.ts`, không gọi API — các
danh mục này có backend riêng ở nhóm MASTER DATA (#27-32 trong INDEX.md, chưa tới lượt), sẽ đối chiếu
khi rà tới đó.

## Đối chiếu backend

- `GET /api/DepotJobs?status=SURVEYING` → `DepotJobService.GetAllJobsAsync` đã `Include(ShippingLine)`,
  `Include(Survey).ThenInclude(Damages)` sẵn từ màn 02 → `mapJobToSurvey` đọc `job.survey.damages[]`,
  `job.shippingLineCode` đều có dữ liệu. ✅
- `POST /api/DepotJobs/{id}/survey` → `DepotJobsController.SubmitSurvey` → `SubmitSurveyAsync`: cập nhật
  `Survey` (tạo mới nếu chưa có), xoá/ghi lại `Damages`, chuyển `Status` sang `ESTIMATING` (có damage)
  hoặc `READY_FOR_OUT` (không damage). Response `statusCode: 200` khớp điều kiện frontend kiểm tra. ✅

## Bug đã sửa

1. **`severity` và mô tả (`description`) của từng damage bị mất khi lưu.** `DamageFormModal.tsx` có ô
   chọn "Mức Độ Nghiêm Trọng (Severity)" và ô mô tả cho từng hư hỏng, nhưng `handleSaveSurvey` trong
   `SurveyModulePage.tsx` chỉ gửi `component/locationCode/damageCode/repairCode/quantity/unit/
   laborHours/laborRate/materialCost` lên backend — 2 field người dùng vừa nhập bị bỏ qua hoàn toàn,
   sau khi lưu và tải lại thì mọi damage đều hiện `severity: 'LOW'` mặc định dù người dùng chọn HIGH/
   CRITICAL.
   - Backend: thêm `Severity` (string, mặc định `"LIGHT"`) và `Notes` (string?) vào
     `DamageItemViewModel` (`Depot.ViewModels/DepotJobViewModels.cs`) — entity `DamageItem` đã sẵn có
     2 cột này từ trước nhưng chưa được Service gán giá trị từ request.
   - `DepotJobService.SubmitSurveyAsync`: gán `Severity = d.Severity` (fallback `"LIGHT"` nếu rỗng),
     `Notes = d.Notes` khi tạo `DamageItem`.
   - Frontend `handleSaveSurvey`: gửi thêm `severity: damage.severity, notes: damage.description`.
   - Frontend `mapJobToSurvey`: bỏ bảng quy đổi cũ đoán mò `HEAVY→HIGH / MEDIUM→MEDIUM / else→LOW`
     (không khớp vocab nào backend từng thực sự sinh ra), đọc thẳng giá trị đã lưu, chỉ fallback
     `'LOW'` nếu giá trị không nằm trong 4 mức hợp lệ `LOW/MEDIUM/HIGH/CRITICAL` — round-trip đúng với
     giá trị người dùng chọn trong `DamageFormModal`.
   - Build lại `Depot.BackendApi`: 0 Error (5 warning nullable có sẵn từ trước, không liên quan).

## Bug thật thứ 2 — survey của container đã Gate-In không lưu xuống DB (phát hiện 2026-08-24)

Khi rà lại toàn bộ frontend để tìm bug cùng dạng với Master Data (id-format sai khiến create/update lẫn
lộn), phát hiện `handleSaveSurvey` (`SurveyModulePage.tsx:171`) dùng
`isBackendJob = /^[0-9a-f]{8}-.../i.test(updated.id)` để quyết định có gọi `surveyApi.submitSurvey` hay
không — chỉ gọi API khi `updated.id` khớp định dạng Guid. Nhưng `mapJobToSurvey` (dòng 105) set
`id: String(job.id)`, và `DepotJob.Id` hiện tại là `long` (đã đổi từ Guid sang long qua migration
`ConvertLegacyKeysToLong` — xem [[project-backend-audit]] mục Id-type), tức id thật luôn là chuỗi số
("34", "42"...) chứ không còn là Guid.

**Hậu quả:** với MỌI container đã Gate-In thật (tải qua `GET /DepotJobs?status=SURVEYING`), điều kiện
`isBackendJob` luôn `false` → `handleSaveSurvey` chỉ cập nhật `setSurveys` (state React cục bộ), **không
bao giờ gọi `POST /DepotJobs/{id}/survey`** — người dùng nhập đầy đủ hư hỏng, chọn severity, ghi chú,
bấm lưu, giao diện báo lưu xong (vì state cục bộ đổi ngay), nhưng F5 lại là mất trắng, dữ liệu chưa từng
chạm tới Postgres. Đây là bug nghiêm trọng nhất tìm được trong đợt rà lại này vì im lặng hoàn toàn — không
có lỗi console, không có toast lỗi, giao diện trông như thành công.

Đây là bug **hồi quy sau khi đã audit ✅** — lúc audit gốc (03:39 ngày 2026-08-23) và lúc "chạy thử thật"
(live end-to-end, cùng ngày) đều xác nhận Survey hoạt động đúng, vì tại thời điểm đó `DepotJob.Id` vẫn còn
là Guid (trước khi migration `ConvertLegacyKeysToLong` chạy lúc 13:49 cùng ngày) nên regex khi đó vẫn khớp
đúng. Sau khi đổi kiểu khóa chính, không ai quay lại rà các chỗ frontend tự đoán định dạng id.

Đã sửa: đổi `isBackendJob` sang `/^\d+$/.test(updated.id)` (khớp đúng kiểu `long` thật), record Pre-Survey
tạo tại chỗ trước khi Gate-In (`handleStartSurvey`, id dạng `SURV-XXXXX`) vẫn đúng là `false` như thiết kế
ban đầu (không có backend cho tới khi Gate-In thật).

**Đã verify thật:** `dotnet run` + Postgres thật — tạo Gate-In job mới (`id=34`), gọi
`POST /DepotJobs/34/survey` với payload y hệt `handleSaveSurvey` gửi, `GET /DepotJobs/34` xác nhận
`status` chuyển `SURVEYING → ESTIMATING`, damage lưu đúng `severity: "HIGH"` và `notes`. Endpoint backend
không đổi gì (đã đúng từ trước) — chỉ sửa điều kiện phía frontend.

## Trạng thái: ✅ Xong (đã sửa thêm bug mất dữ liệu Survey do id-format)

- [x] `GET /api/DepotJobs?status=SURVEYING` — khớp, không cần sửa
- [x] `POST /api/DepotJobs/{id}/survey` — sửa mất dữ liệu `severity`/`notes` theo damage
- [x] Sửa `isBackendJob` id-format (GUID→long) khiến survey không lưu xuống DB cho job thật
- [x] Build lại: 0 Error, `tsc --noEmit`: 0 lỗi
- [ ] **Chưa làm:** 10 sub-tab danh mục (damage location/code, repair code, grade, standard, cleaning
      tariff) trong module này dùng mock data cục bộ — đã có backend thật ở nhóm MASTER DATA
      (`docs/backend-progress/23-master-data.md`), nhưng nối dây riêng cho các sub-tab NÀY (trong module
      Survey) vẫn chưa làm — để lại quyết định cho lượt sau nếu người dùng muốn.

## Bug thật thứ 3 — form "Thêm Mới Phiếu Giám Định Container" mất ~20 field khi lưu (phát hiện 2026-09-06)

Rà lại `CreateSurveyModal.tsx` (form "Thêm Mới Phiếu Giám Định Container") theo yêu cầu người dùng: form
thu thập đầy đủ qua 4 tab (Container/Vận Hành/Phân Hạng/Hư Hỏng) nhưng chỉ có 2 nhóm dữ liệu thật sự đi
tới backend (`containerApi.createGateIn` cho tab Vận Hành cơ bản, `surveyApi.submitSurvey` cho
`ConditionRating/Notes/Damages/Cleaning*`) — toàn bộ phần còn lại (~20 field) chỉ tồn tại trong
`newRecord` cục bộ rồi bị bỏ qua hoàn toàn khi build 2 payload trên, mất trắng ngay sau khi nộp phiếu,
không lỗi không cảnh báo — cùng dạng lỗi im lặng với bug thứ 2 ở trên nhưng phạm vi lớn hơn nhiều.

Người dùng chọn phương án sửa triệt để: thêm cột DB cho toàn bộ field, không bỏ field nào.

**Backend:**
- `DepotJob`: thêm `GateInDriverLicense`, `GateInCustomsSealNo` (Gate-In cũng thu thập nhưng thiếu cột).
- `Survey`: thêm 21 cột — `SurveyNo` (backend tự sinh `SRV-{yyyyMMdd}-{6 số ngẫu nhiên}`, không nhận số
  phiếu client tự sinh), `Owner`, `ContainerTypeName`, `ManufactureMonthYear`, `MaxGrossWeightKg`,
  `Material`, `FloorType`, `CscPlateNo`, `Standard`, `StandardNotes`, `QualityGrade`, `ActionRequired`,
  `Shift`, `YardLocationNote`, `CargoStatus`, và 7 field riêng cho Reefer (`ReeferBrand`, `ReeferModel`,
  `ReeferSetTemperatureC`, `PtiStatus`, `CompressorHours`, `HumidityPercent`, `VentilationCmh`).
- `CreateDepotJobRequest`/`DepotJobDto`: thêm `DriverLicense`/`CustomsSealNo` (request) và
  `GateInDriverLicense`/`GateInCustomsSealNo` (dto).
- `SurveyRecordViewModel`/`SurveyDto`: thêm đủ 20-21 field tương ứng.
- `DepotJobService`: `CreateGateInJobAsync` gán 2 field Gate-In mới (null-safe trim giống `GateInSealNo`);
  `SubmitSurveyAsync` gán 20 field Survey mới + tự sinh `SurveyNo` (chỉ khi tạo mới, không sinh lại khi
  sửa/lưu nháp); mapping `DepotJobDto`/`SurveyDto` đọc lại đủ field cho response GET.
- Migration `AddSurveyDetailFieldsAndGateInIdentityFields`: đã tạo và áp dụng vào Postgres thật
  (`dotnet ef database update`).

**Frontend:**
- `types/container.ts` (`SurveyRecord`): thêm 20 field optional khớp `SurveyRecordViewModel`.
- `api/container.api.ts` (`CreateGateInRequest`): thêm `driverLicense?`/`customsSealNo?`.
- `SurveyModulePage.tsx`:
  - `handleCreateNewSurvey` → `createGateIn`: gửi thêm `driverLicense`/`customsSealNo`.
  - `handleSaveSurvey` → `submitSurvey`: gửi thêm 20 field còn lại.
  - `mapJobToSurvey`: đọc lại toàn bộ field mới từ response GET (Gate-In: `truckPlate`, `trailerPlate`,
    `driverName`, `driverPhone`, `sealNo`, `driverLicense`, `customsSealNo`; Survey: 15 field vật lý/vận
    hành/reefer); đồng thời sửa 4 chỗ trước đây đoán/hardcode do chưa có cột lưu thật —
    `surveyNo` giờ đọc `survey.surveyNo` thật (trước đây tạm dùng `survey.id`, không phải số phiếu
    nghiệp vụ), `type`/`owner`/`standard`/`qualityGrade` ưu tiên giá trị đã lưu, fallback y hệt logic cũ
    nếu record cũ (tạo trước migration) chưa có dữ liệu.

**Đã verify thật:** `dotnet build` (0 Error) → tạo migration → `dotnet ef database update` (áp dụng
Postgres thật) → `npx tsc --noEmit` (0 lỗi) → dựng lại `Depot.BackendApi` → gọi trực tiếp
`POST /DepotJobs/gate-in` (kèm `driverLicense`/`customsSealNo`) rồi `POST /DepotJobs/{id}/survey` (kèm đủ
20 field, có cả nhóm Reefer) → `GET /DepotJobs/{id}` xác nhận toàn bộ field trả về đúng giá trị đã gửi,
`surveyNo` tự sinh dạng `SRV-20260907-211231` → dọn dữ liệu test (Gate-Out + xoá mềm job test).

## Trạng thái: ✅ Xong (đã sửa thêm bug mất ~20 field của form Thêm Mới Phiếu Giám Định Container)
