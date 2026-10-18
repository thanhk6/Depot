# Design

## Context

`TruckingCompanyPicker.tsx` (change `depot-fullstack-gate-in-trucking-company`) hiện:
- giữ trạng thái `query`, `open`, `adding`, `newName` / `newPhone` / `newTax`, `message`;
- chế độ vãng lai suy từ `code === 'VANG_LAI'`;
- dropdown gợi ý có hai mục cuối "+ Thêm nhà xe mới" (đặt `adding = true`) và "Khác (vãng lai)" (gọi `onChange('VANG_LAI', '')`);
- `useEffect` theo `code` rỗng để xoá chữ khi trang cha reset form.

Trang cha `GateInPage` chỉ giữ `truckingCompany` (mã hoặc `VANG_LAI`) và `truckingName`, kiểm tra bắt buộc trước khi gửi. Backend không đổi.

## Goals / Non-Goals

**Goals:** 3 radio rõ ràng, mặc định chọn có sẵn, chỉ hiện ô của radio đang chọn, đổi radio không để sót dữ liệu cũ.

**Non-Goals:** không đổi API, quy tắc kiểm tra, backend; không đổi Gate-Out.

## Decisions

- **Trạng thái chế độ trong component:** `mode: 'EXISTING' | 'NEW' | 'WALK_IN'`.
  - Mặc định `EXISTING`.
  - Khi `code === 'VANG_LAI'` từ trang cha thì `WALK_IN`.
  - Khi trang cha reset (`code` rỗng) thì về `EXISTING`; `useEffect` hiện có mở rộng thêm việc này.
  - Không đưa `mode` lên `GateInPage`, để giữ trang cha gọn: trang cha chỉ cần mã và tên như hiện nay.
- **Đổi radio:**
  - gọi `onChange('', '')` để bỏ nhà xe / tên cũ; riêng `WALK_IN` gọi `onChange('VANG_LAI', '')` để trang cha biết đang ở chế độ vãng lai, chưa có tên;
  - xoá `query`, `newName` / `newPhone` / `newTax`, `message`.
  - Chọn `NEW` thì điền sẵn `newName` từ `query` nếu đang gõ dở, rồi mới xoá `query`.
- **Hiển thị theo chế độ** (render có điều kiện, không chỉ ẩn bằng CSS, để không còn ô nhập thừa):
  - `EXISTING`: ô tìm + dropdown chỉ gồm nhà xe khớp; bỏ hai mục cuối;
  - `NEW`: form thêm mới (giữ nguyên trường và nút hiện có, bỏ nút *Huỷ*, vì muốn huỷ thì bấm radio khác);
  - `WALK_IN`: ô tên vãng lai.
- **Lưu nhà xe mới:** thành công hoặc trùng (409) thì `pick(customer)` rồi đặt `mode = 'EXISTING'`; giữ thông báo hiện có.
- **Kiểu radio:** `input type="radio"` cùng `name="trucking-mode"` kèm nhãn tiếng Việt, xếp ngang, theo theme sáng của form Gate-In (chữ `text-xs`, màu sky cho lựa chọn đang bật).

## Risks / Trade-offs

- **Đổi radio là mất dữ liệu đang gõ dở:** đó là chủ đích, để không gửi nhầm. Riêng chữ đang gõ ở ô tìm được mang sang làm tên gợi ý khi bấm *Thêm nhà xe mới*.
- **Trang cha reset form khi `code` đã rỗng sẵn** (vd đang ở `NEW` chưa lưu gì): `useEffect` theo `code` không chạy lại. Xử lý bằng một prop `resetKey`, tăng sau mỗi lần Gate-In thành công, để component về mặc định chắc chắn.
