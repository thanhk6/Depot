import React, { useState } from 'react';
import {
  Smartphone,
  Truck,
  Layers,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  X,
  KeyRound
} from 'lucide-react';
import { DriverRecord } from '../types/customerPortal';

interface DriverLoginModalProps {
  drivers: DriverRecord[];
  onLoginSuccess: (driver: DriverRecord) => void;
  onClose: () => void;
}

export const DriverLoginModal: React.FC<DriverLoginModalProps> = ({
  drivers,
  onLoginSuccess,
  onClose
}) => {
  const [usernameOrPhone, setUsernameOrPhone] = useState<string>('0903.112.233');
  const [password, setPassword] = useState<string>('Password@123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = usernameOrPhone.trim().replace(/\s+/g, '');
    const matchedDriver = drivers.find(
      (d) =>
        d.phone.replace(/[^0-9]/g, '') === cleanInput.replace(/[^0-9]/g, '') ||
        (d.username && d.username.toLowerCase() === cleanInput.toLowerCase())
    );

    if (matchedDriver) {
      onLoginSuccess(matchedDriver);
    } else {
      // Default to first driver if not strictly found, or show friendly fallback
      if (drivers.length > 0) {
        onLoginSuccess(drivers[0]);
      } else {
        setErrorMessage('Tài khoản hoặc số điện thoại không chính xác');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full my-auto p-6 space-y-5 shadow-2xl animate-scale-up text-center relative">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo & Title (Section 8) */}
        <div className="space-y-2 pt-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-pink-600 to-rose-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-pink-600/30">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-pink-400 tracking-wider">
              DEPOT CONTAINER 2026
            </h3>
            <h2 className="text-xl font-black text-white tracking-wide">
              GATE-IN ONLINE
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cổng khai báo điện tử và nhận mã QR vào Depot dành cho Tài xế
            </p>
          </div>
        </div>

        {/* Quick Driver Selector for testing */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 block">
            Chọn tài xế mẫu đăng nhập nhanh:
          </label>
          <select
            onChange={(e) => {
              const drv = drivers.find((d) => d.id === e.target.value);
              if (drv) {
                setUsernameOrPhone(drv.phone);
                setPassword('Password@123');
              }
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-pink-500 focus:outline-none"
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName} ({d.phone} • Xe: {d.assignedVehiclePlate})
              </option>
            ))}
          </select>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 text-left text-xs">
          <div>
            <label className="text-slate-400 font-bold block mb-1">
              Số Điện Thoại / Tên Đăng Nhập:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={usernameOrPhone}
                onChange={(e) => setUsernameOrPhone(e.target.value)}
                placeholder="0903xxxxxx hoặc username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">
              Mật Khẩu:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-2 bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] rounded-xl">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">Ghi nhớ đăng nhập</span>
            <button
              type="button"
              onClick={() => alert('Mã xác thực OTP đã được gửi về số điện thoại của tài xế.')}
              className="text-pink-400 hover:underline cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xs rounded-xl shadow-lg shadow-pink-600/30 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>ĐĂNG NHẬP TÀI XẾ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
