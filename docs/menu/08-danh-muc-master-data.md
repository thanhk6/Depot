# DANH MỤC MASTER DATA

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Tất Cả Danh Mục](#tất-cả-danh-mục) | `master_data` | `ContainerTypeMaster` |
| [DM Phòng Ban Depot](#dm-phòng-ban-depot) | `departments` | `DepartmentMaster` |
| [Cước Nâng Hạ (LoLo)](#cước-nâng-hạ-lolo) | `tariff_lolo` | `LoloTariffMaster` |
| [Cước Lưu Bãi (Storage)](#cước-lưu-bãi-storage) | `tariff_storage` | `StorageTariffMaster` |
| [Biểu Phí Vệ Sinh Container](#biểu-phí-vệ-sinh-container) | `cleaning_tariffs` | `CleaningMaster` |
| [DM Loại Container (ISO)](#dm-loại-container-iso) | `container_types` | `ContainerTypeMaster` |
| [DM Vị Trí Cấu Kiện](#dm-vị-trí-cấu-kiện) | `damage_locations` | `DamageLocationMaster` |
| [DM Mã Hư Hỏng IICL](#dm-mã-hư-hỏng-iicl) | `damage_codes` | `DamageCodeMaster` |
| [DM Phương Án Sửa Chữa](#dm-phương-án-sửa-chữa) | `repair_codes` | `RepairCodeMaster` |
| [DM Phân Hạng Vỏ (Grade)](#dm-phân-hạng-vỏ-grade) | `grades` | `GradeMaster` |
| [DM Tiêu Chuẩn Giám Định](#dm-tiêu-chuẩn-giám-định) | `standards` | `InspectionStandardMaster` |

---

## Tất Cả Danh Mục

Trang tổng hợp mọi danh mục Master Data; mặc định mở DM Loại Container.

### Frontend

- Tab id: `master_data` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'master_data'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `container_types`: `ContainerTypeMaster` — [`fontend/src/modules/masterdata/components/ContainerTypeMaster.tsx`](../../fontend/src/modules/masterdata/components/ContainerTypeMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md)

## DM Phòng Ban Depot

Danh mục phòng ban Depot (catalog `DEPARTMENT`).

### Frontend

- Tab id: `departments` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'departments'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `departments`: `DepartmentMaster` — [`fontend/src/modules/masterdata/components/DepartmentMaster.tsx`](../../fontend/src/modules/masterdata/components/DepartmentMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md)

## Cước Nâng Hạ (LoLo)

Biểu cước nâng hạ (bảng `ServiceTariffs`): VAT, phân loại dịch vụ (nâng hạ vỏ rỗng/có hàng, đảo chuyển, phụ phí đêm, PTI, hải quan, cân); **đơn giá riêng cho từng loại container của DM Loại Container** (bảng `ServiceTariffPrices`, mã loại = `CONTAINER_TYPE.Name`). Cột / ô giá trên màn dựng theo các loại đang dùng của DM; chưa nhập = chưa có giá (lập phiếu cho loại đó bị chặn). Không đổi mã biểu cước sau khi tạo.

### Frontend

- Tab id: `tariff_lolo` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'tariff_lolo'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `tariff_lolo`: `LoloTariffMaster` — [`fontend/src/modules/masterdata/components/LoloTariffMaster.tsx`](../../fontend/src/modules/masterdata/components/LoloTariffMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.createServiceTariff` | POST | `/api/MasterData/service-tariffs` | `MasterData.CreateServiceTariff` | `MasterDataService.CreateServiceTariffAsync` | `ServiceTariffs` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateServiceTariff` | DELETE | `/api/MasterData/service-tariffs/{id}` | `MasterData.DeleteServiceTariff` | `MasterDataService.DeactivateServiceTariffAsync` | `ServiceTariffs` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.updateServiceTariff` | PUT | `/api/MasterData/service-tariffs/{id}` | `MasterData.UpdateServiceTariff` | `MasterDataService.UpdateServiceTariffAsync` | `ServiceTariffs` |

### Ghi chú

- `Tạm ngưng` = `IsActive=false` (vẫn thấy ở màn quản trị), `Xóa` = `IsDeleted=true`.
- Phụ phí ca đêm: biểu cước có `ApplicableShift = NIGHT_SURCHARGE` (tự suy từ phân loại *Phụ phí đêm*); chọn thêm trên phiếu dịch vụ, không tự áp theo giờ. Máy tính cước đã bỏ (20/10/2026).

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md), [frontend-tariff-catalog-split.md](../backend-progress/../frontend-tariff-catalog-split.md)

## Cước Lưu Bãi (Storage)

Biểu cước lưu bãi lũy tiến theo ngày — bảng `StorageTariffRules` (quy tắc) + `StorageTariffTier` (bậc) + `StorageTariffTierPrices` (bậc × mã loại container → đơn giá/ngày), API `/MasterData/storage-tariffs` (`?includeInactive=true` để lấy cả quy tắc tạm ngưng). Từ 20/10/2026 (`depot-fullstack-storage-tariff-pricing`):

- **Hãng tàu** lấy từ DM Hãng Tàu (hoặc **Mọi hãng tàu** = `ALL`); mỗi hãng tối đa **1 quy tắc đang dùng**. Bỏ phân loại nhóm container và USD (luôn VND/Cont/Ngày).
- **Ngày miễn phí** chỉ khai ở *Số ngày miễn phí*; bậc đầu bắt đầu ngày *miễn phí + 1*, các bậc **liền nhau** (từ ngày tự tính), bậc cuối để trống *đến ngày*.
- **Đơn giá mỗi bậc theo từng loại** đang dùng của DM Loại Container; ô trống = chưa có giá cho loại đó.
- *Tạm Ngưng* vẫn hiện để bật lại; nút xoá = xoá mềm; không đổi mã sau khi tạo; điều chỉnh % chỉ áp quy tắc đang dùng trong bộ lọc, có xác nhận.
- Hệ thống dùng biểu cước này để tính phí lưu bãi khi Gate-Out (`GET /DepotJobs/{id}/storage-fee`), xem `docs/quy-trinh-van-hanh-depot.md` mục 11. Phiếu dịch vụ không còn dòng lưu bãi.
- Dữ liệu cũ: giá 6 cột (20 / 40 / 45 khô, 20 / 40 lạnh, đặc biệt) đã chép sang từng loại; quy tắc test đã xoá; chỉ `STOR_DRY_STANDARD` (Mọi hãng, miễn phí 5 ngày, từ ngày 6: 20' khô 35.000, 40GP / 40HC 60.000) đang dùng, các quy tắc khác tạm ngưng.

### Frontend

- Tab id: `tariff_storage` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'tariff_storage'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `tariff_storage`: `StorageTariffMaster` — [`fontend/src/modules/masterdata/components/StorageTariffMaster.tsx`](../../fontend/src/modules/masterdata/components/StorageTariffMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.createStorageTariff` | POST | `/api/MasterData/storage-tariffs` | `MasterData.CreateStorageTariff` | `MasterDataService.CreateStorageTariffAsync` | `StorageTariffRules` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateStorageTariff` | DELETE | `/api/MasterData/storage-tariffs/{id}` | `MasterData.DeleteStorageTariff` | `MasterDataService.DeactivateStorageTariffAsync` | `StorageTariffRules` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.updateStorageTariff` | PUT | `/api/MasterData/storage-tariffs/{id}` | `MasterData.UpdateStorageTariff` | `MasterDataService.UpdateStorageTariffAsync` | `StorageTariffRules`, `StorageTariffTier` |

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md), [frontend-tariff-catalog-split.md](../backend-progress/../frontend-tariff-catalog-split.md)

## Biểu Phí Vệ Sinh Container

Biểu phí vệ sinh container — bảng riêng `CleaningTariffs` + `CleaningTariffPrices` (API `/MasterData/cleaning-tariffs`, thay catalog `CLEANING_TARIFF` cũ từ 20/10/2026): **đơn giá riêng cho từng loại container của DM Loại Container**, VAT, nhóm dịch vụ, bên chịu phí mặc định, hoá chất, thời gian. Cột / ô giá trên màn dựng theo các loại đang dùng của DM; mỗi lần lưu chỉ ghi đúng 1 dòng; không đổi mã sau khi tạo; điều chỉnh % chỉ áp dịch vụ đang dùng trong bộ lọc. Đã bỏ mục "đơn giá thoả thuận theo hãng tàu".

### Frontend

- Tab id: `cleaning_tariffs` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'cleaning_tariffs'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `cleaning_tariffs`: `CleaningMaster` — [`fontend/src/modules/masterdata/components/CleaningMaster.tsx`](../../fontend/src/modules/masterdata/components/CleaningMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md)

## DM Loại Container (ISO)

DM Loại Container ISO 6346 (catalog `CONTAINER_TYPE`): `Code` = mã ISO (22G1…), `Name` = mã loại (20GP, 40HC…), thông số kích thước/tải trọng trong `JsonData`.

### Frontend

- Tab id: `container_types` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'container_types'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `container_types`: `ContainerTypeMaster` — [`fontend/src/modules/masterdata/components/ContainerTypeMaster.tsx`](../../fontend/src/modules/masterdata/components/ContainerTypeMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |

### Ghi chú

- Gate-In chỉ nhận các mã loại đang áp dụng ở danh mục này.

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md)

## DM Vị Trí Cấu Kiện

Danh mục vị trí/cấu kiện container theo IICL-6 (catalog `DAMAGE_LOCATION`).

### Frontend

- Tab id: `damage_locations` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'damage_locations'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `damage_locations`: `DamageLocationMaster` — [`fontend/src/modules/survey/components/DamageLocationMaster.tsx`](../../fontend/src/modules/survey/components/DamageLocationMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md)

## DM Mã Hư Hỏng IICL

Danh mục mã hư hỏng IICL (catalog `DAMAGE_CODE`).

### Frontend

- Tab id: `damage_codes` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'damage_codes'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `damage_codes`: `DamageCodeMaster` — [`fontend/src/modules/survey/components/DamageCodeMaster.tsx`](../../fontend/src/modules/survey/components/DamageCodeMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md)

## DM Phương Án Sửa Chữa

Danh mục phương án sửa chữa + đơn giá/giờ công (catalog `REPAIR_CODE`).

### Frontend

- Tab id: `repair_codes` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'repair_codes'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `repair_codes`: `RepairCodeMaster` — [`fontend/src/modules/survey/components/RepairCodeMaster.tsx`](../../fontend/src/modules/survey/components/RepairCodeMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md)

## DM Phân Hạng Vỏ (Grade)

Danh mục phân hạng vỏ (catalog `GRADE`).

### Frontend

- Tab id: `grades` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'grades'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `grades`: `GradeMaster` — [`fontend/src/modules/survey/components/GradeMaster.tsx`](../../fontend/src/modules/survey/components/GradeMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md)

## DM Tiêu Chuẩn Giám Định

Danh mục tiêu chuẩn giám định theo hãng tàu/loại container (catalog `INSPECTION_STANDARD`).

### Frontend

- Tab id: `standards` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'standards'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `standards`: `InspectionStandardMaster` — [`fontend/src/modules/survey/components/InspectionStandardMaster.tsx`](../../fontend/src/modules/survey/components/InspectionStandardMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md)

