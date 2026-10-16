import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { CustomerBooking, CustomerCompany } from '../types/customerPortal';

interface CustomerBookingViewProps {
  currentCustomer: CustomerCompany;
  bookings: CustomerBooking[];
  onRegisterGateInWithBooking: (booking: CustomerBooking) => void;
}

export const CustomerBookingView: React.FC<CustomerBookingViewProps> = ({
  currentCustomer,
  bookings,
  onRegisterGateInWithBooking
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const customerBookings = bookings.filter((b) => b.customerId === currentCustomer.id);

  const filteredBookings = customerBookings.filter((b) => {
    const matchesSearch =
      b.bookingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.shippingLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.depot.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>DANH SÁCH BOOKING CỦA TÔI (MY BOOKINGS)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Doanh nghiệp: <strong className="text-slate-900">{currentCustomer.name}</strong> • Quản lý hạn mức và số lượng cont theo từng Lệnh/Booking
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo số Booking, hãng tàu, địa điểm depot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Active (Đang hiệu lực)</option>
          <option value="COMPLETED">Completed (Đã dùng hết)</option>
          <option value="EXPIRED">Expired (Hết hạn)</option>
        </select>
      </div>

      {/* Booking Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBookings.map((b) => {
          const remaining = b.containerCount - b.usedCount;
          const percentUsed = Math.round((b.usedCount / b.containerCount) * 100);
          return (
            <div
              key={b.id}
              className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 hover:border-slate-200 transition shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold tracking-wider">
                    BOOKING LỆNH HẠ RỖNG / CẤP VỎ
                  </span>
                  <h3 className="text-base font-black text-slate-900 font-mono">{b.bookingNo}</h3>
                  <div className="text-xs text-sky-600 font-bold mt-0.5">{b.shippingLine}</div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                    b.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {b.status}
                </span>
              </div>

              {/* Specs */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Depot chỉ định:</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-600" />
                    {b.depot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kích cỡ cont:</span>
                  <span className="font-bold text-slate-900">{b.containerSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hạn hiệu lực:</span>
                  <span className="font-mono font-bold text-amber-700">{b.validUntil}</span>
                </div>
                {b.specialInstructions && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    Lưu ý hãng tàu: <span className="text-slate-700">{b.specialInstructions}</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Đã hạ / cấp bãi:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {b.usedCount} / {b.containerCount} Cont ({percentUsed}%) • Còn lại: <strong className="text-emerald-600">{remaining} Cont</strong>
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentUsed}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onRegisterGateInWithBooking(b)}
                  disabled={b.status !== 'ACTIVE' || remaining <= 0}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    b.status === 'ACTIVE' && remaining > 0
                      ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg '
                      : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Đăng Ký Gate-In Bằng Booking Này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
