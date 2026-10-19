import React, { useState } from 'react';
import { SurveyItemRecord } from '../types';
import { formatDateTime } from '../../../utils/format';
import {
  History,
  Search,
  Download,
  Eye,
  FileText,
  Sparkles,
  AlertTriangle,
  Wrench,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useShippingLineOptions } from '../../../hooks/useShippingLineOptions';

interface SurveyHistoryTableProps {
  /** Phiếu giám định ĐÃ NỘP (hồ sơ có phiếu và đã rời SURVEYING) — SurveyModulePage.refreshSurveyHistory. */
  surveys: SurveyItemRecord[];
  loadError?: string | null;
  onSelectSurvey: (survey: SurveyItemRecord) => void;
  onOpenEEIR: (survey: SurveyItemRecord) => void;
}

// Nhãn trạng thái hiện tại của hồ sơ container (DepotJob.Status).
const JOB_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  CLEANING: { label: 'Đang vệ sinh', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  WAITING_FORKLIFT: { label: 'Chờ xe nâng', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  IN_YARD: { label: 'Trong bãi', cls: 'bg-slate-50 text-slate-700 border-slate-200' },
  PAYMENT_PENDING: { label: 'Chờ thanh toán', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  ESTIMATING: { label: 'Chờ báo giá', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  REPAIRING: { label: 'Đang sửa chữa', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  QC_PENDING: { label: 'Chờ QC', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  READY_FOR_OUT: { label: 'Sẵn sàng xuất', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  GATE_OUT: { label: 'Đã ra cổng', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
  CANCELLED: { label: 'Đã huỷ', cls: 'bg-slate-100 text-slate-500 border-slate-300' }
};
export const jobStatusLabel = (status?: string) => (status ? JOB_STATUS_LABEL[status]?.label || status : '');

// Ngày (YYYY-MM-DD) của thời điểm giám định theo giờ Việt Nam — để so với ô lọc ngày.
const vnDay = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
};

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (nền trắng) theo yêu cầu người dùng.
// Không có thao tác nộp lại / chuyển khai thác ở đây — phiếu trong lịch sử đã nộp chính thức.
export const SurveyHistoryTable: React.FC<SurveyHistoryTableProps> = ({
  surveys,
  loadError,
  onSelectSurvey,
  onOpenEEIR
}) => {
  const shippingLineOptions = useShippingLineOptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [shippingLineFilter, setShippingLineFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = surveys.filter((s) => {
    const matchSearch =
      s.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.surveyNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.surveyor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.eeirNo && s.eeirNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.damages && s.damages.some((d) => d.damageCode.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchLine = shippingLineFilter === 'ALL' || s.shippingLine === shippingLineFilter;
    const matchCondition = conditionFilter === 'ALL' || s.condition === conditionFilter;
    // Lọc theo NGÀY giám định (giờ VN), tính cả ngày đầu và ngày cuối — trước đây 2 ô ngày không được dùng.
    const day = vnDay(s.surveyDate);
    const matchDate = (!dateFrom || (day !== '' && day >= dateFrom)) && (!dateTo || (day !== '' && day <= dateTo));

    return matchSearch && matchLine && matchCondition && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Xuất CSV thật: mọi dòng đang khớp bộ lọc (không chỉ trang đang xem), BOM UTF-8 để Excel đọc đúng tiếng Việt.
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      setExportMsg('Không có dữ liệu để xuất theo bộ lọc hiện tại.');
      return;
    }
    const header = ['Số phiếu', 'Container', 'Hãng tàu', 'Ngày giám định', 'Giám định viên', 'Phân loại', 'Số tổn thất', 'Trạng thái hồ sơ', 'Số e-EIR'];
    const rows = filtered.map((s) => [
      s.surveyNo, s.containerNo, s.shippingLine, s.surveyDate ? formatDateTime(s.surveyDate) : '', s.surveyor,
      s.condition, s.damages ? s.damages.length : 0, jobStatusLabel(s.jobStatus), s.eeirNo || ''
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lich-su-giam-dinh-${new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace(/-/g, '')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExportMsg(`Đã xuất ${filtered.length} phiếu ra file CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-2xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              Lịch Sử &amp; Nhật Ký Giám Định (Survey Audit History)
            </h2>
            <p className="text-xs text-slate-500">
              Tra cứu toàn bộ hồ sơ giám định vỏ container đã thực hiện, đối soát chuẩn IICL và lưu trữ chứng từ e-EIR.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          <span>Xuất Báo Cáo Excel (CSV)</span>
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Số Cont, Survey No, Mã Damage..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <select
              value={shippingLineFilter}
              onChange={(e) => {
                setShippingLineFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none"
            >
              <option value="ALL">Tất cả hãng tàu</option>
              {shippingLineOptions.map((l) => (
                <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={conditionFilter}
              onChange={(e) => {
                setConditionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none"
            >
              <option value="ALL">Tất cả phân loại (AV/CL/DM)</option>
              <option value="AV">AV - Đạt chuẩn (Available)</option>
              <option value="CL">CL - Cần vệ sinh (Cleaning)</option>
              <option value="DM">DM - Hư hỏng (Damaged)</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              title="Từ ngày giám định"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none font-mono"
            />
          </div>

          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              title="Đến ngày giám định"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {exportMsg && (
        <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">{exportMsg}</div>
      )}

      {/* DataGrid Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Số Survey &amp; Cont</th>
                <th className="py-3.5 px-4">Hãng Tàu</th>
                <th className="py-3.5 px-4">Kích Cỡ / ISO</th>
                <th className="py-3.5 px-4">Ngày Giờ Giám Định</th>
                <th className="py-3.5 px-4 text-center">Phân Loại (Grade)</th>
                <th className="py-3.5 px-4 text-center">Số Tổn Thất</th>
                <th className="py-3.5 px-4">Giám Định Viên</th>
                <th className="py-3.5 px-4">Trạng Thái Hồ Sơ</th>
                <th className="py-3.5 px-4">Số e-EIR</th>
                <th className="py-3.5 px-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 px-4 text-center text-slate-500">
                    {loadError
                      ? loadError
                      : surveys.length === 0
                      ? 'Chưa có phiếu giám định đã nộp.'
                      : 'Không có phiếu khớp bộ lọc.'}
                  </td>
                </tr>
              )}
              {paginated.map((survey) => (
                <tr key={survey.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-amber-700 text-sm block">
                      {survey.containerNo}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {survey.surveyNo}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{survey.shippingLine}</span>
                    <span className="text-[10px] text-slate-500">{survey.owner}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700 block">{survey.size} {survey.type}</span>
                    <span className="font-mono text-[10px] text-slate-500">ISO: {survey.isoCode}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {survey.surveyDate ? formatDateTime(survey.surveyDate) : ''}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded border ${
                        survey.condition === 'AV'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : survey.condition === 'CL'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {survey.condition === 'AV' && <Sparkles className="w-3 h-3 text-emerald-500" />}
                      {survey.condition === 'CL' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                      {survey.condition === 'DM' && <Wrench className="w-3 h-3 text-rose-500" />}
                      {survey.condition}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {survey.damages ? survey.damages.length : 0}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {survey.surveyor}
                  </td>

                  <td className="py-3.5 px-4">
                    {survey.jobStatus && (
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${JOB_STATUS_LABEL[survey.jobStatus]?.cls || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {jobStatusLabel(survey.jobStatus)}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {survey.eeirNo ? (
                      <button
                        onClick={() => onOpenEEIR(survey)}
                        className="font-mono text-[11px] text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{survey.eeirNo}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">Chưa phát hành</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectSurvey(survey)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-amber-600 rounded-lg transition cursor-pointer"
                        title="Xem lại chi tiết giám định"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <strong className="text-slate-900">{filtered.length}</strong> kết quả lịch sử
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
