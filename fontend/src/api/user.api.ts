import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { User } from '../types/auth';

export const userApi = {
  getUsers: async () => {
    const res = await apiClient.get<ApiResponse<User[]>>(API_ENDPOINTS.SYSTEM.USERS);
    return res.data;
  },
  createUser: async (user: Partial<User>) => {
    const res = await apiClient.post<ApiResponse<User>>(API_ENDPOINTS.SYSTEM.USERS, user);
    return res.data;
  },
  updateUser: async (id: string, user: Partial<User>) => {
    const res = await apiClient.put<ApiResponse<User>>(API_ENDPOINTS.SYSTEM.USER_BY_ID(id), user);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<string>>(API_ENDPOINTS.SYSTEM.USER_BY_ID(id));
    return res.data;
  },
  resetPassword: async (id: string, newPassword: string, forceChangeOnNextLogin: boolean, performedBy?: string) => {
    const res = await apiClient.post<ApiResponse<string>>(`${API_ENDPOINTS.SYSTEM.USER_BY_ID(id)}/reset-password`, {
      newPassword, forceChangeOnNextLogin, performedBy
    });
    return res.data;
  },
};

export const roleApi = {
  getRoles: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>(API_ENDPOINTS.SYSTEM.ROLES);
    return res.data;
  },
  updatePermissions: async (roleCode: string, permissions: string[], performedBy?: string) => {
    const res = await apiClient.put<ApiResponse<string>>(`${API_ENDPOINTS.SYSTEM.ROLES}/${roleCode}/permissions`, { permissions, performedBy });
    return res.data;
  },
};

export const securityPolicyApi = {
  get: async () => {
    const res = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.SYSTEM.SECURITY_POLICY);
    return res.data;
  },
  save: async (policy: {
    passwordMinLength: number; requireSpecialChar: boolean; requireUppercase: boolean; requireDigits: boolean;
    passwordExpireDays: number; maxFailedAttempts: number; lockoutDurationMinutes: number; sessionTimeoutMinutes: number;
    enforce2FaForAdmins: boolean; ipWhitelistEnabled: boolean; allowedIpRanges: string[]; performedBy?: string;
  }) => {
    const res = await apiClient.put<ApiResponse<any>>(API_ENDPOINTS.SYSTEM.SECURITY_POLICY, policy);
    return res.data;
  },
};

export const systemAuditLogApi = {
  getAll: async (take = 200) => {
    const res = await apiClient.get<ApiResponse<any[]>>(API_ENDPOINTS.SYSTEM.AUDIT_LOGS, { params: { take } });
    return res.data;
  },
  create: async (entry: {
    action: string; actionLabel: string; targetResource: string; details?: string;
    performedByName: string; performedByRole?: string; ipAddress?: string; deviceInfo?: string; status?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.SYSTEM.AUDIT_LOGS, entry);
    return res.data;
  },
};

export const permissionApi = {
  getPermissions: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>(API_ENDPOINTS.SYSTEM.PERMISSIONS);
    return res.data;
  },
};

export const menuApi = {
  getMenus: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>(API_ENDPOINTS.SYSTEM.MENUS);
    return res.data;
  },
};

