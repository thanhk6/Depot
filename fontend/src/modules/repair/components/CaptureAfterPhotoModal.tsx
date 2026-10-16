import React, { useState } from 'react';
import { X, Camera, Upload, Trash2, CheckCircle2, Image as ImageIcon, User, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { WorkOrderRepairItem, RepairPhoto } from '../types/repair';
import { repairApi, depotFileApi } from '../../../api';

interface CaptureAfterPhotoModalProps {
  item: WorkOrderRepairItem;
  /** DepotJob.Id thật — ảnh được lưu ngay vào RepairOrder của job này. */
  jobId: string;
  containerNo: string;
  workOrderNo: string;
  technicianName: string;
  onSavePhotos: (photos: RepairPhoto[]) => void;
  onClose: () => void;
}

// Ảnh đã lưu thật trên backend có id dạng "FILE-{DepotFiles.Id}".
const toServerFileId = (photoId: string) => (photoId.startsWith('FILE-') ? Number(photoId.slice(5)) : null);

export const CaptureAfterPhotoModal: React.FC<CaptureAfterPhotoModalProps> = ({
  item,
  jobId,
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
  const [photographer, setPhotographer] = useState(technicianName || '');
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Mỗi ảnh chụp/chọn được upload NGAY lên Depot.FileServer và ghi vào DepotFiles (gắn RepairOrder của
  // job, theo số hạng mục) — trước đây chỉ đọc thành base64 trong trình duyệt rồi gửi kèm lúc Hoàn thành
  // Work Order, backend bỏ đi và chỉ ghi lại số lượng, nên ảnh mất hết sau F5.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadError(null);
    setUploadingCount((n) => n + files.length);
    const errors: string[] = [];
    for (const file of files) {
      try {
        const response: any = await repairApi.uploadAfterPhoto(jobId, item.itemNo, file);
        const saved = response?.data;
        if (response?.statusCode !== 200 || !saved) throw new Error(response?.data || response?.message || 'Upload thất bại.');
        const newPhoto: RepairPhoto = {
          id: `FILE-${saved.id}`,
          containerNo,
          workOrderNo,
          repairItemId: item.id,
          type: 'AFTER',
          url: saved.url,
          photographer,
          timestamp: new Date(saved.createdAt).toLocaleString('vi-VN'),
          description: photoNote || `Ảnh chụp nghiệm thu hoàn thành hạng mục #${item.itemNo}`
        };
        setPhotosList((prev) => [...prev, newPhoto]);
      } catch (error: any) {
        const detail = error?.response?.data?.data || error?.response?.data?.message || (error instanceof Error ? error.message : null);
        errors.push(`${file.name}: ${typeof detail === 'string' && detail ? detail : 'không lưu được'}`);
      } finally {
        setUploadingCount((n) => n - 1);
      }
    }
    if (errors.length > 0) setUploadError(errors.join(' • '));
  };

  const handleRemovePhoto = async (photoId: string) => {
    const serverId = toServerFileId(photoId);
    if (serverId != null) {
      try {
        await depotFileApi.delete(serverId);
      } catch {
        setUploadError('Không xóa được ảnh trên máy chủ, thử lại sau.');
        return;
      }
    }
    setPhotosList((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleRemoveAll = async () => {
    for (const photo of photosList) await handleRemovePhoto(photo.id);
  };

  // Ảnh đã lưu thật ngay lúc upload nên đóng modal (kể cả nút X/Đóng) vẫn phải đồng bộ danh sách hiện
  // tại về Work Order — không có khái niệm "Hủy" hoàn tác nữa.
  const handleConfirm = () => {
    onSavePhotos(photosList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Chụp & Lưu Ảnh Sau Sửa (Post-Repair Photos)</h3>
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono rounded">
                  Hạng mục #{item.itemNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Cont: <strong className="text-slate-900">{containerNo}</strong> &bull; WO: <strong className="text-amber-600">{workOrderNo}</strong> &bull; {item.locationVi}
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Metadata banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">Nội dung sửa chữa:</span>
              <span className="font-bold text-slate-900 font-mono">[{item.repairCode}] {item.repairNameVi}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Vị trí thi công:</span>
              <span className="font-bold text-emerald-600">{item.locationVi} ({item.locationCode})</span>
            </div>
          </div>

          {/* Quick Retake Alert if existing photos */}
          {existingAfterPhotos.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-amber-800">
                  Hạng mục này đã có {existingAfterPhotos.length} ảnh sau sửa. Nếu nghiệm thu không đạt hoặc ảnh mờ, bạn có thể chụp lại ảnh mới.
                </span>
              </div>
              <button
                type="button"
                onClick={() => { void handleRemoveAll(); }}
                className="px-3 py-1 bg-rose-50 hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết &amp; Chụp lại từ đầu</span>
              </button>
            </div>
          )}

          {/* Capture / Upload Trigger Area */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Thao Tác Chụp & Tải Ảnh Nghiệm Thu Thực Tế
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Camera Trigger */}
              <label className="p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group">
                <Camera className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition mb-2" />
                <span className="text-xs font-bold text-emerald-700">Chụp Ảnh Bằng Camera Điện Thoại / Tablet</span>
                <span className="text-[11px] text-slate-500 mt-1">Mở máy ảnh trực tiếp tại bãi sửa chữa</span>
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
              <label className="p-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-slate-500 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition group">
                <Upload className="w-8 h-8 text-blue-600 group-hover:scale-110 transition mb-2" />
                <span className="text-xs font-bold text-slate-700">Chọn Ảnh Từ Bộ Nhớ Thiết Bị</span>
                <span className="text-[11px] text-slate-500 mt-1">Tải file JPG, PNG từ thư viện máy</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {uploadingCount > 0 && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-2 text-xs text-sky-700 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu {uploadingCount} ảnh lên máy chủ...</span>
              </div>
            )}
            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-700">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Captured Photos Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span>2. Danh Sách Ảnh Sau Sửa Đã Gắn (#{photosList.length})</span>
                {photosList.length === 0 && (
                  <span className="text-[11px] text-rose-600 font-normal flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Bắt buộc có ít nhất 1 ảnh để hoàn thành hạng mục
                  </span>
                )}
              </label>
            </div>

            {photosList.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500 text-xs">
                Chưa có ảnh nào được chụp hoặc chọn. Vui lòng chụp ảnh kết quả thi công phía trên.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {photosList.map((photo) => (
                  <div
                    key={photo.id}
                    className="p-2.5 bg-slate-50 border border-emerald-200 rounded-2xl space-y-2 relative group"
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
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-mono text-[10px] text-emerald-600">{photo.id.substring(0, 14)}...</span>
                        <span className="font-mono text-[10px]">{photo.timestamp}</span>
                      </div>
                      <p className="text-slate-700 font-medium line-clamp-1">{photo.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Thợ: <strong className="text-slate-500">{photo.photographer}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="w-full py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Người Thực Hiện / Chụp Ảnh</span>
              </label>
              <input
                type="text"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl font-medium focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Mô Tả Kết Quả Thi Công Ghi Vào Ảnh</span>
              </label>
              <input
                type="text"
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-slate-500 font-mono">
            {photosList.length > 0
              ? `Đã sẵn sàng lưu ${photosList.length} ảnh sau sửa`
              : 'Yêu cầu tải ít nhất 1 ảnh'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirm}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleConfirm}
              disabled={photosList.length === 0 || uploadingCount > 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg  transition flex items-center gap-2 cursor-pointer"
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
