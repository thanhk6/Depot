import { hasPermission, hasAnyPermission } from '../utils/permission';

export const permissionService = {
  canAccess: (userPermissions: string[] | undefined, permission: string) => {
    return hasPermission(userPermissions, permission);
  },
  canAccessAny: (userPermissions: string[] | undefined, permissions: string[]) => {
    return hasAnyPermission(userPermissions, permissions);
  },
};
