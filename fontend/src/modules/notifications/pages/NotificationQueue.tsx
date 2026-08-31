import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  Search,
  Filter,
  Play,
  RotateCcw,
  Slash,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { NotificationQueueItem } from '../models/notification.types';
import { notificationService } from '../services/notificationService';
import { PriorityBadge, ChannelBadge } from '../components/NotificationStatus';

export const NotificationQueue: React.FC = () => {
  const [queueItems, setQueueItems] = useState<NotificationQueueItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingAll, setProcessingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotificationQueue({
        priority: priorityFilter,
        status: statusFilter,
        search: searchTerm
      });
      setQueueItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [priorityFilter, statusFilter, searchTerm]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRetryItem = async (id: string) => {
    await notificationService.retryQueueItem(id);
    showToast('Đang phát lệnh gửi ngay cho thông báo trong hàng đợi...');
    loadData();
  };

  const handleCancelItem = async (id: string) => {
    if (confirm('Bạn có muốn hủy thông báo này khỏi hàng đợi?')) {
      await notificationService.cancelQueueItem(id);
      showToast('Đã hủy thông báo');
      loadData();
    }
  };

  const handleProcessAll = async () => {
    setProcessingAll(true);
    try {
      const res = await notificationService.processAllQueue();
      showToast(`🎉 Đã xử lý phát toàn bộ ${res.processedCount} tin nhắn trong hàng đợi!`);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingAll(false);
    }
  };

  const pendingCount = queueItems.filter((q) => q.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-blue-400">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Batch Actions */}
      <div className="p-5 rounded-3xl bg-[#0b132b] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-pink-400" />
              <span>HÀNG ĐỢI GỬI THÔNG BÁO (NOTIFICATION QUEUE)</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-pink-950/80 text-pink-300 border border-pink-600/40">
              {pendingCount} ĐANG CHỜ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cơ chế Async Queue đệm tin nhắn khi hệ thống có tải cao hoặc cần hẹn giờ phát thông báo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleProcessAll}
            disabled={processingAll || pendingCount === 0}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-pink-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4" />
            <span>{processingAll ? 'Đang Xử Lý...' : `Phát Toàn Bộ Hàng Đợi (${pendingCount})`}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0b132b] border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="relative sm:col-span-6">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã hàng đợi, người nhận, tiêu đề, ref..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="sm:col-span-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer"
          >
            <option value="ALL">Tất cả mức ưu tiên</option>
            <option value="HIGH">🔴 HIGH Priority</option>
            <option value="NORMAL">🔵 NORMAL Priority</option>
            <option value="LOW">⚪ LOW Priority</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">🟡 PENDING (Chờ phát)</option>
            <option value="SENT">🟢 SENT (Đã gửi)</option>
            <option value="CANCELLED">⚪ CANCELLED (Đã hủy)</option>
          </select>
        </div>
      </div>

      {/* DataGrid */}
      <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Mã Hàng Đợi</th>
                <th className="py-3 px-3">Tiêu Đề Thông Báo</th>
                <th className="py-3 px-3">Người Nhận</th>
                <th className="py-3 px-3">Thời Gian Tạo</th>
                <th className="py-3 px-3">Dự Kiến Gửi</th>
                <th className="py-3 px-3">Lần Thử</th>
                <th className="py-3 px-3">Ưu Tiên</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {queueItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-sky-400 whitespace-nowrap">
                    {item.queueCode}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white truncate max-w-[220px]">
                      {item.title}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Ref: {item.entityReference || item.templateCode}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-200">{item.recipientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.recipientPhone}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {item.createdAt?.split(' ')?.[1] || item.createdAt || 'N/A'}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-amber-300 whitespace-nowrap">
                    {(item.scheduledAt || item.scheduledTime || '').split(' ')?.[1] || item.scheduledAt || item.scheduledTime || 'N/A'}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-300">
                    {item.retryCount} / {item.maxRetries || 3}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {item.status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 font-bold rounded-full border px-2.5 py-0.5 text-xs bg-amber-950/70 border-amber-500/40 text-amber-300">
                        <Clock className="w-3 h-3 animate-spin" /> PENDING
                      </span>
                    ) : item.status === 'SENT' ? (
                      <span className="inline-flex items-center gap-1.5 font-bold rounded-full border px-2.5 py-0.5 text-xs bg-emerald-950/70 border-emerald-500/40 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> SENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold rounded-full border px-2.5 py-0.5 text-xs bg-slate-800 border-slate-700 text-slate-400">
                        <Slash className="w-3 h-3" /> CANCELLED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleRetryItem(item.id)}
                            className="p-1.5 rounded-lg bg-pink-600/30 hover:bg-pink-600 text-pink-300 hover:text-white transition cursor-pointer"
                            title="Gửi ngay bây giờ"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleCancelItem(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                            title="Hủy khỏi hàng đợi"
                          >
                            <Slash className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
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
