import React, { useState } from 'react';
import { Payment } from '../types';
import {
  CreditCard,
  Building2,
  Calendar,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  User,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface PaymentAllocationHistoryTabProps {
  payments: Payment[];
  onReversePayment: (payment: Payment) => void;
  currency: 'VND' | 'USD';
}

export const PaymentAllocationHistoryTab: React.FC<PaymentAllocationHistoryTabProps> = ({
  payments,
  onReversePayment,
  currency
}) => {
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  const toggleExpand = (id: string) => {
    setExpandedPaymentId(expandedPaymentId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4 text-xs text-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">Nhật Ký Thanh Toán & Phân Bổ Tiền Container</div>
            <div className="text-emerald-300/80">
              Lưu giữ toàn bộ lịch sử thanh toán của hãng tàu, chi tiết phân bổ cho từng container và kiểm toán hoàn tác (Reverse Payment).
            </div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {payments.map((p) => {
          const isExpanded = expandedPaymentId === p.id;
          const isReversed = p.status === 'REVERSED';

          return (
            <div
              key={p.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all shadow-md ${
                isReversed ? 'border-rose-900/40 opacity-75' : 'border-slate-800'
              }`}
            >
              {/* Payment Card Header */}
              <div
                onClick={() => toggleExpand(p.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <button className="p-1 rounded-lg bg-slate-800 text-slate-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">{p.id}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 font-mono text-[11px] border border-slate-700">
                        {p.shippingLineId}
                      </span>
                      {isReversed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          <span>ĐÃ HỦY (REVERSED)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ĐÃ XÁC NHẬN</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>Ngày: <strong className="text-slate-300 font-mono">{p.paymentDate}</strong></span>
                      <span>•</span>
                      <span>Ngân hàng: <strong className="text-slate-300">{p.bankName}</strong></span>
                      <span>•</span>
                      <span>Ref: <strong className="text-sky-300 font-mono">{p.referenceNo}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pl-9 sm:pl-0">
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-emerald-400">
                      {formatMoney(p.paymentAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {p.allocations?.length || 0} container được phân bổ
                    </div>
                  </div>

                  {!isReversed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReversePayment(p);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition cursor-pointer flex items-center gap-1"
                      title="Hủy thanh toán và hoàn lại công nợ container"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Hủy phiếu</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Reversal Audit info if reversed */}
              {isReversed && p.reversalReason && (
                <div className="bg-rose-950/30 border-t border-rose-900/40 px-4 py-2.5 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <strong>Lý do hủy:</strong> {p.reversalReason} (Hủy bởi: {p.reversedBy || 'Kế toán trưởng'} lúc {p.reversedAt})
                  </div>
                </div>
              )}

              {/* Allocation Breakdown Dropdown */}
              {isExpanded && (
                <div className="bg-slate-950/70 border-t border-slate-800 p-4 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Chi tiết phân bổ cho từng Container</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {p.allocations && p.allocations.length > 0 ? (
                      p.allocations.map((alc, aIdx) => (
                        <div
                          key={alc.id || aIdx}
                          className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <div className="font-mono font-bold text-sky-300 text-xs">
                              {alc.containerNo}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              BG: {alc.quotationNo}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold font-mono text-emerald-400">
                              +{formatMoney(alc.allocatedAmount)}
                            </div>
                            <div className="text-[9px] text-slate-500">Phân bổ</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 col-span-3 py-2">
                        Chưa có dữ liệu phân bổ chi tiết.
                      </div>
                    )}
                  </div>

                  {p.notes && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                      <span className="text-slate-500">Ghi chú:</span> {p.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
