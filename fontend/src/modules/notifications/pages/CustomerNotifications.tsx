import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Search,
  Filter,
  Download,
  Send,
  CheckCircle2,
  Phone,
  MessageCircle,
  Sliders,
  Eye,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { NotificationCustomer } from '../models/notification.types';
import { notificationService } from '../services/notificationService';
import { ZaloStatusBadge } from '../components/NotificationStatus';
import { CustomerNotificationDetail } from './CustomerNotificationDetail';

interface CustomerNotificationsProps {
  onQuickSend?: (customerId: string) => void;
}

export const CustomerNotifications: React.FC<CustomerNotificationsProps> = ({ onQuickSend }) => {
  const [customers, setCustomers] = useState<NotificationCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredList = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);
      const matchType = typeFilter === 'ALL' || c.customerType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || c.zaloStatus === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [customers, searchTerm, typeFilter, statusFilter]);

  const handleExportExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Mã KH,Tên Khách Hàng,Loại KH,Người Liên Hệ,Số Điện Thoại,Email,Tài Khoản Zalo,Trạng Thái Zalo,Số Tin Đã Nhận']
        .concat(
          filteredList.map(
            (c) =>
              `${c.code},"${c.name}","${c.customerType}","${c.contactPerson}",${c.phone},"${c.email}","${c.zaloName}",${c.zaloStatus},${c.notificationCount}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_zalo_khach_hang_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If a customer is selected, show detail configuration view
  if (selectedCustomerId) {
    return (
      <CustomerNotificationDetail
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
        onQuickSend={onQuickSend}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>QUẢN LÝ THÔNG BÁO ZALO KHÁCH HÀNG & HÃNG TÀU</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết lập kịch bản thông báo tự động (Gate-In, Estimate, QC, Bốc vỏ, Công nợ) cho từng đối tác
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-sm">
        {/* Search */}
        <div className="relative sm:col-span-5">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên khách hàng, mã hãng tàu, người liên hệ, sđt..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        {/* Customer Type Filter */}
        <div className="sm:col-span-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
          >
            <option value="ALL">Tất cả loại khách hàng</option>
            <option value="SHIPPING_LINE">🚢 Hãng Tàu (Shipping Line)</option>
            <option value="TRUCKING">🚛 Nhà Xe Vận Tải (Trucking)</option>
            <option value="FORWARDER">📦 Giao Nhận (Forwarder)</option>
            <option value="CONSIGNEE">🏢 Chủ Hàng (Consignee)</option>
          </select>
        </div>

        {/* Zalo Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
          >
            <option value="ALL">Tất cả trạng thái Zalo</option>
            <option value="CONNECTED">🟢 Đã kết nối</option>
            <option value="PENDING">🟡 Chưa xác nhận</option>
            <option value="DISCONNECTED">🔴 Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Main DataGrid */}
      <div className="bg-[#0b132b] border border-slate-200 rounded-3xl p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Khách Hàng & Mã</th>
                <th className="py-3 px-3">Loại Khách Hàng</th>
                <th className="py-3 px-3">Người Liên Hệ</th>
                <th className="py-3 px-3">Số Điện Thoại</th>
                <th className="py-3 px-3">Tài Khoản Zalo</th>
                <th className="py-3 px-3">Trạng Thái Zalo</th>
                <th className="py-3 px-3">Số Thông Báo</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredList.map((cust) => (
                <tr
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className="hover:bg-slate-100 transition cursor-pointer"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 font-bold text-xs text-indigo-600 flex items-center justify-center">
                        {cust.code.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{cust.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-sky-700 border border-slate-200">
                            {cust.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">{cust.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {cust.customerType === 'SHIPPING_LINE'
                        ? 'Hãng Tàu'
                        : cust.customerType === 'TRUCKING'
                        ? 'Vận Tải'
                        : 'Forwarder'}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-700">{cust.contactPerson}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{cust.email}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700">
                    {cust.phone}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{cust.zaloName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">{cust.zaloId}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <ZaloStatusBadge status={cust.zaloStatus} />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-sky-600 text-center sm:text-left">
                    {cust.notificationCount} tin
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-slate-900 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        title="Xem chi tiết & cấu hình"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Cấu Hình</span>
                      </button>

                      <button
                        onClick={() => onQuickSend && onQuickSend(cust.id)}
                        className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-slate-900 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        title="Gửi tin Zalo"
                      >
                        <Send className="w-3 h-3" />
                        <span>Nhắn Zalo</span>
                      </button>
                    </div>
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
