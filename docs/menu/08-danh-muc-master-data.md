# DANH MỤC MASTER DATA

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Tất Cả Danh Mục](#tất-cả-danh-mục) | `master_data` | `ContainerTypeMaster` |
| [DM Phòng Ban Depot](#dm-phòng-ban-depot) | `departments` | `DepartmentMaster` |
| [Cước Nâng Hạ (LoLo)](#cước-nâng-hạ-lolo) | `tariff_lolo` | `LoloTariffMaster` |
| [Cước Lưu Bãi (Storage)](#cước-lưu-bãi-storage) | `tariff_storage` | `StorageTariffMaster` |
| [Máy Tính Cước Nâng Hạ & Lưu Bãi](#máy-tính-cước-nâng-hạ--lưu-bãi) | `tariff_calculator` | `TariffCalculatorPage` |
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

Biểu cước nâng hạ (bảng `ServiceTariffs`): giá theo kích cỡ, VAT, phân loại dịch vụ (nâng hạ vỏ rỗng/có hàng, đảo chuyển, phụ phí đêm, PTI, hải quan, cân).

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
- Phụ phí ca đêm của Máy tính cước tìm theo `ApplicableShift = NIGHT_SURCHARGE` (tự suy từ phân loại).

Lịch sử rà soát & sửa lỗi: [23-master-data.md](../backend-progress/23-master-data.md), [frontend-tariff-catalog-split.md](../backend-progress/../frontend-tariff-catalog-split.md)

## Cước Lưu Bãi (Storage)

Biểu cước lưu bãi lũy tiến theo ngày (bảng `StorageTariffRules` + `StorageTariffTiers`).

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

## Máy Tính Cước Nâng Hạ & Lưu Bãi

Máy tính cước nâng hạ + lưu bãi dựa trên 2 biểu cước trên.

### Frontend

- Tab id: `tariff_calculator` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'tariff_calculator'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `tariff_calculator`: `TariffCalculatorPage` — [`fontend/src/modules/masterdata/components/TariffCalculatorPage.tsx`](../../fontend/src/modules/masterdata/components/TariffCalculatorPage.tsx)
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

## Biểu Phí Vệ Sinh Container

Biểu phí vệ sinh container (catalog `CLEANING_TARIFF`): đơn giá theo loại container, hóa chất, thời gian.

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

