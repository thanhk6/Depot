import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import { ForkliftMoveOrder } from '../../types/depot';
import {
  Truck,
  Play,
  CheckCircle2,
  Clock,
  UserCheck,
  PlusCircle,
  Search,
  ArrowRight,
  Boxes,
  RotateCcw,
  AlertCircle,
  X
} from 'lucide-react';

export const ForkliftModule: React.FC = () => {
  const { jobs, createForkliftMove, completeForkliftMove } = useDepot();

  const forkliftOrders = jobs.flatMap((j) => j.moveHistory || []).filter(Boolean).sort((a, b) => {
    return new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [forkliftId, setForkliftId] = useState('XN-01');
  const [driverName, setDriverName] = useState('Trần Văn Hùng');
  const [purpose, setPurpose] = useState<'SURVEY' | 'REPAIR' | 'QC' | 'YARD_STORAGE' | 'GATE_OUT'>('YARD_STORAGE');
  
  // Destination State
  const [toBlock, setToBlock] = useState<'BLOCK_A' | 'BLOCK_B' | 'BLOCK_C' | 'BLOCK_R' | 'BLOCK_Q'>('BLOCK_A');
  const [toBay, setToBay] = useState(3);
  const [toRow, setToRow] = useState(2);
  const [toTier, setToTier] = useState(1);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOrders = forkliftOrders.filter((order) => {
    const matchesSearch =
      (order.containerNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.driverName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.forkliftId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetJob = jobs.find((j) => j.id === selectedJobId);
    if (!targetJob) return;

    createForkliftMove(
      targetJob.id,
      {
        block: toBlock,
        bay: Number(toBay),
        row: Number(toRow),
        tier: Number(toTier)
      },
      forkliftId,
      purpose
    );

    setIsModalOpen(false);
    showToast(`Đã phát lệnh xe nâng dịch chuyển Container ${targetJob.containerNo}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <Truck className="w-5 h-5 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Quick Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-2xl">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Quản Lý Lệnh Điều Độ Xe Nâng (Forklift Work Orders)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Điều phối xe nâng gắp đảo bãi, chuyển vị trí giám định, khu vực sửa chữa & xuất bãi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Phát Lệnh Điều Xe Nâng</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st === 'ALL'
                  ? 'Tất Cả Lệnh'
                  : st === 'PENDING'
                  ? '⏳ Chờ Tiếp Nhận'
                  : st === 'IN_PROGRESS'
                  ? '🚜 Đang Di Chuyển'
                  : '✓ Hoàn Thành'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm số Container, tài xế..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const isPending = order.status === 'PENDING';
          const isInProgress = order.status === 'IN_PROGRESS';
          const isCompleted = order.status === 'COMPLETED';

          return (
            <div
              key={order.id}
              className={`p-5 rounded-3xl border transition space-y-4 relative ${
                isInProgress
                  ? 'bg-amber-950/20 border-amber-500/60 shadow-xl'
                  : isCompleted
                  ? 'bg-slate-900 border-slate-800/80 opacity-90'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-black text-base text-amber-300 tracking-wider">
                    {order.containerNo}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Mã lệnh: {order.id}</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    isPending
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : isInProgress
                      ? 'bg-blue-950 text-blue-300 border-blue-800 animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {isPending ? '⏳ CHỜ THỰC HIỆN' : isInProgress ? '🚜 ĐANG THỰC HIỆN' : '✓ HOÀN THÀNH'}
                </span>
              </div>

              {/* Location Route */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <div className="text-center flex-1">
                  <p className="text-[10px] text-slate-500">Từ vị trí</p>
                  <p className="font-mono font-bold text-amber-400">
                    {order.fromLocation.block.replace('BLOCK_', '')}-{order.fromLocation.bay}-{order.fromLocation.row}-{order.fromLocation.tier}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                <div className="text-center flex-1">
                  <p className="text-[10px] text-slate-500">Đến vị trí</p>
                  <p className="font-mono font-bold text-emerald-400">
                    {order.toLocation.block.replace('BLOCK_', '')}-{order.toLocation.bay}-{order.toLocation.row}-{order.toLocation.tier}
                  </p>
                </div>
              </div>

              {/* Driver & Vehicle */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Xe nâng gắp:</span>
                  <span className="font-semibold text-white">{order.forkliftId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài xế xe nâng:</span>
                  <span className="font-semibold text-white">{order.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mục đích dịch chuyển:</span>
                  <span className="font-bold text-purple-300">{order.purpose}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                {isPending && (
                  <button
                    onClick={() => {
                      completeForkliftMove(order.id);
                      showToast(`Tài xế ${order.driverName} đã BẮT ĐẦU di chuyển lệnh ${order.id}`);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Bắt Đầu Di Chuyển</span>
                  </button>
                )}

                {isInProgress && (
                  <button
                    onClick={() => {
                      completeForkliftMove(order.id);
                      showToast(`Hoàn thành xuất sắc lệnh xe nâng ${order.id}`);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Xác Nhận Đã Đặt Đúng Vị Trí</span>
                  </button>
                )}

                {isCompleted && (
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành lúc {order.completedAt || '10:45'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Phát Lệnh Điều Động Xe Nâng</h3>
                  <p className="text-xs text-slate-400">Gán nhiệm vụ di chuyển container cho tài xế xe nâng</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chọn Container Trong Bãi</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500 font-mono"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.containerNo} ({j.isoSize}) - Vị trí hiện tại: {j.currentLocation.block.replace('BLOCK_', '')}-{j.currentLocation.bay}-{j.currentLocation.row}-{j.currentLocation.tier}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Thiết Bị Xe Nâng</label>
                  <select
                    value={forkliftId}
                    onChange={(e) => setForkliftId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500"
                  >
                    <option value="Forklift-01 (Linde 45T)">Xe nâng 01 (Linde 45 Tấn)</option>
                    <option value="Forklift-02 (Kalmar 45T)">Xe nâng 02 (Kalmar 45 Tấn)</option>
                    <option value="Forklift-03 (Sany 45T)">Xe nâng 03 (Sany 45 Tấn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tài Xế Phụ Trách</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vị Trí Đích Cần Đặt Đến (Block - Bay - Row - Tier)</label>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={toBlock}
                    onChange={(e) => setToBlock(e.target.value as any)}
                    className="px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  >
                    <option value="BLOCK_A">Block A</option>
                    <option value="BLOCK_B">Block B</option>
                    <option value="BLOCK_C">Block C</option>
                    <option value="BLOCK_R">Block R</option>
                    <option value="BLOCK_Q">Block Q</option>
                  </select>

                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={toBay}
                    onChange={(e) => setToBay(Number(e.target.value))}
                    className="px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-center"
                    placeholder="Bay"
                  />

                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={toRow}
                    onChange={(e) => setToRow(Number(e.target.value))}
                    className="px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-center"
                    placeholder="Row"
                  />

                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={toTier}
                    onChange={(e) => setToTier(Number(e.target.value))}
                    className="px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-center"
                    placeholder="Tier"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  Xác Nhận Phát Lệnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
