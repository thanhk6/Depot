import React, { useState } from 'react';
import { X, Camera, Upload, Trash2, CheckCircle2, Image as ImageIcon, Sparkles, User, Clock, AlertTriangle } from 'lucide-react';
import { WorkOrderRepairItem, RepairPhoto } from '../types/repair';
import { SAMPLE_AFTER_PHOTOS } from '../data/initialWorkOrders';

interface CaptureAfterPhotoModalProps {
  item: WorkOrderRepairItem;
  containerNo: string;
  workOrderNo: string;
  technicianName: string;
  onSavePhotos: (photos: RepairPhoto[]) => void;
  onClose: () => void;
}

export const CaptureAfterPhotoModal: React.FC<CaptureAfterPhotoModalProps> = ({
  item,
  containerNo,
  workOrderNo,
  technicianName,
  onSavePhotos,
  onClose
}) => {
  const existingAfterPhotos = item.photos.filter((p) => p.type === 'AFTER');
  const [photosList, setPhotosList] = useState<RepairPhoto[]>(existingAfterPhotos);
  const [photoNote, setPhotoNote] = useState(
    item.executionNotes || 'Hoàn tất hàn đắp nắn phẳng & phun sơn lót bảo vệ chuẩn IICL-6'
  );
  const [photographer, setPhotographer] = useState(technicianName || 'Hoàng Văn Sơn (Tổ EMR)');
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  // Handle file input from device / camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newPhoto: RepairPhoto = {
          id: `P-AFT-${containerNo}-${Date.now()}-${index}`,
          containerNo,
          workOrderNo,
          repairItemId: item.id,
          type: 'AFTER',
          url,
          photographer,
          timestamp: now,
          description: photoNote || `Ảnh chụp nghiệm thu hoàn thành hạng mục #${item.itemNo}`
        };
        setPhotosList((prev) => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Quick add from sample depot repair gallery
  const handleAddSamplePhoto = (sampleUrl: string, title: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newPhoto: RepairPhoto = {
      id: `P-AFT-${containerNo}-${Date.now()}`,
      containerNo,
      workOrderNo,
      repairItemId: item.id,
      type: 'AFTER',
      url: sampleUrl,
      photographer,
      timestamp: now,
      description: title || photoNote
    };
    setPhotosList((prev) => [...prev, newPhoto]);
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotosList((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleConfirm = () => {
    onSavePhotos(photosList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Chụp & Lưu Ảnh Sau Sửa (Post-Repair Photos)</h3>
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono rounded">
                  Hạng mục #{item.itemNo}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Cont: <strong className="text-white">{containerNo}</strong> &bull; WO: <strong className="text-amber-400">{workOrderNo}</strong> &bull; {item.locationVi}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/60">
          {/* Metadata banner */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">Nội dung sửa chữa:</span>
              <span className="font-bold text-white font-mono">[{item.repairCode}] {item.repairNameVi}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Vị trí thi công:</span>
              <span className="font-bold text-emerald-400">{item.locationVi} ({item.locationCode})</span>
            </div>
          </div>

          {/* Quick Retake Alert if existing photos */}
          {existingAfterPhotos.length > 0 && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-200">
                  Hạng mục này đã có {existingAfterPhotos.length} ảnh sau sửa. Nếu nghiệm thu không đạt hoặc ảnh mờ, bạn có thể chụp lại ảnh mới.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPhotosList([])}
                className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết &amp; Chụp lại từ đầu</span>
              </button>
            </div>
          )}

          {/* Capture / Upload Trigger Area */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Thao Tác Chụp & Tải Ảnh Nghiệm Thu Thực Tế
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Camera Trigger */}
              <label className="p-4 bg-emerald-950/40 hover:bg-emerald-900/40 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group">
                <Camera className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition mb-2" />
                <span className="text-xs font-bold text-emerald-300">Chụp Ảnh Bằng Camera Điện Thoại / Tablet</span>
                <span className="text-[11px] text-slate-400 mt-1">Mở máy ảnh trực tiếp tại bãi sửa chữa</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Upload from device */}
              <label className="p-4 bg-slate-950/80 hover:bg-slate-800/80 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group">
                <Upload className="w-8 h-8 text-blue-400 group-hover:scale-110 transition mb-2" />
                <span className="text-xs font-bold text-slate-200">Chọn Ảnh Từ Bộ Nhớ Thiết Bị</span>
                <span className="text-[11px] text-slate-400 mt-1">Tải file JPG, PNG từ thư viện máy</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Depot Sample Photos (for instant demo/testing) */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kho Ảnh Nghiệm Thu Mẫu Tiêu Chuẩn IICL:</span>
                </span>
                <span className="text-[10px] text-slate-400">Bấm để thêm nhanh</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_AFTER_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSamplePhoto(sample.url, sample.title)}
                    className="relative group rounded-xl overflow-hidden border border-slate-700 hover:border-emerald-500 text-left transition aspect-video cursor-pointer"
                  >
                    <img src={sample.url} alt={sample.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-1 text-center">
                      <span className="text-[10px] font-bold text-white leading-tight">+ Chọn ảnh này</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Captured Photos Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>2. Danh Sách Ảnh Sau Sửa Đã Gắn (#{photosList.length})</span>
                {photosList.length === 0 && (
                  <span className="text-[11px] text-rose-400 font-normal flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Bắt buộc có ít nhất 1 ảnh để hoàn thành hạng mục
                  </span>
                )}
              </label>
            </div>

            {photosList.length === 0 ? (
              <div className="p-6 bg-slate-950 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                Chưa có ảnh nào được chụp hoặc chọn. Vui lòng chụp ảnh kết quả thi công phía trên.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {photosList.map((photo) => (
                  <div
                    key={photo.id}
                    className="p-2.5 bg-slate-950 border border-emerald-900/60 rounded-2xl space-y-2 relative group"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                      <img src={photo.url} alt="Ảnh sau sửa" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPreviewZoomUrl(photo.url)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Xem lớn</span>
                      </button>
                    </div>

                    <div className="text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-mono text-[10px] text-emerald-400">{photo.id.substring(0, 14)}...</span>
                        <span className="font-mono text-[10px]">{photo.timestamp}</span>
                      </div>
                      <p className="text-slate-300 font-medium line-clamp-1">{photo.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Thợ: <strong className="text-slate-400">{photo.photographer}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="w-full py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa ảnh chụp sai</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Meta details: Technician & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Người Thực Hiện / Chụp Ảnh</span>
              </label>
              <input
                type="text"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl font-medium focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Mô Tả Kết Quả Thi Công Ghi Vào Ảnh</span>
              </label>
              <input
                type="text"
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-slate-400 font-mono">
            {photosList.length > 0
              ? `Đã sẵn sàng lưu ${photosList.length} ảnh sau sửa`
              : 'Yêu cầu tải ít nhất 1 ảnh'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handleConfirm}
              disabled={photosList.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Danh Sách Ảnh ({photosList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Large Zoom Preview Modal */}
      {previewZoomUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewZoomUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={previewZoomUrl} alt="Zoom preview" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewZoomUrl(null)}
              className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black text-white rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
