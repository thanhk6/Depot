import React, { useEffect, useState, useMemo } from 'react';
import { containerApi, userApi, roleApi, securityPolicyApi, systemAuditLogApi } from '../../../api';
import { useAuth } from '../../../app/providers/AuthProvider';
import { ROLES, PERMISSIONS, RoleDefinition } from '../../../constants/permissions';
import {
  Users,
  ShieldCheck,
  Lock,
  Key,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Smartphone,
  Building2,
  Mail,
  Phone,
  Clock,
  Laptop,
  Copy,
  Check,
  Sparkles,
  Zap,
  Globe,
  Settings,
  Download,
  Shield,
  UserX,
  FileText
} from 'lucide-react';
import {
  UserAccount,
  UserStatus,
  AuditLogEntry,
  SecurityPolicyConfig
} from '../types/rbac';
import {
  INITIAL_SECURITY_POLICY
} from '../data/rbacMockData';
import { UserModal } from '../components/UserModal';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { PermissionMatrixTable } from '../components/PermissionMatrixTable';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { SecurityPolicyConfigView } from '../components/SecurityPolicyConfig';

export const SystemPage: React.FC = () => {
  const { currentRole, currentUser, switchRole } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'USERS' | 'MATRIX' | 'AUDIT' | 'SECURITY'>('USERS');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>(ROLES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityPolicy, setSecurityPolicy] = useState<SecurityPolicyConfig>(INITIAL_SECURITY_POLICY);

  // Filters for Tab 1 (Users)
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resettingUser, setResettingUser] = useState<UserAccount | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([userApi.getUsers(), containerApi.getAll(), roleApi.getRoles(), systemAuditLogApi.getAll(), securityPolicyApi.get()])
      .then(([userResponse, jobResponse, roleResponse, systemLogResponse, policyResponse]: any[]) => {
        const response = userResponse;
        if (response?.statusCode === 200 && Array.isArray(response.data)) {
          setUsers(response.data.map((user: any): UserAccount => ({
            id: String(user.id), username: user.username, fullName: user.fullName,
            email: user.email, phone: '', avatar: undefined, roleId: user.roleName,
            roleCode: user.roleName, roleName: user.roleName, department: '',
            employeeCode: String(user.id), status: user.isActive ? 'ACTIVE' : 'INACTIVE',
            is2FAEnabled: false, lastLoginAt: undefined, lastLoginIp: undefined,
            createdAt: user.createdAt || '', notes: undefined
          })));
        }

        // Ma trận phân quyền: giữ tên/mô tả/badge tĩnh từ constants/permissions.ts, chỉ ghi đè
        // `permissions` bằng dữ liệu đã lưu trên backend (Role.PermissionsJson) nếu có.
        if (roleResponse?.statusCode === 200 && Array.isArray(roleResponse.data)) {
          const backendRoles: { roleCode: string; permissions: string[] | null }[] = roleResponse.data;
          setRoles((prev) =>
            prev.map((r) => {
              const match = backendRoles.find((br) => br.roleCode === r.code);
              return match?.permissions ? { ...r, permissions: match.permissions } : r;
            })
          );
        }

        const jobAuditLogs: AuditLogEntry[] =
          jobResponse?.statusCode === 200 && Array.isArray(jobResponse.data)
            ? jobResponse.data.flatMap((job: any) => (job.auditLogs || []).map((log: any): AuditLogEntry => ({
                id: String(log.id), timestamp: log.timestamp, userId: log.user || 'SYSTEM',
                userName: log.user || 'SYSTEM', userRole: 'DEPOT', action: 'UPDATE_USER',
                actionLabel: log.action, targetResource: job.jobNo, ipAddress: '-',
                deviceInfo: 'Backend SQL Server', status: 'SUCCESS', details: log.details
              })))
            : [];

        const systemLogs: AuditLogEntry[] =
          systemLogResponse?.statusCode === 200 && Array.isArray(systemLogResponse.data)
            ? systemLogResponse.data.map((log: any): AuditLogEntry => ({
                id: String(log.id), timestamp: log.occurredAt, userId: log.performedByName,
                userName: log.performedByName, userRole: log.performedByRole || '',
                action: log.action, actionLabel: log.actionLabel, targetResource: log.targetResource,
                ipAddress: log.ipAddress || '-', deviceInfo: log.deviceInfo || '-',
                status: log.status, details: log.details || ''
              }))
            : [];

        if (jobAuditLogs.length || systemLogs.length) {
          setAuditLogs(
            [...systemLogs, ...jobAuditLogs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
          );
        }

        if (policyResponse?.statusCode === 200 && policyResponse.data) {
          const p = policyResponse.data;
          setSecurityPolicy({
            passwordMinLength: p.passwordMinLength,
            requireSpecialChar: p.requireSpecialChar,
            requireUppercase: p.requireUppercase,
            requireDigits: p.requireDigits,
            passwordExpireDays: p.passwordExpireDays,
            maxFailedAttempts: p.maxFailedAttempts,
            lockoutDurationMinutes: p.lockoutDurationMinutes,
            sessionTimeoutMinutes: p.sessionTimeoutMinutes,
            enforce2FAForAdmins: p.enforce2FaForAdmins,
            ipWhitelistEnabled: p.ipWhitelistEnabled,
            allowedIpRanges: p.allowedIpRangesCsv ? p.allowedIpRangesCsv.split(',').filter(Boolean) : []
          });
        }
      })
      .catch((error) => console.warn('Không thể tải dữ liệu Hệ Thống từ Backend:', error));
  }, []);

  // Stats calculation
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const twoFactorCount = users.filter((u) => u.is2FAEnabled).length;
  const lockedUsers = users.filter((u) => u.status === 'LOCKED').length;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        searchUser.trim() === '' ||
        u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.employeeCode.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.phone.includes(searchUser);

      const matchRole = roleFilter === 'ALL' || u.roleId === roleFilter;
      const matchDept = departmentFilter === 'ALL' || u.department === departmentFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchSearch && matchRole && matchDept && matchStatus;
    });
  }, [users, searchUser, roleFilter, departmentFilter, statusFilter]);

  // Unique departments for filter
  const departments = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.department)));
  }, [users]);

  // Handle Save User (Create / Edit) — nối API thật, backend cần đủ username/fullName/email/roleName/isActive.
  const handleSaveUser = async (userData: Omit<UserAccount, 'id' | 'createdAt'> & { id?: string }) => {
    try {
      if (userData.id) {
        const response = await userApi.updateUser(userData.id, {
          username: userData.username,
          fullName: userData.fullName,
          email: userData.email,
          roleName: userData.roleName,
          isActive: userData.status !== 'LOCKED' && userData.status !== 'INACTIVE'
        } as any);
        if ((response as any).statusCode !== 200) throw new Error(response.message);

        setUsers((prev) => prev.map((u) => (u.id === userData.id ? { ...u, ...userData } : u)));
        setToastMessage(`🎉 Đã cập nhật thông tin tài khoản "${userData.fullName}" thành công!`);
        addAuditLog('UPDATE_USER', 'Cập Nhật Người Dùng', `Tài khoản ${userData.username} (${userData.roleName})`, 'Cập nhật phân quyền/thông tin');
      } else {
        const response = await userApi.createUser({
          username: userData.username,
          fullName: userData.fullName,
          email: userData.email,
          roleName: userData.roleName
        } as any);
        if ((response as any).statusCode !== 200 || !response.data) throw new Error(response.message);

        const created = response.data as any;
        const newUser: UserAccount = {
          ...userData,
          id: String(created.id),
          createdAt: new Date().toISOString().slice(0, 10),
          lastLoginAt: 'Chưa đăng nhập',
          lastLoginIp: 'N/A'
        };
        setUsers((prev) => [newUser, ...prev]);
        setToastMessage(`🎉 Đã tạo mới tài khoản "${userData.fullName}" (${userData.username}) thành công! Mật khẩu mặc định: 123456`);
        addAuditLog('CREATE_USER', 'Tạo Mới Tài Khoản', `Tài khoản ${userData.username}`, `Gán vai trò ${userData.roleName}`);
      }

      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      setToastMessage(`❌ ${error instanceof Error ? error.message : 'Không thể lưu tài khoản trên hệ thống.'}`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Lock/Unlock User
  const handleToggleLockUser = async (user: UserAccount) => {
    const newStatus: UserStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    try {
      const response = await userApi.updateUser(user.id, {
        username: user.username, fullName: user.fullName, email: user.email,
        roleName: user.roleName, isActive: newStatus !== 'LOCKED'
      } as any);
      if ((response as any).statusCode !== 200) throw new Error(response.message);

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      setToastMessage(newStatus === 'LOCKED' ? `🔴 Đã khóa tài khoản ${user.username}` : `🟢 Đã mở khóa tài khoản ${user.username}`);
      addAuditLog('UPDATE_USER', newStatus === 'LOCKED' ? 'Khóa Tài Khoản' : 'Mở Khóa Tài Khoản', `Tài khoản ${user.username}`, `Đổi trạng thái sang ${newStatus}`);
    } catch (error) {
      setToastMessage(`❌ ${error instanceof Error ? error.message : 'Không thể đổi trạng thái tài khoản.'}`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Delete User
  const handleDeleteUser = async (user: UserAccount) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.fullName}" (${user.username}) khỏi hệ thống?`)) return;

    try {
      const response = await userApi.deleteUser(user.id);
      if ((response as any).statusCode !== 200) throw new Error(response.message);

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setToastMessage(`🗑️ Đã xóa tài khoản "${user.username}" khỏi hệ thống.`);
      addAuditLog('DELETE_USER', 'Xóa Tài Khoản', `Tài khoản ${user.username}`, 'Xóa vĩnh viễn khỏi danh sách');
    } catch (error) {
      setToastMessage(`❌ ${error instanceof Error ? error.message : 'Không thể xóa tài khoản.'}`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset Password Confirm
  const handleConfirmResetPassword = async (userId: string, newPass: string, forceChange: boolean) => {
    const user = users.find((u) => u.id === userId);
    try {
      const response = await userApi.resetPassword(userId, newPass, forceChange, currentUser.name);
      if ((response as any).statusCode !== 200) throw new Error(response.message);

      setToastMessage(`🔑 Đã đặt lại mật khẩu mới cho ${user?.fullName}. Mật khẩu tạm: ${newPass}`);
      addAuditLog('RESET_PASSWORD', 'Đặt Lại Mật Khẩu', `Tài khoản ${user?.username}`, `Yêu cầu đổi mật khẩu lần tới: ${forceChange ? 'CÓ' : 'KHÔNG'}`);
    } catch (error) {
      setToastMessage(`❌ ${error instanceof Error ? error.message : 'Không thể đặt lại mật khẩu.'}`);
    }
    setResettingUser(null);
    setTimeout(() => setToastMessage(null), 6000);
  };

  // Switch role to preview UI from user perspective
  const handleImpersonateUserRole = (user: UserAccount) => {
    switchRole(user.roleId);
    setToastMessage(`🔄 Đang chuyển góc nhìn hệ thống sang vai trò: "${user.roleName}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Update Role Permissions — lưu xuống Role.PermissionsJson qua PUT /api/system/roles/{roleCode}/permissions
  const handleUpdateRolePermissions = async (roleId: string, newPermissions: string[]) => {
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) return;

    try {
      const response = await roleApi.updatePermissions(targetRole.code, newPermissions, currentUser.name);
      if ((response as any).statusCode !== 200) throw new Error(response.message);

      setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, permissions: newPermissions } : r)));
      addAuditLog('CHANGE_PERMISSIONS', 'Cập Nhật Quyền Hạn', `Vai trò ${targetRole.name}`, `Cập nhật ${newPermissions.length} quyền hạn`);
    } catch (error) {
      setToastMessage(`❌ ${error instanceof Error ? error.message : 'Không thể lưu ma trận phân quyền.'}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Save Security Policy
  const handleSaveSecurityPolicy = async (newPolicy: SecurityPolicyConfig) => {
    try {
      const response = await securityPolicyApi.save({
        passwordMinLength: newPolicy.passwordMinLength,
        requireSpecialChar: newPolicy.requireSpecialChar,
        requireUppercase: newPolicy.requireUppercase,
        requireDigits: newPolicy.requireDigits,
        passwordExpireDays: newPolicy.passwordExpireDays,
        maxFailedAttempts: newPolicy.maxFailedAttempts,
        lockoutDurationMinutes: newPolicy.lockoutDurationMinutes,
        sessionTimeoutMinutes: newPolicy.sessionTimeoutMinutes,
        enforce2FaForAdmins: newPolicy.enforce2FAForAdmins,
        ipWhitelistEnabled: newPolicy.ipWhitelistEnabled,
        allowedIpRanges: newPolicy.allowedIpRanges,
        performedBy: currentUser.name
      });
      if ((response as any).statusCode !== 200) throw new Error(response.message);

      setSecurityPolicy(newPolicy);
      addAuditLog('UPDATE_USER', 'Cập Nhật Chính Sách Bảo Mật', 'Security Policy Settings', 'Cập nhật password expire, session timeout & IP whitelist');
      setToastMessage('🔐 Đã lưu chính sách bảo mật thành công!');
    } catch (error) {
      setToastMessage(`❌ ${error instanceof Error ? error.message : 'Không thể lưu chính sách bảo mật.'}`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Ghi nhật ký hành động — hiện ngay trên UI (optimistic), đồng thời lưu xuống backend
  // (SystemAuditLog) theo kiểu "best effort": không chặn UI nếu API lỗi, chỉ cảnh báo console.
  const addAuditLog = (
    action: AuditLogEntry['action'],
    actionLabel: string,
    targetResource: string,
    details: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: nowStr,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole.name,
      action,
      actionLabel,
      targetResource,
      ipAddress: '113.161.44.12',
      deviceInfo: 'Chrome / Web Applet',
      status: 'SUCCESS',
      details
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    systemAuditLogApi.create({
      action,
      actionLabel,
      targetResource,
      details,
      performedByName: currentUser.name,
      performedByRole: currentRole.name,
      deviceInfo: 'Chrome / Web Applet',
      status: 'SUCCESS'
    }).catch((error) => console.warn('Không thể ghi nhật ký hoạt động xuống backend:', error));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-2xl">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                PHÂN QUYỀN RBAC &amp; QUẢN LÝ NGƯỜI DÙNG (ROLE-BASED ACCESS CONTROL)
              </h2>
              <span className="px-2.5 py-0.5 bg-purple-950 border border-purple-800 text-purple-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Enterprise Core</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Kiểm soát phân quyền truy cập đa cấp theo 10 Vai trò nghiệp vụ Depot &bull; Quản lý tài khoản nhân viên, ma trận quyền hạn chi tiết, chính sách mật khẩu và nhật ký truy vết Audit Trail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingUser(null);
              setIsUserModalOpen(true);
            }}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mới Người Dùng</span>
          </button>
        </div>
      </div>

      {/* Toast message */}
      {toastMessage && (
        <div className="p-4 bg-slate-900 border-2 border-purple-500 rounded-2xl flex items-center justify-between text-xs text-purple-200 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            &times;
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Tổng Số Tài Khoản</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalUsers}</div>
          <span className="text-[10px] text-slate-500">{departments.length} phòng ban nghiệp vụ</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Đang Hoạt Động (Active)</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{activeUsers}</div>
          <span className="text-[10px] text-slate-500">Tỷ lệ khả dụng: {Math.round((activeUsers / totalUsers) * 100)}%</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Đã Bật Bảo Mật 2FA</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{twoFactorCount}</div>
          <span className="text-[10px] text-slate-500">Google Authenticator OTP</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Tài Khoản Tạm Khóa</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{lockedUsers}</div>
          <span className="text-[10px] text-slate-500">Bị vô hiệu hóa truy cập</span>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('USERS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'USERS'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Danh Sách Người Dùng &amp; Tài Khoản ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('MATRIX')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'MATRIX'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Ma Trận Phân Quyền Vai Trò (RBAC Matrix)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('AUDIT')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'AUDIT'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>3. Nhật Ký Hoạt Động &amp; Bảo Mật ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SECURITY')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'SECURITY'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>4. Chính Sách Bảo Mật &amp; IP Whitelist</span>
          </button>
        </div>

        {/* Filters on Tab 1 (USERS) */}
        {activeSubTab === 'USERS' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs pt-2">
            <div className="sm:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Tìm theo tên, username, email, mã NV..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none"
              >
                <option value="ALL">Tất cả 10 Vai Trò</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none"
              >
                <option value="ALL">Tất cả Phòng Ban</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none"
              >
                <option value="ALL">Tất cả Trạng Thái</option>
                <option value="ACTIVE">🟢 Đang hoạt động</option>
                <option value="LOCKED">🔴 Đang bị khóa</option>
                <option value="INACTIVE">⚪ Tạm dừng</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: USERS DIRECTORY TABLE */}
      {activeSubTab === 'USERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Nhân Viên &amp; Tài Khoản</th>
                  <th className="p-4">Vai Trò (Role)</th>
                  <th className="p-4">Phòng Ban Trực Thuộc</th>
                  <th className="p-4">Bảo Mật 2FA</th>
                  <th className="p-4">Đăng Nhập Gần Nhất</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-850 transition duration-150">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                            {user.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono rounded">
                                  BẠN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                              <span className="text-purple-400">@{user.username}</span>
                              <span>&bull;</span>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-purple-950/80 border border-purple-800 text-purple-300 rounded-lg font-mono font-bold text-[11px]">
                          {user.roleName}
                        </span>
                      </td>

                      <td className="p-4 text-slate-300">
                        <div className="font-medium">{user.department}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{user.employeeCode}</div>
                      </td>

                      <td className="p-4">
                        {user.is2FAEnabled ? (
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-mono font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>BẬT (2FA)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-950 text-slate-500 border border-slate-800 rounded text-[10px] font-mono">
                            Tắt
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        <div>{user.lastLoginAt || 'Chưa đăng nhập'}</div>
                        <div className="text-[10px] text-slate-500">{user.lastLoginIp}</div>
                      </td>

                      <td className="p-4">
                        {user.status === 'ACTIVE' && (
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Hoạt Động</span>
                          </span>
                        )}
                        {user.status === 'LOCKED' && (
                          <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Đang Khóa</span>
                          </span>
                        )}
                        {user.status === 'INACTIVE' && (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                            <span>Tạm Dừng</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleImpersonateUserRole(user)}
                            title="Chuyển sang góc nhìn vai trò này"
                            className="p-1.5 bg-slate-800 hover:bg-purple-900/60 text-slate-300 hover:text-purple-300 rounded-xl transition cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setResettingUser(user)}
                            title="Đặt lại mật khẩu"
                            className="p-1.5 bg-slate-800 hover:bg-amber-900/60 text-slate-300 hover:text-amber-300 rounded-xl transition cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setIsUserModalOpen(true);
                            }}
                            title="Chỉnh sửa tài khoản"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleLockUser(user)}
                            title={user.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            className={`p-1.5 rounded-xl transition cursor-pointer ${
                              user.status === 'LOCKED'
                                ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400'
                                : 'bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400'
                            }`}
                          >
                            {user.status === 'LOCKED' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              title="Xóa tài khoản"
                              className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GRANULAR PERMISSION MATRIX TABLE */}
      {activeSubTab === 'MATRIX' && (
        <PermissionMatrixTable
          roles={roles}
          onUpdateRolePermissions={handleUpdateRolePermissions}
        />
      )}

      {/* TAB 3: AUDIT LOGS VIEWER */}
      {activeSubTab === 'AUDIT' && (
        <AuditLogViewer logs={auditLogs} />
      )}

      {/* TAB 4: SECURITY POLICY CONFIG */}
      {activeSubTab === 'SECURITY' && (
        <SecurityPolicyConfigView
          initialPolicy={securityPolicy}
          onSavePolicy={handleSaveSecurityPolicy}
        />
      )}

      {/* Modal: Create/Edit User */}
      {isUserModalOpen && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setIsUserModalOpen(false);
            setEditingUser(null);
          }}
          onSaveUser={handleSaveUser}
        />
      )}

      {/* Modal: Reset Password */}
      {resettingUser && (
        <ResetPasswordModal
          user={resettingUser}
          onClose={() => setResettingUser(null)}
          onConfirmReset={handleConfirmResetPassword}
        />
      )}
    </div>
  );
};
