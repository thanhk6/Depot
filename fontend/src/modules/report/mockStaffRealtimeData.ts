export interface StaffRealtimeItem {
  id: string;
  code: string;
  name: string;
  avatarUrl?: string;
  department: 'GATE' | 'SURVEY' | 'REPAIR_WELDING' | 'REPAIR_FLOOR' | 'CLEANING' | 'QC' | 'FORKLIFT' | 'WAREHOUSE';
  departmentName: string;
  roleTitle: string;
  shift: 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3'; // Ca 1 (06:00-14:00), Ca 2 (14:00-22:00), Ca 3 (22:00-06:00)
  shiftName: string;
  phone: string;
  status: 'BUSY' | 'AVAILABLE' | 'ON_BREAK' | 'OFFLINE';
  currentTask?: {
    taskName: string;
    containerNo: string;
    location: string;
    startedAt: string;
    estimatedDurationMinutes: number;
    elapsedMinutes: number;
    progressPercent: number;
  };
  metrics: {
    assignedToday: number;
    completedToday: number;
    inProgressToday: number;
    pendingToday: number;
    targetQuota: number;
    efficiencyPercent: number; // e.g. 115%
    avgMinutesPerContainer: number;
    firstPassYieldPercent: number; // e.g. 99.2%
    ratingScore: number; // 4.8 / 5.0
    overtimeHours: number;
  };
  todayActivityLogs: {
    id: string;
    time: string;
    action: string;
    containerNo: string;
    location: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'REJECTED';
    note: string;
  }[];
}
