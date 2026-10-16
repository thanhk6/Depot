import React from 'react';
import { StaffRealtimeItem } from '../mockStaffRealtimeData';
import {
  X,
  User,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Wrench,
  ShieldCheck,
  TrendingUp,
  Boxes,
  Calendar,
  Award,
  Zap,
  MapPin
} from 'lucide-react';

interface StaffDetailModalProps {
  staff: StaffRealtimeItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  staff,
  isOpen,
  onClose
}) => {
  if (!isOpen || !staff) return null;

  const isBusy = staff.status === 'BUSY';
  const isAvailable = staff.status === 'AVAILABLE';

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b132b] border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg ">
              <div className="w-full h-full bg-[#0a1128] rounded-[14px] flex items-center justify-center font-bold text-sky-600 text-base">
                {staff.code}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-black text-slate-900">{staff.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                    isBusy
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                      : isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isBusy ? '⚡ ĐANG LÀM VIỆC' : isAvailable ? '🟢 SẴN SÀNG' : 'TẠM NGHỈ'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {staff.roleTitle} • <span className="text-sky-600">{staff.departmentName}</span> • {staff.shiftName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 scrollbar-thin">
          {/* Current Live Task Banner */}
          {staff.currentTask ? (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 font-bold uppercase tracking-wider text-[11px]">
                  <Activity className="w-4 h-4 animate-spin text-amber-600" />
                  <span>CÔNG VIỆC ĐANG XỬ LÝ THEO THỜI GIAN THỰC (LIVE TASK)</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Bắt đầu lúc: <strong className="text-slate-900">{staff.currentTask.startedAt}</strong> ({staff.currentTask.elapsedMinutes} phút trước)
                </div>
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{staff.currentTask.taskName}</span>
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-mono font-black rounded-lg text-xs">
                  {staff.currentTask.containerNo}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-slate-500 text-xs">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" /> Vị trí: <strong className="text-slate-700">{staff.currentTask.location}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-600" /> Dự kiến hoàn thành: <strong className="text-slate-700">{staff.currentTask.estimatedDurationMinutes} phút</strong>
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-slate-500">Tiến độ công việc</span>
                  <span className="text-amber-700 font-bold">{staff.currentTask.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${staff.currentTask.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Nhân viên đã hoàn thành nhiệm vụ gần nhất và đang sẵn sàng nhận lệnh mới</span>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                Chờ Phân Công
              </span>
            </div>
          )}

          {/* KPI Metrics Cards */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600" />
              <span>CHỈ SỐ NĂNG SUẤT & ĐÁNH GIÁ TRONG CA HÔM NAY</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-slate-500 text-[10px] uppercase font-bold">Đã Hoàn Thành / Giao</div>
                <div className="text-xl font-mono font-black text-slate-900 mt-1">
                  {staff.metrics.completedToday} <span className="text-xs text-slate-500 font-normal">/ {staff.metrics.assignedToday}</span>
                </div>
                <div className="text-[10px] text-emerald-600 mt-1 font-semibold">
                  Chỉ tiêu ca: {staff.metrics.targetQuota} cont
                </div>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-slate-500 text-[10px] uppercase font-bold">Hiệu Suất Đạt Được</div>
                <div className="text-xl font-mono font-black text-amber-700 mt-1">
                  {staff.metrics.efficiencyPercent}%
                </div>
                <div className="text-[10px] text-amber-600 mt-1 font-semibold">
                  ⚡ Vượt {staff.metrics.efficiencyPercent - 100}% chỉ tiêu
                </div>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-slate-500 text-[10px] uppercase font-bold">Thời Gian TB / Cont</div>
                <div className="text-xl font-mono font-black text-sky-700 mt-1">
                  {staff.metrics.avgMinutesPerContainer} <span className="text-xs text-slate-500 font-normal">phút</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Tốc độ chuẩn SLA</div>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-slate-500 text-[10px] uppercase font-bold">Chất Lượng KCS Đạt</div>
                <div className="text-xl font-mono font-black text-emerald-600 mt-1">
                  {staff.metrics.firstPassYieldPercent}%
                </div>
                <div className="text-[10px] text-emerald-600 mt-1 font-semibold">
                  ★ Đánh giá: {staff.metrics.ratingScore} / 5.0
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs Timeline */}
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>DÒNG SỰ KIỆN THỜI GIAN THỰC (LIVE ACTIVITY LOG)</span>
            </h4>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              {staff.todayActivityLogs.map((log, idx) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 pb-3 border-b border-slate-200 last:border-0 last:pb-0"
                >
                  <div className="w-14 text-[11px] font-mono font-bold text-sky-600 shrink-0 pt-0.5">
                    {log.time}
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0 mt-1.5 ring-4 ring-sky-500/20" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-amber-700 font-mono font-bold rounded text-[11px] border border-slate-200">
                        {log.containerNo}
                      </span>
                      <span className="text-[11px] text-slate-500">@ {log.location}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{log.note}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {log.status === 'COMPLETED' ? 'HOÀN THÀNH' : 'ĐANG THỰC HIỆN'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span>Liên hệ nội bộ: <strong className="text-slate-700 font-mono">{staff.phone}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
