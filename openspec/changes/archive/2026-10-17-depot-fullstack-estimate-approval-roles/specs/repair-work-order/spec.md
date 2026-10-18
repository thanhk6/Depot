## ADDED Requirements

### Requirement: Kỹ sư QC không thao tác thay thợ trên lệnh sửa
Bắt đầu, phân công và hoàn tất lệnh sửa SHALL yêu cầu quyền sửa chữa, cấp cho quản lý (ADMIN) và thợ sửa chữa (TECHNICIAN). Kỹ sư QC (QC_ENG) MUST NOT bắt đầu, phân công hay hoàn tất lệnh sửa, nhưng SHALL vẫn xem và chụp được ảnh của lệnh sửa để nghiệm thu.

#### Scenario: Kỹ sư QC hoàn tất lệnh sửa
- **WHEN** tài khoản QC_ENG gửi hoàn tất sửa cho hồ sơ đang REPAIRING
- **THEN** hệ thống từ chối vì không có quyền, hồ sơ vẫn REPAIRING

#### Scenario: Kỹ sư QC chụp ảnh lệnh sửa
- **WHEN** tài khoản QC_ENG chụp ảnh cho lệnh sửa đang REPAIRING
- **THEN** ảnh được lưu như bình thường

#### Scenario: Menu Lệnh sửa chữa
- **WHEN** tài khoản QC_ENG đăng nhập
- **THEN** menu *Lệnh Sửa Chữa* không hiện, menu *QC Nghiệm Thu* vẫn hiện
