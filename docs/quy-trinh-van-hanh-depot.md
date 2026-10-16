# Quy trình vận hành Depot container — từng công đoạn

Cập nhật: 11/10/2026 · Áp dụng cho hệ thống SolutionDepot (bản local hiện tại)

Tài liệu mô tả vòng đời một container từ lúc vào cổng đến lúc ra cổng: ai làm, làm ở màn nào, cần gì trước khi làm, và hệ thống tự ghi nhận những gì. Mỗi thao tác đều được ghi vào **nhật ký vòng đời** của container kèm tên người thực hiện và thời điểm (xem ở *Danh sách Container → chi tiết container*).

---

## Tổng quan

| # | Công đoạn | Người thực hiện | Màn hình (menu) | Trạng thái hồ sơ sau bước |
|---|---|---|---|---|
| 1 | Tiếp nhận cổng (Gate-In) | Khai thác cổng | 1. Tiếp Nhận Cổng (Gate-In) | Chờ giám định |
| 2 | Giám định | Giám định viên | 2. Giám Định (Survey e-EIR) | Đang vệ sinh |
| 3 | Vệ sinh | Tổ vệ sinh | 3. Tổ Vệ Sinh (Cleaning Bay) | Có hư hỏng → Chờ báo giá · Không hư hỏng → Sẵn sàng xuất |
| 4 | Xe nâng đưa vào bãi | Tài xế xe nâng | Lệnh Điều Xe Nâng | (giữ nguyên, có vị trí bãi) |
| 5 | Lập phiếu dịch vụ | Khai thác | 4. Khai Thác Gate-In (Tariff) | (giữ nguyên) |
| 6 | Thu tiền | Thu ngân / Khai thác | 5. Thanh Toán VietQR | (giữ nguyên, phiếu = Đã thanh toán) |
| 7 | Lập báo giá sửa chữa | Nhân viên báo giá | Lập Báo Giá Estimate | Chờ xác nhận → Chờ hãng tàu duyệt |
| 8 | Ghi nhận hãng tàu duyệt | Nhân viên báo giá | Phê Duyệt Hãng Tàu | Đang sửa chữa |
| 9 | Sửa chữa | Kỹ thuật viên | Lệnh Sửa Chữa (WO) | Chờ QC |
| 10 | QC nghiệm thu | Kỹ sư QC | 9. QC Nghiệm Thu | Đạt → Sẵn sàng xuất · Không đạt → sửa lại |
| 11 | Xuất cổng (Gate-Out) | Khai thác cổng | Cổng Xuất & Cấp Vỏ | Đã ra cổng |

Container **không hư hỏng** (giám định không ghi lỗi nào) đi tắt: Giám định → Vệ sinh → Khai thác lập phiếu → Thu tiền → Xe nâng hạ bãi → Gate-Out (bỏ qua bước 7–10).

---

## 1. Tiếp nhận cổng (Gate-In)

- **Người thực hiện:** Khai thác cổng (vai trò *Gate Operator*).
- **Màn hình:** *1. Tiếp Nhận Cổng (Gate-In)*.

**Các bước**
1. Nhập số container. Hệ thống kiểm tra đúng chuẩn ISO 6346 (4 chữ + 7 số, số kiểm tra cuối).
2. Chọn loại container (danh mục *DM Loại Container*), hãng tàu (danh mục *Hãng Tàu*), nhập tare / max payload.
3. Nhập thông tin xe: biển số, tài xế, số điện thoại, seal, booking… Nhân viên tiếp nhận lấy theo tài khoản đăng nhập.
4. Lưu.

**Hệ thống tự làm**
- Tạo hồ sơ container (Job) và số e-EIR, ghi nhật ký *Tiếp nhận cổng*.
- Container **chưa có vị trí bãi** (đang ở khu hạ tạm / giám định).
- Chặn nhận trùng container đang có hồ sơ trong bãi.
- Lưu thành công thì **xoá trắng form** (hãng tàu, loại container về mục đầu tiên của danh mục) và **tự chuyển sang màn *2. Giám Định*** — thông báo ghi số container + số e-EIR. Tài khoản không có quyền Giám Định thì ở lại màn Gate-In và thấy phiếu e-EIR.

---

## 2. Giám định (Survey e-EIR)

