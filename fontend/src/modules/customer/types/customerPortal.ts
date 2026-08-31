export type PortalRole = 'CUSTOMER_ADMIN' | 'DISPATCHER' | 'DRIVER' | 'ACCOUNTANT';
export type CustomerCategory = 'DOANH_NGHIEP' | 'CONG_TY' | 'KHACH_LE';
export type CustomerBusiness = 'TRUCKING' | 'FORWARDER' | 'SHIPPER' | 'LOGISTICS' | 'RETAIL_DRIVER';

export interface CustomerCompany {
  id: string;
  code: string;
  name: string;
  taxCode: string; // MST đối với Doanh nghiệp/Công ty, hoặc CCCD đối với Khách lẻ
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  category: CustomerCategory; // DOANH_NGHIEP | CONG_TY | KHACH_LE
  type: CustomerBusiness; // TRUCKING | FORWARDER | SHIPPER | LOGISTICS | RETAIL_DRIVER
  status: 'ACTIVE' | 'LOCKED';
  creditLimit: number;
  currentDebt: number;
  paymentTerm: string;
  truckCount: number;
  adminUsername?: string; // Tài khoản Admin ban đầu được Depot cấp
  adminPasswordDefault?: string;
  createdAt: string;
}

export interface CustomerUser {
  id: string;
  customerId: string;
  customerName?: string;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  role: PortalRole;
  status: 'ACTIVE' | 'LOCKED';
  driverId?: string;
  driverName?: string;
  assignedVehiclePlate?: string;
  assignedMoocPlate?: string;
  allowOnlineGateIn?: boolean; // Cho phép tài xế tự Gate-In online
  isDepotProvisioned?: boolean; // Được Depot cấp ban đầu hay do Khách hàng tự thêm
  createdByAdminId?: string; // ID của Admin khách hàng đã tạo tài khoản này
  lastLogin?: string;
  createdAt: string;
}

export interface DriverRecord {
  id: string;
  customerId: string;
  customerName?: string;
  driverCode: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  citizenId: string;
  licenseNumber: string;
  licenseGrade: 'FC' | 'C' | 'E';
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  address?: string;
  assignedVehiclePlate: string;
  assignedMoocPlate?: string;
  status: 'ACTIVE' | 'LOCKED';
  hasUserAccount: boolean;
  username?: string;
  password?: string;
  allowOnlineGateIn: boolean;
  lastLogin?: string;
  createdAt: string;
  notes?: string;
}

export interface VehicleRecord {
  id: string;
  customerId: string;
  customerName?: string;
  licensePlate: string;
  vehicleType: 'TRACTOR' | 'CHASSIS_MOOC' | 'TRUCK';
  brand: string;
  modelYear: number;
  payloadCapacity: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  inspectionExpiry: string;
  gpsStatus: 'ONLINE' | 'OFFLINE';
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  createdAt: string;
}

export interface CustomerBooking {
  id: string;
  bookingNo: string;
  shippingLine: string;
  customerId: string;
  customerName?: string;
  depot: string;
  containerCount: number;
  usedCount: number;
  containerSize: string;
  containerType: string;
  issueDate: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED';
  specialInstructions?: string;
}

export interface CustomerContainerItem {
  id: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  shippingLine: string;
  customerId: string;
  customerName?: string;
  status: 'IN_DEPOT' | 'ON_ROAD' | 'AT_FACTORY' | 'EXPORTED';
  yardLocation?: string;
  condition: 'AV' | 'CL' | 'DM';
  bookingNo?: string;
  gateInDate?: string;
  gateOutDate?: string;
  driverName?: string;
  licensePlate?: string;
}

export type GateInStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'INSPECTION'
  | 'GATE_IN'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface GateInTimelineEvent {
  status: GateInStatus | string;
  label: string;
  time: string;
  actor: string;
  note: string;
}

export interface GateInRegistration {
  id: string;
  gateInNo: string;
  customerId: string;
  customerName: string;
  bookingNo: string;
  shippingLine: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  sealNo?: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  moocPlate?: string;
  depot: string;
  appointmentDate: string;
  appointmentTime: string;
  status: GateInStatus;
  qrCodeData: string;
  createdAt: string;
  completedAt?: string;
  inspectionResult?: string;
  gateOperator?: string;
  notes?: string;
  timeline: GateInTimelineEvent[];
}
