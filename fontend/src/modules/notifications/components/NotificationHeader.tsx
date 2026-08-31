import React from 'react';
import {
  LayoutDashboard,
  Send,
  Users,
  Building2,
  FileText,
  History,
  ListOrdered,
  Settings,
  Smartphone,
  Sparkles,
  Radio,
  CheckCircle2,
  FileCode
} from 'lucide-react';

// Đã gộp module "ZALO GATEWAY & CHAT" (trước đây là màn riêng `ZaloModule.tsx`/`ZaloHeader.tsx`, có
// sidebar riêng) vào chung 1 hub "THÔNG BÁO & ZALO GATEWAY" theo yêu cầu người dùng — tên các sub-tab
// `zalo_overview/zalo_simulator/zalo_templates/zalo_settings/zalo_logs` cố ý đặt trùng khớp với đúng
// `id` các mục trong Sidebar.tsx (nhóm "ZALO GATEWAY & CHAT" cũ, nay đã xoá, các id được nối thẳng vào
// đây) để App.tsx chỉ cần `initialSubTab={activeTab}` mà không cần bảng ánh xạ tên riêng.
export type NotificationSubTab =
  | 'dashboard'
  | 'send'
  | 'employees'
  | 'customers'
  | 'templates'
  | 'history'
  | 'queue'
  | 'zalo_overview'
  | 'zalo_simulator'
  | 'zalo_templates'
  | 'zalo_settings'
  | 'zalo_logs';

interface NotificationHeaderProps {
  currentTab: NotificationSubTab;
  onSelectTab: (tab: NotificationSubTab) => void;
  pendingCount?: number;
  onOpenQuickSend?: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  currentTab,
  onSelectTab,
  pendingCount = 5
}) => {
  const tabs: { id: NotificationSubTab; label: string; icon: React.ReactNode; badge?: string | number; isZaloHighlight?: boolean }[] = [
    {
      id: 'dashboard',
      label: 'Tổng Quan',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'send',
      label: 'Gửi Thông Báo',
      icon: <Send className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'employees',
      label: 'Thông Báo Nhân Viên',
      icon: <Users className="w-4 h-4 text-sky-400" />
    },
    {
      id: 'customers',
      label: 'Thông Báo Khách Hàng',
      icon: <Building2 className="w-4 h-4 text-indigo-400" />
    },
    {
      id: 'templates',
      label: 'Mẫu Thông Báo',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
      badge: '16 Mẫu'
    },
    {
      id: 'history',
      label: 'Lịch Sử Gửi',
      icon: <History className="w-4 h-4 text-blue-400" />
    },
    {
      id: 'queue',
      label: 'Hàng Đợi Gửi',
      icon: <ListOrdered className="w-4 h-4 text-pink-400" />,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    // 5 tab Zalo Gateway — gộp từ `ZaloHeader.tsx` cũ (đã xoá file), giữ đúng thứ tự/nhãn/badge như
    // nhóm sidebar "ZALO GATEWAY & CHAT" trước khi gộp, đánh dấu `isZaloHighlight` để phân biệt trực
    // quan với 7 tab thông báo thuần ở trên.
    {
      id: 'zalo_overview',
      label: 'Tổng Quan Zalo',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      badge: 'Online',
      isZaloHighlight: true
    },
    {
      id: 'zalo_simulator',
      label: 'Zalo Simulator & Chat',
      icon: <Smartphone className="w-4 h-4 text-blue-300 animate-pulse" />,
      badge: '2 Chiều',
      isZaloHighlight: true
    },
    {
      id: 'zalo_templates',
      label: 'Mẫu Tin ZNS & OA',
      icon: <FileCode className="w-4 h-4 text-amber-400" />,
      badge: '12 Mẫu',
      isZaloHighlight: true
    },
    {
      id: 'zalo_settings',
      label: 'Cấu Hình Zalo',
      icon: <Settings className="w-4 h-4 text-cyan-400" />,
      isZaloHighlight: true
    },
    {
      id: 'zalo_logs',
      label: 'Nhật Ký Webhook & API',
      icon: <Radio className="w-4 h-4 text-purple-400" />,
      isZaloHighlight: true
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 -mt-3 -mx-3 sm:-mt-4 sm:-mx-4 md:-mt-6 md:-mx-6 mb-6 px-4 sm:px-6 pt-5 pb-0 shadow-sm">
      {/* Title & Live Status Area */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Radio className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                THÔNG BÁO & ZALO GATEWAY
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                Official Account & ZNS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống gửi tin nhắn tự động & đồng bộ theo thời gian thực vòng đời Container Depot
            </p>
          </div>
        </div>

        {/* Action & Zalo Connection Badge */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
            <span className="font-semibold text-slate-700">Zalo OA:</span>
            <span className="font-mono text-emerald-400 font-bold">CONNECTED (Quota 5,000/ngày)</span>
          </div>

          <button
            onClick={() => onSelectTab('send')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>+ Gửi Thông Báo Mới</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2 mt-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-b-2 ${
                isActive
                  ? tab.isZaloHighlight
                    ? 'bg-blue-950/60 text-sky-300 border-sky-400 shadow-sm'
                    : 'bg-slate-800/80 text-white border-blue-500 shadow-sm'
                  : tab.isZaloHighlight
                  ? 'text-sky-400/80 hover:text-sky-300 hover:bg-slate-800/40 border-transparent'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    tab.isZaloHighlight
                      ? 'bg-blue-600 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
