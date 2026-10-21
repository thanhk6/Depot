## Purpose

Biểu cước lưu bãi container rỗng: quy tắc theo hãng tàu với số ngày miễn phí và các bậc giá theo ngày, đơn giá riêng cho từng loại container trong DM Loại Container, và cách hệ thống tính phí lưu bãi cho một hồ sơ.

## ADDED Requirements

### Requirement: Quy tắc lưu bãi hợp lệ
Quy tắc lưu bãi MUST có mã; hãng tàu MUST là `ALL` (mọi hãng) hoặc mã có trong DM Hãng Tàu, tên hãng lấy từ DM. Mỗi hãng tàu (kể cả `ALL`) MUST có tối đa một quy tắc đang dùng. Số ngày miễn phí ≥ 0; VAT 0–100%; tiền VND; mã MUST NOT đổi sau khi tạo. Vi phạm thì hệ thống MUST từ chối 400 nêu lý do.

#### Scenario: Hai quy tắc đang dùng cho cùng hãng
- **WHEN** lưu quy tắc đang dùng cho hãng MSCU trong khi đã có quy tắc MSCU khác đang dùng
- **THEN** hệ thống từ chối 400 và nêu mã quy tắc đang dùng

#### Scenario: Hãng tàu không có trong DM
- **WHEN** lưu quy tắc cho hãng `MSK` không có trong DM Hãng Tàu
- **THEN** hệ thống từ chối 400

#### Scenario: VAT 0%
- **WHEN** lưu quy tắc VAT 0%
- **THEN** quy tắc lưu đúng VAT 0%, không bị đổi thành 8%

### Requirement: Ngày miễn phí và bậc giá liền nhau
Ngày miễn phí MUST chỉ khai ở "Số ngày miễn phí". Bậc giá MUST bắt đầu đúng ngày (miễn phí + 1), các bậc MUST liền nhau không hở không chồng, chỉ bậc cuối không giới hạn "đến ngày" và MUST có bậc cuối đó. Sai thì hệ thống MUST từ chối 400.

#### Scenario: Bậc đầu nằm trong ngày miễn phí
- **WHEN** quy tắc miễn phí 5 ngày có bậc đầu từ ngày 1
- **THEN** hệ thống từ chối 400, báo bậc đầu phải bắt đầu ngày 6

#### Scenario: Bậc hở ngày
- **WHEN** bậc 1 là ngày 6–10 và bậc 2 bắt đầu ngày 12
- **THEN** hệ thống từ chối 400

### Requirement: Đơn giá lưu bãi theo từng loại container
Mỗi bậc giá MUST lưu đơn giá/ngày riêng cho từng mã loại container của DM Loại Container; loại không có trong DM hoặc trùng trong một bậc, hoặc giá âm, MUST bị từ chối 400. Giá 0 hoặc không nhập nghĩa là bậc đó chưa có giá cho loại đó.

#### Scenario: Giá cho loại lạ
- **WHEN** lưu bậc có giá cho loại `99XX` không có trong DM
- **THEN** hệ thống từ chối 400

### Requirement: Tính phí lưu bãi ở server
Hệ thống MUST tự tính phí lưu bãi của hồ sơ: chọn quy tắc đang dùng của đúng hãng tàu, không có thì quy tắc `ALL`; số ngày = số ngày lịch Việt Nam từ ngày Gate-In đến ngày tính, tính cả hai đầu; ngày ≤ miễn phí là 0đ; ngày còn lại nhân đơn giá của bậc chứa ngày đó theo loại container của hồ sơ; VAT theo quy tắc. Không có quy tắc, hoặc bậc có ngày phải tính mà chưa có giá cho loại đó, MUST báo rõ và MUST NOT dùng giá loại khác.

#### Scenario: Có ngày tính tiền
- **WHEN** container 40HC hãng MSCU vào ngày 01/10, tính ngày 12/10, quy tắc `ALL` miễn phí 5 ngày, bậc ngày 6 trở đi 60.000đ cho 40HC
- **THEN** hệ thống tính 12 ngày, 7 ngày tính tiền, 420.000đ trước VAT

#### Scenario: Ưu tiên quy tắc của hãng
- **WHEN** có cả quy tắc MSCU và quy tắc `ALL` đang dùng, container hãng MSCU
- **THEN** hệ thống dùng quy tắc MSCU

#### Scenario: Chưa có giá cho loại container
- **WHEN** container 45HC có ngày tính tiền nhưng bậc đó chưa có giá 45HC
- **THEN** kết quả báo "chưa có giá 45HC" kèm mã quy tắc và bậc, không có số tiền

#### Scenario: Còn trong ngày miễn phí
- **WHEN** số ngày lưu bãi ≤ số ngày miễn phí
- **THEN** phí lưu bãi bằng 0, không cần giá

### Requirement: Màn Cước Lưu Bãi theo DM
Màn Cước Lưu Bãi MUST hiện ô giá của mỗi bậc theo các loại đang dùng của DM Loại Container và chọn hãng tàu từ DM Hãng Tàu; MUST NOT còn nhóm container hay USD. Quy tắc tạm ngưng MUST vẫn hiện để bật lại. Mỗi lần lưu chỉ ghi đúng quy tắc đang sửa; điều chỉnh % chỉ áp quy tắc đang dùng trong bộ lọc hiện tại và hỏi xác nhận kèm số quy tắc.

#### Scenario: Ô giá theo DM
- **WHEN** mở form sửa quy tắc
- **THEN** mỗi bậc có đúng một ô giá cho mỗi loại đang dùng của DM Loại Container

#### Scenario: Tạm ngưng rồi bật lại
- **WHEN** tạm ngưng một quy tắc rồi tải lại màn
- **THEN** quy tắc vẫn hiện với trạng thái Tạm ngưng và bật lại được
