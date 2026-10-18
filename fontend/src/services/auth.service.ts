import { authApi } from '../api';
import { tokenService } from './token.service';
import { sessionService } from './session.service';
import { User } from '../types/auth';
import { SYSTEM_ROLES, SystemRole } from '../constants/roles';

// Mã cũ (trước khi DbSeeder đổi bộ RoleCode) → mã thật. Chỉ để đọc phiên đăng nhập cũ còn trong localStorage.
const LEGACY_ROLE_CODES: Record<string, SystemRole> = {
  OPERATOR: 'GATE_OP',
  GATE_IN: 'GATE_OP',
  ACCOUNTANT: 'CASHIER',
  REPAIR_TECH: 'TECHNICIAN',
  QC_INSPECTOR: 'QC_ENG',
  CLEANING_STAFF: 'CLEANING',
  FORKLIFT_DRIVER: 'FORKLIFT',
  SHIPPING_LINE: 'CARRIER',
  DEPOT_MANAGER: 'ADMIN'
};

// Giữ nguyên RoleCode thật backend trả về. Trước đây quy theo bộ mã cũ: TECHNICIAN thành REPAIR_TECH, còn QC_ENG /
// GATE_OP / CARRIER / CLEANING / FORKLIFT rơi về DEPOT_MANAGER → LoginScreen quy tiếp về "Khai Thác Cổng".
// Mã lạ → UNKNOWN (nhãn "—"), KHÔNG mượn vai trò khác hay quy thành quản lý.
const normalizeRole = (roleName?: string): User['role'] => {
  const value = (roleName || '').trim().toUpperCase();
  if (value in SYSTEM_ROLES) return value as SystemRole;
  return LEGACY_ROLE_CODES[value] || 'UNKNOWN';
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
      // Token JWT thật do backend ký khi đăng nhập (trước đây lưu chuỗi giả `token_${Date.now()}` và
      // không gửi/kiểm tra ở đâu cả). Thiếu token nghĩa là server không cấp phiên — không được coi là đăng nhập.
      if (!apiUser.accessToken) {
        throw new Error('Máy chủ không cấp phiên đăng nhập. Vui lòng thử lại.');
      }
      const normalizedUser = normalizeUser(apiUser);
      tokenService.setAccessToken(apiUser.accessToken);
      localStorage.setItem('depot_current_user', JSON.stringify(normalizedUser));
      return normalizedUser;
    }

    const errorMessage = response?.message || payload?.message || 'Login failed';
    throw new Error(errorMessage);
  },
  logout: () => {
    sessionService.clear();
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
