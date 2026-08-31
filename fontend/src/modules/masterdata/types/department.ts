export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  shortName: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  location: string;
  headcount: number;
  primaryRole: string;
  primaryRoleCode: string;
  status: 'ACTIVE' | 'INACTIVE';
  operatingHours: string;
  costCenter: string;
  division: 'EXECUTIVE' | 'OPERATIONS' | 'TECHNICAL' | 'FINANCE' | 'LOGISTICS_IT';
  divisionName: string;
  description: string;
  tags: string[];
}
