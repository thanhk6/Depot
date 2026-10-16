# Tích hợp API Maersk AEMS – Container Maintenance & Repair

> Cập nhật: 11/10/2026 · Nguồn: đặc tả OpenAPI **công khai** của Maersk (v1.0.0, file 07/04/2025) + *AEMS Integration Guide v3.0* + Postman collection chính thức.
> Bản gốc lưu ở [`docs/maersk/`](maersk/):
> [container-maintenance-repair_v1-0_spec.yaml](maersk/container-maintenance-repair_v1-0_spec.yaml) ·
> [container-uploads-attachments_v1-0_spec.yaml](maersk/container-uploads-attachments_v1-0_spec.yaml) ·
> [container-user-identity_v1-0_spec.yaml](maersk/container-user-identity_v1-0_spec.yaml) ·
> [aems-integration-guide_v3-0.pdf](maersk/aems-integration-guide_v3-0.pdf) ·
> [aems-postman-collection_v2.json](maersk/aems-postman-collection_v2.json)

Các thông tin dưới đây **đã đối chiếu với đặc tả chính thức** (không còn phỏng đoán như bản 04/10/2026).

---

## 1. Tổng quan

| Mục | Nội dung |
|---|---|
| Tên sản phẩm API | **Container Maintenance & Repair** (`aems-maintenance-repair`) |
| Mô tả | Tạo, kiểm tra (validate) và lấy **maintenance order** (= Work Order / báo giá sửa chữa) cho container Maersk |
| Đối tượng | **Supplier** — depot / xưởng sửa chữa đang làm M&R cho Maersk |
| Cấp quyền | Duyệt thủ công; cần **mã mời (Invitation code) `AEMS`** khi bật API trong app |
| Gồm 3 API | **Orders** (tạo / sửa / xem / xoá / hoàn tất order) · **Blob manager** (upload ảnh, PDF đính kèm) · **Identity** (kiểm tra client đã được gán shop chưa) |
| Danh mục (master data) | Maersk **không** cung cấp mã sửa chữa, part number, hợp đồng shop qua API — depot **tự quản lý** (đúng như danh mục báo giá của SolutionDepot) |

---

## 2. Đăng ký và lấy khoá (việc của depot)

1. **Hỏi EMR inspector của Maersk** để lấy: **shop code** (3 ký tự, vd `3HY`), **location code** (vd `VNHPHVI`), **invitation code**.
2. Đăng ký tài khoản trên **developer.maersk.com** bằng email công ty gắn với shop.
3. **Create new app**: đặt tên (vd "SolutionDepot – MATRAN"), phần mô tả ghi **shop code + location code** (vd *"App for shop 3HY located at VNHPHVI interacting with AEMS"*), nhập **Invitation code**, bật **Container Maintenance & Repair**.
4. Chờ Maersk duyệt (tới ~3 ngày làm việc) → nhận **Consumer-Key** + **Client Secret** (dùng được cho cả stage và production).
5. Chờ AEMS team **gán consumer key vào shop** (nếu chưa gán sẽ gặp lỗi *"User [xyz] has not been added to the system"* / 403 *"does not have access to the shop"*).
6. Test trên **stage**; Maersk yêu cầu **tối thiểu 50 order tạo thành công trên stage** mới mở quyền tạo order trên production.

> **Bảo mật:** Consumer-Key / Client Secret **không** gửi qua chat, email, không ghi vào code / Git — chỉ khai báo trên server.

Hỗ trợ kỹ thuật: email `vitservicedesk@maersk.com`, **tiêu đề bắt buộc bắt đầu bằng `AEMS - `** (vd *"AEMS - Map consumer-key to shops"*), kèm môi trường, consumer key, shop code, cURL request/response.

---

## 3. Môi trường và xác thực

| | Stage (Pre-Production) | Production |
|---|---|---|
| Orders | `https://api-stage.maersk.com/aems/orders` | `https://api.maersk.com/aems/orders` |
| Upload / download file | `https://api-stage.maersk.com/aems/blob-manager` | `https://api.maersk.com/aems/blob-manager` |
| Identity | `https://api-stage.maersk.com/aems/identity` | `https://api.maersk.com/aems/identity` |
| Lấy token | `https://api-stage.maersk.com/customer-identity/oauth/v2/access_token` | `https://api.maersk.com/customer-identity/oauth/v2/access_token` |

