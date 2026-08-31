import React, { useState } from 'react';
import { SurveyItemRecord, SurveyStatus } from '../types';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Sparkles,
  ClipboardCheck,
  Eye,
  FileText,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Plus,
  Send,
  Receipt,
  Lock
} from 'lucide-react';

interface SurveyQueueTableProps {
  title: string;
  subtitle: string;
  surveys: SurveyItemRecord[];
  statusFilterTab?: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'ALL';
  currentUserStaffId?: number;
  onSelectSurvey: (survey: SurveyItemRecord) => void;
  onOpenEEIR: (survey: SurveyItemRecord) => void;
  onTransferToOperation?: (survey: SurveyItemRecord) => void;
  onSearchNonGateIn: () => void;
  onCreateNewSurvey?: () => void;
}

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (bảng màu nền trắng + card trắng + số liệu
// màu, xem notifications/pages/NotificationDashboard.tsx) theo yêu cầu người dùng — chuyển toàn bộ nền
// tối (slate-900/950) của màn này sang nền trắng, giữ nguyên ý nghĩa màu nghiệp vụ (AV=emerald,
// CL=amber, DM=rose, khóa=rose...) chỉ đổi từ tông tối (bg-*-950/text-*-300) sang tông sáng
// (bg-*-50/text-*-700) cho khớp bảng màu trang tham chiếu.
export const SurveyQueueTable: React.FC<SurveyQueueTableProps> = ({
  title,
  subtitle,
  surveys,
  statusFilterTab = 'ALL',
  currentUserStaffId,
  onSelectSurvey,
  onOpenEEIR,
  onTransferToOperation,
  onSearchNonGateIn,
  onCreateNewSurvey
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shippingLineFilter, setShippingLineFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter logic
  const filtered = surveys.filter((s) => {
    // Status tab filter
    if (statusFilterTab === 'WAITING' && s.status !== 'NEW' && s.status !== 'ASSIGNED') return false;
    if (statusFilterTab === 'IN_PROGRESS' && s.status !== 'IN_PROGRESS') return false;
    if (statusFilterTab === 'COMPLETED' && s.status !== 'COMPLETED' && s.status !== 'CONFIRMED' && s.status !== 'EEIR_ISSUED') return false;

    // Search query
    const matchSearch =
      s.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.surveyNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.surveyor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.owner.toLowerCase().includes(searchTerm.toLowerCase());

    // Carrier filter
    const matchLine = shippingLineFilter === 'ALL' || s.shippingLine === shippingLineFilter;

    // Condition filter
    const matchCondition = conditionFilter === 'ALL' || s.condition === conditionFilter;

    return matchSearch && matchLine && matchCondition;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onCreateNewSurvey && (
            <button
              onClick={onCreateNewSurvey}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Mới Giám Định</span>
            </button>
          )}

          <button
            onClick={onSearchNonGateIn}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4 text-blue-500" />
            <span>Tra Cứu / Pre-Survey</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm số Container (MSCU...), Số Survey, Surveyor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <select
            value={shippingLineFilter}
            onChange={(e) => {
              setShippingLineFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none shadow-sm"
          >
            <option value="ALL">Tất cả hãng tàu</option>
            <option value="MAERSK">MAERSK Line</option>
            <option value="MSC">MSC Shipping</option>
            <option value="ONE">ONE</option>
            <option value="CMA-CGM">CMA CGM</option>
            <option value="COSCO">COSCO</option>
            <option value="EVERGREEN">EVERGREEN</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => {
              setConditionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none shadow-sm"
          >
            <option value="ALL">Tất cả tình trạng (AV / CL / DM)</option>
            <option value="AV">AV - Đạt chuẩn (Available)</option>
            <option value="CL">CL - Cần vệ sinh (Cleaning)</option>
            <option value="DM">DM - Hư hỏng (Damaged)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Hiển thị: <strong className="text-slate-900">{filtered.length}</strong> / {surveys.length} container
        </div>
      </div>

      {/* DataGrid Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Số Container</th>
                <th className="py-3.5 px-4">Hãng Tàu / Chủ Vỏ</th>
                <th className="py-3.5 px-4">Kích Cỡ / Loại</th>
                <th className="py-3.5 px-4">Giờ Gate-In</th>
                <th className="py-3.5 px-4 text-center">Tình Trạng</th>
                <th className="py-3.5 px-4">Giám Định Viên</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái Survey</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy container nào phù hợp bộ lọc
                  </td>
                </tr>
              ) : (
                paginated.map((survey, index) => {
                  const itemIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  // Đã bị người khác nhận giám định (khóa còn hiệu lực) -> khóa hàng, không cho nhận trùng.
                  const lockedByOther = !!survey.surveyClaimedByStaffId && survey.surveyClaimedByStaffId !== currentUserStaffId;
                  return (
                    <tr key={survey.id} className={`hover:bg-slate-50 transition ${lockedByOther ? 'opacity-60' : ''}`}>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {itemIndex}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-blue-600 text-sm block">
                            {survey.containerNo}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Mã: {survey.surveyNo}
                          </span>
                          {survey.isPreSurveyBeforeGateIn && (
                            <span className="inline-block px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] rounded font-bold">
                              Chưa Gate-In (Pre-Survey)
                            </span>
                          )}
                          {lockedByOther && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 text-[9px] rounded font-bold">
                              <Lock className="w-2.5 h-2.5" />
                              Đang giám định: {survey.surveyClaimedByName || 'Người khác'}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{survey.shippingLine}</span>
                        <span className="text-[10px] text-slate-500 max-w-[140px] truncate block">
                          {survey.owner}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-700 block">{survey.size} {survey.type}</span>
                        <span className="text-[10px] font-mono text-slate-500">ISO: {survey.isoCode}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {survey.gateInTime}
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
                          {survey.damages && survey.damages.length > 0 && ` (${survey.damages.length})`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium block">{survey.surveyor}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Chuẩn: {survey.standard}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            survey.status === 'EEIR_ISSUED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : survey.status === 'COMPLETED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : survey.status === 'IN_PROGRESS'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {survey.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Main Giám Định Action — khóa lại khi container đang được người khác giám định */}
                          {lockedByOther ? (
                            <button
                              disabled
                              className="px-3 py-1.5 bg-slate-100 text-slate-400 font-bold rounded-lg flex items-center gap-1 cursor-not-allowed"
                              title={`Đang được giám định bởi ${survey.surveyClaimedByName || 'người khác'}, vui lòng chờ hoặc chọn container khác`}
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Đã Bị Khóa</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectSurvey(survey)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow transition flex items-center gap-1 cursor-pointer"
                              title="Mở màn hình giám định chi tiết"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>Giám Định</span>
                            </button>
                          )}

                          {/* e-EIR View if available or completed */}
                          {(survey.status === 'COMPLETED' || survey.status === 'EEIR_ISSUED' || survey.status === 'CONFIRMED') && (
                            <button
                              onClick={() => onOpenEEIR(survey)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-emerald-600 rounded-lg transition cursor-pointer"
                              title="Xem biên bản e-EIR điện tử"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Direct Transfer to Operation */}
                          {(survey.status === 'COMPLETED' || survey.status === 'EEIR_ISSUED') && onTransferToOperation && (
                            <button
                              onClick={() => onTransferToOperation(survey)}
                              className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-900 border border-sky-200 rounded-lg transition flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                              title="Phát hành e-EIR & chuyển sang phân hệ Khai Thác Gate-In để lập Phiếu Dịch Vụ"
                            >
                              <Send className="w-3 h-3 text-sky-500" />
                              <span className="hidden sm:inline">Chuyển Khai Thác</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Trang <strong className="text-slate-900">{currentPage}</strong> / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
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
