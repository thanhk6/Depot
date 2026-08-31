# 33 — Khách Hàng (Trucking & FWD)

Menu: `customer_list` → `CustomerPage.tsx`, xác nhận qua `App.tsx` (`case 'customer_list': return
<CustomerPage />`). Module lớn (CRM khách hàng: công ty, tài khoản portal, tài xế, phương tiện, booking,
cổng Gate-In tự phục vụ cho khách hàng).

## Frontend gọi gì

```ts
customerApi.getAll()                    // GET /api/customers
customerApi.getDrivers/getVehicles/getUsers/getBookings(customerCode)
customerApi.create/update(...)          // công ty khách hàng
customerApi.createUser/updateUser/deactivateUser(...)
customerApi.createDriver/updateDriver(...)
customerApi.createVehicle(...)
containerApi.getAll()/createGateIn(...)/updateStatus(...)   // cổng Gate-In tự phục vụ nhúng trong màn này
```

## Đối chiếu backend

`CustomersController` (`api/customers`) có đủ route CRUD cho Company/Driver/Vehicle/PortalUser/Booking,
map 1-1 với `IMasterDataService` (`GetCustomersAsync, CreateCustomerAsync, UpdateCustomerAsync,
DeactivateCustomerAsync, GetDriversAsync, CreateDriverAsync, UpdateDriverAsync, DeactivateDriverAsync,
GetVehiclesAsync, CreateVehicleAsync, UpdateVehicleAsync, DeactivateVehicleAsync, GetPortalUsersAsync,
CreatePortalUserAsync, UpdatePortalUserAsync, DeactivatePortalUserAsync, GetBookingsAsync,
CreateBookingAsync, UpdateBookingAsync, DeactivateBookingAsync`). Đã đối chiếu từng route frontend gọi
tới (`create, update, createUser, updateUser, deactivateUser, createDriver, updateDriver, createVehicle`)
— tất cả khớp đúng path, verb, request shape. ✅

`containerApi.createGateIn`/`updateStatus` dùng lại đúng endpoint đã audit ở màn 03/06 — không đổi
hành vi, chỉ là 1 điểm truy cập khác (cổng tự phục vụ cho khách hàng thay vì nhân viên depot nhập).

## Quan sát (không sửa — chưa dùng tới, không phải lỗi)

`customerApi.deactivate` (xoá công ty khách hàng), `deactivateDriver`, `updateVehicle`,
`deactivateVehicle`, `createBooking/updateBooking/deactivateBooking` có backend đầy đủ nhưng **chưa có
nút/UI nào trong `CustomerPage.tsx` gọi tới** (không tìm thấy lệnh gọi nào trong module). Không phải lỗi
tích hợp — chỉ là bề mặt UI chưa khai thác hết API đã có sẵn, có thể bổ sung sau nếu cần.

## Trạng thái: ✅ Xong

- [x] Toàn bộ API đang được gọi đều khớp đúng backend, không cần sửa
- [x] Không cần build lại (không đổi code)
