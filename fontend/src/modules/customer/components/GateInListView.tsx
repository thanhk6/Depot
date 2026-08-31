import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  QrCode,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ChevronRight,
  Truck,
  RotateCcw,
  Calendar,
  Building2
} from 'lucide-react';
import { GateInRegistration, GateInStatus, CustomerCompany } from '../types/customerPortal';

interface GateInListViewProps {
  currentCustomer: CustomerCompany;
  gateIns: GateInRegistration[];
  onAddNew: () => void;
  onViewDetail: (gateIn: GateInRegistration) => void;
  onOpenQR: (gateIn: GateInRegistration) => void;
  onCancelGateIn?: (gateInId: string) => void;
}

export const GateInListView: React.FC<GateInListViewProps> = ({
  currentCustomer,
  gateIns,
  onAddNew,
  onViewDetail,
  onOpenQR,
  onCancelGateIn
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter gate-ins for the current customer
  const customerGateIns = gateIns.filter((g) => g.customerId === currentCustomer.id);

  const filteredGateIns = customerGateIns.filter((g) => {
    const matchesSearch =
      g.gateInNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.bookingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: GateInStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold rounded">Chờ Duyệt (Pending)</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-800 text-[10px] font-mono font-bold rounded">Đã Duyệt (Confirmed)</span>;
      case 'ARRIVED':
        return <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono font-bold rounded">Đã Đến Cổng (Arrived)</span>;
      case 'INSPECTION':
        return <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold rounded animate-pulse">Giám Định (Inspection)</span>;
      case 'GATE_IN':
        return <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold rounded">Vào Bãi (Gate-In)</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold rounded">Hoàn Tất (Completed)</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold rounded">Từ Chối (Rejected)</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono font-bold rounded">Đã Hủy (Cancelled)</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded">{status}</span>;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header & Search Bar */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-pink-400" />
            <span>DANH SÁCH ĐĂNG KÝ GATE-IN ONLINE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Doanh nghiệp: <strong className="text-white">{currentCustomer.name}</strong> ({customerGateIns.length} lệnh đăng ký)
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Đăng Ký Gate-In Mới</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo mã Gate-In, số Container, Booking, tên tài xế, biển số xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Pending (Chờ duyệt)</option>
            <option value="CONFIRMED">Confirmed (Đã duyệt QR)</option>
            <option value="ARRIVED">Arrived (Đến cổng)</option>
            <option value="INSPECTION">Inspection (Giám định vỏ)</option>
            <option value="GATE_IN">Gate-In (Đang vào bãi)</option>
            <option value="COMPLETED">Completed (Hoàn thành)</option>
            <option value="REJECTED">Rejected (Bị từ chối)</option>
          </select>
        </div>
      </div>

      {/* Main Gate-In Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Mã Gate-In</th>
                <th className="px-4 py-3.5">Container &amp; ISO</th>
                <th className="px-4 py-3.5">Booking / Hãng Tàu</th>
                <th className="px-4 py-3.5">Tài Xế &amp; Xe</th>
                <th className="px-4 py-3.5">Lịch Hẹn Depot</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-4 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredGateIns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Không tìm thấy lệnh đăng ký Gate-In nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredGateIns.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-pink-400 block">{g.gateInNo}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{g.createdAt}</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-white text-sm">{g.containerNo}</div>
                      <div className="text-[10px] text-slate-400">
                        {g.size} • <span className="font-mono text-pink-300">{g.isoCode}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono text-amber-300 font-bold">{g.bookingNo}</div>
                      <div className="text-[10px] text-sky-400">{g.shippingLine}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-white font-bold">{g.driverName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Xe: <span className="text-amber-300 font-bold">{g.vehiclePlate}</span> • {g.driverPhone}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-emerald-400 font-mono font-bold">{g.appointmentTime}</div>
                      <div className="text-[10px] text-slate-400">{g.appointmentDate}</div>
                    </td>

                    <td className="px-4 py-3">{getStatusBadge(g.status)}</td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenQR(g)}
                          title="Hiển thị thẻ QR Code vào cổng"
                          className="p-1.5 bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 rounded-lg transition cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onViewDetail(g)}
                          title="Xem chi tiết tiến trình Gate-In"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
