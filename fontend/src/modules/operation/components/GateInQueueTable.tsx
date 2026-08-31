import React from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import {
  Truck,
  FileCheck,
  Receipt,
  ShieldCheck,
  Droplets,
  Wrench,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface GateInQueueTableProps {
  containers: ContainerRecord[];
  existingOrders: { containerNo: string; orderNo: string; paymentStatus: string }[];
  onOpenCreateTicket: (container: ContainerRecord) => void;
  onViewExistingTicket: (orderNo: string) => void;
}

export const GateInQueueTable: React.FC<GateInQueueTableProps> = ({
  containers,
  existingOrders,
  onOpenCreateTicket,
  onViewExistingTicket
}) => {
  const getConditionBadge = (condition: 'AV' | 'CL' | 'DM') => {
    switch (condition) {
      case 'AV':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AV — Chuẩn Cấp Đóng Hàng</span>
          </span>
        );
      case 'CL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm">
            <Droplets className="w-3.5 h-3.5" />
            <span>CL — Cần Xịt Rửa Vệ Sinh</span>
          </span>
        );
      case 'DM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <Wrench className="w-3.5 h-3.5" />
            <span>DM — Hư Hỏng IICL Báo Giá EMR</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Intro banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Hàng Đợi Tiếp Nhận Từ Giám Định ({containers.length} Container)
            </h4>
            <p className="text-xs text-slate-500">
              Nhân viên khai thác tiếp nhận kết quả Giám định e-EIR để áp biểu cước nâng hạ & lập Phiếu dịch vụ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Tự động đồng bộ từ Mobile Giám định IICL</span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Container & Hãng Tàu</th>
              <th className="py-3 px-4">Loại & Kích Thước</th>
              <th className="py-3 px-4">Kết Quả Giám Định</th>
              <th className="py-3 px-4">Tài Xế & Biển Số Xe</th>
              <th className="py-3 px-4">Thời Gian Gate-In</th>
              <th className="py-3 px-4 text-center">Trạng Thái Phiếu</th>
              <th className="py-3 px-4 text-right">Thao Tác Khai Thác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {containers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Không có container nào đang chờ khai thác gate-in
                </td>
              </tr>
            ) : (
              containers.map((cont) => {
                const existing = existingOrders.find((o) => o.containerNo === cont.containerNo);

                return (
                  <tr key={cont.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{cont.containerNo}</span>
                      </div>
                      <div className="text-[11px] text-cyan-700 font-semibold">
                        Hãng tàu: {cont.shippingLine}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{cont.size} - {cont.type}</div>
                      <div className="font-mono text-[11px] text-slate-500">ISO: {cont.isoCode || '45G1'}</div>
                    </td>

                    <td className="py-3 px-4 space-y-1">
                      <div>{getConditionBadge(cont.condition)}</div>
                      {cont.surveyDetails?.surveyorName && (
                        <div className="text-[11px] text-slate-500">
                          GĐV: {cont.surveyDetails.surveyorName}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{cont.driverName || 'Khách Lẻ'}</div>
                      <div className="font-mono text-amber-700 font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>{cont.licensePlate || '51C-000.00'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cont.gateInDate}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {existing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã Lập #{existing.orderNo}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Chưa Lập Phiếu</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {existing ? (
                        <button
                          onClick={() => onViewExistingTicket(existing.orderNo)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-cyan-700 hover:text-cyan-800 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Xem Phiếu</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenCreateTicket(cont)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Lập Phiếu Dịch Vụ</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
