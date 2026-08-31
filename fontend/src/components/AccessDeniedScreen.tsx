import React from 'react';
import { useDepot } from '../context/DepotContext';
import { UserAccountProfile } from '../data/roleMenuConfig';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';

interface AccessDeniedScreenProps {
  activeTab: string;
  currentProfile: UserAccountProfile;
  onGoToAllowedTab: () => void;
}

const TAB_NAME_MAP: Record<string, string> = {
  dashboard: 'Báo Cáo Tổng Quan (Dashboard)',
  jobs: 'Quản Lý Container Jobs',
  operation: 'Gate-In Khai Thác Cổng',
  survey: 'Giám Định IICL',
  qc: 'Kiểm Định QC Nghiệm Thu',
  estimate: 'Báo Giá Sửa Chữa Hãng Tàu',
  repair: 'Lệnh Sửa Chữa & Work Order',
  payment: 'Thanh Toán & Gạch Nợ VietQR',
  yard: 'Sơ Đồ Bãi Container',
  forklift: 'Điều Độ Xe Nâng',
  inventory: 'Quản Lý Kho Vật Tư',
  masterdata: 'Danh Mục Master Data',
  portal_users: 'Portal Người Dùng Đối Tác',
  permissions: 'Phân Quyền RBAC System',
  report: 'Báo Cáo KPI Thống Kê',
  dotnet: 'Cấu Trúc .NET 8 API'
};

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  activeTab,
  currentProfile,
  onGoToAllowedTab
}) => {
  const { setActiveRole, activeRole } = useDepot();

  const targetTabName = TAB_NAME_MAP[activeTab] || activeTab;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 max-w-4xl mx-auto my-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Warning */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-800 pb-6">
        <div className="p-4 bg-rose-950/80 text-rose-400 border border-rose-800/80 rounded-2xl shadow-xl shadow-rose-950/50 shrink-0">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold tracking-wider">
              HTTP 403 FORBIDDEN
            </span>
            <span className="text-xs text-slate-400">RBAC Enforcement Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Quyền Truy Cập Bị Hạn Chế (Access Restricted)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hệ thống bảo mật RBAC đã từ chối truy cập vào mô-đun <strong className="text-rose-300 font-mono">"{targetTabName}"</strong>.
          </p>
        </div>
      </div>

      {/* Profile & Context details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left card: Current user details */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Thông Tin Tài Khoản Hiện Tại</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className={`w-10 h-10 rounded-xl ${currentProfile?.avatarBg || 'bg-slate-700'} text-white font-bold text-sm flex items-center justify-center shrink-0`}>
              {currentProfile?.avatarText || ''}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">{currentProfile?.fullName || 'N/A'}</p>
              <p className="text-xs text-slate-400 truncate">{currentProfile?.jobTitle || ''}</p>
              <div className="mt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${currentProfile?.badgeBg || 'bg-slate-800 text-slate-300'}`}>
                  {currentProfile?.badgeText || ''}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2.5">
            {currentProfile?.roleDescription || ''}
          </p>
        </div>

        {/* Right card: Allowed Tabs */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Chức Năng Được Phép ({currentProfile?.allowedTabs?.length || 0})</span>
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              GRANTED
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Tài khoản của bạn hiện có quyền truy cập vào các mô-đun sau:
          </p>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto scrollbar-thin pt-1">
            {(currentProfile?.allowedTabs || []).map((tabId) => (
              <span
                key={tabId}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{TAB_NAME_MAP[tabId] || tabId}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action choices */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onGoToAllowedTab}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Về Trang Được Cấp Quyền ({TAB_NAME_MAP[currentProfile?.allowedTabs?.[0] || ''] || 'Trang Chủ'})</span>
        </button>

        {activeRole !== 'DEPOT_MANAGER' && (
          <button
            onClick={() => setActiveRole('DEPOT_MANAGER')}
            className="w-full sm:w-auto px-4 py-2.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-purple-400" />
            <span>Đổi Sang Vai Trò Admin (Quản Lý Tổng)</span>
          </button>
        )}
      </div>
    </div>
  );
};
