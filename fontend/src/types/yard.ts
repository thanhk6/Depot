import { YardLocation } from './container';

export interface YardBlockConfig {
  code: string;                 // Mã block
  name: string;                 // Tên block
  totalBays: number;            // Tổng số dãy
  rowsPerBay: number;           // Số hàng mỗi dãy
  maxTiers: number;             // Số tầng tối đa
  allocatedShippingLines: string[]; // Hãng tàu được phân bổ
  currentOccupancy: number;     // Số chỗ đang dùng
  maxCapacity: number;          // Sức chứa tối đa
}

export interface ForkliftTask {
  id: string;                   // Mã tác vụ
  jobId: string;                // Mã job
  containerNo: string;          // Số container
  fromLocation: YardLocation;    // Vị trí đi
  toLocation: YardLocation;      // Vị trí đến
  forkliftDriverName: string;    // Tên tài xế xe nâng
  purpose: 'GATE_IN_LOWER' | 'REPAIR_MOVE' | 'GATE_OUT_LIFT' | 'YARD_SHUFFLE';
  assignedTime: string;         // Thời điểm phân công
  completedTime?: string;       // Thời điểm hoàn tất
  isCompleted: boolean;         // Đã hoàn thành hay chưa
}
