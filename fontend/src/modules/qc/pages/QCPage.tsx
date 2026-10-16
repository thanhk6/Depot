import React, { useCallback, useEffect, useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Check,
  Search,
  Filter,
  Eye,
  Award,
  Printer,
  FileCheck,
  Camera,
  Layers,
  Wrench,
  Sparkles,
  ArrowRight,
  Clock,
  Send,
  Ship,
  FileCode,
  Mail,
  FileSpreadsheet,
  Download,
  CheckSquare,
  Square,
  Radio,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { QCInspectionRecord, QCCheckItem, ShippingLineDispatchInfo } from '../types/qc';

import { QCInspectionModal } from '../components/QCInspectionModal';
import { QCCertificateModal } from '../components/QCCertificateModal';
import { ShippingLineDispatchModal } from '../components/ShippingLineDispatchModal';
import { qcApi, shippingApi } from '../../../api';
import type { ShippingSyncLogItem } from '../../../api/shipping.api';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatDateTime } from '../../../utils/format';
import { useDepot } from '../../../context/DepotContext';

interface QCPageProps {
  containers: ContainerRecord[];
  onQCResult: (containerId: string, result: 'PASS' | 'FAIL', comments: string) => void;
  onNavigateTab: (tabId: string) => void;
}

// Bước QC của 1 container theo dữ liệu thật: đang QC_PENDING (sửa xong, chờ nghiệm thu) hoặc kết quả QC gần nhất
// trong nhật ký (QC_PASSED / QC_FAILED). null = container không thuộc phân hệ QC.
const qcStageOf = (c: ContainerRecord): 'PENDING' | 'PASS' | 'FAIL' | null => {
  if (c.status === 'QC_PENDING' || c.status === 'WAITING_QC') return 'PENDING';
  const last = (c.timeline || []).filter((t) => t.status === 'QC_PASSED' || t.status === 'QC_FAILED')
    .sort((a, b) => (Date.parse(a.time) || 0) - (Date.parse(b.time) || 0)).pop();
  return last ? (last.status === 'QC_PASSED' ? 'PASS' : 'FAIL') : null;
};