**Lấy token (OAuth 2.0 client credentials):**

```http
POST /customer-identity/oauth/v2/access_token
Consumer-Key: <consumer key>
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=<consumer key>&client_secret=<client secret>
```

**Mọi lần gọi AEMS** gửi 2 header: `Consumer-Key: <consumer key>` và `Authorization: Bearer <access_token>`.

**Giới hạn:** 5.000 lần gọi / giờ / consumer key, tối đa 6.000 / phút; vượt → HTTP **429**.

Kiểm tra kết nối: `GET /aems/identity/api/identity/user-details` → phải trả `isExternal: true` và đúng shop code đã đăng ký.

---

## 4. Các endpoint

| Phương thức | Đường dẫn (sau `/aems/orders`) | Việc |
|---|---|---|
| POST | `/api/maintenance-orders` | **Tạo + validate** order (= gửi báo giá). Trả về `maintenanceOrderNumber` (vd 511183390), trạng thái, tổng tiền Maersk tính |
| GET | `/api/maintenance-orders` | Danh sách order (lọc: số order, số container, shop, trạng thái, mode, từ ngày / đến ngày, có phân trang) |
| GET | `/api/maintenance-orders/{maintenanceOrderNumber}` | Chi tiết 1 order — dùng để **theo dõi đã duyệt chưa** |
| PUT | `/api/maintenance-orders/{maintenanceOrderNumber}` | Sửa order (khi bị từ chối / thiếu ảnh / sai thông tin) — validate lại |
| DELETE | `/api/maintenance-orders/{maintenanceOrderNumber}` | Xoá order |
| POST / GET | `/api/maintenance-orders/{n}/remarks` | Thêm / xem ghi chú (scope 1 = cho GSC, 2 = cho mọi người) |
| PATCH | `/api/maintenance-orders/{n}/complete-repair` | **Báo đã sửa xong** (cập nhật serial part nếu có) |
| GET | `/api/maintenance-orders/{n}/status` | Lịch sử trạng thái order kèm thời điểm |
| POST | `/aems/blob-manager/api/manage/{shopCode}/upload` | Upload ảnh / PDF → trả **Attachment ID** (vd `1cd3cf29-…-6f17a506c666.png`) để gắn vào order |

### Mã trạng thái order

| Mã | Ý nghĩa | | Mã | Ý nghĩa |
|---|---|---|---|---|
| 10 | Draft | | 390 | **Approved** (Maersk đã duyệt) |
| 100 | **Rejected** | | 400 | **RepairCompleted** |
| 150 | DeclaredAsTTL | | 500 / 550 / 600 | Purchase order khởi tạo / lỗi / đã tạo |
| 200 | **PendingApproval** (chờ duyệt) | | 650 / 800 | Thanh toán lỗi / đã thanh toán |
| 320 / 330 / 340 | Chờ CENELM / chờ chuyên gia / tạm dừng kiểm TTL | | 900 / 9999 | Processed / Deleted |

---

## 5. Cấu trúc order gửi lên và đối chiếu với SolutionDepot

### 5.1. Đầu order

