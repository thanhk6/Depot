import { authApi } from '../api';
import { tokenService } from './token.service';
import { User } from '../types/auth';

const normalizeRole = (roleName?: string): User['role'] => {
  const value = (roleName || 'OPERATOR').toUpperCase();

  switch (value) {
    case 'ADMIN':
      return 'ADMIN';
    case 'OPERATOR':
    case 'GATE_IN':
      return 'DEPOT_MANAGER' as User['role'];
    case 'DEPOT_MANAGER':
      return 'DEPOT_MANAGER';
    case 'SURVEYOR':
      return 'SURVEYOR';
    case 'ACCOUNTANT':
    case 'CASHIER':
      return 'CASHIER' as User['role'];
    case 'ESTIMATOR':
      return 'ESTIMATOR';
    case 'TECHNICIAN':
    case 'REPAIR_TECH':
      return 'REPAIR_TECH';
    case 'QC_INSPECTOR':
      return 'QC_INSPECTOR';
    case 'YARD_OPERATOR':
    case 'CLEANING_STAFF':
      return 'YARD_OPERATOR' as User['role'];
    case 'FORKLIFT_DRIVER':
      return 'FORKLIFT_DRIVER';
    case 'GATE_OUT':
      return 'GATE_OUT' as User['role'];
    case 'SHIPPING_LINE':
      return 'SHIPPING_LINE';
    default:
      return 'DEPOT_MANAGER';
  }
};

const normalizeUser = (payload: any): User => {
  const mappedRole = normalizeRole(payload?.roleName || payload?.role);

  return {
    id: String(payload?.id ?? payload?.username ?? 'USER-001'),
    username: payload?.username || '',
    fullName: payload?.fullName || payload?.name || payload?.username || 'User',
    email: payload?.email || `${(payload?.username || 'user').toLowerCase()}@depot.local`,
    role: mappedRole,
    jobTitle: payload?.jobTitle || 'Operator',
    department: payload?.department || 'Operations',
    avatarBg: payload?.avatarBg,
    avatarText: payload?.avatarText,
    badgeBg: payload?.badgeBg,
    badgeText: payload?.badgeText,
    allowedTabs: Array.isArray(payload?.allowedTabs) ? payload.allowedTabs : [],
    permissions: Array.isArray(payload?.permissions) ? payload.permissions : undefined,
  };
};

export const authService = {
  login: async (username: string, passwordHash: string) => {
    const response: any = await authApi.login({ username, password: passwordHash, passwordHash });
    const payload: any = response?.data ?? response;
    const apiUser: any = payload?.data ?? payload;

    if (apiUser && (apiUser.username || apiUser.fullName || apiUser.id !== undefined)) {
      const normalizedUser = normalizeUser(apiUser);
      tokenService.setAccessToken(`token_${Date.now()}`);
      tokenService.setRefreshToken(`refresh_${Date.now()}`);
      localStorage.setItem('depot_current_user', JSON.stringify(normalizedUser));
      return normalizedUser;
    }

    const errorMessage = response?.message || payload?.message || 'Login failed';
    throw new Error(errorMessage);
  },
  logout: () => {
    tokenService.clearTokens();
    localStorage.removeItem('depot_current_user');
  },
  getCurrentUser: async (): Promise<User | null> => {
    const cachedUser = localStorage.getItem('depot_current_user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser) as User;
      } catch {
        localStorage.removeItem('depot_current_user');
      }
    }

    try {
      const response = await authApi.getProfile();
      return (response.data as User) || null;
    } catch {
      return null;
    }
  },
};
