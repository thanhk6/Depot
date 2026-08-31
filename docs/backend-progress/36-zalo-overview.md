# 36-40 — Nhóm ZALO GATEWAY (gộp 1 file)

5 tab (`zalo_overview`, `zalo_simulator`, `zalo_templates`, `zalo_settings`, `zalo_logs`) đều render
`ZaloModule.tsx` (`App.tsx` chỉ đổi `initialSubTab`) — gộp audit vào 1 file theo đúng ghi chú `INDEX.md`.

## Frontend gọi gì

Không có lệnh gọi API nào trong toàn bộ module `fontend/src/modules/zalo` (đã `grep` toàn thư mục,
không có `\w+Api\.` hay `axios.` nào). Toàn bộ là mock/simulator: OA overview giả lập, chat simulator
giả lập tin nhắn Zalo, thư viện mẫu tin ZNS/OA tĩnh, cấu hình OA token chỉ lưu state cục bộ, nhật ký
webhook giả lập.

## Đối chiếu backend

Không có `ZaloController`/entity nào trong `SolutionDepot` — đây là module hoàn toàn chưa có backend,
đúng tinh thần "Zalo Gateway" là tích hợp bên thứ 3 (Zalo OA API) cần: lưu OA Access Token/Refresh
Token, gọi Zalo OA API thật để gửi ZNS, nhận webhook thật từ Zalo, lưu log giao dịch — chưa triển khai
ở backend.

## Quyết định (2026-08-23): giữ nguyên dạng demo/simulator

Người dùng xác nhận **không** tích hợp Zalo OA thật ở giai đoạn này (chưa có Access Token/OA ID/Secret
Key thật, và tích hợp Zalo OA là việc lớn nhất trong toàn bộ 53 màn — cần đăng ký ứng dụng Zalo OA,
entity `ZaloMessage`/`ZaloTemplate`/`ZaloWebhookLog`/`ZaloOAConfig`, Controller gọi API thật + webhook).
Giữ nguyên 5 tab dạng simulator/mock thuần frontend như hiện tại cho mục đích demo — không tạo module
backend cho nhóm này. Nếu sau này cần tích hợp thật, thiết kế lại theo đúng ghi chú kỹ thuật đã có ở
trên (mục "Đối chiếu backend").

## Trạng thái: ✅ Đã audit + xác nhận giữ dạng demo (không cần backend)

- [x] Toàn bộ 5 tab là simulator/mock thuần frontend — **đã xác nhận với người dùng, giữ nguyên có chủ
      đích**, không phải thiếu sót cần sửa.