| Trường AEMS | Ví dụ | SolutionDepot hiện có | Ghi chú |
|---|---|---|---|
| `maintenanceShopCode` | `3HY` | `Estimate.ShopCode` (DM Shop Code) | ✅ |
| `equipmentNumber` | `XINU1579876` | `DepotJob.ContainerNo` | ✅ |
| `maintenanceRepairModeCode` | `'01'`, `'41'` | `Estimate.RepairMode` (DM Mode) | ✅ — nhập mã số đúng của Maersk |
| `maintenanceOrderCause` | `WEAR_AND_TEAR` | `Estimate.Cause` (DM Cause) | ⚠️ AEMS chỉ nhận 4 mã: `CONFIRMED_3RD_PARTY`, `HANDLING_DAMAGE`, `UNCONFIRMED_3RD_PARTY`, `WEAR_AND_TEAR` — DM Cause hiện là Wear and Tear / Third Party / Owner / User → **cần đổi** |
| `vendorsReference` | `V1234567` | `Estimate.VendorRefNo` | ✅ |
| `damagedAt` | `PORT123` | — | ❌ chưa có (nơi xảy ra hư hỏng, tuỳ chọn) |
| `reeferContainerCondition` | `BOX_OK` | — | ❌ chưa có (chỉ container lạnh) |
| `attachedImages[]` | `{name, path, extension, contentType}` | `Estimate.InspectionPhotoUrlsJson` (ảnh lưu ở FileServer của depot) | ⚠️ phải **upload sang blob-manager của Maersk** trước, lấy Attachment ID |
| `maintenanceOrderRemarks[]` | `{maintenanceOrderRemarkText, maintenanceOrderRemarkScope}` | `Estimate.Notes` (Remarks 255 ký tự) | ✅ (scope mặc định 2) |
| `maintenanceOrderManHours[]` | `{manHours, manHoursType}` | `OrdinaryHours`, `Ot1Hours`, `Ot2Hours`, `Ot3Hours` | ✅ map: REGULAR ← Ordinary, OVERTIME ← OT1, DOUBLETIME ← OT2, MISCELLANEOUS ← OT3. `TOTALPREPARATION` do **Maersk tự tính** và trả về |

### 5.2. Dòng sửa chữa (`maintenanceOrderLines[]`)

| Trường AEMS | Ví dụ | SolutionDepot | Ghi chú |
|---|---|---|---|
| `equipmentDamageCode` | `BK` | `EstimateItem.DamageCode` | ✅ |
| `maintenanceTypeCode` | `'6382'` | `EstimateItem.RepairCode` | ✅ |
| `maintenanceRepairLocationCode` | `XX00` | `EstimateItem.LocationCode` | ✅ |
| `thirdPartyIndicator` | `THIRD_PARTY` | `EstimateItem.Tpi` (O/U/T/W) | ⚠️ AEMS nhận **tên đầy đủ**: `INTERMODAL`, `OWNER`, `TERMINAL`, `THIRD_PARTY`, `WEAR_AND_TEAR`, `MANUFACTURE_WARRANTY` — DM TPI cần thêm mã API (U = User không có trong AEMS) |
| `repairQuantity` | `2` | `EstimateItem.Quantity` | ✅ |
| `manHoursPerPiece` | `0.1` | `EstimateItem.ManHoursPerPiece` | ✅ |
| `materialCostPerPiece` | `0` | `EstimateItem.UnitPrice` | ✅ |
| `maintenanceOrderParts[]` | `{partNumber, unitQuantity, unitPrice, currentSerialNumbers}` | — | ❌ chưa có (part number, chủ yếu reefer) |
| `attachedImages[]` (theo dòng) | | — | ❌ chưa có ảnh theo từng dòng |

### 5.3. Maersk trả về (đọc vào hệ thống)

`maintenanceOrderNumber` (→ `Estimate.CarrierWorkOrderNo`), `maintenanceOrderStatusCode`, `isoCurrencyCode`, `exchangeRate`, `locationCode`, `maintenanceTypeName` từng dòng, giờ công từng loại (gồm `TOTALPREPARATION`), `totalLabourCostWithoutTax`, `totalMaterialCostWithoutTax`, `totalPartCostWithoutTax`, `salesTaxLabour`, `salesTaxParts`, `importTax`, `totalOrderCostWithoutTax`, `totalOrderCostWithTax`.

> Maersk **tự tính tiền** theo hợp đồng shop (tiền công, thuế, tỉ giá) — số SolutionDepot tính chỉ để đối chiếu; khi có API nên lưu lại số Maersk trả về.

---

## 6. Luồng nghiệp vụ khi có API (so với hiện tại)

