## ADDED Requirements

### Requirement: Không lập phí lưu bãi trên phiếu dịch vụ
Phiếu dịch vụ MUST NOT có hạng mục lưu bãi chọn tay: form MUST NOT liệt kê các bậc lưu bãi, và server MUST từ chối 400 hạng mục nhóm `STORAGE` hoặc mã thuộc biểu cước lưu bãi khi lập / sửa phiếu, vì phí lưu bãi do hệ thống tính khi Gate-Out.

#### Scenario: Gửi hạng mục lưu bãi
- **WHEN** lập phiếu dịch vụ có hạng mục nhóm `STORAGE`
- **THEN** hệ thống từ chối 400, báo phí lưu bãi tính khi Gate-Out

#### Scenario: Form không còn dòng lưu bãi
- **WHEN** mở danh sách chọn hạng mục trên form phiếu dịch vụ
- **THEN** không có dòng "Lưu bãi …"
