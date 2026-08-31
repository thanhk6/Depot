import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Truck,
  Phone,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  AlertCircle,
  X,
  Lock,
  Unlock,
  RefreshCw,
  FileBadge,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export interface DriverAccountItem {
  id: string;
  customerId: string;
  customerName?: string;
  username: string;
  password?: string;
  fullName: string;
  phone: string;
  citizenId: string;
  licenseNumber: string;
  licensePlate: string;
  roMoocNo: string;
  allowOnlineGateIn: boolean;
  status: 'ACTIVE' | 'LOCKED';
  lastLogin?: string;
  createdAt: string;
  notes?: string;
}

export interface CustomerDriverAccountsModalProps {
  customer: {
    id: string;
    code: string;
    name: string;
    taxCode: string;
    phone: string;
  };
  drivers: DriverAccountItem[];
  onClose: () => void;
  onUpdateDrivers: (updatedDrivers: DriverAccountItem[]) => void;
}

export const CustomerDriverAccountsModal: React.FC<CustomerDriverAccountsModalProps> = ({
  customer,
  drivers,
  onClose,
  onUpdateDrivers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverAccountItem | null>(null);
  const [selectedDriverForCard, setSelectedDriverForCard] = useState<DriverAccountItem | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<{ [key: string]: boolean }>({});
  const [simulatingDriver, setSimulatingDriver] = useState<DriverAccountItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: 'Password@123',
    fullName: '',
    phone: '',
    citizenId: '',
    licenseNumber: '790123456789 (Hạng FC)',
    licensePlate: '',
    roMoocNo: '',
    allowOnlineGateIn: true,
    notes: ''
  });

  // Filtered driver list for this customer
  const customerDrivers = drivers.filter((d) => d.customerId === customer.id);
  const filteredDrivers = customerDrivers.filter((d) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      d.fullName.toLowerCase().includes(term) ||
      d.username.toLowerCase().includes(term) ||
      d.phone.includes(term) ||
      d.licensePlate.toLowerCase().includes(term) ||
      d.citizenId.includes(term)
    );
  });

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAdd = () => {
    setEditingDriver(null);
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const prefix = customer.code.toLowerCase().replace(/[^a-z0-9]/g, '');
    setFormData({
      username: `tx_${prefix}_${randomSuffix}`,
      password: 'Password@123',
      fullName: '',
      phone: '',
      citizenId: '',
      licenseNumber: '790' + Math.floor(100000000 + Math.random() * 900000000) + ' (Hạng FC)',
      licensePlate: '51C-' + Math.floor(100 + Math.random() * 899) + '.' + Math.floor(10 + Math.random() * 89),
      roMoocNo: '51R-' + Math.floor(100 + Math.random() * 899) + '.' + Math.floor(10 + Math.random() * 89),
      allowOnlineGateIn: true,
      notes: 'Tài xế nhận lệnh vận chuyển cont'
    });
    setShowAddForm(true);
  };

  const handleOpenEdit = (driver: DriverAccountItem) => {
    setEditingDriver(driver);
    setFormData({
      username: driver.username,
      password: driver.password || 'Password@123',
      fullName: driver.fullName,
      phone: driver.phone,
      citizenId: driver.citizenId,
      licenseNumber: driver.licenseNumber,
      licensePlate: driver.licensePlate,
      roMoocNo: driver.roMoocNo,
      allowOnlineGateIn: driver.allowOnlineGateIn,
      notes: driver.notes || ''
    });
    setShowAddForm(true);
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.phone.trim()) {
      return;
    }

    if (editingDriver) {
      const updated = drivers.map((d) =>
        d.id === editingDriver.id
          ? {
              ...d,
              username: formData.username.trim(),
              password: formData.password,
              fullName: formData.fullName.trim(),
              phone: formData.phone.trim(),
              citizenId: formData.citizenId.trim(),
              licenseNumber: formData.licenseNumber.trim(),
              licensePlate: formData.licensePlate.trim().toUpperCase(),
              roMoocNo: formData.roMoocNo.trim().toUpperCase(),
              allowOnlineGateIn: formData.allowOnlineGateIn,
              notes: formData.notes.trim()
            }
          : d
      );
      onUpdateDrivers(updated);
    } else {
      const newDriver: DriverAccountItem = {
        id: 'DRV-' + (drivers.length + 1).toString().padStart(3, '0'),
        customerId: customer.id,
        customerName: customer.name,
        username: formData.username.trim().toLowerCase(),
        password: formData.password || 'Password@123',
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        citizenId: formData.citizenId.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        roMoocNo: formData.roMoocNo.trim().toUpperCase(),
        allowOnlineGateIn: formData.allowOnlineGateIn,
        status: 'ACTIVE',
        lastLogin: 'Chưa đăng nhập',
        createdAt: new Date().toISOString().split('T')[0],
        notes: formData.notes.trim()
      };
      onUpdateDrivers([...drivers, newDriver]);
    }

    setShowAddForm(false);
    setEditingDriver(null);
  };

  const handleToggleStatus = (id: string) => {
    const updated = drivers.map((d) =>
      d.id === id ? { ...d, status: (d.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE') as 'ACTIVE' | 'LOCKED' } : d
    );
    onUpdateDrivers(updated);
  };

  const handleDeleteDriver = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa tài khoản tài xế: ${name}?`)) {
      onUpdateDrivers(drivers.filter((d) => d.id !== id));
    }
  };

  const handleResetPassword = (id: string) => {
    const updated = drivers.map((d) =>
      d.id === id ? { ...d, password: 'Password@123' } : d
    );
    onUpdateDrivers(updated);
    alert('Đã đặt lại mật khẩu về mặc định: Password@123');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full my-auto space-y-6 shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header bar */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-pink-600/20 border border-pink-500/30 text-pink-400 rounded-2xl shadow-lg shadow-pink-950 shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-pink-950 text-pink-300 border border-pink-800 text-[10px] font-mono font-bold rounded-lg">
                  {customer.code}
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Tài Khoản Tài Xế Đăng Nhập Gate-In Online
                </h2>
              </div>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <strong className="text-white">{customer.name}</strong>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-mono">MST: {customer.taxCode}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {customerDrivers.length} Tài xế đã cấp tài khoản
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cấp Tài Khoản Mới</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Banner */}
        <div className="px-6">
          <div className="p-3.5 bg-slate-950/70 border border-pink-500/20 rounded-2xl flex items-start gap-3 text-xs">
            <div className="p-1.5 bg-pink-500/20 text-pink-400 rounded-lg shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-slate-300 leading-relaxed space-y-0.5">
              <div>
                <strong className="text-white">Tính năng chuẩn bị Gate-In Online:</strong> Các tài khoản được cấp tại đây cho phép tài xế của doanh nghiệp vận tải tải/truy cập App Tài Xế Gate-In để đăng nhập, đăng ký giờ vào cổng, khai báo số container, rơ-mooc và lấy mã QR làm thủ tục nhận/hạ vỏ rỗng nhanh tại cổng Depot.
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Tên tài xế, Tên đăng nhập, SĐT, Biển số xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {filteredDrivers.length} / {customerDrivers.length} tài xế
          </div>
        </div>

        {/* Drivers List Table */}
        <div className="px-6 pb-6">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-semibold sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">STT</th>
                    <th className="px-4 py-3">Tài Xế / Họ Tên</th>
                    <th className="px-4 py-3">Tài Khoản Đăng Nhập</th>
                    <th className="px-4 py-3">Phương Tiện (Đầu kéo / Mooc)</th>
                    <th className="px-4 py-3 text-center">Gate-In Online</th>
                    <th className="px-4 py-3 text-center">Trạng Thái</th>
                    <th className="px-4 py-3 text-center w-48">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500 space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-600" />
                        <p>Chưa có tài khoản tài xế nào cho khách hàng này hoặc không khớp với tìm kiếm.</p>
                        <button
                          onClick={handleOpenAdd}
                          className="px-3.5 py-1.5 bg-pink-600/80 hover:bg-pink-600 text-white rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer mt-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tạo Tài Khoản Đầu Tiên</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map((driver, idx) => (
                      <tr key={driver.id} className="hover:bg-slate-900/60 transition">
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-400">
                          {(idx + 1).toString().padStart(2, '0')}
                        </td>

                        {/* Driver details */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{driver.fullName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-pink-300 rounded">
                                {driver.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span className="flex items-center gap-1 text-slate-300">
                                <Phone className="w-3 h-3 text-pink-400" /> {driver.phone}
                              </span>
                              <span>•</span>
                              <span>CCCD: {driver.citizenId || '---'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              GPLX: <span className="text-amber-300 font-semibold">{driver.licenseNumber}</span>
                            </div>
                          </div>
                        </td>

                        {/* Login credentials */}
                        <td className="px-4 py-3.5">
                          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 space-y-1 max-w-[200px]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">User:</span>
                              <span className="font-mono font-bold text-pink-400">{driver.username}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Pass:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-mono font-semibold text-slate-200">
                                  {showPasswordMap[driver.id] ? driver.password : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleShowPassword(driver.id)}
                                  className="text-slate-400 hover:text-white p-0.5"
                                  title="Hiện/Ẩn mật khẩu"
                                >
                                  {showPasswordMap[driver.id] ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vehicles */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1 font-mono text-xs">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {driver.licensePlate || '---'}
                              </span>
                            </div>
                            {driver.roMoocNo && (
                              <div className="text-[11px] text-slate-400 pl-5">
                                Mooc: <span className="text-slate-300 font-semibold">{driver.roMoocNo}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Online Gate-In Permission */}
                        <td className="px-4 py-3.5 text-center">
                          {driver.allowOnlineGateIn ? (
                            <span className="px-2 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded-lg inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Cho Phép</span>
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Tắt</span>
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border ${
                              driver.status === 'ACTIVE'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border-rose-800'
                            }`}
                          >
                            {driver.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'TẠM KHÓA'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* e-Card / QR view */}
                            <button
                              onClick={() => setSelectedDriverForCard(driver)}
                              title="Xem Thẻ Tài Xế & Mã QR Gate-In"
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-pink-400 rounded-lg transition border border-slate-800 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Test Login simulator */}
                            <button
                              onClick={() => setSimulatingDriver(driver)}
                              title="Giả lập màn hình Đăng Nhập của Tài Xế"
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded-lg transition border border-slate-800 cursor-pointer"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(driver)}
                              title="Chỉnh sửa thông tin"
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg transition border border-slate-800 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Lock / Unlock */}
                            <button
                              onClick={() => handleToggleStatus(driver.id)}
                              title={driver.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                              className={`p-1.5 rounded-lg transition border border-slate-800 cursor-pointer ${
                                driver.status === 'ACTIVE'
                                  ? 'bg-slate-900 hover:bg-amber-950 text-amber-400'
                                  : 'bg-emerald-950 text-emerald-400'
                              }`}
                            >
                              {driver.status === 'ACTIVE' ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteDriver(driver.id, driver.fullName)}
                              title="Xóa tài khoản"
                              className="p-1.5 bg-slate-900 hover:bg-rose-950 text-rose-400 rounded-lg transition border border-slate-800 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal / Form Create or Edit Driver */}
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/90 z-60 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-400" />
                  <span>{editingDriver ? 'Chỉnh Sửa Tài Khoản Tài Xế' : 'Cấp Mới Tài Khoản Tài Xế Gate-In'}</span>
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDriver} className="space-y-4 text-xs">
                {/* Section 1: Authentication */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="text-[11px] font-bold text-pink-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Thông Tin Đăng Nhập App Tài Xế</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Tên Đăng Nhập (Username / SĐT) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: tx_hung_51c"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-pink-400 font-mono font-bold rounded-xl focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Mật Khẩu Khởi Tạo <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Password@123"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white font-mono rounded-xl focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Họ và Tên Tài Xế <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Nguyễn Văn Hùng"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white font-bold rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Số Điện Thoại Liên Lạc <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0903.xxx.xxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white font-mono rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Số Căn Cước Công Dân (CCCD)
                    </label>
                    <input
                      type="text"
                      placeholder="0790xxxxxxxx"
                      value={formData.citizenId}
                      onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white font-mono rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Giấy Phép Lái Xe (GPLX)
                    </label>
                    <input
                      type="text"
                      placeholder="790123456789 (Hạng FC)"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white font-mono rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Section 3: Vehicle details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Biển Số Đầu Kéo Mặc Định
                    </label>
                    <input
                      type="text"
                      placeholder="51C-882.19"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Biển Số Rơ-Mooc
                    </label>
                    <input
                      type="text"
                      placeholder="51R-045.22"
                      value={formData.roMoocNo}
                      onChange={(e) => setFormData({ ...formData, roMoocNo: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold rounded-xl focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Section 4: Gate-In Permissions Toggle */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-xs">Cho phép Khai Báo &amp; Check-In Gate-In Online</div>
                    <div className="text-[10px] text-slate-400">
                      Tài xế có thể đăng nhập app để khai báo trước biển số và nhận mã QR mở barie tự động.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allowOnlineGateIn}
                    onChange={(e) => setFormData({ ...formData, allowOnlineGateIn: e.target.checked })}
                    className="w-4 h-4 text-pink-600 rounded bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ghi Chú</label>
                  <input
                    type="text"
                    placeholder="Ghi chú tuyến đường, số xe hoặc điều phối viên..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg shadow-pink-600/30 cursor-pointer"
                  >
                    {editingDriver ? 'Cập Nhật Tài Khoản' : 'Tạo Tài Khoản'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Driver e-Card & QR Code */}
        {selectedDriverForCard && (
          <div className="fixed inset-0 bg-slate-950/90 z-60 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-scale-up text-center">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileBadge className="w-5 h-5 text-pink-400" />
                  <span>Thẻ Điện Tử Tài Xế (Driver e-Pass)</span>
                </h3>
                <button
                  onClick={() => setSelectedDriverForCard(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Physical style Card */}
              <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950 border-2 border-pink-500/40 rounded-3xl text-left space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Truck className="w-28 h-28 text-white" />
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[10px] font-mono text-pink-400 font-bold">DEPOT GATE-IN ONLINE PASS</div>
                    <div className="text-xs font-bold text-white truncate max-w-[200px]">{customer.name}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-mono font-bold rounded">
                    ACTIVE
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-slate-950 rounded-2xl shrink-0 shadow-lg">
                    {/* Simulated QR Code */}
                    <div className="w-24 h-24 bg-slate-950 flex flex-col items-center justify-center text-[10px] text-pink-400 font-mono font-bold text-center p-1 rounded-xl">
                      <QrCode className="w-14 h-14 text-white mb-0.5" />
                      <span>{selectedDriverForCard.id}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-sm font-bold text-white">{selectedDriverForCard.fullName}</div>
                    <div className="text-slate-400 text-[11px] font-mono">User: <span className="text-pink-300">{selectedDriverForCard.username}</span></div>
                    <div className="text-slate-400 text-[11px] font-mono">SĐT: <span className="text-white">{selectedDriverForCard.phone}</span></div>
                    <div className="text-slate-400 text-[11px]">Đầu kéo: <strong className="text-amber-400 font-mono">{selectedDriverForCard.licensePlate}</strong></div>
                    <div className="text-slate-400 text-[11px]">Rơ-mooc: <strong className="text-amber-400 font-mono">{selectedDriverForCard.roMoocNo || '---'}</strong></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>GPLX: {selectedDriverForCard.licenseNumber}</span>
                  <span className="font-mono">Cấp ngày: {selectedDriverForCard.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    alert(`Đã gửi thông tin tài khoản và liên kết tải App Gate-In đến số: ${selectedDriverForCard.phone}`);
                  }}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Gửi SMS Kích Hoạt</span>
                </button>
                <button
                  onClick={() => setSelectedDriverForCard(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Driver Login & Online Gate-In App Simulator */}
        {simulatingDriver && (
          <div className="fixed inset-0 bg-slate-950/90 z-60 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                  <span className="text-sm font-bold text-white">App Tài Xế Gate-In Online</span>
                </div>
                <button
                  onClick={() => setSimulatingDriver(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile phone mock UI */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3.5 text-xs">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-pink-600/20 text-pink-400 rounded-full flex items-center justify-center mx-auto border border-pink-500/30">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">DEPOT DRIVER ONLINE</h4>
                  <p className="text-[10px] text-slate-400">Đăng nhập tài xế làm thủ tục cổng</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Tài xế:</span>
                    <span className="font-bold text-white">{simulatingDriver.fullName}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Tên đăng nhập:</span>
                    <span className="font-mono font-bold text-pink-400">{simulatingDriver.username}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Doanh nghiệp:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{customer.name}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Xe đầu kéo:</span>
                    <span className="font-mono font-bold text-amber-300">{simulatingDriver.licensePlate}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl space-y-1 text-emerald-300 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Sẵn Sàng Gate-In Online</span>
                  </div>
                  <p className="text-[10px] text-emerald-400/80">
                    Tài khoản đã được xác thực danh tính và gán chính sách vận chuyển của nhà xe.
                  </p>
                </div>

                <button
                  onClick={() => {
                    alert(`Đăng nhập thành công với tài khoản tài xế: ${simulatingDriver.fullName} (${simulatingDriver.username})! Hệ thống đã sẵn sàng kết nối cổng Gate-In.`);
                    setSimulatingDriver(null);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Thử Nghiệm Vào Cổng Online</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
