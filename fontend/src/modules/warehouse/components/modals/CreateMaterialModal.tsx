import React, { useState, useEffect } from 'react';
import { Material, MaterialGroupCode, MaterialType, MaterialUnit } from '../../types';
import { X, Package, Save, CheckCircle2 } from 'lucide-react';
import { formatVND } from '../../../../utils/format';

interface CreateMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mat: Partial<Material>) => Promise<{ success: boolean; error?: string }>;
  editMaterial?: Material | null;
}

export const CreateMaterialModal: React.FC<CreateMaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editMaterial
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [group, setGroup] = useState<MaterialGroupCode>('DOOR');
  const [type, setType] = useState<MaterialType>('PART');
  const [unit, setUnit] = useState<MaterialUnit>('PCS');
  const [specification, setSpecification] = useState('');
  const [brand, setBrand] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [barcode, setBarcode] = useState('');
  const [minStock, setMinStock] = useState(5);
  const [maxStock, setMaxStock] = useState(50);
  const [reorderLevel, setReorderLevel] = useState(10);
  const [averageCost, setAverageCost] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editMaterial) {
      setCode(editMaterial.materialCode);
      setName(editMaterial.materialName);
      setGroup(editMaterial.materialGroupId);
      setType(editMaterial.materialType);
      setUnit(editMaterial.unit);
      setSpecification(editMaterial.specification || '');
      setBrand(editMaterial.brand || '');
      setManufacturer(editMaterial.manufacturer || '');
      setBarcode(editMaterial.barcode || '');
      setMinStock(editMaterial.minimumStock);
      setMaxStock(editMaterial.maximumStock);
      setReorderLevel(editMaterial.reorderLevel);
      setAverageCost(editMaterial.averageCost);
    } else {
      setCode(`MAT-${Date.now().toString().slice(-4)}`);
      setName('');
      setGroup('DOOR');
      setType('PART');
      setUnit('PCS');
      setSpecification('');
      setBrand('');
      setManufacturer('');
      setBarcode('');
      setMinStock(5);
      setMaxStock(50);
      setReorderLevel(10);
      setAverageCost(0);
    }
  }, [editMaterial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    // Chờ kết quả THẬT từ backend trước khi đóng modal — trước đây gọi onSave() (fire-and-forget) rồi
    // đóng modal ngay lập tức, lỗi trùng mã vật tư/validate chỉ log console, người dùng tưởng đã lưu
    // thành công trong khi thực tế vật tư không hề được tạo/cập nhật.
    const result = await onSave({
      id: editMaterial?.id,
      materialCode: code.toUpperCase().trim(),
      materialName: name.trim(),
      materialGroupId: group,
      materialType: type,
      unit,
      specification,
      brand,
      manufacturer,
      barcode,
      minimumStock: Number(minStock),
      maximumStock: Number(maxStock),
      reorderLevel: Number(reorderLevel),
      averageCost: Number(averageCost),
      lastPurchaseCost: Number(averageCost),
      isActive: true
    });
    setIsSubmitting(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Lưu vật tư thất bại do lỗi dữ liệu.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editMaterial ? 'Cập Nhật Danh Mục Vật Tư' : 'Thêm Mới Vật Tư Sửa Chữa EMR'}
              </h2>
              <p className="text-xs text-slate-500">
                Kho vật tư duy nhất: KHO VẬT TƯ SỬA CHỮA EMR (ID: 1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 whitespace-pre-line font-medium">
              {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Mã Vật Tư <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: MAT-LOCK-001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Tên Vật Tư Container <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Bộ Khóa Cửa Container Hoàn Chỉnh"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nhóm Cấu Kiện</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as MaterialGroupCode)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
              >
                <option value="DOOR">DOOR (Cửa container)</option>
                <option value="FLOOR">FLOOR (Ván sàn)</option>
                <option value="SIDE_PANEL">SIDE_PANEL (Tôn vách)</option>
                <option value="ROOF">ROOF (Tôn nóc)</option>
                <option value="LOCK">LOCK (Bộ khóa)</option>
                <option value="RUBBER">RUBBER (Gioăng cao su)</option>
                <option value="PAINT">PAINT (Sơn & phủ)</option>
                <option value="WELDING">WELDING (Que hàn, khí)</option>
                <option value="ELECTRICAL">ELECTRICAL (Điện lạnh)</option>
                <option value="CONSUMABLE">CONSUMABLE (Tiêu hao, keo)</option>
                <option value="OTHER">OTHER (Khác, gù ISO)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Loại Vật Tư</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaterialType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
              >
                <option value="PART">PART (Phụ tùng thay thế)</option>
                <option value="MATERIAL">MATERIAL (Vật liệu chính)</option>
                <option value="CONSUMABLE">CONSUMABLE (Vật tư tiêu hao)</option>
                <option value="TOOL">TOOL (Dụng cụ)</option>
                <option value="OTHER">OTHER (Khác)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Đơn Vị Tính</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MaterialUnit)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none font-semibold text-amber-700"
              >
                <option value="PCS">PCS (Cái / Chiếc)</option>
                <option value="SET">SET (Bộ)</option>
                <option value="SHEET">SHEET (Tấm)</option>
                <option value="KG">KG (Kilogam)</option>
                <option value="LITER">LITER (Lít)</option>
                <option value="CAN">CAN (Thùng / Can)</option>
                <option value="BOX">BOX (Hộp)</option>
                <option value="METER">METER (Mét)</option>
                <option value="ROLL">ROLL (Cuộn)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Quy Cách Kỹ Thuật (Specification)</label>
            <textarea
              rows={2}
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              placeholder="VD: Thép Corten-A dày 1.6mm x 1140 x 2400mm tiêu chuẩn IICL-6..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Thương Hiệu (Brand)</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="VD: CIMCO, Jotun, Hòa Phát"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nhà Sản Xuất (Manufacturer)</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="VD: CIMCO Machinery Co."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Mã Vạch / Barcode</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="8936..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-semibold text-amber-600 text-xs uppercase tracking-wider">
              Định Mức Tồn & Đơn Giá Bình Quân (VND)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Tồn Tối Thiểu</label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Tồn Tối Đa</label>
                <input
                  type="number"
                  min="1"
                  value={maxStock}
                  onChange={(e) => setMaxStock(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-amber-700 text-[11px] font-semibold mb-1">Mức Đặt Hàng Lại</label>
                <input
                  type="number"
                  min="1"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(Number(e.target.value))}
                  className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-700 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-emerald-600 text-[11px] font-semibold mb-1">Đơn Giá Bình Quân</label>
                <input
                  type="number"
                  step="1000"
                  value={averageCost}
                  onChange={(e) => setAverageCost(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-emerald-700 font-mono font-bold"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              * Khi Tồn khả dụng ≤ <span className="text-amber-700 font-bold">{reorderLevel}</span> hệ thống sẽ phát cảnh báo <span className="text-amber-600 font-bold">LOW STOCK</span> trên Dashboard.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg  transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'ĐANG GHI SQL SERVER...' : editMaterial ? 'Lưu Cập Nhật' : 'Tạo Vật Tư'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
