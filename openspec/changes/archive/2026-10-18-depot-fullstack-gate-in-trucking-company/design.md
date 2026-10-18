# Design

## Context

Hiện trạng đã đọc trong code và DB ngày 17/10/2026:

- **`GateInPage.tsx`:**
  - ô *Đơn Vị Vận Tải / Nhà Xe\** là `<select>` lấy từ `customerApi.getAll()` (`GET /api/Customers`, chỉ cần đăng nhập; trả mọi khách hàng `Status != DELETED`, không lọc loại);
  - giá trị gửi lên là **mã** khách hàng (`truckingCompany`);
  - không kiểm tra bắt buộc;
  - phần e-EIR / hàng chờ xe nâng dùng `truckingName: formData.truckingCompany`, tức đang hiện mã thay vì tên.
- **Backend:**
  - `CreateGateInJobAsync` lưu `GateInTruckingCompany = request.TruckingCompany?.Trim()`, không kiểm tra;
  - `DepotJob` không có cột tên nhà xe.
- **Khách hàng (`CustomerCompanies`):**
  - `Code` unique; có `CustomerType` (`TRUCKING`, `LOGISTICS`…), `Status` (`ACTIVE`, `DELETED`…), `TaxCode`, `Phone`, `Notes`;
  - tạo qua `POST /api/Customers` cần quyền `masterdata`; GATE_OP không có.
- **Nơi gọi `POST /api/DepotJobs/gate-in`:**
  - `GateInPage` (có ô nhà xe);
  - `SurveyModulePage` (Thêm mới giám định, không có ô nhà xe);
  - `CustomerPage` (cổng khách hàng, không có ô nhà xe).
- **Nơi đọc nhà xe:** `ServiceOrderFormModal` tra tên theo `job.gateInTruckingCompany` trong danh sách khách hàng, không thấy thì hiện mã.
- **Dữ liệu local:** 2 khách hàng hoạt động (`CUST-ABC01` ABC Logistics / LOGISTICS, `CUST-XYZ02` XYZ Transport / TRUCKING); 2 hồ sơ thật lưu `GateInTruckingCompany = CUST-ABC01`.

## Goals / Non-Goals

**Goals:**
- Màn Gate-In: nhà xe bắt buộc, chọn được từ danh mục, thêm mới tại cổng, hoặc vãng lai.
- Backend kiểm tra nhà xe gửi lên và lưu cả mã lẫn tên.
- Thêm nhanh không cần quyền danh mục, không tạo trùng.

**Non-Goals:**
- Không bắt buộc nhà xe ở màn Giám định và cổng khách hàng.
- Không đổi ô nhà xe ở Gate-Out, không sửa màn quản lý khách hàng, không gộp nhà xe trùng cũ.

## Decisions

- **Cờ bắt buộc theo nơi gọi:**
  - `CreateDepotJobRequest` thêm `bool RequireTrucking` và `string? TruckingName`; chỉ `GateInPage` gửi `requireTrucking: true`;
  - backend giữ nguyên hành vi cho 2 màn kia, nhưng kiểm tra nếu chúng gửi nhà xe.
  - Đã cân nhắc bắt buộc mọi nơi; người dùng chọn chỉ màn Gate-In.
- **Chuẩn hoá nhà xe trong `CreateGateInJobAsync`** (lỗi ném `ArgumentException`, controller đã trả 400):
  - `TruckingCompany` = `VANG_LAI` (không phân biệt hoa thường): `TruckingName` bắt buộc, trim, ≤ 200 ký tự; lưu mã `VANG_LAI` + tên;
  - có mã khác: tra `CustomerCompanies` với `Code` = mã (chữ hoa) và `Status = ACTIVE`; không có thì báo "Nhà xe … không tồn tại hoặc đã ngưng"; lưu mã + `Name` lấy từ danh mục (bỏ qua `TruckingName` client gửi);
  - trống: nếu `RequireTrucking` thì báo "Chưa chọn đơn vị vận tải / nhà xe"; ngược lại để trống cả hai.
