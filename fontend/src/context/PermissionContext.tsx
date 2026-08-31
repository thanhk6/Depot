import React, { createContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { permissionService } from '../services/permission.service';

interface PermissionContextType {
  userPermissions: string[];
  canAccess: (permission: string) => boolean;
  canAccessAny: (permissions: string[]) => boolean;
}

export const PermissionContext = createContext<PermissionContextType>({
  userPermissions: [],
  canAccess: () => true,
  canAccessAny: () => true,
});

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userPermissions = user?.permissions || ['System.Admin'];

  const canAccess = (permission: string) => permissionService.canAccess(userPermissions, permission);
  const canAccessAny = (permissions: string[]) => permissionService.canAccessAny(userPermissions, permissions);

  return (
    <PermissionContext.Provider value={{ userPermissions, canAccess, canAccessAny }}>
      {children}
    </PermissionContext.Provider>
  );
};
