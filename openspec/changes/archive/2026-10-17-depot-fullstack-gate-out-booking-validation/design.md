# Design

## Context

Hiện trạng đã đọc trong code và DB local ngày 17/10/2026:

- **`CustomerBooking`** (`Depot.Data/Entities/Master/CustomerBooking.cs`, bảng `CustomerBookings`):
  - `BookingNo` (unique, ≤ 50), `CustomerCode`, `ShippingLineId` (FK `ShippingLines`), `DepotCode`, `ContainerCount`, `UsedCount`, `ContainerSize` (vd `40HC`), `ContainerType` (vd `DRY`), `IssueDate`, `ValidUntil` (`timestamp with time zone`; mặc định lúc tạo + 30 ngày nên mang giờ phút lúc tạo, vd 00:15), `Status` (`ACTIVE`; xoá = `DELETED`);
  - CRUD ở `MasterDataService` (`CustomersController /bookings`). `UsedCount` chỉ đổi khi sửa tay.
  - Local: `BK-ABC-0001` (40HC DRY 10) và `BK-XYZ-0001` (20GP DRY 5), cùng hãng Id 1, hạn 23/09/2026, tức **đã hết hạn**.
- **`DepotJob`**:
  - có `ShippingLineId` (cùng FK) và `IsoSize` là mã trong *DM Loại Container* (`MasterCatalogItems`, `CatalogType = CONTAINER_TYPE`, cột `Name`, vd `40HC`, `40RH`);
  - **không** có cột loại; nhóm loại ở `JsonData.category` (`40HC` → `DRY`, `40RH` → `REEFER`);
  - có `GateInBookingNo` (không liên quan) và các cột `GateOut*`; chưa có cột booking cấp vỏ.
- **Cấu hình:** hệ thống không có bảng setting riêng. Cấu hình đơn lẻ đang lưu thành mục `MasterCatalogItems` (vd `PAYMENT_ACCOUNT`, `EST_SHOP_CODE`), đọc qua `GET /api/MasterData/catalog/{type}`, sửa qua `POST` / `PUT /api/MasterData/catalog` (quyền `masterdata`).
- **`GateOutAsync`:**
  - đọc job (tracked), kiểm tra READY_FOR_OUT, xe / tài xế, phiếu dịch vụ đã thu tiền, rồi `SaveChanges`;
  - không transaction, không cập nhật có điều kiện;
  - trả `bool`; controller gộp mọi lý do thành một thông báo, bắt `Exception` thành 500.
- Mẫu đã có trong code: `BeginTransactionAsync` (`SubmitSurveyAsync`) và `ExecuteUpdateAsync` có điều kiện (khoá giám định, `BillingService`).
- **Frontend:** `GateOutDispatchModal` có ô `bookingNo` bắt buộc; `GateOutPage.handleConfirmGateOut` không gửi nó; lỗi hiện `gateOut.data.message`.

## Goals / Non-Goals

**Goals:**
- Backend là chốt chặn: booking tồn tại, ACTIVE, còn hạn (theo cấu hình), đúng hãng tàu, đúng kích cỡ, đúng loại, còn số lượng.
- Có đường ra cổng không theo booking, bắt buộc lý do và có nhật ký.
- Cấp vỏ và tăng số đã dùng là một thao tác nguyên tử: không vượt số lượng, không ghi hai lần.
- Thông báo lỗi tiếng Việt cụ thể; màn hình kiểm tra được trước khi cấp.

**Non-Goals:**
- Không đổi cấu trúc `CustomerBookings`, không sửa dữ liệu `ValidUntil`, không đổi CRUD booking.
- Không kiểm tra `IssueDate`, `CustomerCode`, `DepotCode`; không tự đóng booking khi cấp đủ (làm sau).
- Không làm huỷ Gate-Out, phí lưu bãi, lệnh xe nâng, sửa số EIR / lịch sử (change khác).

## Decisions

