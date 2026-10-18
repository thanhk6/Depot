import React, { useState } from 'react';
import {
  ArrowLeft,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  FileText,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Camera,
  Flame
} from 'lucide-react';
import { WorkOrderRecord, WorkOrderRepairItem, RepairPhoto, MaterialUsage, AdditionalDamageReport } from '../types/repair';
import { RepairItemCard } from './RepairItemCard';
import { RepairPhotoKind } from '../../../api/repair.api';
import { CaptureAfterPhotoModal } from './CaptureAfterPhotoModal';
import { CompleteItemModal } from './CompleteItemModal';
import { ReportAdditionalModal } from './ReportAdditionalModal';
import { PhotoCompareModal } from './PhotoCompareModal';

interface WorkOrderDetailViewProps {
  workOrder: WorkOrderRecord;
  onBack: () => void;
  onUpdateWorkOrder: (updated: WorkOrderRecord) => void;
  /** Gọi backend hoàn tất lệnh sửa; trả về null nếu thành công, hoặc thông điệp lỗi (vd thiếu ảnh) để hiện lên màn. */
  onCompleteWorkOrder: (workOrderId: string, containerId: string) => Promise<string | null>;
  onStartWorkOrder?: (workOrder: WorkOrderRecord) => void;
  onNavigateTab: (tabId: string) => void;
}

