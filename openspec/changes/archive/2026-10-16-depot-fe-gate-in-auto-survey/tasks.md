# Tasks

## 1. Frontend (`fontend/`)

- [x] 1.1 Thêm hàm xoá form trong `GateInPage.tsx` (về `EMPTY_GATE_IN_FORM` + hãng tàu / loại container đầu tiên của danh mục, xoá lỗi), gọi sau khi Gate-In thành công; xác nhận `npx tsc --noEmit -p .` không lỗi
- [x] 1.2 Thêm prop tuỳ chọn `onNavigateToSurvey` cho `GateInPage`: có prop thì hiện thông báo kèm số container + e-EIR và gọi prop, không mở hộp thoại e-EIR; không có prop thì giữ thông báo + hộp thoại như cũ; xác nhận type-check không lỗi
- [x] 1.3 Trong `App.tsx` truyền `onNavigateToSurvey={() => setActiveTab('survey')}` chỉ khi `canAccessMenu(allowedTabs, 'survey')`; xác nhận type-check không lỗi

## 2. Kiểm thử (http://127.0.0.1:3000)

- [x] 2.1 Đăng nhập admin, Gate-In một container số đúng ISO 6346: xác nhận chuyển sang màn Giám Định, container có trong "Chờ Giám định", thông báo có số container + e-EIR, không có hộp thoại e-EIR; quay lại Gate-In thấy các ô trống
- [x] 2.2 Gate-In với số container sai check-digit: xác nhận ở lại màn Gate-In, form giữ nguyên dữ liệu, hiện lỗi
- [x] 2.3 Tạo tạm tài khoản chỉ có quyền Gate-In (không có `survey`), Gate-In thành công: xác nhận ở lại Gate-In, form trống, có hộp thoại e-EIR
- [x] 2.4 Dọn dữ liệu test: xoá hồ sơ, nhật ký của các container test và tài khoản tạm; xác nhận bằng truy vấn DB không còn bản ghi nào

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fe-gate-in-auto-survey` sau khi duyệt; kiểm tra `openspec/specs/gate-in/spec.md` có 8 requirement.
