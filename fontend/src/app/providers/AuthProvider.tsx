import React, { createContext, useContext, useState } from 'react';
import { ROLES, RoleDefinition, PERMISSIONS } from '../../constants/permissions';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
}

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: RoleDefinition;
  roles: RoleDefinition[];
  switchRole: (roleId: string) => void;
  hasPermission: (permissionCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'USR-001',
    name: 'Nguyễn Tất Thành',
    email: 'admin@solutiondepot.vn',
    roleId: 'ROLE_ADMIN'
  });

  const [currentRole, setCurrentRole] = useState<RoleDefinition>(
    ROLES.find((r) => r.id === 'ROLE_ADMIN') || ROLES[0]
  );

  const switchRole = (roleId: string) => {
    const found = ROLES.find((r) => r.id === roleId);
    if (found) {
      setCurrentRole(found);
      setCurrentUser((prev) => ({ ...prev, roleId: found.id }));
    }
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (currentRole.id === 'ROLE_ADMIN') return true;
    return currentRole.permissions.includes(permissionCode);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        roles: ROLES,
        switchRole,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
