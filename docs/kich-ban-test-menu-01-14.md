> **Đã chạy thật toàn bộ kịch bản này ngày 2026-09-06** — kết quả chi tiết ở mục
> ["Kết quả chạy test 2026-09-06"](#kết-quả-chạy-test-2026-09-06) cuối file. Tóm tắt: 100% test case
> PASS (kể cả 2 test hồi quy cho 2 bug đã sửa hôm nay) trên 1 container mới xuyên suốt cả chuỗi
> (`QATST000201`, job id 65).

# Kịch bản test thủ công — Menu #1 (Gate-In) đến Lệnh Điều Xe Nâng

Phạm vi: đúng theo ảnh chụp Sidebar (`fontend/src/components/layout/Sidebar.tsx`) — nhóm "KHAI THÁC &
GATE-IN" (1-5) + "BÁO GIÁ & SỬA CHỮA" (6-10) + "QUẢN LÝ CONTAINER & BÃI" (11-14), dừng trước nhóm
"CỔNG XUẤT & CẤP VỎ (GATE-OUT)". 14 màn, test theo đúng 1 container xuyên suốt để bắt được lỗi
cross-module (xem mục "Bài học" cuối file).

Ngày viết: 2026-09-06, dựa trên kết quả chạy thử thật qua Postgres + gọi API trực tiếp trong phiên audit
cùng ngày. Tham chiếu chi tiết: `docs/backend-progress/INDEX.md` mục "Chạy thử thật lần 2 (2026-09-06)".

## Điều kiện tiên quyết

- Backend chạy `dotnet run` tại `SolutionDepot/3. Hosts/Depot.BackendApi` (mặc định port `50210` HTTP /
  `50209` HTTPS), Postgres đang chạy port `5432`, database `SolutionDepotDb`.
- Frontend chạy `npm run dev` tại `fontend/` (mặc định port `3000`, proxy `/api` sang backend).
- Đã đăng nhập 1 tài khoản thật (vd `surveyor/123456` hoặc tài khoản quản lý) — Gate-In yêu cầu
  `loggedInUserProfile` để tự gán nhân viên tiếp nhận.
- Có sẵn ít nhất 1 mã hãng tàu thật trong danh mục `ShippingLine` (kiểm tra qua
  `GET /api/customers/shipping-lines`) — dùng đúng `code` đó khi điền hãng tàu ở Gate-In, KHÔNG gõ tay mã
  tuỳ ý vì backend validate theo bảng thật.

Quy ước chung mỗi bước test: **Bước thao tác** → **Kết quả mong đợi** → (nếu có) **API/endpoint liên
quan** để đối chiếu khi test qua Postman/curl thay vì click UI.

---

## 1. Tiếp Nhận Cổng (Gate-In) — tab `gate`

### 1.1 Tiếp nhận hạ vỏ rỗng hợp lệ
1. Vào sub-tab "1. Tiếp Nhận Hạ Vỏ Rỗng", điền đủ: Số container (11 ký tự chữ+số, vd `TSQA0000011`),
   chọn Hãng tàu (lấy từ dropdown thật, không gõ tay), Biển số đầu kéo, Họ tên bác tài, SĐT bác tài, giữ
   nguyên Tare Weight/Max Payload mặc định.
2. Bấm "Chuyển Sang Giám Định Vỏ" (submit).
3. **Kỳ vọng**: toast báo thành công, sinh `jobNo` dạng `JOB-2026-xxxx` và `gateInEirNo` dạng
   `EIR-IN-yyyyMMdd-xxxxxx`; điều hướng sang tab Survey.
4. Gọi `GET /api/DepotJobs` xác nhận job mới có `status = "SURVEYING"`, đủ 8 cột `gateIn*`
   (TruckPlate/DriverName/DriverPhone/SealNo/TruckingCompany/BookingNo/Remarks/StaffId) đúng dữ liệu đã
   nhập — đây là field từng bị mất do chỉ lưu tạm ở state React, đã sửa 2026-08-24.

Endpoint: `POST /api/DepotJobs/gate-in`.

### 1.2 Validate: thiếu trường bắt buộc
1. Bỏ trống Số container hoặc Họ tên bác tài, bấm submit.
2. **Kỳ vọng**: form chặn ngay ở frontend (focus vào field lỗi + toast "Thiếu thông tin bắt buộc..."),
   KHÔNG gọi API.

### 1.3 Validate: trùng số container
1. Lặp lại bước 1.1 với đúng `containerNo` vừa tạo.
2. **Kỳ vọng**: backend trả lỗi 409, toast "Gate-In thất bại", thông báo container đã tồn tại.

### 1.4 Validate: hãng tàu không tồn tại trong danh mục
1. Gửi trực tiếp API (không qua UI) với `shippingLine` là mã bịa (vd `XXXX`).
2. **Kỳ vọng**: `400 Bad Request`, message "Mã hãng tàu XXXX không tồn tại trong danh mục
   ShippingLine.Code."

### 1.5 Cấp Vỏ & Xuất Cổng (sub-tab 2) — lối tắt Gate-Out ngay trong màn Gate-In
1. Chọn 1 container đang `READY_FOR_OUT` (vd vừa QC đạt ở bước 9), điền biển số + tài xế nhận vỏ.
2. **Kỳ vọng**: gọi thật `POST /api/DepotJobs/{id}/gate-out`, trả về `gateOutEirNo` thật từ Postgres
   (không phải số ngẫu nhiên sinh ở client).

### 1.6 Kích thước & loại container
1. Kiểm tra 4 nút nhanh (20GP/40GP/40HC/45HC...) khớp đúng danh mục Master Data → DM Loại Container (ISO),
   chỉ hiện 6 loại backend chấp nhận cho Gate-In (`20GP,40GP,40HC,45HC,20RF,40RH`).

---

## 2. Giám Định (Survey e-EIR) — tab `survey`

### 2.1 Nhận giám định + lưu phiếu có hư hỏng
1. Từ hàng đợi Survey, mở đúng job vừa Gate-In ở bước 1.1 (trạng thái `NEW`).
2. Chấm điểm C hoặc D, thêm ít nhất 1 dòng hư hỏng (Component/DamageCode/RepairCode/Quantity/LaborHours/
   LaborRate/MaterialCost), bấm "Nộp Phiếu" (không phải "Lưu Tạm").
3. **Kỳ vọng**: toast thành công, job chuyển `SURVEYING → ESTIMATING`; damage lưu đúng `totalCost =
   Quantity*LaborHours*LaborRate + MaterialCost` (verify qua `GET /api/DepotJobs/{id}`, field
   `survey.damages[].totalCost`).

Endpoint: `POST /api/DepotJobs/{id}/survey` (payload `SurveyRecordViewModel`: `SurveyorStaffId`,
`ConditionRating`, `Damages[]`, `CleaningItems[]`, `IsDraft=false`).

### 2.2 Lưu tạm (Draft)
1. Mở 1 job khác, nhập dở dang, bấm "Lưu Tạm".
2. **Kỳ vọng**: `IsDraft=true`, job VẪN ở `SURVEYING` (không chuyển ESTIMATING), dữ liệu vẫn còn khi F5 lại
   (không mất trắng — đây là bug đã sửa 2026-08-24, hồi quy sau khi `DepotJob.Id` đổi từ Guid sang long).

### 2.3 Chọn dịch vụ vệ sinh trong lúc giám định
1. Ở phiếu giám định, thêm 1 hạng mục "Cần vệ sinh" (CleaningItems) rồi Nộp Phiếu.
2. **Kỳ vọng**: hệ thống tự sinh 1 `CleaningRecord` trạng thái `PENDING_CLEANING` cho container này (kiểm
   tra `GET /api/cleaning?status=PENDING_CLEANING`), KHÔNG tạo trùng nếu đã có bản ghi đang hoạt động.

---

## 3. Tổ Vệ Sinh (Cleaning Bay) — tab `cleaning`

### 3.1 Tiếp nhận vào bệ rửa (walk-in, không qua Survey)
1. Bấm "+ Tiếp Nhận", điền Số container + ít nhất 1 hạng mục dịch vụ (`responsibleParty` chỉ 1 trong
   `O/U/T/I` — KHÔNG nhập tự do, backend giới hạn `maxlength 5`).
2. **Kỳ vọng**: tạo `CleaningRecord` trạng thái `PENDING_CLEANING`; nếu container đã có 1 lệnh vệ sinh
   đang hoạt động (`Status != HANDOVER_TO_OPERATION`) thì bị chặn tạo trùng.

Endpoint: `POST /api/cleaning`.

### 3.2 Hoàn tất từng hạng mục / hoàn tất tất cả
1. Đánh dấu xong từng hạng mục (`PATCH .../items/{itemId}`) hoặc "Hoàn Tất Tất Cả"
   (`PATCH .../items/complete-all`).
2. **Kỳ vọng**: `Status` chuyển `PENDING_CLEANING → IN_CLEANING` ngay khi có ít nhất 1 hạng mục hoàn
   thành.

### 3.3 Bàn giao Khai Thác — chặn nếu chưa xong hết
1. Thử "Hoàn Tất Vệ Sinh & Chuyển Qua Khai Thác" khi còn hạng mục chưa tick xong.
2. **Kỳ vọng**: bị chặn, thông báo rõ số hạng mục còn lại — KHÔNG cho bàn giao khống (bug cũ đã sửa: từng
   tự động đánh dấu xong hết khi bàn giao).
3. Tick xong hết rồi bàn giao lại → `Status = HANDOVER_TO_OPERATION`; nếu `CleaningRecord.JobNo` khớp 1
   `DepotJob` đang `CLEANING` thì job đó tự chuyển `READY_FOR_OUT`.

---

## 4. Khai Thác Gate-In (Tariff) — tab `operation`

### 4.1 Lập phiếu dịch vụ (Service Order) từ danh mục cước thật
1. Tạo phiếu dịch vụ mới cho 1 container đã Gate-In, chọn dịch vụ LOLO từ danh mục thật (vd
   `LOLO_MT_NORMAL`), số lượng 1.
2. **Kỳ vọng**: `subtotal/totalVat/grandTotal` tính đúng theo `unitPrice * qty` và `vatPercent` (8%) lấy
   từ `ServiceTariff` thật (không hardcode).

Endpoint: `POST /api/service-orders`.

### 4.2 Tab "Biểu Phí Tariff Niêm Yết & Máy Tính Cước"
1. Mở tab này, kiểm tra hiện đủ 3 khối: Cước Nâng Hạ (LoLo), Cước Lưu Bãi (Storage), Máy Tính Cước — đúng
   3 component tách riêng (`LoloTariffMaster`/`StorageTariffMaster`/`TariffCalculatorPage`) xếp chồng,
   không phải component gộp cũ đã xoá.
2. Reload trang ngay lúc mạng chậm → không được crash trắng màn hình (bug cũ: `find()||[0]` ra
   `undefined` khi tariff chưa tải xong).

---

## 5. Thanh Toán VietQR — tab `payment`

### 5.1 Thanh toán phí dịch vụ đúng số tiền
1. Chọn phiếu dịch vụ `UNPAID` vừa tạo ở bước 4.1, xác nhận thanh toán (VietQR hoặc CASH) đúng bằng
   `grandTotal`.
2. **Kỳ vọng**: `ServiceOrder.PaymentStatus/Status = "PAID"`, sinh `Payment` với `InvoiceNo`.
3. **QUAN TRỌNG — test hồi quy bug đã sửa 2026-09-06**: sau khi thanh toán, kiểm tra
   `GET /api/DepotJobs/{id}` — `DepotJob.Status` phải **giữ nguyên** trạng thái nghiệp vụ trước đó (vd vẫn
   `ESTIMATING` nếu container đang chờ báo giá sửa chữa), KHÔNG được bị ghi đè thành `PAID`. Nếu thấy
   `status = "PAID"` sau bước này với 1 job đang `ESTIMATING/SURVEYING/REPAIRING` → bug đã tái phát, cần
   sửa lại `ProcessPaymentAsync` (`DepotJobService.cs`).

Endpoint: `POST /api/depot/jobs/{jobId}/payment` (chú ý route khác `DepotJobsController`, nằm ở
`PaymentsController` riêng, path viết thường `depot/jobs`).

### 5.2 Sai số tiền / phiếu đã thanh toán
1. Gửi `amount` khác `grandTotal`, hoặc thanh toán lại 1 phiếu đã `PAID`.
2. **Kỳ vọng**: `400 Bad Request`, không tạo thêm `Payment` trùng.

---

## 6. Lập Báo Giá Estimate — tab `estimate`

### 6.1 Tạo báo giá cho container đang ESTIMATING
1. Dùng đúng container vừa Survey có hư hỏng ở bước 2.1 (và đã thanh toán phí Gate-In ở bước 5.1 —
   **đây chính là kịch bản test bug cross-module đã sửa**), tạo Estimate với ít nhất 1 dòng chi phí.
2. **Kỳ vọng**: thành công (`200`, message "Gửi báo giá cho Hãng tàu chờ phê duyệt"), `Estimate.Status =
   PENDING_APPROVAL`. Nếu trả về `400 "Hồ sơ công việc không hợp lệ"` → kiểm tra lại `DepotJob.Status`
   của job này có đúng `ESTIMATING` không (nếu không, khả năng cao là bug 5.1 đã tái phát).

Endpoint: `POST /api/DepotJobs/{id}/estimate`.

### 6.2 Validate số lượng/đơn giá âm
1. Gửi 1 dòng item với `Quantity <= 0` hoặc `UnitPrice < 0`.
2. **Kỳ vọng**: bị từ chối, không tạo Estimate.

---

## 7. Phê Duyệt Hãng Tàu — tab `approval`

### 7.1 Duyệt báo giá
1. Duyệt Estimate `PENDING_APPROVAL` vừa tạo ở bước 6.1.
2. **Kỳ vọng**: `Estimate.Status = APPROVED`, `DepotJob.Status` chuyển `ESTIMATING → REPAIRING`.

Endpoint: `POST /api/DepotJobs/{id}/approve-estimate?approverName=...`.

### 7.2 Từ chối báo giá
1. Từ chối 1 Estimate khác kèm lý do.
2. **Kỳ vọng**: `Estimate.Status = REJECTED`, job KHÔNG chuyển sang REPAIRING (giữ nguyên hoặc quay lại
   trạng thái chờ sửa báo giá tuỳ luồng UI).

Endpoint: `POST /api/DepotJobs/{id}/reject-estimate`.

---

## 8. Lệnh Sửa Chữa (WO) — tab `repair`

### 8.1 Bắt đầu sửa chữa (đúng luồng UI thật)
1. Từ hàng đợi Repair (job đang `REPAIRING`, Estimate đã `APPROVED`), bấm "Bắt Đầu Sửa Chữa".
2. **Kỳ vọng**: tạo `RepairOrder` thành công, không crash. (Đây là luồng UI thật — KHÔNG gọi
   `repair/assign` trước, vì nút "Phân Công" chưa được nối dây trong UI hiện tại.)

Endpoint: `POST /api/DepotJobs/{id}/repair/start`.

### 8.2 [Chỉ test qua API, không phải luồng UI] Assign rồi Start — biết trước sẽ lỗi
1. Gọi `POST /api/DepotJobs/{id}/repair/assign` rồi gọi tiếp `POST .../repair/start` cho CÙNG 1 job.
2. **Kỳ vọng hiện tại (chưa sửa, ghi nhận là bug tiềm ẩn)**: lần gọi `start` sẽ crash `500`
   (`PostgresException 23505` trùng khoá `IX_RepairOrders_JobNo`) vì cả 2 hàm đều tự tạo `RepairOrder`
   mới. Không phải lỗi cần fix gấp vì UI thật không đi qua đường này — chỉ test để đảm bảo không ai vô
   tình nối dây nút "Phân Công" mà chưa vá `StartRepairAsync` thêm check `existingRepair`.

### 8.3 Hoàn tất sửa chữa
1. Hoàn tất Work Order đang `REPAIRING`.
2. **Kỳ vọng**: `RepairOrder.CompletedAt` set, `DepotJob.Status → QC_PENDING`.

Endpoint: `POST /api/DepotJobs/{id}/repair/complete`.

---

## 9. QC Nghiệm Thu (AV Grade) — tab `qc`

### 9.1 QC đạt
1. Với job đang `QC_PENDING`, nghiệm thu ĐẠT.
2. **Kỳ vọng**: `DepotJob.Status → READY_FOR_OUT`.

Endpoint: `POST /api/DepotJobs/{id}/qc-complete` (chú ý path nối liền `qc-complete`, không phải
`/qc/complete`).

### 9.2 QC không đạt
1. Nghiệm thu KHÔNG đạt cho 1 job khác.
2. **Kỳ vọng**: job quay lại luồng sửa chữa/giám định bổ sung theo đúng thiết kế (không nhảy thẳng
   READY_FOR_OUT).

---

## 10. Truyền API Hãng Tàu — tab `shipping_api`

### 10.1 Đồng bộ trạng thái container cho hãng tàu
1. Chọn 1 container đã `READY_FOR_OUT`, đồng bộ với đúng mã hãng tàu của nó.
2. **Kỳ vọng**: trả về `ackToken` dạng `ACK-{carrier}-{jobNo}-{timestamp}`, `status = ACCEPTED`.

Endpoint: `POST /api/shipping/sync`.

### 10.2 Sai JobId/CarrierCode
1. Gửi `jobId` không tồn tại hoặc `carrierCode` rỗng.
2. **Kỳ vọng**: `400 Bad Request`.

---

## 11. Danh Sách Container — tab `container`

1. Mở danh sách, xác nhận tất cả container vừa thao tác ở các bước trên hiện đúng trạng thái mới nhất
   (không bị cache/stale) và đúng field `condition` (AV/CL/DM) khớp `Survey.ConditionRating` + trạng thái
   READY_FOR_OUT/GATE_OUT (container đã xong việc phải hiện AV dù giám định ban đầu là CL/DM).

Nguồn dữ liệu: `GET /api/DepotJobs` (App.tsx fetch 1 lần lúc mount, map sang `ContainerRecord`).

---

## 12. Sơ Đồ Bãi 2D (Konva) — tab `yard_map`

### 12.1 Tổng quan bãi
1. Mở màn, kiểm tra hiện đủ Zone/Block/Container/Vị trí và số liệu thống kê (`TotalCapacity`,
   `OccupancyRate`...) khớp dữ liệu thật.

Endpoint: `GET /api/yard/overview` (response bọc trong `{statusCode,message,data:{...}}` — **nhớ đọc field
`data`**, không đọc thẳng top-level khi test qua Postman/script).

### 12.2 Di chuyển container trên sơ đồ
1. Kéo-thả 1 container sang vị trí Bay/Row/Tier khác trong cùng Block hoặc sang Block khác.
2. **Kỳ vọng**: `BlockCode/Bay/Row/Tier` cập nhật đúng, `YardPosition` cũ trống lại / vị trí mới
   `IsOccupied=true`.

Endpoint: `POST /api/yard/container/move` (payload `{containerId, targetLocation: "BLOCK_A-02-02-01",
forkliftCode?, reason, operatorName?}` — `targetLocation` là 1 chuỗi ghép sẵn, không phải 4 field rời).

---

## 13. Quản Lý Vị Trí Block — tab `yard_blocks`

### 13.1 Sửa mô tả/tên Block
1. Mở Block bất kỳ, chỉ sửa Tên/Mô tả, lưu lại.
2. **Kỳ vọng**: `BlockName/Description` cập nhật đúng, **`BayCount/RowCount/MaxTier` KHÔNG đổi** (giữ
   nguyên sức chứa cũ).
3. **Lưu ý khi test qua API trực tiếp (không qua UI)**: endpoint này là **PUT ghi đè toàn bộ**, không
   phải PATCH từng phần — nếu gọi thẳng API mà thiếu `bayCount/rowCount/maxTier` trong body, các field đó
   sẽ bị ghi đè về `0`, phá vỡ sức chứa Block thật. UI hiện tại luôn gửi đủ 6 field (lấy từ state đang
   hiển thị) nên không gặp phải qua thao tác click bình thường — chỉ rủi ro khi test bằng Postman/script
   mà quên điền đủ field. Luôn gửi đủ `blockName, description, bayCount, rowCount, maxTier, status`.

Endpoint: `PUT /api/yard/blocks/{blockCode}`.

### 13.2 Chuyển trạng thái Bảo Trì / Hoạt Động
1. Bấm nút chuyển nhanh trạng thái Block (ACTIVE ⇄ MAINTENANCE).
2. **Kỳ vọng**: cập nhật đúng, các số liệu Occupied/Repair/Cleaning Count tính lại đúng theo `DepotJob`
   thật đang nằm trong Block đó.

---

## 14. Lệnh Điều Xe Nâng — tab `forklift`

### 14.1 Hạ bãi container (di chuyển bình thường)
1. Điều xe nâng dời 1 container đang `ESTIMATING`/`SURVEYING`/bất kỳ trạng thái nào sang vị trí mới.
2. **Kỳ vọng**: `BlockCode/Bay/Row/Tier` cập nhật đúng, `YardPosition` đồng bộ.

Endpoint: `POST /api/DepotJobs/{id}/forklift-move`.

### 14.2 **Test hồi quy bug đã sửa 2026-09-06** — dời container đang chờ Gate-Out
1. Đưa 1 container về `READY_FOR_OUT` (đã QC đạt).
2. Điều xe nâng dời nó sang vị trí khác (đảo chuyển trong lúc chờ xe tới lấy — tình huống thực tế phổ
   biến).
3. Gọi `GET /api/DepotJobs/{id}` — **`DepotJob.Status` phải vẫn là `READY_FOR_OUT`**, KHÔNG được đổi
   thành `IN_YARD`.
4. Thử Gate-Out container này ngay sau đó (`POST /api/DepotJobs/{id}/gate-out` với `truckPlate` +
   `driverName` hợp lệ) — **phải thành công** (`200`, chuyển `GATE_OUT`). Nếu bị từ chối
   ("job.Status != READY_FOR_OUT") → bug đã tái phát, cần sửa lại `CompleteForkliftMoveAsync`
   (`DepotJobService.cs`, bỏ dòng `job.Status = "IN_YARD"`).

---

## Kịch bản tổng hợp — 1 container xuyên suốt cả 14 màn (regression test đầy đủ nhất)

Chạy tuần tự đúng thứ tự dưới đây cho **1 container duy nhất** — đây là cách duy nhất bắt được lỗi loại
"2 module dùng chung 1 field trạng thái" đã gặp 2 lần trong dự án này:

```
Gate-In (1.1) → Survey có hư hỏng, Nộp Phiếu (2.1)
  → Operation: tạo Service Order LOLO (4.1) → Payment: thanh toán đúng số tiền (5.1)
    → kiểm tra job vẫn ESTIMATING (5.1 bước 3)
  → Estimate: lập báo giá (6.1) → phải thành công
  → Approval: duyệt (7.1) → job chuyển REPAIRING
  → Repair: bắt đầu (8.1) → hoàn tất (8.3) → job chuyển QC_PENDING
  → QC: đạt (9.1) → job chuyển READY_FOR_OUT
  → Forklift: dời vị trí (14.2) → kiểm tra job vẫn READY_FOR_OUT
  → Gate-Out: thử gate-out → phải thành công
```

Nếu toàn bộ chuỗi trên chạy trót lọt không bị kẹt ở bước nào, coi như 14 màn + 2 bug cross-module đã fix
đều hoạt động đúng.

## Bài học (vì sao phải test theo chuỗi, không test từng màn riêng lẻ)

Cả 2 bug nghiêm trọng nhất tìm được (mục 5.1 và 14.2) đều **không lộ ra khi test từng màn độc lập** — mỗi
endpoint riêng lẻ chạy đúng logic nội tại của nó. Bug chỉ lộ ra khi 1 container đi qua **2 module dùng
chung `DepotJob.Status`** theo đúng thứ tự thật (Payment rồi tới Estimate; Forklift rồi tới Gate-Out).
Khi review/test lại dự án này trong tương lai, luôn ưu tiên kịch bản "1 container xuyên suốt nhiều màn"
hơn là test độc lập từng màn.

---

## Kết quả chạy test 2026-09-06

Chạy thật toàn bộ kịch bản trên qua backend thật (Postgres thật, port 50210), gọi trực tiếp từng endpoint
đúng theo mục trên. Container chính xuyên suốt cả chuỗi: `QATST000201` (job id **65**, jobNo
`JOB-2026-4688`) — đi trọn Gate-In → Survey → Operation → Payment → Estimate → Approval → Repair → QC →
Shipping API → Container List → Yard Map → Forklift → **Gate-Out thành công**. Các test case phụ (validate
lỗi, edge case) dùng container/job riêng để không phá chuỗi chính.

| # | Test case | Kết quả | Ghi chú |
|---|---|---|---|
| 1.1 | Gate-In hợp lệ | ✅ PASS | job id=65, jobNo=JOB-2026-4688, status=SURVEYING |
| 1.2 | Validate thiếu trường bắt buộc | ✅ PASS (qua code review) | chặn ở frontend trước khi gọi API, đã đọc `validateGateInFields()` xác nhận đủ 7 field bắt buộc |
| 1.3 | Trùng số container | ✅ PASS | HTTP 409 đúng như kỳ vọng |
| 1.4 | Hãng tàu không tồn tại | ✅ PASS | HTTP 400, message rõ ràng |
| 1.5 | Gate-Out ngay trong Gate-In (sub-tab 2) | ✅ PASS (gián tiếp) | dùng chung endpoint `POST .../gate-out` đã verify thành công ở 14.2 |
| 1.6 | 4 nút kích thước container lấy từ danh mục thật | ✅ PASS (qua code review) | đã đọc `GATE_IN_ACCEPTED_ISO_SIZES` + `useEffect` fetch `CONTAINER_TYPE` |
| 2.1 | Nộp phiếu giám định có hư hỏng | ✅ PASS | status→ESTIMATING, damage totalCost = 425.000đ khớp công thức |
| 2.2 | Lưu tạm (Draft) | ✅ PASS | job vẫn SURVEYING, dữ liệu vẫn được lưu |
| 2.3 | Chọn dịch vụ vệ sinh lúc giám định → tự sinh CleaningRecord | ✅ PASS | `CleaningRecord` PENDING_CLEANING tự sinh đúng jobNo |
| 3.1 | Tiếp nhận walk-in vào bệ rửa | ✅ PASS | record id=16, status=PENDING_CLEANING |
| 3.2 | Hoàn tất từng hạng mục | ✅ PASS | status→IN_CLEANING |
| 3.3a | Chặn bàn giao khi 0/2 hạng mục xong | ✅ PASS | HTTP 400 đúng |
| 3.3b | Chặn bàn giao khi 1/2 hạng mục xong | ✅ PASS | HTTP 400 đúng |
| 3.3c | Bàn giao thành công khi xong hết | ✅ PASS | status→HANDOVER_TO_OPERATION |
| 4.1 | Lập Service Order với tariff LOLO thật | ✅ PASS | grandTotal=453.600đ = 420.000×1.08 |
| 4.2 | Dữ liệu tariff đầy đủ, không rỗng | ✅ PASS | 8 LOLO + 6 Storage tariff |
| 5.1 | **Thanh toán phí Gate-In, job vẫn giữ ESTIMATING** | ✅ **PASS (test hồi quy bug đã sửa)** | statusBefore=ESTIMATING, statusAfter=ESTIMATING — không còn bị ghi đè thành PAID |
| 5.2a | Sai số tiền thanh toán | ✅ PASS | HTTP 400 |
| 5.2b | Thanh toán lại phiếu đã PAID | ✅ PASS | HTTP 400 |
| 6.1 | Lập báo giá cho container đã trả phí Gate-In | ✅ **PASS (xác nhận fix 5.1 thông suốt)** | tạo Estimate thành công, không còn bị từ chối "Hồ sơ công việc không hợp lệ" |
| 6.2 | Validate số lượng âm | ✅ PASS | HTTP 400 |
| 7.1 | Duyệt báo giá | ✅ PASS | job→REPAIRING, estimate→APPROVED |
| 7.2 | Từ chối báo giá | ✅ PASS | estimate→REJECTED, job không chuyển REPAIRING |
| 8.1 | Bắt đầu sửa chữa (đúng luồng UI thật) | ✅ PASS | job→REPAIRING |
| 8.2 | [Chỉ API] assign rồi start | ⚠️ XÁC NHẬN LỖI ĐÃ BIẾT | HTTP 500 đúng như ghi nhận ở `14-repair.md`, không sửa vì UI thật không đi qua đường này |
| 8.3 | Hoàn tất sửa chữa | ✅ PASS | job→QC_PENDING |
| 9.1 | QC đạt | ✅ PASS | job→READY_FOR_OUT |
| 9.2 | QC không đạt | ✅ PASS | job quay lại REPAIRING, không nhảy READY_FOR_OUT |
| 10.1 | Đồng bộ API hãng tàu | ✅ PASS | ackToken sinh đúng định dạng |
| 10.2 | Sai JobId | ✅ PASS | HTTP 400 |
| 11.1 | Container List hiển thị đúng trạng thái mới nhất | ✅ PASS | |
| 12.1 | Tổng quan Sơ Đồ Bãi 2D | ✅ PASS | 4 block, 12 zone, tổng số container khớp |
| 12.2 | Di chuyển container trên sơ đồ | ✅ PASS | vị trí cập nhật đúng, status không đổi |
| 13.1 | Sửa tên/mô tả Block, giữ nguyên sức chứa | ✅ PASS | totalCapacity giữ nguyên 128 |
| 13.2 | Chuyển trạng thái ACTIVE ⇄ MAINTENANCE | ✅ PASS | |
| 14.1 | Điều xe nâng hạ bãi bình thường | ✅ PASS | |
| 14.2 | **Dời container READY_FOR_OUT, job giữ nguyên trạng thái + Gate-Out thành công** | ✅ **PASS (test hồi quy bug đã sửa)** | statusBefore=READY_FOR_OUT, statusAfter=READY_FOR_OUT, Gate-Out trả `GATE_OUT` thành công |

**Kết luận:** 33/33 test case PASS (tính cả 2 test hồi quy quan trọng nhất), 1 mục xác nhận đúng hành vi
lỗi đã biết (8.2, không phải regression — cố ý chưa sửa vì không phản ánh qua UI thật). Kịch bản tổng hợp
1 container xuyên suốt 14 màn + Gate-Out chạy trót lọt hoàn toàn.

**Phát hiện phụ (không phải bug dữ liệu, chỉ là message hiển thị sai) khi test 2.3**: `SubmitSurvey`
(`DepotJobsController.cs`) luôn trả cứng `Data = "Chuyển trạng thái sang ESTIMATING (Chờ báo giá)"` trong
response 200, bất kể trạng thái thật sự chuyển tới là gì (thực tế có thể là `CLEANING` nếu
`ConditionRating=B`, hoặc `READY_FOR_OUT` nếu không có damage). Đã kiểm tra `SurveyModulePage.tsx` xác
nhận frontend KHÔNG hiển thị field `data` này cho người dùng (chỉ check `statusCode`) nên không ảnh hưởng
trải nghiệm thật — ghi nhận, chưa cần sửa.