- **Thứ tự kiểm tra:** điều kiện hồ sơ trước, sau đó rẽ hai nhánh.
  - Hồ sơ: tồn tại → READY_FOR_OUT → có xe và tài xế → không còn phiếu dịch vụ chưa thu.
  - **Nhánh không booking** (`WithoutBooking = true`): `NoBookingReason` thuộc `OFF_HIRE` / `DEPOT_TRANSFER` / `OFFSITE_REPAIR` / `OTHER`; `OTHER` thì `NoBookingNote` không rỗng. Không đọc booking.
  - **Nhánh booking:** có số → tìm thấy → ACTIVE → còn hạn → cùng `ShippingLineId` → `ContainerSize` = `IsoSize` (chữ hoa, bỏ khoảng trắng; so **chính xác mã**) → `ContainerType` = `category` của mã `IsoSize` → `UsedCount < ContainerCount`.
- **Hạn booking:**
  - Múi giờ `TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh")`. .NET 8 nhận tên IANA trên cả Windows (ICU) lẫn Linux container.
  - `ngàyHếtHạn = ngày lịch của ValidUntil theo giờ VN`; `hạnCuối = 00:00 ngàyHếtHạn (giờ VN) + hiệuLựcGiờ`.
  - Còn hạn khi `bâyGiờ < hạnCuối`.
  - Để dùng được trong `UPDATE … WHERE` mà không cần hàm múi giờ ở DB, quy về một mốc so sánh trên cột: `ValidUntil >= mốc`, với `mốc = (00:00 giờ VN của ngày chứa (bâyGiờ_VN − hiệuLựcGiờ)) + 1 ngày`, đổi sang UTC.
    - Lý do: `00:00(ngày V) > bâyGiờ − h` tương đương với ngày của V ≥ ngày ngay sau thời điểm `bâyGiờ − h`, tương đương với `V >= mốc`.
    - Công thức nằm trong một hàm, có test cho cấu hình 24h, 48h, 720h và mốc đúng nửa đêm.
  - Thông báo: `Booking {no} đã hết hạn ngày {ngàyHếtHạn:dd/MM/yyyy}`. Chỉ ghi ngày, không ghi giờ và không ghi cấu hình.
- **Cấu hình "Số giờ hiệu lực booking":**
  - một mục `MasterCatalogItems` với `CatalogType = GATE_OUT_SETTING`, `Code = BOOKING_VALIDITY_HOURS`, `Name = Số giờ hiệu lực booking`, `JsonData = {"hours": 24}`;
  - đọc bản ghi `IsActive && !IsDeleted` đầu tiên; không có hoặc giá trị lỗi thì dùng **24**;
  - `MasterDataService` tạo / sửa catalog: với loại `GATE_OUT_SETTING`, kiểm tra `hours` là số nguyên 1–8760 và chỉ cho **một** bản ghi đang dùng;
  - không seed: chưa lưu thì dùng mặc định 24 giờ. Không thêm bảng, không migration cho phần này.
- **Giao diện cấu hình:**
  - menu mới `gate_out_settings` (*Cấu hình cấp vỏ*) trong nhóm danh mục, map quyền `masterdata` ở `menuPermissions.ts`;
  - một ô số giờ có gợi ý "24 = hết ngày hết hạn; 720 = thêm 29 ngày", dùng API danh mục chung.
- **Bộ kiểm tra dùng chung:**
  - `EvaluateGateOutBookingAsync(job, bookingNo, now)` trả `(booking, lỗi?)`, dùng cho Gate-Out và endpoint kiểm tra;
  - lỗi là `GateOutNotAllowedException(message, kind)` với `kind` thuộc `Validation` (400), `NotFound` (404), `Conflict` (409).
