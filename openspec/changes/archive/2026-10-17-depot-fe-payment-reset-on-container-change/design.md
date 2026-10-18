# Design

## Context

- `PaymentPage.tsx` giữ `selectedContId`; container đang hiển thị là `currentCont = containers.find(id) || pendingContainers[0]` — nên container có thể đổi mà không qua `setSelectedContId` (ví dụ container vừa thu xong rời danh sách, màn tự rơi về container đầu tiên).
- State xác nhận: `transferChecked`, `cashChecked`; tiền tài xế đưa: `cashReceived`. Hiện chỉ được reset ở đổi tab và sau khi thu thành công.

## Goals / Non-Goals

**Goals:**
- Mọi lần container đang hiển thị đổi đều bỏ tích và xoá tiền tài xế đưa.

**Non-Goals:**
- Không reset ô ghi chú phiếu thu, không đổi tab hình thức đang chọn.

## Decisions

- **Reset theo `currentCont?.id` bằng `useEffect`**, không gắn vào từng chỗ gọi `setSelectedContId`. Lý do: bắt được cả trường hợp container tự đổi (rơi về `pendingContainers[0]`), không phụ thuộc người gọi. Phương án reset trong `onClick` của danh sách bị loại vì bỏ sót trường hợp tự đổi.
- **Xoá luôn `cashReceived`** vì tiền thối tính theo số tiền phải thu của container đang hiển thị — giữ số cũ dễ ra tiền thối sai.

## Risks / Trade-offs

- [Effect chạy cả lúc mở màn lần đầu] → vô hại, các state vốn đã là giá trị mặc định.
