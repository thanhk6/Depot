import React, { useState } from 'react';
import { Estimate, EstimateApiTransaction } from '../types';
import { formatVND } from '../../../utils/format';
import { ApiTransactionDetailModal } from './ApiTransactionDetailModal';
import { 
  Calculator, 
  Send, 
  RefreshCw, 
  FileText, 
  Server, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Camera, 
  Wrench, 
  DollarSign, 
  Printer, 
  Copy, 
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Eye,
  Check,
  X,
  ShieldCheck,
  RotateCcw,
  Building2
} from 'lucide-react';

interface EstimateDetailModalProps {
  estimate: Estimate | null;
  isOpen: boolean;
  onClose: () => void;
  onSendToMaersk: (estimate: Estimate) => Promise<void>;
  onEditEstimate: (estimate: Estimate) => void;
  onSimulateCarrierDecision?: (
    estimateId: string, 
    decision: 'APPROVED' | 'REJECTED', 
    details?: any
  ) => void;
  onNavigateTab?: (tabId: string) => void;
  isSendingApi?: boolean;
}

export const EstimateDetailModal: React.FC<EstimateDetailModalProps> = ({
  estimate,
  isOpen,
  onClose,
  onSendToMaersk,
  onEditEstimate,
  onSimulateCarrierDecision,
  onNavigateTab,
  isSendingApi = false
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'API_RESULT' | 'API_HISTORY' | 'CARRIER_DECISION'>('DETAILS');
  const [selectedTxn, setSelectedTxn] = useState<EstimateApiTransaction | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !estimate) return null;

  const getStatusBadge = (status: Estimate['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold font-mono">DRAFT &bull; Nháp</span>;
      case 'READY':
        return <span className="px-2.5 py-1 bg-sky-950 text-sky-400 border border-sky-800 rounded-lg text-xs font-bold font-mono">READY &bull; Chờ gửi</span>;
      case 'SENDING':
        return (
          <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>SENDING &bull; Đang gửi Maersk</span>
          </span>
        );
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 bg-blue-950 text-blue-400 border border-blue-800 rounded-lg text-xs font-bold font-mono">SUBMITTED &bull; Đã gửi Hãng Tàu</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> APPROVED &bull; Hãng tàu đã duyệt</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 bg-purple-950 text-purple-400 border border-purple-800 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1"><X className="w-3.5 h-3.5" /> REJECTED &bull; Từ chối / Yêu cầu sửa</span>;
      case 'ERROR':
        return <span className="px-2.5 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded-lg text-xs font-bold font-mono">ERROR &bull; Gửi lỗi</span>;
      default:
        return null;
    }
  };

  const handleCopyEstimateNo = () => {
    navigator.clipboard.writeText(estimate.estimateNo);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyEstimateNo}
                  className="font-mono text-base font-black text-white hover:text-amber-400 transition flex items-center gap-1 cursor-pointer"
                  title="Click để sao chép mã"
                >
                  <span>{estimate.estimateNo}</span>
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                </button>
                {getStatusBadge(estimate.status)}
                {estimate.carrierApproval?.authCode && (
                  <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-[11px] rounded">
                    Auth: {estimate.carrierApproval.authCode}
                  </span>
                )}
                {estimate.lastApiResponse?.referenceNo && (
                  <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 font-mono text-[11px] rounded">
                    Ref: {estimate.lastApiResponse.referenceNo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Container: <strong className="text-white font-mono">{estimate.containerNo}</strong> ({estimate.size} &bull; {estimate.shippingLine}) &bull; Người lập: <span className="text-slate-300">{estimate.createdBy}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* If Approved: ONLY show button to go to Repair (Work Order), strictly lock from editing and re-sending */}
            {estimate.status === 'APPROVED' ? (
              onNavigateTab && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('repair');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-1.5 cursor-pointer"
                  title="Chuyển ngay sang phân hệ Sửa Chữa (Work Order) để giao việc cho thợ cơ khí"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Chuyển Qua Sửa Chữa (Work Order)</span>
                </button>
              )
            ) : (
              <>
                {/* If Rejected, button to edit/revise */}
                {estimate.status === 'REJECTED' && (
                  <button
                    onClick={() => onEditEstimate(estimate)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Lập Bản Điều Chỉnh (Revise)</span>
                  </button>
                )}

                {/* Retry or Send Button */}
                {estimate.status === 'ERROR' ? (
                  <button
                    onClick={() => onSendToMaersk(estimate)}
                    disabled={isSendingApi}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSendingApi ? 'animate-spin' : ''}`} />
                    <span>{isSendingApi ? 'Đang Gửi Lại...' : 'Gửi Lại (Retry)'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSendToMaersk(estimate)}
                    disabled={isSendingApi || estimate.status === 'SENDING'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingApi ? 'animate-spin' : ''}`} />
                    <span>
                      {isSendingApi ? 'Đang Gửi API...' : estimate.status === 'SUBMITTED' ? 'Gửi Lại Cập Nhật' : 'Gửi API Maersk'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => onEditEstimate(estimate)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  Chỉnh Sửa
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-950 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 text-xs font-bold uppercase transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'DETAILS'
                ? 'text-amber-400 border-amber-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Chi Tiết Báo Giá ({estimate.items.length} Hạng Mục)</span>
          </button>

          <button
            onClick={() => setActiveTab('CARRIER_DECISION')}
            className={`py-3 text-xs font-bold uppercase transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'CARRIER_DECISION'
                ? 'text-purple-400 border-purple-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Phản Hồi &amp; Quyết Định Hãng Tàu</span>
            {estimate.status === 'APPROVED' && (
              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] rounded font-bold font-mono">Duyệt</span>
            )}
            {estimate.status === 'REJECTED' && (
              <span className="px-1.5 py-0.2 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] rounded font-bold font-mono">Từ chối</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('API_RESULT')}
            className={`py-3 text-xs font-bold uppercase transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'API_RESULT'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Kết Quả API Maersk</span>
            {estimate.lastApiResponse && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
            {estimate.status === 'ERROR' && (
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('API_HISTORY')}
            className={`py-3 text-xs font-bold uppercase transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'API_HISTORY'
                ? 'text-sky-400 border-sky-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Lịch Sử Gửi API ({estimate.apiTransactionHistory?.length || 0} Lần)</span>
          </button>
        </div>

        {/* Content Body based on Tab */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* TAB 1: ESTIMATE DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-6">
              {/* Approved Status Call-to-Action Banner */}
              {estimate.status === 'APPROVED' && (
                <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900/90 to-slate-900 border border-emerald-500/80 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-lg shadow-emerald-950/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>HÃNG TÀU {estimate.shippingLine} ĐÃ DUYỆT BÁO GIÁ THÀNH CÔNG</span>
                        <span className="font-mono text-xs px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded border border-emerald-700">
                          Auth: {estimate.carrierApproval?.authCode || 'APPROVED-OK'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300/90 mt-0.5">
                        Số tiền được duyệt: <strong className="text-white font-mono">{formatVND(estimate.carrierApproval?.approvedAmount || estimate.totalAmount)}</strong> &bull; Đã đủ điều kiện chuyển sang phân hệ Sửa Chữa (Work Order).
                      </p>
                    </div>
                  </div>
                  {onNavigateTab && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab('repair');
                      }}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>CHUYỂN QUA SỬA CHỮA &rarr;</span>
                    </button>
                  )}
                </div>
              )}

              {/* Top Banner Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Container / Type</div>
                  <div className="text-sm font-mono font-bold text-white mt-0.5">{estimate.containerNo}</div>
                  <div className="text-[11px] text-slate-400">{estimate.size} &bull; {estimate.isoCode}</div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Shipping Line</div>
                  <div className="text-sm font-mono font-bold text-blue-400 mt-0.5">{estimate.shippingLine}</div>
                  <div className="text-[11px] text-slate-400">Chủ Khai Thác Vỏ</div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Thời Gian Lập</div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">{estimate.createdAt}</div>
                  <div className="text-[11px] text-slate-500">Cập nhật: {estimate.updatedAt}</div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Tổng Tiền Báo Giá</div>
                  <div className="text-sm font-mono font-black text-emerald-400 mt-0.5">
                    {formatVND(estimate.totalAmount)}
                  </div>
                  <div className="text-[11px] text-amber-400">VAT: {(estimate.vatRate * 100).toFixed(0)}% ({formatVND(estimate.vatAmount)})</div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <span>Hạng Mục Sửa Chữa Chuẩn CEDEX / ISO 9897</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    Tạm tính: {formatVND(estimate.subtotal)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Vị Trí &amp; Mã CEDEX</th>
                        <th className="py-2.5 px-3">Hư Hỏng &bull; Phương Pháp</th>
                        <th className="py-2.5 px-3">Mô Tả Kỹ Thuật</th>
                        <th className="py-2.5 px-3 text-right">SL / Đơn Vị</th>
                        <th className="py-2.5 px-3 text-right">Đơn Giá (VND)</th>
                        <th className="py-2.5 px-3 text-right">Thành Tiền (VND)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {estimate.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-900/50">
                          <td className="py-3 px-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                              {item.cedexCode || `${item.damageLocationCode}-${item.damageCode}-${item.repairCode}`}
                            </span>
                            <div className="text-[11px] text-slate-300 mt-1">{item.damageLocationName}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-rose-300">{item.damageName}</div>
                            <div className="text-[11px] text-blue-300">{item.repairMethod}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-300 max-w-xs">{item.description}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">
                            {formatVND(item.unitPrice)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatVND(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal & VAT summary */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400">
                    Ghi chú kỹ thuật: <span className="text-slate-200">{estimate.notes || 'Không có ghi chú.'}</span>
                  </div>
                  <div className="space-y-1 text-right font-mono min-w-[240px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Tạm tính (Subtotal):</span>
                      <span className="text-white">{formatVND(estimate.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Thuế VAT ({(estimate.vatRate * 100).toFixed(0)}%):</span>
                      <span className="text-amber-400">+{formatVND(estimate.vatAmount)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800">
                      <span>Tổng Tiền Báo Giá:</span>
                      <span className="text-emerald-400">{formatVND(estimate.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos */}
              {estimate.inspectionPhotos && estimate.inspectionPhotos.length > 0 && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-purple-400" />
                    <span>Hình Ảnh Giám Định Hiện Trường e-EIR ({estimate.inspectionPhotos.length} Ảnh)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {estimate.inspectionPhotos.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-800 group aspect-video">
                        <img src={url} alt={`Damage photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 text-white rounded-lg text-xs flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Phóng to</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CARRIER DECISION (PHẢN HỒI & QUYẾT ĐỊNH HÃNG TÀU) */}
          {activeTab === 'CARRIER_DECISION' && (
            <div className="space-y-6">
              {/* Carrier status banner */}
              {estimate.status === 'APPROVED' ? (
                <div className="p-6 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-emerald-900 text-emerald-300 font-mono font-bold text-xs rounded">
                            APPROVED
                          </span>
                          <h3 className="text-base font-bold text-white">
                            Hãng Tàu {estimate.shippingLine} Đã Phê Duyệt Báo Giá
                          </h3>
                        </div>
                        <p className="text-xs text-emerald-300 mt-0.5">
                          Hồ sơ EMR đủ điều kiện chuyển xưởng kỹ thuật thi công sửa chữa Work Order.
                        </p>
                      </div>
                    </div>

                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateTab('repair');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>Mở Lệnh Sửa Chữa (Work Order)</span>
                      </button>
                    )}
                  </div>

                  {/* Decision attributes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-emerald-800/60 text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Mã Ủy Quyền (Auth Code)</div>
                      <div className="font-mono text-sm font-bold text-amber-300 mt-0.5">
                        {estimate.carrierApproval?.authCode || 'MAEU-AUTH-2026-982103'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Số Tiền Phê Duyệt</div>
                      <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5">
                        {formatVND(estimate.carrierApproval?.approvedAmount || estimate.totalAmount)}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Thời Gian Duyệt</div>
                      <div className="font-mono text-xs text-white mt-0.5">
                        {estimate.carrierApproval?.approvedAt || estimate.updatedAt}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Người / Cổng Phê Duyệt</div>
                      <div className="text-xs text-slate-200 mt-0.5">
                        {estimate.carrierApproval?.approvedBy || `Hệ thống EDI ${estimate.shippingLine}`}
                      </div>
                    </div>
                  </div>

                  {estimate.carrierApproval?.comments && (
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/50 text-xs text-slate-300">
                      <span className="font-bold text-emerald-400">Ghi chú từ Hãng Tàu:</span> {estimate.carrierApproval.comments}
                    </div>
                  )}
                </div>
              ) : estimate.status === 'REJECTED' ? (
                <div className="p-6 bg-purple-950/60 border border-purple-500/60 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/40">
                        <XCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-purple-900 text-purple-200 font-mono font-bold text-xs rounded">
                            REJECTED / TỪ CHỐI
                          </span>
                          <h3 className="text-base font-bold text-white">
                            Hãng Tàu {estimate.shippingLine} Không Duyệt / Yêu Cầu Sửa Đổi
                          </h3>
                        </div>
                        <p className="text-xs text-purple-300 mt-0.5">
                          Báo giá bị từ chối do không thỏa tiêu chuẩn hợp đồng khung hoặc phương pháp sửa chữa.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onEditEstimate(estimate)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Lập Bản Báo Giá Điều Chỉnh (Revise)</span>
                    </button>
                  </div>

                  {/* Rejection Details */}
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-purple-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Mã Lý Do Từ Chối: {estimate.carrierApproval?.rejectCode || 'CEDEX_PRICE_EXCEEDED'}</span>
                      </span>
                      <span className="text-slate-400 font-mono">
                        Từ chối lúc: {estimate.carrierApproval?.approvedAt || estimate.updatedAt}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-rose-200 bg-rose-950/40 p-3 rounded-lg border border-rose-900/40">
                      "{estimate.carrierApproval?.rejectReason || estimate.carrierApproval?.comments || 'Đơn giá vượt hạn mức hợp đồng khung năm 2026. Đề xuất điều chỉnh giảm đơn giá hoặc chuyển sang phương pháp nắn vá.'}"
                    </p>
                    {estimate.carrierApproval?.suggestedAction && (
                      <div className="text-xs text-amber-300 flex items-center gap-1">
                        <strong>Khuyến nghị khắc phục:</strong> {estimate.carrierApproval.suggestedAction}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
                  <Clock className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Đang Chờ Đại Diện Hãng Tàu {estimate.shippingLine} Xem Xét</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Bản tin báo giá đã được gửi sang cổng EDI/API. Bạn có thể sử dụng các nút giả lập bên dưới để kiểm thử ngay luồng duyệt hoặc từ chối từ hãng tàu.
                    </p>
                  </div>
                </div>
              )}

              {/* Simulation Box for Carrier Decision Testing */}
              {onSimulateCarrierDecision && (
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Công Cụ Giả Lập Phản Hồi Webhook / Callback Hãng Tàu</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">Carrier EDI Simulator</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Cho phép chuyên viên kiểm thử mô phỏng tức thì phản hồi từ Hãng tàu {estimate.shippingLine}:
                  </p>

                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    <button
                      onClick={() =>
                        onSimulateCarrierDecision(estimate.id, 'APPROVED', {
                          authCode: `${estimate.shippingLine}-AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
                          approvedAmount: estimate.totalAmount,
                          approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                          approvedBy: `Đại lý Hãng tàu ${estimate.shippingLine} (EDI Auto-Approval)`,
                          comments: `Chấp thuận toàn bộ dự toán sửa chữa ${formatVND(estimate.totalAmount)}.`
                        })
                      }
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Giả Lập Hãng Tàu DUYỆT (Approve)</span>
                    </button>

                    <button
                      onClick={() =>
                        onSimulateCarrierDecision(estimate.id, 'REJECTED', {
                          rejectCode: 'CEDEX_PRICE_EXCEEDED',
                          rejectReason: 'Đơn giá nhân công và vật tư vượt hợp đồng khung. Đề nghị lập báo giá điều chỉnh giảm 15%.',
                          approvedAmount: 0,
                          approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                          approvedBy: `Đại diện Hãng tàu ${estimate.shippingLine}`,
                          comments: 'Yêu cầu chuyển sang phương pháp Nắn thẳng & Vá đắp tôn.'
                        })
                      }
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Giả Lập Hãng Tàu TỪ CHỐI (Reject)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: API RESULT */}
          {activeTab === 'API_RESULT' && (
            <div className="space-y-6">
              {estimate.status === 'ERROR' ? (
                <div className="p-5 bg-rose-950/60 border border-rose-500/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <h4 className="text-sm font-bold text-rose-200">
                        Gửi API Thất Bại (HTTP {estimate.apiTransactionHistory[estimate.apiTransactionHistory.length - 1]?.httpStatusCode || 400})
                      </h4>
                    </div>
                    <button
                      onClick={() => onSendToMaersk(estimate)}
                      disabled={isSendingApi}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSendingApi ? 'animate-spin' : ''}`} />
                      <span>{isSendingApi ? 'Đang gửi...' : 'Gửi Lại (Retry)'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-rose-200">
                    {estimate.apiTransactionHistory[estimate.apiTransactionHistory.length - 1]?.errorMessage ||
                      'Không thể kết nối đến cổng EMR của Maersk hoặc dữ liệu báo giá chưa khớp tiêu chuẩn CEDEX.'}
                  </p>
                </div>
              ) : estimate.lastApiResponse ? (
                <div className="p-5 bg-emerald-950/60 border border-emerald-500/80 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-emerald-200">
                      Maersk EMR API Đã Tiếp Nhận Thành Công
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-300">
                    {estimate.lastApiResponse.message}
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
                  <Server className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Báo giá này chưa được phát lệnh gửi sang API Maersk.
                  </p>
                  <button
                    onClick={() => onSendToMaersk(estimate)}
                    disabled={isSendingApi}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi API Maersk Ngay</span>
                  </button>
                </div>
              )}

              {/* Required Fields Breakdown */}
              {estimate.lastApiResponse && (
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5">
                    <Server className="w-4 h-4" />
                    <span>6.4. Bảng Tra Cứu Thông Tin Phản Hồi Từ Maersk (Maersk EMR Direct Response)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Mã Estimate</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{estimate.estimateNo}</div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Số Container</div>
                      <div className="font-mono text-xs font-bold text-amber-300 mt-0.5">{estimate.containerNo}</div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Mã Tham Chiếu Maersk (Reference No)</div>
                      <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                        {estimate.lastApiResponse.referenceNo}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Request ID</div>
                      <div className="font-mono text-xs text-cyan-300 mt-0.5 truncate" title={estimate.lastApiResponse.requestId}>
                        {estimate.lastApiResponse.requestId}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Transaction ID</div>
                      <div className="font-mono text-xs text-purple-300 mt-0.5 truncate" title={estimate.lastApiResponse.transactionId}>
                        {estimate.lastApiResponse.transactionId}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">HTTP Status / Thời Gian Gửi</div>
                      <div className="font-mono text-xs text-slate-300 mt-0.5">
                        HTTP {estimate.lastApiResponse.httpStatusCode} &bull; {estimate.lastApiResponse.submittedAt}
                      </div>
                    </div>
                  </div>

                  {/* Raw JSON Viewer */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Nội Dung Phản Hồi Raw JSON:</span>
                    <pre className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60 leading-relaxed">
                      {JSON.stringify(estimate.lastApiResponse.rawResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: API HISTORY */}
          {activeTab === 'API_HISTORY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>6.6. Lịch Sử Gửi API Sang Hãng Tàu (Audit Log)</span>
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  {estimate.apiTransactionHistory?.length || 0} lần ghi nhận
                </span>
              </div>

              {!estimate.apiTransactionHistory || estimate.apiTransactionHistory.length === 0 ? (
                <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>Chưa có lịch sử giao dịch API nào được ghi nhận cho báo giá này.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {estimate.apiTransactionHistory.map((txn, idx) => (
                    <div
                      key={txn.id || idx}
                      className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${
                          txn.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {txn.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">Lần gửi #{txn.attemptNo}</span>
                            <span className="font-mono text-[10px] text-slate-400">{txn.timestamp}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              txn.httpStatusCode === 200 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                            }`}>
                              HTTP {txn.httpStatusCode}
                            </span>
                          </div>
                          <div className="text-slate-400 font-mono text-[11px] mt-1">
                            Endpoint: <span className="text-slate-300">{txn.endpoint}</span> &bull; Latency: <span className="text-cyan-400">{txn.latencyMs}ms</span>
                          </div>
                          {txn.errorMessage && (
                            <div className="text-rose-400 text-[11px] mt-1 font-semibold">
                              Lỗi: {txn.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi Tiết Giao Dịch</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* API Transaction Detail Modal */}
      {selectedTxn && (
        <ApiTransactionDetailModal
          transaction={selectedTxn}
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
};
