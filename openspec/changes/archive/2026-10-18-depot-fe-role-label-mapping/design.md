# Design

## Context

Luồng hiển thị vai trò sau khi đăng nhập (đã lần theo code ngày 17/10/2026):

```
POST /api/Users/login --> roleName = RoleCode (vd "QC_ENG")
  --> auth.service.normalizeRole(roleName)        --> User.role (SystemRole), lưu depot_current_user
  --> LoginScreen.mapSystemRoleToRoleType(role)   --> RoleType, lưu depot_logged_user_profile.role
  --> roleMenuConfig.getProfileByRole(RoleType)   --> chức danh / huy hiệu (chỉ hiển thị)
  --> AuthProvider.ROLE_ID_BY_PROFILE_ROLE[RoleType] --> ROLES[] --> nhãn "VAI TRÒ" trên sidebar
```

- `normalizeRole` dùng bộ mã cũ:
  - TECHNICIAN được đổi thành REPAIR_TECH;
  - QC_ENG, GATE_OP, FORKLIFT, CARRIER, CLEANING rơi vào `default` và thành `DEPOT_MANAGER`.
- `mapSystemRoleToRoleType` lại viết theo **mã mới** (TECHNICIAN, QC_ENG…), nên không nhận ra REPAIR_TECH hay DEPOT_MANAGER và rơi về `default: 'OPERATOR'`, tức "Khai Thác Cổng". Hai bảng quy đổi nối nhau nhưng lệch chuẩn.
- Giá trị `User.role` (`depot_current_user`) chỉ được `LoginScreen` đọc, không dùng để phân quyền. Menu theo `allowedTabs`, API theo `RolePermissions` ở backend.
- `getProfileByRole` không tìm thấy thì trả `USER_ACCOUNT_PROFILES[0]` (hồ sơ quản lý). `AuthProvider` không tìm thấy thì dùng vai trò tên "—".

## Goals / Non-Goals

**Goals:**
- Cả 11 vai trò hiện đúng nhãn.
- Vai trò lạ hiện "—", không mượn nhãn vai trò khác.

**Non-Goals:**
- Không đổi phân quyền menu và API, không đổi backend.
- Không gộp hai enum `SystemRole` và `RoleType` (nhiều màn đang dùng `RoleType` cho màu và chức danh); chỉ làm cho chuỗi quy đổi khớp nhau.

## Decisions

- **`normalizeRole` giữ nguyên mã thật:**
  - 11 RoleCode backend trả về giữ nguyên;
  - mã cũ đổi sang mã mới: OPERATOR / GATE_IN → GATE_OP; ACCOUNTANT → CASHIER; REPAIR_TECH → TECHNICIAN; QC_INSPECTOR → QC_ENG; CLEANING_STAFF → CLEANING; FORKLIFT_DRIVER → FORKLIFT; SHIPPING_LINE → CARRIER; DEPOT_MANAGER → ADMIN;
  - mã khác trả về `'UNKNOWN'`.
  - Bảng đổi mã cũ chỉ để đọc phiên cũ trong localStorage. Backend từ khi đổi bộ mã (DbSeeder) không còn trả mã cũ.
- **`SYSTEM_ROLES`** đổi sang 11 mã thật cộng `UNKNOWN`. `User.role` vẫn kiểu `SystemRole`. Bỏ các mã chưa từng có ở backend (GATE_IN, YARD_OPERATOR, GATE_OUT…); type-check sẽ chỉ ra chỗ còn dùng, nếu có.
- **`mapSystemRoleToRoleType`** giữ bảng hiện có (đã đúng với mã mới). `UNKNOWN` và mặc định trả `'UNKNOWN'` thay cho `'OPERATOR'`. Thêm `'UNKNOWN'` vào `RoleType`.
- **Vai trò lạ ở `LoginScreen`:** khi `roleType === 'UNKNOWN'`, hồ sơ hiển thị dùng giá trị trung tính (chức danh trống, huy hiệu "—", màu xám) thay vì `getProfileByRole`. `allowedTabs` vẫn lấy từ backend. Phương án thêm hồ sơ "UNKNOWN" vào `USER_ACCOUNT_PROFILES` bị loại, vì danh sách đó còn được dùng ở chế độ demo.
- **`AuthProvider`:** không có khoá `UNKNOWN` trong `ROLE_ID_BY_PROFILE_ROLE`, nên tự rơi về vai trò tên "—". Đó đúng là hành vi mong muốn, không cần sửa.

## Risks / Trade-offs

- **Có chỗ khác `switch` theo `SystemRole` cũ:** grep trước khi sửa chỉ thấy `LoginScreen` và `types/auth.ts`. Type-check sau khi đổi kiểu sẽ báo nếu còn sót.
- **Phiên cũ có `depot_logged_user_profile.role = 'OPERATOR'`** (đã quy sai từ trước): mã này là `RoleType` hợp lệ nên vẫn hiện "Khai Thác Cổng" tới khi người dùng đăng nhập lại. Chấp nhận được, ghi trong hướng dẫn kiểm thử: đăng xuất rồi đăng nhập lại.
