import React, { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw, Search, ScrollText } from 'lucide-react';
import { paymentApi } from '../../../api';
import type { PaymentLogItem } from '../../../api/payment.api';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatVND, formatDateTime } from '../../../utils/format';
import { downloadFile } from '../../../utils/download';

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  VIETQR_WEBHOOK: 'VietQR (ngân hàng báo)'
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const daysAgoIso = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

interface PaymentLogTabProps {
  /** Tăng lên mỗi khi vừa thu tiền xong để tab tự tải lại. */
  refreshKey: number;
}

// Nhật ký thanh toán riêng (bảng PaymentLogs): mọi lần thu tại quầy / ngân hàng báo về, kể cả bị từ chối kèm lý do.
export const PaymentLogTab: React.FC<PaymentLogTabProps> = ({ refreshKey }) => {
  const [from, setFrom] = useState(daysAgoIso(30));
  const [to, setTo] = useState(todayIso());
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [logs, setLogs] = useState<PaymentLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // "Đến ngày" tính hết ngày đó.
      const toExclusive = to ? new Date(new Date(to).getTime() + 86400000).toISOString().slice(0, 10) : undefined;
      const data = await paymentApi.getLogs({ from: from || undefined, to: toExclusive, method: method || undefined, status: status || undefined, keyword: keyword.trim() || undefined });
      setLogs(data);
      setError(null);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Không tải được nhật ký thanh toán.'));
    } finally {
      setIsLoading(false);
    }
  }, [from, to, method, status, keyword]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const successLogs = logs.filter((l) => l.status === 'SUCCESS');
  const totalSuccess = successLogs.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  const totalByMethod = (m: string) => successLogs.filter((l) => l.method === m).reduce((sum, l) => sum + Number(l.amount || 0), 0);

  const exportCsv = () => {
    const headers = ['Thời gian', 'Kết quả', 'Hình thức', 'Container', 'Số phiếu DV', 'Số phiếu thu', 'Số tiền', 'Tổng phiếu', 'Khách đưa', 'Tiền thừa', 'Mã giao dịch', 'Người thu', 'Ghi chú', 'Lý do / thông điệp'];
    const rows = logs.map((l) => [
      formatDateTime(l.loggedAt), l.status === 'SUCCESS' ? 'Thành công' : 'Bị từ chối', METHOD_LABEL[l.method] || l.method,
      l.containerNo || '', l.serviceOrderNo || '', l.invoiceNo || '', l.amount, l.orderTotal ?? '', l.cashReceived ?? '', l.changeAmount ?? '',
      l.transactionRef || '', l.cashierName || '', l.notes || '', l.message || ''
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    downloadFile('﻿' + csv, `NhatKyThanhToan_${from || 'all'}_${to || 'all'}.csv`, 'text/csv;charset=utf-8');
  };

  const inputCls = 'px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Nhật Ký Thanh Toán ({logs.length})</h3>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="text-slate-500">Đã thu: <strong className="text-emerald-600 font-mono">{formatVND(totalSuccess)}</strong></span>
          <span className="text-slate-500">Tiền mặt: <strong className="font-mono text-slate-800">{formatVND(totalByMethod('CASH'))}</strong></span>
          <span className="text-slate-500">Chuyển khoản: <strong className="font-mono text-slate-800">{formatVND(totalByMethod('BANK_TRANSFER') + totalByMethod('VIETQR_WEBHOOK'))}</strong></span>
        </div>
      </div>

      <div className="flex items-end gap-2 flex-wrap text-xs">
        <label className="space-y-1">
          <span className="block text-slate-500">Từ ngày</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        </label>
        <label className="space-y-1">
          <span className="block text-slate-500">Đến ngày</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </label>
        <label className="space-y-1">
          <span className="block text-slate-500">Hình thức</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
            <option value="">Tất cả</option>
            <option value="CASH">Tiền mặt</option>
            <option value="BANK_TRANSFER">Chuyển khoản</option>
            <option value="VIETQR_WEBHOOK">VietQR (ngân hàng báo)</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-slate-500">Kết quả</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="">Tất cả</option>
            <option value="SUCCESS">Thành công</option>
            <option value="REJECTED">Bị từ chối</option>
          </select>
        </label>
        <label className="space-y-1 flex-1 min-w-[200px]">
          <span className="block text-slate-500">Tìm kiếm</span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void load(); }}
              placeholder="Container, số phiếu, mã giao dịch, người thu..."
              className={`${inputCls} w-full pl-8`}
            />
          </div>
        </label>
        <button
          type="button"
          onClick={() => void load()}
          disabled={isLoading}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Lọc</span>
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={logs.length === 0}
          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất CSV</span>
        </button>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
              <th className="py-3 px-3">Thời gian</th>
              <th className="py-3 px-3">Kết quả</th>
              <th className="py-3 px-3">Hình thức</th>
              <th className="py-3 px-3">Container / Phiếu</th>
              <th className="py-3 px-3 text-right">Số tiền</th>
              <th className="py-3 px-3">Khách đưa / Thừa</th>
              <th className="py-3 px-3">Mã giao dịch</th>
              <th className="py-3 px-3">Người thu</th>
              <th className="py-3 px-3">Ghi chú / Lý do</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">{isLoading ? 'Đang tải...' : 'Không có giao dịch nào trong khoảng đã chọn.'}</td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className={l.status === 'SUCCESS' ? 'hover:bg-slate-50' : 'bg-rose-50/40'}>
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{formatDateTime(l.loggedAt)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold whitespace-nowrap ${l.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {l.status === 'SUCCESS' ? 'Thành công' : 'Bị từ chối'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{METHOD_LABEL[l.method] || l.method}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-slate-900">{l.containerNo || '—'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{[l.serviceOrderNo, l.invoiceNo].filter(Boolean).join(' · ') || '—'}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">{formatVND(Number(l.amount || 0))}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {l.cashReceived != null ? `${formatVND(Number(l.cashReceived))}` : '—'}
                    {l.changeAmount != null && Number(l.changeAmount) > 0 ? <div className="text-amber-600">thừa {formatVND(Number(l.changeAmount))}</div> : null}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cyan-700">{l.transactionRef || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{l.cashierName || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs">
                    {l.status !== 'SUCCESS' && l.message && <div className="text-rose-700 font-semibold">{l.message}</div>}
                    {l.notes && <div className="truncate" title={l.notes}>{l.notes}</div>}
                    {!l.notes && l.status === 'SUCCESS' && '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
