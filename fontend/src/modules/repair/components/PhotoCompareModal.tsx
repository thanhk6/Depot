import React, { useState } from 'react';
import { X, ArrowRight, Eye, ShieldCheck, Camera, Layers, CheckCircle2 } from 'lucide-react';
import { WorkOrderRepairItem, RepairPhoto } from '../types/repair';

interface PhotoCompareModalProps {
  item: WorkOrderRepairItem;
  containerNo: string;
  workOrderNo: string;
  onClose: () => void;
}

export const PhotoCompareModal: React.FC<PhotoCompareModalProps> = ({
  item,
  containerNo,
  workOrderNo,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'BEFORE_ONLY' | 'AFTER_ONLY'>('SIDE_BY_SIDE');

  const beforePhotos = item.photos.filter((p) => p.type === 'BEFORE');
  const afterPhotos = item.photos.filter((p) => p.type === 'AFTER');

  // Không có ảnh thật thì để trống (trước đây hiện ảnh mẫu Unsplash như thể là ảnh container).
  const primaryBefore = beforePhotos[0]?.url || '';
  const primaryAfter = afterPhotos[0]?.url || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Đối Chiếu Hình Ảnh: TRƯỚC SỬA (BEFORE) vs SAU SỬA (AFTER)
                </h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                  Hạng mục #{item.itemNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Container: <strong className="text-slate-900">{containerNo}</strong> &bull; WO: <strong className="text-amber-600">{workOrderNo}</strong> &bull; Vị trí: <strong className="text-slate-700">{item.locationVi}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="p-1 bg-white border border-slate-200 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('SIDE_BY_SIDE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'SIDE_BY_SIDE'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Song Song (2 Cột)
              </button>
              <button
                onClick={() => setViewMode('BEFORE_ONLY')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'BEFORE_ONLY'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Trước Sửa
              </button>
              <button
                onClick={() => setViewMode('AFTER_ONLY')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'AFTER_ONLY'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sau Sửa
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Metadata banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Hư Hỏng Ghi Nhận (Survey):</span>
              <span className="font-bold text-amber-600 font-mono">[{item.damageCode}] {item.damageNameVi}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Phương Án Sửa Chữa (Repair):</span>
              <span className="font-bold text-blue-600 font-mono">[{item.repairCode}] {item.repairNameVi}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Quy Cách & Vật Tư:</span>
              <span className="font-bold text-slate-700">{item.quantity} {item.unit} &bull; Chuẩn IICL-6</span>
            </div>
          </div>

          {/* Photo display grid */}
          <div className={`grid gap-6 ${viewMode === 'SIDE_BY_SIDE' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Before Photo Box */}
            {(viewMode === 'SIDE_BY_SIDE' || viewMode === 'BEFORE_ONLY') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold font-mono rounded-lg">
                      1. ẢNH TRƯỚC SỬA (BEFORE)
                    </span>
                    <span className="text-xs text-slate-500">Giám định e-EIR</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {beforePhotos[0]?.timestamp || ''}
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200 bg-black aspect-video group">
                  {primaryBefore ? (
                    <img
                      src={primaryBefore}
                      alt="Ảnh trước sửa"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Chưa có ảnh trước sửa</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                    <p className="text-xs font-medium line-clamp-2">
                      {beforePhotos[0]?.description || item.description}
                    </p>
                    <span className="text-[10px] text-amber-600 font-mono block mt-0.5">
                      Người chụp: {beforePhotos[0]?.photographer || 'Giám định viên'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* After Photo Box */}
            {(viewMode === 'SIDE_BY_SIDE' || viewMode === 'AFTER_ONLY') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold font-mono rounded-lg">
                      2. ẢNH SAU SỬA (AFTER)
                    </span>
                    <span className="text-xs text-emerald-600">Nghiệm thu hoàn tất</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {afterPhotos[0]?.timestamp || 'Chưa chụp'}
                  </span>
                </div>

                {afterPhotos.length > 0 ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 bg-black aspect-video group">
                    <img
                      src={primaryAfter}
                      alt="Ảnh sau sửa"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                      <p className="text-xs font-medium text-emerald-200 line-clamp-2">
                        {afterPhotos[0]?.description || item.executionNotes || 'Hoàn tất thi công đạt tiêu chuẩn kỹ thuật IICL'}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-mono block mt-0.5">
                        Thợ chụp: {afterPhotos[0]?.photographer || item.technician || '—'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-500">
                    <Camera className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Chưa có ảnh chụp sau sửa</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Thợ cơ khí cần chụp ảnh nghiệm thu sau khi hoàn thành thi công
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audit trail metadata list */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Nhật Ký Lưu Trữ Bằng Chứng Hình Ảnh (Audit Trail)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-500">
              <div className="p-2 bg-white rounded-lg">
                <span className="text-slate-500">ID Ảnh Trước:</span> {beforePhotos[0]?.id || `BEF-${item.id}`}
              </div>
              <div className="p-2 bg-white rounded-lg">
                <span className="text-slate-500">ID Ảnh Sau:</span> {afterPhotos[0]?.id || 'Chờ chụp sau thi công'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
