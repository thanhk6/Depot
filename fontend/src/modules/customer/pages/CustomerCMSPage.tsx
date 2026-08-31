import React, { useState } from 'react';
import {
  CustomerCompany,
  CustomerUser,
  DriverRecord,
  VehicleRecord,
  CustomerActivityLog
} from '../types/customerTypes';
import {
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_USERS,
  INITIAL_DRIVERS,
  INITIAL_VEHICLES,
  INITIAL_ACTIVITY_LOGS
} from '../data/customerData';
import { CustomerDataGrid } from '../components/CustomerDataGrid';
import { CustomerDetailView } from '../components/CustomerDetailView';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const CustomerCMSPage: React.FC = () => {
  // Master state
  const [customers, setCustomers] = useState<CustomerCompany[]>(INITIAL_CUSTOMERS);
  const [users, setUsers] = useState<CustomerUser[]>(INITIAL_CUSTOMER_USERS);
  const [drivers, setDrivers] = useState<DriverRecord[]>(INITIAL_DRIVERS);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(INITIAL_VEHICLES);
  const [activityLogs, setActivityLogs] = useState<CustomerActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Selected customer for Detail View
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Modal states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerCompany | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  // CUSTOMER ACTIONS
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer: CustomerCompany) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (customerData: Partial<CustomerCompany>) => {
    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...customerData, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : c))
      );
      showToast(`Đã cập nhật thông tin khách hàng ${customerData.name || editingCustomer.name}`);
    } else {
      const newCustomer: CustomerCompany = {
        id: `CUST-${Date.now().toString().slice(-4)}`,
        code: customerData.code || `CUST-${Date.now().toString().slice(-4)}`,
        name: customerData.name || 'Khách hàng mới',
        shortName: customerData.shortName || 'Khách hàng',
        taxCode: customerData.taxCode || '0000000000',
        phone: customerData.phone || '',
        email: customerData.email || '',
        address: customerData.address || '',
        contactPerson: customerData.contactPerson || '',
        contactPhone: customerData.contactPhone || '',
        contactEmail: customerData.contactEmail || '',
        customerType: customerData.customerType || 'LOGISTICS',
        status: 'ACTIVE',
        creditLimit: customerData.creditLimit || 500000000,
        currentDebt: 0,
        paymentTermDays: customerData.paymentTermDays || 30,
        notes: customerData.notes || '',
        userCount: 0,
        driverCount: 0,
        vehicleCount: 0,
        containerCount: 0,
        gateInCount: 0,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      showToast(`Đã thêm khách hàng mới: ${newCustomer.name}`);
    }
  };

  const handleToggleCustomerStatus = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const nextStatus = c.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
          showToast(
            nextStatus === 'ACTIVE'
              ? `Đã mở khóa hoạt động cho khách hàng ${c.shortName}`
              : `Đã tạm khóa khách hàng ${c.shortName} (chặn tạo lệnh Gate-In)`,
            nextStatus === 'ACTIVE' ? 'success' : 'warning'
          );

          // Add log
          const newLog: CustomerActivityLog = {
            id: `LOG-${Date.now()}`,
            customerId,
            action: nextStatus === 'ACTIVE' ? 'Mở khóa khách hàng' : 'Khóa khách hàng',
            performedBy: 'Nguyễn Văn Hùng (Quản trị Depot)',
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            details: `Trạng thái được chuyển sang ${nextStatus}`,
            type: nextStatus === 'ACTIVE' ? 'SUCCESS' : 'WARNING'
          };
          setActivityLogs((logs) => [newLog, ...logs]);

          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // USER ACTIONS
  const handleAddUser = (newUserData: Omit<CustomerUser, 'id' | 'createdAt' | 'lastLogin'>) => {
    const newUser: CustomerUser = {
      ...newUserData,
      id: `USR-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lastLogin: ''
    };
    setUsers((prev) => [...prev, newUser]);
    // update customer userCount
    setCustomers((prev) =>
      prev.map((c) => (c.id === newUserData.customerId ? { ...c, userCount: c.userCount + 1 } : c))
    );
    showToast(`Đã tạo tài khoản ${newUser.username} (${newUser.fullName})`);
  };

  const handleUpdateUser = (userId: string, updatedData: Partial<CustomerUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updatedData } : u)));
    showToast('Đã cập nhật thông tin tài khoản');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
          showToast(
            nextStatus === 'ACTIVE' ? `Đã mở khóa tài khoản ${u.username}` : `Đã khóa tài khoản ${u.username}`,
            nextStatus === 'ACTIVE' ? 'success' : 'warning'
          );
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleResetPassword = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    showToast(`Đã thiết lập lại mật khẩu thành công cho tài khoản ${user?.username || ''}`);
  };

  // DRIVER ACTIONS
  const handleAddDriver = (newDriverData: Omit<DriverRecord, 'id' | 'createdAt'>) => {
    const newDriver: DriverRecord = {
      ...newDriverData,
      id: `DRV-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setDrivers((prev) => [...prev, newDriver]);
    // update customer driverCount
    setCustomers((prev) =>
      prev.map((c) => (c.id === newDriverData.customerId ? { ...c, driverCount: c.driverCount + 1 } : c))
    );
    showToast(`Đã thêm tài xế: ${newDriver.fullName} (${newDriver.driverCode})`);
  };

  const handleUpdateDriver = (driverId: string, updatedData: Partial<DriverRecord>) => {
    setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, ...updatedData } : d)));
    showToast('Đã cập nhật hồ sơ tài xế');
  };

  const handleToggleDriverStatus = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const nextStatus = d.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
          showToast(
            nextStatus === 'ACTIVE' ? `Đã mở khóa tài xế ${d.fullName}` : `Đã khóa tài xế ${d.fullName}`,
            nextStatus === 'ACTIVE' ? 'success' : 'warning'
          );
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  // VEHICLE ACTIONS
  const handleAddVehicle = (newVehicleData: Omit<VehicleRecord, 'id' | 'createdAt'>) => {
    const newVehicle: VehicleRecord = {
      ...newVehicleData,
      id: `VEH-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setVehicles((prev) => [...prev, newVehicle]);
    // update customer vehicleCount
    setCustomers((prev) =>
      prev.map((c) => (c.id === newVehicleData.customerId ? { ...c, vehicleCount: c.vehicleCount + 1 } : c))
    );
    showToast(`Đã thêm phương tiện: ${newVehicle.plateNumber}`);
  };

  const handleUpdateVehicle = (vehicleId: string, updatedData: Partial<VehicleRecord>) => {
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, ...updatedData } : v)));
    showToast('Đã cập nhật thông tin phương tiện');
  };

  const handleToggleVehicleStatus = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const nextStatus = v.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
          showToast(
            nextStatus === 'ACTIVE' ? `Đã mở khóa xe ${v.plateNumber}` : `Đã tạm ngưng xe ${v.plateNumber}`,
            nextStatus === 'ACTIVE' ? 'success' : 'warning'
          );
          return { ...v, status: nextStatus };
        }
        return v;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl animate-fade-in text-xs font-semibold">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main View Switch: DataGrid vs Detail View */}
      {selectedCustomer ? (
        <CustomerDetailView
          customer={selectedCustomer}
          users={users}
          drivers={drivers}
          vehicles={vehicles}
          activityLogs={activityLogs}
          onBackToList={() => setSelectedCustomerId(null)}
          onEditCustomer={handleEditCustomer}
          onToggleStatus={handleToggleCustomerStatus}
          // User
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onToggleUserStatus={handleToggleUserStatus}
          onResetPassword={handleResetPassword}
          // Driver
          onAddDriver={handleAddDriver}
          onUpdateDriver={handleUpdateDriver}
          onToggleDriverStatus={handleToggleDriverStatus}
          // Vehicle
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onToggleVehicleStatus={handleToggleVehicleStatus}
        />
      ) : (
        <CustomerDataGrid
          customers={customers}
          onSelectCustomer={(c) => setSelectedCustomerId(c.id)}
          onAddCustomer={handleAddCustomer}
          onEditCustomer={handleEditCustomer}
          onToggleStatus={handleToggleCustomerStatus}
        />
      )}

      {/* Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        customer={editingCustomer}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
      />
    </div>
  );
};
