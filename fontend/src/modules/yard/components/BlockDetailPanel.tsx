import React from 'react';
import { YardBlock } from '../types/yardTypes';
import {
  X,
  Grid3X3,
  Boxes,
  Percent,
  Wrench,
  Droplets,
  ShieldAlert,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface BlockDetailPanelProps {
  block: YardBlock | null;
  onClose: () => void;
  onFocusBlock: (block: YardBlock) => void;
}

export const BlockDetailPanel: React.FC<BlockDetailPanelProps> = ({
  block,
  onClose,
  onFocusBlock
}) => {
  if (!block) return null;

  const occupancyRate =
    block.totalCapacity > 0
      ? Number(((block.occupiedCount / block.totalCapacity) * 100).toFixed(1))
      : 0;

  return (
    <div className="w-full lg:w-[400px] bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl z-20 text-xs overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <Grid3X3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-black text-slate-900">BLOCK {block.blockCode}</h3>
            <p className="text-[10px] text-slate-500">{block.blockName}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Description */}
        <p className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
          {block.description}
        </p>

        {/* Capacity & Occupancy Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Tỷ Lệ Lấp Đầy (Occupancy)
            </span>
            <span className="font-mono font-bold text-teal-600 text-sm">{occupancyRate}%</span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyRate > 85
                  ? 'bg-rose-500'
                  : occupancyRate > 65
                  ? 'bg-amber-500'
                  : 'bg-teal-500'
              }`}
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">Tổng Sức Chứa</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{block.totalCapacity}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Đang Chứa</span>
              <span className="font-mono font-bold text-indigo-600 text-sm">{block.occupiedCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Còn Trống</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {block.availableCount}
              </span>
            </div>
          </div>
        </div>

        {/* Dimensions Specs */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            Cấu Trúc Không Gian Block
          </span>

          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Số Lượng Bay</span>
              <span className="font-mono font-bold text-slate-700">{block.bayCount} Bays</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Số Lượng Row</span>
              <span className="font-mono font-bold text-slate-700">{block.rowCount} Rows</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Tầng Max (Tier)</span>
              <span className="font-mono font-bold text-teal-700">{block.maxTier} Tiers</span>
            </div>
          </div>
        </div>

        {/* Breakdown by Status */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            Phân Loại Container Trong Block
          </span>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
              <span className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Chờ & Đang Sửa Chữa (Repair)</span>
              </span>
              <span className="font-mono font-bold">{block.repairCount} Cont</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-700">
              <span className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-orange-600" />
                <span>Vệ Sinh Xịt Rửa (Cleaning)</span>
              </span>
              <span className="font-mono font-bold">{block.cleaningCount} Cont</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Niêm Phong Tạm Giữ (Hold)</span>
              </span>
              <span className="font-mono font-bold">{block.holdCount} Cont</span>
            </div>
          </div>
        </div>

        {/* Focus Action */}
        <button
          onClick={() => onFocusBlock(block)}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          <span>PHÓNG TO CHI TIẾT BLOCK {block.blockCode}</span>
        </button>
      </div>
    </div>
  );
};
