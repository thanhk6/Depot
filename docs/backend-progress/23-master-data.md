# 23-32 — MASTER DATA (Tất Cả Danh Mục)

Menu: `master_data` (Tất Cả Danh Mục) + các tab con `departments`, `tariff_services`,
`cleaning_tariffs`, `container_types`, `damage_locations`, `damage_codes`, `repair_codes`, `grades`,
`standards`, `customer_classifications` — tất cả cùng đọc/ghi 1 bảng dùng chung
`MasterCatalogItem` (`CatalogType`/`Code`/`Name`/`NameVi`/`Description`/`JsonData`/`IsActive`/`SortOrder`)
qua `GET/POST/PUT/DELETE /api/MasterData/catalog[/{catalogType}|/{id}]`.

INDEX.md trước đó đánh dấu ✅ cho các dòng #23-32 nhưng chưa từng có file chi tiết riêng — file này bổ
sung, viết khi người dùng yêu cầu "bắt đầu làm phần Master Data + tạo data mẫu trong database".

## Bug thật đã sửa — kiểm tra id sai định dạng (GUID) trong khi id thật là số (`long`)

`MasterCatalogItem : FullAuditedEntity<long>` — id trả về từ API là số nguyên (`1`, `2`, `42`...),
KHÔNG phải Guid. Nhưng 2 nơi ở frontend lại tự ý kiểm tra id theo định dạng GUID 36 ký tự để quyết định
gọi `updateCatalog` (PUT) hay `createCatalog` (POST):

- `fontend/src/modules/masterdata/pages/MasterDataPage.tsx` — hàm `persistCatalog` dùng chung cho hầu hết
  tab Master Data (Container Types, Damage Location/Code, Repair Code, Grade, Standard, Cleaning Tariff,
  Department...). Có fallback tra theo `code` khi tìm remote item nên tác hại được giảm nhẹ (đổi tên/mô tả
  vẫn map đúng qua `code`), NHƯNG dòng xoá (`deactivateCatalog`) không bao giờ được gọi cho item bị xoá
  trên UI — id thật không khớp regex GUID nên **xoá 1 dòng trong Master Data UI không thật sự xoá gì dưới
  DB**, dòng đó tự "sống lại" ở lần tải trang sau.
