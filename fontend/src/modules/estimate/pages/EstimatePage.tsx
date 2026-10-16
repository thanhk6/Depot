import React, { useEffect, useState, useMemo } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { containerApi, estimateApi, shippingApi } from '../../../api';
import type { ShippingSyncLogItem } from '../../../api';
import { Estimate, EstimateApiTransaction, EstimateStatus, MaerskApiResponse } from '../types';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatVND, formatDateTime } from '../../../utils/format';
import { buildEstimatePayload } from '../utils/estimatePayload';
import { BulkEstimateModal } from '../components/BulkEstimateModal';
import { CreateEstimateModal } from '../components/CreateEstimateModal';
import { EstimateDetailModal } from '../components/EstimateDetailModal';
import {
  Calculator,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Send,
  Settings,
  FileText,
  Server,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  Check,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  AlertTriangle,
  RotateCcw,
  Wrench,
  X
} from 'lucide-react';

interface EstimatePageProps {
  containers: ContainerRecord[];
  onSaveEstimate?: (
    containerId: string,
    labourHours: number,
    labourCost: number,
    materialCost: number,
    totalCost: number
  ) => void;
  onNavigateTab: (tabId: string) => void;
}

const ESTIMATE_EVENT = 'ESTIMATE_SUBMITTED';

const parseJson = (raw?: string | null) => {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return raw; }
};

// Lịch sử gửi báo giá = bản ghi thật trong ShippingSyncLogs (trước đây do trình duyệt tự sinh, mất khi F5).
const toTransaction = (log: ShippingSyncLogItem, attemptNo: number): EstimateApiTransaction => ({
  id: String(log.id),
  attemptNo,
  timestamp: new Date(log.syncedAt).toLocaleString('vi-VN'),
  requestId: String(log.id),
  transactionId: log.ackToken || '',
  endpoint: log.endpointUrl || '',
  httpMethod: 'POST',
  httpStatusCode: log.httpStatusCode ?? 0,
  requestHeaders: {},
  requestPayload: parseJson(log.requestBody),
  responseHeaders: {},
  responsePayload: parseJson(log.responseBody),
  status: log.status === 'SENT' ? 'SUCCESS' : 'ERROR',
  maerskReferenceNo: log.ackToken || undefined,
  errorMessage: log.errorMessage || undefined,
  latencyMs: log.latencyMs ?? 0,
  operator: log.triggeredBy || ''
});

const applySendLogs = (est: Estimate, jobLogs: ShippingSyncLogItem[]): Estimate => {
  const ordered = [...jobLogs].sort((a, b) => a.syncedAt.localeCompare(b.syncedAt));
  if (ordered.length === 0) return { ...est, apiTransactionHistory: [], lastApiStatus: est.status === 'READY' ? 'NOT_SENT' : undefined, lastApiResponse: undefined };
  const last = ordered[ordered.length - 1];
  const lastSent = [...ordered].reverse().find((l) => l.status === 'SENT');
  const lastApiResponse: MaerskApiResponse | undefined = lastSent && {
    httpStatusCode: lastSent.httpStatusCode ?? 0,
    referenceNo: lastSent.ackToken || '',
    requestId: String(lastSent.id),
    transactionId: lastSent.ackToken || '',
    submittedAt: new Date(lastSent.syncedAt).toLocaleString('vi-VN'),
    status: 'SUBMITTED',
    message: `Hãng tàu ${lastSent.carrierCode} đã nhận báo giá (HTTP ${lastSent.httpStatusCode}).`,
    rawResponse: parseJson(lastSent.responseBody)
  };
  const history = ordered.map((l, i) => toTransaction(l, i + 1));
  // Báo giá chưa có quyết định hãng tàu: chỉ lần gửi SAU lần sửa cuối mới tính cho bản hiện tại
  // (sửa xong phải gửi lại — trước đây bản sửa vẫn hiện "đã gửi" theo lần gửi của bản cũ).
  if (est.status === 'READY' || est.status === 'SUBMITTED' || est.status === 'ERROR') {
    const since = Date.parse(est.updatedAt) - 1000;
    const current = ordered.filter((l) => !(Date.parse(l.syncedAt) < since));
    const lastCurrent = current[current.length - 1];
    return {
      ...est,
      apiTransactionHistory: history,
      lastApiStatus: !lastCurrent ? 'NOT_SENT' : lastCurrent.status === 'SENT' ? 'SUCCESS' : 'FAILED',
      lastApiResponse
    };
  }
  return {
    ...est,
    apiTransactionHistory: history,
    lastApiStatus: last.status === 'SENT' ? 'SUCCESS' : 'FAILED',
    lastApiResponse
  };
};

const groupEstimateLogs = (logs: ShippingSyncLogItem[]) => {
  const map = new Map<string, ShippingSyncLogItem[]>();
  for (const log of logs) {
    if (log.eventType !== ESTIMATE_EVENT || log.status === 'SIMULATED') continue;
    const key = String(log.depotJobId);
    map.set(key, [...(map.get(key) || []), log]);
  }
  return map;
};

