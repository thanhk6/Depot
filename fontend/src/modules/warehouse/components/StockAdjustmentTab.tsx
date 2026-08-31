import React, { useState } from 'react';
import { StockAdjustment } from '../types';
import { Search, Plus, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface StockAdjustmentTabProps {
  adjustments: StockAdjustment[];
  onOpenCreateAdjustment: () => void;
}

export const StockAdjustmentTab: React.FC<StockAdjustmentTabProps> = ({
  adjustments,
  onOpenCreateAdjustment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(adjustments[0]?.id || null);

  const filtered = adjustments.filter(
    (a) =>
      a.adjustmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.adjustedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Sổ Quản Lý Phiếu Điều Chỉnh Tồn Kho (PDC)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Điều chỉnh tăng/giảm tồn kho khi có chênh lệch kiểm kê, rủi ro hao hụt, hư hỏng hoặc thất thoát
          </p>
        </div>

        <button
          onClick={onOpenCreateAdjustment}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Điều Chỉnh (PDC)</span>
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Số Phiếu (PDC-2026-...), Lý do hoặc Người điều chỉnh..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Adjustments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
            Không tìm thấy phiếu điều chỉnh nào.
          </div>
        ) : (
          filtered.map((a) => {
            const isExpanded = expandedId === a.id;

            return (
              <div
                key={a.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition shadow-lg"
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className="p-4 bg-slate-900/80 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{a.adjustmentNo}</span>
                        <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px] font-bold">
                          {a.reasonType}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold">
                          ĐÃ DUYỆT
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Lý do: <strong className="text-white">{a.reason}</strong> • Ngày: <span className="font-mono">{a.adjustmentDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Giá trị điều chỉnh (VND):</span>
                      <span className={`text-base font-bold font-mono ${a.totalDifferenceValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {a.totalDifferenceValue >= 0 ? `+${formatVND(a.totalDifferenceValue)}` : formatVND(a.totalDifferenceValue)}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Người điều chỉnh:</span>
                        <span className="font-medium text-white">{a.adjustedBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Người phê duyệt:</span>
                        <span className="font-medium text-white">{a.approvedBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Số mặt hàng điều chỉnh:</span>
                        <span className="font-bold text-white font-mono">{a.totalItems} mặt hàng</span>
                      </div>
                    </div>

                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="px-3.5 py-2.5">Mã Vật Tư</th>
                            <th className="px-3.5 py-2.5">Tên Vật Tư</th>
                            <th className="px-3.5 py-2.5 text-center">ĐVT</th>
                            <th className="px-3.5 py-2.5 text-center">Tồn Trước</th>
                            <th className="px-3.5 py-2.5 text-center">Loại Đ/C</th>
                            <th className="px-3.5 py-2.5 text-center">Số Lượng Đ/C</th>
                            <th className="px-3.5 py-2.5 text-center">Tồn Sau</th>
                            <th className="px-3.5 py-2.5 text-right">Giá Trị Lệch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {a.details.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-900/40">
                              <td className="px-3.5 py-2.5 font-mono font-bold text-amber-400">{d.materialCode}</td>
                              <td className="px-3.5 py-2.5 text-white font-medium">{d.materialName}</td>
                              <td className="px-3.5 py-2.5 text-center font-bold text-slate-400 font-mono">{d.unit}</td>
                              <td className="px-3.5 py-2.5 text-center font-mono text-slate-400">{d.beforeQuantity}</td>
                              <td className="px-3.5 py-2.5 text-center">
                                {d.type === 'ADJUSTMENT_IN' ? (
                                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800 font-bold text-[10px]">
                                    + TĂNG TỒN
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-rose-950 text-rose-300 rounded border border-rose-800 font-bold text-[10px]">
                                    - GIẢM TỒN
                                  </span>
                                )}
                              </td>
                              <td className="px-3.5 py-2.5 text-center font-mono font-bold text-white">{d.adjustedQuantity}</td>
                              <td className="px-3.5 py-2.5 text-center font-mono font-bold text-amber-400">{d.afterQuantity}</td>
                              <td className="px-3.5 py-2.5 text-right font-mono font-bold">
                                {d.type === 'ADJUSTMENT_IN' ? (
                                  <span className="text-emerald-400">+{formatVND(d.totalCost)}</span>
                                ) : (
                                  <span className="text-rose-400">-{formatVND(d.totalCost)}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
