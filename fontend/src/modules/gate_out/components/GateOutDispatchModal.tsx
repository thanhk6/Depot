import React, { useState } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  Ship,
  MapPin,
  ShieldCheck,
  FileText,
  User,
  Phone,
  Building2,
  Barcode,
  Calendar,
  AlertCircle,
  Sparkles,
  Zap,
  Printer,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { GateOutContainerRecord } from '../types/gateOut';
import { GateOutStorageFee } from './GateOutStorageFee';

interface GateOutDispatchModalProps {
  container: GateOutContainerRecord;
  onClose: () => void;
  onConfirmGateOut: (
    containerId: string,
    dispatchData: {
      bookingNo: string;
      truckPlate: string;
      chassisPlate: string;
      driverName: string;
      driverPhone: string;
      driverIdCard?: string;
      truckingCompany: string;
      sealNo?: string;
      destinationPort?: string;
      forkliftOperator: string;
      gateLane: string;
      note?: string;
      withoutBooking?: boolean;
      noBookingReason?: string;
      noBookingNote?: string;
    }
  ) => void;
  /** Tài khoản có quyền `operation` (cấp vỏ theo booking) — giám sát thường không có. */
  canGateOutWithBooking: boolean;
  /** Tài khoản có quyền `gateout_nobooking` (chỉ ADMIN / SUPERVISOR). */
  canGateOutWithoutBooking: boolean;
  /** Kiểm tra booking với backend (chỉ đọc) — trả hợp lệ / lý do và số vỏ còn lại. */
  onCheckBooking: (containerId: string, bookingNo: string) => Promise<{ valid: boolean; message: string }>;
}

// Lý do ra cổng không theo booking — mã khớp DepotJobService.NoBookingReasons ở backend.
const NO_BOOKING_REASONS: { value: string; label: string }[] = [
  { value: 'OFF_HIRE', label: 'Trả vỏ về hãng' },
  { value: 'DEPOT_TRANSFER', label: 'Chuyển depot' },
  { value: 'OFFSITE_REPAIR', label: 'Sửa ngoài depot' },
  { value: 'OTHER', label: 'Khác (ghi chú)' }
];

