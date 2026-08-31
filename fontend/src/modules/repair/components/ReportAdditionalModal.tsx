import React, { useState } from 'react';
import { X, AlertTriangle, Send, Camera, Upload, ShieldAlert, CheckCircle2, User, Clock } from 'lucide-react';
import { AdditionalDamageReport } from '../types/repair';

interface ReportAdditionalModalProps {
  containerNo: string;
  workOrderNo: string;
  technicianName: string;
  onSubmitReport: (report: AdditionalDamageReport) => void;
  onClose: () => void;
}

export const ReportAdditionalModal: React.FC<ReportAdditionalModalProps> = ({
  containerNo,
  workOrderNo,
  technicianName,
  onSubmitReport,
  onClose
}) => {
  const [location, setLocation] = useState('Xà dọc đáy / Khung gầm chịu lực (Bottom Side Rail)');
  const [damageDescription, setDamageDescription] = useState(
    'Khi tháo dỡ tấm panel vách trái, phát hiện xà dọc đáy bên trong bị nứt gãy biến dạng 150mm ẩn giấu, cần lập phương án cắt nắn đắp tăng cường.'
  );
  const [severity, setSeverity] = useState<'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [reportedBy, setReportedBy] = useState(technicianName || 'Hoàng Văn Sơn (Tổ EMR)');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const report: AdditionalDamageReport = {
      id: `ADD-RPT-${Date.now()}`,
      workOrderNo,
      containerNo,
      location,
      damageDescription,
      severity,
      reportedBy,
      reportedAt: now,
      photoUrl,
      status: 'PENDING_ESTIMATE'
    };

    onSubmitReport(report);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Báo Phát Sinh Hư Hỏng Mới (Incident Report)</h3>
                <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-300 text-xs font-mono rounded">
                  Ngoài Estimate Đã Duyệt
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Cont: <strong className="text-white">{containerNo}</strong> &bull; WO: <strong className="text-amber-400">{workOrderNo}</strong>
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

        {/* Form Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">ĐÃ GỬI BÁO CÁO PHÁT SINH THÀNH CÔNG!</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Hệ thống đã tạo yêu cầu thẩm định bổ sung cho bộ phận Giám định / Báo giá EMR để trình Hãng tàu phê duyệt dự toán phụ trội.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-900/60">
            {/* Rule warning box */}
            <div className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h5 className="font-bold text-amber-200 uppercase tracking-wider">
                  Quy Định Quản Lý Báo Giá Phát Sinh (Strict Policy):
                </h5>
                <p className="text-amber-300/90 leading-relaxed">
                  Nhân viên cơ khí không tự ý sửa chữa hoặc tự tăng chi phí ngoài phạm vi Estimate đã duyệt. Mọi tổn thất ẩn phát sinh phải được lập biên bản để Bộ phận Báo giá trình Hãng tàu phê duyệt bổ sung (Addendum Estimate).
                </p>
              </div>
            </div>

            {/* Damage Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                1. Vị Trí Cấu Kiện Phát Sinh Hư Hỏng*
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-xs font-bold text-white rounded-xl focus:outline-none"
                placeholder="VD: Xà dọc đáy, góc gù đúc, dầm ngang số 4..."
                required
              />
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                2. Mức Độ Tổn Thất & Tính Khẩn Cấp
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['MEDIUM', 'HIGH', 'URGENT'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer text-center ${
                      severity === lvl
                        ? lvl === 'URGENT'
                          ? 'bg-rose-600 text-white border-rose-500 shadow'
                          : lvl === 'HIGH'
                          ? 'bg-amber-600 text-white border-amber-500 shadow'
                          : 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {lvl === 'URGENT' ? 'Khẩn cấp (Nguy hiểm)' : lvl === 'HIGH' ? 'Nghiêm trọng (High)' : 'Trung bình (Medium)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                3. Mô Tả Chi Tiết Tổn Thất Phát Sinh Thực Tế*
              </label>
              <textarea
                rows={3}
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-xs text-white rounded-xl focus:outline-none leading-relaxed"
                placeholder="Mô tả kích thước vết nứt móp, nguyên nhân nghi vấn, phương án đề xuất khắc phục..."
                required
              />
            </div>

            {/* Photo Attachment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>4. Ảnh Chụp Hiện Trường Tổn Thất Phát Sinh</span>
                <span className="text-[10px] text-slate-400 font-normal">Bằng chứng cho Hãng tàu xem xét</span>
              </label>

              <div className="flex items-center gap-3">
                <div className="w-24 h-16 rounded-xl overflow-hidden border border-slate-700 bg-black shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Ảnh phát sinh" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="URL ảnh hoặc chụp từ camera"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg"
                  />
                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer">
                      <Camera className="w-3 h-3" />
                      <span>Chụp Máy Ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setPhotoUrl(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="w-3.5 h-3.5" />
                <span>Người báo cáo: <strong className="text-white">{reportedBy}</strong></span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Thời gian: 2026-08-15
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950 transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>GỬI BÁO CÁO PHÁT SINH CHO BỘ PHẬN BÁO GIÁ</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
