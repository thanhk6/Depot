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
      <div className="bg-emerald-50 border border-emerald-200/40 rounded-2xl p-4 text-xs text-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">Nhật Ký Thanh Toán & Phân Bổ Tiền Container</div>
            <div className="text-emerald-600">
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
              className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-md ${
                isReversed ? 'border-rose-200 opacity-75' : 'border-slate-200'
              }`}
            >
              {/* Payment Card Header */}
              <div
                onClick={() => toggleExpand(p.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <button className="p-1 rounded-lg bg-slate-100 text-slate-500">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{p.id}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-sky-600 font-mono text-[11px] border border-slate-200">
                        {p.shippingLineId}
                      </span>
                      {isReversed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>ĐÃ HỦY (REVERSED)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ĐÃ XÁC NHẬN</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                      <span>Ngày: <strong className="text-slate-700 font-mono">{p.paymentDate}</strong></span>
                      <span>•</span>
                      <span>Ngân hàng: <strong className="text-slate-700">{p.bankName}</strong></span>
                      <span>•</span>
                      <span>Ref: <strong className="text-sky-700 font-mono">{p.referenceNo}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pl-9 sm:pl-0">
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-emerald-600">
                      {formatMoney(p.paymentAmount)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {p.allocations?.length || 0} container được phân bổ
                    </div>
                  </div>

                  {!isReversed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReversePayment(p);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200 transition cursor-pointer flex items-center gap-1"
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
                <div className="bg-rose-50 border-t border-rose-200 px-4 py-2.5 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <strong>Lý do hủy:</strong> {p.reversalReason} (Hủy bởi: {p.reversedBy || 'Kế toán trưởng'} lúc {p.reversedAt})
                  </div>
                </div>
              )}

              {/* Allocation Breakdown Dropdown */}
              {isExpanded && (
                <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>Chi tiết phân bổ cho từng Container</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {p.allocations && p.allocations.length > 0 ? (
                      p.allocations.map((alc, aIdx) => (
                        <div
                          key={alc.id || aIdx}
                          className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <div className="font-mono font-bold text-sky-700 text-xs">
                              {alc.containerNo}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              BG: {alc.quotationNo}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold font-mono text-emerald-600">
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
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
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
