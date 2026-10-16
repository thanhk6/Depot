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
    <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full my-auto space-y-6 shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-pink-50 border border-pink-200 text-pink-600 rounded-2xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{gateIn.gateInNo}</h3>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-lg border ${
                    gateIn.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : gateIn.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : gateIn.status === 'INSPECTION' || gateIn.status === 'GATE_IN'
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-200 animate-pulse'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {gateIn.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chi tiết đăng ký Gate-In Online • Khách hàng: <strong className="text-slate-900">{gateIn.customerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQR(gateIn)}
              className="px-3 py-2 bg-pink-50 hover:bg-pink-50 text-pink-700 font-bold text-xs rounded-xl border border-pink-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Xem Mã QR</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Lifecycle Step Tracker */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-600" />
                <span>Tiến Trình Xử Lý Gate-In (6 Giai Đoạn)</span>
              </span>
              {isFailed && (
                <span className="text-rose-600 font-bold flex items-center gap-1">
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
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : isCurrent
                        ? 'bg-pink-50 border-pink-500 text-slate-900 shadow-lg '
                        : 'bg-white border-slate-200/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold">BƯỚC {idx + 1}</span>
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-pink-600 flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4" />
                <span>Thông Tin Container &amp; Hãng Tàu</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số Container:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                    {gateIn.containerNo}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Kích Cỡ &amp; Loại:</span>
                  <span className="font-bold text-slate-900">
                    {gateIn.size} ({gateIn.type}) • ISO: <strong className="font-mono text-pink-700">{gateIn.isoCode}</strong>
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Hãng Tàu:</span>
                  <span className="font-bold text-sky-600">{gateIn.shippingLine}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Số Booking / Lệnh:</span>
                  <span className="font-mono font-bold text-amber-700">{gateIn.bookingNo}</span>
                </div>

                {gateIn.sealNo && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số Niêm Phong (Seal):</span>
                    <span className="font-mono font-bold text-slate-700">{gateIn.sealNo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Driver & Vehicle Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-2 border-b border-slate-200 pb-2">
                <User className="w-4 h-4" />
                <span>Thông Tin Tài Xế &amp; Phương Tiện</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài Xế Phụ Trách:</span>
                  <span className="font-bold text-slate-900">{gateIn.driverName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Số Điện Thoại:</span>
                  <span className="font-mono font-bold text-emerald-600">{gateIn.driverPhone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Xe Đầu Kéo:</span>
                  <span className="font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {gateIn.vehiclePlate}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Rơ-Moóc:</span>
                  <span className="font-mono font-bold text-slate-700">{gateIn.moocPlate || '---'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Điểm Đến Tiếp Nhận:</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-600" />
                    {gateIn.depot}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Box 3: Appointment & Gate Operational Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 text-[11px] block">Lịch Hẹn Gate-In:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {gateIn.appointmentTime} - {gateIn.appointmentDate}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Nhân Viên Cổng / Giám Định:</span>
                <span className="font-bold text-slate-700">
                  {gateIn.gateOperator || 'Đang phân bổ luồng tự động'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Kết Quả Giám Định Vỏ:</span>
                <span className="font-semibold text-slate-700">
                  {gateIn.inspectionResult || 'Chờ container đến cổng'}
                </span>
              </div>
            </div>

            {gateIn.notes && (
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                Ghi chú điều hành: <span className="text-slate-700">{gateIn.notes}</span>
              </div>
            )}
          </div>

          {/* Box 4: Event Timeline */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-600" />
              <span>Nhật Ký Sự Kiện Thời Gian Thực (Audit Log)</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {gateIn.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-slate-200 pl-3 py-1">
                  <div className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.label}</span>
                      <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-0.5">{item.note}</p>
                    <span className="text-[10px] text-slate-500 font-mono">Người thực hiện: {item.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
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
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Gate-In</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
