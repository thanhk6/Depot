import React, { useState } from 'react';
import { Stocktake } from '../types';
import { Search, Plus, ClipboardCheck, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface StocktakeTabProps {
  stocktakes: Stocktake[];
  onOpenCreateStocktake: () => void;
  onSelectStocktake: (stocktake: Stocktake) => void;
}

export const StocktakeTab: React.FC<StocktakeTabProps> = ({
  stocktakes,
  onOpenCreateStocktake,
  onSelectStocktake
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = stocktakes.filter(
    (s) =>
      s.stocktakeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.countedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Stocktake['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg font-bold border border-slate-700 text-xs">1. NHÁP</span>;
      case 'COUNTING':
        return <span className="px-2.5 py-1 bg-sky-950 text-sky-400 rounded-lg font-bold border border-sky-800 text-xs">2. ĐANG ĐẾM</span>;
      case 'REVIEW':
        return <span className="px-2.5 py-1 bg-amber-950 text-amber-400 rounded-lg font-bold border border-amber-800 text-xs">3. ĐỐI SOÁT</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-indigo-950 text-indigo-400 rounded-lg font-bold border border-indigo-800 text-xs">4. ĐÃ DUYỆT</span>;
      case 'POSTED':
        return <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 rounded-lg font-bold border border-emerald-800 text-xs">5. ĐÃ CHỐT TỒN (POSTED)</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-purple-400" />
            <span>Sổ Quản Lý Các Đợt Kiểm Kê Kho (Stocktakes - STK)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quy trình kiểm kê 5 bước chuẩn EMR Depot: <span className="text-purple-300 font-semibold">Khởi tạo → Đếm thực tế → Đối soát chênh lệch → Duyệt → Chốt cập nhật tồn</span>
          </p>
        </div>

        <button
          onClick={onOpenCreateStocktake}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Khởi Tạo Đợt Kiểm Kê Mới</span>
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Mã Đợt (STK-2026-...), Tiêu đề hoặc Người kiểm đếm..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Stocktakes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
            Không tìm thấy đợt kiểm kê nào.
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectStocktake(s)}
              className="p-5 bg-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-2xl cursor-pointer transition shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-sm">{s.stocktakeNo}</span>
                  {getStatusBadge(s.status)}
                </div>
                <h3 className="font-bold text-white text-sm">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.notes}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tồn Sổ Sách:</span>
                  <span className="font-mono font-bold text-slate-200">{s.totalSystemQty} SP</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Đếm Thực Tế:</span>
                  <span className="font-mono font-bold text-white">{s.totalActualQty} SP</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Chênh Lệch:</span>
                  <span
                    className={`font-mono font-bold ${
                      s.totalDifferenceQty === 0
                        ? 'text-emerald-400'
                        : s.totalDifferenceQty > 0
                        ? 'text-sky-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {s.totalDifferenceQty > 0 ? `+${s.totalDifferenceQty}` : s.totalDifferenceQty} SP
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400">
                  Người đếm: <strong className="text-slate-200">{s.countedBy?.split('(')?.[0] || s.countedBy || ''}</strong>
                </span>
                <span className="text-purple-400 font-semibold flex items-center gap-1">
                  <span>Mở bảng kiểm đếm</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