export const QCPage: React.FC<QCPageProps> = ({
  containers: allContainers,
  onQCResult,
  onNavigateTab
}) => {
  const { loggedInUserProfile, showToast } = useDepot();

  // Báo hãng tàu "sửa xong · QC đạt" qua API thật (sự kiện QC_PASSED). Trạng thái gửi lấy từ nhật ký
  // ShippingSyncLogs trong DB (trước đây chỉ nằm trong state trình duyệt, F5 là mất).
  const [qcSyncLogs, setQcSyncLogs] = useState<ShippingSyncLogItem[]>([]);
  const [sendingApi, setSendingApi] = useState<Record<string, boolean>>({});
  const loadQcSyncLogs = useCallback(() => {
    shippingApi.getLogs({ take: 500 })
      .then((logs) => setQcSyncLogs(logs.filter((l) => l.eventType === 'QC_PASSED' && l.status !== 'SIMULATED')))
      .catch(() => setQcSyncLogs([]));
  }, []);
  useEffect(() => { loadQcSyncLogs(); }, [loadQcSyncLogs]);
  // Chỉ hiện nút gửi API khi hãng tàu đã cấu hình kết nối (hiện chưa có API hãng tàu nào).
  const [apiCarriers, setApiCarriers] = useState<Set<string>>(new Set());
  useEffect(() => {
    shippingApi.getCarriers()
      .then((list) => setApiCarriers(new Set(list.filter((x) => x.configured && x.enabled).map((x) => x.carrierCode.toUpperCase()))))
      .catch(() => setApiCarriers(new Set()));
  }, []);

  /** Lần gửi gần nhất SAU lần QC đạt gần nhất của container (QC lại thì phải báo lại). */
  const apiDispatchOf = (c: ContainerRecord): ShippingSyncLogItem | undefined => {
    const qcAt = (c.timeline || []).filter((t) => t.status === 'QC_PASSED')
      .reduce((m, t) => Math.max(m, Date.parse(t.time) || 0), 0);
    return qcSyncLogs
      .filter((l) => String(l.depotJobId) === c.id && (Date.parse(l.syncedAt) || 0) >= qcAt - 1000)
      .sort((a, b) => (Date.parse(a.syncedAt) || 0) - (Date.parse(b.syncedAt) || 0))
      .pop();
  };

  const handleReportRepairDone = async (c: ContainerRecord) => {
    setSendingApi((prev) => ({ ...prev, [c.id]: true }));
    try {
      const res: any = await shippingApi.syncJob(c.id, '', 'QC_PASSED');
      const ack = res?.data?.ackToken;
      showToast(`Đã báo hãng tàu ${c.shippingLine} container ${c.containerNo} sửa xong, QC đạt (HTTP ${res?.data?.httpStatusCode})${ack ? ` — mã xác nhận: ${ack}` : ''}.`, 'success', 'Gửi API hãng tàu');
    } catch (error) {
      showToast(`${c.containerNo}: ${getApiErrorMessage(error, 'Không gửi được tới hãng tàu.')}`, 'error', 'Gửi API hãng tàu thất bại');
    } finally {
      setSendingApi((prev) => ({ ...prev, [c.id]: false }));
      loadQcSyncLogs();
    }
  };
  // Chỉ container thuộc bước QC — trước đây mọi container (kể cả đang báo giá / giám định) đều được gán mặc định
  // "chờ QC" nên hiện hết ở màn này.
  const containers = React.useMemo(() => allContainers.filter((c) => qcStageOf(c) !== null), [allContainers]);
  const [activeStatusTab, setActiveStatusTab] = useState<
    'ALL' | 'WAITING_QC' | 'PASSED' | 'SHIPPING_DISPATCH' | 'FAILED'
  >('WAITING_QC');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedShippingLine, setSelectedShippingLine] = useState('ALL');
  const [dispatchFilter, setDispatchFilter] = useState<'ALL' | 'PENDING' | 'TRANSMITTED'>('ALL');

  // Multi-selection for bulk transmission
  const [selectedContainerIds, setSelectedContainerIds] = useState<string[]>([]);

  // Active modal states
  const [inspectingRecord, setInspectingRecord] = useState<QCInspectionRecord | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<QCInspectionRecord | null>(null);
  const [dispatchModalRecords, setDispatchModalRecords] = useState<QCInspectionRecord[] | null>(null);
  const [transmissionNotice, setTransmissionNotice] = useState<string | null>(null);

  // Local QC Records Map
  const [qcRecords, setQcRecords] = useState<Record<string, QCInspectionRecord>>(() => {
    const initial: Record<string, QCInspectionRecord> = {};
    containers.forEach((c) => {
      const stage = qcStageOf(c);
      const isPassed = stage === 'PASS';
      const isWaiting = stage === 'PENDING';
      const isFailed = stage === 'FAIL';

      initial[c.id] = {
        id: `QC-REC-${c.id}`,
        containerId: c.id,
        containerNo: c.containerNo,
        isoCode: c.isoCode,
        size: c.size,
        type: c.type,
        shippingLine: c.shippingLine,
        workOrderNo: c.workOrderDetails?.workOrderNo || '',
        estimateNo: c.estimateDetails?.estimateNo || '',
        technicianName: c.workOrderDetails?.technician || '',
        yardLocation: c.yardLocation || { block: '', bay: '', row: '', tier: '' },
        repairedAt: c.workOrderDetails?.assignedAt || '',
        inspectedAt: c.qcDetails?.inspectedAt || undefined,
        inspectorName: c.qcDetails?.inspector || '',
        certificateNo: '',
        checkItems: [],
        beforePhotos: [],
        afterPhotos: [],
        qcResult: isPassed ? 'PASS' : isFailed ? 'FAIL' : isWaiting ? 'PENDING' : 'PENDING',
        inspectorComments: c.qcDetails?.comments || '',
        releasedGrade: isPassed ? 'GRADE_A' : undefined,
        shippingDispatch: undefined
      };
    });
    return initial;
  });

  // Calculate filtered list
  const filteredContainers = containers.filter((c) => {
    const record = qcRecords[c.id];
    const isWaiting = c.status === 'WAITING_QC' || record?.qcResult === 'PENDING';
    const isPassed = (c.condition === 'AV' && (c.status === 'READY_FOR_USE' || c.status === 'IN_YARD')) || record?.qcResult === 'PASS';
    const isFailed = record?.qcResult === 'FAIL';

    const matchesStatus =
      activeStatusTab === 'ALL'
        ? true
        : activeStatusTab === 'WAITING_QC'
        ? isWaiting
        : activeStatusTab === 'PASSED'
        ? isPassed
        : activeStatusTab === 'SHIPPING_DISPATCH'
        ? isPassed
        : isFailed;

    const matchesSearch =
      searchKeyword.trim() === '' ||
      c.containerNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.shippingLine.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (c.workOrderDetails?.workOrderNo || '').toLowerCase().includes(searchKeyword.toLowerCase());

    const matchesShipping =
      selectedShippingLine === 'ALL' || c.shippingLine === selectedShippingLine;

    const matchesDispatchSubfilter =
      activeStatusTab !== 'SHIPPING_DISPATCH' || dispatchFilter === 'ALL'
        ? true
        : dispatchFilter === 'PENDING'
        ? record?.shippingDispatch?.status === 'PENDING_TRANSMISSION' || !record?.shippingDispatch?.status
        : record?.shippingDispatch?.status === 'TRANSMITTED';

    return matchesStatus && matchesSearch && matchesShipping && matchesDispatchSubfilter;
  });

  // Count KPIs
  const waitingCount = containers.filter(
    (c) => c.status === 'WAITING_QC' || qcRecords[c.id]?.qcResult === 'PENDING'
  ).length;
  const passedCount = containers.filter(
    (c) => (c.condition === 'AV' && (c.status === 'READY_FOR_USE' || c.status === 'IN_YARD')) || qcRecords[c.id]?.qcResult === 'PASS'
  ).length;
  const failedCount = Object.values(qcRecords).filter((r) => r.qcResult === 'FAIL').length;
  const pendingDispatchCount = Object.values(qcRecords).filter(
    (r) => r.qcResult === 'PASS' && r.shippingDispatch?.status !== 'TRANSMITTED'
  ).length;

  const shippingLines = Array.from(new Set(containers.map((c) => c.shippingLine)));

  // Pass action
  const handlePassQC = async (
    recordId: string,
    comments: string,
    grade: 'GRADE_A' | 'GRADE_B' | 'CARGO_WORTHY',
    checkItems: QCCheckItem[]
  ) => {
    const record = Object.values(qcRecords).find((r) => r.id === recordId);
    if (!record) return;

    let response: any;
    try {
      response = await qcApi.completeQc(record.containerId, true, comments);
    } catch (error: any) {
      setTransmissionNotice(error?.message || 'Lỗi kết nối khi lưu kết quả QC ĐẠT.');
      return;
    }
    if (response?.statusCode !== 200) {
      setTransmissionNotice(response?.message || 'Backend không thể lưu kết quả QC ĐẠT.');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setQcRecords((prev) => ({
      ...prev,
      [record.containerId]: {
        ...record,
        qcResult: 'PASS',
        inspectedAt: now,
        inspectorComments: comments,
        releasedGrade: grade,
        checkItems,
        shippingDispatch: {
          status: 'PENDING_TRANSMISSION',
          recipientEmail: ''
        }
      }
    }));

    onQCResult(record.containerId, 'PASS', comments);

    setTransmissionNotice(
      `Đã nghiệm thu ĐẠT container ${record.containerNo} (${grade}). Container đã được thêm vào danh sách sẵn sàng gửi qua hãng tàu ${record.shippingLine}!`
    );
    setTimeout(() => setTransmissionNotice(null), 6000);
  };

  // Fail action
  const handleFailQC = async (
    recordId: string,
    reworkReason: string,
    comments: string,
    checkItems: QCCheckItem[],
    failPhotos?: { url: string; label: string; location: string; timestamp?: string }[],
    requirePhotoRetake?: boolean
  ) => {
    const record = Object.values(qcRecords).find((r) => r.id === recordId);
    if (!record) return;

    let response: any;
    try {
      response = await qcApi.completeQc(record.containerId, false, `${reworkReason}\n${comments}`);
    } catch (error: any) {
      setTransmissionNotice(error?.message || 'Lỗi kết nối khi lưu kết quả QC KHÔNG ĐẠT.');
      return;
    }
    if (response?.statusCode !== 200) {
      setTransmissionNotice(response?.message || 'Backend không thể lưu kết quả QC KHÔNG ĐẠT.');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setQcRecords((prev) => ({
      ...prev,
      [record.containerId]: {
        ...record,
        qcResult: 'FAIL',
        inspectedAt: now,
        reworkReason,
        inspectorComments: comments,
        checkItems,
        failPhotos: failPhotos || record.failPhotos,
        requirePhotoRetake: requirePhotoRetake !== undefined ? requirePhotoRetake : true,
        shippingDispatch: undefined
      }
    }));

    onQCResult(record.containerId, 'FAIL', reworkReason);
  };

  // Confirm Dispatch Transmission
  const handleConfirmDispatch = (
    recordIds: string[],
    dispatchInfo: Partial<ShippingLineDispatchInfo>
  ) => {
    setQcRecords((prev) => {
      const next = { ...prev };
      recordIds.forEach((id) => {
        const record = Object.values(next).find((r) => r.id === id);
        if (record) {
          next[record.containerId] = {
            ...record,
            shippingDispatch: {
              status: 'TRANSMITTED',
              transmittedAt: dispatchInfo.transmittedAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
              transmittedMethod: dispatchInfo.transmittedMethod || 'EDI_WESTIM',
              transmissionRefNo: dispatchInfo.transmissionRefNo || `TX-${Date.now().toString().slice(-6)}`,
              recipientEmail: dispatchInfo.recipientEmail || record.shippingDispatch?.recipientEmail,
              notes: dispatchInfo.notes,
              ediContent: dispatchInfo.ediContent
            }
          };
        }
      });
      return next;
    });

    setSelectedContainerIds([]);
    setTransmissionNotice(
      `Đã truyền thành công dữ liệu nghiệm thu & bộ ảnh của ${recordIds.length} container cho hãng tàu (${dispatchInfo.transmittedMethod || 'EDI WESTIM'})!`
    );
    setTimeout(() => setTransmissionNotice(null), 6000);
  };

  // Toggle selection
  const toggleSelectContainer = (containerId: string) => {
    setSelectedContainerIds((prev) =>
      prev.includes(containerId) ? prev.filter((id) => id !== containerId) : [...prev, containerId]
    );
  };

  // Select all visible passed containers
  const toggleSelectAll = () => {
    const passedVisibleIds = filteredContainers
      .filter((c) => qcRecords[c.id]?.qcResult === 'PASS' || c.condition === 'AV')
      .map((c) => c.id);

    if (selectedContainerIds.length === passedVisibleIds.length && passedVisibleIds.length > 0) {
      setSelectedContainerIds([]);
    } else {
      setSelectedContainerIds(passedVisibleIds);
    }
  };

  // Trigger dispatch modal for selected items
  const handleOpenBulkDispatch = () => {
    const recordsToDispatch = selectedContainerIds
      .map((id) => qcRecords[id])
      .filter((r): r is QCInspectionRecord => Boolean(r));

    if (recordsToDispatch.length > 0) {
      setDispatchModalRecords(recordsToDispatch);
    }
  };

  // Trigger dispatch modal for a single record
  const handleOpenSingleDispatch = (record: QCInspectionRecord) => {
    setDispatchModalRecords([record]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16">
      {/* Top Banner Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-purple-50 border border-purple-200 text-purple-600 rounded-2xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-wide">
                9. KỸ THUẬT QC NGHIỆM THU &amp; TRUYỀN HÃNG TÀU (QUALITY CONTROL &amp; DISPATCH)
              </h2>
              <span className="px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-mono font-bold rounded-lg">
                IICL-6 / WESTIM EDI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Nghiệm thu 7 điểm kỹ thuật &rarr; Đạt chuẩn AV &rarr; Tự động tổng hợp danh sách truyền điện EDI WESTIM, Email biên bản &amp; bộ ảnh hoàn thành cho Hãng tàu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('repair')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
          >
            <Wrench className="w-4 h-4 text-amber-600" />
            <span>&larr; Lệnh Sửa Chữa (Bước 8)</span>
          </button>
          <button
            onClick={() => onNavigateTab('shipping_api')}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow "
          >
            <Radio className="w-4 h-4 text-sky-200" />
            <span>Cổng Truyền API Hãng Tàu (Bước 10) &rarr;</span>
          </button>
        </div>
      </div>

      {/* Floating Transmission Toast Notification */}
      {transmissionNotice && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between text-xs text-emerald-200 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{transmissionNotice}</span>
          </div>
          <button
            onClick={() => setTransmissionNotice(null)}
            className="text-emerald-600 hover:text-slate-900 p-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveStatusTab('WAITING_QC')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'WAITING_QC'
              ? 'bg-purple-50 border-purple-500 shadow-md '
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
              Chờ QC Nghiệm Thu
            </span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono mt-1">{waitingCount}</div>
          <span className="text-[10px] text-slate-500">Đã sửa xong &bull; Đầy đủ ảnh After</span>
        </div>

        <div
          onClick={() => setActiveStatusTab('PASSED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'PASSED'
              ? 'bg-emerald-50 border-emerald-500 shadow-md '
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              QC Đã Đạt (Cấp Vỏ AV)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{passedCount}</div>
          <span className="text-[10px] text-slate-500">Đã cấp chứng chỉ &bull; Sẵn sàng cấp trả</span>
        </div>

        <div
          onClick={() => setActiveStatusTab('SHIPPING_DISPATCH')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'SHIPPING_DISPATCH'
              ? 'bg-blue-50 border-blue-500 shadow-md '
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              Danh Sách Gửi Hãng Tàu
            </span>
            <Ship className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600 font-mono">{passedCount}</span>
            {pendingDispatchCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                {pendingDispatchCount} chưa gửi
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500">Truyền EDI WESTIM / Email / API</span>
        </div>

        <div
          onClick={() => setActiveStatusTab('FAILED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'FAILED'
              ? 'bg-rose-50 border-rose-500 shadow-md '
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Không Đạt (Sửa Lại)
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">{failedCount}</div>
          <span className="text-[10px] text-slate-500">Trả về xưởng cơ khí làm lại</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'WAITING_QC', label: `Chờ QC Nghiệm Thu (${waitingCount})` },
            { id: 'PASSED', label: `QC Đạt Chuẩn AV (${passedCount})` },
            {
              id: 'SHIPPING_DISPATCH',
              label: `🚢 Danh Sách Gửi Hãng Tàu (${passedCount})`,
              badge: pendingDispatchCount > 0 ? `${pendingDispatchCount} chờ truyền` : 'Đầy đủ'
            },
            { id: 'FAILED', label: `QC Không Đạt (${failedCount})` },
            { id: 'ALL', label: `Tất Cả (${containers.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeStatusTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md '
                  : 'bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    activeStatusTab === tab.id ? 'bg-white/20 text-slate-900' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sub-filter if in SHIPPING_DISPATCH view */}
        {activeStatusTab === 'SHIPPING_DISPATCH' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-blue-200">Lọc Trạng Thái Truyền Dữ Liệu:</span>
              <div className="flex items-center gap-1.5 ml-2">
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'PENDING', label: `Chưa truyền hãng tàu (${pendingDispatchCount})` },
                  { id: 'TRANSMITTED', label: `Đã truyền EDI / Email (${passedCount - pendingDispatchCount})` }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDispatchFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      dispatchFilter === f.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-500 text-[11px] font-mono">
              Chuẩn EDI: <strong>WESTIM / CODECO D.00B</strong>
            </span>
          </div>
        )}

        {/* Search row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo Container No, Work Order No, Hãng tàu..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedShippingLine}
              onChange={(e) => setSelectedShippingLine(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none"
            >
              <option value="ALL">Tất cả Hãng Tàu</option>
              {shippingLines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar for Dispatch when containers are selected */}
      {selectedContainerIds.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-950 to-purple-950 border-2 border-blue-500 rounded-3xl flex items-center justify-between flex-wrap gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">
                Đang chọn {selectedContainerIds.length} container đã nghiệm thu ĐẠT
              </span>
              <p className="text-[11px] text-blue-200">
                Sẵn sàng kết xuất bản tin EDI WESTIM / Email báo cáo gửi đồng loạt cho hãng tàu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedContainerIds([])}
              className="px-3.5 py-2 bg-white hover:bg-white text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              Bỏ Chọn
            </button>

            <button
              onClick={handleOpenBulkDispatch}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg  transition flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>GỬI QUA HÃNG TÀU ({selectedContainerIds.length} CONT)</span>
            </button>
          </div>
        </div>
      )}

      {/* QC Containers Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              Danh Sách Container ({filteredContainers.length})
            </span>
            {(activeStatusTab === 'PASSED' || activeStatusTab === 'SHIPPING_DISPATCH') && (
              <button
                onClick={toggleSelectAll}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Chọn tất cả ({filteredContainers.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {(activeStatusTab === 'PASSED' || activeStatusTab === 'SHIPPING_DISPATCH') && (
              <button
                onClick={() => {
                  const passed = filteredContainers
                    .filter((c) => qcRecords[c.id]?.qcResult === 'PASS' || c.condition === 'AV')
                    .map((c) => qcRecords[c.id])
                    .filter((r): r is QCInspectionRecord => Boolean(r));
                  if (passed.length > 0) setDispatchModalRecords(passed);
                }}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Ship className="w-3.5 h-3.5" />
                <span>Gửi Toàn Bộ Danh Sách Cho Hãng Tàu</span>
              </button>
            )}
            <span className="text-slate-500 font-mono text-[11px]">
              Giám sát viên: <strong>{loggedInUserProfile?.fullName || loggedInUserProfile?.username || '—'}</strong>
            </span>
          </div>
        </div>

        {filteredContainers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Không có container nào trong danh sách</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Khi xưởng hoàn thành các lệnh sửa chữa ở Bước 8, container sẽ tự động hiển thị tại đây để nghiệm thu và gửi cho hãng tàu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {(activeStatusTab === 'PASSED' || activeStatusTab === 'SHIPPING_DISPATCH') && (
                    <th className="p-4 w-10 text-center">
                      <span className="sr-only">Chọn</span>
                    </th>
                  )}
                  <th className="p-4">Container No &amp; Loại Vỏ</th>
                  <th className="p-4">Hãng Tàu &amp; Lệnh WO</th>
                  <th className="p-4">Vị Trí Bãi &amp; Thợ Phụ Trách</th>
                  <th className="p-4">Người QC &amp; Thời Gian</th>
                  <th className="p-4">Trạng Thái QC</th>
                  <th className="p-4">Gửi Hãng Tàu (Dispatch)</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-xs">
                {filteredContainers.map((c) => {
                  const record = qcRecords[c.id] || {
                    id: `QC-REC-${c.id}`,
                    containerId: c.id,
                    containerNo: c.containerNo,
                    isoCode: c.isoCode,
                    size: c.size,
                    type: c.type,
                    shippingLine: c.shippingLine,
                    workOrderNo: c.workOrderDetails?.workOrderNo || '',
                    estimateNo: c.estimateDetails?.estimateNo || '',
                    technicianName: c.workOrderDetails?.technician || '',
                    yardLocation: c.yardLocation || { block: '', bay: '', row: '', tier: '' },
                    repairedAt: c.workOrderDetails?.assignedAt || '',
                    inspectorName: c.qcDetails?.inspector || '',
                    certificateNo: `QC-CERT-${c.containerNo}-2026`,
                    checkItems: [],
                    beforePhotos: [],
                    afterPhotos: [],
                    qcResult: c.condition === 'AV' ? 'PASS' : c.status === 'WAITING_QC' ? 'PENDING' : 'PENDING',
                    inspectorComments: c.qcDetails?.comments || ''
                  };

                  const isPassed = record.qcResult === 'PASS' || c.condition === 'AV';
                  const isFailed = record.qcResult === 'FAIL';
                  const isWaiting = !isPassed && !isFailed;
                  const isSelected = selectedContainerIds.includes(c.id);
                  const isTransmitted = record.shippingDispatch?.status === 'TRANSMITTED';

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-850 transition duration-150 ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      {(activeStatusTab === 'PASSED' || activeStatusTab === 'SHIPPING_DISPATCH') && (
                        <td className="p-4 text-center">
                          {isPassed ? (
                            <button
                              type="button"
                              onClick={() => toggleSelectContainer(c.id)}
                              className="text-slate-500 hover:text-blue-600 transition cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-700">-</span>
                          )}
                        </td>
                      )}

                      {/* Container */}
                      <td className="p-4">
                        <div className="font-mono font-black text-slate-900 text-sm flex items-center gap-2">
                          <span>{c.containerNo}</span>
                          {record.releasedGrade && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                              {record.releasedGrade.replace('GRADE_', 'G-')}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {c.size} {c.type} ({c.isoCode})
                        </div>
                      </td>

                      {/* Line & WO */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold rounded text-[11px]">
                          {c.shippingLine}
                        </span>
                        <div className="font-mono text-[11px] text-amber-600 font-bold mt-1">
                          {record.workOrderNo}
                        </div>
                      </td>

                      {/* Location & Technician */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-700">
                          {record.yardLocation.block ? `Block ${record.yardLocation.block} - Bay ${record.yardLocation.bay} - Row ${record.yardLocation.row}` : 'Chưa hạ bãi'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Thợ: {record.technicianName || '—'}
                        </div>
                      </td>

                      {/* Người QC + thời điểm (nhật ký QC_PASSED / QC_FAILED thật) */}
                      <td className="p-4">
                        {(() => {
                          const qcLog = (c.timeline || []).filter((t) => t.status === 'QC_PASSED' || t.status === 'QC_FAILED')
                            .sort((a, b) => (Date.parse(a.time) || 0) - (Date.parse(b.time) || 0)).pop();
                          return qcLog ? (
                            <div className="space-y-0.5">
                              <div className="text-[11px] text-slate-800 font-semibold">{qcLog.actor || '—'}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{formatDateTime(qcLog.time)}</div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">Chưa nghiệm thu</span>
                          );
                        })()}
                      </td>

                      {/* QC Status */}
                      <td className="p-4">
                        {isPassed ? (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>QC ĐÃ ĐẠT (AV)</span>
                          </span>
                        ) : isFailed ? (
                          <div className="space-y-1">
                            <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>KHÔNG ĐẠT (REWORK)</span>
                            </span>
                            {record.failPhotos && record.failPhotos.length > 0 && (
                              <div className="text-[10px] text-rose-600 font-mono flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                <span>Đã chụp {record.failPhotos.length} ảnh lỗi</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            <span>CHỜ NGHIỆM THU</span>
                          </span>
                        )}
                      </td>

                      {/* Shipping Line Dispatch Status */}
                      <td className="p-4">
                        {isPassed && apiDispatchOf(c) ? (() => {
                          const log = apiDispatchOf(c)!;
                          return log.status === 'SENT' ? (
                            <div className="space-y-0.5">
                              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 font-mono">
                                <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                                <span>ĐÃ BÁO HÃNG TÀU (API)</span>
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {formatDateTime(log.syncedAt)}{log.ackToken ? ` · Ref ${log.ackToken}` : ''}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                                <XCircle className="w-3 h-3" />
                                <span>Gửi API lỗi{log.httpStatusCode ? ` (HTTP ${log.httpStatusCode})` : ''}</span>
                              </span>
                              <div className="text-[10px] text-rose-600 max-w-[180px] truncate" title={log.errorMessage || ''}>{log.errorMessage || 'Bấm gửi lại'}</div>
                            </div>
                          );
                        })() : isPassed ? (
                          isTransmitted ? (
                            <div className="space-y-0.5">
                              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 font-mono">
                                <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                                <span>ĐÃ GỬI HÃNG TÀU</span>
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {record.shippingDispatch?.transmittedMethod || 'EDI'} &bull; {record.shippingDispatch?.transmittedAt?.slice(5)}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Chờ gửi hãng tàu</span>
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono">Chưa báo hãng tàu sửa xong</div>
                            </div>
                          )
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">Chưa đủ điều kiện</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {isPassed && (
                            <>
                              {apiCarriers.has((c.shippingLine || '').toUpperCase()) && <button
                                onClick={() => handleReportRepairDone(c)}
                                disabled={!!sendingApi[c.id]}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shadow disabled:opacity-50"
                                title="Gửi API tới hãng tàu: container đã sửa xong, QC nghiệm thu đạt"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{sendingApi[c.id] ? 'Đang gửi...' : apiDispatchOf(c)?.status === 'SENT' ? 'Báo lại hãng tàu' : 'Báo hãng tàu sửa xong'}</span>
                              </button>}
                              <button
                                onClick={() => handleOpenSingleDispatch(record)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-slate-900 text-xs font-bold rounded-xl border border-blue-200 transition flex items-center gap-1 cursor-pointer shadow"
                                title="Gửi điện EDI / Email / thủ công thông báo nghiệm thu cho hãng tàu"
                              >
                                <Ship className="w-3.5 h-3.5" />
                                <span>EDI / Email</span>
                              </button>

                              <button
                                onClick={() => setViewingCertificate(record)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-emerald-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                                title="Xem & In Chứng Nhận QC"
                              >
                                <Award className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Chứng Chỉ</span>
                              </button>
                            </>
                          )}

                          {isFailed && (
                            <button
                              onClick={() => setInspectingRecord(record)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200/60 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-rose-600" />
                              <span>Xem / Chụp Lại Ảnh</span>
                            </button>
                          )}

                          <button
                            onClick={() => setInspectingRecord(record)}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow ${
                              isPassed
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                : isFailed
                                ? 'bg-rose-600 hover:bg-rose-500 text-white '
                                : 'bg-purple-600 hover:bg-purple-500 text-white '
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{isPassed ? 'Kiểm Tra Lại' : isFailed ? 'Nghiệm Thu Lại' : 'Tiến Hành Nghiệm Thu'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QC Inspection Modal */}
      {inspectingRecord && (
        <QCInspectionModal
          record={inspectingRecord}
          onPassQC={handlePassQC}
          onFailQC={handleFailQC}
          onClose={() => setInspectingRecord(null)}
        />
      )}

      {/* QC Certificate Print Modal */}
      {viewingCertificate && (
        <QCCertificateModal
          record={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}

      {/* Shipping Line Dispatch Modal */}
      {dispatchModalRecords && dispatchModalRecords.length > 0 && (
        <ShippingLineDispatchModal
          records={dispatchModalRecords}
          onConfirmDispatch={handleConfirmDispatch}
          onClose={() => setDispatchModalRecords(null)}
        />
      )}
    </div>
  );
};
