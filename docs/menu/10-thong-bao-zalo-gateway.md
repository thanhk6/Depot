# THÔNG BÁO & ZALO GATEWAY

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Dashboard Thông Báo](#dashboard-thông-báo) | `notifications` | `NotificationDashboard` |
| [Gửi Thông Báo Mới](#gửi-thông-báo-mới) | `notifications_send` | `SendNotification` |
| [Thông Báo Nhân Viên](#thông-báo-nhân-viên) | `notifications_employees` | `EmployeeNotifications` |
| [Thông Báo Khách Hàng](#thông-báo-khách-hàng) | `notifications_customers` | `CustomerNotifications` |
| [Thư Viện Mẫu Tin](#thư-viện-mẫu-tin) | `notifications_templates` | `NotificationTemplates` |
| [Lịch Sử Gửi Toàn Hệ Thống](#lịch-sử-gửi-toàn-hệ-thống) | `notifications_history` | `NotificationHistory` |
| [Hàng Đợi Gửi (Queue)](#hàng-đợi-gửi-queue) | `notifications_queue` | `NotificationQueue` |
| [Tổng Quan Zalo OA](#tổng-quan-zalo-oa) | `zalo_overview` | `ZaloOverviewPage` |
| [Zalo Simulator & Chat](#zalo-simulator--chat) | `zalo_simulator` | `ZaloSimulatorPage` |
| [Mẫu Tin ZNS & OA](#mẫu-tin-zns--oa) | `zalo_templates` | `ZaloTemplatesPage` |
| [Cấu Hình Zalo OA & Token](#cấu-hình-zalo-oa--token) | `zalo_settings` | `ZaloSettings` |
| [Nhật Ký Webhook & API](#nhật-ký-webhook--api) | `zalo_logs` | `ZaloLogsPage` |

---

## Dashboard Thông Báo

Dashboard thông báo: KPI gửi, lịch sử gần đây.

### Frontend

- Tab id: `notifications` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'notifications'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `dashboard`: `NotificationDashboard` — [`fontend/src/modules/notifications/pages/NotificationDashboard.tsx`](../../fontend/src/modules/notifications/pages/NotificationDashboard.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.getDashboardKpi` | GET | `/api/notifications/dashboard-kpi` | `Notifications.GetDashboardKpi` | `NotificationService.GetDashboardKpiAsync` | `NotificationRecords`, `EmployeeNotificationSubscriptions`, `CustomerNotificationPreferences` |
| `notificationApi.getAll` | GET | `/api/notifications` | `Notifications.Get` | `NotificationService.GetAsync` | `NotificationRecords` |
| `notificationApi.resend` | POST | `/api/notifications/{id}/resend` | `Notifications.Resend` | `NotificationService.ResendAsync` | `NotificationRecords` |

Lịch sử rà soát & sửa lỗi: [41-notifications.md](../backend-progress/41-notifications.md)

## Gửi Thông Báo Mới

Soạn & gửi thông báo mới theo mẫu tin tới nhân viên/khách hàng.

### Frontend

- Tab id: `notifications_send` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'notifications_send'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `send`: `SendNotification` — [`fontend/src/modules/notifications/pages/SendNotification.tsx`](../../fontend/src/modules/notifications/pages/SendNotification.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.getCustomers` | GET | `/api/notifications/customers` | `Notifications.GetCustomers` | `NotificationService.GetCustomersAsync` | `CustomerCompanies`, `CustomerNotificationPreferences` |
| `notificationApi.getEmployees` | GET | `/api/notifications/employees` | `Notifications.GetEmployees` | `NotificationService.GetEmployeesAsync` | `Users`, `EmployeeNotificationSubscriptions` |
| `notificationApi.getTemplates` | GET | `/api/notifications/templates` | `Notifications.GetTemplates` | `NotificationService.GetTemplatesAsync` | `NotificationTemplates` |
| `notificationApi.send` | POST | `/api/notifications` | `Notifications.Send` | `NotificationService.SendAsync` | `NotificationRecords` |

Lịch sử rà soát & sửa lỗi: [41-notifications.md](../backend-progress/41-notifications.md)

## Thông Báo Nhân Viên

Danh sách nhân viên nhận thông báo (đọc từ `Users`).

### Frontend

- Tab id: `notifications_employees` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'notifications_employees'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `employees`: `EmployeeNotifications` — [`fontend/src/modules/notifications/pages/EmployeeNotifications.tsx`](../../fontend/src/modules/notifications/pages/EmployeeNotifications.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.getEmployees` | GET | `/api/notifications/employees` | `Notifications.GetEmployees` | `NotificationService.GetEmployeesAsync` | `Users`, `EmployeeNotificationSubscriptions` |
| `notificationApi.updateEmployeeSubscription` | PUT | `/api/notifications/employees/{username}/subscription` | `Notifications.UpdateEmployeeSubscription` | `NotificationService.UpdateEmployeeSubscriptionAsync` | `Users`, `EmployeeNotificationSubscriptions` |

Lịch sử rà soát & sửa lỗi: [41-notifications.md](../backend-progress/41-notifications.md)

## Thông Báo Khách Hàng

Danh sách khách hàng nhận thông báo (đọc từ `CustomerCompanies`).

### Frontend

- Tab id: `notifications_customers` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'notifications_customers'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `customers`: `CustomerNotifications` — [`fontend/src/modules/notifications/pages/CustomerNotifications.tsx`](../../fontend/src/modules/notifications/pages/CustomerNotifications.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.getCustomers` | GET | `/api/notifications/customers` | `Notifications.GetCustomers` | `NotificationService.GetCustomersAsync` | `CustomerCompanies`, `CustomerNotificationPreferences` |
| `notificationApi.getAll` | GET | `/api/notifications` | `Notifications.Get` | `NotificationService.GetAsync` | `NotificationRecords` |
| `notificationApi.updateCustomerPreference` | PUT | `/api/notifications/customers/{customerCode}/preferences` | `Notifications.UpdateCustomerPreference` | `NotificationService.UpdateCustomerPreferenceAsync` | `CustomerCompanies`, `CustomerNotificationPreferences` |

Lịch sử rà soát & sửa lỗi: [41-notifications.md](../backend-progress/41-notifications.md)

## Thư Viện Mẫu Tin

Thư viện mẫu tin thông báo (CRUD thật).

### Frontend

- Tab id: `notifications_templates` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'notifications_templates'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `templates`: `NotificationTemplates` — [`fontend/src/modules/notifications/pages/NotificationTemplates.tsx`](../../fontend/src/modules/notifications/pages/NotificationTemplates.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.createTemplate` | POST | `/api/notifications/templates` | `Notifications.CreateTemplate` | `NotificationService.CreateTemplateAsync` | `NotificationTemplates` |
| `notificationApi.deleteTemplate` | DELETE | `/api/notifications/templates/{code}` | `Notifications.DeleteTemplate` | `NotificationService.DeleteTemplateAsync` | `NotificationTemplates` |
| `notificationApi.getTemplates` | GET | `/api/notifications/templates` | `Notifications.GetTemplates` | `NotificationService.GetTemplatesAsync` | `NotificationTemplates` |
| `notificationApi.updateTemplate` | PUT | `/api/notifications/templates/{code}` | `Notifications.UpdateTemplate` | `NotificationService.UpdateTemplateAsync` | `NotificationTemplates` |

Lịch sử rà soát & sửa lỗi: [41-notifications.md](../backend-progress/41-notifications.md)

## Lịch Sử Gửi Toàn Hệ Thống

Lịch sử gửi toàn hệ thống.

### Frontend

- Tab id: `notifications_history` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'notifications_history'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `history`: `NotificationHistory` — [`fontend/src/modules/notifications/pages/NotificationHistory.tsx`](../../fontend/src/modules/notifications/pages/NotificationHistory.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.getAll` | GET | `/api/notifications` | `Notifications.Get` | `NotificationService.GetAsync` | `NotificationRecords` |
| `notificationApi.resend` | POST | `/api/notifications/{id}/resend` | `Notifications.Resend` | `NotificationService.ResendAsync` | `NotificationRecords` |

Lịch sử rà soát & sửa lỗi: [41-notifications.md](../backend-progress/41-notifications.md)

## Hàng Đợi Gửi (Queue)

Hàng đợi gửi: gửi lại / hủy bản ghi đang chờ.

### Frontend

- Tab id: `notifications_queue` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'notifications_queue'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `queue`: `NotificationQueue` — [`fontend/src/modules/notifications/pages/NotificationQueue.tsx`](../../fontend/src/modules/notifications/pages/NotificationQueue.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.cancel` | POST | `/api/notifications/{id}/cancel` | `Notifications.Cancel` | `NotificationService.CancelQueueItemAsync` | `NotificationRecords` |
| `notificationApi.getQueue` | GET | `/api/notifications/queue` | `Notifications.GetQueue` | `NotificationService.GetQueueAsync` | `NotificationRecords` |
| `notificationApi.processAllQueue` | POST | `/api/notifications/queue/process-all` | `Notifications.ProcessAllQueue` | `NotificationService.ProcessAllQueueAsync` | `NotificationRecords` |
| `notificationApi.retry` | POST | `/api/notifications/{id}/retry` | `Notifications.Retry` | `NotificationService.RetryAsync` | `NotificationRecords` |

Lịch sử rà soát & sửa lỗi: [41-notifications.md](../backend-progress/41-notifications.md)

## Tổng Quan Zalo OA

Tổng quan Zalo OA — **demo/simulator**, chưa tích hợp Zalo OA thật (quyết định có chủ đích).

### Frontend

- Tab id: `zalo_overview` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'zalo_overview'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `zalo_overview`: `ZaloOverviewPage` — [`fontend/src/modules/zalo/pages/ZaloOverviewPage.tsx`](../../fontend/src/modules/zalo/pages/ZaloOverviewPage.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.getDashboardKpi` | GET | `/api/notifications/dashboard-kpi` | `Notifications.GetDashboardKpi` | `NotificationService.GetDashboardKpiAsync` | `NotificationRecords`, `EmployeeNotificationSubscriptions`, `CustomerNotificationPreferences` |
| `notificationApi.getAll` | GET | `/api/notifications` | `Notifications.Get` | `NotificationService.GetAsync` | `NotificationRecords` |

Lịch sử rà soát & sửa lỗi: [36-zalo-overview.md](../backend-progress/36-zalo-overview.md)

## Zalo Simulator & Chat

Mô phỏng khung chat Zalo — **demo**, không gọi backend.

### Frontend

- Tab id: `zalo_simulator` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'zalo_simulator'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `zalo_simulator`: `ZaloSimulatorPage` — [`fontend/src/modules/notifications/pages/ZaloSimulatorPage.tsx`](../../fontend/src/modules/notifications/pages/ZaloSimulatorPage.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

Màn này không tự gọi API riêng — dùng dữ liệu `App.tsx` nạp sẵn và truyền xuống (xem [README](README.md#du-lieu-dung-chung-apptsx)).

Lịch sử rà soát & sửa lỗi: [36-zalo-overview.md](../backend-progress/36-zalo-overview.md)

## Mẫu Tin ZNS & OA

Mẫu tin ZNS & OA — dùng chung thư viện mẫu tin thông báo.

### Frontend

- Tab id: `zalo_templates` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'zalo_templates'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `zalo_templates`: `ZaloTemplatesPage` — [`fontend/src/modules/zalo/pages/ZaloTemplatesPage.tsx`](../../fontend/src/modules/zalo/pages/ZaloTemplatesPage.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.getTemplates` | GET | `/api/notifications/templates` | `Notifications.GetTemplates` | `NotificationService.GetTemplatesAsync` | `NotificationTemplates` |

Lịch sử rà soát & sửa lỗi: [36-zalo-overview.md](../backend-progress/36-zalo-overview.md)

## Cấu Hình Zalo OA & Token

Cấu hình Zalo OA & token — **demo**, chỉ giữ trong bộ nhớ phiên (biến trong `notificationService`), mất khi tải lại trang; không có backend.

### Frontend

- Tab id: `zalo_settings` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'zalo_settings'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `zalo_settings`: `ZaloSettings` — [`fontend/src/modules/notifications/pages/ZaloSettings.tsx`](../../fontend/src/modules/notifications/pages/ZaloSettings.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

Màn này không tự gọi API riêng — dùng dữ liệu `App.tsx` nạp sẵn và truyền xuống (xem [README](README.md#du-lieu-dung-chung-apptsx)).

Lịch sử rà soát & sửa lỗi: [36-zalo-overview.md](../backend-progress/36-zalo-overview.md)

## Nhật Ký Webhook & API

Nhật ký webhook & API gửi tin.

### Frontend

- Tab id: `zalo_logs` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'zalo_logs'`).
- Trang: `NotificationModule` — [`fontend/src/modules/notifications/NotificationModule.tsx`](../../fontend/src/modules/notifications/NotificationModule.tsx)
- Nội dung tab `zalo_logs`: `ZaloLogsPage` — [`fontend/src/modules/zalo/pages/ZaloLogsPage.tsx`](../../fontend/src/modules/zalo/pages/ZaloLogsPage.tsx)
- Props nhận từ `App.tsx`: `initialSubTab`, `onNavigateTab`

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `notificationApi.getAll` | GET | `/api/notifications` | `Notifications.Get` | `NotificationService.GetAsync` | `NotificationRecords` |
| `notificationApi.resend` | POST | `/api/notifications/{id}/resend` | `Notifications.Resend` | `NotificationService.ResendAsync` | `NotificationRecords` |

Lịch sử rà soát & sửa lỗi: [36-zalo-overview.md](../backend-progress/36-zalo-overview.md)

