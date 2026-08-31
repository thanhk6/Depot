import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Send,
  CheckCircle2,
  Phone,
  MessageCircle,
  Settings,
  ShieldCheck,
  Building2,
  RefreshCw,
  X,
  Sliders
} from 'lucide-react';
import { NotificationEmployee, BusinessEventType } from '../models/notification.types';
import { notificationService } from '../services/notificationService';
import { ZaloStatusBadge } from '../components/NotificationStatus';

interface EmployeeNotificationsProps {
  onQuickSend?: (employeeId: string) => void;
}

export const EmployeeNotifications: React.FC<EmployeeNotificationsProps> = ({ onQuickSend }) => {
  const [employees, setEmployees] = useState<NotificationEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Event subscription modal state
  const [editingEmployee, setEditingEmployee] = useState<NotificationEmployee | null>(null);
  const [subscribedList, setSubscribedList] = useState<BusinessEventType[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departments = useMemo(() => {
    const s = new Set<string>();
    employees.forEach((e) => s.add(e.department));
    return ['ALL', ...Array.from(s)];
  }, [employees]);

  const filteredList = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone.includes(searchTerm) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.zaloName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = deptFilter === 'ALL' || emp.department === deptFilter;
      const matchStatus = statusFilter === 'ALL' || emp.zaloStatus === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, searchTerm, deptFilter, statusFilter]);

  const handleExportExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Mã NV,Họ Tên,Phòng Ban,Chức Vụ,Số Điện Thoại,Zalo ID,Trạng Thái Zalo,Số Tin Hôm Nay']
        .concat(
          filteredList.map(
            (e) =>
              `${e.id},"${e.name}","${e.department}","${e.role}",${e.phone},"${e.zaloName}",${e.zaloStatus},${e.notificationsToday}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_zalo_nhan_vien_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenSubscription = (emp: NotificationEmployee) => {
    setEditingEmployee(emp);
    setSubscribedList(emp.subscribedEvents);
  };

  const handleToggleEvent = (ev: BusinessEventType) => {
    setSubscribedList((prev) =>
      prev.includes(ev) ? prev.filter((item) => item !== ev) : [...prev, ev]
    );
  };

  const handleSaveSubscription = async () => {
    if (!editingEmployee) return;
    await notificationService.updateEmployeeSubscribedEvents(editingEmployee.id, subscribedList);
    setEditingEmployee(null);
    loadData();
  };

  const availableEvents: { type: BusinessEventType; label: string; group: string }[] = [
    { type: 'GATE_IN_COMPLETED', label: 'Xe Gate-In Vào Cổng', group: 'Cổng & Tiếp Nhận' },
    { type: 'INSPECTION_COMPLETED', label: 'Giám Định e-EIR Xong', group: 'Giám Định' },
    { type: 'ESTIMATE_CREATED', label: 'Báo Giá Mới Tạo', group: 'Báo Giá' },
    { type: 'ESTIMATE_APPROVED', label: 'Báo Giá Đã Được Hãng Tàu Duyệt', group: 'Báo Giá' },
    { type: 'ESTIMATE_REJECTED', label: 'Báo Giá Bị Từ Chối', group: 'Báo Giá' },
    { type: 'WORK_ORDER_CREATED', label: 'Phát Hành Lệnh Sửa Chữa (WO)', group: 'Sửa Chữa' },
    { type: 'MATERIAL_REQUESTED', label: 'Có Yêu Cầu Cấp Vật Tư', group: 'Kho Vật Tư' },
    { type: 'MATERIAL_ISSUED', label: 'Vật Tư Đã Cấp Phát (PXK)', group: 'Kho Vật Tư' },
    { type: 'REPAIR_COMPLETED', label: 'Sửa Chữa Hoàn Tất', group: 'Sửa Chữa' },
    { type: 'QC_PASSED', label: 'QC Nghiệm Thu Đạt AV', group: 'Nghiệm Thu' },
    { type: 'QC_FAILED', label: 'QC Nghiệm Thu Không Đạt', group: 'Nghiệm Thu' },
    { type: 'GATE_OUT_READY', label: 'Container Sẵn Sàng Cấp Vỏ', group: 'Cổng Xuất' },
    { type: 'PAYMENT_RECEIVED', label: 'Nhận Thanh Toán VietQR', group: 'Kế Toán' },
    { type: 'PAYMENT_OVERDUE', label: 'Cảnh Báo Quá Hạn', group: 'Kế Toán' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="p-5 rounded-3xl bg-[#0b132b] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>QUẢN LÝ THÔNG BÁO ZALO NHÂN VIÊN</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Danh sách nhân viên, tình trạng ghép nối Zalo OA và cấu hình nhận sự kiện tự động
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0b132b] border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="relative sm:col-span-5">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên nhân viên, chức vụ, số điện thoại, Zalo..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Department Filter */}
        <div className="sm:col-span-4">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả phòng ban ({departments.length - 1})</option>
            {departments
              .filter((d) => d !== 'ALL')
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>
        </div>

        {/* Zalo Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái Zalo</option>
            <option value="CONNECTED">🟢 Đã kết nối</option>
            <option value="PENDING">🟡 Chưa xác nhận</option>
            <option value="DISCONNECTED">🔴 Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Main DataGrid */}
      <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Nhân Viên</th>
                <th className="py-3 px-3">Phòng Ban & Chức Vụ</th>
                <th className="py-3 px-3">Số Điện Thoại</th>
                <th className="py-3 px-3">Tài Khoản Zalo</th>
                <th className="py-3 px-3">Đã Kết Nối</th>
                <th className="py-3 px-3">Thông Báo Hôm Nay</th>
                <th className="py-3 px-3">Sự Kiện Đăng Ký</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 font-bold text-xs text-sky-400 flex items-center justify-center">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{emp.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{emp.department}</div>
                    <div className="text-[10px] text-slate-400">{emp.role}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-300">
                    {emp.phone}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{emp.zaloName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">{emp.zaloId}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <ZaloStatusBadge status={emp.zaloStatus} />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-sky-400 text-center sm:text-left">
                    {emp.notificationsToday} tin
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {emp.subscribedEvents.length} nghiệp vụ
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenSubscription(emp)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        title="Cấu hình nhận sự kiện"
                      >
                        <Sliders className="w-3 h-3 text-sky-400" />
                        <span>Sự Kiện</span>
                      </button>

                      <button
                        onClick={() => onQuickSend && onQuickSend(emp.id)}
                        className="px-2 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        title="Gửi tin Zalo ngay"
                      >
                        <Send className="w-3 h-3" />
                        <span>Nhắn Zalo</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Edit Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-[#091024] border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>Cấu Hình Nhận Sự Kiện Tự Động</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Nhân viên: <strong className="text-white">{editingEmployee.name}</strong> ({editingEmployee.department})
                </p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {availableEvents.map((ev) => {
                const isChecked = subscribedList.includes(ev.type);
                return (
                  <label
                    key={ev.type}
                    className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                      isChecked
                        ? 'bg-blue-950/40 border-blue-600/60 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{ev.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{ev.group} • {ev.type}</div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleEvent(ev.type)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleSaveSubscription}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow"
              >
                Lưu Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
