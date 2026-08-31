import { YardContainer, YardBlock, YardLocationCoord, YardLocationEntity, ContainerStatus } from '../types/yardTypes';
import { STATUS_COLORS, CELL_WIDTH, CELL_HEIGHT, CELL_GAP, ROW_LABEL_WIDTH, BAY_LABEL_HEIGHT } from '../constants/yardConstants';

export function parsePositionCode(code?: string): YardLocationCoord | null {
  if (!code) return null;
  const parts = code.trim().toUpperCase().split('-');
  if (parts.length >= 4) {
    return {
      block: parts[0],
      bay: parts[1],
      row: parts[2],
      tier: parts[3]
    };
  }
  if (parts.length === 3) {
    return {
      block: parts[0],
      bay: parts[1],
      row: parts[2],
      tier: '01'
    };
  }
  return null;
}

export function formatPositionCode(block: string, bay: number | string, row: number | string, tier: number | string): string {
  const bStr = block.replace('BLOCK_', '').trim().toUpperCase();
  const bayStr = String(bay).padStart(2, '0');
  const rowStr = String(row).padStart(2, '0');
  const tierStr = String(tier).padStart(2, '0');
  return `${bStr}-${bayStr}-${rowStr}-${tierStr}`;
}

export function formatBayRowKey(block: string, bay: number | string, row: number | string): string {
  const bStr = block.replace('BLOCK_', '').trim().toUpperCase();
  const bayStr = String(bay).padStart(2, '0');
  const rowStr = String(row).padStart(2, '0');
  return `${bStr}-${bayStr}-${rowStr}`;
}

export function getStatusColor(status: ContainerStatus) {
  return STATUS_COLORS[status] || STATUS_COLORS.AVAILABLE;
}

export function calculateBlockDimensions(bayCount: number, rowCount: number) {
  const innerWidth = bayCount * (CELL_WIDTH + CELL_GAP) - CELL_GAP;
  const innerHeight = rowCount * (CELL_HEIGHT + CELL_GAP) - CELL_GAP;
  const width = innerWidth + ROW_LABEL_WIDTH + 24;
  const height = innerHeight + BAY_LABEL_HEIGHT + 36;
  return { width, height, innerWidth, innerHeight };
}

export function getCellPosition(
  blockX: number,
  blockY: number,
  bayIndex: number,
  rowIndex: number
) {
  const x = blockX + ROW_LABEL_WIDTH + 12 + bayIndex * (CELL_WIDTH + CELL_GAP);
  const y = blockY + BAY_LABEL_HEIGHT + 24 + rowIndex * (CELL_HEIGHT + CELL_GAP);
  return { x, y, width: CELL_WIDTH, height: CELL_HEIGHT };
}

export function calculateForkliftWaypoints(
  startX: number,
  startY: number,
  destX: number,
  destY: number,
  mainRoadY: number = 340
): { x: number; y: number }[] {
  // Path planning: Start -> Move out to Main Road -> Traverse Main Road horizontally -> Move into Destination
  const waypoints: { x: number; y: number }[] = [
    { x: startX, y: startY },
    { x: startX, y: mainRoadY },
    { x: destX, y: mainRoadY },
    { x: destX, y: destY }
  ];
  return waypoints;
}

export function buildTierStack(
  maxTier: number,
  containersInSlot: YardContainer[]
): { tierNo: number; container: YardContainer | null; isOccupied: boolean }[] {
  const stack = [];
  for (let t = maxTier; t >= 1; t--) {
    const cont = containersInSlot.find((c) => Number(c.tierNo) === t) || null;
    stack.push({
      tierNo: t,
      container: cont,
      isOccupied: Boolean(cont)
    });
  }
  return stack;
}
