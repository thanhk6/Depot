# Proposal

## Why

Ô **Đơn Vị Vận Tải / Nhà Xe\*** ở màn Gate-In hiện chỉ cho chọn trong danh sách khách hàng có sẵn (`CustomerCompanies`). Đã xác nhận bằng code và DB ngày 17/10/2026:
- Nhà xe chưa có trong danh sách thì nhân viên cổng không thêm được. Tạo khách hàng (`POST /api/Customers`) cần quyền `masterdata`, mà nhân viên cổng (GATE_OP) không có.
- Không có lựa chọn cho xe lẻ / vãng lai.
- Ô có dấu `*` nhưng thực ra không bắt buộc: cả giao diện lẫn `POST /api/DepotJobs/gate-in` đều nhận giá trị trống.
- Hồ sơ chỉ lưu **mã** khách hàng (`GateInTruckingCompany = "CUST-ABC01"`), không lưu tên. Với nhà xe vãng lai không có mã thì không có chỗ ghi.

Người dùng chốt ngày 17/10/2026: nhà xe đã có thì chọn; chưa có thì thêm mới ngay tại cổng; có thêm mục *Khác (vãng lai)*.

## What Changes

- **Ô nhà xe gõ để tìm.** Gợi ý mọi khách hàng đang hoạt động (`Status = ACTIVE`; ẩn đã xoá / tạm ngưng), không lọc theo loại khách. Ô **bắt buộc**, chọn một trong ba cách:
  1. **chọn nhà xe đã có**;
  2. **thêm nhà xe mới** ngay tại cổng;
  3. **Khác (vãng lai)** kèm tên nhà xe / chủ xe.
- **Thêm nhà xe mới tại cổng:**
  - nhập tên (bắt buộc), SĐT và MST (tuỳ chọn);
  - hệ thống tạo khách hàng loại `TRUCKING`, mã tự sinh `NX-0001`, `NX-0002`…, ghi chú "Tạo tại cổng Gate-In bởi …", rồi tự chọn luôn;
  - chỉ dùng quyền cổng (`operation`), không cần quyền danh mục;
  - **chống trùng:** tên trùng (không phân biệt hoa thường, bỏ khoảng trắng thừa) hoặc MST trùng với khách hàng đang hoạt động thì **không tạo**, báo và gợi ý chọn nhà xe đã có.
- **Vãng lai:** không tạo khách hàng; hồ sơ ghi mã `VANG_LAI` kèm tên người dùng gõ.
- **Hồ sơ lưu cả mã lẫn tên nhà xe:** cột mới `DepotJob.GateInTruckingName` (snapshot tên lúc Gate-In); trả về trong DTO hồ sơ và in trên e-EIR nhập.
- **Backend kiểm tra:**
  - Gate-In thiếu nhà xe → 400;
  - mã nhà xe gửi lên phải là khách hàng đang hoạt động, hoặc `VANG_LAI` kèm tên; không tin tên client gửi với nhà xe có mã, mà tự lấy tên từ danh mục.
- **Chỉ bắt buộc ở màn Gate-In** (người dùng chốt 17/10/2026): màn Gate-In gửi cờ `requireTrucking = true`, backend chặn khi thiếu. Màn Giám định (Thêm mới giám định) và cổng khách hàng cũng gọi `POST /gate-in` nhưng không có ô nhà xe nên giữ nguyên (được để trống); nếu có gửi nhà xe thì vẫn phải hợp lệ.

## Capabilities

### New Capabilities

(không có)

### Modified Capabilities

- `gate-in`: thêm requirement về đơn vị vận tải / nhà xe khi Gate-In (bắt buộc, chọn / thêm mới / vãng lai, lưu mã + tên) và requirement tạo nhanh nhà xe tại cổng (quyền cổng, mã tự sinh, chống trùng).

## Impact

- **Backend (`SolutionDepot/`):**
  - `Depot.Data`: `DepotJob.GateInTruckingName` (`varchar(200)`, nullable), migration `AddGateInTruckingName`. **Không sửa dữ liệu cũ**: 2 hồ sơ thật đang lưu mã `CUST-ABC01` giữ nguyên, tên để trống, giao diện hiện mã khi chưa có tên.
  - `Depot.Application/Services/DepotJobService.cs`: kiểm tra và chuẩn hoá nhà xe trong `CreateGateInJobAsync`.
  - `Depot.Application/Services/MasterDataService.cs`: hàm tạo nhanh nhà xe (sinh mã `NX-xxxx`, chống trùng tên / MST).
  - `Depot.BackendApi/Controllers/CustomersController.cs`: endpoint `POST /api/Customers/trucking-quick` (`[RequirePermission(Operation)]`).
  - `Depot.ViewModels`: `CreateDepotJobRequest` thêm `TruckingName`, `RequireTrucking`; DTO hồ sơ thêm `GateInTruckingName`; request tạo nhanh.
- **Frontend (`fontend/`):**
  - `modules/gate/pages/GateInPage.tsx`: ô chọn có tìm kiếm, nút thêm mới, mục vãng lai; kiểm tra bắt buộc; gửi `truckingCompany` + `truckingName`;
  - `api/customer.api.ts` (hoặc file api khách hàng đang dùng): hàm tạo nhanh;
  - hiển thị tên nhà xe ở e-EIR / chi tiết hồ sơ nếu đang hiện mã.
- **Ngoài phạm vi:**
  - ô nhà xe ở Gate-Out (đang nhập chữ tự do, không lưu);
  - gộp / sửa trùng nhà xe đã có trong danh mục;
  - màn quản lý khách hàng (vẫn như cũ, kế toán bổ sung hạn mức công nợ cho nhà xe tạo tại cổng).
