import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import {
  CheckCircle2,
  XCircle,
  Wrench,
  ShieldCheck,
  Search,
  Maximize2,
  Clock,
  Sparkles,
  FileCheck,
  UserCheck,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Printer
} from 'lucide-react';

export const QCModule: React.FC = () => {
  const { jobs, recordQCResult, activeRole } = useDepot();

  const qcJobs = jobs.filter(
    (j) =>
      j.status === 'QC_PENDING' ||
      j.status === 'QC_PASSED' ||
      j.status === 'QC_FAILED' ||
      j.status === 'REPAIRING' ||
      j.status === 'YARD_STORED'
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(
    qcJobs.length > 0 ? qcJobs[0].id : jobs[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const currentJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Checklist State
  const [checklist, setChecklist] = useState([
    { id: '1', item: 'Kiểm tra đường hàn ghép vách (Weld Strength & Integrity)', passed: true, note: 'Hàn phẳng, không rỗ' },
    { id: '2', item: 'Đo độ dày lớp sơn chống rỉ Epoxy (Min 120 microns)', passed: true, note: 'Sơn phủ kín 2 lớp' },
    { id: '3', item: 'Đệm cao su gioăng cửa kín nước 100% (Door Gasket Test)', passed: true, note: 'Khép khít, không lọt ánh sáng' },
    { id: '4', item: 'Ván sàn container phẳng, không lồi lõm hay dằm gỗ', passed: true, note: 'Đã bắn vít chìm' },
    { id: '5', item: 'Thử nghiệm kín nước & kín sáng (Light & Water Leak Test)', passed: true, note: 'Đạt tiêu chuẩn IICL-5' }
  ]);

  const [inspectorComments, setInspectorComments] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const handleCompleteQC = (passed: boolean) => {
    if (!currentJob) return;

    const qcData = {
      inspectorName: 'Đặng Quốc Huy (Kỹ sư QC)',
      inspectionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      result: passed ? ('PASSED' as const) : ('FAILED' as const),
      checklist: checklist.map((c) => ({ item: c.item, passed: c.passed, note: c.note })),
      comments: inspectorComments || (passed ? 'Đạt tiêu chuẩn IICL-5 xuất bãi' : 'Cần hàn lại vách trái và dặm thêm sơn')
    };

    recordQCResult(
      currentJob.id,
      passed ? 'PASSED' : 'FAILED',
      checklist.map((c) => ({ item: c.item, passed: c.passed, note: c.note })),
      inspectorComments || (passed ? 'Đạt tiêu chuẩn IICL-5 xuất bãi' : 'Cần hàn lại vách trái và dặm thêm sơn')
    );
    setToastMessage(
      passed
        ? `✅ Container ${currentJob.containerNo} đã ĐẠT QC (PASSED)! Đã chuyển sang trạng thái Lưu Bãi / Sẵn Sàng Xuất.`
        : `⚠️ Container ${currentJob.containerNo} KHÔNG ĐẠT QC (FAILED). Đã trả về tổ thợ sửa chữa!`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Container List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hàng Chờ Kiểm Tra QC ({qcJobs.length})
            </h3>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
              IICL Standard
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm số Container QC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
            {qcJobs.map((job) => {
              const isSelected = job.id === currentJob?.id;
              const isPassed = job.qcInspection?.result === 'PASSED';
              const isFailed = job.qcInspection?.result === 'FAILED';

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-blue-950/60 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-amber-300 tracking-wider">
                      {job.containerNo}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                        isPassed
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : isFailed
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {isPassed ? '✓ QC ĐẠT' : isFailed ? '✕ QC HỎNG' : 'CHỜ NGHIỆM THU'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Hãng tàu: <strong className="text-white">{job.shippingLine}</strong></span>
                    <span>Loại: <strong className="text-white">{job.isoSize}</strong></span>
                  </div>

                  {job.repairOrder && (
                    <p className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      Tổ thợ: <strong className="text-slate-200">{job.repairOrder.repairTeam}</strong>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Workspace */}
        {currentJob && (
          <div className="lg:col-span-8 space-y-6">
            {/* Header info card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white font-mono tracking-widest">
                      {currentJob.containerNo}
                    </h2>
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full">
                      {currentJob.isoSize}
                    </span>
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {currentJob.shippingLine}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Hồ sơ Job: <strong className="text-slate-200 font-mono">{currentJob.id}</strong> • Vị trí bãi: <strong className="text-amber-300 font-mono">{currentJob.currentLocation?.block || 'BLOCK_A'}-{currentJob.currentLocation?.bay || 1}-{currentJob.currentLocation?.row || 1}-{currentJob.currentLocation?.tier || 1}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCompleteQC(false)}
                    className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>TỪ CHỐI (QC FAILED)</span>
                  </button>

                  <button
                    onClick={() => handleCompleteQC(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PHÊ DUYỆT (QC PASSED)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Before vs After Photo Inspection */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Đối Chiếu Ảnh Trước & Sau Khi Sửa Chữa (Before / After Photos)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Photo */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> 1. Ảnh Trước Sửa (Hư Hỏng Ban Đầu)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">IICL Survey</span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden group aspect-video bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <img
                      src={currentJob.survey?.photos?.[0]?.url || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"}
                      alt="Before repair"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                      <p className="text-[11px] text-slate-200">
                        {currentJob.survey?.damages?.[0]?.damageNameVi || 'Lỗ thủng vách trái 15cm'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* After Photo */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 2. Ảnh Sau Khi Sửa Chữa
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Tổ Sửa Chữa</span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden group aspect-video bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <img
                      src={currentJob.repairOrder?.postRepairPhotos?.[0] || "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80"}
                      alt="After repair"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                      <p className="text-[11px] text-slate-200">Đã vá tôn HP, mài phẳng & sơn Epoxy 2 lớp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist & Remarks */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-400" />
                Checklist Tiêu Chuẩn Kỹ Thuật IICL-5
              </h3>

              <div className="space-y-2">
                {checklist.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => toggleChecklistItem(c.id)}
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                          c.passed
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {c.passed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{c.item}</p>
                        <p className="text-[11px] text-slate-400">{c.note}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        c.passed
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          : 'bg-rose-950/60 text-rose-300 border-rose-800'
                      }`}
                    >
                      {c.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ghi Chú Kỹ Sư Giám Định QC
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập ghi chú chi tiết kết quả nghiệm thu..."
                  value={inspectorComments}
                  onChange={(e) => setInspectorComments(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
