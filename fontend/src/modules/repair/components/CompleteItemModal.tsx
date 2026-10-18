import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Package, Clock, FileText, Plus, Trash2, AlertCircle, Camera } from 'lucide-react';
import { WorkOrderRepairItem, MaterialUsage } from '../types/repair';
import { masterDataApi } from '../../../api';

interface CompleteItemModalProps {
  item: WorkOrderRepairItem;
  containerNo: string;
  workOrderNo: string;
  leadTechnician: string;
  onOpenCapturePhotos: () => void;
  onConfirmComplete: (data: {
    executionNotes: string;
    actualHours: number;
    materialsUsed: MaterialUsage[];
    technician: string;
  }) => void;
  onClose: () => void;
}

export const CompleteItemModal: React.FC<CompleteItemModalProps> = ({
  item,
  containerNo,
  workOrderNo,
  leadTechnician,
  onOpenCapturePhotos,
  onConfirmComplete,
  onClose
}) => {
  const afterPhotos = item.photos.filter((p) => p.type === 'AFTER');
  const hasAfterPhoto = afterPhotos.length > 0;
  // Ảnh trước sửa là điều kiện bắt buộc trước ảnh sau sửa (ảnh giám định không tính).
  const hasBeforePhoto = item.photos.some((p) => p.type === 'BEFORE');

  const [technician, setTechnician] = useState(item.technician || leadTechnician || '');
  const [actualHours, setActualHours] = useState<number>(item.actualHours || 0);
  const [executionNotes, setExecutionNotes] = useState(item.executionNotes || '');
  const [materialsCatalog, setMaterialsCatalog] = useState<Array<{ code: string; name: string; unit: string }>>([]);

  useEffect(() => {
    masterDataApi.getMaterials()
      .then((response: any) => {
        if (response?.statusCode === 200) setMaterialsCatalog(response.data || []);
      })
      .catch((error) => console.error('Không thể tải danh mục vật tư:', error));
  }, []);

  const [materials, setMaterials] = useState<MaterialUsage[]>(
    item.materialsUsed.length > 0
      ? item.materialsUsed
      : []
  );

  // New Material row state
  const [selectedMaterialCode, setSelectedMaterialCode] = useState('');
  const [materialQty, setMaterialQty] = useState(1);

  const handleAddMaterial = () => {
    const foundMat = materialsCatalog.find((m) => m.code === selectedMaterialCode);
    if (!foundMat) return;

    const newMat: MaterialUsage = {
      id: `MAT-${Date.now()}`,
      materialCode: foundMat.code,
      materialName: foundMat.name,
      quantity: Number(materialQty) || 1,
      unit: foundMat.unit,
      notes: ''
    };

    setMaterials([...materials, newMat]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasBeforePhoto) {
      alert('Bắt buộc phải chụp ít nhất 01 ảnh trước khi sửa (BEFORE photo) mới được phép hoàn thành hạng mục!');
      return;
    }
    if (!hasAfterPhoto) {
      alert('Bắt buộc phải chụp hoặc đính kèm ít nhất 01 ảnh sau khi sửa (AFTER photo) mới được phép hoàn thành hạng mục!');
      return;
    }

    onConfirmComplete({
      executionNotes,
      actualHours: Number(actualHours) || 1.5,
      materialsUsed: materials,
      technician
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Ghi Nhận Kết Quả & Hoàn Thành Hạng Mục</h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                  #{item.itemNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Cont: <strong className="text-slate-900">{containerNo}</strong> &bull; WO: <strong className="text-amber-600">{workOrderNo}</strong>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Photo validation notice */}
          {!hasBeforePhoto && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-800">Chưa Có Ảnh Trước Sửa (Bắt Buộc)</h4>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Đóng cửa sổ này, bấm "Chụp Ảnh Trước Sửa" ở thẻ hạng mục để chụp hiện trạng hư hỏng, rồi mới chụp ảnh sau sửa và hoàn thành.
                </p>
              </div>
            </div>
          )}
          {!hasAfterPhoto ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-200">Chưa Có Ảnh Sau Sửa (Bắt Buộc)</h4>
                  <p className="text-[11px] text-rose-600 leading-relaxed">
                    Theo quy định IICL và Hãng Tàu, thợ phải chụp ảnh đối chứng sau sửa trước khi hoàn thành hạng mục này.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCapturePhotos();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Chụp Ảnh Ngay</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã có {afterPhotos.length} ảnh sau sửa đính kèm đầy đủ</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCapturePhotos();
                }}
                className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
              >
                Xem / Thêm ảnh &rarr;
              </button>
            </div>
          )}

          {/* Item details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Hạng Mục Sửa Chữa</span>
            <div className="text-xs font-bold text-slate-900 font-mono flex items-center gap-2">
              <span className="text-amber-600">[{item.repairCode}]</span>
              <span>{item.repairNameVi}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Vị trí: <strong className="text-slate-700">{item.locationVi} ({item.locationCode})</strong> &bull; Hư hỏng: <strong className="text-amber-700">[{item.damageCode}] {item.damageNameVi}</strong>
            </p>
          </div>

          {/* Execution details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Thời Gian Thi Công Thực Tế (Giờ)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={actualHours}
                onChange={(e) => setActualHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-bold font-mono text-slate-900 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Thợ Trưởng Kíp Thực Hiện</span>
              </label>
              <input
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 rounded-xl focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Technical execution notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Kết Quả Thực Hiện & Ghi Chú Kỹ Thuật (Execution Notes)*
            </label>
            <textarea
              rows={3}
              value={executionNotes}
              onChange={(e) => setExecutionNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none leading-relaxed"
              placeholder="Nhập quy trình thi công, phương pháp hàn vá, số lớp sơn..."
              required
            />
          </div>

          {/* Materials Usage List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Vật Tư EMR Đã Xuất Dùng Cho Hạng Mục ({materials.length})</span>
              </label>
            </div>

            {/* Existing materials table */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              {materials.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic text-center py-2">
                  Chưa ghi nhận vật tư tiêu hao nào cho hạng mục này
                </p>
              ) : (
                materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="font-mono text-amber-600">{mat.materialCode}</span>
                        <span>{mat.materialName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{mat.notes}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-emerald-600 px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
                        {mat.quantity} {mat.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(mat.id)}
                        className="p-1 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                        title="Xóa vật tư"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Add material sub-form */}
              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <div className="sm:col-span-8">
                  <select
                    value={selectedMaterialCode}
                    onChange={(e) => setSelectedMaterialCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-xs"
                  >
                    {materialsCatalog.map((m) => (
                      <option key={m.code} value={m.code}>
                        [{m.code}] {m.name} ({m.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={materialQty}
                    onChange={(e) => setMaterialQty(parseFloat(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-center text-xs font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!hasAfterPhoto || !hasBeforePhoto}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg  transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>XÁC NHẬN HOÀN THÀNH HẠNG MỤC</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
