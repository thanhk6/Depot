import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit2,
  Eye,
  Lock,
  Unlock,
  Users,
  Truck,
  Car,
  FileText,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  CustomerCompany,
  CustomerUser,
  DriverRecord,
  VehicleRecord,
  PortalRole,
  CustomerCategory
} from '../types/customerPortal';

interface CustomerManagementViewProps {
  customers: CustomerCompany[];
  users: CustomerUser[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  onSelectCustomer: (customer: CustomerCompany) => void;
  onAddCustomer: (newCustomer: CustomerCompany) => void;
  onUpdateCustomer: (updatedCustomer: CustomerCompany) => void;
  onAddUser: (newUser: CustomerUser) => void;
}

export const CustomerManagementView: React.FC<CustomerManagementViewProps> = ({
  customers,
  users,
  drivers,
  vehicles,
  onSelectCustomer,
  onAddCustomer,
  onUpdateCustomer,
  onAddUser
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCompany | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'users' | 'drivers' | 'vehicles'>('overview');

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<CustomerCategory>('DOANH_NGHIEP');
  const [newCode, setNewCode] = useState<string>('LOG-NEW-01');
  const [newName, setNewName] = useState<string>('');
  const [newTaxCode, setNewTaxCode] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newContactPerson, setNewContactPerson] = useState<string>('');
  const [newAdminUsername, setNewAdminUsername] = useState<string>('admin_new');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('Depot@2026');

  // Add User Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('Password@123');
  const [newUserFullName, setNewUserFullName] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<PortalRole>('CUSTOMER_ADMIN');
  const [newUserPhone, setNewUserPhone] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserAllowGateIn, setNewUserAllowGateIn] = useState<boolean>(true);

