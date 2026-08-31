import React from 'react';
import { CustomerCompany, CustomerActivityLog } from '../types/customerTypes';
import {
  Users,
  UserCheck,
  Truck,
  Box,
  LogIn,
  CreditCard,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Info
} from 'lucide-react';

interface TabOverviewProps {
  customer: CustomerCompany;
  activityLogs: CustomerActivityLog[];
  onNavigateTab: (tabKey: 'accounts' | 'drivers' | 'vehicles') => void;
}

export const TabOverview: React.FC<TabOverviewProps> = ({
  customer,
  activityLogs,
  onNavigateTab
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const debtPercent = Math.min(100, Math.round((customer.currentDebt / customer.creditLimit) * 100));

  return (
    <div className="space-y-6">
      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Số tài khoản */}
        <div
          onClick={() => onNavigateTab('accounts')}
          className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Tài Khoản Portal</span>
            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{customer.userCount}</span>
            <span className="text-[11px] text-blue-400 font-medium">user</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Quản trị & điều phối viên</p>
        </div>

        {/* Số tài xế */}
        <div
          onClick={() => onNavigateTab('drivers')}
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 p-4 rounded-2xl transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Đội Tài Xế</span>
            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{customer.driverCount}</span>
            <span className="text-[11px] text-purple-400 font-medium">tài xế</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Đã cấp hồ sơ GPLX</p>
        </div>

        {/* Số phương tiện */}
        <div
          onClick={() => onNavigateTab('vehicles')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Phương Tiện</span>
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{customer.vehicleCount}</span>
            <span className="text-[11px] text-amber-400 font-medium">xe / moóc</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Đầu kéo & Rơ-moóc</p>
        </div>

        {/* Số container */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Container Tại Bãi</span>
            <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{customer.containerCount}</span>
            <span className="text-[11px] text-sky-400 font-medium">TEU</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Tồn bãi hiện tại</p>
        </div>

        {/* Số Gate-In */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Lượt Gate-In</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{customer.gateInCount}</span>
            <span className="text-[11px] text-emerald-400 font-medium">lượt</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Tổng tích lũy khai thác</p>
        </div>
      </div>

      {/* Grid: Thông tin chi tiết & Hạn mức tín dụng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 & 2: Thông tin doanh nghiệp & Pháp lý */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin công ty & Pháp lý */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Hồ Sơ Doanh Nghiệp & Pháp Lý</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Tên đầy đủ công ty</span>
                <span className="font-bold text-white mt-0.5 block">{customer.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tên viết tắt / Thương hiệu</span>
                <span className="font-bold text-blue-400 mt-0.5 block">{customer.shortName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mã số thuế (MST)</span>
                <span className="font-mono font-bold text-slate-200 mt-0.5 block">{customer.taxCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Số điện thoại tổng đài</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{customer.phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Địa chỉ trụ sở chính</span>
                <span className="text-slate-200 mt-0.5 block">{customer.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email liên hệ chính thức</span>
                <span className="text-slate-200 mt-0.5 block font-mono">{customer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ngày tạo hồ sơ</span>
                <span className="text-slate-300 font-mono mt-0.5 block">{customer.createdAt}</span>
              </div>
            </div>

            {/* Thông tin người liên hệ đại diện */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Đầu Mối Liên Hệ Trực Tiếp (Key Contact Person)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Họ và tên</span>
                  <span className="font-bold text-white text-xs">{customer.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Số điện thoại</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">{customer.contactPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Email làm việc</span>
                  <span className="font-mono text-slate-300 text-xs">{customer.contactEmail}</span>
                </div>
              </div>
            </div>

            {/* Ghi chú nghiệp vụ Depot */}
            {customer.notes && (
              <div className="mt-4 p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-blue-300 block">Ghi chú nghiệp vụ nội bộ Depot:</span>
                  <p className="text-xs text-slate-300 mt-0.5">{customer.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cột 3: Chính sách tín dụng & Công nợ */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Chính Sách Tín Dụng & Công Nợ</span>
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Hạn mức tín dụng được duyệt</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {formatCurrency(customer.creditLimit)}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Dư nợ hiện tại:</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(customer.currentDebt)}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      debtPercent > 80 ? 'bg-rose-500' : debtPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${debtPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Đã sử dụng: <strong className="text-white">{debtPercent}%</strong></span>
                  <span>Còn lại: <strong className="text-emerald-400">{formatCurrency(customer.creditLimit - customer.currentDebt)}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">Kỳ hạn thanh toán:</span>
                <span className="font-bold text-white font-mono">{customer.paymentTermDays} ngày</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">Trạng thái phát lệnh:</span>
                {customer.status === 'ACTIVE' ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Được phép tạo Gate-In
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Bị khóa tạo lệnh
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nhật ký hoạt động nhanh */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Nhật Ký Quản Trị</span>
            </h3>

            <div className="space-y-3">
              {activityLogs.filter((l) => l.customerId === customer.id).length > 0 ? (
                activityLogs
                  .filter((l) => l.customerId === customer.id)
                  .map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{log.action}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{log.details}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">Bởi: {log.performedBy}</span>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">Chưa có bản ghi hoạt động nào</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
