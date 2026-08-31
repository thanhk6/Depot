# 35 — Hãng Tàu

Menu: `shipping_lines` → `MasterDataPage.tsx`, tab tĩnh trong cùng component đã audit ở 23-master-data.md.

## Frontend gọi gì

```ts
masterDataApi.getAll()   // GET /api/MasterData — lấy shippingLines[0] để hiển thị
```

## Đối chiếu backend

Chỉ đọc `shippingLines[0]?.code/name` từ `GET /api/MasterData` (đã audit đúng nhiều lần ở các màn trước:
03, 21, 23) để hiển thị 1 card duy nhất "Danh Mục Hãng Tàu Khai Thác: MAERSK LINE". Phần còn lại của tab
(hạn mức Auto-Approve $150, Free Time 5 ngày, giao thức REST API/WESTIM v2.1) là nội dung tĩnh viết cứng
trong JSX, không đọc/ghi DB — không có form nhập nào nên không có gì để mất dữ liệu, không phải lỗi
tích hợp. Đây là tab demo minh hoạ cấu hình 1 hãng tàu mẫu, không phải danh mục CRUD nhiều hãng tàu
(muốn quản lý nhiều hãng tàu thật phải dùng `MasterDataController` mục `shipping-lines` POST đã có sẵn
ở màn 03 nhưng chưa có UI thêm/sửa nào gọi tới trong toàn bộ frontend).

## Trạng thái: ✅ Xong (đúng những gì đang gọi) — ghi chú thêm

- [x] `GET /api/MasterData` — khớp, không cần sửa
- [ ] `POST /api/MasterData/shipping-lines` (thêm hãng tàu mới) đã có sẵn ở backend nhưng không có UI
      nào trong toàn frontend gọi tới — không phải lỗi, chỉ ghi nhận API chưa được khai thác hết.
- [x] Không cần build lại (không đổi code)
