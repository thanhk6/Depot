import React, { useEffect, useState } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { masterDataApi } from '../../api';
import { useDepot } from '../../context/DepotContext';
import { canAccessMenu } from '../../constants/menuPermissions';
import {
  LayoutDashboard,
  LogIn,
  ClipboardCheck,
  Droplets,
  CreditCard,
  Container,
  MapPin,
  Grid3X3,
  Truck,
  Calculator,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Warehouse,
  FileSpreadsheet,
  BarChart3,
  Layers,
  Settings,
  GitBranch,
  Boxes,
  Lock,
  Tag,
  Building2,
  Users,
  Receipt,
  FileCode,
  Hammer,
  Sparkles,
  Radio,
  Send,
  LogOut,
  Smartphone,
  X,
  Activity,
  Clock,
  Ship,
  FileText,
  BookOpen,
  Coins
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen = false,
  isMobileOpen,
  onCloseMobile
}) => {
  const isDrawerOpen = isMobileOpen !== undefined ? isMobileOpen : isOpen;
  const { currentRole } = useAuth();
  const { loggedInUserProfile } = useDepot();
  const allowedTabs = loggedInUserProfile?.allowedTabs;

  // Số lượng hiển thị trên badge của từng mục trong nhóm "DANH MỤC MASTER DATA" (DM Phòng Ban, Biểu Phí
  // Vệ Sinh, DM Loại Container...) trước đây là chuỗi hardcode cứng ("12 Khối", "10 Loại", "14 Loại"...)
  // hoàn toàn không liên quan tới dữ liệu thật — sai lệch với số dòng thật trong Postgres ngay khi ai đó
  // thêm/xoá 1 mục trong Master Data. Đọc thẳng số dòng thật từ catalog dùng chung
  // (`MasterCatalogItem`, qua `GET /api/MasterData/catalog/{catalogType}`) để badge luôn khớp DB.
  // Key của map dùng đúng `CatalogType` backend; value là số item đang `isActive` (khớp đúng số dòng mà
  // các màn Master Data tương ứng thật sự hiển thị cho người dùng).
  const [masterDataCatalogCounts, setMasterDataCatalogCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    // Mỗi tab con trong "DANH MỤC MASTER DATA" ứng với đúng 1 CatalogType trong bảng MasterCatalogItem —
    // xem docs/backend-progress/23-master-data.md để đối chiếu lại nếu thêm/đổi loại danh mục mới.
    const catalogTypesByMenuId: Record<string, string> = {
      departments: 'DEPARTMENT',
      cleaning_tariffs: 'CLEANING_TARIFF',
      container_types: 'CONTAINER_TYPE',
      damage_locations: 'DAMAGE_LOCATION',
      damage_codes: 'DAMAGE_CODE',
      repair_codes: 'REPAIR_CODE',
      grades: 'GRADE',
      standards: 'INSPECTION_STANDARD'
      // "Cước Nâng Hạ" (tariff_lolo) và "Cước Lưu Bãi" (tariff_storage) đã có bảng riêng
      // (ServiceTariff/StorageTariffRule), đọc qua 2 endpoint khác hẳn — xử lý tách biệt bên dưới,
      // KHÔNG đưa vào map này. Xem docs/frontend-tariff-catalog-split.md.
    };

    Promise.all([
      ...Object.entries(catalogTypesByMenuId).map(([menuId, catalogType]) =>
        masterDataApi
          .getCatalog(catalogType)
          .then((response: any) => {
            const items = Array.isArray(response?.data) ? response.data : [];
            const activeCount = items.filter((item: any) => item?.isActive !== false).length;
            return [menuId, activeCount] as const;
          })
          // 1 catalog lỗi tạm thời không được làm mất badge của các catalog còn lại — trả về 0 cho
          // riêng mục đó (sẽ tự ẩn badge, không hiện số sai) thay vì reject cả Promise.all.
          .catch(() => [menuId, 0] as const)
      ),
      masterDataApi
        .getServiceTariffs()
        .then((response: any) => {
          const items = Array.isArray(response?.data) ? response.data : [];
          return ['tariff_lolo', items.filter((item: any) => item?.isActive !== false).length] as const;
        })
        .catch(() => ['tariff_lolo', 0] as const),
      masterDataApi
        .getStorageTariffs()
        .then((response: any) => {
          const items = Array.isArray(response?.data) ? response.data : [];
          return ['tariff_storage', items.filter((item: any) => item?.isActive !== false).length] as const;
        })
        .catch(() => ['tariff_storage', 0] as const)
    ]).then((entries) => {
      if (cancelled) return;
      setMasterDataCatalogCounts(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const menuGroups: MenuGroup[] = [
    {
      title: 'TỔNG QUAN',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard ERP',
          icon: <LayoutDashboard className="w-4 h-4 text-sky-400" />
        },
        {
          id: 'workflow',
          label: 'Sơ Đồ Vòng Đời Nghiệp Vụ',
          icon: <GitBranch className="w-4 h-4 text-cyan-400" />,
          badge: '15 Module'
        }
      ]
    },
    {
      title: 'KHAI THÁC & GATE-IN',
      items: [
        {
          id: 'gate',
          label: '1. Tiếp Nhận Cổng (Gate-In)',
          icon: <LogIn className="w-4 h-4 text-emerald-400" />,
          badge: 'EDI'
        },
        {
          id: 'survey',
          label: '2. Giám Định (Survey e-EIR)',
          icon: <ClipboardCheck className="w-4 h-4 text-amber-400" />,
          badge: 'IICL-6'
        },
        {
          id: 'cleaning',
          label: '3. Tổ Vệ Sinh (Cleaning Bay)',
          icon: <Droplets className="w-4 h-4 text-cyan-300" />,
          badge: 'CL'
        },
        {
          id: 'operation',
          label: '4. Khai Thác Gate-In (Tariff)',
          icon: <FileSpreadsheet className="w-4 h-4 text-blue-400" />,
          badge: 'Khai Thác'
        },
        {
          id: 'payment',
          label: '5. Thanh Toán VietQR',
          icon: <CreditCard className="w-4 h-4 text-purple-400" />,
          badge: 'Napas247'
        }
      ]
    },
    {
      // 2026-10-08: tách "BÁO GIÁ" thành nhóm riêng (nghiệp vụ báo giá + danh mục riêng theo Maersk AEMS),
      // "SỬA CHỮA" giữ lệnh sửa chữa + QC. Cả 2 nhóm vẫn đứng ngay sau "KHAI THÁC & GATE-IN".
      title: 'BÁO GIÁ',
      items: [
        {
          id: 'estimate',
          label: 'Lập Báo Giá Estimate',
          icon: <Calculator className="w-4 h-4 text-orange-400" />,
          badge: 'AEMS'
        },
        {
          id: 'approval',
          label: 'Phê Duyệt Hãng Tàu',
          icon: <ShieldCheck className="w-4 h-4 text-pink-400" />,
          badge: 'MNR'
        },
        {
          id: 'shipping_api',
          label: 'Truyền API Hãng Tàu',
          icon: <Radio className="w-4 h-4 text-sky-400" />,
          badge: 'REST API',
          badgeColor: 'bg-sky-950 text-sky-300 border-sky-800'
        },
        {
          id: 'est_damage_codes',
          label: 'DM Mã Hư Hỏng (Damage)',
          icon: <Tag className="w-4 h-4 text-rose-300" />
        },
        {
          id: 'est_repair_codes',
          label: 'DM Mã Sửa Chữa (Repair)',
          icon: <Hammer className="w-4 h-4 text-amber-300" />
        },
        {
          id: 'est_repair_locations',
          label: 'DM Vị Trí Sửa Chữa (Rep. Loc)',
          icon: <MapPin className="w-4 h-4 text-teal-300" />
        },
        {
          id: 'est_labor_rates',
          label: 'DM Đơn Giá Giờ Công',
          icon: <Coins className="w-4 h-4 text-yellow-300" />
        },
        {
          id: 'est_misc_codes',
          label: 'DM TPI · Cause · Mode · Shop',
          icon: <BookOpen className="w-4 h-4 text-indigo-300" />
        }
      ]
    },
    {
      title: 'SỬA CHỮA',
      items: [
        {
          id: 'repair',
          label: 'Lệnh Sửa Chữa (WO)',
          icon: <Wrench className="w-4 h-4 text-rose-400" />,
          badge: 'Kanban'
        },
        {
          id: 'qc',
          label: '9. QC Nghiệm Thu (AV Grade)',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          badge: 'AV'
        }
      ]
    },
    {
      title: 'QUẢN LÝ CONTAINER & BÃI',
      items: [
        {
          id: 'container',
          label: 'Danh Sách Container',
          icon: <Boxes className="w-4 h-4 text-sky-400" />
        },
        {
          id: 'yard_map',
          label: 'Sơ Đồ Bãi 2D (Konva)',
          icon: <MapPin className="w-4 h-4 text-teal-400" />
        },
        {
          id: 'yard_blocks',
          label: 'Quản Lý Vị Trí Block',
          icon: <Grid3X3 className="w-4 h-4 text-indigo-400" />
        },
        {
          id: 'forklift',
          label: 'Lệnh Điều Xe Nâng',
          icon: <Truck className="w-4 h-4 text-amber-400" />,
          badge: 'Tablet'
        }
      ]
    },
    {
      title: 'CỔNG XUẤT & CẤP VỎ (GATE-OUT)',
      items: [
        {
          id: 'gate_out',
          label: '11. Tổng Quan Cổng Xuất',
          icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" />,
          badge: 'Dashboard',
          badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800'
        },
        {
          id: 'gate_out_ready',
          label: '1. Vỏ Chờ Cấp (Ready In Yard)',
          icon: <Ship className="w-4 h-4 text-cyan-400" />,
          badge: 'AV Grade'
        },
        {
          id: 'gate_out_lane',
          label: '2. Tiếp Nhận Làn Cổng Xuất',
          icon: <Truck className="w-4 h-4 text-emerald-400" />,
          badge: 'Làn 03/04'
        },
        {
          id: 'gate_out_history',
          label: '3. Nhật Ký Xuất & Phiếu e-EIR',
          icon: <FileText className="w-4 h-4 text-sky-400" />,
          badge: 'e-EIR'
        }
      ]
    },
    {
      title: 'CÔNG NỢ HÃNG TÀU & BILLING',
      items: [
        {
          id: 'billing',
          label: 'Công Nợ Hãng Tàu (AR)',
          icon: <FileSpreadsheet className="w-4 h-4 text-sky-400" />,
          badge: 'SOA & VAT',
          badgeColor: 'bg-sky-950 text-sky-300 border-sky-800'
        }
      ]
    },
    {
      title: 'KHO VẬT TƯ & CƠ SỞ VẬT CHẤT',
      items: [
        {
          id: 'warehouse',
          label: 'Kho Vật Tư Sửa Chữa EMR',
          icon: <Warehouse className="w-4 h-4 text-amber-300" />,
          badge: 'Tồn Kho',
          badgeColor: 'bg-amber-950 text-amber-300 border-amber-800'
        }
      ]
    },
    {
      title: 'DANH MỤC MASTER DATA',
      items: [
        {
          id: 'master_data',
          label: 'Tất Cả Danh Mục',
          icon: <Layers className="w-4 h-4 text-indigo-400" />,
          badge: 'Core'
        },
        {
          id: 'departments',
          label: 'DM Phòng Ban Depot',
          icon: <Building2 className="w-4 h-4 text-indigo-400" />,
          // undefined khi API chưa trả về xong / lỗi → không hiện badge (tránh hiện số sai), thay vì
          // "0 Khối" gây hiểu nhầm là danh mục trống trong lúc dữ liệu đang tải.
          badge: masterDataCatalogCounts.departments ? `${masterDataCatalogCounts.departments} Khối` : undefined
        },
        {
          // Trước đây 1 mục "Cước Nâng Hạ & Lưu Bãi" gộp chung — đã tách thành 3 mục riêng theo yêu
          // cầu người dùng (xem docs/frontend-tariff-catalog-split.md), mỗi mục vào đúng 1 màn quản lý
          // riêng biệt (`LoloTariffMaster`/`StorageTariffMaster`/`TariffCalculatorPage`).
          id: 'tariff_lolo',
          label: 'Cước Nâng Hạ (LoLo)',
          icon: <Truck className="w-4 h-4 text-cyan-400" />,
          badge: masterDataCatalogCounts.tariff_lolo ? `${masterDataCatalogCounts.tariff_lolo} Mục` : undefined
        },
        {
          id: 'tariff_storage',
          label: 'Cước Lưu Bãi (Storage)',
          icon: <Layers className="w-4 h-4 text-indigo-400" />,
          badge: masterDataCatalogCounts.tariff_storage ? `${masterDataCatalogCounts.tariff_storage} Quy Tắc` : undefined
        },
        {
          id: 'tariff_calculator',
          label: 'Máy Tính Cước Nâng Hạ & Lưu Bãi',
          icon: <Receipt className="w-4 h-4 text-emerald-400" />,
          badge: 'Công Cụ'
        },
        {
          id: 'cleaning_tariffs',
          label: 'Biểu Phí Vệ Sinh Container',
          icon: <Droplets className="w-4 h-4 text-cyan-400" />,
          badge: masterDataCatalogCounts.cleaning_tariffs ? `${masterDataCatalogCounts.cleaning_tariffs} Loại` : undefined
        },
        {
          id: 'container_types',
          label: 'DM Loại Container (ISO)',
          icon: <Container className="w-4 h-4 text-sky-400" />,
          badge: masterDataCatalogCounts.container_types ? `${masterDataCatalogCounts.container_types} Loại` : undefined
        },
        {
          id: 'damage_locations',
          label: 'DM Vị Trí Cấu Kiện',
          icon: <MapPin className="w-4 h-4 text-amber-400" />,
          badge: masterDataCatalogCounts.damage_locations ? `${masterDataCatalogCounts.damage_locations} Vị Trí` : undefined
        },
        {
          id: 'damage_codes',
          label: 'DM Mã Hư Hỏng IICL',
          icon: <FileCode className="w-4 h-4 text-rose-400" />,
          badge: masterDataCatalogCounts.damage_codes ? `${masterDataCatalogCounts.damage_codes} Mã` : undefined
        },
        {
          id: 'repair_codes',
          label: 'DM Phương Án Sửa Chữa',
          icon: <Hammer className="w-4 h-4 text-blue-400" />,
          badge: masterDataCatalogCounts.repair_codes ? `${masterDataCatalogCounts.repair_codes} Phương Án` : undefined
        },
        {
          id: 'grades',
          label: 'DM Phân Hạng Vỏ (Grade)',
          icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
          badge: masterDataCatalogCounts.grades ? `${masterDataCatalogCounts.grades} Hạng` : undefined
        },
        {
          id: 'standards',
          label: 'DM Tiêu Chuẩn Giám Định',
          icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
          badge: masterDataCatalogCounts.standards ? `${masterDataCatalogCounts.standards} Tiêu Chuẩn` : undefined
        }
      ]
    },
    {
      title: 'KHÁCH HÀNG & ĐỐI TÁC',
      items: [
        {
          id: 'customer_list',
          label: 'Khách Hàng (Trucking & FWD)',
          icon: <Truck className="w-4 h-4 text-amber-400" />,
          badge: '5 Đơn Vị'
        },
        {
          id: 'customer_classifications',
          label: 'DM Phân Loại Khách Hàng',
          icon: <Tag className="w-4 h-4 text-pink-400" />,
          badge: '5 Phân Loại'
        },
        {
          id: 'shipping_lines',
          label: 'Hãng Tàu (Maersk Line)',
          icon: <Building2 className="w-4 h-4 text-sky-400" />,
          badge: 'Độc Quyền'
        },
        {
          id: 'gate_out_settings',
          label: 'Cấu Hình Cấp Vỏ (Gate-Out)',
          icon: <Settings className="w-4 h-4 text-indigo-400" />
        }
      ]
    },
    {
      // Gộp 2 nhóm cũ "ZALO GATEWAY & CHAT" + "HỆ THỐNG THÔNG BÁO TỔNG HỢP" thành 1 — trước đây 2 màn
      // này tách rời hoàn toàn (2 module component, 2 sidebar group riêng) dù cùng phục vụ 1 nghiệp vụ
      // gửi tin/kết nối Zalo, gây trùng lặp điều hướng khó hiểu. Nay cả 12 mục đều trỏ vào cùng 1
      // component `NotificationModule` (`fontend/src/modules/notifications/NotificationModule.tsx`),
      // chỉ khác `initialSubTab`.
      title: 'THÔNG BÁO & ZALO GATEWAY',
      items: [
        {
          id: 'notifications',
          label: 'Dashboard Thông Báo',
          icon: <Radio className="w-4 h-4 text-sky-400" />
        },
        {
          id: 'notifications_send',
          label: 'Gửi Thông Báo Mới',
          icon: <Send className="w-4 h-4 text-emerald-400" />
        },
        {
          id: 'notifications_employees',
          label: 'Thông Báo Nhân Viên',
          icon: <Users className="w-4 h-4 text-blue-400" />
        },
        {
          id: 'notifications_customers',
          label: 'Thông Báo Khách Hàng',
          icon: <Building2 className="w-4 h-4 text-indigo-400" />
        },
        {
          id: 'notifications_templates',
          label: 'Thư Viện Mẫu Tin',
          icon: <FileCode className="w-4 h-4 text-amber-400" />,
          badge: '16 Mẫu'
        },
        {
          id: 'notifications_history',
          label: 'Lịch Sử Gửi Toàn Hệ Thống',
          icon: <Receipt className="w-4 h-4 text-cyan-400" />
        },
        {
          id: 'notifications_queue',
          label: 'Hàng Đợi Gửi (Queue)',
          icon: <Layers className="w-4 h-4 text-pink-400" />,
          badge: '5'
        },
        {
          id: 'zalo_overview',
          label: 'Tổng Quan Zalo OA',
          icon: <Radio className="w-4 h-4 text-emerald-400" />,
          badge: 'Online',
          badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800'
        },
        {
          id: 'zalo_simulator',
          label: 'Zalo Simulator & Chat',
          icon: <Smartphone className="w-4 h-4 text-yellow-400 animate-pulse" />,
          badge: '2 Chiều',
          badgeColor: 'bg-yellow-950 text-yellow-300 border-yellow-800'
        },
        {
          id: 'zalo_templates',
          label: 'Mẫu Tin ZNS & OA',
          icon: <FileCode className="w-4 h-4 text-amber-400" />,
          badge: '12 Mẫu'
        },
        {
          id: 'zalo_settings',
          label: 'Cấu Hình Zalo OA & Token',
          icon: <Settings className="w-4 h-4 text-cyan-400" />
        },
        {
          id: 'zalo_logs',
          label: 'Nhật Ký Webhook & API',
          icon: <Receipt className="w-4 h-4 text-purple-400" />
        }
      ]
    },
    {
      title: 'BÁO CÁO & HIỆU SUẤT NHÂN SỰ',
      items: [
        {
          id: 'report_staff_realtime',
          label: '⚡ Công Việc Từng Người (Real-time)',
          icon: <Activity className="w-4 h-4 text-amber-400" />,
          badge: 'Live'
        },
        {
          id: 'report',
          label: 'Tổng Quan & Thông Lượng Bãi',
          icon: <BarChart3 className="w-4 h-4 text-cyan-400" />
        },
        {
          id: 'report_emr',
          label: 'Năng Suất Sửa Chữa EMR',
          icon: <Wrench className="w-4 h-4 text-emerald-400" />
        },
        {
          id: 'report_dwell_time',
          label: 'Thời Gian Lưu Bãi (Dwell Time)',
          icon: <Clock className="w-4 h-4 text-sky-400" />
        },
        {
          id: 'report_revenue',
          label: 'Doanh Thu & Biểu Cước',
          icon: <CreditCard className="w-4 h-4 text-teal-400" />
        }
      ]
    },
    {
      title: 'HỆ THỐNG & PHÂN QUYỀN',
      items: [
        {
          id: 'system',
          label: 'Phân Quyền RBAC & Users',
          icon: <Settings className="w-4 h-4 text-purple-400" />
        }
      ]
    }
  ];

  // Chỉ hiện mục menu vai trò được phép (ma trận RolePermissions ở backend) và bỏ nhóm không còn mục nào.
  const visibleMenuGroups = menuGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => canAccessMenu(allowedTabs, item.id)) }))
    .filter((group) => group.items.length > 0);
  const canOpenSystem = canAccessMenu(allowedTabs, 'system');

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full overflow-hidden bg-[#0B2A43]">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0B2A43] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 p-0.5 flex items-center justify-center shadow-sm border border-white/20">
            <div className="w-full h-full bg-[#1677FF] rounded-[10px] flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-wide font-mono">
              EMR WORKFLOW 2026
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              Depot Core v3.5
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 transition cursor-pointer shadow-sm"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Selector Box */}
      <div
        onClick={() => {
          if (!canOpenSystem) return;
          onSelectTab('system');
          if (isMobile && onCloseMobile) onCloseMobile();
        }}
        className={`px-4 py-2.5 bg-black/20 hover:bg-black/30 border-b border-[#1E3A5F] flex items-center justify-between gap-2 shrink-0 transition ${canOpenSystem ? 'cursor-pointer' : 'cursor-default'}`}
        title={canOpenSystem ? 'Bấm để mở cấu hình Phân Quyền & Người Dùng' : undefined}
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          VAI TRÒ:
        </span>
        <div className="px-2.5 py-1 rounded-lg bg-[#1677FF] text-white font-bold text-xs shadow-sm text-right leading-snug">
          {currentRole.name}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-3 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
        {visibleMenuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
                      isActive
                        ? 'bg-[#1677FF] text-white shadow-sm font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <span className="text-left leading-snug">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap ml-1.5 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor ? 'opacity-80' : 'bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1E3A5F] bg-[#0B2A43] text-center shrink-0">
        <p className="text-[11px] font-bold text-white font-mono tracking-wide">
          SOLUTION DEPOT ERP v3.5
        </p>
        <p className="text-[9px] text-slate-400">Automated EMR & Yard System</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#0B2A43] border-r border-[#1E3A5F] text-white flex-col justify-between h-screen shrink-0 sticky top-0 z-40 select-none shadow-sm">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0B2A43]/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#0B2A43] border-r border-[#1E3A5F] text-white flex flex-col justify-between h-full z-10 shadow-2xl select-none">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
