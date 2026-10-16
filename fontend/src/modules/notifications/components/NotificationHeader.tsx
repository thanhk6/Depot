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
    // Đồng bộ đúng chuẩn "Dashboard ERP Tổng Quan" (dashboard/pages/DashboardPage.tsx) theo yêu cầu
    // người dùng 2026-09-06 — xem docs/frontend-theme-unification.md. Banner nền gradient sáng
    // (blue-50→white→indigo-50), KHÔNG còn hộp icon gradient tối, dải tab chuyển sang nền sáng. Tiện thể
    // sửa luôn 1 lỗi tương phản có sẵn ("CONNECTED" dùng text-emerald-400 khó đọc trên nền sáng) vì đang
    // viết lại y hệt trang gốc này — trước đây các màn KHÁC chỉ nhân bản đúng y hệt kể cả lỗi này, nhưng
    // giờ đang sửa lại chính trang tham chiếu nên không có lý do giữ lỗi.
    <div className="p-6 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-3xl shadow-sm relative overflow-hidden space-y-4">
      {/* Title & Live Status Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200 text-xs font-bold font-mono">
            <Radio className="w-3.5 h-3.5" />
            <span>OFFICIAL ACCOUNT &amp; ZNS</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Thông Báo &amp; Zalo Gateway
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Hệ thống gửi tin nhắn tự động &amp; đồng bộ theo thời gian thực vòng đời Container Depot.
          </p>
        </div>

        {/* Action & Zalo Connection Badge */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
            <span className="font-semibold text-slate-700">Zalo OA:</span>
            <span className="font-mono text-emerald-700 font-bold">CONNECTED (Quota 5,000/ngày)</span>
          </div>

          <button
            onClick={() => onSelectTab('send')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>+ Gửi Thông Báo Mới</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar (nền sáng) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none relative z-10">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? tab.isZaloHighlight
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : tab.isZaloHighlight
                  ? 'text-sky-700 bg-white/60 hover:text-sky-800 hover:bg-white border border-transparent hover:border-sky-200'
                  : 'text-slate-600 bg-white/60 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.isZaloHighlight
                      ? 'bg-sky-100 text-sky-700 border border-sky-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
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
