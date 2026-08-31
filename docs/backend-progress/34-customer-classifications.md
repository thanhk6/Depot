# 34 — DM Phân Loại Khách Hàng

Menu: `customer_classifications` → `MasterDataPage.tsx` render `CustomerClassificationMaster.tsx`
(component riêng module `customer`, cùng họ với các Master component ở nhóm #23-32 nhưng đặt khác thư
mục).

## Frontend gọi gì

```ts
masterDataApi.getCatalog('CUSTOMER_CLASSIFICATION')
masterDataApi.createCatalog/updateCatalog/deactivateCatalog({ catalogType: 'CUSTOMER_CLASSIFICATION', ... })
```

## Đối chiếu backend

Dùng đúng family endpoint catalog đã audit kỹ ở 23-master-data.md — `CUSTOMER_CLASSIFICATION` nằm
trong danh sách catalogType hợp lệ của `MasterDataController`. Cả 3 thao tác (thêm/sửa/xoá phân loại)
đều gọi đúng API, xử lý response `statusCode === 200` chuẩn. ✅

## Trạng thái: ✅ Xong

- [x] `GET/POST/PUT/DELETE /api/MasterData/catalog` (CUSTOMER_CLASSIFICATION) — khớp, không cần sửa
- [x] Không cần build lại (không đổi code)
