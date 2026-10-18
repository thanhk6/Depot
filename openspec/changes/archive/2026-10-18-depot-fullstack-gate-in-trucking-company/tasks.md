# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 `DepotJob.GateInTruckingName` (`varchar(200)`, nullable). Migration `AddGateInTruckingName` (chỉ thêm cột). Thêm vào DTO hồ sơ. Kiểm tra: build không lỗi, migration chỉ có `AddColumn`.
- [x] 1.2 `CreateDepotJobRequest` thêm `TruckingName`, `RequireTrucking`. `CreateGateInJobAsync` chuẩn hoá nhà xe:
  - `VANG_LAI` bắt buộc tên ≤ 200;
  - có mã thì tra khách hàng `ACTIVE`, lấy tên từ danh mục;
  - trống mà `RequireTrucking` thì báo lỗi.
  - Kiểm tra: build không lỗi.
- [x] 1.3 `MasterDataService.QuickCreateTruckingCompanyAsync(request, actor)`:
  - tên bắt buộc;
  - chống trùng tên chuẩn hoá / MST với khách hàng `ACTIVE` (trả khách hàng đã có);
  - sinh mã `NX-dddd` (số lớn nhất + 1, thử lại tối đa 3 lần khi trùng unique `Code`);
  - `TRUCKING` / `ACTIVE` / ghi chú tạo tại cổng.
- [x] 1.4 Endpoint `POST /api/Customers/trucking-quick` (`[RequirePermission(Operation, Survey)]`): 200 kèm khách hàng mới; 409 kèm khách hàng trùng; 400 thiếu tên. Kiểm tra: dừng backend, `dotnet build SolutionDepot/SolutionDepot.sln` không lỗi, khởi động lại (migration tự chạy).

## 2. Frontend (`fontend/`)

- [x] 2.1 API khách hàng: hàm `quickCreateTrucking({ name, phone, taxCode })` trả `{ ok, customer, duplicate }` (đọc cả 409). Kiểm tra: type-check không lỗi.
- [x] 2.2 `GateInPage`: thay `<select>` nhà xe bằng ô gõ để tìm.
  - Lọc khách hàng `ACTIVE` theo mã / tên.
  - Mục **+ Thêm nhà xe mới**: khung tên / SĐT / MST, gặp trùng thì gợi ý chọn nhà xe đã có.
  - Mục **Khác (vãng lai)** kèm ô tên.
  - Kiểm tra bắt buộc; gửi `truckingCompany`, `truckingName`, `requireTrucking: true`.
  - Hàng chờ / e-EIR dùng tên nhà xe; xoá trắng sau Gate-In thành công.
  - Kiểm tra: type-check không lỗi.
- [x] 2.3 `ServiceOrderFormModal`: tên khách hàng ưu tiên `gateInTruckingName`, rồi tra theo mã. Kiểm tra: `npx tsc --noEmit -p .` không lỗi.

## 3. Kiểm thử (API trên local + giao diện http://127.0.0.1:3000)

- [x] 3.1 API Gate-In (container test `QATR…`, tài khoản tạm `qa_tr_gate` GATE_OP):
  - `requireTrucking` mà thiếu nhà xe → 400;
  - mã `CUST-XYZ02` → lưu mã + tên "XYZ Transport" (dù client gửi tên khác);
  - mã khách hàng đã xoá → 400;
  - `VANG_LAI` có tên → lưu đúng, không tạo khách hàng; `VANG_LAI` thiếu tên → 400;
  - không gửi `requireTrucking` (như màn Giám định) và để trống → tạo được, nhà xe trống.
- [x] 3.2 Thêm nhanh bằng `qa_tr_gate`:
  - tên mới → 200, mã `NX-xxxx`, `TRUCKING`, ghi chú có tên người tạo;
  - thêm tiếp → mã tăng 1;
  - "  xyz   transport " → 409 kèm CUST-XYZ02;
  - MST 0318765432 → 409;
  - thiếu tên → 400;
  - 2 tên khác nhau gửi song song (lặp 3 lần) → mã khác nhau, không 500.
- [x] 3.3 Giao diện (đăng nhập `qa_tr_gate`):
  - gõ "xyz" thấy gợi ý XYZ Transport → chọn → Gate-In thành công, chi tiết hồ sơ hiện tên;
  - gõ tên mới → "+ Thêm nhà xe mới" → lưu → tự chọn → Gate-In;
  - gõ "xyz transport" → Thêm mới → báo đã có, chọn nhà xe cũ;
  - chọn Khác (vãng lai) + tên → Gate-In;
  - để trống nhà xe → bị chặn trước khi gửi.
- [x] 3.4 Dọn dữ liệu test:
  - xoá hồ sơ, nhật ký, giám định / vệ sinh nếu có của container `QATR…`;
  - xoá khách hàng `NX-*` tạo trong test;
  - xoá tài khoản tạm;
  - truy vấn DB xác nhận không còn bản ghi test; khách hàng `CUST-ABC01` / `CUST-XYZ02` và 2 hồ sơ thật SUDU3070783 / BMOU1675248 không đổi.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-gate-in-trucking-company`; cập nhật mục *1. Tiếp nhận cổng (Gate-In)* trong `docs/quy-trinh-van-hanh-depot.md`.
- Khi deploy VPS: có migration `AddGateInTruckingName` (sao lưu DB trước).
