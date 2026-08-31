import { PERMISSIONS } from './permissions';
import { ROUTES } from './routes';

export interface MenuItemConfig {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  path: string;
  permission?: string;
  badge?: string;
  badgeColor?: string;
  subItems?: MenuItemConfig[];
}

export const MAIN_MENU_CONFIG: MenuItemConfig[] = [
  {
    id: 'dashboard',
    title: 'Tổng quan Executive',
    titleEn: 'Executive Dashboard',
    icon: 'LayoutDashboard',
    path: ROUTES.DASHBOARD,
    permission: PERMISSIONS.CONTAINER_VIEW,
  },
  {
    id: 'jobs',
    title: 'Danh sách Container',
    titleEn: 'Container List',
    icon: 'Container',
    path: ROUTES.CONTAINER,
    permission: PERMISSIONS.CONTAINER_VIEW,
  },
  {
    id: 'survey',
    title: 'Giám định (Survey)',
    titleEn: 'Container Survey',
    icon: 'ClipboardCheck',
    path: ROUTES.SURVEY,
    permission: PERMISSIONS.SURVEY_VIEW,
  },
  {
    id: 'operation',
    title: 'Khai thác Gate In/Out',
    titleEn: 'Gate Operations',
    icon: 'Truck',
    path: ROUTES.GATE_IN,
    permission: PERMISSIONS.GATE_IN,
  },
  {
    id: 'payment',
    title: 'Thanh toán & Thu ngân',
    titleEn: 'Payment & Cashier',
    icon: 'CreditCard',
    path: ROUTES.PAYMENT,
    permission: PERMISSIONS.PAYMENT_VIEW,
  },
  {
    id: 'estimate',
    title: 'Báo giá Sửa chữa',
    titleEn: 'Repair Estimation',
    icon: 'FileText',
    path: ROUTES.ESTIMATE,
    permission: PERMISSIONS.ESTIMATE_VIEW,
  },
  {
    id: 'repair',
    title: 'Tổ Sửa chữa',
    titleEn: 'Repair Team',
    icon: 'Wrench',
    path: ROUTES.REPAIR,
    permission: PERMISSIONS.REPAIR_VIEW,
  },
  {
    id: 'qc',
    title: 'Nghiệm thu QC',
    titleEn: 'QC Inspection',
    icon: 'CheckCircle',
    path: ROUTES.QC,
    permission: PERMISSIONS.QC_VIEW,
  },
  {
    id: 'yard',
    title: 'Sơ đồ Bãi (Yard Layout)',
    titleEn: 'Yard Management',
    icon: 'Grid',
    path: ROUTES.YARD,
    permission: PERMISSIONS.YARD_VIEW,
  },
  {
    id: 'forklift',
    title: 'Xe nâng (Forklift)',
    titleEn: 'Forklift Operations',
    icon: 'Navigation',
    path: ROUTES.FORKLIFT,
    permission: PERMISSIONS.FORKLIFT_VIEW,
  },
  {
    id: 'inventory',
    title: 'Kho Vật tư Sửa chữa',
    titleEn: 'Repair Materials Inventory',
    icon: 'Boxes',
    path: ROUTES.INVENTORY,
    permission: PERMISSIONS.WAREHOUSE_VIEW,
  },
  {
    id: 'categories',
    title: 'Phân loại Vỏ Container',
    titleEn: 'Container Categories',
    icon: 'Tags',
    path: ROUTES.MASTER_DATA,
    permission: PERMISSIONS.OPERATION_VIEW,
  },
  {
    id: 'quality_grades',
    title: 'Cấp Chất lượng Vỏ',
    titleEn: 'Quality Grades',
    icon: 'Award',
    path: ROUTES.MASTER_DATA,
    permission: PERMISSIONS.OPERATION_VIEW,
  },
  {
    id: 'masterdata',
    title: 'Cấu hình Biểu giá & Master',
    titleEn: 'Master Data & Tariffs',
    icon: 'Database',
    path: ROUTES.MASTER_DATA,
    permission: PERMISSIONS.OPERATION_VIEW,
  },
  {
    id: 'report',
    title: 'Báo cáo & Thống kê',
    titleEn: 'Reports & Analytics',
    icon: 'BarChart3',
    path: ROUTES.REPORT,
    permission: PERMISSIONS.REPORT_VIEW,
  },
  {
    id: 'permissions',
    title: 'Phân quyền Hệ thống RBAC',
    titleEn: 'RBAC Permissions',
    icon: 'ShieldAlert',
    path: ROUTES.SYSTEM.PERMISSIONS,
    permission: PERMISSIONS.SYSTEM_MANAGE,
  },
  {
    id: 'portal_users',
    title: 'Cổng Khách hàng Portal',
    titleEn: 'Customer Portal Users',
    icon: 'Users',
    path: ROUTES.SYSTEM.USERS,
    permission: PERMISSIONS.SYSTEM_MANAGE,
  },
  {
    id: 'dotnet',
    title: 'Kiến trúc .NET 8 Web API',
    titleEn: '.NET 8 Architecture',
    icon: 'Code2',
    path: ROUTES.DOTNET,
  },
  {
    id: 'ai',
    title: 'Trợ lý AI Depot Copilot',
    titleEn: 'AI Depot Copilot',
    icon: 'Bot',
    path: ROUTES.AI,
  },
];
