import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Globe,
  Clock,
  Key,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { SecurityPolicyConfig } from '../types/rbac';

interface SecurityPolicyConfigProps {
  initialPolicy: SecurityPolicyConfig;
  onSavePolicy: (policy: SecurityPolicyConfig) => void;
}

export const SecurityPolicyConfigView: React.FC<SecurityPolicyConfigProps> = ({
  initialPolicy,
  onSavePolicy
}) => {
  const [policy, setPolicy] = useState<SecurityPolicyConfig>(initialPolicy);
  const [newIpRange, setNewIpRange] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAddIpRange = () => {
    if (!newIpRange.trim()) return;
    if (!policy.allowedIpRanges.includes(newIpRange.trim())) {
      setPolicy((prev) => ({
        ...prev,
        allowedIpRanges: [...prev.allowedIpRanges, newIpRange.trim()]
      }));
    }
    setNewIpRange('');
  };

  const handleRemoveIpRange = (ip: string) => {
    setPolicy((prev) => ({
      ...prev,
      allowedIpRanges: prev.allowedIpRanges.filter((item) => item !== ip)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePolicy(policy);
    setToastMsg('🎉 Đã cập nhật chính sách bảo mật hệ thống thành công!');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {toastMsg && (
        <div className="p-4 bg-white border-2 border-emerald-500 rounded-2xl flex items-center justify-between text-xs text-emerald-200 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
          <button type="button" onClick={() => setToastMsg(null)} className="text-slate-500 hover:text-slate-900 p-1">
            &times;
          </button>
        </div>
      )}

      {/* 1. Password Policy */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Quy Chuẩn Độ Mạnh &amp; Thời Hạn Mật Khẩu
            </h3>
            <p className="text-slate-500 text-[11px]">Áp dụng cho tất cả tài khoản người dùng đăng nhập hệ thống.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-slate-700 font-bold block">Độ Dài Tối Thiểu</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="6"
                max="32"
                value={policy.passwordMinLength}
                onChange={(e) => setPolicy({ ...policy, passwordMinLength: parseInt(e.target.value) || 8 })}
                className="w-24 px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl font-mono font-bold"
              />
              <span className="text-slate-500">ký tự</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-slate-700 font-bold block">Hạn Sử Dụng Mật Khẩu</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="30"
                max="365"
                value={policy.passwordExpireDays}
                onChange={(e) => setPolicy({ ...policy, passwordExpireDays: parseInt(e.target.value) || 90 })}
                className="w-24 px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl font-mono font-bold"
              />
              <span className="text-slate-500">ngày (Đổi định kỳ)</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-slate-700 font-bold block">Số Lần Nhập Sai Tối Đa</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="3"
                max="10"
                value={policy.maxFailedAttempts}
                onChange={(e) => setPolicy({ ...policy, maxFailedAttempts: parseInt(e.target.value) || 5 })}
                className="w-24 px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl font-mono font-bold"
              />
              <span className="text-slate-500">lần (Tự khóa tạm thời)</span>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 font-medium">Bắt buộc chứa chữ IN HOA</span>
            <input
              type="checkbox"
              checked={policy.requireUppercase}
              onChange={(e) => setPolicy({ ...policy, requireUppercase: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white border-slate-200"
            />
          </label>

          <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 font-medium">Bắt buộc chứa chữ số (0-9)</span>
            <input
              type="checkbox"
              checked={policy.requireDigits}
              onChange={(e) => setPolicy({ ...policy, requireDigits: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white border-slate-200"
            />
          </label>

          <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 font-medium">Bắt buộc ký tự đặc biệt (!@#$)</span>
            <input
              type="checkbox"
              checked={policy.requireSpecialChar}
              onChange={(e) => setPolicy({ ...policy, requireSpecialChar: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white border-slate-200"
            />
          </label>
        </div>
      </div>

      {/* 2. Session & 2FA */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Phiên Làm Việc (Session) &amp; Xác Thực 2 Bước (2FA)
            </h3>
            <p className="text-slate-500 text-[11px]">Bảo vệ phiên đăng nhập khỏi rủi ro chiếm quyền điều khiển.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-700 font-bold block">Thời Hạn Phiên Tự Động Đăng Xuất</span>
              <p className="text-[10px] text-slate-500">Tự khóa khi không có tương tác chuột/bàn phím.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="15"
                max="480"
                value={policy.sessionTimeoutMinutes}
                onChange={(e) => setPolicy({ ...policy, sessionTimeoutMinutes: parseInt(e.target.value) || 60 })}
                className="w-20 px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl font-mono font-bold text-center"
              />
              <span className="text-slate-500">phút</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-700 font-bold block">Bắt Buộc 2FA Cho Ban Quản Lý (Admin/QC)</span>
              <p className="text-[10px] text-slate-500">Google Authenticator hoặc mã OTP qua App.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={policy.enforce2FAForAdmins}
                onChange={(e) => setPolicy({ ...policy, enforce2FAForAdmins: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. IP Whitelisting */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Danh Sách IP Được Phép Truy Cập (IP Whitelisting)
              </h3>
              <p className="text-slate-500 text-[11px]">Giới hạn truy cập từ mạng LAN nội bộ Cảng/Depot hoặc VPN mã hóa.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={policy.ipWhitelistEnabled}
              onChange={(e) => setPolicy({ ...policy, ipWhitelistEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {policy.ipWhitelistEnabled && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newIpRange}
                onChange={(e) => setNewIpRange(e.target.value)}
                placeholder="VD: 113.161.44.0/24 (Mạng Cổng Bãi Cát Lái)"
                className="w-full max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddIpRange}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Dải IP</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              {policy.allowedIpRanges.map((ip) => (
                <div
                  key={ip}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-600 flex items-center gap-2"
                >
                  <span>{ip}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIpRange(ip)}
                    className="text-slate-500 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-xl  transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>LƯU TẤT CẢ CHÍNH SÁCH BẢO MẬT</span>
        </button>
      </div>
    </form>
  );
};
