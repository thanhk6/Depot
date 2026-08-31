export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING_ACTIVATION';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  roleId: string;
  roleCode: string;
  roleName: string;
  department: string;
  employeeCode: string;
  status: UserStatus;
  is2FAEnabled: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  notes?: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  iconName: string;
  permissions: {
    code: string;
    name: string;
    description: string;
  }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER' | 'CHANGE_PERMISSIONS' | 'RESET_PASSWORD' | 'OVERRIDE_ESTIMATE' | 'APPROVE_REPAIR' | 'API_TRANSMIT' | 'GATE_OUT_RELEASE';
  actionLabel: string;
  targetResource: string;
  ipAddress: string;
  deviceInfo: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  details: string;
}

export interface SecurityPolicyConfig {
  passwordMinLength: number;
  requireSpecialChar: boolean;
  requireUppercase: boolean;
  requireDigits: boolean;
  passwordExpireDays: number;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  enforce2FAForAdmins: boolean;
  ipWhitelistEnabled: boolean;
  allowedIpRanges: string[];
}
