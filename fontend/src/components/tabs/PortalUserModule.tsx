import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import {
  Globe,
  Users,
  Search,
  Plus,
  Lock,
  Unlock,
  KeyRound,
  Edit,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle,
  Filter,
  Layers,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  FileSpreadsheet,
  Download,
  Mail,
  Phone,
  Clock,
  Activity,
  Code2,
  Check,
  X,
  AlertTriangle,
  FileText,
  ExternalLink,
  Shield,
  Eye,
  Send,
  Sparkles,
  Info
} from 'lucide-react';

export interface PortalUserItem {
  id: string;
  companyId: string;
  companyCode: string;
  companyName: string;
  companyType: 'SHIPPING_LINE' | 'CUSTOMER' | 'TRANSPORT' | 'REPAIR_PARTNER' | 'SUPPLIER';
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleCode: string;
  roleName: string;
  isActive: boolean;
  isApproved: boolean;
  lastLogin?: string;
  createdDate: string;
}

export interface PendingRegistrationRequest {
  id: string;
  companyName: string;
  taxCode: string;
  companyType: 'SHIPPING_LINE' | 'TRANSPORT' | 'REPAIR_PARTNER';
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  requestedRole: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string;
}

export interface PortalActivityLog {
  id: string;
  portalUsername: string;
  fullName: string;
  companyName: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// Initial Mock Portal Users Data
export const INITIAL_PORTAL_USERS: PortalUserItem[] = [
  {
    id: 'PU-001',
    companyId: 'COMP-002',
    companyCode: 'MAERSK',
    companyName: 'MAERSK LINE A/S VIETNAM CO., LTD.',
    companyType: 'SHIPPING_LINE',
    username: 'maersk.portal',
    fullName: 'Hans Nielsen',
    email: 'hans.nielsen@maersk.com',
    phone: '028-3823-0011',
    roleCode: 'PORTAL_SHIPPING_LINE',
    roleName: 'Đại Diện Hãng Tàu (Duyệt Báo Giá)',
    isActive: true,
    isApproved: true,
    lastLogin: '2026-08-04 14:22:10',
    createdDate: '2026-01-15'
  },
  {
    id: 'PU-002',
    companyId: 'COMP-003',
    companyCode: 'MSC',
    companyName: 'MEDITERRANEAN SHIPPING COMPANY (MSC) S.A.',
    companyType: 'SHIPPING_LINE',
    username: 'msc.portal',
    fullName: 'Marco Rossi',
    email: 'msc.vietnam@msc.com',
    phone: '028-3914-1122',
    roleCode: 'PORTAL_SHIPPING_LINE',
    roleName: 'Đại Diện Hãng Tàu (Duyệt Báo Giá)',
    isActive: true,
    isApproved: true,
    lastLogin: '2026-08-04 11:05:45',
    createdDate: '2026-02-10'
  },
  {
    id: 'PU-003',
    companyId: 'COMP-004',
    companyCode: 'LOGISTICS-TB',
    companyName: 'CÔNG TY CP VẬN TẢI & LOGISTICS TÂN BÌNH',
    companyType: 'TRANSPORT',
    username: 'tanbinh.transport',
    fullName: 'Trần Văn Nam',
    email: 'nam.tv@tanbinhlogistics.vn',
    phone: '0903-882-112',
    roleCode: 'PORTAL_TRANSPORT',
    roleName: 'Nhà Xe Vận Tải (Tra Cứu Gate & Lệnh)',
    isActive: true,
    isApproved: true,
    lastLogin: '2026-08-03 16:40:00',
    createdDate: '2026-03-01'
  },
  {
    id: 'PU-004',
    companyId: 'COMP-005',
    companyCode: 'REPAIR-HOANGHA',
    companyName: 'CÔNG TY TNHH DỊCH VỤ CƠ KHÍ HOÀNG HÀ',
    companyType: 'REPAIR_PARTNER',
    username: 'hoangha.repair',
    fullName: 'Hoàng Văn Hà',
    email: 'hoangha.container@gmail.com',
    phone: '0918-334-991',
    roleCode: 'PORTAL_REPAIR_PARTNER',
    roleName: 'Tổ Thợ Sửa Chữa (Cập Nhật Tiến Độ)',
    isActive: true,
    isApproved: true,
    lastLogin: '2026-08-04 09:12:00',
    createdDate: '2026-04-12'
  },
  {
    id: 'PU-005',
    companyId: 'COMP-006',
    companyCode: 'COSCO',
    companyName: 'COSCO SHIPPING LINES (VIETNAM) CO., LTD.',
    companyType: 'SHIPPING_LINE',
    username: 'cosco.portal',
    fullName: 'Li Wei',
    email: 'liwei@coscon.com',
    phone: '028-3821-9988',
    roleCode: 'PORTAL_SHIPPING_LINE',
    roleName: 'Đại Diện Hãng Tàu (Duyệt Báo Giá)',
    isActive: false,
    isApproved: true,
    lastLogin: '2026-07-28 10:15:00',
    createdDate: '2026-05-20'
  }
];

export const INITIAL_PENDING_REGISTRATIONS: PendingRegistrationRequest[] = [
  {
    id: 'REG-901',
    companyName: 'CMA CGM VIETNAM CO., LTD.',
    taxCode: '0303889123',
    companyType: 'SHIPPING_LINE',
    applicantName: 'Antoine Dupont',
    applicantEmail: 'sgn.adupont@cma-cgm.com',
    applicantPhone: '0908-123-889',
    requestedRole: 'Duyệt Báo Giá M&R & Tra Cứu Tồn Bãi',
    submittedAt: '2026-08-04 09:30:15',
    status: 'PENDING'
  },
  {
    id: 'REG-902',
    companyName: 'CÔNG TY TNHH VẬN TẢI ĐÀI TRANG',
    taxCode: '0314881920',
    companyType: 'TRANSPORT',
    applicantName: 'Nguyễn Văn Trang',
    applicantEmail: 'daitrangtrans@gmail.com',
    applicantPhone: '0913-991-882',
    requestedRole: 'Tra Cứu Phiếu EIR & Đặt Lịch Hạ Bãi',
    submittedAt: '2026-08-03 14:10:00',
    status: 'PENDING'
  }
];

export const INITIAL_PORTAL_LOGS: PortalActivityLog[] = [
  {
    id: 'PLOG-001',
    portalUsername: 'maersk.portal',
    fullName: 'Hans Nielsen',
    companyName: 'MAERSK LINE',
    action: 'Duyệt Báo Giá M&R',
    details: 'Đã phê duyệt báo giá sửa chữa #EST-2026-0891 (3,450,000 VND) cho container MSKU9012837',
    ipAddress: '14.241.220.88',
    timestamp: '2026-08-04 14:25:30'
  },
  {
    id: 'PLOG-002',
    portalUsername: 'msc.portal',
    fullName: 'Marco Rossi',
    companyName: 'MSC LINE',
    action: 'Tải Bảng Kê Công Nợ',
    details: 'Xuất file Excel bảng kê sửa chữa container tháng 07/2026',
    ipAddress: '118.69.182.5',
    timestamp: '2026-08-04 11:08:12'
  },
  {
    id: 'PLOG-003',
    portalUsername: 'tanbinh.transport',
    fullName: 'Trần Văn Nam',
    companyName: 'TÂN BÌNH LOGISTICS',
    action: 'Tra Cứu EIR Gate-In',
    details: 'Tra cứu phiếu giao nhận EIR xe 51C-982.11 chở cont TGHU4928120',
    ipAddress: '113.161.40.12',
    timestamp: '2026-08-03 16:42:05'
  }
];

export const PortalUserModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'users' | 'registrations' | 'roles_matrix' | 'companies' | 'portal_logs' | 'api_integration'
  >('users');

