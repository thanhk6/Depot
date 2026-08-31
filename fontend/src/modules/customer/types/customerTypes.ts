export type CustomerType = 'TRUCKING' | 'FORWARDER' | 'SHIPPER' | 'LOGISTICS';
export type CustomerStatus = 'ACTIVE' | 'LOCKED';
export type UserRole = 'CUSTOMER_ADMIN' | 'CUSTOMER_USER' | 'DRIVER';
export type AccountType = 'INTERNAL_ORG' | 'DRIVER_PORTAL' | 'API_CLIENT';
export type UserStatus = 'ACTIVE' | 'LOCKED';
export type DriverStatus = 'ACTIVE' | 'LOCKED';
export type LicenseGrade = 'FC' | 'C' | 'E' | 'D';
export type VehicleType = 'TRACTOR' | 'TRAILER' | 'TRUCK';
export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'LOCKED';

export interface CustomerCompany {
  id: string;
  code: string;
  name: string;
  shortName: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  customerType: CustomerType;
  status: CustomerStatus;
  creditLimit: number;
  currentDebt: number;
  paymentTermDays: number;
  notes?: string;
  userCount: number;
  driverCount: number;
  vehicleCount: number;
  containerCount: number;
  gateInCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerUser {
  id: string;
  customerId: string;
  customerCode?: string;
  customerName?: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  accountType: AccountType;
  status: UserStatus;
  driverId?: string;
  driverName?: string;
  createdAt: string;
  lastLogin: string;
}

export interface DriverRecord {
  id: string;
  customerId: string;
  customerCode?: string;
  customerName?: string;
  driverCode: string;
  fullName: string;
  phone: string;
  email?: string;
  citizenId: string;
  licenseNumber: string;
  licenseGrade: LicenseGrade;
  licenseExpiryDate: string;
  address?: string;
  linkedUserId?: string;
  linkedUsername?: string;
  assignedVehiclePlate?: string;
  assignedMoocPlate?: string;
  status: DriverStatus;
  createdAt: string;
}

export interface VehicleRecord {
  id: string;
  customerId: string;
  customerCode?: string;
  customerName?: string;
  plateNumber: string;
  vehicleType: VehicleType;
  brand: string;
  payloadTon: number;
  ownerName: string;
  defaultDriverId?: string;
  defaultDriverName?: string;
  inspectionExpiry: string;
  status: VehicleStatus;
  createdAt: string;
}

export interface CustomerActivityLog {
  id: string;
  customerId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
}
