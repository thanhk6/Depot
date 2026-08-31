import React, { useState, useMemo } from 'react';
import {
  Users,
  Building2,
  Search,
  CheckSquare,
  Square,
  CheckCircle2,
  Filter,
  Layers,
  Phone,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import {
  NotificationEmployee,
  NotificationCustomer,
  RecipientType
} from '../models/notification.types';
import { ZaloStatusBadge } from './NotificationStatus';

interface RecipientSelectorProps {
  employees: NotificationEmployee[];
  customers: NotificationCustomer[];
  selectedAudience: RecipientType;
  onChangeAudience: (audience: RecipientType) => void;
  selectedIds: string[];
  onToggleRecipient: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  employees,
  customers,
  selectedAudience,
  onChangeAudience,
  selectedIds,
  onToggleRecipient,
  onSelectAll,
  onClearSelection
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCustType, setSelectedCustType] = useState('ALL');
  const [onlyZaloConnected, setOnlyZaloConnected] = useState(false);

  // Departments list for employee filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.department));
    return ['ALL', ...Array.from(set)];
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone.includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDept === 'ALL' || emp.department === selectedDept;
      const matchZalo = !onlyZaloConnected || emp.zaloConnected;
      return matchSearch && matchDept && matchZalo;
    });
  }, [employees, searchTerm, selectedDept, onlyZaloConnected]);

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchSearch =
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.phone.includes(searchTerm);
      const matchType = selectedCustType === 'ALL' || cust.customerType === selectedCustType;
      const matchZalo = !onlyZaloConnected || cust.zaloConnected;
      return matchSearch && matchType && matchZalo;
    });
  }, [customers, searchTerm, selectedCustType, onlyZaloConnected]);

  const currentItems = selectedAudience === 'EMPLOYEE' ? filteredEmployees : filteredCustomers;
  const allCurrentIds = currentItems.map((item) => item.id);
  const isAllSelected = currentItems.length > 0 && currentItems.every((item) => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      onClearSelection();
    } else {
      onSelectAll(allCurrentIds);
    }
  };

  return (
    <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-full">
      {/* Header: Audience Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-400" />
            <span>Đối tượng người nhận</span>
          </label>
          <p className="text-[11px] text-slate-400">Chọn nhóm nhận thông báo qua Zalo & SMS</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              onChangeAudience('EMPLOYEE');
              onClearSelection();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedAudience === 'EMPLOYEE'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Nhân Viên ({employees.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeAudience('CUSTOMER');
              onClearSelection();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedAudience === 'CUSTOMER'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Khách Hàng ({customers.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-b border-slate-800/80">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              selectedAudience === 'EMPLOYEE' ? 'Tìm tên, sđt, phòng ban...' : 'Tìm hãng tàu, mã, sđt...'
            }
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Dropdown */}
        {selectedAudience === 'EMPLOYEE' ? (
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả phòng ban</option>
              {departments
                .filter((d) => d !== 'ALL')
                .map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
            </select>
          </div>
        ) : (
          <div>
            <select
              value={selectedCustType}
              onChange={(e) => setSelectedCustType(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả loại khách hàng</option>
              <option value="SHIPPING_LINE">Hãng Tàu (Shipping Line)</option>
              <option value="TRUCKING">Vận Tải (Trucking)</option>
              <option value="FORWARDER">Giao Nhận (Forwarder)</option>
              <option value="CONSIGNEE">Chủ Hàng (Consignee)</option>
            </select>
          </div>
        )}

        {/* Zalo Only Filter Checkbox */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyZaloConnected}
              onChange={(e) => setOnlyZaloConnected(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Chỉ hiện đã kết nối Zalo
            </span>
          </label>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between py-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            {isAllSelected ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Bỏ chọn tất cả</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span>Chọn tất cả ({currentItems.length})</span>
              </>
            )}
          </button>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline"
            >
              Xóa chọn
            </button>
          )}
        </div>

        <div className="text-right">
          <span className="font-bold text-sky-400">{selectedIds.length}</span> /{' '}
          <span>{currentItems.length}</span> người nhận được chọn
        </div>
      </div>

      {/* Recipient Table List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] border border-slate-800/80 rounded-xl divide-y divide-slate-800/60 scrollbar-thin">
        {currentItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Không tìm thấy người nhận nào phù hợp bộ lọc
          </div>
        ) : (
          currentItems.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            const isEmp = selectedAudience === 'EMPLOYEE';
            const emp = item as NotificationEmployee;
            const cust = item as NotificationCustomer;

            return (
              <div
                key={item.id}
                onClick={() => onToggleRecipient(item.id)}
                className={`p-3 flex items-center justify-between gap-3 hover:bg-slate-800/60 cursor-pointer transition select-none ${
                  isChecked ? 'bg-blue-950/30 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleRecipient(item.id)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-sky-400 shrink-0 border border-slate-700/60">
                    {isEmp ? emp.name.charAt(0) : cust.code.substring(0, 2)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-200 truncate">
                        {isEmp ? emp.name : cust.name}
                      </span>
                      {!isEmp && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-sky-300 border border-slate-700 shrink-0">
                          {cust.code}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {isEmp ? `${emp.role} • ${emp.department}` : `LH: ${cust.contactPerson}`}
                    </p>
                  </div>
                </div>

                {/* Right Side: Phone & Zalo */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div className="hidden sm:block">
                    <div className="flex items-center justify-end gap-1 text-xs text-slate-300 font-mono">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{item.phone}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Zalo: <span className="font-mono text-slate-300">{isEmp ? emp.zaloName : cust.zaloName}</span>
                    </div>
                  </div>

                  <div className="min-w-[80px] flex justify-end">
                    <ZaloStatusBadge status={item.zaloStatus} showLabel={false} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
