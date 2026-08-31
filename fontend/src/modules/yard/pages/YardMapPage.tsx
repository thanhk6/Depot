import React, { useState, useEffect, useRef } from 'react';
import {
  YardZone,
  YardBlock,
  YardContainer,
  YardLocationEntity,
  Forklift,
  ForkliftDispatch,
  YardGateLane,
  YardStatistics,
  YardFilterState,
  YardMoveHistory
} from '../types/yardTypes';
import { yardApi, initialBlocks, initialZones, initialForklifts, initialContainers } from '../services/yardApi';
import { YardKPIHeader } from '../components/YardKPIHeader';
import { YardToolbar } from '../components/YardToolbar';
import { YardFilter } from '../components/YardFilter';
import { YardLegend } from '../components/YardLegend';
import { ContainerDetailPanel } from '../components/ContainerDetailPanel';
import { LocationDetailPanel } from '../components/LocationDetailPanel';
import { BlockDetailPanel } from '../components/BlockDetailPanel';
import { ForkliftDispatchModal } from '../components/ForkliftDispatchModal';
import { MoveContainerModal } from '../components/MoveContainerModal';
import { YardHistoryModal } from '../components/YardHistoryModal';
import { ZoneDetailModal } from '../components/ZoneDetailModal';
import { YardCanvasKonva } from '../components/canvas/YardCanvasKonva';
import { ContainerRecord } from '../../../services/mockDataStore';
import {
  Grid3X3,
  RefreshCw,
  Layers,
  MapPin,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface YardMapPageProps {
  containers?: ContainerRecord[];
  onSelectContainer?: (container: ContainerRecord) => void;
}

export const YardMapPage: React.FC<YardMapPageProps> = ({
  containers: initialAppContainers,
  onSelectContainer: onNavigateToContainerDetail
}) => {
  // State from API
  const [zones, setZones] = useState<YardZone[]>(initialZones);
  const [blocks, setBlocks] = useState<YardBlock[]>(initialBlocks);
  const [containers, setContainers] = useState<YardContainer[]>(initialContainers);
  const [forklifts, setForklifts] = useState<Forklift[]>(initialForklifts);
  const [dispatches, setDispatches] = useState<ForkliftDispatch[]>([]);
  const [gateLanes, setGateLanes] = useState<YardGateLane[]>([]);
  const [statistics, setStatistics] = useState<YardStatistics>({
    totalCapacity: 640,
    totalContainers: 13,
    availableSlots: 627,
    occupancyRate: 2.0,
    repairCount: 2,
    cleaningCount: 1,
    holdCount: 3,
    waitingGateInCount: 1,
    waitingGateOutCount: 1,
    activeForklifts: 3
  });
  const [histories, setHistories] = useState<YardMoveHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Canvas View Controls
  const [scale, setScale] = useState(0.85);
  const [stagePos, setStagePos] = useState({ x: 30, y: 20 });
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'DETAIL'>('OVERVIEW');
  const [showRoads, setShowRoads] = useState(true);
  const [showForklifts, setShowForklifts] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Inspector & Selection States
  const [selectedContainer, setSelectedContainer] = useState<YardContainer | null>(null);
  const [highlightedContainerId, setHighlightedContainerId] = useState<string | null>(null);
  const [selectedSlotLocation, setSelectedSlotLocation] = useState<{
    block: YardBlock;
    bayNo: number;
    rowNo: number;
  } | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<YardBlock | null>(null);
  const [selectedZone, setSelectedZone] = useState<YardZone | null>(null);

  // Modals
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [actionContainer, setActionContainer] = useState<YardContainer | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Filters State
  const [filters, setFilters] = useState<YardFilterState>({
    searchQuery: '',
    shippingLine: 'ALL',
    block: 'ALL',
    zone: 'ALL',
    size: 'ALL',
    type: 'ALL',
    status: 'ALL'
  });

  const fullScreenRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Yard Overview from API
  const loadYardData = async () => {
    setIsLoading(true);
    try {
      const data = await yardApi.getYardOverview();
      if (data) {
        if (Array.isArray(data.zones)) setZones(data.zones);
        if (Array.isArray(data.blocks)) setBlocks(data.blocks);
        if (Array.isArray(data.containers)) setContainers(data.containers);
        if (Array.isArray(data.forklifts)) setForklifts(data.forklifts);
        if (Array.isArray(data.dispatches)) setDispatches(data.dispatches);
        if (Array.isArray(data.gateLanes)) setGateLanes(data.gateLanes);
        if (data.statistics) setStatistics(data.statistics);
      }

      const h = await yardApi.getMoveHistories();
      if (Array.isArray(h)) setHistories(h);
    } catch {
      showToast('Không thể tải dữ liệu bãi từ server, đang dùng chế độ ngoại tuyến', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadYardData();
  }, []);

  // Search Container Handler
  const handleSearchSubmit = async () => {
    const q = filters.searchQuery.trim().toUpperCase();
    if (!q) return;

    const matched = containers.find(
      (c) =>
        c.containerNo.toUpperCase().includes(q) ||
        c.locationCode.toUpperCase() === q ||
        c.locationCode.toUpperCase().includes(q)
    );

    if (matched) {
      setHighlightedContainerId(matched.id);
      setSelectedContainer(matched);
      setSelectedSlotLocation(null);
      setSelectedBlock(null);

      // Find block position and zoom to it
      const blockCode = matched.locationCode.split('-')[0];
      const block = blocks.find((b) => b.blockCode === blockCode);
      if (block) {
        setScale(1.4);
        setStagePos({
          x: -(block.positionX * 1.4 - 300),
          y: -(block.positionY * 1.4 - 200)
        });
      }

      showToast(`Đã tìm thấy Container ${matched.containerNo} tại vị trí ${matched.locationCode}!`, 'success');
    } else {
      showToast(`Không tìm thấy Container hoặc Vị trí '${q}' trong sơ đồ bãi!`, 'error');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      shippingLine: 'ALL',
      block: 'ALL',
      zone: 'ALL',
      size: 'ALL',
      type: 'ALL',
      status: 'ALL'
    });
    setHighlightedContainerId(null);
  };

  // Zoom / Pan Actions
  const handleZoomIn = () => setScale((s) => Math.min(3.5, s + 0.2));
  const handleZoomOut = () => setScale((s) => Math.max(0.3, s - 0.2));
  const handleFitMap = () => {
    setScale(0.7);
    setStagePos({ x: 40, y: 20 });
    setViewMode('OVERVIEW');
  };
  const handleCenterMap = () => {
    setStagePos({ x: 60, y: 40 });
  };
  const handleResetView = () => {
    setScale(0.85);
    setStagePos({ x: 30, y: 20 });
    setViewMode('OVERVIEW');
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullScreenRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Selection handlers
  const handleSelectContainer = (cont: YardContainer) => {
    setSelectedContainer(cont);
    setHighlightedContainerId(cont.id);
    setSelectedSlotLocation(null);
    setSelectedBlock(null);
    setSelectedZone(null);
  };

  const handleSelectSlot = (block: YardBlock, bayNo: number, rowNo: number) => {
    setSelectedSlotLocation({ block, bayNo, rowNo });
    setSelectedContainer(null);
    setSelectedBlock(null);
    setSelectedZone(null);
  };

  const handleSelectBlock = (block: YardBlock) => {
    setSelectedBlock(block);
    setSelectedContainer(null);
    setSelectedSlotLocation(null);
    setSelectedZone(null);
  };

  const handleSelectZone = (zone: YardZone) => {
    setSelectedZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleFocusBlock = (block: YardBlock) => {
    setScale(1.3);
    setStagePos({
      x: -(block.positionX * 1.3 - 250),
      y: -(block.positionY * 1.3 - 150)
    });
    setViewMode('DETAIL');
  };

  // Movement & Dispatch operations
  const handleConfirmMove = async (payload: {
    containerId: string;
    targetLocation: string;
    reason: string;
  }) => {
    const res = await yardApi.moveContainer({
      ...payload,
      operatorName: 'Nguyễn Văn Hùng (Điều Độ Bãi)'
    });

    if (res.success) {
      showToast(res.message, 'success');
      loadYardData();
      if (res.container) {
        setSelectedContainer(res.container);
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleConfirmDispatch = async (payload: {
    forkliftId: string;
    containerId: string;
    targetLocation: string;
    priority: 'NORMAL' | 'URGENT' | 'HIGH';
  }) => {
    const res = await yardApi.dispatchForklift(payload);
    if (res.success) {
      showToast(res.message, 'success');
      loadYardData();
    } else {
      showToast(res.message, 'error');
    }
  };

  const uniqueShippingLines = Array.from(
    new Set(containers.map((c) => c.shippingLine))
  ).filter(Boolean);

  const blockOptions = blocks.map((b) => ({
    id: b.id,
    code: b.blockCode,
    name: b.blockName
  }));

  // Containers in selected slot
  const containersInSelectedSlot = selectedSlotLocation
    ? containers.filter(
        (c) =>
          (c.blockId === selectedSlotLocation.block.id ||
            c.locationCode.startsWith(`${selectedSlotLocation.block.blockCode}-`)) &&
          Number(c.bayNo) === selectedSlotLocation.bayNo &&
          Number(c.rowNo) === selectedSlotLocation.rowNo
      )
    : [];

  return (
    <div ref={fullScreenRef} className="space-y-4 text-slate-100 min-h-screen pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/95 border-rose-500 text-rose-200'
              : 'bg-slate-900/95 border-slate-700 text-slate-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-2xl">
            <Grid3X3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black tracking-tight text-white">
                SƠ ĐỒ BÃI CONTAINER 2D (YARD MAP 2D)
              </h2>
              <span className="px-2.5 py-0.5 bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-[10px] font-bold rounded-full">
                Interactive Konva Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bản đồ mặt bằng bãi Top-View vận hành trực quan: Block • Bay • Row • Tier • Gate • Sửa chữa • Vệ sinh • Xe nâng
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadYardData}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>LÀM MỚI BÃI</span>
          </button>
        </div>
      </div>

      {/* Industrial KPI Summary Header (8 cards) */}
      <YardKPIHeader
        statistics={statistics}
        onFilterStatus={(status) => {
          setFilters((f) => ({ ...f, status }));
        }}
      />

      {/* Multi-facet Filter Toolbar */}
      <YardFilter
        filters={filters}
        shippingLines={uniqueShippingLines}
        blocks={blockOptions}
        onFilterChange={setFilters}
        onSearchSubmit={handleSearchSubmit}
        onResetFilters={handleResetFilters}
      />

      {/* Map Action Toolbar */}
      <YardToolbar
        scale={scale}
        viewMode={viewMode}
        showRoads={showRoads}
        showForklifts={showForklifts}
        showHeatmap={showHeatmap}
        showLabels={showLabels}
        showGrid={showGrid}
        isFullscreen={isFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitMap={handleFitMap}
        onCenterMap={handleCenterMap}
        onResetView={handleResetView}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleRoads={() => setShowRoads(!showRoads)}
        onToggleForklifts={() => setShowForklifts(!showForklifts)}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        onToggleLabels={() => setShowLabels(!showLabels)}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onChangeViewMode={(mode) => setViewMode(mode)}
      />

      {/* Interactive Map Canvas Container + Side Detail Drawer */}
      <div className="relative flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Canvas Area */}
        <div className="flex-1 min-w-0">
          <YardCanvasKonva
            zones={zones}
            blocks={blocks}
            containers={containers}
            forklifts={forklifts}
            dispatches={dispatches}
            gateLanes={gateLanes}
            filters={filters}
            selectedContainer={selectedContainer}
            highlightedContainerId={highlightedContainerId}
            viewMode={viewMode}
            showRoads={showRoads}
            showForklifts={showForklifts}
            showHeatmap={showHeatmap}
            showLabels={showLabels}
            showGrid={showGrid}
            scale={scale}
            stagePos={stagePos}
            onScaleChange={setScale}
            onStagePosChange={setStagePos}
            onSelectContainer={handleSelectContainer}
            onSelectSlot={handleSelectSlot}
            onSelectBlock={handleSelectBlock}
            onSelectZone={handleSelectZone}
          />
        </div>

        {/* Right Inspector Side Panels (Conditional Display) */}
        {selectedContainer && (
          <ContainerDetailPanel
            container={selectedContainer}
            onClose={() => {
              setSelectedContainer(null);
              setHighlightedContainerId(null);
            }}
            onOpenMoveModal={(cont) => {
              setActionContainer(cont);
              setIsMoveModalOpen(true);
            }}
            onOpenDispatchModal={(cont) => {
              setActionContainer(cont);
              setIsDispatchModalOpen(true);
            }}
            onOpenHistoryModal={(cont) => {
              setActionContainer(cont);
              setIsHistoryModalOpen(true);
            }}
            onViewLifecycle={
              onNavigateToContainerDetail
                ? (cont) => {
                    const matchedRecord = initialAppContainers?.find(
                      (c) => c.containerNo === cont.containerNo || c.id === cont.id
                    );
                    if (matchedRecord) {
                      onNavigateToContainerDetail(matchedRecord);
                    }
                  }
                : undefined
            }
          />
        )}

        {selectedSlotLocation && (
          <LocationDetailPanel
            block={selectedSlotLocation.block}
            bayNo={selectedSlotLocation.bayNo}
            rowNo={selectedSlotLocation.rowNo}
            containersInSlot={containersInSelectedSlot}
            onClose={() => setSelectedSlotLocation(null)}
            onSelectContainer={handleSelectContainer}
            onOpenMoveModal={(cont) => {
              setActionContainer(cont);
              setIsMoveModalOpen(true);
            }}
            onOpenDispatchModal={(cont) => {
              setActionContainer(cont);
              setIsDispatchModalOpen(true);
            }}
            onPlaceContainer={(locCode) => {
              showToast(`Chọn chức năng Tiếp Nhận Gate-In hoặc Điều Chuyển vào ${locCode}`, 'info');
            }}
          />
        )}

        {selectedBlock && (
          <BlockDetailPanel
            block={selectedBlock}
            onClose={() => setSelectedBlock(null)}
            onFocusBlock={handleFocusBlock}
          />
        )}
      </div>

      {/* Legend & Shortcuts Bar */}
      <YardLegend />

      {/* Modals */}
      <ForkliftDispatchModal
        container={actionContainer}
        forklifts={forklifts}
        blocks={blocks}
        isOpen={isDispatchModalOpen}
        onClose={() => {
          setIsDispatchModalOpen(false);
          setActionContainer(null);
        }}
        onConfirmDispatch={handleConfirmDispatch}
      />

      <MoveContainerModal
        container={actionContainer}
        blocks={blocks}
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setActionContainer(null);
        }}
        onConfirmMove={handleConfirmMove}
      />

      <YardHistoryModal
        container={actionContainer}
        histories={histories}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setActionContainer(null);
        }}
      />

      <ZoneDetailModal
        zone={selectedZone}
        containersInZone={
          selectedZone
            ? containers.filter((c) => {
                if (selectedZone.zoneType === 'REPAIR') return c.status === 'REPAIR';
                if (selectedZone.zoneType === 'CLEANING') return c.status === 'CLEANING';
                if (selectedZone.zoneType === 'HOLD') return c.status === 'HOLD';
                if (selectedZone.zoneType === 'STAGING')
                  return c.status === 'WAITING_GATE_OUT' || c.blockId === 'STAGING';
                return false;
              })
            : []
        }
        isOpen={isZoneModalOpen}
        onClose={() => {
          setIsZoneModalOpen(false);
          setSelectedZone(null);
        }}
        onSelectContainer={handleSelectContainer}
      />
    </div>
  );
};
