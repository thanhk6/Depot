## ADDED Requirements

### Requirement: Quyền ghi nhận duyệt tách khỏi quyền lập báo giá
Ghi nhận hãng tàu duyệt và ghi nhận hãng tàu từ chối SHALL yêu cầu quyền "Ghi nhận duyệt" riêng, cấp cho quản lý (ADMIN), đại diện hãng tàu (CARRIER), thu ngân / kế toán (CASHIER) và giám sát (SUPERVISOR). Người lập báo giá (ESTIMATOR) MUST NOT có quyền này. Menu *Phê Duyệt Hãng Tàu* SHALL chỉ hiện với tài khoản có quyền này.

#### Scenario: Người lập báo giá tự ghi nhận duyệt
- **WHEN** tài khoản ESTIMATOR gửi ghi nhận duyệt hoặc từ chối cho báo giá đã xác nhận
- **THEN** hệ thống từ chối vì không có quyền, báo giá và hồ sơ không đổi

#### Scenario: Vai trò có quyền ghi nhận duyệt
- **WHEN** tài khoản CARRIER, CASHIER hoặc SUPERVISOR ghi nhận duyệt báo giá đã xác nhận, hồ sơ đang ESTIMATING
- **THEN** báo giá chuyển APPROVED và hồ sơ chuyển REPAIRING

#### Scenario: Menu Phê duyệt theo quyền
- **WHEN** tài khoản ESTIMATOR đăng nhập
- **THEN** menu *Phê Duyệt Hãng Tàu* không hiện, còn menu lập báo giá vẫn hiện

### Requirement: Chỉ ghi nhận từ chối cho báo giá đã xác nhận
Hệ thống MUST từ chối ghi nhận hãng tàu từ chối cho báo giá chưa được người báo giá xác nhận, giống điều kiện của ghi nhận duyệt, và báo rõ phải xác nhận báo giá trước.

#### Scenario: Từ chối báo giá chưa xác nhận
- **WHEN** ghi nhận từ chối (có lý do) cho báo giá đang chờ duyệt nhưng chưa bấm "Xác nhận báo giá"
- **THEN** hệ thống từ chối thao tác, báo phải xác nhận báo giá trước; báo giá vẫn chờ duyệt

#### Scenario: Từ chối báo giá đã xác nhận
- **WHEN** ghi nhận từ chối có lý do cho báo giá đã xác nhận
- **THEN** báo giá chuyển REJECTED và hồ sơ về ESTIMATING

## MODIFIED Requirements

### Requirement: Kiểm tra dữ liệu lệnh duyệt
Hệ thống MUST từ chối số tiền duyệt âm, số tiền duyệt lớn hơn tổng báo giá (do server tính), và ngày duyệt ở tương lai.

#### Scenario: Số tiền duyệt âm
- **WHEN** ghi nhận duyệt với số tiền âm
- **THEN** hệ thống từ chối

#### Scenario: Số tiền duyệt vượt tổng báo giá
- **WHEN** ghi nhận duyệt số tiền 999.999.999 cho báo giá có tổng 151.200
- **THEN** hệ thống từ chối và nêu tổng báo giá; báo giá vẫn chờ duyệt

#### Scenario: Số tiền duyệt bằng hoặc thấp hơn tổng
- **WHEN** ghi nhận duyệt số tiền 120.000 cho báo giá có tổng 151.200
- **THEN** hệ thống chấp nhận và lưu số tiền duyệt 120.000

#### Scenario: Ngày duyệt ở tương lai
- **WHEN** ghi nhận duyệt với ngày duyệt sau thời điểm hiện tại
- **THEN** hệ thống từ chối
