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
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold rounded">Chờ Duyệt (Pending)</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-mono font-bold rounded">Đã Duyệt (Confirmed)</span>;
      case 'ARRIVED':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold rounded">Đã Đến Cổng (Arrived)</span>;
      case 'INSPECTION':
        return <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold rounded animate-pulse">Giám Định (Inspection)</span>;
      case 'GATE_IN':
        return <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-mono font-bold rounded">Vào Bãi (Gate-In)</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold rounded">Hoàn Tất (Completed)</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold rounded">Từ Chối (Rejected)</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-mono font-bold rounded">Đã Hủy (Cancelled)</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded">{status}</span>;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header & Search Bar */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-pink-600" />
            <span>DANH SÁCH ĐĂNG KÝ GATE-IN ONLINE</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Doanh nghiệp: <strong className="text-slate-900">{currentCustomer.name}</strong> ({customerGateIns.length} lệnh đăng ký)
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
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo mã Gate-In, số Container, Booking, tên tài xế, biển số xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-pink-500 focus:outline-none"
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
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-200/60 font-medium">
              {filteredGateIns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Không tìm thấy lệnh đăng ký Gate-In nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredGateIns.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-100 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-pink-600 block">{g.gateInNo}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{g.createdAt}</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900 text-sm">{g.containerNo}</div>
                      <div className="text-[10px] text-slate-500">
                        {g.size} • <span className="font-mono text-pink-700">{g.isoCode}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono text-amber-700 font-bold">{g.bookingNo}</div>
                      <div className="text-[10px] text-sky-600">{g.shippingLine}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-900 font-bold">{g.driverName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Xe: <span className="text-amber-700 font-bold">{g.vehiclePlate}</span> • {g.driverPhone}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-emerald-600 font-mono font-bold">{g.appointmentTime}</div>
                      <div className="text-[10px] text-slate-500">{g.appointmentDate}</div>
                    </td>

                    <td className="px-4 py-3">{getStatusBadge(g.status)}</td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenQR(g)}
                          title="Hiển thị thẻ QR Code vào cổng"
                          className="p-1.5 bg-pink-50 hover:bg-pink-50 text-pink-700 rounded-lg transition cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onViewDetail(g)}
                          title="Xem chi tiết tiến trình Gate-In"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
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
