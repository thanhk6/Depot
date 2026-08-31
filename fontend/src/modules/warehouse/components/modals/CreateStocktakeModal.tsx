import React, { useState } from 'react';
import { MaterialGroup } from '../../types';
import { X, ClipboardCheck, Plus, CheckCircle2 } from 'lucide-react';

interface CreateStocktakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialGroups: MaterialGroup[];
  onConfirmStocktake: (title: string, notes: string, countedBy: string, groupFilter: string) => void;
}

export const CreateStocktakeModal: React.FC<CreateStocktakeModalProps> = ({
  isOpen,
  onClose,
  materialGroups = [],
  onConfirmStocktake
}) => {
  const [title, setTitle] = useState<string>(
    `Kiểm Kê Kho Định Kỳ Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`
  );
  const [notes, setNotes] = useState<string>('Kiểm đếm 100% các mặt hàng trong Kho Vật Tư Sửa Chữa EMR');
  const [countedBy, setCountedBy] = useState<string>('Trần Văn Mạnh (Thủ kho EMR)');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirmStocktake(title.trim(), notes.trim(), countedBy.trim(), groupFilter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Khởi Tạo Đợt Kiểm Kê Kho (STK)</h2>
              <p className="text-xs text-slate-400">
                Kho kiểm kê: <span className="text-amber-400 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Tiêu Đề / Đợt Kiểm Kê <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phạm Vi Nhóm Vật Tư</label>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="ALL">-- Tất Cả Các Nhóm (Toàn Kho) --</option>
                {materialGroups.map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.code} - {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Người Thực Hiện Kiểm Đếm <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={countedBy}
                onChange={(e) => setCountedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Ghi Chú & Mục Tiêu Kiểm Kê</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Kiểm đếm chốt số lượng trước khi chốt kỳ kế toán..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl text-purple-300 text-xs">
            <p className="font-semibold mb-1">Quy trình kiểm kê 5 bước chuẩn EMR:</p>
            <p className="text-[11px] text-slate-400">
              DRAFT (Nháp) → COUNTING (Đang đếm) → REVIEW (Đối soát) → APPROVED (Duyệt) → POSTED (Chốt cập nhật tồn kho).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Khởi Tạo Phiếu Kiểm Kê</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
