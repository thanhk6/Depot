import React from 'react';
import { DebtAgingBucket } from '../types';
import { BarChart3, Clock, AlertTriangle, ShieldCheck, Download, FileSpreadsheet } from 'lucide-react';

interface DebtAgingReportTabProps {
  agingData: DebtAgingBucket[];
  currency: 'VND' | 'USD';
  onExportExcel?: () => void;
}

export const DebtAgingReportTab: React.FC<DebtAgingReportTabProps> = ({
  agingData,
  currency,
  onExportExcel
}) => {
  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  const totalNotDue = agingData.reduce((acc, b) => acc + (b.bucketNotDue || 0), 0);
  const total0_30 = agingData.reduce((acc, b) => acc + b.bucket0_30, 0);
  const total31_60 = agingData.reduce((acc, b) => acc + b.bucket31_60, 0);
  const total61_90 = agingData.reduce((acc, b) => acc + b.bucket61_90, 0);
  const totalOver90 = agingData.reduce((acc, b) => acc + b.bucketOver90, 0);
  const grandTotal = agingData.reduce((acc, b) => acc + b.totalReceivable, 0);

  const pct0_30 = grandTotal > 0 ? ((total0_30 / grandTotal) * 100).toFixed(1) : '0';
  const pct31_60 = grandTotal > 0 ? ((total31_60 / grandTotal) * 100).toFixed(1) : '0';
  const pct61_90 = grandTotal > 0 ? ((total61_90 / grandTotal) * 100).toFixed(1) : '0';
  const pctOver90 = grandTotal > 0 ? ((totalOver90 / grandTotal) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* Header & Export */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Báo Cáo Phân Tích Tuổi Nợ (AR Aging Report)
            </h2>
            <p className="text-xs text-slate-500">
              Phân loại nợ phải thu theo các khoảng thời gian quá hạn tín dụng chuẩn quốc tế
            </p>
          </div>
        </div>

        {onExportExcel && (
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Báo Cáo Aging Excel</span>
          </button>
        )}
      </div>

      {/* 4 Aging Buckets Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Chưa đến hạn (server tính theo ngày Việt Nam) */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 sm:col-span-2 lg:col-span-4">
          <div className="flex items-center justify-between text-sky-600">
            <span className="text-xs font-bold uppercase tracking-wider">Chưa Đến Hạn</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div data-testid="aging-not-due-total" className="text-xl sm:text-2xl font-black font-mono text-sky-600">
            {formatMoney(totalNotDue)}
          </div>
        </div>

        {/* Bucket 1: quá hạn 1 - 30 Ngày */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider">Quá hạn 1 - 30 Ngày</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
            {formatMoney(total0_30)}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct0_30}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tỷ trọng: <strong>{pct0_30}%</strong></span>
            <span className="text-emerald-600">Net 30 SLA</span>
          </div>
        </div>

        {/* Bucket 2: 31 - 60 Ngày */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider">31 - 60 Ngày</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-700">
            {formatMoney(total31_60)}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct31_60}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tỷ trọng: <strong>{pct31_60}%</strong></span>
            <span className="text-amber-700">Nhắc nợ lần 1</span>
          </div>
        </div>

        {/* Bucket 3: 61 - 90 Ngày */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-xs font-bold uppercase tracking-wider">61 - 90 Ngày</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-orange-700">
            {formatMoney(total61_90)}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${pct61_90}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tỷ trọng: <strong>{pct61_90}%</strong></span>
            <span className="text-orange-600">Nhắc nợ lần 2</span>
          </div>
        </div>

        {/* Bucket 4: > 90 Ngày */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-bold uppercase tracking-wider">&gt; 90 Ngày (Quá hạn)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-600">
            {formatMoney(totalOver90)}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${pctOver90}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tỷ trọng: <strong>{pctOver90}%</strong></span>
            <span className="text-rose-600 font-bold">Cảnh báo rủi ro</span>
          </div>
        </div>
      </div>

      {/* Aging Table per Carrier */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">HÃNG TÀU</th>
                <th className="py-3 px-4 text-right">CHƯA ĐẾN HẠN</th>
                <th className="py-3 px-4 text-right">QUÁ HẠN 1 - 30</th>
                <th className="py-3 px-4 text-right">31 - 60 NGÀY</th>
                <th className="py-3 px-4 text-right">61 - 90 NGÀY</th>
                <th className="py-3 px-4 text-right">&gt; 90 NGÀY</th>
                <th className="py-3 px-4 text-right font-bold text-sky-600">TỔNG PHẢI THU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 text-xs">
              {agingData.map((item) => (
                <tr key={item.shippingLineId} className="hover:bg-slate-100 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-sky-600 font-mono text-[11px] border border-slate-200">
                        {item.shippingLineId}
                      </span>
                      <span className="text-slate-700 font-normal">{item.shippingLineName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sky-600">
                    {formatMoney(item.bucketNotDue || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-medium">
                    {formatMoney(item.bucket0_30)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-700">
                    {formatMoney(item.bucket31_60)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-orange-700">
                    {formatMoney(item.bucket61_90)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-bold">
                    {formatMoney(item.bucketOver90)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sky-600 text-sm">
                    {formatMoney(item.totalReceivable)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                <td className="py-3.5 px-4 text-slate-900 uppercase">TỔNG CỘNG</td>
                <td className="py-3.5 px-4 text-right font-mono text-sky-600 font-black">{formatMoney(totalNotDue)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-black">{formatMoney(total0_30)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700 font-black">{formatMoney(total31_60)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-orange-700 font-black">{formatMoney(total61_90)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-black">{formatMoney(totalOver90)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-sky-600 text-sm font-black">{formatMoney(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
