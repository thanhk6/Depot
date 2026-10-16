import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Smartphone
} from 'lucide-react';
import { UserAccount, UserStatus } from '../types/rbac';
import { ROLES, RoleDefinition } from '../../../constants/permissions';
import { masterDataApi } from '../../../api';

interface UserModalProps {
  user?: UserAccount | null;
  onClose: () => void;
  onSaveUser: (userData: Omit<UserAccount, 'id' | 'createdAt'> & { id?: string }) => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSaveUser }) => {
  const isEditing = !!user;

  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [roleId, setRoleId] = useState(user?.roleId || 'ROLE_SURVEYOR');
  const [department, setDepartment] = useState(user?.department || '');
  // Danh sách phòng ban lấy từ catalog DEPARTMENT thật (DM Phòng Ban Depot) — không dùng danh sách mẫu.
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ code: string; name: string }>>([]);
  useEffect(() => {
    masterDataApi.getCatalog('DEPARTMENT')
      .then((response: any) => setDepartmentOptions((response?.data || []).map((d: any) => ({ code: d.code, name: d.nameVi || d.name }))))
      .catch(() => setDepartmentOptions([]));
  }, []);
  const [employeeCode, setEmployeeCode] = useState(user?.employeeCode || '');
  const [status, setStatus] = useState<UserStatus>(user?.status || 'ACTIVE');
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is2FAEnabled ?? false);
  const [notes, setNotes] = useState(user?.notes || '');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedRole = ROLES.find((r) => r.id === roleId) || ROLES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập (Username)');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên nhân viên');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Email hợp lệ');
      return;
    }

    onSaveUser({
      id: user?.id,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roleId,
      roleCode: selectedRole.code,
      roleName: selectedRole.name,
      department,
      employeeCode,
      status,
      is2FAEnabled,
      notes,
      lastLoginAt: user?.lastLoginAt,
      lastLoginIp: user?.lastLoginIp
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-200">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase font-mono">
                {isEditing ? 'CHỈNH SỬA TÀI KHOẢN NGƯỜI DÙNG' : 'TẠO MỚI TÀI KHOẢN NGƯỜI DÙNG'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing ? `Mã nhân viên: ${user?.employeeCode}` : 'Cấp quyền truy cập hệ thống Depot Core ERP'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-600 rounded-xl text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-600" />
              1. Thông Tin Cá Nhân &amp; Tài Khoản
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Tên Đăng Nhập (Username) (*)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono focus:outline-none focus:border-purple-500 font-bold"
                  placeholder="VD: surveyor.nam"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Mã Nhân Viên (ID Code)</label>
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono uppercase focus:outline-none focus:border-purple-500 font-bold"
                  placeholder="EMP-014"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-700 font-bold block">Họ và Tên Nhân Viên (*)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                  placeholder="VD: Lê Hoàng Nam"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Địa Chỉ Email (*)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono focus:outline-none focus:border-purple-500"
                  placeholder="nam.le@depot-survey.vn"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Số Điện Thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono focus:outline-none focus:border-purple-500"
                  placeholder="0912.345.678"
                />
              </div>

              {!isEditing && (
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-700 font-bold block">Mật Khẩu Ban Đầu (*)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono focus:outline-none focus:border-purple-500"
                    placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                  />
                  <p className="text-[10px] text-slate-500">Mật khẩu tạm thời sẽ được gửi qua email cho nhân viên.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Role & Department Assignment */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              2. Gán Vai Trò (RBAC Role) &amp; Phòng Ban
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Vai Trò Hệ Thống (*)</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-purple-500 font-bold"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Phòng Ban Trực Thuộc</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  <option value="">{departmentOptions.length === 0 ? '— Chưa có phòng ban trong DM Phòng Ban —' : '— Chọn phòng ban —'}</option>
                  {department && !departmentOptions.some((d) => d.name === department) && (
                    <option value={department}>{department}</option>
                  )}
                  {departmentOptions.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Trạng Thái Tài Khoản</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-purple-500 font-bold"
                >
                  <option value="ACTIVE">🟢 Đang Hoạt Động (Active)</option>
                  <option value="INACTIVE">⚪ Tạm Dừng (Inactive)</option>
                  <option value="LOCKED">🔴 Đang Bị Khóa (Locked)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-slate-700 font-bold block">Xác Thực 2 Bước (2FA)</span>
                  <span className="text-[10px] text-slate-500">Yêu cầu mã OTP Google Authenticator</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={is2FAEnabled}
                    onChange={(e) => setIs2FAEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-200 after:border-slate-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-700 font-bold block">Ghi Chú Nghiệp Vụ / Chức Danh</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-purple-500"
                  placeholder="Ghi chú thêm về chứng chỉ hoặc trách nhiệm..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg  transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'LƯU THAY ĐỔI' : 'TẠO TÀI KHOẢN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
