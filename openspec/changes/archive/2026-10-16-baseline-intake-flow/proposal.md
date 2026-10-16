# Proposal

## Why

Đợt 1 (`baseline-repair-flow`) đã ghi đặc tả cho nhánh Báo giá → QC. Nửa đầu vòng đời container — từ lúc xe vào cổng tới lúc thu tiền xong — chưa có đặc tả nào, nên mọi change sau chạm vào Gate-In, Giám định, Vệ sinh, Xe nâng, Phiếu dịch vụ hay Thanh toán không có mốc để đối chiếu. Change này ghi lại hành vi đang chạy thật làm đặc tả nền đợt 2.

## What Changes

- Ghi đặc tả nền (baseline) cho hành vi **đã có sẵn** của 6 công đoạn đầu vòng đời; không thay đổi code, API, màn hình hay dữ liệu.
- Mỗi requirement mô tả đúng điều kiện chặn, dữ liệu được lưu, chuyển trạng thái và nhật ký mà backend đang thực hiện; phần giao diện chỉ ghi khi đó là hành vi nghiệp vụ (ví dụ màn Xe nâng sinh lệnh "từ KHU VỆ SINH").
- Các điểm code có thể chưa đúng ý nghiệp vụ được liệt kê trong `design.md` (mục Open Questions) để làm change riêng — **không** sửa trong change này và **không** ghi thành hành vi mong muốn trong đặc tả.

## Capabilities

### New Capabilities
- `gate-in`: tiếp nhận container vào depot — kiểm tra số container ISO 6346, loại container / hãng tàu theo danh mục, thông tin xe và tài xế, chống trùng hồ sơ, sinh số hồ sơ và e-EIR nhập.
- `container-survey`: giám định container — nhận / bỏ nhận phiếu có khoá, lưu nháp, nộp phiếu chính thức (hạng, hư hỏng, dịch vụ vệ sinh, checklist, ảnh) và tự sinh lệnh vệ sinh.
- `container-cleaning`: lệnh vệ sinh — tạo thủ công, đánh dấu từng / tất cả hạng mục, cập nhật thông số thi công, bàn giao Khai thác.
- `yard-forklift`: lệnh xe nâng và vị trí bãi — hàng đợi lệnh theo công đoạn, nhận / bắt đầu / huỷ lệnh có khoá, hạ bãi có kiểm tra block và ô trống.
- `service-order`: phiếu dịch vụ Khai thác — điều kiện lập phiếu, một phiếu cho mỗi hồ sơ, tính tiền theo hạng mục, sửa / huỷ, tự tạo lệnh vệ sinh từ hạng mục vệ sinh.
- `payment`: thu tiền phiếu dịch vụ — tại quầy (tiền mặt / chuyển khoản), VietQR qua webhook ngân hàng, chống thu trùng, nhật ký mọi lần thu.

### Modified Capabilities
- (không có — 5 đặc tả hiện có thuộc nhánh sửa chữa, không đổi requirement nào)

## Impact

- Chỉ thêm file trong `openspec/changes/baseline-intake-flow/`; khi archive tạo `openspec/specs/<capability>/spec.md` cho 6 capability trên.
- Không có migration EF Core, không sửa dữ liệu cũ, không đổi màn hình hay API.
- Liên hệ với đặc tả đã có: chuyển trạng thái tổng thể (giám định → CLEANING, bàn giao vệ sinh rẽ nhánh ESTIMATING / READY_FOR_OUT) đã nằm ở `container-lifecycle`; đặc tả mới chỉ ghi phần riêng của từng công đoạn, không lặp lại.
- Ngoài phạm vi: Gate-Out chi tiết, nhật ký dùng chung, phân quyền, danh mục / biểu phí, tích hợp hãng tàu — để đợt 3 (`baseline-platform`).
