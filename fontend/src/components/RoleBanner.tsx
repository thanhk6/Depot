import React, { useState } from 'react';
import { useDepot } from '../context/DepotContext';
import { USER_ACCOUNT_PROFILES, UserAccountProfile, getProfileByRole } from '../data/roleMenuConfig';
import {
  Users,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Check,
  KeyRound,
  X,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export const RoleBanner: React.FC = () => {
  const { activeRole, setActiveRole, userProfiles } = useDepot();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentProfile = (userProfiles && userProfiles.find((p) => p.role === activeRole)) || getProfileByRole(activeRole) || {
    id: 'USR-001',
    role: 'DEPOT_MANAGER',
    username: 'admin',
    fullName: 'Nguyễn Văn Hùng',
    jobTitle: 'Giám Đốc',
    department: 'Ban Giám Đốc',
    email: 'admin@depot.vn',
    avatarBg: 'bg-slate-700',
    avatarText: 'NVH',
    badgeBg: 'bg-slate-800 text-slate-100',
    badgeText: 'Admin',
    allowedTabs: ['dashboard', 'jobs'],
    roleDescription: ''
  };

  const handleSwitchUser = (user: UserAccountProfile) => {
    setActiveRole(user.role);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-slate-900 border-b border-slate-800 text-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Logged in User Card */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl ${currentProfile.avatarBg} text-white font-bold text-sm flex items-center justify-center shadow-md border border-white/20`}>
                  {currentProfile.avatarText}
                </div>
                <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 rounded-full text-[10px] text-white ring-2 ring-slate-900" title="Đang đăng nhập">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{currentProfile.fullName}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${currentProfile.badgeBg}`}>
                    {currentProfile.badgeText}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">({currentProfile.email})</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span>{currentProfile.jobTitle} • {currentProfile.department}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-purple-300 font-medium flex items-center gap-1 bg-purple-950/60 border border-purple-800/40 px-1.5 py-0.2 rounded">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Menu cá nhân hóa ({currentProfile?.allowedTabs?.length || 0} chức năng)
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Switch Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" /> Đăng nhập vai trò:
              </span>

              {userProfiles.map((usr) => {
                const isActive = usr.role === activeRole;
                return (
                  <button
                    key={usr.id}
                    onClick={() => setActiveRole(usr.role)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 font-bold'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={`${usr.fullName} (${usr.jobTitle}) - ${usr.roleDescription}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-500'}`} />
                    <span>{(usr.fullName || '').split(' ').slice(-1)?.[0] || ''} ({(usr.badgeText || '').split(' ')?.[0] || ''})</span>
                  </button>
                );
              })}

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1 text-xs font-bold bg-slate-800 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ml-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Xem Phân Quyền Menu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Roles & Menu Permissions Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Chuyển Đổi Tài Khoản & Menu Phân Quyền Riêng (RBAC)</h3>
                  <p className="text-xs text-slate-400">Chọn tài khoản người dùng để trải nghiệm giao diện menu riêng biệt của từng bộ phận</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProfiles.map((usr) => {
                  const isCurrent = usr.role === activeRole;
                  return (
                    <div
                      key={usr.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-purple-950/40 border-purple-500/60 ring-2 ring-purple-500/20 shadow-xl'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div>
                        {/* Header info */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${usr.avatarBg} text-white font-bold text-xs flex items-center justify-center`}>
                              {usr.avatarText}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white">{usr.fullName}</h4>
                              <p className="text-[11px] text-slate-400">{usr.jobTitle}</p>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> Đang chọn
                            </span>
                          )}
                        </div>

                        {/* Department Badge */}
                        <div className="mb-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${usr.badgeBg}`}>
                            {usr.badgeText}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                          {usr.roleDescription}
                        </p>

                        {/* Allowed Menu Tags */}
                        <div className="space-y-1 mb-4">
                          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                            <Layers className="w-3 h-3 text-purple-400" /> Menu riêng ({usr.allowedTabs?.length || 0} mục):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(usr.allowedTabs || []).map((tabId) => (
                              <span
                                key={tabId}
                                className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono"
                              >
                                {tabId === 'dashboard' && 'Báo Cáo'}
                                {tabId === 'jobs' && 'Tất Cả Jobs'}
                                {tabId === 'survey' && 'Giám Định'}
                                {tabId === 'operation' && 'Khai Thác'}
                                {tabId === 'payment' && 'Thanh Toán'}
                                {tabId === 'estimate' && 'Báo Giá'}
                                {tabId === 'repair' && 'Sửa Chữa'}
                                {tabId === 'yard' && 'Xe Nâng & Bãi'}
                                {tabId === 'dotnet' && '.NET 8 Architecture'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Select Action Button */}
                      <button
                        onClick={() => handleSwitchUser(usr)}
                        disabled={isCurrent}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isCurrent
                            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <Check className="w-4 h-4" /> Đã Đăng Nhập Tài Khoản Này
                          </>
                        ) : (
                          <>
                            <span>Đăng Nhập Ngay</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Cơ chế RBAC (Role-Based Access Control) tự động lọc thanh Menu chính theo đúng vai trò tài khoản.</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
