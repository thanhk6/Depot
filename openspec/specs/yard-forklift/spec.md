# yard-forklift Specification

## Purpose

Điều phối xe nâng di chuyển container giữa khu vệ sinh, bãi lưu trữ và xưởng sửa chữa, và ghi nhận vị trí bãi thật của container.

## Requirements

### Requirement: Hàng đợi lệnh xe nâng theo công đoạn
Màn Xe nâng SHALL hiện lệnh chờ cho: container đã bàn giao vệ sinh nhưng chưa hạ bãi kể từ lần bàn giao (lấy tại KHU VỆ SINH đưa vào bãi); container đang sửa chữa (lấy từ bãi đưa vào xưởng sửa chữa); container vừa QC đạt và chưa hạ bãi kể từ lần QC đạt (lấy từ xưởng đưa về bãi). Container đang CLEANING hoặc đã GATE_OUT MUST NOT có lệnh.

#### Scenario: Vệ sinh xong chưa hạ bãi
- **WHEN** container đã bàn giao vệ sinh và chưa có vị trí bãi
- **THEN** màn Xe nâng hiện lệnh chờ hạ bãi với vị trí lấy là KHU VỆ SINH

#### Scenario: Đã hạ bãi sau bàn giao
- **WHEN** container đã được hạ bãi sau lần bàn giao vệ sinh
- **THEN** không còn lệnh "từ KHU VỆ SINH" cho container đó

### Requirement: Nhận lệnh có khoá
Tài xế SHALL nhận được lệnh cho container đang chờ xe nâng, lưu tài xế, xe và thời điểm nhận, ghi nhật ký FORKLIFT_CLAIMED; hệ thống MUST từ chối khi lệnh đã có tài xế khác nhận (hai người nhận đồng thời chỉ một người thành công) hoặc container không còn chờ xe nâng.

#### Scenario: Tài xế thứ hai nhận cùng lệnh
- **WHEN** tài xế B nhận lệnh mà tài xế A đã nhận
- **THEN** hệ thống từ chối và báo A đã nhận lệnh

### Requirement: Bắt đầu và huỷ nhận lệnh
Chỉ tài xế đang giữ lệnh SHALL bấm bắt đầu (lưu thời điểm, ghi nhật ký FORKLIFT_STARTED) hoặc huỷ nhận (xoá khoá, trả lệnh về hàng đợi, ghi nhật ký FORKLIFT_CLAIM_CANCELLED).

#### Scenario: Người khác huỷ hộ
- **WHEN** tài xế không giữ lệnh bấm huỷ nhận
- **THEN** hệ thống từ chối và lệnh giữ nguyên người nhận

### Requirement: Hạ bãi có kiểm tra vị trí
Hạ bãi MUST yêu cầu block, bay, row, tier hợp lệ: block có trong sơ đồ bãi, bay / row / tier trong giới hạn của block, ô đích không có container khác chưa Gate-Out; MUST từ chối container đã GATE_OUT.

#### Scenario: Ô đã có container
- **WHEN** hạ bãi vào ô đang có container khác
- **THEN** hệ thống từ chối

#### Scenario: Vượt số tầng của block
- **WHEN** hạ bãi tier 6 vào block chỉ cho tối đa 5 tầng
- **THEN** hệ thống từ chối

### Requirement: Kết quả hạ bãi
Hạ bãi hợp lệ SHALL ghi vị trí mới cho container, đánh dấu ô đã có container, xoá khoá nhận lệnh để sẵn sàng lần di chuyển sau, MUST NOT đổi trạng thái nghiệp vụ của hồ sơ, và ghi nhật ký FORKLIFT_MOVE_COMPLETED kèm điểm lấy (vị trí cũ, "Khu vệ sinh" hoặc khu giám định) và vị trí mới.

#### Scenario: Hạ bãi container chờ báo giá
- **WHEN** hạ bãi container đang ESTIMATING lấy từ khu vệ sinh
- **THEN** container có vị trí mới, hồ sơ vẫn ESTIMATING, nhật ký ghi "Từ Khu vệ sinh"
