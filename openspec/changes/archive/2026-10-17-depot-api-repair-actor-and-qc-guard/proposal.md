# Proposal

## Why

Đợt kiểm tra module Sửa chữa ngày 17/10/2026 tìm ra 4 lỗ hổng ở backend, đều tái hiện được bằng API:
- **C4, D4, E5:** tên người từ chối báo giá, kỹ thuật viên và QC viên lấy theo chuỗi client gửi lên. Ví dụ đã lưu được "Hacker giả hãng tàu" và "Người QC Giả"; màn QC luôn gửi "Frontend QC".
- **E4:** API ghi QC bỏ qua `id` trên đường dẫn, ghi kết quả vào hồ sơ có `jobId` trong body.
- **D7:** đổi trạng thái thủ công đưa được hồ sơ chưa có báo giá sang REPAIRING, bỏ qua bước hãng tàu duyệt.
- **D3:** bấm "Bắt đầu" hai lần cùng lúc trả lỗi 500.

Quy tắc dự án yêu cầu người thực hiện lấy từ tài khoản đăng nhập và các bước nghiệp vụ không được đi đường vòng, nên cần sửa trước các change lớn khác của module.

## What Changes

- **Bắt đầu sửa chữa** (`POST /api/DepotJobs/{id}/repair/start`):
  - kỹ thuật viên của lệnh sửa (mã và họ tên) và người trong nhật ký REPAIR_STARTED lấy từ tài khoản đăng nhập;
  - `technicianId` và `technicianName` trong body bị bỏ qua.
- **Bắt đầu đồng thời:** hai yêu cầu bắt đầu cùng lúc cho một hồ sơ thì một yêu cầu thành công, yêu cầu kia nhận 409 "Lệnh sửa chữa … đã được bắt đầu". Không còn lỗi 500.
- **Ghi kết quả QC** (`POST /api/DepotJobs/{id}/qc-complete`):
  - hồ sơ được ghi kết quả là `id` trên đường dẫn;
  - body có `jobId` khác `id` thì bị từ chối 400 và không ghi gì;
  - QC viên (lệnh sửa và nhật ký) lấy từ tài khoản đăng nhập; `inspectorName` trong body bị bỏ qua.
- **Từ chối báo giá** (`POST /api/DepotJobs/{id}/reject-estimate`):
  - người ghi nhận lưu vào báo giá là nhân viên depot đang đăng nhập, giống cách ghi nhận duyệt;
  - giá trị `rejectedBy` client gửi được coi là thông tin phía hãng tàu, lưu riêng và ghi kèm trong nhật ký.
- **Đổi trạng thái thủ công** (`PATCH /api/DepotJobs/{id}/status`): chuyển sang REPAIRING bị từ chối khi báo giá của hồ sơ chưa APPROVED.
- Không có thay đổi **BREAKING** về hợp đồng API: các field cũ trong body vẫn nhận được, chỉ không còn được tin.

## Capabilities

### New Capabilities

(không có)

### Modified Capabilities

- `repair-work-order`: requirement "Bắt đầu và phân công sửa chữa" thêm hai quy định: kỹ thuật viên lấy từ tài khoản đăng nhập, bắt đầu đồng thời không lỗi 500.
- `qc-inspection`: requirement "Ghi kết quả QC" thêm ba quy định: hồ sơ theo `id` đường dẫn, từ chối khi `jobId` không khớp, QC viên lấy từ tài khoản đăng nhập.
- `carrier-approval`: requirement "Hãng tàu từ chối báo giá" thêm quy định người ghi nhận từ chối là nhân viên đăng nhập, lưu tách với thông tin phía hãng tàu.
- `container-lifecycle`: requirement "Đổi trạng thái thủ công không được đi đường vòng" thêm quy định chặn chuyển thủ công sang REPAIRING khi báo giá chưa được duyệt.

## Impact

- **Backend (`SolutionDepot/`):**
  - `Depot.BackendApi/Controllers/DepotJobsController.cs`: các action `StartRepair`, `CompleteQc`, `RejectEstimate`.
  - `Depot.Application/Services/DepotJobService.cs` và `IDepotJobService.cs`: `StartRepairAsync`, `CompleteQcInspectionAsync`, `RejectEstimateAsync`, `UpdateJobStatusAsync`.
- **Bảng dữ liệu:**
  - không thêm bảng hay cột, **không cần migration**;
  - dùng cột sẵn có: `RepairOrders.TechnicianId`, `TechnicianName`, `InspectorName`; `Estimates.ApprovedBy`, `CarrierApproverName`;
  - không sửa dữ liệu cũ. Các lệnh sửa và báo giá đã lưu tên client gửi giữ nguyên.
- **Frontend:** không bắt buộc sửa. Màn Sửa chữa, QC và Báo giá vẫn gửi các field cũ; backend bỏ qua chúng.
- **Ngoài phạm vi** (để cho các change sau):
  - tách quyền duyệt / từ chối khỏi quyền lập báo giá (G3, G5, G6);
  - từ chối báo giá chưa xác nhận (C3); số tiền duyệt vượt tổng báo giá (C10);
  - luồng phân công thợ (D1, D2); làm lại sau QC không đạt (E6, E7);
  - dọn field thừa và chuỗi "Frontend QC" ở frontend;
  - thông báo lỗi chung chung (A3, B2).
