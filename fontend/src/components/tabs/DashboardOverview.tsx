import React from 'react';
import { useDepot } from '../../context/DepotContext';
import { RoleType } from '../../types/depot';
import {
  Container,
  DollarSign,
  Clock,
  Wrench,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  Activity,
  Boxes,
  ArrowRight
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab }) => {
  const { jobs, setActiveRole } = useDepot();

  const totalJobs = jobs.length;
  const activeInYard = jobs.filter((j) => j.status !== 'GATE_OUT').length;
  const totalCapacity = 120; // 120 slots in depot
  const occupancyPercent = Math.round((activeInYard / totalCapacity) * 100);

  // Revenue calculations
  const serviceRevenue = jobs.reduce((sum, j) => {
    return sum + (j.operation?.totalAmount || 0);
  }, 0);

  const repairRevenue = jobs.reduce((sum, j) => {
    if (j.estimate?.approvalStatus === 'APPROVED') {
      return sum + j.estimate.grandTotal;
    }
    return sum;
  }, 0);

  const totalRevenue = serviceRevenue + repairRevenue;

  // Department Queues
  const surveyQueue = jobs.filter((j) => j.status === 'GATE_IN' || j.status === 'SURVEYING');
  const operationQueue = jobs.filter((j) => j.status === 'OPERATION_PENDING');
  const paymentQueue = jobs.filter((j) => j.status === 'PAYMENT_PENDING');
  const estimateApprovalQueue = jobs.filter((j) => j.status === 'ESTIMATE_PENDING_APPROVAL');
  const repairQueue = jobs.filter((j) => j.status === 'REPAIRING' || j.status === 'ESTIMATE_APPROVED');
  const qcQueue = jobs.filter((j) => j.status === 'QC_PENDING');

  // Status breakdown
  const statusCounts = {
    gateIn: jobs.filter((j) => j.status === 'GATE_IN' || j.status === 'SURVEYING').length,
    payment: jobs.filter((j) => j.status === 'OPERATION_PENDING' || j.status === 'PAYMENT_PENDING').length,
    estimate: jobs.filter((j) => j.status === 'ESTIMATE_PENDING_APPROVAL').length,
    repair: jobs.filter((j) => j.status === 'REPAIRING' || j.status === 'ESTIMATE_APPROVED').length,
    qc: jobs.filter((j) => j.status === 'QC_PENDING').length,
    yard: jobs.filter((j) => j.status === 'YARD_STORED' || j.status === 'QC_PASSED').length,
    gateOut: jobs.filter((j) => j.status === 'GATE_OUT').length
  };

  // Recent activity logs
  const allLogs = jobs
    .flatMap((j) => (j.auditLogs || []).map((log) => ({ ...log, containerNo: j.containerNo })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const handleQuickJump = (tab: string, role: RoleType) => {
    setActiveRole(role);
    onNavigateTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Jobs & Yard Occupancy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tồn Bãi / Sức Chứa</span>
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{activeInYard}</span>
            <span className="text-xs text-slate-400">/ {totalCapacity} Container</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Tỷ lệ lấp đầy bãi</span>
              <span className="font-semibold text-blue-400">{occupancyPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh Thu Tổng (VNĐ)</span>
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalRevenue.toLocaleString('vi-VN')}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Dịch vụ: <strong className="text-emerald-400">{serviceRevenue.toLocaleString('vi-VN')}</strong></span>
            <span>Sửa chữa: <strong className="text-indigo-400">{repairRevenue.toLocaleString('vi-VN')}</strong></span>
          </div>
        </div>

        {/* Metric 3: Pending Approvals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chờ Hãng Tàu Duyệt</span>
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{estimateApprovalQueue.length}</span>
            <span className="text-xs text-slate-400">Báo giá</span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Đang chờ hãng tàu (MSC, Maersk, EMC...) phản hồi chấp thuận sửa chữa
          </p>
        </div>

        {/* Metric 4: Repair & QC Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hàng Chờ Sửa Chữa & QC</span>
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-black text-white font-mono">{repairQueue.length}</span>
              <span className="text-xs text-slate-400 ml-1">Sửa</span>
            </div>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-2xl font-black text-teal-400 font-mono">{qcQueue.length}</span>
              <span className="text-xs text-slate-400 ml-1">Chờ QC</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Đang được tổ thợ thi công và tiến hành kiểm tra nghiệm thu
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Cards per Department */}
      <div>
        <h2 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>Tiến Độ Theo Phòng Ban & Chuyển Nhanh Tác Vụ</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card 1: Giám Định */}
          <div
            onClick={() => handleQuickJump('survey', 'SURVEYOR')}
            className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-xl transition cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                1. Giám Định (Survey)
              </span>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {surveyQueue.length} Hàng chờ
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Ghi nhận hư hỏng, Damage Code, chụp ảnh góc, đánh giá chất lượng vỏ container.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Mở bộ phận Giám định</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Khai Thác & Thanh Toán */}
          <div
            onClick={() => handleQuickJump('operation', 'OPERATOR')}
            className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 rounded-xl transition cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
                2. Khai Thác & Thanh Toán
              </span>
              <span className="text-xs font-bold text-blue-400 font-mono">
                {operationQueue.length + paymentQueue.length} Hàng chờ
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Lập Phiếu dịch vụ Depot, thu tiền mặt / Quét mã VietQR kết nối API ngân hàng.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Mở Khai thác / Thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Báo Giá & Hãng Tàu */}
          <div
            onClick={() => handleQuickJump('estimate', 'ESTIMATOR')}
            className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                3. Báo Giá & Hãng Tàu Duyệt
              </span>
              <span className="text-xs font-bold text-indigo-400 font-mono">
                {estimateApprovalQueue.length} Chờ duyệt
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Tính giá nhân công & vật tư, trình Hãng tàu (Maersk, MSC, EMC...) phê duyệt.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Mở Báo giá / Phê duyệt</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Sửa Chữa */}
          <div
            onClick={() => handleQuickJump('repair', 'REPAIR_TECH')}
            className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-orange-500/50 rounded-xl transition cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-md bg-orange-500/20 text-orange-300 font-bold text-xs border border-orange-500/30">
                4. Sửa Chữa & Vật Tư Kho
              </span>
              <span className="text-xs font-bold text-orange-400 font-mono">
                {repairQueue.length} Đang làm
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Xuất vật tư (thép, sơn, que hàn), phân công tổ thợ, cập nhật ảnh trước/sau sửa.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>Mở Xưởng Sửa Chữa</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 5: Kiểm Tra QC */}
          <div
            onClick={() => handleQuickJump('repair', 'QC_INSPECTOR')}
            className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-teal-500/50 rounded-xl transition cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-bold text-xs border border-teal-500/30">
                5. Kiểm Tra Chất Lượng (QC)
              </span>
              <span className="text-xs font-bold text-teal-400 font-mono">
                {qcQueue.length} Chờ QC
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Kiểm tra độ kín nước, ánh sáng, sơn tĩnh điện, xác nhận ĐẠT / KHÔNG ĐẠT.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>Mở Bộ Phận QC</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 6: Bãi Depot & Xe Nâng */}
          <div
            onClick={() => handleQuickJump('yard', 'FORKLIFT_DRIVER')}
            className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/50 rounded-xl transition cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
                6. Sơ Đồ Bãi & Xe Nâng
              </span>
              <span className="text-xs font-bold text-rose-400 font-mono">
                2D Yard Map
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Xem vị trí 2D Block-Bay-Row-Tier, phát lệnh nâng hạ container cho tài xế.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>Mở Sơ Đồ Bãi Depot</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Progress Bar & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Phân Nhóm Trạng Thái Vòng Đời</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Giám định (Gate In / Surveying)</span>
                <span className="font-bold text-amber-400">{statusCounts.gateIn}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(statusCounts.gateIn / (totalJobs || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Thanh toán dịch vụ Depot</span>
                <span className="font-bold text-blue-400">{statusCounts.payment}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(statusCounts.payment / (totalJobs || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Chờ Báo giá & Hãng tàu duyệt</span>
                <span className="font-bold text-indigo-400">{statusCounts.estimate}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(statusCounts.estimate / (totalJobs || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Đang Sửa chữa</span>
                <span className="font-bold text-orange-400">{statusCounts.repair}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(statusCounts.repair / (totalJobs || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Kiểm tra QC & Đang Lưu Bãi</span>
                <span className="font-bold text-emerald-400">{statusCounts.qc + statusCounts.yard}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${((statusCounts.qc + statusCounts.yard) / (totalJobs || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Activity Stream */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Nhật Ký Thao Tác Hệ Thống Giờ Thực (Audit Trail)</span>
            </h3>
            <span className="text-xs text-slate-400">Cập nhật tự động</span>
          </div>

          <div className="space-y-3">
            {allLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs flex items-start gap-3 hover:bg-slate-800 transition"
              >
                <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 mt-0.5 border border-blue-800/40 font-mono text-[10px]">
                  {log.containerNo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-bold text-slate-200 truncate">
                      {log.userName} <span className="text-slate-400 font-normal">({log.role})</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