export const WorkOrderDetailView: React.FC<WorkOrderDetailViewProps> = ({
  workOrder,
  onBack,
  onUpdateWorkOrder,
  onCompleteWorkOrder,
  onStartWorkOrder,
  onNavigateTab
}) => {
  // Modal states
  const [activePhotoModalItem, setActivePhotoModalItem] = useState<WorkOrderRepairItem | null>(null);
  const [activePhotoKind, setActivePhotoKind] = useState<RepairPhotoKind>('AFTER');
  const openCapture = (target: WorkOrderRepairItem, kind: RepairPhotoKind) => {
    setActivePhotoKind(kind);
    setActivePhotoModalItem(target);
  };
  const [finishError, setFinishError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeCompleteModalItem, setActiveCompleteModalItem] = useState<WorkOrderRepairItem | null>(null);
  const [activeCompareModalItem, setActiveCompareModalItem] = useState<WorkOrderRepairItem | null>(null);
  const [isReportAdditionalOpen, setIsReportAdditionalOpen] = useState(false);
  const [isConfirmFinishWOModalOpen, setIsConfirmFinishWOModalOpen] = useState(false);

  // Status calculation
  const totalItems = workOrder.items.length;
  const completedItems = workOrder.items.filter((i) => i.status === 'COMPLETED').length;
  const inProgressItems = workOrder.items.filter((i) => i.status === 'IN_PROGRESS').length;
  const allItemsCompleted = totalItems > 0 && completedItems === totalItems;
  // Mỗi hạng mục phải có cả ảnh trước sửa và ảnh sau sửa (backend cũng chặn ở bước hoàn tất).
  const allPhotosPresent = workOrder.items.every(
    (i) => i.photos.some((p) => p.type === 'BEFORE') && i.photos.some((p) => p.type === 'AFTER')
  );

  const canFinishWorkOrder = allItemsCompleted && allPhotosPresent;

  // Handle start individual item
  const handleStartRepairItem = (itemId: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedItems = workOrder.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'IN_PROGRESS' as const,
          startedAt: now,
          technician: item.technician || workOrder.leadTechnician
        };
      }
      return item;
    });

    const updatedWO: WorkOrderRecord = {
      ...workOrder,
      status: 'IN_PROGRESS',
      startedAt: workOrder.startedAt || now,
      items: updatedItems
    };

    onUpdateWorkOrder(updatedWO);
    onStartWorkOrder?.(updatedWO);
  };

  // Handle save captured photos
  const handleSavePhotos = (photos: RepairPhoto[]) => {
    if (!activePhotoModalItem) return;

    const updatedItems = workOrder.items.map((item) => {
      if (item.id === activePhotoModalItem.id) {
        // Giữ ảnh loại khác, thay toàn bộ ảnh của loại vừa chụp (trước sửa hoặc sau sửa)
        const otherPhotos = item.photos.filter((p) => p.type !== activePhotoKind);
        return {
          ...item,
          photos: [...otherPhotos, ...photos]
        };
      }
      return item;
    });

    const updatedWO: WorkOrderRecord = {
      ...workOrder,
      items: updatedItems
    };

    onUpdateWorkOrder(updatedWO);
  };

  // Handle item completion
  const handleConfirmCompleteItem = (data: {
    executionNotes: string;
    actualHours: number;
    materialsUsed: MaterialUsage[];
    technician: string;
  }) => {
    if (!activeCompleteModalItem) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedItems = workOrder.items.map((item) => {
      if (item.id === activeCompleteModalItem.id) {
        return {
          ...item,
          status: 'COMPLETED' as const,
          completedAt: now,
          executionNotes: data.executionNotes,
          actualHours: data.actualHours,
          materialsUsed: data.materialsUsed,
          technician: data.technician
        };
      }
      return item;
    });

    // Calculate total actual hours
    const totalActual = updatedItems.reduce((acc, curr) => acc + (curr.actualHours || 0), 0);

    const updatedWO: WorkOrderRecord = {
      ...workOrder,
      items: updatedItems,
      totalActualHours: totalActual
    };

    onUpdateWorkOrder(updatedWO);
  };

  // Handle incident report
  const handleReportAdditional = (report: AdditionalDamageReport) => {
    const updatedWO: WorkOrderRecord = {
      ...workOrder,
      additionalReports: [...workOrder.additionalReports, report]
    };
    onUpdateWorkOrder(updatedWO);
  };

  // Handle final finish work order -> triggers QC_PENDING
  const [isFinishedSuccessOpen, setIsFinishedSuccessOpen] = useState(false);

  // Chỉ chuyển QC khi backend chấp nhận — trước đây đổi trạng thái + báo thành công ngay, lỗi backend bị nuốt.
  const handleExecuteFinishWorkOrder = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setFinishError(null);
    const error = await onCompleteWorkOrder(workOrder.id, workOrder.containerId);
    setIsFinishing(false);
    if (error) {
      setFinishError(error);
      return;
    }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    onUpdateWorkOrder({ ...workOrder, status: 'QC_PENDING', completedAt: now });
    setIsConfirmFinishWOModalOpen(false);
    setIsFinishedSuccessOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-16">
      {/* Top Breadcrumb / Back Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 transition flex items-center gap-2 cursor-pointer shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Lại Danh Sách Lệnh Sửa Chữa (Work Orders)</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick incident report trigger */}
          <button
            onClick={() => setIsReportAdditionalOpen(true)}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>BÁO PHÁT SINH HƯ HỎNG MỚI</span>
          </button>
        </div>
      </div>

      {/* Main Work Order Header Info */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6">
        {/* Title row */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">LỆNH SỬA CHỮA CONTAINER:</span>
                <span className="text-lg font-mono font-black text-slate-900">{workOrder.workOrderNo}</span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold rounded-lg">
                  {workOrder.shippingLine}
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono border ${
                  workOrder.priority === 'URGENT'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : workOrder.priority === 'HIGH'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  Ưu tiên: {workOrder.priority}
                </span>
              </div>

              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                <span>Cont No: <strong className="text-emerald-600 font-mono text-sm">{workOrder.containerNo}</strong></span>
                <span>&bull;</span>
                <span>Loại vỏ: <strong className="text-slate-700">{workOrder.size} {workOrder.type} ({workOrder.isoCode})</strong></span>
                <span>&bull;</span>
                <span>Báo giá: <strong className="text-blue-600 font-mono">{workOrder.estimateNo} (Approved)</strong></span>
              </div>
            </div>
          </div>

          {/* Current WO Status Badge */}
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Trạng thái Work Order:</span>
            <span className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold border inline-flex items-center gap-1.5 ${
              workOrder.status === 'QC_PASSED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : workOrder.status === 'QC_PENDING'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : workOrder.status === 'IN_PROGRESS'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                workOrder.status === 'QC_PASSED'
                  ? 'bg-emerald-400'
                  : workOrder.status === 'QC_PENDING'
                  ? 'bg-purple-400 animate-pulse'
                  : workOrder.status === 'IN_PROGRESS'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-500'
              }`} />
              <span>
                {workOrder.status === 'QC_PASSED'
                  ? 'QC ĐÃ ĐẠT (Passed)'
                  : workOrder.status === 'QC_PENDING'
                  ? 'CHỜ NGHIỆM THU QC (QC Pending)'
                  : workOrder.status === 'IN_PROGRESS'
                  ? 'ĐANG THI CÔNG SỬA CHỮA'
                  : 'CHỜ THI CÔNG (Waiting)'}
              </span>
            </span>
          </div>
        </div>

        {/* 4 Info Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Vị Trí Lưu Bãi EMR</span>
            </span>
            <span className="font-bold text-slate-900 font-mono">
              Block {workOrder.yardLocation.block} - Bay {workOrder.yardLocation.bay} - Row {workOrder.yardLocation.row} - Tier {workOrder.yardLocation.tier}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 block flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tổ Thợ & Kỹ Thuật Viên</span>
            </span>
            <span className="font-bold text-emerald-700">
              {workOrder.leadTechnician}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Hạn Hoàn Thành (SLA)</span>
            </span>
            <span className="font-bold text-amber-700 font-mono">
              {workOrder.deadline}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Tiến Độ Hạng Mục</span>
            </span>
            <span className="font-bold text-slate-900 font-mono">
              {completedItems} / {totalItems} Hạng mục hoàn tất ({Math.round((completedItems / totalItems) * 100)}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Tiến độ thi công Work Order:</span>
            <span className="text-emerald-600 font-bold">{completedItems} / {totalItems} hoàn thành</span>
          </div>
          <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(completedItems / totalItems) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Incident / Additional Damage Notices if any */}
      {workOrder.additionalReports.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Biên Bản Báo Phát Sinh Đã Gửi ({workOrder.additionalReports.length})</span>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-200 rounded text-[10px] font-mono">
              Chờ phòng Báo Giá xử lý
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workOrder.additionalReports.map((rpt) => (
              <div key={rpt.id} className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-900">{rpt.location}</span>
                  <span className="text-rose-600 font-bold">[{rpt.severity}]</span>
                </div>
                <p className="text-slate-700">{rpt.damageDescription}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Báo bởi: {rpt.reportedBy}</span>
                  <span>{rpt.reportedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: List of Repair Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              DANH SÁCH HẠNG MỤC CẦN SỬA CHỮA ({totalItems} Hạng Mục)
            </h3>
          </div>

          <span className="text-xs text-slate-500">
            Nội dung sửa chữa theo biểu giá CEDEX & tiêu chuẩn IICL-6 đã được Hãng tàu phê duyệt
          </span>
        </div>

        <div className="space-y-4">
          {workOrder.items.map((item) => (
            <RepairItemCard
              key={item.id}
              item={item}
              workOrderNo={workOrder.workOrderNo}
              containerNo={workOrder.containerNo}
              onStartRepairItem={handleStartRepairItem}
              onOpenCapturePhotos={(targetItem, kind) => openCapture(targetItem, kind)}
              onOpenCompleteModal={(targetItem) => setActiveCompleteModalItem(targetItem)}
              onOpenCompareModal={(targetItem) => setActiveCompareModalItem(targetItem)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Sticky Action Bar: Finish Work Order */}
      <div className="p-5 bg-white backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <span>ĐIỀU KIỆN HOÀN TẤT WORK ORDER:</span>
            {allItemsCompleted && allPhotosPresent ? (
              <span className="text-emerald-600 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                Đủ điều kiện chuyển QC
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1 font-mono">
                <AlertTriangle className="w-4 h-4" />
                Còn {totalItems - completedItems} hạng mục chưa hoàn thành hoặc thiếu ảnh trước / sau sửa
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Khi bấm hoàn tất, lệnh sẽ chuyển sang trạng thái <strong>QC Pending (Chờ kiểm tra)</strong> để nhân viên QC nghiệm thu tại bước 9.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {workOrder.status === 'QC_PENDING' ? (
            <button
              onClick={() => onNavigateTab('qc')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl shadow-lg  transition flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>CHUYỂN SANG PHÂN HỆ QC NGHIỆM THU &rarr;</span>
            </button>
          ) : (
            <button
              onClick={() => setIsConfirmFinishWOModalOpen(true)}
              disabled={!canFinishWorkOrder}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs rounded-2xl shadow-xl  transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>HOÀN THÀNH WORK ORDER &bull; CHUYỂN QC</span>
            </button>
          )}
        </div>
      </div>

      {/* Capture After Photo Modal */}
      {activePhotoModalItem && (
        <CaptureAfterPhotoModal
          item={activePhotoModalItem}
          jobId={workOrder.containerId}
          containerNo={workOrder.containerNo}
          workOrderNo={workOrder.workOrderNo}
          technicianName={workOrder.leadTechnician}
          kind={activePhotoKind}
          onSavePhotos={handleSavePhotos}
          onClose={() => setActivePhotoModalItem(null)}
        />
      )}

      {/* Complete Item Modal */}
      {activeCompleteModalItem && (
        <CompleteItemModal
          item={activeCompleteModalItem}
          containerNo={workOrder.containerNo}
          workOrderNo={workOrder.workOrderNo}
          leadTechnician={workOrder.leadTechnician}
          onOpenCapturePhotos={() => openCapture(activeCompleteModalItem, 'AFTER')}
          onConfirmComplete={handleConfirmCompleteItem}
          onClose={() => setActiveCompleteModalItem(null)}
        />
      )}

      {/* Report Additional Incident Modal */}
      {isReportAdditionalOpen && (
        <ReportAdditionalModal
          containerNo={workOrder.containerNo}
          workOrderNo={workOrder.workOrderNo}
          technicianName={workOrder.leadTechnician}
          onSubmitReport={handleReportAdditional}
          onClose={() => setIsReportAdditionalOpen(false)}
        />
      )}

      {/* Photo Comparison Modal */}
      {activeCompareModalItem && (
        <PhotoCompareModal
          item={activeCompareModalItem}
          containerNo={workOrder.containerNo}
          workOrderNo={workOrder.workOrderNo}
          onClose={() => setActiveCompareModalItem(null)}
        />
      )}

      {/* Confirmation Modal for Completing Work Order */}
      {isConfirmFinishWOModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Hoàn Tất Lệnh Sửa Chữa</h3>
                <p className="text-xs text-slate-500 font-mono">Work Order: {workOrder.workOrderNo}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Kiểm tra 6 bước hoàn tất theo chuẩn ISO/EMR:
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-500">
                <li className="text-emerald-600 font-semibold">Tất cả {totalItems} hạng mục sửa chữa đã Completed.</li>
                <li className="text-emerald-600 font-semibold">Mỗi hạng mục đã có ảnh trước sửa (BEFORE) và ảnh sau sửa (AFTER).</li>
                <li>Ghi nhận thời gian hoàn thành: <strong>{new Date().toLocaleString('vi-VN')}</strong></li>
                <li>Thợ nghiệm thu: <strong>{workOrder.leadTechnician}</strong></li>
                <li>Chuyển trạng thái Work Order = <strong>QC_PENDING</strong>.</li>
                <li>Chuyển Container = <strong>WAITING_QC (Chờ QC nghiệm thu)</strong>.</li>
              </ul>
              <p className="pt-2 text-[11px] text-amber-700 border-t border-slate-200">
                Lưu ý: Hệ thống không tự động cấp đạt (QC Passed). Nhân viên QC sẽ tiến hành kiểm tra lọt sáng, kín nước và cơ khí tại Bước 9.
              </p>
            </div>

            {finishError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-700">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{finishError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setIsConfirmFinishWOModalOpen(false); setFinishError(null); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Kiểm Tra Lại
              </button>
              <button
                onClick={() => void handleExecuteFinishWorkOrder()}
                disabled={isFinishing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg  transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>XÁC NHẬN CHUYỂN SANG BƯỚC QC</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog: Direct Jump to QC Acceptance Module */}
      {isFinishedSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-emerald-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
                ĐÃ HOÀN TẤT THI CÔNG SỬA CHỮA!
              </h3>
              <p className="text-xs text-slate-700 font-mono">
                Container <strong className="text-emerald-600">{workOrder.containerNo}</strong> &bull; Lệnh <strong className="text-amber-600">{workOrder.workOrderNo}</strong>
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto pt-1">
                Hồ sơ và toàn bộ ảnh chụp sau sửa chữa đã được chuyển thành công sang <strong>Phân hệ 9 (Kỹ Thuật QC Nghiệm Thu)</strong> ở trạng thái <span className="text-purple-700 font-bold font-mono">WAITING_QC</span>.
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-left text-xs space-y-1 text-purple-200">
              <div className="font-bold flex items-center gap-1.5 text-purple-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Bước Tiếp Theo (Next Step):</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Nhân viên QC sẽ thực hiện thử kín sáng (Light Test), kiểm tra kín nước và kết cấu cơ khí để cấp chứng nhận đạt chuẩn AV cấp trả chủ hàng.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsFinishedSuccessOpen(false);
                  onBack();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 transition cursor-pointer"
              >
                Danh Sách Work Orders
              </button>

              <button
                onClick={() => {
                  setIsFinishedSuccessOpen(false);
                  onNavigateTab('qc');
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-2xl shadow-xl  transition flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>CHUYỂN SANG BƯỚC 9: QC NGHIỆM THU NGAY &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
