import React, { useState } from 'react';
import { RepairCodeMasterItem } from '../types';
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  DollarSign,
  Clock,
  Hammer,
  AlertTriangle
} from 'lucide-react';

interface RepairCodeMasterProps {
  repairCodes: RepairCodeMasterItem[];
  onUpdateRepairCodes: (codes: RepairCodeMasterItem[]) => void;
  // Component này dùng ở cả trang "Danh Mục Hệ Thống & Master Data" (MasterDataPage — lưu thật qua
  // masterDataApi) và tab Master Data cục bộ trong module Survey (SurveyModulePage — state cục bộ,
  // KHÔNG gọi API). Mặc định false để không lỡ ẩn cảnh báo ở nơi thực sự chưa lưu thật.
  persistedToBackend?: boolean;
}

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (nền trắng) theo yêu cầu người dùng.
export const RepairCodeMaster: React.FC<RepairCodeMasterProps> = ({
  repairCodes,
  onUpdateRepairCodes,
  persistedToBackend = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RepairCodeMasterItem | null>(null);

  // Form states
  const [repairCode, setRepairCode] = useState('');
  const [stsCode, setStsCode] = useState('');
  const [name, setName] = useState('');
  const [vietnameseName, setVietnameseName] = useState('');
  const [repairType, setRepairType] = useState<any>('PATCH');
  const [description, setDescription] = useState('');
  const [labourRate, setLabourRate] = useState('250000');
  const [labourHours, setLabourHours] = useState('1.5');
  const [materialEstimatedCost, setMaterialEstimatedCost] = useState('450000');

  const filtered = repairCodes.filter((item) => {
    const matchesSearch =
      item.repairCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stsCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.repairType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenModal = (item?: RepairCodeMasterItem) => {
    if (item) {
      setEditingItem(item);
      setRepairCode(item.repairCode);
      setStsCode(item.stsCode);
      setName(item.name);
      setVietnameseName(item.vietnameseName);
      setRepairType(item.repairType);
      setDescription(item.description);
      setLabourRate(item.labourRate.toString());
      setLabourHours(item.labourHours.toString());
      setMaterialEstimatedCost(item.materialEstimatedCost.toString());
    } else {
      setEditingItem(null);
      setRepairCode('');
      setStsCode('');
      setName('');
      setVietnameseName('');
      setRepairType('PATCH');
      setDescription('');
      setLabourRate('250000');
      setLabourHours('1.0');
      setMaterialEstimatedCost('300000');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairCode || !name || !vietnameseName) return;

    if (editingItem) {
      const updated = repairCodes.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              repairCode: repairCode.toUpperCase(),
              stsCode: stsCode.toUpperCase(),
              name,
              vietnameseName,
              repairType,
              description,
              labourRate: Number(labourRate) || 0,
              labourHours: Number(labourHours) || 0,
              materialEstimatedCost: Number(materialEstimatedCost) || 0
            }
          : item
      );
      onUpdateRepairCodes(updated);
    } else {
      const newItem: RepairCodeMasterItem = {
        id: 'REP-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        repairCode: repairCode.toUpperCase(),
        stsCode: stsCode.toUpperCase() || 'STS-' + Math.floor(100 + Math.random() * 900),
        name,
        vietnameseName,
        repairType,
        description,
        labourRate: Number(labourRate) || 0,
        labourHours: Number(labourHours) || 0,
        materialEstimatedCost: Number(materialEstimatedCost) || 0,
        status: 'ACTIVE'
      };
      onUpdateRepairCodes([...repairCodes, newItem]);
    }
    setShowModal(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = repairCodes.map((item) =>
      item.id === id ? { ...item, status: item.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const) } : item
    );
    onUpdateRepairCodes(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa Repair Code này khỏi Master Data?')) {
      onUpdateRepairCodes(repairCodes.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              Danh Mục Mã Sửa Chữa &amp; Biểu Giá STS (Repair Code Master)
            </h2>
            <p className="text-xs text-slate-500">
              Quy định phương án sửa chữa kỹ thuật (Hàn đắp, Gò nắn, Thay ván sàn, Thay gioăng ron) và định mức nhân công chuẩn depot.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Mã Sửa Chữa Mới</span>
        </button>
      </div>

      {!persistedToBackend && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Danh mục này hiện chỉ lưu tạm trong phiên làm việc trình duyệt — thêm/sửa/xóa sẽ mất khi tải lại trang hoặc đăng xuất, chưa đồng bộ xuống SQL Server.</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Repair Code, STS Code, Tên phương án sửa chữa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none"
          >
            <option value="ALL">Tất cả phương pháp sửa chữa</option>
            <option value="PATCH">Hàn đắp / Vá tôn (PATCH)</option>
            <option value="STRAIGHTEN">Gò nắn (STRAIGHTEN)</option>
            <option value="WELDING">Hàn ngấu (WELDING)</option>
            <option value="REPLACE">Thay thế mới (REPLACE)</option>
            <option value="WOOD_REPAIR">Sửa sàn gỗ (WOOD_REPAIR)</option>
            <option value="CLEANING">Vệ sinh / Rửa (CLEANING)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Tổng cộng: <strong className="text-slate-900">{filtered.length}</strong> Repair Codes
        </div>
      </div>

      {/* DataGrid */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Repair Code</th>
                <th className="py-3.5 px-4">Mã STS</th>
                <th className="py-3.5 px-4">Phương Pháp Sửa Chữa</th>
                <th className="py-3.5 px-4">Phương Án Chi Tiết (EN)</th>
                <th className="py-3.5 px-4 text-center">Định Mức Giờ (Hours)</th>
                <th className="py-3.5 px-4 text-right">Đơn Giá Giờ</th>
                <th className="py-3.5 px-4 text-right">Vật Tư Ước Tính</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-amber-700 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md">
                      {item.repairCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-700 px-2 py-0.5 bg-slate-100 rounded">
                      {item.stsCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{item.vietnameseName}</span>
                    <span className="text-[10px] text-slate-500">{item.repairType}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.labourHours} hrs
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {item.labourRate.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                    {item.materialEstimatedCost.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {item.status === 'ACTIVE' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> ÁP DỤNG
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> TẠM KHÓA
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer"
                        title="Sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <span>{editingItem ? 'Chỉnh Sửa Mã Sửa Chữa' : 'Thêm Mã Sửa Chữa Mới'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Sửa Chữa (Repair Code)*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: RP_PATCH_S"
                    value={repairCode}
                    onChange={(e) => setRepairCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-amber-700 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Chuẩn STS Quốc Tế</label>
                  <input
                    type="text"
                    placeholder="VD: STS-010"
                    value={stsCode}
                    onChange={(e) => setStsCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phương Pháp</label>
                  <select
                    value={repairType}
                    onChange={(e) => setRepairType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none font-medium"
                  >
                    <option value="PATCH">Hàn đắp / Vá (PATCH)</option>
                    <option value="STRAIGHTEN">Gò nắn (STRAIGHTEN)</option>
                    <option value="WELDING">Hàn kín (WELDING)</option>
                    <option value="REPLACE">Thay mới (REPLACE)</option>
                    <option value="WOOD_REPAIR">Sàn gỗ (WOOD_REPAIR)</option>
                    <option value="CLEANING">Rửa / Vệ sinh (CLEANING)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Tiếng Việt*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hàn đắp miếng thép bản nhỏ..."
                    value={vietnameseName}
                    onChange={(e) => setVietnameseName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Quốc Tế (EN)*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Steel Patch Insertion..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Định Mức Giờ (Hours)*</label>
                  <input
                    type="number"
                    step="0.1"
                    value={labourHours}
                    onChange={(e) => setLabourHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-blue-700 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Đơn Giá Nhân Công (đ/h)</label>
                  <input
                    type="number"
                    value={labourRate}
                    onChange={(e) => setLabourRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vật Tư Ước Tính (VND)</label>
                  <input
                    type="number"
                    value={materialEstimatedCost}
                    onChange={(e) => setMaterialEstimatedCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-amber-700 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mô Tả Quy Trình Kỹ Thuật</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả kỹ thuật thực hiện đảm bảo nghiệm thu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
