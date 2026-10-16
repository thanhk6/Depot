import React, { useEffect, useState } from 'react';
import { containerApi, customerApi } from '../../../api';
import {
  CustomerCompany,
  CustomerUser,
  DriverRecord,
  VehicleRecord,
  CustomerBooking,
  CustomerContainerItem,
  GateInRegistration,
  GateInStatus,
  PortalRole
} from '../types/customerPortal';

// Component Views
import { CustomerListView } from '../components/CustomerListView';
import { CustomerAccountProfileTab } from '../components/CustomerAccountProfileTab';
import { CustomerAccountsTab } from '../components/CustomerAccountsTab';
import { CustomerDashboardView } from '../components/CustomerDashboardView';
import { GateInListView } from '../components/GateInListView';
import { GateInOnlineWizard } from '../components/GateInOnlineWizard';
import { CustomerBookingView } from '../components/CustomerBookingView';
import { CustomerContainerView } from '../components/CustomerContainerView';
import { CustomerDriverManagementView } from '../components/CustomerDriverManagementView';
import { CustomerVehicleManagementView } from '../components/CustomerVehicleManagementView';
import { GateInQRCodeModal } from '../components/GateInQRCodeModal';
import { GateInDetailModal } from '../components/GateInDetailModal';

import {
  ArrowLeft,
  LayoutDashboard,
  FileText,
  Box,
  Truck,
  Car,
  Building2,
  Users,
  UserCheck,
  Key
} from 'lucide-react';
import { fetchContainerTypes } from '../../masterdata/utils/containerTypeCatalog';

