import React, { useState, useEffect } from 'react';
import { DamageRecord, DamageLocationMasterItem, DamageCodeMasterItem, RepairCodeMasterItem } from '../types';
import {
  Wrench,
  Camera,
  X,
  CheckCircle2
} from 'lucide-react';

interface DamageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (damage: DamageRecord) => void;
  initialData?: DamageRecord | null;
  defaultLocationCode?: string;
  defaultLocationName?: string;
  locations: DamageLocationMasterItem[];
  damageCodes: DamageCodeMasterItem[];
  repairCodes: RepairCodeMasterItem[];
  currentUser: string;
}

export const DamageFormModal: React.FC<DamageFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultLocationCode,
  defaultLocationName,
  locations,
  damageCodes,
  repairCodes,
  currentUser
}) => {
  const [locationCode, setLocationCode] = useState(defaultLocationCode || 'RIGHT_W');
  const [damageCode, setDamageCode] = useState('CUT');
  const [repairCode, setRepairCode] = useState('RP_PATCH_S');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [lengthMm, setLengthMm] = useState('120');
  const [widthMm, setWidthMm] = useState('40');
  const [quantity, setQuantity] = useState('1');
  const [photoUrl, setPhotoUrl] = useState('');

  // Modal này không bao giờ unmount (cha luôn render, chỉ ẩn/hiện qua isOpen) nên state cũ tồn tại
  // xuyên suốt phiên giám định. Trước đây nhánh "Thêm Mới" chỉ reset locationCode + description, các
  // trường còn lại (mã lỗi, mã sửa, mức độ, kích thước, ảnh) giữ nguyên giá trị của lần mở trước đó
  // (edit hoặc add trước) — phải reset đủ TẤT CẢ trường về mặc định để mỗi lần thêm mới thực sự sạch.
  useEffect(() => {
    if (initialData) {
      setLocationCode(initialData.locationCode);
      setDamageCode(initialData.damageCode);
      setRepairCode(initialData.repairCode);
      setDescription(initialData.description);
      setSeverity(initialData.severity);
      setLengthMm(initialData.lengthMm?.toString() || '');
      setWidthMm(initialData.widthMm?.toString() || '');
      setQuantity(initialData.quantity?.toString() || '1');
      setPhotoUrl(initialData.photoUrl || '');
    } else {
      setLocationCode(defaultLocationCode || 'RIGHT_W');
      setDamageCode('CUT');
      setRepairCode('RP_PATCH_S');
      setDescription('');
      setSeverity('HIGH');
      setLengthMm('120');
      setWidthMm('40');
      setQuantity('1');
      setPhotoUrl('');
    }
  }, [initialData, defaultLocationCode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedLoc = locations.find((l) => l.code === locationCode);
    const selectedDmg = damageCodes.find((d) => d.code === damageCode);
    const selectedRep = repairCodes.find((r) => r.repairCode === repairCode);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const record: DamageRecord = {
      id: initialData?.id || 'DMG-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      locationCode,
      locationName: selectedLoc?.vietnameseName || defaultLocationName || locationCode,
      damageCode,
      damageName: selectedDmg?.vietnameseName || damageCode,
      repairCode,
      repairName: selectedRep?.vietnameseName || repairCode,
      description: description || `${selectedDmg?.vietnameseName} tại ${selectedLoc?.vietnameseName}`,
      severity,
      lengthMm: Number(lengthMm) || 0,
      widthMm: Number(widthMm) || 0,
      quantity: Number(quantity) || 1,
      photoUrl: photoUrl || '',
      createdBy: initialData?.createdBy || currentUser,
      createdAt: initialData?.createdAt || now
    };

    onSave(record);
    onClose();
  };

  const selectedRep = repairCodes.find((r) => r.repairCode === repairCode);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600/20 border border-rose-500/30 text-rose-400 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Chỉnh Sửa Tổn Thất (Edit Damage)' : 'Ghi Nhận Hư Hỏng / Tổn Thất Mới (Add Damage)'}
              </h3>
              <p className="text-xs text-slate-500">
                Tuân thủ quy chuẩn IICL-6 / MCIC và biểu mã sửa chữa STS quốc tế.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Location & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Vị Trí Hư Hỏng (Location)*
              </label>
              <select
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-rose-500 font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.code}>
                    {loc.code} - {loc.vietnameseName} ({loc.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mức Độ Nghiêm Trọng (Severity)*
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-rose-500 font-medium"
              >
                <option value="LOW">LOW (Nhẹ - Dung sai nhỏ)</option>
                <option value="MEDIUM">MEDIUM (Trung bình - Chờ duyệt)</option>
                <option value="HIGH">HIGH (Nặng - Cản trở đóng hàng)</option>
                <option value="CRITICAL">CRITICAL (Nghiêm trọng - Thủng lủng)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Damage Code & Repair Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mã Hư Hỏng (Damage Code - IICL)*
              </label>
              <select
                value={damageCode}
                onChange={(e) => setDamageCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-rose-700 font-mono font-bold focus:outline-none focus:border-rose-500"
              >
                {damageCodes.map((dmg) => (
                  <option key={dmg.id} value={dmg.code}>
                    {dmg.code} &bull; {dmg.vietnameseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mã Sửa Chữa Đề Xuất (Repair / STS Code)*
              </label>
              <select
                value={repairCode}
                onChange={(e) => setRepairCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-blue-700 font-mono font-bold focus:outline-none focus:border-rose-500"
              >
                {repairCodes.map((rep) => (
                  <option key={rep.id} value={rep.repairCode}>
                    {rep.repairCode} ({rep.stsCode}) &bull; {rep.vietnameseName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Repair Details helper card */}
          {selectedRep && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px] text-slate-500">
              <span>Định mức nhân công: <strong className="text-slate-900 font-mono">{selectedRep.labourHours}h</strong></span>
              <span>Đơn giá giờ: <strong className="text-slate-900 font-mono">{selectedRep.labourRate.toLocaleString('vi-VN')} đ/h</strong></span>
              <span>Vật tư ước tính: <strong className="text-amber-700 font-mono">{selectedRep.materialEstimatedCost.toLocaleString('vi-VN')} đ</strong></span>
            </div>
          )}

          {/* Row 3: Dimensions (Length, Width, Quantity) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Chiều Dài (Length mm)
              </label>
              <input
                type="number"
                value={lengthMm}
                onChange={(e) => setLengthMm(e.target.value)}
                placeholder="VD: 120"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Chiều Rộng (Width mm)
              </label>
              <input
                type="number"
                value={widthMm}
                onChange={(e) => setWidthMm(e.target.value)}
                placeholder="VD: 40"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Số Lượng (Quantity)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="VD: 1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Mô Tả Chi Tiết Tổn Thất*
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Rách vách tôn rãnh dọc 120x40mm tại sóng thứ 4 từ trước ra sau..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none resize-none"
            />
          </div>

          {/* Photo attachment URL */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" /> Hình Ảnh Tổn Thất (Photo URL / Upload)
              </span>
              <span className="text-slate-500 text-[10px]">Chụp ảnh tại hiện trường</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Đường dẫn ảnh hư hỏng (https://...)"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Tổn Thất' : 'Lưu Tổn Thất'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