export const GateOutDispatchModal: React.FC<GateOutDispatchModalProps> = ({
  container,
  onClose,
  onConfirmGateOut,
  canGateOutWithBooking,
  canGateOutWithoutBooking,
  onCheckBooking
}) => {
  // Mọi ô để trống cho người dùng nhập thật — trước đây điền sẵn booking/biển số/tài xế/seal/xe nâng mẫu.
  const [bookingNo, setBookingNo] = useState('');
  const [truckPlate, setTruckPlate] = useState('');
  const [chassisPlate, setChassisPlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverIdCard, setDriverIdCard] = useState('');
  const [truckingCompany, setTruckingCompany] = useState('');
  const [sealNo, setSealNo] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [forkliftOperator, setForkliftOperator] = useState('');
  const [gateLane, setGateLane] = useState('LÀN 03 (CỔNG XUẤT HÀNG)');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  // Tài khoản không có quyền cấp theo booking (giám sát) thì chỉ còn đường không booking.
  const [withoutBooking, setWithoutBooking] = useState(!canGateOutWithBooking && canGateOutWithoutBooking);
  const [noBookingReason, setNoBookingReason] = useState('');
  const [noBookingNote, setNoBookingNote] = useState('');
  const [bookingCheck, setBookingCheck] = useState<{ valid: boolean; message: string } | null>(null);
  const [checkingBooking, setCheckingBooking] = useState(false);

  const handleCheckBooking = async () => {
    if (!bookingNo.trim()) {
      setBookingCheck({ valid: false, message: 'Nhập số booking trước khi kiểm tra.' });
      return;
    }
    setCheckingBooking(true);
    try {
      setBookingCheck(await onCheckBooking(container.id, bookingNo.trim()));
    } finally {
      setCheckingBooking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckPlate.trim()) {
      setErrorMsg('Vui lòng nhập Biển số xe đầu kéo');
      return;
    }
    if (!driverName.trim()) {
      setErrorMsg('Vui lòng nhập Tên tài xế nhận vỏ');
      return;
    }
    if (withoutBooking) {
      if (!noBookingReason) {
        setErrorMsg('Chọn lý do ra cổng không theo booking');
        return;
      }
      if (noBookingReason === 'OTHER' && !noBookingNote.trim()) {
        setErrorMsg('Lý do "Khác" phải ghi chú cụ thể');
        return;
      }
    } else if (!bookingNo.trim()) {
      setErrorMsg('Vui lòng nhập Số Booking lệnh cấp vỏ');
      return;
    }

    onConfirmGateOut(container.id, {
      bookingNo: withoutBooking ? '' : bookingNo.trim(),
      withoutBooking,
      noBookingReason: withoutBooking ? noBookingReason : undefined,
      noBookingNote: withoutBooking ? noBookingNote.trim() : undefined,
      truckPlate: truckPlate.toUpperCase(),
      chassisPlate: chassisPlate.toUpperCase(),
      driverName,
      driverPhone,
      driverIdCard,
      truckingCompany,
      sealNo,
      destinationPort,
      forkliftOperator,
      gateLane,
      note
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 uppercase font-mono">
                  TIẾP NHẬN XE ĐẾN LẤY VỎ &amp; THỰC HIỆN CẤP VỎ (GATE-OUT)
                </h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-mono font-bold">
                  AV GRADE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Container đã được Hãng tàu chấp thuận sửa chữa qua API &bull; Sẵn sàng gắp cont lên rơ-moóc cho tài xế.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carrier Authorization Ribbon */}
        <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs font-mono flex-wrap gap-2 text-emerald-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Xác thực Hãng tàu: <strong>{container.carrierTransmission.ackReferenceNo}</strong> ({container.shippingLine})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Release Token:</span>
            <span className="px-2 py-0.5 bg-emerald-100 rounded text-emerald-800 font-bold border border-emerald-300">
              {container.carrierTransmission.carrierReleaseToken}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Container Specification & Yard Location */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-blue-600" />
                1. Thông Tin Container Sẽ Cấp Phát
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Số chứng chỉ QC: <strong>{container.qcCertificateNo}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500">Số Container</div>
                <div className="text-sm font-black text-slate-900">{container.containerNo}</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500">Hãng Tàu / Loại</div>
                <div className="text-xs font-bold text-blue-700">
                  {container.shippingLine} - {container.size} {container.type}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500">Phân Hạng Vỏ (Grade)</div>
                <div className="text-xs font-bold text-emerald-700">{container.grade}</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500">Vị Trí Trong Bãi</div>
                <div className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    Block {container.yardLocation.block} &bull; Bay {container.yardLocation.bay} &bull; Row {container.yardLocation.row} &bull; Tier {container.yardLocation.tier}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Phí lưu bãi do server tính (chưa thu) */}
          <GateOutStorageFee containerNo={container.containerNo} />

          {/* Section 2: Truck Arrival & Booking Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                2. Thông Tin Xe Đến Lấy &amp; Lệnh Booking
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3 p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                {canGateOutWithoutBooking ? (
                  <label className={`flex items-center gap-2 font-bold text-slate-700 ${canGateOutWithBooking ? 'cursor-pointer' : ''}`}>
                    <input
                      type="checkbox"
                      checked={withoutBooking}
                      disabled={!canGateOutWithBooking}
                      onChange={(e) => { setWithoutBooking(e.target.checked); setBookingCheck(null); setErrorMsg(''); }}
                    />
                    <span>Không cần booking (trả vỏ về hãng / chuyển depot / sửa ngoài) — quyền quản lý / giám sát</span>
                  </label>
                ) : (
                  <div className="text-[11px] text-slate-500">Không có booking? Gọi giám sát / quản lý cấp vỏ.</div>
                )}

                {withoutBooking ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold block">Lý Do Ra Cổng (*)</label>
                      <select
                        value={noBookingReason}
                        onChange={(e) => setNoBookingReason(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm focus:outline-none"
                      >
                        <option value="">-- Chọn lý do --</option>
                        {NO_BOOKING_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-700 font-bold block">Ghi Chú Lý Do{noBookingReason === 'OTHER' ? ' (*)' : ''}</label>
                      <input
                        type="text"
                        value={noBookingNote}
                        onChange={(e) => setNoBookingNote(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:border-indigo-500"
                        placeholder="VD: số lệnh trả vỏ của hãng, depot nhận..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold block">Số Booking / Lệnh Cấp Vỏ (*)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bookingNo}
                        onChange={(e) => { setBookingNo(e.target.value); setBookingCheck(null); }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm font-mono uppercase focus:outline-none focus:border-indigo-500 font-bold"
                        placeholder="VD: BKG-MAE-882190"
                      />
                      <button
                        type="button"
                        onClick={handleCheckBooking}
                        disabled={checkingBooking}
                        className="px-3 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                      >
                        {checkingBooking ? 'Đang kiểm tra...' : 'Kiểm tra booking'}
                      </button>
                    </div>
                    {bookingCheck && (
                      <div className={`text-[11px] font-bold ${bookingCheck.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {bookingCheck.message}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Biển Số Xe Đầu Kéo (*)</label>
                <input
                  type="text"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm font-mono uppercase focus:outline-none focus:border-indigo-500 font-bold text-indigo-700"
                  placeholder="Biển số xe đầu kéo"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Biển Số Rơ-Moóc (Chassis)</label>
                <input
                  type="text"
                  value={chassisPlate}
                  onChange={(e) => setChassisPlate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm font-mono uppercase focus:outline-none focus:border-indigo-500"
                  placeholder="VD: 51R-048.91"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Tên Tài Xế Nhận Vỏ (*)</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:border-indigo-500 font-medium"
                  placeholder="Họ tên tài xế"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Số Điện Thoại Tài Xế</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="0908.123.456"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Số CCCD / CMND Tài Xế</label>
                <input
                  type="text"
                  value={driverIdCard}
                  onChange={(e) => setDriverIdCard(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="Số CCCD tài xế"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-700 font-bold block">Đơn Vị Vận Tải / FWD (*)</label>
                <input
                  type="text"
                  value={truckingCompany}
                  onChange={(e) => setTruckingCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Tên đơn vị vận tải / forwarder"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Số Chì Hãng Tàu (Seal No)</label>
                <input
                  type="text"
                  value={sealNo}
                  onChange={(e) => setSealNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-amber-700 rounded-xl font-mono focus:outline-none focus:border-indigo-500 font-bold"
                  placeholder="Số chì"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-700 font-bold block">Cảng Đích / Tàu Chuyến</label>
                <input
                  type="text"
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:border-indigo-500"
                  placeholder="VD: Cảng Cát Lái - MAERSK MC-KINNEY MOLLER"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Làn Cổng Xuất</label>
                <select
                  value={gateLane}
                  onChange={(e) => setGateLane(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm font-mono focus:outline-none"
                >
                  <option value="LÀN 03 (CỔNG XUẤT HÀNG)">LÀN 03 (CỔNG XUẤT HÀNG)</option>
                  <option value="LÀN 04 (CỔNG XUẤT ƯU TIÊN)">LÀN 04 (CỔNG XUẤT ƯU TIÊN)</option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-slate-700 font-bold block">Điều Xe Nâng Bãi Gắp Cont Lên Xe (*)</label>
                <input
                  type="text"
                  value={forkliftOperator}
                  onChange={(e) => setForkliftOperator(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm focus:outline-none"
                  placeholder="Xe nâng / lái xe gắp cont (chưa có danh mục xe nâng ở backend)"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-slate-700 font-bold block">Ghi Chú Nghiệp Vụ Cấp Vỏ</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ghi chú thêm nếu có..."
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm transition cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>XÁC NHẬN CẤP VỎ &amp; IN PHIẾU EIR XUẤT (GATE-OUT)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
