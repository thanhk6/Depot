# 09 — Sơ Đồ Bãi 2D (Konva)

Menu: `yard_map` → `YardMapPage.tsx`, xác nhận qua `App.tsx` (`case 'yard_map'`). Dùng service riêng
`fontend/src/modules/yard/services/yardApi.ts` (khác với `fontend/src/api/yard.api.ts` dùng ở màn
`forklift` #11 — 2 file trùng tên `yardApi` nhưng độc lập nhau, dễ nhầm khi đọc code).

## Hiện trạng trước khi sửa (đã audit ở vòng đầu)

`getYardOverview()` gọi `GET /api/yard` — trùng route với `YardController.GetPositions` (trả danh sách
phẳng `YardPosition[]`) đang dùng cho màn Operation/Forklift (#6/#11, đã audit ✅ trước đó, KHÔNG được đổi
route này). Vì hình dạng không khớp (`{zones, blocks, ...}` mong đợi nhưng nhận về mảng phẳng), điều kiện
kiểm tra luôn `false` → 100% thời gian rơi về bộ dữ liệu mock cứng ngay trong `yardApi.ts`, kể cả khi
backend chạy khỏe mạnh. Các endpoint `containers/search`, `containers/{id}`, `history`, `container/move`,
`forklift/dispatch` đều chưa tồn tại ở backend (404).

## Đã làm (2026-08-23, sau khi người dùng xác nhận làm toàn bộ việc lớn còn lại)

**1. Entity mới** (`Depot.Data/Entities/Yard/`, khóa `long`, business key `Code`, theo
`00b-quy-tac-tao-bang.md`): `YardZone`, `YardBlockLayout`, `Forklift`, `ForkliftDispatch`,
`YardMoveHistory`, `YardGateLane`. Migration `AddYardOverviewModule`.

**2. Nguồn dữ liệu container/vị trí — dùng DepotJob THẬT, không tạo bảng song song:**
`YardBlockLayout.Code` khớp đúng `DepotJob.BlockCode`/`YardPosition.BlockCode` thật đang seed sẵn
(`BLOCK_A, BLOCK_B, BLOCK_Q, BLOCK_R`). `YardOverviewService.GetOverviewAsync()` đọc trực tiếp
`DepotJobs` (lọc `Status != GATE_OUT`) để dựng danh sách `containers`/`locations`/occupancy từng Block —
**không có danh sách container giả lập song song** như trước (13 container `CONT-01..13` cứng trong
`yardApi.ts` đã bị xoá khỏi luồng thật, giữ lại `initial*` chỉ làm state khởi tạo tạm trước khi fetch xong).
`Zone`/`Block layout`/`Forklift`/`GateLane` là bảng cấu hình/fleet riêng (seed sẵn trong `DbSeeder`).

**3. `YardOverviewService` + `YardController` (route `api/yard`, KHÔNG đụng `GET /api/yard` cũ):**
- `GET /api/yard/overview` — tổng hợp `{zones, blocks, containers, locations, forklifts, dispatches, gateLanes, statistics}`.
- `GET /api/yard/containers/search?containerNo=`, `GET /api/yard/containers/{id}` (nhận Guid hoặc ContainerNo).
- `GET /api/yard/history?containerId=` — đọc bảng `YardMoveHistory` thật.
- `POST /api/yard/container/move` — validate Block/Bay/Row/Tier theo `YardBlockLayout`, chặn trùng vị trí,
  **ghi thẳng vào `DepotJob.BlockCode/Bay/Row/Tier` thật** (cùng nguồn dữ liệu màn Operation/Forklift đang
  dùng — di chuyển ở màn này giờ phản ánh đúng qua các màn khác), ghi `YardMoveHistory` +
  `JobAuditLog` (action `YARD_MOVE`).
- `POST /api/yard/forklift/dispatch` — tạo `ForkliftDispatch`, cập nhật `Forklift.Status/CurrentTask`.
- `PUT /api/yard/blocks/{blockCode}` — sửa cấu hình Block (dùng chung cho màn #10, xem file đó).

**4. Frontend nối dây thật:**
- `yardApi.ts` viết lại toàn bộ 6 hàm gọi API thật (bỏ toàn bộ nhánh `catch` âm thầm rơi về mock —
  lỗi giờ trả về `{success:false, message}` rõ ràng cho UI xử lý), thêm `mapJobStatusToContainerStatus()`
  quy đổi hiển thị (`DepotJob.Status` thật → nhãn `ContainerStatus` màu trên sơ đồ, vd `REPAIRING`→`REPAIR`).
- `YardMapPage.tsx` **hầu như không cần sửa** — trang này vốn đã gọi đúng `yardApi.getYardOverview()` /
  `moveContainer()` / `dispatchForklift()`, chỉ là các hàm đó trước kia luôn rơi vào nhánh mock. Sau khi
  sửa `yardApi.ts`, trang tự động nhận dữ liệu thật.
- **Bug phát hiện thêm khi nối dây thật** (không lộ ra khi còn dùng mock, vì mock không validate Block):
  `MoveContainerModal.tsx` và `ForkliftDispatchModal.tsx` khởi tạo `destBlock` mặc định cứng `'A'` (không
  đồng bộ với `container.blockId`/danh sách `blocks` thật) — với Block code thật là `BLOCK_A` (không phải
  `A`), gửi lệnh di chuyển mà không đổi dropdown Block sẽ luôn bị backend từ chối
  ("Block A không tồn tại"). Đã sửa: `useEffect` khởi tạo `destBlock` từ `container.blockId` (fallback
  `blocks[0].blockCode`) mỗi khi mở modal, giống cách `destBay/destRow/destTier` đã làm.
- Build backend + `tsc --noEmit` frontend đều 0 lỗi.

## Bug phát hiện khi chạy thử thật với Postgres (không lộ ra lúc chỉ `dotnet build`)

`GetOverviewAsync()` dựng `Dictionary<(Bay,Row,Tier), DepotJob>` bằng `.ToDictionary()` trực tiếp —
crash `System.ArgumentException: An item with the same key has already been added` (500) ngay khi có ≥ 2
`DepotJob` cùng Block trùng toạ độ (Bay,Row,Tier) — thực tế rất dễ xảy ra vì `DepotJob` mặc định
Bay=1/Row=1/Tier=1 cho tới khi được Forklift hạ bãi thật, nên nhiều job mới tạo cùng lúc luôn đụng nhau ở
vị trí mặc định. Chỉ phát hiện khi chạy `dotnet run` thật với Postgres và gọi `GET /api/yard/overview`
(đúng như mục 9 `00b-quy-tac-tao-bang.md`: build sạch chưa đủ). Đã sửa: dùng `GroupBy` + lấy bản ghi
`GateInDate` mới nhất mỗi vị trí thay vì giả định luôn duy nhất.

## Còn thiếu (không chặn, ghi nhận để làm sau nếu cần)

- `HoldCount` (thống kê + từng Block) luôn trả `0` — hệ thống hiện chưa có khái niệm "Hold" trên
  `DepotJob.Status` (không có cột/trạng thái tương ứng), khác với `RepairCount`/`CleaningCount` tính được
  từ dữ liệu thật. Không tự bịa số — cần thiết kế thêm nếu muốn Hold thật (việc lớn mới, chưa nằm trong
  phạm vi lần này).
- Vị trí container hiển thị trên lưới (`locations`) chỉ khớp ô nếu `Bay/Row/Tier` của `DepotJob` nằm
  trong phạm vi cấu hình `YardBlockLayout` (mặc định 8 Bay × 4 Row × 4 Tier/Block) — job có toạ độ ngoài
  phạm vi (hiếm, do nhập tay ở màn Operation) vẫn hiện đúng trong danh sách `containers` nhưng không tô
  sáng ô tương ứng trên lưới.
- `mapJobStatusToContainerStatus()` là quy đổi hiển thị 1 chiều (không đổi dữ liệu DB), có thể chưa phủ
  hết mọi giá trị Status thực tế phát sinh — mặc định rơi về `IN_YARD` nếu không khớp case nào.

## Trạng thái: ✅ Xong (backend + frontend đã nối dây, container/vị trí lấy từ DepotJob thật, build sạch)

- [x] `GET /api/yard` (occupancy phẳng, dùng chung Operation/Forklift #6/#11) — không đổi, vẫn đúng.
- [x] `GET /api/yard/overview` + 5 endpoint con — đã tạo, dùng dữ liệu DepotJob thật cho container/vị trí.
- [x] Frontend `yardApi.ts`, `YardMapPage.tsx`, `MoveContainerModal.tsx`, `ForkliftDispatchModal.tsx` —
      nối API thật, sửa bug `destBlock` mặc định sai.
