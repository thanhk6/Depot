// Đúng 11 RoleCode backend trả về lúc đăng nhập (`roleName`, xem DbSeeder.SeedRolesAsync) + UNKNOWN cho mã lạ.
// Trước đây là bộ mã cũ (GATE_IN, REPAIR_TECH, QC_INSPECTOR...) nên vai trò thật bị quy sai → sidebar hiện "Khai Thác Cổng".
export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  SURVEYOR: 'SURVEYOR',
  GATE_OP: 'GATE_OP',
  CASHIER: 'CASHIER',
  ESTIMATOR: 'ESTIMATOR',
  TECHNICIAN: 'TECHNICIAN',
  QC_ENG: 'QC_ENG',
  FORKLIFT: 'FORKLIFT',
  CARRIER: 'CARRIER',
  CLEANING: 'CLEANING',
  SUPERVISOR: 'SUPERVISOR',
  UNKNOWN: 'UNKNOWN',
} as const;

export type SystemRole = keyof typeof SYSTEM_ROLES;
