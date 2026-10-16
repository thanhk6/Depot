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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Tổng Hợp Công Nợ Hãng Tàu Đối Tác</div>
            <div className="text-slate-500">
              Công thức chốt kỳ: <span className="text-sky-700 font-mono">Dư cuối kỳ = Dư đầu kỳ + Phát sinh trong kỳ - Đã thanh toán trong kỳ</span>
            </div>
          </div>
        </div>
        <div className="text-right font-medium text-slate-500">
          Hãng tàu có công nợ: <span className="text-slate-900 font-bold">{summaries.length}</span> | Tổng Container nợ: <span className="text-sky-600 font-bold">{totalContainers} cont</span>
        </div>
      </div>

      {/* Thẻ hồ sơ "MAERSK LINE A/S" (hợp đồng, MST, tài khoản, hạn mức) gõ cứng đã bỏ — bảng dưới lấy theo công nợ thật từng hãng. */}
      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
            <tbody className="divide-y divide-slate-200/60 text-xs">
              {summaries.map((item) => (
                <tr
                  key={item.shippingLineId}
                  className="hover:bg-slate-100 transition-colors group"
                >
                  {/* Shipping Line */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-sky-600">
                        {item.logoText}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition">
                          {item.shippingLineId}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal truncate max-w-[200px]">
                          {item.shippingLineName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Containers count breakdown */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-mono font-bold text-xs border border-slate-200">
                      <span>{item.containerCount} cont</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1.5">
                      <span className="text-rose-600" title="Chưa thanh toán">{item.unpaidCount} chưa trả</span>
                      <span>•</span>
                      <span className="text-amber-600" title="Trả một phần">{item.partialCount} trả 1 phần</span>
                    </div>
                  </td>

                  {/* Opening Balance */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {formatMoney(item.openingBalance)}
                  </td>

                  {/* Period Debit */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-amber-600">
                    +{formatMoney(item.periodDebit)}
                  </td>

                  {/* Period Credit */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-600">
                    -{formatMoney(item.periodCredit)}
                  </td>

                  {/* Closing Balance */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sky-600 text-sm">
                    {formatMoney(item.closingBalance)}
                  </td>

                  {/* Overdue alert */}
                  <td className="py-3.5 px-4 text-center">
                    {item.overdueAmount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        {formatMoney(item.overdueAmount)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
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
                        className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-50 text-sky-700 font-semibold text-[11px] border border-sky-200 transition flex items-center gap-1 cursor-pointer"
                        title="Xem danh sách từng container đang nợ của hãng tàu này"
                      >
                        <span>Xem cont</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onPayForCarrier(item.shippingLineId)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                        title="Xác nhận thanh toán và phân bổ cho các container"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Thu tiền</span>
                      </button>

                      <button
                        onClick={() => onClosePeriodForCarrier(item.shippingLineId)}
                        className="px-2 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-200 transition flex items-center gap-1 cursor-pointer"
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
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                <td className="py-3.5 px-4 text-slate-900 uppercase">TỔNG CỘNG TOÀN DEPOT</td>
                <td className="py-3.5 px-4 text-center font-mono text-slate-900">{totalContainers} cont</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-700">{formatMoney(totalOpening)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-600">+{formatMoney(totalDebit)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-600">-{formatMoney(totalCredit)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-sky-600 text-sm font-black">{formatMoney(totalClosing)}</td>
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
