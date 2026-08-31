import React, { useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { StatusBadge } from '../../../components/common/StatusBadge/StatusBadge';
import { formatVND } from '../../../utils/format';
import { ImageViewer } from '../../../components/common/ImageViewer/ImageViewer';
import {
  ArrowLeft,
  Container as ContainerIcon,
  Clock,
  User,
  Phone,
  Truck,
  MapPin,
  ClipboardCheck,
  Calculator,
  Wrench,
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

interface ContainerDetailPageProps {
  container: ContainerRecord;
  onBack: () => void;
  onUpdateStatus: (containerId: string, newStatus: string, newCondition?: 'AV' | 'CL' | 'DM') => void;
}

export const ContainerDetailPage: React.FC<ContainerDetailPageProps> = ({
  container,
  onBack,
  onUpdateStatus
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Lại Danh Sách</span>
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={container.condition} size="lg" />
          <StatusBadge status={container.status} size="lg" />
        </div>
      </div>

      {/* Main Container Overview Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl">
            <ContainerIcon className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white font-mono">{container.containerNo}</h2>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                {container.size} ({container.isoCode})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Hãng Tàu: <strong className="text-blue-400">{container.shippingLine}</strong></span>
              <span>•</span>
              <span>Loại Cont: <strong>{container.type}</strong></span>
            </p>
          </div>
        </div>

        {/* Quick Action Demo Workflow Trigger */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thử Nghiệm Chuyển Bước Workflow:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onUpdateStatus(container.id, 'SURVEYING')}
              className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              1. Giám Định
            </button>
            <button
              onClick={() => onUpdateStatus(container.id, 'WAITING_PAYMENT')}
              className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              2. Thanh Toán
            </button>
            <button
              onClick={() => onUpdateStatus(container.id, 'WAITING_FORKLIFT')}
              className="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/30 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              3. Xe Nâng
            </button>
            <button
              onClick={() => onUpdateStatus(container.id, 'REPAIRING')}
              className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              4. Sửa Chữa
            </button>
            <button
              onClick={() => onUpdateStatus(container.id, 'READY_FOR_USE', 'AV')}
              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              5. QC Đạt (AV)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workflow Timeline & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Process */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Vòng Đời Vận Hành Container (14 Bước Workflow Timeline)</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {container.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-slate-900 shadow">
                    {idx + 1}
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{step.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{step.time}</span>
                    </div>
                    <p className="text-xs text-slate-300">{step.note}</p>
                    <span className="text-[10px] text-blue-400 font-semibold block">Thực hiện: {step.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Survey & Damages Details */}
          {container.surveyDetails && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-amber-400" />
                  <span>Chi Tiết Giám Định Hư Hỏng IICL</span>
                </h3>
                <span className="text-xs text-slate-400">Giám định viên: <strong className="text-white">{container.surveyDetails.surveyorName}</strong></span>
              </div>

              {container.surveyDetails.damages.length === 0 ? (
                <p className="text-xs text-slate-400">Vỏ container không có tổn thất (Phân loại AV).</p>
              ) : (
                <div className="space-y-3">
                  {container.surveyDetails.damages.map((dmg, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                            [{dmg.code}] {dmg.location}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{dmg.description}</p>
                      </div>

                      {dmg.image && (
                        <button
                          onClick={() => setSelectedImage(dmg.image)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <ImageIcon className="w-4 h-4 text-amber-400" />
                          <span>Xem Ảnh e-EIR</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Gate-In, Yard Location & Payment Summary */}
        <div className="space-y-6">
          {/* Gate In Information */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Thông Tin Cổng Gate-In</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Biển Số Xe Đầu Kéo:</span>
                <span className="font-mono font-bold text-white">{container.licensePlate || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tài Xế:</span>
                <span className="font-semibold text-slate-200">{container.driverName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số Điện Thoại:</span>
                <span className="font-mono text-blue-400">{container.driverPhone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời Gian Check-in:</span>
                <span className="font-mono text-slate-300">{container.gateInDate}</span>
              </div>
            </div>
          </div>

          {/* Location in Yard */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Vị Trí Sơ Đồ Bãi 2D</span>
            </h3>

            {container.yardLocation ? (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tọa Độ Block - Bay - Row - Tier</span>
                <div className="text-xl font-black font-mono text-teal-400">
                  BLOCK {container.yardLocation.block} / BAY {container.yardLocation.bay} / ROW {container.yardLocation.row} / TIER {container.yardLocation.tier}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Chưa xếp vị trí bãi (Đang ở khu vực cổng).</p>
            )}
          </div>

          {/* Tariff & Payment Summary */}
          {container.tariffDetails && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span>Chi Phí Nâng Hạ & Lưu Bãi</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Phí Nâng Hạ (Lift):</span>
                  <span className="font-semibold text-slate-200">{formatVND(container.tariffDetails.liftFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cước Lưu Bãi:</span>
                  <span className="font-semibold text-slate-200">{formatVND(container.tariffDetails.storageFee)}</span>
                </div>
                {container.tariffDetails.cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phí Rửa Vỏ (Cleaning):</span>
                    <span className="font-semibold text-slate-200">{formatVND(container.tariffDetails.cleaningFee)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
                  <span className="text-white">Tổng Phí:</span>
                  <span className="text-emerald-400 font-mono">{formatVND(container.tariffDetails.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal Viewer */}
      {selectedImage && (
        <ImageViewer
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage}
          title="Xem Ảnh Tổn Thất IICL"
          code={container.containerNo}
        />
      )}
    </div>
  );
};
