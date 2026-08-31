# 22 — Kho Vật Tư Sửa Chữa EMR

Menu: `warehouse` → `WarehousePage.tsx`, xác nhận qua `App.tsx` (`case 'warehouse'`). Module lớn (24
file: catalog, groups, suppliers, receipts, issues, returns, adjustments, stocktakes, damages, reports).

## Hiện trạng trước khi sửa (đã audit ở vòng đầu)

`GET/POST /api/MasterData/materials` và `GET/POST /api/warehouse/transactions` đã đúng, DI đã đăng ký,
`RecordTransactionAsync` tính đúng Before/AfterQuantity. Nhưng: `Material` backend chỉ có 5 field trong
khi frontend cần 17; `stockBalances/receipts/issues/materialGroups/suppliers` trong `WarehousePage.tsx`
không bao giờ được gán dữ liệu (tab mặc định `stock_balance` luôn trống); `StockBalanceTab.tsx` tự import
`warehouseService` (mock in-memory, khớp theo `materialId` số) thay vì dùng `transactions` thật (khớp
theo `materialCode` chuỗi) — kể cả khi có prop đúng cũng không bao giờ ra số liệu đúng.

## Đã làm (2026-08-23, sau khi người dùng xác nhận làm toàn bộ việc lớn còn lại)

**1. Mở rộng `Material` (bảng legacy, thêm cột — an toàn, không đổi khoá/tên bảng):** thêm 12 field còn
thiếu (`MaterialGroupCode, MaterialType, Specification, Brand, Manufacturer, Barcode, MinimumStock,
MaximumStock, ReorderLevel, AverageCost, LastPurchaseCost, IsActive`). `RecordTransactionAsync` giờ cũng
cập nhật `Material.StockQuantity` + `AverageCost` (bình quân gia quyền) + `LastPurchaseCost` mỗi khi có
giao dịch RECEIPT — trước đây các cột này không được ghi.

**2. Entity mới** (`Depot.Data/Entities/Inventory/`, khóa `long`, theo `00b-quy-tac-tao-bang.md`):
`MaterialGroup` (11 nhóm cấu kiện, đã seed), `Supplier` (đã seed 3 NCC mẫu). Thêm cột
`MaterialStockTransaction.SupplierCode` (nullable) để phiếu nhập biết nhập từ NCC nào.

**3. "Chứng từ" Receipt/Issue — KHÔNG tạo bảng header riêng, gom nhóm giao dịch có sẵn:**
`WarehousePage.tsx` vốn đã gửi nhiều dòng `POST /api/warehouse/transactions` dùng CHUNG 1 `referenceId`
cho 1 lần nhập/xuất (`RECEIPT-{date}-{supplierId}` / `workOrderNo`). `WarehouseService.GetDocumentsAsync()`
gom nhóm `MaterialStockTransaction` theo `(TransactionType, ReferenceType, ReferenceId)` thành
"phiếu" — đúng tinh thần Entity=ViewModel, không tạo `MaterialReceipt`/`MaterialIssue` trùng lặp dữ liệu.

**4. `WarehouseController` (route `api/warehouse`) thêm:** `GET /material-groups`, `GET /suppliers`,
`GET /stock-balances` (tổng hợp tồn kho thật: Quantity từ giao dịch gần nhất, DamagedQuantity từ tổng
giao dịch DAMAGE, StockStatus tính từ ReorderLevel), `GET /receipts`, `GET /issues`.
`MasterDataController` thêm `PUT /materials/{id}` (trước đây chỉ có POST, sửa vật tư không lưu được).

**5. Frontend nối dây thật (`WarehousePage.tsx`, `StockBalanceTab.tsx`):**
- 6 hàm map DTO backend → type frontend đầy đủ (`Material` 17 field, `StockTransaction`, `StockBalance`,
  `MaterialGroup`, `Supplier`, `MaterialReceipt`/`MaterialIssue` từ document gộp).
- `reloadWarehouseData()` nạp cả 6 nguồn (materials, transactions, stockBalances, materialGroups,
  suppliers, receipts, issues) — trước đó chỉ 2/7 được gọi.
- `handleSaveMaterial`: sửa bug gọi `createMaterial` cả khi đang **sửa** (không có `updateMaterial`) —
  giờ gọi đúng POST khi tạo mới, PUT khi sửa, gửi đủ 17 field thay vì 5.
- `handleConfirmReceipt`/`handleConfirmIssue`: sửa bug khớp vật tư sai field (`candidate.materialId`
  không tồn tại trên type `Material` — luôn `undefined`, khớp nhầm qua fallback `candidate.id`); nay khớp
  đúng `candidate.id === item.materialId` và gửi kèm `supplierCode`.
- `StockBalanceTab.tsx`: bỏ hẳn `warehouseService` (mock), nhận `transactions` thật qua prop, khớp theo
  `materialCode` — tab mặc định giờ hiển thị đúng số Tồn Đầu/Tổng Nhập/Tổng Xuất/Tồn Hiện Tại.
- Sửa thêm 1 bug tương tự ở `MaterialStockCardModal` (Thẻ Kho): lọc `transactions` theo
  `t.materialId === mat.id` (luôn rỗng vì `StockTransaction` không có `materialId` thật) → đổi sang khớp
  `materialCode`.
- Build backend + `tsc --noEmit` frontend đều 0 lỗi.

## Còn thiếu (không chặn, ghi nhận để làm sau nếu cần)

- `ReservedQuantity` trong `StockBalance` luôn trả `0` — hệ thống chưa có khái niệm "giữ vật tư cho Work
  Order chưa xuất" (không có bảng `WorkOrderMaterial` thật), khác `DamagedQuantity`/`Quantity` tính được
  từ dữ liệu giao dịch thật. Không tự bịa số.
- `MaterialReturn`, `StockAdjustment`, `Stocktake`, `MaterialDamage` (4 workflow còn lại trong
  `types.ts`) **chưa được audit là hỏng ở vòng đầu** (không nằm trong "Vấn đề phát hiện" gốc) nên chưa
  đụng tới ở đợt này — về mặt kỹ thuật có thể dùng lại đúng kỹ thuật gom nhóm giao dịch ở mục 3 (vì
  `TransactionType` đã hỗ trợ sẵn `RETURN/ADJUSTMENT_IN/ADJUSTMENT_OUT/DAMAGE`), làm sau nếu người dùng
  cần.
- `MaterialGroupsTab.tsx`/`SuppliersTab.tsx` (2 màn quản lý danh mục riêng) tồn tại trong code nhưng
  **không được `WarehousePage.tsx` import/render** — không phải lỗi mới phát sinh, ghi nhận lại tương tự
  `GET /api/system/menus` mồ côi ở màn System (#53).

## Trạng thái: ✅ Xong (Material mở rộng đủ field, tồn kho + phiếu nhập/xuất lấy từ dữ liệu thật, build sạch)

- [x] `GET/POST /api/MasterData/materials`, `GET/POST /api/warehouse/transactions` — vẫn đúng, đã mở
      rộng thêm `PUT /materials/{id}` và ghi `StockQuantity/AverageCost` khi có giao dịch.
- [x] Tab "Nhập-Xuất-Tồn" (mặc định) hiển thị đúng số liệu thật.
- [x] `StockBalanceTab.tsx` dùng dữ liệu thật, không còn mock `warehouseService`.
- [x] `materialGroups`, `suppliers`, `receipts`, `issues` (dạng chứng từ) đã có backend, nối dây thật.
