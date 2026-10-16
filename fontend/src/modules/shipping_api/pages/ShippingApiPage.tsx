import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { shippingApi } from '../../../api';
import type { ShippingCarrierStatus, ShippingSyncLogItem } from '../../../api';
import { getApiErrorMessage } from '../../../utils/apiError';
import {
  Send,
  Radio,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code,
  Globe,
  Ship,
  Search,
  Eye,
  CheckSquare,
  Square,
  ShieldCheck,
  RefreshCw,
  Settings
} from 'lucide-react';
import { ApiLogDetailModal } from '../components/ApiLogDetailModal';
import { logStatusLabel, formatLogTime } from '../utils/shippingLog';

interface ShippingApiPageProps {
  containers: ContainerRecord[];
  onNavigateTab: (tabId: string) => void;
}

const QC_EVENT = 'QC_PASSED';

// Cổng gửi dữ liệu nghiệm thu (QC đạt) sang API hãng tàu. Trước đây toàn bộ màn là giả lập: 6 hãng gõ cứng
// luôn "CONNECTED / 200 OK ~480ms", phản hồi + mã ACK + chữ ký số do trình duyệt tự sinh, KPI "542 ms /
// 100%" gõ cứng. Giờ: danh sách hãng + trạng thái cấu hình lấy từ backend, việc gửi do backend gọi HTTP
// thật tới endpoint cấu hình trên server, nhật ký là bảng ShippingSyncLogs.
export const ShippingApiPage: React.FC<ShippingApiPageProps> = ({ containers, onNavigateTab }) => {
  const [activeMainTab, setActiveMainTab] = useState<'QUEUED' | 'LOGS' | 'CONFIGS'>('QUEUED');
  const [carrierFilter, setCarrierFilter] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [carriers, setCarriers] = useState<ShippingCarrierStatus[]>([]);
  const [logs, setLogs] = useState<ShippingSyncLogItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendingIds, setSendingIds] = useState<string[]>([]);
  const [inspectingLog, setInspectingLog] = useState<ShippingSyncLogItem | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [carrierList, logList] = await Promise.all([shippingApi.getCarriers(), shippingApi.getLogs({ take: 300 })]);
      setCarriers(carrierList);
      setLogs(logList);
      setLoadError(null);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Không tải được trạng thái kết nối hãng tàu.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 8000);
  };

  const carrierOf = useCallback(
    (shippingLine: string) => carriers.find((c) => c.carrierCode.toUpperCase() === (shippingLine || '').toUpperCase()),
    [carriers]
  );
  const isReady = (c?: ShippingCarrierStatus) => Boolean(c?.configured && c.enabled);

  // Lần gửi QC_PASSED gần nhất của mỗi hồ sơ (logs đã sắp mới nhất trước), bỏ qua bản ghi giả lập cũ.
  const lastQcLogByJob = useMemo(() => {
    const map = new Map<string, ShippingSyncLogItem>();
    for (const log of logs) {
      if (log.eventType !== QC_EVENT || log.status === 'SIMULATED') continue;
      const key = String(log.depotJobId);
      if (!map.has(key)) map.set(key, log);
    }
    return map;
  }, [logs]);

  const queue = useMemo(
    () =>
      containers.filter(
        (c) =>
          c.status !== 'GATE_OUT' &&
          (c.qcDetails?.result === 'PASS' || c.status === 'READY_FOR_USE' || c.status === 'IN_YARD' || c.condition === 'AV')
      ),
    [containers]
  );

  const filteredQueue = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return queue.filter((c) => {
      const matchCarrier = carrierFilter === 'ALL' || (c.shippingLine || '').toUpperCase() === carrierFilter;
      const matchSearch =
        !kw ||
        c.containerNo.toLowerCase().includes(kw) ||
        (c.workOrderDetails?.workOrderNo || '').toLowerCase().includes(kw) ||
        (c.estimateDetails?.estimateNo || '').toLowerCase().includes(kw);
      return matchCarrier && matchSearch;
    });
  }, [queue, carrierFilter, searchKeyword]);

  const pendingCount = queue.filter((c) => lastQcLogByJob.get(c.id)?.status !== 'SENT').length;
  const realLogs = logs.filter((l) => l.status !== 'SIMULATED');
  const sentCount = realLogs.filter((l) => l.status === 'SENT').length;
  const failedCount = realLogs.filter((l) => l.status === 'FAILED').length;
  const readyCarrierCount = carriers.filter(isReady).length;

  const sendOne = async (c: ContainerRecord): Promise<boolean> => {
    setSendingIds((prev) => [...prev, c.id]);
    try {
      const res: any = await shippingApi.syncJob(c.id, '', QC_EVENT);
      const ack = res?.data?.ackToken;
      showToast('success', `Đã gửi ${c.containerNo} tới ${c.shippingLine} (HTTP ${res?.data?.httpStatusCode})${ack ? ` — mã xác nhận: ${ack}` : ''}.`);
      return true;
    } catch (error) {
      showToast('error', `${c.containerNo}: ${getApiErrorMessage(error, 'Gửi tới hãng tàu thất bại.')}`);
      return false;
    } finally {
      setSendingIds((prev) => prev.filter((id) => id !== c.id));
    }
  };

  const handleSingleSend = async (c: ContainerRecord) => {
    await sendOne(c);
    await refresh();
  };

  // Gửi lần lượt từng container (mỗi container theo hãng tàu của chính nó), dừng báo lỗi riêng từng cái.
  const handleBulkSend = async () => {
    const targets = queue.filter((c) => selectedIds.includes(c.id) && isReady(carrierOf(c.shippingLine)));
    let ok = 0;
    for (const c of targets) if (await sendOne(c)) ok++;
    setSelectedIds([]);
    await refresh();
    showToast(ok === targets.length ? 'success' : 'error', `Đã gửi thành công ${ok}/${targets.length} container.`);
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectableIds = filteredQueue
    .filter((c) => isReady(carrierOf(c.shippingLine)) && lastQcLogByJob.get(c.id)?.status !== 'SENT')
    .map((c) => c.id);
  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === selectableIds.length && selectableIds.length > 0 ? [] : selectableIds);

  const tabButton = (id: typeof activeMainTab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveMainTab(id)}
      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
        activeMainTab === id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">10. CỔNG TRUYỀN DỮ LIỆU API HÃNG TÀU</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gửi kết quả nghiệm thu (QC đạt) tới API của hãng tàu. Endpoint + khóa API cấu hình trên server; phản hồi được lưu nguyên văn.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void refresh()}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </button>
          <button
            onClick={() => onNavigateTab('qc')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>&larr; Bước 9: Kỹ Thuật QC</span>
          </button>
          <button
            onClick={() => onNavigateTab('gate_out')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <span>Bước 11: Gate-Out &rarr;</span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`p-4 bg-white border-2 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-700 shadow-xl ${
            toast.type === 'success' ? 'border-emerald-500' : 'border-rose-500'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-bold">{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-900 p-1">&times;</button>
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold">{loadError}</div>
      )}

      {!loadError && carriers.length > 0 && readyCarrierCount === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
          <Settings className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Chưa có hãng tàu nào được cấu hình kết nối API nên chưa gửi được. Xem tab <strong>Cấu hình kết nối</strong> để biết cách khai báo
            endpoint + khóa API do hãng tàu cấp.
          </span>
        </div>
      )}

      {/* KPI — tính từ nhật ký gửi thật */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Container chờ gửi', value: pendingCount, icon: <Clock className="w-4 h-4 text-amber-600" />, color: 'text-amber-600' },
          { label: 'Lần gửi thành công', value: sentCount, icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, color: 'text-emerald-600' },
          { label: 'Lần gửi lỗi', value: failedCount, icon: <AlertCircle className="w-4 h-4 text-rose-600" />, color: 'text-rose-600' },
          { label: 'Hãng đã cấu hình API', value: `${readyCarrierCount}/${carriers.length}`, icon: <Globe className="w-4 h-4 text-blue-600" />, color: 'text-blue-600' }
        ].map((k) => (
          <div key={k.label} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{k.label}</span>
              {k.icon}
            </div>
            <div className={`text-2xl font-black font-mono ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs + filters */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabButton('QUEUED', <Ship className="w-4 h-4" />, `1. Danh sách chờ gửi (${pendingCount})`)}
          {tabButton('LOGS', <Code className="w-4 h-4" />, `2. Nhật ký gửi (${realLogs.length})`)}
          {tabButton('CONFIGS', <Globe className="w-4 h-4" />, `3. Cấu hình kết nối (${readyCarrierCount}/${carriers.length})`)}
        </div>

        {activeMainTab === 'QUEUED' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm số container, Work Order, Estimate..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none"
              >
                <option value="ALL">Tất cả hãng tàu</option>
                {carriers.map((c) => (
                  <option key={c.carrierCode} value={c.carrierCode.toUpperCase()}>
                    {c.carrierName} ({c.carrierCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: QUEUE */}
      {activeMainTab === 'QUEUED' && (
        <div className="space-y-4">
          {selectedIds.length > 0 && (
            <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-3xl flex items-center justify-between flex-wrap gap-3">
              <span className="font-bold text-slate-900 text-sm">Đã chọn {selectedIds.length} container</span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3.5 py-2 bg-white text-slate-700 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer"
                >
                  Bỏ chọn
                </button>
                <button
                  disabled={sendingIds.length > 0}
                  onClick={() => void handleBulkSend()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingIds.length > 0 ? 'Đang gửi...' : `Gửi ${selectedIds.length} container`}</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3 text-xs flex-wrap">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Container nghiệm thu đạt ({filteredQueue.length})</span>
              <button
                onClick={toggleSelectAll}
                disabled={selectableIds.length === 0}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Chọn tất cả chưa gửi</span>
              </button>
            </div>

            {filteredQueue.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Ship className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">Không có container phù hợp</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Container QC đạt ở Bước 9 sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4 w-10" />
                      <th className="p-4">Container</th>
                      <th className="p-4">Hãng tàu / Kết nối</th>
                      <th className="p-4">WO / Estimate</th>
                      <th className="p-4">Lần gửi gần nhất</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 text-xs">
                    {filteredQueue.map((c) => {
                      const carrier = carrierOf(c.shippingLine);
                      const ready = isReady(carrier);
                      const last = lastQcLogByJob.get(c.id);
                      const sending = sendingIds.includes(c.id);
                      const selectable = ready && last?.status !== 'SENT';
                      return (
                        <tr key={c.id} className={selectedIds.includes(c.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              disabled={!selectable}
                              onClick={() => toggleSelect(c.id)}
                              className="text-slate-500 hover:text-blue-600 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {selectedIds.includes(c.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="font-mono font-black text-slate-900 text-sm">{c.containerNo}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{c.size} {c.isoCode ? `(${c.isoCode})` : ''}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold rounded text-[11px]">
                              {c.shippingLine || '—'}
                            </span>
                            <div className={`text-[10px] mt-1 font-bold ${ready ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {ready ? 'Đã cấu hình API' : carrier?.configured ? 'Kết nối đang tắt' : 'Chưa cấu hình API'}
                            </div>
                          </td>
                          <td className="p-4 font-mono">
                            <div className="text-amber-600 font-bold">{c.workOrderDetails?.workOrderNo || '—'}</div>
                            <div className="text-slate-500 text-[11px]">{c.estimateDetails?.estimateNo || ''}</div>
                          </td>
                          <td className="p-4">
                            {last ? (
                              <button onClick={() => setInspectingLog(last)} className="text-left cursor-pointer">
                                <span
                                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                                    last.status === 'SENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  {logStatusLabel(last)}
                                </span>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{formatLogTime(last.syncedAt)}</div>
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Chưa gửi</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              disabled={!ready || sending}
                              title={ready ? '' : 'Hãng tàu này chưa được cấu hình kết nối API trên server'}
                              onClick={() => void handleSingleSend(c)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{sending ? 'Đang gửi...' : last?.status === 'SENT' ? 'Gửi lại' : 'Gửi'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LOGS */}
      {activeMainTab === 'LOGS' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">Chưa có lần gửi nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Container</th>
                    <th className="p-4">Hãng tàu</th>
                    <th className="p-4">Sự kiện</th>
                    <th className="p-4">Kết quả</th>
                    <th className="p-4">Độ trễ</th>
                    <th className="p-4">Mã xác nhận</th>
                    <th className="p-4">Người gửi</th>
                    <th className="p-4 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {logs.map((log) => (
                    <tr key={log.id} className={log.status === 'SIMULATED' ? 'opacity-60' : 'hover:bg-slate-50'}>
                      <td className="p-4 text-slate-500 whitespace-nowrap">{formatLogTime(log.syncedAt)}</td>
                      <td className="p-4 font-mono font-bold text-slate-900">{log.containerNo}</td>
                      <td className="p-4 font-mono">{log.carrierCode}</td>
                      <td className="p-4 font-mono text-[11px]">{log.eventType}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] border whitespace-nowrap ${
                            log.status === 'SENT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : log.status === 'SIMULATED'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {logStatusLabel(log)}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-amber-600">{log.latencyMs != null ? `${log.latencyMs} ms` : '—'}</td>
                      <td className="p-4 font-mono text-emerald-700">{log.ackToken || '—'}</td>
                      <td className="p-4 text-slate-600">{log.triggeredBy || '—'}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setInspectingLog(log)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Xem</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONFIGS (chỉ đọc — khóa bí mật không bao giờ gửi xuống trình duyệt) */}
      {activeMainTab === 'CONFIGS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {carriers.map((c) => (
              <div key={c.carrierCode} className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{c.carrierName}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">Mã: {c.carrierCode}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold border ${
                      isReady(c)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isReady(c) ? 'ĐÃ CẤU HÌNH' : c.configured ? 'ĐANG TẮT' : 'CHƯA CẤU HÌNH'}
                  </span>
                </div>
                {c.configured ? (
                  <div className="space-y-2 font-mono">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 break-all">POST {c.endpointUrl}</div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">Xác thực: <strong>{c.authType}</strong></div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">Khóa: <strong>{c.hasSecret ? 'Đã có' : 'Chưa có'}</strong></div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">Timeout: <strong>{c.timeoutSeconds}s</strong></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Chưa khai báo endpoint cho hãng này nên không gửi qua API được.</p>
                )}
              </div>
            ))}
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-3xl text-xs text-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900">Cách cấu hình (trên server backend)</h4>
            <p>
              Mỗi hãng tàu cấp endpoint và khóa API riêng theo hợp đồng EDI/M&amp;R. Khai báo trong <code>appsettings.json</code> mục{' '}
              <code>CarrierIntegrations</code> (khóa theo <strong>mã hãng tàu trong danh mục</strong>), hoặc biến môi trường
              {' '}<code>CarrierIntegrations__MÃ__EndpointUrl</code>, <code>CarrierIntegrations__MÃ__Secret</code>... rồi khởi động lại backend.
            </p>
            <pre className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] overflow-x-auto">{`"CarrierIntegrations": {
  "MSCU": {
    "EndpointUrl": "<URL hãng tàu cấp>",
    "AuthType": "BEARER",        // BEARER | API_KEY | NONE
    "ApiKeyHeader": "X-API-Key", // dùng khi AuthType = API_KEY
    "Secret": "<khóa API — nên đặt qua biến môi trường>",
    "TimeoutSeconds": 15,
    "Enabled": true
  }
}`}</pre>
          </div>
        </div>
      )}

      {inspectingLog && <ApiLogDetailModal log={inspectingLog} onClose={() => setInspectingLog(null)} />}
    </div>
  );
};
