import React from 'react';
import { DebtPeriod } from '../types';
import {
  CalendarCheck,
  Lock,
  Unlock,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Scale
} from 'lucide-react';

interface PeriodManagementTabProps {
  periods: DebtPeriod[];
  onClosePeriod: (period: DebtPeriod) => void;
  currency: 'VND' | 'USD';
}

export const PeriodManagementTab: React.FC<PeriodManagementTabProps> = ({
  periods,
  onClosePeriod,
  currency
}) => {
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  return (
    <div className="space-y-4">
      {/* Informative Explanation Header */}
      <div className="bg-purple-950/20 border border-purple-800/40 rounded-2xl p-4 text-xs text-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">Quy Trình Quản Lý & Chốt Công Nợ Theo Kỳ</div>
            <div className="text-purple-300/80 mt-0.5">
              Hệ thống tự động liên kết số dư: <span className="font-mono text-purple-200 font-bold">Dư cuối kỳ (N-1) → Dư đầu kỳ (N)</span>. Khi chốt kỳ, số liệu sẽ được khóa sổ kế toán.
            </div>
          </div>
        </div>
      </div>

      {/* Formula Demonstration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Công thức tính số dư kỳ công nợ (Balance Formula)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-semibold">DƯ ĐẦU KỲ</div>
            <div className="text-xs font-bold text-white mt-1">OpeningBalance</div>
            <div className="text-[10px] text-slate-500 mt-1">Chuyển từ kỳ trước</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-amber-900/30">
            <div className="text-[11px] text-amber-400 font-semibold">+ PHÁT SINH TRONG KỲ</div>
            <div className="text-xs font-bold text-amber-300 mt-1">PeriodDebit</div>
            <div className="text-[10px] text-slate-500 mt-1">Báo giá sửa chữa xong</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/30">
            <div className="text-[11px] text-emerald-400 font-semibold">- TIỀN ĐÃ THANH TOÁN</div>
            <div className="text-xs font-bold text-emerald-300 mt-1">PeriodCredit</div>
            <div className="text-[10px] text-slate-500 mt-1">Thu tiền & phân bổ</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-sky-800/40">
            <div className="text-[11px] text-sky-400 font-semibold">= DƯ CUỐI KỲ</div>
            <div className="text-xs font-bold text-sky-300 mt-1">ClosingBalance</div>
            <div className="text-[10px] text-slate-500 mt-1">Chuyển sang kỳ sau</div>
          </div>
        </div>
      </div>

      {/* Periods Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">MÃ KỲ CÔNG NỢ</th>
                <th className="py-3 px-4">HÃNG TÀU</th>
                <th className="py-3 px-4 text-center">THỜI GIAN KỲ</th>
                <th className="py-3 px-4 text-right">DƯ ĐẦU KỲ</th>
                <th className="py-3 px-4 text-right">PHÁT SINH (+)</th>
                <th className="py-3 px-4 text-right">THANH TOÁN (-)</th>
                <th className="py-3 px-4 text-right">DƯ CUỐI KỲ (=)</th>
                <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {periods.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Period Code */}
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300">{p.periodCode}</span>
                    </div>
                  </td>

                  {/* Shipping Line */}
                  <td className="py-3.5 px-4 font-bold text-white">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-sky-400 font-mono text-[11px] border border-slate-700">
                      {p.shippingLineId}
                    </span>
                  </td>

                  {/* Time Range */}
                  <td className="py-3.5 px-4 text-center text-slate-300 font-mono text-[11px]">
                    {p.fromDate} → {p.toDate}
                  </td>

                  {/* Opening Balance */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    {formatMoney(p.openingBalance)}
                  </td>

                  {/* Period Debit */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-amber-400">
                    +{formatMoney(p.periodDebit)}
                  </td>

                  {/* Period Credit */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-400">
                    -{formatMoney(p.periodCredit)}
                  </td>

                  {/* Closing Balance */}
                  <td className="py-3.5 px-4 text-right font-mono font-black text-sky-400 text-sm">
                    {formatMoney(p.closingBalance)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    {p.status === 'CLOSED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>ĐÃ KHÓA SỔ</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Unlock className="w-3 h-3 text-emerald-400" />
                        <span>ĐANG MỞ</span>
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    {p.status === 'OPEN' ? (
                      <button
                        onClick={() => onClosePeriod(p)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow-md transition cursor-pointer flex items-center gap-1.5 mx-auto"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Chốt kỳ này</span>
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400">
                        {p.closedBy ? `Chốt bởi: ${p.closedBy}` : 'Đã chốt'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
