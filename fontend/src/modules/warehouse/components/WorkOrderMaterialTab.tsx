import React, { useState } from 'react';
import { WorkOrderMaterial } from '../types';
import { Search, Filter, ShieldCheck, ArrowUpFromLine, RotateCcw, CheckCircle2, AlertOctagon, Wrench } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface WorkOrderMaterialTabProps {
  workOrderMaterials: WorkOrderMaterial[];
  onOpenIssue: () => void;
  onOpenReturn: () => void;
}

export const WorkOrderMaterialTab: React.FC<WorkOrderMaterialTabProps> = ({
  workOrderMaterials,
  onOpenIssue,
  onOpenReturn
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filtered = workOrderMaterials.filter((w) => {
    const matchesSearch =
      w.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.issuedTo && w.issuedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'ALL' || w.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCost = filtered.reduce((sum, w) => {
    const actualQty = w.usedQuantity > 0 ? w.usedQuantity : w.issuedQuantity;
    return sum + actualQty * w.unitCost;
  }, 0);

  const getStatusBadge = (status: WorkOrderMaterial['status']) => {
    switch (status) {
      case 'RESERVED':
        return <span className="px-2.5 py-0.5 bg-sky-950 text-sky-300 rounded font-bold text-[10px] border border-sky-700">1. ĐÃ GIỮ (RESERVED)</span>;
      case 'PARTIALLY_ISSUED':
        return <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 rounded font-bold text-[10px] border border-indigo-700">2. XUẤT MỘT PHẦN</span>;
      case 'ISSUED':
        return <span className="px-2.5 py-0.5 bg-amber-950 text-amber-300 rounded font-bold text-[10px] border border-amber-700">3. ĐÃ XUẤT (ISSUED)</span>;
      case 'USED':
        return <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 rounded font-bold text-[10px] border border-emerald-700">4. ĐÃ QUYẾT TOÁN (USED)</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-0.5 bg-teal-950 text-teal-300 rounded font-bold text-[10px] border border-teal-700">5. ĐÃ TRẢ KHO</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 bg-rose-950 text-rose-300 rounded font-bold text-[10px] border border-rose-700">ĐÃ HỦY</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded font-bold text-[10px] border border-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Quản Lý Vật Tư Theo Lệnh Sửa Chữa (Work Order Materials)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mỗi container thi công đều gắn liền với định mức vật tư: <span className="text-amber-300 font-semibold">Reserve → Issue → Used/Return → Quyết toán chi phí sửa chữa</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenIssue}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>+ Xuất Vật Tư Cho WO</span>
          </button>
          <button
            onClick={onOpenReturn}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Trả Vật Tư Thừa</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã Lệnh (WO), Số Container (MSKU...), Tên thợ hoặc Tên vật tư..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="ALL">-- Tất Cả Trạng Thái WO --</option>
          <option value="REQUIRED">1. YÊU CẦU (REQUIRED)</option>
          <option value="RESERVED">2. ĐÃ TẠM GIỮ (RESERVED)</option>
          <option value="ISSUED">3. ĐÃ XUẤT THI CÔNG (ISSUED)</option>
          <option value="COMPLETED">4. ĐÃ QUYẾT TOÁN (COMPLETED)</option>
        </select>
      </div>

      {/* WO Material Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-3">Lệnh WO / Container</th>
                <th className="px-3.5 py-3">Hãng Tàu</th>
                <th className="px-3.5 py-3">Vật Tư & Hạng Mục Sửa Chữa</th>
                <th className="px-3.5 py-3 text-center">ĐVT</th>
                <th className="px-3.5 py-3 text-center">Yêu Cầu</th>
                <th className="px-3.5 py-3 text-center">Đã Giữ</th>
                <th className="px-3.5 py-3 text-center">Đã Xuất</th>
                <th className="px-3.5 py-3 text-center">Thực Dùng</th>
                <th className="px-3.5 py-3 text-center">Trả Lại</th>
                <th className="px-3.5 py-3 text-center">Hỏng</th>
                <th className="px-3.5 py-3 text-right">Đơn Giá TB</th>
                <th className="px-3.5 py-3 text-right">Chi Phí Vật Tư</th>
                <th className="px-3.5 py-3 text-center">Trạng Thái</th>
                <th className="px-3.5 py-3">Thợ Phụ Trách</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-12 text-center text-slate-500">
                    Không tìm thấy dữ liệu vật tư sửa chữa nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const actualUsed = w.usedQuantity > 0 ? w.usedQuantity : w.issuedQuantity;
                  const itemCost = actualUsed * w.unitCost;

                  return (
                    <tr key={w.id} className="hover:bg-slate-900/60 transition">
                      <td className="px-3.5 py-3">
                        <span className="font-mono font-bold text-amber-400 block">{w.workOrderNo}</span>
                        <span className="font-mono font-bold text-white text-xs">{w.containerNo}</span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 rounded font-bold text-[10px]">
                          {w.shippingLine}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="font-semibold text-white block">{w.materialName}</span>
                        <span className="text-[11px] text-slate-400">[{w.materialCode}] {w.repairItemName && `• ${w.repairItemName}`}</span>
                      </td>
                      <td className="px-3.5 py-3 text-center font-bold text-slate-300 font-mono">
                        {w.unit}
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono text-slate-400">
                        {w.requiredQuantity}
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold text-sky-400">
                        {w.reservedQuantity > 0 ? w.reservedQuantity : '-'}
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold text-amber-400">
                        {w.issuedQuantity > 0 ? w.issuedQuantity : '-'}
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold text-emerald-400">
                        {w.usedQuantity > 0 ? w.usedQuantity : '-'}
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold text-sky-400">
                        {w.returnedQuantity > 0 ? w.returnedQuantity : '-'}
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold text-rose-400">
                        {w.damagedQuantity > 0 ? w.damagedQuantity : '-'}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-slate-300">
                        {formatVND(w.unitCost)}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-amber-300">
                        {formatVND(itemCost)}
                      </td>
                      <td className="px-3.5 py-3 text-center">{getStatusBadge(w.status)}</td>
                      <td className="px-3.5 py-3 text-slate-300 font-medium whitespace-nowrap">
                        {w.issuedTo || 'Chưa xuất'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-slate-900 font-bold border-t border-slate-800 text-white">
                <tr>
                  <td colSpan={11} className="px-3.5 py-3 text-white">
                    TỔNG CHI PHÍ VẬT TƯ THỰC DÙNG ({filtered.length} DÒNG):
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono text-amber-300 text-sm">
                    {formatVND(totalCost)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
