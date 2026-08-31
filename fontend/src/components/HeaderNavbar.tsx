import React, { useState, useRef, useEffect } from 'react';
import { useDepot } from '../context/DepotContext';
import { ContainerSize } from '../types/depot';
import { SHIPPING_LINES } from '../data/depotMasterData';
import { getProfileByRole, USER_ACCOUNT_PROFILES } from '../data/roleMenuConfig';
import {
  Boxes,
  PlusCircle,
  Search,
  RotateCcw,
  Container,
  X,
  LogOut,
  ChevronDown,
  Layers,
  KeyRound,
  Check
} from 'lucide-react';

interface HeaderNavbarProps {
  onLogout?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ onLogout }) => {
  const {
    jobs,
    activeRole,
    setActiveRole,
    userProfiles,
    searchQuery,
    setSearchQuery,
    createGateInJob,
    resetToDefaultData
  } = useDepot();

  const currentProfile = (userProfiles && userProfiles.find((p) => p.role === activeRole)) || getProfileByRole(activeRole) || {
    fullName: 'Quản Lý',
    role: 'DEPOT_MANAGER',
    badgeText: 'Admin',
    jobTitle: 'Giám Đốc',
    department: 'Ban Giám Đốc',
    email: 'admin@depot.vn',
    avatarBg: 'bg-slate-100',
    avatarText: 'NVH',
    badgeBg: 'bg-slate-100 text-slate-700',
    allowedTabs: ['dashboard', 'jobs']
  };
  const [isGateInModalOpen, setIsGateInModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State for Gate-In
  const [containerNo, setContainerNo] = useState('');
  const [isoSize, setIsoSize] = useState<ContainerSize>('40HC');
  const [shippingLine, setShippingLine] = useState(SHIPPING_LINES?.[0] || 'Maersk Line (MSK)');
  const [tareWeight, setTareWeight] = useState(3800);
  const [maxPayload, setMaxPayload] = useState(28600);

  const [backendStatus, setBackendStatus] = useState<{ online: boolean; message: string }>({
    online: false,
    message: 'Đang kiểm tra backend...'
  });

  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setBackendStatus({
              online: true,
              message: `SolutionDepot API Online (${data.framework || '.NET 8'})`
            });
          }
        } else {
          if (isMounted) {
            setBackendStatus({ online: false, message: 'Backend HTTP Error' });
          }
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus({ online: false, message: 'Chưa kết nối API Server' });
        }
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleGateInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerNo.trim()) return;

    createGateInJob(containerNo, isoSize, shippingLine, tareWeight, maxPayload);
    setIsGateInModalOpen(false);
    setContainerNo('');
  };

  const activeInYard = jobs.filter((j) => j.status !== 'GATE_OUT').length;
  const pendingSurvey = jobs.filter((j) => j.status === 'GATE_IN' || j.status === 'SURVEYING').length;
  const pendingEstimate = jobs.filter((j) => j.status === 'ESTIMATE_PENDING_APPROVAL').length;
  const pendingRepair = jobs.filter((j) => j.status === 'REPAIRING').length;

  return (
    <>
      <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] text-[#1F2937] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Left Column: Brand Logo & Interactive Top-Left User Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="bg-[#1677FF] p-2 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                <Boxes className="w-5 h-5 text-white" />
              </div>

              {/* Logged in User Button on TOP LEFT */}
              {onLogout && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2.5 bg-[#FFFFFF] hover:bg-[#F4F7FA] border border-[#E2E8F0] px-3 py-1.5 rounded-xl transition cursor-pointer group shadow-sm text-left"
                    title="Click để xem chi tiết tài khoản, chuyển vai trò & Đăng xuất"
                  >
                    <div className="relative">
                      <div className={`w-7 h-7 rounded-lg ${currentProfile?.avatarBg || 'bg-[#F4F7FA]'} text-[#1F2937] font-bold text-xs flex items-center justify-center ring-1 ring-[#E2E8F0] group-hover:scale-105 transition-transform`}>
                        {currentProfile?.avatarText || ''}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#16A34A] rounded-full ring-2 ring-white" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#1F2937] group-hover:text-[#1677FF] transition-colors">
                          {currentProfile?.fullName || 'N/A'}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${currentProfile?.badgeBg || 'bg-[#F4F7FA] text-[#1F2937]'}`}>
                          {(currentProfile?.badgeText || '').split(' ')?.[0] || ''}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180 text-[#1677FF]' : ''}`} />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                        {currentProfile?.jobTitle || ''}
                      </p>
                    </div>
                  </button>

                  {/* Dropdown Menu when clicked */}
                  {isUserDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 text-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Info Header */}
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                        <div className={`w-11 h-11 rounded-xl ${currentProfile?.avatarBg || 'bg-slate-100'} text-slate-700 font-bold text-sm flex items-center justify-center shadow-md shrink-0 ring-2 ring-slate-200`}>
                          {currentProfile?.avatarText || ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{currentProfile?.fullName || 'N/A'}</h4>
                          <p className="text-xs text-slate-500 truncate">{currentProfile?.email || ''}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentProfile?.badgeBg || 'bg-slate-100 text-slate-700'}`}>
                              {currentProfile?.badgeText || ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Job & Department Details */}
                      <div className="py-2.5 border-b border-slate-200 space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Chức danh:</span>
                          <span className="font-medium text-slate-900">{currentProfile?.jobTitle || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phòng ban:</span>
                          <span className="font-medium text-slate-900">{currentProfile?.department || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phân quyền Menu:</span>
                          <span className="font-medium text-blue-600 flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {currentProfile.allowedTabs?.length || 0} chức năng
                          </span>
                        </div>
                      </div>

                      {/* Role Switcher Option */}
                      <div className="py-2.5 border-b border-slate-200">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-blue-600" /> Đổi vai trò tài khoản nhanh:
                        </label>
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                          {(userProfiles || []).map((usr) => {
                            const isSelected = usr.role === activeRole;
                            return (
                              <button
                                key={usr.id}
                                onClick={() => {
                                  setActiveRole(usr.role);
                                  setIsUserDropdownOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                                      : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate">{usr.fullName} ({(usr.badgeText || '').split(' ')?.[0] || ''})</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Logout Button */}
                      <div className="pt-2.5">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onLogout();
                          }}
                            className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                            <LogOut className="w-4 h-4 text-red-600" />
                          <span>Đăng Xuất Tài Khoản</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Metrics & Search & Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Backend API Status Indicator */}
              <div
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                  backendStatus.online
                    ? 'bg-[#16A34A]/10 border-[#16A34A]/20 text-[#16A34A]'
                    : 'bg-[#FAAD14]/10 border-[#FAAD14]/20 text-[#FAAD14]'
                }`}
                title="Kiểm tra kết nối tới Backend API (.NET 8 & Express /api/health)"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendStatus.online ? 'bg-[#16A34A] animate-pulse' : 'bg-[#FAAD14]'
                  }`}
                />
                <span className="font-semibold">{backendStatus.message}</span>
              </div>

              {/* Stats badges */}
              <div className="hidden xl:flex items-center gap-2 bg-[#F4F7FA] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5 border-r border-[#E2E8F0] pr-2">
                  <Container className="w-3.5 h-3.5 text-[#1677FF]" />
                  <span>Trong bãi: <strong className="text-[#1F2937]">{activeInYard}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 border-r border-[#E2E8F0] pr-2">
                  <span className="w-2 h-2 rounded-full bg-[#FAAD14]"></span>
                  <span>Giám định: <strong className="text-[#1F2937]">{pendingSurvey}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 border-r border-[#E2E8F0] pr-2">
                  <span className="w-2 h-2 rounded-full bg-[#1677FF]"></span>
                  <span>Chờ duyệt: <strong className="text-[#1F2937]">{pendingEstimate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
                  <span>Sửa chữa: <strong className="text-[#1F2937]">{pendingRepair}</strong></span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:flex-initial sm:w-48">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm số Container..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs text-[#1F2937] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1677FF]/50"
                />
              </div>

              {/* Gate In Button */}
              <button
                onClick={() => setIsGateInModalOpen(true)}
                className="bg-[#1677FF] hover:bg-[#0958D9] text-white font-medium text-xs px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Gate-In</span>
              </button>

              <button
                onClick={resetToDefaultData}
                title="Khôi phục dữ liệu mẫu ban đầu"
                className="p-1.5 bg-[#FFFFFF] hover:bg-[#F4F7FA] text-[#64748B] rounded-lg transition border border-[#E2E8F0] cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Gate In Modal */}
      {isGateInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
                  <Container className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tiếp Nhận Container Vào Depot (Gate-In)</h3>
                  <p className="text-xs text-slate-500">Tạo mới hồ sơ Depot Job cho container vừa vào cổng</p>
                </div>
              </div>
              <button
                onClick={() => setIsGateInModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGateInSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Số Container <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: MSKU1234567, COSU9876543"
                  value={containerNo}
                  onChange={(e) => setContainerNo(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/50 uppercase tracking-widest font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">Định dạng chuẩn ISO: 4 chữ cái + 7 chữ số</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kích Thước / Loại ISO</label>
                  <select
                    value={isoSize}
                    onChange={(e) => setIsoSize(e.target.value as ContainerSize)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="20GP">20GP (Dry Container 20ft)</option>
                    <option value="40GP">40GP (Dry Container 40ft)</option>
                    <option value="40HC">40HC (High Cube 40ft)</option>
                    <option value="45HC">45HC (High Cube 45ft)</option>
                    <option value="20RF">20RF (Reefer Lạnh 20ft)</option>
                    <option value="40RH">40RH (Reefer Lạnh 40ft High Cube)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hãng Tàu Sở Hữu</label>
                  <select
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/50"
                  >
                    {SHIPPING_LINES.map((line) => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Trọng Lượng Vỏ (Tare Wt, kg)</label>
                  <input
                    type="number"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tải Trọng Tối Đa (Payload, kg)</label>
                  <input
                    type="number"
                    value={maxPayload}
                    onChange={(e) => setMaxPayload(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                💡 <strong>Tiếp theo:</strong> Sau khi tạo hồ sơ Gate-In, container sẽ lập tức chuyển sang hàng chờ cho bộ phận <strong>Giám định (Survey)</strong> lập biên bản kiểm tra hư hỏng.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGateInModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md"
                >
                  Xác Nhận Gate-In & Tạo Depot Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