- **Ghi nguyên tử** trong `await using var tx = await _db.Database.BeginTransactionAsync()`:
  1. Đọc hồ sơ `AsNoTracking`, chạy kiểm tra. Lỗi thì trả lỗi, chưa ghi gì.
  2. `depot_jobs`: `ExecuteUpdateAsync` với điều kiện `Id = id AND Status = 'READY_FOR_OUT'`, đặt `GATE_OUT`, `GateOutDate`, xe / tài xế / mooc / seal / EIR, `GateOutBookingNo` (nhánh không booking để null), `LastModifiedBy` / `LastModifiedAt`.
     - 0 dòng: rollback, 409 "Container … đã Gate-Out".
     - Đây là chốt chống ghi lặp, cho **cả hai nhánh**.
  3. Chỉ nhánh booking: `CustomerBookings` `ExecuteUpdateAsync` với điều kiện `Id = b.Id AND Status = 'ACTIVE' AND UsedCount < ContainerCount AND ValidUntil >= mốc`, đặt `UsedCount = UsedCount + 1`.
     - 0 dòng: rollback (bước 2 cũng huỷ), 409 "Booking … đã cấp đủ x/y vỏ" hoặc "đã hết hạn" (đọc lại để chọn đúng thông báo).
  4. Giải phóng ô bãi, thêm nhật ký `GATE_OUT` qua DbContext (để `AuditActorInterceptor` điền người thực hiện), `SaveChangesAsync`, `CommitAsync`.
     - Nhánh booking: nhật ký ghi booking và số còn lại.
     - Nhánh không booking: nhật ký ghi "không theo booking", nhãn tiếng Việt của lý do và ghi chú.
  - PostgreSQL mức READ COMMITTED: `UPDATE … WHERE` chờ khoá dòng rồi đánh giá lại điều kiện trên bản mới nhất, nên hai giao dịch không thể cùng vượt `UsedCount < ContainerCount`. Không cần khoá bảng hay cột concurrency token.
  - `ExecuteUpdateAsync` bỏ qua interceptor, nên đặt `LastModifiedBy` từ người thực hiện do controller truyền vào.
- **Quyền "Gate-Out không booking"** (người dùng chốt 17/10/2026: chỉ ADMIN và SUPERVISOR):
  - `RolePermissions` thêm `GateOutNoBooking = "gateout_nobooking"`: ADMIN có sẵn qua `All`, SUPERVISOR = dashboard, jobs, approval, `gateout_nobooking`. GATE_OP **không** có.
  - `POST {id}/gate-out` đổi thành `[RequirePermission(Operation, GateOutNoBooking)]` (có một trong hai), rồi kiểm tra theo nhánh trong controller:
    - `WithoutBooking = true` thì cần `gateout_nobooking`, thiếu thì 403 "Chỉ quản lý / giám sát được cấp vỏ không theo booking";
    - nhánh booking cần `operation`, thiếu thì 403.
    - Vì vậy SUPERVISOR chỉ làm được nhánh không booking; GATE_OP chỉ làm được nhánh booking.
  - `booking-check` giữ `operation`.
  - **Menu:** `MENU_PERMISSION` cho phép giá trị là mảng nhóm, và `canAccessMenu` thấy menu khi có **một trong** các nhóm. Các tab `gate_out`, `gate_out_ready`, `gate_out_lane`, `gate_out_history` thành `['operation', 'gateout_nobooking']`. SUPERVISOR thấy màn Gate-Out mà không thấy Gate-In / Khai thác / Phiếu dịch vụ (vẫn `operation`).
  - **Giao diện:** ô tích "Không cần booking" chỉ hiện khi `allowedTabs` có `gateout_nobooking` (ADMIN có `permissions` nên thấy). Với GATE_OP, chỗ đó hiện dòng nhắc "Không có booking? Gọi giám sát / quản lý cấp vỏ".
  - **Màn Gate-Out với SUPERVISOR:** nhánh booking (ô booking, nút Kiểm tra) bị ẩn hoặc khoá vì không có `operation`; chỉ còn cấp vỏ không booking.
