import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { AuditLogEntry } from '../types/rbac';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        searchKeyword.trim() === '' ||
        log.userName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        log.actionLabel.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        log.targetResource.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        log.details.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchStatus = statusFilter === 'ALL' || log.status === statusFilter;

      return matchSearch && matchAction && matchStatus;
    });
  }, [logs, searchKeyword, actionFilter, statusFilter]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AUDIT-SECURITY-LOGS-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Filter / Search Row */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Nhật Ký Truy Vết Bảo Mật &amp; Thao Tác Hệ Thống (Audit Trail)
            </h3>
          </div>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Xuất File Nhật Ký (.JSON)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên nhân viên, hành động, IP, tài nguyên mục tiêu..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none"
            >
              <option value="ALL">Tất cả loại hành động</option>
              <option value="LOGIN">Đăng Nhập / Đăng Xuất</option>
              <option value="CHANGE_PERMISSIONS">Đổi Phân Quyền</option>
              <option value="APPROVE_REPAIR">Duyệt Báo Giá Sửa Chữa</option>
              <option value="API_TRANSMIT">Truyền Dữ Liệu API Hãng</option>
              <option value="GATE_OUT_RELEASE">Cấp Vỏ Xuất Bãi</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUCCESS">🟢 Thành Công (Success)</option>
              <option value="WARNING">🟡 Cảnh Báo (Warning)</option>
              <option value="DENIED">🔴 Bị Từ Chối (Denied)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Thời Gian &amp; ID</th>
                <th className="p-4">Người Thực Hiện</th>
                <th className="p-4">Hành Động Nghiệp Vụ</th>
                <th className="p-4">Tài Nguyên / Đối Tượng</th>
                <th className="p-4">Địa Chỉ IP &amp; Thiết Bị</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Chi Tiết Sự Kiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850 transition duration-150">
                  <td className="p-4 font-mono text-[11px] whitespace-nowrap">
                    <div className="text-slate-300 font-bold">{log.timestamp}</div>
                    <div className="text-[10px] text-slate-500">{log.id}</div>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-white">{log.userName}</div>
                    <div className="text-[10px] text-purple-400 font-mono">{log.userRole}</div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-indigo-300 font-bold rounded-lg text-[11px]">
                      {log.actionLabel}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-slate-300 font-bold">
                    {log.targetResource}
                  </td>

                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    <div className="text-slate-300">{log.ipAddress}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Laptop className="w-3 h-3" />
                      <span>{log.deviceInfo}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    {log.status === 'SUCCESS' && (
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold text-[10px] inline-flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>SUCCESS</span>
                      </span>
                    )}
                    {log.status === 'WARNING' && (
                      <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded font-bold text-[10px] inline-flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>WARNING</span>
                      </span>
                    )}
                    {log.status === 'DENIED' && (
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-bold text-[10px] inline-flex items-center gap-1 font-mono">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        <span>DENIED</span>
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-slate-400 text-[11px] max-w-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
