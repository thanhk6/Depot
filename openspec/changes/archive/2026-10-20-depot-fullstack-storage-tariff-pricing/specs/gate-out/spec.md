## ADDED Requirements

### Requirement: Hiện phí lưu bãi khi cấp vỏ
Hộp cấp vỏ Gate-Out MUST hiện phí lưu bãi do server tính đến hôm nay: ngày Gate-In, số ngày lưu bãi, số ngày miễn phí, quy tắc áp dụng, từng bậc (số ngày, đơn giá, thành tiền), VAT và tổng; thiếu quy tắc hoặc thiếu giá thì hiện đúng lý do. Nhật ký `GATE_OUT` MUST ghi số ngày lưu bãi và tổng phí (hoặc lý do không tính được). Phí lưu bãi chưa chặn ra cổng.

#### Scenario: Xem phí khi cấp vỏ
- **WHEN** mở hộp cấp vỏ cho container đã lưu bãi quá số ngày miễn phí
- **THEN** hộp hiện số ngày, từng bậc và tổng phí lưu bãi theo biểu cước

#### Scenario: Ghi nhật ký khi ra cổng
- **WHEN** xác nhận Gate-Out
- **THEN** nhật ký `GATE_OUT` có số ngày lưu bãi và tổng phí lưu bãi tính đến lúc ra cổng
