## Purpose

Kiểm soát truy cập theo vai trò: mỗi tài khoản đăng nhập thấy đúng vai trò của mình và chỉ dùng được các màn / thao tác mà vai trò đó được cấp.

## ADDED Requirements

### Requirement: Hiển thị đúng vai trò của tài khoản đăng nhập
Sau khi đăng nhập, nhãn vai trò trên sidebar, chức danh và huy hiệu ở menu tài khoản SHALL đúng với vai trò (RoleCode) của tài khoản trong hệ thống, với cả 11 vai trò ADMIN, SURVEYOR, GATE_OP, CASHIER, ESTIMATOR, TECHNICIAN, QC_ENG, FORKLIFT, CARRIER, CLEANING, SUPERVISOR. Vai trò không nhận ra MUST NOT hiện thành nhãn của vai trò khác, kể cả quản lý.

#### Scenario: Kỹ sư QC đăng nhập
- **WHEN** tài khoản có vai trò QC_ENG đăng nhập
- **THEN** sidebar hiện vai trò "Kỹ Sư QC", không phải "Khai Thác Cổng"

#### Scenario: Các vai trò từng bị hiện sai
- **WHEN** lần lượt đăng nhập tài khoản TECHNICIAN, CARRIER, CLEANING, FORKLIFT
- **THEN** sidebar hiện đúng Thợ sửa chữa, Đại diện hãng tàu, Tổ vệ sinh, Tài xế xe nâng

#### Scenario: Giữ đúng sau khi tải lại trang
- **WHEN** tài khoản TECHNICIAN đã đăng nhập rồi tải lại trang
- **THEN** sidebar vẫn hiện vai trò Thợ sửa chữa

#### Scenario: Vai trò không nhận ra
- **WHEN** backend trả về một mã vai trò không thuộc 11 vai trò trên
- **THEN** nhãn vai trò hiện "—", không hiện thành Khai Thác Cổng hay Quản lý; menu vẫn theo quyền backend trả về
