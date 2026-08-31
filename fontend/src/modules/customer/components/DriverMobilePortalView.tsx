import React, { useState } from 'react';
import {
  Smartphone,
  Truck,
  QrCode,
  Box,
  Clock,
  User,
  LogOut,
  Plus,
  CheckCircle2,
  Calendar,
  MapPin,
  ChevronRight,
  Home,
  FileText,
  ShieldCheck,
  Share2,
  Download,
  AlertCircle,
  Search,
  Eye,
  KeyRound,
  Layers
} from 'lucide-react';
import {
  DriverRecord,
  CustomerCompany,
  GateInRegistration,
  CustomerBooking,
  CustomerContainerItem
} from '../types/customerPortal';
import { GateInOnlineWizard } from './GateInOnlineWizard';

interface DriverMobilePortalViewProps {
  currentCustomer: CustomerCompany;
  driver: DriverRecord;
  gateIns: GateInRegistration[];
  bookings: CustomerBooking[];
  containers: CustomerContainerItem[];
  drivers: DriverRecord[];
  onCompleteGateIn: (newGateIn: GateInRegistration) => void;
  onOpenQR: (gateIn: GateInRegistration) => void;
  onViewDetail: (gateIn: GateInRegistration) => void;
  onSwitchDesktopView: () => void;
}

