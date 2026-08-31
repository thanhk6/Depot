import React, { useState } from 'react';
import {
  Droplets,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Layers,
  Sparkles,
  Play,
  Plus,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  ShieldCheck,
  Check,
  Flame,
  Gauge
} from 'lucide-react';
import { CleaningExecutionRecord } from '../types';
import { ContainerTypeMasterItem } from '../../survey/types';
import { INITIAL_CONTAINER_TYPES } from '../../survey/mockData';

interface CleaningQueueTableProps {
  orders: CleaningExecutionRecord[];
  onSelectOrder: (order: CleaningExecutionRecord) => void;
  onStartCleaning: (orderId: string, bay: string, staff: string) => void;
  onOpenIntakeModal: () => void;
  containerTypes?: ContainerTypeMasterItem[];
}

export const CleaningQueueTable: React.FC<CleaningQueueTableProps> = ({
  orders,
  onSelectOrder,
  onStartCleaning,
  onOpenIntakeModal,
  containerTypes = INITIAL_CONTAINER_TYPES
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_CLEANING' | 'IN_CLEANING' | 'CLEANED' | 'HANDOVER_TO_OPERATION'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.containerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.eeirNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesType =
      typeFilter === 'ALL' ||
      o.size.includes(typeFilter) ||
      (o.type && o.type.toLowerCase().includes(typeFilter.toLowerCase())) ||
      (o.isoCode && o.isoCode.toLowerCase().includes(typeFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = orders.filter((o) => o.status === 'PENDING_CLEANING').length;
  const inProgressCount = orders.filter((o) => o.status === 'IN_CLEANING').length;
  const completedCount = orders.filter((o) => o.status === 'CLEANED' || o.status === 'HANDOVER_TO_OPERATION').length;

  return (
    <div className="space-y-4">
      {/* Top Banner for Cleaning Staff */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-2xl shadow-lg">
              <Droplets className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  DANH SÁCH CONTAINER CẦN VỆ SINH (CLEANING TO-DO WORKSPACE)
                </h2>
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold rounded-md border border-cyan-500/30">
                  Tổ Vệ Sinh Bãi
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem toàn bộ vỏ phân loại <strong className="text-amber-400">CL (Cần Vệ Sinh)</strong> được chuyển tự động từ Giám định e-EIR &bull; Nhận việc, thi công xịt rửa theo danh mục và bàn giao sang Khai Thác (AV).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenIntakeModal}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tiếp Nhận Cont Bẩn Vào Bệ</span>
            </button>
          </div>
        </div>

        {/* Status Quick Filter Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              statusFilter === 'ALL'
                ? 'bg-slate-800/90 border-cyan-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold block">Tất Cả Công Việc</span>
              <span className="text-xs text-slate-400">{orders.length} container</span>
            </div>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PENDING_CLEANING')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              statusFilter === 'PENDING_CLEANING'
                ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold block">Chờ Thi Công (CL)</span>
              <span className="text-xs text-amber-400 font-mono font-bold">{pendingCount} container</span>
            </div>
            <Clock className="w-4 h-4 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('IN_CLEANING')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              statusFilter === 'IN_CLEANING'
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold block">Đang Rửa Trên Bệ</span>
              <span className="text-xs text-cyan-400 font-mono font-bold">{inProgressCount} vỏ</span>
            </div>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('HANDOVER_TO_OPERATION')}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
              statusFilter === 'HANDOVER_TO_OPERATION'
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold block">Đã Bàn Giao AV</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">{completedCount} vỏ đạt</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Container No, số e-EIR, hãng tàu (Maersk, CMA, Cosco)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Tất cả loại cont ({containerTypes.length})</option>
              {containerTypes.map((ct) => (
                <option key={ct.id || ct.typeCode} value={ct.typeCode}>
                  {ct.typeCode} ({ct.isoCode}) - {ct.vietnameseName.split('(')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center justify-end gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dạng Thẻ (Task Board)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Dạng Bảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Mode 1: Staff Task Cards (Chế độ Thẻ Công Việc trực quan cho Thợ Vệ Sinh) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 space-y-2">
              <Droplets className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-sm text-slate-300">Không có container nào phù hợp</p>
              <p className="text-xs text-slate-500">Hãy thử xóa bộ lọc tìm kiếm hoặc tiếp nhận container mới</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const completedCount = order.items.filter((i) => i.isCompleted).length;
              const totalItems = order.items.length;
              const isAllDone = completedCount === totalItems && totalItems > 0;

              return (
                <div
                  key={order.id}
                  className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all hover:border-cyan-500/80 shadow-xl space-y-4 ${
                    order.status === 'IN_CLEANING'
                      ? 'border-cyan-500/50 bg-slate-900/95 ring-1 ring-cyan-500/30'
                      : order.status === 'HANDOVER_TO_OPERATION'
                      ? 'border-emerald-500/30 bg-slate-900/70'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-white text-base tracking-wider">
                            {order.containerNo}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-950 text-cyan-300 font-mono text-[10px] font-bold rounded-lg border border-slate-800">
                            {order.size}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <strong className="text-slate-200">{order.shippingLine}</strong>
                          <span>&bull;</span>
                          <span className="font-mono text-cyan-400 text-[11px]">{order.eeirNo}</span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div>
                        {order.status === 'HANDOVER_TO_OPERATION' ? (
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>BÀN GIAO AV</span>
                          </span>
                        ) : order.status === 'IN_CLEANING' ? (
                          <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                            <span>ĐANG RỬA</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>CHỜ THI CÔNG</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location & Bay info */}
                    <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Bệ Rửa Chỉ Định:</span>
                        <strong className="text-cyan-300 font-bold truncate max-w-[170px]">{order.cleaningBay || 'N/A'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Kỹ Thuật Viên:</span>
                        <span className="font-semibold text-slate-200">{order.cleaningStaff}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checklist of Tasks to do */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Danh Mục Dịch Vụ Cần Làm ({completedCount}/{totalItems}):</span>
                      </span>
                      <span className="font-mono text-amber-400 font-bold text-[11px]">
                        {order.totalCost.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 space-y-1 max-h-32 overflow-y-auto scrollbar-none">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-[11px] py-0.5"
                        >
                          <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                            {item.isCompleted ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            )}
                            <span className={item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}>
                              [{item.cleaningCode}] {item.cleaningName}
                            </span>
                          </div>
                          {item.chemicalRequired && (
                            <span className="px-1.5 py-0.2 bg-purple-950/60 text-purple-300 text-[9px] font-bold rounded border border-purple-800/40">
                              Hóa chất
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{order.status === 'PENDING_CLEANING' ? 'Nhận Việc & Mở Bệ Rửa' : 'Chi Tiết Thi Công & Bàn Giao AV'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View Mode 2: Compact Table */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Container No / ISO</th>
                  <th className="py-3.5 px-3">Hãng Tàu / e-EIR</th>
                  <th className="py-3.5 px-3">Bệ Rửa &amp; KTV</th>
                  <th className="py-3.5 px-3">Danh Mục Cần Làm</th>
                  <th className="py-3.5 px-3">Cước Phí</th>
                  <th className="py-3.5 px-3">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Droplets className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-xs">Không có container nào trong hàng đợi vệ sinh</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const completedItems = order.items.filter((i) => i.isCompleted).length;
                    const totalItems = order.items.length;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-800/40 transition group cursor-pointer"
                        onClick={() => onSelectOrder(order)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-white text-sm tracking-wider">
                              {order.containerNo}
                            </span>
                            <span className="px-1.5 py-0.2 bg-slate-800 text-cyan-300 font-mono text-[9px] rounded font-bold">
                              {order.size}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{order.type}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-200 block">{order.shippingLine}</span>
                          <span className="font-mono text-[10px] text-cyan-400">{order.eeirNo}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-300 block truncate max-w-[180px]">
                            {order.cleaningBay}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" />
                            {order.cleaningStaff}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="font-mono font-bold text-cyan-400">{completedItems}/{totalItems}</span>
                              <span className="text-slate-400">hạng mục xong</span>
                            </div>
                            <div className="w-24 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-cyan-500 h-full rounded-full transition-all"
                                style={{ width: `${(completedItems / (totalItems || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold text-amber-400">
                          {order.totalCost.toLocaleString('vi-VN')} đ
                        </td>

                        <td className="py-3.5 px-3">
                          {order.status === 'HANDOVER_TO_OPERATION' ? (
                            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Đã Bàn Giao (AV)</span>
                            </span>
                          ) : order.status === 'CLEANED' ? (
                            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-bold w-fit block">
                              Đã Vệ Sinh Xong
                            </span>
                          ) : order.status === 'IN_CLEANING' ? (
                            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold animate-pulse w-fit block">
                              Đang Thi Công Rửa
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold w-fit block">
                              Chờ Thi Công
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectOrder(order);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <span>Mở Bệ Thi Công</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
