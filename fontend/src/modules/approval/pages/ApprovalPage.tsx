import React, { useState, useMemo } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { formatVND } from '../../../utils/format';
import { 
  CheckSquare, 
  Check, 
  X, 
  AlertCircle, 
  Eye, 
  Image as ImageIcon, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wrench, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface ApprovalPageProps {
  containers: ContainerRecord[];
  onApproveEstimate: (
    containerId: string, 
    authData?: { authCode: string; approvedAmount: number; notes?: string }
  ) => void;
  onRejectEstimate: (
    containerId: string, 
    reason: string, 
    rejectCode?: string
  ) => void;
  onNavigateTab: (tabId: string) => void;
}

export const ApprovalPage: React.FC<ApprovalPageProps> = ({
  containers,
  onApproveEstimate,
  onRejectEstimate,
  onNavigateTab
}) => {
  // Sync with localStorage estimates list for extra details
  const localEstimates = useMemo(() => {
    try {
      const saved = localStorage.getItem('DEPOT_ESTIMATES_LIST');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  }, []);

  // Containers with estimate or waiting approval or already approved/rejected
  const approvalContainers = useMemo(() => {
    return containers.filter(
      (c) =>
        c.estimateDetails ||
        c.status === 'WAITING_APPROVAL' ||
        c.status === 'APPROVED' ||
        c.status === 'REPAIRING' ||
        c.status === 'WAITING_ESTIMATE' ||
        c.condition === 'DM'
    );
  }, [containers]);

  // Tab & Filters state
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShippingLine, setSelectedShippingLine] = useState('ALL');

  // Modal states
  const [selectedContForAction, setSelectedContForAction] = useState<ContainerRecord | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'VIEW' | null>(null);

  // Approval Form State
  const [authCode, setAuthCode] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Rejection Form State
  const [rejectReasonType, setRejectReasonType] = useState('CEDEX_PRICE_EXCEEDED');
  const [customRejectReason, setCustomRejectReason] = useState(
    'Đơn giá vật tư thép lá và sàn gỗ cao hơn hợp đồng khung năm 2026'
  );

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Shipping lines list
  const shippingLines = useMemo(() => {
    const lines = new Set<string>();
    approvalContainers.forEach((c) => {
      if (c.shippingLine) lines.add(c.shippingLine);
    });
    return Array.from(lines);
  }, [approvalContainers]);

  // Determine Approval status of container
  const getContainerApprovalStatus = (c: ContainerRecord): 'PENDING' | 'APPROVED' | 'REJECTED' => {
    if (c.estimateDetails?.approvalStatus === 'APPROVED' || c.status === 'APPROVED' || c.status === 'REPAIRING' || c.status === 'READY_FOR_USE') {
      return 'APPROVED';
    }
    if (c.estimateDetails?.approvalStatus === 'REJECTED') {
      return 'REJECTED';
    }
    return 'PENDING';
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return approvalContainers.filter((c) => {
      const status = getContainerApprovalStatus(c);

      // Filter by Tab
      if (activeTab === 'PENDING' && status !== 'PENDING') return false;
      if (activeTab === 'APPROVED' && status !== 'APPROVED') return false;
      if (activeTab === 'REJECTED' && status !== 'REJECTED') return false;

      // Filter by Shipping line
      if (selectedShippingLine !== 'ALL' && c.shippingLine !== selectedShippingLine) {
        return false;
      }

      // Search container or estimate no
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchCont = c.containerNo.toLowerCase().includes(query);
        const matchEst = (c.estimateDetails?.estimateNo || '').toLowerCase().includes(query);
        const matchLine = c.shippingLine.toLowerCase().includes(query);
        if (!matchCont && !matchEst && !matchLine) return false;
      }

      return true;
    });
  }, [approvalContainers, activeTab, selectedShippingLine, searchTerm]);

  // Statistics count
  const stats = useMemo(() => {
    const total = approvalContainers.length;
    const pending = approvalContainers.filter((c) => getContainerApprovalStatus(c) === 'PENDING').length;
    const approved = approvalContainers.filter((c) => getContainerApprovalStatus(c) === 'APPROVED').length;
    const rejected = approvalContainers.filter((c) => getContainerApprovalStatus(c) === 'REJECTED').length;
    const totalAmount = approvalContainers.reduce((sum, c) => sum + (c.estimateDetails?.totalCost || 0), 0);
    return { total, pending, approved, rejected, totalAmount };
  }, [approvalContainers]);

  // Open Approval Modal
  const handleOpenApproveModal = (c: ContainerRecord) => {
    setSelectedContForAction(c);
    const estCost = c.estimateDetails?.totalCost || 2440000;
    setApprovedAmount(estCost);
    const linePrefix = (c.shippingLine || 'CARRIER').substring(0, 4).toUpperCase();
    setAuthCode(`${linePrefix}-AUTH-${Math.floor(100000 + Math.random() * 900000)}`);
    setApprovalNotes(`Phê duyệt 100% hạng mục sửa chữa EMR theo báo giá ${c.estimateDetails?.estimateNo || ''}`);
    setActionType('APPROVE');
  };

  // Open Rejection Modal
  const handleOpenRejectModal = (c: ContainerRecord) => {
    setSelectedContForAction(c);
    setRejectReasonType('CEDEX_PRICE_EXCEEDED');
    setCustomRejectReason('Đơn giá vật tư thép lá và sàn gỗ cao hơn hợp đồng khung năm 2026. Đề xuất điều chỉnh giảm 15% hoặc chuyển sang phương pháp nắn vá.');
    setActionType('REJECT');
  };

  // Open View Modal
  const handleOpenViewModal = (c: ContainerRecord) => {
    setSelectedContForAction(c);
    setActionType('VIEW');
  };

  // Execute Approval
  const handleConfirmApproval = () => {
    if (!selectedContForAction) return;

    onApproveEstimate(selectedContForAction.id, {
      authCode,
      approvedAmount,
      notes: approvalNotes
    });

    // Also update DEPOT_ESTIMATES_LIST in localStorage if matching container
    try {
      const saved = localStorage.getItem('DEPOT_ESTIMATES_LIST');
      if (saved) {
        const estList = JSON.parse(saved);
        const updatedEstList = estList.map((est: any) => {
          if (est.containerNo === selectedContForAction.containerNo || est.containerId === selectedContForAction.id) {
            return {
              ...est,
              status: 'APPROVED',
              carrierApproval: {
                status: 'APPROVED',
                authCode,
                approvedAmount,
                approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                approvedBy: `Đại diện Hãng tàu ${selectedContForAction.shippingLine}`,
                comments: approvalNotes
              }
            };
          }
          return est;
        });
        localStorage.setItem('DEPOT_ESTIMATES_LIST', JSON.stringify(updatedEstList));
      }
    } catch {
      // ignore
    }

    showToast(`Hãng tàu ${selectedContForAction.shippingLine} đã PHÊ DUYỆT Báo giá cho Container ${selectedContForAction.containerNo}! Mã ủy quyền: ${authCode}`, 'success');
    setActionType(null);
    setSelectedContForAction(null);
  };

  // Execute Rejection
  const handleConfirmRejection = () => {
    if (!selectedContForAction) return;

    onRejectEstimate(selectedContForAction.id, customRejectReason, rejectReasonType);

    // Also update DEPOT_ESTIMATES_LIST in localStorage if matching container
    try {
      const saved = localStorage.getItem('DEPOT_ESTIMATES_LIST');
      if (saved) {
        const estList = JSON.parse(saved);
        const updatedEstList = estList.map((est: any) => {
          if (est.containerNo === selectedContForAction.containerNo || est.containerId === selectedContForAction.id) {
            return {
              ...est,
              status: 'REJECTED',
              carrierApproval: {
                status: 'REJECTED',
                rejectCode: rejectReasonType,
                rejectReason: customRejectReason,
                approvedAmount: 0,
                approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                approvedBy: `Đại diện Hãng tàu ${selectedContForAction.shippingLine}`,
                comments: customRejectReason
              }
            };
          }
          return est;
        });
        localStorage.setItem('DEPOT_ESTIMATES_LIST', JSON.stringify(updatedEstList));
      }
    } catch {
      // ignore
    }

    showToast(`Hãng tàu ${selectedContForAction.shippingLine} ĐÃ TỪ CHỐI Báo giá cho Container ${selectedContForAction.containerNo}!`, 'error');
    setActionType(null);
    setSelectedContForAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
              : toastMessage.type === 'error'
              ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20'
              : 'bg-[#1677FF]/10 text-[#1677FF] border-[#1677FF]/20'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#1677FF]" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 bg-white border border-[#E2E8F0] rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F4F7FA] border border-[#E2E8F0] text-[#1677FF] rounded-2xl">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#F4F7FA] text-[#1677FF] border border-[#E2E8F0] text-[11px] font-bold rounded-md font-mono">
                7. DUYỆT BÁO GIÁ HÃNG TÀU
              </span>
              <h2 className="text-xl font-bold text-[#1F2937]">Cổng Phê Duyệt &amp; Tiếp Nhận Quyết Định Hãng Tàu</h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Dành cho Đại diện Hãng tàu (MSC, Maersk, CMA CGM, COSCO, ONE...): Phê duyệt chi phí EMR, cấp Authorization Code hoặc từ chối kèm lý do.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('estimate')}
            className="px-3.5 py-2.5 bg-white hover:bg-[#F4F7FA] text-[#1F2937] text-xs font-bold rounded-xl border border-[#E2E8F0] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#FAAD14]" />
            <span>Màn Hình 6. Báo Giá EMR</span>
          </button>

          <button
            onClick={() => onNavigateTab('repair')}
            className="px-3.5 py-2.5 bg-white hover:bg-[#DC2626]/5 text-[#DC2626] text-xs font-bold rounded-xl border border-[#DC2626]/20 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Wrench className="w-4 h-4" />
            <span>Lệnh Sửa Chữa (Work Order)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="text-[10px] text-[#64748B] uppercase font-semibold">Tổng Hồ Sơ Báo Giá</div>
          <div className="text-xl font-mono font-bold text-[#1F2937] mt-1">{stats.total}</div>
        </div>

        <div 
          onClick={() => setActiveTab('PENDING')}
          className={`p-4 bg-white rounded-2xl border transition cursor-pointer shadow-sm ${
            activeTab === 'PENDING' ? 'border-[#FAAD14] ring-1 ring-[#FAAD14]/30' : 'border-[#E2E8F0] hover:border-[#FAAD14]/50'
          }`}
        >
          <div className="text-[10px] text-[#FAAD14] uppercase font-semibold flex items-center justify-between">
            <span>Chờ Hãng Tàu Duyệt</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-mono font-bold text-[#FAAD14] mt-1">{stats.pending}</div>
        </div>

        <div 
          onClick={() => setActiveTab('APPROVED')}
          className={`p-4 bg-white rounded-2xl border transition cursor-pointer shadow-sm ${
            activeTab === 'APPROVED' ? 'border-[#16A34A] ring-1 ring-[#16A34A]/30' : 'border-[#E2E8F0] hover:border-[#16A34A]/50'
          }`}
        >
          <div className="text-[10px] text-[#16A34A] uppercase font-semibold flex items-center justify-between">
            <span>Hãng Tàu ĐÃ DUYỆT</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-mono font-bold text-[#16A34A] mt-1">{stats.approved}</div>
        </div>

        <div 
          onClick={() => setActiveTab('REJECTED')}
          className={`p-4 bg-white rounded-2xl border transition cursor-pointer shadow-sm ${
            activeTab === 'REJECTED' ? 'border-[#DC2626] ring-1 ring-[#DC2626]/30' : 'border-[#E2E8F0] hover:border-[#DC2626]/50'
          }`}
        >
          <div className="text-[10px] text-[#DC2626] uppercase font-semibold flex items-center justify-between">
            <span>TỪ CHỐI / KHÔNG DUYỆT</span>
            <XCircle className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-mono font-bold text-[#DC2626] mt-1">{stats.rejected}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="text-[10px] text-[#64748B] uppercase font-semibold">Tổng Giá Trị Đề Xuất</div>
          <div className="text-sm font-mono font-bold text-[#1F2937] mt-1 truncate" title={formatVND(stats.totalAmount)}>
            {formatVND(stats.totalAmount)}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl space-y-4 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-[#1677FF] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:text-[#1F2937] border border-[#E2E8F0]'
              }`}
            >
              Tất Cả Hồ Sơ ({stats.total})
            </button>

            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'bg-[#FAAD14] text-white shadow-sm'
                  : 'bg-white text-[#FAAD14] hover:bg-[#FAAD14]/5 border border-[#E2E8F0]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chờ Phê Duyệt ({stats.pending})</span>
            </button>

            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'APPROVED'
                  ? 'bg-[#16A34A] text-white shadow-sm'
                  : 'bg-white text-[#16A34A] hover:bg-[#16A34A]/5 border border-[#E2E8F0]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Hãng Tàu Đã Duyệt ({stats.approved})</span>
            </button>

            <button
              onClick={() => setActiveTab('REJECTED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'REJECTED'
                  ? 'bg-[#DC2626] text-white shadow-sm'
                  : 'bg-white text-[#DC2626] hover:bg-[#DC2626]/5 border border-[#E2E8F0]'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Từ Chối / Không Duyệt ({stats.rejected})</span>
            </button>
          </div>

          <span className="text-xs text-[#64748B]">
            Hiển thị <strong className="text-[#1F2937]">{filteredList.length}</strong> kết quả
          </span>
        </div>

        {/* Search Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Tìm theo số container (MSCU...), mã báo giá (EST-...), hãng tàu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#1F2937] focus:outline-none focus:border-[#1677FF]"
            />
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          </div>

          <div>
            <select
              value={selectedShippingLine}
              onChange={(e) => setSelectedShippingLine(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1F2937] focus:outline-none"
            >
              <option value="ALL">-- Tất cả Hãng Tàu --</option>
              {shippingLines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table: Danh Sách Báo Giá Hãng Tàu */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead>
              <tr className="bg-[#F4F7FA] border-b border-[#E2E8F0] text-[11px] text-[#64748B] font-mono">
                <th className="p-4">Số Container</th>
                <th className="p-4">Hãng Tàu</th>
                <th className="p-4">Mã Báo Giá / Ngày Gửi</th>
                <th className="p-4 text-right">Tổng Tiền Báo Giá</th>
                <th className="p-4">Quyết Định Hãng Tàu</th>
                <th className="p-4">Chi Tiết Quyết Định / Lý Do</th>
                <th className="p-4 text-right">Thao Tác Phê Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#64748B]">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-[#E2E8F0]" />
                    <p className="text-sm font-semibold text-[#1F2937]">Không tìm thấy hồ sơ báo giá nào phù hợp với bộ lọc.</p>
                    <p className="text-xs text-[#64748B] mt-1">Hãy chuyển đổi tab bộ lọc hoặc xóa từ khóa tìm kiếm.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((c) => {
                  const status = getContainerApprovalStatus(c);
                  const matchedLocal = localEstimates.find((item: any) =>
                    item.containerNo === c.containerNo || item.containerId === c.id
                  );
                  const estNo = c.estimateDetails?.estimateNo || matchedLocal?.estimateNo || `EST-${c.containerNo}`;
                  const estCost = c.estimateDetails?.totalCost || matchedLocal?.totalCost || 0;
                  const authCodeDisplay =
                    matchedLocal?.carrierApproval?.authCode ||
                    (status === 'APPROVED' ? 'APPROVED-OK' : status === 'REJECTED' ? 'REJECTED-CEDEX' : 'PENDING-AUTH');
                  const rejectReasonDisplay =
                    c.estimateDetails?.rejectReason ||
                    matchedLocal?.carrierApproval?.rejectReason ||
                    (status === 'REJECTED' ? 'Đơn giá vật tư vượt hợp đồng khung' : null);

                  return (
                    <tr key={c.id} className="hover:bg-[#F4F7FA] transition">
                      {/* Container No */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-[#1F2937] text-sm">{c.containerNo}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {c.size} &bull; {c.isoCode} &bull; <span className="text-[#DC2626] font-bold">DM</span>
                        </div>
                      </td>

                      {/* Shipping Line */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-[#1677FF] bg-[#1677FF]/5 px-2.5 py-1 rounded-lg border border-[#1677FF]/20 text-xs">
                          {c.shippingLine}
                        </span>
                      </td>

                      {/* Estimate No & Date */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-[#1F2937]">{estNo}</div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#64748B]" />
                          <span>{c.estimateDetails?.createdAt || c.gateInDate}</span>
                        </div>
                      </td>

                      {/* Total Proposed Cost */}
                      <td className="p-4 text-right">
                        <div className="font-mono font-black text-[#16A34A] text-sm">
                          {formatVND(estCost)}
                        </div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          {c.estimateDetails?.labourHours || 3.5}h công + Vật tư
                        </div>
                      </td>

                      {/* Approval Status Badge */}
                      <td className="p-4">
                        {status === 'APPROVED' ? (
                          <span className="px-2.5 py-1 bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ĐÃ DUYỆT (Approved)</span>
                          </span>
                        ) : status === 'REJECTED' ? (
                          <span className="px-2.5 py-1 bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                            <span>TỪ CHỐI (Rejected)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-[#FAAD14]/10 text-[#FAAD14] border border-[#FAAD14]/20 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Chờ Phê Duyệt</span>
                          </span>
                        )}
                      </td>

                      {/* Decision Details */}
                      <td className="p-4 max-w-xs">
                        {status === 'APPROVED' ? (
                          <div className="space-y-1">
                            <div className="text-xs font-mono font-bold text-[#16A34A]">
                              Mã duyệt: {authCodeDisplay}
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              Duyệt 100% &bull; Đã cấp phép thi công
                            </div>
                            <button
                              onClick={() => onNavigateTab('repair')}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] hover:text-[#16A34A] hover:underline cursor-pointer"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Chuyển sang sửa chữa &rarr;</span>
                            </button>
                          </div>
                        ) : status === 'REJECTED' ? (
                          <div>
                            <div className="text-xs font-bold text-[#DC2626] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Lý do từ chối:</span>
                            </div>
                            <div className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5" title={rejectReasonDisplay || ''}>
                              {rejectReasonDisplay}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-[#64748B] italic">
                            Đang chờ đại diện Hãng tàu xem xét và phản hồi
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleOpenApproveModal(c)}
                                className="px-3 py-1.5 bg-[#1677FF] hover:bg-[#0958D9] text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1"
                                title="Phê duyệt báo giá"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt (Approve)</span>
                              </button>

                              <button
                                onClick={() => handleOpenRejectModal(c)}
                                className="px-2.5 py-1.5 bg-white hover:bg-[#DC2626]/5 text-[#DC2626] border border-[#DC2626]/20 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1"
                                title="Từ chối / Yêu cầu sửa đổi"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Không Duyệt</span>
                              </button>
                            </>
                          ) : status === 'APPROVED' ? (
                            <button
                              onClick={() => onNavigateTab('repair')}
                              className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#16A34A] text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
                              title="Chuyển sang phân hệ Sửa Chữa thi công Work Order"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Chuyển Qua Sửa Chữa</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenApproveModal(c)}
                              className="px-3 py-1.5 bg-[#1677FF]/10 hover:bg-[#1677FF]/20 text-[#1677FF] rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 border border-[#1677FF]/20"
                              title="Xét duyệt lại"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#1677FF]" />
                              <span>Duyệt Lại</span>
                            </button>
                          )}

                          {/* View details */}
                          <button
                            onClick={() => handleOpenViewModal(c)}
                            className="p-1.5 text-[#64748B] hover:text-[#1F2937] bg-[#F4F7FA] hover:bg-[#E2E8F0] rounded-xl transition cursor-pointer border border-[#E2E8F0]"
                            title="Xem chi tiết biên bản & ảnh IICL"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

      {/* MODAL 1: CARRIER APPROVAL CONFIRMATION */}
      {actionType === 'APPROVE' && selectedContForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2A43]/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] bg-[#16A34A]/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#16A34A] text-white rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Hãng Tàu Phê Duyệt Báo Giá (Carrier Approval)
                  </h3>
                  <p className="text-xs text-[#16A34A]">
                    Container: <strong className="font-mono text-[#1F2937]">{selectedContForAction.containerNo}</strong> ({selectedContForAction.shippingLine})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="p-2 text-[#64748B] hover:text-[#1F2937] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-[#F4F7FA] rounded-2xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Mã Báo Giá EMR</span>
                  <span className="font-mono font-bold text-[#1F2937] text-sm">
                    {selectedContForAction.estimateDetails?.estimateNo || 'EST-20260816-00001'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Chi Phí Đề Xuất</span>
                  <span className="font-mono font-black text-[#16A34A] text-base">
                    {formatVND(selectedContForAction.estimateDetails?.totalCost || 2440000)}
                  </span>
                </div>
              </div>

              {/* Input Authorization Code */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                  Mã Phê Duyệt Hãng Tàu (Carrier Authorization Code)*:
                </label>
                <input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="MSCU-AUTH-882190..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl font-mono text-sm font-bold text-[#1F2937] focus:outline-none focus:border-[#1677FF]"
                />
              </div>

              {/* Input Approved Amount */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                  Số Tiền Hãng Tàu Duyệt (VND)*:
                </label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl font-mono text-sm font-bold text-[#1F2937] focus:outline-none focus:border-[#1677FF]"
                />
              </div>

              {/* Input Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                  Ghi Chú Phê Duyệt / Hướng Dẫn Kỹ Thuật Cho Depot:
                </label>
                <textarea
                  rows={2}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] focus:outline-none focus:border-[#1677FF]"
                />
              </div>

              <div className="p-3 bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-xl text-[#16A34A] text-[11px] leading-relaxed">
                &bull; Sau khi xác nhận phê duyệt, hệ thống sẽ tự động chuyển hồ sơ sang trạng thái <strong>APPROVED</strong> và kích hoạt phát hành <strong>Lệnh Sửa Chữa Work Order</strong> cho tổ kỹ thuật Depot.
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-[#F4F7FA] flex items-center justify-end gap-3">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 bg-white hover:bg-[#F4F7FA] text-[#1F2937] rounded-xl font-bold transition cursor-pointer border border-[#E2E8F0]"
              >
                Hủy Bỏ
              </button>

              <button
                onClick={handleConfirmApproval}
                disabled={!authCode}
                className="px-5 py-2 bg-[#1677FF] hover:bg-[#0958D9] text-white rounded-xl font-bold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Xác Nhận Phê Duyệt (Approve)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CARRIER REJECTION / REVISION REQUIRED */}
      {actionType === 'REJECT' && selectedContForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2A43]/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] bg-[#DC2626]/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#DC2626] text-white rounded-xl">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Hãng Tàu Từ Chối Báo Giá (Carrier Rejection)
                  </h3>
                  <p className="text-xs text-[#DC2626]">
                    Container: <strong className="font-mono text-[#1F2937]">{selectedContForAction.containerNo}</strong> ({selectedContForAction.shippingLine})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="p-2 text-[#64748B] hover:text-[#1F2937] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                  Chọn Danh Mục Lý Do Từ Chối Tiêu Chuẩn (CEDEX Reason Code)*:
                </label>
                <select
                  value={rejectReasonType}
                  onChange={(e) => {
                    setRejectReasonType(e.target.value);
                    if (e.target.value === 'CEDEX_PRICE_EXCEEDED') {
                      setCustomRejectReason('Đơn giá vật tư thép lá/sàn gỗ cao hơn hợp đồng khung năm 2026. Đề xuất điều chỉnh giảm.');
                    } else if (e.target.value === 'WEAR_AND_TEAR') {
                      setCustomRejectReason('Hư hỏng thuộc diện hao mòn tự nhiên (Wear & Tear) theo tiêu chuẩn IICL-6. Hãng tàu không thanh toán.');
                    } else if (e.target.value === 'CHANGE_REPAIR_METHOD') {
                      setCustomRejectReason('Đề nghị đổi phương pháp: Nắn thẳng gia nhiệt (SN) hoặc Vá đắp (P) thay vì Thay mới nguyên tấm (R).');
                    } else if (e.target.value === 'LACK_INSPECTION_PHOTOS') {
                      setCustomRejectReason('Hình ảnh giám định không đủ rõ nét hoặc thiếu ảnh chụp thước kẹp đo độ võng/móp méo.');
                    } else if (e.target.value === 'CONTAINER_DISPOSAL') {
                      setCustomRejectReason('Container đã có kế hoạch trả rỗng bán phế liệu, ngưng cấp lệnh sửa chữa.');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl font-bold text-[#1F2937] focus:outline-none focus:border-[#DC2626]"
                >
                  <option value="CEDEX_PRICE_EXCEEDED">1. Đơn giá vật tư/nhân công vượt hợp đồng khung (Over Tariff)</option>
                  <option value="WEAR_AND_TEAR">2. Tổn thất do hao mòn tự nhiên (Wear &amp; Tear - Non billable)</option>
                  <option value="CHANGE_REPAIR_METHOD">3. Yêu cầu đổi phương pháp sửa chữa (Nắn/Vá thay vì Thay mới)</option>
                  <option value="LACK_INSPECTION_PHOTOS">4. Thiếu hình ảnh giám định đối chứng IICL hoặc ảnh mờ</option>
                  <option value="CONTAINER_DISPOSAL">5. Container ngưng khai thác / chuyển bán thanh lý</option>
                  <option value="OTHER">6. Lý do khác (Nhập chi tiết bên dưới)</option>
                </select>
              </div>

              {/* Detailed Reason Text */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                  Chi Tiết Lý Do Từ Chối &amp; Hướng Dẫn Depot Lập Lại Báo Giá*:
                </label>
                <textarea
                  rows={3}
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder="Ghi rõ chi tiết hạng mục bị từ chối và hướng xử lý..."
                  className="w-full px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] focus:outline-none focus:border-[#DC2626]"
                />
              </div>

              <div className="p-3 bg-[#DC2626]/5 border border-[#DC2626]/20 rounded-xl text-[#DC2626] text-[11px] leading-relaxed">
                &bull; Khi từ chối, báo giá sẽ chuyển sang trạng thái <strong>REJECTED</strong>. Nhân viên báo giá Depot sẽ nhận được lý do để tạo bản điều chỉnh (Revise Estimate) và trình duyệt lại.
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-[#F4F7FA] flex items-center justify-end gap-3">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 bg-white hover:bg-[#F4F7FA] text-[#1F2937] rounded-xl font-bold transition cursor-pointer border border-[#E2E8F0]"
              >
                Hủy Bỏ
              </button>

              <button
                onClick={handleConfirmRejection}
                disabled={!customRejectReason}
                className="px-5 py-2 bg-[#DC2626] hover:bg-[#DC2626]/90 text-white rounded-xl font-bold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Xác Nhận Từ Chối (Reject)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW SURVEY & DAMAGE DETAILS */}
      {actionType === 'VIEW' && selectedContForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2A43]/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E2E8F0] bg-[#F4F7FA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1677FF]/10 border border-[#1677FF]/20 text-[#1677FF] rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937]">
                    Hồ Sơ Giám Định Đối Chứng &bull; Container {selectedContForAction.containerNo}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Hãng Tàu: <strong className="text-[#1677FF]">{selectedContForAction.shippingLine}</strong> &bull; Loại: {selectedContForAction.size} ({selectedContForAction.isoCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="p-2 text-[#64748B] hover:text-[#1F2937] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Cost Summary */}
              <div className="p-4 bg-[#F4F7FA] rounded-2xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Mã Báo Giá</span>
                  <span className="font-mono font-bold text-[#1F2937] text-sm">
                    {selectedContForAction.estimateDetails?.estimateNo || 'EST-MSCU-901'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Tổng Chi Phí Đề Xuất</span>
                  <span className="font-mono font-black text-[#16A34A] text-lg">
                    {formatVND(selectedContForAction.estimateDetails?.totalCost || 2440000)}
                  </span>
                </div>
              </div>

              {/* Damage List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#1F2937] uppercase flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#FAAD14]" />
                  <span>Danh Mục Hư Hỏng Khảo Sát Hiện Trường e-EIR</span>
                </h4>

                {selectedContForAction.surveyDetails?.damages && selectedContForAction.surveyDetails.damages.length > 0 ? (
                  <div className="space-y-2">
                    {selectedContForAction.surveyDetails.damages.map((dmg, idx) => (
                      <div key={idx} className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#DC2626] text-xs">
                            [{dmg.code}] {dmg.location}
                          </span>
                          <span className="px-2 py-0.5 bg-[#DC2626]/5 text-[#DC2626] border border-[#DC2626]/10 text-[10px] font-bold rounded">
                            Mức độ: {dmg.severity}
                          </span>
                        </div>
                        <p className="text-[#64748B] text-xs">{dmg.description}</p>
                        {dmg.image && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-[#E2E8F0] max-w-sm">
                            <img src={dmg.image} alt={dmg.location} className="w-full h-36 object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-[#F4F7FA] rounded-xl border border-[#E2E8F0] text-center text-[#64748B]">
                    <p>Không có danh mục hư hỏng chi tiết hoặc chưa cập nhật hình ảnh.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-[#F4F7FA] flex items-center justify-between">
              <span className="text-xs text-[#64748B]">
                Trạng thái hiện tại: <strong className="text-[#1F2937]">{selectedContForAction.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActionType(null);
                    handleOpenApproveModal(selectedContForAction);
                  }}
                  className="px-4 py-2 bg-[#1677FF] hover:bg-[#0958D9] text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Duyệt Báo Giá</span>
                </button>

                <button
                  onClick={() => {
                    setActionType(null);
                    handleOpenRejectModal(selectedContForAction);
                  }}
                  className="px-4 py-2 bg-white hover:bg-[#DC2626]/5 text-[#DC2626] border border-[#DC2626]/20 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <X className="w-4 h-4" />
                  <span>Từ Chối</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
