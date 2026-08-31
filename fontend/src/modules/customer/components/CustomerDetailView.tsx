import React, { useState } from 'react';
import {
  CustomerCompany,
  CustomerUser,
  DriverRecord,
  VehicleRecord,
  CustomerActivityLog,
  CustomerType
} from '../types/customerTypes';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  ShieldCheck,
  Edit,
  Lock,
  Unlock,
  Printer,
  FileText,
  Users,
  UserCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { TabOverview } from './TabOverview';
import { TabAccounts } from './TabAccounts';
import { TabDrivers } from './TabDrivers';
import { TabVehicles } from './TabVehicles';

interface CustomerDetailViewProps {
  customer: CustomerCompany;
  users: CustomerUser[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  activityLogs: CustomerActivityLog[];
  onBackToList: () => void;
  onEditCustomer: (customer: CustomerCompany) => void;
  onToggleStatus: (customerId: string) => void;
  // User operations
  onAddUser: (newUser: Omit<CustomerUser, 'id' | 'createdAt' | 'lastLogin'>) => void;
  onUpdateUser: (userId: string, updatedData: Partial<CustomerUser>) => void;
  onToggleUserStatus: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  // Driver operations
  onAddDriver: (newDriver: Omit<DriverRecord, 'id' | 'createdAt'>) => void;
  onUpdateDriver: (driverId: string, updatedData: Partial<DriverRecord>) => void;
  onToggleDriverStatus: (driverId: string) => void;
  // Vehicle operations
  onAddVehicle: (newVehicle: Omit<VehicleRecord, 'id' | 'createdAt'>) => void;
  onUpdateVehicle: (vehicleId: string, updatedData: Partial<VehicleRecord>) => void;
  onToggleVehicleStatus: (vehicleId: string) => void;
}

export type DetailTabKey = 'overview' | 'accounts' | 'drivers' | 'vehicles';

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customer,
  users,
  drivers,
  vehicles,
  activityLogs,
  onBackToList,
  onEditCustomer,
  onToggleStatus,
  onAddUser,
  onUpdateUser,
  onToggleUserStatus,
  onResetPassword,
  onAddDriver,
  onUpdateDriver,
  onToggleDriverStatus,
  onAddVehicle,
  onUpdateVehicle,
  onToggleVehicleStatus
}) => {
  const [activeTab, setActiveTab] = useState<DetailTabKey>('overview');

  // Counts for tabs
  const customerUsersCount = users.filter((u) => u.customerId === customer.id).length;
  const customerDriversCount = drivers.filter((d) => d.customerId === customer.id).length;
  const customerVehiclesCount = vehicles.filter((v) => v.customerId === customer.id).length;

  const getTypeBadge = (type: CustomerType) => {
    switch (type) {
      case 'LOGISTICS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'TRUCKING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'FORWARDER':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'SHIPPER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getTypeName = (type: CustomerType) => {
    switch (type) {
      case 'LOGISTICS':
        return 'Logistics / 3PL';
      case 'TRUCKING':
        return 'Đội Xe Trucking';
      case 'FORWARDER':
        return 'Forwarder / FWD';
      case 'SHIPPER':
        return 'Chủ Hàng (Shipper)';
      default:
        return type;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToList}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-800 cursor-pointer shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh Sách Khách Hàng</span>
        </button>

        <div className="text-xs text-slate-400 font-mono">
          Mã định danh: <strong className="text-blue-400">{customer.code}</strong>
        </div>
      </div>

      {/* Header Info Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Top line indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            {/* Badges & Code */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {customer.code}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getTypeBadge(customer.customerType)}`}>
                {getTypeName(customer.customerType)}
              </span>
              {customer.status === 'ACTIVE' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Đang Hoạt Động
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Tạm Khóa Lệnh
                </span>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{customer.name}</h1>
              <p className="text-sm font-semibold text-blue-400 mt-0.5">Thương hiệu: {customer.shortName}</p>
            </div>

            {/* Meta Key Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">MST:</span>
                <span className="font-mono font-bold text-slate-200">{customer.taxCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-200">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Đại diện: <strong>{customer.contactPerson}</strong> ({customer.contactPhone})</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 self-start">
            <button
              onClick={() => onEditCustomer(customer)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Sửa Thông Tin</span>
            </button>

            <button
              onClick={() => onToggleStatus(customer.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                customer.status === 'ACTIVE'
                  ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/20'
                  : 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20'
              }`}
            >
              {customer.status === 'ACTIVE' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Khóa Khách Hàng</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Mở Khóa Khách Hàng</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Hồ Sơ KH</span>
            </button>
          </div>
        </div>

        {/* 4 Tabs Bar */}
        <div className="mt-8 border-t border-slate-800 pt-3 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tab 1 – Tổng Quan</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tab 2 – Tài Khoản</span>
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'accounts' ? 'bg-white/20 text-white' : 'bg-slate-800 text-blue-400'
              }`}
            >
              {customerUsersCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'drivers'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Tab 3 – Tài Xế</span>
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'drivers' ? 'bg-white/20 text-white' : 'bg-slate-800 text-purple-400'
              }`}
            >
              {customerDriversCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'vehicles'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Tab 4 – Phương Tiện</span>
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'vehicles' ? 'bg-white/20 text-white' : 'bg-slate-800 text-amber-400'
              }`}
            >
              {customerVehiclesCount}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content Panels */}
      <div>
        {activeTab === 'overview' && (
          <TabOverview
            customer={customer}
            activityLogs={activityLogs}
            onNavigateTab={(tabKey) => setActiveTab(tabKey)}
          />
        )}

        {activeTab === 'accounts' && (
          <TabAccounts
            customer={customer}
            users={users}
            onAddUser={onAddUser}
            onUpdateUser={onUpdateUser}
            onToggleUserStatus={onToggleUserStatus}
            onResetPassword={onResetPassword}
          />
        )}

        {activeTab === 'drivers' && (
          <TabDrivers
            customer={customer}
            drivers={drivers}
            users={users}
            onAddDriver={onAddDriver}
            onUpdateDriver={onUpdateDriver}
            onToggleDriverStatus={onToggleDriverStatus}
          />
        )}

        {activeTab === 'vehicles' && (
          <TabVehicles
            customer={customer}
            vehicles={vehicles}
            drivers={drivers}
            onAddVehicle={onAddVehicle}
            onUpdateVehicle={onUpdateVehicle}
            onToggleVehicleStatus={onToggleVehicleStatus}
          />
        )}
      </div>
    </div>
  );
};
