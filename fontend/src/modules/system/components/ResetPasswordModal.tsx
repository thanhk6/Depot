import React, { useState } from 'react';
import {
  X,
  Key,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { UserAccount } from '../types/rbac';

interface ResetPasswordModalProps {
  user: UserAccount;
  onClose: () => void;
  onConfirmReset: (userId: string, newPass: string, forceChange: boolean) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  user,
  onClose,
  onConfirmReset
}) => {
  const generateRandomPass = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const [newPassword, setNewPassword] = useState(generateRandomPass());
  const [forceChangeNextLogin, setForceChangeNextLogin] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setNewPassword(generateRandomPass());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReset(user.id, newPassword, forceChangeNextLogin);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                ĐẶT LẠI MẬT KHẨU
              </h3>
              <p className="text-xs text-slate-400">{user.fullName} ({user.username})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <label className="text-slate-400 font-bold block">Mật Khẩu Tạm Thời Mới Tạo:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-amber-300 font-mono text-sm font-bold rounded-xl focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={handleRegenerate}
                title="Tạo ngẫu nhiên mật khẩu khác"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                title="Sao chép mật khẩu"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <p className="text-[10px] text-emerald-400">Đã sao chép mật khẩu vào Clipboard!</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="forceChange"
              checked={forceChangeNextLogin}
              onChange={(e) => setForceChangeNextLogin(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-700"
            />
            <label htmlFor="forceChange" className="text-slate-300 cursor-pointer">
              Bắt buộc nhân viên đổi mật khẩu ở lần đăng nhập tiếp theo
            </label>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-200 text-[11px] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              Mật khẩu mới sẽ có hiệu lực ngay lập tức. Các phiên đăng nhập hiện tại trên thiết bị khác của người dùng sẽ bị đăng xuất.
            </span>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950"
            >
              <Key className="w-4 h-4" />
              <span>Xác Nhận Đặt Lại</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
