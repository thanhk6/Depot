# KHÁCH HÀNG & ĐỐI TÁC

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Khách Hàng (Trucking & FWD)](#khách-hàng-trucking--fwd) | `customer_list` | `CustomerPage` |
| [DM Phân Loại Khách Hàng](#dm-phân-loại-khách-hàng) | `customer_classifications` | `CustomerClassificationMaster` |
| [Hãng Tàu (Maersk Line)](#hãng-tàu-maersk-line) | `shipping_lines` | `ShippingLineMaster` |

---

## Khách Hàng (Trucking & FWD)

Khách hàng vận tải / forwarder (bảng `CustomerCompanies`) kèm tài khoản cổng khách hàng, tài xế, phương tiện, booking.

### Frontend

- Tab id: `customer_list` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'customer_list'`).
- Trang: `CustomerPage` — [`fontend/src/modules/customer/pages/CustomerPage.tsx`](../../fontend/src/modules/customer/pages/CustomerPage.tsx)

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.createGateIn` | POST | `/api/DepotJobs/gate-in` | `DepotJobs.CreateGateIn` | `DepotJobService.CreateGateInJobAsync` | `MasterCatalogItems`, `ShippingLines`, `depot_jobs`, `Users`, `AuditLogs` |
| `containerApi.getAll` | GET | `/api/DepotJobs` | `DepotJobs.GetAllJobs` | `DepotJobService.GetAllJobsAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `containerApi.updateStatus` | PATCH | `/api/DepotJobs/{id}/status` | `DepotJobs.UpdateStatus` | `DepotJobService.UpdateJobStatusAsync` | `depot_jobs`, `RepairOrders`, `AuditLogs` |
| `customerApi.create` | POST | `/api/customers` | `Customers.Create` | `MasterDataService.CreateCustomerAsync` | `CustomerCompanies` |
| `customerApi.createDriver` | POST | `/api/customers/drivers` | `Customers.CreateDriver` | `MasterDataService.CreateDriverAsync` | `CustomerDrivers` |
| `customerApi.createUser` | POST | `/api/customers/users` | `Customers.CreateUser` | `MasterDataService.CreatePortalUserAsync` | `CustomerPortalUsers` |
| `customerApi.createVehicle` | POST | `/api/customers/vehicles` | `Customers.CreateVehicle` | `MasterDataService.CreateVehicleAsync` | `CustomerVehicles` |
| `customerApi.deactivateUser` | DELETE | `/api/customers/users/{id}` | `Customers.DeleteUser` | `MasterDataService.DeactivatePortalUserAsync` | `CustomerPortalUsers` |
| `customerApi.getAll` | GET | `/api/customers` | `Customers.GetAll` | `MasterDataService.GetCustomersAsync` | `CustomerCompanies` |
| `customerApi.getBookings` | GET | `/api/customers/{customerCode}/bookings` | `Customers.GetBookings` | `MasterDataService.GetBookingsAsync` | `CustomerBookings` |
| `customerApi.getDrivers` | GET | `/api/customers/{customerCode}/drivers` | `Customers.GetDrivers` | `MasterDataService.GetDriversAsync` | `CustomerDrivers` |
| `customerApi.getUsers` | GET | `/api/customers/{customerCode}/users` | `Customers.GetUsers` | `MasterDataService.GetPortalUsersAsync` | `CustomerPortalUsers` |
| `customerApi.getVehicles` | GET | `/api/customers/{customerCode}/vehicles` | `Customers.GetVehicles` | `MasterDataService.GetVehiclesAsync` | `CustomerVehicles` |
| `customerApi.update` | PUT | `/api/customers/{id}` | `Customers.Update` | `MasterDataService.UpdateCustomerAsync` | `CustomerCompanies` |
| `customerApi.updateDriver` | PUT | `/api/customers/drivers/{id}` | `Customers.UpdateDriver` | `MasterDataService.UpdateDriverAsync` | `CustomerDrivers` |
| `customerApi.updateUser` | PUT | `/api/customers/users/{id}` | `Customers.UpdateUser` | `MasterDataService.UpdatePortalUserAsync` | `CustomerPortalUsers` |

Lịch sử rà soát & sửa lỗi: [33-customer-list.md](../backend-progress/33-customer-list.md)

## DM Phân Loại Khách Hàng

Danh mục phân loại khách hàng (catalog `CUSTOMER_CLASSIFICATION`).

### Frontend

- Tab id: `customer_classifications` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'customer_classifications'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `customer_classifications`: `CustomerClassificationMaster` — [`fontend/src/modules/customer/components/CustomerClassificationMaster.tsx`](../../fontend/src/modules/customer/components/CustomerClassificationMaster.tsx)
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

Lịch sử rà soát & sửa lỗi: [34-customer-classifications.md](../backend-progress/34-customer-classifications.md)

## Hãng Tàu (Maersk Line)

Danh mục hãng tàu (bảng `ShippingLines`).

### Frontend

- Tab id: `shipping_lines` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'shipping_lines'`).
- Trang: `MasterDataPage` — [`fontend/src/modules/masterdata/pages/MasterDataPage.tsx`](../../fontend/src/modules/masterdata/pages/MasterDataPage.tsx)
- Nội dung tab `shipping_lines`: `ShippingLineMaster` — [`fontend/src/modules/masterdata/components/ShippingLineMaster.tsx`](../../fontend/src/modules/masterdata/components/ShippingLineMaster.tsx)
- Props nhận từ `App.tsx`: `initialTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `masterDataApi.createCatalog` | POST | `/api/MasterData/catalog` | `MasterData.CreateCatalog` | `MasterDataService.CreateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.createShippingLine` | POST | `/api/MasterData/shipping-lines` | `MasterData.AddShippingLine` | `MasterDataService.AddShippingLineAsync` | `ShippingLines` |
| `masterDataApi.deactivateCatalog` | DELETE | `/api/MasterData/catalog/{id}` | `MasterData.DeleteCatalog` | `MasterDataService.DeactivateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.deleteShippingLine` | DELETE | `/api/MasterData/shipping-lines/{id}` | `MasterData.DeleteShippingLine` | `MasterDataService.DeactivateShippingLineAsync` | `ShippingLines` |
| `masterDataApi.getAll` | GET | `/api/MasterData/all` | `MasterData.GetAll` | `MasterDataService.GetAllShippingLinesAsync`<br>`MasterDataService.GetAllMaterialsAsync`<br>`MasterDataService.GetCatalogAsync` | `ShippingLines`, `Materials`, `MasterCatalogItems` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `masterDataApi.getServiceTariffs` | GET | `/api/MasterData/service-tariffs` | `MasterData.GetServiceTariffs` | `MasterDataService.GetServiceTariffsAsync` | `ServiceTariffs` |
| `masterDataApi.getShippingLines` | GET | `/api/MasterData/shipping-lines` | `MasterData.GetShippingLines` | `MasterDataService.GetAllShippingLinesAsync` | `ShippingLines` |
| `masterDataApi.getStorageTariffs` | GET | `/api/MasterData/storage-tariffs` | `MasterData.GetStorageTariffs` | `MasterDataService.GetStorageTariffsAsync` | `StorageTariffRules` |
| `masterDataApi.updateCatalog` | PUT | `/api/MasterData/catalog/{id}` | `MasterData.UpdateCatalog` | `MasterDataService.UpdateCatalogItemAsync` | `MasterCatalogItems` |
| `masterDataApi.updateShippingLine` | PUT | `/api/MasterData/shipping-lines/{id}` | `MasterData.UpdateShippingLine` | `MasterDataService.UpdateShippingLineAsync` | `ShippingLines` |

Lịch sử rà soát & sửa lỗi: [35-shipping-lines.md](../backend-progress/35-shipping-lines.md)

