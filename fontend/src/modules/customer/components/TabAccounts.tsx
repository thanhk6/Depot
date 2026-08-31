import React, { useState, useMemo } from 'react';
import { CustomerCompany, CustomerUser, UserRole, AccountType } from '../types/customerTypes';
import {
  Users,
  Search,
  Plus,
  Edit,
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
  Check
} from 'lucide-react';

interface TabAccountsProps {
  customer: CustomerCompany;
  users: CustomerUser[];
  onAddUser: (newUser: Omit<CustomerUser, 'id' | 'createdAt' | 'lastLogin'>) => void;
  onUpdateUser: (userId: string, updatedData: Partial<CustomerUser>) => void;
  onToggleUserStatus: (userId: string) => void;
  onResetPassword: (userId: string) => void;
}

export const TabAccounts: React.FC<TabAccountsProps> = ({
  customer,
  users,
  onAddUser,
  onUpdateUser,
  onToggleUserStatus,
  onResetPassword
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CustomerUser | null>(null);
  const [viewingUser, setViewingUser] = useState<CustomerUser | null>(null);
  const [resettingUser, setResettingUser] = useState<CustomerUser | null>(null);
  const [generatedNewPass, setGeneratedNewPass] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Form inputs for create/edit
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('CUSTOMER_USER');
  const [formAccountType, setFormAccountType] = useState<AccountType>('INTERNAL_ORG');

  // Filtered users for this customer
  const customerUsers = useMemo(() => {
    return users.filter((u) => u.customerId === customer.id);
  }, [users, customer.id]);

  const filteredUsers = useMemo(() => {
    return customerUsers.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm);

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [customerUsers, searchTerm, roleFilter]);

  const handleOpenCreate = () => {
    setFormUsername('');
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('CUSTOMER_USER');
    setFormAccountType('INTERNAL_ORG');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (u: CustomerUser) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormFullName(u.fullName);
    setFormEmail(u.email);
    setFormPhone(u.phone);
    setFormRole(u.role);
    setFormAccountType(u.accountType);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formFullName.trim()) return;

    if (editingUser) {
      onUpdateUser(editingUser.id, {
        username: formUsername.trim(),
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        accountType: formAccountType
      });
      setEditingUser(null);
    } else {
      onAddUser({
        customerId: customer.id,
        customerCode: customer.code,
        customerName: customer.shortName,
        username: formUsername.trim(),
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        accountType: formAccountType,
        status: 'ACTIVE'
      });
      setIsCreateModalOpen(false);
    }
  };

  const handleTriggerResetPassword = (u: CustomerUser) => {
    setResettingUser(u);
    const newPass = `Depot@${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedNewPass(newPass);
    setIsCopied(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedNewPass);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const confirmResetPassword = () => {
    if (resettingUser) {
      onResetPassword(resettingUser.id);
      setResettingUser(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'CUSTOMER_ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'CUSTOMER_USER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'DRIVER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'CUSTOMER_ADMIN':
        return 'Customer Admin';
      case 'CUSTOMER_USER':
        return 'Customer User (Điều Phối)';
      case 'DRIVER':
        return 'Driver (Tài Xế)';
      default:
        return role;
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'INTERNAL_ORG':
        return 'Nội bộ công ty';
      case 'DRIVER_PORTAL':
        return 'App / Gate-In Tài xế';
      case 'API_CLIENT':
        return 'API tích hợp EDI';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action and Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm username, họ tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Vai trò:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="CUSTOMER_ADMIN">Customer Admin</option>
              <option value="CUSTOMER_USER">Customer User</option>
              <option value="DRIVER">Driver</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Tài Khoản Mới</span>
        </button>
      </div>

      {/* DataGrid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Họ và Tên</th>
                <th className="py-3.5 px-4">Email / SĐT</th>
                <th className="py-3.5 px-4">Role (Vai Trò)</th>
                <th className="py-3.5 px-4">Loại Tài Khoản</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Tạo</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    {/* Username */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {u.username}
                    </td>

                    {/* Họ tên */}
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {u.fullName}
                      {u.driverName && (
                        <span className="block text-[10px] text-amber-400 font-normal">
                          Liên kết TX: {u.driverName}
                        </span>
                      )}
                    </td>

                    {/* Email / SĐT */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-200">{u.email}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.phone}</div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadge(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>

                    {/* Loại tài khoản */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {getAccountTypeLabel(u.accountType)}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {u.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Locked
                        </span>
                      )}
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {u.createdAt}
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {u.lastLogin || 'Chưa đăng nhập'}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingUser(u)}
                          className="p-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition border border-blue-500/20 cursor-pointer"
                          title="Xem chi tiết tài khoản"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700 cursor-pointer"
                          title="Chỉnh sửa tài khoản"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTriggerResetPassword(u)}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg transition border border-amber-500/20 cursor-pointer"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleUserStatus(u.id)}
                          className={`p-1.5 rounded-lg transition border cursor-pointer ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20'
                          }`}
                          title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {u.status === 'ACTIVE' ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Không có tài khoản nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo / Sửa Tài Khoản */}
      {(isCreateModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingUser ? 'Cập Nhật Tài Khoản' : 'Tạo Tài Khoản Người Dùng Mới'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Khách hàng: {customer.shortName} ({customer.code})
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Username <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="VD: tuan.tm hoặc driver01"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Họ và Tên <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="VD: Trần Minh Tuấn"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email liên hệ</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="VD: user@abclogistics.vn"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="VD: 0908.123.456"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Phân Quyền (Role) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="CUSTOMER_ADMIN">Customer Admin (Quản trị DN)</option>
                    <option value="CUSTOMER_USER">Customer User (Điều phối viên)</option>
                    <option value="DRIVER">Driver (Tài xế nhận lệnh)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Loại Tài Khoản <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formAccountType}
                    onChange={(e) => setFormAccountType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="INTERNAL_ORG">Nội bộ công ty</option>
                    <option value="DRIVER_PORTAL">App / Gate-In Tài xế</option>
                    <option value="API_CLIENT">Tích hợp API/EDI</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl">
                  <span className="text-[11px] text-blue-300">
                    Mật khẩu mặc định khởi tạo sẽ là: <strong className="font-mono text-white">Depot@123456</strong>. Người dùng sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {editingUser ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cấp Lại Mật Khẩu (Reset Password)</h3>
                <p className="text-xs text-slate-400">Tài khoản: <strong className="text-blue-400 font-mono">{resettingUser.username}</strong> ({resettingUser.fullName})</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
              <span className="text-[11px] text-slate-400 block">Mật khẩu mới được sinh tự động:</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-mono font-black text-emerald-400 tracking-wider">
                  {generatedNewPass}
                </span>
                <button
                  onClick={handleCopyPassword}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                  title="Sao chép mật khẩu"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {isCopied && <span className="text-[10px] text-emerald-400">Đã sao chép vào bộ nhớ tạm!</span>}
            </div>

            <p className="text-[11px] text-slate-400">
              Vui lòng sao chép mật khẩu này và gửi cho người dùng hoặc tài xế. Mật khẩu sẽ có hiệu lực ngay lập tức.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResettingUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={confirmResetPassword}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/20 cursor-pointer"
              >
                Xác Nhận Đổi Mật Khẩu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết User */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Chi Tiết Tài Khoản Người Dùng</span>
              </h3>
              <button onClick={() => setViewingUser(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tên tài khoản (Username):</span>
                <span className="font-mono font-bold text-blue-400">{viewingUser.username}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Họ và tên:</span>
                <span className="font-bold text-white">{viewingUser.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Thuộc doanh nghiệp:</span>
                <span className="text-slate-200">{viewingUser.customerName || customer.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200 font-mono">{viewingUser.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Điện thoại:</span>
                <span className="text-slate-200 font-mono">{viewingUser.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Vai trò (Role):</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getRoleBadge(viewingUser.role)}`}>
                  {getRoleLabel(viewingUser.role)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Loại tài khoản:</span>
                <span className="text-slate-200">{getAccountTypeLabel(viewingUser.accountType)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Trạng thái:</span>
                <span className={viewingUser.status === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {viewingUser.status === 'ACTIVE' ? 'Hoạt động (Active)' : 'Tạm khóa (Locked)'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Ngày tạo:</span>
                <span className="text-slate-300 font-mono">{viewingUser.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Đăng nhập gần nhất:</span>
                <span className="text-slate-300 font-mono">{viewingUser.lastLogin || 'Chưa đăng nhập'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