- **Người thực hiện:** Giám định viên (vai trò *Surveyor*).
- **Màn hình:** *2. Giám Định (Survey e-EIR)* → tab *Chờ giám định*.

**Các bước**
1. Bấm **Giám định** trên container → hệ thống **khoá** container cho người này (người khác thấy "Đang giám định: tên"). Khoá tự hết sau 30 phút nếu bỏ dở.
2. Ghi nhận tình trạng: **AV** (sạch, không hư hỏng) · **CL** (cần vệ sinh) · **DM** (hư hỏng).
3. Tab *Hư hỏng*: thêm từng lỗi (vị trí, mã hư hỏng, phương án sửa, kích thước, ảnh) — bắt buộc ≥ 1 lỗi nếu chọn DM.
4. Tab *Vệ sinh*: **bắt buộc chọn ít nhất 1 dịch vụ vệ sinh** (theo *Biểu Phí Vệ Sinh*), chọn lý do nếu là CL.
5. Tab *Hình ảnh*: **bắt buộc ít nhất 1 ảnh toàn cảnh**.
6. Bấm **Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh** (hoặc *Lưu tạm* để làm tiếp sau).

**Hệ thống tự làm**
- Mọi container sau giám định đều **chuyển sang Tổ Vệ Sinh** (bắt buộc).
- Tự tạo **lệnh vệ sinh** với đúng các dịch vụ đã chọn, kèm ảnh toàn cảnh làm ảnh "trước vệ sinh".
- Hiện thông báo kết quả và quay về danh sách chờ giám định; ghi nhật ký *Hoàn tất giám định*.

---

## 3. Vệ sinh (Cleaning Bay)

- **Người thực hiện:** Tổ vệ sinh (vai trò *Cleaning*).
- **Màn hình:** *3. Tổ Vệ Sinh (Cleaning Bay)*.

**Các bước**
1. Tiếp nhận lệnh vệ sinh của container.
2. Làm từng hạng mục, **tick hoàn thành từng hạng mục** (hoặc *Xong tất cả*).
3. Bấm **Hoàn tất vệ sinh & bàn giao Khai thác** — chỉ được khi **tất cả** hạng mục đã tick.

**Hệ thống tự làm**
- Container **có hư hỏng** → chuyển *Chờ báo giá*; **không hư hỏng** → *Sẵn sàng xuất*.
- Container xuất hiện ở màn **Khai thác** (chờ lập phiếu dịch vụ) và ở màn **Xe nâng** (lệnh đưa từ *KHU VỆ SINH* vào bãi).
- Ghi nhật ký từng hạng mục và *Vệ sinh xong · bàn giao Khai thác*.

Khai thác theo dõi tiến độ vệ sinh ở tab *Theo dõi vệ sinh* (chỉ xem) để đôn đốc.

---

## 4. Xe nâng đưa container vào bãi

- **Người thực hiện:** Tài xế xe nâng (vai trò *Forklift*).
- **Màn hình:** *Lệnh Điều Xe Nâng* (dùng trên tablet).

**Các bước**
1. Hàng đợi hiện lệnh **Vị trí lấy: KHU VỆ SINH**, kèm thời gian chờ từ lúc bàn giao vệ sinh.
2. Bấm **Nhận lệnh** (khoá cho 1 tài xế, tránh 2 xe cùng đi lấy) → **Bắt đầu**.
3. Hạ container, chọn **vị trí bãi** (Block - Bay - Row - Tier) → xác nhận.

**Hệ thống tự làm:** lưu vị trí bãi, cập nhật sơ đồ bãi, ghi nhật ký *"Từ Khu vệ sinh hạ bãi …"*. Container rời hàng đợi xe nâng.

Lệnh xe nâng khác: *Bãi → Xưởng sửa chữa* khi bắt đầu sửa, *Xưởng → Bãi* sau khi QC đạt.

---

## 5. Lập phiếu dịch vụ (Khai thác)

- **Người thực hiện:** Khai thác (vai trò *Gate Operator* / Admin).
- **Màn hình:** *4. Khai Thác Gate-In (Tariff)* → tab *Theo dõi vệ sinh / chờ lập phiếu*.

**Điều kiện:** container đã giám định và **đã vệ sinh xong, bàn giao**. Mỗi container chỉ có **1 phiếu dịch vụ**.