- **Gửi lặp:** lần sau gặp hồ sơ đã GATE_OUT, bị từ chối 409, không chạm booking.
- **Lưu dữ liệu:**
  - `DepotJob.GateOutBookingNo` (`varchar(50)`, nullable), migration `AddGateOutBookingNo` chỉ thêm cột;
  - lý do ra cổng không booking **chỉ lưu trong nhật ký** (không thêm cột), đúng yêu cầu không thêm cột ngoài số booking. Muốn báo cáo theo lý do thì làm sau.
- **Endpoint kiểm tra:** `GET /api/DepotJobs/{id}/gate-out/booking-check?bookingNo=`, `[RequirePermission(RolePermissions.Operation)]`. Trả `{ valid, message, bookingNo, shippingLineCode, containerSize, containerType, validUntilDate, containerCount, usedCount, remaining }`. Không ghi gì.
- **Danh mục loại container thiếu nhóm loại:** từ chối kèm "Loại container … chưa khai báo nhóm loại trong DM Loại Container". Không đoán theo ký tự trong mã.
- **Controller `GateOut`:** bắt `GateOutNotAllowedException` trả đúng mã kèm `Message` cụ thể; bỏ `catch (Exception)` trả `ex.Message`.
- **Frontend `GateOutDispatchModal`:**
  - ô tích **Không cần booking**: tích thì ẩn ô booking, hiện chọn lý do (4 lựa chọn) và ô ghi chú (bắt buộc khi *Khác*);
  - nút **Kiểm tra booking**;
  - `GateOutPage` gửi `bookingNo` hoặc `withoutBooking`, `noBookingReason`, `noBookingNote`.

## Risks / Trade-offs

- **Booking local và có thể cả trên VPS đều đã hết hạn:** sau deploy, Gate-Out theo booking bị chặn tới khi tạo hoặc gia hạn booking. Ngoại lệ "không cần booking" là đường thoát hợp lệ cho các trường hợp không có booking. Ghi trong tài liệu quy trình.
- **Nhân viên cổng phải gọi giám sát khi không có booking:** chậm hơn, nhưng là chủ đích (người dùng chọn). Cần có ít nhất một tài khoản SUPERVISOR hoặc ADMIN trực ca. Hiện local và VPS chỉ có admin.
- **Cấu hình sửa được bởi mọi tài khoản có quyền `masterdata`** (hiện là ADMIN và CASHIER), theo cơ chế danh mục chung.
- **`ContainerSize` / `ContainerType` của booking là chữ tự do:** sai chính tả sẽ không khớp. Thông báo nêu rõ giá trị hai bên.
- **Không có huỷ Gate-Out:** cấp nhầm thì sửa tay `UsedCount` ở form booking.

## Open Questions

Đã chốt với người dùng ngày 17/10/2026:
- **Q1 (đã chốt):** mặc định mọi Gate-Out cần booking; có ô "Không cần booking" bắt buộc lý do.
- **Q2 (đã chốt):** hạn = 00:00 ngày `ValidUntil` (giờ VN) + số giờ cấu hình (mặc định 24h); thông báo chỉ ghi ngày; không sửa dữ liệu.
- **Q3, Q5, Q7, Q8 (đã chốt):** không làm trong change này (ngày phát hành, khách hàng / nhà xe, tự đóng booking, depot).
- **Q4, Q6:** giữ như design (so chính xác mã kích cỡ; gửi lặp trả 409).

- **(đã chốt 17/10/2026)** "Không cần booking" chỉ ADMIN và SUPERVISOR; nhân viên cổng gọi giám sát.

Còn mở, không chặn việc triển khai:
- Lý do "không theo booking" có cần cột riêng để báo cáo không? (Hiện: chỉ lưu nhật ký.)
- Cấu hình hạn booking hiện sửa được bởi quyền danh mục (ADMIN, CASHIER); người dùng chưa yêu cầu giới hạn, giữ nguyên.
