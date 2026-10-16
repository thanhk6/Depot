# Proposal

## Why

Dự án vừa bắt đầu dùng OpenSpec nhưng chưa có đặc tả nào. Nhánh Báo giá → Phê duyệt → Sửa chữa → QC là vùng thay đổi nhiều nhất và sắp được tích hợp Maersk AEMS, nên cần ghi lại hành vi đang chạy thật làm mốc để các change sau sửa vào (đợt 1 của baseline).

## What Changes

- Ghi đặc tả nền (baseline) cho hành vi **đã có sẵn** trong hệ thống, không thay đổi code, API hay dữ liệu.
- Mỗi requirement mô tả đúng điều kiện chặn và chuyển trạng thái hiện có ở backend; phần giao diện chỉ ghi khi đó là hành vi nghiệp vụ (ví dụ màn Sửa chữa chỉ hiện container đã được duyệt).
- Phần gửi API hãng tàu chỉ ghi đúng hiện trạng: có cấu hình theo hãng, chỉ gửi khi hãng đã được cấu hình và bật; chưa có lời gọi Maersk AEMS thật.

## Capabilities

### New Capabilities
- `container-lifecycle`: máy trạng thái của hồ sơ container (DepotJob) trong nhánh sau vệ sinh — điều kiện chuyển ESTIMATING / REPAIRING / QC_PENDING / READY_FOR_OUT / GATE_OUT và các đường vòng bị chặn.
- `repair-estimate`: lập / sửa báo giá sửa chữa theo cấu trúc Work Order AEMS, lấy lỗi từ giám định, tính tiền ở server, xác nhận báo giá.
- `carrier-approval`: ghi nhận tay kết quả hãng tàu duyệt / từ chối báo giá (số WO, mã duyệt, người duyệt, số tiền duyệt, kênh).
- `repair-work-order`: lệnh sửa chữa sinh từ báo giá đã duyệt — bắt đầu, phân công, hoàn tất chuyển QC.
- `qc-inspection`: QC nghiệm thu sau sửa — đạt / không đạt và báo hãng tàu (khi đã cấu hình).

### Modified Capabilities
- (không có — dự án chưa có đặc tả nào)

## Impact

- Chỉ thêm file trong `openspec/changes/baseline-repair-flow/`; khi archive sẽ tạo `openspec/specs/<capability>/spec.md` cho 5 capability trên.
- Không có migration EF Core, không sửa dữ liệu cũ, không đổi màn hình hay API.
- Ngoài phạm vi đợt 1: Gate-In, Giám định, Vệ sinh, Xe nâng, Phiếu dịch vụ, Thanh toán, Gate-Out chi tiết, Phân quyền, Nhật ký, Danh mục, tích hợp AEMS thật — ghi ở các đợt sau.
- Không viết `design.md` / `tasks.md` vì không có gì cần xây dựng.
