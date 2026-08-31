import React, { useState } from 'react';
import { MaterialDamage } from '../types';
import { Search, Plus, AlertOctagon, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface MaterialDamageTabProps {
  damages: MaterialDamage[];
  onOpenReportDamage: () => void;
}

export const MaterialDamageTab: React.FC<MaterialDamageTabProps> = ({
  damages,
  onOpenReportDamage
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = damages.filter(
    (d) =>
      d.damageNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.containerNo && d.containerNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalLoss = filtered.reduce((sum, d) => sum + d.lossAmount, 0);

  const getResolutionBadge = (res: MaterialDamage['resolution']) => {
    switch (res) {
      case 'PENDING_SURVEY':
        return <span className="px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded font-bold text-[10px]">CHỜ GIÁM ĐỊNH</span>;
      case 'RETURN_TO_SUPPLIER':
        return <span className="px-2.5 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 rounded font-bold text-[10px]">YÊU CẦU ĐỔI TRẢ NCC</span>;
      case 'REPAIRED':
        return <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded font-bold text-[10px]">ĐÃ TẬN DỤNG SỬA</span>;
      case 'DISPOSED':
        return <span className="px-2.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-bold text-[10px]">ĐÃ THANH LÝ PHẾ LIỆU</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Sổ Quản Lý Vật Tư Hỏng / Phế Liệu (Material Damages - PHG)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ghi nhận vật tư hư hại trong quá trình lưu kho hoặc thi công container • Tự động cách ly khỏi Tồn khả dụng
          </p>
        </div>

        <button
          onClick={onOpenReportDamage}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Khai Báo Vật Tư Hỏng (PHG)</span>
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Mã Phiếu (PHG-2026-...), Tên vật tư, Số container hoặc Nguyên nhân..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-3">Mã Biên Bản</th>
                <th className="px-3.5 py-3">Vật Tư Bị Hỏng</th>
                <th className="px-3.5 py-3 text-center">ĐVT</th>
                <th className="px-3.5 py-3 text-center">Số Lượng</th>
                <th className="px-3.5 py-3 text-right">Đơn Giá</th>
                <th className="px-3.5 py-3 text-right">Giá Trị Thiệt Hại</th>
                <th className="px-3.5 py-3">Lệnh WO / Container</th>
                <th className="px-3.5 py-3">Nguyên Nhân Hư Hại</th>
                <th className="px-3.5 py-3 text-center">Hướng Xử Lý</th>
                <th className="px-3.5 py-3">Người Báo Cáo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    Không có bản ghi vật tư hư hỏng nào.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/60 transition">
                    <td className="px-3.5 py-3 font-mono font-bold text-rose-400 whitespace-nowrap">
                      {d.damageNo}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="font-semibold text-white block">{d.materialName}</span>
                      <span className="font-mono text-slate-400 text-[11px]">[{d.materialCode}]</span>
                    </td>
                    <td className="px-3.5 py-3 text-center font-bold text-slate-400 font-mono">
                      {d.unit}
                    </td>
                    <td className="px-3.5 py-3 text-center font-mono font-bold text-rose-400 text-sm">
                      {d.quantity}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono text-slate-400">
                      {formatVND(d.unitCost)}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-bold text-rose-300">
                      {formatVND(d.lossAmount)}
                    </td>
                    <td className="px-3.5 py-3 font-mono">
                      {d.workOrderNo ? (
                        <>
                          <span className="text-amber-400 font-bold block">{d.workOrderNo}</span>
                          <span className="text-white text-[11px]">{d.containerNo}</span>
                        </>
                      ) : (
                        <span className="text-slate-500">Hỏng trong kho</span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 text-slate-300">
                      {d.reason}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      {getResolutionBadge(d.resolution)}
                    </td>
                    <td className="px-3.5 py-3 text-slate-300 whitespace-nowrap">
                      <span className="block">{d.reportedBy?.split('(')?.[0] || d.reportedBy || ''}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{d.reportedDate}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-slate-900 font-bold border-t border-slate-800 text-white">
                <tr>
                  <td colSpan={5} className="px-3.5 py-3 text-white">
                    TỔNG THIỆT HẠI PHẾ LIỆU / HỎNG ({filtered.length} VỤ):
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono text-rose-400 text-sm">
                    {formatVND(totalLoss)}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
