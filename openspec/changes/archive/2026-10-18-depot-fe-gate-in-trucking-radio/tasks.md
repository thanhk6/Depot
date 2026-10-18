# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 Không sửa backend.

## 2. Frontend (`fontend/`)

- [x] 2.1 `TruckingCompanyPicker`:
  - trạng thái `mode` (`EXISTING` / `NEW` / `WALK_IN`, mặc định `EXISTING`, suy `WALK_IN` khi `code === 'VANG_LAI'`);
  - nhóm 3 radio *Chọn nhà xe có sẵn* / *Thêm nhà xe mới* / *Khách vãng lai*.
  - Kiểm tra: type-check không lỗi.
- [x] 2.2 Hiển thị theo chế độ:
  - `EXISTING` chỉ ô tìm, dropdown bỏ 2 mục cuối;
  - `NEW` chỉ form thêm mới (bỏ nút Huỷ);
  - `WALK_IN` chỉ ô tên vãng lai.
  - Đổi radio thì xoá lựa chọn và chữ cũ, gọi `onChange` cho đúng; sang `NEW` thì mang chữ đang gõ thành tên gợi ý.
  - Lưu mới / trùng thì chọn nhà xe đó và về `EXISTING`.
  - Kiểm tra: type-check không lỗi.
- [x] 2.3 Prop `resetKey`: `GateInPage` tăng sau mỗi lần Gate-In thành công; component về `EXISTING` và xoá chữ. Kiểm tra: `npx tsc --noEmit -p .` không lỗi.

## 3. Kiểm thử (giao diện http://127.0.0.1:3000)

- [x] 3.1 Tài khoản tạm `qa_rd_gate` (GATE_OP). Mở Gate-In: radio *Chọn nhà xe có sẵn* đang bật, chỉ có ô tìm; dropdown không còn "+ Thêm nhà xe mới" / "Khác (vãng lai)".
- [x] 3.2 Bấm *Thêm nhà xe mới*: ô tìm và ô vãng lai biến mất, hiện form. Bấm *Khách vãng lai*: chỉ còn ô tên vãng lai.
- [x] 3.3 Chọn XYZ Transport → bấm *Khách vãng lai* → bấm Gate-In khi chưa nhập tên vãng lai: bị chặn ("Nhập tên nhà xe vãng lai"), không gửi XYZ.
- [x] 3.4 Ở *Thêm nhà xe mới*, lưu tên mới: tự về *Chọn nhà xe có sẵn* với nhà xe mới đã chọn. Lưu "xyz transport": về *Chọn nhà xe có sẵn* với XYZ Transport và báo đã có.
- [x] 3.5 Gate-In thành công với vãng lai (container test `QARD…`): form trắng, radio về mặc định; hồ sơ lưu `VANG_LAI` + tên.
- [x] 3.6 Dọn dữ liệu test:
  - xoá hồ sơ / nhật ký của container `QARD…`, nhà xe `NX-*` tạo trong test, tài khoản tạm;
  - xác nhận bằng DB không còn bản ghi test; `CUST-ABC01` / `CUST-XYZ02` và 2 hồ sơ thật không đổi.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fe-gate-in-trucking-radio`; sửa bước 3 mục *1. Tiếp nhận cổng* trong `docs/quy-trinh-van-hanh-depot.md` (3 radio).
