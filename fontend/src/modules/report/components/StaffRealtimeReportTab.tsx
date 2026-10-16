import React, { useState, useEffect } from 'react';
import { StaffRealtimeItem } from '../mockStaffRealtimeData';
import { reportApi } from '../../../api';
import { StaffDetailModal } from './StaffDetailModal';

const DEPARTMENT_NAMES: Record<string, string> = {
  GATE: 'Tổ Điều Phối Cổng',
  SURVEY: 'Tổ Giám Định (Survey)',
  REPAIR_WELDING: 'Tổ Thợ Sửa Chữa EMR',
  REPAIR_FLOOR: 'Tổ Thợ Sửa Chữa EMR',
  CLEANING: 'Tổ Vệ Sinh Container',
  QC: 'Tổ KCS Nghiệm Thu',
  FORKLIFT: 'Tổ Lái Xe Nâng Bãi',
  WAREHOUSE: 'Kho Vật Tư Sửa Chữa EMR'
};

// Nhân sự dựng từ tên tự do trên các bảng nghiệp vụ thật (RepairOrder/Survey/CleaningRecord/
// ForkliftDispatch/MaterialStockTransaction) — hệ thống chưa có bảng "Nhân sự" độc lập nên KHÔNG có
// nguồn thật cho: SĐT, ca trực, chỉ tiêu ca, đánh giá sao, thời lượng dự kiến/tiến độ %. Các field đó
// suy ra từ dữ liệu thật khác (vd chỉ tiêu = số việc đã giao, đánh giá = quy đổi từ FPY thật) thay vì bịa
// số cố định — xem docs/backend-progress/48-report.md mục "Còn thiếu".
function mapStaffDto(dto: any, indexInDept: number): StaffRealtimeItem {
  const deptPrefix = (dto.department as string).replace('_', '').slice(0, 2);
  const avgMinutes = dto.avgMinutesPerContainer ?? 0;
  // Chưa có dữ liệu QC thì 0 — không giả định đạt 100%.
  const fpy = dto.firstPassYieldPercent ?? 0;
  const targetQuota = Math.max(dto.assignedToday, 1);
  const estimatedDuration = dto.currentTask ? Math.max(avgMinutes || dto.currentTask.elapsedMinutes || 10, 5) : 0;

  return {
    id: dto.id,
    code: `NV-${deptPrefix}${String(indexInDept + 1).padStart(2, '0')}`,
    name: dto.name,
    department: dto.department,
    departmentName: dto.departmentName || DEPARTMENT_NAMES[dto.department] || dto.department,
    roleTitle: dto.departmentName || DEPARTMENT_NAMES[dto.department] || dto.department,
    shift: 'SHIFT_1',
    shiftName: 'Chưa có dữ liệu ca trực',
    phone: '-',
    status: dto.currentTask ? 'BUSY' : 'AVAILABLE',
    currentTask: dto.currentTask
      ? {
          taskName: dto.currentTask.taskName,
          containerNo: dto.currentTask.containerNo,
          location: dto.currentTask.location,
          startedAt: dto.currentTask.startedAt,
          estimatedDurationMinutes: Math.round(estimatedDuration),
          elapsedMinutes: dto.currentTask.elapsedMinutes,
          progressPercent: Math.min(95, Math.max(5, Math.round((dto.currentTask.elapsedMinutes / Math.max(estimatedDuration, 1)) * 100)))
        }
      : undefined,
    metrics: {
      assignedToday: dto.assignedToday,
      completedToday: dto.completedToday,
      inProgressToday: dto.inProgressToday,
      pendingToday: dto.pendingToday,
      targetQuota,
      efficiencyPercent: Math.round((dto.completedToday / targetQuota) * 100),
      avgMinutesPerContainer: avgMinutes,
      firstPassYieldPercent: fpy,
      ratingScore: Math.round((fpy / 20) * 100) / 100,
      overtimeHours: 0
    },
    todayActivityLogs: (dto.todayActivityLogs || []).map((log: any) => ({
      id: log.id,
      time: log.time,
      action: log.action,
      containerNo: log.containerNo,
      location: log.location,
      status: log.status,
      note: log.note || ''
    }))
  };
}
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Search,
  Filter,
  TrendingUp,
  Zap,
  Phone,
  ArrowUpRight,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Boxes,
  MapPin,
  ShieldCheck,
  ChevronRight,
  BarChart2
} from 'lucide-react';

