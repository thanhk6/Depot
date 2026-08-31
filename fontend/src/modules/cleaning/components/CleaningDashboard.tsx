import React from 'react';
import {
  Droplets,
  Clock,
  Sparkles,
  CheckCircle2,
  Gauge,
  Flame,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building,
  Layers,
  Container as ContainerIcon,
  Check
} from 'lucide-react';
import { CleaningExecutionRecord } from '../types';

interface CleaningDashboardProps {
  orders: CleaningExecutionRecord[];
  onSelectTab: (tabId: string) => void;
  onSelectOrder: (order: CleaningExecutionRecord) => void;
}

export const CleaningDashboard: React.FC<CleaningDashboardProps> = ({
  orders,
  onSelectTab,
  onSelectOrder
}) => {
  const pendingOrders = orders.filter((o) => o.status === 'PENDING_CLEANING');
  const inProgressOrders = orders.filter((o) => o.status === 'IN_CLEANING');
  const cleanedOrders = orders.filter((o) => o.status === 'CLEANED');
  const handoverOrders = orders.filter((o) => o.status === 'HANDOVER_TO_OPERATION');

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalCost, 0);

  // Stations Status
  const stations = [
    {
      id: 'BAY-01',
      name: 'Cleaning Bay 01',
      type: 'Trạm Xịt Rửa Áp Lực Cao (200 Bar) & Container Lạnh (Reefer)',
      status: 'BUSY',
      currentCont: orders.find((o) => o.cleaningBay.includes('01') && o.status === 'IN_CLEANING')?.containerNo || 'CMAU7712390',
      operator: 'Nguyễn Văn Hùng',
      pressure: '200 Bar',
      temp: '60°C'
    },
    {
      id: 'BAY-02',
      name: 'Cleaning Bay 02',
      type: 'Trạm Quét Dọn, Rửa Nước Sạch & Tẩy Cặn Vỏ Khô (Dry)',
      status: 'AVAILABLE',
      currentCont: null,
      operator: 'Phạm Đức Thắng',
      pressure: '180 Bar',
      temp: '28°C'
    },
    {
      id: 'BAY-03',
      name: 'Cleaning Bay 03',
      type: 'Trạm Sấy Khô Sàn Gỗ & Cạo Bóc Nhãn Nguy Hiểm (IMO / Hazmat)',
      status: 'BUSY',
      currentCont: orders.find((o) => o.cleaningBay.includes('03'))?.containerNo || 'MSKU4401928',
      operator: 'Lê Văn Tùng',
      pressure: '220 Bar',
      temp: '75°C'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Hero Summary Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-tr from-cyan-500/30 to-blue-600/20 border border-cyan-500/40 text-cyan-400 rounded-2xl shadow-inner">
            <Droplets className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Phân Hệ Vệ Sinh Container (Cleaning Bay Management)
              </h2>
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold rounded-full border border-cyan-500/30">
                Độc Lập &bull; Vệ Sinh &rarr; Khai Thác
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Quy trình thi công vệ sinh vỏ theo đúng 6 nhóm danh mục giám định (Survey CL &amp; e-EIR) &bull; Nghiệm thu cấp Grade A / Food Grade chuyển sang AV sẵn sàng khai thác.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectTab('execution')}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mở Bệ Thi Công Vệ Sinh</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Chờ Thực Hiện (CL)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {pendingOrders.length} <span className="text-xs text-slate-400 font-sans font-normal">container</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Tiếp nhận từ Giám định e-EIR</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Đang Thi Công Rửa</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {inProgressOrders.length} <span className="text-xs text-slate-400 font-sans font-normal">vỏ trên bệ</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Áp lực 180-220 Bar &bull; Hóa chất kiềm</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Đã Chuyển Khai Thác (AV)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {handoverOrders.length + cleanedOrders.length} <span className="text-xs text-slate-400 font-sans font-normal">vỏ đạt chuẩn</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Sẵn sàng cấp cho chủ hàng</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Doanh Thu Vệ Sinh</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black font-mono text-white">
            {totalRevenue.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Thu cước theo Master Tariff</span>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Bay Status Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>Trạng Thái Hoạt Động Các Bệ Vệ Sinh (Cleaning Bays Realtime)</span>
          </h3>
          <span className="text-[11px] text-slate-400">Công suất: 3 Trạm thi công song song</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stations.map((bay) => (
            <div
              key={bay.id}
              className={`p-5 rounded-2xl border transition space-y-3.5 ${
                bay.status === 'BUSY'
                  ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{bay.name}</span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase font-mono ${
                        bay.status === 'BUSY'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {bay.status === 'BUSY' ? 'Đang Rửa' : 'Sẵn Sàng'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">{bay.type}</p>
                </div>
              </div>

              {/* Station Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-mono">{bay.pressure}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-mono">{bay.temp}</span>
                </div>
              </div>

              {/* Container info */}
              <div className="text-xs pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 text-[10px]">Cont đang xử lý:</span>
                {bay.currentCont ? (
                  <span className="font-mono font-bold text-cyan-300 text-xs">{bay.currentCont}</span>
                ) : (
                  <span className="text-slate-500 text-[10px] italic">Trống</span>
                )}
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>KTV: <strong className="text-slate-200">{bay.operator}</strong></span>
                <button
                  type="button"
                  onClick={() => onSelectTab('execution')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold transition flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Chi tiết</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Active Orders Waiting & Next Steps */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Container Chờ &amp; Đang Vệ Sinh Hôm Nay ({orders.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => onSelectTab('queue')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả danh sách</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {orders.slice(0, 3).map((order) => (
            <div
              key={order.id}
              onClick={() => {
                onSelectOrder(order);
                onSelectTab('execution');
              }}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-cyan-500/60 rounded-2xl transition cursor-pointer space-y-2.5 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-black text-white group-hover:text-cyan-300 transition text-sm">
                    {order.containerNo}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {order.size} {order.type} &bull; {order.shippingLine}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded font-mono ${
                    order.status === 'HANDOVER_TO_OPERATION'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : order.status === 'IN_CLEANING'
                      ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {order.status === 'HANDOVER_TO_OPERATION'
                    ? 'ĐÃ BÀN GIAO AV'
                    : order.status === 'IN_CLEANING'
                    ? 'ĐANG THI CÔNG'
                    : 'CHỜ RỬA'}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Hạng mục:</span>
                  <strong className="text-slate-200">{order.items.length} dịch vụ</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cước phí:</span>
                  <strong className="text-amber-400 font-mono">{order.totalCost.toLocaleString('vi-VN')} đ</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
