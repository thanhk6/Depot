import React, { useState } from 'react';
import { DebtPeriod } from '../types';
import {
  X,
  CalendarCheck,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Calendar
} from 'lucide-react';

interface ClosePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: DebtPeriod | null;
  onConfirmClosePeriod: (periodId: string, closingNotes: string) => void;
  currency: 'VND' | 'USD';
}

export const ClosePeriodModal: React.FC<ClosePeriodModalProps> = ({
  isOpen,
  onClose,
  period,
  onConfirmClosePeriod,
  currency
}) => {
  const [closingNotes, setClosingNotes] = useState<string>(
    'Đã đối soát khớp bảng kê SOA với đại diện hãng tàu và xác nhận chốt sổ.'
  );

  if (!isOpen || !period) return null;

  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmClosePeriod(period.id, closingNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Chốt Kỳ Công Nợ Đối Soát
              </h2>
              <p className="text-xs text-slate-500">
                Khóa số liệu kỳ hiện tại và tự động chuyển số dư sang kỳ tiếp theo
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
          {/* Period Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mã kỳ công nợ:</span>
              <span className="font-mono font-bold text-purple-700">{period.periodCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hãng tàu:</span>
              <span className="font-bold text-slate-900">{period.shippingLineName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Thời gian:</span>
              <span className="font-mono text-slate-700">{period.fromDate} → {period.toDate}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-slate-500">
                <span>Dư đầu kỳ (Opening Balance):</span>
                <span className="text-slate-700">{formatMoney(period.openingBalance)}</span>
              </div>
              <div className="flex items-center justify-between text-amber-600">
                <span>+ Phát sinh trong kỳ (Period Debit):</span>
                <span>+{formatMoney(period.periodDebit)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-600">
                <span>- Đã thanh toán (Period Credit):</span>
                <span>-{formatMoney(period.periodCredit)}</span>
              </div>
              <div className="flex items-center justify-between text-sky-600 font-bold text-sm pt-1.5 border-t border-slate-200">
                <span>= Dư cuối kỳ (Closing Balance):</span>
                <span>{formatMoney(period.closingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Auto Forward Notification */}
          <div className="bg-purple-50 border border-purple-200/40 p-3.5 rounded-2xl text-xs text-purple-200 flex items-start gap-2.5">
            <ArrowRight className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-purple-700">TỰ ĐỘNG CHUYỂN SỐ DƯ:</div>
              <div className="text-[11px] text-purple-200/90 mt-0.5">
                Sau khi bấm chốt kỳ, số dư cuối kỳ <strong className="text-sky-700 font-mono">{formatMoney(period.closingBalance)}</strong> sẽ tự động trở thành <strong>Dư đầu kỳ (OpeningBalance)</strong> của kỳ đối soát tiếp theo.
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Ghi chú biên bản chốt kỳ đối soát
            </label>
            <textarea
              rows={2}
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg "
            >
              <Lock className="w-4 h-4" />
              <span>Xác Nhận Khóa Sổ & Chốt Kỳ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
