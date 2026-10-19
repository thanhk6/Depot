# Design

## Context

- `SurveyModulePage` hiện `SurveyDetailForm` khi có `selectedSurvey`, dùng chung cho hàng chờ lẫn lịch sử (`onSelectSurvey={handleOpenSurvey}`).
  - Với phiếu đã nộp, `handleOpenSurvey` chỉ `setSelectedSurvey`: trạng thái `IN_PROGRESS`, không khoá phiếu.
  - `onBack={handleBackFromDetail}`.
- `SurveyDetailForm` (khoảng 1.500 dòng):
  - nút *Lưu tạm* / *Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh* ở thanh trên (≈ dòng 533–572) và thanh dưới sticky (≈ 1477–1487);
  - form thêm nhanh hư hỏng (≈ 857); `DamageListTable` (`onAddDamage`, `onEditDamage`, `onDeleteDamage`, `onViewPhoto`); `DamageFormModal`;
  - tải lên / xoá ảnh (gọi API ngay), checklist, dịch vụ vệ sinh, hạng / tiêu chuẩn; khoảng 12 ô `input` / `select` / `textarea` trực tiếp cùng các ô trong component con.
- Không có cơ chế chỉ xem nào sẵn.

## Goals / Non-Goals

**Goals:** mở từ lịch sử thì chỉ xem: không còn đường nào ghi dữ liệu (lưu, nộp, ảnh, hư hỏng, vệ sinh), vẫn xem đủ nội dung và ảnh.

**Non-Goals:** không đổi hàng chờ; không thêm chốt chặn backend; không làm màn xem phiếu mới tách riêng.

## Decisions

- **Trạng thái nguồn mở:**
  - `SurveyModulePage` thêm `selectedReadOnly: boolean`;
  - bảng lịch sử gọi `openHistorySurvey(s)` = `setSelectedSurvey(s); setSelectedReadOnly(true)`, không đi qua `handleOpenSurvey`, nên không bao giờ gọi khoá phiếu;
  - hàng chờ giữ `handleOpenSurvey` (`selectedReadOnly = false`);
  - `handleBackFromDetail` xoá cờ; mở từ lịch sử thì quay về tab `history`.
- **`SurveyDetailForm` nhận `readOnly?: boolean`** (mặc định `false`, nên hàng chờ không đổi gì):
  - **ẩn** (không render) mọi nút ghi: Lưu tạm, Hoàn Tất (cả hai thanh), Phát hành nếu có, form thêm nhanh hư hỏng, nút mở `DamageFormModal`, thêm / xoá dịch vụ vệ sinh, tải lên / chụp / xoá ảnh;
  - **khoá ô nhập** bằng cách bọc thân form trong `<fieldset disabled={readOnly}>`. Trình duyệt tự khoá mọi `input` / `select` / `textarea` / `button` bên trong, kể cả của component con, nên không phải sửa từng ô.
  - Các nút cần dùng ở chế độ xem (*Quay lại*, xem ảnh, đóng ảnh phóng to) đặt **ngoài** fieldset, hoặc là phần tử không phải `button` (vd ảnh bấm được bằng `div`/`img` có `onClick`). Sẽ kiểm tra từng nút khi làm.
  - Dải thông báo đầu form: "Phiếu đã nộp — chế độ chỉ xem" + số phiếu + trạng thái hồ sơ (nhãn tiếng Việt như tab Lịch sử).
- **Component con:**
  - `DamageListTable` thêm `readOnly`: ẩn nút thêm / sửa / xoá, giữ xem ảnh;
  - `SurveyPhotoGallery` (nếu nằm trong form) thêm `readOnly`: ẩn tải lên / xoá, giữ xem.
  - Ẩn rõ ràng thay vì chỉ dựa vào fieldset, để không hiện nút mờ gây hiểu nhầm.
- **Phòng thủ:**
  - các hàm lưu trong form (`onSaveSurvey`, thêm / xoá ảnh) kiểm tra `if (readOnly) return;` ở đầu, phòng khi còn sót đường gọi;
  - không truyền `onSaveSurvey` / `onCompleted` thật khi mở từ lịch sử (truyền hàm no-op).

## Risks / Trade-offs

- **Form lớn, có thể sót một nút ghi:** giảm thiểu bằng ba lớp — fieldset khoá toàn bộ, chặn trong hàm lưu, không truyền callback thật. Thêm kiểm thử Playwright: đếm nút ghi theo nhãn (Lưu, Hoàn Tất, Thêm, Xoá, Tải ảnh) phải bằng 0, và mọi `input` / `select` đều bị khoá.
- **Fieldset khoá luôn nút xem ảnh** nếu nút đó là `button` nằm trong fieldset: xử lý khi làm (đưa ra ngoài hoặc đổi sang phần tử bấm được không phải button), có kiểm thử xem ảnh.
- **Không có chốt chặn backend:** người gọi thẳng API vẫn nộp lại được phiếu của hồ sơ đang vệ sinh / sửa chữa. Ghi ngoài phạm vi.
