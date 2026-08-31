import React, { useState } from 'react';
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
import { DEFAULT_QC_CHECKLIST } from '../data/defaultQCChecklist';
import { QCInspectionModal } from '../components/QCInspectionModal';
import { QCCertificateModal } from '../components/QCCertificateModal';
import { ShippingLineDispatchModal } from '../components/ShippingLineDispatchModal';
import { qcApi } from '../../../api';

interface QCPageProps {
  containers: ContainerRecord[];
  onQCResult: (containerId: string, result: 'PASS' | 'FAIL', comments: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const QCPage: React.FC<QCPageProps> = ({
  containers,
  onQCResult,
  onNavigateTab
}) => {
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
      const isPassed = c.condition === 'AV' && (c.qcDetails?.result === 'PASS' || c.status === 'READY_FOR_USE' || c.status === 'IN_YARD');
      const isWaiting = c.status === 'WAITING_QC';
      const isFailed = c.qcDetails?.result === 'FAIL';

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
        checkItems: DEFAULT_QC_CHECKLIST,
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

    const response: any = await qcApi.completeQc(record.containerId, true, comments);
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
          recipientEmail: `${record.shippingLine.toLowerCase().replace(/[^a-z0-9]/g, '')}.ops@shippingline.com`
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

    const response: any = await qcApi.completeQc(record.containerId, false, `${reworkReason}\n${comments}`);
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
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-2xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                9. KỸ THUẬT QC NGHIỆM THU &amp; TRUYỀN HÃNG TÀU (QUALITY CONTROL &amp; DISPATCH)
              </h2>
              <span className="px-2.5 py-0.5 bg-purple-950 border border-purple-800 text-purple-300 text-xs font-mono font-bold rounded-lg">
                IICL-6 / WESTIM EDI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nghiệm thu 7 điểm kỹ thuật &rarr; Đạt chuẩn AV &rarr; Tự động tổng hợp danh sách truyền điện EDI WESTIM, Email biên bản &amp; bộ ảnh hoàn thành cho Hãng tàu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('repair')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>&larr; Lệnh Sửa Chữa (Bước 8)</span>
          </button>
          <button
            onClick={() => onNavigateTab('shipping_api')}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow shadow-sky-950"
          >
            <Radio className="w-4 h-4 text-sky-200" />
            <span>Cổng Truyền API Hãng Tàu (Bước 10) &rarr;</span>
          </button>
        </div>
      </div>

      {/* Floating Transmission Toast Notification */}
      {transmissionNotice && (
        <div className="p-4 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl flex items-center justify-between text-xs text-emerald-200 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{transmissionNotice}</span>
          </div>
          <button
            onClick={() => setTransmissionNotice(null)}
            className="text-emerald-400 hover:text-white p-1"
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
              ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
              Chờ QC Nghiệm Thu
            </span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono mt-1">{waitingCount}</div>
          <span className="text-[10px] text-slate-500">Đã sửa xong &bull; Đầy đủ ảnh After</span>
        </div>

        <div
          onClick={() => setActiveStatusTab('PASSED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'PASSED'
              ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              QC Đã Đạt (Cấp Vỏ AV)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{passedCount}</div>
          <span className="text-[10px] text-slate-500">Đã cấp chứng chỉ &bull; Sẵn sàng cấp trả</span>
        </div>

        <div
          onClick={() => setActiveStatusTab('SHIPPING_DISPATCH')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'SHIPPING_DISPATCH'
              ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
              Danh Sách Gửi Hãng Tàu
            </span>
            <Ship className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-blue-400 font-mono">{passedCount}</span>
            {pendingDispatchCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
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
              ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-950'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
              Không Đạt (Sửa Lại)
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">{failedCount}</div>
          <span className="text-[10px] text-slate-500">Trả về xưởng cơ khí làm lại</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
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
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    activeStatusTab === tab.id ? 'bg-white/20 text-white' : 'bg-amber-950 text-amber-300 border border-amber-800'
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
          <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-blue-400" />
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
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-400 text-[11px] font-mono">
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedShippingLine}
              onChange={(e) => setSelectedShippingLine(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none"
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
            <div className="p-2.5 bg-blue-600/30 text-blue-300 rounded-xl border border-blue-500/40">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">
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
              className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              Bỏ Chọn
            </button>

            <button
              onClick={handleOpenBulkDispatch}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-950 transition flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>GỬI QUA HÃNG TÀU ({selectedContainerIds.length} CONT)</span>
            </button>
          </div>
        </div>
      )}

      {/* QC Containers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              Danh Sách Container ({filteredContainers.length})
            </span>
            {(activeStatusTab === 'PASSED' || activeStatusTab === 'SHIPPING_DISPATCH') && (
              <button
                onClick={toggleSelectAll}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
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
                className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Ship className="w-3.5 h-3.5" />
                <span>Gửi Toàn Bộ Danh Sách Cho Hãng Tàu</span>
              </button>
            )}
            <span className="text-slate-500 font-mono text-[11px]">
              Giám sát viên: <strong>Vũ Quốc Việt (QC Inspector)</strong>
            </span>
          </div>
        </div>

        {filteredContainers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">Không có container nào trong danh sách</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Khi xưởng hoàn thành các lệnh sửa chữa ở Bước 8, container sẽ tự động hiển thị tại đây để nghiệm thu và gửi cho hãng tàu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {(activeStatusTab === 'PASSED' || activeStatusTab === 'SHIPPING_DISPATCH') && (
                    <th className="p-4 w-10 text-center">
                      <span className="sr-only">Chọn</span>
                    </th>
                  )}
                  <th className="p-4">Container No &amp; Loại Vỏ</th>
                  <th className="p-4">Hãng Tàu &amp; Lệnh WO</th>
                  <th className="p-4">Vị Trí Bãi &amp; Thợ Phụ Trách</th>
                  <th className="p-4">Tiêu Chuẩn Kiểm Tra</th>
                  <th className="p-4">Trạng Thái QC</th>
                  <th className="p-4">Gửi Hãng Tàu (Dispatch)</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filteredContainers.map((c) => {
                  const record = qcRecords[c.id] || {
                    id: `QC-REC-${c.id}`,
                    containerId: c.id,
                    containerNo: c.containerNo,
                    isoCode: c.isoCode,
                    size: c.size,
                    type: c.type,
                    shippingLine: c.shippingLine,
                    workOrderNo: c.workOrderDetails?.workOrderNo || `WO-${c.containerNo.slice(-4)}`,
                    estimateNo: c.estimateDetails?.estimateNo || `EST-${c.containerNo.slice(-4)}`,
                    technicianName: c.workOrderDetails?.technician || 'Hoàng Văn Sơn (Tổ EMR)',
                    yardLocation: c.yardLocation || { block: 'C', bay: '04', row: '02', tier: '2' },
                    repairedAt: c.workOrderDetails?.assignedAt || '2026-08-15 10:30',
                    inspectorName: 'Vũ Quốc Việt (IICL Certified)',
                    certificateNo: `QC-CERT-${c.containerNo}-2026`,
                    checkItems: DEFAULT_QC_CHECKLIST,
                    beforePhotos: [
                      {
                        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
                        label: 'Ảnh trước sửa',
                        location: 'Vách trái / Xà dọc đáy'
                      }
                    ],
                    afterPhotos: [
                      {
                        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
                        label: 'Ảnh sau sửa',
                        location: 'Vách trái / Xà dọc đáy đã hoàn thiện'
                      }
                    ],
                    qcResult: c.condition === 'AV' ? 'PASS' : c.status === 'WAITING_QC' ? 'PENDING' : 'PENDING',
                    inspectorComments: 'Thử kín sáng đạt chuẩn.'
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
                        isSelected ? 'bg-blue-950/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      {(activeStatusTab === 'PASSED' || activeStatusTab === 'SHIPPING_DISPATCH') && (
                        <td className="p-4 text-center">
                          {isPassed ? (
                            <button
                              type="button"
                              onClick={() => toggleSelectContainer(c.id)}
                              className="text-slate-400 hover:text-blue-400 transition cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-400" />
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
                        <div className="font-mono font-black text-white text-sm flex items-center gap-2">
                          <span>{c.containerNo}</span>
                          {record.releasedGrade && (
                            <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold">
                              {record.releasedGrade.replace('GRADE_', 'G-')}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {c.size} {c.type} ({c.isoCode})
                        </div>
                      </td>

                      {/* Line & WO */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold rounded text-[11px]">
                          {c.shippingLine}
                        </span>
                        <div className="font-mono text-[11px] text-amber-400 font-bold mt-1">
                          {record.workOrderNo}
                        </div>
                      </td>

                      {/* Location & Technician */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-200">
                          Block {record.yardLocation.block} - Bay {record.yardLocation.bay} - Row {record.yardLocation.row}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Thợ: {record.technicianName}
                        </div>
                      </td>

                      {/* 7-point summary */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-300 block font-medium">
                            7-Point Checklist:
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-mono rounded">
                              Light ✓
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-mono rounded">
                              Water ✓
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-mono rounded">
                              Floor ✓
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* QC Status */}
                      <td className="p-4">
                        {isPassed ? (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>QC ĐÃ ĐẠT (AV)</span>
                          </span>
                        ) : isFailed ? (
                          <div className="space-y-1">
                            <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>KHÔNG ĐẠT (REWORK)</span>
                            </span>
                            {record.failPhotos && record.failPhotos.length > 0 && (
                              <div className="text-[10px] text-rose-400 font-mono flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                <span>Đã chụp {record.failPhotos.length} ảnh lỗi</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            <span>CHỜ NGHIỆM THU</span>
                          </span>
                        )}
                      </td>

                      {/* Shipping Line Dispatch Status */}
                      <td className="p-4">
                        {isPassed ? (
                          isTransmitted ? (
                            <div className="space-y-0.5">
                              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 font-mono">
                                <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />
                                <span>ĐÃ GỬI HÃNG TÀU</span>
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {record.shippingDispatch?.transmittedMethod || 'EDI'} &bull; {record.shippingDispatch?.transmittedAt?.slice(5)}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Chờ gửi hãng tàu</span>
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono">Sẵn sàng truyền EDI</div>
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
                              <button
                                onClick={() => handleOpenSingleDispatch(record)}
                                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold rounded-xl border border-blue-500/30 transition flex items-center gap-1 cursor-pointer shadow"
                                title="Gửi điện EDI hoặc Email thông báo nghiệm thu cho Hãng tàu"
                              >
                                <Ship className="w-3.5 h-3.5" />
                                <span>Gửi Hãng Tàu</span>
                              </button>

                              <button
                                onClick={() => setViewingCertificate(record)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                                title="Xem & In Chứng Nhận QC"
                              >
                                <Award className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Chứng Chỉ</span>
                              </button>
                            </>
                          )}

                          {isFailed && (
                            <button
                              onClick={() => setInspectingRecord(record)}
                              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-700/60 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-rose-400" />
                              <span>Xem / Chụp Lại Ảnh</span>
                            </button>
                          )}

                          <button
                            onClick={() => setInspectingRecord(record)}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow ${
                              isPassed
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                : isFailed
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950'
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950'
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
