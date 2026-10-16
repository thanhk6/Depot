import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  ShieldCheck,
  UserCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  Truck,
  Car,
  Phone,
  Mail,
  Building2,
  Sparkles,
  Zap,
  LogIn,
  RotateCw,
  Trash2,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  CustomerCompany,
  CustomerUser,
  DriverRecord,
  VehicleRecord,
  PortalRole
} from '../types/customerPortal';
import { generateTempPassword } from '../utils/tempPassword';

interface CustomerAccountsTabProps {
  currentCustomer: CustomerCompany;
  users: CustomerUser[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  onAddUser: (newUser: CustomerUser) => void;
  onUpdateUser: (updatedUser: CustomerUser) => void;
  onDeleteUser?: (userId: string) => void;
  onSelectRole?: (role: PortalRole) => void;
}

export const CustomerAccountsTab: React.FC<CustomerAccountsTabProps> = ({
  currentCustomer,
  users,
  drivers,
  vehicles,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSelectRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CustomerUser | null>(null);
  const [resetPassUser, setResetPassUser] = useState<CustomerUser | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [isQuickProvisionOpen, setIsQuickProvisionOpen] = useState(false);

  // Form State for Add / Edit
  const [formRole, setFormRole] = useState<PortalRole>('DRIVER');
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState(() => generateTempPassword());
  const [formAllowGateIn, setFormAllowGateIn] = useState(true);
  const [formSelectedDriverId, setFormSelectedDriverId] = useState<string>('');
  const [formAssignedVehicle, setFormAssignedVehicle] = useState<string>('');
  const [formAssignedMooc, setFormAssignedMooc] = useState<string>('');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter users belonging to current customer
  const customerUsers = useMemo(() => {
    return users.filter((u) => u.customerId === currentCustomer.id);
  }, [users, currentCustomer.id]);

  // Primary Admin account (Depot Provisioned)
  const masterAdminUser = useMemo(() => {
    return (
      customerUsers.find((u) => u.role === 'CUSTOMER_ADMIN' && u.isDepotProvisioned) ||
      customerUsers.find((u) => u.role === 'CUSTOMER_ADMIN') ||
      customerUsers[0]
    );
  }, [customerUsers]);

  // Drivers of this customer without an account
  const driversWithoutAccount = useMemo(() => {
    const existingDriverIds = new Set(
      customerUsers.filter((u) => u.driverId).map((u) => u.driverId)
    );
    return drivers.filter(
      (d) => d.customerId === currentCustomer.id && !existingDriverIds.has(d.id)
    );
  }, [drivers, customerUsers, currentCustomer.id]);

  // Filtered sub-accounts list
  const filteredUsers = useMemo(() => {
    return customerUsers.filter((u) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        u.username.toLowerCase().includes(searchLower) ||
        u.fullName.toLowerCase().includes(searchLower) ||
        u.phone.includes(searchTerm) ||
        (u.assignedVehiclePlate && u.assignedVehiclePlate.toLowerCase().includes(searchLower)) ||
        (u.email && u.email.toLowerCase().includes(searchLower));

      if (!matchSearch) return false;

      // Role filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;

      return true;
    });
  }, [customerUsers, searchTerm, roleFilter, statusFilter]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormRole('DRIVER');
    setFormUsername('');
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword(generateTempPassword());
    setFormAllowGateIn(true);
    setFormSelectedDriverId('');
    setFormAssignedVehicle('');
    setFormAssignedMooc('');
    setIsAddModalOpen(true);
  };

  const handleSelectDriverInForm = (driverId: string) => {
    setFormSelectedDriverId(driverId);
    const drv = drivers.find((d) => d.id === driverId);
    if (drv) {
      setFormFullName(drv.fullName);
      setFormPhone(drv.phone);
      setFormEmail(drv.email || `${drv.phone}@tancang.vn`);
      setFormUsername(`tx_${drv.phone}`);
      setFormAssignedVehicle(drv.assignedVehiclePlate || '');
      setFormAssignedMooc(drv.assignedMoocPlate || '');
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formFullName.trim()) {
      alert('Vui lòng nhập đầy đủ Tên đăng nhập và Họ tên!');
      return;
    }

    if (editingUser) {
      // Update
      const updated: CustomerUser = {
        ...editingUser,
        username: formUsername.trim(),
        fullName: formFullName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        role: formRole,
        allowOnlineGateIn: formAllowGateIn,
        driverId: formRole === 'DRIVER' ? formSelectedDriverId || editingUser.driverId : undefined,
        assignedVehiclePlate: formRole === 'DRIVER' ? formAssignedVehicle : undefined,
        assignedMoocPlate: formRole === 'DRIVER' ? formAssignedMooc : undefined
      };
      onUpdateUser(updated);
      showToast(`Đã cập nhật thông tin tài khoản "${updated.username}"`);
    } else {
      // Check username collision
      if (users.some((u) => u.username.toLowerCase() === formUsername.trim().toLowerCase())) {
        alert('Tên đăng nhập đã tồn tại trong hệ thống. Vui lòng chọn tên khác!');
        return;
      }

      const newUser: CustomerUser = {
        id: `USR-${Date.now().toString().slice(-6)}`,
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        username: formUsername.trim(),
        password: formPassword,
        fullName: formFullName.trim(),
        phone: formPhone.trim() || currentCustomer.phone,
        email: formEmail.trim() || `${formUsername.trim()}@company.vn`,
        role: formRole,
        status: 'ACTIVE',
        isDepotProvisioned: false, // Tự tạo bởi Admin KH
        createdByAdminId: masterAdminUser?.id,
        allowOnlineGateIn: formAllowGateIn,
        driverId: formRole === 'DRIVER' ? formSelectedDriverId : undefined,
        driverName: formRole === 'DRIVER' ? formFullName : undefined,
        assignedVehiclePlate: formRole === 'DRIVER' ? formAssignedVehicle : undefined,
        assignedMoocPlate: formRole === 'DRIVER' ? formAssignedMooc : undefined,
        createdAt: new Date().toISOString().slice(0, 10),
        lastLogin: 'Chưa đăng nhập'
      };

      onAddUser(newUser);
      showToast(`Đã thêm thành công tài khoản "${newUser.username}" cho ${formFullName}!`);
    }

    setIsAddModalOpen(false);
  };

  const handleToggleAllowGateIn = (user: CustomerUser) => {
    const updated: CustomerUser = {
      ...user,
      allowOnlineGateIn: !user.allowOnlineGateIn
    };
    onUpdateUser(updated);
    showToast(
      updated.allowOnlineGateIn
        ? `Đã BẬT quyền Tự Gate-In Online cho tài khoản "${user.username}"`
        : `Đã TẮT quyền Tự Gate-In Online cho tài khoản "${user.username}"`
    );
  };

  const handleToggleStatus = (user: CustomerUser) => {
    const newStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    const updated: CustomerUser = {
      ...user,
      status: newStatus
    };
    onUpdateUser(updated);
    showToast(
      newStatus === 'ACTIVE'
        ? `Đã mở khóa tài khoản "${user.username}"`
        : `Đã khóa tài khoản "${user.username}"`
    );
  };

  const handleExecuteQuickProvision = () => {
    let countAdded = 0;
    driversWithoutAccount.forEach((drv) => {
      const generatedUsername = `tx_${drv.phone}`;
      if (!users.some((u) => u.username === generatedUsername)) {
        const newUser: CustomerUser = {
          id: `USR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
          customerId: currentCustomer.id,
          customerName: currentCustomer.name,
          username: generatedUsername,
          password: generateTempPassword(),
          fullName: `${drv.fullName} (Tài Xế)`,
          phone: drv.phone,
          email: drv.email || `${drv.phone}@tancang.vn`,
          role: 'DRIVER',
          status: 'ACTIVE',
          isDepotProvisioned: false,
          createdByAdminId: masterAdminUser?.id,
          allowOnlineGateIn: true,
          driverId: drv.id,
          driverName: drv.fullName,
          assignedVehiclePlate: drv.assignedVehiclePlate,
          assignedMoocPlate: drv.assignedMoocPlate,
          createdAt: new Date().toISOString().slice(0, 10),
          lastLogin: 'Chưa đăng nhập'
        };
        onAddUser(newUser);
        countAdded++;
      }
    });

    setIsQuickProvisionOpen(false);
    showToast(`Đã tự động tạo và phân quyền Gate-In online cho ${countAdded} tài xế trong đội xe!`);
  };

  const handleCopyCredentials = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'DOANH_NGHIEP':
        return {
          label: 'DOANH NGHIỆP / TẬP ĐOÀN',
          desc: 'Quản lý đa phòng ban, điều độ và toàn bộ tài xế',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'CONG_TY':
        return {
          label: 'CÔNG TY VẬN TẢI / FWD',
          desc: 'Quản lý đội xe vận tải và tài khoản tài xế',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'KHACH_LE':
        return {
          label: 'KHÁCH LẺ / CHỦ XE CÁ NHÂN',
          desc: 'Chủ xe kiêm tài xế tự đăng ký và Gate-In Online',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      default:
        return {
          label: 'DOANH NGHIỆP VẬN TẢI',
          desc: 'Khách hàng đối tác Depot',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const catInfo = getCategoryBadge(currentCustomer.category);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-50 border border-emerald-500 text-emerald-200 shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: CUSTOMER OVERVIEW & PROVISIONING ARCHITECTURE */}
      {/* ========================================================================= */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold font-mono ${catInfo.badgeClass}`}>
                  {catInfo.label}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Mã KH: <strong className="text-slate-900">{currentCustomer.code}</strong>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  MST/CCCD: <strong className="text-slate-700">{currentCustomer.taxCode}</strong>
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Quản Lý Đa Tài Khoản &amp; Phân Quyền Tài Xế Tự Gate-In Online
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {catInfo.desc}. Tài khoản Admin do Depot cấp ban đầu; Admin có quyền tự tạo và cấp phát tài khoản cho Tài xế, Điều độ và Kế toán.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {driversWithoutAccount.length > 0 && (
              <button
                onClick={() => setIsQuickProvisionOpen(true)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer shadow-lg "
              >
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Cấp Nhanh Cho {driversWithoutAccount.length} Bác Tài</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg  transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Tài Khoản Mới</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: DEPOT PROVISIONED ADMIN MASTER CARD */}
        {/* ========================================================================= */}
        {masterAdminUser && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-amber-200 shadow-inner flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold font-mono">
                    [TÀI KHOẢN ADMIN ĐƯỢC DEPOT CẤP]
                  </span>
                  <span className="text-xs font-black text-slate-900 font-mono">
                    Username: {masterAdminUser.username}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Đang hoạt động
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-semibold mt-1">
                  Đại diện: {masterAdminUser.fullName} &bull; SĐT: {masterAdminUser.phone} &bull; Email: {masterAdminUser.email}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Quyền hạn: Toàn quyền quản trị cổng thông tin khách hàng, tự thêm/sửa/xóa tài khoản con và cấp quyền tự Gate-In cho đội xe.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => handleCopyCredentials(`Username: ${masterAdminUser.username}\nMật khẩu: ${currentCustomer.adminPasswordDefault || 'TanCang@2026'}\nĐăng nhập: https://depot-portal.com`, 'Admin Credentials')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedNotification === 'Admin Credentials' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sao Chép Đăng Nhập</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setResetPassUser(masterAdminUser);
                  setNewPasswordValue('');
                }}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Đổi Mật Khẩu Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: SUMMARY METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tổng Tài Khoản
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {customerUsers.length}
            </div>
            <span className="text-[10px] text-slate-500">Thuộc {currentCustomer.code || currentCustomer.name?.split(' ')?.[0] || ''}</span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Tài Xế Tự Gate-In
            </span>
            <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
              {customerUsers.filter((u) => u.allowOnlineGateIn && u.role === 'DRIVER').length}
            </div>
            <span className="text-[10px] text-slate-500">Được cấp quyền tự tạo lệnh</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider">
              Điều Độ &amp; Kế Toán
            </span>
            <div className="text-2xl font-black font-mono text-cyan-600 mt-1">
              {customerUsers.filter((u) => u.role === 'DISPATCHER' || u.role === 'ACCOUNTANT').length}
            </div>
            <span className="text-[10px] text-slate-500">Nhân sự văn phòng</span>
          </div>
          <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-600 rounded-xl font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              Chưa Có Tài Khoản
            </span>
            <div className="text-2xl font-black font-mono text-purple-600 mt-1">
              {driversWithoutAccount.length}
            </div>
            <span className="text-[10px] text-slate-500">Bác tài trong danh sách</span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 text-purple-600 rounded-xl font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: FILTER & SEARCH TOOLBAR */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Username, Họ tên, SĐT, Biển số xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả Vai Trò ({customerUsers.length})</option>
            <option value="CUSTOMER_ADMIN">Admin Doanh Nghiệp</option>
            <option value="DISPATCHER">Điều Độ Viên (Dispatcher)</option>
            <option value="DRIVER">Tài Xế (Driver)</option>
            <option value="ACCOUNTANT">Kế Toán (Accountant)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả Trạng Thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="LOCKED">Tạm khóa</option>
          </select>

          <span className="text-xs text-slate-500 font-mono pl-2">
            Hiển thị: <strong className="text-slate-900">{filteredUsers.length}</strong> tài khoản
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: SUB-ACCOUNTS DATA TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Tài Khoản / Người Dùng</th>
                <th className="py-3.5 px-4">Vai Trò (Role)</th>
                <th className="py-3.5 px-4 text-center">Tự Gate-In Online</th>
                <th className="py-3.5 px-4">Xe Gán / Rơ-Moóc</th>
                <th className="py-3.5 px-4">Liên Hệ (SĐT / Email)</th>
                <th className="py-3.5 px-4">Đăng Nhập Cuối</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-sans text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isDriver = u.role === 'DRIVER';
                  const linkedDriver = drivers.find((d) => d.id === u.driverId || d.phone === u.phone);

                  return (
                    <tr key={u.id} className="hover:bg-slate-850/50 transition">
                      {/* User identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs ${
                            u.role === 'CUSTOMER_ADMIN'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : u.role === 'DISPATCHER'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : u.role === 'DRIVER'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {u.role === 'CUSTOMER_ADMIN' ? 'AD' : u.role === 'DISPATCHER' ? 'DP' : u.role === 'DRIVER' ? 'TX' : 'KT'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {u.isDepotProvisioned && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-mono">
                                  DEPOT CẤP
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-xs text-slate-500 flex items-center gap-2">
                              <span>@{u.username}</span>
                              {u.status === 'LOCKED' && (
                                <span className="text-[10px] text-rose-600 font-bold">[TẠM KHÓA]</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 font-sans">
                        {u.role === 'CUSTOMER_ADMIN' && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                            Admin Doanh Nghiệp
                          </span>
                        )}
                        {u.role === 'DISPATCHER' && (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                            Điều Độ (Dispatcher)
                          </span>
                        )}
                        {u.role === 'DRIVER' && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            Tài Xế (Driver)
                          </span>
                        )}
                        {u.role === 'ACCOUNTANT' && (
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
                            Kế Toán / Đối Soát
                          </span>
                        )}
                      </td>

                      {/* Online Gate-In Permission Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleAllowGateIn(u)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                            u.allowOnlineGateIn
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Bật/Tắt quyền cho tài khoản này tự thực hiện Gate-In Online"
                        >
                          {u.allowOnlineGateIn ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Cho Phép Tự Gate-In</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-slate-500" />
                              <span>Chưa Cấp Quyền</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Assigned Vehicle */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {u.assignedVehiclePlate ? (
                          <div>
                            <div className="font-bold text-cyan-700 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-cyan-600" />
                              <span>{u.assignedVehiclePlate}</span>
                            </div>
                            {u.assignedMoocPlate && (
                              <div className="text-[11px] text-slate-500">
                                Moóc: {u.assignedMoocPlate}
                              </div>
                            )}
                          </div>
                        ) : isDriver && linkedDriver?.assignedVehiclePlate ? (
                          <div>
                            <div className="font-bold text-cyan-700 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-cyan-600" />
                              <span>{linkedDriver.assignedVehiclePlate}</span>
                            </div>
                            {linkedDriver.assignedMoocPlate && (
                              <div className="text-[11px] text-slate-500">
                                Moóc: {linkedDriver.assignedMoocPlate}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 font-sans italic">Toàn bộ đội xe</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="text-slate-700 font-semibold">{u.phone}</div>
                        <div className="text-[11px] text-slate-500 font-sans truncate max-w-xs">{u.email}</div>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        {u.lastLogin || 'Chưa đăng nhập'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResetPassUser(u);
                              setNewPasswordValue('');
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Đổi mật khẩu"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setFormRole(u.role);
                              setFormUsername(u.username);
                              setFormFullName(u.fullName);
                              setFormPhone(u.phone);
                              setFormEmail(u.email);
                              setFormAllowGateIn(u.allowOnlineGateIn ?? true);
                              setFormSelectedDriverId(u.driverId || '');
                              setFormAssignedVehicle(u.assignedVehiclePlate || '');
                              setFormAssignedMooc(u.assignedMoocPlate || '');
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Lock / Unlock */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                                : 'text-rose-600 hover:text-emerald-600 hover:bg-slate-100'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                          >
                            {u.status === 'ACTIVE' ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete if not depot provisioned */}
                          {!u.isDepotProvisioned && onDeleteUser && (
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.username}"?`)) {
                                  onDeleteUser(u.id);
                                  showToast(`Đã xóa tài khoản "${u.username}"`);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Xóa tài khoản con"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT ACCOUNT */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl">
                  {editingUser ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Mới Tài Khoản Cho Khách Hàng'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Khách hàng: {currentCustomer.name} ({currentCustomer.code})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vai Trò Tài Khoản (Role) <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRole('DRIVER')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      formRole === 'DRIVER'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <Truck className="w-4 h-4 mb-1 text-emerald-600" />
                    <div className="text-xs font-bold">Tài Xế</div>
                    <div className="text-[10px] text-slate-500">Tự Gate-In Online</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('DISPATCHER')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      formRole === 'DISPATCHER'
                        ? 'bg-blue-50 border-blue-500 text-blue-200'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 mb-1 text-blue-600" />
                    <div className="text-xs font-bold">Điều Độ</div>
                    <div className="text-[10px] text-slate-500">Quản lý đội xe</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('ACCOUNTANT')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      formRole === 'ACCOUNTANT'
                        ? 'bg-purple-50 border-purple-500 text-purple-200'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-1 text-purple-600" />
                    <div className="text-xs font-bold">Kế Toán</div>
                    <div className="text-[10px] text-slate-500">Đối soát công nợ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('CUSTOMER_ADMIN')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      formRole === 'CUSTOMER_ADMIN'
                        ? 'bg-amber-50 border-amber-500 text-amber-200'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mb-1 text-amber-600" />
                    <div className="text-xs font-bold">Admin Phụ</div>
                    <div className="text-[10px] text-slate-500">Quản trị viên</div>
                  </button>
                </div>
              </div>

              {/* If Driver: option to select existing driver */}
              {formRole === 'DRIVER' && driversWithoutAccount.length > 0 && !editingUser && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chọn nhanh từ danh sách Bác Tài trong đội xe:</span>
                    </label>
                  </div>
                  <select
                    value={formSelectedDriverId}
                    onChange={(e) => handleSelectDriverInForm(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-900 rounded-xl focus:outline-none"
                  >
                    <option value="">-- Nhập thông tin tài xế mới --</option>
                    {driversWithoutAccount.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.driverCode}) - SĐT: {d.phone} - Xe: {d.assignedVehiclePlate}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên Đăng Nhập (Username) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: tx_hung, dispatch_tancang"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    disabled={!!editingUser}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và Tên <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Nguyễn Văn Hùng"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Điện Thoại <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0903.xxx.xxx"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    placeholder="email@company.vn"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Driver Vehicle Assignment */}
              {formRole === 'DRIVER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Biển Số Đầu Kéo Mặc Định
                    </label>
                    <input
                      type="text"
                      placeholder="ví dụ: 51C-889.90"
                      value={formAssignedVehicle}
                      onChange={(e) => setFormAssignedVehicle(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-cyan-700 uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Biển Số Rơ-Moóc (Chassis)
                    </label>
                    <input
                      type="text"
                      placeholder="ví dụ: 51R-023.45"
                      value={formAssignedMooc}
                      onChange={(e) => setFormAssignedMooc(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-cyan-700 uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Password for new user */}
              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật Khẩu Khởi Tạo <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-amber-700 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-500">Mật khẩu mặc định có thể đổi sau khi đăng nhập lần đầu.</span>
                </div>
              )}

              {/* Permission Checkbox: Allow online gate-in */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cho phép tài khoản này tự Đăng Ký Gate-In Online</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tài xế có thể dùng điện thoại tự tạo lệnh Gate-In, sinh mã QR e-Pass vào cổng depot.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formAllowGateIn}
                  onChange={(e) => setFormAllowGateIn(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded bg-white border-slate-200 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg "
                >
                  {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESET PASSWORD */}
      {/* ========================================================================= */}
      {resetPassUser && (
        <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">Đổi Mật Khẩu Tài Khoản</h3>
              </div>
              <button
                onClick={() => setResetPassUser(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-700">
                Đang cấp lại mật khẩu cho tài khoản: <strong className="text-slate-900 font-mono">{resetPassUser.username}</strong> ({resetPassUser.fullName})
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật Khẩu Mới
                </label>
                <input
                  type="text"
                  placeholder="Nhập mật khẩu mới..."
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-amber-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewPasswordValue(generateTempPassword())}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition cursor-pointer"
                >
                  Sinh Ngẫu Nhiên
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setResetPassUser(null)}
                className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!newPasswordValue.trim()) {
                    alert('Vui lòng nhập mật khẩu mới!');
                    return;
                  }
                  showToast(`Đã đổi mật khẩu cho tài khoản "${resetPassUser.username}" thành "${newPasswordValue}"`);
                  setResetPassUser(null);
                }}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                Xác Nhận Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK PROVISION FOR ALL DRIVERS */}
      {/* ========================================================================= */}
      {isQuickProvisionOpen && (
        <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-600">
                <Zap className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">
                  Cấp Nhanh Tài Khoản Cho Toàn Bộ Bác Tài Trong Đội Xe
                </h3>
              </div>
              <button
                onClick={() => setIsQuickProvisionOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700">
              Hệ thống sẽ tự động tạo tài khoản đăng nhập và phân quyền <strong>Tự Gate-In Online</strong> cho{' '}
              <strong className="text-emerald-600">{driversWithoutAccount.length} bác tài</strong> chưa có tài khoản:
            </p>

            <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {driversWithoutAccount.map((drv) => (
                <div key={drv.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                  <div>
                    <span className="font-bold text-slate-900">{drv.fullName}</span>
                    <span className="text-[11px] text-slate-500 ml-2 font-mono">({drv.phone})</span>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-600">
                    Username: <strong className="text-emerald-700">tx_{drv.phone}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200/40 rounded-2xl text-[11px] text-emerald-700">
              ✓ Mỗi tài khoản được sinh 1 mật khẩu tạm ngẫu nhiên riêng.
              <br />
              ✓ Tự động liên kết Biển số xe &amp; Bật quyền Tự Gate-In Online.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsQuickProvisionOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleExecuteQuickProvision}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg  cursor-pointer"
              >
                Cấp Tài Khoản Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
