import React, { useState } from 'react';
import { Payment } from '../types';
import {
  X,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  FileText,
  DollarSign,
  ShieldAlert
} from 'lucide-react';

interface ReversePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onConfirmReverse: (paymentId: string, reason: string) => void;
  currency: 'VND' | 'USD';
}

export const ReversePaymentModal: React.FC<ReversePaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  onConfirmReverse,
  currency
}) => {
  const [reason, setReason] = useState<string>(
    'Ngân hàng báo sai thông tin lệnh chuyển tiền / Yêu cầu tra soát lại.'
  );

  if (!isOpen || !payment) return null;

  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmReverse(payment.id, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-rose-200/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-200 flex items-center justify-between bg-rose-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Hủy Thanh Toán (Reverse Payment)
              </h2>
              <p className="text-xs text-rose-700">
                Hoàn tác giao dịch và khôi phục số dư nợ cho các container
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Payment Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mã phiếu thanh toán:</span>
              <span className="font-mono font-bold text-slate-900">{payment.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hãng tàu:</span>
              <span className="font-bold text-sky-600">{payment.shippingLineId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tiền:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {formatMoney(payment.paymentAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mã giao dịch / Ref:</span>
              <span className="font-mono text-slate-700">{payment.referenceNo}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-rose-50 border border-rose-200/40 p-3.5 rounded-2xl text-xs text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-700">CẢNH BÁO HOÀN TÁC CÔNG NỢ:</div>
              <div className="text-[11px] text-rose-200/90 mt-0.5">
                Toàn bộ số tiền đã phân bổ cho <strong>{payment.allocations?.length || 0} container</strong> sẽ được cộng ngược lại vào số tiền Còn Nợ (RemainingAmount). Phiếu thanh toán sẽ được giữ lại trong lịch sử kế toán với trạng thái <strong>REVERSED</strong>.
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Lý do hủy thanh toán <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập chi tiết lý do hủy phiếu..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Không hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg "
            >
              <RotateCcw className="w-4 h-4" />
              <span>Xác Nhận Hủy Phiếu & Hoàn Nợ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
