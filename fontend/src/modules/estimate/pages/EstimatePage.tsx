import React, { useEffect, useState, useMemo } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { containerApi, estimateApi } from '../../../api';
import { Estimate, EstimateStatus, MaerskApiConfig, MaerskApiStatus } from '../types';
import { maerskIntegrationService } from '../services/maerskIntegrationService';
import { formatVND } from '../../../utils/format';
import { CreateEstimateModal } from '../components/CreateEstimateModal';
import { EstimateDetailModal } from '../components/EstimateDetailModal';
import { MaerskApiConfigModal } from '../components/MaerskApiConfigModal';
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

export const EstimatePage: React.FC<EstimatePageProps> = ({
  containers,
  onNavigateTab
}) => {
  // Master estimates state
  const [estimates, setEstimates] = useState<Estimate[]>([]);

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
            createdBy: job.estimate.approvedBy || 'Backend SQL',
            createdById: 'SQL',
            createdAt: job.estimate.createdAt || job.gateInDate,
            updatedAt: job.estimate.approvedAt || job.estimate.createdAt || job.gateInDate,
            repairSummary: `Estimate ${job.estimate.estimateNo}`,
            items: (job.estimate.items || []).map((item: any) => ({
              id: String(item.id), damageLocationCode: '', damageLocationName: '', damageCode: '', damageName: '',
              repairCode: '', repairMethod: item.itemDescription, description: item.itemDescription,
              quantity: item.quantity, unit: 'Cái', unitPrice: item.unitPrice, amount: item.amount,
              vatRate: 0, vatAmount: 0, totalAmount: item.amount
            })),
            subtotal: job.estimate.grandTotal - job.estimate.totalTax,
            vatRate: job.estimate.grandTotal ? job.estimate.totalTax / job.estimate.grandTotal : 0,
            vatAmount: job.estimate.totalTax,
            totalAmount: job.estimate.grandTotal,
            currency: job.estimate.currency === 'USD' ? 'USD' : 'VND',
            status: job.estimate.status === 'APPROVED' ? 'APPROVED' : job.estimate.status === 'REJECTED' ? 'REJECTED' : 'SUBMITTED',
            surveyReference: job.survey?.id,
            inspectionPhotos: [],
            notes: 'Loaded from SQL Server',
            apiTransactionHistory: []
          }));
        setEstimates(backendEstimates);
      })
      .catch((error) => console.warn('Không thể tải Estimate từ Backend SQL:', error));
  }, []);

  const updateEstimatesState = (newEstimates: Estimate[]) => {
    setEstimates(newEstimates);
  };

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
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

  // Filtered List
  const filteredEstimates = useMemo(() => {
    return estimates.filter((e) => {
      // 1. Quick Status Tab
      if (activeStatusTab === 'SUBMITTED' && e.status !== 'SUBMITTED' && e.status !== 'SENDING') return false;
      if (activeStatusTab === 'APPROVED' && e.status !== 'APPROVED') return false;
      if (activeStatusTab === 'REJECTED' && e.status !== 'REJECTED') return false;
      if (activeStatusTab === 'DRAFT_READY' && e.status !== 'DRAFT' && e.status !== 'READY') return false;
      if (activeStatusTab === 'ERROR' && e.status !== 'ERROR') return false;

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
      error: estimates.filter((e) => e.status === 'ERROR').length,
      totalVnd: estimates.reduce((sum, e) => sum + e.totalAmount, 0),
      approvedVnd: estimates.filter((e) => e.status === 'APPROVED').reduce((sum, e) => sum + (e.carrierApproval?.approvedAmount || e.totalAmount), 0)
    };
  }, [estimates]);

  // Handle Save / Add Estimate
  const handleSaveNewEstimate = async (newEst: Estimate) => {
    try {
      // Resolve the UI container number to the SQL-backed DepotJob business record.
      const jobResponse: any = await containerApi.getById(newEst.containerNo);
      if (jobResponse?.statusCode !== 200 || !jobResponse.data?.id) {
        throw new Error(jobResponse?.message || `Không tìm thấy Job SQL cho container ${newEst.containerNo}.`);
      }

      const estimateResponse: any = await estimateApi.createEstimate(jobResponse.data.id, {
        estimateNo: newEst.estimateNo,
        totalLaborCost: newEst.items.reduce((sum, item) => sum + (item.unit === 'Giờ' ? item.amount : 0), 0),
        totalMaterialCost: newEst.items.reduce((sum, item) => sum + (item.unit !== 'Giờ' ? item.amount : 0), 0),
        totalTax: newEst.vatAmount,
        grandTotal: newEst.totalAmount,
        currency: newEst.currency,
        items: newEst.items.map((item) => ({
          itemDescription: item.description || item.repairMethod,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount
        }))
      });

      if (estimateResponse?.statusCode !== 200) {
        throw new Error(estimateResponse?.message || 'Không thể lưu báo giá vào SQL Server.');
      }

      const persistedEstimate = { ...newEst, status: 'SUBMITTED' as EstimateStatus };
      const exists = estimates.some((e) => e.id === newEst.id);
      const updated = exists
        ? estimates.map((e) => (e.id === newEst.id ? persistedEstimate : e))
        : [persistedEstimate, ...estimates];
      updateEstimatesState(updated);
      showToast(`Đã lưu báo giá ${newEst.estimateNo} vào SQL Server!`);
      setEditingEstimate(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể lưu báo giá vào SQL Server.', 'error');
    }
  };

  // Handle Send to Maersk API
  const handleSendToMaersk = async (est: Estimate) => {
    setIsSendingApiMap((prev) => ({ ...prev, [est.id]: true }));

    // Set temporary status to SENDING
    const sendingState = estimates.map((e) =>
      e.id === est.id ? { ...e, status: 'SENDING' as EstimateStatus, lastApiStatus: 'SENDING' as const } : e
    );
    updateEstimatesState(sendingState);

    try {
      const result = await maerskIntegrationService.sendEstimateToMaersk(est);

      let nextStatus: EstimateStatus = 'SUBMITTED';
      if (!result.success) {
        nextStatus = 'ERROR';
      } else if (result.response?.status === 'APPROVED') {
        nextStatus = 'APPROVED';
      } else {
        nextStatus = 'SUBMITTED';
      }

      const lastApiStat: MaerskApiStatus = result.success ? 'SUCCESS' : 'FAILED';
      const updatedEstimates: Estimate[] = estimates.map((e) => {
        if (e.id === est.id) {
          const newHistory = [...(e.apiTransactionHistory || []), result.transaction];
          return {
            ...e,
            status: nextStatus,
            lastApiStatus: lastApiStat,
            lastApiResponse: result.response,
            apiTransactionHistory: newHistory,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return e;
      });

      updateEstimatesState(updatedEstimates);

      // Also update selectedEstimate if opened
      const currentUpdated = updatedEstimates.find((e) => e.id === est.id);
      if (currentUpdated && selectedEstimate?.id === est.id) {
        setSelectedEstimate(currentUpdated);
      }

      if (result.success) {
        showToast(`Đã gửi API Maersk thành công! Mã tham chiếu: ${result.response?.referenceNo}`, 'success');
      } else {
        showToast(`Gửi API Maersk thất bại: ${result.error?.message}`, 'error');
      }
    } catch (err: any) {
      showToast(`Lỗi bất ngờ khi gọi API: ${err?.message || 'Network Error'}`, 'error');
    } finally {
      setIsSendingApiMap((prev) => ({ ...prev, [est.id]: false }));
    }
  };

  // Simulate Carrier Approval / Rejection Callback
  const handleSimulateCarrierDecision = async (
    estimateId: string,
    decision: 'APPROVED' | 'REJECTED',
    details?: any
  ) => {
    const targetEstimate = estimates.find((e) => e.id === estimateId);
    const jobId = targetEstimate?.containerId || estimateId;

    try {
      if (decision === 'APPROVED') {
        const response: any = await estimateApi.approveEstimate(
          jobId,
          details?.approvedBy || `Đại diện Hãng tàu ${targetEstimate?.shippingLine || 'Hãng tàu'}`
        );
        if (response?.statusCode !== 200) {
          throw new Error(response?.message || 'Không thể ghi nhận phê duyệt báo giá vào backend.');
        }
      } else {
        const response: any = await estimateApi.rejectEstimate(
          jobId,
          details?.rejectReason || 'Đơn giá vật tư vượt mức hợp đồng khung. Yêu cầu lập lại báo giá điều chỉnh.',
          details?.approvedBy || `Đại diện Hãng tàu ${targetEstimate?.shippingLine || 'Hãng tàu'}`
        );
        if (response?.statusCode !== 200) {
          throw new Error(response?.message || 'Không thể ghi nhận từ chối báo giá vào backend.');
        }
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể đồng bộ quyết định hãng tàu.', 'error');
      return;
    }

    const updated = estimates.map((e) => {
      if (e.id === estimateId) {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        return {
          ...e,
          status: decision as EstimateStatus,
          updatedAt: now,
          carrierApproval: {
            status: decision,
            authCode: details?.authCode || `${e.shippingLine}-AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
            approvedAmount: decision === 'APPROVED' ? (details?.approvedAmount || e.totalAmount) : 0,
            approvedAt: now,
            approvedBy: details?.approvedBy || `Đại diện Hãng tàu ${e.shippingLine}`,
            rejectCode: details?.rejectCode || (decision === 'REJECTED' ? 'CEDEX_PRICE_EXCEEDED' : undefined),
            rejectReason: details?.rejectReason || (decision === 'REJECTED' ? 'Đơn giá vật tư vượt mức hợp đồng khung. Yêu cầu lập lại báo giá điều chỉnh.' : undefined),
            comments: details?.comments || (decision === 'APPROVED' ? 'Phê duyệt 100% chi phí sửa chữa theo hợp đồng.' : 'Từ chối phương pháp thay mới.')
          }
        };
      }
      return e;
    });

    updateEstimatesState(updated);

    const updatedCurrent = updated.find((e) => e.id === estimateId);
    if (updatedCurrent && selectedEstimate?.id === estimateId) {
      setSelectedEstimate(updatedCurrent);
    }

    if (decision === 'APPROVED') {
      showToast(`Hãng tàu đã DUYỆT Báo giá ${updatedCurrent?.estimateNo}! Sẵn sàng chuyển Work Order.`, 'success');
    } else {
      showToast(`Hãng tàu TỪ CHỐI Báo giá ${updatedCurrent?.estimateNo}! Vui lòng lập bản điều chỉnh.`, 'error');
    }
  };

  const getStatusBadge = (status: EstimateStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold font-mono inline-block">
            Draft &bull; Nháp
          </span>
        );
      case 'READY':
        return (
          <span className="px-2.5 py-1 bg-sky-950 text-sky-400 border border-sky-800 rounded-lg text-xs font-bold font-mono inline-block">
            Ready &bull; Chờ gửi
          </span>
        );
      case 'SENDING':
        return (
          <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Sending &bull; Đang gửi</span>
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Chờ Hãng Tàu Duyệt</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>HÃNG TÀU ĐÃ DUYỆT</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>TỪ CHỐI / SỬA LẠI</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="px-2.5 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded-lg text-xs font-bold font-mono inline-block">
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
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
              : toastMessage.type === 'error'
              ? 'bg-rose-950 text-rose-300 border-rose-500'
              : 'bg-blue-950 text-blue-300 border-blue-500'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 text-[11px] font-bold rounded-md font-mono">
                6. BÁO GIÁ SỬA CHỮA
              </span>
              <h2 className="text-xl font-bold text-white">Quản Lý Mã Báo Giá EMR &bull; Tiếp Nhận Phản Hồi Hãng Tàu</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Lập dự toán sửa chữa Container CL/DM, gửi API/EDI và theo dõi trạng thái Hãng tàu Phê duyệt (Approved) hoặc Từ chối (Rejected).
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateTab('approval')}
            className="px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 font-bold text-xs rounded-xl border border-purple-500/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Cổng Phê Duyệt Hãng Tàu (7)</span>
          </button>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span>Cấu Hình API Maersk</span>
          </button>

          <button
            onClick={() => {
              setEditingEstimate(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Lập Báo Giá (Estimate)</span>
          </button>
        </div>
      </div>

      {/* Carrier Approval Workflow Diagram & Quick Guide */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Quy Trình Gửi Báo Giá &bull; Tiếp Nhận Quyết Định Hãng Tàu (Carrier EMR Workflow)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Tự động đồng bộ EDI/API 2 chiều giữa Depot và Hãng Tàu (Maersk, MSC, ONE, CMA...)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 relative group">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className="font-bold text-amber-400">BƯỚC 1</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">DRAFT / READY</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Lập Báo Giá EMR</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Nhập mã linh kiện CEDEX, đơn giá theo biểu phí hợp đồng khung và đính kèm ảnh giám định e-EIR.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-blue-900/40 relative group">
            <div className="flex items-center justify-between text-[11px] font-mono text-blue-400 mb-1">
              <span className="font-bold text-blue-400">BƯỚC 2</span>
              <span className="px-1.5 py-0.5 bg-blue-950 border border-blue-800 rounded text-[10px]">GỬI API / EDI</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Truyền Bản Tin Hãng Tàu</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bấm <strong className="text-blue-300">"Gửi API"</strong> để đẩy dữ liệu XML/JSON sang cổng EMR Maersk/MSC và nhận mã Request ID.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-purple-900/40 relative group">
            <div className="flex items-center justify-between text-[11px] font-mono text-purple-400 mb-1">
              <span className="font-bold text-purple-400">BƯỚC 3</span>
              <span className="px-1.5 py-0.5 bg-purple-950 border border-purple-800 rounded text-[10px]">CHỜ XEM XÉT</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Hãng Tàu Thẩm Định</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Trạng thái <strong className="text-purple-300">SUBMITTED</strong>. Đại diện kỹ thuật hãng tàu đối chiếu ảnh IICL và định mức chi phí.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-emerald-900/40 relative group">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1">
              <span className="font-bold text-emerald-400">BƯỚC 4</span>
              <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-800 rounded text-[10px]">QUYẾT ĐỊNH</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Nhận Quyết Định Hãng Tàu</h4>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Duyệt: Cấp Auth Code &rarr; Ra Lệnh WO</span>
              </div>
              <div className="flex items-center gap-1 text-purple-300 font-semibold">
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
          className={`p-3.5 bg-slate-900 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'ALL' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Tất Cả Estimate</div>
          <div className="text-xl font-mono font-bold text-white mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">{formatVND(stats.totalVnd)}</div>
        </div>

        <div 
          onClick={() => setActiveStatusTab('SUBMITTED')}
          className={`p-3.5 bg-slate-900 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'SUBMITTED' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-blue-900/40 hover:border-blue-700'
          }`}
        >
          <div className="text-[10px] text-blue-400 uppercase font-semibold flex items-center justify-between">
            <span>Chờ Hãng Tàu Duyệt</span>
            <Clock className="w-3 h-3" />
          </div>
          <div className="text-xl font-mono font-bold text-blue-300 mt-0.5">{stats.submitted}</div>
          <div className="text-[10px] text-blue-400/80 mt-0.5">Đã gửi API / EDI</div>
        </div>

        <div 
          onClick={() => setActiveStatusTab('APPROVED')}
          className={`p-3.5 bg-slate-900 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'APPROVED' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-emerald-900/40 hover:border-emerald-700'
          }`}
        >
          <div className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center justify-between">
            <span>Hãng Tàu ĐÃ DUYỆT</span>
            <CheckCircle2 className="w-3 h-3" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-300 mt-0.5">{stats.approved}</div>
          <div className="text-[10px] text-emerald-400/80 truncate mt-0.5">{formatVND(stats.approvedVnd)}</div>
        </div>

        <div 
          onClick={() => setActiveStatusTab('REJECTED')}
          className={`p-3.5 bg-slate-900 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'REJECTED' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-purple-900/40 hover:border-purple-700'
          }`}
        >
          <div className="text-[10px] text-purple-400 uppercase font-semibold flex items-center justify-between">
            <span>TỪ CHỐI / SỬA LẠI</span>
            <XCircle className="w-3 h-3" />
          </div>
          <div className="text-xl font-mono font-bold text-purple-300 mt-0.5">{stats.rejected}</div>
          <div className="text-[10px] text-purple-400/80 mt-0.5">Cần lập Revision</div>
        </div>

        <div 
          onClick={() => setActiveStatusTab('DRAFT_READY')}
          className={`p-3.5 bg-slate-900 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'DRAFT_READY' ? 'border-sky-500 ring-1 ring-sky-500' : 'border-sky-900/40 hover:border-sky-700'
          }`}
        >
          <div className="text-[10px] text-sky-400 uppercase font-semibold">Nháp &bull; Chờ Gửi</div>
          <div className="text-xl font-mono font-bold text-sky-300 mt-0.5">{stats.draft + stats.ready}</div>
          <div className="text-[10px] text-sky-400/80 mt-0.5">{stats.draft} nháp / {stats.ready} sẵn sàng</div>
        </div>

        <div 
          onClick={() => setActiveStatusTab('ERROR')}
          className={`p-3.5 bg-slate-900 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'ERROR' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-rose-900/40 hover:border-rose-700'
          }`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-semibold flex items-center justify-between">
            <span>Lỗi Gửi API</span>
            <AlertCircle className="w-3 h-3" />
          </div>
          <div className="text-xl font-mono font-bold text-rose-300 mt-0.5">{stats.error}</div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">Cần bấm Gửi lại</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar (Section 6.7) */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        {/* Status Quick Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveStatusTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeStatusTab === 'ALL'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Tất Cả ({stats.total})
            </button>

            <button
              onClick={() => setActiveStatusTab('SUBMITTED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeStatusTab === 'SUBMITTED'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-950 text-blue-400 hover:text-white border border-blue-900/40'
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
                  : 'bg-slate-950 text-emerald-400 hover:text-white border border-emerald-900/40'
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
                  : 'bg-slate-950 text-purple-400 hover:text-white border border-purple-900/40'
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
                  : 'bg-slate-950 text-sky-400 hover:text-white border border-sky-900/40'
              }`}
            >
              Nháp / Chờ Gửi ({stats.draft + stats.ready})
            </button>

            <button
              onClick={() => setActiveStatusTab('ERROR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeStatusTab === 'ERROR'
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-slate-950 text-rose-400 hover:text-white border border-rose-900/40'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Lỗi Gửi ({stats.error})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            Tìm thấy <strong className="text-amber-400">{filteredEstimates.length}</strong> / {estimates.length} báo giá
          </span>
        </div>

        {/* Multi-criteria Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Mã Estimate */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Mã Estimate:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="EST-2026..."
                value={searchEstimateNo}
                onChange={(e) => setSearchEstimateNo(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 2. Số Container */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Số Container:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="MSCU..."
                value={searchContainerNo}
                onChange={(e) => setSearchContainerNo(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 3. Shipping Line */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Hãng Tàu (Shipping Line):</label>
            <select
              value={filterShippingLine}
              onChange={(e) => setFilterShippingLine(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
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
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Trạng Thái:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            >
              <option value="ALL">-- Tất cả trạng thái --</option>
              <option value="DRAFT">Draft (Nháp)</option>
              <option value="READY">Ready (Chờ gửi)</option>
              <option value="SENDING">Sending (Đang gửi)</option>
              <option value="SUBMITTED">Submitted (Chờ duyệt)</option>
              <option value="APPROVED">Approved (Hãng tàu duyệt)</option>
              <option value="REJECTED">Rejected (Từ chối/sửa lại)</option>
              <option value="ERROR">Error (Gửi lỗi)</option>
            </select>
          </div>

          {/* 5. Từ Ngày */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Từ Ngày:</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          {/* 6. Đến Ngày & Reset */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Đến Ngày:</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
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
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
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
            <tbody className="divide-y divide-slate-800/60">
              {filteredEstimates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-400">Không tìm thấy mã báo giá nào phù hợp.</p>
                    <p className="text-xs text-slate-500 mt-1">Hãy thử xóa bộ lọc hoặc bấm "+ Lập Báo Giá" để tạo mới.</p>
                  </td>
                </tr>
              ) : (
                filteredEstimates.map((est) => {
                  const isSendingThis = isSendingApiMap[est.id] || est.status === 'SENDING';
                  return (
                    <tr key={est.id} className="hover:bg-slate-800/40 transition">
                      {/* Mã Estimate */}
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedEstimate(est);
                            setIsDetailModalOpen(true);
                          }}
                          className="font-mono font-bold text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{est.estimateNo}</span>
                        </button>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {est.items.length} hạng mục CEDEX
                        </div>
                      </td>

                      {/* Số Container */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-white text-sm">{est.containerNo}</div>
                        <div className="text-[11px] text-slate-400">{est.size} &bull; {est.isoCode}</div>
                      </td>

                      {/* Hãng Tàu */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                          {est.shippingLine}
                        </span>
                      </td>

                      {/* Nội Dung Sửa Chữa */}
                      <td className="p-4 max-w-xs">
                        <div className="text-slate-200 line-clamp-2" title={est.repairSummary}>
                          {est.repairSummary}
                        </div>
                      </td>

                      {/* Tổng Tiền */}
                      <td className="p-4 text-right">
                        <div className="font-mono font-black text-emerald-400 text-sm">
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
                            <div className="font-mono text-xs font-bold text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{est.carrierApproval?.authCode || est.lastApiResponse?.referenceNo || 'APPROVED'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Duyệt: <strong className="text-emerald-400">{formatVND(est.carrierApproval?.approvedAmount || est.totalAmount)}</strong>
                            </div>
                            <button
                              onClick={() => onNavigateTab('repair')}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                              title="Chuyển sang thi công sửa chữa"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Chuyển sang sửa chữa &rarr;</span>
                            </button>
                          </div>
                        ) : est.status === 'REJECTED' ? (
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-purple-300 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-purple-400" />
                              <span>Từ chối / Yêu cầu sửa</span>
                            </div>
                            <div className="text-[10px] text-rose-300 line-clamp-2" title={est.carrierApproval?.rejectReason || est.carrierApproval?.comments || 'Đơn giá vượt mức hợp đồng'}>
                              {est.carrierApproval?.rejectReason || est.carrierApproval?.comments || 'Đơn giá vượt mức hợp đồng'}
                            </div>
                          </div>
                        ) : est.status === 'ERROR' ? (
                          <div>
                            <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Lỗi API (HTTP {est.apiTransactionHistory[est.apiTransactionHistory.length - 1]?.httpStatusCode || 400})</span>
                            </div>
                            <div className="text-[10px] text-rose-300 truncate max-w-[140px]" title={est.apiTransactionHistory[est.apiTransactionHistory.length - 1]?.errorMessage}>
                              {est.apiTransactionHistory[est.apiTransactionHistory.length - 1]?.errorCode || 'Lỗi gửi'}
                            </div>
                          </div>
                        ) : est.lastApiResponse?.referenceNo ? (
                          <div>
                            <div className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Ref: {est.lastApiResponse.referenceNo}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Đã tiếp nhận &bull; Chờ duyệt
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Chưa gửi API</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If Approved: ONLY allow navigating to Repair or Viewing details - completely locked from editing/sending/re-approving */}
                          {est.status === 'APPROVED' ? (
                            <button
                              onClick={() => onNavigateTab('repair')}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-950 transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                              title="Báo giá đã được Hãng tàu phê duyệt (APPROVED) -> Chuyển ngay qua phân hệ Sửa Chữa (Work Order)"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Chuyển Qua Sửa Chữa</span>
                            </button>
                          ) : est.status === 'REJECTED' ? (
                            <button
                              onClick={() => {
                                setEditingEstimate(est);
                                setIsCreateModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                              title="Lập bản điều chỉnh sửa lại báo giá"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Sửa lại</span>
                            </button>
                          ) : est.status === 'ERROR' ? (
                            <button
                              onClick={() => handleSendToMaersk(est)}
                              disabled={isSendingThis}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              title="Gửi lại yêu cầu API Maersk"
                            >
                              <RefreshCw className={`w-3 h-3 ${isSendingThis ? 'animate-spin' : ''}`} />
                              <span>Gửi lại</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendToMaersk(est)}
                              disabled={isSendingThis || est.status === 'SENDING'}
                              className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              title="Gửi sang API Hãng Tàu"
                            >
                              <Send className={`w-3 h-3 ${isSendingThis ? 'animate-spin' : ''}`} />
                              <span>{isSendingThis ? 'Đang gửi...' : 'Gửi API'}</span>
                            </button>
                          )}

                          {/* View Detail Modal */}
                          <button
                            onClick={() => {
                              setSelectedEstimate(est);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
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
                              className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
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
      <CreateEstimateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingEstimate(null);
        }}
        onSave={handleSaveNewEstimate}
        containers={containers}
        editEstimate={editingEstimate}
      />

      <EstimateDetailModal
        estimate={selectedEstimate}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEstimate(null);
        }}
        onSendToMaersk={handleSendToMaersk}
        onEditEstimate={(est) => {
          setIsDetailModalOpen(false);
          setEditingEstimate(est);
          setIsCreateModalOpen(true);
        }}
        onSimulateCarrierDecision={handleSimulateCarrierDecision}
        onNavigateTab={onNavigateTab}
        isSendingApi={selectedEstimate ? !!isSendingApiMap[selectedEstimate.id] : false}
      />

      <MaerskApiConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigSaved={(config) => {
          showToast(`Đã lưu cấu hình Maersk API (${config.environment})!`, 'info');
        }}
      />
    </div>
  );
};
