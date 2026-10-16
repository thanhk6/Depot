import React, { useEffect, useMemo, useState } from 'react';
import { Smartphone, MessageCircle, User, Building2, Search, RotateCcw, ExternalLink } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { NotificationRecord } from '../models/notification.types';
import { getApiErrorMessage } from '../../../utils/apiError';
import { LoadErrorBanner } from '../../../components/common/LoadErrorBanner';

// "Zalo Simulator & Chat" — xem trước tin nhắn Zalo/in-app mà hệ thống ĐÃ gửi thật cho từng người nhận, hiển
// thị trong khung điện thoại. Trước đây toàn bộ màn là hội thoại gõ cứng (container, nhân viên, báo giá bịa)
// và bot trả lời theo kịch bản cố định — đã bỏ theo yêu cầu chỉ dùng dữ liệu database. Nguồn: GET /api/notifications
// (bảng NotificationRecords). Hệ thống chưa nhận tin trả lời từ Zalo nên màn này chỉ đọc.

const statusLabel: Record<string, string> = {
  SENT: 'Đã gửi', DELIVERED: 'Đã nhận', READ: 'Đã xem', FAILED: 'Lỗi', PENDING: 'Chờ gửi', CANCELLED: 'Đã huỷ'
};

const formatTime = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

export const ZaloSimulatorPage: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const [records, setRecords] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [channel, setChannel] = useState<'ALL' | 'ZALO'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setLoadError(null);
    notificationService
      .getNotificationHistory()
      .then((res) => setRecords(res.items))
      .catch((error) => setLoadError(getApiErrorMessage(error, 'Không thể tải lịch sử thông báo.')))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  // Gom tin theo người nhận thật (recipientId), mới nhất lên đầu.
  const recipients = useMemo(() => {
    const byRecipient = new Map<string, { key: string; name: string; phone: string; type: string; items: NotificationRecord[] }>();
    for (const r of records) {
      if (channel === 'ZALO' && !String(r.channel).includes('ZALO')) continue;
      const key = r.recipientId || r.recipientName || 'ALL';
      if (!byRecipient.has(key)) byRecipient.set(key, { key, name: r.recipientName || r.recipientId || 'Tất cả', phone: r.recipientPhone, type: String(r.recipientType), items: [] });
      byRecipient.get(key)!.items.push(r);
    }
    const q = search.trim().toLowerCase();
    return [...byRecipient.values()]
      .map((g) => ({ ...g, items: g.items.sort((a, b) => String(a.sentAt || a.createdAt).localeCompare(String(b.sentAt || b.createdAt))) }))
      .filter((g) => !q || g.name.toLowerCase().includes(q) || (g.phone || '').includes(q))
      .sort((a, b) => String(b.items.at(-1)?.sentAt || b.items.at(-1)?.createdAt).localeCompare(String(a.items.at(-1)?.sentAt || a.items.at(-1)?.createdAt)));
  }, [records, channel, search]);

  const selected = recipients.find((g) => g.key === selectedKey) || recipients[0];

  return (
    <div className="space-y-4">
      {loadError && <LoadErrorBanner message={loadError} onRetry={load} />}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Xem Trước Tin Nhắn Đã Gửi (Zalo / In-App)</span>
          </h2>
          <p className="text-xs text-slate-500">Tin thật trong bảng NotificationRecords, hiển thị theo từng người nhận.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as 'ALL' | 'ZALO')}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="ALL">Mọi kênh</option>
            <option value="ZALO">Chỉ Zalo</option>
          </select>
          <button
            onClick={load}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Tải lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Danh sách người nhận */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-3 space-y-2 shadow-sm">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm người nhận / số điện thoại"
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          {isLoading && <div className="py-6 text-center text-xs text-slate-500">Đang tải…</div>}
          {!isLoading && recipients.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500">Chưa có thông báo nào được gửi.</div>
          )}
          <div className="space-y-1 max-h-[520px] overflow-y-auto">
            {recipients.map((g) => (
              <button
                key={g.key}
                onClick={() => setSelectedKey(g.key)}
                className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                  selected?.key === g.key ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  {g.type === 'CUSTOMER' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-slate-900 truncate">{g.name}</span>
                  <span className="block text-[11px] text-slate-500 truncate">{g.items.at(-1)?.title}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{g.items.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Khung điện thoại */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-sm bg-slate-900 rounded-[2.5rem] p-3 shadow-xl">
            <div className="bg-[#E9EEF5] rounded-[2rem] overflow-hidden flex flex-col h-[600px]">
              <div className="bg-[#0068FF] text-white px-4 py-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate">{selected?.name || 'Chưa chọn người nhận'}</div>
                  <div className="text-[10px] opacity-80">{selected?.phone || '—'}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {!selected && <div className="pt-20 text-center text-xs text-slate-500">Chưa có tin nhắn.</div>}
                {selected?.items.map((m) => (
                  <div key={m.id} className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm space-y-1.5 max-w-[90%]">
                    <div className="text-xs font-bold text-slate-900">{m.title}</div>
                    <div className="text-xs text-slate-700 whitespace-pre-line break-words">{m.content}</div>
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 pt-1">
                      <span>{m.channel} • {statusLabel[String(m.status)] || m.status}</span>
                      <span>{formatTime(m.sentAt || m.createdAt)}</span>
                    </div>
                    {m.entityReference && (
                      <div className="text-[10px] font-mono text-sky-700">{m.entityReference}</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-white px-3 py-2 text-[11px] text-slate-500 text-center border-t border-slate-200">
                Chỉ xem — gửi tin mới ở màn{' '}
                <button onClick={() => onNavigateTab?.('notifications_send')} className="text-sky-700 font-semibold inline-flex items-center gap-0.5 cursor-pointer">
                  Gửi Thông Báo Mới <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
