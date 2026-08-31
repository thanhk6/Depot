# 06 — 4. Khai Thác Gate-In (Tariff)

Menu: `operation` → `OperationPage.tsx` (`fontend/src/modules/operation/pages/OperationPage.tsx`),
xác nhận qua `App.tsx` (`case 'operation'`).

## Frontend gọi gì

```ts
serviceOrderApi.getAll()                    // load danh sách phiếu dịch vụ
containerApi.getById(newOrder.containerNo)  // tra JobNo trước khi tạo phiếu
serviceOrderApi.create({...})               // lập phiếu dịch vụ mới
```

Sub-tab `tariff` dùng `LiftOnLiftOffAndStorageMaster` (module `masterdata`, sẽ đối chiếu ở nhóm MASTER
DATA #25). Sub-tab `queue` chỉ lọc lại `containers` prop có sẵn, không gọi thêm API.

## Đối chiếu backend

- `GET /api/service-orders?jobNo=` → `ServiceOrdersController.Get` → `GetServiceOrdersAsync` —
  `Include(Items)`, `Include(DepotJob)`, trả đúng field entity `ServiceOrder`/`ServiceOrderItem`
  (`orderNo`, `containerNo`, `grandTotal`, `items[]`...) khớp với `ServiceOrder` type frontend. ✅
- `GET /api/DepotJobs/{id}` → route đã hỗ trợ **cả Guid lẫn số container** (`GetJobById(string id)`:
  `Guid.TryParse` → nếu không phải Guid thì gọi `GetJobByContainerNoAsync`) — khớp đúng cách frontend
  gọi bằng `containerNo` (không phải Guid) ở bước lấy `jobNo` trước khi tạo phiếu. ✅ (thiết kế có sẵn,
  không phải lỗi như nghi ngờ ban đầu khi mới đọc `containerApi.getById`).
- `POST /api/service-orders` → `CreateServiceOrderAsync`: validate Job tồn tại đúng cặp `JobNo` +
  `ContainerNo`, không cho tạo trùng `ServiceOrder` cho cùng 1 `DepotJobId`, tính `Subtotal/TotalVat/
  GrandTotal` từ từng `Item`. Response trả thẳng entity `order` → khớp field frontend đọc
  (`response.data` dùng để `setOrders([newOrder, ...])` — frontend tự giữ bản `newOrder` build từ form,
  không đọc lại `response.data`, chỉ dùng để biết thành công/thất bại). ✅

## Quan sát (không sửa — không phải lỗi tích hợp)

- `handleMarkPaid` trong `OperationPage.tsx` (đổi `paymentStatus` cục bộ sang `PAID`) được truyền xuống
  `ServiceOrderListTable`/`ServiceOrderDetailModal` qua prop `onMarkPaid`, nhưng **không có nút nào gọi
  `onMarkPaid(...)` thực sự** trong 2 component đó (đã `grep` xác nhận) — là code chết, không phải lỗi
  tích hợp vì không bao giờ được kích hoạt. Luồng thanh toán thật đã có sẵn đúng chỗ: nút "Chuyển Thanh
  Toán VietQR" gọi `onNavigateToPayment` → sang màn `payment` (#7), nơi có `paymentApi.processPayment`
  ghi nhận thật xuống DB. Không xoá code chết này ở bước rà theo backend (thuộc phạm vi dọn dẹp
  frontend, ngoài mục tiêu hiện tại).

## Trạng thái: ✅ Xong

- [x] `GET /api/service-orders` — khớp, không cần sửa
- [x] `GET /api/DepotJobs/{id}` (dual Guid/containerNo) — khớp, không cần sửa
- [x] `POST /api/service-orders` — khớp, không cần sửa
- [x] Không cần build lại (không đổi code backend/frontend ở màn này)