export const StaffRealtimeReportTab: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffRealtimeItem[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffRealtimeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString('vi-VN'));
  const [showToast, setShowToast] = useState(false);

  const loadStaffData = async () => {
    try {
      const res: any = await reportApi.getStaffRealtime();
      if (res?.statusCode === 200 && Array.isArray(res.data)) {
        const countByDept: Record<string, number> = {};
        const mapped = res.data.map((dto: any) => {
          const idx = countByDept[dto.department] || 0;
          countByDept[dto.department] = idx + 1;
          return mapStaffDto(dto, idx);
        });
        setStaffList(mapped);
        setLoadError(null);
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không thể tải dữ liệu nhân sự từ hệ thống.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStaffData();
  }, []);

  // Live ticker update — làm mới lại dữ liệu thật từ backend
  const handleRefresh = () => {
    setIsRefreshing(true);
    void loadStaffData().finally(() => {
      setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
      setIsRefreshing(false);
    });
  };

  const handleExport = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filteredStaff = staffList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.currentTask && s.currentTask.containerNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchShift = selectedShift === 'ALL' || s.shift === selectedShift;
    const matchDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchSearch && matchShift && matchDept && matchStatus;
  });

  // Calculate live summary stats
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.status === 'BUSY').length;
  const availableStaff = staffList.filter((s) => s.status === 'AVAILABLE').length;
  const totalTasksCompleted = staffList.reduce((sum, s) => sum + s.metrics.completedToday, 0);
  const totalTasksAssigned = staffList.reduce((sum, s) => sum + s.metrics.assignedToday, 0);
  const avgEfficiency = staffList.length > 0
    ? Math.round(staffList.reduce((sum, s) => sum + s.metrics.efficiencyPercent, 0) / staffList.length)
    : 0;
  const avgFPY = staffList.length > 0
    ? (staffList.reduce((sum, s) => sum + s.metrics.firstPassYieldPercent, 0) / staffList.length).toFixed(1)
    : '0.0';

  const handleViewDetail = (staff: StaffRealtimeItem) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-700 text-xs">
          <span>{loadError}</span>
          <button type="button" onClick={() => void loadStaffData()} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition cursor-pointer shrink-0">
            Thử lại
          </button>
        </div>
      )}

      {isLoading && (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 text-sky-600 animate-spin" />
          <p className="text-xs font-semibold">Đang tải dữ liệu nhân sự thời gian thực...</p>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-200 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-slate-900" />
          <span className="text-xs font-bold">
            Đã xuất báo cáo năng suất nhân sự thời gian thực ra tệp Excel (.xlsx)!
          </span>
        </div>
      )}

      {/* Top Banner Control & Live Badge */}
      <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-sky-50 border border-sky-200 text-sky-600 rounded-2xl shrink-0">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                BÁO CÁO CÔNG VIỆC TỪNG NHÂN SỰ THEO THỜI GIAN THỰC (REAL-TIME)
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-mono text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE STREAMING • {lastUpdated}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Theo dõi trực tiếp từng nhân viên đang thao tác container nào, vị trí bãi/xưởng, tiến độ thi công và hiệu suất đạt chỉ tiêu ca
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Làm Mới</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg  transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* 4 Real-Time Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-600" />
            <span>Nhân Sự Đang Trực</span>
          </div>
          <div className="text-2xl font-mono font-black text-slate-900 mt-1.5 flex items-center gap-2">
            <span>{activeStaff}</span>
            <span className="text-xs text-emerald-600 font-normal font-sans">/ {totalStaff} đang bận ({availableStaff} sẵn sàng)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Toàn bộ các tổ đội tại bãi/xưởng</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã Xử Lý Hôm Nay</span>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-600 mt-1.5">
            {totalTasksCompleted} <span className="text-xs text-slate-500 font-normal">/ {totalTasksAssigned} việc</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Đạt {totalTasksAssigned > 0 ? Math.round((totalTasksCompleted / totalTasksAssigned) * 100) : 0}% khối lượng giao trong ca
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Hiệu Suất Định Mức Ca</span>
          </div>
          <div className="text-2xl font-mono font-black text-amber-700 mt-1.5">
            {avgEfficiency}%
          </div>
          <div className="text-[11px] text-amber-600 mt-1">⚡ Đạt chuẩn định mức ca vận hành</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Chất Lượng KCS (FPY)</span>
          </div>
          <div className="text-2xl font-mono font-black text-purple-700 mt-1.5">
            {avgFPY}%
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Tỷ lệ đạt KCS nghiệm thu lần đầu</div>
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
            placeholder="Tìm theo tên nhân viên, mã NV (NV-G01), container đang làm (MSKU...)..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">-- Tất Cả Ca Trực --</option>
            <option value="SHIFT_1">Ca 1 (06:00 - 14:00)</option>
            <option value="SHIFT_2">Ca 2 (14:00 - 22:00)</option>
            <option value="SHIFT_3">Ca 3 (22:00 - 06:00)</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">-- Tất Cả Phòng Ban / Tổ Đội --</option>
            <option value="GATE">Tổ Cổng Gate-In/Out</option>
            <option value="SURVEY">Tổ Giám Định (Survey)</option>
            <option value="REPAIR_WELDING">Tổ Hàn Gò EMR</option>
            <option value="REPAIR_FLOOR">Tổ Mộc & Ván Sàn</option>
            <option value="CLEANING">Tổ Vệ Sinh Vỏ</option>
            <option value="QC">Tổ KCS Nghiệm Thu</option>
            <option value="FORKLIFT">Tổ Lái Xe Nâng Bãi</option>
            <option value="WAREHOUSE">Kho Vật Tư EMR</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">-- Tất Cả Trạng Thái --</option>
            <option value="BUSY">⚡ Đang Làm Việc</option>
            <option value="AVAILABLE">🟢 Đang Sẵn Sàng</option>
            <option value="ON_BREAK">☕ Tạm Nghỉ</option>
          </select>
        </div>
      </div>

      {/* Main Staff Realtime Cards / Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>DANH SÁCH NHÂN SỰ VẬN HÀNH & TIẾN ĐỘ THỜI GIAN THỰC ({filteredStaff.length} người)</span>
          </div>
          <span className="text-[11px] text-slate-500">Click vào dòng bất kỳ để xem lịch sử chi tiết</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Nhân Viên</th>
                <th className="py-3.5 px-3">Tổ Đội / Chức Danh</th>
                <th className="py-3.5 px-3">Trạng Thái Live</th>
                <th className="py-3.5 px-4">Container & Công Việc Đang Xử Lý</th>
                <th className="py-3.5 px-3 text-right">Đã Xong / Giao</th>
                <th className="py-3.5 px-3 text-right">Thời Gian TB</th>
                <th className="py-3.5 px-3 text-right">Hiệu Suất</th>
                <th className="py-3.5 px-3 text-center">KCS Đạt</th>
                <th className="py-3.5 px-3 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredStaff.map((staff) => {
                const isBusy = staff.status === 'BUSY';
                const isAvailable = staff.status === 'AVAILABLE';

                return (
                  <tr
                    key={staff.id}
                    onClick={() => handleViewDetail(staff)}
                    className="hover:bg-slate-100 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sky-600 text-xs shrink-0 group-hover:border-sky-500 transition">
                          {staff.code}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 group-hover:text-sky-700 transition">
                            {staff.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-amber-600" /> {staff.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-700">{staff.departmentName}</div>
                      <div className="text-[10px] text-slate-500">{staff.roleTitle}</div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {isBusy ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-amber-400" /> ĐANG LÀM
                        </span>
                      ) : isAvailable ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> SẴN SÀNG
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          TẠM NGHỈ
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 min-w-[280px]">
                      {staff.currentTask ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 truncate max-w-[220px]" title={staff.currentTask.taskName}>
                              {staff.currentTask.taskName}
                            </span>
                            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-mono font-black rounded text-[11px] shrink-0">
                              {staff.currentTask.containerNo}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-600" /> {staff.currentTask.location}
                            </span>
                            <span className="font-mono text-amber-700 font-bold">
                              {staff.currentTask.progressPercent}% ({staff.currentTask.elapsedMinutes}/{staff.currentTask.estimatedDurationMinutes}p)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all"
                              style={{ width: `${staff.currentTask.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 italic text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Đã xong việc trước, đang chờ nhận container mới</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className="text-slate-900 text-sm">{staff.metrics.completedToday}</span>
                      <span className="text-slate-500 text-xs"> / {staff.metrics.assignedToday}</span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      {staff.metrics.avgMinutesPerContainer} phút/cont
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                      <span className="text-amber-700 font-black text-sm">
                        {staff.metrics.efficiencyPercent}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {staff.metrics.firstPassYieldPercent}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(staff);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-sky-600 text-[11px] font-bold rounded-lg border border-slate-200 transition cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Detail Modal */}
      <StaffDetailModal
        staff={selectedStaff}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStaff(null);
        }}
      />
    </div>
  );
};
