import React, { useState } from 'react';
import { SurveyItemRecord, SurveyPhoto } from '../types';
import {
  Image as ImageIcon,
  Camera,
  Search,
  Filter,
  Eye,
  Trash2,
  Upload,
  Calendar,
  User,
  Tag,
  Maximize2,
  X
} from 'lucide-react';

interface SurveyPhotoGalleryProps {
  surveys: SurveyItemRecord[];
  onAddPhotoToSurvey?: (surveyId: string, photo: SurveyPhoto) => void;
}

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (nền trắng) theo yêu cầu người dùng.
// Ghi chú: các badge/overlay nằm TRÊN ảnh chụp thực tế (container no, loại ảnh, lightbox backdrop, khung
// xem ảnh) vẫn giữ nền tối để đảm bảo đọc được trên nền ảnh bất kỳ — không đổi theo theme sáng của app.
export const SurveyPhotoGallery: React.FC<SurveyPhotoGalleryProps> = ({
  surveys
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lineFilter, setLineFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; caption: string; metadata?: any } | null>(null);

  // Flatten all photos from all surveys
  const allPhotos: { photo: SurveyPhoto; survey: SurveyItemRecord }[] = [];
  surveys.forEach((s) => {
    (s.photos || []).forEach((p) => {
      allPhotos.push({ photo: p, survey: s });
    });
  });

  const filtered = allPhotos.filter(({ photo, survey }) => {
    const matchesSearch =
      survey.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.surveyor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.damageCode && photo.damageCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLine = lineFilter === 'ALL' || survey.shippingLine === lineFilter;
    const matchesType = typeFilter === 'ALL' || photo.type === typeFilter;

    return matchesSearch && matchesLine && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              Kho Hình Ảnh Giám Định Hiện Trường (Survey Photo Gallery)
            </h2>
            <p className="text-xs text-slate-500">
              Tổng hợp ảnh chụp toàn cảnh, chi tiết tổn thất, niêm phong cửa và sàn container phục vụ đối chiếu và lưu trữ điện tử.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          Tổng cộng: <strong className="text-slate-900">{filtered.length}</strong> hình ảnh
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Container No, Tên Surveyor, Vết hư hỏng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none"
          >
            <option value="ALL">Tất cả hãng tàu</option>
            <option value="MAERSK">MAERSK</option>
            <option value="MSC">MSC</option>
            <option value="ONE">ONE</option>
            <option value="CMA-CGM">CMA-CGM</option>
            <option value="COSCO">COSCO</option>
            <option value="EVERGREEN">EVERGREEN</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none"
          >
            <option value="ALL">Tất cả phân loại ảnh</option>
            <option value="OVERVIEW">Ảnh Toàn Cảnh (OVERVIEW)</option>
            <option value="DETAIL">Chi Tiết Tổn Thất (DETAIL)</option>
            <option value="DOOR_SEAL">Cửa &amp; Niêm Phong (DOOR_SEAL)</option>
            <option value="INTERIOR_FLOOR">Sàn &amp; Nội Thất (FLOOR)</option>
            <option value="REEFER_PANEL">Bảng Điều Khiển Lạnh (REEFER_PANEL)</option>
            <option value="OTHER">Khác (OTHER)</option>
          </select>
        </div>
      </div>

      {/* Grid of Photos */}
      {filtered.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-3">
          <Camera className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">Không tìm thấy hình ảnh nào phù hợp</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Các hình ảnh được Surveyor chụp tại bãi giám định sẽ tự động cập nhật và đồng bộ tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(({ photo, survey }) => (
            <div
              key={photo.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:border-blue-300 transition duration-200 flex flex-col justify-between shadow-sm"
            >
              {/* Photo Image with hover actions */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Top badges — overlay trên ảnh, giữ nền tối để luôn đọc được */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-slate-950/80 backdrop-blur-sm text-white font-mono font-bold text-[10px] rounded border border-slate-700">
                    {survey.containerNo}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                      photo.type === 'OVERVIEW'
                        ? 'bg-blue-900/90 text-blue-200'
                        : photo.type === 'DETAIL'
                        ? 'bg-rose-900/90 text-rose-200'
                        : 'bg-emerald-900/90 text-emerald-200'
                    }`}
                  >
                    {photo.type}
                  </span>
                </div>

                {/* Hover overlay button to zoom */}
                <div
                  onClick={() =>
                    setPreviewPhoto({
                      url: photo.url,
                      caption: photo.caption,
                      metadata: {
                        containerNo: survey.containerNo,
                        surveyor: photo.surveyor,
                        uploadedAt: photo.uploadedAt,
                        damageCode: photo.damageCode,
                        shippingLine: survey.shippingLine
                      }
                    })
                  }
                  className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                >
                  <span className="p-2 bg-blue-600 text-white rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold">
                    <Maximize2 className="w-4 h-4" /> Phóng To
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3.5 space-y-2 text-xs">
                <p className="font-semibold text-slate-700 line-clamp-1">{photo.caption}</p>

                {photo.damageCode && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-rose-600">
                    <Tag className="w-3 h-3" />
                    <span>Lỗi: {photo.damageCode} ({photo.damageLocation})</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {photo.surveyor}
                  </span>
                  <span className="font-mono text-slate-500">{photo.uploadedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal — backdrop và khung xem ảnh giữ nền tối theo quy ước modal ảnh */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-3xl w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {previewPhoto.metadata?.containerNo} &bull; {previewPhoto.caption}
                </h3>
                <p className="text-xs text-slate-500">
                  Giám định viên: {previewPhoto.metadata?.surveyor} &bull; Ngày chụp: {previewPhoto.metadata?.uploadedAt}
                </p>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 max-h-[70vh] flex items-center justify-center border border-slate-800">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption}
                referrerPolicy="no-referrer"
                className="max-h-[68vh] w-auto object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
