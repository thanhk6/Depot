import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  RotateCcw,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { NotificationRecord } from '../models/notification.types';
import { notificationService } from '../services/notificationService';
import { StatusBadge, ChannelBadge, PriorityBadge } from '../components/NotificationStatus';
import { NotificationDetailDrawer } from '../components/NotificationDetailDrawer';

export const NotificationHistory: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<NotificationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [recipientFilter, setRecipientFilter] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [selectedNotif, setSelectedNotif] = useState<NotificationRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotificationHistory({
        status: statusFilter,
        channel: channelFilter,
        recipientType: recipientFilter,
        eventType: eventTypeFilter,
        search: searchTerm
      });
      setHistoryItems(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, channelFilter, recipientFilter, eventTypeFilter, searchTerm]);

  const handleOpenDetail = (item: NotificationRecord) => {
    setSelectedNotif(item);
    setIsDrawerOpen(true);
  };

  const handleResend = async (id: string) => {
    await notificationService.resendNotification(id);
    loadData();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Mã Tracking,Thời Gian,Người Nhận,Số Điện Thoại,Đối Tượng,Kênh,Tiêu Đề,Trạng Thái']
        .concat(
          historyItems.map(
            (h) =>
              `${h.trackingCode},"${h.createdAt}","${h.recipientName}",${h.recipientPhone},${h.recipientType},${h.channel},"${h.title}",${h.status}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lich_su_thong_bao_zalo_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination calculation
  const totalPages = Math.ceil(historyItems.length / pageSize) || 1;
  const paginatedItems = historyItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-[#0b132b] border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>LỊCH SỬ GỬI THÔNG BÁO (AUDIT LOGS)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Toàn bộ nhật ký các thông báo Zalo OA, ZNS, In-App và SMS gửi từ hệ thống EMR
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất Báo Cáo CSV</span>
        </button>
      </div>

      {/* Comprehensive Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0b132b] border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="relative sm:col-span-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã tracking, người nhận, sđt, cont..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SENT">🟢 SENT (Thành công)</option>
            <option value="PENDING">🟡 PENDING (Chờ gửi)</option>
            <option value="FAILED">🔴 FAILED (Thất bại)</option>
          </select>
        </div>

        {/* Channel Filter */}
        <div className="sm:col-span-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả kênh</option>
            <option value="ZALO_OA">Zalo OA</option>
            <option value="ZALO_ZNS">Zalo ZNS</option>
            <option value="IN_APP">In-App</option>
            <option value="SMS">SMS</option>
          </select>
        </div>

        {/* Audience Filter */}
        <div className="sm:col-span-2">
          <select
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả đối tượng</option>
            <option value="CUSTOMER">Khách Hàng</option>
            <option value="EMPLOYEE">Nhân Viên</option>
          </select>
        </div>

        {/* Event Type Filter */}
        <div className="sm:col-span-2">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả nghiệp vụ</option>
            <option value="GATE_IN_COMPLETED">Gate-In</option>
            <option value="INSPECTION_COMPLETED">Inspection</option>
            <option value="ESTIMATE_APPROVED">Estimate Approved</option>
            <option value="WORK_ORDER_CREATED">Work Order</option>
            <option value="MATERIAL_ISSUED">Material (Kho)</option>
            <option value="QC_PASSED">QC Passed</option>
            <option value="GATE_OUT_READY">Gate-Out</option>
          </select>
        </div>
      </div>

      {/* Main DataGrid Table */}
      <div className="bg-[#0b132b] border border-slate-200 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs text-slate-500">
          <span>
            Tìm thấy <strong className="text-sky-600 font-mono">{historyItems.length}</strong> kết quả
          </span>
          <span>Trang {currentPage} / {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Thời Gian Gửi</th>
                <th className="py-3 px-3">Mã Thông Báo</th>
                <th className="py-3 px-3">Người Nhận</th>
                <th className="py-3 px-3">Đối Tượng</th>
                <th className="py-3 px-3">Kênh</th>
                <th className="py-3 px-3">Tiêu Đề / Nội Dung</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="hover:bg-slate-100 transition cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {item.createdAt}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-sky-600 whitespace-nowrap">
                    {item.trackingCode}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{item.recipientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.recipientPhone}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {item.recipientType === 'EMPLOYEE' ? 'Nhân Viên' : 'Khách Hàng'}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <ChannelBadge channel={item.channel} />
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-700 truncate max-w-[240px]">
                      {item.title}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate max-w-[240px]">
                      {item.content}
                    </p>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {item.status === 'FAILED' && (
                        <button
                          onClick={() => handleResend(item.id)}
                          className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-800 text-rose-700 hover:text-slate-900 transition cursor-pointer"
                          title="Gửi lại ngay"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-xl bg-slate-100 disabled:opacity-40 text-slate-700 font-bold transition cursor-pointer"
          >
            Trang trước
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentPage === num
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-xl bg-slate-100 disabled:opacity-40 text-slate-700 font-bold transition cursor-pointer"
          >
            Trang kế
          </button>
        </div>
      </div>

      {/* Detail Drawer */}
      <NotificationDetailDrawer
        notification={selectedNotif}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onResend={handleResend}
      />
    </div>
  );
};
