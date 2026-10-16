import { rootApiClient as axios } from '../../../api/axios';
import {
  YardZone,
  YardBlock,
  YardContainer,
  YardLocationEntity,
  Forklift,
  ForkliftDispatch,
  YardMoveHistory,
  YardStatistics,
  YardGateLane
} from '../types/yardTypes';

const API_BASE = '/api/yard';

export interface YardFullResponse {
  zones: YardZone[];
  blocks: YardBlock[];
  containers: YardContainer[];
  locations: YardLocationEntity[];
  forklifts: Forklift[];
  dispatches: ForkliftDispatch[];
  gateLanes: YardGateLane[];
  statistics: YardStatistics;
}

// Chuyển đổi Status thật của DepotJob (GATE_IN/SURVEYING/ESTIMATING/REPAIRING/READY_FOR_OUT/GATE_OUT/PAID...)
// sang ContainerStatus hiển thị trên sơ đồ bãi 2D — bảng màu hiển thị chỉ có 1 nhóm nhãn cố định,
// trong khi nghiệp vụ có nhiều trạng thái chi tiết hơn, nên đây là quy đổi hiển thị (không đổi dữ liệu gốc).
function mapJobStatusToContainerStatus(jobStatus: string, condition: string): YardContainer['status'] {
  if (condition === 'CL') return 'CLEANING';
  switch (jobStatus) {
    case 'REPAIRING':
      return 'REPAIR';
    case 'GATE_IN':
      return 'WAITING_GATE_IN';
    case 'READY_FOR_OUT':
      return 'WAITING_GATE_OUT';
    case 'GATE_OUT':
      return 'GATE_OUT_COMPLETED';
    default:
      return 'IN_YARD';
  }
}

function mapContainerDto(dto: any): YardContainer {
  return {
    id: dto.id,
    containerNo: dto.containerNo,
    isoType: dto.isoType,
    size: (dto.isoType || '').startsWith('20') ? '20' : (dto.isoType || '').startsWith('45') ? '45' : '40',
    type: (dto.isoType || '').includes('R') ? 'REEFER' : 'DRY',
    shippingLine: dto.shippingLine || '',
    condition: dto.condition,
    status: mapJobStatusToContainerStatus(dto.status, dto.condition),
    locationCode: dto.locationCode,
    blockId: dto.blockId,
    bayNo: dto.bayNo,
    rowNo: dto.rowNo,
    tierNo: dto.tierNo,
    tareWeightKg: dto.tareWeightKg,
    maxPayloadKg: dto.maxPayloadKg,
    gateInDate: dto.gateInDate,
    notes: dto.notes || undefined
  };
}

function mapMoveHistoryDto(dto: any): YardMoveHistory {
  return {
    id: String(dto.id),
    containerId: dto.containerNo,
    containerNo: dto.containerNo,
    fromLocation: dto.fromLocation,
    toLocation: dto.toLocation,
    moveDate: dto.moveDate,
    forkliftId: dto.forkliftCode || '',
    forkliftCode: dto.forkliftCode || '',
    userId: dto.performedBy || '',
    userName: dto.performedBy || 'Điều Độ Bãi',
    reason: dto.reason || ''
  };
}

export const yardApi = {
  async getPositions(): Promise<any[]> {
    try {
      const res = await axios.get(`${API_BASE}`);
      const payload = res.data?.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.positions)) return payload.positions;
      if (payload && Array.isArray(payload.locations)) return payload.locations;
      return [];
    } catch {
      return [];
    }
  },

  async getYardOverview(): Promise<YardFullResponse> {
    const res = await axios.get(`${API_BASE}/overview`);
    const data = res.data?.data;
    return {
      zones: data?.zones || [],
      blocks: data?.blocks || [],
      containers: (data?.containers || []).map(mapContainerDto),
      locations: data?.locations || [],
      forklifts: data?.forklifts || [],
      dispatches: data?.dispatches || [],
      gateLanes: data?.gateLanes || [],
      statistics: data?.statistics || {
        totalCapacity: 0, totalContainers: 0, availableSlots: 0, occupancyRate: 0,
        repairCount: 0, cleaningCount: 0, holdCount: 0, waitingGateInCount: 0,
        waitingGateOutCount: 0, activeForklifts: 0
      }
    };
  },

  async searchContainers(query: string): Promise<YardContainer[]> {
    const res = await axios.get(`${API_BASE}/containers/search`, { params: { containerNo: query } });
    return (res.data?.data || []).map(mapContainerDto);
  },

  async getContainerById(id: string): Promise<YardContainer | null> {
    try {
      const res = await axios.get(`${API_BASE}/containers/${id}`);
      return res.data?.data ? mapContainerDto(res.data.data) : null;
    } catch {
      return null;
    }
  },

  async getMoveHistories(containerId?: string): Promise<YardMoveHistory[]> {
    const res = await axios.get(`${API_BASE}/history`, { params: { containerId } });
    return (res.data?.data || []).map(mapMoveHistoryDto);
  },

  async moveContainer(payload: {
    containerId: string;
    targetLocation: string; // e.g. "BLOCK_A-02-03-01"
    forkliftId?: string;
    reason: string;
    operatorName?: string;
  }): Promise<{ success: boolean; message: string; container?: YardContainer }> {
    try {
      const res = await axios.post(`${API_BASE}/container/move`, {
        containerId: payload.containerId,
        targetLocation: payload.targetLocation,
        forkliftCode: payload.forkliftId,
        reason: payload.reason,
        operatorName: payload.operatorName
      });
      return { success: true, message: res.data?.message || 'Di chuyển thành công', container: res.data?.data ? mapContainerDto(res.data.data) : undefined };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Không thể di chuyển container.' };
    }
  },

  async dispatchForklift(payload: {
    forkliftId: string;
    containerId: string;
    targetLocation: string;
    priority?: 'NORMAL' | 'URGENT' | 'HIGH';
  }): Promise<{ success: boolean; message: string; dispatch?: ForkliftDispatch }> {
    try {
      const res = await axios.post(`${API_BASE}/forklift/dispatch`, payload);
      return { success: true, message: res.data?.message || 'Phát lệnh điều xe nâng thành công', dispatch: res.data?.data };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Không thể phát lệnh điều xe nâng.' };
    }
  },

  async updateBlockLayout(blockCode: string, payload: {
    blockName: string;
    description?: string;
    bayCount: number;
    rowCount: number;
    maxTier: number;
    status: string;
  }): Promise<{ success: boolean; message: string; block?: YardBlock }> {
    try {
      const res = await axios.put(`${API_BASE}/blocks/${blockCode}`, payload);
      return { success: true, message: res.data?.message || 'Cập nhật Block thành công', block: res.data?.data };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Không thể cập nhật Block.' };
    }
  }
};
