import React, { useState } from 'react';
import { MaterialReceipt } from '../types';
import { Search, Plus, ArrowDownToLine, CheckCircle2, FileText, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface MaterialReceiptTabProps {
  receipts: MaterialReceipt[];
  onOpenCreateReceipt: () => void;
}

export const MaterialReceiptTab: React.FC<MaterialReceiptTabProps> = ({
  receipts,
  onOpenCreateReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedReceiptId, setExpandedReceiptId] = useState<number | null>(receipts[0]?.id || null);

  const filtered = receipts.filter(
    (r) =>
      r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReceiptValue = filtered.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            <span>Sổ Quản Lý Phiếu Nhập Kho (Material Receipts - PNK)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Nhập vật tư từ Nhà cung cấp vào <span className="text-amber-400 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span> • Tự động tính giá bình quân
          </p>
        </div>

        <button
          onClick={onOpenCreateReceipt}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Nhập Mới (PNK)</span>
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Số Phiếu (PNK-2026-...), Tên nhà cung cấp hoặc nội dung diễn giải..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Receipts List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
            Không tìm thấy phiếu nhập kho nào.
          </div>
        ) : (
          filtered.map((r) => {
            const isExpanded = expandedReceiptId === r.id;

            return (
              <div
                key={r.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition shadow-lg"
              >
                {/* Receipt Card Header */}
                <div
                  onClick={() => setExpandedReceiptId(isExpanded ? null : r.id)}
                  className="p-4 bg-slate-900/80 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{r.receiptNo}</span>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold">
                          HOÀN THÀNH
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        NCC: <strong className="text-amber-400">{r.supplierName}</strong> • Ngày: <span className="font-mono">{r.receiptDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Tổng tiền nhập (VND):</span>
                      <span className="text-base font-bold text-emerald-400 font-mono">
                        {formatVND(r.totalAmount)}
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
                        <span className="text-slate-400 block text-[11px]">Người lập phiếu:</span>
                        <span className="font-medium text-white">{r.createdBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Người duyệt:</span>
                        <span className="font-medium text-white">{r.approvedBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nội dung diễn giải:</span>
                        <span className="font-medium text-slate-300">{r.note}</span>
                      </div>
                    </div>

                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="px-3.5 py-2.5">Mã Vật Tư</th>
                            <th className="px-3.5 py-2.5">Tên Vật Tư</th>
                            <th className="px-3.5 py-2.5 text-center">ĐVT</th>
                            <th className="px-3.5 py-2.5 text-center">Số Lượng Nhập</th>
                            <th className="px-3.5 py-2.5 text-right">Đơn Giá Nhập</th>
                            <th className="px-3.5 py-2.5 text-right">Thành Tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {r.details.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-900/40">
                              <td className="px-3.5 py-2.5 font-mono font-bold text-amber-400">{d.materialCode}</td>
                              <td className="px-3.5 py-2.5 text-white font-medium">{d.materialName}</td>
                              <td className="px-3.5 py-2.5 text-center font-bold text-slate-400 font-mono">{d.unit}</td>
                              <td className="px-3.5 py-2.5 text-center font-mono font-bold text-emerald-400">{d.quantity}</td>
                              <td className="px-3.5 py-2.5 text-right font-mono text-slate-300">{formatVND(d.unitCost)}</td>
                              <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-300">{formatVND(d.totalCost)}</td>
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
