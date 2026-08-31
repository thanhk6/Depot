import { User } from './auth';

export interface PermissionGroup {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  permissions: {
    code: string;
    nameVi: string;
    description: string;
  }[];
}

export interface RoleDefinition {
  id: string;
  roleCode: string;
  roleNameVi: string;
  description: string;
  permissions: string[];
}

export interface PortalUserAccount extends User {
  companyName: string;
  taxCode: string;
  isActive: boolean;
  createdAt: string;
}
