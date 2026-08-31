import React, { useRef, useState, useEffect } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Text,
  Group,
  Line,
  Circle,
  Path
} from 'react-konva';
import Konva from 'konva';
import {
  YardZone,
  YardBlock,
  YardContainer,
  Forklift,
  ForkliftDispatch,
  YardGateLane,
  YardFilterState
} from '../../types/yardTypes';
import {
  STATUS_COLORS,
  ZONE_TYPE_CONFIG,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  CELL_WIDTH,
  CELL_HEIGHT,
  CELL_GAP,
  BAY_LABEL_HEIGHT,
  ROW_LABEL_WIDTH
} from '../../constants/yardConstants';
import { getCellPosition, calculateBlockDimensions } from '../../utils/yardUtils';

interface YardCanvasKonvaProps {
  zones: YardZone[];
  blocks: YardBlock[];
  containers: YardContainer[];
  forklifts: Forklift[];
  dispatches: ForkliftDispatch[];
  gateLanes: YardGateLane[];
  filters: YardFilterState;
  selectedContainer: YardContainer | null;
  highlightedContainerId: string | null;
  viewMode: 'OVERVIEW' | 'DETAIL';
  showRoads: boolean;
  showForklifts: boolean;
  showHeatmap: boolean;
  showLabels: boolean;
  showGrid: boolean;
  scale: number;
  stagePos: { x: number; y: number };
  onScaleChange: (scale: number) => void;
  onStagePosChange: (pos: { x: number; y: number }) => void;
  onSelectContainer: (container: YardContainer) => void;
  onSelectSlot: (block: YardBlock, bayNo: number, rowNo: number) => void;
  onSelectBlock: (block: YardBlock) => void;
  onSelectZone: (zone: YardZone) => void;
}

