import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import { JobLifecycleBar } from '../JobLifecycleBar';
import {
  X,
  FileText,
  ClipboardCheck,
  CreditCard,
  Calculator,
  Wrench,
  Truck,
  Printer,
  History,
  CheckCircle2,
  Ship,
  Boxes
} from 'lucide-react';

interface JobDetailModalProps {
  onClose: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ onClose }) => {
  const { selectedJob } = useDepot();

  const [activeTab, setActiveTab] = useState<
    'SUMMARY' | 'SURVEY' | 'FINANCE' | 'ESTIMATE' | 'REPAIR' | 'MOVES' | 'AUDIT'
  >('SUMMARY');

  if (!selectedJob) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-black text-lg text-white tracking-widest">
                  {selectedJob.containerNo}
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 font-mono text-xs border border-blue-700/50">
                  {selectedJob.isoSize}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                  {selectedJob.shippingLine}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hồ Sơ Depot Job ID: <strong className="font-mono text-slate-200">{selectedJob.id}</strong> • Vào bãi: {selectedJob.gateInDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Chứng Từ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lifecycle Stepper Bar */}
        <div className="px-4 pt-3 bg-slate-950/50">
          <JobLifecycleBar job={selectedJob} />
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 border-b border-slate-800 bg-slate-900 overflow-x-auto text-xs font-semibold scrollbar-thin">
          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'SUMMARY'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tổng Quan Hồ Sơ</span>
          </button>

          <button
            onClick={() => setActiveTab('SURVEY')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'SURVEY'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Biên Bản Giám Định ({selectedJob.survey?.damages?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('FINANCE')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'FINANCE'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Phiếu Dịch Vụ & Thu Tiền</span>
          </button>

          <button
            onClick={() => setActiveTab('ESTIMATE')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'ESTIMATE'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Báo Giá Sửa Chữa</span>
          </button>

          <button
            onClick={() => setActiveTab('REPAIR')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'REPAIR'
                ? 'border-orange-500 text-orange-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Thi Công & QC</span>
          </button>

          <button
            onClick={() => setActiveTab('MOVES')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'MOVES'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Lịch Sử Xe Nâng ({selectedJob.moveHistory?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'AUDIT'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Nhật Ký Thao Tác</span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'SUMMARY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-800/80 rounded-xl space-y-2 border border-slate-700">
                <h3 className="font-bold text-sm text-blue-400 border-b border-slate-700 pb-2">
                  Thông Số Kỹ Thuật Container
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số Container:</span>
                  <strong className="font-mono text-white text-sm">{selectedJob.containerNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Loại / Kích thước ISO:</span>
                  <strong className="font-mono text-blue-300">{selectedJob.isoSize}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hãng Tàu Sở Hữu:</span>
                  <strong className="text-slate-200">{selectedJob.shippingLine}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trọng Lượng Vỏ (Tare Wt):</span>
                  <strong className="font-mono text-slate-300">{selectedJob.tareWeightKg} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tải Trọng Tối Đa (Payload):</span>
                  <strong className="font-mono text-slate-300">{selectedJob.maxPayloadKg} kg</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl space-y-2 border border-slate-700">
                <h3 className="font-bold text-sm text-emerald-400 border-b border-slate-700 pb-2">
                  Vị Trí Hiện Tại & Vòng Đời
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-400">Block Bãi:</span>
                  <strong className="font-mono text-white">Block {selectedJob.currentLocation.block.replace('BLOCK_', '')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tọa Độ Bay - Row - Tier:</span>
                  <strong className="font-mono text-emerald-400">
                    Bay {selectedJob.currentLocation.bay} • Row {selectedJob.currentLocation.row} • Tier {selectedJob.currentLocation.tier}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời Gian Gate In:</span>
                  <strong className="font-mono text-slate-300">{selectedJob.gateInDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trạng Thái Hiện Tại:</span>
                  <strong className="text-amber-400 font-bold">{selectedJob.status}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SURVEY */}
          {activeTab === 'SURVEY' && (
            <div className="space-y-3 text-xs">
              {selectedJob.survey ? (
                <>
                  <div className="flex justify-between bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span>Giám định viên: <strong>{selectedJob.survey.surveyorName}</strong></span>
                    <span>Phân loại chất lượng: <strong className="text-amber-400">Grade {selectedJob.survey.conditionRating}</strong></span>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-slate-300">
                        <th className="p-2">Bộ Phận</th>
                        <th className="p-2">Mã Hư Hỏng</th>
                        <th className="p-2">Vị Trí</th>
                        <th className="p-2">Sửa Chữa</th>
                        <th className="p-2 text-right">Ước Tính</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedJob.survey.damages.map((d) => (
                        <tr key={d.id}>
                          <td className="p-2 font-medium">{d.component}</td>
                          <td className="p-2 font-mono text-amber-300">{d.damageCode}</td>
                          <td className="p-2 font-mono">{d.locationCode}</td>
                          <td className="p-2 text-blue-400">{d.repairCode}</td>
                          <td className="p-2 text-right font-mono text-emerald-400">{d.totalCost.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="text-slate-400 text-center py-6">Container chưa thực hiện giám định.</div>
              )}
            </div>
          )}

          {/* TAB 3: FINANCE */}
          {activeTab === 'FINANCE' && (
            <div className="space-y-3 text-xs">
              {selectedJob.operation ? (
                <div className="p-4 bg-slate-800 rounded-xl space-y-2 border border-slate-700">
                  <div className="font-bold text-sm text-blue-400 border-b border-slate-700 pb-2">
                    Phiếu Dịch Vụ {selectedJob.operation.serviceTicketNo}
                  </div>
                  <div>Khách hàng: <strong>{selectedJob.operation.customer.customerName}</strong></div>
                  <div>Tổng dịch vụ: <strong className="text-emerald-400 font-mono">{selectedJob.operation.totalAmount.toLocaleString('vi-VN')} VNĐ</strong></div>
                  <div>Trạng thái thu: <strong className="text-emerald-400 font-bold">{selectedJob.payment?.status}</strong></div>
                </div>
              ) : (
                <div className="text-slate-400 text-center py-6">Chưa phát hành phiếu dịch vụ.</div>
              )}
            </div>
          )}

          {/* TAB 4: ESTIMATE */}
          {activeTab === 'ESTIMATE' && (
            <div className="space-y-3 text-xs">
              {selectedJob.estimate ? (
                <div className="p-4 bg-slate-800 rounded-xl space-y-2 border border-slate-700">
                  <div className="font-bold text-sm text-indigo-400 border-b border-slate-700 pb-2">
                    Báo Giá Sửa Chữa {selectedJob.estimate.estimateNo}
                  </div>
                  <div>Hãng tàu: <strong>{selectedJob.shippingLine}</strong></div>
                  <div>Tổng báo giá: <strong className="text-indigo-400 font-mono">{selectedJob.estimate.grandTotal.toLocaleString('vi-VN')} VNĐ</strong></div>
                  <div>Trạng thái duyệt: <strong className="text-emerald-400">{selectedJob.estimate.approvalStatus}</strong></div>
                </div>
              ) : (
                <div className="text-slate-400 text-center py-6">Chưa lập báo giá sửa chữa.</div>
              )}
            </div>
          )}

          {/* TAB 5: REPAIR */}
          {activeTab === 'REPAIR' && (
            <div className="space-y-3 text-xs">
              {selectedJob.repairOrder ? (
                <div className="p-4 bg-slate-800 rounded-xl space-y-2 border border-slate-700">
                  <div className="font-bold text-sm text-orange-400 border-b border-slate-700 pb-2">
                    Lệnh Thi Công {selectedJob.repairOrder.workOrderNo}
                  </div>
                  <div>Đội thi công: <strong>{selectedJob.repairOrder.repairTeam}</strong></div>
                  <div>Kết quả QC: <strong className="text-teal-400">{selectedJob.qcInspection?.result || 'CHỜ QC'}</strong></div>
                </div>
              ) : (
                <div className="text-slate-400 text-center py-6">Chưa xuất lệnh sửa chữa.</div>
              )}
            </div>
          )}

          {/* TAB 6: MOVES */}
          {activeTab === 'MOVES' && (
            <div className="space-y-2 text-xs">
              {(selectedJob.moveHistory || []).length > 0 ? (
                (selectedJob.moveHistory || []).map((m) => (
                  <div key={m.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700 flex justify-between">
                    <div>Tài xế: {m.driverName} ({m.forkliftId})</div>
                    <div className="font-mono text-emerald-400">Đến Block {m.toLocation?.block ? m.toLocation.block.replace('BLOCK_', '') : ''} Bay {m.toLocation?.bay || 1}</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-6">Chưa có lịch sử di chuyển xe nâng.</div>
              )}
            </div>
          )}

          {/* TAB 7: AUDIT */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-2 text-xs font-mono">
              {(selectedJob.auditLogs || []).length > 0 ? (
                (selectedJob.auditLogs || []).map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-800 rounded border border-slate-700">
                    <span className="text-slate-400">[{log.timestamp}]</span> <strong className="text-blue-400">{(log as any).userName || (log as any).user || 'Hệ thống'}:</strong> {log.details}
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-6">Chưa có nhật ký thao tác.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
