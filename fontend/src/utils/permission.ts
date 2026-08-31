export const hasPermission = (userPermissions: string[] | undefined, requiredPermission: string): boolean => {
  if (!userPermissions) return false;
  if (userPermissions.includes('System.Admin')) return true;
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions: string[] | undefined, permissions: string[]): boolean => {
  if (!userPermissions) return false;
  if (userPermissions.includes('System.Admin')) return true;
  return permissions.some((p) => userPermissions.includes(p));
};
