import React, { useEffect, useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { reportApi, yardApi } from '../../../api';
import { formatVND } from '../../../utils/format';
import { StatusBadge } from '../../../components/common/StatusBadge/StatusBadge';
import { GateInSurveyWorkflowDiagram } from '../../../components/common/WorkflowDiagram/GateInSurveyWorkflowDiagram';
import {
  Container as ContainerIcon,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  CreditCard,
  Truck,
  TrendingUp,
  DollarSign,
  Grid3X3,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DashboardPageProps {
  containers: ContainerRecord[];
  onNavigateTab: (tabId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  containers,
  onNavigateTab
}) => {
  const [backendKpi, setBackendKpi] = useState<any>(null);
  const [yardSlots, setYardSlots] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([reportApi.getKPIStats(), yardApi.getPositions()])
      .then(([kpi, yard]: any[]) => {
        if (kpi?.statusCode === 200) setBackendKpi(kpi.data);
        if (yard?.statusCode === 200 && Array.isArray(yard.data)) setYardSlots(yard.data);
      })
      .catch((error) => console.warn('Không thể tải KPI/Yard từ Backend SQL:', error));
  }, []);

  // Metric Calculations
  const totalInDepot = backendKpi?.activeJobs ?? containers.filter((c) => c.status !== 'GATE_OUT').length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = (dateStr?: string) => Boolean(dateStr) && dateStr!.slice(0, 10) === todayStr;
  const gateInToday = containers.filter((c) => isToday(c.gateInDate)).length;
  const gateOutToday = containers.filter((c) => isToday(c.gateOutDate)).length;

  const countAV = containers.filter((c) => c.condition === 'AV' && c.status !== 'GATE_OUT').length;
  const countCL = containers.filter((c) => c.condition === 'CL' && c.status !== 'GATE_OUT').length;
  const countDM = containers.filter((c) => c.condition === 'DM' && c.status !== 'GATE_OUT').length;

  const countRepairing = containers.filter((c) => c.status === 'REPAIRING').length;
  // Backend thật (CompleteRepairAsync) đặt "QC_PENDING" khi sửa xong chờ QC, không có "WAITING_QC" —
  // trước đây App.tsx tự bịa giá trị này nên KPI này từng đúng tạm trong phiên, sai lại sau F5.
  const countWaitingQC = containers.filter((c) => c.status === 'QC_PENDING').length;
  const countWaitingPayment = containers.filter((c) => c.status === 'WAITING_PAYMENT').length;
  const countWaitingForklift = containers.filter((c) => c.status === 'WAITING_FORKLIFT').length;

  const totalRevenue = backendKpi?.totalRevenueVnd ?? 0;
  const totalCarrierDebt = containers.reduce(
    (sum, c) => sum + (c.estimateDetails?.totalCost || 0),
    0
  );

  const getBlockOccupancy = (blockCode: string) => {
    const slotsInBlock = yardSlots.filter((slot) => slot.blockCode === blockCode);
    const occupied = slotsInBlock.filter((slot) => slot.isOccupied).length;
    const percent = slotsInBlock.length ? Math.min(100, (occupied / slotsInBlock.length) * 100) : 0;
    return { occupied, total: slotsInBlock.length, percent };
  };
  // Mọi block có trong vị trí bãi thật — trước đây cố định 3 block BLOCK_A/B/Q.
  const blockCodes = Array.from(new Set(yardSlots.map((slot) => slot.blockCode))).filter(Boolean).sort();

  return (
    <div className="space-y-6">
      {/* Top Banner — trước đây nền tối (slate-900/indigo-950), đổi sang nền sáng theo yêu cầu người
          dùng ("giao diện Dashboard ERP màu sáng hơn, màu này tối"). */}
      <div className="p-6 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200 text-xs font-bold font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>SOLUTION DEPOT WORKFLOW ENGINE</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Bảng Điều Khiển Trung Tâm Vận Hành Depot
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Giám sát thời gian thực toàn bộ 14 bước vòng đời Container: Giám định IICL, Gạch nợ VietQR, Điều bãi Xe nâng 2D, Báo giá EMR & Nghiệm thu QC.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigateTab('gate')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Check-in Gate-In</span>
          </button>
          <button
            onClick={() => onNavigateTab('yard_map')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Grid3X3 className="w-4 h-4 text-teal-600" />
            <span>Sơ Đồ Bãi 2D</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Tồn Bãi Hiện Tại</span>
            <ContainerIcon className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalInDepot}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Cont trong bãi</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Gate-In Hôm Nay</span>
            <LogIn className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{gateInToday}</p>
          <span className="text-[10px] text-slate-500">Xe hạ cont</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Gate-Out Hôm Nay</span>
            <LogOut className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{gateOutToday}</p>
          <span className="text-[10px] text-slate-500">Xe nhận vỏ</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Container AV</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{countAV}</p>
          <span className="text-[10px] text-emerald-600">Sẵn sàng cấp trả</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Container CL</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{countCL}</p>
          <span className="text-[10px] text-slate-500">Cần vệ sinh</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Container DM</span>
            <Wrench className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{countDM}</p>
          <span className="text-[10px] text-slate-500">Cần sửa chữa EMR</span>
        </div>
      </div>

      {/* Interactive Operational Flowchart Diagram */}
      <GateInSurveyWorkflowDiagram containers={containers} onNavigateTab={onNavigateTab} />

      {/* Financial & Operational Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu & Cước */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Thống Kê Tài Chính</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              REAL-TIME
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Doanh Thu Thu Ngân (VietQR)</span>
                <p className="text-lg font-black text-emerald-600">{formatVND(totalRevenue)}</p>
              </div>
              <CreditCard className="w-6 h-6 text-emerald-500" />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Công Nợ Báo Giá Hãng Tàu</span>
                <p className="text-lg font-black text-blue-600">{formatVND(totalCarrierDebt)}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Trạng Thái Chờ Trong Quy Trình */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              <span>Tiến Độ Tự Động Hóa Workflow</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => onNavigateTab('payment')}
              className="p-3 bg-amber-50 border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100 transition"
            >
              <span className="text-[10px] text-amber-700 font-bold block">Chờ Thanh Toán</span>
              <p className="text-xl font-black text-amber-600 mt-1">{countWaitingPayment}</p>
            </div>

            <div
              onClick={() => onNavigateTab('forklift')}
              className="p-3 bg-sky-50 border border-sky-200 rounded-2xl cursor-pointer hover:bg-sky-100 transition"
            >
              <span className="text-[10px] text-sky-700 font-bold block">Chờ Xe Nâng</span>
              <p className="text-xl font-black text-sky-600 mt-1">{countWaitingForklift}</p>
            </div>

            <div
              onClick={() => onNavigateTab('repair')}
              className="p-3 bg-rose-50 border border-rose-200 rounded-2xl cursor-pointer hover:bg-rose-100 transition"
            >
              <span className="text-[10px] text-rose-700 font-bold block">Đang Sửa Chữa</span>
              <p className="text-xl font-black text-rose-600 mt-1">{countRepairing}</p>
            </div>

            <div
              onClick={() => onNavigateTab('qc')}
              className="p-3 bg-purple-50 border border-purple-200 rounded-2xl cursor-pointer hover:bg-purple-100 transition"
            >
              <span className="text-[10px] text-purple-700 font-bold block">Chờ QC Kiểm Tra</span>
              <p className="text-xl font-black text-purple-600 mt-1">{countWaitingQC}</p>
            </div>
          </div>
        </div>

        {/* Tải Bãi Depot (Yard Occupancy) */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-teal-600" />
              <span>Sức Chứa Bãi Depot</span>
            </h3>
                <span className="text-[10px] text-slate-500 font-mono">{yardSlots.length} vị trí</span>
          </div>

          <div className="space-y-3">
            {blockCodes.length === 0 && <div className="py-4 text-center text-xs text-slate-500">Chưa có dữ liệu bãi</div>}
            {blockCodes.map((code) => {
              const occ = getBlockOccupancy(code);
              return (
                <div key={code}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{code.replace('BLOCK_', 'Block ')}</span>
                    <span className="text-slate-500">{occ.occupied}/{occ.total} vị trí</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${occ.percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Danh Sách Container Vận Hành Gần Đây */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ContainerIcon className="w-4 h-4 text-blue-500" />
            <span>Danh Sách Container Vận Hành Mới Nhất</span>
          </h3>
          <button
            onClick={() => onNavigateTab('container')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả ({containers.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Số Container</th>
                <th className="px-4 py-3">ISO / Kích Thước</th>
                <th className="px-4 py-3">Hãng Tàu</th>
                <th className="px-4 py-3">Phân Loại</th>
                <th className="px-4 py-3">Trạng Thái Workflow</th>
                <th className="px-4 py-3">Vị Trí Bãi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {containers.slice(0, 5).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onNavigateTab('container')}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.containerNo}</td>
                  <td className="px-4 py-3">{c.size} ({c.isoCode})</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{c.shippingLine}</td>
                  <td className="px-4 py-3">
                    {c.condition ? (
                      <StatusBadge status={c.condition} size="sm" />
                    ) : (
                      <span className="text-slate-500 text-[11px] font-semibold">Chưa giám định</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {c.yardLocation
                      ? `Blk ${c.yardLocation.block} / Bay ${c.yardLocation.bay} / Row ${c.yardLocation.row}`
                      : 'Cổng Gate-In'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
