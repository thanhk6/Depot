import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Edit2,
  Users,
  Truck,
  Car,
  FileText,
  Box,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import {
  CustomerCompany,
  CustomerUser,
  DriverRecord,
  VehicleRecord,
  CustomerBooking,
  CustomerContainerItem,
  GateInRegistration,
  CustomerCategory
} from '../types/customerPortal';

interface CustomerAccountProfileTabProps {
  customer: CustomerCompany;
  users: CustomerUser[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  bookings: CustomerBooking[];
  containers: CustomerContainerItem[];
  gateIns: GateInRegistration[];
  onNavigateSubTab: (tabKey: string) => void;
  onUpdateCustomer: (customer: CustomerCompany) => void;
}

export const CustomerAccountProfileTab: React.FC<CustomerAccountProfileTabProps> = ({
  customer,
  users,
  drivers,
  vehicles,
  bookings,
  containers,
  gateIns,
  onNavigateSubTab,
  onUpdateCustomer
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Edit form state
  const [editName, setEditName] = useState(customer.name);
  const [editTaxCode, setEditTaxCode] = useState(customer.taxCode);
  const [editPhone, setEditPhone] = useState(customer.phone);
  const [editEmail, setEditEmail] = useState(customer.email);
  const [editAddress, setEditAddress] = useState(customer.address);
  const [editContactPerson, setEditContactPerson] = useState(customer.contactPerson);
  const [editCreditLimit, setEditCreditLimit] = useState(customer.creditLimit);
  const [editPaymentTerm, setEditPaymentTerm] = useState(customer.paymentTerm);

  const customerUsers = users.filter((u) => u.customerId === customer.id);
  const customerDrivers = drivers.filter((d) => d.customerId === customer.id);
  const customerVehicles = vehicles.filter((v) => v.customerId === customer.id);
  const customerBookings = bookings.filter((b) => b.customerId === customer.id);
  const customerContainers = containers.filter((c) => c.customerId === customer.id);
  const customerGateIns = gateIns.filter((g) => g.customerId === customer.id);

  const adminAccount = customerUsers.find((u) => u.role === 'CUSTOMER_ADMIN') || {
    id: 'ADMIN-DEFAULT',
    customerId: customer.id,
    customerName: customer.name,
    username: customer.adminUsername || `admin_${customer.code.toLowerCase()}`,
    password: customer.adminPasswordDefault || 'Depot@2026',
    fullName: customer.contactPerson || `Quản Trị Viên ${customer.name}`,
    email: customer.email,
    phone: customer.phone,
    role: 'CUSTOMER_ADMIN' as const,
    status: customer.status,
    isDepotProvisioned: true,
    allowOnlineGateIn: true,
    createdAt: customer.createdAt,
    lastLogin: '2 giờ trước'
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveProfile = () => {
    onUpdateCustomer({
      ...customer,
      name: editName,
      taxCode: editTaxCode,
      phone: editPhone,
      email: editEmail,
      address: editAddress,
      contactPerson: editContactPerson,
      creditLimit: Number(editCreditLimit),
      paymentTerm: editPaymentTerm
    });
    setIsEditing(false);
  };

  const getCategoryMeta = (cat?: CustomerCategory) => {
    switch (cat) {
      case 'DOANH_NGHIEP':
        return {
          title: 'Doanh Nghiệp / Tập Đoàn',
          desc: 'Doanh nghiệp vận tải & logistics quy mô lớn',
          badge: 'bg-blue-950 text-blue-300 border-blue-600/50',
          border: 'border-blue-500/30'
        };
      case 'CONG_TY':
        return {
          title: 'Công Ty Vận Tải / Forwarder',
          desc: 'Công ty vận chuyển, đại lý FWD & giao nhận',
          badge: 'bg-purple-950 text-purple-300 border-purple-600/50',
          border: 'border-purple-500/30'
        };
      case 'KHACH_LE':
        return {
          title: 'Khách Lẻ / Chủ Xe Cá Nhân',
          desc: 'Bác tài cá nhân / Chủ phương tiện tự do',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-600/50',
          border: 'border-emerald-500/30'
        };
      default:
        return {
          title: 'Doanh Nghiệp Vận Tải',
          desc: 'Khách hàng vận tải chuẩn',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          border: 'border-slate-800'
        };
    }
  };

  const catMeta = getCategoryMeta(customer.category);

  return (
    <div className="space-y-6">
      {/* 1. Main Account Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-xl shadow-blue-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
                <Building2 className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${catMeta.badge}`}>
                  {catMeta.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  MÃ: {customer.code}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                    customer.status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700/50'
                      : 'bg-rose-950 text-rose-300 border-rose-700/50'
                  }`}
                >
                  {customer.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{customer.name}</h2>
              <p className="text-xs text-slate-400 font-mono">
                {customer.category === 'KHACH_LE' ? 'Số CCCD/CMND' : 'Mã số thuế (MST)'}:{' '}
                <strong className="text-white font-bold">{customer.taxCode}</strong> • Ngày tạo hồ sơ:{' '}
                {customer.createdAt}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-blue-400" />
              <span>{isEditing ? 'Đóng Chỉnh Sửa' : 'Sửa Thông Tin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigateSubTab('accounts')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold">Tài Khoản User</span>
            <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">{customerUsers.length}</div>
          <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1 mt-0.5">
            Quản lý Users &rarr;
          </span>
        </div>

        <div
          onClick={() => onNavigateSubTab('drivers')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold">Tài Xế Đội Xe</span>
            <Truck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{customerDrivers.length}</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            Xem tài xế &rarr;
          </span>
        </div>

        <div
          onClick={() => onNavigateSubTab('vehicles')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold">Đầu Kéo / Mooc</span>
            <Car className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{customerVehicles.length}</div>
          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
            Xem đội xe &rarr;
          </span>
        </div>

        <div
          onClick={() => onNavigateSubTab('gate_in_online')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold">Gate-In Online</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{customerGateIns.length}</div>
          <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 mt-0.5">
            Lịch sử vào cổng &rarr;
          </span>
        </div>

        <div
          onClick={() => onNavigateSubTab('bookings')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold">Lệnh / Booking</span>
            <FileText className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono mt-1">{customerBookings.length}</div>
          <span className="text-[10px] text-purple-400 font-semibold flex items-center gap-1 mt-0.5">
            Xem booking &rarr;
          </span>
        </div>

        <div
          onClick={() => onNavigateSubTab('containers')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold">Cont Tại Bãi</span>
            <Box className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-indigo-400 font-mono mt-1">{customerContainers.length}</div>
          <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
            Xem tồn bãi &rarr;
          </span>
        </div>
      </div>

      {/* 3. Detailed Account Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Admin Account Credentials (Depot Provisioned) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tài Khoản Quản Trị Hệ Thống (Depot Provisioned)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Cấp Ban Đầu
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Đây là tài khoản quản trị chính do Depot cấp cho khách hàng. Khách hàng dùng tài khoản này để đăng nhập vào
              Customer Portal, tự quản trị và cấp tài khoản cho các tài xế, điều độ của mình.
            </p>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              {/* Username row */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Tên Đăng Nhập (Username):</span>
                  <span className="text-sm font-mono font-bold text-amber-400">@{adminAccount.username}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(adminAccount.username, 'username')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-mono flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedKey === 'username' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'username' ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Password row */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                <div>
                  <span className="text-[11px] text-slate-400 block">Mật Khẩu Khởi Tạo:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-white">
                      {showPassword ? adminAccount.password || customer.adminPasswordDefault || 'Depot@2026' : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-300 text-xs transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(adminAccount.password || customer.adminPasswordDefault || 'Depot@2026', 'password')
                  }
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-mono flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedKey === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'password' ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Role & Permissions */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-900 pt-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Cấp Bậc Tài Khoản:</span>
                  <span className="font-bold text-blue-400">CUSTOMER_ADMIN</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Quyền Gate-In Online:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bật toàn quyền
                  </span>
                </div>
              </div>

              {/* Sub-account creator badge */}
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-[11px] text-blue-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>Quyền Tự Tạo Tài Khoản Con (Sub-Accounts):</span>
                </div>
                <p className="text-slate-400 text-[10px]">
                  Tài khoản này được phép tạo thêm nhiều tài khoản cho Điều Phối Viên và Tài Xế trong cùng doanh nghiệp.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Đăng nhập gần nhất: {adminAccount.lastLogin || '2 giờ trước'}</span>
              <button
                onClick={() => onNavigateSubTab('accounts')}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Quản Lý Phân Quyền Chi Tiết</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Financial & Credit Terms */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hạn Mức Tín Dụng &amp; Thanh Toán</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {customer.category === 'KHACH_LE' ? 'Thanh Toán VietQR' : 'Công Nợ 30 Ngày'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Hạn Mức Tín Dụng:</span>
                <span className="text-base font-mono font-black text-white">
                  {customer.category === 'KHACH_LE'
                    ? '0 VNĐ (Trả Ngay)'
                    : `${(customer.creditLimit / 1000000).toLocaleString('vi-VN')} Triệu VNĐ`}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Dư Nợ Hiện Tại:</span>
                <span className="text-base font-mono font-black text-rose-400">
                  {customer.currentDebt.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block font-semibold">Phương Thức Thanh Toán Mặc Định:</span>
              <p className="text-slate-200 font-bold">
                {customer.category === 'KHACH_LE'
                  ? 'Quét mã VietQR động tự động cho từng lượt Gate-In / Nâng hạ'
                  : 'Tổng hợp hóa đơn điện tử e-Invoice định kỳ cuối tháng (Kỳ thanh toán 30 ngày)'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Legal & Profile Details (Editable) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Building2 className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Thông Tin Pháp Nhân &amp; Liên Hệ
                </h3>
              </div>
              {isEditing && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                  Đang chỉnh sửa
                </span>
              )}
            </div>

            {isEditing ? (
              /* Editable form */
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Tên Doanh Nghiệp / Chủ Xe:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">
                      {customer.category === 'KHACH_LE' ? 'Số CCCD/CMND:' : 'Mã Số Thuế (MST):'}
                    </label>
                    <input
                      type="text"
                      value={editTaxCode}
                      onChange={(e) => setEditTaxCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Số Điện Thoại:</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Người Đại Diện / Liên Hệ:</label>
                    <input
                      type="text"
                      value={editContactPerson}
                      onChange={(e) => setEditContactPerson(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Email:</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Địa Chỉ Trụ Sở:</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </div>
            ) : (
              /* Display list */
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Địa Chỉ Trụ Sở / Đăng Ký:</span>
                    <span className="font-semibold text-slate-200">{customer.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Hotline / SĐT:</span>
                      <span className="font-mono font-bold text-white">{customer.phone}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Email Doanh Nghiệp:</span>
                      <span className="font-mono text-slate-200 break-all">{customer.email}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Người Đại Diện Pháp Luật / Điều Hành:</span>
                    <span className="font-bold text-white">{customer.contactPerson}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({customer.contactPhone})</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Ngày Bắt Đầu Hợp Tác:</span>
                    <span className="font-mono text-slate-200">{customer.createdAt}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sub-Modules Direct Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thao Tác Nhanh Cho Khách Hàng Này:
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigateSubTab('accounts')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Quản Lý Users &amp; Phân Quyền</span>
                  <span className="text-[10px] text-slate-400">{customerUsers.length} tài khoản</span>
                </div>
                <Users className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateSubTab('drivers')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Danh Sách Tài Xế</span>
                  <span className="text-[10px] text-slate-400">{customerDrivers.length} bác tài</span>
                </div>
                <Truck className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateSubTab('vehicles')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Quản Lý Đội Đầu Kéo</span>
                  <span className="text-[10px] text-slate-400">{customerVehicles.length} phương tiện</span>
                </div>
                <Car className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateSubTab('gate_in_online')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Lịch Sử Gate-In Online</span>
                  <span className="text-[10px] text-slate-400">{customerGateIns.length} lượt</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
