# 25 — Cước Nâng Hạ & Lưu Bãi (tariff_services)

Menu: `tariff_services` → `MasterDataPage.tsx` render `LiftOnLiftOffAndStorageMaster.tsx` (component
riêng, tự quản lý state + gọi API của chính nó, không qua `persistCatalog` của trang cha — xem
23-master-data.md cho các tab khác).

## Frontend gọi gì

```ts
masterDataApi.getCatalog('SERVICE_TARIFF')   // cước nâng hạ (LoLo)
masterDataApi.getCatalog('STORAGE_TARIFF')   // cước lưu bãi
```

Đọc đúng, map field từ `jsonData` sang `LoLoTariffItem`/`StorageTariffRule`.

## Bug đã sửa

**Mọi thao tác sửa/xoá/điều chỉnh hàng loạt cước nâng hạ đều không lưu xuống backend — chỉ đổi state
React, mất khi tải lại trang.** Cụ thể trước khi sửa:
- `handleSaveLolo` (thêm/sửa 1 dòng cước LoLo qua modal form) chỉ gọi `setLoloTariffs` + callback
  `onUpdateTariffs` (callback này cũng không có ai persist — `MasterDataPage.tsx` render component
  không truyền prop `onUpdateTariffs` nào).
- `handleDeleteLolo` chỉ `filter` khỏi state cục bộ.
- `handleApplyBulkAdjust` (nút "Điều chỉnh giá hàng loạt %") tính lại giá cho cả `loloTariffs` lẫn
  `storageRules` nhưng cũng chỉ set state cục bộ.

Vì 3 hành động trên là các nút bấm thật, người dùng thao tác trực tiếp được (không phải code chết) —
đây là lỗi tích hợp thật, không phải tính năng chưa làm.

**Đã sửa:** thêm 2 helper `persistLolo(item)` / `persistStorage(rule)` gọi đúng
`masterDataApi.updateCatalog`/`createCatalog` (catalogType `SERVICE_TARIFF`/`STORAGE_TARIFF`, cùng
family endpoint đã xác nhận đúng ở 23-master-data.md), map `jsonData` khớp chính xác tên field mà
`loadTariffs()` đang parse ngược lại (vd `price40HC` không phải `price40GP_HC`, `freeDays` không phải
`defaultFreeDays` — soi kỹ để round-trip đúng). Gọi các helper này trong cả 3 handler
(`handleSaveLolo`, `handleDeleteLolo`, `handleApplyBulkAdjust`). Item mới tạo được cập nhật lại `id`
thật (Guid) trả về từ backend để các lần sửa/xoá tiếp theo nhận diện đúng bản ghi đã tồn tại (không tạo
trùng).

`tsc --noEmit` toàn bộ frontend: 0 lỗi sau khi sửa.

## Trạng thái: ✅ Xong

- [x] `GET /api/MasterData/catalog/SERVICE_TARIFF`, `.../STORAGE_TARIFF` — khớp, không cần sửa
- [x] Sửa bug: thêm/sửa/xoá/điều chỉnh hàng loạt cước LoLo và Storage nay lưu đúng xuống backend
- [x] `tsc --noEmit` xác nhận không có lỗi kiểu sau khi sửa
- [ ] UI tạo/sửa từng dòng "Cước Lưu Bãi" riêng lẻ (`isStorageModalOpen`, `editingStorage`,
      `storageForm`) có khai báo state nhưng **không có nút nào mở modal này** (`setIsStorageModalOpen`
      không được gọi ở đâu) — code chết có sẵn từ trước, không phải lỗi mới, không sửa vì ngoài phạm vi
      (chỉ sửa cái gì đang thật sự chạy được).