  const [portalUsers, setPortalUsers] = useState<PortalUserItem[]>(INITIAL_PORTAL_USERS);
  const [registrations, setRegistrations] = useState<PendingRegistrationRequest[]>(INITIAL_PENDING_REGISTRATIONS);
  const [portalLogs] = useState<PortalActivityLog[]>(INITIAL_PORTAL_LOGS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PortalUserItem | null>(null);
  const [resetPassModalUser, setResetPassModalUser] = useState<PortalUserItem | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('Portal@2026');

  // Add Form state
  const [formCompanyName, setFormCompanyName] = useState('MAERSK LINE A/S VIETNAM CO., LTD.');
  const [formCompanyType, setFormCompanyType] = useState<'SHIPPING_LINE' | 'TRANSPORT' | 'REPAIR_PARTNER'>('SHIPPING_LINE');
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('PORTAL_SHIPPING_LINE');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleActive = (id: string) => {
    setPortalUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextState = !u.isActive;
          showToast(`Đã ${nextState ? 'kích hoạt / mở khóa' : 'khóa'} tài khoản Portal [${u.username}]`);
          return { ...u, isActive: nextState };
        }
        return u;
      })
    );
  };

  const handleApproveRegistration = (regId: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;

    // Create new Portal User automatically
    const newUser: PortalUserItem = {
      id: `PU-${Date.now().toString().slice(-3)}`,
      companyId: `COMP-NEW-${Date.now()}`,
      companyCode: reg.companyName.substring(0, 8).toUpperCase().replace(/[^A-Z]/g, ''),
      companyName: reg.companyName,
      companyType: reg.companyType,
      username: reg.applicantEmail.split('@')[0] + '.portal',
      fullName: reg.applicantName,
      email: reg.applicantEmail,
      phone: reg.applicantPhone,
      roleCode: reg.companyType === 'SHIPPING_LINE' ? 'PORTAL_SHIPPING_LINE' : 'PORTAL_TRANSPORT',
      roleName: reg.companyType === 'SHIPPING_LINE' ? 'Đại Diện Hãng Tàu (Duyệt Báo Giá)' : 'Nhà Xe Vận Tải',
      isActive: true,
      isApproved: true,
      lastLogin: undefined,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setPortalUsers((prev) => [newUser, ...prev]);
    setRegistrations((prev) => prev.map((r) => (r.id === regId ? { ...r, status: 'APPROVED' } : r)));
    showToast(`Đã phê duyệt tài khoản Portal cho [${reg.companyName}]! Mật khẩu khởi tạo đã gửi qua Email.`);
  };

  const handleRejectRegistration = (regId: string) => {
    setRegistrations((prev) => prev.map((r) => (r.id === regId ? { ...r, status: 'REJECTED' } : r)));
    showToast(`Đã từ chối đơn đăng ký Portal.`);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername || !formFullName || !formEmail) return;

    const newUser: PortalUserItem = {
      id: `PU-${Date.now().toString().slice(-3)}`,
      companyId: `COMP-${Date.now()}`,
      companyCode: formCompanyName.substring(0, 6).toUpperCase(),
      companyName: formCompanyName,
      companyType: formCompanyType,
      username: formUsername.trim().toLowerCase(),
      fullName: formFullName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || '0900-000-000',
      roleCode: formRole,
      roleName: formRole === 'PORTAL_SHIPPING_LINE' ? 'Đại Diện Hãng Tàu' : 'Khách Hàng / Đối Tác Portal',
      isActive: true,
      isApproved: true,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setPortalUsers([newUser, ...portalUsers]);
    setIsAddUserModalOpen(false);
    setFormUsername('');
    setFormFullName('');
    setFormEmail('');
    showToast(`Thêm người dùng Portal thành công: [${newUser.username}] (${newUser.companyName})`);
  };

  const filteredUsers = portalUsers.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType = selectedTypeFilter === 'ALL' || u.companyType === selectedTypeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-sky-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-sky-600/20 text-sky-400 border border-sky-500/30 rounded-2xl shadow-inner">
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Quản Lý Người Dùng Portal Đối Tác (Portal & Shipping Line Users)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono font-bold">
                  EXTERNAL ACCESS CONTROL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Phân hệ quản trị tài khoản dành riêng cho Khách hàng Hãng tàu (Maersk, MSC, COSCO, CMA-CGM), Đội xe vận tải & Tổ thợ sửa chữa đối tác truy cập Portal tra cứu container, duyệt báo giá & tải hóa đơn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Tài Khoản Portal</span>
            </button>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS BAR FOR PORTAL MODULE */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {[
            { id: 'users', label: '1. Danh Sách Người Dùng Portal', icon: <Users className="w-3.5 h-3.5" />, badge: portalUsers.length },
            { id: 'registrations', label: '2. Duyệt Đăng Ký Tài Khoản', icon: <UserCheck className="w-3.5 h-3.5" />, badge: registrations.filter(r => r.status === 'PENDING').length, badgeColor: 'bg-amber-500' },
            { id: 'roles_matrix', label: '3. Ma Trận Quyền Portal', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: 'companies', label: '4. Công Ty Đối Tác Portal', icon: <Building2 className="w-3.5 h-3.5" /> },
            { id: 'portal_logs', label: '5. Nhật Ký Hoạt Động Portal', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'api_integration', label: '6. Cấu Hình API & EDI Sync', icon: <Code2 className="w-3.5 h-3.5" /> }
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-slate-950 ${tab.badgeColor || 'bg-sky-300'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH NGƯỜI DÙNG PORTAL */}
      {/* ========================================================================= */}
      {activeSubTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-300">Lọc Theo Loại Doanh Nghiệp:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: 'ALL', label: 'Tất Cả' },
                  { id: 'SHIPPING_LINE', label: 'Hãng Tàu' },
                  { id: 'TRANSPORT', label: 'Nhà Xe Vận Tải' },
                  { id: 'REPAIR_PARTNER', label: 'Đối Tác Sửa Chữa' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedTypeFilter(type.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedTypeFilter === type.id
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên, username, hãng tàu, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Tài Khoản Portal</th>
                  <th className="py-3.5 px-4">Công Ty Đối Tác</th>
                  <th className="py-3.5 px-3">Loại Hình</th>
                  <th className="py-3.5 px-4">Liên Hệ (Email & SĐT)</th>
                  <th className="py-3.5 px-3">Vai Trò Dịch Vụ</th>
                  <th className="py-3.5 px-3">Lần Đăng Nhập Cuối</th>
                  <th className="py-3.5 px-3 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {u.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white font-mono">{u.username}</div>
                          <div className="text-slate-300 text-[11px]">{u.fullName}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200">{u.companyName}</div>
                      <div className="text-[10px] font-mono text-amber-300">{u.companyCode}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-sky-300 border border-slate-700">
                        {u.companyType === 'SHIPPING_LINE' && 'Hãng Tàu'}
                        {u.companyType === 'TRANSPORT' && 'Nhà Xe Vận Tải'}
                        {u.companyType === 'REPAIR_PARTNER' && 'Đối Tác Sửa Chữa'}
                        {u.companyType === 'CUSTOMER' && 'Khách Hàng'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{u.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{u.phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {u.roleName}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-400 text-[11px]">
                      {u.lastLogin ? u.lastLogin : <span className="text-slate-600 italic">Chưa đăng nhập</span>}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition ${
                          u.isActive
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-rose-950 hover:text-rose-300'
                            : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-emerald-950 hover:text-emerald-300'
                        }`}
                      >
                        {u.isActive ? 'Hoạt Động' : 'Đã Khóa'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setResetPassModalUser(u)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-700 transition cursor-pointer"
                          title="Đặt lại mật khẩu Portal"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setFormCompanyName(u.companyName);
                            setFormUsername(u.username);
                            setFormFullName(u.fullName);
                            setFormEmail(u.email);
                            setFormPhone(u.phone);
                            setIsAddUserModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-sky-300 hover:bg-slate-700 transition cursor-pointer"
                          title="Chỉnh sửa thông tin tài khoản"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DUYỆT ĐĂNG KÝ TÀI KHOẢN PORTAL */}
      {/* ========================================================================= */}
      {activeSubTab === 'registrations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                Danh Sách Đơn Đăng Ký Tài Khoản Portal Đang Chờ Phê Duyệt
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Các đại lý hãng tàu & đơn vị vận tải đăng ký cấp quyền truy cập Portal từ form trực tuyến.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      {reg.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                      {reg.companyType === 'SHIPPING_LINE' ? 'Đại Lý Hãng Tàu' : 'Đơn Vị Vận Tải'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        reg.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : reg.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      {reg.status === 'PENDING' && 'Chờ Duyệt'}
                      {reg.status === 'APPROVED' && 'Đã Phê Duyệt'}
                      {reg.status === 'REJECTED' && 'Đã Từ Chối'}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-base">{reg.companyName}</h4>
                  <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <span>Mã số thuế: <strong className="text-slate-200 font-mono">{reg.taxCode}</strong></span>
                    <span>Người nộp đơn: <strong className="text-slate-200">{reg.applicantName}</strong></span>
                    <span>Email: <strong className="text-sky-400 font-mono">{reg.applicantEmail}</strong></span>
                    <span>SĐT: <strong className="text-slate-200 font-mono">{reg.applicantPhone}</strong></span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800/80 mt-2">
                    Quyền đề xuất: <strong className="text-amber-300">{reg.requestedRole}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {reg.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleApproveRegistration(reg.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Duyệt & Cấp Mật Khẩu</span>
                      </button>
                      <button
                        onClick={() => handleRejectRegistration(reg.id)}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Từ Chối</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono italic">Đã xử lý xong</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MA TRẬN QUYỀN PORTAL (PORTAL PERMISSION MATRIX) */}
      {/* ========================================================================= */}
      {activeSubTab === 'roles_matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Ma Trận Phân Quyền Giới Hạn Người Dùng Portal (Portal Scope Guard)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Đảm bảo người dùng Portal chỉ truy cập container sở hữu bởi công ty mình và không xem được dữ liệu nhạy cảm nội bộ Depot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                roleCode: 'PORTAL_SHIPPING_LINE',
                roleName: 'Tài Khoản Hãng Tàu (Shipping Line)',
                target: 'Maersk, MSC, COSCO, ONE, Evergreen',
                permissions: [
                  'Xem danh sách Container thuộc hãng tàu sở hữu',
                  'Xem ảnh chụp hư hỏng IICL & biên bản giám định',
                  'Phê duyệt (Approve) hoặc Từ chối (Reject) Báo giá M&R',
                  'Tải file PDF báo giá & bảng kê hóa đơn sửa chữa',
                  'Tra cứu vị trí bãi & thời gian lưu kho bãi'
                ]
              },
              {
                roleCode: 'PORTAL_TRANSPORT',
                roleName: 'Tài Khoản Đội Xe Vận Tải (Transporter)',
                target: 'Nhà xe container, Tài xế xe đầu kéo',
                permissions: [
                  'Tra cứu số Container đã được cấp lệnh Gate-In/Out',
                  'Tải phiếu giao nhận điện tử (EIR e-Copy)',
                  'Đăng ký lịch hẹn hạ container rỗng / lấy cont hàng',
                  'Thanh toán phí dịch vụ nâng hạ bằng VNPAY/VietQR'
                ]
              },
              {
                roleCode: 'PORTAL_REPAIR_PARTNER',
                roleName: 'Tài Khoản Tổ Thợ Sửa Chữa (Repair Partner)',
                target: 'Xưởng gia công cơ khí, Tổ thợ hàn',
                permissions: [
                  'Xem phiếu giao việc sửa chữa (Work Order) được phân công',
                  'Cập nhật tiến độ gạt hàn / thay tôn vách',
                  'Gửi yêu cầu kiểm tra nghiệm thu chất lượng (QC Request)',
                  'Xuất kho vật tư theo định mức hãng tàu'
                ]
              }
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    {p.roleCode}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{p.roleName}</h4>
                <p className="text-xs text-sky-400 font-semibold">Đối tượng: {p.target}</p>
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400">Danh sách quyền hạn cấp phép:</span>
                  <ul className="space-y-1.5">
                    {p.permissions.map((perm, pIdx) => (
                      <li key={pIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CÔNG TY ĐỐI TÁC PORTAL */}
      {/* ========================================================================= */}
      {activeSubTab === 'companies' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                Danh Sách Doanh Nghiệp Cấu Hình Đã Kết Nối Portal
              </h3>
              <p className="text-xs text-slate-400 mt-1">Tất cả hãng tàu & nhà xe được cấp Portal Tenant ID riêng biệt.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { code: 'MAERSK', name: 'MAERSK LINE A/S', usersCount: 3, type: 'SHIPPING_LINE', status: 'Active' },
              { code: 'MSC', name: 'MEDITERRANEAN SHIPPING CO.', usersCount: 2, type: 'SHIPPING_LINE', status: 'Active' },
              { code: 'COSCO', name: 'COSCO SHIPPING LINES', usersCount: 1, type: 'SHIPPING_LINE', status: 'Active' },
              { code: 'LOGISTICS-TB', name: 'CÔNG TY CP LOGISTICS TÂN BÌNH', usersCount: 5, type: 'TRANSPORT', status: 'Active' },
              { code: 'REPAIR-HOANGHA', name: 'CƠ KHÍ SỬA CHỮA HOÀNG HÀ', usersCount: 4, type: 'REPAIR_PARTNER', status: 'Active' }
            ].map((c, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    {c.status}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{c.name}</h4>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Số user portal active: <strong className="text-sky-300">{c.usersCount} users</strong></span>
                  <button className="text-sky-400 hover:underline font-bold text-[11px]">Quản lý user</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NHẬT KÝ PORTAL ACTIVITY */}
      {/* ========================================================================= */}
      {activeSubTab === 'portal_logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Nhật Ký Thao Tác Của Người Dùng Portal (Portal Audit Logs)
            </h3>
            <p className="text-xs text-slate-400 mt-1">Ghi nhận minh bạch mọi thao tác duyệt báo giá, tải bảng kê & tra cứu container từ phía khách hàng.</p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Thời Gian</th>
                  <th className="py-3.5 px-4">Tài Khoản Portal</th>
                  <th className="py-3.5 px-4">Công Ty</th>
                  <th className="py-3.5 px-4">Hành Động Executed</th>
                  <th className="py-3.5 px-6">Chi Tiết Thao Tác</th>
                  <th className="py-3.5 px-3 font-mono">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {portalLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">{log.fullName}</span>
                      <div className="text-[10px] text-sky-400 font-mono">@{log.portalUsername}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-300">{log.companyName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-200">{log.details}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-400 text-[11px]">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: API INTEGRATION & EDI SYNC */}
      {/* ========================================================================= */}
      {activeSubTab === 'api_integration' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              API OAuth2 & EDI Standards Cho Hệ Thống Portal Hãng Tàu
            </h3>
            <p className="text-xs text-slate-400 mt-1">Cung cấp RESTful API Endpoint & EDIFACT (WESTIM/DESTIM) đồng bộ tự động với ERP của Hãng tàu.</p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
            <div className="text-emerald-400 font-bold">// .NET 8 Endpoint cho Portal API Authen</div>
            <div><span className="text-sky-400">POST</span> /api/v1/portal/auth/login</div>
            <div><span className="text-amber-400">GET</span>  /api/v1/portal/containers?shippingLineCode=MAERSK</div>
            <div><span className="text-emerald-400">POST</span> /api/v1/portal/estimates/approve</div>
            <div><span className="text-purple-400">GET</span>  /api/v1/portal/edi/destim</div>
          </div>
        </div>
      )}

      {/* MODAL: TẠO TÀI KHOẢN PORTAL MỚI */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-400" />
                Tạo Tài Khoản Portal Cho Khách Hàng / Hãng Tàu
              </h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Loại Hình Đối Tác</label>
                <select
                  value={formCompanyType}
                  onChange={(e: any) => setFormCompanyType(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value="SHIPPING_LINE">Hãng Tàu (Shipping Line)</option>
                  <option value="TRANSPORT">Nhà Xe Vận Tải (Transport)</option>
                  <option value="REPAIR_PARTNER">Đối Tác Sửa Chữa (Repair Partner)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tên Doanh Nghiệp / Hãng Tàu</label>
                <input
                  type="text"
                  required
                  value={formCompanyName}
                  onChange={(e) => setFormCompanyName(e.target.value)}
                  placeholder="Ví dụ: MAERSK LINE A/S VIETNAM"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Username Đăng Nhập</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="maersk.portal"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Họ & Tên Người Đại Diện</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="Hans Nielsen"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Nhận Báo Giá</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="hans@maersk.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="028-3823-0011"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-500 shadow-lg"
                >
                  Tạo Tài Khoản Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET PASSWORD */}
      {resetPassModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              Đặt Lại Mật Khẩu Portal [{resetPassModalUser.username}]
            </h3>
            <p className="text-xs text-slate-400">Mật khẩu mới sẽ gửi tự động đến email {resetPassModalUser.email}</p>
            <div>
              <label className="block text-slate-300 font-bold mb-1 text-xs">Mật Khẩu Mới Khởi Tạo</label>
              <input
                type="text"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-mono font-bold text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResetPassModalUser(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  showToast(`Đã reset mật khẩu thành công cho [${resetPassModalUser.username}]!`);
                  setResetPassModalUser(null);
                }}
                className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-500"
              >
                Xác Nhận Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
