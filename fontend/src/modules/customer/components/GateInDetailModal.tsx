import React from 'react';
import {
  X,
  QrCode,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Calendar,
  FileText,
  User,
  ShieldCheck,
  Printer,
  Share2,
  Download,
  Check,
  ChevronRight,
  MapPin,
  Barcode
} from 'lucide-react';
import { GateInRegistration, GateInStatus } from '../types/customerPortal';

interface GateInDetailModalProps {
  gateIn: GateInRegistration;
  onClose: () => void;
  onOpenQR: (gateIn: GateInRegistration) => void;
  onUpdateStatus?: (id: string, newStatus: GateInStatus) => void;
}

const LIFECYCLE_STEPS: { key: GateInStatus; label: string; desc: string }[] = [
  { key: 'PENDING', label: '1. Đăng Ký Online', desc: 'Tài xế khai báo thông tin' },
  { key: 'CONFIRMED', label: '2. Phê Duyệt Lịch Hẹn', desc: 'Khớp Booking & Cấp QR' },
  { key: 'ARRIVED', label: '3. Đến Cổng Depot', desc: 'Quét mã QR tại cổng' },
  { key: 'INSPECTION', label: '4. Giám Định Vỏ IICL', desc: 'Kiểm tra tình trạng vỏ' },
  { key: 'GATE_IN', label: '5. Qua Barie Vào Bãi', desc: 'Cấp phiếu e-EIR hạ bãi' },
  { key: 'COMPLETED', label: '6. Hoàn Thành', desc: 'Hạ bãi & Cập nhật vị trí' }
];

export const GateInDetailModal: React.FC<GateInDetailModalProps> = ({
  gateIn,
  onClose,
  onOpenQR,
  onUpdateStatus
}) => {
  const getStepIndex = (status: GateInStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'ARRIVED':
        return 2;
      case 'INSPECTION':
        return 3;
      case 'GATE_IN':
        return 4;
      case 'COMPLETED':
        return 5;
      case 'REJECTED':
      case 'CANCELLED':
        return 2; // failed during gate
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(gateIn.status);
  const isFailed = gateIn.status === 'REJECTED' || gateIn.status === 'CANCELLED';

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full my-auto space-y-6 shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-pink-600/20 border border-pink-500/30 text-pink-400 rounded-2xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{gateIn.gateInNo}</h3>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-lg border ${
                    gateIn.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : gateIn.status === 'REJECTED'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : gateIn.status === 'INSPECTION' || gateIn.status === 'GATE_IN'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {gateIn.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chi tiết đăng ký Gate-In Online • Khách hàng: <strong className="text-white">{gateIn.customerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQR(gateIn)}
              className="px-3 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 font-bold text-xs rounded-xl border border-pink-500/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Xem Mã QR</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Lifecycle Step Tracker */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                <span>Tiến Trình Xử Lý Gate-In (6 Giai Đoạn)</span>
              </span>
              {isFailed && (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{gateIn.status === 'REJECTED' ? 'BỊ TỪ CHỐI TIẾP NHẬN' : 'ĐÃ HỦY LỆNH'}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = !isFailed && idx < currentStepIdx;
                const isCurrent = !isFailed && idx === currentStepIdx;
                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-xl border text-left transition ${
                      isPassed
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : isCurrent
                        ? 'bg-pink-950/60 border-pink-500 text-white shadow-lg shadow-pink-950/50'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold">BƯỚC {idx + 1}</span>
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                      ) : null}
                    </div>
                    <div className="text-xs font-bold truncate">{step.label.replace(/^\d+\.\s*/, '')}</div>
                    <div className="text-[10px] opacity-75 truncate">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 1: Container & Booking Details */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-pink-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4" />
                <span>Thông Tin Container &amp; Hãng Tàu</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Số Container:</span>
                  <span className="font-mono font-bold text-white text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {gateIn.containerNo}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Kích Cỡ &amp; Loại:</span>
                  <span className="font-bold text-white">
                    {gateIn.size} ({gateIn.type}) • ISO: <strong className="font-mono text-pink-300">{gateIn.isoCode}</strong>
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Hãng Tàu:</span>
                  <span className="font-bold text-sky-400">{gateIn.shippingLine}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Số Booking / Lệnh:</span>
                  <span className="font-mono font-bold text-amber-300">{gateIn.bookingNo}</span>
                </div>

                {gateIn.sealNo && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số Niêm Phong (Seal):</span>
                    <span className="font-mono font-bold text-slate-200">{gateIn.sealNo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Driver & Vehicle Details */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                <User className="w-4 h-4" />
                <span>Thông Tin Tài Xế &amp; Phương Tiện</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tài Xế Phụ Trách:</span>
                  <span className="font-bold text-white">{gateIn.driverName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Số Điện Thoại:</span>
                  <span className="font-mono font-bold text-emerald-400">{gateIn.driverPhone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Xe Đầu Kéo:</span>
                  <span className="font-mono font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {gateIn.vehiclePlate}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Rơ-Moóc:</span>
                  <span className="font-mono font-bold text-slate-200">{gateIn.moocPlate || '---'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Điểm Đến Tiếp Nhận:</span>
                  <span className="font-bold text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-400" />
                    {gateIn.depot}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Box 3: Appointment & Gate Operational Details */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 text-[11px] block">Lịch Hẹn Gate-In:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {gateIn.appointmentTime} - {gateIn.appointmentDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Nhân Viên Cổng / Giám Định:</span>
                <span className="font-bold text-slate-200">
                  {gateIn.gateOperator || 'Đang phân bổ luồng tự động'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Kết Quả Giám Định Vỏ:</span>
                <span className="font-semibold text-slate-300">
                  {gateIn.inspectionResult || 'Chờ container đến cổng'}
                </span>
              </div>
            </div>

            {gateIn.notes && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Ghi chú điều hành: <span className="text-slate-200">{gateIn.notes}</span>
              </div>
            )}
          </div>

          {/* Box 4: Event Timeline */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <span>Nhật Ký Sự Kiện Thời Gian Thực (Audit Log)</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {gateIn.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-slate-800 pl-3 py-1">
                  <div className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{item.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">{item.note}</p>
                    <span className="text-[10px] text-slate-500 font-mono">Người thực hiện: {item.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQR(gateIn)}
              className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Hiển Thị Thẻ QR E-Gate</span>
            </button>
            <button
              onClick={() => alert(`Đã gửi lệnh in phiếu Gate-In ${gateIn.gateInNo}`)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Gate-In</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
