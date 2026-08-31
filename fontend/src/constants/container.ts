export const SHIPPING_LINES = [
  { code: 'MAEU', name: 'Maersk Line (A.P. Moller – Maersk)', logo: '🚢 MAERSK' }
];

export const CONTAINER_SIZES = [
  { code: '20GP', name: '20 Feet Dry General', lengthFeet: 20, isReefer: false },
  { code: '40GP', name: '40 Feet Dry General', lengthFeet: 40, isReefer: false },
  { code: '40HC', name: '40 Feet High Cube', lengthFeet: 40, isReefer: false },
  { code: '45HC', name: '45 Feet High Cube', lengthFeet: 45, isReefer: false },
  { code: '20RF', name: '20 Feet Refrigerated (Reefer)', lengthFeet: 20, isReefer: true },
  { code: '40RH', name: '40 Feet High Cube Reefer', lengthFeet: 40, isReefer: true },
  { code: '20OT', name: '20 Feet Open Top', lengthFeet: 20, isReefer: false },
  { code: '40FR', name: '40 Feet Flat Rack', lengthFeet: 40, isReefer: false }
];

export const TARIFF_RATES = {
  GATE_IN_20: 350000,
  GATE_IN_40: 550000,
  GATE_OUT_20: 350000,
  GATE_OUT_40: 550000,
  STORAGE_PER_DAY_20: 50000,
  STORAGE_PER_DAY_40: 90000,
  CLEANING_SWEEP_20: 150000,
  CLEANING_SWEEP_40: 250000,
  CLEANING_WASH_20: 300000,
  CLEANING_WASH_40: 450000,
  LABOUR_HOURLY_RATE: 220000 // 220,000 VND / hour
};

export const TRUCKING_CUSTOMERS = [
  {
    id: 'CUST-001',
    code: 'LOG-TC',
    name: 'Công Ty TNHH Logistics Tân Cảng - Miền Nam',
    taxCode: '0312458921',
    type: 'TRUCKING',
    phone: '028.3899.8888',
    email: 'ops@tancang-logistics.vn',
    address: 'KCN Cát Lái, P. Thạnh Mỹ Lợi, TP. Thủ Đức, TP.HCM',
    creditLimit: 500000000,
    currentDebt: 12450000,
    paymentTerm: 'TRẢ_SAU_30_NGÀY',
    truckCount: 18,
    status: 'ACTIVE'
  },
  {
    id: 'CUST-002',
    code: 'VT-HOANGHA',
    name: 'Công Ty Cổ Phần Vận Tải & Dịch Vụ Hoàng Hà',
    taxCode: '0309876543',
    type: 'TRUCKING',
    phone: '0908.123.456',
    email: 'dispatch@hoanghatrans.com',
    address: 'Đại Lộ Bình Dương, TP. Thuận An, Bình Dương',
    creditLimit: 300000000,
    currentDebt: 8500000,
    paymentTerm: 'TRẢ_SAU_15_NGÀY',
    truckCount: 12,
    status: 'ACTIVE'
  },
  {
    id: 'CUST-003',
    code: 'FWD-DATPHAT',
    name: 'Công Ty TNHH Giao Nhận Quốc Tế Đạt Phát (Forwarder)',
    taxCode: '0315678901',
    type: 'FORWARDER',
    phone: '0913.987.654',
    email: 'booking@datphat-fwd.com',
    address: 'Số 12 Tôn Đức Thắng, Quận 1, TP.HCM',
    creditLimit: 0,
    currentDebt: 0,
    paymentTerm: 'TRẢ_NGAY_VIETQR',
    truckCount: 5,
    status: 'ACTIVE'
  },
  {
    id: 'CUST-004',
    code: 'XNK-MINHTHONG',
    name: 'Công Ty Cổ Phần Xuất Nhập Khẩu Minh Thông',
    taxCode: '3701234567',
    type: 'SHIPPER',
    phone: '0274.3755.999',
    email: 'logistics@minhthong-exp.vn',
    address: 'KCN VSIP 1, TP. Thuận An, Bình Dương',
    creditLimit: 200000000,
    currentDebt: 45000000,
    paymentTerm: 'TRẢ_SAU_30_NGÀY',
    truckCount: 8,
    status: 'ACTIVE'
  },
  {
    id: 'CUST-005',
    code: 'VT-ANPHAT',
    name: 'Hợp Tác Xóa Vận Tải An Phát Cát Lái',
    taxCode: '0318991122',
    type: 'TRUCKING',
    phone: '0988.777.666',
    email: 'dieuvan@anphat-trans.vn',
    address: 'Vòng Xoay Mỹ Thủy, P. Cát Lái, TP. Thủ Đức',
    creditLimit: 100000000,
    currentDebt: 2100000,
    paymentTerm: 'TRẢ_SAU_7_NGÀY',
    truckCount: 25,
    status: 'ACTIVE'
  }
];

