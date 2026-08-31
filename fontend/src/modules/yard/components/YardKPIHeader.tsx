import React from 'react';
import { YardStatistics } from '../types/yardTypes';
import {
  Boxes,
  CheckCircle2,
  Percent,
  Wrench,
  Droplets,
  ShieldAlert,
  LogOut,
  Truck
} from 'lucide-react';

interface YardKPIHeaderProps {
  statistics: YardStatistics;
  onFilterStatus?: (status: string) => void;
}

export const YardKPIHeader: React.FC<YardKPIHeaderProps> = ({
  statistics,
  onFilterStatus
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* 1. Total Containers */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('ALL')}
        className="p-3.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-2xl cursor-pointer transition flex flex-col justify-between group shadow-sm"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Container</span>
          <Boxes className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black font-mono text-white">
            {statistics.totalContainers.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">/ {statistics.totalCapacity} slot</span>
        </div>
      </div>

      {/* 2. Free Slots */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('EMPTY_SLOT')}
        className="p-3.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-2xl cursor-pointer transition flex flex-col justify-between group shadow-sm"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Vị Trí Trống</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black font-mono text-emerald-400">
            {statistics.availableSlots.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-500/80 font-mono">Slot rỗi</span>
        </div>
      </div>

      {/* 3. Occupancy */}
      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Tỷ Lệ Lấp Đầy</span>
          <Percent className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black font-mono text-indigo-300">
            {statistics.occupancyRate}%
          </span>
          <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                statistics.occupancyRate > 85
                  ? 'bg-rose-500'
                  : statistics.occupancyRate > 65
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, statistics.occupancyRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Repair */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('REPAIR')}
        className="p-3.5 bg-slate-900/90 hover:bg-amber-950/30 border border-amber-900/40 rounded-2xl cursor-pointer transition flex flex-col justify-between group shadow-sm"
      >
        <div className="flex items-center justify-between text-amber-300 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Sửa Chữa EMR</span>
          <Wrench className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black font-mono text-amber-300">
            {statistics.repairCount}
          </span>
          <span className="text-[10px] text-amber-500 font-mono">Đang sửa</span>
        </div>
      </div>

      {/* 5. Cleaning */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('CLEANING')}
        className="p-3.5 bg-slate-900/90 hover:bg-orange-950/30 border border-orange-900/40 rounded-2xl cursor-pointer transition flex flex-col justify-between group shadow-sm"
      >
        <div className="flex items-center justify-between text-orange-300 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Vệ Sinh Rửa</span>
          <Droplets className="w-4 h-4 text-orange-400 group-hover:scale-110 transition" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black font-mono text-orange-300">
            {statistics.cleaningCount}
          </span>
          <span className="text-[10px] text-orange-500 font-mono">Đang rửa</span>
        </div>
      </div>

      {/* 6. Hold */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('HOLD')}
        className="p-3.5 bg-slate-900/90 hover:bg-rose-950/30 border border-rose-900/40 rounded-2xl cursor-pointer transition flex flex-col justify-between group shadow-sm"
      >
        <div className="flex items-center justify-between text-rose-300 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Tạm Giữ (HOLD)</span>
          <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black font-mono text-rose-400">
            {statistics.holdCount}
          </span>
          <span className="text-[10px] text-rose-500 font-mono">Bị khóa</span>
        </div>
      </div>

      {/* 7. Waiting Gate-Out */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('WAITING_GATE_OUT')}
        className="p-3.5 bg-slate-900/90 hover:bg-indigo-950/30 border border-indigo-900/40 rounded-2xl cursor-pointer transition flex flex-col justify-between group shadow-sm"
      >
        <div className="flex items-center justify-between text-indigo-300 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Chờ Gate-Out</span>
          <LogOut className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black font-mono text-indigo-300">
            {statistics.waitingGateOutCount}
          </span>
          <span className="text-[10px] text-indigo-400 font-mono">Tại Staging</span>
        </div>
      </div>

      {/* 8. Active Forklifts */}
      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Xe Nâng Hoạt Động</span>
          <Truck className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black font-mono text-yellow-400">
            {statistics.activeForklifts}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Xe sẵn sàng</span>
        </div>
      </div>
    </div>
  );
};
