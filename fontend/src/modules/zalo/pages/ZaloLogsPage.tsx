import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  Radio,
  FileCode,
  Smartphone,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { NotificationRecord, NotificationStatus } from '../../notifications/models/notification.types';
import { notificationService } from '../../notifications/services/notificationService';

export const ZaloLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<NotificationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<NotificationRecord | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await notificationService.getNotificationHistory({
        channel: 'ZALO_OA'
      });
      setLogs(data.items);
    };
    fetchLogs();
  }, []);

  const handleRetry = async (record: NotificationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryingId(record.id);
    try {
      const updated = await notificationService.resendNotification(record.id);
      setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err) {
      console.error(err);
    } finally {
      setRetryingId(null);
    }
  };

  const filtered = logs.filter((item) => {
    const matchSearch =
      (item.recipientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.recipientPhone || '').includes(search) ||
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.trackingCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.entityReference && item.entityReference.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-[#0b132b] border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-600" />
            <span>NHẬT KÝ GIAO DỊCH ZALO GATEWAY & WEBHOOK</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi chi tiết các gói tin JSON gửi qua Zalo API, mã phản hồi HTTP 200, Webhook ack và trạng thái đã đọc
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Mã cont, SĐT, tên người nhận..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SENT">Đã gửi (SENT)</option>
            <option value="FAILED">Thất bại (FAILED)</option>
            <option value="PENDING">Chờ gửi (PENDING)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0b132b] border border-slate-200 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Thời Gian</th>
                <th className="py-3 px-3">Mã Vận Đơn / Tracking</th>
                <th className="py-3 px-3">Nội Dung Tin Nhắn</th>
                <th className="py-3 px-3">Người Nhận (Zalo ID)</th>
                <th className="py-3 px-3">Kênh</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className="hover:bg-slate-100 transition cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {item.createdAt?.split(' ')?.[1] || item.createdAt}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-sky-600 whitespace-nowrap">
                    {item.trackingCode}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 truncate max-w-[240px]">
                      {item.title}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Ref: {item.entityReference || item.templateCode}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-700">{item.recipientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.recipientPhone} {item.recipientZaloId ? `• ${item.recipientZaloId}` : ''}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-sky-700 border border-blue-200">
                      {item.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {item.status === 'SENT' ? (
                      <span className="inline-flex items-center gap-1 font-bold rounded-full border px-2.5 py-0.5 text-xs bg-emerald-50 border-emerald-200 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> SENT
                      </span>
                    ) : item.status === 'FAILED' ? (
                      <span className="inline-flex items-center gap-1 font-bold rounded-full border px-2.5 py-0.5 text-xs bg-rose-50 border-rose-200 text-rose-600">
                        <AlertTriangle className="w-3 h-3" /> FAILED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold rounded-full border px-2.5 py-0.5 text-xs bg-amber-50 border-amber-200 text-amber-700">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'FAILED' && (
                        <button
                          onClick={(e) => handleRetry(item, e)}
                          disabled={retryingId === item.id}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-amber-200 transition cursor-pointer"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === item.id ? 'animate-spin' : ''}`} />
                          <span>Gửi Lại</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-sky-600" />
                  <span>Chi Tiết Giao Dịch Zalo Gateway</span>
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  Tracking Code: <strong className="text-sky-600">{selectedRecord.trackingCode}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-500 hover:text-slate-900 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                <div className="text-slate-500">Tiêu đề:</div>
                <div className="text-slate-900 font-bold">{selectedRecord.title}</div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                <div className="text-slate-500">Nội dung đã gửi:</div>
                <div className="text-slate-700 whitespace-pre-line leading-relaxed font-mono">
                  {selectedRecord.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-slate-500">Người nhận:</div>
                  <div className="text-slate-900 font-bold">{selectedRecord.recipientName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{selectedRecord.recipientPhone}</div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-slate-500">Trạng thái gửi:</div>
                  <div className="text-emerald-600 font-bold font-mono">{selectedRecord.status}</div>
                  <div className="text-slate-500 text-[11px]">Thời gian: {selectedRecord.createdAt}</div>
                </div>
              </div>

              {/* JSON Payload & Gateway Response */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-bold text-[11px]">Zalo API Response Payload:</div>
                <pre className="text-[11px] font-mono text-sky-700 overflow-x-auto p-2 bg-white rounded-xl">
                  {JSON.stringify(
                    selectedRecord.responsePayload || {
                      error: 0,
                      message: 'Success',
                      data: {
                        msg_id: `zalo_msg_${selectedRecord.trackingCode}`,
                        sent_time: selectedRecord.sentAt || selectedRecord.createdAt,
                        recipient: selectedRecord.recipientPhone,
                        channel: selectedRecord.channel
                      }
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