export const CUSTOMER_CLASSIFICATIONS = [
  {
    id: 'CLASS-01',
    name: 'Doanh Nghiệp Vận Tải (Trucking)',
    description: 'Đơn vị sở hữu đội xe đầu kéo, chuyên tuyến vận chuyển container từ cảng về kho bãi và ngược lại.'
  },
  {
    id: 'CLASS-02',
    name: 'Công Ty Giao Nhận (Forwarder / 3PL)',
    description: 'Công ty đại lý giao nhận hàng hóa quốc tế, thực hiện thủ tục hải quan và điều phối logistics.'
  },
  {
    id: 'CLASS-03',
    name: 'Chủ Hàng Trực Tiếp (Shipper / Consignee)',
    description: 'Doanh nghiệp sản xuất, nhà máy xuất nhập khẩu hàng hóa trực tiếp sử dụng vỏ container.'
  },
  {
    id: 'CLASS-04',
    name: 'Khách Hàng Chiến Lược (VIP Partner)',
    description: 'Đối tác chiến lược có khối lượng giao dịch và sản lượng container lớn hàng tháng tại Depot.'
  },
  {
    id: 'CLASS-05',
    name: 'Tài Xế / Khách Hàng Lẻ',
    description: 'Chủ phương tiện cá thể, xe dịch vụ chở container lẻ ra vào cổng Depot thanh toán theo từng lượt.'
  }
];

