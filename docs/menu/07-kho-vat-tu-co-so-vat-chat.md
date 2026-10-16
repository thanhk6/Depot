# KHO VẬT TƯ & CƠ SỞ VẬT CHẤT

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Kho Vật Tư Sửa Chữa EMR](#kho-vật-tư-sửa-chữa-emr) | `warehouse` | `WarehousePage` |

---

## Kho Vật Tư Sửa Chữa EMR

Kho vật tư sửa chữa: tồn kho, phiếu nhập/xuất, thẻ kho; xuất vật tư theo container đang sửa chữa.

### Frontend

- Tab id: `warehouse` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'warehouse'`).
- Trang: `WarehousePage` — [`fontend/src/modules/warehouse/pages/WarehousePage.tsx`](../../fontend/src/modules/warehouse/pages/WarehousePage.tsx)

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.getAll` | GET | `/api/DepotJobs` | `DepotJobs.GetAllJobs` | `DepotJobService.GetAllJobsAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `masterDataApi.createMaterial` | POST | `/api/MasterData/materials` | `MasterData.AddMaterial` | `MasterDataService.AddMaterialAsync` | `Materials` |
| `masterDataApi.getMaterials` | GET | `/api/MasterData/materials` | `MasterData.GetMaterials` | `MasterDataService.GetAllMaterialsAsync` | `Materials` |
| `masterDataApi.updateMaterial` | PUT | `/api/MasterData/materials/{id}` | `MasterData.UpdateMaterial` | `MasterDataService.UpdateMaterialAsync` | `Materials` |
| `warehouseApi.getIssues` | GET | `/api/warehouse/issues` | `Warehouse.GetIssues` | `WarehouseService.GetDocumentsAsync` | `Materials`, `MaterialStockTransactions` |
| `warehouseApi.getMaterialGroups` | GET | `/api/warehouse/material-groups` | `Warehouse.GetMaterialGroups` | `WarehouseService.GetMaterialGroupsAsync` | `MaterialGroups` |
| `warehouseApi.getReceipts` | GET | `/api/warehouse/receipts` | `Warehouse.GetReceipts` | `WarehouseService.GetDocumentsAsync` | `Materials`, `MaterialStockTransactions` |
| `warehouseApi.getStockBalances` | GET | `/api/warehouse/stock-balances` | `Warehouse.GetStockBalances` | `WarehouseService.GetStockBalancesAsync` | `Materials`, `MaterialStockTransactions` |
| `warehouseApi.getSuppliers` | GET | `/api/warehouse/suppliers` | `Warehouse.GetSuppliers` | `WarehouseService.GetSuppliersAsync` | `Suppliers` |
| `warehouseApi.getTransactions` | GET | `/api/warehouse/transactions` | `Warehouse.GetTransactions` | `WarehouseService.GetTransactionsAsync` | `MaterialStockTransactions` |
| `warehouseApi.recordTransaction` | POST | `/api/warehouse/transactions` | `Warehouse.Record` | `WarehouseService.RecordTransactionAsync` | `MaterialStockTransactions`, `Materials` |

Lịch sử rà soát & sửa lỗi: [22-warehouse.md](../backend-progress/22-warehouse.md)

