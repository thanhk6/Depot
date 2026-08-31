import React, { useState } from 'react';
import { InspectionStandardMasterItem } from '../types';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileCheck,
  Layers,
  AlertTriangle
} from 'lucide-react';

interface InspectionStandardMasterProps {
  standards: InspectionStandardMasterItem[];
  onUpdateStandards: (standards: InspectionStandardMasterItem[]) => void;
  // Component này dùng ở cả trang "Danh Mục Hệ Thống & Master Data" (MasterDataPage — lưu thật qua
  // masterDataApi) và tab Master Data cục bộ trong module Survey (SurveyModulePage — state cục bộ,
  // KHÔNG gọi API). Mặc định false để không lỡ ẩn cảnh báo ở nơi thực sự chưa lưu thật.
  persistedToBackend?: boolean;
}

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (nền trắng) theo yêu cầu người dùng.
export const InspectionStandardMaster: React.FC<InspectionStandardMasterProps> = ({
  standards,
  onUpdateStandards,
  persistedToBackend = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InspectionStandardMasterItem | null>(null);

  // Form states
  const [standardCode, setStandardCode] = useState('');
  const [standardName, setStandardName] = useState('');
  const [shippingLine, setShippingLine] = useState('');
  const [containerType, setContainerType] = useState('ALL');
  const [containerSize, setContainerSize] = useState('ALL');
  const [version, setVersion] = useState('Edition 6.2');
  const [effectiveDate, setEffectiveDate] = useState('2025-01-01');
  const [description, setDescription] = useState('');

  const filtered = standards.filter((item) => {
    return (
      item.standardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.standardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shippingLine.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenModal = (item?: InspectionStandardMasterItem) => {
    if (item) {
      setEditingItem(item);
      setStandardCode(item.standardCode);
      setStandardName(item.standardName);
      setShippingLine(item.shippingLine);
      setContainerType(item.containerType);
      setContainerSize(item.containerSize);
      setVersion(item.version);
      setEffectiveDate(item.effectiveDate);
      setDescription(item.description);
    } else {
      setEditingItem(null);
      setStandardCode('');
      setStandardName('');
      setShippingLine('MAERSK, MSC, ONE, CMA-CGM');
      setContainerType('ALL');
      setContainerSize('ALL');
      setVersion('Edition 6.2 (2026)');
      setEffectiveDate('2026-01-01');
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardCode || !standardName) return;

    if (editingItem) {
      const updated = standards.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              standardCode: standardCode.toUpperCase(),
              standardName,
              shippingLine,
              containerType,
              containerSize,
              version,
              effectiveDate,
              description
            }
          : item
      );
      onUpdateStandards(updated);
    } else {
      const newItem: InspectionStandardMasterItem = {
        id: 'STD-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        standardCode: standardCode.toUpperCase(),
        standardName,
        shippingLine,
        containerType,
        containerSize,
        version,
        effectiveDate,
        description,
        status: 'ACTIVE'
      };
      onUpdateStandards([...standards, newItem]);
    }
    setShowModal(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = standards.map((item) =>
      item.id === id ? { ...item, status: item.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const) } : item
    );
    onUpdateStandards(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa Tiêu Chuẩn Giám Định này khỏi hệ thống?')) {
      onUpdateStandards(standards.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              Danh Mục Tiêu Chuẩn Giám Định (Inspection Standard Master)
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý các bộ quy chuẩn kỹ thuật quốc tế và quy định riêng của hãng tàu (IICL-6, MCIC, MRIC, Carrier Rules).
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Tiêu Chuẩn Mới</span>
        </button>
      </div>

      {!persistedToBackend && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Danh mục này hiện chỉ lưu tạm trong phiên làm việc trình duyệt — thêm/sửa/xóa sẽ mất khi tải lại trang hoặc đăng xuất, chưa đồng bộ xuống SQL Server.</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Mã Chuẩn (IICL-6, MCIC...), Tên tiêu chuẩn, Hãng tàu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Tổng cộng: <strong className="text-slate-900">{filtered.length}</strong> Tiêu Chuẩn
        </div>
      </div>

      {/* DataGrid */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Mã Tiêu Chuẩn</th>
                <th className="py-3.5 px-4">Tên Bộ Tiêu Chuẩn</th>
                <th className="py-3.5 px-4">Hãng Tàu Áp Dụng</th>
                <th className="py-3.5 px-4">Phiên Bản / Hiệu Lực</th>
                <th className="py-3.5 px-4">Quy Định Dung Sai Kỹ Thuật</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md">
                      {item.standardCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.standardName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs">
                    {item.shippingLine}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="text-slate-900 font-medium block">{item.version}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Từ ngày: {item.effectiveDate}</span>
                    </div>
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span>{editingItem ? 'Chỉnh Sửa Tiêu Chuẩn Giám Định' : 'Thêm Tiêu Chuẩn Giám Định Mới'}</span>
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Chuẩn (Standard Code)*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: IICL-6, MCIC"
                    value={standardCode}
                    onChange={(e) => setStandardCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-blue-700 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phiên Bản (Version)</label>
                  <input
                    type="text"
                    placeholder="VD: Edition 6.2 (2026)"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Tiêu Chuẩn*</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tiêu chuẩn Viện Giám định Container Quốc tế (IICL-6)..."
                  value={standardName}
                  onChange={(e) => setStandardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hãng Tàu Áp Dụng</label>
                  <input
                    type="text"
                    placeholder="VD: MAERSK, MSC, ONE..."
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ngày Bắt Đầu Hiệu Lực</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mô Tả Quy Định Kỹ Thuật</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả quy tắc dung sai kích thước móp, lủng, yêu cầu kiểm tra ánh sáng kín nước..."
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
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
