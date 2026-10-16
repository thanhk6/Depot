import React from 'react';
import { Droplets, RefreshCw, AlertTriangle, Receipt } from 'lucide-react';
import type { CleaningRecordDto } from '../../../api/cleaning.api';
import { formatDateTime } from '../../../utils/format';

interface CleaningWatchTableProps {
  records: CleaningRecordDto[];
  /** Lệnh vệ sinh đã bàn giao Khai thác mà container chưa có phiếu dịch vụ. */
  handedOver: CleaningRecordDto[];
  onCreateOrder: (record: CleaningRecordDto) => void;
  isLoading: boolean;
  loadError: string | null;
  lastLoadedAt: Date | null;
  onRefresh: () => void;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING_CLEANING: { label: 'Chờ vệ sinh', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  IN_CLEANING: { label: 'Đang vệ sinh', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  CLEANED: { label: 'Xong · chờ bàn giao', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
};

const formatWait = (minutes: number) => {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h} giờ ${minutes % 60} phút`;
  return `${Math.floor(h / 24)} ngày ${h % 24} giờ`;
};

// Khai thác theo dõi Tổ Vệ Sinh: phần lệnh chưa bàn giao CHỈ XEM để đôn đốc (tiếp nhận / đánh dấu xong / bàn
// giao vẫn do Tổ Vệ Sinh làm ở màn Vệ Sinh); phần đã bàn giao chờ Khai thác lập phiếu dịch vụ.
export const CleaningWatchTable: React.FC<CleaningWatchTableProps> = ({ records, handedOver, onCreateOrder, isLoading, loadError, lastLoadedAt, onRefresh }) => {
  const now = Date.now();
  const rows = records
    .map((r) => {
      const receivedAt = r.createdAt || r.beforePhotoTimestamp || null;
      const waitMinutes = receivedAt ? Math.max(0, Math.floor((now - new Date(receivedAt).getTime()) / 60000)) : 0;
      const estimatedMinutes = r.items.reduce((sum, i) => sum + (i.estimatedDurationMin || 0), 0);
      const done = r.items.filter((i) => i.isCompleted).length;
      const overdue = r.status !== 'CLEANED' && estimatedMinutes > 0 && waitMinutes > estimatedMinutes;
      return { r, receivedAt, waitMinutes, estimatedMinutes, done, overdue };
    })
    .sort((a, b) => b.waitMinutes - a.waitMinutes);
  const overdueCount = rows.filter((x) => x.overdue).length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-cyan-600" />
          <span className="font-bold text-slate-700 uppercase tracking-wider">
            Container Chuẩn Bị / Đang Vệ Sinh ({rows.length})
          </span>
          {overdueCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
              {overdueCount} quá thời gian dự kiến
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          {lastLoadedAt && <span>Cập nhật {lastLoadedAt.toLocaleTimeString('vi-VN')} · tự làm mới mỗi phút</span>}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {loadError && <div className="p-4 text-xs font-bold text-rose-700 bg-rose-50 border-b border-rose-200">{loadError}</div>}

      {handedOver.length > 0 && (
        <div className="p-4 border-b border-slate-200 bg-emerald-50/50 space-y-2">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Đã vệ sinh xong · bàn giao Khai thác · chờ lập phiếu dịch vụ ({handedOver.length})
          </div>
          <div className="space-y-2">
            {handedOver.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 flex-wrap p-3 bg-white border border-emerald-200 rounded-xl text-xs">
                <div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{r.containerNo}</div>
                  <div className="text-[11px] text-slate-500">
                    {r.shippingLine || '—'} · {r.sizeType || '—'} · <span className="font-mono">{r.code}</span> · {r.items.map((i) => i.cleaningName).join(', ')}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">
                  Bàn giao {formatDateTime(r.handoverToOperationDate)} · {r.handoverActor || '—'}
                  <div className="font-mono font-bold text-emerald-700">{Number(r.totalCostVnd || 0).toLocaleString('vi-VN')} đ</div>
                </div>
                <button
                  type="button"
                  onClick={() => onCreateOrder(r)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Lập Phiếu Dịch Vụ</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Container</th>
              <th className="py-3 px-4">Trạng Thái</th>
              <th className="py-3 px-4">Tiến Độ Hạng Mục</th>
              <th className="py-3 px-4">Nhân Viên Vệ Sinh</th>
              <th className="py-3 px-4">Tiếp Nhận Lúc</th>
              <th className="py-3 px-4">Đã Chờ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  {isLoading ? 'Đang tải...' : 'Không có container nào đang chờ hoặc đang vệ sinh.'}
                </td>
              </tr>
            ) : (
              rows.map(({ r, receivedAt, waitMinutes, estimatedMinutes, done, overdue }) => {
                const status = STATUS_LABEL[r.status] || { label: r.status, className: 'bg-slate-100 text-slate-600 border-slate-200' };
                return (
                  <tr key={r.id} className={overdue ? 'bg-rose-50/40' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">{r.containerNo}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.shippingLine || '—'} · {r.sizeType || '—'} · <span className="font-mono">{r.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full border font-bold text-[11px] ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        {done}/{r.items.length} hạng mục
                      </div>
                      <div className="text-[11px] text-slate-500 max-w-xs truncate" title={r.items.map((i) => `${i.isCompleted ? '✓' : '•'} ${i.cleaningName}`).join('\n')}>
                        {r.items.map((i) => i.cleaningName).join(', ') || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{r.cleaningStaff || 'Chưa phân công'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{formatDateTime(receivedAt)}</td>
                    <td className="py-3 px-4">
                      <div className={`font-bold ${overdue ? 'text-rose-700' : 'text-slate-800'}`}>{formatWait(waitMinutes)}</div>
                      {estimatedMinutes > 0 && (
                        <div className={`text-[11px] flex items-center gap-1 ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                          {overdue && <AlertTriangle className="w-3 h-3" />}
                          <span>{overdue ? 'Quá hạn · ' : ''}dự kiến {formatWait(estimatedMinutes)}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