**Các bước**
1. Chọn container chờ lập phiếu → **Lập phiếu dịch vụ**.
2. Thông tin lấy **tự động từ hồ sơ Gate-In** (khách hàng, xe, tài xế, container) — không nhập tay.
3. Phí tính theo biểu phí: **cước nâng hạ (LOLO)** + **phí vệ sinh** (theo các dịch vụ vệ sinh đã làm).
4. **Lưu & In**: phiếu dịch vụ, phiếu thu, e-EIR.

**Hệ thống tự làm:** ghi nhật ký *Khai thác lập phiếu dịch vụ*; phiếu chuyển sang màn **Thanh toán**. Màn chi tiết phiếu chỉ để **xem và in**.

---

## 6. Thu tiền (Thanh toán)

- **Người thực hiện:** Thu ngân / Khai thác (vai trò *Cashier*, *Gate Operator*).
- **Màn hình:** *5. Thanh Toán VietQR*.

**Các bước**
1. Chọn phiếu chờ thanh toán.
2. Chọn hình thức:
   - **Tiền mặt:** nhập số tiền khách đưa (bỏ trống = đưa đủ) → hệ thống tính tiền trả lại → **Xác nhận đã thu tiền mặt**.
   - **Chuyển khoản VietQR:** hiện mã QR tài khoản công ty (lấy từ danh mục tài khoản nhận tiền), số tiền, nội dung = **tên công ty khách + số container** → nhân viên kiểm tra tiền về, tick xác nhận → lưu.
3. In phiếu thu.

**Hệ thống tự làm:** phiếu = *Đã thanh toán*, ghi **nhật ký thanh toán riêng** (tab *Nhật ký thanh toán*, gồm cả giao dịch bị từ chối) và nhật ký container *Thu tiền*. Container có hư hỏng chuyển sang màn **Báo giá**.

---

## 7. Lập báo giá sửa chữa (chuẩn Maersk AEMS)

- **Người thực hiện:** Nhân viên báo giá (vai trò *Estimator*).
- **Màn hình:** *Lập Báo Giá Estimate* (nhóm menu **BÁO GIÁ**).

**Điều kiện:** container có hư hỏng, đang *Chờ báo giá* và **phiếu dịch vụ đã thu tiền**. Container đủ điều kiện hiện ngay trong bảng với trạng thái **"Chờ lập báo giá"**.

**Các bước**
1. Bấm **Lập Báo Giá** trên container, hoặc **Lập Báo Giá Nhiều Container** (giống AEMS *Work Orders / Create / Multiple Equipments*): nhập từng dòng **Equipment Number · Vendor Ref No. (tuỳ chọn) · ảnh** cho các container cùng hãng tàu — mỗi container được tạo 1 báo giá riêng.
2. Nhập phần chung theo AEMS: **Shop Code**, **Cause**, **Mode**, Currency VND, **VAT**; mã tham chiếu e-EIR; **Remarks** (tối đa 255 ký tự).
3. Nhập từng **dòng sửa chữa** theo cấu trúc AEMS:

   | Damage code | Repair code | Description | Rep. loc | TPI | PCS | Man hrs/PC | Mat. cost/PC | Item total |
   |---|---|---|---|---|---|---|---|---|

   Gõ Repair code có trong danh mục → tự điền mô tả, giờ công/PC, vật tư/PC.
4. Nhập phần giờ công: **Ordinary Hours / OT1 / OT2 / OT3**, **Preparation Time** (giờ chuẩn bị) và **đơn giá giờ công** (tự lấy theo hãng tàu từ *DM Đơn Giá Giờ Công*). **Total Man Hours = Σ PCS × Man hrs/PC + Preparation Time** (đúng cách AEMS tính: vd Work Order 511183390 = 4,5 + 0,2 = 4,7 giờ).
5. Kiểm tra **Cost Summary**: tổng giờ công · tiền công (= tổng giờ × đơn giá giờ) · tiền vật tư (= Σ PCS × vật tư/PC) · trước VAT · VAT · tổng.
6. **Lưu báo giá** → trạng thái *Chờ xác nhận*.
7. Kiểm tra lại, bấm **Xác nhận báo giá** (hoặc *Lưu & Xác nhận* ngay trong form) → trạng thái **Chờ hãng tàu duyệt**.