export const CUSTOMER_DRIVERS = [
  {
    id: 'DRV-001',
    customerId: 'CUST-001',
    customerName: 'Công Ty TNHH Logistics Tân Cảng - Miền Nam',
    username: 'tx_tancang01',
    password: 'Password@123',
    fullName: 'Nguyễn Văn Hùng',
    phone: '0903.112.233',
    citizenId: '079085012345',
    licenseNumber: '790123456789 (Hạng FC)',
    licensePlate: '51C-882.19',
    roMoocNo: '51R-045.22',
    allowOnlineGateIn: true,
    status: 'ACTIVE',
    lastLogin: '2026-08-16 08:30',
    createdAt: '2026-01-10',
    notes: 'Tài xế chuyên tuyến Cát Lái - Depot'
  },
  {
    id: 'DRV-002',
    customerId: 'CUST-001',
    customerName: 'Công Ty TNHH Logistics Tân Cảng - Miền Nam',
    username: 'tx_tancang02',
    password: 'Password@123',
    fullName: 'Trần Văn Kiên',
    phone: '0908.445.566',
    citizenId: '079088098765',
    licenseNumber: '790987654321 (Hạng FC)',
    licensePlate: '51D-912.44',
    roMoocNo: '51R-089.11',
    allowOnlineGateIn: true,
    status: 'ACTIVE',
    lastLogin: '2026-08-15 17:15',
    createdAt: '2026-01-15',
    notes: 'Xe đầu kéo Mỹ Cummins 450HP'
  },
  {
    id: 'DRV-003',
    customerId: 'CUST-001',
    customerName: 'Công Ty TNHH Logistics Tân Cảng - Miền Nam',
    username: 'tx_tancang03',
    password: 'Password@123',
    fullName: 'Phạm Minh Toàn',
    phone: '0977.223.344',
    citizenId: '079090011223',
    licenseNumber: '790456123789 (Hạng FC)',
    licensePlate: '50H-123.88',
    roMoocNo: '51R-022.90',
    allowOnlineGateIn: true,
    status: 'ACTIVE',
    lastLogin: '2026-08-14 10:45',
    createdAt: '2026-02-01',
    notes: 'Tài xế nhận container lạnh Reefer'
  },
  {
    id: 'DRV-004',
    customerId: 'CUST-002',
    customerName: 'Công Ty Cổ Phần Vận Tải & Dịch Vụ Hoàng Hà',
    username: 'tx_hoangha01',
    password: 'Password@123',
    fullName: 'Lê Hoàng Long',
    phone: '0918.556.778',
    citizenId: '074092003344',
    licenseNumber: '740889900112 (Hạng FC)',
    licensePlate: '61C-445.89',
    roMoocNo: '61R-012.33',
    allowOnlineGateIn: true,
    status: 'ACTIVE',
    lastLogin: '2026-08-16 07:05',
    createdAt: '2026-02-10',
    notes: 'Tuyến KCN Sóng Thần - ICD'
  },
  {
    id: 'DRV-005',
    customerId: 'CUST-002',
    customerName: 'Công Ty Cổ Phần Vận Tải & Dịch Vụ Hoàng Hà',
    username: 'tx_hoangha02',
    password: 'Password@123',
    fullName: 'Võ Minh Trí',
    phone: '0933.889.900',
    citizenId: '074089004455',
    licenseNumber: '740667788990 (Hạng FC)',
    licensePlate: '61C-778.12',
    roMoocNo: '61R-099.55',
    allowOnlineGateIn: true,
    status: 'ACTIVE',
    lastLogin: '2026-08-13 14:20',
    createdAt: '2026-02-12',
    notes: 'Tài xế giao nhận cont bách hóa'
  },
  {
    id: 'DRV-006',
    customerId: 'CUST-003',
    customerName: 'Công Ty TNHH Giao Nhận Quốc Tế Đạt Phát (Forwarder)',
    username: 'tx_datphat01',
    password: 'Password@123',
    fullName: 'Đặng Quốc Bảo',
    phone: '0909.667.788',
    citizenId: '079087005566',
    licenseNumber: '790334455667 (Hạng FC)',
    licensePlate: '51D-334.56',
    roMoocNo: '51R-067.89',
    allowOnlineGateIn: true,
    status: 'ACTIVE',
    lastLogin: '2026-08-15 09:30',
    createdAt: '2026-03-01',
    notes: 'Xe hợp đồng liên kết Forwarder'
  },
  {
    id: 'DRV-007',
    customerId: 'CUST-004',
    customerName: 'Công Ty Cổ Phần Xuất Nhập Khẩu Minh Thông',
    username: 'tx_minhthong01',
    password: 'Password@123',
    fullName: 'Đỗ Văn Thành',
    phone: '0989.123.888',
    citizenId: '074086007788',
    licenseNumber: '740223344556 (Hạng FC)',
    licensePlate: '60C-987.11',
    roMoocNo: '60R-033.44',
    allowOnlineGateIn: true,
    status: 'ACTIVE',
    lastLogin: '2026-08-12 16:00',
    createdAt: '2026-03-05',
    notes: 'Đội xe riêng nhà máy Minh Thông'
  },
  {
    id: 'DRV-008',
    customerId: 'CUST-005',
    customerName: 'Hợp Tác Xóa Vận Tải An Phát Cát Lái',
    username: 'tx_anphat01',
    password: 'Password@123',
    fullName: 'Bùi Đức Thắng',
    phone: '0966.334.455',
    citizenId: '079083009900',
    licenseNumber: '790112233445 (Hạng FC)',
    licensePlate: '51C-654.32',
    roMoocNo: '51R-088.77',
    allowOnlineGateIn: true,
    status: 'ACTIVE',
    lastLogin: '2026-08-16 06:45',
    createdAt: '2026-03-10',
    notes: 'Tài xế chuyên ca sáng hạ bãi Cát Lái'
  },
  {
    id: 'DRV-009',
    customerId: 'CUST-005',
    customerName: 'Hợp Tác Xóa Vận Tải An Phát Cát Lái',
    username: 'tx_anphat02',
    password: 'Password@123',
    fullName: 'Ngô Quốc Dũng',
    phone: '0978.990.112',
    citizenId: '079091008899',
    licenseNumber: '790556677889 (Hạng FC)',
    licensePlate: '51C-789.01',
    roMoocNo: '51R-044.66',
    allowOnlineGateIn: false,
    status: 'LOCKED',
    lastLogin: '2026-07-28 11:20',
    createdAt: '2026-03-12',
    notes: 'Tài xế đang gia hạn Giấy phép lái xe FC'
  }
];

export const IICL_DAMAGE_CODES = [
  { code: 'CUT', description: 'Vách / Khung bị rách, thủng sáng' },
  { code: 'DENT', description: 'Vách tôn bị móp nhấp nhô > 50mm' },
  { code: 'HOLE', description: 'Thủng lỗ sàn / nóc' },
  { code: 'BENT', description: 'Khung xà dầm / đà ngang bị cong va đập' },
  { code: 'CORROSION', description: 'Rỉ sét bong tróc màu sơn phủ' },
  { code: 'DELAMINATION', description: 'Sàn gỗ bị bong tróc tách lớp / mối mọt' },
  { code: 'GASKET_DAMAGED', description: 'Gioăng cao su cửa bị rách mất độ kín nước' },
  { code: 'DOOR_LOCK_BENT', description: 'Thanh khóa cửa bị cong vênh không khép kín' }
];
