import { SystemRole } from '../constants/roles';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: SystemRole;
  jobTitle: string;
  department: string;
  avatarBg?: string;
  avatarText?: string;
  badgeBg?: string;
  badgeText?: string;
  allowedTabs: string[];
  permissions?: string[];
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: JwtTokens | null;
}
