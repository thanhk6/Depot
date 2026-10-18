import React, { useState } from 'react';
import { useDepot } from '../context/DepotContext';
import { getProfileByRole, UserAccountProfile } from '../data/roleMenuConfig';
import { authService } from '../services/auth.service';
import { RoleType } from '../types/depot';
import {
  Container,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccountProfile) => void;
}

// `SystemRole` (kiểu role mà `authService.login()` trả về, chuẩn hoá từ RoleCode thật trong DB) và
// `RoleType` (kiểu role mà DepotContext/menu Sidebar đang dùng) là 2 enum khác nhau có sẵn từ trước
// trong codebase — không phải lỗi mới, chỉ cần map qua lại để hiển thị đúng menu/màu sắc theo vai trò
// thật của tài khoản vừa đăng nhập.
// Khoá là đúng 11 RoleCode backend trả về (DbSeeder.SeedRolesAsync) — authService.normalizeRole giữ nguyên các mã này
// (trước đây nó quy theo bộ mã cũ nên QC_ENG/TECHNICIAN/CARRIER... rơi về đây thành "Khai Thác Cổng").
// Mã lạ → UNKNOWN (nhãn "—"), không mượn nhãn vai trò khác.
const mapSystemRoleToRoleType = (role: string): RoleType => {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN': return 'DEPOT_MANAGER';
    case 'GATE_OP': return 'OPERATOR';
    case 'SURVEYOR': return 'SURVEYOR';
    case 'ESTIMATOR': return 'ESTIMATOR';
    case 'TECHNICIAN': return 'REPAIR_TECH';
    case 'QC_ENG': return 'QC_INSPECTOR';
    case 'CLEANING': return 'CLEANING_STAFF';
    case 'FORKLIFT': return 'FORKLIFT_DRIVER';
    case 'CASHIER': return 'ACCOUNTANT';
    case 'CARRIER': return 'SHIPPING_LINE';
    case 'SUPERVISOR': return 'SUPERVISOR';
    default: return 'UNKNOWN';
  }
};

// Hồ sơ hiển thị trung tính cho vai trò lạ — không lấy getProfileByRole (rơi về hồ sơ quản lý).
const UNKNOWN_ROLE_DISPLAY = {
  jobTitle: '',
  department: '',
  avatarBg: 'bg-slate-500',
  badgeBg: 'bg-slate-100 text-slate-600 border-slate-300',
  badgeText: '—',
  allowedTabs: [] as string[],
  roleDescription: ''
};

// Lấy chữ viết tắt hiển thị trên avatar từ họ tên thật (vd "Nguyễn Văn Hùng" → "NH") — chỉ dùng khi
// người dùng thật không có avatar riêng, không phải dữ liệu giả.
const getInitials = (fullName: string): string => {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { setActiveRole, setLoggedInUserProfile, showToast } = useDepot();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Xác thực thật với database (SystemUser + PasswordHash + Role qua bảng Roles thật) — không còn
      // đối chiếu/ghi đè bằng danh sách tài khoản mẫu hardcode như trước.
      const user = await authService.login(usernameInput.trim(), passwordInput);
      const roleType = mapSystemRoleToRoleType(user.role);
      // 2 field jobTitle/department không có trong bảng SystemUser thật — suy ra hiển thị theo vai trò
      // (cosmetic only), KHÔNG dùng để ghi đè bất kỳ field định danh thật nào (họ tên, email, quyền menu).
      const roleDisplay = roleType === 'UNKNOWN' ? UNKNOWN_ROLE_DISPLAY : getProfileByRole(roleType);

      const profile: UserAccountProfile = {
        id: user.id,
        role: roleType,
        username: user.username,
        passwordHash: '',
        fullName: user.fullName,
        jobTitle: roleDisplay.jobTitle,
        department: roleDisplay.department,
        email: user.email,
        avatarBg: roleDisplay.avatarBg,
        avatarText: getInitials(user.fullName || user.username),
        badgeBg: roleDisplay.badgeBg,
        badgeText: roleDisplay.badgeText,
        allowedTabs: user.allowedTabs?.length ? user.allowedTabs : roleDisplay.allowedTabs,
        roleDescription: roleDisplay.roleDescription
      };

      setActiveRole(profile.role);
      setLoggedInUserProfile(profile);
      if (rememberMe) {
        localStorage.setItem('depot_logged_user_id', profile.id);
      }

      showToast(`Đăng nhập hệ thống thành công! Chào mừng ${profile.fullName}`, 'success', 'Đăng Nhập Thành Công');
      onLoginSuccess(profile);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tên đăng nhập hoặc mật khẩu không chính xác!';
      setErrorMsg(message);
      showToast(message, 'error', 'Đăng Nhập Thất Bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-indigo-50 border-b border-slate-200 py-2 px-4 text-center text-xs text-slate-700 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Hệ Thống SolutionDepot 2026 — Đăng nhập bằng tài khoản thật trong hệ thống.</span>
      </div>

      {/* Main Container — 1 cột căn giữa, không còn danh sách chọn nhanh tài khoản mẫu */}
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12 w-full flex-1 flex flex-col justify-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-100 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-lg shadow-sky-600/20 ring-1 ring-white/20">
              <Container className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                SolutionDepot
                <span className="text-[10px] bg-sky-100 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  v2.6 Enterprise
                </span>
              </h1>
              <p className="text-xs text-slate-500">Hệ Thống Quản Lý Bãi Container Chuyên Nghiệp</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-500" />
              Đăng Nhập Tài Khoản
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Nhập đúng tên đăng nhập/email và mật khẩu tài khoản của bạn trong hệ thống.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Nhập tên đăng nhập hoặc email"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Mật khẩu hệ thống
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-white border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
                />
                <span>Ghi nhớ phiên làm việc</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Đăng Nhập Vào Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Architecture Footer Note */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-[11px] text-slate-500 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Kiến trúc RBAC & .NET Core 8 Web API:</span>
            </div>
            <p className="leading-relaxed">
              Menu và quyền truy cập được hệ thống cấp tự động theo đúng vai trò tài khoản của bạn trong
              database, mỗi tài khoản chỉ đăng nhập được vào đúng 1 tài khoản của chính mình.
            </p>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>© 2026 SolutionDepot Enterprise System • Cung cấp giải pháp Quản Lý Bãi Container chuẩn IICL cho Cảng & Depot Việt Nam</p>
      </div>
    </div>
  );
};
