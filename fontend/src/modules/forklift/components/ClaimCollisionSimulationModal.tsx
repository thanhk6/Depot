import React, { useState } from 'react';
import { ForkliftJob, ForkliftOperator, ForkliftVehicle } from '../types';
import { FORKLIFT_OPERATORS, FORKLIFT_VEHICLES } from '../mockData';
import { ShieldAlert, Users, Lock, CheckCircle2, XCircle, Play, RefreshCw, X } from 'lucide-react';

interface ClaimCollisionSimulationModalProps {
  jobs: ForkliftJob[];
  isOpen: boolean;
  onClose: () => void;
  onAttemptClaim: (
    jobId: string,
    operator: ForkliftOperator,
    vehicle: ForkliftVehicle
  ) => { success: boolean; message: string };
}

export const ClaimCollisionSimulationModal: React.FC<ClaimCollisionSimulationModalProps> = ({
  jobs = [],
  isOpen,
  onClose,
  onAttemptClaim
}) => {
  const waitingJobs = jobs.filter((j) => j.status === 'WAITING');
  const [selectedJobId, setSelectedJobId] = useState<string>(waitingJobs[0]?.id || jobs[0]?.id || '');

  const [driverA, setDriverA] = useState<ForkliftOperator>(FORKLIFT_OPERATORS[0]);
  const [truckA, setTruckA] = useState<ForkliftVehicle>(FORKLIFT_VEHICLES[0]);

  const [driverB, setDriverB] = useState<ForkliftOperator>(FORKLIFT_OPERATORS[1]);
  const [truckB, setTruckB] = useState<ForkliftVehicle>(FORKLIFT_VEHICLES[1]);

  const [logs, setLogs] = useState<{ id: string; time: string; text: string; type: 'success' | 'danger' | 'info' }[]>([]);

  if (!isOpen) return null;

  const targetJob = jobs.find((j) => j.id === selectedJobId);

  const handleClaimAsDriverA = () => {
    const time = new Date().toLocaleTimeString('vi-VN');
    const res = onAttemptClaim(selectedJobId, driverA, truckA);
    if (res.success) {
      setLogs((prev) => [
        {
          id: String(Date.now()),
          time,
          text: `[THÀNH CÔNG] Tài xế ${driverA.name} (${truckA.code}) đã KHÓA & NHẬN lệnh Container ${targetJob?.containerNo}. Status = CLAIMED.`,
          type: 'success'
        },
        ...prev
      ]);
    } else {
      setLogs((prev) => [
        {
          id: String(Date.now()),
          time,
          text: `[TỪ CHỐI] ${driverA.name} (${truckA.code}) bấm nhận nhưng: "${res.message}"`,
          type: 'danger'
        },
        ...prev
      ]);
    }
  };

  const handleClaimAsDriverB = () => {
    const time = new Date().toLocaleTimeString('vi-VN');
    const res = onAttemptClaim(selectedJobId, driverB, truckB);
    if (res.success) {
      setLogs((prev) => [
        {
          id: String(Date.now()),
          time,
          text: `[THÀNH CÔNG] Tài xế ${driverB.name} (${truckB.code}) đã KHÓA & NHẬN lệnh Container ${targetJob?.containerNo}. Status = CLAIMED.`,
          type: 'success'
        },
        ...prev
      ]);
    } else {
      setLogs((prev) => [
        {
          id: String(Date.now()),
          time,
          text: `[TỪ CHỐI] ${driverB.name} (${truckB.code}) bấm nhận nhưng: "${res.message}" (Tránh xung đột 2 xe nâng)`,
          type: 'danger'
        },
        ...prev
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600/20 border border-rose-500/30 text-rose-400 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-mono font-bold">
                  MÔ PHỎNG AN TOÀN
                </span>
                <span className="text-xs text-slate-400 font-mono">Race Condition &amp; Concurrency Test</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Kiểm Thử Xung Đột Nhận Lệnh (Atomic Lock Protection)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Target Container Selection */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase">
                1. Chọn Container trong Hàng Đợi để Thử Nghiệm Nhận Song Song:
              </label>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                targetJob?.status === 'WAITING'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : targetJob?.status === 'CLAIMED'
                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                  : 'bg-blue-950 text-blue-300 border-blue-800'
              }`}>
                {targetJob?.status || 'UNKNOWN'}
              </span>
            </div>

            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.containerNo} ({j.size} - {j.shippingLine}) — Trạng thái: {j.status} {j.claimedByOperatorName ? `(Đã nhận bởi ${j.claimedByOperatorName})` : ''}
                </option>
              ))}
            </select>

            {targetJob && (
              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span>Vị trí lấy: <strong className="text-white">{targetJob.fromLocation}</strong></span>
                <span>&bull;</span>
                <span>Dự kiến: <strong className="text-cyan-400">Block {targetJob.plannedLocation.block}-{targetJob.plannedLocation.bay}-{targetJob.plannedLocation.row}-{targetJob.plannedLocation.tier}</strong></span>
              </div>
            )}
          </div>

          {/* 2 Driver Tablet Mockups Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Driver A Panel */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
                  <span className="font-bold text-sky-400 text-xs">MÀN HÌNH XE NÂNG A</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{truckA.code}</span>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <div>Tài xế: <strong>{driverA.name}</strong> ({driverA.badgeNo})</div>
                <div>Phương tiện: <span className="font-mono text-cyan-300">{truckA.name}</span></div>
              </div>

              <button
                type="button"
                onClick={handleClaimAsDriverA}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Tài Xế A Bấm &quot;NHẬN LỆNH&quot;</span>
              </button>
            </div>

            {/* Driver B Panel */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <span className="font-bold text-amber-400 text-xs">MÀN HÌNH XE NÂNG B</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{truckB.code}</span>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <div>Tài xế: <strong>{driverB.name}</strong> ({driverB.badgeNo})</div>
                <div>Phương tiện: <span className="font-mono text-amber-300">{truckB.name}</span></div>
              </div>

              <button
                type="button"
                onClick={handleClaimAsDriverB}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Tài Xế B Bấm &quot;NHẬN LỆNH&quot;</span>
              </button>
            </div>
          </div>

          {/* Test Log Terminal */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Nhật Ký Xử Lý Khóa Container (Locking Engine Audit Log):</span>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Xóa Log
              </button>
            </div>

            <div className="h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800/80 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic text-center py-6">
                  Chưa có thao tác thử nghiệm. Nhấn nút &quot;Tài Xế A/B Bấm Nhận Lệnh&quot; ở trên để xem cơ chế khóa.
                </div>
              ) : (
                logs.map((l) => (
                  <div
                    key={l.id}
                    className={`p-2 rounded-lg text-[11px] flex items-start gap-2 ${
                      l.type === 'success'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                        : l.type === 'danger'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                        : 'bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 font-bold shrink-0">[{l.time}]</span>
                    <span>{l.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Quy tắc: Không cho phép 2 nhân viên cùng nhận một container.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