- `fontend/src/modules/masterdata/components/LiftOnLiftOffAndStorageMaster.tsx` (tab "Cước Nâng Hạ &
  Lưu Bãi", `SERVICE_TARIFF`/`STORAGE_TARIFF`) — hàm `isRealCatalogId` KHÔNG có fallback theo code như
  trên. Hậu quả nặng hơn: **mỗi lần sửa 1 tariff đã tồn tại và bấm lưu, code luôn nghĩ đó là item mới**
  → luôn gọi `createCatalog` → tạo thêm 1 dòng trùng lặp trong DB mỗi lần sửa, dòng cũ vẫn còn nguyên
  (không xoá được vì cùng lỗi trên).

Đã sửa cả 2 chỗ: đổi điều kiện từ regex GUID (`/^[0-9a-f-]{36}$/`) sang kiểm tra "toàn số"
(`/^\d+$/`, hàm `isPersistedCatalogId`/`isRealCatalogId` đã sửa), khớp đúng kiểu `long` thật của
`MasterCatalogItem.Id`. `tsc --noEmit` 0 lỗi sau khi sửa.

## Dữ liệu mẫu — trước đây mỗi loại catalog chỉ có 1-5 dòng seed tối thiểu (chỉ đủ test wiring)

`DbSeeder.SeedCatalogsAsync` (`SolutionDepot/2. Domain/Depot.Data/EF/DbSeeder.cs`) đã bổ sung dữ liệu mẫu
thực tế, đúng chuẩn ISO 6346 / IICL-6 phổ biến trong ngành depot container, giữ nguyên toàn bộ dòng seed
cũ (không đổi Code, không phá dữ liệu người dùng đã chỉnh qua UI — seed vẫn idempotent theo
(CatalogType, Code) như thiết kế ban đầu):

| Catalog | Trước | Sau | Ghi chú |
|---|---|---|---|
| `CONTAINER_TYPE` | 2 | 20 | 13 quy cách 20ft (Dry/HC/Reefer/Open Top/Flat Rack/Tank/Ventilated/Bulk/Side Door/Tunnel/Insulated) khớp đúng preset kỹ thuật đã có sẵn ở `ContainerTypeMaster.tsx` (PRESETS_20FT) + 6 quy cách 40ft/45ft mới soạn theo số liệu thực tế ngành. |
| `DAMAGE_LOCATION` | 1 | 15 | Vị trí/cấu kiện chuẩn IICL-6 (Floor, Roof, Side/Front Wall, Corner Post/Casting, Cross/Top/Bottom Rail, Door Sill/Header, Locking Gear, Forklift Pocket...). |
| `DAMAGE_CODE` | 1 | 13 | Mã hư hỏng phổ biến IICL-6 (Hole, Crack, Broken, Bent, Corroded, Missing, Contaminated, Delaminated, Worn, Loose, Scratched, Punctured). |
| `REPAIR_CODE` | 1 | 11 | Phương án sửa chữa (Weld, Replace, Patch, Reinforce, Sandblast & Paint, Clean, Rivet, Overlay, Tighten, Recoat Rubber Seal) kèm đơn giá/giờ công mẫu. |
| `GRADE` | 1 | 4 | Grade A/B/C/D (xuất khẩu / nội địa Cargo Worthy / cần sửa / thanh lý). |
| `INSPECTION_STANDARD` | 1 | 4 | IICL-6, Cargo Worthy (CW), Wind and Water Tight (WWS), As Is. |
| `CLEANING_TARIFF` | 1 | 5 | General, Chemical Wash, Food Grade Wash, Odor Removal, Fumigation — đủ giá theo từng size cont. |
| `SERVICE_TARIFF` (LOLO) | 1 | 6 | Lift On/Off Empty (cũ) + Laden, PTI Reefer, Yard Shift, Customs Supervision, Weighing (VGM). |
| `STORAGE_TARIFF` | 1 | 4 | Dry Standard (cũ) + Reefer, 40/45HC, Special Equipment (Tank/FR/OT). |
| `DEPARTMENT` | 1 | 8 | Gate (cũ) + Survey, Repair (EMR), QC, Warehouse, Yard Operations, Accounting, Admin/HR — có quản lý, SĐT, email, headcount mẫu. |
| `CUSTOMER_CLASSIFICATION` | 5 | 5 | Đã đủ từ trước, không cần bổ sung. |

Field `JsonData` của từng loại được soạn khớp đúng tên field mà frontend đọc (đối chiếu trực tiếp
`MasterDataPage.tsx` dòng `readJson(item.jsonData).xxx` và `LiftOnLiftOffAndStorageMaster.tsx` — không suy
đoán field name).

## Rà riêng sâu hơn — "Cước Nâng Hạ & Lưu Bãi" (SERVICE_TARIFF/STORAGE_TARIFF), theo yêu cầu 2026-08-24

Sau khi seed đợt đầu, người dùng yêu cầu kiểm tra kỹ riêng màn này. Phát hiện thêm 2 vấn đề:

1. **Mã tariff mặc định hardcode ở nhiều nơi (`LOLO_MT_NORMAL`) không tồn tại trong catalog thật** —
   `LiftOnLiftOffAndStorageMaster.tsx` có 3 thẻ KPI + giá trị mặc định của Calculator đều tra cứu cứng
   `tariffCode === 'LOLO_MT_NORMAL'`; module Operation (`operation/mockData.ts`,
   `ServiceOrderFormModal.tsx`) cũng dùng đúng mã này làm dịch vụ nâng hạ chuẩn khi lập phiếu dịch vụ.
   Nhưng catalog seed (cả cũ và đợt seed đầu của tôi) chỉ có `LOLO_EMPTY`/`YARD_SHIFT` — không khớp — nên
   3 thẻ KPI luôn hiện số mặc định hardcode (`280000`/`420000`/`500000`) thay vì đọc catalog thật, và
   Calculator không tìm thấy dịch vụ mặc định. Thêm phát hiện phụ: thiếu hẳn 1 dịch vụ có
   `applicableShift = NIGHT_SURCHARGE`, khiến phụ phí ca đêm trong Calculator luôn tự suy đoán bằng công
   thức `+25%` cứng thay vì đọc biểu giá cấu hình thật (xem `calculationResult` trong file, dòng ~376-387).
   **Đã sửa bằng cách seed đúng 3 mã `LOLO_MT_NORMAL`/`LOLO_YARD_SHIFT`/`LOLO_NIGHT_EXTRA`**, lấy chính xác
   theo dữ liệu tham chiếu có sẵn từ trước ở `fontend/src/modules/masterdata/mockTariffData.ts`
   (`INITIAL_LOLO_TARIFFS`/`INITIAL_STORAGE_TARIFFS`) — file này rõ ràng là dataset gốc được thiết kế cho
   đúng màn này trước khi nối backend, nên dùng lại thay vì tự bịa số liệu mới. Đồng thời bỏ mã
   `YARD_SHIFT` (seed nhầm ở đợt trước, trùng khái niệm với `LOLO_YARD_SHIFT` đúng chuẩn) — đã
   `DELETE /api/MasterData/catalog/{id}` (vô hiệu hóa) dòng đó khỏi DB dev hiện tại.
2. **`STORAGE_TARIFF` seed đợt đầu chỉ có giá phẳng 1 mức, thiếu cấu trúc `tiers` lũy tiến nhiều bậc** mà
   `mockTariffData.ts` đã thiết kế sẵn và component tính Calculator đọc đúng field `tiers[]`. Đã bổ sung
   `STOR_MAERSK_SPECIAL` (ưu đãi theo hãng tàu Maersk, free 7 ngày) và `STOR_OOG_DG` (hàng nguy hiểm/quá
   khổ) với đúng 3 bậc giá lũy tiến theo dữ liệu tham chiếu; giữ nguyên `STOR_REEFER`/`STOR_45HC`/
   `STOR_SPECIAL_EQUIP` (giá phẳng, vẫn hoạt động qua fallback 1-tier của component, không chặn gì).

**Đã verify thật (không chỉ đọc code):**
- Chạy `dotnet run` thật, xác nhận đủ 9 dòng `SERVICE_TARIFF` / 6 dòng `STORAGE_TARIFF` với đúng code kỳ
  vọng, dòng `YARD_SHIFT` cũ đã vô hiệu hóa thành công.
- Mô phỏng đúng luồng "tạo mới → sửa → xoá" mà `LiftOnLiftOffAndStorageMaster.tsx` thực hiện qua
  `persistLolo`: tạo 1 dòng test (`POST /catalog`, id trả về là số `118`), gọi `PUT /catalog/118` (giả lập
  nhánh `isRealCatalogId(id)===true` sau khi sửa bug), đếm lại tổng số dòng **vẫn giữ nguyên 9** (không tăng
  lên 10) — xác nhận bug id-format đã sửa đúng, không còn tạo trùng khi sửa. Gọi `DELETE /catalog/118` xác
  nhận dòng biến mất khỏi danh sách trả về (vô hiệu hóa đúng).
- Tắt tiến trình backend thử nghiệm sau khi verify xong.

## Bug thật thứ 2.5 — màn "Cước Nâng Hạ & Lưu Bãi" crash trắng màn hình lúc mở (2026-08-24)

Người dùng báo "check cước nâng hạ đang lỗi" sau khi seed xong dữ liệu. Rà lại `calculationResult`
(`useMemo` phục vụ tab "Bảng Tính" trong `LiftOnLiftOffAndStorageMaster.tsx`) phát hiện: `loloTariffs`/
`storageRules` khởi tạo là **mảng rỗng** (`useState<...>([])`), chỉ có dữ liệu thật sau khi
`loadTariffs()` trong `useEffect` gọi xong 2 API. Nhưng `useMemo` chạy NGAY khi component mount, không đợi
API — lúc đó `loloTariffs.find(...) || loloTariffs[0]` cho ra `undefined`, và dòng ngay sau đó
(`selectedLolo.price20GP`) đọc property trên `undefined` → `TypeError`, crash trắng cả component ngay khi
mở màn, bất kể đang ở sub-tab nào (LOLO/STORAGE/CALCULATOR) vì hook luôn chạy trước khi JSX được vẽ.

Đây là bug có sẵn từ trước (không phải do các thay đổi hôm nay gây ra) — tồn tại từ lúc màn này được nối
sang tải dữ liệu thật từ backend thay vì dùng thẳng hằng số cục bộ `INITIAL_LOLO_TARIFFS`, nhưng chưa từng
lộ ra vì audit trước đó chỉ so khớp field/endpoint qua đọc code, không thực sự mở màn lên trong lúc mạng
còn đang tải để bắt được khoảnh khắc dữ liệu rỗng.

Đã sửa: thêm 2 hằng số `EMPTY_LOLO_PLACEHOLDER`/`EMPTY_STORAGE_PLACEHOLDER` (đủ field, giá trị 0/rỗng) làm
tầng fallback thứ 3 sau `.find(...)` và `[0]` — chỉ dùng khi dữ liệu thật chưa kịp tải, không bao giờ che
dữ liệu thật vì luôn đứng cuối chuỗi `||`. `tsc --noEmit`: 0 lỗi (khớp đúng toàn bộ field bắt buộc của
`LoLoTariffItem`/`StorageTariffRule`).

## Bug thật thứ 3 — badge số lượng trên Sidebar hardcode cứng, không lấy từ database (2026-08-24)

Người dùng gửi ảnh chụp menu trái, chỉ ra badge số lượng của các mục trong nhóm "DANH MỤC MASTER DATA"
(`DM Phòng Ban Depot: 12 Khối`, `Biểu Phí Vệ Sinh Container: 10 Loại`, `DM Loại Container (ISO): 14 Loại`)
sai lệch với dữ liệu thật vừa seed (8/5/20). Kiểm tra `fontend/src/components/layout/Sidebar.tsx` xác
nhận: TOÀN BỘ các badge này là chuỗi hardcode cứng trong mảng cấu hình `menuGroups`
(`badge: '12 Khối'`...), không hề gọi API nào — con số hoàn toàn không liên quan tới dữ liệu thật, chỉ là
text trang trí lúc thiết kế UI ban đầu. 5 mục còn lại trong nhóm (Vị Trí Cấu Kiện, Mã Hư Hỏng, Phương Án
Sửa Chữa, Grade, Tiêu Chuẩn) thậm chí không có badge nào.

Đã sửa: `Sidebar.tsx` thêm `useEffect` gọi song song `masterDataApi.getCatalog(type)` cho cả 8 loại danh
mục thuộc nhóm này (`DEPARTMENT/CLEANING_TARIFF/CONTAINER_TYPE/DAMAGE_LOCATION/DAMAGE_CODE/REPAIR_CODE/
GRADE/INSPECTION_STANDARD`), đếm số item `isActive`, lưu vào state `masterDataCatalogCounts` rồi build
badge động (`${count} Khối`/`${count} Loại`/...). 1 catalog gọi lỗi không làm hỏng badge của các catalog
khác (mỗi request có `.catch` riêng, trả 0 → tự ẩn badge thay vì hiện số sai). Badge `tariff_services`
("Giá Tiền") giữ nguyên tĩnh vì màn đó gộp 2 catalog (SERVICE_TARIFF + STORAGE_TARIFF), không có 1 con số
tổng phù hợp để hiển thị.

Đã verify thật: chạy backend thật, gọi trực tiếp cả 8 endpoint đếm `isActive:true`, khớp đúng
8/5/20/15/13/11/4/4 — đúng số badge mới sẽ hiển thị. `tsc --noEmit`: 0 lỗi. Backend được để chạy nền sau
khi verify (khác các lần trước) vì người dùng đang trực tiếp xem giao diện qua trình duyệt (frontend dev
server ở cổng 3000 đã bật sẵn, proxy đúng qua cổng 50210).

## Bug thật thứ 4 — 3 tab Master Data "kẹt" dữ liệu rỗng/giả do stale closure của `useState(props)` (2026-08-24)

Người dùng hỏi "Biểu Phí Vệ Sinh Container lấy dữ liệu từ database chưa". Trả lời: **có**, catalog
`CLEANING_TARIFF` đã nối backend thật (`MasterDataPage.tsx` fetch qua `masterDataApi.getCatalog(...)`,
đã seed đủ 5 dòng). Nhưng khi rà kỹ hơn phát hiện 1 bug thật khiến màn này (và 2 màn khác) **thường
xuyên hiển thị sai** dù backend hoàn toàn đúng:

`CleaningMaster.tsx`, `ContainerTypeMaster.tsx`, `DepartmentMaster.tsx` đều copy prop
(`cleaningTariffs`/`containerTypes`/`departments`) vào state cục bộ kiểu
`useState<T[]>(propTuTrenTruyenXuong)` — cú pháp này chỉ đọc giá trị prop **đúng 1 lần duy nhất lúc
component khởi tạo**, không tự đồng bộ lại khi prop cha đổi sau đó. Vì `MasterDataPage` tải dữ liệu qua
`useEffect` bất đồng bộ (chạy SAU lần render đầu), và `cleaning_tariffs` lại là **tab mặc định** của toàn
màn Master Data (`initialTab = 'cleaning_tariffs'`), 3 component con này gần như luôn mount trước khi API
kịp trả về — bắt trọn giá trị rỗng (`[]`) lúc đó, rồi **mãi mãi giữ nguyên rỗng** dù dữ liệu thật đã tải
xong ở component cha, cho tới khi người dùng đổi sang tab khác rồi quay lại (ép unmount/remount).

`DepartmentMaster.tsx` còn nặng hơn: khi prop rỗng lúc khởi tạo, nó fallback sang
`INITIAL_DEPARTMENTS` — **8 phòng ban mẫu hardcode cứng** trong
`fontend/src/modules/masterdata/data/departmentMockData.ts` — nên màn "DM Phòng Ban Depot" không hiện
trống mà hiện **8 phòng ban giả trông như thật**, và cũng không bao giờ tự thay bằng 8 phòng ban thật đã
seed trong Postgres, trừ khi đổi tab qua lại.

Đã sửa cả 3 file: thêm `useEffect(() => setXxx(propXxx), [propXxx])` để đồng bộ lại state cục bộ mỗi khi
prop cha thực sự đổi (an toàn, không đụng vào logic sửa/lưu cục bộ sẵn có — khi người dùng lưu, component
tự gọi `onUpdateXxx` khiến cha cập nhật lại đúng prop đó, effect chạy lại nhưng chỉ set về đúng giá trị đã
có, không có tác dụng phụ). `tsc --noEmit`: 0 lỗi.

**Bài học:** `useState(someProp)` chỉ nên dùng khi prop chắc chắn đã có giá trị đúng ngay từ lần render
đầu tiên (đồng bộ) — với prop đến từ fetch bất đồng bộ ở component cha, luôn cần thêm effect đồng bộ lại,
nếu không state con sẽ "đóng băng" ở đúng giá trị lúc mount, im lặng không báo lỗi gì.

## Ảnh hưởng phụ cần biết — Gate-In lọc lại theo whitelist

Màn Gate-In (`03-gate-in.md`) vừa được nối vào catalog `CONTAINER_TYPE` thật ở lượt trước. Vì catalog giờ
có 20 quy cách nhưng Gate-In (hạ vỏ rỗng) chỉ chấp nhận 6 loại theo whitelist cứng trong
`DepotJobService.ValidateGateInRequest` (`20GP, 40GP, 40HC, 45HC, 20RF, 40RH`), đã thêm 1 lớp lọc phía
frontend (`GateInPage.tsx`, `GATE_IN_ACCEPTED_ISO_SIZES`) để chỉ hiện đúng 6 nút hợp lệ, tránh người dùng
chọn Tank/Flat Rack/Open Top... rồi bị backend từ chối. Danh mục đầy đủ 20 loại vẫn hiển thị nguyên vẹn ở
các màn khác (Master Data, Survey...).

## Đã verify thật (2026-08-24)

- `dotnet build` solution: 0 lỗi. `tsc --noEmit` frontend: 0 lỗi.
- Chạy `dotnet run` thật (Postgres thật), xác nhận `DbSeeder` insert đủ, không exception.
- Gọi thẳng `GET /api/MasterData/catalog/{type}` cho cả 11 loại, đếm đúng số dòng kỳ vọng
  (20/15/13/11/4/4/5/6/4/8/5).
- Tắt tiến trình backend thử nghiệm sau khi verify xong (không để chạy nền ngoài ý người dùng).

## Trạng thái: ✅ Đã sửa bug id-format + đã có dữ liệu mẫu đầy đủ cho toàn bộ 10 catalog thiếu

- [x] Sửa `persistCatalog` (MasterDataPage.tsx) + `isRealCatalogId` (LiftOnLiftOffAndStorageMaster.tsx).
- [x] Bổ sung dữ liệu mẫu 10/11 catalog (trừ `CUSTOMER_CLASSIFICATION` đã đủ).
- [x] Lọc whitelist Gate-In để không vỡ luồng hạ vỏ rỗng sau khi catalog phong phú hơn.
- [ ] Chưa mở rộng thêm `ShippingLine`/`Material`/`Supplier`/`CustomerCompany` (không thuộc bảng
      `MasterCatalogItem`, nằm ở entity riêng) — ngoài phạm vi yêu cầu lần này, có thể làm thêm nếu người
      dùng muốn nhiều dữ liệu mẫu hơn cho các bảng đó.

## Rà lại "DM Loại Container (ISO)" — 4 bug thật (2026-09-29)

Quy ước lưu catalog `CONTAINER_TYPE` (DbSeeder + GateInPage cùng dựa vào): `Code` = mã ISO 6346
(22G1, 45R1…), `Name` = mã loại nội bộ (20GP, 40HC…). Tên tiếng Anh nằm trong `jsonData.name`.

1. **Map ngược Code/Name** (`MasterDataPage.tsx`): UI đọc `typeCode = Code` nên cột "Mã Loại" hiện mã
   ISO, "Tên tiếng Anh" hiện 20HC; lưu thì `code = typeCode`, `name = tên tiếng Anh` → tạo mới/sửa tên
   tiếng Anh làm dòng đó biến mất khỏi Gate-In (GateInPage dò theo `Name`). Sửa: load `typeCode = Name`,
   `isoCode = Code`; `persistCatalog(..., 'isoCode', setItems, 'typeCode')` (thêm tham số `nameKey`).
   DB dev thật: dòng Id=1 (vốn là seed gốc 22G1/20GP) đã bị ghi đè thành `20FR / "20ft Flat Rack…;;;;"`
   → Gate-In mất lựa chọn 20GP.
2. **"Tạm ngưng" = biến mất sau F5**: xóa và tạm ngưng cùng ghi `IsActive=false`, `GET catalog` chỉ trả
   dòng active. Sửa backend: xóa = xóa mềm `IsDeleted`; `GET catalog/{type}?includeInactive=true` (chỉ
   màn quản trị Master Data dùng) trả cả dòng tạm ngưng; tạo lại mã đã xóa mềm thì hồi sinh dòng cũ thay vì
   báo "đã tồn tại". 20BK/20IC hiện đang `IsActive=false` trên DB dev sẽ hiện lại dạng "Tạm ngưng".
3. **Dòng vừa tạo giữ id tạm** ("CT-05"): xóa/tạm ngưng ngay trong phiên không tới DB. `persistCatalog`
   giờ thay id tạm bằng id thật trả về.
4. **Mất dải nhiệt độ Reefer** (`tempRangeMin/Max` không đọc lại từ jsonData; `|| -30` chặn nhập 0°C).
   Kèm: chặn trùng mã loại/mã ISO khi lưu (trùng ISO trước đây ghi đè dòng khác), "Tạo bản sao" sinh mã
   không trùng, 2 header modal còn gradient tối + ô nhiệt độ `text-teal-200` chuyển sang nền sáng.

Verify: `tsc` 0 lỗi ở masterdata; `dotnet build` ra thư mục tạm thành công; chạy backend vá trên cổng
50299 với Postgres thật: default 18 dòng / includeInactive 20; tạo→xóa→ẩn→tạo lại (cùng id)→tạo trùng 400.
Còn lại mã test `ZZ01` ở trạng thái `IsDeleted` trong DB dev (vô hại, không hiện ở đâu).

## Rà lại "Cước Nâng Hạ" (LoloTariffMaster, bảng ServiceTariffs) — 4 bug (2026-09-29)

1. **"Tạm Ngưng" = biến mất** (cùng lỗi với DM Loại Container): xóa và tạm ngưng đều ghi `IsActive=false`,
   `GET service-tariffs` chỉ trả dòng active. Sửa: xóa = `IsDeleted`; `GET service-tariffs?includeInactive=true`
   cho màn quản trị; tạo lại mã đã xóa thì hồi sinh dòng cũ. Calculator/Operation vẫn chỉ nhận dòng đang áp dụng.
2. **Sửa 1 hạng mục là SortOrder về 0** — frontend không gửi `sortOrder`, backend gán thẳng. DB dev: `LOLO_EMPTY`
   đã bị về 0. Giờ load + gửi lại `sortOrder`, tạo mới = max+1.
3. **Phụ phí ca đêm tạo từ UI không bao giờ được dùng** — Calculator tìm `applicableShift === 'NIGHT_SURCHARGE'`,
   form không có ô chọn ca nên luôn lưu `ALL`. Giờ suy ra từ Phân loại.
4. VAT `|| 8` không cho nhập 0%; form tạo mới điền sẵn giá mẫu (280.000…) + mã ngẫu nhiên → bỏ, để 0/trống.

DB dev lúc rà: chỉ `LOLO_EMPTY`, `CUSTOMS_SUPERVISION` còn active; `LOLO_MT_NORMAL`, `LOLO_NIGHT_EXTRA`,
`LOLO_YARD_SHIFT`, `LOLO_LADEN`, `PTI_REEFER`, `WEIGHING`, `TEST_NEW_TABLE` đang `IsActive=false` (bị ẩn) —
sau bản vá sẽ hiện lại dạng "Tạm Dừng". Verify API trên cổng 50299: tạm ngưng → ẩn khỏi mặc định nhưng còn ở
includeInactive; xóa → mất hẳn; tạo lại cùng mã → cùng id; tạo trùng → 400; các dòng khác không đổi.
