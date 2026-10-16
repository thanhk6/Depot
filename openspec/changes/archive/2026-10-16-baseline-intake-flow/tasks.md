# Tasks

Change này không sửa code. Các việc dưới đây là đối chiếu đặc tả với hệ thống đang chạy trên local (backend :50210, frontend http://127.0.0.1:3000), dùng một container test có số đúng ISO 6346.

## 1. Backend (`SolutionDepot/`) — đối chiếu điều kiện chặn qua API

- [x] 1.1 Đối chiếu `gate-in`: gọi Gate-In với số container sai check-digit, loại container tạm ngưng, SĐT có chữ, container đang có hồ sơ — xác nhận cả 4 bị từ chối đúng thông điệp; Gate-In hợp lệ trả hồ sơ SURVEYING có số e-EIR và nhật ký GATE_IN
- [x] 1.2 Đối chiếu `container-survey`: 2 tài khoản nhận cùng container (người sau bị từ chối), lưu nháp 2 lần (vẫn SURVEYING, cùng số phiếu), nộp không có dịch vụ vệ sinh (bị từ chối), nộp hợp lệ (CLEANING + 1 lệnh vệ sinh có lý do và ảnh trước vệ sinh)
- [x] 1.3 Đối chiếu `container-cleaning`: tạo lệnh thủ công trùng (bị từ chối), bàn giao khi còn hạng mục dở (bị từ chối kèm x/y), đánh dấu xong hết rồi bàn giao (thành công, nhật ký CLEANING_HANDOVER), bàn giao lần hai (bị từ chối)
- [x] 1.4 Đối chiếu `service-order`: lập phiếu khi còn lệnh vệ sinh (bị từ chối), lập phiếu hợp lệ với 2 thuế suất (tổng tính đúng), lập phiếu thứ hai (bị từ chối), sửa / huỷ phiếu đã thu (bị từ chối)
- [x] 1.5 Đối chiếu `payment`: thu sai số tiền (bị từ chối, có nhật ký REJECTED), thu tiền mặt có tiền khách đưa (ghi tiền thối), thu lần hai (bị từ chối), xác nhận trạng thái hồ sơ không đổi sau khi thu
- [x] 1.6 Đối chiếu `yard-forklift` phía API: nhận lệnh bởi 2 tài xế (người sau bị từ chối), hạ bãi vào ô đã có container / vượt tier (bị từ chối), hạ bãi hợp lệ (vị trí mới, trạng thái hồ sơ giữ nguyên, khoá nhận lệnh bị xoá)

## 2. Frontend (`fontend/`) — đối chiếu hành vi hiển thị

- [x] 2.1 Đối chiếu hàng đợi Xe nâng trên http://127.0.0.1:3000: sau bàn giao vệ sinh thấy lệnh "từ KHU VỆ SINH" kèm người bàn giao; sau khi hạ bãi lệnh biến mất
- [x] 2.2 Đối chiếu màn Giám định: container đang do người khác giữ khoá hiện tên người giữ và không vào được phiếu

## 3. Kiểm thử và hoàn tất đặc tả

- [x] 3.1 Sửa ngay trong `specs/` mọi chỗ đặc tả lệch với kết quả đối chiếu (đặc tả phải theo hành vi thật); điểm nào là lỗi code thì thêm vào Open Questions của `design.md`, không sửa code
- [x] 3.2 Chạy `openspec validate baseline-intake-flow --strict` và xác nhận hợp lệ
- [x] 3.3 Dọn dữ liệu test: xoá hồ sơ, phiếu giám định, lệnh vệ sinh, phiếu dịch vụ, khoản thu, nhật ký và vị trí bãi của container test; xác nhận bằng truy vấn DB không còn bản ghi nào của số container đó

## Workflow follow-up

- Archive bằng `/opsx:archive baseline-intake-flow` sau khi duyệt; kiểm tra `openspec list --specs` có 11 capability.
- Các điểm trong Open Questions của `design.md` làm thành change riêng (`depot-api-*`) nếu muốn đổi hành vi.
