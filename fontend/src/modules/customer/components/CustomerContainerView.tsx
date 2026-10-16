import React, { useState } from 'react';
import {
  Box,
  Search,
  Filter,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Droplets,
  Wrench,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { CustomerContainerItem, CustomerCompany } from '../types/customerPortal';

interface CustomerContainerViewProps {
  currentCustomer: CustomerCompany;
  containers: CustomerContainerItem[];
}

export const CustomerContainerView: React.FC<CustomerContainerViewProps> = ({
  currentCustomer,
  containers
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const customerContainers = containers.filter((c) => c.customerId === currentCustomer.id);

  const filteredContainers = customerContainers.filter((c) => {
    const matchesSearch =
      c.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shippingLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.bookingNo && c.bookingNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.driverName && c.driverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.licensePlate && c.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getConditionBadge = (cond: 'AV' | 'CL' | 'DM') => {
    switch (cond) {
      case 'AV':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold rounded">AV (Sẵn sàng)</span>;
      case 'CL':
        return <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-mono font-bold rounded">CL (Cần vệ sinh)</span>;
      case 'DM':
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold rounded">DM (Hư hỏng IICL)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-600" />
            <span>CONTAINER CỦA TÔI (MY CONTAINERS)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Doanh nghiệp: <strong className="text-slate-900">{currentCustomer.name}</strong> • Giám sát vị trí bãi và tình trạng kỹ thuật vỏ
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo số container, hãng tàu, booking, tài xế..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="IN_DEPOT">In Depot (Đang trong bãi)</option>
          <option value="ON_ROAD">On Road (Đang di chuyển trên đường)</option>
          <option value="AT_FACTORY">At Factory (Tại kho nhà máy)</option>
          <option value="EXPORTED">Exported (Đã xuất tàu)</option>
        </select>
      </div>

      {/* Container Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Số Container</th>
                <th className="px-4 py-3.5">Kích Cỡ &amp; ISO</th>
                <th className="px-4 py-3.5">Hãng Tàu</th>
                <th className="px-4 py-3.5">Tình Trạng Kỹ Thuật</th>
                <th className="px-4 py-3.5">Vị Trí Bãi</th>
                <th className="px-4 py-3.5">Tài Xế &amp; Xe Vận Chuyển</th>
                <th className="px-4 py-3.5">Thời Điểm Gate-In</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-medium">
              {filteredContainers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-100 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 text-sm">{c.containerNo}</td>
                  
                  <td className="px-4 py-3 text-slate-700">
                    {c.size} • <span className="font-mono text-pink-700 font-bold">{c.isoCode}</span>
                  </td>

                  <td className="px-4 py-3 font-bold text-sky-600">{c.shippingLine}</td>

                  <td className="px-4 py-3">{getConditionBadge(c.condition)}</td>

                  <td className="px-4 py-3 font-mono font-bold text-amber-700">
                    {c.yardLocation ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-pink-600" />
                        <span>{c.yardLocation}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-normal">Chưa hạ bãi</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{c.driverName || '---'}</div>
                    <div className="text-[10px] font-mono text-amber-700">{c.licensePlate || '---'}</div>
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-500">{c.gateInDate || 'Chưa ghi nhận'}</td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-mono font-bold">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
