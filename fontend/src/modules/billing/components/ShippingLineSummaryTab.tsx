import React from 'react';
import { ShippingLineDebtSummary } from '../types';
import { Building2, ArrowUpRight, CheckCircle2, AlertCircle, DollarSign, CalendarCheck, ChevronRight } from 'lucide-react';

interface ShippingLineSummaryTabProps {
  summaries: ShippingLineDebtSummary[];
  onSelectCarrier: (carrierId: string) => void;
  onPayForCarrier: (carrierId: string) => void;
  onClosePeriodForCarrier: (carrierId: string) => void;
  currency: 'VND' | 'USD';
}

export const ShippingLineSummaryTab: React.FC<ShippingLineSummaryTabProps> = ({
  summaries,
  onSelectCarrier,
  onPayForCarrier,
  onClosePeriodForCarrier,
  currency
}) => {
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  const totalOpening = summaries.reduce((acc, s) => acc + s.openingBalance, 0);
  const totalDebit = summaries.reduce((acc, s) => acc + s.periodDebit, 0);
  const totalCredit = summaries.reduce((acc, s) => acc + s.periodCredit, 0);
  const totalClosing = summaries.reduce((acc, s) => acc + s.closingBalance, 0);
  const totalContainers = summaries.reduce((acc, s) => acc + s.containerCount, 0);

  return (
    <div className="space-y-4">
      {/* Informative banner on business logic */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">Tổng Hợp Công Nợ Hãng Tàu Đối Tác (MAERSK LINE)</div>
            <div className="text-slate-400">
              Công thức chốt kỳ: <span className="text-sky-300 font-mono">Dư cuối kỳ = Dư đầu kỳ + Phát sinh trong kỳ - Đã thanh toán trong kỳ</span>
            </div>
          </div>
        </div>
        <div className="text-right font-medium text-slate-400">
          Hãng tàu hoạt động: <span className="text-white font-bold">MAERSK LINE A/S</span> | Tổng Container nợ: <span className="text-sky-400 font-bold">{totalContainers} cont</span>
        </div>
      </div>

      {/* MAERSK Partner Contract Profile */}
      <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/30 rounded-2xl p-4 sm:p-5 text-xs text-slate-300 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 font-black text-sm shrink-0">
              MSK
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">MAERSK LINE A/S (MAEU)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Đối Tác Công Nợ Trực Tiếp
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Hợp đồng Depot EMR: <strong className="text-slate-200">DEPOT-EMR-MSK-2026</strong> • Điều khoản thanh toán: <strong className="text-sky-300">Net 30 Days</strong>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                <span>Mã số thuế: <strong className="text-slate-300">0100109928</strong></span>
                <span>•</span>
                <span>Tài khoản: <strong className="text-slate-300">0071008899221 (Vietcombank)</strong></span>
                <span>•</span>
                <span>Hạn mức tín dụng: <strong className="text-emerald-400">100,000,000 đ</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectCarrier('MAERSK')}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <span>Xem Sổ Chi Tiết Container</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onPayForCarrier('MAERSK')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Ghi Nhận Thu Tiền UNC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">HÃNG TÀU</th>
                <th className="py-3 px-4 text-center">SỐ CONTAINER</th>
                <th className="py-3 px-4 text-right">DƯ ĐẦU KỲ</th>
                <th className="py-3 px-4 text-right">PHÁT SINH (+)</th>
                <th className="py-3 px-4 text-right">ĐÃ THANH TOÁN (-)</th>
                <th className="py-3 px-4 text-right">DƯ CUỐI KỲ (=)</th>
                <th className="py-3 px-4 text-center">QUÁ HẠN</th>
                <th className="py-3 px-4 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {summaries.map((item) => (
                <tr
                  key={item.shippingLineId}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Shipping Line */}
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-sky-400">
                        {item.logoText}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-sky-400 transition">
                          {item.shippingLineId}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]">
                          {item.shippingLineName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Containers count breakdown */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-white font-mono font-bold text-xs border border-slate-700">
                      <span>{item.containerCount} cont</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                      <span className="text-rose-400" title="Chưa thanh toán">{item.unpaidCount} chưa trả</span>
                      <span>•</span>
                      <span className="text-amber-400" title="Trả một phần">{item.partialCount} trả 1 phần</span>
                    </div>
                  </td>

                  {/* Opening Balance */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    {formatMoney(item.openingBalance)}
                  </td>

                  {/* Period Debit */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-amber-400">
                    +{formatMoney(item.periodDebit)}
                  </td>

                  {/* Period Credit */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-400">
                    -{formatMoney(item.periodCredit)}
                  </td>

                  {/* Closing Balance */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sky-400 text-sm">
                    {formatMoney(item.closingBalance)}
                  </td>

                  {/* Overdue alert */}
                  <td className="py-3.5 px-4 text-center">
                    {item.overdueAmount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3" />
                        {formatMoney(item.overdueAmount)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Trong hạn
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectCarrier(item.shippingLineId)}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-semibold text-[11px] border border-sky-500/30 transition flex items-center gap-1 cursor-pointer"
                        title="Xem danh sách từng container đang nợ của hãng tàu này"
                      >
                        <span>Xem cont</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onPayForCarrier(item.shippingLineId)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer"
                        title="Xác nhận thanh toán và phân bổ cho các container"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Thu tiền</span>
                      </button>

                      <button
                        onClick={() => onClosePeriodForCarrier(item.shippingLineId)}
                        className="px-2 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold text-[11px] border border-purple-500/30 transition flex items-center gap-1 cursor-pointer"
                        title="Chốt kỳ công nợ cho hãng tàu này"
                      >
                        <CalendarCheck className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total Footer Row */}
            <tfoot>
              <tr className="bg-slate-950 border-t-2 border-slate-700 font-bold text-xs">
                <td className="py-3.5 px-4 text-white uppercase">TỔNG CỘNG TOÀN DEPOT</td>
                <td className="py-3.5 px-4 text-center font-mono text-white">{totalContainers} cont</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-300">{formatMoney(totalOpening)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-400">+{formatMoney(totalDebit)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400">-{formatMoney(totalCredit)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-sky-400 text-sm font-black">{formatMoney(totalClosing)}</td>
                <td className="py-3.5 px-4"></td>
                <td className="py-3.5 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
