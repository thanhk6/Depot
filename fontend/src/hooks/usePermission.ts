import { useContext } from 'react';
import { PermissionContext } from '../context/PermissionContext';

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    return {
      userPermissions: [],
      canAccess: () => true,
      canAccessAny: () => true,
    };
  }
  return context;
};
