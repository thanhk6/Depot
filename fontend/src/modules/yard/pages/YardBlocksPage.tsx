import React, { useState, useEffect } from 'react';
import {
  YardBlock,
  YardContainer
} from '../types/yardTypes';
import { yardApi } from '../services/yardApi';
import { STATUS_COLORS } from '../constants/yardConstants';
import { ContainerRecord } from '../../../services/mockDataStore';
import {
  Grid3X3,
  Layers,
  Plus,
  Edit3,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Percent,
  Wrench,
  Droplets,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Info,
  Lock,
  Unlock,
  Building2,
  Table,
  LayoutGrid,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';

interface YardBlocksPageProps {
  containers?: ContainerRecord[];
  onNavigateTab?: (tabId: string) => void;
}

interface BlockAllocationRule {
  id: string;
  blockCode: string;
  allowedSizes: string[];
  allowedTypes: string[];
  preferredLines: string[];
  maxWeightTons: number;
  reeferPlugCount?: number;
  priorityNote: string;
}

// Chính sách xếp bãi theo Block chưa có bảng lưu ở backend — không còn nạp chính sách mẫu cứng (trước đây
// 4 chính sách BLOCK_A/B/Q/R viết tay), phần "Chính sách" sẽ trống cho tới khi có dữ liệu thật.
const initialRules: BlockAllocationRule[] = [];

/** Rút gọn "BLOCK_A" -> "A" chỉ để hiển thị (dữ liệu gốc/locationCode vẫn giữ nguyên "BLOCK_A"). */
const formatBlockLabel = (blockCode: string) => blockCode.replace(/^BLOCK_/, '');

export const YardBlocksPage: React.FC<YardBlocksPageProps> = ({
  containers: appContainers,
  onNavigateTab
}) => {
  const [blocks, setBlocks] = useState<YardBlock[]>([]);
  const [containers, setContainers] = useState<YardContainer[]>([]);
  const [rules] = useState<BlockAllocationRule[]>(initialRules);
  const [selectedBlockCode, setSelectedBlockCode] = useState<string>('A');
  const [viewMode, setViewMode] = useState<'CARDS' | 'MATRIX' | 'RULES'>('MATRIX');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{
    bay: number;
    row: number;
  } | null>(null);

  // Edit / Create Block Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<YardBlock | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Nạp Block/Container thật từ backend (GET /api/yard/overview) — thay cho dữ liệu mock cố định.
  useEffect(() => {
    yardApi.getYardOverview()
      .then((data) => {
        if (data.blocks.length > 0) {
          setBlocks(data.blocks);
          setSelectedBlockCode(data.blocks[0].blockCode);
        }
        setContainers(data.containers);
      })
      .catch((error) => showToast(`Không thể tải dữ liệu Block từ hệ thống: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedBlock = blocks.find((b) => b.blockCode === selectedBlockCode) || blocks[0];
  const selectedRule = rules.find((r) => r.blockCode === selectedBlockCode);

  // Filtered containers belonging to selected block
  const blockContainers = selectedBlock
    ? containers.filter(
        (c) =>
          c.blockId === selectedBlock.id ||
          c.locationCode.startsWith(`${selectedBlock.blockCode}-`)
      )
    : [];

  // Summary Metrics
  const totalCapacity = blocks.reduce((sum, b) => sum + b.totalCapacity, 0);
  const totalOccupied = blocks.reduce((sum, b) => sum + b.occupiedCount, 0);
  const totalAvailable = totalCapacity - totalOccupied;
  const overallOccupancy = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : '0';

  // Toggle Maintenance status for a Block
  const handleToggleBlockStatus = (blockId: string) => {
    const target = blocks.find((b) => b.id === blockId);
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';

    yardApi.updateBlockLayout(target.blockCode, {
      blockName: target.blockName,
      description: target.description,
      bayCount: target.bayCount,
      rowCount: target.rowCount,
      maxTier: target.maxTier,
      status: nextStatus
    }).then((res) => {
      if (!res.success || !res.block) {
        showToast(`❌ ${res.message}`);
        return;
      }
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? res.block! : b)));
      showToast(
        `Block ${formatBlockLabel(target.blockCode)} đã chuyển sang trạng thái ${
          nextStatus === 'ACTIVE' ? 'HOẠT ĐỘNG (ACTIVE)' : 'BẢO TRÌ BÃI (MAINTENANCE)'
        }`
      );
    });
  };

  // Save Block Changes
  const handleSaveBlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBlock) return;

    const res = await yardApi.updateBlockLayout(editingBlock.blockCode, {
      blockName: editingBlock.blockName,
      description: editingBlock.description,
      bayCount: editingBlock.bayCount,
      rowCount: editingBlock.rowCount,
      maxTier: editingBlock.maxTier,
      status: editingBlock.status
    });

    if (!res.success || !res.block) {
      showToast(`❌ ${res.message}`);
      return;
    }

    setBlocks((prev) => prev.map((b) => (b.id === editingBlock.id ? res.block! : b)));
    setIsEditModalOpen(false);
    showToast(`Đã lưu cấu hình Block ${formatBlockLabel(editingBlock.blockCode)} thành công!`);
  };

  // Dữ liệu Block giờ chỉ đến từ backend (không còn dữ liệu mẫu làm khung) — chờ tải xong / chưa có Block nào
  // thì hiện trạng thái trống thay vì truy cập selectedBlock undefined (trắng màn).
  if (!selectedBlock) {
    return (
      <div className="p-10 bg-white border border-slate-200 rounded-2xl text-center text-sm text-slate-500">
        Chưa có dữ liệu Block bãi từ backend.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100 min-h-screen pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-50 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {isLoading && (
        <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          <span>Đang tải dữ liệu Block từ hệ thống...</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl">
            <Grid3X3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                QUẢN LÝ VỊ TRÍ & CẤU HÌNH BLOCK BÃI (YARD BLOCK MANAGEMENT)
              </h2>
              <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold rounded-full">
                Slot Matrix Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ vị trí Bay x Row x Tier • Quy tắc xếp bãi theo Hãng tàu/ISO • Giám sát tải trọng & năng lực chứa từng Block
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('yard_map')}
              className="px-3.5 py-2 bg-teal-50 hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>XEM SƠ ĐỒ BÃI 2D</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingBlock(selectedBlock);
              setIsEditModalOpen(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>CẤU HÌNH BLOCK {formatBlockLabel(selectedBlock.blockCode)}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Số Block</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{blocks.length}</span>
            <span className="text-[11px] text-slate-500 font-mono">khu vực lưu bãi</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Sức Chứa (TEU)</span>
            <Boxes className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-sky-700">{totalCapacity}</span>
            <span className="text-[11px] text-slate-500 font-mono">slots toàn depot</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tỉ Lệ Lấp Đầy TB</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-600">{overallOccupancy}%</span>
            <span className="text-[11px] text-slate-500 font-mono">({totalOccupied} đang chứa)</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vị Trí Rỗi Sẵn Sàng</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-teal-700">{totalAvailable}</span>
            <span className="text-[11px] text-slate-500 font-mono">slots trống</span>
          </div>
        </div>
      </div>

      {/* Block Selector & View Mode Switcher */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Block Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {blocks.map((b) => {
            const isSelected = b.blockCode === selectedBlockCode;
            const occ = Math.round((b.occupiedCount / b.totalCapacity) * 100);
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBlockCode(b.blockCode);
                  setSelectedSlot(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-indigo-400'
                    : 'bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>BLOCK {formatBlockLabel(b.blockCode)}</span>
                <span
                  className={`px-1.5 py-0.2 text-[9px] rounded font-mono font-bold ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {occ}%
                </span>
                {b.status === 'MAINTENANCE' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Đang bảo trì" />
                )}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('MATRIX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'MATRIX'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Ma Trận Bay x Row (Matrix)</span>
          </button>
          <button
            onClick={() => setViewMode('CARDS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'CARDS'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Danh Sách Block (Cards)</span>
          </button>
          <button
            onClick={() => setViewMode('RULES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'RULES'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quy Tắc Xếp Bãi (Rules)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MATRIX VIEW (Ma trận Bay x Row x Tier cho Block được chọn) */}
      {viewMode === 'MATRIX' && selectedBlock && (
        <div className="space-y-4">
          {/* Selected Block Info Header Card */}
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-black font-mono text-slate-900">
                    BLOCK {formatBlockLabel(selectedBlock.blockCode)} – {selectedBlock.blockName}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedBlock.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {selectedBlock.status === 'ACTIVE' ? 'ĐANG KHAI THÁC' : 'ĐANG BẢO TRÌ BÃI'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedBlock.description}</p>
              </div>

              {/* Quick stats for this block */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                  <span className="text-slate-500">Cấu hình:</span>
                  <strong className="font-mono text-indigo-700">
                    {selectedBlock.bayCount} Bays × {selectedBlock.rowCount} Rows × {selectedBlock.maxTier} Tiers
                  </strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                  <span className="text-slate-500">Sức chứa:</span>
                  <strong className="font-mono text-slate-900">
                    {selectedBlock.occupiedCount} / {selectedBlock.totalCapacity} Slots ({Math.round((selectedBlock.occupiedCount / selectedBlock.totalCapacity) * 100)}%)
                  </strong>
                </div>

                <button
                  onClick={() => handleToggleBlockStatus(selectedBlock.id)}
                  className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedBlock.status === 'ACTIVE'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedBlock.status === 'ACTIVE' ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Khóa Block Bảo Trì</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Mở Lại Block</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Allocation Rule Tag */}
            {selectedRule && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-slate-700">
                    <strong>Chính sách phân bổ:</strong> Ưu tiên Hãng{' '}
                    <span className="text-sky-700 font-bold">{selectedRule.preferredLines.join(', ')}</span> • Size{' '}
                    <span className="text-teal-700 font-bold">{selectedRule.allowedSizes.join(', ')} FT</span> • Loại{' '}
                    <span className="text-purple-700 font-bold">{selectedRule.allowedTypes.join(', ')}</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Tải trọng max: {selectedRule.maxWeightTons} Tấn</span>
              </div>
            )}
          </div>

          {/* Matrix Grid (Bays columns x Rows horizontal) */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 overflow-x-auto shadow-2xl">
            <div className="min-w-[960px] space-y-3">
              {/* Bay Header */}
              <div
                className="grid gap-3 text-center text-xs font-bold text-slate-500 font-mono"
                style={{
                  gridTemplateColumns: `80px repeat(${selectedBlock.bayCount}, minmax(0, 1fr))`
                }}
              >
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                  ROW \ BAY
                </div>
                {Array.from({ length: selectedBlock.bayCount }, (_, i) => i + 1).map((bayNo) => (
                  <div
                    key={bayNo}
                    className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-teal-600 font-mono text-xs"
                  >
                    BAY {String(bayNo).padStart(2, '0')}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {Array.from({ length: selectedBlock.rowCount }, (_, rIdx) => rIdx + 1).map((rowNo) => (
                <div
                  key={rowNo}
                  className="grid gap-3 items-stretch"
                  style={{
                    gridTemplateColumns: `80px repeat(${selectedBlock.bayCount}, minmax(0, 1fr))`
                  }}
                >
                  {/* Row Header Label */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-indigo-700 flex items-center justify-center text-center">
                    ROW {String(rowNo).padStart(2, '0')}
                  </div>

                  {/* Bay Slots */}
                  {Array.from({ length: selectedBlock.bayCount }, (_, bIdx) => bIdx + 1).map((bayNo) => {
                    const slotKey = `${selectedBlock.blockCode}-${String(bayNo).padStart(2, '0')}-${String(rowNo).padStart(2, '0')}`;
                    const contsInSlot = blockContainers.filter(
                      (c) => Number(c.bayNo) === bayNo && Number(c.rowNo) === rowNo
                    );
                    const isSlotSelected = selectedSlot?.bay === bayNo && selectedSlot?.row === rowNo;

                    return (
                      <div
                        key={bayNo}
                        onClick={() => setSelectedSlot({ bay: bayNo, row: rowNo })}
                        className={`p-2.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between min-h-[140px] group ${
                          isSlotSelected
                            ? 'bg-indigo-50 border-indigo-400 shadow-xl ring-2 ring-indigo-400/50'
                            : contsInSlot.length > 0
                            ? 'bg-slate-50 border-slate-200/80 hover:border-teal-200'
                            : 'bg-slate-50 border-slate-200/80 hover:border-slate-200'
                        }`}
                      >
                        {/* Slot Header */}
                        <div className="flex items-center justify-between text-[10px] mb-1.5 pb-1 border-b border-slate-200/60 font-mono">
                          <span className="text-slate-500 font-bold">{slotKey}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold ${
                              contsInSlot.length === selectedBlock.maxTier
                                ? 'bg-rose-50 text-rose-700'
                                : contsInSlot.length > 0
                                ? 'bg-teal-50 text-teal-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {contsInSlot.length}/{selectedBlock.maxTier}T
                          </span>
                        </div>

                        {/* 4-Tier Vertical Stack Mini-Boxes */}
                        <div className="space-y-1 flex-1 flex flex-col justify-end">
                          {Array.from({ length: selectedBlock.maxTier }, (_, tIdx) => selectedBlock.maxTier - tIdx).map(
                            (tierNo) => {
                              const contAtTier = contsInSlot.find((c) => Number(c.tierNo) === tierNo);
                              const statusConf = contAtTier ? STATUS_COLORS[contAtTier.status] : null;

                              return (
                                <div
                                  key={tierNo}
                                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono flex items-center justify-between border transition ${
                                    contAtTier && statusConf
                                      ? `${statusConf.badgeBg} shadow-sm`
                                      : 'bg-white border-slate-200/60 text-slate-600'
                                  }`}
                                >
                                  <span className="font-bold opacity-75">T{tierNo}</span>
                                  {contAtTier ? (
                                    <span className="font-bold truncate max-w-[80px]">
                                      {contAtTier.containerNo}
                                    </span>
                                  ) : (
                                    <span className="text-[8px] opacity-40">Trống</span>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>

                        {/* Bottom Slot Footer / Condition */}
                        {contsInSlot.length > 0 && (
                          <div className="pt-1.5 mt-1 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500">
                            <span className="truncate">{contsInSlot[0]?.shippingLine.split(' ')[0]}</span>
                            <span className="font-bold text-teal-600">{contsInSlot[0]?.size}FT</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Inspector Panel for Clicked Slot */}
          {selectedSlot && (
            <div className="p-5 bg-white border border-indigo-200 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-black font-mono text-slate-900">
                    VỊ TRÍ {formatBlockLabel(selectedBlock.blockCode)}-{String(selectedSlot.bay).padStart(2, '0')}-{String(selectedSlot.row).padStart(2, '0')}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[10px] rounded border border-indigo-200 font-bold">
                    Bay {selectedSlot.bay} • Row {selectedSlot.row}
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  Số lượng container hiện tại:{' '}
                  <strong className="text-teal-600 font-mono">
                    {blockContainers.filter((c) => Number(c.bayNo) === selectedSlot.bay && Number(c.rowNo) === selectedSlot.row).length} / {selectedBlock.maxTier} Tiers
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
                >
                  Đóng Chi Tiết
                </button>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('yard_map')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem Trên Bản Đồ 2D</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CARDS OVERVIEW (Tất cả các Block dạng Card Danh mục) */}
      {viewMode === 'CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {blocks.map((b) => {
            const occ = Math.round((b.occupiedCount / b.totalCapacity) * 100);
            const isSelected = b.blockCode === selectedBlockCode;
            const bRule = rules.find((r) => r.blockCode === b.blockCode);

            return (
              <div
                key={b.id}
                className={`p-6 bg-white rounded-3xl border transition flex flex-col justify-between space-y-4 shadow-xl ${
                  isSelected ? 'border-indigo-200 ring-1 ring-indigo-500/50' : 'border-slate-200 hover:border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black font-mono text-slate-900">BLOCK {formatBlockLabel(b.blockCode)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          b.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{b.blockName}</p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingBlock(b);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl border border-slate-200 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {b.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Tỷ Lệ Lấp Đầy:</span>
                    <span className="font-mono font-bold text-teal-600">{occ}%</span>
                  </div>
                  <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        occ > 85 ? 'bg-rose-500' : occ > 60 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, occ)}%` }}
                    />
                  </div>
                </div>

                {/* Spec details */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Cấu Trúc</span>
                    <strong className="font-mono text-slate-900 text-xs">{b.bayCount}B × {b.rowCount}R</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Tầng Max</span>
                    <strong className="font-mono text-teal-700 text-xs">{b.maxTier} Tiers</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Đang Chứa</span>
                    <strong className="font-mono text-sky-700 text-xs">{b.occupiedCount}/{b.totalCapacity}</strong>
                  </div>
                </div>

                {/* Rule summary */}
                {bRule && (
                  <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Hãng tàu ưu tiên:</span>
                      <strong className="text-slate-700">{bRule.preferredLines[0]}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Size & Loại:</span>
                      <strong className="text-slate-700">{bRule.allowedSizes.join('/')}FT • {bRule.allowedTypes.join('/')}</strong>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedBlockCode(b.blockCode);
                      setViewMode('MATRIX');
                    }}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Mở Ma Trận Bay/Row</span>
                  </button>
                  <button
                    onClick={() => handleToggleBlockStatus(b.id)}
                    className={`p-2 rounded-xl border cursor-pointer ${
                      b.status === 'ACTIVE'
                        ? 'bg-slate-50 text-slate-500 hover:text-rose-600 border-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                    title={b.status === 'ACTIVE' ? 'Khóa bảo trì' : 'Mở hoạt động'}
                  >
                    {b.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: ALLOCATION RULES & POLICIES */}
      {viewMode === 'RULES' && (
        <div className="space-y-4">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">CHÍNH SÁCH & NGUYÊN TẮC PHÂN BỔ BÃI (STACKING POLICIES)</h3>
                <p className="text-xs text-slate-500">
                  Thiết lập phân luồng hạ container tự động theo Hãng tàu, Kích cỡ ISO, Tải trọng & Điều kiện cắm điện
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => {
                const blk = blocks.find((b) => b.blockCode === rule.blockCode);
                return (
                  <div
                    key={rule.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-slate-200 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-indigo-600 text-white font-mono font-black text-sm rounded-xl">
                          BLOCK {formatBlockLabel(rule.blockCode)}
                        </span>
                        <span className="font-bold text-slate-700 text-sm">
                          {blk?.blockName || `Block ${formatBlockLabel(rule.blockCode)}`}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        Giới hạn tải trọng bãi: <strong className="text-amber-600">{rule.maxWeightTons} Tấn/Slot</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      <strong>Mục đích khai thác:</strong> {rule.priorityNote}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[10px]">Hãng Tàu Ưu Tiên</span>
                        <strong className="text-sky-700">{rule.preferredLines.join(', ')}</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[10px]">Kích Thước Hợp Chuẩn</span>
                        <strong className="text-teal-700">{rule.allowedSizes.join(', ')} Feet</strong>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[10px]">Chủng Loại Container</span>
                        <strong className="text-purple-700">{rule.allowedTypes.join(', ')}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit Block Modal */}
      {isEditModalOpen && editingBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in text-xs">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-200">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    CẤU HÌNH THÔNG SỐ BLOCK {formatBlockLabel(editingBlock.blockCode)}
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Điều chỉnh số lượng Bays, Rows, Tiers & Tên khu vực
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveBlock} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">
                  Tên Hiển Thị Block:
                </label>
                <input
                  type="text"
                  required
                  value={editingBlock.blockName}
                  onChange={(e) =>
                    setEditingBlock({ ...editingBlock, blockName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">
                  Mô Tả Khai Thác:
                </label>
                <textarea
                  rows={2}
                  value={editingBlock.description}
                  onChange={(e) =>
                    setEditingBlock({ ...editingBlock, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">
                    Số Bay (1-16):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    required
                    value={editingBlock.bayCount}
                    onChange={(e) => {
                      const bays = Number(e.target.value);
                      setEditingBlock({
                        ...editingBlock,
                        bayCount: bays,
                        totalCapacity: bays * editingBlock.rowCount * editingBlock.maxTier
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">
                    Số Row (1-8):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={editingBlock.rowCount}
                    onChange={(e) => {
                      const rows = Number(e.target.value);
                      setEditingBlock({
                        ...editingBlock,
                        rowCount: rows,
                        totalCapacity: editingBlock.bayCount * rows * editingBlock.maxTier
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">
                    Tầng Max Tier (1-6):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={editingBlock.maxTier}
                    onChange={(e) => {
                      const tiers = Number(e.target.value);
                      setEditingBlock({
                        ...editingBlock,
                        maxTier: tiers,
                        totalCapacity: editingBlock.bayCount * editingBlock.rowCount * tiers
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-teal-700"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Tổng sức chứa tính toán lại:</span>
                <strong className="font-mono text-base font-black text-indigo-600">
                  {editingBlock.bayCount * editingBlock.rowCount * editingBlock.maxTier} Slots TEU
                </strong>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-lg cursor-pointer"
                >
                  LƯU CẤU HÌNH
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
