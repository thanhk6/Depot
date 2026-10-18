# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 `StartRepair` (controller) truyền mã (`User.GetUserId()`) và họ tên (`GetFullName() ?? GetUsername()`) của tài khoản đăng nhập vào `StartRepairAsync`, bỏ qua `TechnicianId` / `TechnicianName` trong body. Ghi chú lên DTO `StartRepairRequest`. Kiểm tra: build không lỗi.
- [x] 1.2 `StartRepairAsync`: bắt `DbUpdateException` khi lưu, kiểm tra lại hồ sơ đã có lệnh sửa thì ném `InvalidOperationException("Lệnh sửa chữa của container này đã được bắt đầu.")`, ngược lại ném lại lỗi gốc. Kiểm tra: build không lỗi.
- [x] 1.3 `CompleteQc` nhận `long id` từ đường dẫn; body có `jobId` khác `id` thì trả 400 trước khi gọi service.
  - Đổi `CompleteQcInspectionAsync(long jobId, QcInspectionRequest, string inspector)`; `InspectorName` của lệnh sửa và `User` của nhật ký lấy từ tài khoản đăng nhập.
  - Cập nhật `IDepotJobService`; ghi chú lên DTO `QcInspectionRequest`.
  - Kiểm tra: build không lỗi.
- [x] 1.4 `RejectEstimate` truyền người ghi nhận (tài khoản đăng nhập) vào `RejectEstimateAsync(jobId, request, recordedBy)`.
  - `ApprovedBy` = người ghi nhận.
  - `RejectedBy` không rỗng và khác "Hãng tàu" thì lưu vào `CarrierApproverName`.
  - Nhật ký ghi lý do kèm thông tin phía hãng tàu.
  - Cập nhật `IDepotJobService`. Kiểm tra: build không lỗi.
- [x] 1.5 `UpdateJobStatusAsync`: chuyển sang REPAIRING khi báo giá của hồ sơ không APPROVED thì ném `ArgumentException` nêu rõ lý do. Kiểm tra: build `dotnet build SolutionDepot/SolutionDepot.sln` không lỗi, rồi khởi động lại backend.

## 2. Frontend (`fontend/`)

- [x] 2.1 Không sửa code. Xác nhận `npx tsc --noEmit -p .` vẫn sạch và các màn Sửa chữa, QC, Báo giá gọi API như cũ, không lỗi.

## 3. Kiểm thử (API trên local + giao diện http://127.0.0.1:3000)

- [x] 3.1 Chuẩn bị container test `QAAG…` qua API: một hồ sơ ESTIMATING chưa báo giá, một hồ sơ REPAIRING có báo giá đã duyệt, một hồ sơ QC_PENDING. Tạo tài khoản tạm theo vai trò TECHNICIAN, QC_ENG, ESTIMATOR.
- [x] 3.2 Bắt đầu sửa bằng tài khoản thợ, body ghi tên giả: lệnh sửa và nhật ký ghi đúng họ tên tài khoản thợ, `TechnicianId` là mã tài khoản. Gửi song song 5 cặp yêu cầu bắt đầu (trên 5 hồ sơ): mỗi cặp ra 200 + 409, không có 500, mỗi hồ sơ đúng một lệnh sửa.
- [x] 3.3 QC theo đường dẫn hồ sơ X, body ghi `jobId` của hồ sơ Y: nhận 400, cả X và Y không đổi. Body không có `jobId`: ghi cho X. Body ghi `inspectorName` giả: lệnh sửa và nhật ký ghi tên tài khoản QC.
- [x] 3.4 Từ chối báo giá với `rejectedBy = "MSK-REJ-01"`: `ApprovedBy` là tên tài khoản ghi nhận, `CarrierApproverName = "MSK-REJ-01"`, nhật ký có cả hai và lý do.
- [x] 3.5 `PATCH /status` sang REPAIRING cho hồ sơ chưa có báo giá: nhận 400, trạng thái giữ nguyên. Cho hồ sơ có báo giá APPROVED: nhận 200, có nhật ký STATUS_UPDATED.
- [x] 3.6 Trên giao diện: QC đạt một hồ sơ từ màn QC; màn Sửa chữa và chi tiết hồ sơ hiện tên QC viên là tài khoản đăng nhập, không còn "Frontend QC".
- [x] 3.7 Dọn dữ liệu test:
  - xoá hồ sơ, giám định, vệ sinh, phiếu dịch vụ, khoản thu, báo giá, lệnh sửa, file ảnh (gọi API để xoá cả file vật lý) và nhật ký của container `QAAG…`;
  - xoá tài khoản tạm;
  - truy vấn DB xác nhận không còn bản ghi test nào, và 2 hồ sơ thật SUDU3070783 và BMOU1675248 không đổi.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-api-repair-actor-and-qc-guard`; cập nhật mục Sửa chữa / QC trong `docs/quy-trinh-van-hanh-depot.md` (người thực hiện lấy theo tài khoản; không ép sang Đang sửa chữa khi chưa duyệt).
