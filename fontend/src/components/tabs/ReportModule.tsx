import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  Boxes,
  Wrench,
  CheckCircle2,
  Table
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const ReportModule: React.FC = () => {
  const { jobs } = useDepot();

  const [dateRange, setDateRange] = useState('THIS_MONTH');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Revenue & Throughput data
  const revenueData = [
    { date: '01/08', revenue: 14500000, gateIn: 18, gateOut: 12 },
    { date: '02/08', revenue: 22800000, gateIn: 24, gateOut: 19 },
    { date: '03/08', revenue: 18900000, gateIn: 20, gateOut: 15 },
    { date: '04/08', revenue: 31200000, gateIn: 32, gateOut: 26 },
    { date: '05/08', revenue: 27500000, gateIn: 28, gateOut: 22 },
    { date: '06/08', revenue: 35000000, gateIn: 35, gateOut: 30 }
  ];

  const shippingLineDistribution = [
    { name: 'Maersk Line', value: 45, color: '#009EF7' },
    { name: 'MSC', value: 30, color: '#50CD89' },
    { name: 'COSCO', value: 25, color: '#FFC700' },
    { name: 'CMA CGM', value: 18, color: '#F1416C' },
    { name: 'ONE', value: 12, color: '#7239EA' }
  ];

  const statusDistribution = [
    { name: 'Đã Lưu Bãi', count: jobs.filter((j) => j.status === 'YARD_STORED').length, color: '#50CD89' },
    { name: 'Đang Giám Định', count: jobs.filter((j) => j.status === 'SURVEYING').length, color: '#FFC700' },
    { name: 'Chờ Duyệt Báo Giá', count: jobs.filter((j) => j.status === 'ESTIMATE_PENDING_APPROVAL').length, color: '#009EF7' },
    { name: 'Đang Sửa Chữa', count: jobs.filter((j) => j.status === 'REPAIRING').length, color: '#F1416C' }
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Trung Tâm Báo Cáo & Phân Tích Doanh Thu ERP</h2>
              <p className="text-xs text-slate-400 mt-1">
                Tổng hợp chỉ số KPI sản lượng nâng hạ, doanh thu nâng bãi, thống kê chi phí sửa chữa & báo cáo Pivot.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Đã xuất báo cáo tổng hợp ra file Excel (.xlsx)')}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={() => showToast('Đã xuất báo cáo PDF dạng trang in A4')}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>Xuất PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Biểu Mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng Doanh Thu Tháng</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">150,300,000 đ</p>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 inline-block">
            ↑ +18.5% so với tháng trước
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Sản Lượng Gate-In</span>
            <Boxes className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">157 Container</p>
          <span className="text-[10px] text-blue-400 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-800 inline-block">
            Trung bình 26 cont / ngày
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Doanh Thu Sửa Chữa (Repair)</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">88,500,000 đ</p>
          <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800 inline-block">
            Đã nghiệm thu 42 container
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tỷ Lệ Duyệt Báo Giá Hãng Tàu</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">94.2 %</p>
          <span className="text-[10px] text-purple-400 font-bold bg-purple-950 px-2 py-0.5 rounded border border-purple-800 inline-block">
            Thời gian phản hồi ~1.2 giờ
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Biểu Đồ Doanh Thu & Sản Lượng Nâng Hạ Theo Ngày (Tháng 08/2026)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#50CD89" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar yAxisId="left" dataKey="gateIn" name="Sản lượng Gate-In" fill="#009EF7" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="left" dataKey="gateOut" name="Sản lượng Gate-Out" fill="#FFC700" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shipping Line Distribution */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            Tỷ Thị Phần Container Theo Hãng Tàu
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={shippingLineDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {shippingLineDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pivot Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Table className="w-4 h-4 text-purple-400" />
          Bảng Tổng Hợp Doanh Thu Theo Hãng Tàu & Loại Dịch Vụ (Pivot Summary)
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <th className="py-3 px-4 font-bold">Hãng Tàu</th>
                <th className="py-3 px-3 text-right font-bold">Phí Nâng Hạ (Gate)</th>
                <th className="py-3 px-3 text-right font-bold">Phí Lưu Bãi (Storage)</th>
                <th className="py-3 px-3 text-right font-bold">Phí Sửa Chữa (Repair)</th>
                <th className="py-3 px-3 text-right font-bold">Phí Vệ Sinh (Clean)</th>
                <th className="py-3 px-4 text-right font-bold">Tổng Thành Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/50 transition">
                <td className="py-3 px-4 font-bold text-white">Maersk Line A/S</td>
                <td className="py-3 px-3 text-right text-slate-300">18,500,000 đ</td>
                <td className="py-3 px-3 text-right text-slate-300">12,200,000 đ</td>
                <td className="py-3 px-3 text-right text-amber-300 font-bold">34,000,000 đ</td>
                <td className="py-3 px-3 text-right text-slate-300">4,500,000 đ</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">69,200,000 đ</td>
              </tr>
              <tr className="hover:bg-slate-800/50 transition">
                <td className="py-3 px-4 font-bold text-white">Mediterranean Shipping (MSC)</td>
                <td className="py-3 px-3 text-right text-slate-300">14,000,000 đ</td>
                <td className="py-3 px-3 text-right text-slate-300">8,900,000 đ</td>
                <td className="py-3 px-3 text-right text-amber-300 font-bold">22,100,000 đ</td>
                <td className="py-3 px-3 text-right text-slate-300">3,200,000 đ</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">48,200,000 đ</td>
              </tr>
              <tr className="hover:bg-slate-800/50 transition">
                <td className="py-3 px-4 font-bold text-white">COSCO Shipping Lines</td>
                <td className="py-3 px-3 text-right text-slate-300">11,200,000 đ</td>
                <td className="py-3 px-3 text-right text-slate-300">6,500,000 đ</td>
                <td className="py-3 px-3 text-right text-amber-300 font-bold">18,000,000 đ</td>
                <td className="py-3 px-3 text-right text-slate-300">2,800,000 đ</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">38,500,000 đ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
