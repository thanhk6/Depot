# 10 — Quản Lý Vị Trí Block

Menu: `yard_blocks` → `YardBlocksPage.tsx`, xác nhận qua `App.tsx` (`case 'yard_blocks'`).

## Hiện trạng trước khi sửa (đã audit ở vòng đầu)

Không gọi API nào (đã `grep` toàn file). Import thẳng `initialBlocks, initialZones, initialContainers` —
hằng số mock cứng từ `yardApi.ts` — không đọc `containers` prop (dữ liệu thật) cho phần khối bãi.

## Đã làm (2026-08-23, cùng lượt với #9 yard_map — dùng chung module backend Yard Overview)

- `YardBlocksPage.tsx` giờ gọi `yardApi.getYardOverview()` lúc mount, nạp `blocks`/`containers` thật
  (cùng nguồn `YardBlockLayout` + `DepotJob` đã dựng ở [09-yard-map.md](09-yard-map.md)) thay cho hằng số
  mock cố định — `blockContainers` lọc theo dữ liệu thật.
- `handleToggleBlockStatus` (khoá/mở Block bảo trì) và `handleSaveBlock` (sửa Bay/Row/Tier/Tên/Mô tả) giờ
  gọi `PUT /api/yard/blocks/{blockCode}` thật (`YardOverviewService.UpdateBlockLayoutAsync`), lưu xuống
  `YardBlockLayout` — trước đây chỉ đổi `useState` cục bộ, mất khi tải lại trang.
- **Đổi mã Block hiển thị:** Block thật trên backend dùng mã đầy đủ `BLOCK_A/BLOCK_B/BLOCK_Q/BLOCK_R`
  (khớp `DepotJob.BlockCode`), khác mã rút gọn `A/B/C/D/E` trong mock cũ (và số lượng Block thật là 4,
  không phải 5). Thêm hàm hiển thị `formatBlockLabel()` rút gọn `"BLOCK_A"` → `"A"` chỉ ở phần **hiển
  thị** (tiêu đề, tab chọn Block, toast) — `locationCode`/tra cứu dữ liệu vẫn dùng nguyên mã đầy đủ.
  `initialRules` (chính sách xếp bãi theo Hãng tàu/Size — dữ liệu cấu hình tĩnh, chưa có bảng backend
  riêng, ngoài phạm vi đợt này) cũng đổi `blockCode` theo 4 mã thật, bỏ Block E không còn tồn tại.
- Build backend + `tsc --noEmit` frontend đều 0 lỗi.

## Còn thiếu (không chặn)

- Chính sách phân bổ Block theo Hãng tàu/Size (tab "Quy Tắc Xếp Bãi") vẫn là cấu hình tĩnh phía frontend
  (`initialRules`), chưa có bảng lưu backend riêng — không phải lỗi tích hợp dữ liệu container/vị trí,
  chỉ là 1 tính năng cấu hình chưa nối, có thể làm sau nếu cần lưu vĩnh viễn.

## Trạng thái: ✅ Xong (dùng chung module backend Yard Overview với #9, cấu hình Block lưu DB thật)

- [x] Đọc Block/Container thật qua `GET /api/yard/overview` — không còn dùng `initialBlocks`/`initialContainers` làm dữ liệu chính.
- [x] Sửa cấu hình Block (Bay/Row/Tier/Tên/Mô tả/Trạng thái) lưu thật qua `PUT /api/yard/blocks/{blockCode}`.
