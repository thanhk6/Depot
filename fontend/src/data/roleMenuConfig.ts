import { RoleType } from '../types/depot';

export interface UserAccountProfile {
  id: string;
  role: RoleType;
  username: string;
  passwordHash: string;
  fullName: string;
  jobTitle: string;
  department: string;
  email: string;
  avatarBg: string;
  avatarText: string;
  badgeBg: string;
  badgeText: string;
  allowedTabs: string[];
  roleDescription: string;
}

// Chỉ là CẤU HÌNH HIỂN THỊ THEO VAI TRÒ (chức danh, badge, menu mặc định) — không còn người mẫu
// (họ tên/email/username/mật khẩu mẫu đã xoá). Thông tin người dùng thật lấy từ backend lúc đăng nhập.
export const USER_ACCOUNT_PROFILES: UserAccountProfile[] = [
  {
    id: 'USR-001',
    role: 'DEPOT_MANAGER',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Giám Đốc Quản Lý Bãi Depot',
    department: 'Ban Giám Đốc',
    email: '',
    avatarBg: 'bg-slate-700',
    avatarText: '',
    badgeBg: 'bg-slate-800 text-slate-100 border-slate-700',
    badgeText: 'Quản Lý Tổng (Admin)',
    allowedTabs: ['dashboard', 'jobs', 'survey', 'cleaning', 'operation', 'payment', 'estimate', 'repair', 'qc', 'yard', 'forklift', 'inventory', 'categories', 'quality_grades', 'masterdata', 'master_tariffs', 'report', 'permissions', 'portal_users', 'dotnet', 'ai'],
    roleDescription: 'Toàn quyền truy cập mọi mô-đun: Báo cáo chỉ số KPI, Quản lý toàn bộ vòng đời Container, Giám sát doanh thu & Cấu trúc .NET 8'
  },
  {
    id: 'USR-002',
    role: 'SURVEYOR',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Kỹ Sư Giám Định Container',
    department: 'Phòng Khảo Sát & Giám Định',
    email: '',
    avatarBg: 'bg-amber-600',
    avatarText: '',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    badgeText: 'Giám Định Viên (Survey)',
    allowedTabs: ['jobs', 'survey', 'cleaning', 'yard', 'categories', 'masterdata'],
    roleDescription: 'Menu riêng Giám Định: Tiếp nhận Container tại cổng, chụp ảnh hư hỏng IICL, đánh giá cấp vỏ A/B/C/D & nhập vị trí hư hỏng'
  },
  {
    id: 'USR-003',
    role: 'OPERATOR',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Chuyên Viên Điều Độ Khai Thác',
    department: 'Phòng Điều Độ Cổng Gate-In',
    email: '',
    avatarBg: 'bg-blue-600',
    avatarText: '',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    badgeText: 'Khai Thác Cổng (Operation)',
    allowedTabs: ['jobs', 'operation', 'cleaning', 'payment', 'categories', 'masterdata', 'master_tariffs'],
    roleDescription: 'Menu riêng Khai Thác: Nhập thông tin xe đầu kéo/chủ hàng, tính cước nâng hạ lưu bãi theo Tariff & tạo Phiếu Dịch Vụ Depot'
  },
  {
    id: 'USR-004',
    role: 'ACCOUNTANT',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Kế Toán Trưởng & Thu Ngân',
    department: 'Phòng Tài Chính Kế Toán',
    email: '',
    avatarBg: 'bg-emerald-600',
    avatarText: '',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    badgeText: 'Kế Toán / Thu Ngân (VietQR)',
    allowedTabs: ['dashboard', 'jobs', 'payment', 'inventory', 'categories', 'masterdata', 'master_tariffs', 'report'],
    roleDescription: 'Menu riêng Kế Toán: Thu tiền mặt/chuyển khoản, theo dõi VietQR Webhook API đối chiếu gạch nợ tự động & sổ sách tài chính'
  },
  {
    id: 'USR-005',
    role: 'ESTIMATOR',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Chuyên Viên Lập Báo Giá',
    department: 'Phòng Kế Hoạch & Báo Giá',
    email: '',
    avatarBg: 'bg-indigo-600',
    avatarText: '',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
    badgeText: 'Chuyên Viên Báo Giá (Estimator)',
    allowedTabs: ['jobs', 'estimate', 'survey', 'categories', 'masterdata'],
    roleDescription: 'Menu riêng Báo Giá: Tính chi phí giờ công thợ & vật tư theo định mức hãng tàu, lập biên bản báo giá và gửi phê duyệt'
  },
  {
    id: 'USR-006',
    role: 'SHIPPING_LINE',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Đại Diện Hãng Tàu (Maersk / COSCO)',
    department: 'Đại Lý Hãng Tàu Đối Tác',
    email: '',
    avatarBg: 'bg-purple-600',
    avatarText: '',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    badgeText: 'Đại Diện Hãng Tàu (Shipping Line)',
    allowedTabs: ['jobs', 'estimate', 'categories'],
    roleDescription: 'Menu riêng Hãng Tàu: Tra cứu container sở hữu, xem ảnh chụp hư hỏng IICL & Thực hiện Phê Duyệt / Từ Chối Báo Giá'
  },
  {
    id: 'USR-007',
    role: 'REPAIR_TECH',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Đội Trưởng Kỹ Thuật Sửa Chữa',
    department: 'Xưởng Sửa Chữa & Cơ Điện',
    email: '',
    avatarBg: 'bg-orange-600',
    avatarText: '',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-800/60',
    badgeText: 'Tổ Sửa Chữa (Repair Tech)',
    allowedTabs: ['jobs', 'repair', 'yard', 'categories'],
    roleDescription: 'Menu riêng Sửa Chữa: Tiếp nhận Work Order, xuất kho vật tư tôn/gỗ/sơn, cập nhật tiến độ gạt hàn & gửi nghiệm thu QC'
  },
  {
    id: 'USR-008',
    role: 'QC_INSPECTOR',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Kỹ Sư Kiểm Định Chất Lượng QC',
    department: 'Phòng Kỹ Thuật & QC',
    email: '',
    avatarBg: 'bg-teal-600',
    avatarText: '',
    badgeBg: 'bg-teal-950/80 text-teal-300 border-teal-800/60',
    badgeText: 'Kỹ Sư QC (Inspection)',
    allowedTabs: ['jobs', 'qc', 'repair', 'survey', 'categories'],
    roleDescription: 'Menu riêng QC: Kiểm tra độ kín nước/ánh sáng, màu sơn phủ, bề mặt vách hàn & ký Biên Bản Nghiệm Thu QC (Đạt/Không đạt)'
  },
  {
    id: 'USR-009',
    role: 'FORKLIFT_DRIVER',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Tài Xế Xe Nâng Trực Bãi',
    department: 'Đội Xe Nâng & Điều Độ Bãi',
    email: '',
    avatarBg: 'bg-rose-600',
    avatarText: '',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    badgeText: 'Tài Xế Xe Nâng (Forklift)',
    allowedTabs: ['jobs', 'forklift', 'yard', 'categories'],
    roleDescription: 'Menu riêng Xe Nâng: Nhận lệnh di chuyển container trong bãi, xem sơ đồ 2D Block-Bay-Row-Tier & xác nhận đảo bãi'
  },
  {
    id: 'USR-010',
    role: 'CLEANING_STAFF',
    username: '',
    passwordHash: '',
    fullName: '',
    jobTitle: 'Đội Trưởng Tổ Vệ Sinh Bãi',
    department: 'Tổ Vệ Sinh & Rửa Vỏ Container',
    email: '',
    avatarBg: 'bg-cyan-600',
    avatarText: '',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
    badgeText: 'Tổ Vệ Sinh (Cleaning Staff)',
    allowedTabs: ['cleaning', 'cleaning_history', 'master_cleaning', 'container', 'yard_map'],
    roleDescription: 'Bảng công việc Tổ Vệ Sinh: Nhận danh sách vỏ cần làm (CL), thực hiện xịt rửa 200 Bar / hóa chất & bàn giao sang Khai Thác (AV)'
  }
];

export const getProfileByRole = (role: RoleType): UserAccountProfile => {
  return USER_ACCOUNT_PROFILES.find((p) => p.role === role) || USER_ACCOUNT_PROFILES[0];
};
