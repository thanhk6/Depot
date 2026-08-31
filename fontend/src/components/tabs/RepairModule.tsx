import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Package,
  Users,
  Camera,
  ClipboardCheck,
  Play,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';

export const RepairModule: React.FC = () => {
  const {
    jobs,
    assignRepairWorkOrder,
    completeRepairWorkOrder,
    recordQCResult
  } = useDepot();

  const repairJobs = jobs.filter(
    (j) =>
      j.status === 'ESTIMATE_APPROVED' ||
      j.status === 'REPAIRING' ||
      j.status === 'QC_PENDING' ||
      j.status === 'QC_PASSED' ||
      j.status === 'QC_FAILED'
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(
    repairJobs[0]?.id || jobs[0]?.id || ''
  );

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  // Assignment Form State
  const [repairTeam, setRepairTeam] = useState('Tổ Sửa Chữa Cơ Điện #01');
  const [worker1, setWorker1] = useState('Nguyễn Văn Hùng (Thợ hàn)');
  const [worker2, setWorker2] = useState('Trần Đình Nam (Thợ sơn)');

  // Materials requisition state
  const [issuedMaterials, setIssuedMaterials] = useState([
    { itemCode: 'STEEL-3MM', itemName: 'Tấm thép mạ kẽm 3mm', quantity: 1, unit: 'Tấm' },
    { itemCode: 'WELD-ROD', itemName: 'Que hàn E7018 chịu lực', quantity: 2, unit: 'Kg' },
    { itemCode: 'PAINT-EPOXY', itemName: 'Sơn phủ Epoxy chống rỉ', quantity: 1, unit: 'Lít' }
  ]);

  // Post repair photos
  const [postPhotos, setPostPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
  ]);

  // QC Checklist State
  const [qcChecklist, setQcChecklist] = useState([
    { item: 'Kiểm tra độ kín nước và ánh sáng (Light-tightness)', passed: true, note: 'Tốt' },
    { item: 'Mối hàn vá phẳng, mài sạch xỉ và bụi kim loại', passed: true, note: 'Tốt' },
    { item: 'Sơn phủ chống rỉ đạt độ dày tiêu chuẩn IICL', passed: true, note: 'Màu sơn đồng nhất' },
    { item: 'Sàn gỗ phẳng, không đinh ốc nhô lên', passed: true, note: 'Sạch sẽ' }
  ]);
  const [qcComments, setQcComments] = useState('Container đã hoàn thành sửa chữa đạt tiêu chuẩn IICL. Cho phép hạ bãi lưu chờ xuất.');

  const handleToggleQcItem = (index: number) => {
    setQcChecklist(
      qcChecklist.map((item, i) => (i === index ? { ...item, passed: !item.passed } : item))
    );
  };

  const handleStartRepair = () => {
    if (!activeJob) return;

    assignRepairWorkOrder(activeJob.id, repairTeam, [worker1, worker2].filter(Boolean), issuedMaterials);
  };

  const handleFinishRepair = () => {
    if (!activeJob) return;

    completeRepairWorkOrder(activeJob.id, postPhotos);
  };

  const handleQCSubmit = (result: 'PASSED' | 'FAILED') => {
    if (!activeJob) return;

    recordQCResult(activeJob.id, result, qcChecklist, qcComments);
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-orange-900/60 to-slate-900 border border-orange-700/50 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-600 rounded-xl text-white shadow-lg shadow-orange-600/30">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">5. Thi Công Sửa Chữa & Kiểm Tra QC (Repair & QC)</h2>
            <p className="text-xs text-orange-200/80">
              Phân công tổ thợ, xuất vật tư kho, thi công sửa chữa, chụp ảnh đối chiếu & Kiểm tra nghiệm thu QC
            </p>
          </div>
        </div>

        {/* Container Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-orange-200 whitespace-nowrap">Chọn Container:</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-orange-600/50 rounded-xl text-xs text-white font-mono font-bold focus:ring-2 focus:ring-orange-500 min-w-[220px]"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.containerNo} ({j.isoSize} - {j.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Work Order Assignment & Materials */}
          <div className="lg:col-span-1 space-y-4">
            {/* Work Order Info Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Lệnh Sửa Chữa (Work Order)</span>
                <span className="font-mono text-slate-400">
                  {activeJob.repairOrder?.workOrderNo || `WO-2026-${activeJob.id.split('-')?.[2] || activeJob.id}`}
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Tổ Sửa Chữa Đảm Nhận</label>
                  <select
                    value={repairTeam}
                    onChange={(e) => setRepairTeam(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Tổ Sửa Chữa Cơ Điện #01">Tổ Sửa Chữa Cơ Điện #01</option>
                    <option value="Tổ Sửa Chữa Hàn Vách #02">Tổ Sửa Chữa Hàn Vách #02</option>
                    <option value="Tổ Sửa Chữa Điện Lạnh PTI #03">Tổ Sửa Chữa Điện Lạnh PTI #03</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Thợ 1 chính</label>
                    <input
                      type="text"
                      value={worker1}
                      onChange={(e) => setWorker1(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Thợ 2 phụ</label>
                    <input
                      type="text"
                      value={worker2}
                      onChange={(e) => setWorker2(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Trạng Thái Lệnh:</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-orange-900/60 text-orange-300 border border-orange-700/60">
                    {activeJob.repairOrder?.status || 'CHỜ BẮT ĐẦU'}
                  </span>
                </div>
              </div>
            </div>

            {/* Issued Materials Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Xuất Vật Tư / Phụ Tùng Kho</span>
              </h3>

              <div className="space-y-2 text-xs">
                {issuedMaterials.map((mat, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{mat.itemName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Mã vật tư: {mat.itemCode}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-900 rounded text-orange-400 font-mono font-bold">
                      {mat.quantity} {mat.unit}
                    </span>
                  </div>
                ))}
              </div>

              {activeJob.status === 'ESTIMATE_APPROVED' && (
                <button
                  onClick={handleStartRepair}
                  className="w-full mt-2 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Tiếp Nhận & Bắt Đầu Sửa Chữa</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Execution Photos & QC Inspection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Photos Before / After Repair */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>Hình Ảnh Đối Chiếu Trước & Sau Khi Sửa Chữa</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pre-repair photo */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-amber-400 block">Ảnh Trước Khi Sửa:</span>
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-36">
                    <img
                      src={activeJob.survey?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'}
                      alt="Pre-repair"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Post-repair photo */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-emerald-400 block">Ảnh Sau Khi Sửa Hoàn Thiện:</span>
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-36 relative">
                    <img
                      src={postPhotos?.[0] || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80'}
                      alt="Post-repair"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-emerald-300 font-mono">
                      QC Certified
                    </div>
                  </div>
                </div>
              </div>

              {activeJob.status === 'REPAIRING' && (
                <button
                  onClick={handleFinishRepair}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Hoàn Thành Thi Công & Chuyển Kiểm Tra QC</span>
                </button>
              )}
            </div>

            {/* Quality Control (QC) Inspection Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-teal-400" />
                  <span>Biên Bản Nghiệm Thu Chất Lượng (QC Checklist)</span>
                </h3>

                <span
                  className={`px-2.5 py-1 rounded font-bold text-xs ${
                    activeJob.qcInspection?.result === 'PASSED' || activeJob.status === 'YARD_STORED'
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                      : activeJob.qcInspection?.result === 'FAILED'
                      ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                      : 'bg-teal-900/60 text-teal-300 border border-teal-700 animate-pulse'
                  }`}
                >
                  {activeJob.qcInspection?.result === 'PASSED' || activeJob.status === 'YARD_STORED'
                    ? 'QC NGHIỆM THU ĐẠT'
                    : activeJob.qcInspection?.result === 'FAILED'
                    ? 'QC KHÔNG ĐẠT'
                    : 'CHỜ QC KIỂM TRA'}
                </span>
              </div>

              <div className="space-y-2">
                {qcChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleQcItem(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      item.passed
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                        : 'bg-rose-950/40 border-rose-800 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                          item.passed ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {item.passed ? '✓' : '✕'}
                      </div>
                      <span className="font-medium">{item.item}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{item.note}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Đánh Giá & Nhận Xét Của QC Inspector</label>
                <textarea
                  rows={2}
                  value={qcComments}
                  onChange={(e) => setQcComments(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              {/* QC Decision Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleQCSubmit('PASSED')}
                  className="py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận QC ĐẠT & Chuyển Lưu Bãi</span>
                </button>

                <button
                  onClick={() => handleQCSubmit('FAILED')}
                  className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Đánh Giá KHÔNG ĐẠT (Yêu Cầu Sửa Lại)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
