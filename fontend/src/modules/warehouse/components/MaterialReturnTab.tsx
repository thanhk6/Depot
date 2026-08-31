import React, { useState } from 'react';
import { MaterialReturn } from '../types';
import { Search, Plus, RotateCcw, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface MaterialReturnTabProps {
  returns: MaterialReturn[];
  onOpenCreateReturn: () => void;
}

export const MaterialReturnTab: React.FC<MaterialReturnTabProps> = ({
  returns,
  onOpenCreateReturn
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedReturnId, setExpandedReturnId] = useState<number | null>(returns[0]?.id || null);

  const filtered = returns.filter(
    (r) =>
      r.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.returnedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Sổ Quản Lý Phiếu Trả Vật Tư Sửa Chữa (Material Returns - PTK)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Nhận hoàn trả vật tư thừa từ Work Order • Phân loại: <span className="text-emerald-400 font-bold">Vật tư tốt</span> (Cộng tồn) & <span className="text-rose-400 font-bold">Vật tư hỏng</span> (Cách ly)
          </p>
        </div>

        <button
          onClick={onOpenCreateReturn}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Trả Mới (PTK)</span>
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Số Phiếu (PTK-2026-...), Mã Lệnh WO, Số Cont hoặc Tên Thợ hoàn trả..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {/* Returns List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
            Không tìm thấy phiếu hoàn trả nào.
          </div>
        ) : (
          filtered.map((r) => {
            const isExpanded = expandedReturnId === r.id;

            return (
              <div
                key={r.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition shadow-lg"
              >
                {/* Return Card Header */}
                <div
                  onClick={() => setExpandedReturnId(isExpanded ? null : r.id)}
                  className="p-4 bg-slate-900/80 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{r.returnNo}</span>
                        <span className="px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 rounded text-[10px] font-bold">
                          ĐÃ HOÀN KHO
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Lệnh: <strong className="text-amber-400 font-mono">{r.workOrderNo}</strong> ({r.containerNo}) • Thợ trả: <span className="text-slate-200">{r.returnedBy}</span> • Ngày: <span className="font-mono">{r.returnDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Số lượng trả:</span>
                      <span className="text-xs font-bold text-white font-mono">
                        <strong className="text-emerald-400">{r.goodQuantity} Tốt</strong> • <strong className="text-rose-400">{r.damagedQuantity} Hỏng</strong>
                      </span>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Thủ kho tiếp nhận:</span>
                        <span className="font-medium text-white">{r.receivedBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Lý do / Diễn giải:</span>
                        <span className="font-medium text-slate-300">{r.note}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Giá trị hoàn trả:</span>
                        <span className="font-bold text-sky-300 font-mono">{formatVND(r.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="px-3.5 py-2.5">Mã Vật Tư</th>
                            <th className="px-3.5 py-2.5">Tên Vật Tư</th>
                            <th className="px-3.5 py-2.5 text-center">ĐVT</th>
                            <th className="px-3.5 py-2.5 text-center">Số Lượng Trả</th>
                            <th className="px-3.5 py-2.5 text-center">Tình Trạng</th>
                            <th className="px-3.5 py-2.5">Lý Do / Ghi Chú</th>
                            <th className="px-3.5 py-2.5 text-right">Đơn Giá TB</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {r.details.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-900/40">
                              <td className="px-3.5 py-2.5 font-mono font-bold text-amber-400">{d.materialCode}</td>
                              <td className="px-3.5 py-2.5 text-white font-medium">{d.materialName}</td>
                              <td className="px-3.5 py-2.5 text-center font-bold text-slate-400 font-mono">{d.unit}</td>
                              <td className="px-3.5 py-2.5 text-center font-mono font-bold text-white">{d.quantity}</td>
                              <td className="px-3.5 py-2.5 text-center">
                                {d.condition === 'GOOD' ? (
                                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800 font-bold text-[10px]">
                                    TỐT (Cộng Tồn)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-rose-950 text-rose-300 rounded border border-rose-800 font-bold text-[10px]">
                                    HỎNG (Cách Ly)
                                  </span>
                                )}
                              </td>
                              <td className="px-3.5 py-2.5 text-slate-300">{d.damageReason || 'Hoàn kho sử dụng tiếp'}</td>
                              <td className="px-3.5 py-2.5 text-right font-mono text-slate-300">{formatVND(d.unitCost)}</td>
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
