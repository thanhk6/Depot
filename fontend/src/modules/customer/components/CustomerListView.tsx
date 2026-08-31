import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
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
  ArrowRight,
  Sparkles,
  CreditCard
} from 'lucide-react';
import {
  CustomerCompany,
  CustomerUser,
  DriverRecord,
  VehicleRecord,
  CustomerCategory
} from '../types/customerPortal';

interface CustomerListViewProps {
  customers: CustomerCompany[];
  users: CustomerUser[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  onSelectCustomer: (customer: CustomerCompany) => void;
  onAddCustomer: (newCustomer: CustomerCompany) => void;
  onUpdateCustomer: (updatedCustomer: CustomerCompany) => void;
  onAddUser: (newUser: CustomerUser) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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

  // Filter list
  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.taxCode.includes(searchTerm) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.adminUsername && c.adminUsername.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchSearch) return false;

    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
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
      isDepotProvisioned: true,
      allowOnlineGateIn: true,
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: 'Chưa đăng nhập'
    };
    onAddUser(initialAdminUser);

    setIsAddModalOpen(false);
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

  const toggleCustomerLock = (c: CustomerCompany, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = c.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    onUpdateCustomer({ ...c, status: nextStatus });
  };

  // Stats
  const totalCount = customers.length;
  const enterpriseCount = customers.filter((c) => c.category === 'DOANH_NGHIEP').length;
  const companyCount = customers.filter((c) => c.category === 'CONG_TY').length;
  const retailCount = customers.filter((c) => c.category === 'KHACH_LE').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              TRUCKING &amp; FORWARDER DIRECTORY
            </span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>DANH SÁCH KHÁCH HÀNG (TRUCKING &amp; FWD)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Danh bạ các Doanh nghiệp, Công ty vận tải &amp; Khách lẻ cá nhân. Chọn một khách hàng để xem chi tiết tài khoản.
          </p>
        </div>

        <button
          onClick={handleOpenAddCustomerModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khách Hàng Mới</span>
        </button>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setCategoryFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            categoryFilter === 'ALL'
              ? 'bg-blue-950/40 border-blue-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] text-slate-400 font-semibold">Tất Cả Khách Hàng</div>
          <div className="text-2xl font-black font-mono text-white mt-0.5">{totalCount}</div>
          <span className="text-[10px] text-blue-400">Toàn bộ danh bạ</span>
        </div>

        <div
          onClick={() => setCategoryFilter('DOANH_NGHIEP')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            categoryFilter === 'DOANH_NGHIEP'
              ? 'bg-blue-950/40 border-blue-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] text-slate-400 font-semibold">Doanh Nghiệp / Tập Đoàn</div>
          <div className="text-2xl font-black font-mono text-blue-400 mt-0.5">{enterpriseCount}</div>
          <span className="text-[10px] text-blue-400">Quy mô lớn &amp; đội xe lớn</span>
        </div>

        <div
          onClick={() => setCategoryFilter('CONG_TY')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            categoryFilter === 'CONG_TY'
              ? 'bg-purple-950/40 border-purple-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] text-slate-400 font-semibold">Công Ty Vận Tải / FWD</div>
          <div className="text-2xl font-black font-mono text-purple-400 mt-0.5">{companyCount}</div>
          <span className="text-[10px] text-purple-400">Giao nhận &amp; Forwarder</span>
        </div>

        <div
          onClick={() => setCategoryFilter('KHACH_LE')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            categoryFilter === 'KHACH_LE'
              ? 'bg-emerald-950/40 border-emerald-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] text-slate-400 font-semibold">Khách Lẻ (Chủ Xe Cá Nhân)</div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">{retailCount}</div>
          <span className="text-[10px] text-emerald-400">Bác tài tự do • VietQR</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo mã KH, tên doanh nghiệp, MST/CCCD, SĐT, tài khoản admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="ALL">Tất cả Phân Loại ({customers.length})</option>
          <option value="DOANH_NGHIEP">Doanh Nghiệp / Tập Đoàn</option>
          <option value="CONG_TY">Công Ty Vận Tải / FWD</option>
          <option value="KHACH_LE">Khách Lẻ / Cá Nhân</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="ALL">Tất cả Trạng Thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="LOCKED">Tạm khóa</option>
        </select>
      </div>

      {/* Customer Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Mã KH</th>
                <th className="px-4 py-3.5">Phân Loại</th>
                <th className="px-4 py-3.5">Tên Khách Hàng / Đại Diện</th>
                <th className="px-4 py-3.5">MST / CCCD</th>
                <th className="px-4 py-3.5">Tài Khoản Admin Được Cấp</th>
                <th className="px-4 py-3.5 text-center">Tài Khoản User</th>
                <th className="px-4 py-3.5 text-center">Tài Xế</th>
                <th className="px-4 py-3.5 text-center">Đầu Kéo</th>
                <th className="px-4 py-3.5">Hạn Mức Tín Dụng</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-4 py-3.5 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-slate-500">
                    Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const userCount = users.filter((u) => u.customerId === c.id).length;
                  const driverCount = drivers.filter((d) => d.customerId === c.id).length;
                  const vehicleCount = vehicles.filter((v) => v.customerId === c.id).length;
                  const badge = getCatBadge(c.category);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCustomer(c)}
                      className="hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      {/* Code */}
                      <td className="px-4 py-3.5 font-mono font-bold text-cyan-400 group-hover:underline">
                        {c.code}
                      </td>

                      {/* Category Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Name & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white group-hover:text-blue-300 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{c.contactPerson}</span>
                          <span>•</span>
                          <span className="font-mono">{c.phone}</span>
                        </div>
                      </td>

                      {/* Tax Code / CCCD */}
                      <td className="px-4 py-3.5 font-mono text-slate-300 font-bold">
                        {c.taxCode}
                      </td>

                      {/* Admin Account */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>@{c.adminUsername || `admin_${c.code.toLowerCase()}`}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Mật khẩu: {c.adminPasswordDefault || 'Depot@2026'}
                        </span>
                      </td>

                      {/* User Count */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {userCount} Users
                        </span>
                      </td>

                      {/* Driver Count */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {driverCount} Tài xế
                        </span>
                      </td>

                      {/* Vehicle Count */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {vehicleCount} Xe
                        </span>
                      </td>

                      {/* Credit Limit */}
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {c.category === 'KHACH_LE' ? (
                          <span className="text-emerald-400 font-bold text-[11px]">VietQR Từng Đơn</span>
                        ) : (
                          <span>{(c.creditLimit / 1000000).toLocaleString('vi-VN')} Tr VNĐ</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {c.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectCustomer(c)}
                            title="Kích vào trong hiển thị thông tin tài khoản và quản trị"
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-xs rounded-xl border border-blue-500/30 transition flex items-center gap-1.5 cursor-pointer shadow"
                          >
                            <span>Xem Tài Khoản</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => toggleCustomerLock(c, e)}
                            title={c.status === 'ACTIVE' ? 'Tạm Khóa Khách Hàng' : 'Mở Khóa Khách Hàng'}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              c.status === 'ACTIVE'
                                ? 'bg-slate-800 text-slate-400 hover:text-rose-400 border-slate-700'
                                : 'bg-rose-950 text-rose-300 border-rose-800'
                            }`}
                          >
                            {c.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Hiển thị <strong>{filteredCustomers.length}</strong> / <strong>{customers.length}</strong> khách hàng
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Mẹo: Kích vào bất kỳ khách hàng nào để mở trang chi tiết tài khoản và phân quyền
          </span>
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
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
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

            <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Hủy Bỏ
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
