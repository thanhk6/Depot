import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import { YardLocation, ForkliftMoveOrder } from '../../types/depot';
import { FORKLIFT_UNITS } from '../../data/depotMasterData';
import {
  Truck,
  Boxes,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Compass
} from 'lucide-react';

export const YardManagement: React.FC = () => {
  const { jobs, createForkliftMove, completeForkliftMove, setSelectedJobId } = useDepot();

  const [activeBlock, setActiveBlock] = useState<YardLocation['block']>('BLOCK_A');

  // Forklift Move Modal / Form state
  const [selectedContainerJobId, setSelectedContainerJobId] = useState(jobs[0]?.id || '');
  const [targetBlock, setTargetBlock] = useState<YardLocation['block']>('BLOCK_A');
  const [targetBay, setTargetBay] = useState(2);
  const [targetRow, setTargetRow] = useState(3);
  const [targetTier, setTargetTier] = useState(1);
  const [selectedForkliftId, setSelectedForkliftId] = useState(FORKLIFT_UNITS[0].id);
  const [movePurpose, setMovePurpose] = useState<ForkliftMoveOrder['purpose']>('YARD_STORAGE');

  const selectedContainerJob = jobs.find((j) => j.id === selectedContainerJobId);

  // All active forklift move orders from all jobs
  const allMoveOrders = jobs.flatMap((j) => j.moveHistory || []).filter(Boolean).sort((a, b) => {
    return new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime();
  });

  const handleCreateMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContainerJob) return;

    const toLocation: YardLocation = {
      block: targetBlock,
      bay: targetBay,
      row: targetRow,
      tier: targetTier
    };

    createForkliftMove(selectedContainerJob.id, toLocation, selectedForkliftId, movePurpose);
  };

  // Status badge colors in grid
  const getCellColor = (jobStatus?: string) => {
    if (!jobStatus) return 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 text-slate-500';
    if (jobStatus === 'GATE_IN' || jobStatus === 'SURVEYING') return 'bg-amber-950/80 border-amber-600 text-amber-200';
    if (jobStatus === 'PAYMENT_PENDING' || jobStatus === 'OPERATION_PENDING') return 'bg-blue-950/80 border-blue-600 text-blue-200';
    if (jobStatus === 'ESTIMATE_PENDING_APPROVAL') return 'bg-indigo-950/80 border-indigo-600 text-indigo-200';
    if (jobStatus === 'REPAIRING') return 'bg-orange-950/80 border-orange-600 text-orange-200';
    if (jobStatus === 'QC_PENDING') return 'bg-teal-950/80 border-teal-600 text-teal-200';
    return 'bg-emerald-950/80 border-emerald-600 text-emerald-200';
  };

  const BLOCKS_CONFIG = [
    { id: 'BLOCK_A', title: 'Block A (Dry 20ft)', subtitle: 'Khu bãi hòm khô 20ft' },
    { id: 'BLOCK_B', title: 'Block B (Dry 40ft)', subtitle: 'Khu bãi hòm khô 40ft/40HC' },
    { id: 'BLOCK_C', title: 'Block C (Reefer Zone)', subtitle: 'Khu hòm lạnh có ổ cắm điện' },
    { id: 'BLOCK_R', title: 'Block R (Repair Zone)', subtitle: 'Khu vực xưởng sửa chữa' },
    { id: 'BLOCK_Q', title: 'Block Q (QC Zone)', subtitle: 'Khu vực kiểm tra nghiệm thu' }
  ];

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-rose-900/60 to-slate-900 border border-rose-700/50 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600 rounded-xl text-white shadow-lg shadow-rose-600/30">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">6. Quản Lý Sơ Đồ Bãi & Phát Lệnh Xe Nâng (Yard Map)</h2>
            <p className="text-xs text-rose-200/80">
              Sơ đồ 2D vị trí Container (Block - Bay - Row - Tier) & Lịch sử điều động xe nâng di chuyển
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-rose-200 font-medium">Đội Xe Nâng Trực Bãi:</span>
          <div className="flex -space-x-2">
            {FORKLIFT_UNITS.map((f) => (
              <div
                key={f.id}
                title={`${f.name} - ${f.driver}`}
                className="w-8 h-8 rounded-full bg-slate-800 border-2 border-rose-500 text-rose-300 font-bold text-[10px] flex items-center justify-center shadow"
              >
                {f.id?.split('-')?.[1] || f.id || ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive 2D Yard Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            {/* Block Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto">
              <div className="flex items-center gap-2">
                {BLOCKS_CONFIG.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBlock(b.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      activeBlock === b.id
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {b.title}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:block">
                Grid: 5 Bays x 4 Rows
              </span>
            </div>

            {/* Visual 2D Grid map for selected block */}
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Đang xem sơ đồ: <strong className="text-white">{BLOCKS_CONFIG.find((b) => b.id === activeBlock)?.title}</strong>
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Giám định</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500"></span> Sửa chữa</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Lưu bãi / Sẵn sàng</span>
                </div>
              </div>

              {/* Grid 5 Bays x 4 Rows */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((bay) => (
                  <div key={bay} className="space-y-2">
                    <div className="text-center font-mono font-bold text-xs text-slate-400 bg-slate-800/60 py-1 rounded-lg">
                      Bay {bay}
                    </div>

                    {[1, 2, 3, 4].map((row) => {
                      // Find if container exists at block, bay, row
                      const foundJob = jobs.find(
                        (j) =>
                          j.status !== 'GATE_OUT' &&
                          j.currentLocation?.block === activeBlock &&
                          j.currentLocation?.bay === bay &&
                          j.currentLocation?.row === row
                      );

                      return (
                        <div
                          key={row}
                          onClick={() => foundJob && setSelectedJobId(foundJob.id)}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col justify-between min-h-[70px] ${getCellColor(
                            foundJob?.status
                          )}`}
                        >
                          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                            <span>R{row}</span>
                            <span>T{foundJob?.currentLocation?.tier || 1}</span>
                          </div>

                          {foundJob ? (
                            <div className="my-1">
                              <div className="font-mono font-black text-xs tracking-wider truncate">
                                {foundJob.containerNo}
                              </div>
                              <div className="text-[10px] opacity-80 font-mono">
                                {foundJob.isoSize} • {foundJob.shippingLine?.split(' ')?.[0] || ''}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-600 font-mono my-auto">Trống</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All Move Orders History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-400" />
                <span>Nhật Ký Lệnh Xe Nâng Di Chuyển ({allMoveOrders.length})</span>
              </span>
            </h3>

            {allMoveOrders.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">Chưa có lệnh di chuyển xe nâng nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-semibold">
                      <th className="p-2.5">Container</th>
                      <th className="p-2.5">Từ Vị Trí</th>
                      <th className="p-2.5">Đến Vị Trí</th>
                      <th className="p-2.5">Xe Nâng / Tài Xế</th>
                      <th className="p-2.5 text-center">Trạng Thái</th>
                      <th className="p-2.5 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allMoveOrders.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-2.5 font-mono font-bold text-white">{m.containerNo}</td>
                        <td className="p-2.5 font-mono text-slate-400">
                          {m.fromLocation.block.replace('BLOCK_', '')}-B{m.fromLocation.bay}-R{m.fromLocation.row}-T{m.fromLocation.tier}
                        </td>
                        <td className="p-2.5 font-mono text-emerald-400 font-bold">
                          {m.toLocation.block.replace('BLOCK_', '')}-B{m.toLocation.bay}-R{m.toLocation.row}-T{m.toLocation.tier}
                        </td>
                        <td className="p-2.5 text-slate-300">
                          {m.forkliftId} ({m.driverName})
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.status === 'COMPLETED'
                                ? 'bg-emerald-900/60 text-emerald-300'
                                : 'bg-amber-900/60 text-amber-300 animate-pulse'
                            }`}
                          >
                            {m.status === 'COMPLETED' ? 'HOÀN THÀNH' : 'ĐANG ĐIỀU ĐỘNG'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          {m.status !== 'COMPLETED' && (
                            <button
                              onClick={() => completeForkliftMove(m.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] transition"
                            >
                              Xác Nhận Đã Hạ
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dispatch Forklift Move Order Form */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleCreateMove} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Plus className="w-4 h-4 text-rose-400" />
              <span>Phát Lệnh Xe Nâng Mới</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Chọn Container Cần Di Chuyển</label>
                <select
                  value={selectedContainerJobId}
                  onChange={(e) => setSelectedContainerJobId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold"
                >
                  {jobs
                    .filter((j) => j.status !== 'GATE_OUT')
                    .map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.containerNo} ({j.isoSize}) - Vị trí: B{j.currentLocation.bay}-R{j.currentLocation.row}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Block Mục Tiêu</label>
                <select
                  value={targetBlock}
                  onChange={(e) => setTargetBlock(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  {BLOCKS_CONFIG.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Bay (Dãy)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={targetBay}
                    onChange={(e) => setTargetBay(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Row (Hàng)</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={targetRow}
                    onChange={(e) => setTargetRow(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Tier (Tầng)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={targetTier}
                    onChange={(e) => setTargetTier(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Chỉ Định Xe Nâng & Tài Xế</label>
                <select
                  value={selectedForkliftId}
                  onChange={(e) => setSelectedForkliftId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  {FORKLIFT_UNITS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} - Lái xe: {f.driver}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Mục Đích Đóng Lệnh</label>
                <select
                  value={movePurpose}
                  onChange={(e) => setMovePurpose(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="SURVEY">Chuyển sang Khu Giám Định</option>
                  <option value="REPAIR">Chuyển sang Xưởng Sửa Chữa</option>
                  <option value="QC">Chuyển sang Khu Nghiệm Thu QC</option>
                  <option value="YARD_STORAGE">Hạ Lưu Bãi Chính Thức</option>
                  <option value="GATE_OUT">Chuyển ra Cổng Xuất (Gate Out)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Phát Lệnh Xe Nâng Thực Hiện</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
