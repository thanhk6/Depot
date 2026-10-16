import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Search,
  RotateCcw,
  Save,
  CheckCircle2,
  Lock,
  Layers,
  ChevronDown,
  ChevronRight,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';
import { RoleDefinition } from '../../../constants/permissions';
import { PERMISSION_GROUPS } from '../data/rbacMockData';

interface PermissionMatrixTableProps {
  roles: RoleDefinition[];
  onUpdateRolePermissions: (roleId: string, permissions: string[]) => void;
}

export const PermissionMatrixTable: React.FC<PermissionMatrixTableProps> = ({
  roles,
  onUpdateRolePermissions
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[1]?.id || 'ROLE_SURVEYOR');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    PG_CONTAINER: true,
    PG_GATE: true,
    PG_SURVEY: true,
    PG_OPERATION_PAYMENT: true,
    PG_YARD_FORKLIFT: true,
    PG_ESTIMATE_APPROVAL: true,
    PG_REPAIR_QC: true,
    PG_CLEANING_WAREHOUSE: true,
    PG_BILLING_SYSTEM: true
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Local state of role permissions for editing
  const [localRolePermissions, setLocalRolePermissions] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    roles.forEach((r) => {
      map[r.id] = [...r.permissions];
    });
    return map;
  });

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];
  const currentRolePerms = localRolePermissions[selectedRoleId] || [];
  const isAdminRole = selectedRoleId === 'ROLE_ADMIN';

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleTogglePermission = (permissionCode: string) => {
    if (isAdminRole) return; // Admin always has all permissions

    setLocalRolePermissions((prev) => {
      const existing = prev[selectedRoleId] || [];
      const updated = existing.includes(permissionCode)
        ? existing.filter((p) => p !== permissionCode)
        : [...existing, permissionCode];
      return { ...prev, [selectedRoleId]: updated };
    });
    setHasUnsavedChanges(true);
  };

  const handleSelectAllInGroup = (groupId: string) => {
    if (isAdminRole) return;
    const group = PERMISSION_GROUPS.find((g) => g.id === groupId);
    if (!group) return;

    const groupPermCodes = group.permissions.map((p) => p.code);
    setLocalRolePermissions((prev) => {
      const existing = prev[selectedRoleId] || [];
      const combined = Array.from(new Set([...existing, ...groupPermCodes]));
      return { ...prev, [selectedRoleId]: combined };
    });
    setHasUnsavedChanges(true);
  };

  const handleDeselectAllInGroup = (groupId: string) => {
    if (isAdminRole) return;
    const group = PERMISSION_GROUPS.find((g) => g.id === groupId);
    if (!group) return;

    const groupPermCodes = new Set(group.permissions.map((p) => p.code));
    setLocalRolePermissions((prev) => {
      const existing = prev[selectedRoleId] || [];
      const filtered = existing.filter((code) => !groupPermCodes.has(code));
      return { ...prev, [selectedRoleId]: filtered };
    });
    setHasUnsavedChanges(true);
  };

  const handleResetToDefault = () => {
    const initialRole = roles.find((r) => r.id === selectedRoleId);
    if (initialRole) {
      setLocalRolePermissions((prev) => ({
        ...prev,
        [selectedRoleId]: [...initialRole.permissions]
      }));
      setHasUnsavedChanges(false);
      setToastMsg(`Đã khôi phục quyền hạn mặc định cho vai trò "${initialRole.name}"`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleSaveChanges = () => {
    onUpdateRolePermissions(selectedRoleId, currentRolePerms);
    setHasUnsavedChanges(false);
    setToastMsg(`Đã lưu cấu hình ma trận phân quyền cho vai trò "${activeRole.name}" thành công!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filter groups
  const filteredGroups = PERMISSION_GROUPS.filter((g) => {
    if (selectedGroupId !== 'ALL' && g.id !== selectedGroupId) return false;
    if (searchKeyword.trim() === '') return true;

    return (
      g.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      g.permissions.some(
        (p) =>
          p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          p.code.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-4 bg-white border-2 border-purple-500 rounded-2xl flex items-center justify-between text-xs text-purple-200 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-500 hover:text-slate-900 p-1">
            &times;
          </button>
        </div>
      )}

      {/* Role Picker Bar */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Ma Trận Phân Quyền Theo Vai Trò Nghiệp Vụ (RBAC Matrix)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn vai trò bên dưới để bật/tắt quyền hạn chi tiết theo từng phân hệ nghiệp vụ Depot.
            </p>
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToDefault}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hoàn Tác</span>
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg "
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi Phân Quyền</span>
              </button>
            </div>
          )}
        </div>

        {/* Roles Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {roles.map((r) => {
            const isSelected = r.id === selectedRoleId;
            const permCount = (localRolePermissions[r.id] || []).length;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRoleId(r.id);
                  setHasUnsavedChanges(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-purple-50 border-purple-500 text-purple-200 shadow-md '
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{r.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isSelected ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {r.id === 'ROLE_ADMIN' ? 'FULL' : `${permCount} Quyền`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Role Overview Card */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm font-sans">{activeRole.name}</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded text-[10px]">
                {activeRole.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">{activeRole.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-sans">
          <span className="text-slate-500 text-xs">
            Tổng số quyền đang cấp: <strong className="text-emerald-600 font-mono">{isAdminRole ? 'Tất cả (45/45)' : `${currentRolePerms.length} quyền`}</strong>
          </span>
          {isAdminRole && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
              👑 Root Admin Không Thể Bị Giới Hạn
            </span>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm mã quyền (VD: gate.out, survey.approve, payment.confirm)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Tất cả 9 Phân Hệ Nghiệp Vụ</option>
            {PERMISSION_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permission Groups Accordion / Matrix */}
      <div className="space-y-4">
        {filteredGroups.map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          const groupCodes = group.permissions.map((p) => p.code);
          const activeCountInGroup = groupCodes.filter((code) =>
            isAdminRole ? true : currentRolePerms.includes(code)
          ).length;
          const isAllSelected = activeCountInGroup === groupCodes.length;

          return (
            <div
              key={group.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl"
            >
              {/* Group Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <div
                  onClick={() => toggleGroupExpand(group.id)}
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                >
                  <button className="p-1 text-slate-500 hover:text-slate-900">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 tracking-wide">{group.name}</h4>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-mono font-bold">
                        {activeCountInGroup}/{group.permissions.length} Quyền
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{group.description}</p>
                  </div>
                </div>

                {!isAdminRole && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => handleSelectAllInGroup(group.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-purple-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      Bật Tất Cả
                    </button>
                    <button
                      onClick={() => handleDeselectAllInGroup(group.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      Tắt Tất Cả
                    </button>
                  </div>
                )}
              </div>

              {/* Group Permission Items */}
              {isExpanded && (
                <div className="p-4 divide-y divide-slate-200/60">
                  {group.permissions.map((perm) => {
                    const isGranted = isAdminRole || currentRolePerms.includes(perm.code);

                    return (
                      <div
                        key={perm.code}
                        onClick={() => handleTogglePermission(perm.code)}
                        className={`py-3 px-3 rounded-2xl flex items-center justify-between transition cursor-pointer ${
                          isGranted
                            ? 'bg-purple-50 hover:bg-purple-50 text-purple-200'
                            : 'hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <div className="space-y-0.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{perm.name}</span>
                            <span className="px-1.5 py-0.2 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] rounded">
                              {perm.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{perm.description}</p>
                        </div>

                        <div className="shrink-0 pl-2">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                              isGranted
                                ? 'bg-purple-600 border-purple-500 text-white shadow-md '
                                : 'bg-slate-50 border-slate-200 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
