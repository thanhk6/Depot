import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Flame,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  Eye,
  Camera,
  Play
} from 'lucide-react';
import { WorkOrderRecord, WorkOrderStatus, PriorityLevel } from '../types/repair';

interface WorkOrderListProps {
  workOrders: WorkOrderRecord[];
  onSelectWorkOrder: (workOrder: WorkOrderRecord) => void;
  onNavigateTab: (tabId: string) => void;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({
  workOrders,
  onSelectWorkOrder,
  onNavigateTab
}) => {
  const [activeStatusTab, setActiveStatusTab] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedShippingLine, setSelectedShippingLine] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Filter calculations
  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesStatus =
      activeStatusTab === 'ALL'
        ? true
        : activeStatusTab === 'WAITING'
        ? wo.status === 'WAITING'
        : activeStatusTab === 'IN_PROGRESS'
        ? wo.status === 'IN_PROGRESS'
        : activeStatusTab === 'COMPLETED'
        ? wo.status === 'COMPLETED'
        : activeStatusTab === 'QC_PENDING'
        ? wo.status === 'QC_PENDING'
        : activeStatusTab === 'QC_PASSED'
        ? wo.status === 'QC_PASSED'
        : activeStatusTab === 'QC_FAILED'
        ? wo.status === 'QC_FAILED'
        : true;

    const matchesSearch =
      searchKeyword.trim() === '' ||
      wo.containerNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      wo.workOrderNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      wo.estimateNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      wo.shippingLine.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      wo.leadTechnician.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchesShipping =
      selectedShippingLine === 'ALL' || wo.shippingLine === selectedShippingLine;

    const matchesPriority =
      selectedPriority === 'ALL' || wo.priority === selectedPriority;

