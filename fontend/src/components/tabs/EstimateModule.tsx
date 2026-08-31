import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import { DamageItem } from '../../types/depot';
import {
  Calculator,
  Ship,
  CheckCircle2,
  XCircle,
  Clock,
  FileSpreadsheet,
  FileCheck2,
  Send,
  AlertCircle
} from 'lucide-react';

export const EstimateModule: React.FC = () => {
  const {
    jobs,
    createEstimate,
    approveEstimateByShippingLine,
    rejectEstimateByShippingLine
  } = useDepot();

  const estimateJobs = jobs.filter(
    (j) =>
      j.status === 'ESTIMATE_PENDING_APPROVAL' ||
      j.status === 'ESTIMATE_APPROVED' ||
      j.status === 'ESTIMATE_REJECTED' ||
      j.status === 'PAID' ||
      j.estimate
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(
    estimateJobs[0]?.id || jobs[0]?.id || ''
  );

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  // Form State for Estimate
  const [shippingLineApprover, setShippingLineApprover] = useState(
    activeJob?.estimate?.approvedBy || 'Nguyễn Văn Hải (Đại diện Hãng Tàu)'
  );
  const [rejectionReason, setRejectionReason] = useState(
    'Mức chi phí nhân công thay sàn vượt quy định định mức IICL của hãng tàu. Đề nghị giảm 15%.'
  );

  const damagesToEstimate: DamageItem[] =
    activeJob?.estimate?.damages || activeJob?.survey?.damages || [];

  const totalLaborCost = damagesToEstimate.reduce(
    (sum, d) => sum + d.laborHours * d.laborRate,
    0
  );
  const totalMaterialCost = damagesToEstimate.reduce(
    (sum, d) => sum + d.materialCost,
    0
  );
  const subtotal = totalLaborCost + totalMaterialCost;
  const vatAmount = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + vatAmount;

  const handleCreateAndSendEstimate = () => {
    if (!activeJob) return;

    createEstimate(activeJob.id, damagesToEstimate);
  };

  const handleShippingLineApprove = () => {
    if (!activeJob) return;

    approveEstimateByShippingLine(activeJob.id, shippingLineApprover);
  };

  const handleShippingLineReject = () => {
    if (!activeJob) return;

    rejectEstimateByShippingLine(activeJob.id, rejectionReason);
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-slate-900 border border-indigo-700/50 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">4. Báo Giá Sửa Chữa & Phê Duyệt Hãng Tàu (Estimate)</h2>
            <p className="text-xs text-indigo-200/80">
              Tổng hợp chi phí từ Giám định, lập Báo giá gửi Hãng tàu phê duyệt trước khi chuyển Xưởng Sửa chữa
            </p>
          </div>
        </div>

        {/* Container Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-indigo-200 whitespace-nowrap">Chọn Container:</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-indigo-600/50 rounded-xl text-xs text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500 min-w-[220px]"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.containerNo} ({j.shippingLine} - {j.estimate?.approvalStatus || 'Chưa báo giá'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Estimate Summary & Status */}
          <div className="lg:col-span-1 space-y-4">
            {/* Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Hồ Sơ Báo Giá Sửa Chữa</span>
                <span className="font-mono text-slate-400">
                  {activeJob.estimate?.estimateNo || `EST-2026-${activeJob.id.split('-')?.[2] || activeJob.id}`}
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Container:</span>
                  <strong className="text-white font-mono">{activeJob.containerNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hãng tàu phê duyệt:</span>
                  <strong className="text-blue-400">{activeJob.shippingLine}</strong>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Trạng Thái Duyệt:</span>
                  <span
                    className={`px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1 ${
                      activeJob.estimate?.approvalStatus === 'APPROVED'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                        : activeJob.estimate?.approvalStatus === 'REJECTED'
                        ? 'bg-rose-900/60 text-rose-300 border border-rose-700/60'
                        : 'bg-amber-900/60 text-amber-300 border border-amber-700/60 animate-pulse'
                    }`}
                  >
                    {activeJob.estimate?.approvalStatus === 'APPROVED' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>HÃNG TÀU ĐÃ DUYỆT</span>
                      </>
                    ) : activeJob.estimate?.approvalStatus === 'REJECTED' ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>HÃNG TÀU TỪ CHỐI</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        <span>CHỜ HÃNG TÀU DUYỆT</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Tổng Nhân Công:</span>
                    <span className="font-mono text-slate-200">{totalLaborCost.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tổng Vật Tư:</span>
                    <span className="font-mono text-slate-200">{totalMaterialCost.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Thuế VAT (8%):</span>
                    <span className="font-mono text-slate-300">{vatAmount.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 font-extrabold text-sm text-white">
                    <span>TỔNG BÁO GIÁ:</span>
                    <span className="font-mono text-indigo-400 text-lg">{grandTotal.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>
              </div>

              {!activeJob.estimate && (
                <button
                  onClick={handleCreateAndSendEstimate}
                  className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Lập & Gửi Báo Giá Cho Hãng Tàu</span>
                </button>
              )}
            </div>

            {/* Shipping Line Action Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Ship className="w-4 h-4" />
                <span>Cổng Thao Tác Đại Diện Hãng Tàu ({activeJob.shippingLine})</span>
              </h3>

              <p className="text-xs text-slate-300">
                Đại diện Hãng tàu kiểm tra từng hạng mục hư hỏng. Chỉ khi báo giá được phê duyệt thì hệ thống mới cho phép chuyển sang bước Sửa chữa.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Người Đại Diện Hãng Tàu Ký Duyệt
                </label>
                <input
                  type="text"
                  value={shippingLineApprover}
                  onChange={(e) => setShippingLineApprover(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              {activeJob.estimate?.approvalStatus === 'REJECTED' && (
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1">Lý Do Từ Chối Báo Giá</label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-rose-800/60 rounded-lg text-xs text-rose-200 font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleShippingLineApprove}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Phê Duyệt Báo Giá</span>
                </button>

                <button
                  onClick={handleShippingLineReject}
                  className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Từ Chối Báo Giá</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Line-item breakdown table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  <span>Chi Tiết Báo Giá Sửa Chữa ({damagesToEstimate.length} Hạng Mục)</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Container: {activeJob.containerNo}
                </span>
              </div>

              {damagesToEstimate.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
                  Không có hư hỏng nào từ bước Giám định. Container nguyên vẹn.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-semibold">
                        <th className="p-2.5">Bộ Phận / Vị Trí</th>
                        <th className="p-2.5">Mã Hư Hỏng</th>
                        <th className="p-2.5">Phương Pháp Sửa</th>
                        <th className="p-2.5 text-right">Giờ Công</th>
                        <th className="p-2.5 text-right">Tiền Công</th>
                        <th className="p-2.5 text-right">Tiền Vật Tư</th>
                        <th className="p-2.5 text-right">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {damagesToEstimate.map((dmg) => {
                        const laborTotal = dmg.laborHours * dmg.laborRate;
                        return (
                          <tr key={dmg.id} className="hover:bg-slate-800/50 transition">
                            <td className="p-2.5 font-medium text-slate-200">
                              {dmg.component}
                              <span className="text-[10px] text-slate-400 font-mono block">Vị trí: {dmg.locationCode}</span>
                            </td>
                            <td className="p-2.5 font-mono text-amber-300 font-bold">{dmg.damageCode}</td>
                            <td className="p-2.5 text-blue-400 font-medium">{dmg.repairCode} ({dmg.repairNameVi})</td>
                            <td className="p-2.5 text-right font-mono text-slate-300">{dmg.laborHours}h</td>
                            <td className="p-2.5 text-right font-mono text-slate-300">
                              {laborTotal.toLocaleString('vi-VN')}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-300">
                              {dmg.materialCost.toLocaleString('vi-VN')}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-indigo-400">
                              {(laborTotal + dmg.materialCost).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Notice Banner */}
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Quy định chuyển bước:</strong> Chỉ khi báo giá được Hãng tàu phê duyệt (Status: <code>APPROVED</code>) thì hệ thống mới cho phép chuyển container sang <strong>Bộ Phận Sửa Chữa (Repair)</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