export const EstimatePage: React.FC<EstimatePageProps> = ({
  containers,
  onNavigateTab
}) => {
  // Master estimates state
  const [estimates, setEstimates] = useState<Estimate[]>([]);

  // Tải lại báo giá từ DB (sau khi lập / sửa / bổ sung để hiện đúng người sửa, thời điểm, hạng mục đã lưu).
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    containerApi.getAll()
      .then((response: any) => {
        if (response?.statusCode !== 200 || !Array.isArray(response.data)) return;
        const backendEstimates = response.data
          .filter((job: any) => job.estimate)
          .map((job: any): Estimate => ({
            id: String(job.estimate.id),
            estimateNo: job.estimate.estimateNo,
            containerId: String(job.id),
            containerNo: job.containerNo,
            isoCode: job.isoSize,
            size: job.isoSize,
            type: 'Dry High Cube',
            shippingLine: job.shippingLineCode,
            condition: 'DM',
            createdBy: job.estimate.createdBy || '—',
            createdById: '',
            createdAt: job.estimate.createdAt || job.gateInDate,
            updatedAt: job.estimate.lastModifiedAt || job.estimate.createdAt || job.gateInDate,
            updatedBy: job.estimate.lastModifiedBy || undefined,
            repairSummary: `Estimate ${job.estimate.estimateNo}`,
            items: (job.estimate.items || []).map((item: any) => ({
              id: String(item.id),
              damageLocationCode: item.locationCode || '', damageLocationName: item.locationName || '',
              damageCode: item.damageCode || '', damageName: item.damageName || '',
              repairCode: item.repairCode || '', repairMethod: item.repairMethod || item.itemDescription,
              description: item.itemDescription,
              quantity: item.quantity, unit: item.unit || 'Lần', unitPrice: item.unitPrice, amount: item.amount,
              vatRate: (item.vatPercent || 0) / 100,
              vatAmount: item.amount * (item.vatPercent || 0) / 100,
              totalAmount: item.amount * (1 + (item.vatPercent || 0) / 100),
              cedexCode: [item.locationCode, item.damageCode, item.repairCode].filter(Boolean).join('-') || undefined,
              tpi: item.tpi || '',
              manHoursPerPiece: item.manHoursPerPiece || 0
            })),
            subtotal: job.estimate.grandTotal - job.estimate.totalTax,
            // Thuế suất = thuế / tiền trước thuế (trước đây chia cho tổng sau thuế → mở sửa bị lệch VAT).
            vatRate: job.estimate.grandTotal - job.estimate.totalTax > 0
              ? Math.round((job.estimate.totalTax / (job.estimate.grandTotal - job.estimate.totalTax)) * 1000) / 1000
              : 0,
            vatAmount: job.estimate.totalTax,
            totalAmount: job.estimate.grandTotal,
            currency: job.estimate.currency === 'USD' ? 'USD' : 'VND',
            // PENDING_APPROVAL = đã lưu, chờ gửi; thành "Chờ hãng tàu duyệt" khi có lần gửi thành công (applySendLogs).
            status: job.estimate.status === 'APPROVED' ? 'APPROVED' : job.estimate.status === 'REJECTED' ? 'REJECTED'
              : job.estimate.confirmedAt ? 'SUBMITTED' : 'READY',
            confirmedAt: job.estimate.confirmedAt || undefined,
            confirmedBy: job.estimate.confirmedBy || undefined,
            // Lệnh duyệt / từ chối của hãng tàu đã ghi nhận (dữ liệu thật trong DB).
            carrierApproval: job.estimate.status === 'APPROVED' ? {
              status: 'APPROVED',
              authCode: job.estimate.carrierAuthCode || undefined,
              approvedAmount: job.estimate.approvedAmount ?? undefined,
              approvedAt: job.estimate.approvedAt || undefined,
              approvedBy: job.estimate.carrierApproverName || undefined,
              comments: job.estimate.approvalNotes || undefined,
              workOrderNo: job.estimate.carrierWorkOrderNo || undefined,
              channel: job.estimate.approvalChannel || undefined,
              enteredBy: job.estimate.approvedBy || undefined
            } : job.estimate.status === 'REJECTED' ? {
              status: 'REJECTED',
              rejectReason: (job.auditLogs || []).filter((l: any) => l.action === 'ESTIMATE_REJECTED')
                .sort((a: any, b: any) => String(a.timestamp).localeCompare(String(b.timestamp))).pop()?.details || undefined
            } : undefined,
            lastApiStatus: job.estimate.status === 'PENDING_APPROVAL' ? 'NOT_SENT' : undefined,
            surveyReference: job.estimate.surveyReference || '',
            inspectionPhotos: job.estimate.inspectionPhotos || [],
            notes: job.estimate.notes || '',
            laborRate: job.estimate.laborRate || 0,
            totalManHours: job.estimate.totalManHours || 0,
            laborCost: job.estimate.totalLaborCost || 0,
            materialCost: job.estimate.totalMaterialCost || 0,
            repairMode: job.estimate.repairMode || '',
            cause: job.estimate.cause || '',
            shopCode: job.estimate.shopCode || '',
            vendorRefNo: job.estimate.vendorRefNo || '',
            preparationHours: job.estimate.preparationHours || 0,
            ordinaryHours: job.estimate.ordinaryHours || 0,
            ot1Hours: job.estimate.ot1Hours || 0,
            ot2Hours: job.estimate.ot2Hours || 0,
            ot3Hours: job.estimate.ot3Hours || 0,
            apiTransactionHistory: []
          }));
        setEstimates(backendEstimates);
        // Gắn lịch sử gửi hãng tàu thật (không chặn hiển thị danh sách nếu lỗi).
        shippingApi.getLogs({ take: 500 })
          .then((logs) => {
            const byJob = groupEstimateLogs(logs);
            setEstimates((prev) => prev.map((e) => (byJob.has(e.containerId) ? applySendLogs(e, byJob.get(e.containerId)!) : e)));
          })
          .catch(() => {});
      })
      .catch((error) => console.warn('Không thể tải Estimate từ Backend SQL:', error));
  }, [reloadKey]);

  const updateEstimatesState = (newEstimates: Estimate[]) => {
    setEstimates(newEstimates);
  };

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForContainerId, setCreateForContainerId] = useState<string | undefined>(undefined);
  // Container đã thu tiền phiếu dịch vụ, đang ESTIMATING và chưa có báo giá nào → chờ lập báo giá.
  const awaitingEstimate = containers.filter(
    (c) => c.status === 'ESTIMATING' && c.paymentStatus === 'PAID' && !estimates.some((e) => e.containerId === c.id)
  );
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  // Sau khi tải lại từ DB, modal chi tiết hiện bản mới nhất (người sửa cuối, hạng mục đã lưu).
  useEffect(() => {
    setSelectedEstimate((cur) => (cur ? estimates.find((e) => e.id === cur.id) || cur : cur));
  }, [estimates]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isSendingApiMap, setIsSendingApiMap] = useState<Record<string, boolean>>({});

  // Toast banner notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quick Status Tab Filter
  const [activeStatusTab, setActiveStatusTab] = useState<'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'DRAFT_READY' | 'ERROR'>('ALL');

  // Filters State (Section 6.7)
  const [searchEstimateNo, setSearchEstimateNo] = useState('');
  const [searchContainerNo, setSearchContainerNo] = useState('');
  const [filterShippingLine, setFilterShippingLine] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Extract unique shipping lines
  const shippingLines = useMemo(() => {
    const lines = new Set<string>();
    estimates.forEach((e) => {
      if (e.shippingLine) lines.add(e.shippingLine);
    });
    containers.forEach((c) => {
      if (c.shippingLine) lines.add(c.shippingLine);
    });
    return Array.from(lines);
  }, [estimates, containers]);

  // Dòng "chờ lập báo giá" trong bảng — theo cùng bộ lọc số container / hãng tàu; ẩn khi lọc theo mã báo giá
  // hoặc theo trạng thái báo giá đã có (đã gửi / duyệt / từ chối / lỗi).
  const awaitingRows = useMemo(() => {
    if (activeStatusTab !== 'ALL' && activeStatusTab !== 'DRAFT_READY') return [];
    if (searchEstimateNo || (filterStatus !== 'ALL' && filterStatus !== 'DRAFT' && filterStatus !== 'READY')) return [];
    return awaitingEstimate.filter((c) =>
      (!searchContainerNo || c.containerNo.toLowerCase().includes(searchContainerNo.toLowerCase()))
      && (filterShippingLine === 'ALL' || c.shippingLine === filterShippingLine));
  }, [awaitingEstimate, activeStatusTab, searchEstimateNo, searchContainerNo, filterShippingLine, filterStatus]);

  // Filtered List
  const filteredEstimates = useMemo(() => {
    return estimates.filter((e) => {
      // 1. Quick Status Tab
      if (activeStatusTab === 'SUBMITTED' && e.status !== 'SUBMITTED' && e.status !== 'SENDING') return false;
      if (activeStatusTab === 'APPROVED' && e.status !== 'APPROVED') return false;
      if (activeStatusTab === 'REJECTED' && e.status !== 'REJECTED') return false;
      if (activeStatusTab === 'DRAFT_READY' && e.status !== 'DRAFT' && e.status !== 'READY') return false;
      if (activeStatusTab === 'ERROR' && e.lastApiStatus !== 'FAILED') return false;

      // 2. Mã Estimate
      if (searchEstimateNo && !e.estimateNo.toLowerCase().includes(searchEstimateNo.toLowerCase())) {
        return false;
      }

      // 3. Số Container
      if (searchContainerNo && !e.containerNo.toLowerCase().includes(searchContainerNo.toLowerCase())) {
        return false;
      }

      // 4. Shipping Line
      if (filterShippingLine !== 'ALL' && e.shippingLine !== filterShippingLine) {
        return false;
      }

      // 5. Trạng Thái Dropdown
      if (filterStatus !== 'ALL' && e.status !== filterStatus) {
        return false;
      }

      // 6. Date Range
      if (filterDateFrom && e.createdAt < filterDateFrom) {
        return false;
      }
      if (filterDateTo && e.createdAt > `${filterDateTo} 23:59`) {
        return false;
      }

      return true;
    });
  }, [estimates, activeStatusTab, searchEstimateNo, searchContainerNo, filterShippingLine, filterStatus, filterDateFrom, filterDateTo]);

  // Counters for Summary
  const stats = useMemo(() => {
    return {
      total: estimates.length,
      draft: estimates.filter((e) => e.status === 'DRAFT').length,
      ready: estimates.filter((e) => e.status === 'READY').length,
      submitted: estimates.filter((e) => e.status === 'SUBMITTED' || e.status === 'SENDING').length,
      approved: estimates.filter((e) => e.status === 'APPROVED').length,
      rejected: estimates.filter((e) => e.status === 'REJECTED').length,
      error: estimates.filter((e) => e.lastApiStatus === 'FAILED').length,
      totalVnd: estimates.reduce((sum, e) => sum + e.totalAmount, 0),
      approvedVnd: estimates.filter((e) => e.status === 'APPROVED').reduce((sum, e) => sum + (e.carrierApproval?.approvedAmount || e.totalAmount), 0)
    };
  }, [estimates]);

  // Handle Save / Add Estimate
  const handleSaveNewEstimate = async (newEst: Estimate, sendAfter = false): Promise<boolean> => {
    try {
      // Resolve the UI container number to the SQL-backed DepotJob business record.
      const jobResponse: any = await containerApi.getById(newEst.containerNo);
      if (jobResponse?.statusCode !== 200 || !jobResponse.data?.id) {
        throw new Error(jobResponse?.message || `Không tìm thấy Job SQL cho container ${newEst.containerNo}.`);
      }

      const estimateResponse: any = await estimateApi.createEstimate(jobResponse.data.id, buildEstimatePayload(newEst));

      if (estimateResponse?.statusCode !== 200) {
        throw new Error(estimateResponse?.message || 'Không thể lưu báo giá vào SQL Server.');
      }

      const persistedEstimate: Estimate = { ...newEst, status: 'READY' as EstimateStatus, lastApiStatus: 'NOT_SENT' };
      const exists = estimates.some((e) => e.id === newEst.id);
      const updated = exists
        ? estimates.map((e) => (e.id === newEst.id ? persistedEstimate : e))
        : [persistedEstimate, ...estimates];
      updateEstimatesState(updated);
      const savedText = exists ? `Đã cập nhật báo giá ${newEst.estimateNo}.` : `Đã lập báo giá ${newEst.estimateNo}.`;
      setEditingEstimate(null);
      if (selectedEstimate?.id === newEst.id) setSelectedEstimate(persistedEstimate);
      if (sendAfter && canSendApi(newEst.shippingLine)) {
        showToast(`${savedText} Đang gửi hãng tàu...`);
        const sent = await sendToCarrier(String(jobResponse.data.id), newEst.estimateNo);
        showToast(`${savedText} ${sent.text}`, sent.type);
      } else if (sendAfter) {
        const confirmed = await confirmOnServer(String(jobResponse.data.id), newEst.estimateNo);
        showToast(`${savedText} ${confirmed.text}`, confirmed.type);
      } else {
        showToast(`${savedText} Bấm "Xác nhận báo giá" để chốt báo giá.`);
      }
      setReloadKey((k) => k + 1);
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể lưu báo giá vào SQL Server.', 'error');
      return false;
    }
  };

  // Gửi báo giá sang API hãng tàu của hồ sơ: backend dựng nội dung từ DB và gọi HTTP thật tới endpoint
  // cấu hình trên server. Trước đây toàn bộ là giả lập trong trình duyệt (tự sinh mã tham chiếu Maersk,
  // luôn "thành công") và tự đổi trạng thái báo giá sang SUBMITTED dù không gửi gì. Gửi không đổi trạng
  // thái báo giá — việc duyệt/từ chối vẫn ghi nhận ở Cổng Phê Duyệt.
  const [apiCarriers, setApiCarriers] = useState<Set<string>>(new Set());
  useEffect(() => {
    shippingApi.getCarriers()
      .then((list) => setApiCarriers(new Set(list.filter((c) => c.configured && c.enabled).map((c) => c.carrierCode.toUpperCase()))))
      .catch(() => setApiCarriers(new Set()));
  }, []);
  const canSendApi = (shippingLine?: string) => !!shippingLine && apiCarriers.has(shippingLine.toUpperCase());

  // Xác nhận báo giá trên hệ thống (khi chưa có / không dùng API hãng tàu).
  const [confirmingMap, setConfirmingMap] = useState<Record<string, boolean>>({});
  const confirmOnServer = async (jobId: string, estimateNo: string): Promise<{ text: string; type: 'success' | 'error' }> => {
    try {
      await estimateApi.confirmEstimate(jobId);
      return { text: `Đã xác nhận báo giá ${estimateNo} — chờ hãng tàu duyệt.`, type: 'success' };
    } catch (error) {
      return { text: `Không xác nhận được báo giá ${estimateNo}: ${getApiErrorMessage(error, 'Lỗi máy chủ.')}`, type: 'error' };
    }
  };
  const handleConfirmEstimate = async (est: Estimate) => {
    setConfirmingMap((prev) => ({ ...prev, [est.id]: true }));
    const r = await confirmOnServer(est.containerId, est.estimateNo);
    setConfirmingMap((prev) => ({ ...prev, [est.id]: false }));
    showToast(r.text, r.type);
    setReloadKey((k) => k + 1);
  };

  const sendToCarrier = async (jobId: string, estimateNo: string): Promise<{ text: string; type: 'success' | 'error' }> => {
    try {
      const res: any = await shippingApi.syncJob(jobId, '', ESTIMATE_EVENT);
      const ack = res?.data?.ackToken;
      return { text: `Đã gửi báo giá ${estimateNo} tới hãng tàu (HTTP ${res?.data?.httpStatusCode})${ack ? ` — mã xác nhận: ${ack}` : ''}.`, type: 'success' };
    } catch (error) {
      return { text: `Gửi báo giá ${estimateNo} thất bại: ${getApiErrorMessage(error, 'Không gửi được tới hãng tàu.')}`, type: 'error' };
    }
  };

  const handleSendToMaersk = async (est: Estimate) => {
    setIsSendingApiMap((prev) => ({ ...prev, [est.id]: true }));
    const message = await sendToCarrier(est.containerId, est.estimateNo);
    try {
      const jobLogs = (await shippingApi.getLogs({ jobId: est.containerId, take: 100 })).filter((l) => l.eventType === ESTIMATE_EVENT && l.status !== 'SIMULATED');
      const updated = applySendLogs(est, jobLogs);
      setEstimates((prev) => prev.map((e) => (e.id === est.id ? updated : e)));
      if (selectedEstimate?.id === est.id) setSelectedEstimate(updated);
    } catch {
      // lịch sử sẽ được tải lại ở lần mở màn sau
    }
    setIsSendingApiMap((prev) => ({ ...prev, [est.id]: false }));
    showToast(message.text, message.type);
  };

  const getStatusBadge = (status: EstimateStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold font-mono inline-block">
            Draft &bull; Nháp
          </span>
        );
      case 'READY':
        return (
          <span className="px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-200 rounded-lg text-xs font-bold font-mono inline-block">
            Chờ xác nhận
          </span>
        );
      case 'SENDING':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Sending &bull; Đang gửi</span>
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Chờ Hãng Tàu Duyệt</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>HÃNG TÀU ĐÃ DUYỆT</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>TỪ CHỐI / SỬA LẠI</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold font-mono inline-block">
            Error &bull; Gửi API lỗi
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-500'
              : 'bg-blue-50 text-blue-700 border-blue-500'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-bold rounded-md font-mono">
                6. BÁO GIÁ SỬA CHỮA
              </span>
              <h2 className="text-xl font-bold text-slate-900">Quản Lý Mã Báo Giá EMR &bull; Tiếp Nhận Phản Hồi Hãng Tàu</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lập dự toán sửa chữa Container CL/DM, gửi API/EDI và theo dõi trạng thái Hãng tàu Phê duyệt (Approved) hoặc Từ chối (Rejected).
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateTab('approval')}
            className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-50 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Cổng Phê Duyệt Hãng Tàu ({stats.submitted})</span>
          </button>

          <button
            onClick={() => onNavigateTab('shipping_api')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-blue-600" />
            <span>Kết Nối API Hãng Tàu</span>
          </button>

          <button
            onClick={() => setIsBulkOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-700 font-bold text-xs rounded-xl border border-amber-300 transition flex items-center gap-1.5 cursor-pointer"
            title="Lập báo giá cùng lúc cho nhiều container (giống AEMS Multiple equipments)"
          >
            <Plus className="w-4 h-4" />
            <span>Lập Báo Giá Nhiều Container</span>
          </button>

          <button
            onClick={() => {
              setEditingEstimate(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg  transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Lập Báo Giá (Estimate)</span>
          </button>
        </div>
      </div>

      {/* Container đã thu tiền phiếu dịch vụ, đang chờ lập báo giá (chưa có báo giá) */}
      {awaitingEstimate.length > 0 && (
        <div className="p-5 bg-white border-2 border-amber-300 rounded-3xl space-y-3">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Đã thu tiền · chờ lập báo giá ({awaitingEstimate.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {awaitingEstimate.map((c) => (
              <div key={c.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{c.containerNo}</div>
                  <div className="text-[11px] text-slate-500">
                    {c.shippingLine || '—'} · {c.size}{c.condition ? ` · ${c.condition}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEstimate(null);
                    setCreateForContainerId(c.id);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lập Báo Giá</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carrier Approval Workflow Diagram & Quick Guide */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quy Trình Gửi Báo Giá &bull; Tiếp Nhận Quyết Định Hãng Tàu (Carrier EMR Workflow)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Gửi qua API hãng tàu đã cấu hình trên server; quyết định duyệt ghi nhận ở Cổng Phê Duyệt
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 relative group">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
              <span className="font-bold text-amber-600">BƯỚC 1</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">DRAFT / READY</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Lập Báo Giá EMR</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Nhập mã linh kiện CEDEX, đơn giá theo biểu phí hợp đồng khung và đính kèm ảnh giám định e-EIR.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-blue-200 relative group">
            <div className="flex items-center justify-between text-[11px] font-mono text-blue-600 mb-1">
              <span className="font-bold text-blue-600">BƯỚC 2</span>
              <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px]">GỬI API / EDI</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Truyền Bản Tin Hãng Tàu</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Bấm <strong className="text-emerald-700">"Xác nhận báo giá"</strong> (hoặc "Gửi Hãng Tàu" khi đã có API) để gửi báo giá (JSON) tới API của hãng tàu và lưu phản hồi.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-purple-200 relative group">
            <div className="flex items-center justify-between text-[11px] font-mono text-purple-600 mb-1">
              <span className="font-bold text-purple-600">BƯỚC 3</span>
              <span className="px-1.5 py-0.5 bg-purple-50 border border-purple-200 rounded text-[10px]">CHỜ XEM XÉT</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Hãng Tàu Thẩm Định</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Trạng thái <strong className="text-purple-700">SUBMITTED</strong>. Đại diện kỹ thuật hãng tàu đối chiếu ảnh IICL và định mức chi phí.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-emerald-200 relative group">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-600 mb-1">
              <span className="font-bold text-emerald-600">BƯỚC 4</span>
              <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[10px]">QUYẾT ĐỊNH</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Nhận Quyết Định Hãng Tàu</h4>
            <div className="text-[11px] text-slate-700 space-y-1">
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Duyệt: Cấp Auth Code &rarr; Ra Lệnh WO</span>
              </div>
              <div className="flex items-center gap-1 text-purple-700 font-semibold">
                <XCircle className="w-3 h-3 shrink-0" />
                <span>Từ chối: Nhận lý do &rarr; Sửa lại báo giá</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveStatusTab('ALL')}
          className={`p-3.5 bg-white rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'ALL' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-200 hover:border-slate-200'
          }`}
        >
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Tất Cả Estimate</div>
          <div className="text-xl font-mono font-bold text-slate-900 mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-slate-500 truncate mt-0.5">{formatVND(stats.totalVnd)}</div>
        </div>

        <div
          onClick={() => setActiveStatusTab('SUBMITTED')}
          className={`p-3.5 bg-white rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'SUBMITTED' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-blue-200 hover:border-blue-200'
          }`}
        >
          <div className="text-[10px] text-blue-600 uppercase font-semibold flex items-center justify-between">
            <span>Chờ Hãng Tàu Duyệt</span>
            <Clock className="w-3 h-3" />
          </div>
          <div className="text-xl font-mono font-bold text-blue-700 mt-0.5">{stats.submitted}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Đã xác nhận / đã gửi</div>
        </div>

        <div
          onClick={() => setActiveStatusTab('APPROVED')}
          className={`p-3.5 bg-white rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'APPROVED' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-emerald-200 hover:border-emerald-200'
          }`}
        >
          <div className="text-[10px] text-emerald-600 uppercase font-semibold flex items-center justify-between">
            <span>Hãng Tàu ĐÃ DUYỆT</span>
            <CheckCircle2 className="w-3 h-3" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-700 mt-0.5">{stats.approved}</div>
          <div className="text-[10px] text-emerald-600 truncate mt-0.5">{formatVND(stats.approvedVnd)}</div>
        </div>

        <div
          onClick={() => setActiveStatusTab('REJECTED')}
          className={`p-3.5 bg-white rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'REJECTED' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-purple-200 hover:border-purple-200'
          }`}
        >
          <div className="text-[10px] text-purple-600 uppercase font-semibold flex items-center justify-between">
            <span>TỪ CHỐI / SỬA LẠI</span>
            <XCircle className="w-3 h-3" />
          </div>
          <div className="text-xl font-mono font-bold text-purple-700 mt-0.5">{stats.rejected}</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Cần lập Revision</div>
        </div>

        <div
          onClick={() => setActiveStatusTab('DRAFT_READY')}
          className={`p-3.5 bg-white rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'DRAFT_READY' ? 'border-sky-500 ring-1 ring-sky-500' : 'border-sky-200 hover:border-sky-200'
          }`}
        >
          <div className="text-[10px] text-sky-600 uppercase font-semibold">Chờ Xác Nhận</div>
          <div className="text-xl font-mono font-bold text-sky-700 mt-0.5">{stats.draft + stats.ready}</div>
          <div className="text-[10px] text-sky-600 mt-0.5">Đã lưu, chưa chốt báo giá</div>
        </div>

        <div
          onClick={() => setActiveStatusTab('ERROR')}
          className={`p-3.5 bg-white rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'ERROR' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-rose-200 hover:border-rose-200'
          }`}
        >
          <div className="text-[10px] text-rose-600 uppercase font-semibold flex items-center justify-between">
            <span>Lỗi Gửi API</span>
            <AlertCircle className="w-3 h-3" />
          </div>
          <div className="text-xl font-mono font-bold text-rose-700 mt-0.5">{stats.error}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Cần bấm Gửi lại</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar (Section 6.7) */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4">
        {/* Status Quick Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveStatusTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeStatusTab === 'ALL'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Tất Cả ({stats.total})
            </button>

            <button
              onClick={() => setActiveStatusTab('SUBMITTED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeStatusTab === 'SUBMITTED'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-50 text-blue-600 hover:text-slate-900 border border-blue-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Chờ Hãng Tàu Duyệt ({stats.submitted})</span>
            </button>

            <button
              onClick={() => setActiveStatusTab('APPROVED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeStatusTab === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-50 text-emerald-600 hover:text-slate-900 border border-emerald-200'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Hãng Tàu ĐÃ DUYỆT ({stats.approved})</span>
            </button>

            <button
              onClick={() => setActiveStatusTab('REJECTED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeStatusTab === 'REJECTED'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-50 text-purple-600 hover:text-slate-900 border border-purple-200'
              }`}
            >
              <X className="w-3 h-3" />
              <span>TỪ CHỐI / KHÔNG DUYỆT ({stats.rejected})</span>
            </button>

            <button
              onClick={() => setActiveStatusTab('DRAFT_READY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeStatusTab === 'DRAFT_READY'
                  ? 'bg-sky-600 text-white shadow-lg'
                  : 'bg-slate-50 text-sky-600 hover:text-slate-900 border border-sky-200'
              }`}
            >
              Chờ Xác Nhận ({stats.draft + stats.ready})
            </button>

            <button
              onClick={() => setActiveStatusTab('ERROR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeStatusTab === 'ERROR'
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-slate-50 text-rose-600 hover:text-slate-900 border border-rose-200'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Lỗi Gửi ({stats.error})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500">
            Tìm thấy <strong className="text-amber-600">{filteredEstimates.length}</strong> / {estimates.length} báo giá
            {awaitingRows.length > 0 && <> · <strong className="text-amber-600">{awaitingRows.length}</strong> container chờ lập</>}
          </span>
        </div>

        {/* Multi-criteria Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Mã Estimate */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Mã Estimate:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="EST-2026..."
                value={searchEstimateNo}
                onChange={(e) => setSearchEstimateNo(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 2. Số Container */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Số Container:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="MSCU..."
                value={searchContainerNo}
                onChange={(e) => setSearchContainerNo(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 3. Shipping Line */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Hãng Tàu (Shipping Line):</label>
            <select
              value={filterShippingLine}
              onChange={(e) => setFilterShippingLine(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            >
              <option value="ALL">-- Tất cả Hãng Tàu --</option>
              {shippingLines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Trạng Thái */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Trạng Thái:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            >
              <option value="ALL">-- Tất cả trạng thái --</option>
              <option value="DRAFT">Draft (Nháp)</option>
              <option value="READY">Chờ xác nhận</option>
              <option value="SENDING">Sending (Đang gửi)</option>
              <option value="SUBMITTED">Submitted (Chờ duyệt)</option>
              <option value="APPROVED">Approved (Hãng tàu duyệt)</option>
              <option value="REJECTED">Rejected (Từ chối/sửa lại)</option>
              <option value="ERROR">Error (Gửi lỗi)</option>
            </select>
          </div>

          {/* 5. Từ Ngày */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Từ Ngày:</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
            />
          </div>

          {/* 6. Đến Ngày & Reset */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Đến Ngày:</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
              {(searchEstimateNo || searchContainerNo || filterShippingLine !== 'ALL' || filterStatus !== 'ALL' || filterDateFrom || filterDateTo || activeStatusTab !== 'ALL') && (
                <button
                  onClick={() => {
                    setActiveStatusTab('ALL');
                    setSearchEstimateNo('');
                    setSearchContainerNo('');
                    setFilterShippingLine('ALL');
                    setFilterStatus('ALL');
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl transition cursor-pointer"
                  title="Xóa bộ lọc"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table: Danh Sách Mã Báo Giá (Section 6.1) */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-mono">
                <th className="p-4">Mã Estimate</th>
                <th className="p-4">Số Container</th>
                <th className="p-4">Hãng Tàu</th>
                <th className="p-4">Nội Dung Sửa Chữa</th>
                <th className="p-4 text-right">Tổng Tiền Báo Giá</th>
                <th className="p-4">Trạng Thái Báo Giá</th>
                <th className="p-4">Kết Quả Hãng Tàu (Response)</th>
                <th className="p-4">Thời Gian &bull; Người Lập</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {awaitingRows.map((c) => (
                <tr key={`await-${c.id}`} className="bg-amber-50/60 hover:bg-amber-50 transition">
                  <td className="p-4">
                    <span className="text-[11px] font-bold text-amber-700 italic">Chưa lập</span>
                  </td>
                  <td className="p-4">
                    <div className="font-mono font-bold text-slate-900">{c.containerNo}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{c.size}{c.condition ? ` • ${c.condition}` : ''}</div>
                  </td>
                  <td className="p-4 font-mono text-xs font-bold text-blue-700">{c.shippingLine || '—'}</td>
                  <td className="p-4 text-xs text-slate-600">Đã thu tiền phiếu dịch vụ · cần lập báo giá sửa chữa</td>
                  <td className="p-4 text-right text-slate-400">—</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold inline-block">
                      Chờ lập báo giá
                    </span>
                  </td>
                  <td className="p-4 text-[11px] text-slate-500 italic">—</td>
                  <td className="p-4 text-[11px] text-slate-500">—</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEstimate(null);
                        setCreateForContainerId(c.id);
                        setIsCreateModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-[11px] transition cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Lập Báo Giá</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEstimates.length === 0 && awaitingRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-500">Không tìm thấy mã báo giá nào phù hợp.</p>
                    <p className="text-xs text-slate-500 mt-1">Hãy thử xóa bộ lọc hoặc bấm "+ Lập Báo Giá" để tạo mới.</p>
                  </td>
                </tr>
              ) : filteredEstimates.length === 0 ? null : (
                filteredEstimates.map((est) => {
                  const isSendingThis = isSendingApiMap[est.id] || est.status === 'SENDING';
                  return (
                    <tr key={est.id} className="hover:bg-slate-100 transition">
                      {/* Mã Estimate */}
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedEstimate(est);
                            setIsDetailModalOpen(true);
                          }}
                          className="font-mono font-bold text-amber-600 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{est.estimateNo}</span>
                        </button>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {est.items.length} hạng mục CEDEX
                        </div>
                      </td>

                      {/* Số Container */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900 text-sm">{est.containerNo}</div>
                        <div className="text-[11px] text-slate-500">{est.size} &bull; {est.isoCode}</div>
                      </td>

                      {/* Hãng Tàu */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {est.shippingLine}
                        </span>
                      </td>

                      {/* Nội Dung Sửa Chữa */}
                      <td className="p-4 max-w-xs">
                        <div className="text-slate-700 line-clamp-2" title={est.repairSummary}>
                          {est.repairSummary}
                        </div>
                      </td>

                      {/* Tổng Tiền */}
                      <td className="p-4 text-right">
                        <div className="font-mono font-black text-emerald-600 text-sm">
                          {formatVND(est.totalAmount)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          (VAT: {(est.vatRate * 100).toFixed(0)}%)
                        </div>
                      </td>

                      {/* Trạng Thái */}
                      <td className="p-4">
                        {getStatusBadge(est.status)}
                      </td>

                      {/* Kết quả Phản Hồi Từ Hãng Tàu */}
                      <td className="p-4 max-w-[240px]">
                        {est.status === 'APPROVED' ? (
                          <div className="space-y-1.5">
                            <div className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{est.carrierApproval?.workOrderNo ? `WO ${est.carrierApproval.workOrderNo}` : est.carrierApproval?.authCode || est.lastApiResponse?.referenceNo || 'Đã duyệt'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Duyệt: <strong className="text-emerald-600">{formatVND(est.carrierApproval?.approvedAmount || est.totalAmount)}</strong>
                            </div>
                          </div>
                        ) : est.status === 'REJECTED' ? (
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-purple-700 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-purple-600" />
                              <span>Từ chối / Yêu cầu sửa</span>
                            </div>
                            <div className="text-[10px] text-rose-700 line-clamp-2" title={est.carrierApproval?.rejectReason || est.carrierApproval?.comments || 'Chưa ghi lý do'}>
                              {est.carrierApproval?.rejectReason || est.carrierApproval?.comments || 'Chưa ghi lý do'}
                            </div>
                          </div>
                        ) : est.lastApiStatus === 'FAILED' ? (
                          <div>
                            <div className="text-xs font-bold text-rose-600 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Lỗi gửi API{est.apiTransactionHistory[est.apiTransactionHistory.length - 1]?.httpStatusCode ? ` (HTTP ${est.apiTransactionHistory[est.apiTransactionHistory.length - 1].httpStatusCode})` : ''}</span>
                            </div>
                            <div className="text-[10px] text-rose-700 truncate max-w-[140px]" title={est.apiTransactionHistory[est.apiTransactionHistory.length - 1]?.errorMessage}>
                              {est.apiTransactionHistory[est.apiTransactionHistory.length - 1]?.errorCode || 'Lỗi gửi'}
                            </div>
                          </div>
                        ) : est.status === 'SUBMITTED' && est.confirmedAt && !est.lastApiResponse?.referenceNo ? (
                          <div>
                            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã xác nhận</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {est.confirmedBy || '—'} · {formatDateTime(est.confirmedAt)}
                            </div>
                          </div>
                        ) : est.lastApiStatus === 'NOT_SENT' && est.apiTransactionHistory.length > 0 ? (
                          <div>
                            <div className="text-xs font-bold text-amber-700">Bản sửa chưa gửi lại</div>
                            <div className="text-[10px] text-slate-500">
                              Đã gửi {est.apiTransactionHistory.length} lần trước khi sửa
                            </div>
                          </div>
                        ) : est.lastApiResponse?.referenceNo ? (
                          <div>
                            <div className="font-mono text-xs font-bold text-cyan-700 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-cyan-600" />
                              <span>Ref: {est.lastApiResponse.referenceNo}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Đã tiếp nhận &bull; Chờ duyệt
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Chưa xác nhận</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Đã duyệt: khoá, chỉ xem chi tiết (màn Báo giá không chuyển sang Sửa chữa). */}
                          {est.status === 'APPROVED' ? null : est.status === 'REJECTED' ? (
                            <button
                              onClick={() => {
                                setEditingEstimate(est);
                                setIsCreateModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                              title="Lập bản điều chỉnh sửa lại báo giá"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Sửa lại</span>
                            </button>
                          ) : est.status === 'READY' ? (
                            <>
                              <button
                                onClick={() => handleConfirmEstimate(est)}
                                disabled={!!confirmingMap[est.id]}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 disabled:opacity-50 whitespace-nowrap shadow"
                                title="Chốt báo giá trên hệ thống — chuyển sang chờ hãng tàu duyệt"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{confirmingMap[est.id] ? 'Đang xác nhận...' : 'Xác nhận báo giá'}</span>
                              </button>
                              {canSendApi(est.shippingLine) && (
                                <button
                                  onClick={() => handleSendToMaersk(est)}
                                  disabled={isSendingThis}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 disabled:opacity-50 whitespace-nowrap shadow"
                                  title="Gửi báo giá này tới API hãng tàu"
                                >
                                  <Send className={`w-3 h-3 ${isSendingThis ? 'animate-spin' : ''}`} />
                                  <span>{isSendingThis ? 'Đang gửi...' : 'Gửi Hãng Tàu'}</span>
                                </button>
                              )}
                            </>
                          ) : !canSendApi(est.shippingLine) ? null : est.lastApiStatus === 'FAILED' ? (
                            <button
                              onClick={() => handleSendToMaersk(est)}
                              disabled={isSendingThis}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              title="Gửi lại tới API hãng tàu"
                            >
                              <RefreshCw className={`w-3 h-3 ${isSendingThis ? 'animate-spin' : ''}`} />
                              <span>Gửi lại</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendToMaersk(est)}
                              disabled={isSendingThis}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 disabled:opacity-50 whitespace-nowrap ${
                                est.status === 'SUBMITTED'
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                              }`}
                              title={est.status === 'SUBMITTED' ? 'Gửi lại báo giá tới hãng tàu' : 'Gửi báo giá này tới API hãng tàu'}
                            >
                              <Send className={`w-3 h-3 ${isSendingThis ? 'animate-spin' : ''}`} />
                              <span>{isSendingThis ? 'Đang gửi...' : est.status === 'SUBMITTED' ? 'Gửi lại' : 'Gửi Hãng Tàu'}</span>
                            </button>
                          )}

                          {/* View Detail Modal */}
                          <button
                            onClick={() => {
                              setSelectedEstimate(est);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                            title="Xem chi tiết báo giá"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit - ONLY visible if NOT approved */}
                          {est.status !== 'APPROVED' && (
                            <button
                              onClick={() => {
                                setEditingEstimate(est);
                                setIsCreateModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                              title="Chỉnh sửa báo giá"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {/* Chỉ mount khi mở: modal giữ state nội bộ, mount sẵn thì không nhận được container chọn sẵn. */}
      {isCreateModalOpen && (
        <CreateEstimateModal
          isOpen
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingEstimate(null);
            setCreateForContainerId(undefined);
          }}
          onSave={handleSaveNewEstimate}
          containers={containers}
          editEstimate={editingEstimate}
          initialContainerId={createForContainerId}
          canSendApi={canSendApi}
        />
      )}

      {isBulkOpen && (
        <BulkEstimateModal
          containers={awaitingEstimate}
          onClose={() => setIsBulkOpen(false)}
          onDone={(summary, hasError) => {
            showToast(summary, hasError ? 'error' : 'success');
            setReloadKey((k) => k + 1);
          }}
        />
      )}

      <EstimateDetailModal
        estimate={selectedEstimate}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEstimate(null);
        }}
        onSendToMaersk={handleSendToMaersk}
        onSaveEstimate={handleSaveNewEstimate}
        onConfirmEstimate={handleConfirmEstimate}
        canSendApi={selectedEstimate ? canSendApi(selectedEstimate.shippingLine) : false}
        isConfirming={selectedEstimate ? !!confirmingMap[selectedEstimate.id] : false}
        onEditEstimate={(est) => {
          setIsDetailModalOpen(false);
          setEditingEstimate(est);
          setIsCreateModalOpen(true);
        }}
        onNavigateTab={onNavigateTab}
        isSendingApi={selectedEstimate ? !!isSendingApiMap[selectedEstimate.id] : false}
      />

    </div>
  );
};
