# Design

## Context

- `GateInPage` (fontend/src/modules/gate/pages/GateInPage.tsx) sau khi `containerApi.createGateIn` thành công: báo `onAddGateIn(id)` cho App.tsx tải lại container, hiện toast và mở hộp thoại e-EIR; form không bị xoá.
- Chuyển màn trong app là `setActiveTab(tabId)` ở App.tsx; quyền mở màn kiểm tra bằng `canAccessMenu(allowedTabs, tabId)`. Màn Giám Định có id `survey`.
- Màn Giám Định tự tải hàng chờ khi được mở (đã thử nghiệm: container vừa Gate-In có ngay trong "Chờ Giám định").

## Goals / Non-Goals

**Goals:**
- Gate-In xong không cần thao tác thêm để sang Giám Định và nhập container kế tiếp.

**Non-Goals:**
- Không tự "nhận phiếu" giám định cho người vừa Gate-In.
- Không đổi backend hay luồng trạng thái.

## Decisions

- **App.tsx quyết định có chuyển màn hay không, GateInPage chỉ gọi callback.** Thêm prop tuỳ chọn `onNavigateToSurvey`; App.tsx chỉ truyền khi `canAccessMenu(allowedTabs, 'survey')`. Phương án khác — GateInPage tự đọc quyền — bị loại vì quyền menu và điều hướng tab đều đang nằm ở App.tsx.
- **Xoá form bằng hàm reset dùng lại `EMPTY_GATE_IN_FORM`** + mục đầu tiên của danh mục hãng tàu / loại container đã tải, giống giá trị khi mới mở màn. Không reset khi lỗi.
- **Bỏ hộp thoại e-EIR khi chuyển màn** vì GateInPage bị gỡ khỏi màn hình ngay sau đó; số e-EIR đưa vào thông báo. Vẫn giữ hộp thoại cho tài khoản không có quyền Giám Định.

## Risks / Trade-offs

- [Nhân viên không còn thấy hộp thoại e-EIR khi có quyền Giám Định] → số e-EIR vẫn hiện trong thông báo và trong chi tiết container.
- [Thông báo tự tắt sau vài giây] → chấp nhận; e-EIR tra lại được ở chi tiết hồ sơ.

## Migration Plan

Chỉ đổi frontend. Rollback = bỏ prop `onNavigateToSurvey` ở App.tsx (GateInPage tự quay về hành vi cũ).
