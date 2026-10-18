# Design

## Context

Trạng thái hiện tại của từng API:

- **Bắt đầu sửa:**
  - `StartRepair` (controller) truyền thẳng `request.TechnicianId` và `request.TechnicianName` vào `StartRepairAsync`. Hai giá trị này được lưu vào `RepairOrders` và làm `User` của nhật ký REPAIR_STARTED. `AuditActorInterceptor` sau đó ghi đè `User` của nhật ký bằng tài khoản đăng nhập, nhưng không ghi đè cột trong `RepairOrders`.
  - `StartRepairAsync` kiểm tra `AnyAsync(RepairOrders)` rồi mới `Add`. Hai yêu cầu đồng thời cùng qua được bước kiểm tra; yêu cầu thứ hai vướng unique index `IX_RepairOrders_JobNo`, ném `DbUpdateException` không được bắt, thành 500. Log backend đã xác nhận lỗi 23505.
- **Ghi QC:**
  - `CompleteQc(QcInspectionRequest)` không nhận `id` của đường dẫn;
  - `CompleteQcInspectionAsync` dùng `qcReq.JobId` và lưu `qcReq.InspectorName` vào `RepairOrders.InspectorName`;
  - màn QC luôn gửi `inspectorName: 'Frontend QC'`.
- **Từ chối báo giá:**
  - `RejectEstimateAsync` ghi `estimate.ApprovedBy = request.RejectedBy`;
  - màn Báo giá gửi `rejectCode` (mã hoặc người từ chối phía hãng tàu) vào `rejectedBy`;
  - ngược lại, `ApproveEstimateAsync` đã tách đúng: `ApprovedBy` là nhân viên depot ghi nhận, `CarrierApproverName` là người duyệt phía hãng tàu.
- **Đổi trạng thái thủ công:** `UpdateJobStatusAsync` có REPAIRING trong whitelist và chỉ kiểm tra điều kiện riêng cho READY_FOR_OUT.

## Goals / Non-Goals

**Goals:**
- Mọi tên người thực hiện ở bốn API trên lấy từ tài khoản đăng nhập.
- QC ghi đúng hồ sơ trên đường dẫn.
- Không chuyển được sang REPAIRING khi chưa có báo giá đã duyệt.
- Bắt đầu đồng thời trả 409, không trả 500.

**Non-Goals:**
- Không đổi phân quyền (`RolePermissions`).
- Không đổi frontend.
- Không thêm migration.
- Không sửa luồng phân công (`AssignRepairAsync`) hay làm lại sau QC.

## Decisions

- **Tài khoản đăng nhập do controller truyền vào service**, giống mẫu `ApproveEstimate` đang dùng: họ tên là `User.GetFullName() ?? User.GetUsername()`, mã là `User.GetUserId()`. Đổi chữ ký service:
  - `StartRepairAsync(jobId, technicianId, technicianName)`: controller truyền mã và tên của tài khoản thay cho giá trị trong body;
  - `CompleteQcInspectionAsync(long jobId, QcInspectionRequest, string inspector)`;
  - `RejectEstimateAsync(jobId, request, string recordedBy)`.

  Cập nhật `IDepotJobService` theo. Giữ nguyên các field trong DTO để client cũ không lỗi deserialize; field nào không dùng nữa thì ghi chú "bỏ qua, lấy từ tài khoản đăng nhập".
- **Kỹ thuật viên là người bấm "Bắt đầu":**
  - admin bấm hộ thì lệnh sửa ghi admin, và đó là sự thật về người thao tác;
  - nhu cầu ghi tên thợ khác thuộc luồng phân công, để cho change `depot-fullstack-repair-item-progress`.
- **QC: `id` đường dẫn là nguồn chính.**
  - Body có `jobId` không rỗng và khác `id` thì controller trả 400 "Mã hồ sơ trong yêu cầu không khớp đường dẫn" trước khi gọi service, nên không có gì được ghi;
  - body không có `jobId` thì dùng `id`;
  - màn QC hiện gửi `jobId` trùng `id`, nên vẫn chạy bình thường.
- **Từ chối báo giá:**
  - `estimate.ApprovedBy` lưu người ghi nhận (nhân viên đăng nhập), theo đúng nghĩa cột này ở luồng duyệt;
  - `request.RejectedBy` không rỗng và khác mặc định "Hãng tàu" thì lưu vào `estimate.CarrierApproverName` (thông tin phía hãng tàu, đã có sẵn cột);
  - nhật ký ESTIMATE_REJECTED ghi lý do kèm "phía hãng tàu: …" nếu có.
  - Đã cân nhắc thêm cột `CarrierRejectRef`, nhưng loại vì cần migration và cột hiện có đã đủ nghĩa.
- **Đổi trạng thái sang REPAIRING:**
  - trong `UpdateJobStatusAsync`, thêm nhánh `request.Status == "REPAIRING"`: báo giá của hồ sơ không ở trạng thái APPROVED thì ném `ArgumentException("Báo giá chưa được hãng tàu duyệt — không thể chuyển sang Đang sửa chữa.")`; controller đã bắt lỗi này và trả 400;
  - không bỏ REPAIRING khỏi whitelist, vì đưa hồ sơ đã duyệt về REPAIRING (ví dụ từ QC_PENDING) vẫn là thao tác hợp lệ.
- **Bắt đầu đồng thời:**
  - bọc `SaveChangesAsync` của `StartRepairAsync` trong `try/catch (DbUpdateException)`;
  - khi bắt được lỗi, kiểm tra lại `AnyAsync(RepairOrders)` (không phụ thuộc mã lỗi riêng của Npgsql). Nếu đã có lệnh sửa thì ném `InvalidOperationException("Lệnh sửa chữa của container này đã được bắt đầu.")`, controller đã map lỗi này sang 409. Ngược lại thì ném lại lỗi gốc.

## Risks / Trade-offs

- **Client cũ dựa vào tên tự gửi để hiển thị:** màn Sửa chữa đọc `repairOrder.technicianName` từ DB, nên sau thay đổi sẽ hiện đúng tên tài khoản. Không có màn nào cần giá trị client gửi.
- **Tài khoản thiếu FullName:** fallback sang Username, giống luồng duyệt. Cả hai đều trống chỉ xảy ra khi không đăng nhập, mà endpoint đã bắt buộc đăng nhập.
- **Kiểm thử đồng thời không ổn định:** gửi song song nhiều lần (ví dụ 5 cặp) và kiểm tra không có mã 500 nào.
- **Dữ liệu cũ** (lệnh sửa và báo giá đã lưu tên client gửi) giữ nguyên, không sửa ngược.