  // Filter list
  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.taxCode.includes(searchTerm);
    if (!matchSearch) return false;

    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    return true;
  });

  const handleOpenAddCustomerModal = () => {
    const randomCode = `KH-${Math.floor(100 + Math.random() * 900)}`;
    setNewCategory('DOANH_NGHIEP');
    setNewCode(randomCode);
    setNewName('');
    setNewTaxCode('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewContactPerson('');
    setNewAdminUsername(`admin_${randomCode.toLowerCase()}`);
    setNewAdminPassword('Depot@2026');
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = () => {
    if (!newName || !newTaxCode) {
      alert(
        newCategory === 'KHACH_LE'
          ? 'Vui lòng nhập họ tên chủ xe và Số CCCD/CMND!'
          : 'Vui lòng nhập tên công ty và mã số thuế!'
      );
      return;
    }
    const customerId = `CUST-${Date.now()}`;
    const finalAdminUser = newAdminUsername.trim() || `admin_${newCode.toLowerCase()}`;

    const created: CustomerCompany = {
      id: customerId,
      code: newCode.toUpperCase(),
      name: newName,
      taxCode: newTaxCode,
      phone: newPhone || '028.3999.8888',
      email: newEmail || `${finalAdminUser}@company.vn`,
      address: newAddress || 'TP. Hồ Chí Minh',
      contactPerson: newContactPerson || (newCategory === 'KHACH_LE' ? newName : 'Người đại diện'),
      contactPhone: newPhone || '0903.000.111',
      contactEmail: newEmail || `${finalAdminUser}@company.vn`,
      category: newCategory,
      type: newCategory === 'KHACH_LE' ? 'RETAIL_DRIVER' : 'TRUCKING',
      status: 'ACTIVE',
      creditLimit: newCategory === 'KHACH_LE' ? 0 : 200000000,
      currentDebt: 0,
      paymentTerm: newCategory === 'KHACH_LE' ? 'THANH_TOAN_VIETQR_NGAY' : 'TRẢ_SAU_30_NGÀY',
      truckCount: newCategory === 'KHACH_LE' ? 1 : 5,
      adminUsername: finalAdminUser,
      adminPasswordDefault: newAdminPassword,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    onAddCustomer(created);

    // Automatically provision initial Admin account for customer
    const initialAdminUser: CustomerUser = {
      id: `USR-${Date.now()}`,
      customerId: customerId,
      customerName: newName,
      username: finalAdminUser,
      password: newAdminPassword,
      fullName: newContactPerson || (newCategory === 'KHACH_LE' ? `${newName} (Chủ Xe)` : `Admin ${newName}`),
      email: newEmail || `${finalAdminUser}@company.vn`,
      phone: newPhone || '0903.000.111',
      role: 'CUSTOMER_ADMIN',
      status: 'ACTIVE',
      isDepotProvisioned: true, // Được Depot cấp ban đầu
      allowOnlineGateIn: true,
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: 'Chưa đăng nhập'
    };
    onAddUser(initialAdminUser);

    setIsAddModalOpen(false);
  };

  const handleSaveUser = () => {
    if (!selectedCustomer) return;
    if (!newUsername || !newUserFullName) {
      alert('Vui lòng nhập Username và Họ tên người dùng!');
      return;
    }
    const createdUser: CustomerUser = {
      id: `USR-${Date.now()}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      username: newUsername,
      password: newPassword,
      fullName: newUserFullName,
      email: newUserEmail || `${newUsername}@company.vn`,
      phone: newUserPhone || '0909.123.456',
      role: newUserRole,
      status: 'ACTIVE',
      isDepotProvisioned: false,
      allowOnlineGateIn: newUserAllowGateIn,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    onAddUser(createdUser);
    setIsAddUserModalOpen(false);
    setNewUsername('');
    setNewUserFullName('');
  };

  const getCatBadge = (cat?: CustomerCategory) => {
    switch (cat) {
      case 'DOANH_NGHIEP':
        return {
          label: 'DOANH NGHIỆP',
          badgeClass: 'bg-blue-950 text-blue-300 border-blue-800'
        };
      case 'CONG_TY':
        return {
          label: 'CÔNG TY',
          badgeClass: 'bg-purple-950 text-purple-300 border-purple-800'
        };
      case 'KHACH_LE':
        return {
          label: 'KHÁCH LẺ',
          badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800'
        };
      default:
        return {
          label: 'DOANH NGHIỆP',
          badgeClass: 'bg-slate-800 text-slate-300 border-slate-700'
        };
    }
  };

  const toggleCustomerLock = (c: CustomerCompany) => {
    const nextStatus = c.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    onUpdateCustomer({ ...c, status: nextStatus });
    if (selectedCustomer?.id === c.id) {
      setSelectedCustomer({ ...selectedCustomer, status: nextStatus });
    }
  };

  // If viewing Customer Detail
  if (selectedCustomer) {
    const customerUsers = users.filter((u) => u.customerId === selectedCustomer.id);
    const customerDrivers = drivers.filter((d) => d.customerId === selectedCustomer.id);
    const customerVehicles = vehicles.filter((v) => v.customerId === selectedCustomer.id);

    return (
      <div className="space-y-6 animate-fade-in">
        
        {/* Customer Detail Header */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-xs text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Danh Sách Khách Hàng
                </button>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-400">{selectedCustomer.code}</span>
              </div>
              <h2 className="text-xl font-black text-white">{selectedCustomer.name}</h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs font-mono font-bold rounded-xl border ${
                  selectedCustomer.status === 'ACTIVE'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                {selectedCustomer.status === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' : 'TẠM KHÓA'}
              </span>

              <button
                onClick={() => toggleCustomerLock(selectedCustomer)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                title="Khóa/Mở Khóa"
              >
                {selectedCustomer.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Core Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Mã Số Thuế (MST):</span>
              <span className="font-mono font-bold text-white text-sm">{selectedCustomer.taxCode}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Người Liên Hệ:</span>
              <span className="font-bold text-white">{selectedCustomer.contactPerson} ({selectedCustomer.contactPhone})</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Email Giao Dịch:</span>
              <span className="font-mono text-slate-300">{selectedCustomer.email}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Hạn Mức Tín Dụng:</span>
              <span className="font-mono font-bold text-emerald-400">
                {selectedCustomer.creditLimit.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* 4 Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800 overflow-x-auto">
            {[
              { key: 'overview', label: 'Tab 1: Overview', icon: <Building2 className="w-4 h-4" /> },
              { key: 'users', label: `Tab 2: Users (${customerUsers.length})`, icon: <Users className="w-4 h-4" /> },
              { key: 'drivers', label: `Tab 3: Drivers (${customerDrivers.length})`, icon: <Truck className="w-4 h-4" /> },
              { key: 'vehicles', label: `Tab 4: Vehicles (${customerVehicles.length})`, icon: <Car className="w-4 h-4" /> }
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setDetailTab(t.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  detailTab === t.key
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Overview */}
        {detailTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <h3 className="text-xs font-bold text-pink-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Building2 className="w-4 h-4" />
                <span>Thông Tin Pháp Lý &amp; Trụ Sở</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tên đầy đủ:</span>
                  <span className="font-bold text-white text-right max-w-xs">{selectedCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã khách hàng:</span>
                  <span className="font-mono font-bold text-pink-300">{selectedCustomer.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Địa chỉ trụ sở:</span>
                  <span className="text-slate-200 text-right max-w-xs">{selectedCustomer.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Điện thoại bàn:</span>
                  <span className="font-mono text-slate-200">{selectedCustomer.phone}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Chính Sách Thanh Toán &amp; Vận Hành</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Điều kiện thanh toán:</span>
                  <span className="font-bold text-white">{selectedCustomer.paymentTerm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dư nợ hiện tại:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {selectedCustomer.currentDebt.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số xe đăng ký:</span>
                  <span className="font-bold text-slate-200">{customerVehicles.length} Xe / Đầu kéo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quyền Gate-In Online:</span>
                  <span className="text-emerald-400 font-bold">Đã kích hoạt cấp mã QR tự động</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users */}
        {detailTab === 'users' && (
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-400" />
                  <span>Danh Sách Tài Khoản Người Dùng Của Doanh Nghiệp</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Bao gồm Customer Admin, Dispatcher và các tài khoản Tài xế được cấp phép đăng nhập
                </p>
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tạo Tài Khoản</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Họ Tên</th>
                    <th className="px-4 py-3">Loại Tài Khoản (Role)</th>
                    <th className="px-4 py-3">Số Điện Thoại</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {customerUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-pink-400">{u.username}</td>
                      <td className="px-4 py-3 text-white font-bold">{u.fullName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            u.role === 'CUSTOMER_ADMIN'
                              ? 'bg-purple-950 text-purple-300 border-purple-800'
                              : u.role === 'DISPATCHER'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{u.phone}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            u.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => alert(`Đặt lại mật khẩu cho ${u.username}`)}
                          className="text-[11px] text-slate-400 hover:text-white font-bold cursor-pointer"
                        >
                          Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Drivers */}
        {detailTab === 'drivers' && (
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Danh Sách Tài Xế Trực Thuộc Doanh Nghiệp</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Mã Tài Xế</th>
                    <th className="px-4 py-3">Họ Tên</th>
                    <th className="px-4 py-3">Số Điện Thoại</th>
                    <th className="px-4 py-3">Hạng GPLX</th>
                    <th className="px-4 py-3">Xe Phụ Trách</th>
                    <th className="px-4 py-3">Tài Khoản App</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {customerDrivers.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-pink-400">{d.driverCode}</td>
                      <td className="px-4 py-3 text-white font-bold">{d.fullName}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">{d.phone}</td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-300">
                        {d.licenseGrade} ({d.licenseNumber})
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-200">{d.assignedVehiclePlate}</td>
                      <td className="px-4 py-3">
                        {d.hasUserAccount ? (
                          <span className="text-emerald-400 font-bold font-mono text-[10px]">
                            Có ({d.username})
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[10px]">Chưa cấp</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-400 font-mono font-bold text-[10px]">{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Vehicles */}
        {detailTab === 'vehicles' && (
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-cyan-400" />
              <span>Danh Sách Phương Tiện &amp; Rơ-Moóc Của Doanh Nghiệp</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Biển Số Xe</th>
                    <th className="px-4 py-3">Loại Xe</th>
                    <th className="px-4 py-3">Nhãn Hiệu / Tải Trọng</th>
                    <th className="px-4 py-3">Tài Xế Phụ Trách</th>
                    <th className="px-4 py-3">Hạn Đăng Kiểm</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {customerVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-amber-300">{v.licensePlate}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded text-[10px] font-bold">
                          {v.vehicleType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {v.brand} ({v.payloadCapacity})
                      </td>
                      <td className="px-4 py-3 text-white font-bold">{v.assignedDriverName || 'Chưa gán'}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{v.inspectionExpiry}</td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-400 font-mono font-bold text-[10px]">{v.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Add User */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-400" />
                  <span>Tạo Tài Khoản Cho Khách Hàng</span>
                </h3>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Tên Đăng Nhập (Username):</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="VD: user_tancang01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Mật Khẩu Khởi Tạo:</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Họ và Tên:</label>
                  <input
                    type="text"
                    value={newUserFullName}
                    onChange={(e) => setNewUserFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Loại Tài Khoản (Role):</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as PortalRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-pink-500 focus:outline-none"
                  >
                    <option value="CUSTOMER_ADMIN">Customer Admin (Quản trị doanh nghiệp)</option>
                    <option value="DISPATCHER">Dispatcher (Điều phối viên)</option>
                    <option value="DRIVER">Driver (Tài xế Gate-In Online)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="0909.xxx.xxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl"
                >
                  Lưu Tài Khoản
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Master Customer List View
  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>QUẢN TRỊ KHÁCH HÀNG (DOANH NGHIỆP / CÔNG TY / KHÁCH LẺ)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý thông tin Doanh nghiệp, Công ty vận tải &amp; Khách lẻ, cấp phát tài khoản Admin ban đầu và phân quyền
          </p>
        </div>

        <button
          onClick={handleOpenAddCustomerModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khách Hàng Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo tên công ty, mã khách hàng, MST/CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Tất cả Phân Loại ({customers.length})</option>
          <option value="DOANH_NGHIEP">Doanh Nghiệp / Tập Đoàn</option>
          <option value="CONG_TY">Công Ty Vận Tải / FWD</option>
          <option value="KHACH_LE">Khách Lẻ / Cá Nhân</option>
        </select>
      </div>

      {/* Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Mã KH</th>
                <th className="px-4 py-3.5">Phân Loại</th>
                <th className="px-4 py-3.5">Tên Khách Hàng / Đại Diện</th>
                <th className="px-4 py-3.5">MST / CCCD</th>
                <th className="px-4 py-3.5">Admin Được Cấp</th>
                <th className="px-4 py-3.5">Số Tài Khoản</th>
                <th className="px-4 py-3.5">Số Tài Xế</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-4 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredCustomers.map((c) => {
                const userCount = users.filter((u) => u.customerId === c.id).length;
                const driverCount = drivers.filter((d) => d.customerId === c.id).length;
                const badge = getCatBadge(c.category);
                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-400">{c.code}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.badgeClass}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.contactPerson} • {c.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300 font-bold">{c.taxCode}</td>
                    <td className="px-4 py-3 font-mono text-amber-300 font-bold">
                      @{c.adminUsername || 'admin'}
                    </td>
                    <td className="px-4 py-3 font-mono text-white font-bold">{userCount} Users</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{driverCount} Tài xế</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          c.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onSelectCustomer(c);
                          }}
                          title="Chọn làm khách hàng hiện tại và quản lý"
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs rounded-lg border border-blue-500/30 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quản Lý</span>
                        </button>
                        <button
                          onClick={() => toggleCustomerLock(c)}
                          title="Khóa/Mở Khóa"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                        >
                          {c.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Thêm Mới Khách Hàng &amp; Cấp Tài Khoản Admin</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Category Selector */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Loại Hình Khách Hàng: <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCategory('DOANH_NGHIEP')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                      newCategory === 'DOANH_NGHIEP'
                        ? 'bg-blue-950 border-blue-500 text-blue-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Doanh Nghiệp
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('CONG_TY')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                      newCategory === 'CONG_TY'
                        ? 'bg-purple-950 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Công Ty
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('KHACH_LE')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                      newCategory === 'KHACH_LE'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Khách Lẻ (Cá Nhân)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Mã Khách Hàng:</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">
                    {newCategory === 'KHACH_LE' ? 'Số CCCD / CMND:' : 'Mã Số Thuế (MST):'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTaxCode}
                    onChange={(e) => setNewTaxCode(e.target.value)}
                    placeholder={newCategory === 'KHACH_LE' ? '0790xxxxxxxx' : '030xxxxxxx'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">
                  {newCategory === 'KHACH_LE' ? 'Họ Tên Khách Lẻ / Bác Tài:' : 'Tên Công Ty / Doanh Nghiệp:'} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={newCategory === 'KHACH_LE' ? 'Nguyễn Văn A (Chủ Xe Cá Nhân)' : 'CÔNG TY TNHH VẬN TẢI ...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0903.xxxx.xxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Email Liên Hệ:</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="contact@company.vn"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Người Đại Diện / Chủ Xe:</label>
                <input
                  type="text"
                  value={newContactPerson}
                  onChange={(e) => setNewContactPerson(e.target.value)}
                  placeholder="Họ tên người liên hệ..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Địa Chỉ:</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Số nhà, Đường, Quận/Huyện, Tỉnh..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Initial Depot Provisioned Admin Card */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cấp Tài Khoản Admin Ban Đầu (Depot Provisioned):</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Username Admin:</label>
                    <input
                      type="text"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Mật Khẩu Ban Đầu:</label>
                    <input
                      type="text"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-300 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Khách hàng sẽ dùng tài khoản này để đăng nhập và tự thêm các tài khoản tài xế, điều độ.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCustomer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30"
              >
                Tạo Khách Hàng &amp; Cấp Admin
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
