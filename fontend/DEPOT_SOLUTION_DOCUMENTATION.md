# TÀI LIỆU GIẢI PHÁP HỆ THỐNG QUẢN LÝ KHAI THÁC BÃI CONTAINER & SỬA CHỮA EMR
## SMART CONTAINER DEPOT & EMR MANAGEMENT ENTERPRISE SOLUTION
**Phiên Bản:** Enterprise Edition 4.0 | **Ngày Ban Hành:** Năm 2026  
**Tiêu Chuẩn Áp Dụng:** IICL-6 (Institute of International Container Lessors) | ISO 6346 | ISO 9711 | EDIFACT / WESTIM / CEDEX | RESTful API Gateway

---

## MỤC LỤC CHI TIẾT

1. [CHƯƠNG 1: TỔNG QUAN HỆ THỐNG VÀ BỐI CẢNH DOANH NGHIỆP](#chương-1-tổng-quan-hệ-thống-và-bối-cảnh-doanh-nghiệp)
   - 1.1. Bối cảnh ngành khai thác bãi container rỗng (Empty Depot) & Sửa chữa EMR
   - 1.2. Các thách thức vận hành truyền thống
   - 1.3. Mục tiêu chiến lược và các chỉ số ROI/KPI
   - 1.4. Tiêu chuẩn kỹ thuật và quy chuẩn quốc tế tuân thủ
2. [CHƯƠNG 2: KIẾN TRÚC HỆ THỐNG VÀ MÔ HÌNH CÔNG NGHỆ](#chương-2-kiến-trúc-hệ-thống-và-mô-hình-công-nghệ)
   - 2.1. Sơ đồ kiến trúc giải pháp tổng thể
   - 2.2. Nền tảng công nghệ Frontend, UI/UX và Đồ họa Canvas 2D
   - 2.3. Cổng tích hợp API Gateway & Webhook hãng tàu
   - 2.4. Ma trận phân quyền kiểm soát truy cập (RBAC - 10 Vai trò)
3. [CHƯƠNG 3: QUY TRÌNH NGHIỆP VỤ ĐẦU CUỐI 11 BƯỚC (END-TO-END WORKFLOW)](#chương-3-quy-trình-nghiệp-vụ-đầu-cuối-11-bước-end-to-end-workflow)
   - 3.1. [Bước 1] Cổng Vào (Gate-In) & Khởi tạo Phiếu e-EIR Nhập
   - 3.2. [Bước 2] Hạ Bãi & Định Vị Tọa Độ Không Gian Ô Bãi 4 Chiều
   - 3.3. [Bước 3] Giám Định Vỏ Container Chuyên Sâu Chuẩn IICL-6
   - 3.4. [Bước 4] Điều Độ Xe Nâng & Lệnh Di Chuyển Xưởng EMR
   - 3.5. [Bước 5] Lập Báo Giá Dự Toán Sửa Chữa (MNR Repair Estimate)
   - 3.6. [Bước 6] Phê Duyệt Báo Giá Hãng Tàu & EDI Gateway
   - 3.7. [Bước 7] Quản Lý Xuất Nhập Tồn Kho Vật Tư Phụ Tùng EMR
   - 3.8. [Bước 8] Thực Hiện Thi Công Lệnh Sửa Chữa (Work Order Execution)
   - 3.9. [Bước 9] Kiểm Định & Nghiệm Thu Chất Lượng KCS (QC Final Pass)
   - 3.10. [Bước 10] Cổng API Truyền Dữ Liệu Hãng Tàu (API Gateway / ACK Token)
   - 3.11. [Bước 11] Cổng Xuất (Gate-Out): Cấp Vỏ Cho Xe & Tự Động Trừ Khỏi Bãi
4. [CHƯƠNG 4: GIÁM SÁT HIỆU SUẤT & NĂNG SUẤT LAO ĐỘNG THỜI GIAN THỰC (LIVE WORKFORCE KPI)](#chương-4-giám-sát-hiệu-suất--năng-suất-lao-động-thời-gian-thực-live-workforce-kpi)
   - 4.1. Bảng theo dõi trực tiếp kỹ thuật viên (Live Stream Tracking)
   - 4.2. Bộ chỉ số đo lường hiệu năng cốt lõi (KPIs & Metrics)
   - 4.3. Tính toán lương khoán sản phẩm và xuất báo cáo tự động
5. [CHƯƠNG 5: HỆ THỐNG DANH MỤC MASTER DATA & BIỂU PHÍ DỊCH VỤ](#chương-5-hệ-thống-danh-mục-master-data--biểu-phí-dịch-vụ)
   - 5.1. Danh mục Hãng tàu & Hạn mức duyệt tự động
   - 5.2. Biểu phí dịch vụ nâng hạ, lưu bãi và vệ sinh
   - 5.3. Bảng mã phân loại hư hỏng và phương pháp sửa chữa IICL-6
   - 5.4. Danh mục loại container tiêu chuẩn ISO 6346
6. [CHƯƠNG 6: HƯỚNG DẪN TRIỂN KHAI, VẬN HÀNH & BẢO MẬT HỆ THỐNG](#chương-6-hướng-dẫn-triển-khai-vận-hành--bảo-mật-hệ-thống)

---

## CHƯƠNG 1: TỔNG QUAN HỆ THỐNG VÀ BỐI CẢNH DOANH NGHIỆP

### 1.1. Bối cảnh ngành khai thác bãi container rỗng (Empty Depot) & Sửa chữa EMR
Trong chuỗi cung ứng logistics hàng hải toàn cầu, bãi container rỗng (Depot) đóng vai trò là mắt xích lưu trữ, điều phối, bảo dưỡng và chuẩn bị vỏ container rỗng đạt tiêu chuẩn để đóng hàng xuất khẩu. 

Dịch vụ **EMR (Equipment Maintenance and Repair)** là phân hệ cốt lõi tạo ra doanh thu và đảm bảo an toàn vận tải hàng hóa. Mỗi container sau khi trả hàng nhập khẩu về bãi đều phải trải qua quy trình kiểm tra nghiêm ngặt, sửa chữa các biến dạng, thủng rách, nứt vỡ kết cấu, hư hỏng sàn gỗ trước khi được cấp phát cho các chủ hàng đóng hàng xuất khẩu mới.

### 1.2. Các thách thức vận hành truyền thống
- **Tình trạng giấy tờ thủ công (Paper-based Delays):** Sử dụng phiếu giao nhận giấy (EIR giấy), biên bản giám định giấy dẫn đến thất lạc chứng từ, tốn thời gian nhập liệu lại vào máy tính, gây ùn tắc kéo dài tại cổng bãi.
- **Thất thoát phụ tùng và vật tư:** Không kiểm soát được định mức tiêu hao tôn vách Corten, sàn gỗ Apitong, sơn chống rỉ theo từng số container cụ thể, dẫn đến chênh lệch kho vật tư.
- **Trễ hạn duyệt báo giá từ Hãng tàu (Slow MNR Approval):** Báo giá sửa chữa gửi qua email thủ công mất từ 24h đến 72h để hãng tàu duyệt, làm tồn ứ diện tích bãi chứa container chờ sửa.
- **Thiếu kiểm soát năng suất thợ sửa chữa:** Không đo lường được thời gian thực tế thi công của từng công nhân, tỷ lệ sửa lỗi phải làm lại (Rework rate) cao, ảnh hưởng đến cam kết thời gian hoàn thành (SLA) với Hãng tàu.
- **Ùn tắc khi cấp vỏ xuất bãi:** Thiếu cơ chế chọn vỏ linh hoạt, tài xế xe nâng phải đảo chuyển nhiều tầng để lấy đúng container chỉ định cứng nhắc.

### 1.3. Mục tiêu chiến lược và các chỉ số ROI/KPI
Hệ thống Smart Container Depot & EMR Management System được xây dựng nhằm giải quyết triệt để các hạn chế trên, hướng đến các chỉ số định lượng:
- **100% Không giấy tờ (Paperless Operation):** Số hóa hoàn toàn phiếu e-EIR có mã QR Code, lệnh sửa chữa điện tử (e-WO) và phiếu xuất kho điện tử (e-PXK).
- **Giảm 80% thời gian thông xe qua cổng:** Rút ngắn thời gian xử lý thủ tục tại Cổng Vào và Cổng Xuất từ 15 phút xuống dưới 2 phút mỗi lượt xe.
- **Rút ngắn 90% thời gian duyệt báo giá:** Tự động phê duyệt các báo giá dưới hạn mức cam kết (Auto-Approval Threshold) và truyền nhận dữ liệu qua API Gateway trong vòng 5 giây.
- **Tăng 35% năng suất thợ sửa chữa EMR:** Hệ thống phân bổ công việc tự động, theo dõi trực tiếp thời gian thực, nâng cao tỷ lệ nghiệm thu đạt ngay lần đầu (First Pass Yield) lên trên 98.5%.
- **Tự động trừ tồn kho & giải phóng ô bãi tức thì:** Khi container được cấp cho xe đầu kéo xuất bãi, hệ thống tự động trừ dữ liệu tồn bãi và cập nhật trạng thái ô bãi thành ô trống để sẵn sàng đón container mới.

### 1.4. Tiêu chuẩn kỹ thuật và quy chuẩn quốc tế tuân thủ
- **IICL-6 (Institute of International Container Lessors):** Bộ quy chuẩn quốc tế khắt khe nhất về giới hạn dung sai hư hỏng, quy cách vá tôn, ghép đà, thay ván sàn cho container biển.
- **ISO 6346 & ISO 9711:** Tiêu chuẩn mã hóa kích thước, phân loại loại hình container (20GP, 40GP, 40HC, 45HC, Flat Rack, Open Top, Reefer) và kiểm tra số kiểm tra (Check Digit).
- **EDIFACT / WESTIM / CEDEX / DESTIM:** Chuẩn trao đổi dữ liệu điện tử toàn cầu giữa Cảng/Depot và Hãng tàu hàng hải.
- **CSC Plate (International Convention for Safe Containers):** Kiểm định tải trọng cho phép xếp dỡ an toàn (Gross Weight, Payload, Stacking Capability).

---

## CHƯƠNG 2: KIẾN TRÚC HỆ THỐNG VÀ MÔ HÌNH CÔNG NGHỆ

### 2.1. Sơ đồ kiến trúc giải pháp tổng thể

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SMART DEPOT & EMR PLATFORM                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
      ┌────────────────────────────────┼────────────────────────────────┐
      ▼                                ▼                                ▼
┌──────────────┐             ┌───────────────────┐             ┌────────────────┐
│ CỔNG VÀO     │             │  BÃI CONTAINER    │             │ XƯỞNG EMR      │
│ (GATE-IN)    │             │  & XE NÂNG        │             │ & KHO VẬT TƯ   │
├──────────────┤             ├───────────────────┤             ├────────────────┤
│- Biển số xe  │             │- Sơ đồ bãi 2D     │             │- Giám định IICL│
│- e-EIR Nhập  │ ──────────► │- Block/Bay/Row/Tier ──────────► │- Báo giá MNR   │
│- Mã QR Code  │             │- Lệnh gắp vỏ      │             │- Xuất kho PXK  │
│- Phân luồng  │             │- Đảo chuyển bãi   │             │- Lệnh WO       │
└──────────────┘             └───────────────────┘             └───────┬────────┘
                                                                       │
                                                                       ▼
┌──────────────┐             ┌───────────────────┐             ┌────────────────┐
│ CỔNG XUẤT    │             │  API GATEWAY      │             │ KCS NGHIỆM THU │
│ (GATE-OUT)   │             │  HÃNG TÀU         │             │ (QC PASS)      │
├──────────────┤             ├───────────────────┤             ├────────────────┤
│- Cấp vỏ xe   │ ◄────────── │- Đồng bộ trạng thái│ ◄────────── │- Kiểm tra độ kín│
│- Trừ kho bãi │             │- Cấp token ACK    │             │- Chuẩn AV Sound│
│- e-EIR Xuất  │             │- Maersk/ONE/CMA.. │             │- Cấp chứng chỉ │
└──────────────┘             └───────────────────┘             └────────────────┘
```

### 2.2. Nền tảng công nghệ Frontend, UI/UX và Đồ họa Canvas 2D
- **React 19 & TypeScript:** Đảm bảo tính toàn vẹn kiểu dữ liệu tĩnh nghiêm ngặt, xử lý trạng thái phức tạp với hiệu năng cao.
- **Tailwind CSS v4 (Design System):** Thiết kế giao diện hiện đại theo nguyên lý *Anti-Slop*, độ tương phản chuẩn WCAG AA, không dùng hiệu ứng đổ bóng ảo rườm rà, tối ưu mật độ hiển thị thông tin cho môi trường vận hành công nghiệp.
- **HTML5 Canvas 2D Engine:** Xử lý hiển thị đồ họa sơ đồ bãi container với hàng nghìn ô bãi, mượt mà ở tần số 60 FPS, hỗ trợ kéo thả, zoom, pan và tô màu theo trạng thái thời gian thực.
- **Lucide Icons:** Hệ thống biểu tượng giao diện trực quan, đồng nhất và tinh gọn.

### 2.3. Cổng tích hợp API Gateway & Webhook hãng tàu
Hệ thống cung cấp kiến trúc mở với module **Shipping API Gateway**:
- **RESTful API:** Cung cấp các endpoint chuẩn JSON phục vụ gửi dự toán sửa chữa, cập nhật trạng thái container và kiểm tra tính hợp lệ của lệnh cấp vỏ.
- **Webhook Subscriptions:** Tiếp nhận tức thì các phản hồi phê duyệt báo giá từ Hãng tàu (Maersk APM, ONE, CMA CGM, MSC, COSCO) với cơ chế chữ ký bảo mật HMAC-SHA256.
- **Hàng đợi tái thử tự động (Retry Queue):** Tự động gửi lại các gói tin API khi có sự cố nghẽn mạng với thuật toán Exponential Backoff.

### 2.4. Ma trận phân quyền kiểm soát truy cập (RBAC - 10 Vai trò)

| STT | Mã Vai Trò | Tên Vai Trò | Trách Nhiệm Nghiệp Vụ & Quyền Hạn Chi Tiết |
|:---:|:---|:---|:---|
| 1 | `DEPOT_MANAGER` | Giám Đốc Depot | Toàn quyền quản trị hệ thống, xem dashboard phân tích sản lượng/doanh thu, duyệt chính sách đơn giá cước. |
| 2 | `EMR_LEAD` | Trưởng Phòng EMR | Phân công tổ đội thợ cơ khí, kiểm duyệt dự toán MNR, quản lý tiến độ xưởng và điều phối vật tư. |
| 3 | `SURVEYOR` | Giám Định Viên | Khảo sát tình trạng vỏ, vẽ sơ đồ hư hỏng IICL-6 6 mặt, chụp ảnh hiện trường, phân hạng Grade. |
| 4 | `STOREKEEPER` | Thủ Kho Vật Tư | Quản lý kho phụ tùng, lập Phiếu Nhập Kho (PNK), cấp phát Phiếu Xuất Kho (PXK) theo số Work Order. |
| 5 | `REPAIR_TECH` | Thợ Cơ Khí EMR | Tiếp nhận lệnh Work Order trên máy tính bảng, cập nhật tiến độ thi công thực tế, yêu cầu cấp vật tư. |
| 6 | `QC_INSPECTOR` | KCS Nghiệm Thu | Kiểm tra chất lượng sau sửa chữa, ký duyệt chứng chỉ đạt chuẩn Sound AV Grade. |
| 7 | `YARD_PLANNER` | Điều Độ Bãi | Quy hoạch mặt bằng bãi 2D, phát lệnh xe nâng di chuyển vỏ, tối ưu lộ trình xếp dỡ an toàn. |
| 8 | `GATE_IN_OPERATOR` | Cán Bộ Cổng Vào | Tiếp nhận xe vào bãi, kiểm tra thông tin vận tải, khởi tạo phiếu giao nhận e-EIR Nhập. |
| 9 | `GATE_OUT_OPERATOR`| Cán Bộ Cổng Xuất | Chọn vỏ tốt cấp cho xe đầu kéo, trừ container khỏi bãi, giải phóng ô bãi, in phiếu e-EIR Xuất. |
| 10 | `BILLING_ACCOUNTANT`| Kế Toán Cước | Đối soát biểu phí nâng hạ, lưu bãi, xuất hóa đơn cước EMR và quyết toán công nợ Hãng tàu. |

---

## CHƯƠNG 3: QUY TRÌNH NGHIỆP VỤ ĐẦU CUỐI 11 BƯỚC (END-TO-END WORKFLOW)

### 3.1. [Bước 1] Cổng Vào (Gate-In) & Khởi tạo Phiếu e-EIR Nhập
1. **Tiếp nhận xe đầu kéo:** Camera AI hoặc Cán bộ cổng ghi nhận thông tin xe (Biển số xe đầu kéo, Biển số rơ-moóc, Hãng vận tải, Tên tài xế, Số điện thoại).
2. **Kiểm tra số hiệu container:** Nhập số container (VD: `MSKU-781920-4`), hệ thống tự động kiểm tra số kiểm tra Check Digit theo chuẩn ISO 6346.
3. **Kiểm tra số chì niêm phong (Seal No):** Đối chiếu số chì seal thực tế với chứng từ bàn giao của tài xế.
4. **Khởi tạo phiếu e-EIR Nhập:** Hệ thống sinh mã phiếu duy nhất (VD: `EIR-IN-2026-891023`) kèm mã QR Code, lưu trữ thông tin thời gian vào bãi và phân luồng container:
   - Nếu vỏ sạch, nguyên vẹn: Đưa vào phân luồng vỏ tốt (`AV - Available`).
   - Nếu vỏ bẩn, có dấu hiệu hư hỏng: Đưa vào luồng giám định (`DM - Damaged`).

### 3.2. [Bước 2] Hạ Bãi & Định Vị Tọa Độ Không Gian Ô Bãi 4 Chiều
1. **Gán vị trí ô bãi:** Hệ thống tự động hoặc nhân viên điều độ gán tọa độ không gian 4 chiều:
   - **Block:** Khu vực bãi (VD: `Block A, B, C, D, E, F, G, H`).
   - **Bay:** Dãy ngang container (VD: `Bay 01, 03, 05` cho cont 20ft; `Bay 02, 06` cho cont 40ft).
   - **Row:** Hàng dọc container (VD: `Row 01` đến `Row 06`).
   - **Tier:** Tầng xếp dỡ từ mặt đất lên cao (`Tầng 1, Tầng 2, Tầng 3, Tầng 4, Tầng 5`).
2. **Kiểm soát an toàn xếp dỡ:** 
   - Cấm tuyệt đối xếp container 40ft đè lên container 20ft bên dưới.
   - Cảnh báo khi ô bãi vượt quá giới hạn tải trọng nền móng hoặc số tầng quy định.

### 3.3. [Bước 3] Giám Định Vỏ Container Chuyên Sâu Chuẩn IICL-6
1. **Bản đồ tương tác 6 mặt vỏ container:** Giám định viên sử dụng giao diện trực quan để chọn vị trí hư hỏng trên 6 bề mặt:
   - `FR` (Front - Vách đầu) | `DR` (Door - Cánh cửa sau) | `LT` (Left - Vách hông trái)
   - `RT` (Right - Vách hông phải) | `RF` (Roof - Mái nóc) | `FL` (Floor - Sàn gỗ) | `UG` (Gầm/Đà)
2. **Nhập chi tiết hư hỏng:**
   - **Mã hư hỏng (Damage Code):** Móp lõm (`DT`), Thủng rách (`HO`), Nứt gãy (`BK`), Mục sàn (`FD`), Rỉ sét (`CO`)...
   - **Kích thước đo đạc:** Chiều dài (cm), Chiều rộng (cm), Độ sâu (mm), Số lượng lỗ thủng.
   - **Mã phương pháp sửa chữa đề xuất (Repair Action):** Nắn nguội (`ST`), Vá tấm (`IN`), Thay mới (`RP`), Cắt ghép đà (`SN`), Vệ sinh (`CL`), Phun sơn (`PT`).
3. **Phân hạng cấp bậc chất lượng vỏ (Box Grade Assessment):**
   - `SOUND_AV`: Vỏ đạt chuẩn nguyên vẹn, sẵn sàng đóng hàng.
   - `CARGO_WORTHY`: Vỏ đạt chuẩn vận tải biển thông thường.
   - `FOOD_GRADE`: Vỏ sạch bóng, không mùi, sàn gỗ không dính hóa chất/dầu mỡ, chuyên đóng hàng thực phẩm, nông sản, dược phẩm.
   - `SCRAP_UNFIT`: Vỏ biến dạng hình học nặng, hết niên hạn sử dụng.

### 3.4. [Bước 4] Điều Độ Xe Nâng & Lệnh Di Chuyển Xưởng EMR
1. **Tạo lệnh điều chuyển (Shifting Order):** Đối với các container có kết quả giám định cần sửa chữa, hệ thống sinh lệnh gắp vỏ từ Block bãi vào Xưởng sửa chữa EMR.
2. **Tối ưu hóa hành trình xe nâng:** Hệ thống tính toán lộ trình di chuyển tối ưu, hạn chế tối đa các bước đảo dỡ chuyển tầng đối với container nằm ở tầng thấp (Tầng 1-2).

### 3.5. [Bước 5] Lập Báo Giá Dự Toán Sửa Chữa (MNR Repair Estimate)
1. **Tính toán chi phí tự động theo biểu phí Hãng tàu:**
   - **Chi phí nhân công:** `Tổng số giờ công (Man-hours) × Đơn giá giờ công thỏa thuận (Labor Rate/Hour)`.
   - **Chi phí vật tư phụ tùng:** `Số lượng vật tư tiêu hao × Đơn giá vật tư theo hợp đồng`.
2. **Phân chia trách nhiệm tài chính (Responsibility Breakdown):**
   - `Carrier Responsibility`: Hư hỏng do hao mòn tự nhiên, tuổi thọ kim loại.
   - `User / Trucking Responsibility`: Hư hỏng do va đập, tai nạn, chằng buộc hàng sai quy cách từ phía tài xế hoặc chủ hàng.
3. **Phát hành tệp báo giá dự toán:** Tự động tạo tệp PDF có chữ ký số điện tử và tệp dữ liệu EDI Westim chuẩn quốc tế.

### 3.6. [Bước 6] Phê Duyệt Báo Giá Hãng Tàu & EDI Gateway
1. **Cơ chế duyệt tự động (Auto-Approval Threshold):** Nếu tổng giá trị dự toán nhỏ hơn hạn mức thỏa thuận (VD: $\le \$50$ USD đối với Maersk, $\le \$60$ USD đối với ONE), hệ thống tự động chuyển trạng thái thành `APPROVED` trong vòng 1 giây.
2. **Cổng duyệt trực tuyến cho Đại diện Hãng tàu:** 
   - Xem ảnh hiện trường chất lượng cao và sơ đồ tọa độ hư hỏng.
   - Phê duyệt toàn phần (`Approved`), Phê duyệt một phần (`Revised`) hoặc Từ chối (`Rejected`).
   - Ghi nhận lịch sử đàm phán (Audit Log) minh bạch.

### 3.7. [Bước 7] Quản Lý Xuất Nhập Tồn Kho Vật Tư Phụ Tùng EMR
1. **Quản lý danh mục phụ tùng chuyên dụng:** Tôn Corten dày 1.6mm/2.0mm dập sóng vách, ván sàn gỗ Apitong 28mm 19 lớp chống thấm, gioăng cao su chữ J/H, tay khóa cam, đà ngang thép chữ C, sơn lót epoxy, sơn phủ màu Hãng tàu...
2. **Lập Phiếu Xuất Kho (PXK) tự động:** Khi lệnh sửa chữa được duyệt, hệ thống tự sinh phiếu xuất kho gắn chính xác với số Work Order của container đó.
3. **Cảnh báo tồn kho an toàn (Safety Stock Alerts):** Tự động phát cảnh báo khi lượng tồn kho của bất kỳ vật tư nào xuống dưới ngưỡng tối thiểu để phòng ngừa gián đoạn xưởng.

### 3.8. [Bước 8] Thực Hiện Thi Công Lệnh Sửa Chữa (Work Order Execution)
1. **Phân công kỹ thuật viên:** Trưởng phòng EMR phân bổ công việc cho thợ cơ khí hoặc tổ đội có chứng chỉ tay nghề phù hợp.
2. **Theo dõi tiến độ thi công thời gian thực:**
   - Kỹ thuật viên bấm nút **Bắt Đầu (Start)** trên màn hình cảm ứng xưởng.
   - Ghi nhận thời gian tạm dừng (Pause - lý do chờ vật tư, chờ nâng hạ) và thời gian hoàn thành (Complete).
   - Tải lên ảnh nghiệm thu từng mối hàn, mối vá, lớp sơn lót và sàn gỗ hoàn thiện.

### 3.9. [Bước 9] Kiểm Định & Nghiệm Thu Chất Lượng KCS (QC Final Pass)
1. **Kiểm tra tiêu chuẩn kỹ thuật nghiêm ngặt:**
   - **Thử kín nước kín sáng (Light-tight Test):** Kiểm tra bên trong container trong điều kiện đóng kín cửa, đảm bảo không có bất kỳ tia sáng nào lọt qua lỗ thủng hay khe gioăng cửa.
   - **Kiểm tra mối hàn & tấm vá:** Đảm bảo mối hàn liên tục, không rỗ khí, mép vá chuẩn vát 45 độ theo IICL-6.
   - **Kiểm tra sàn gỗ:** Độ phẳng bề mặt, không gồ ghề, không đinh ốc nhô cao, không dính dầu mỡ.
   - **Đo độ dày màng sơn (DFT):** Lớp sơn lót epoxy và sơn phủ đạt tối thiểu 100-120 microns.
2. **Cấp chứng nhận nghiệm thu (QC Certificate):** KCS ký duyệt điện tử, cấp mã chứng chỉ (VD: `QC-PASS-2026-88129`), tự động chuyển trạng thái container sang **`SOUND AV GRADE`** (Vỏ tốt sẵn sàng cấp).

### 3.10. [Bước 10] Cổng API Truyền Dữ Liệu Hãng Tàu (API Gateway / ACK Token)
1. **Gửi gói tin đồng bộ thời gian thực:** Hệ thống tự động đẩy gói tin JSON qua API Gateway đến hệ thống máy chủ của Hãng tàu (Maersk BoxFleet, ONE Global, CMA CGM Intermodal...).
2. **Nhận mã xác thực mở khóa (ACK Token):** Hệ thống hãng tàu phản hồi mã xác thực (VD: `ACK-REF-MAE-99210-PASSED`), chính thức kích hoạt container ở trạng thái `AVAILABLE FOR DISPATCH` trên hệ thống đặt chỗ toàn cầu.

### 3.11. [Bước 11] Cổng Xuất (Gate-Out): Cấp Vỏ Cho Xe & Tự Động Trừ Khỏi Bãi
1. **Quy tắc cấp vỏ tự do & linh hoạt:** Xe đầu kéo đến bãi nhận vỏ có thể lấy **bất kỳ container nào trong kho vỏ tốt** (đã qua QC AV Grade). Cán bộ cổng có thể:
   - Chọn theo hãng tàu, kích cỡ (20GP, 40HC, Food Grade...).
   - Bấm nút **`⚡ Gợi Ý Vỏ Tốt Dễ Gắp (Tầng 1-2)`** để hệ thống tự động chọn container ở vị trí tầng thấp nhất, giúp xe nâng lấy vỏ nhanh nhất trong vòng 60 giây.
2. **Xác nhận cấp vỏ & Tự động trừ khỏi bãi:**
   - Cán bộ cổng nhập biển số xe đầu kéo, rơ-moóc, tài xế và bấm **`🚚 XÁC NHẬN CẤP VỎ CHO XE & TRỪ KHỎI BÃI`**.
   - **Hệ thống ngay lập tức trừ container khỏi danh sách tồn bãi** (Trạng thái chuyển sang `GATE_OUT`).
   - **Giải phóng vị trí ô bãi** (`Block - Bay - Row - Tier`), vị trí bãi lập tức trở thành ô trống để đón container khác hạ bãi.
3. **Phát hành phiếu e-EIR Xuất Bãi:** Tự động tạo và in phiếu giao nhận điện tử chuẩn quốc tế kèm mã QR phục vụ xe qua cổng ra.
4. **Nhật ký xuất bãi (Gate-Out History):** Lưu trữ toàn bộ lịch sử xe, số chì seal, tài xế, thời gian rời bãi để tra cứu và kiểm soát 24/7.

---

## CHƯƠNG 4: GIÁM SÁT HIỆU SUẤT & NĂNG SUẤT LAO ĐỘNG THỜI GIAN THỰC (LIVE WORKFORCE KPI)

### 4.1. Bảng theo dõi trực tiếp kỹ thuật viên (Live Stream Tracking)
Giao diện giám sát nhân sự cung cấp góc nhìn toàn cảnh về hoạt động của toàn bộ xưởng sửa chữa EMR theo từng giây:
- **Trạng thái làm việc của thợ:** Đang thi công (Working), Đang chờ việc (Idle), Nghỉ ca (On Break).
- **Chi tiết container đang thao tác:** Hiển thị rõ số hiệu container, loại sửa chữa (Hàn vá tôn, thay sàn, nắn đà, sơn) và thời gian đã thực hiện (Elapsed Time).
- **Cảnh báo quá thời gian định mức (SLA Breach Warning):** Đổi màu cảnh báo đỏ khi thời gian thi công vượt quá 115% so với định mức tiêu chuẩn.

### 4.2. Bộ chỉ số đo lường hiệu năng cốt lõi (KPIs & Metrics)

$$\text{Tỷ Lệ Nghiệm Thu Đạt Lần Đầu (FPY \%)} = \left( \frac{\text{Số Container Đạt KCS Lần Đầu}}{\text{Tổng Số Container Đã Nghiệm Thu}} \right) \times 100\%$$

$$\text{Hiệu Suất Thực Hiện Định Mức (\%)} = \left( \frac{\text{Tổng Giờ Công Định Mức Hoàn Thành}}{\text{Tổng Giờ Lao Động Thực Tế}} \right) \times 100\%$$

- **FPY Target:** $\ge 98.0\%$ (Giảm thiểu tối đa chi phí tháo dỡ sửa lại).
- **MTTR (Mean Time to Repair):** Thời gian sửa chữa trung bình đạt dưới 45 phút/cont 20ft và dưới 75 phút/cont 40ft.
- **SLA Compliance:** $\ge 99.2\%$ đơn hàng sửa chữa hoàn thành đúng cam kết thời gian với Hãng tàu.

### 4.3. Tính toán lương khoán sản phẩm và xuất báo cáo tự động
- **Tính lương khoán theo đơn giá công đoạn:** Tự động tổng hợp số giờ công tiêu chuẩn (Standard Man-hours) mà từng kỹ thuật viên đã hoàn thành trong tháng nhân với đơn giá khoán.
- **Xuất báo cáo Excel (.xlsx):** Hỗ trợ xuất bảng tổng hợp năng suất, bảng chi tiết từng lượt sửa chữa phục vụ phòng Kế toán - Nhân sự đối soát bảng lương.

---

## CHƯƠNG 5: HỆ THỐNG DANH MỤC MASTER DATA & BIỂU PHÍ DỊCH VỤ

### 5.1. Danh mục Hãng tàu & Hạn mức duyệt tự động

| Mã Hãng Tàu | Tên Hãng Tàu Đầy Đủ | Hạn Mức Tự Động Duyệt (USD) | Chuẩn Kết Nối API |
|:---|:---|:---:|:---|
| `MAEU` | Maersk Line (A.P. Moller - Maersk) | $50.00 | REST API / Webhook |
| `ONEY` | Ocean Network Express (ONE) | $60.00 | REST API / CEDEX |
| `CMAC` | CMA CGM Group | $55.00 | WESTIM / API Gateway |
| `MSCU` | Mediterranean Shipping Company (MSC)| $45.00 | REST API / EDIFACT |
| `COSU` | COSCO Shipping Lines | $50.00 | REST API / JSON |

### 5.2. Biểu phí dịch vụ nâng hạ, lưu bãi và vệ sinh

| Mã Dịch Vụ | Tên Loại Dịch Vụ | Kích Cỡ Áp Dụng | Đơn Giá (VND) | Đơn Vị Tính |
|:---|:---|:---:|:---:|:---:|
| `LIFT_ON_20` | Phí Nâng Container Lên Xe (Gate-Out) | 20GP / 20OT | 280,000 | Cont / Lượt |
| `LIFT_ON_40` | Phí Nâng Container Lên Xe (Gate-Out) | 40GP / 40HC | 420,000 | Cont / Lượt |
| `LIFT_OFF_20`| Phí Hạ Container Xuống Bãi (Gate-In) | 20GP / 20OT | 280,000 | Cont / Lượt |
| `LIFT_OFF_40`| Phí Hạ Container Xuống Bãi (Gate-In) | 40GP / 40HC | 420,000 | Cont / Lượt |
| `CLEAN_SWEEP`| Vệ sinh quét khô, nhặt rác thùng | Tất cả kích cỡ | 80,000 | Container |
| `CLEAN_WATER`| Vệ sinh xịt rửa nước áp lực cao | Tất cả kích cỡ | 150,000 | Container |
| `CLEAN_CHEM` | Vệ sinh tẩy rửa hóa chất khử mùi/dầu mỡ| Tất cả kích cỡ | 450,000 | Container |

### 5.3. Bảng mã phân loại hư hỏng và phương pháp sửa chữa IICL-6

#### Mã Hư Hỏng Quốc Tế (Damage Codes):
- `DT` (Dent): Móp méo, cong vênh bề mặt tôn kim loại.
- `HO` (Hole): Thủng rách, xuất hiện lỗ hổng thủng qua vách/mái.
- `BK` (Broken): Nứt gãy, biến dạng kết cấu xà gồ, đà, khóa cửa.
- `FD` (Floor Damaged): Sàn gỗ mục nát, nứt tách lớp, gãy thanh ván.
- `CO` (Corrosion): Rỉ sét ăn mòn, bong tróc lớp sơn bảo vệ.
- `CT` (Contaminated): Nhiễm bẩn hóa chất, dầu nhờn, rác thải hữu cơ.

#### Mã Thao Tác Sửa Chữa (Repair Action Codes):
- `ST` (Straighten): Nắn ép nguội bằng thủy lực hoặc búa chuyên dụng.
- `IN` (Insert): Cắt bỏ phần hư hỏng và hàn vá miếng tôn Corten mới chuẩn IICL.
- `RP` (Replace): Tháo bỏ và thay thế mới 100% chi tiết hư hỏng.
- `SN` (Section): Cắt ghép nối một đoạn đà đáy/xà gồ theo tiêu chuẩn kỹ thuật.
- `CL` (Clean): Tẩy rửa, vệ sinh bề mặt trong/ngoài container.
- `PT` (Paint): Xử lý bề mặt, phun sơn lót chống rỉ và sơn phủ màu Hãng tàu.

### 5.4. Danh mục loại container tiêu chuẩn ISO 6346
- `20GP` (20ft General Purpose): Container bách hóa 20 feet khô.
- `40GP` (40ft General Purpose): Container bách hóa 40 feet khô tiêu chuẩn (Cao 8'6").
- `40HC` (40ft High Cube): Container bách hóa 40 feet cao (Cao 9'6").
- `45HC` (45ft High Cube): Container 45 feet siêu cao cho hàng cồng kềnh.
- `20OT / 40OT` (Open Top): Container mở nóc phủ bạt cho hàng quá khổ chiều cao.
- `20FR / 40FR` (Flat Rack): Container sàn phẳng không vách cho hàng siêu trường siêu trọng.
- `20RF / 40RF` (Reefer): Container lạnh kiểm soát nhiệt độ chuyên dụng.

---

## CHƯƠNG 6: HƯỚNG DẪN TRIỂN KHAI, VẬN HÀNH & BẢO MẬT HỆ THỐNG

### 6.1. Yêu cầu thiết bị phần cứng đầu cuối
- **Trạm Cổng (Gate Lanes 01-04):** Máy tính để bàn Core i5/8GB RAM, Máy in phiếu e-EIR nhiệt tốc độ cao, Máy quét mã vạch 2D QR Code, Camera IP nhận diện biển số.
- **Hiện trường bãi & Xưởng EMR:** Máy tính bảng công nghiệp (Tablet Industrial) chống bụi nước IP65 kết nối Wifi 6 chuyên dụng cho Giám định viên và Thợ cơ khí.
- **Khu vực xe nâng:** Thiết bị đầu cuối gắn trên xe nâng (Vehicle Mounted Terminal - VMT) hiển thị tọa độ ô bãi và lệnh gắp vỏ.

### 6.2. Chính sách sao lưu dữ liệu & Khắc phục sự cố (Disaster Recovery)
- **Sao lưu tự động (Automated Backups):** Tự động sao lưu toàn bộ cơ sở dữ liệu định kỳ mỗi 6 giờ và lưu trữ phân tán đa vùng (Multi-region Cloud Storage).
- **RTO (Recovery Time Objective):** Thời gian khôi phục hệ thống khi có sự cố dưới 15 phút.
- **RPO (Recovery Point Objective):** Điểm phục hồi dữ liệu đảm bảo không thất thoát quá 60 giây giao dịch.

### 6.3. Tiêu chuẩn an ninh mạng & Quyền riêng tư
- Mã hóa toàn bộ dữ liệu đường truyền với giao thức **TLS 1.3 / HTTPS**.
- Xác thực người dùng đa yếu tố (MFA / 2FA) đối với các vai trò quản trị cấp cao.
- Ghi vết nhật ký truy cập (Audit Trail Logs) 100% mọi thao tác sửa đổi dữ liệu cước phí, dự toán và xuất kho vật tư.

---
*Bản quyền tài liệu thuộc về Hệ thống Quản Trị Khai Thác Bãi Container & Sửa Chữa EMR Thông Minh.*
