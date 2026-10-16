# HỆ THỐNG & PHÂN QUYỀN

[← Mục lục tài liệu theo menu](README.md)

| Menu | Tab id | Component |
|---|---|---|
| [Phân Quyền RBAC & Users](#phân-quyền-rbac--users) | `system` | `SystemPage` |

---

## Phân Quyền RBAC & Users

Phân quyền RBAC: người dùng, vai trò, ma trận quyền, nhật ký kiểm toán, chính sách bảo mật.

### Frontend

- Tab id: `system` — khai báo ở `components/layout/Sidebar.tsx`, render ở `App.tsx` (`case 'system'`).
- Trang: `SystemPage` — [`fontend/src/modules/system/pages/SystemPage.tsx`](../../fontend/src/modules/system/pages/SystemPage.tsx)

### API & Backend

| Hàm frontend | HTTP | Endpoint | Controller.Action | Service | Bảng DB |
|---|---|---|---|---|---|
| `containerApi.getAll` | GET | `/api/DepotJobs` | `DepotJobs.GetAllJobs` | `DepotJobService.GetAllJobsAsync` | `depot_jobs`, `ShippingLines`, `Surveys`, `Estimates`, `RepairOrders`, `Payments`, `AuditLogs`, `DamageItem`, `SurveyCleaningItem`, `SurveyChecklistItem`, `SurveyPhotoItem`, `EstimateItem` |
| `masterDataApi.getCatalog` | GET | `/api/MasterData/catalog/{catalogType}` | `MasterData.GetCatalog` | `MasterDataService.GetCatalogAsync` | `MasterCatalogItems` |
| `roleApi.getRoles` | GET | `/api/system/roles` | `System.GetRoles` | `UserService.GetRolesAsync` | `Roles` |
| `roleApi.updatePermissions` | PUT | `/api/system/roles/{roleCode}/permissions` | `System.UpdateRolePermissions` | `UserService.UpdateRolePermissionsAsync` | `Roles` |
| `securityPolicyApi.get` | GET | `/api/system/security-policy` | `System.GetSecurityPolicy` | `UserService.GetSecurityPolicyAsync` | `SystemSecurityPolicies` |
| `securityPolicyApi.save` | PUT | `/api/system/security-policy` | `System.SaveSecurityPolicy` | `UserService.SaveSecurityPolicyAsync` | `SystemSecurityPolicies` |
| `systemAuditLogApi.create` | POST | `/api/system/audit-logs` | `System.CreateAuditLog` | `UserService.CreateAuditLogAsync` | `SystemAuditLogs` |
| `systemAuditLogApi.getAll` | GET | `/api/system/audit-logs` | `System.GetAuditLogs` | `UserService.GetAuditLogsAsync` | `SystemAuditLogs` |
| `userApi.createUser` | POST | `/api/system/users` | `System.CreateUser` | `UserService.CreateUserAsync` | `Roles`, `Users` |
| `userApi.deleteUser` | DELETE | `/api/system/users/{id}` | `System.DeleteUser` | `UserService.DeleteUserAsync` | `Users` |
| `userApi.getUsers` | GET | `/api/system/users` | `System.GetUsers` | `UserService.GetUsersAsync` | `Users` |
| `userApi.resetPassword` | POST | `/api/system/users/{id}/reset-password` | `System.ResetPassword` | `UserService.GetSecurityPolicyAsync`<br>`UserService.ResetPasswordAsync` | `SystemSecurityPolicies`, `Users` |
| `userApi.updateUser` | PUT | `/api/system/users/{id}` | `System.UpdateUser` | `UserService.UpdateUserAsync` | `Users`, `Roles` |

Lịch sử rà soát & sửa lỗi: [53-system.md](../backend-progress/53-system.md)

