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

export const MOCK_STAFF_REALTIME_DATA: StaffRealtimeItem[] = [
  {
    id: 'staff-001',
    code: 'NV-G01',
    name: 'Trần Quốc Việt',
    department: 'REPAIR_WELDING',
    departmentName: 'Tổ Thợ Hàn Gò EMR',
    roleTitle: 'Tổ Trưởng / Thợ Hàn Bậc 5',
    shift: 'SHIFT_1',
    shiftName: 'Ca 1 (06:00 - 14:00)',
    phone: '0912.839.201',
    status: 'BUSY',
    currentTask: {
      taskName: 'Hàn ghép tôn vách phải 2.0m & nắn xà nóc',
      containerNo: 'MSKU9182374',
      location: 'Xưởng Sửa Chữa Bay 04',
      startedAt: '08:15',
      estimatedDurationMinutes: 60,
      elapsedMinutes: 42,
      progressPercent: 75
    },
    metrics: {
      assignedToday: 8,
      completedToday: 6,
      inProgressToday: 1,
      pendingToday: 1,
      targetQuota: 7,
      efficiencyPercent: 114,
      avgMinutesPerContainer: 52,
      firstPassYieldPercent: 99.4,
      ratingScore: 4.9,
      overtimeHours: 0
    },
    todayActivityLogs: [
      {
        id: 'log-101',
        time: '08:15',
        action: 'Bắt đầu thi công hàn vách Corten',
        containerNo: 'MSKU9182374',
        location: 'Bay 04',
        status: 'IN_PROGRESS',
        note: 'Nhận 2 tấm tôn vách từ kho EMR'
      },
      {
        id: 'log-102',
        time: '07:30',
        action: 'Hoàn thành sửa chữa nắn cột góc trước',
        containerNo: 'CMAU7482910',
        location: 'Bay 02',
        status: 'COMPLETED',
        note: 'Đã bàn giao KCS nghiệm thu đạt 100%'
      },
      {
        id: 'log-103',
        time: '06:40',
        action: 'Hoàn thành thay roong cao su cửa sau',
        containerNo: 'TCNU3920194',
        location: 'Bay 01',
        status: 'COMPLETED',
        note: 'Thay 2m ron EPDM và kiểm tra kín sáng'
      }
    ]
  },
  {
    id: 'staff-002',
    code: 'NV-S01',
    name: 'Nguyễn Văn Hùng',
    department: 'SURVEY',
    departmentName: 'Tổ Giám Định (Survey)',
    roleTitle: 'Giám Định Viên IICL-6',
    shift: 'SHIFT_1',
    shiftName: 'Ca 1 (06:00 - 14:00)',
    phone: '0903.491.822',
    status: 'BUSY',
    currentTask: {
      taskName: 'Giám định 6 mặt e-EIR & phân hạng Grade',
      containerNo: 'MSKU4820193',
      location: 'Cổng Vào Gate-In Lane 02',
      startedAt: '08:48',
      estimatedDurationMinutes: 8,
      elapsedMinutes: 5,
      progressPercent: 65
    },
    metrics: {
      assignedToday: 32,
      completedToday: 26,
      inProgressToday: 1,
      pendingToday: 5,
      targetQuota: 30,
      efficiencyPercent: 108,
      avgMinutesPerContainer: 6.8,
      firstPassYieldPercent: 99.8,
      ratingScore: 4.95,
      overtimeHours: 0
    },
    todayActivityLogs: [
      {
        id: 'log-201',
        time: '08:48',
        action: 'Bắt đầu giám định Gate-In',
        containerNo: 'MSKU4820193',
        location: 'Gate Lane 02',
        status: 'IN_PROGRESS',
        note: 'Chụp 4 góc ảnh, phát hiện móp vách trái'
      },
      {
        id: 'log-202',
        time: '08:35',
        action: 'Phát hành phiếu e-EIR sạch (Grade A)',
        containerNo: 'MAEU9821034',
        location: 'Gate Lane 01',
        status: 'COMPLETED',
        note: 'Vỏ sạch, chuyển thẳng bãi cấp rỗng'
      },
      {
        id: 'log-203',
        time: '08:18',
        action: 'Lập biên bản giám định hư hỏng rách nóc',
        containerNo: 'MSKU1820491',
        location: 'Gate Lane 02',
        status: 'COMPLETED',
        note: 'Hư hỏng do tài xế (User Damage), yêu cầu tính cước'
      }
    ]
  },
  {
    id: 'staff-003',
    code: 'NV-F01',
    name: 'Lê Tấn Tài',
    department: 'FORKLIFT',
    departmentName: 'Tổ Lái Xe Nâng Bãi',
    roleTitle: 'Tài Xế Xe Nâng Chuyên Dụng Kalmar',
    shift: 'SHIFT_1',
    shiftName: 'Ca 1 (06:00 - 14:00)',
    phone: '0938.992.102',
    status: 'BUSY',
    currentTask: {
      taskName: 'Đảo chuyển hạ vỏ vào vị trí Block A-04-02-T3',
      containerNo: 'MSKU6472819',
      location: 'Block A - Dãy 04',
      startedAt: '08:50',
      estimatedDurationMinutes: 5,
      elapsedMinutes: 3,
      progressPercent: 70
    },
    metrics: {
      assignedToday: 45,
      completedToday: 38,
      inProgressToday: 1,
      pendingToday: 6,
      targetQuota: 40,
      efficiencyPercent: 112,
      avgMinutesPerContainer: 3.5,
      firstPassYieldPercent: 100,
      ratingScore: 4.85,
      overtimeHours: 0
    },
    todayActivityLogs: [
      {
        id: 'log-301',
        time: '08:50',
        action: 'Nâng vỏ chuyển vào Block A',
        containerNo: 'MSKU6472819',
        location: 'Block A-04',
        status: 'IN_PROGRESS',
        note: 'Xe nâng Kalmar #01 thực hiện'
      },
      {
        id: 'log-302',
        time: '08:42',
        action: 'Gắp vỏ rỗng lên rơ-moóc Gate-Out',
        containerNo: 'MAEU3019284',
        location: 'Lane Xuất 01',
        status: 'COMPLETED',
        note: 'Cấp vỏ cho tài xế xe 51C-849.20'
      }
    ]
  },
  {
    id: 'staff-004',
    code: 'NV-Q01',
    name: 'Vũ Đức Nam',
    department: 'QC',
    departmentName: 'Tổ Kỹ Thuật KCS & Nghiệm Thu',
    roleTitle: 'Kỹ Sư Trưởng QC / Giám Định IICL',
    shift: 'SHIFT_1',
    shiftName: 'Ca 1 (06:00 - 14:00)',
    phone: '0988.302.194',
    status: 'AVAILABLE',
    currentTask: undefined,
    metrics: {
      assignedToday: 15,
      completedToday: 14,
      inProgressToday: 0,
      pendingToday: 1,
      targetQuota: 14,
      efficiencyPercent: 107,
      avgMinutesPerContainer: 12,
      firstPassYieldPercent: 98.6,
      ratingScore: 4.9,
      overtimeHours: 0
    },
    todayActivityLogs: [
      {
        id: 'log-401',
        time: '08:40',
        action: 'Nghiệm thu QC PASSED - Đạt chuẩn IICL-6',
        containerNo: 'CMAU7482910',
        location: 'Khu QC Bay 02',
        status: 'COMPLETED',
        note: 'Kiểm tra độ kín nước và chất lượng mối hàn vách'
      },
      {
        id: 'log-402',
        time: '08:05',
        action: 'Nghiệm thu QC PASSED - Ván sàn',
        containerNo: 'TCNU3920194',
        location: 'Khu QC Bay 01',
        status: 'COMPLETED',
        note: 'Sàn gỗ phẳng, vít chìm đúng kỹ thuật'
      }
    ]
  },
  {
    id: 'staff-005',
    code: 'NV-C01',
    name: 'Vũ Hải Đăng',
    department: 'CLEANING',
    departmentName: 'Tổ Vệ Sinh Vỏ Container',
    roleTitle: 'Tổ Trưởng Vệ Sinh & Tẩy Rửa',
    shift: 'SHIFT_1',
    shiftName: 'Ca 1 (06:00 - 14:00)',
    phone: '0977.104.922',
    status: 'BUSY',
    currentTask: {
      taskName: 'Rửa nước áp lực cao & khử mùi hóa chất sàn',
      containerNo: 'MSKU2048194',
      location: 'Khu Vệ Sinh Cleaning Bay 01',
      startedAt: '08:35',
      estimatedDurationMinutes: 25,
      elapsedMinutes: 20,
      progressPercent: 85
    },
    metrics: {
      assignedToday: 18,
      completedToday: 15,
      inProgressToday: 1,
      pendingToday: 2,
      targetQuota: 16,
      efficiencyPercent: 110,
      avgMinutesPerContainer: 18,
      firstPassYieldPercent: 99.1,
      ratingScore: 4.8,
      overtimeHours: 0
    },
    todayActivityLogs: [
      {
        id: 'log-501',
        time: '08:35',
        action: 'Bắt đầu tẩy rửa hóa chất',
        containerNo: 'MSKU2048194',
        location: 'Cleaning Bay 01',
        status: 'IN_PROGRESS',
        note: 'Tẩy dầu mỡ trên bề mặt sàn gỗ'
      },
      {
        id: 'log-502',
        time: '08:10',
        action: 'Hoàn thành quét khô & hút bụi',
        containerNo: 'MSKU8392011',
        location: 'Cleaning Bay 02',
        status: 'COMPLETED',
        note: 'Vỏ sạch, chuyển sang bãi chờ cấp rỗng'
      }
    ]
  },
  {
    id: 'staff-006',
    code: 'NV-W01',
    name: 'Trần Văn Mạnh',
    department: 'WAREHOUSE',
    departmentName: 'Kho Vật Tư Sửa Chữa EMR',
    roleTitle: 'Thủ Kho Trưởng EMR',
    shift: 'SHIFT_1',
    shiftName: 'Ca 1 (06:00 - 14:00)',
    phone: '0944.918.273',
    status: 'AVAILABLE',
    currentTask: undefined,
    metrics: {
      assignedToday: 22,
      completedToday: 20,
      inProgressToday: 0,
      pendingToday: 2,
      targetQuota: 20,
      efficiencyPercent: 105,
      avgMinutesPerContainer: 5,
      firstPassYieldPercent: 100,
      ratingScore: 4.95,
      overtimeHours: 0
    },
    todayActivityLogs: [
      {
        id: 'log-601',
        time: '08:20',
        action: 'Lập phiếu xuất kho PXK-2026-0042',
        containerNo: 'MSKU9182374',
        location: 'Kho EMR Main',
        status: 'COMPLETED',
        note: 'Cấp 2 tấm tôn vách và 1 lọ sơn kẽm cho thợ Việt'
      },
      {
        id: 'log-602',
        time: '07:45',
        action: 'Tiếp nhận nhập kho PNK-2026-0018',
        containerNo: 'Vật Tư Đặt Hàng',
        location: 'Kho EMR Main',
        status: 'COMPLETED',
        note: 'Nhập 50 tấm ván sàn Plywood từ Nhà cung cấp Nam Hải'
      }
    ]
  },
  {
    id: 'staff-007',
    code: 'NV-G02',
    name: 'Hoàng Minh Tuấn',
    department: 'GATE',
    departmentName: 'Tổ Điều Phối Cổng Tiếp Nhận',
    roleTitle: 'Nhân Viên Điều Phối Cổng Gate-In/Out',
    shift: 'SHIFT_1',
    shiftName: 'Ca 1 (06:00 - 14:00)',
    phone: '0966.491.029',
    status: 'BUSY',
    currentTask: {
      taskName: 'Thủ tục Gate-In tiếp nhận xe đầu kéo 50H-928.19',
      containerNo: 'MSKU7492018',
      location: 'Cổng Vào Gate 01',
      startedAt: '08:52',
      estimatedDurationMinutes: 4,
      elapsedMinutes: 2,
      progressPercent: 50
    },
    metrics: {
      assignedToday: 55,
      completedToday: 48,
      inProgressToday: 1,
      pendingToday: 6,
      targetQuota: 50,
      efficiencyPercent: 110,
      avgMinutesPerContainer: 2.8,
      firstPassYieldPercent: 100,
      ratingScore: 4.9,
      overtimeHours: 0
    },
    todayActivityLogs: [
      {
        id: 'log-701',
        time: '08:52',
        action: 'Quét mã Check Digit & in phiếu Gate-In',
        containerNo: 'MSKU7492018',
        location: 'Gate 01',
        status: 'IN_PROGRESS',
        note: 'Tài xế Nguyễn Văn Nam - Xe 50H-928.19'
      },
      {
        id: 'log-702',
        time: '08:45',
        action: 'Xác nhận cấp vỏ Gate-Out thành công',
        containerNo: 'MAEU3019284',
        location: 'Gate Out 02',
        status: 'COMPLETED',
        note: 'Tài xế xuất trình mã QR Zalo hợp lệ'
      }
    ]
  },
  {
    id: 'staff-008',
    code: 'NV-R02',
    name: 'Phạm Đức Thắng',
    department: 'REPAIR_FLOOR',
    departmentName: 'Tổ Thợ Mộc & Thay Sàn EMR',
    roleTitle: 'Thợ Mộc Sàn Bậc 4',
    shift: 'SHIFT_1',
    shiftName: 'Ca 1 (06:00 - 14:00)',
    phone: '0918.492.013',
    status: 'BUSY',
    currentTask: {
      taskName: 'Cắt ghép thay 1/2 tấm ván sàn cont 28mm',
      containerNo: 'MSKU3829104',
      location: 'Xưởng Mộc Sàn Bay 03',
      startedAt: '08:25',
      estimatedDurationMinutes: 45,
      elapsedMinutes: 30,
      progressPercent: 70
    },
    metrics: {
      assignedToday: 6,
      completedToday: 4,
      inProgressToday: 1,
      pendingToday: 1,
      targetQuota: 5,
      efficiencyPercent: 106,
      avgMinutesPerContainer: 42,
      firstPassYieldPercent: 98.8,
      ratingScore: 4.82,
      overtimeHours: 0
    },
    todayActivityLogs: [
      {
        id: 'log-801',
        time: '08:25',
        action: 'Bắt đầu bắn vít liên kết ván sàn',
        containerNo: 'MSKU3829104',
        location: 'Bay 03',
        status: 'IN_PROGRESS',
        note: 'Sử dụng 30 vít sàn tự khoan chống rỉ'
      }
    ]
  }
];
