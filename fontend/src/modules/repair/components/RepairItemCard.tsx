import React, { useState } from 'react';
import {
  Play,
  Camera,
  CheckCircle2,
  Clock,
  Wrench,
  Image as ImageIcon,
  Layers,
  FileCheck,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Lock
} from 'lucide-react';
import { WorkOrderRepairItem, RepairPhoto } from '../types/repair';
import { RepairPhotoKind } from '../../../api/repair.api';

interface RepairItemCardProps {
  item: WorkOrderRepairItem;
  workOrderNo: string;
  containerNo: string;
  onStartRepairItem: (itemId: string) => void;
  onOpenCapturePhotos: (item: WorkOrderRepairItem, kind: RepairPhotoKind) => void;
  onOpenCompleteModal: (item: WorkOrderRepairItem) => void;
  onOpenCompareModal: (item: WorkOrderRepairItem) => void;
}

export const RepairItemCard: React.FC<RepairItemCardProps> = ({
  item,
  workOrderNo,
  containerNo,
  onStartRepairItem,
  onOpenCapturePhotos,
  onOpenCompleteModal,
  onOpenCompareModal
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const beforePhotos = item.photos.filter((p) => p.type === 'BEFORE');
  const afterPhotos = item.photos.filter((p) => p.type === 'AFTER');
  // Ảnh hư hỏng lúc giám định chỉ để đối chiếu — không tính là ảnh trước sửa.
  const surveyPhotos = item.photos.filter((p) => p.type === 'ADDITIONAL');
  // Ảnh trước sửa chỉ chụp được khi lệnh sửa đã bắt đầu (backend cần RepairOrder để gắn ảnh).
  const canCaptureBefore = item.status !== 'PENDING';
  const hasBefore = beforePhotos.length > 0;

  const statusConfig = {
    PENDING: {
      label: 'Chưa sửa (Waiting)',
      bgColor: 'bg-slate-100 text-slate-700 border-slate-200',
      indicator: 'bg-slate-500'
    },
    IN_PROGRESS: {
      label: 'Đang sửa (In Progress)',
      bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
      indicator: 'bg-amber-400 animate-pulse'
    },
    COMPLETED: {
      label: 'Đã hoàn thành (Completed)',
      bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      indicator: 'bg-emerald-400'
    }
  };

  const currentStatus = statusConfig[item.status] || statusConfig.PENDING;

  return (
    <div className={`bg-white border rounded-3xl overflow-hidden transition-all duration-200 ${
      item.status === 'COMPLETED'
        ? 'border-emerald-200 shadow-md '
        : item.status === 'IN_PROGRESS'
        ? 'border-amber-200 shadow-md '
        : 'border-slate-200'
    }`}>
      {/* Top Bar of Item Card */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-black text-sm border ${
            item.status === 'COMPLETED'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : item.status === 'IN_PROGRESS'
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {item.itemNo < 10 ? `0${item.itemNo}` : item.itemNo}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">
                {item.repairNameVi}
              </h4>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                Mã: {item.repairCode}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-mono">
              <span>Vị trí: <strong className="text-slate-700">{item.locationVi} ({item.locationCode})</strong></span>
              <span>&bull;</span>
              <span>Hư hỏng: <strong className="text-amber-600">{item.damageCode} - {item.damageNameVi}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${currentStatus.bgColor}`}>
            <span className={`w-2 h-2 rounded-full ${currentStatus.indicator}`} />
            <span>{currentStatus.label}</span>
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Technical Specs and Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block">Nội Dung Thi Công:</span>
              <span className="font-medium text-slate-700">{item.description}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block">Quy Cách Khối Lượng:</span>
              <span className="font-bold text-amber-700 font-mono">{item.quantity} {item.unit} &bull; Chuẩn IICL</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block">Tiến Độ & Thợ Phụ Trách:</span>
              <span className="font-bold text-slate-700">
                {item.technician || 'Tổ thợ cơ khí EMR'}
                {item.actualHours ? ` (${item.actualHours}h)` : ''}
              </span>
            </div>
          </div>

          {/* Photo Section: Before & After Photo Preview Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Bằng Chứng Hình Ảnh Đối Chứng (Before &bull; After)</span>
              </span>

              {afterPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenCompareModal(item)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>So sánh Trước / Sau</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Box 1: BEFORE PHOTO */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>ẢNH TRƯỚC SỬA (BEFORE) ({beforePhotos.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {hasBefore ? 'Đã chụp hiện trạng' : 'Bắt buộc chụp'}
                  </span>
                </div>

                {beforePhotos.length > 0 ? (
                  <div
                    onClick={() => setSelectedPhotoPreview(beforePhotos[0].url)}
                    className="relative rounded-xl overflow-hidden aspect-video bg-black cursor-pointer group border border-slate-200"
                  >
                    <img
                      src={beforePhotos[0].url}
                      alt="Ảnh trước sửa"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-slate-900 text-xs font-bold gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Xem ảnh lớn</span>
                    </div>
                  </div>
                ) : canCaptureBefore ? (
                  <div
                    onClick={() => onOpenCapturePhotos(item, 'BEFORE')}
                    className="h-28 rounded-xl bg-amber-50 border-2 border-dashed border-amber-200 hover:border-amber-500 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition group"
                  >
                    <Camera className="w-6 h-6 text-amber-600 group-hover:scale-110 transition mb-1" />
                    <span className="text-xs font-bold text-amber-700">+ Bấm chụp ảnh trước sửa</span>
                    <span className="text-[10px] text-slate-500">Chụp hiện trạng hư hỏng trước khi thi công</span>
                  </div>
                ) : (
                  <div className="h-28 rounded-xl bg-white border border-dashed border-slate-200 flex items-center justify-center p-3 text-center text-slate-500 text-xs">
                    Bấm "Bắt đầu sửa hạng mục này" rồi chụp ảnh trước sửa
                  </div>
                )}
                {surveyPhotos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedPhotoPreview(surveyPhotos[0].url)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Xem ảnh giám định để đối chiếu ({surveyPhotos.length})
                  </button>
                )}
              </div>

              {/* Box 2: AFTER PHOTO */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>ẢNH SAU SỬA (AFTER) ({afterPhotos.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {afterPhotos.length > 0 ? 'Đã nghiệm thu ảnh' : 'Bắt buộc chụp'}
                  </span>
                </div>

                {afterPhotos.length > 0 ? (
                  <div
                    onClick={() => setSelectedPhotoPreview(afterPhotos[0].url)}
                    className="relative rounded-xl overflow-hidden aspect-video bg-black cursor-pointer group border border-emerald-200/60"
                  >
                    <img
                      src={afterPhotos[0].url}
                      alt="Ảnh sau sửa"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-slate-900 text-xs font-bold gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Xem ảnh lớn ({afterPhotos.length} ảnh)</span>
                    </div>
                  </div>
                ) : !hasBefore ? (
                  <div className="h-28 rounded-xl bg-white border border-dashed border-slate-200 flex flex-col items-center justify-center p-3 text-center text-slate-500 text-xs">
                    <Lock className="w-5 h-5 text-slate-400 mb-1" />
                    <span>Chụp ảnh trước sửa trước, rồi mới chụp ảnh sau sửa</span>
                  </div>
                ) : (
                  <div
                    onClick={() => onOpenCapturePhotos(item, 'AFTER')}
                    className="h-28 rounded-xl bg-emerald-50 hover:bg-emerald-50 border-2 border-dashed border-emerald-200 hover:border-emerald-500 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition group"
                  >
                    <Camera className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition mb-1" />
                    <span className="text-xs font-bold text-emerald-700">+ Bấm chụp ảnh sau sửa</span>
                    <span className="text-[10px] text-slate-500">Dùng camera hoặc chọn file</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* If completed, show material usage & technical notes summary */}
          {item.status === 'COMPLETED' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kết Quả Thi Công Đã Ghi Nhận:</span>
                </span>
                <span className="text-slate-500 font-mono">
                  Hoàn thành lúc: {item.completedAt || '2026-08-15 11:30'}
                </span>
              </div>

              <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                {item.executionNotes || 'Đã hàn kín, mài phẳng mối nối, sơn chống rỉ chuẩn kỹ thuật IICL.'}
              </p>

              {item.materialsUsed.length > 0 && (
                <div className="pt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span>Vật tư xuất dùng:</span>
                  </span>
                  {item.materialsUsed.map((mat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white border border-slate-200 text-amber-700 rounded font-mono text-[11px]"
                    >
                      {mat.materialName} ({mat.quantity} {mat.unit})
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons for Worker (Touch-Friendly) */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {/* Compare Photos button */}
              {afterPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenCompareModal(item)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Đối Chiếu Ảnh</span>
                </button>
              )}

              {/* Capture / Add More Before Photos */}
              {canCaptureBefore && (
                <button
                  type="button"
                  onClick={() => onOpenCapturePhotos(item, 'BEFORE')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                    hasBefore
                      ? 'bg-slate-100 hover:bg-slate-200 text-amber-700 border-amber-200'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 shadow'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>{hasBefore ? `Thêm Ảnh Trước Sửa (${beforePhotos.length})` : 'Chụp Ảnh Trước Sửa'}</span>
                </button>
              )}

              {/* Capture / Add More After Photos — khoá khi chưa có ảnh trước sửa */}
              <button
                type="button"
                onClick={() => onOpenCapturePhotos(item, 'AFTER')}
                disabled={!hasBefore}
                title={hasBefore ? undefined : 'Chụp ảnh trước sửa trước'}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  afterPhotos.length > 0
                    ? 'bg-slate-100 hover:bg-slate-200 text-emerald-700 border-emerald-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 shadow'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>{afterPhotos.length > 0 ? `Thêm Ảnh Sau Sửa (${afterPhotos.length})` : 'Chụp Ảnh Sau Sửa'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {item.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => onStartRepairItem(item.id)}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl shadow-md  flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>BẮT ĐẦU SỬA HẠNG MỤC NÀY</span>
                </button>
              )}

              {item.status === 'IN_PROGRESS' && (
                <button
                  type="button"
                  onClick={() => onOpenCompleteModal(item)}
                  disabled={!hasBefore}
                  title={hasBefore ? undefined : 'Chụp ảnh trước sửa trước'}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl shadow-md  flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GHI NHẬN KẾT QUẢ & HOÀN THÀNH</span>
                </button>
              )}

              {item.status === 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => onOpenCompleteModal(item)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cập Nhật Kết Quả</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={selectedPhotoPreview} alt="Zoom preview" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
