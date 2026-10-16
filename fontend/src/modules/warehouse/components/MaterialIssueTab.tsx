import React, { useState } from 'react';
import { MaterialIssue } from '../types';
import { Search, Plus, ArrowUpFromLine, CheckCircle2, FileText, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface MaterialIssueTabProps {
  issues: MaterialIssue[];
  onOpenCreateIssue: () => void;
}

export const MaterialIssueTab: React.FC<MaterialIssueTabProps> = ({
  issues,
  onOpenCreateIssue
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIssueId, setExpandedIssueId] = useState<number | null>(issues[0]?.id || null);

  const filtered = issues.filter(
    (i) =>
      i.issueNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ArrowUpFromLine className="w-4 h-4 text-amber-600" />
            <span>Sổ Quản Lý Phiếu Xuất Kho (Material Issues - PXK)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Xuất vật tư trực tiếp cho Work Order thi công sửa chữa container • Kiểm tra tồn khả dụng tự động (Không âm kho)
          </p>
        </div>

        <button
          onClick={onOpenCreateIssue}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg  transition"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Xuất Mới (PXK)</span>
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Số Phiếu (PXK-2026-...), Mã Lệnh WO, Số Cont hoặc Tên Thợ nhận..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            Không tìm thấy phiếu xuất kho nào.
          </div>
        ) : (
          filtered.map((i) => {
            const isExpanded = expandedIssueId === i.id;

            return (
              <div
                key={i.id}
                className="bg-slate-50 border border-slate-200 hover:border-slate-200 rounded-2xl overflow-hidden transition shadow-lg"
              >
                {/* Issue Card Header */}
                <div
                  onClick={() => setExpandedIssueId(isExpanded ? null : i.id)}
                  className="p-4 bg-white cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{i.issueNo}</span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                          ĐÃ XUẤT KHO
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-mono">
                          {i.shippingLine}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">
                        Lệnh: <strong className="text-amber-600 font-mono">{i.workOrderNo}</strong> • Cont: <strong className="text-slate-900 font-mono">{i.containerNo}</strong> • Thợ: <span className="text-slate-700">{i.recipientName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Tổng chi phí xuất (VND):</span>
                      <span className="text-base font-bold text-amber-600 font-mono">
                        {formatVND(i.totalAmount)}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Ngày xuất kho:</span>
                        <span className="font-mono font-bold text-slate-900">{i.issueDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Người lập phiếu:</span>
                        <span className="font-medium text-slate-900">{i.createdBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Người duyệt:</span>
                        <span className="font-medium text-slate-900">{i.approvedBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Ghi chú:</span>
                        <span className="font-medium text-slate-700">{i.note}</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-3.5 py-2.5">Mã Vật Tư</th>
                            <th className="px-3.5 py-2.5">Tên Vật Tư</th>
                            <th className="px-3.5 py-2.5 text-center">ĐVT</th>
                            <th className="px-3.5 py-2.5 text-center">Số Lượng Xuất</th>
                            <th className="px-3.5 py-2.5 text-right">Đơn Giá Bình Quân</th>
                            <th className="px-3.5 py-2.5 text-right">Thành Tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60">
                          {i.details.map((d) => (
                            <tr key={d.id} className="hover:bg-white">
                              <td className="px-3.5 py-2.5 font-mono font-bold text-amber-600">{d.materialCode}</td>
                              <td className="px-3.5 py-2.5 text-slate-900 font-medium">{d.materialName}</td>
                              <td className="px-3.5 py-2.5 text-center font-bold text-slate-500 font-mono">{d.unit}</td>
                              <td className="px-3.5 py-2.5 text-center font-mono font-bold text-amber-600">{d.quantity}</td>
                              <td className="px-3.5 py-2.5 text-right font-mono text-slate-700">{formatVND(d.unitCost)}</td>
                              <td className="px-3.5 py-2.5 text-right font-mono font-bold text-amber-700">{formatVND(d.totalCost)}</td>
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