| Bước | Hiện tại (chưa có API) | Khi có API AEMS |
|---|---|---|
| Gửi báo giá | Bấm **Xác nhận báo giá** | Upload ảnh → `POST maintenance-orders` → lưu `maintenanceOrderNumber`, trạng thái 200 *PendingApproval* |
| Hãng tàu duyệt | Nhân viên **nhập tay** lệnh duyệt ở màn Phê duyệt | Hệ thống **tự hỏi trạng thái** (`GET …/{n}` hoặc `/status`) theo lịch → 390 *Approved* thì tự chuyển Sửa chữa; 100 *Rejected* thì báo người báo giá |
| Sửa báo giá bị từ chối | Sửa rồi xác nhận lại | `PUT maintenance-orders/{n}` |
| Ghi chú | Remarks | `POST …/{n}/remarks` |
| Sửa xong / QC đạt | Báo qua EDI / email | `PATCH …/{n}/complete-repair` → 400 *RepairCompleted* |

---

## 7. Việc cần làm trong SolutionDepot khi có khoá

| # | Việc |
|---|---|
| 1 | Viết **adapter AEMS** riêng (định dạng `MaintenanceOrderCreateRequest`) thay cho JSON chung hiện tại: xin token + cache tới khi hết hạn, gửi 2 header `Consumer-Key` + `Bearer` |
| 2 | Cấu hình server: `CarrierIntegrations:MAEU:Adapter=MAERSK_AEMS`, `BaseUrl`, `TokenUrl`, `ConsumerKey`, `Secret`, `ShopCode`, `Enabled` (stage trước, production sau) |
| 3 | Đổi **DM Cause** sang 4 mã AEMS; thêm **mã API** cho **DM TPI** (O→OWNER, T→THIRD_PARTY, W→WEAR_AND_TEAR, thêm INTERMODAL, TERMINAL, MANUFACTURE_WARRANTY); DM Mode dùng đúng mã số Maersk |
| 4 | Upload ảnh báo giá sang blob-manager trước khi tạo order |
| 5 | Lưu `maintenanceOrderNumber` + số tiền Maersk trả về; job định kỳ hỏi trạng thái để tự ghi nhận Approved / Rejected (thay nhập tay) |
| 6 | Sau QC đạt gọi `complete-repair` |
| 7 | (Tuỳ chọn) `damagedAt`, `reeferContainerCondition`, part number, ảnh theo dòng |
| 8 | Chạy đủ **50 order thành công trên stage** → xin mở production |
| 9 | Thống nhất mã hãng tàu Maersk trong DM Hãng Tàu (hiện là `MSCU` – thực tế là mã của MSC; Maersk dùng `MAEU`) |

---

## 8. Checklist trước khi chạy thật

- [ ] Có shop code, location code, invitation code từ EMR inspector
- [ ] App trên developer.maersk.com đã được duyệt, consumer key đã gán shop (`user-details` trả đúng shop)
- [ ] Khoá chỉ nằm trong biến môi trường server
- [ ] DM Cause / TPI / Mode khớp mã AEMS
- [ ] Tạo order thành công trên stage, đọc được `maintenanceOrderNumber`
- [ ] Đã test 401 (token hết hạn → xin lại), 422 (dữ liệu sai → hiện lỗi cho người báo giá), 429 (vượt hạn mức)
- [ ] Đủ 50 order trên stage → Maersk mở production

---

## 9. Nguồn

- Trang sản phẩm: https://developer.maersk.com/catalogue/aems-maintenance-repair
- Đặc tả OpenAPI Orders: https://edpmediastorage.blob.core.windows.net/media/container-maintenance-repair_v1-0_07042025_spec.yaml
- Đặc tả Upload: https://edpmediastorage.blob.core.windows.net/media/container-uploads-attachments_v1-0_11112024_spec.yaml
- Đặc tả Identity: https://edpmediastorage.blob.core.windows.net/media/container-user-identity_v1-0_11112024_spec.yaml
- Integration Guide v3.0: https://edpmediastorage.blob.core.windows.net/media/aems-container-maintenance-repair-integration-guide_v3-0.pdf
- Postman collection: https://edpmediastorage.blob.core.windows.net/media/AEMS%20API%20Integration.postman_collection_v2.json
- Hướng dẫn xác thực Maersk: https://developer.maersk.com/support/authorisation