export const DriverMobilePortalView: React.FC<DriverMobilePortalViewProps> = ({
  currentCustomer,
  driver,
  gateIns,
  bookings,
  containers,
  drivers,
  onCompleteGateIn,
  onOpenQR,
  onViewDetail,
  onSwitchDesktopView
}) => {
  // Mobile active tab
  const [mobileTab, setMobileTab] = useState<'home' | 'gatein' | 'qr' | 'history' | 'account'>('home');
  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);

  // Filter gate-ins for this specific driver
  const myGateIns = gateIns.filter(
    (g) => g.driverId === driver.id || g.driverPhone === driver.phone || g.vehiclePlate === driver.assignedVehiclePlate
  );

  // Active QR (the most recent confirmed/pending/arrived gate-in)
  const activeGateIn = myGateIns.find(
    (g) => g.status === 'CONFIRMED' || g.status === 'PENDING' || g.status === 'ARRIVED' || g.status === 'INSPECTION'
  ) || myGateIns[0];

  return (
    <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-[36px] overflow-hidden shadow-2xl min-h-[720px] flex flex-col relative pb-20">
      
      {/* Mobile Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-600/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-pink-400 font-bold tracking-wider block">
              APP TÀI XẾ • GATE-IN
            </span>
            <h3 className="text-xs font-black text-white truncate max-w-[180px]">
              {driver.fullName}
            </h3>
          </div>
        </div>

        <button
          onClick={onSwitchDesktopView}
          className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer"
        >
          Desktop
        </button>
      </div>

      {/* Main Content Body */}
      <div className="p-4 flex-1 space-y-4 overflow-y-auto">
        
        {/* TAB 1: HOME DASHBOARD */}
        {mobileTab === 'home' && !isWizardActive && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Driver Greeting Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950/60 border border-pink-500/30 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Xin chào tài xế,</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold rounded">
                  GPLX Hạng {driver.licenseGrade}
                </span>
              </div>
              <h2 className="text-lg font-black text-white">{driver.fullName}</h2>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Công ty:</span>
                  <span className="font-bold text-white truncate max-w-[180px]">{currentCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số điện thoại:</span>
                  <span className="font-mono font-bold text-emerald-400">{driver.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Biển số xe đầu kéo:</span>
                  <span className="font-mono font-bold text-amber-300">{driver.assignedVehiclePlate}</span>
                </div>
                {driver.assignedMoocPlate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rơ-moóc:</span>
                    <span className="font-mono text-slate-200">{driver.assignedMoocPlate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Large Action Buttons (Section 9) */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Button 1: ĐĂNG KÝ GATE-IN */}
              <button
                onClick={() => {
                  setMobileTab('gatein');
                  setIsWizardActive(true);
                }}
                className="p-4 bg-gradient-to-br from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-3xl shadow-xl shadow-pink-600/30 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition active:scale-95"
              >
                <div className="p-2.5 bg-white/20 rounded-2xl">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-black tracking-wide">ĐĂNG KÝ GATE-IN</span>
                <span className="text-[10px] opacity-80">Khai báo cont vào bãi</span>
              </button>

              {/* Button 2: GATE-IN CỦA TÔI */}
              <button
                onClick={() => setMobileTab('history')}
                className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition active:scale-95"
              >
                <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-2xl">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-xs font-black tracking-wide">GATE-IN CỦA TÔI</span>
                <span className="text-[10px] text-slate-400">{myGateIns.length} lệnh đã tạo</span>
              </button>

              {/* Button 3: CONTAINER */}
              <button
                onClick={() => setMobileTab('history')}
                className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition active:scale-95"
              >
                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl">
                  <Box className="w-6 h-6" />
                </div>
                <span className="text-xs font-black tracking-wide">CONTAINER</span>
                <span className="text-[10px] text-slate-400">Tra cứu vỏ &amp; vị trí</span>
              </button>

              {/* Button 4: QR CODE */}
              <button
                onClick={() => setMobileTab('qr')}
                className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition active:scale-95"
              >
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-xs font-black tracking-wide">MÃ QR CODE</span>
                <span className="text-[10px] text-emerald-400">Thẻ Check-in cổng</span>
              </button>
            </div>

            {/* Active Gate-In Pass Preview Card */}
            {activeGateIn && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-pink-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lệnh Gate-In Mới Nhất</span>
                  </span>
                  <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-800 text-[10px] font-mono font-bold rounded">
                    {activeGateIn.status}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">Mã: {activeGateIn.gateInNo}</span>
                    <div className="font-mono font-black text-white text-sm">{activeGateIn.containerNo}</div>
                    <div className="text-[11px] text-slate-300">
                      Hẹn: <strong className="text-emerald-400">{activeGateIn.appointmentTime}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenQR(activeGateIn)}
                    className="p-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl shadow-lg transition cursor-pointer"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GATE-IN WIZARD */}
        {mobileTab === 'gatein' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-400">ĐĂNG KÝ GATE-IN ONLINE</span>
              <button
                onClick={() => {
                  setIsWizardActive(false);
                  setMobileTab('home');
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Hủy
              </button>
            </div>

            <GateInOnlineWizard
              currentCustomer={currentCustomer}
              currentUser={{
                id: 'USR-DRIVER',
                customerId: currentCustomer.id,
                username: driver.username || 'tx_driver',
                fullName: driver.fullName,
                email: driver.email || 'driver@email.com',
                phone: driver.phone,
                role: 'DRIVER',
                driverId: driver.id,
                status: 'ACTIVE',
                createdAt: '2026-08-16'
              }}
              bookings={bookings}
              drivers={drivers}
              vehicles={[]}
              onCompleteGateIn={(newGI) => {
                onCompleteGateIn(newGI);
              }}
              onViewList={() => setMobileTab('history')}
              onOpenQR={onOpenQR}
            />
          </div>
        )}

        {/* TAB 3: QR CODE E-GATE PASS */}
        {mobileTab === 'qr' && (
          <div className="space-y-4 animate-fade-in text-center">
            {activeGateIn ? (
              <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950/70 border-2 border-pink-500/40 rounded-3xl text-left space-y-3 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono text-pink-400 font-bold">
                    THẺ VÀO CỔNG E-GATE PASS
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold rounded">
                    {activeGateIn.status}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center py-2">
                  <div className="p-3 bg-slate-950 rounded-2xl shadow-xl border-4 border-pink-500/30">
                    <div className="w-40 h-40 bg-slate-950 flex flex-col items-center justify-center text-center p-2 rounded-xl">
                      <QrCode className="w-28 h-28 text-pink-400 mb-1" />
                      <span className="text-[9px] font-mono font-bold text-white tracking-wider">
                        {activeGateIn.gateInNo}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2">
                    Quét tại trụ Check-in tự động cổng Depot
                  </span>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Container:</span>
                    <span className="font-mono font-bold text-white">{activeGateIn.containerNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Xe đầu kéo:</span>
                    <span className="font-mono font-bold text-amber-300">{activeGateIn.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lịch hẹn:</span>
                    <span className="font-mono font-bold text-emerald-400">{activeGateIn.appointmentTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Depot:</span>
                    <span className="text-slate-200">{activeGateIn.depot}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => alert(`Đã lưu ảnh QR ${activeGateIn.gateInNo} vào thư viện ảnh!`)}
                    className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Lưu QR</span>
                  </button>
                  <button
                    onClick={() => alert(`Đã tạo liên kết chia sẻ Zalo cho SĐT ${activeGateIn.driverPhone}`)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Chia Sẻ</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-xs">Chưa có mã QR nào. Vui lòng bấm Đăng Ký Gate-In trước khi đến Depot.</p>
                <button
                  onClick={() => setMobileTab('gatein')}
                  className="px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl"
                >
                  Đăng Ký Gate-In Ngay
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HISTORY */}
        {mobileTab === 'history' && (
          <div className="space-y-3 animate-fade-in">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-pink-400" />
              <span>LỊCH SỬ GATE-IN CỦA TÔI ({myGateIns.length})</span>
            </h3>

            <div className="space-y-2.5">
              {myGateIns.map((g) => (
                <div
                  key={g.id}
                  className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-pink-400 text-xs">{g.gateInNo}</span>
                    <span className="px-2 py-0.5 bg-slate-950 text-emerald-300 border border-slate-800 text-[10px] font-mono font-bold rounded">
                      {g.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cont:</span>
                    <span className="font-mono font-bold text-white">{g.containerNo} ({g.size})</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Thời gian hẹn:</span>
                    <span className="font-mono text-amber-300 font-bold">{g.appointmentTime} ({g.appointmentDate})</span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onOpenQR(g)}
                      className="px-2.5 py-1.5 bg-pink-600/20 text-pink-300 text-[11px] font-bold rounded-lg border border-pink-500/30 flex items-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Xem QR</span>
                    </button>
                    <button
                      onClick={() => onViewDetail(g)}
                      className="px-2.5 py-1.5 bg-slate-800 text-slate-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi Tiết</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACCOUNT */}
        {mobileTab === 'account' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-pink-600/30">
                {driver.fullName.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-sm font-bold text-white">{driver.fullName}</h3>
              <p className="text-[11px] text-slate-400 font-mono">Tài khoản: {driver.username || driver.phone}</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Mã tài xế:</span>
                <span className="font-mono font-bold text-pink-400">{driver.driverCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Số GPLX:</span>
                <span className="font-mono font-bold text-white">{driver.licenseNumber} (Hạng {driver.licenseGrade})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Số CCCD:</span>
                <span className="font-mono text-slate-300">{driver.citizenId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Xe phụ trách:</span>
                <span className="font-mono font-bold text-amber-300">{driver.assignedVehiclePlate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Doanh nghiệp:</span>
                <span className="font-bold text-white truncate max-w-[160px]">{currentCustomer.name}</span>
              </div>
            </div>

            <button
              onClick={() => alert('Đã yêu cầu cấp lại mã PIN / Mật khẩu đăng nhập qua tin nhắn SMS!')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Đổi Mật Khẩu Đăng Nhập</span>
            </button>
          </div>
        )}

      </div>

      {/* Mobile Bottom Navigation (Section 15) */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around z-20">
        {[
          { key: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
          { key: 'gatein', label: 'Gate-In', icon: <Plus className="w-4 h-4" /> },
          { key: 'qr', label: 'QR Pass', icon: <QrCode className="w-4 h-4" /> },
          { key: 'history', label: 'Lịch Sử', icon: <Clock className="w-4 h-4" /> },
          { key: 'account', label: 'Tài Khoản', icon: <User className="w-4 h-4" /> }
        ].map((btn) => {
          const isActive = mobileTab === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => {
                setMobileTab(btn.key as any);
                if (btn.key !== 'gatein') setIsWizardActive(false);
              }}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition cursor-pointer ${
                isActive ? 'text-pink-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {btn.icon}
              <span className="text-[10px]">{btn.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
