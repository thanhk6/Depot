import React, { useState } from 'react';
import { DamageCodeMasterItem } from '../types';
import {
  FileCode,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface DamageCodeMasterProps {
  damageCodes: DamageCodeMasterItem[];
  onUpdateDamageCodes: (codes: DamageCodeMasterItem[]) => void;
  // Component này dùng ở cả trang "Danh Mục Hệ Thống & Master Data" (MasterDataPage — lưu thật qua
  // masterDataApi) và tab Master Data cục bộ trong module Survey (SurveyModulePage — state cục bộ,
  // KHÔNG gọi API). Mặc định false để không lỡ ẩn cảnh báo ở nơi thực sự chưa lưu thật.
  persistedToBackend?: boolean;
}

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (nền trắng) theo yêu cầu người dùng.
export const DamageCodeMaster: React.FC<DamageCodeMasterProps> = ({
  damageCodes,
  onUpdateDamageCodes,
  persistedToBackend = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [standardFilter, setStandardFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DamageCodeMasterItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [vietnameseName, setVietnameseName] = useState('');
  const [damageType, setDamageType] = useState<any>('CUT');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<any>('HIGH');
  const [standard, setStandard] = useState<any>('IICL-6');

  const filtered = damageCodes.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.damageType === typeFilter;
    const matchesStd = standardFilter === 'ALL' || item.standard === standardFilter;
    return matchesSearch && matchesType && matchesStd;
  });

  const handleOpenModal = (item?: DamageCodeMasterItem) => {
    if (item) {
      setEditingItem(item);
      setCode(item.code);
      setName(item.name);
      setVietnameseName(item.vietnameseName);
      setDamageType(item.damageType);
      setDescription(item.description);
      setSeverity(item.severity);
      setStandard(item.standard);
    } else {
      setEditingItem(null);
      setCode('');
      setName('');
      setVietnameseName('');
      setDamageType('CUT');
      setDescription('');
      setSeverity('HIGH');
      setStandard('IICL-6');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !vietnameseName) return;

    if (editingItem) {
      const updated = damageCodes.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              code: code.toUpperCase(),
              name,
              vietnameseName,
              damageType,
              description,
              severity,
              standard
            }
          : item
      );
      onUpdateDamageCodes(updated);
    } else {
      const newItem: DamageCodeMasterItem = {
        id: 'DMG-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        code: code.toUpperCase(),
        name,
        vietnameseName,
        damageType,
        description,
        severity,
        standard,
        status: 'ACTIVE'
      };
      onUpdateDamageCodes([...damageCodes, newItem]);
    }
    setShowModal(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = damageCodes.map((item) =>
      item.id === id ? { ...item, status: item.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const) } : item
    );
    onUpdateDamageCodes(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa Damage Code này khỏi Master Data?')) {
      onUpdateDamageCodes(damageCodes.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600/20 border border-rose-500/30 text-rose-400 rounded-2xl">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              Danh Mục Mã Hư Hỏng Container (Damage Code Master)
            </h2>
            <p className="text-xs text-slate-500">
              Quy chuẩn quốc tế mã hóa loại tổn thất (CUT, HOLE, DENT, BENT, CORROSION, GASKET...) theo IICL-6 &amp; MCIC.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Damage Code Mới</span>
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
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Mã Damage (CUT, DENT, HOLE...), Tên tiếng Việt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-rose-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none"
          >
            <option value="ALL">Tất cả dạng tổn thất</option>
            <option value="CUT">Rách / Cắt (CUT)</option>
            <option value="HOLE">Lỗ thủng (HOLE)</option>
            <option value="DENT">Móp lõm (DENT)</option>
            <option value="BENT">Cong vênh (BENT)</option>
            <option value="CORROSION">Rỉ sét (CORROSION)</option>
            <option value="DELAMINATION">Tách lớp sàn (DELAMINATION)</option>
            <option value="BROKEN">Gãy hỏng (BROKEN)</option>
          </select>

          <select
            value={standardFilter}
            onChange={(e) => setStandardFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none"
          >
            <option value="ALL">Tất cả chuẩn giám định</option>
            <option value="IICL-6">IICL-6 (Quốc tế)</option>
            <option value="MCIC">MCIC (Châu Á)</option>
            <option value="UNIVERSAL">UNIVERSAL (Chung)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Tổng cộng: <strong className="text-slate-900">{filtered.length}</strong> Damage Codes
        </div>
      </div>

      {/* DataGrid */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Mã Damage</th>
                <th className="py-3.5 px-4">Tên Tiếng Việt</th>
                <th className="py-3.5 px-4">Tên Quốc Tế (EN)</th>
                <th className="py-3.5 px-4">Phân Loại Dạng Tổn Thất</th>
                <th className="py-3.5 px-4 text-center">Tiêu Chuẩn</th>
                <th className="py-3.5 px-4 text-center">Mức Độ</th>
                <th className="py-3.5 px-4">Mô Tả Quy Định IICL</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-rose-700 px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md">
                      {item.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.vietnameseName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.damageType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono text-[11px] font-bold text-blue-700">
                      {item.standard}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-800 border-rose-300 font-black'
                          : item.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {item.description}
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
                          <XCircle className="w-3 h-3" /> KHÓA
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-rose-400" />
                <span>{editingItem ? 'Chỉnh Sửa Damage Code' : 'Thêm Damage Code Mới'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Damage (Code)*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: CUT, HOLE, DENT"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-rose-700 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dạng Tổn Thất</label>
                  <select
                    value={damageType}
                    onChange={(e) => setDamageType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none font-medium"
                  >
                    <option value="CUT">Rách / Cắt (CUT)</option>
                    <option value="HOLE">Lỗ thủng (HOLE)</option>
                    <option value="DENT">Móp lõm (DENT)</option>
                    <option value="BENT">Cong vênh (BENT)</option>
                    <option value="CORROSION">Rỉ sét (CORROSION)</option>
                    <option value="DELAMINATION">Tách lớp sàn (DELAMINATION)</option>
                    <option value="BROKEN">Gãy hỏng (BROKEN)</option>
                    <option value="OTHER">Khác (OTHER)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Tiếng Việt*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Rách / Thủng vách tôn..."
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
                    placeholder="VD: Cut / Punctured..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mức Độ Nghiêm Trọng</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none font-medium"
                  >
                    <option value="LOW">LOW (Nhẹ)</option>
                    <option value="MEDIUM">MEDIUM (Trung bình)</option>
                    <option value="HIGH">HIGH (Nặng)</option>
                    <option value="CRITICAL">CRITICAL (Nghiêm trọng)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tiêu Chuẩn Giám Định</label>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none font-medium"
                  >
                    <option value="IICL-6">IICL-6</option>
                    <option value="MCIC">MCIC</option>
                    <option value="MRIC">MRIC</option>
                    <option value="UNIVERSAL">UNIVERSAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mô Tả Quy Định IICL</label>
                <textarea
                  rows={2}
                  placeholder="Quy định dung sai kích thước và điều kiện kết luận hư hỏng..."
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
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
