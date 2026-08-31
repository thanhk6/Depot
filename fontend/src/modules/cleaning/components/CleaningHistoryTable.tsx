import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  User,
  ShieldCheck,
  Droplets,
  Printer,
  FileText
} from 'lucide-react';
import { CleaningExecutionRecord } from '../types';

interface CleaningHistoryTableProps {
  orders: CleaningExecutionRecord[];
}

export const CleaningHistoryTable: React.FC<CleaningHistoryTableProps> = ({ orders }) => {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  const historyOrders = orders.filter(
    (o) => o.status === 'HANDOVER_TO_OPERATION' || o.status === 'CLEANED'
  );

  const filtered = historyOrders.filter((o) => {
    const matchSearch =
      o.containerNo.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingLine.toLowerCase().includes(search.toLowerCase()) ||
      o.cleaningStaff.toLowerCase().includes(search.toLowerCase());
    const matchGrade = gradeFilter === 'ALL' || o.targetQualityGrade === gradeFilter;
    return matchSearch && matchGrade;
  });

  return (
    <div className="space-y-4">
      {/* Header filter */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <span>Nhật Ký &amp; Lịch Sử Vệ Sinh Đã Bàn Giao Khai Thác</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hồ sơ lưu trữ toàn bộ công tác vệ sinh, hóa chất sử dụng, nghiệm thu Grade và thời điểm chuyển sang AV.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo Container No, Hãng tàu, Nhân viên vệ sinh..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Tất cả Phân Hạng Grade</option>
              <option value="GRADE_A">Grade A - Xuất Khẩu Cao Cấp</option>
              <option value="FOOD_GRADE">Food Grade - Nông Sản / Thực Phẩm</option>
              <option value="GENERAL_CARGO">General Cargo - Bách Hóa</option>
              <option value="SCRAP_GRADE">Scrap Grade - Phế Liệu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Container No</th>
                <th className="py-3.5 px-3">Hãng Tàu</th>
                <th className="py-3.5 px-3">Hạng Mục &amp; Hóa Chất</th>
                <th className="py-3.5 px-3">Kỹ Thuật Viên</th>
                <th className="py-3.5 px-3">Phân Hạng Sau Rửa</th>
                <th className="py-3.5 px-3">Thời Điểm Hoàn Tất</th>
                <th className="py-3.5 px-4 text-right">Tổng Cước</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-xs">Chưa có lịch sử vệ sinh phù hợp</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-sm">
                          {order.containerNo}
                        </span>
                        <span className="px-1.5 py-0.2 bg-slate-800 text-cyan-300 font-mono text-[9px] rounded font-bold">
                          {order.size}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{order.eeirNo}</span>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-200">
                      {order.shippingLine}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-semibold block">
                          {order.items.length} hạng mục thi công
                        </span>
                        <span className="text-[10px] text-purple-300 font-mono">
                          {order.chemicalUsed || 'Nước sạch áp lực'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-slate-300 font-semibold block">{order.cleaningStaff}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{order.cleaningBay?.split(' ')?.[0] || order.cleaningBay || ''}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{order.targetQualityGrade.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                      {order.completedAt || order.afterPhotoTimestamp || '2026-08-14 08:40'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                      {order.totalCost.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