export const CustomerPage: React.FC = () => {
  // Navigation mode: 'LIST' (shows only customer directory) or 'DETAIL' (shows clicked customer's account & workspace)
  const [pageView, setPageView] = useState<'LIST' | 'DETAIL'>('LIST');

  // Master state
  const [customers, setCustomers] = useState<CustomerCompany[]>([]);
  const [currentCustomerId, setCurrentCustomerId] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<PortalRole>('CUSTOMER_ADMIN');
  const [activeDetailTab, setActiveDetailTab] = useState<string>('profile');

  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [containers, setContainers] = useState<CustomerContainerItem[]>([]);
  const [gateIns, setGateIns] = useState<GateInRegistration[]>([]);

  useEffect(() => {
    customerApi.getAll()
      .then((response: any) => {
        if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể tải khách hàng.');
        const mapped = (response.data || []).map((customer: any) => ({
          ...customer, shortName: customer.shortName || customer.name, customerType: customer.customerType || 'TRUCKING',
          status: customer.status || 'ACTIVE', creditLimit: customer.creditLimit || 0, currentDebt: customer.currentDebt || 0,
          paymentTermDays: customer.paymentTermDays || 0, userCount: 0, driverCount: 0, vehicleCount: 0, containerCount: 0,
          gateInCount: 0, createdAt: customer.createdAt || ''
        }));
        setCustomers(mapped);
        setCurrentCustomerId(mapped[0]?.id || '');
        return Promise.all(mapped.map(async (customer: any) => ({
          customerId: customer.id,
          customerCode: customer.code,
          drivers: await customerApi.getDrivers(customer.code),
          vehicles: await customerApi.getVehicles(customer.code),
          users: await customerApi.getUsers(customer.code),
          bookings: await customerApi.getBookings(customer.code)
        }))).then((responses: any[]) => {
          setDrivers(responses.flatMap((result) => (result.drivers.data || []).map((driver: any) => ({
            ...driver, customerId: result.customerId, customerCode: result.customerCode, driverCode: driver.driverCode, fullName: driver.fullName,
            licenseGrade: driver.licenseGrade || 'FC', status: driver.status || 'ACTIVE', createdAt: driver.createdAt || ''
          }))));
          setVehicles(responses.flatMap((result) => (result.vehicles.data || []).map((vehicle: any) => ({
            ...vehicle, customerId: result.customerId, customerCode: result.customerCode, licensePlate: vehicle.plateNumber, plateNumber: vehicle.plateNumber, vehicleType: vehicle.vehicleType || 'TRACTOR',
            payloadTon: vehicle.payloadTon || 0, status: vehicle.status || 'ACTIVE', createdAt: vehicle.createdAt || ''
          }))));
          setUsers(responses.flatMap((result) => (result.users.data || []).map((user: any) => ({
            ...user, customerId: result.customerId, customerCode: result.customerCode, username: user.username, fullName: user.fullName,
            role: user.role || 'CUSTOMER_USER', accountType: user.accountType || 'INTERNAL_ORG', status: user.status || 'ACTIVE',
            createdAt: user.createdAt || '', lastLogin: user.lastLogin || ''
          }))));
          setBookings(responses.flatMap((result) => (result.bookings.data || []).map((booking: any) => ({
            ...booking, bookingNo: booking.bookingNo, customerId: result.customerId, customerCode: result.customerCode, shippingLine: booking.shippingLineCode,
            depot: booking.depotCode, containerCount: booking.containerCount || 0, usedCount: booking.usedCount || 0,
            status: booking.status || 'ACTIVE', issueDate: booking.issueDate, validUntil: booking.validUntil
          }))));
          return containerApi.getAll();
        }).then((containerResponse: any) => {
          if (containerResponse?.statusCode === 200) {
            const jobs = containerResponse.data || [];
            setContainers(jobs.map((job: any) => ({
              id: job.id, containerNo: job.containerNo, isoCode: job.isoSize, size: job.isoSize,
              type: job.isoSize?.includes('R') ? 'REEFER' : 'DRY', shippingLine: job.shippingLineCode,
              customerId: '', status: job.status === 'GATE_OUT' ? 'EXPORTED' : 'IN_DEPOT',
              condition: job.status === 'CLEANING' ? 'CL' : 'AV', bookingNo: '', gateInDate: job.gateInDate,
              gateOutDate: job.gateOutDate, licensePlate: job.gateOutTruckPlate, driverName: job.gateOutDriverName
            })));
            setGateIns(jobs.map((job: any) => ({
              id: job.id, gateInNo: job.gateInEirNo || job.jobNo, customerId: '', customerName: '', bookingNo: '',
              shippingLine: job.shippingLineCode, containerNo: job.containerNo, isoCode: job.isoSize, size: job.isoSize,
              type: job.isoSize?.includes('R') ? 'REEFER' : 'DRY', sealNo: '', driverId: '', driverName: job.gateOutDriverName || '',
              driverPhone: '', vehiclePlate: job.gateOutTruckPlate || '', depot: 'DEPOT-HCM', appointmentDate: job.gateInDate,
              appointmentTime: job.gateInDate, status: job.status === 'CANCELLED' ? 'CANCELLED' : 'GATE_IN',
              qrCodeData: `DEPOT_GATE_IN:${job.jobNo}:${job.containerNo}`, createdAt: job.gateInDate, timeline: []
            })));
          }
        });
      })
      .catch((error) => console.error('Không thể tải CustomerCompany từ backend:', error));
  }, []);

  // Modals & Wizards
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [prefilledBooking, setPrefilledBooking] = useState<CustomerBooking | null>(null);
  const [qrGateIn, setQrGateIn] = useState<GateInRegistration | null>(null);
  const [detailGateIn, setDetailGateIn] = useState<GateInRegistration | null>(null);

  const currentCustomer = customers.find((c) => c.id === currentCustomerId) || customers[0] || null;

  // Select customer to view detail & account info
  const handleSelectCustomer = (customer: CustomerCompany) => {
    setCurrentCustomerId(customer.id);
    setActiveDetailTab('profile');
    setPageView('DETAIL');
  };

  const handleAddCustomer = (newCustomer: CustomerCompany) => {
    void customerApi.create({ code: newCustomer.code, name: newCustomer.name, shortName: newCustomer.name, taxCode: newCustomer.taxCode, phone: newCustomer.phone, email: newCustomer.email, address: newCustomer.address, contactPerson: newCustomer.contactPerson, contactPhone: newCustomer.contactPhone, contactEmail: newCustomer.contactEmail, customerType: newCustomer.type || 'TRUCKING', status: newCustomer.status || 'ACTIVE', creditLimit: newCustomer.creditLimit, paymentTermDays: Number(newCustomer.paymentTerm) || 0 }).then((response: any) => {
      if (response?.statusCode === 200) setCustomers((prev) => [response.data, ...prev]);
    }).catch((error) => console.error('Không thể tạo khách hàng:', error));
  };

  const handleUpdateCustomer = (updatedCustomer: CustomerCompany) => {
    void customerApi.update(updatedCustomer.id, { code: updatedCustomer.code, name: updatedCustomer.name, shortName: updatedCustomer.name, taxCode: updatedCustomer.taxCode, phone: updatedCustomer.phone, email: updatedCustomer.email, address: updatedCustomer.address, contactPerson: updatedCustomer.contactPerson, contactPhone: updatedCustomer.contactPhone, contactEmail: updatedCustomer.contactEmail, customerType: updatedCustomer.type || 'TRUCKING', status: updatedCustomer.status || 'ACTIVE', creditLimit: updatedCustomer.creditLimit, paymentTermDays: Number(updatedCustomer.paymentTerm) || 0 }).then((response: any) => {
      if (response?.statusCode === 200) setCustomers((prev) => prev.map((c) => c.id === updatedCustomer.id ? { ...c, ...updatedCustomer } : c));
    }).catch((error) => console.error('Không thể cập nhật khách hàng:', error));
  };

  const handleAddUser = (newUser: CustomerUser) => {
    const customerCode = customers.find((customer) => customer.id === newUser.customerId)?.code || newUser.customerId;
    void customerApi.createUser({ customerCode, username: newUser.username, fullName: newUser.fullName, email: newUser.email, phone: newUser.phone, role: newUser.role, status: newUser.status }).then((response: any) => { if (response?.statusCode === 200) setUsers((prev) => [response.data, ...prev]); }).catch((error) => console.error('Không thể tạo tài khoản:', error));
  };

  const handleUpdateUser = (updatedUser: CustomerUser) => {
    const customerCode = customers.find((customer) => customer.id === updatedUser.customerId)?.code || updatedUser.customerId;
    void customerApi.updateUser(updatedUser.id, { customerCode, username: updatedUser.username, fullName: updatedUser.fullName, email: updatedUser.email, phone: updatedUser.phone, role: updatedUser.role, status: updatedUser.status }).then((response: any) => { if (response?.statusCode === 200) setUsers((prev) => prev.map((u) => u.id === updatedUser.id ? { ...u, ...updatedUser } : u)); }).catch((error) => console.error('Không thể cập nhật tài khoản:', error));
  };

  const handleDeleteUser = (userId: string) => {
    void customerApi.deactivateUser(userId).then((response: any) => { if (response?.statusCode === 200) setUsers((prev) => prev.filter((u) => u.id !== userId)); }).catch((error) => console.error('Không thể khóa tài khoản:', error));
  };

  const handleAddDriver = (newDriver: DriverRecord, userAccount?: CustomerUser) => {
    const customerCode = customers.find((customer) => customer.id === newDriver.customerId)?.code || newDriver.customerId;
    void customerApi.createDriver({ customerCode, driverCode: newDriver.driverCode, fullName: newDriver.fullName, phone: newDriver.phone, email: newDriver.email, citizenId: newDriver.citizenId, licenseNumber: newDriver.licenseNumber, licenseGrade: newDriver.licenseGrade, licenseExpiryDate: newDriver.licenseExpiryDate, address: newDriver.address, status: newDriver.status }).then((response: any) => { if (response?.statusCode === 200) setDrivers((prev) => [response.data, ...prev]); }).catch((error) => console.error('Không thể tạo tài xế:', error));
    if (userAccount) {
      setUsers((prev) => [userAccount, ...prev]);
    }
  };

  const handleUpdateDriver = (updatedDriver: DriverRecord) => {
    const customerCode = customers.find((customer) => customer.id === updatedDriver.customerId)?.code || updatedDriver.customerId;
    void customerApi.updateDriver(updatedDriver.id, { customerCode, driverCode: updatedDriver.driverCode, fullName: updatedDriver.fullName, phone: updatedDriver.phone, email: updatedDriver.email, citizenId: updatedDriver.citizenId, licenseNumber: updatedDriver.licenseNumber, licenseGrade: updatedDriver.licenseGrade, licenseExpiryDate: updatedDriver.licenseExpiryDate, address: updatedDriver.address, status: updatedDriver.status }).then((response: any) => { if (response?.statusCode === 200) setDrivers((prev) => prev.map((d) => d.id === updatedDriver.id ? { ...d, ...updatedDriver } : d)); }).catch((error) => console.error('Không thể cập nhật tài xế:', error));
  };

  const handleAddVehicle = (newVehicle: VehicleRecord) => {
    const customerCode = customers.find((customer) => customer.id === newVehicle.customerId)?.code || newVehicle.customerId;
    void customerApi.createVehicle({ customerCode, plateNumber: newVehicle.licensePlate, vehicleType: newVehicle.vehicleType, brand: newVehicle.brand, payloadTon: Number(newVehicle.payloadCapacity) || 0, status: newVehicle.status }).then((response: any) => { if (response?.statusCode === 200) setVehicles((prev) => [response.data, ...prev]); }).catch((error) => console.error('Không thể tạo phương tiện:', error));
  };

  const handleCreateGateIn = async (newGateIn: GateInRegistration) => {
    try {
      // Trọng lượng vỏ lấy theo loại container trong DM Loại Container (DB) — trước đây gửi cố định 3800/28680 kg.
      const typeCode = (newGateIn.isoCode || newGateIn.size || '').toUpperCase();
      const containerType = (await fetchContainerTypes()).find(
        (t) => t.typeCode.toUpperCase() === typeCode || t.isoCode.toUpperCase() === typeCode
      );
      if (!containerType || !containerType.tareWeightKg || !containerType.maxPayloadKg) {
        throw new Error(`Loại container "${typeCode}" chưa khai báo Tare / Max payload trong DM Loại Container.`);
      }
      const response: any = await containerApi.createGateIn({
        containerNo: newGateIn.containerNo,
        isoSize: containerType.typeCode,
        shippingLine: newGateIn.shippingLine,
        tareWeightKg: containerType.tareWeightKg,
        maxPayloadKg: containerType.maxPayloadKg,
        truckPlate: newGateIn.vehiclePlate,
        driverName: newGateIn.driverName,
        driverPhone: newGateIn.driverPhone,
        trailerPlate: newGateIn.moocPlate,
        sealNo: newGateIn.sealNo,
        bookingNo: newGateIn.bookingNo
      });
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Backend không thể tạo Gate-In.');
      const job = response.data;
      const persistedGateIn = { ...newGateIn, id: job.id, gateInNo: job.gateInEirNo || newGateIn.gateInNo, status: 'GATE_IN' as const, qrCodeData: `DEPOT_GATE_IN:${job.jobNo}:${newGateIn.containerNo}` };
      setGateIns((prev) => [persistedGateIn, ...prev]);
      setIsWizardOpen(false);
      setPrefilledBooking(null);
      setQrGateIn(persistedGateIn);
    } catch (error) {
      console.error('Không thể tạo Gate-In:', error);
    }
  };

  const handleCancelGateIn = async (gateInId: string) => {
    try {
      const response: any = await containerApi.updateStatus(gateInId, 'CANCELLED');
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể hủy Gate-In trên backend.');
      setGateIns((prev) => prev.map((g) => (g.id === gateInId ? { ...g, status: 'CANCELLED' } : g)));
    } catch (error) {
      console.error('Không thể hủy Gate-In:', error);
    }
  };

  const handleUpdateGateInStatus = async (gateInId: string, newStatus: GateInStatus) => {
    const backendStatus = newStatus === 'COMPLETED' ? 'IN_YARD' : newStatus;
    try {
      const response: any = await containerApi.updateStatus(gateInId, backendStatus);
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể cập nhật trạng thái Gate-In.');
      setGateIns((prev) => prev.map((g) => (g.id === gateInId ? { ...g, status: newStatus } : g)));
    } catch (error) {
      console.error('Không thể cập nhật Gate-In:', error);
    }
  };

  const handleOpenGateInWithBooking = (booking: CustomerBooking) => {
    setPrefilledBooking(booking);
    setIsWizardOpen(true);
  };

  const getCategoryLabel = (cat?: string) => {
    switch (cat) {
      case 'DOANH_NGHIEP':
        return { text: 'Doanh Nghiệp / Tập Đoàn', color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'CONG_TY':
        return { text: 'Công Ty Vận Tải / FWD', color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'KHACH_LE':
        return { text: 'Khách Lẻ / Chủ Xe Cá Nhân', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      default:
        return { text: 'Doanh Nghiệp Vận Tải', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
  };

  // 1. LIST VIEW (Default): Display clean list of customers
  if (pageView === 'LIST') {
    return (
      <div className="space-y-6">
        <CustomerListView
          customers={customers}
          users={users}
          drivers={drivers}
          vehicles={vehicles}
          onSelectCustomer={handleSelectCustomer}
          onAddCustomer={handleAddCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onAddUser={handleAddUser}
        />
      </div>
    );
  }

  if (!currentCustomer) {
    return <div className="p-6 text-sm text-slate-500">Chưa có dữ liệu khách hàng từ backend.</div>;
  }

  const catMeta = getCategoryLabel(currentCustomer.category);

  // 2. DETAIL VIEW: Display selected customer's full account information & workspace
  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setPageView('LIST')}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Danh Sách Khách Hàng</span>
        </button>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          Quản Lý Khách Hàng / <strong className="text-slate-900">{currentCustomer.code}</strong> - {currentCustomer.name}
        </div>
      </div>

      {/* Top Banner: Customer Identity & Switcher */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Customer selector */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg  shrink-0">
            <div className="w-full h-full bg-slate-50 rounded-[14px] flex items-center justify-center text-blue-600">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${catMeta.color}`}>
                {catMeta.text}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                {currentCustomer.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Admin: @{currentCustomer.adminUsername || 'admin'}
              </span>
            </div>
            <div className="relative mt-1">
              <select
                value={currentCustomerId}
                onChange={(e) => setCurrentCustomerId(e.target.value)}
                className="appearance-none pr-8 pl-0 py-0 bg-transparent text-base sm:text-lg font-black text-white focus:outline-none cursor-pointer border-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-slate-900 text-sm">
                    {c.name} ({c.code}) - [{c.category === 'DOANH_NGHIEP' ? 'Doanh nghiệp' : c.category === 'CONG_TY' ? 'Công ty' : 'Khách lẻ'}]
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {currentCustomer.category === 'KHACH_LE' ? 'CCCD' : 'MST'}: {currentCustomer.taxCode} • SĐT: {currentCustomer.phone} • Email: {currentCustomer.email}
            </p>
          </div>
        </div>

        {/* Right: Role Preview Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto justify-end">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <button
              onClick={() => setCurrentRole('CUSTOMER_ADMIN')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                currentRole === 'CUSTOMER_ADMIN'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Admin KH
            </button>
            <button
              onClick={() => setCurrentRole('DISPATCHER')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                currentRole === 'DISPATCHER'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Điều Độ
            </button>
            <button
              onClick={() => setCurrentRole('DRIVER')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                currentRole === 'DRIVER'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tài Xế
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin border-b border-slate-200/80">
        <button
          onClick={() => setActiveDetailTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeDetailTab === 'profile'
              ? 'bg-blue-600 text-white shadow-lg '
              : 'text-slate-500 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Hồ Sơ &amp; Tài Khoản Admin</span>
        </button>

        <button
          onClick={() => setActiveDetailTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeDetailTab === 'accounts'
              ? 'bg-blue-600 text-white shadow-lg '
              : 'text-slate-500 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tài Khoản &amp; Phân Quyền</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-mono">
            {users.filter((u) => u.customerId === currentCustomerId).length}
          </span>
        </button>

        <button
          onClick={() => setActiveDetailTab('gate_in_online')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeDetailTab === 'gate_in_online'
              ? 'bg-blue-600 text-white shadow-lg '
              : 'text-slate-500 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Đăng Ký Gate-In Online</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-50 text-cyan-700 font-mono">
            {gateIns.filter((g) => g.customerId === currentCustomerId).length}
          </span>
        </button>

        <button
          onClick={() => setActiveDetailTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeDetailTab === 'bookings'
              ? 'bg-blue-600 text-white shadow-lg '
              : 'text-slate-500 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Lệnh / Booking</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-50 text-purple-700 font-mono">
            {bookings.filter((b) => b.customerId === currentCustomerId).length}
          </span>
        </button>

        <button
          onClick={() => setActiveDetailTab('containers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeDetailTab === 'containers'
              ? 'bg-blue-600 text-white shadow-lg '
              : 'text-slate-500 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Container Tại Bãi</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-mono">
            {containers.filter((c) => c.customerId === currentCustomerId).length}
          </span>
        </button>

        <button
          onClick={() => setActiveDetailTab('drivers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeDetailTab === 'drivers'
              ? 'bg-blue-600 text-white shadow-lg '
              : 'text-slate-500 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Đội Ngũ Tài Xế</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-mono">
            {drivers.filter((d) => d.customerId === currentCustomerId).length}
          </span>
        </button>

        <button
          onClick={() => setActiveDetailTab('vehicles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeDetailTab === 'vehicles'
              ? 'bg-blue-600 text-white shadow-lg '
              : 'text-slate-500 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Phương Tiện / Đầu Kéo</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-50 text-amber-700 font-mono">
            {vehicles.filter((v) => v.customerId === currentCustomerId).length}
          </span>
        </button>

        <button
          onClick={() => setActiveDetailTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeDetailTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-lg '
              : 'text-slate-500 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tổng Quan (Dashboard)</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div>
        {activeDetailTab === 'profile' && (
          <CustomerAccountProfileTab
            customer={currentCustomer}
            users={users}
            drivers={drivers}
            vehicles={vehicles}
            bookings={bookings}
            containers={containers}
            gateIns={gateIns}
            onNavigateSubTab={setActiveDetailTab}
            onUpdateCustomer={handleUpdateCustomer}
          />
        )}

        {activeDetailTab === 'accounts' && (
          <CustomerAccountsTab
            currentCustomer={currentCustomer}
            users={users}
            drivers={drivers}
            vehicles={vehicles}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSelectRole={(r) => setCurrentRole(r)}
          />
        )}

        {activeDetailTab === 'gate_in_online' && (
          <GateInListView
            currentCustomer={currentCustomer}
            gateIns={gateIns}
            onAddNew={() => setIsWizardOpen(true)}
            onViewDetail={(g) => setDetailGateIn(g)}
            onOpenQR={(g) => setQrGateIn(g)}
            onCancelGateIn={handleCancelGateIn}
          />
        )}

        {activeDetailTab === 'bookings' && (
          <CustomerBookingView
            currentCustomer={currentCustomer}
            bookings={bookings}
            onRegisterGateInWithBooking={handleOpenGateInWithBooking}
          />
        )}

        {activeDetailTab === 'containers' && (
          <CustomerContainerView
            currentCustomer={currentCustomer}
            containers={containers}
          />
        )}

        {activeDetailTab === 'drivers' && (
          <CustomerDriverManagementView
            currentCustomer={currentCustomer}
            drivers={drivers}
            onAddDriver={handleAddDriver}
            onUpdateDriver={handleUpdateDriver}
          />
        )}

        {activeDetailTab === 'vehicles' && (
          <CustomerVehicleManagementView
            currentCustomer={currentCustomer}
            vehicles={vehicles}
            drivers={drivers}
            onAddVehicle={handleAddVehicle}
          />
        )}

        {activeDetailTab === 'dashboard' && (
          <CustomerDashboardView
            currentCustomer={currentCustomer}
            gateIns={gateIns}
            bookings={bookings}
            containers={containers}
            currentRole={currentRole}
            onNavigateTab={setActiveDetailTab}
            onOpenGateInWizard={() => setIsWizardOpen(true)}
            onViewGateInDetail={(g) => setDetailGateIn(g)}
            onOpenQR={(g) => setQrGateIn(g)}
          />
        )}
      </div>

      {/* Gate-In Online Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsWizardOpen(false);
                setPrefilledBooking(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
            >
              ✕
            </button>
            <GateInOnlineWizard
              currentCustomer={currentCustomer}
              currentUser={users.find((u) => u.customerId === currentCustomer.id)}
              bookings={bookings}
              drivers={drivers}
              vehicles={vehicles}
              onCompleteGateIn={handleCreateGateIn}
              onViewList={() => {
                setIsWizardOpen(false);
                setActiveDetailTab('gate_in_online');
              }}
              onOpenQR={(g) => {
                setIsWizardOpen(false);
                setQrGateIn(g);
              }}
            />
          </div>
        </div>
      )}

      {/* Gate-In QR Code Modal */}
      {qrGateIn && (
        <GateInQRCodeModal
          gateIn={qrGateIn}
          onClose={() => setQrGateIn(null)}
        />
      )}

      {/* Gate-In Detail Modal */}
      {detailGateIn && (
        <GateInDetailModal
          gateIn={detailGateIn}
          onClose={() => setDetailGateIn(null)}
          onOpenQR={(g) => {
            setDetailGateIn(null);
            setQrGateIn(g);
          }}
          onUpdateStatus={handleUpdateGateInStatus}
        />
      )}
    </div>
  );
};