- **Cột mới `DepotJob.GateInTruckingName`:**
  - `varchar(200)`, nullable, migration `AddGateInTruckingName` chỉ thêm cột;
  - không backfill: hồ sơ cũ để trống tên, giao diện hiện tên nếu có, không thì hiện mã.
- **Endpoint thêm nhanh** `POST /api/Customers/trucking-quick`, `[RequirePermission(RolePermissions.Operation, RolePermissions.Survey)]` (cùng quyền với Gate-In):
  - request `{ name, phone?, taxCode? }`;
  - `MasterDataService.QuickCreateTruckingCompanyAsync(request, actor)`.
- **Chống trùng:** đọc các khách hàng `ACTIVE` (bảng nhỏ) và so trong C#:
  - tên chuẩn hoá (trim, gộp khoảng trắng, `ToLowerInvariant`);
  - `TaxCode` (bỏ khoảng trắng) nếu request có MST.
  - Trùng thì **409** kèm `Data = { code, name }` của khách hàng đã có, để giao diện chọn luôn. Khách hàng đã xoá hoặc tạm ngưng không tính.
- **Sinh mã `NX-0001`:**
  - lấy số lớn nhất trong các `Code` dạng `NX-dddd`, cộng 1, đệm 4 chữ số (quá 9999 thì để tự nhiên `NX-10000`);
  - hai yêu cầu cùng lúc có thể ra cùng số, khi đó unique index `Code` báo lỗi → bắt `DbUpdateException`, bỏ entity, sinh lại và thử tối đa 3 lần;
  - không cần bảng đếm riêng.
- **Khách hàng tạo nhanh:** `CustomerType = TRUCKING`, `Status = ACTIVE`, `CreditLimit = 0`, `PaymentTermDays = 0`, `Notes = "Tạo tại cổng Gate-In bởi {người đăng nhập} lúc {dd/MM/yyyy HH:mm}"`. Kế toán bổ sung hạn mức ở màn Khách hàng.
- **Giao diện `GateInPage`:** thay `<select>` bằng ô **gõ để tìm**.
  - Danh sách lọc theo mã / tên, chỉ khách hàng `status === 'ACTIVE'`.
  - Cuối danh sách luôn có:
    - **+ Thêm nhà xe mới "…"**: mở khung nhỏ nhập tên (điền sẵn chữ đang gõ), SĐT, MST → gọi thêm nhanh → chọn khách hàng mới. Gặp 409 thì hiện "Đã có nhà xe … — chọn nhà xe này?" và chọn luôn;
    - **Khác (vãng lai)**: hiện ô tên nhà xe / chủ xe.
  - Gửi `truckingCompany` (mã hoặc `VANG_LAI`), `truckingName`, `requireTrucking: true`.
  - Kiểm tra bắt buộc trước khi gửi.
  - Hàng chờ xe nâng / e-EIR dùng **tên** nhà xe.
  - Gate-In thành công thì xoá trắng cả lựa chọn nhà xe (theo requirement có sẵn).
- **Hiển thị nơi khác:** `ServiceOrderFormModal` ưu tiên `job.gateInTruckingName`, rồi tên tra theo mã, cuối cùng mới hiện mã.

## Risks / Trade-offs

- **Hai người thêm cùng một tên cùng lúc** có thể tạo 2 nhà xe trùng tên, vì kiểm tra trùng chạy trước khi ghi. Khả năng thấp ở một cổng; chấp nhận. Muốn chặn tuyệt đối thì cần unique index trên tên chuẩn hoá (để sau).
- **Nhân viên cổng tạo được khách hàng:** danh mục có thể phình lên. Giảm thiểu: chống trùng, ghi chú người tạo, chỉ tối thiểu trường; kế toán rà định kỳ.
- **Hồ sơ cũ** chỉ có mã, không có tên: giao diện fallback sang tra theo mã như hiện nay.