export const YardCanvasKonva: React.FC<YardCanvasKonvaProps> = ({
  zones = [],
  blocks = [],
  containers = [],
  forklifts = [],
  dispatches = [],
  gateLanes = [],
  filters,
  selectedContainer,
  highlightedContainerId,
  viewMode,
  showRoads,
  showForklifts,
  showHeatmap,
  showLabels,
  showGrid,
  scale,
  stagePos,
  onScaleChange,
  onStagePosChange,
  onSelectContainer,
  onSelectSlot,
  onSelectBlock,
  onSelectZone
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 750 });
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [pulseOpacity, setPulseOpacity] = useState(1);

  // Resize listener
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth || 1200,
          height: containerRef.current.offsetHeight || 750
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Pulsing animation for searched container highlight
  useEffect(() => {
    if (!highlightedContainerId) return;
    const interval = setInterval(() => {
      setPulseOpacity((prev) => (prev > 0.4 ? 0.3 : 1));
    }, 400);
    return () => clearInterval(interval);
  }, [highlightedContainerId]);

  // Handle Wheel Zoom (Smooth centered zooming)
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.25, Math.min(3.5, newScale));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale
    };

    onScaleChange(clampedScale);
    onStagePosChange(newPos);
  };

  // Helper to check if a container matches current filters
  const matchesFilter = (c: YardContainer) => {
    if (filters.shippingLine !== 'ALL' && c.shippingLine !== filters.shippingLine) return false;
    if (filters.status !== 'ALL' && c.status !== filters.status) return false;
    if (filters.size !== 'ALL' && c.size !== filters.size) return false;
    if (filters.type !== 'ALL' && c.type !== filters.type) return false;
    if (filters.block !== 'ALL' && c.blockId !== `BLOCK_${filters.block}` && c.locationCode.split('-')[0] !== filters.block) return false;
    return true;
  };

  // Main Road path definitions
  const mainRoadSegments = [
    // Top Gate-in to Gate-out connecting corridor
    { x1: 50, y1: 270, x2: 1980, y2: 270, width: 80 },
    // Horizontal corridor between Top blocks (A, B, C) and Bottom blocks (D, E, Staging)
    { x1: 50, y1: 800, x2: 1720, y2: 800, width: 50 },
    // Vertical corridor connecting Gate-In / Block A to Block D
    { x1: 580, y1: 270, x2: 580, y2: 1250, width: 40 },
    // Vertical corridor connecting Block B to Block E
    { x1: 1150, y1: 270, x2: 1150, y2: 1250, width: 40 },
    // Vertical corridor connecting Block C to Repair/Cleaning
    { x1: 1720, y1: 270, x2: 1720, y2: 1250, width: 40 }
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[650px] lg:h-[750px] bg-[#0b1120] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl cursor-grab active:cursor-grabbing select-none"
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={(e) => {
          onStagePosChange({ x: e.target.x(), y: e.target.y() });
        }}
      >
        {/* Layer 1: Depot Base Surface, Grid & Road Infrastructure */}
        <Layer>
          {/* Depot Perimeter Asphalt Background */}
          <Rect
            x={0}
            y={0}
            width={DEFAULT_CANVAS_WIDTH}
            height={DEFAULT_CANVAS_HEIGHT}
            fill="#090d16"
            stroke="#1e293b"
            strokeWidth={4}
            cornerRadius={24}
          />

          {/* Background Grid Lines */}
          {showGrid && (
            <Group opacity={0.15}>
              {Array.from({ length: Math.ceil(DEFAULT_CANVAS_WIDTH / 80) }).map((_, i) => (
                <Line
                  key={`vg-${i}`}
                  points={[i * 80, 0, i * 80, DEFAULT_CANVAS_HEIGHT]}
                  stroke="#38bdf8"
                  strokeWidth={1}
                />
              ))}
              {Array.from({ length: Math.ceil(DEFAULT_CANVAS_HEIGHT / 80) }).map((_, i) => (
                <Line
                  key={`hg-${i}`}
                  points={[0, i * 80, DEFAULT_CANVAS_WIDTH, i * 80]}
                  stroke="#38bdf8"
                  strokeWidth={1}
                />
              ))}
            </Group>
          )}

          {/* Road Network Layer */}
          {showRoads && (
            <Group>
              {mainRoadSegments.map((road, idx) => (
                <Group key={`road-${idx}`}>
                  {/* Asphalt fill */}
                  <Line
                    points={[road.x1, road.y1, road.x2, road.y2]}
                    stroke="#1e293b"
                    strokeWidth={road.width}
                    lineCap="round"
                    lineJoin="round"
                  />
                  {/* Yellow Center Dashed Divider */}
                  <Line
                    points={[road.x1, road.y1, road.x2, road.y2]}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dash={[16, 12]}
                    opacity={0.7}
                  />
                </Group>
              ))}

              {/* Main Road Label */}
              <Group x={750} y={262}>
                <Rect
                  x={-80}
                  y={-12}
                  width={160}
                  height={24}
                  fill="#020617"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  cornerRadius={6}
                />
                <Text
                  text="MAIN ROAD - TUYẾN CHÍNH XE NÂNG"
                  fontSize={9}
                  fontFamily="monospace"
                  fontStyle="bold"
                  fill="#fbbf24"
                  align="center"
                  width={160}
                  x={-80}
                  y={-5}
                />
              </Group>
            </Group>
          )}
        </Layer>

        {/* Layer 2: Functional Zones (Gate-In, Gate-Out, Inspection, Repair, Cleaning, Hold, Staging) */}
        <Layer>
          {zones.map((zone) => {
            const config = ZONE_TYPE_CONFIG[zone.zoneType] || ZONE_TYPE_CONFIG.STORAGE;
            const isStorage = zone.zoneType === 'STORAGE';
            if (isStorage) return null; // Storage rendered as Blocks in Layer 3

            const zoneConts = containers.filter((c) => {
              if (zone.zoneType === 'REPAIR') return c.status === 'REPAIR';
              if (zone.zoneType === 'CLEANING') return c.status === 'CLEANING';
              if (zone.zoneType === 'HOLD') return c.status === 'HOLD';
              if (zone.zoneType === 'STAGING') return c.status === 'WAITING_GATE_OUT' || c.blockId === 'STAGING';
              return false;
            });

            return (
              <Group
                key={zone.id}
                x={zone.positionX}
                y={zone.positionY}
                onClick={() => onSelectZone(zone)}
                onTap={() => onSelectZone(zone)}
              >
                {/* Zone Area Background */}
                <Rect
                  x={0}
                  y={0}
                  width={zone.width}
                  height={zone.height}
                  fill={config.fillHex}
                  opacity={0.4}
                  stroke={config.strokeHex}
                  strokeWidth={2}
                  cornerRadius={16}
                  dash={zone.zoneType === 'HOLD' ? [10, 6] : undefined}
                />

                {/* Zone Header Badge */}
                <Group x={12} y={12}>
                  <Rect
                    x={0}
                    y={0}
                    width={zone.width - 24}
                    height={26}
                    fill="#0f172a"
                    stroke={config.strokeHex}
                    strokeWidth={1}
                    cornerRadius={8}
                  />
                  <Text
                    text={zone.zoneName}
                    x={10}
                    y={8}
                    fontSize={10}
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    fill="#f8fafc"
                  />
                  <Text
                    text={`${zoneConts.length} CONT`}
                    x={zone.width - 80}
                    y={8}
                    fontSize={9}
                    fontFamily="monospace"
                    fontStyle="bold"
                    fill="#38bdf8"
                  />
                </Group>

                {/* Zone Subtitle / Description */}
                {zone.description && (
                  <Text
                    text={zone.description}
                    x={14}
                    y={44}
                    fontSize={9}
                    fontFamily="sans-serif"
                    fill="#94a3b8"
                    width={zone.width - 28}
                  />
                )}

                {/* Gate Lanes Rendering for Gate-In & Gate-Out */}
                {zone.zoneType === 'GATE_IN' && (
                  <Group x={12} y={70}>
                    {gateLanes
                      .filter((l) => l.gateType === 'IN')
                      .map((lane, i) => (
                        <Group key={lane.id} y={i * 32}>
                          <Rect
                            x={0}
                            y={0}
                            width={zone.width - 24}
                            height={26}
                            fill={lane.status === 'BUSY' ? '#1e1b4b' : '#0f172a'}
                            stroke="#3b82f6"
                            strokeWidth={1}
                            cornerRadius={6}
                          />
                          <Text
                            text={`LÀN ${lane.laneNo}: ${lane.laneName.split(' ')[2] || ''} [${lane.status}]`}
                            x={8}
                            y={8}
                            fontSize={9}
                            fontFamily="monospace"
                            fontStyle="bold"
                            fill={lane.status === 'BUSY' ? '#93c5fd' : '#e2e8f0'}
                          />
                          {lane.currentTruckPlate && (
                            <Text
                              text={`🚚 ${lane.currentTruckPlate}`}
                              x={zone.width - 120}
                              y={8}
                              fontSize={9}
                              fontFamily="monospace"
                              fill="#facc15"
                            />
                          )}
                        </Group>
                      ))}
                  </Group>
                )}

                {zone.zoneType === 'GATE_OUT' && (
                  <Group x={12} y={70}>
                    {gateLanes
                      .filter((l) => l.gateType === 'OUT')
                      .map((lane, i) => (
                        <Group key={lane.id} y={i * 42}>
                          <Rect
                            x={0}
                            y={0}
                            width={zone.width - 24}
                            height={34}
                            fill={lane.status === 'BUSY' ? '#064e3b' : '#0f172a'}
                            stroke="#10b981"
                            strokeWidth={1}
                            cornerRadius={6}
                          />
                          <Text
                            text={`LÀN ${lane.laneNo} XUẤT [${lane.status}]`}
                            x={8}
                            y={11}
                            fontSize={9}
                            fontFamily="monospace"
                            fontStyle="bold"
                            fill="#a7f3d0"
                          />
                          {lane.currentTruckPlate && (
                            <Text
                              text={`🚚 ${lane.currentTruckPlate} (${lane.currentContainerNo || ''})`}
                              x={110}
                              y={11}
                              fontSize={8}
                              fontFamily="monospace"
                              fill="#facc15"
                            />
                          )}
                        </Group>
                      ))}
                  </Group>
                )}

                {/* Staged Containers in Functional Area */}
                {(zone.zoneType === 'REPAIR' ||
                  zone.zoneType === 'CLEANING' ||
                  zone.zoneType === 'HOLD' ||
                  zone.zoneType === 'STAGING') && (
                  <Group x={12} y={75}>
                    {zoneConts.slice(0, 6).map((cont, i) => {
                      const col = i % 3;
                      const row = Math.floor(i / 3);
                      const statusConf = STATUS_COLORS[cont.status] || STATUS_COLORS.AVAILABLE;
                      const isHighlighted = highlightedContainerId === cont.id || highlightedContainerId === cont.containerNo;

                      return (
                        <Group
                          key={cont.id}
                          x={col * 116}
                          y={row * 50}
                          onClick={(e) => {
                            e.cancelBubble = true;
                            onSelectContainer(cont);
                          }}
                          onTap={(e) => {
                            e.cancelBubble = true;
                            onSelectContainer(cont);
                          }}
                        >
                          <Rect
                            x={0}
                            y={0}
                            width={110}
                            height={42}
                            fill={statusConf.fillHex}
                            stroke={isHighlighted ? '#38bdf8' : statusConf.strokeHex}
                            strokeWidth={isHighlighted ? 3 : 1}
                            cornerRadius={6}
                            shadowColor="#000"
                            shadowBlur={4}
                            shadowOpacity={0.4}
                          />
                          <Text
                            text={cont.containerNo}
                            x={6}
                            y={6}
                            fontSize={9}
                            fontFamily="monospace"
                            fontStyle="bold"
                            fill="#ffffff"
                          />
                          <Text
                            text={`${cont.isoType} • ${cont.shippingLine.split(' ')[0]}`}
                            x={6}
                            y={18}
                            fontSize={8}
                            fontFamily="sans-serif"
                            fill="#f1f5f9"
                          />
                          <Text
                            text={cont.status}
                            x={6}
                            y={29}
                            fontSize={7}
                            fontFamily="monospace"
                            fontStyle="bold"
                            fill="#fef08a"
                          />
                        </Group>
                      );
                    })}
                  </Group>
                )}
              </Group>
            );
          })}
        </Layer>

        {/* Layer 3: Storage Blocks, Bays, Rows, and Container Slots */}
        <Layer>
          {blocks.map((block) => {
            const { width, height } = calculateBlockDimensions(block.bayCount, block.rowCount);
            const occupancyRate =
              block.totalCapacity > 0
                ? Math.round((block.occupiedCount / block.totalCapacity) * 100)
                : 0;

            return (
              <Group
                key={block.id}
                x={block.positionX}
                y={block.positionY}
              >
                {/* Block Container Surface Background */}
                <Rect
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth={2}
                  cornerRadius={16}
                  shadowColor="#000000"
                  shadowBlur={12}
                  shadowOpacity={0.5}
                />

                {/* Block Header Bar */}
                <Group
                  x={8}
                  y={6}
                  onClick={() => onSelectBlock(block)}
                  onTap={() => onSelectBlock(block)}
                >
                  <Rect
                    x={0}
                    y={0}
                    width={width - 16}
                    height={22}
                    fill="#1e293b"
                    cornerRadius={6}
                  />
                  <Text
                    text={`BLOCK ${block.blockCode}: ${block.blockName}`}
                    x={8}
                    y={5}
                    fontSize={10}
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    fill="#e2e8f0"
                  />
                  <Text
                    text={`${occupancyRate}% [${block.occupiedCount}/${block.totalCapacity}]`}
                    x={width - 110}
                    y={5}
                    fontSize={9}
                    fontFamily="monospace"
                    fontStyle="bold"
                    fill={occupancyRate > 80 ? '#f87171' : '#34d399'}
                  />
                </Group>

                {/* Bay Header Column Labels (Bay 01, Bay 02, ...) */}
                {Array.from({ length: block.bayCount }, (_, bayIdx) => {
                  const bayNo = bayIdx + 1;
                  const x = ROW_LABEL_WIDTH + 12 + bayIdx * (CELL_WIDTH + CELL_GAP);
                  return (
                    <Group key={`bay-lbl-${bayNo}`} x={x} y={32}>
                      <Rect
                        x={0}
                        y={0}
                        width={CELL_WIDTH}
                        height={16}
                        fill="#1e293b"
                        cornerRadius={4}
                      />
                      <Text
                        text={`B${String(bayNo).padStart(2, '0')}`}
                        x={0}
                        y={3}
                        width={CELL_WIDTH}
                        align="center"
                        fontSize={8}
                        fontFamily="monospace"
                        fontStyle="bold"
                        fill="#94a3b8"
                      />
                    </Group>
                  );
                })}

                {/* Row Header Row Labels (Row 01, Row 02, ...) & Grid Slots */}
                {Array.from({ length: block.rowCount }, (_, rowIdx) => {
                  const rowNo = rowIdx + 1;
                  const y = BAY_LABEL_HEIGHT + 32 + rowIdx * (CELL_HEIGHT + CELL_GAP);

                  return (
                    <Group key={`row-${rowNo}`}>
                      {/* Row Label */}
                      <Group x={8} y={y}>
                        <Rect
                          x={0}
                          y={0}
                          width={ROW_LABEL_WIDTH}
                          height={CELL_HEIGHT}
                          fill="#1e293b"
                          cornerRadius={4}
                        />
                        <Text
                          text={`R${String(rowNo).padStart(2, '0')}`}
                          x={0}
                          y={9}
                          width={ROW_LABEL_WIDTH}
                          align="center"
                          fontSize={8}
                          fontFamily="monospace"
                          fontStyle="bold"
                          fill="#94a3b8"
                        />
                      </Group>

                      {/* Bay Slots in this row */}
                      {Array.from({ length: block.bayCount }, (_, bayIdx) => {
                        const bayNo = bayIdx + 1;
                        const x = ROW_LABEL_WIDTH + 12 + bayIdx * (CELL_WIDTH + CELL_GAP);
                        const slotCode = `${block.blockCode}-${String(bayNo).padStart(2, '0')}-${String(rowNo).padStart(2, '0')}`;

                        // Find containers at this (Block, Bay, Row)
                        const cellConts = containers.filter(
                          (c) =>
                            (c.blockId === block.id || c.locationCode.startsWith(`${block.blockCode}-`)) &&
                            Number(c.bayNo) === bayNo &&
                            Number(c.rowNo) === rowNo
                        );

                        const topCont = cellConts.sort((a, b) => Number(b.tierNo) - Number(a.tierNo))[0];
                        const isOccupied = cellConts.length > 0;
                        const statusConf = topCont ? STATUS_COLORS[topCont.status] : STATUS_COLORS.EMPTY_SLOT;
                        const isSelected = selectedContainer && cellConts.some((c) => c.id === selectedContainer.id);
                        const isHighlighted = highlightedContainerId && cellConts.some((c) => c.id === highlightedContainerId || c.containerNo === highlightedContainerId);
                        const isHovered = hoveredSlot === slotCode;

                        return (
                          <Group
                            key={`slot-${slotCode}`}
                            x={x}
                            y={y}
                            onClick={() => {
                              if (topCont) {
                                onSelectContainer(topCont);
                              } else {
                                onSelectSlot(block, bayNo, rowNo);
                              }
                            }}
                            onTap={() => {
                              if (topCont) {
                                onSelectContainer(topCont);
                              } else {
                                onSelectSlot(block, bayNo, rowNo);
                              }
                            }}
                            onMouseEnter={() => setHoveredSlot(slotCode)}
                            onMouseLeave={() => setHoveredSlot(null)}
                          >
                            {/* Slot Background Rectangle */}
                            <Rect
                              x={0}
                              y={0}
                              width={CELL_WIDTH}
                              height={CELL_HEIGHT}
                              fill={
                                isOccupied
                                  ? showHeatmap
                                    ? cellConts.length >= 3
                                      ? '#e11d48'
                                      : cellConts.length === 2
                                      ? '#f59e0b'
                                      : '#10b981'
                                    : statusConf.fillHex
                                  : isHovered
                                  ? '#1e293b'
                                  : '#090d16'
                              }
                              stroke={
                                isHighlighted
                                  ? '#38bdf8'
                                  : isSelected
                                  ? '#2dd4bf'
                                  : isHovered
                                  ? '#94a3b8'
                                  : isOccupied
                                  ? statusConf.strokeHex
                                  : '#1e293b'
                              }
                              strokeWidth={isHighlighted ? 3 : isSelected ? 2 : 1}
                              cornerRadius={4}
                              shadowColor="#000"
                              shadowBlur={isOccupied ? 2 : 0}
                              shadowOpacity={0.3}
                            />

                            {/* Pulsing highlight effect when searched */}
                            {isHighlighted && (
                              <Rect
                                x={-3}
                                y={-3}
                                width={CELL_WIDTH + 6}
                                height={CELL_HEIGHT + 6}
                                stroke="#38bdf8"
                                strokeWidth={2}
                                cornerRadius={6}
                                opacity={pulseOpacity}
                              />
                            )}

                            {/* Slot Content */}
                            {isOccupied && topCont ? (
                              <Group>
                                {/* Zoom Scale Threshold: Detail View shows full text, Overview shows compact */}
                                {scale >= 0.75 || viewMode === 'DETAIL' ? (
                                  <>
                                    {/* Top: Container No Prefix */}
                                    <Text
                                      text={topCont.containerNo.substring(0, 7)}
                                      x={2}
                                      y={2}
                                      width={CELL_WIDTH - 4}
                                      fontSize={7}
                                      fontFamily="monospace"
                                      fontStyle="bold"
                                      fill="#ffffff"
                                      ellipsis
                                    />
                                    {/* Middle: Size & ISO */}
                                    <Text
                                      text={`${topCont.size} • ${topCont.condition}`}
                                      x={2}
                                      y={11}
                                      width={CELL_WIDTH - 4}
                                      fontSize={6.5}
                                      fontFamily="monospace"
                                      fill="#e2e8f0"
                                    />
                                    {/* Bottom: Line & Tier count badge */}
                                    <Text
                                      text={topCont.shippingLine.split(' ')[0]}
                                      x={2}
                                      y={19}
                                      width={CELL_WIDTH - 14}
                                      fontSize={6}
                                      fontFamily="sans-serif"
                                      fill="#fef08a"
                                      ellipsis
                                    />
                                    {/* Tier Stack count badge */}
                                    {cellConts.length > 1 && (
                                      <Group x={CELL_WIDTH - 12} y={17}>
                                        <Rect
                                          x={0}
                                          y={0}
                                          width={10}
                                          height={10}
                                          fill="#0f172a"
                                          cornerRadius={3}
                                        />
                                        <Text
                                          text={`T${topCont.tierNo}`}
                                          x={0}
                                          y={1}
                                          width={10}
                                          align="center"
                                          fontSize={6}
                                          fontFamily="monospace"
                                          fontStyle="bold"
                                          fill="#38bdf8"
                                        />
                                      </Group>
                                    )}
                                  </>
                                ) : (
                                  // Simplified Overview Mode Label
                                  <Text
                                    text={topCont.containerNo.substring(0, 4)}
                                    x={0}
                                    y={CELL_HEIGHT / 2 - 4}
                                    width={CELL_WIDTH}
                                    align="center"
                                    fontSize={7}
                                    fontFamily="monospace"
                                    fontStyle="bold"
                                    fill="#ffffff"
                                  />
                                )}
                              </Group>
                            ) : (
                              // Empty Slot indicator (subtle cross or dot)
                              <Circle
                                x={CELL_WIDTH / 2}
                                y={CELL_HEIGHT / 2}
                                radius={1.5}
                                fill="#334155"
                              />
                            )}
                          </Group>
                        );
                      })}
                    </Group>
                  );
                })}
              </Group>
            );
          })}
        </Layer>

        {/* Layer 4: Forklifts & Animated Movement Trajectories */}
        {showForklifts && (
          <Layer>
            {/* Dispatched route lines */}
            {dispatches
              .filter((d) => d.status === 'MOVING')
              .map((disp) => {
                const fl = forklifts.find((f) => f.id === disp.forkliftId);
                if (!fl) return null;
                const startX = fl.positionX;
                const startY = fl.positionY;
                const targetX = fl.targetPositionX || startX + 250;
                const targetY = fl.targetPositionY || startY;

                return (
                  <Group key={disp.id}>
                    {/* Animated dashed path line */}
                    <Line
                      points={[startX, startY, targetX, targetY]}
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dash={[10, 6]}
                      opacity={0.8}
                    />
                    {/* Destination marker circle */}
                    <Circle
                      x={targetX}
                      y={targetY}
                      radius={8}
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  </Group>
                );
              })}

            {/* Active Forklifts on Map */}
            {forklifts.map((fl) => {
              const isMoving = fl.status === 'MOVING';
              return (
                <Group
                  key={fl.id}
                  x={fl.positionX}
                  y={fl.positionY}
                  draggable
                  onDragEnd={(e) => {
                    fl.positionX = e.target.x();
                    fl.positionY = e.target.y();
                  }}
                >
                  {/* Forklift Vehicle Marker */}
                  <Rect
                    x={-18}
                    y={-14}
                    width={36}
                    height={28}
                    fill={isMoving ? '#d97706' : '#ca8a04'}
                    stroke="#ffffff"
                    strokeWidth={2}
                    cornerRadius={6}
                    shadowColor="#000"
                    shadowBlur={8}
                    shadowOpacity={0.6}
                  />

                  {/* Forklift glyph / text */}
                  <Text
                    text="🚜"
                    x={-8}
                    y={-10}
                    fontSize={14}
                  />

                  {/* Forklift Code Badge */}
                  <Group y={18}>
                    <Rect
                      x={-24}
                      y={0}
                      width={48}
                      height={14}
                      fill="#0f172a"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      cornerRadius={4}
                    />
                    <Text
                      text={fl.code}
                      x={-24}
                      y={2}
                      width={48}
                      align="center"
                      fontSize={7.5}
                      fontFamily="monospace"
                      fontStyle="bold"
                      fill="#fef08a"
                    />
                  </Group>
                </Group>
              );
            })}
          </Layer>
        )}
      </Stage>
    </div>
  );
};
