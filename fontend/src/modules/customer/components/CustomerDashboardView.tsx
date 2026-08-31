import React from 'react';
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Box,
  FileText,
  TrendingUp,
  BarChart2,
  QrCode,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Users,
  Building2
} from 'lucide-react';
import {
  CustomerCompany,
  GateInRegistration,
  CustomerBooking,
  CustomerContainerItem,
  PortalRole
} from '../types/customerPortal';

interface CustomerDashboardViewProps {
  currentCustomer: CustomerCompany;
  gateIns: GateInRegistration[];
  bookings: CustomerBooking[];
  containers: CustomerContainerItem[];
  currentRole: PortalRole;
  onNavigateTab: (tab: string) => void;
  onOpenGateInWizard: () => void;
  onViewGateInDetail: (gateIn: GateInRegistration) => void;
  onOpenQR: (gateIn: GateInRegistration) => void;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  currentCustomer,
  gateIns,
  bookings,
  containers,
  currentRole,
  onNavigateTab,
  onOpenGateInWizard,
  onViewGateInDetail,
  onOpenQR
}) => {
  const customerGateIns = gateIns.filter((g) => g.customerId === currentCustomer.id);
  const customerBookings = bookings.filter((b) => b.customerId === currentCustomer.id);
  const customerContainers = containers.filter((c) => c.customerId === currentCustomer.id);

  // KPI calculations
  const todayGateInCount = customerGateIns.length;
  const pendingGateInCount = customerGateIns.filter(
    (g) => g.status === 'PENDING' || g.status === 'CONFIRMED'
  ).length;
  const completedGateInCount = customerGateIns.filter((g) => g.status === 'COMPLETED').length;
  const rejectedGateInCount = customerGateIns.filter((g) => g.status === 'REJECTED').length;
  const inProcessingContCount = customerContainers.filter(
    (c) => c.status === 'IN_DEPOT' || c.status === 'ON_ROAD'
  ).length;
  const activeBookingCount = customerBookings.filter((b) => b.status === 'ACTIVE').length;

  const recentGateIns = customerGateIns.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-pink-950/40 border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-pink-950 text-pink-300 border border-pink-800 text-[10px] font-mono font-bold rounded-lg">
              CUSTOMER PORTAL • {currentRole}
            </span>
            <span className="text-xs text-slate-400 font-mono">Mã KH: {currentCustomer.code}</span>
          </div>
          <h2 className="text-xl font-black text-white">{currentCustomer.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bảng điều khiển hoạt động khai thác Gate-In Online, điều xe và theo dõi vòng đời Container
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={onOpenGateInWizard}
            className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng Ký Gate-In Ngay</span>
          </button>

          <button
            onClick={() => onNavigateTab('gatein_list')}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-pink-400" />
            <span>DS Gate-In</span>
          </button>
        </div>
      </div>

      {/* 6 Key Metrics (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* KPI 1 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Gate-In Hôm Nay</span>
            <Truck className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{todayGateInCount}</div>
          <div className="text-[10px] text-pink-400 font-medium">Lệnh đăng ký</div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Gate-In Đang Chờ</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{pendingGateInCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">Chờ duyệt / Đến cổng</div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Đã Hoàn Thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{completedGateInCount}</div>
          <div className="text-[10px] text-emerald-400 font-medium">Đã hạ bãi an toàn</div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Bị Từ Chối</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{rejectedGateInCount}</div>
          <div className="text-[10px] text-rose-400 font-medium">Hỏng kết cấu / Sai lệnh</div>
        </div>

        {/* KPI 5 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Cont Đang Xử Lý</span>
            <Box className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">{inProcessingContCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">Lưu bãi / Đang chạy</div>
        </div>

        {/* KPI 6 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Booking Hoạt Động</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 font-mono">{activeBookingCount}</div>
          <div className="text-[10px] text-indigo-400 font-medium">Lệnh cấp/hạ vỏ</div>
        </div>

      </div>

      {/* Visual Charts & Status Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Chart 1: Gate-In theo ngày */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span>Biểu Đồ Khối Lượng Gate-In Theo Ngày (7 Ngày Gần Nhất)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Đơn vị: Lượt xe</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { day: '10/08', count: 12, max: 25 },
              { day: '11/08', count: 18, max: 25 },
              { day: '12/08', count: 22, max: 25 },
              { day: '13/08', count: 15, max: 25 },
              { day: '14/08', count: 24, max: 25 },
              { day: '15/08', count: 19, max: 25 },
              { day: '16/08', count: 21, max: 25, isToday: true }
            ].map((bar) => {
              const heightPercent = Math.round((bar.count / bar.max) * 100);
              return (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-slate-300">{bar.count}</span>
                  <div className="w-full max-w-[36px] bg-slate-950 rounded-t-lg h-32 flex items-end p-1 overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        bar.isToday
                          ? 'bg-gradient-to-t from-pink-600 to-rose-400 shadow-lg shadow-pink-600/30'
                          : 'bg-gradient-to-t from-blue-700 to-indigo-500'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-mono ${bar.isToday ? 'text-pink-400 font-bold' : 'text-slate-400'}`}>
                    {bar.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Gate-In theo trạng thái */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>Phân Bổ Trạng Thái Gate-In Trực Tuyến</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Hôm nay</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Hoàn thành hạ bãi (Completed)', count: 14, percent: 55, color: 'bg-emerald-500' },
              { label: 'Đang giám định & vào cổng (Inspection/Gate-In)', count: 5, percent: 20, color: 'bg-cyan-500' },
              { label: 'Đã duyệt QR & Chờ đến (Confirmed)', count: 4, percent: 16, color: 'bg-pink-500' },
              { label: 'Bị từ chối tiếp nhận (Rejected)', count: 2, percent: 9, color: 'bg-rose-500' }
            ].map((st) => (
              <div key={st.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{st.label}</span>
                  <span className="font-mono font-bold text-white">
                    {st.count} lượt ({st.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div style={{ width: `${st.percent}%` }} className={`h-full ${st.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Gate-In Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <span>LỆNH ĐĂNG KÝ GATE-IN GẦN ĐÂY</span>
            </h3>
            <p className="text-xs text-slate-400">Các phương tiện vừa đăng ký hoặc đang thao tác tại cổng</p>
          </div>

          <button
            onClick={() => onNavigateTab('gatein_list')}
            className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Mã Gate-In</th>
                <th className="px-4 py-3">Container</th>
                <th className="px-4 py-3">Tài Xế</th>
                <th className="px-4 py-3">Phương Tiện</th>
                <th className="px-4 py-3">Thời Gian Hẹn</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {recentGateIns.map((g) => (
                <tr key={g.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono font-bold text-pink-400">{g.gateInNo}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-white">{g.containerNo}</span>
                    <span className="text-[10px] text-slate-400 block">{g.size}</span>
                  </td>
                  <td className="px-4 py-3 text-white font-bold">{g.driverName}</td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-300">{g.vehiclePlate}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{g.appointmentTime} ({g.appointmentDate})</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-950 text-pink-300 border border-slate-800 rounded text-[10px] font-mono font-bold">
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenQR(g)}
                        title="Xem mã QR"
                        className="p-1.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 rounded-lg transition cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onViewGateInDetail(g)}
                        title="Xem chi tiết"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
