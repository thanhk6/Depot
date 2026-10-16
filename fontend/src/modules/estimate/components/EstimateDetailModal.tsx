import React, { useEffect, useState } from 'react';
import { Estimate, EstimateApiTransaction } from '../types';
import { formatVND, formatDateTime } from '../../../utils/format';
import { ApiTransactionDetailModal } from './ApiTransactionDetailModal';
import { EstimateItemsEditor } from './EstimateItemsEditor';
import { AemsCostSummary } from './AemsLineItems';
import {
  Calculator,
  Pencil,
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
  /** Lưu báo giá sửa trực tiếp trong tab chi tiết; trả về true nếu lưu DB thành công. */
  onSaveEstimate?: (estimate: Estimate, sendAfter?: boolean) => Promise<boolean>;
  /** Xác nhận báo giá trên hệ thống (khi chưa có API hãng tàu). */
  onConfirmEstimate?: (estimate: Estimate) => Promise<void>;
  /** Hãng tàu của báo giá đã cấu hình API → mới hiện nút gửi API. */
  canSendApi?: boolean;
  isConfirming?: boolean;
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
  onSaveEstimate,
  onConfirmEstimate,
  canSendApi = false,
  isConfirming = false,
  onSimulateCarrierDecision,
  onNavigateTab,
  isSendingApi = false
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'API_RESULT' | 'API_HISTORY' | 'CARRIER_DECISION'>('DETAILS');
  const [selectedTxn, setSelectedTxn] = useState<EstimateApiTransaction | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Đổi báo giá / đóng modal → thoát chế độ sửa.
  useEffect(() => {
    setIsEditing(false);
  }, [estimate?.id, isOpen]);

  if (!isOpen || !estimate) return null;

  const getStatusBadge = (status: Estimate['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold font-mono">DRAFT &bull; Nháp</span>;
      case 'READY':
        return <span className="px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-200 rounded-lg text-xs font-bold font-mono">READY &bull; Chờ gửi</span>;
      case 'SENDING':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>SENDING &bull; Đang gửi hãng tàu</span>
          </span>
        );
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold font-mono">SUBMITTED &bull; Đã gửi Hãng Tàu</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> APPROVED &bull; Hãng tàu đã duyệt</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1"><X className="w-3.5 h-3.5" /> REJECTED &bull; Từ chối / Yêu cầu sửa</span>;
      case 'ERROR':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold font-mono">ERROR &bull; Gửi lỗi</span>;
      default:
        return null;
    }
  };

  // Sửa ngay tại tab chi tiết (nếu trang cha hỗ trợ lưu), không thì mở form lập báo giá ở chế độ sửa.
  const startEdit = () => {
    if (!onSaveEstimate) return onEditEstimate(estimate);
    setActiveTab('DETAILS');
    setIsEditing(true);
  };

  const handleInlineSave = async (updated: Estimate, sendAfter = false) => {
    if (!onSaveEstimate) return;
    setIsSaving(true);
    try {
      if (await onSaveEstimate(updated, sendAfter)) setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyEstimateNo = () => {
    navigator.clipboard.writeText(estimate.estimateNo);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyEstimateNo}
                  className="font-mono text-base font-black text-slate-900 hover:text-amber-600 transition flex items-center gap-1 cursor-pointer"
                  title="Click để sao chép mã"
                >
                  <span>{estimate.estimateNo}</span>
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                </button>
                {getStatusBadge(estimate.status)}
                {estimate.carrierApproval?.authCode && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] rounded">
                    Auth: {estimate.carrierApproval.authCode}
                  </span>
                )}
                {estimate.lastApiResponse?.referenceNo && (
                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px] rounded">
                    Ref: {estimate.lastApiResponse.referenceNo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Container: <strong className="text-slate-900 font-mono">{estimate.containerNo}</strong> ({estimate.size} &bull; {estimate.shippingLine}) &bull; Người lập: <span className="text-slate-700">{estimate.createdBy}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Báo giá đã duyệt: khoá, không sửa / gửi lại. Màn Báo giá chỉ lập báo giá — không chuyển sang Sửa chữa từ đây. */}
            {estimate.status === 'APPROVED' ? (
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl">
                Hãng tàu đã duyệt
              </span>
            ) : (
              <>
                {/* If Rejected, button to edit/revise */}
                {estimate.status === 'REJECTED' && (
                  <button
                    onClick={startEdit}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Lập Bản Điều Chỉnh (Revise)</span>
                  </button>
                )}

                {/* Chốt báo giá trên hệ thống (chưa có API hãng tàu) */}
                {estimate.status === 'READY' && onConfirmEstimate && !isEditing && (
                  <button
                    onClick={() => onConfirmEstimate(estimate)}
                    disabled={isConfirming}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Chốt báo giá — chuyển sang chờ hãng tàu duyệt"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isConfirming ? 'Đang xác nhận...' : 'Xác Nhận Báo Giá'}</span>
                  </button>
                )}
                {estimate.status === 'SUBMITTED' && estimate.confirmedAt && (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-xl" title={estimate.confirmedBy}>
                    Đã xác nhận · {estimate.confirmedBy || '—'}
                  </span>
                )}

                {/* Retry or Send Button — chỉ khi hãng tàu đã cấu hình API */}
                {!canSendApi ? null : estimate.lastApiStatus === 'FAILED' ? (
                  <button
                    onClick={() => onSendToMaersk(estimate)}
                    disabled={isSendingApi}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg  transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSendingApi ? 'animate-spin' : ''}`} />
                    <span>{isSendingApi ? 'Đang Gửi Lại...' : 'Gửi Lại (Retry)'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSendToMaersk(estimate)}
                    disabled={isSendingApi}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg  transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingApi ? 'animate-spin' : ''}`} />
                    <span>
                      {isSendingApi ? 'Đang Gửi API...' : estimate.lastApiStatus === 'SUCCESS' ? 'Gửi Lại' : 'Gửi API Hãng Tàu'}
                    </span>
                  </button>
                )}

                {/* Người báo giá sửa / bổ sung hạng mục — chỉ khi hãng tàu chưa duyệt (backend cũng chặn báo giá đã duyệt). */}
                {!isEditing && <button
                  onClick={startEdit}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                  title="Sửa giá, số lượng, mã CEDEX hoặc thêm hạng mục mới vào báo giá"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Sửa / Bổ Sung Báo Giá</span>
                </button>}
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 text-xs font-bold uppercase transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'DETAILS'
                ? 'text-amber-600 border-amber-400'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Chi Tiết Báo Giá ({estimate.items.length} Hạng Mục)</span>
          </button>

          <button
            onClick={() => setActiveTab('CARRIER_DECISION')}
            className={`py-3 text-xs font-bold uppercase transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'CARRIER_DECISION'
                ? 'text-purple-600 border-purple-400'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Phản Hồi &amp; Quyết Định Hãng Tàu</span>
            {estimate.status === 'APPROVED' && (
              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] rounded font-bold font-mono">Duyệt</span>
            )}
            {estimate.status === 'REJECTED' && (
              <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] rounded font-bold font-mono">Từ chối</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('API_RESULT')}
            className={`py-3 text-xs font-bold uppercase transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'API_RESULT'
                ? 'text-blue-600 border-blue-400'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Kết Quả Gửi API Hãng Tàu</span>
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
                ? 'text-sky-600 border-sky-400'
                : 'text-slate-500 border-transparent hover:text-slate-700'
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
                <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900/90 to-slate-900 border border-emerald-200 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-lg ">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>HÃNG TÀU {estimate.shippingLine} ĐÃ DUYỆT BÁO GIÁ THÀNH CÔNG</span>
                        <span className="font-mono text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200">
                          Mã duyệt: {estimate.carrierApproval?.authCode || '—'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Số tiền được duyệt: <strong className="text-slate-900 font-mono">{formatVND(estimate.carrierApproval?.approvedAmount || estimate.totalAmount)}</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Banner Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Container / Type</div>
                  <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">{estimate.containerNo}</div>
                  <div className="text-[11px] text-slate-500">{estimate.size} &bull; {estimate.isoCode}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Shipping Line</div>
                  <div className="text-sm font-mono font-bold text-blue-600 mt-0.5">{estimate.shippingLine}</div>
                  <div className="text-[11px] text-slate-500">Chủ Khai Thác Vỏ</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Thời Gian Lập</div>
                  <div className="text-xs font-mono text-slate-700 mt-0.5">{formatDateTime(estimate.createdAt)}</div>
                  <div className="text-[11px] text-slate-500">
                    Sửa cuối: {formatDateTime(estimate.updatedAt)}{estimate.updatedBy ? ` · ${estimate.updatedBy}` : ''}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Tổng Tiền Báo Giá</div>
                  <div className="text-sm font-mono font-black text-emerald-600 mt-0.5">
                    {formatVND(estimate.totalAmount)}
                  </div>
                  <div className="text-[11px] text-amber-600">VAT: {(estimate.vatRate * 100).toFixed(0)}% ({formatVND(estimate.vatAmount)})</div>
                </div>
              </div>

              {isEditing ? (
                <EstimateItemsEditor
                  estimate={estimate}
                  saveAndSendLabel={canSendApi ? 'Lưu & Gửi Hãng Tàu' : 'Lưu & Xác Nhận'}
                  saving={isSaving}
                  onCancel={() => setIsEditing(false)}
                  onSave={handleInlineSave}
                />
              ) : (
              <>
              {/* Repair Line Items + Cost Summary theo mẫu Work Order Maersk AEMS (số liệu đã lưu ở DB) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Repair Line Items (AEMS)</span>
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    <span>Shop: <strong className="font-mono text-slate-900">{estimate.shopCode || '—'}</strong></span>
                    <span>Vendor Ref: <strong className="font-mono text-slate-900">{estimate.vendorRefNo || '—'}</strong></span>
                    <span>Mode: <strong className="font-mono text-slate-900">{estimate.repairMode || '—'}</strong></span>
                    <span>Giờ: thường {estimate.ordinaryHours || 0} · OT1 {estimate.ot1Hours || 0} · OT2 {estimate.ot2Hours || 0} · OT3 {estimate.ot3Hours || 0} · chuẩn bị {estimate.preparationHours || 0}</span>
                    <span>Cause: <strong className="text-slate-900">{estimate.cause || '—'}</strong></span>
                    <span>Đơn giá giờ công: <strong className="font-mono text-slate-900">{formatVND(estimate.laborRate || 0)}</strong></span>
                  </div>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs min-w-[900px]">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Damage code</th>
                        <th className="py-2.5 px-3">Repair code</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Rep. loc</th>
                        <th className="py-2.5 px-3">TPI</th>
                        <th className="py-2.5 px-3 text-right">PCS</th>
                        <th className="py-2.5 px-3 text-right">Man hrs/PC</th>
                        <th className="py-2.5 px-3 text-right">Mat. cost/PC</th>
                        <th className="py-2.5 px-3 text-right">Item total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {estimate.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-rose-700" title={item.damageName}>{item.damageCode || '—'}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700" title={item.repairMethod}>{item.repairCode || '—'}</td>
                          <td className="py-2.5 px-3 text-slate-700 max-w-sm">{item.description || item.repairMethod}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-800" title={item.damageLocationName}>{item.damageLocationCode || '—'}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-800">{item.tpi || '—'}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{item.manHoursPerPiece ?? 0}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatVND(item.unitPrice)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{formatVND(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                    Ghi chú kỹ thuật: <span className="text-slate-700">{estimate.notes || 'Không có ghi chú.'}</span>
                  </div>
                  <AemsCostSummary
                    totals={{
                      totalManHours: estimate.totalManHours || 0,
                      laborCost: estimate.laborCost || 0,
                      materialCost: estimate.materialCost ?? estimate.subtotal,
                      subtotal: estimate.subtotal,
                      vatAmount: estimate.vatAmount,
                      totalAmount: estimate.totalAmount
                    }}
                    laborRate={estimate.laborRate || 0}
                    vatRate={estimate.vatRate}
                  />
                </div>
              </div>

              </>
              )}

              {/* Photos */}
              {estimate.inspectionPhotos && estimate.inspectionPhotos.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span>Hình Ảnh Giám Định Hiện Trường e-EIR ({estimate.inspectionPhotos.length} Ảnh)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {estimate.inspectionPhotos.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group aspect-video">
                        <img src={url} alt={`Damage photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-900 rounded-lg text-xs flex items-center gap-1">
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
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 font-mono font-bold text-xs rounded">
                            APPROVED
                          </span>
                          <h3 className="text-base font-bold text-slate-900">
                            Hãng Tàu {estimate.shippingLine} Đã Phê Duyệt Báo Giá
                          </h3>
                        </div>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Báo giá sửa chữa đã được hãng tàu phê duyệt.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Decision attributes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-emerald-200/60 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">WO hãng tàu · Mã duyệt</div>
                      <div className="font-mono text-sm font-bold text-amber-700 mt-0.5">
                        {estimate.carrierApproval?.workOrderNo || '—'}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">{estimate.carrierApproval?.authCode || '—'}</div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Số Tiền Phê Duyệt</div>
                      <div className="font-mono text-sm font-bold text-emerald-600 mt-0.5">
                        {formatVND(estimate.carrierApproval?.approvedAmount || estimate.totalAmount)}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Thời Gian Duyệt</div>
                      <div className="font-mono text-xs text-slate-900 mt-0.5">
                        {formatDateTime(estimate.carrierApproval?.approvedAt)}
                      </div>
                      <div className="text-[11px] text-slate-500">{estimate.carrierApproval?.channel ? `Qua ${estimate.carrierApproval.channel}` : ''}</div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Người duyệt (hãng tàu)</div>
                      <div className="text-xs text-slate-700 mt-0.5">
                        {estimate.carrierApproval?.approvedBy || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500">Ghi nhận: {estimate.carrierApproval?.enteredBy || '—'}</div>
                    </div>
                  </div>

                  {estimate.carrierApproval?.comments && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700">
                      <span className="font-bold text-emerald-600">Ghi chú từ Hãng Tàu:</span> {estimate.carrierApproval.comments}
                    </div>
                  )}
                </div>
              ) : estimate.status === 'REJECTED' ? (
                <div className="p-6 bg-purple-50 border border-purple-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-200">
                        <XCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-200 font-mono font-bold text-xs rounded">
                            REJECTED / TỪ CHỐI
                          </span>
                          <h3 className="text-base font-bold text-slate-900">
                            Hãng Tàu {estimate.shippingLine} Không Duyệt / Yêu Cầu Sửa Đổi
                          </h3>
                        </div>
                        <p className="text-xs text-purple-700 mt-0.5">
                          Báo giá bị từ chối do không thỏa tiêu chuẩn hợp đồng khung hoặc phương pháp sửa chữa.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={startEdit}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Lập Bản Báo Giá Điều Chỉnh (Revise)</span>
                    </button>
                  </div>

                  {/* Rejection Details */}
                  <div className="p-4 bg-white rounded-xl border border-purple-200/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Mã Lý Do Từ Chối: {estimate.carrierApproval?.rejectCode || '—'}</span>
                      </span>
                      <span className="text-slate-500 font-mono">
                        Từ chối lúc: {formatDateTime(estimate.carrierApproval?.approvedAt || estimate.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-rose-200 bg-rose-50 p-3 rounded-lg border border-rose-200">
                      "{estimate.carrierApproval?.rejectReason || estimate.carrierApproval?.comments || 'Chưa ghi lý do'}"
                    </p>
                    {estimate.carrierApproval?.suggestedAction && (
                      <div className="text-xs text-amber-700 flex items-center gap-1">
                        <strong>Khuyến nghị khắc phục:</strong> {estimate.carrierApproval.suggestedAction}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                  <Clock className="w-10 h-10 text-amber-600 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Đang Chờ Đại Diện Hãng Tàu {estimate.shippingLine} Xem Xét</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Bản tin báo giá đã được gửi sang cổng EDI/API. Hãng tàu duyệt hoặc từ chối tại màn Phê Duyệt Hãng Tàu.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: API RESULT */}
          {activeTab === 'API_RESULT' && (
            <div className="space-y-6">
              {estimate.lastApiStatus === 'FAILED' ? (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <h4 className="text-sm font-bold text-rose-700">
                        Gửi API Thất Bại{estimate.apiTransactionHistory[estimate.apiTransactionHistory.length - 1]?.httpStatusCode ? ` (HTTP ${estimate.apiTransactionHistory[estimate.apiTransactionHistory.length - 1].httpStatusCode})` : ''}
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
                  <p className="text-xs text-rose-700">
                    {estimate.apiTransactionHistory[estimate.apiTransactionHistory.length - 1]?.errorMessage ||
                      'Gửi tới hãng tàu thất bại.'}
                  </p>
                </div>
              ) : estimate.lastApiResponse ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-700">
                      Hãng Tàu Đã Tiếp Nhận Báo Giá
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-700">
                    {estimate.lastApiResponse.message}
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                  <Server className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-500">
                    Báo giá này chưa được gửi sang API hãng tàu.
                  </p>
                  <button
                    onClick={() => onSendToMaersk(estimate)}
                    disabled={isSendingApi}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi API Hãng Tàu Ngay</span>
                  </button>
                </div>
              )}

              {/* Required Fields Breakdown */}
              {estimate.lastApiResponse && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1.5">
                    <Server className="w-4 h-4" />
                    <span>6.4. Phản Hồi Từ Hãng Tàu</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Mã Estimate</div>
                      <div className="font-mono text-xs font-bold text-slate-900 mt-0.5">{estimate.estimateNo}</div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Số Container</div>
                      <div className="font-mono text-xs font-bold text-amber-700 mt-0.5">{estimate.containerNo}</div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Mã Xác Nhận Từ Hãng Tàu</div>
                      <div className="font-mono text-xs font-bold text-emerald-600 mt-0.5">
                        {estimate.lastApiResponse.referenceNo}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Request ID</div>
                      <div className="font-mono text-xs text-cyan-700 mt-0.5 truncate" title={estimate.lastApiResponse.requestId}>
                        {estimate.lastApiResponse.requestId}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Transaction ID</div>
                      <div className="font-mono text-xs text-purple-700 mt-0.5 truncate" title={estimate.lastApiResponse.transactionId}>
                        {estimate.lastApiResponse.transactionId}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">HTTP Status / Thời Gian Gửi</div>
                      <div className="font-mono text-xs text-slate-700 mt-0.5">
                        HTTP {estimate.lastApiResponse.httpStatusCode} &bull; {estimate.lastApiResponse.submittedAt}
                      </div>
                    </div>
                  </div>

                  {/* Raw JSON Viewer */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Nội Dung Phản Hồi Raw JSON:</span>
                    <pre className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-emerald-600 overflow-x-auto max-h-60 leading-relaxed">
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
                <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>6.6. Lịch Sử Gửi API Sang Hãng Tàu (Audit Log)</span>
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  {estimate.apiTransactionHistory?.length || 0} lần ghi nhận
                </span>
              </div>

              {!estimate.apiTransactionHistory || estimate.apiTransactionHistory.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>Chưa có lịch sử giao dịch API nào được ghi nhận cho báo giá này.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {estimate.apiTransactionHistory.map((txn, idx) => (
                    <div
                      key={txn.id || idx}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-200 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${
                          txn.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {txn.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">Lần gửi #{txn.attemptNo}</span>
                            <span className="font-mono text-[10px] text-slate-500">{txn.timestamp}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              txn.httpStatusCode === 200 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              HTTP {txn.httpStatusCode}
                            </span>
                          </div>
                          <div className="text-slate-500 font-mono text-[11px] mt-1">
                            Endpoint: <span className="text-slate-700">{txn.endpoint}</span> &bull; Latency: <span className="text-cyan-600">{txn.latencyMs}ms</span>
                          </div>
                          {txn.errorMessage && (
                            <div className="text-rose-600 text-[11px] mt-1 font-semibold">
                              Lỗi: {txn.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer"
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