**Lưu ý**
- Server tự tính lại toàn bộ tiền, không lấy số từ trình duyệt.
- Báo giá chưa được hãng tàu duyệt thì **sửa / bổ sung được** ngay trong *Chi tiết báo giá*; **sửa xong phải xác nhận lại**.
- Báo giá hãng tàu đã duyệt thì khoá, không sửa được.
- Gửi API hãng tàu: nút chỉ hiện khi hãng tàu đã cấu hình kết nối (hiện **chưa có hãng nào** — xác nhận trên hệ thống là đủ).
- Nhật ký: *Lập báo giá*, *Sửa / bổ sung báo giá* (số dòng và tổng trước → sau), *Xác nhận báo giá*.

---

## 8. Ghi nhận hãng tàu duyệt (nhập tay)

- **Người thực hiện:** Nhân viên báo giá.
- **Màn hình:** *Phê Duyệt Hãng Tàu*.

**Điều kiện:** báo giá **đã xác nhận** (chưa xác nhận thì hệ thống chặn).

Hãng tàu trả lời qua email / cổng AEMS / điện thoại / văn bản → nhân viên ghi nhận lại trên hệ thống.

**Duyệt** — bấm *Duyệt (Approve)*, nhập:

| Ô | Ghi chú |
|---|---|
| Số Work Order / lệnh duyệt hãng tàu | vd số WO trên AEMS (511183390) |
| Người duyệt phía hãng tàu | tên hoặc email |
| Thời điểm hãng tàu duyệt | mặc định lúc nhập, sửa theo email / AEMS |
| Nhận duyệt qua | Email / Cổng AEMS / Điện thoại / Văn bản |
| Mã duyệt | nếu hãng tàu cấp |
| Số tiền hãng tàu duyệt | mặc định = tổng báo giá, sửa nếu hãng tàu duyệt khác |
| Ghi chú | hướng dẫn của hãng tàu |

→ Báo giá *Đã duyệt*, container chuyển **Sửa chữa**. Người ghi nhận lưu tự động.

**Từ chối** — bấm *Không duyệt*, **bắt buộc nhập lý do** → báo giá *Từ chối*, nhân viên báo giá sửa lại (bước 7) rồi xác nhận lại.

---

## 9. Sửa chữa (Work Order)

- **Người thực hiện:** Kỹ thuật viên (vai trò *Technician*).
- **Màn hình:** *Lệnh Sửa Chữa (WO)* (nhóm menu **SỬA CHỮA**).

**Điều kiện:** chỉ container **hãng tàu đã duyệt báo giá**. Container đang báo giá không hiện ở đây.

**Các bước**
1. Lệnh sửa chữa ở trạng thái **Chờ sửa**. Hạng mục = **đúng các dòng báo giá đã duyệt** (Damage / Repair code, Rep. loc, số PCS).
2. Nhận lệnh / **Bắt đầu sửa** → *Đang sửa*.
3. Làm từng hạng mục, chụp ảnh **sau sửa**, ghi vật tư đã dùng.
4. **Hoàn tất sửa chữa** → chuyển QC.

**Hệ thống tự làm:** ghi nhật ký *Bắt đầu sửa chữa*, *Hoàn tất sửa chữa*.

---

## 10. QC nghiệm thu

- **Người thực hiện:** Kỹ sư QC (vai trò *QC Engineer*).
- **Màn hình:** *9. QC Nghiệm Thu (AV Grade)*.

**Các bước**
1. Tab *Chờ QC*: chọn container → **Tiến hành nghiệm thu**.
2. Kiểm tra, chụp ảnh, ghi nhận xét → **Đạt** hoặc **Không đạt**.
   - **Không đạt:** container quay lại *Sửa chữa* (bước 9).
   - **Đạt:** cột *Người QC & thời gian* hiện người nghiệm thu thật; in **chứng chỉ QC**.
3. Báo hãng tàu sửa xong: nút *Báo hãng tàu sửa xong* (API) chỉ hiện khi hãng tàu có kết nối API; hiện tại dùng **EDI / Email** hoặc báo ngoài hệ thống.

