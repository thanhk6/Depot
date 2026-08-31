import React from 'react';
import { useDepot } from '../context/DepotContext';
import { getProfileByRole } from '../data/roleMenuConfig';
import {
  LayoutDashboard,
  Boxes,
  ClipboardCheck,
  FileText,
  CreditCard,
  Calculator,
  Wrench,
  Truck,
  ShieldCheck,
  Package,
  Users,
  BarChart3,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Layers,
  Container,
  Lock,
  LogOut,
  Globe,
  Bot,
  Sparkles,
  Award,
  MessageSquare,
  Droplets,
  History
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: any) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onLogout
}) => {
  const { activeRole, userProfiles } = useDepot();
  const currentProfile = userProfiles.find((p) => p.role === activeRole) || getProfileByRole(activeRole);

  const menuGroups = [
    {
      groupTitle: 'TỔNG QUAN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      groupTitle: 'QUY TRÌNH KHAI THÁC & GATE',
      items: [
        { id: 'jobs', label: '1. Danh Sách Container', icon: <Boxes className="w-4 h-4 text-sky-400" /> },
        { id: 'survey', label: '2. Survey (Giám Định)', icon: <ClipboardCheck className="w-4 h-4 text-amber-400" /> },
        { id: 'cleaning', label: '3. Vệ Sinh Container', icon: <Droplets className="w-4 h-4 text-cyan-400" /> },
        { id: 'operation', label: '4. Khai Thác Gate-In (Tariff)', icon: <FileText className="w-4 h-4 text-emerald-400" /> },
        { id: 'payment', label: '5. Payment (Thanh Toán VietQR)', icon: <CreditCard className="w-4 h-4 text-purple-400" /> }
      ]
    },
    {
      groupTitle: 'TỔ VỆ SINH',
      items: [
        { id: 'cleaning', label: 'Danh Sách Cần Vệ Sinh', icon: <Droplets className="w-4 h-4 text-cyan-400" /> },
        { id: 'cleaning_history', label: 'Lịch Sử Đã Vệ Sinh', icon: <History className="w-4 h-4 text-emerald-400" /> }
      ]
    },
    {
      groupTitle: 'BÁO GIÁ & SỬA CHỮA',
      items: [
        { id: 'estimate', label: 'Estimate (Báo Giá)', icon: <Calculator className="w-4 h-4" /> },
        { id: 'repair', label: 'Repair (Sửa Chữa)', icon: <Wrench className="w-4 h-4 text-amber-400" /> },
        { id: 'payment', label: 'Payment (Thanh Toán)', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> }
      ]
    },
    {
      groupTitle: 'ĐIỀU ĐỘ & BÃI',
      items: [
        { id: 'yard', label: 'Yard (Sơ Đồ Bãi)', icon: <Container className="w-4 h-4 text-blue-400" /> },
        { id: 'forklift', label: 'Forklift (Xe Nâng)', icon: <Truck className="w-4 h-4 text-amber-400" /> }
      ]
    },
    {
      groupTitle: 'DANH MỤC & MASTER DATA',
      items: [
        { id: 'quality_grades', label: 'Cấp Chất Lượng (Grades)', icon: <Award className="w-4 h-4 text-indigo-400" /> },
        { id: 'categories', label: 'Danh Mục Kích Thước ISO', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
        { id: 'masterdata', label: 'Master Data (Đối Tác)', icon: <Users className="w-4 h-4 text-indigo-400" /> },
        { id: 'inventory', label: 'Inventory (Vật Tư)', icon: <Package className="w-4 h-4 text-purple-400" /> }
      ]
    },
    {
      groupTitle: 'HỆ THỐNG & PORTAL',
      items: [
        { id: 'ai', label: 'AI Copilot (Module 20)', icon: <Bot className="w-4 h-4 text-purple-400" /> },
        { id: 'portal_users', label: 'Portal Users (Đối Tác)', icon: <Globe className="w-4 h-4 text-sky-400" /> },
        { id: 'permissions', label: 'RBAC (Phân Quyền)', icon: <Lock className="w-4 h-4 text-purple-400" /> },
        { id: 'report', label: 'Report (Báo Cáo)', icon: <BarChart3 className="w-4 h-4 text-emerald-400" /> },
        { id: 'dotnet', label: '.NET 8 Architecture', icon: <Cpu className="w-4 h-4 text-cyan-400" /> }
      ]
    }
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-300 flex flex-col justify-between h-screen sticky top-0 z-40 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Top Header */}
      <div>
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 text-white font-black text-xs flex items-center justify-center shrink-0">
                DEPOT
              </div>
              <div>
                <h1 className="font-black text-sm text-white tracking-wider font-mono">SOLUTION DEPOT</h1>
                <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest leading-none">
                  Metronic ERP v8
                </p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto p-2 bg-sky-500 text-white font-bold text-xs rounded-xl">
              ERP
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700 cursor-pointer"
            title={isCollapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Navigation Items */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  {group.groupTitle}
                </p>
              )}

              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const isAllowed = (currentProfile?.allowedTabs || []).includes(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer relative ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-bold'
                        : isAllowed
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-950/80 opacity-70 border border-transparent hover:border-slate-800'
                    } ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}`}
                    title={
                      isAllowed
                        ? item.label
                        : `${item.label} (Bị khóa bởi phân quyền RBAC)`
                    }
                  >
                    <div className="shrink-0 relative">
                      {item.icon}
                      {!isAllowed && (
                        <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] text-white ring-1 ring-slate-900">
                          <Lock className="w-2 h-2 text-white" />
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left flex items-center justify-between">
                        <span>{item.label}</span>
                        {!isAllowed && (
                          <Lock className="w-3 h-3 text-rose-400 shrink-0 ml-1 opacity-80" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile in Sidebar */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-lg ${currentProfile.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
              {currentProfile.avatarText}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-white truncate">{currentProfile.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentProfile.jobTitle}</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg transition cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
