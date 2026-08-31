import React from 'react';
import { ForkliftJob, ForkliftOperator, ForkliftVehicle } from '../types';
import { 
  Truck, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  Flame, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface ForkliftJobCardProps {
  job: ForkliftJob;
  activeOperator: ForkliftOperator;
  activeVehicle: ForkliftVehicle;
  onClaim: (job: ForkliftJob) => void;
  onStartExecution: (job: ForkliftJob) => void;
  onOpenDropModal: (job: ForkliftJob) => void;
  onCancelClaim: (job: ForkliftJob) => void;
  onViewYard: (job: ForkliftJob) => void;
}

export const ForkliftJobCard: React.FC<ForkliftJobCardProps> = ({
  job,
  activeOperator,
  activeVehicle,
  onClaim,
  onStartExecution,
  onOpenDropModal,
  onCancelClaim,
  onViewYard
}) => {
  const isClaimedByMe = job.claimedByOperatorId === activeOperator.id;
  const isClaimedByOther = job.claimedByOperatorId && job.claimedByOperatorId !== activeOperator.id;

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold flex items-center gap-1 animate-pulse">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>GẤP / ƯU TIÊN CAO</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
            ƯU TIÊN
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium">
            Bình Thường
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return (
          <span className="px-3 py-1 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800/80 text-xs font-mono font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>CHỜ HẠ BÃI (WAITING)</span>
          </span>
        );
      case 'CLAIMED':
        return (
          <span className="px-3 py-1 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/80 text-xs font-mono font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>ĐÃ NHẬN LỆNH (CLAIMED)</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-3 py-1 rounded-xl bg-sky-950/80 text-sky-300 border border-sky-800/80 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
            <Truck className="w-3.5 h-3.5 text-sky-400" />
            <span>ĐANG VẬN CHUYỂN (IN PROGRESS)</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ĐÃ HẠ BÃI (COMPLETED)</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'AV':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
      case 'CL':
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'DM':
        return 'text-rose-400 bg-rose-950/80 border-rose-800';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-200 ${
      job.status === 'IN_PROGRESS'
        ? 'bg-slate-900/95 border-sky-500/70 shadow-xl shadow-sky-950/40 ring-1 ring-sky-500/40'
        : job.status === 'CLAIMED'
        ? isClaimedByMe
          ? 'bg-slate-900/95 border-purple-500/70 shadow-xl shadow-purple-950/30'
          : 'bg-slate-900/60 border-slate-800/80 opacity-80'
        : job.status === 'COMPLETED'
        ? 'bg-slate-900/60 border-emerald-500/40'
        : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
    }`}>
      {/* Top Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400">
            #{job.jobNo}
          </span>
          <span className="text-slate-600">&bull;</span>
          {getPriorityBadge(job.priority)}
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(job.status)}
        </div>
      </div>

      {/* Main Body */}
      <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Col 1: Container Info (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black font-mono text-white tracking-wider">
              {job.containerNo}
            </span>
            <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold font-mono ${getConditionColor(job.condition)}`}>
              {job.condition}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono font-bold border border-slate-700">
              {job.size}
            </span>
            <span className="font-semibold text-blue-400 font-mono">
              {job.shippingLine}
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-400">{job.isoCode}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Chờ: <strong>{job.waitingDurationMinutes || 12} phút</strong></span>
            <span>({job.waitingSince?.substring(11, 16) || '08:45'})</span>
          </div>
        </div>

        {/* Col 2: Routing (From Location -> Planned / Actual Location) (5 cols) */}
        <div className="md:col-span-5 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
          {/* From */}
          <div className="flex items-start gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Vị Trí Lấy (From Location):</div>
              <div className="font-semibold text-slate-200 font-mono">{job.fromLocation}</div>
            </div>
          </div>

          {/* Arrow Divider */}
          <div className="pl-3 py-0.5 flex items-center gap-1 text-[10px] font-mono text-teal-400">
            <ArrowRight className="w-3 h-3 text-teal-400" />
            <span>Vận chuyển đến bãi lưu trữ:</span>
          </div>

          {/* To Planned / Actual */}
          <div className="flex items-start gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-teal-400">
                {job.status === 'COMPLETED' ? 'Vị Trí Thực Tế (Actual Location):' : 'Vị Trí Dự Kiến (Planned Location):'}
              </div>
              <div className="font-black text-sm text-cyan-300 font-mono">
                {job.status === 'COMPLETED' && job.actualLocation ? (
                  <>
                    BLOCK {job.actualLocation.block} &bull; BAY {job.actualLocation.bay} &bull; ROW {job.actualLocation.row} &bull; TIER {job.actualLocation.tier}
                  </>
                ) : (
                  <>
                    BLOCK {job.plannedLocation.block} &bull; BAY {job.plannedLocation.bay} &bull; ROW {job.plannedLocation.row} &bull; TIER {job.plannedLocation.tier}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Operator & Forklift Assignment (3 cols) */}
        <div className="md:col-span-3 space-y-2 text-xs">
          {job.claimedByOperatorName ? (
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Tài xế &amp; Xe nâng:</div>
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>{job.assignedForkliftCode || 'FL-001'}</span>
              </div>
              <div className="text-slate-300 truncate">
                {job.claimedByOperatorName}
              </div>
              {job.claimedAt && (
                <div className="text-[10px] text-slate-500 font-mono">
                  Nhận: {job.claimedAt.substring(11, 16)}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 italic text-[11px]">
              Chưa có xe nâng nhận lệnh
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Button Bar (Touch Friendly) */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          {job.status === 'WAITING' && (
            <span className="text-emerald-400 font-medium">
              &bull; Sẵn sàng nhận lệnh hạ bãi ngay
            </span>
          )}
          {job.status === 'CLAIMED' && isClaimedByMe && (
            <span className="text-purple-300 font-medium">
              &bull; Bạn đã khóa container này. Hãy đến vị trí lấy container.
            </span>
          )}
          {job.status === 'CLAIMED' && isClaimedByOther && (
            <span className="text-slate-400 italic">
              &bull; Đã được khóa bởi <strong>{job.claimedByOperatorName}</strong> ({job.assignedForkliftCode})
            </span>
          )}
          {job.status === 'IN_PROGRESS' && isClaimedByMe && (
            <span className="text-sky-300 font-medium animate-pulse">
              &bull; Đang cẩu nâng di chuyển... Hãy hạ bãi và xác nhận vị trí.
            </span>
          )}
          {job.status === 'COMPLETED' && (
            <span className="text-emerald-400 font-mono">
              &bull; Hoàn tất: {job.completedAt?.substring(11, 16) || '09:15'}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* 1. STATE: WAITING -> CLAIM BUTTON */}
          {job.status === 'WAITING' && (
            <button
              onClick={() => onClaim(job)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>[ NHẬN LỆNH ]</span>
            </button>
          )}

          {/* 2. STATE: CLAIMED BY ME -> START EXECUTION & CANCEL */}
          {job.status === 'CLAIMED' && isClaimedByMe && (
            <>
              <button
                onClick={() => onCancelClaim(job)}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 cursor-pointer"
                title="Hủy nhận lệnh và trả về hàng đợi chung"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Trả Lệnh</span>
              </button>

              <button
                onClick={() => onStartExecution(job)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>[ BẮT ĐẦU THỰC HIỆN ]</span>
              </button>
            </>
          )}

          {/* 2B. STATE: CLAIMED BY OTHER -> DISABLED */}
          {job.status === 'CLAIMED' && isClaimedByOther && (
            <div className="px-4 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Đang khóa bởi xe khác</span>
            </div>
          )}

          {/* 3. STATE: IN PROGRESS BY ME -> CONFIRM DROP */}
          {job.status === 'IN_PROGRESS' && isClaimedByMe && (
            <button
              onClick={() => onOpenDropModal(job)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-teal-600/30 transition flex items-center gap-2 cursor-pointer animate-bounce"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>[ XÁC NHẬN ĐÃ HẠ ]</span>
            </button>
          )}

          {/* 3B. STATE: IN PROGRESS BY OTHER */}
          {job.status === 'IN_PROGRESS' && isClaimedByOther && (
            <div className="px-4 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-sky-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 animate-pulse" />
              <span>Xe {job.assignedForkliftCode} đang vận chuyển</span>
            </div>
          )}

          {/* 4. STATE: COMPLETED -> VIEW YARD */}
          {job.status === 'COMPLETED' && (
            <button
              onClick={() => onViewYard(job)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Xem Tọa Độ Trên Yard 2D</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