**Hệ thống tự làm:** QC đạt → container *Sẵn sàng xuất* (hoặc quay lại vệ sinh nếu còn lệnh vệ sinh chưa xong); tạo lệnh xe nâng *Xưởng sửa chữa → Bãi*.

---

## 11. Xuất cổng (Gate-Out)

- **Người thực hiện:** Khai thác cổng.
- **Màn hình:** nhóm *Cổng Xuất & Cấp Vỏ* (*Vỏ chờ cấp*, *Tiếp nhận làn cổng xuất*, *Nhật ký xuất & phiếu e-EIR*).

**Điều kiện (hệ thống chặn nếu thiếu)**
- Container ở trạng thái **Sẵn sàng xuất**.
- **Không còn phiếu dịch vụ chưa thanh toán**.
- Nhập đủ **biển số xe** và **tên tài xế**.

**Các bước:** chọn vỏ chờ cấp → nhập xe, tài xế, seal → xác nhận xuất → in e-EIR xuất.

**Hệ thống tự làm:** hồ sơ *Đã ra cổng*, giải phóng vị trí bãi, ghi nhật ký *Xuất cổng*.

---

## Phụ lục A — Vai trò và màn hình được dùng

| Vai trò | Được vào |
|---|---|
| Admin | Tất cả |
| Giám định (Surveyor) | Giám định, Container & bãi |
| Khai thác cổng (Gate Operator) | Gate-In, Khai thác, Thanh toán, Gate-Out |
| Thu ngân (Cashier) | Thanh toán, Công nợ, Kho, Danh mục, Báo cáo |
| Báo giá (Estimator) | Báo giá (gồm danh mục báo giá), Phê duyệt, Giám định |
| Kỹ thuật viên (Technician) | Sửa chữa, Container & bãi |
| QC | QC, Sửa chữa, Giám định |
| Xe nâng (Forklift) | Lệnh xe nâng, Container & bãi |
| Tổ vệ sinh (Cleaning) | Vệ sinh, Container & bãi |

Tài khoản nhân viên do **Admin** tạo ở *Phân Quyền RBAC & Users*. Hệ thống hiện chỉ còn tài khoản `admin`.

## Phụ lục B — Danh mục cần khai báo trước khi chạy

| Danh mục | Dùng ở |
|---|---|
| DM Loại Container (ISO), Hãng Tàu, Khách hàng | Gate-In |
| DM Vị trí cấu kiện, Mã hư hỏng IICL, Phương án sửa chữa, Tiêu chuẩn giám định, Phân hạng vỏ | Giám định |
| Biểu phí vệ sinh | Giám định, Vệ sinh, Khai thác |
| Cước nâng hạ (LoLo), Cước lưu bãi | Khai thác |
| Tài khoản nhận tiền (VietQR) | Thanh toán |
| **DM Mã hư hỏng (Damage), Mã sửa chữa (Repair), Vị trí sửa chữa (Rep. loc), Đơn giá giờ công theo hãng tàu, TPI · Cause · Mode · Shop Code** (menu BÁO GIÁ) | Báo giá |
| Sơ đồ bãi (Block / Bay / Row / Tier) | Xe nâng, Sơ đồ bãi |

## Phụ lục C — Trạng thái hồ sơ container

| Mã | Ý nghĩa |
|---|---|
| SURVEYING | Đã vào cổng, chờ / đang giám định |
| CLEANING | Đang vệ sinh |
| ESTIMATING | Có hư hỏng: chờ khai thác lập phiếu → thu tiền → báo giá → hãng tàu duyệt |
| REPAIRING | Hãng tàu đã duyệt, đang sửa chữa |
| QC_PENDING | Sửa xong, chờ QC |
| READY_FOR_OUT | Sẵn sàng xuất (sạch / đã sửa xong) |
| GATE_OUT | Đã ra cổng |

## Phụ lục D — Kết nối API hãng tàu (chưa có)

Hiện chưa hãng tàu nào cung cấp API. Hệ thống đã sẵn phần gửi **báo giá** và **báo sửa xong · QC đạt**; khi có API chỉ cần khai báo địa chỉ + khoá của hãng trên server (`CarrierIntegrations:{mã hãng}`), các nút gửi sẽ tự hiện. Chi tiết: [maersk-aems-api.md](maersk-aems-api.md).
