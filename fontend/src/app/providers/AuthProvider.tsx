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

// RoleType của hồ sơ đăng nhập (data/roleMenuConfig.ts) → id vai trò trong constants/permissions.ts.
const ROLE_ID_BY_PROFILE_ROLE: Record<string, string> = {
  DEPOT_MANAGER: 'ROLE_ADMIN',
  SURVEYOR: 'ROLE_SURVEYOR',
  OPERATOR: 'ROLE_GATE_OPERATOR',
  ACCOUNTANT: 'ROLE_CASHIER',
  ESTIMATOR: 'ROLE_ESTIMATOR',
  SHIPPING_LINE: 'ROLE_SHIPPING_LINE',
  REPAIR_TECH: 'ROLE_TECHNICIAN',
  QC_INSPECTOR: 'ROLE_QC',
  FORKLIFT_DRIVER: 'ROLE_FORKLIFT',
  CLEANING_STAFF: 'ROLE_CLEANING_STAFF',
  SUPERVISOR: 'ROLE_SUPERVISOR'
};

const readLoggedInProfile = (): { id?: string | number; fullName?: string; username?: string; email?: string; role?: string } | null => {
  try {
    return JSON.parse(localStorage.getItem('depot_logged_user_profile') || 'null');
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Người dùng + vai trò lấy từ hồ sơ đăng nhập thật (DepotContext lưu ở localStorage 'depot_logged_user_profile'
  // lúc đăng nhập). Trước đây khởi tạo cứng 1 tài khoản admin mẫu ("Nguyễn Tất Thành") nên Sidebar hiện "Admin" cho
  // mọi người và nhật ký thao tác ở màn Phân quyền ghi sai người thực hiện.
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const profile = readLoggedInProfile();
    return {
      id: String(profile?.id ?? ''),
      name: profile?.fullName || profile?.username || '',
      email: profile?.email || '',
      roleId: ROLE_ID_BY_PROFILE_ROLE[profile?.role ?? ''] || ''
    };
  });

  const [currentRole, setCurrentRole] = useState<RoleDefinition>(() => {
    const roleId = ROLE_ID_BY_PROFILE_ROLE[readLoggedInProfile()?.role ?? ''];
    return ROLES.find((r) => r.id === roleId) || { ...ROLES[0], id: '', name: '—', permissions: [] };
  });

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
