// Quy đổi từng mục menu (id trong components/layout/Sidebar.tsx) sang nhóm chức năng của backend
// (`RolePermissions` trong Depot.Application — trả về cho frontend qua `allowedTabs` lúc đăng nhập).
// Backend chặn API theo đúng các nhóm này (HTTP 403); ở đây chỉ để ẩn menu/màn không có quyền, tránh
// người dùng bấm vào rồi gặp lỗi. Thêm mục menu mới thì phải thêm vào map, nếu không mục đó sẽ bị ẩn.
// Giá trị là 1 nhóm hoặc danh sách nhóm — có MỘT trong các nhóm là thấy menu (vd Gate-Out: nhân viên cổng
// có `operation`, giám sát chỉ có `gateout_nobooking` mà không được thêm Gate-In / phiếu dịch vụ).
export const MENU_PERMISSION: Record<string, string | string[]> = {
  dashboard: 'dashboard',
  workflow: 'jobs',
  gate: 'operation',
  survey: 'survey',
  cleaning: 'cleaning',
  cleaning_history: 'cleaning',
  operation: 'operation',
  payment: 'payment',
  estimate: 'estimate',
  approval: 'approval', // ghi nhận hãng tàu duyệt / từ chối — quyền riêng, người lập báo giá không có
  shipping_api: 'estimate',
  est_damage_codes: 'estimate',
  est_repair_codes: 'estimate',
  est_repair_locations: 'estimate',
  est_labor_rates: 'estimate',
  est_misc_codes: 'estimate',
  repair: 'repair',
  qc: 'qc',
  container: 'jobs',
  yard_map: 'yard',
  yard_blocks: 'yard',
  forklift: 'forklift',
  gate_out: ['operation', 'gateout_nobooking'],
  gate_out_ready: ['operation', 'gateout_nobooking'],
  gate_out_lane: ['operation', 'gateout_nobooking'],
  gate_out_history: ['operation', 'gateout_nobooking'],
  billing: 'billing',
  warehouse: 'inventory',
  master_data: 'masterdata',
  departments: 'masterdata',
  tariff_lolo: 'masterdata',
  tariff_storage: 'masterdata',
  tariff_calculator: 'masterdata',
  cleaning_tariffs: 'masterdata',
  container_types: 'masterdata',
  damage_locations: 'masterdata',
  damage_codes: 'masterdata',
  repair_codes: 'masterdata',
  grades: 'masterdata',
  standards: 'masterdata',
  customer_list: 'masterdata',
  customer_classifications: 'masterdata',
  shipping_lines: 'masterdata',
  gate_out_settings: 'masterdata', // số giờ hiệu lực booking (GATE_OUT_SETTING)
  notifications: 'notifications',
  notifications_send: 'notifications',
  notifications_employees: 'notifications',
  notifications_customers: 'notifications',
  notifications_templates: 'notifications',
  notifications_history: 'notifications',
  notifications_queue: 'notifications',
  zalo_overview: 'notifications',
  zalo_simulator: 'notifications',
  zalo_templates: 'notifications',
  zalo_settings: 'notifications',
  zalo_logs: 'notifications',
  report_staff_realtime: 'report',
  report: 'report',
  report_emr: 'report',
  report_dwell_time: 'report',
  report_revenue: 'report',
  system: 'permissions'
};

export const canAccessMenu = (allowedTabs: string[] | undefined, menuId: string): boolean => {
  const tabs = allowedTabs || [];
  // Phiên ADMIN lưu từ trước khi thêm nhóm billing/cleaning/notifications vẫn phải thấy đủ menu.
  if (tabs.includes('permissions')) return true;
  const groups = MENU_PERMISSION[menuId];
  if (!groups) return false;
  return (Array.isArray(groups) ? groups : [groups]).some((g) => tabs.includes(g));
};
