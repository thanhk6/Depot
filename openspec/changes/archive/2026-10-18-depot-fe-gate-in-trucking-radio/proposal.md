# Proposal

## Why

Ô *Đơn Vị Vận Tải / Nhà Xe* ở màn Gate-In (vừa làm ở change `depot-fullstack-gate-in-trucking-company`, archive 18/10/2026) gộp cả ba cách nhập vào **một ô tìm kiếm**: "+ Thêm nhà xe mới" và "Khác (vãng lai)" nằm lẫn ở cuối danh sách gợi ý. Người dùng muốn tách ra ba lựa chọn rõ ràng bằng **radio button**:
- *Chọn nhà xe có sẵn* là mặc định;
- bấm lựa chọn nào thì chỉ hiện ô nhập của lựa chọn đó, **ẩn** ô của hai lựa chọn còn lại.

## What Changes

- Phía trên ô nhà xe có 3 radio:
  1. **Chọn nhà xe có sẵn** (mặc định): hiện ô gõ để tìm. Danh sách gợi ý chỉ còn nhà xe, **bỏ** hai mục "+ Thêm nhà xe mới" và "Khác (vãng lai)" ở cuối danh sách.
  2. **Thêm nhà xe mới**: ẩn ô tìm, hiện form tên (bắt buộc), SĐT, MST và nút *Lưu nhà xe*.
  3. **Khách vãng lai**: ẩn ô tìm và form thêm mới, chỉ hiện ô *Tên nhà xe / chủ xe vãng lai\**.
- **Đổi radio** thì bỏ lựa chọn nhà xe đang có, để không gửi nhầm dữ liệu của lựa chọn cũ:
  - xoá nhà xe đã chọn, tên vãng lai, chữ đang gõ trong form thêm mới;
  - xoá thông báo của lựa chọn cũ.
- **Lưu nhà xe mới thành công**, hoặc bị báo trùng với nhà xe đã có: tự chuyển về radio *Chọn nhà xe có sẵn* với nhà xe đó đã được chọn, kèm thông báo như hiện nay.
- **Gate-In thành công**: form xoá trắng, radio về lại *Chọn nhà xe có sẵn*.
- Không đổi backend, API hay quy tắc bắt buộc: vẫn phải có nhà xe; vãng lai phải có tên; thêm mới vẫn chống trùng tên / MST.

## Capabilities

### New Capabilities

(không có)

### Modified Capabilities

- `gate-in`: thêm requirement về cách chọn kiểu nhập nhà xe trên màn Gate-In (3 radio, mặc định chọn có sẵn, ẩn ô của lựa chọn khác, đổi radio thì xoá lựa chọn cũ). Requirement nghiệp vụ hiện có (bắt buộc, thêm nhanh, chống trùng) giữ nguyên.

## Impact

- **Frontend (`fontend/`):**
  - `modules/gate/components/TruckingCompanyPicker.tsx`: thêm trạng thái chế độ (`EXISTING` / `NEW` / `WALK_IN`), nhóm radio, ẩn / hiện theo chế độ, bỏ 2 mục cuối danh sách gợi ý;
  - `modules/gate/pages/GateInPage.tsx`: chỉ cần chắc chắn reset form đưa radio về mặc định (component tự suy từ mã rỗng).
- **Backend / DB:** không đổi.
- **Ngoài phạm vi:** ô nhà xe ở Gate-Out; giao diện các màn khác.
