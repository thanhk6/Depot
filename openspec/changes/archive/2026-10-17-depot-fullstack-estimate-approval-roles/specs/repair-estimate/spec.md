## ADDED Requirements

### Requirement: Chỉ bộ phận báo giá được lập và xác nhận báo giá
Lập, sửa và xác nhận báo giá SHALL yêu cầu quyền báo giá, cấp cho quản lý (ADMIN) và người lập báo giá (ESTIMATOR). Đại diện hãng tàu (CARRIER), thu ngân (CASHIER) và giám sát (SUPERVISOR) MUST NOT lập, sửa hay xác nhận báo giá của depot.

#### Scenario: Hãng tàu sửa báo giá của depot
- **WHEN** tài khoản CARRIER gửi lưu báo giá cho hồ sơ ESTIMATING đã thu tiền phiếu dịch vụ
- **THEN** hệ thống từ chối vì không có quyền, báo giá không đổi

#### Scenario: Người ghi nhận duyệt xác nhận báo giá
- **WHEN** tài khoản SUPERVISOR gửi xác nhận báo giá đang chờ duyệt
- **THEN** hệ thống từ chối vì không có quyền

#### Scenario: Người lập báo giá
- **WHEN** tài khoản ESTIMATOR lập và xác nhận báo giá cho hồ sơ đủ điều kiện
- **THEN** báo giá được lưu và xác nhận như bình thường