    return matchesStatus && matchesSearch && matchesShipping && matchesPriority;
  });

  // KPI counters
  const totalCount = workOrders.length;
  const waitingCount = workOrders.filter((w) => w.status === 'WAITING').length;
  const inProgressCount = workOrders.filter((w) => w.status === 'IN_PROGRESS').length;
  const qcPendingCount = workOrders.filter((w) => w.status === 'QC_PENDING').length;
  const qcPassedCount = workOrders.filter((w) => w.status === 'QC_PASSED').length;
  const urgentCount = workOrders.filter((w) => w.priority === 'URGENT' || w.priority === 'HIGH').length;

  const shippingLines = Array.from(new Set(workOrders.map((w) => w.shippingLine)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              8. SỬA CHỮA CONTAINER (REPAIR & WORK ORDER EXECUTION)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sau khi Estimate được Hãng tàu phê duyệt, xưởng cơ khí tiếp nhận Work Order, thi công từng hạng mục, chụp ảnh trước/sau và chuyển QC nghiệm thu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('qc')}
            className="px-4 py-2.5 bg-purple-50 hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Chuyển Sang Bước 9 (Kỹ Thuật QC) &rarr;</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveStatusTab('ALL')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'ALL'
              ? 'bg-blue-50 border-blue-500 shadow-md '
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tất Cả WO</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{totalCount}</div>
          <span className="text-[10px] text-slate-500">Toàn bộ hồ sơ xưởng</span>
        </div>

        <div
          onClick={() => setActiveStatusTab('WAITING')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'WAITING'
              ? 'bg-amber-50 border-amber-500 shadow-md '
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Chờ Sửa (Waiting)</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">{waitingCount}</div>
          <span className="text-[10px] text-slate-500">Đã duyệt &bull; Chờ phân công</span>
        </div>

        <div
          onClick={() => setActiveStatusTab('IN_PROGRESS')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'IN_PROGRESS'
              ? 'bg-rose-50 border-rose-500 shadow-md '
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Đang Sửa (In Progress)</span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">{inProgressCount}</div>
          <span className="text-[10px] text-slate-500">Thợ đang hàn/gọt sàn</span>
        </div>

        <div
          onClick={() => setActiveStatusTab('QC_PENDING')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'QC_PENDING'
              ? 'bg-purple-50 border-purple-500 shadow-md '
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Chờ QC (QC Pending)</span>
          <div className="text-2xl font-black text-purple-600 font-mono mt-1">{qcPendingCount}</div>
          <span className="text-[10px] text-slate-500">Đã xong &bull; Đầy đủ ảnh</span>
        </div>

        <div
          onClick={() => setActiveStatusTab('QC_PASSED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStatusTab === 'QC_PASSED'
              ? 'bg-emerald-50 border-emerald-500 shadow-md '
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">QC Đạt (Passed)</span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{qcPassedCount}</div>
          <span className="text-[10px] text-slate-500">Chuyển vỏ sạch AV</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Khẩn Cấp (SLA)</span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">{urgentCount}</div>
          <span className="text-[10px] text-slate-500">Cần xuất bãi trong 24h</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
        {/* Status Filter Tabs (8.1) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'ALL', label: `Tất Cả (${totalCount})` },
            { id: 'WAITING', label: `Chờ Sửa (${waitingCount})` },
            { id: 'IN_PROGRESS', label: `Đang Sửa (${inProgressCount})` },
            { id: 'QC_PENDING', label: `Chờ Kiểm Tra QC (${qcPendingCount})` },
            { id: 'QC_PASSED', label: `QC Đạt (${qcPassedCount})` },
            { id: 'QC_FAILED', label: 'QC Không Đạt (0)' },
            { id: 'CANCELLED', label: 'Hủy (0)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeStatusTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md '
                  : 'bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Secondary Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Keyword search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo Container No, Work Order No, Báo Giá, Thợ thi công..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Shipping Line filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedShippingLine}
              onChange={(e) => setSelectedShippingLine(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none"
            >
              <option value="ALL">Tất cả Hãng Tàu</option>
              {shippingLines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none"
            >
              <option value="ALL">Mọi Mức Ưu Tiên</option>
              <option value="URGENT">Khẩn cấp (Urgent)</option>
              <option value="HIGH">Cao (High)</option>
              <option value="NORMAL">Bình thường (Normal)</option>
              <option value="LOW">Thấp (Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            DANH SÁCH LỆNH SỬA CHỮA (WORK ORDERS) ({filteredWorkOrders.length})
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            Tối ưu cho máy tính bảng / điện thoại tại bãi sửa chữa EMR
          </span>
        </div>

        {filteredWorkOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Wrench className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Không tìm thấy Work Order phù hợp</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Không có lệnh sửa chữa nào thỏa mãn điều kiện lọc. Vui lòng thay đổi trạng thái hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Work Order No</th>
                  <th className="p-4">Container & Loại Vỏ</th>
                  <th className="p-4">Báo Giá & Hãng Tàu</th>
                  <th className="p-4">Hạng Mục & Tiến Độ</th>
                  <th className="p-4">Ưu Tiên</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4">Hạn SLA</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-xs">
                {filteredWorkOrders.map((wo) => {
                  const total = wo.items.length;
                  const completed = wo.items.filter((i) => i.status === 'COMPLETED').length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const hasAllAfterPhotos = wo.items.every((i) => i.photos.some((p) => p.type === 'AFTER'));

                  return (
                    <tr
                      key={wo.id}
                      className="hover:bg-slate-850 transition duration-150 group"
                    >
                      {/* Work Order No */}
                      <td className="p-4">
                        <div className="font-mono font-black text-amber-600 text-sm">
                          {wo.workOrderNo}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Tạo: {wo.assignedAt}
                        </div>
                      </td>

                      {/* Container & Type */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          {wo.containerNo}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
                          <span>{wo.size} {wo.type}</span>
                          <span>&bull;</span>
                          <span className="text-blue-600">Vị trí: {wo.yardLocation.block}-{wo.yardLocation.bay}</span>
                        </div>
                      </td>

                      {/* Estimate & Shipping Line */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold rounded text-[11px]">
                            {wo.shippingLine}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 mt-1">
                          {wo.estimateNo}
                        </div>
                      </td>

                      {/* Items count & progress */}
                      <td className="p-4 min-w-[180px]">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-slate-700 font-bold">{completed} / {total} Hạng mục</span>
                          <span className={pct === 100 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all duration-300 ${
                              pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          Thợ: {wo.leadTechnician?.split('(')?.[0] || wo.leadTechnician || 'N/A'}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                          wo.priority === 'URGENT'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                            : wo.priority === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {wo.priority === 'URGENT' ? 'Khẩn Cấp' : wo.priority === 'HIGH' ? 'Ưu Tiên Cao' : 'Bình Thường'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 ${
                          wo.status === 'QC_PASSED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : wo.status === 'QC_PENDING'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : wo.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            wo.status === 'QC_PASSED'
                              ? 'bg-emerald-400'
                              : wo.status === 'QC_PENDING'
                              ? 'bg-purple-400 animate-pulse'
                              : wo.status === 'IN_PROGRESS'
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-slate-500'
                          }`} />
                          <span>
                            {wo.status === 'QC_PASSED'
                              ? 'QC Đạt'
                              : wo.status === 'QC_PENDING'
                              ? 'Chờ QC'
                              : wo.status === 'IN_PROGRESS'
                              ? 'Đang sửa'
                              : 'Chờ sửa'}
                          </span>
                        </span>
                      </td>

                      {/* Deadline SLA */}
                      <td className="p-4 font-mono text-[11px] text-slate-700">
                        {wo.deadline}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectWorkOrder(wo)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md  transition flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Chi Tiết Sửa Chữa</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
