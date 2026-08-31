import React from 'react';
import { DamageRecord } from '../types';
import {
  Wrench,
  Trash2,
  Edit2,
  Eye,
  Camera,
  Plus,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

interface DamageListTableProps {
  damages: DamageRecord[];
  onAddDamage: () => void;
  onEditDamage: (damage: DamageRecord) => void;
  onDeleteDamage: (id: string) => void;
  onViewPhoto: (photoUrl: string, caption: string) => void;
}

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (nền trắng + card trắng) theo yêu cầu người
// dùng — xem SurveyDetailForm.tsx (component cha render bảng này ngay trong tab Tổn Thất).
export const DamageListTable: React.FC<DamageListTableProps> = ({
  damages,
  onAddDamage,
  onEditDamage,
  onDeleteDamage,
  onViewPhoto
}) => {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-600/20 border border-rose-500/30 text-rose-400 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Danh Sách Tổn Thất Đã Ghi Nhận (Survey Damage Records)</span>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-mono text-[11px] font-bold rounded-full border border-rose-200">
                {damages.length} Tổn thất
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Chi tiết các hạng mục hư hỏng phục vụ chuyển tiếp Báo giá EMR và Phê duyệt hãng tàu.
            </p>
          </div>
        </div>

        <button
          onClick={onAddDamage}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Damage Mới</span>
        </button>
      </div>

      {/* Table / Empty State */}
      {damages.length === 0 ? (
        <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Chưa có tổn thất nào được ghi nhận</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Nếu container đạt chuẩn (AV) hoặc chỉ cần vệ sinh (CL), bạn có thể chuyển thẳng sang bước phân loại Grade.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3">Vị Trí (Location)</th>
                <th className="py-3 px-3">Mã Hư Hỏng (Damage)</th>
                <th className="py-3 px-3">Mã Sửa Chữa (Repair/STS)</th>
                <th className="py-3 px-3">Kích Thước / Mô Tả</th>
                <th className="py-3 px-3 text-center">Mức Độ</th>
                <th className="py-3 px-3 text-center">Ảnh</th>
                <th className="py-3 px-3">Người Tạo / Thời Gian</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {damages.map((dmg, idx) => (
                <tr key={dmg.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">{dmg.locationName}</span>
                    <span className="text-[10px] font-mono text-slate-500">[{dmg.locationCode}]</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-rose-600 block">{dmg.damageCode}</span>
                    <span className="text-[11px] text-slate-700">{dmg.damageName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-blue-600 block">{dmg.repairCode}</span>
                    <span className="text-[11px] text-slate-700">{dmg.repairName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <span className="text-slate-700 line-clamp-2">{dmg.description}</span>
                      {(dmg.lengthMm || dmg.widthMm) && (
                        <span className="text-[10px] font-mono text-amber-700 block">
                          KT: {dmg.lengthMm} x {dmg.widthMm} mm (SL: {dmg.quantity || 1})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        dmg.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-800 border-rose-300 font-black animate-pulse'
                          : dmg.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : dmg.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {dmg.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {dmg.photoUrl ? (
                      <button
                        onClick={() => onViewPhoto(dmg.photoUrl!, `${dmg.damageCode} - ${dmg.locationName}`)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-blue-600 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        title="Xem ảnh tổn thất"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono">1 Ảnh</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">Chưa có</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-500">
                    <span className="text-slate-700 font-medium block">{dmg.createdBy}</span>
                    <span className="font-mono text-[10px]">{dmg.createdAt}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditDamage(dmg)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer"
                        title="Chỉnh sửa tổn thất"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDamage(dmg.id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Xóa tổn thất"
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
      )}
    </div>
  );
};
