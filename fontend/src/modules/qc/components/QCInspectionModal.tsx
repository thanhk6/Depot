import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Camera,
  Award,
  Sparkles,
  Eye,
  FileCheck,
  RotateCcw,
  Check,
  Upload,
  Trash2,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { QCInspectionRecord, QCCheckItem } from '../types/qc';
import { useQcChecklistTemplate } from '../../masterdata/utils/checklistCatalog';
import { useDepot } from '../../../context/DepotContext';

interface QCInspectionModalProps {
  record: QCInspectionRecord;
  onPassQC: (
    recordId: string,
    comments: string,
    grade: 'GRADE_A' | 'GRADE_B' | 'CARGO_WORTHY',
    checkItems: QCCheckItem[]
  ) => void;
  onFailQC: (
    recordId: string,
    reworkReason: string,
    comments: string,
    checkItems: QCCheckItem[],
    failPhotos?: { url: string; label: string; location: string; timestamp?: string }[],
    requirePhotoRetake?: boolean
  ) => void;
  onClose: () => void;
}

export const QCInspectionModal: React.FC<QCInspectionModalProps> = ({
  record,
  onPassQC,
  onFailQC,
  onClose
}) => {
  const { loggedInUserProfile } = useDepot();
  // Checklist nghiệm thu từ danh mục QC_CHECKLIST (DB) nếu phiếu chưa có checklist riêng.
  const qcTemplate = useQcChecklistTemplate();
  const [checkItems, setCheckItems] = useState<QCCheckItem[]>(record.checkItems || []);
  React.useEffect(() => {
    if (qcTemplate.length > 0) setCheckItems((prev) => (prev.length > 0 ? prev : qcTemplate.map((c) => ({ ...c }))));
  }, [qcTemplate]);
  const [selectedGrade, setSelectedGrade] = useState<'GRADE_A' | 'GRADE_B' | 'CARGO_WORTHY'>('GRADE_A');
  const [inspectorComments, setInspectorComments] = useState(
    record.inspectorComments || ''
  );
  const [reworkReason, setReworkReason] = useState(
    record.reworkReason || ''
  );
  const [activeTab, setActiveTab] = useState<'CHECKLIST' | 'PHOTOS' | 'FAIL_FORM'>('CHECKLIST');
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  // Rejection & Defect Photos state
  const [failPhotos, setFailPhotos] = useState<
    { url: string; label: string; location: string; timestamp?: string }[]
  >(
    record.failPhotos || []
  );
  const [requirePhotoRetake, setRequirePhotoRetake] = useState<boolean>(
    record.requirePhotoRetake !== undefined ? record.requirePhotoRetake : true
  );
  const [defectPhotoLabel, setDefectPhotoLabel] = useState<string>('Vết lỗi chưa đạt chuẩn IICL');
  const [defectPhotoLocation, setDefectPhotoLocation] = useState<string>('Vách trái / Xà đáy');

  // After Photos (allows inspector to retake or replace if poor quality)
  const [afterPhotos, setAfterPhotos] = useState(record.afterPhotos || []);

  const allPassed = checkItems.every((item) => item.isPassed);

  const toggleCheckItem = (id: string) => {
    setCheckItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isPassed;
          if (!nextState) {
            // Auto update rework reason when check item fails
            setReworkReason((old) =>
              old.includes(item.titleVi)
                ? old
                : `${old ? old + '. ' : ''}Không đạt: ${item.titleVi} (${item.standardVi})`
            );
          }
          return { ...item, isPassed: nextState };
        }
        return item;
      })
    );
  };

  // Upload or Capture Defect Photo
  const handleCaptureDefectPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setFailPhotos((prev) => [
          ...prev,
          {
            url,
            label: defectPhotoLabel || 'Ảnh chụp lỗi nghiệm thu tại bãi',
            location: defectPhotoLocation || 'Hiện trường nghiệm thu',
            timestamp: now
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload or Retake After Photo
  const handleRetakeAfterPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setAfterPhotos((prev) => [
          ...prev,
          {
            url,
            label: 'Ảnh sau sửa chụp lại (QC Retake)',
            location: 'Vị trí đã khắc phục'
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFailPhoto = (index: number) => {
    setFailPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAfterPhoto = (index: number) => {
    setAfterPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePass = () => {
    onPassQC(record.id, inspectorComments, selectedGrade, checkItems);
    onClose();
  };

  const handleFail = () => {
    onFailQC(record.id, reworkReason, inspectorComments, checkItems, failPhotos, requirePhotoRetake);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 border border-purple-200 text-purple-600 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  Phiếu Nghiệm Thu Kỹ Thuật QC (EMR Quality Inspection)
                </h3>
                <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-bold rounded">
                  {record.shippingLine}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Cont: <strong className="text-emerald-600 text-sm">{record.containerNo}</strong> &bull; WO:{' '}
                <strong className="text-amber-600">{record.workOrderNo}</strong> &bull; Thợ: <strong className="text-slate-700">{record.technicianName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CHECKLIST'
                ? 'bg-white text-purple-600 border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>1. Tiêu Chí Nghiệm Thu (7-Point Checklist)</span>
          </button>

          <button
            onClick={() => setActiveTab('PHOTOS')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'PHOTOS'
                ? 'bg-white text-purple-600 border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Đối Chiếu Ảnh Trước / Sau ({afterPhotos.length} Ảnh Sau Sửa)</span>
          </button>

          <button
            onClick={() => setActiveTab('FAIL_FORM')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'FAIL_FORM'
                ? 'bg-white text-rose-600 border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-rose-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>3. Biên Bản Không Đạt &amp; Chụp Ảnh Lỗi ({failPhotos.length} Ảnh Lỗi)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* TAB 1: CHECKLIST */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-5">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-purple-700 uppercase tracking-wider">
                    Quy Trình Kiểm Tra 7 Điểm Tiêu Chuẩn IICL-6 / ISO:
                  </h4>
                  <p className="text-slate-500 mt-0.5">
                    Click để đánh dấu Đạt hoặc Không đạt cho từng tiêu chí kiểm tra thực địa.
                  </p>
                </div>
                <div className="font-mono text-xs font-bold px-3 py-1 bg-purple-100 text-purple-200 rounded-xl border border-purple-200">
                  {checkItems.filter((i) => i.isPassed).length} / {checkItems.length} Tiêu Chí Đạt
                </div>
              </div>

              {/* 7 Check items */}
              <div className="space-y-2.5">
                {checkItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleCheckItem(item.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                      item.isPassed
                        ? 'bg-slate-50 border-emerald-200 hover:border-emerald-400'
                        : 'bg-rose-50 border-rose-200 hover:border-rose-400'
                    }`}
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition shrink-0 ${
                      item.isPassed
                        ? 'bg-emerald-500 text-slate-900 border-emerald-400'
                        : 'bg-white text-transparent border-slate-200'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className={`text-xs font-bold ${item.isPassed ? 'text-slate-900' : 'text-rose-700'}`}>
                          {item.titleVi}
                        </h5>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          item.isPassed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {item.isPassed ? 'ĐẠT (PASS)' : 'KHÔNG ĐẠT (FAIL)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {item.standardVi}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grade Selection & Comments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Phân Hạng Vỏ Xuất Bãi (Grade):
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-emerald-700 rounded-xl focus:outline-none"
                  >
                    <option value="GRADE_A">Grade A (Cấp Thực Phẩm / Hàng Tinh)</option>
                    <option value="GRADE_B">Grade B (Cấp Hàng Khô Tiêu Chuẩn)</option>
                    <option value="CARGO_WORTHY">Cargo Worthy (Đủ Tiêu Chuẩn Biển)</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nhận Xét & Đánh Giá Của Giám Sát QC:
                  </label>
                  <input
                    type="text"
                    value={inspectorComments}
                    onChange={(e) => setInspectorComments(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none"
                    placeholder="Ghi chú đánh giá độ kín, mối hàn, sàn gỗ..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTO COMPARISON */}
          {activeTab === 'PHOTOS' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                <div>
                  <span className="font-bold text-slate-700 block">
                    Đối chiếu ảnh trước khi sửa (Before - e-EIR) và sau khi sửa (After - Work Order):
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Nếu ảnh của thợ bị mờ hoặc chưa đúng góc chụp, QC có thể bấm chụp lại ảnh ngay dưới đây.
                  </span>
                </div>

                <label className="px-3.5 py-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-slate-900 rounded-xl border border-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Chụp Lại / Bổ Sung Ảnh Sau Sửa</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleRetakeAfterPhoto}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Photos */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Ảnh Hư Hỏng Trước Sửa (BEFORE):</span>
                  </span>
                  {record.beforePhotos && record.beforePhotos.length > 0 ? (
                    record.beforePhotos.map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => setZoomedPhoto(photo.url)}
                        className="rounded-2xl overflow-hidden border border-slate-200 aspect-video relative group cursor-pointer bg-black"
                      >
                        <img src={photo.url} alt="Before repair" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/80 backdrop-blur rounded-xl text-[11px] text-slate-900 flex items-center justify-between">
                          <span>{photo.location}</span>
                          <span className="text-amber-600 font-mono font-bold">Vết Hư Hỏng</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                      Không có ảnh trước sửa
                    </div>
                  )}
                </div>

                {/* After Photos */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-600 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Ảnh Kết Quả Sau Sửa (AFTER):</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">({afterPhotos.length} ảnh)</span>
                  </span>
                  {afterPhotos && afterPhotos.length > 0 ? (
                    afterPhotos.map((photo, i) => (
                      <div
                        key={i}
                        className="rounded-2xl overflow-hidden border border-emerald-200 aspect-video relative group bg-black"
                      >
                        <img
                          src={photo.url}
                          alt="After repair"
                          onClick={() => setZoomedPhoto(photo.url)}
                          className="w-full h-full object-cover group-hover:scale-105 transition cursor-pointer"
                        />
                        <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/85 backdrop-blur rounded-xl text-[11px] text-slate-900 flex items-center justify-between">
                          <span className="truncate pr-2">{photo.location} - {photo.label}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAfterPhoto(i);
                            }}
                            className="text-rose-600 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa ảnh để chụp lại"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                      <p>Chưa có ảnh sau sửa</p>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-500 transition">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Chụp Ảnh Ngay</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleRetakeAfterPhoto}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAIL FORM & REJECTION PHOTOS */}
          {activeTab === 'FAIL_FORM' && (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-5">
              <div className="flex items-center gap-3 text-rose-700">
                <RotateCcw className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Biên Bản Từ Chối Nghiệm Thu &amp; Chụp Lại Ảnh Minh Chứng Lỗi (QC Punch-list):
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nếu nghiệm thu không đạt, chụp ảnh lại vết lỗi thực tế tại bãi làm bằng chứng trả về cho tổ thợ làm lại.
                  </p>
                </div>
              </div>

              {/* Rework Reason input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Lý Do Cụ Thể Không Đạt Nghiệm Thu*:
                </label>
                <textarea
                  rows={3}
                  value={reworkReason}
                  onChange={(e) => setReworkReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-rose-200 text-xs text-slate-900 rounded-xl focus:outline-none leading-relaxed"
                  placeholder="Mô tả lỗi còn tồn tại (dột nước, mối hàn lỗi, sơn chưa đạt DFT, sàn gỗ lệch...)"
                />
              </div>

              {/* Capture & Upload Defect Photos Section */}
              <div className="space-y-3 p-4 bg-slate-50 border border-rose-200 rounded-2xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-rose-700">
                      Chụp / Tải Ảnh Lỗi Không Đạt Hiện Trường ({failPhotos.length} ảnh):
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Tự động chèn Container No &amp; Timestamp</span>
                </div>

                {/* Camera / Upload buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="p-3.5 bg-rose-50 hover:bg-rose-100 border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-xl flex items-center justify-center gap-2.5 text-center cursor-pointer transition">
                    <Camera className="w-5 h-5 text-rose-600 shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-rose-200">Chụp Ảnh Bằng Máy Ảnh / Camera</div>
                      <div className="text-[10px] text-slate-500">Mở máy ảnh chụp trực tiếp vết lỗi</div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handleCaptureDefectPhoto}
                      className="hidden"
                    />
                  </label>

                  <label className="p-3.5 bg-white hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-slate-500 rounded-xl flex items-center justify-center gap-2.5 text-center cursor-pointer transition">
                    <Upload className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-700">Chọn Ảnh Từ Thư Viện Thiết Bị</div>
                      <div className="text-[10px] text-slate-500">Tải file JPG, PNG từ máy</div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleCaptureDefectPhoto}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Display Grid of Defect Photos */}
                {failPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {failPhotos.map((p, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl overflow-hidden border border-rose-200/60 bg-black aspect-video relative group"
                      >
                        <img
                          src={p.url}
                          alt={p.label}
                          onClick={() => setZoomedPhoto(p.url)}
                          className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition"
                        />
                        <div className="absolute top-1 right-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveFailPhoto(idx)}
                            className="p-1 bg-rose-50 text-rose-700 hover:text-slate-900 rounded-lg transition"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-1.5 bg-black/85 text-[10px] text-slate-700 leading-tight">
                          <span className="text-rose-600 font-bold block truncate">{p.label}</span>
                          <span className="text-slate-500 text-[9px] block">{p.location} &bull; {p.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Requirement Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={requirePhotoRetake}
                  onChange={(e) => setRequirePhotoRetake(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-50 border-slate-200"
                />
                <span className="font-bold">
                  Bắt buộc tổ thợ phải chụp lại toàn bộ ảnh sau khi hoàn thành sửa lại (Require Photo Retake on Finish)
                </span>
              </label>

              {/* Action */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleFail}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg  transition flex items-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>XÁC NHẬN TỪ CHỐI, LƯU ẢNH LỖI &amp; YÊU CẦU SỬA LẠI</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs font-mono text-slate-500">
            Giám sát viên: <strong className="text-slate-900">{loggedInUserProfile?.fullName || loggedInUserProfile?.username || '—'}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('FAIL_FORM')}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Không Đạt (Chụp Ảnh Lỗi &amp; Sửa Lại)</span>
            </button>

            <button
              type="button"
              onClick={handlePass}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xl  transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>NGHIỆM THU ĐẠT CHUẨN (CẤP VỎ SẠCH AV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox photo modal */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={zoomedPhoto} alt="Zoomed view" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
