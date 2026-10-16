import React, { useCallback, useEffect, useState } from 'react';
import { containerApi } from '../../../api';
import { describeAuditAction, STAGE_STYLE } from '../utils/jobAuditLabels';
import { ContainerRecord } from '../../../services/mockDataStore';
import { StatusBadge } from '../../../components/common/StatusBadge/StatusBadge';
import { formatVND } from '../../../utils/format';
import { ImageViewer } from '../../../components/common/ImageViewer/ImageViewer';
import { formatDateTime } from '../../../utils/format';
import { useContainerTypeOptions } from '../../masterdata/utils/containerTypeCatalog';
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
}

export const ContainerDetailPage: React.FC<ContainerDetailPageProps> = ({
  container,
  onBack
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Nhật ký vòng đời đọc thẳng từ DB khi mở màn và tự làm mới 30 giây/lần — trước đây dùng bản chụp lúc mở
  // ứng dụng nên các bước vừa làm (vệ sinh, thu tiền, lập phiếu...) không hiện cho tới khi F5.
  const [liveTimeline, setLiveTimeline] = useState<Array<{ action: string; time: string; actor: string; note: string }> | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineLoadedAt, setTimelineLoadedAt] = useState<Date | null>(null);
  const loadTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      const res: any = await containerApi.getById(container.id);
      const logs: any[] = res?.data?.auditLogs || [];
      setLiveTimeline(
        logs
          .map((l) => ({ action: l.action, time: l.timestamp, actor: l.user, note: l.details }))
          .sort((a, b) => String(a.time).localeCompare(String(b.time)))
      );
      setTimelineLoadedAt(new Date());
    } catch {
      // giữ dữ liệu đang có
    } finally {
      setTimelineLoading(false);
    }
  }, [container.id]);
  useEffect(() => {
    void loadTimeline();
    const timer = setInterval(() => void loadTimeline(), 30000);
    return () => clearInterval(timer);
  }, [loadTimeline]);
  const timeline = liveTimeline
    ?? [...(container.timeline || [])]
      .map((t) => ({ action: t.status, time: t.time, actor: t.actor, note: t.note }))
      .sort((a, b) => String(a.time).localeCompare(String(b.time)));
  const containerType = useContainerTypeOptions().find((t) => t.typeCode === container.size);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Lại Danh Sách</span>
        </button>

        <div className="flex items-center gap-2">
          {container.condition ? (
            <StatusBadge status={container.condition} size="lg" />
          ) : (
            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">Chưa giám định</span>
          )}
          <StatusBadge status={container.status} size="lg" />
        </div>
      </div>

      {/* Main Container Overview Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl">
            <ContainerIcon className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 font-mono">{container.containerNo}</h2>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                {container.size}{containerType?.isoCode ? ` (${containerType.isoCode})` : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Hãng Tàu: <strong className="text-blue-600">{container.shippingLine}</strong></span>
              <span>•</span>
              <span>Loại Cont: <strong>{containerType ? containerType.vietnameseName || containerType.name : container.size}</strong></span>
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workflow Timeline & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Process */}
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Nhật Ký Vòng Đời Container ({timeline.length} bước)</span>
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                {timelineLoadedAt && <span>Cập nhật {timelineLoadedAt.toLocaleTimeString('vi-VN')}</span>}
                <button
                  type="button"
                  onClick={() => void loadTimeline()}
                  disabled={timelineLoading}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-pointer disabled:opacity-50"
                >
                  {timelineLoading ? 'Đang tải...' : 'Tải lại'}
                </button>
              </div>
            </div>

            {timeline.length === 0 ? (
              <p className="text-xs text-slate-500">Chưa có bước nào được ghi nhận.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {timeline.map((step, idx) => {
                  const { label, stage } = describeAuditAction(step.action);
                  const style = STAGE_STYLE[stage];
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full ${style.dot} text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow`}>
                        {idx + 1}
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${style.chip}`}>{style.label}</span>
                            <span className="text-xs font-bold text-slate-900">{label}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{formatDateTime(step.time)}</span>
                        </div>
                        {step.note && <p className="text-xs text-slate-700">{step.note}</p>}
                        <span className="text-[11px] text-blue-700 font-semibold block">Người thao tác: {step.actor || '—'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Survey & Damages Details */}
          {container.surveyDetails && (
            <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-amber-600" />
                  <span>Chi Tiết Giám Định Hư Hỏng IICL</span>
                </h3>
                <span className="text-xs text-slate-500">Giám định viên: <strong className="text-slate-900">{container.surveyDetails.surveyorName}</strong></span>
              </div>

              {container.surveyDetails.damages.length === 0 ? (
                <p className="text-xs text-slate-500">Vỏ container không có tổn thất (Phân loại AV).</p>
              ) : (
                <div className="space-y-3">
                  {container.surveyDetails.damages.map((dmg, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            [{dmg.code}] {dmg.location}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{dmg.description}</p>
                      </div>

                      {dmg.image && (
                        <button
                          onClick={() => setSelectedImage(dmg.image)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <ImageIcon className="w-4 h-4 text-amber-600" />
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
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Thông Tin Cổng Gate-In</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Biển Số Xe Đầu Kéo:</span>
                <span className="font-mono font-bold text-slate-900">{container.licensePlate || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tài Xế:</span>
                <span className="font-semibold text-slate-700">{container.driverName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số Điện Thoại:</span>
                <span className="font-mono text-blue-600">{container.driverPhone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời Gian Check-in:</span>
                <span className="font-mono text-slate-700">{formatDateTime(container.gateInDate)}</span>
              </div>
            </div>
          </div>

          {/* Location in Yard */}
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Vị Trí Sơ Đồ Bãi 2D</span>
            </h3>

            {container.yardLocation ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Tọa Độ Block - Bay - Row - Tier</span>
                <div className="text-xl font-black font-mono text-teal-600">
                  BLOCK {container.yardLocation.block} / BAY {container.yardLocation.bay} / ROW {container.yardLocation.row} / TIER {container.yardLocation.tier}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Chưa hạ bãi — container đang ở{' '}
                {container.status === 'SURVEYING' ? 'khu giám định' : container.condition === 'CL' || container.status === 'PENDING_CLEANING' ? 'khu vệ sinh' : 'ngoài bãi'}
                . Vị trí được ghi khi xe nâng hạ bãi.
              </p>
            )}
          </div>

          {/* Tariff & Payment Summary */}
          {container.tariffDetails && (
            <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Chi Phí Nâng Hạ & Lưu Bãi</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí Nâng Hạ (Lift):</span>
                  <span className="font-semibold text-slate-700">{formatVND(container.tariffDetails.liftFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cước Lưu Bãi:</span>
                  <span className="font-semibold text-slate-700">{formatVND(container.tariffDetails.storageFee)}</span>
                </div>
                {container.tariffDetails.cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phí Rửa Vỏ (Cleaning):</span>
                    <span className="font-semibold text-slate-700">{formatVND(container.tariffDetails.cleaningFee)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold">
                  <span className="text-slate-900">Tổng Phí:</span>
                  <span className="text-emerald-600 font-mono">{formatVND(container.tariffDetails.total)}</span>
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
