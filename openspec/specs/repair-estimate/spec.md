# repair-estimate Specification

## Purpose

Cho phép nhân viên báo giá lập và chỉnh sửa báo giá sửa chữa container theo cấu trúc Work Order Maersk AEMS, với số tiền do server tính, và chốt bản báo giá trước khi gửi hãng tàu duyệt.

## Requirements

### Requirement: Điều kiện được lập báo giá
Hệ thống SHALL chỉ cho lập hoặc sửa báo giá khi hồ sơ đang ESTIMATING, đã có phiếu giám định và có phiếu dịch vụ (không huỷ) đã thu tiền.

#### Scenario: Chưa thu tiền phiếu dịch vụ
- **WHEN** lập báo giá cho hồ sơ ESTIMATING chưa thu tiền phiếu dịch vụ
- **THEN** hệ thống từ chối và báo phải thu tiền ở màn Thanh Toán trước

#### Scenario: Hồ sơ không ở bước báo giá
- **WHEN** lập báo giá cho hồ sơ không ở trạng thái ESTIMATING
- **THEN** hệ thống từ chối

### Requirement: Nội dung báo giá theo cấu trúc AEMS
Mỗi báo giá SHALL có ít nhất một hạng mục; mỗi hạng mục SHALL lưu vị trí, mã hư hỏng, mã sửa chữa, số lượng (PCS), giờ công/PC, vật tư/PC, đơn vị, TPI và thuế suất. Phần đầu báo giá SHALL lưu Shop Code, Cause, Mode, số tham chiếu nhà cung cấp, đơn giá giờ công, giờ chuẩn bị và giờ thường / OT.

#### Scenario: Hạng mục không hợp lệ
- **WHEN** gửi báo giá có hạng mục số lượng ≤ 0, hoặc đơn giá / giờ công / đơn giá giờ âm
- **THEN** hệ thống từ chối lưu

#### Scenario: Giờ âm
- **WHEN** gửi báo giá có giờ chuẩn bị, giờ thường hoặc OT âm
- **THEN** hệ thống từ chối và báo giờ không được âm

### Requirement: Server tính lại toàn bộ tiền và giờ công
Hệ thống MUST tính lại tổng ở server và bỏ qua số tổng trình duyệt gửi lên: tổng giờ công = Σ PCS × giờ công/PC + giờ chuẩn bị; tiền công = tổng giờ công × đơn giá giờ; vật tư = Σ PCS × vật tư/PC; VAT tính trên (tiền công + vật tư) theo thuế suất cao nhất trong các hạng mục.

#### Scenario: Trình duyệt gửi tổng sai
- **WHEN** báo giá gửi lên có tổng tiền khác với số tính từ hạng mục
- **THEN** hệ thống lưu tổng tính lại từ hạng mục, không lưu số trình duyệt gửi

#### Scenario: Tính theo giờ chuẩn bị
- **WHEN** báo giá có 2 hạng mục (2 PCS × 0,5 giờ và 1 PCS × 1 giờ), giờ chuẩn bị 0,5, đơn giá giờ 100.000
- **THEN** tổng giờ công là 2,5 và tiền công là 250.000

### Requirement: Lấy lỗi từ phiếu giám định
Màn lập báo giá SHALL cho chọn một hoặc nhiều hư hỏng đã ghi trong phiếu giám định của container để đưa vào hạng mục báo giá; hạng mục sau khi đưa vào SHALL sửa hoặc bổ sung được như hạng mục nhập tay.

#### Scenario: Chọn lỗi giám định
- **WHEN** nhân viên chọn một số hư hỏng từ phiếu giám định
- **THEN** các hư hỏng đó thành hạng mục báo giá và nhân viên sửa được số lượng, mã, giá trước khi lưu

### Requirement: Sửa báo giá trước khi duyệt
Hệ thống SHALL cho sửa / bổ sung báo giá khi chưa được hãng tàu duyệt, MUST từ chối sửa báo giá đã APPROVED, và mỗi lần lưu SHALL ghi nhật ký (tạo mới hoặc sửa, kèm số hạng mục và tổng cũ → mới).

#### Scenario: Sửa báo giá đã duyệt
- **WHEN** sửa báo giá đang APPROVED
- **THEN** hệ thống từ chối và báo báo giá đã được hãng tàu duyệt

#### Scenario: Sửa báo giá đang chờ duyệt
- **WHEN** sửa báo giá chưa duyệt
- **THEN** hệ thống lưu bản mới, ghi nhật ký ESTIMATE_UPDATED với số hạng mục và tổng trước / sau

### Requirement: Xác nhận báo giá
Hệ thống SHALL cho người báo giá xác nhận báo giá đang chờ duyệt, lưu thời điểm và người xác nhận; MUST từ chối xác nhận lại báo giá đã xác nhận. Mọi lần sửa báo giá SHALL xoá xác nhận cũ, buộc xác nhận lại.

#### Scenario: Xác nhận lần đầu
- **WHEN** người báo giá xác nhận báo giá chưa xác nhận
- **THEN** hệ thống lưu thời điểm, người xác nhận và ghi nhật ký ESTIMATE_CONFIRMED

#### Scenario: Sửa sau khi đã xác nhận
- **WHEN** báo giá đã xác nhận bị sửa và lưu lại
- **THEN** trạng thái xác nhận bị xoá và báo giá trở về chờ xác nhận

### Requirement: Gửi báo giá qua API hãng tàu khi đã cấu hình
Nút gửi báo giá qua API SHALL chỉ hiện khi hãng tàu của container đã được cấu hình và bật kết nối trên server. Gửi thành công SHALL được coi là đã xác nhận báo giá nếu báo giá chưa được xác nhận.

#### Scenario: Hãng tàu chưa cấu hình API
- **WHEN** mở báo giá của container thuộc hãng chưa cấu hình kết nối
- **THEN** không hiện nút gửi API, chỉ có bước xác nhận trên hệ thống

#### Scenario: Gửi API thành công
- **WHEN** gửi báo giá qua API hãng tàu và hãng trả thành công
- **THEN** báo giá được đánh dấu đã xác nhận và có bản ghi nhật ký gửi

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
