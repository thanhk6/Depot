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
import { MOCK_CARRIER_BOOKINGS, POPULAR_TRUCKING_COMPANIES } from '../data/gateOutMockData';

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
    }
  ) => void;
}

export const GateOutDispatchModal: React.FC<GateOutDispatchModalProps> = ({
  container,
  onClose,
  onConfirmGateOut
}) => {
  // Matched default booking for this shipping line if available
  const defaultBooking = MOCK_CARRIER_BOOKINGS.find(
    (b) => b.shippingLine.toUpperCase().includes(container.shippingLine.toUpperCase()) ||
           container.shippingLine.toUpperCase().includes(b.shippingLine.toUpperCase())
  );

  const [bookingNo, setBookingNo] = useState(defaultBooking?.bookingNo || `BKG-${container.shippingLine.slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`);
  const [truckPlate, setTruckPlate] = useState('51C-889.42');
  const [chassisPlate, setChassisPlate] = useState('51R-048.91');
  const [driverName, setDriverName] = useState('Nguyễn Văn Hùng');
  const [driverPhone, setDriverPhone] = useState('0908.123.456');
  const [driverIdCard, setDriverIdCard] = useState('079088192031');
  const [truckingCompany, setTruckingCompany] = useState(POPULAR_TRUCKING_COMPANIES[0]);
  const [sealNo, setSealNo] = useState(`${container.shippingLine.slice(0, 3)}-SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [destinationPort, setDestinationPort] = useState(defaultBooking?.destinationPort || 'Cảng Cát Lái (VNSGN) - Xuất Khẩu');
  const [forkliftOperator, setForkliftOperator] = useState('Nguyễn Văn Ba (Xe nâng Reach Stacker #02)');
  const [gateLane, setGateLane] = useState('LÀN 03 (CỔNG XUẤT HÀNG)');
  const [note, setNote] = useState('Tài xế đã kiểm tra vỏ ngoài đạt chuẩn Sound/AV trước khi rời bãi.');
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickFillSampleTruck = (truckIndex: number) => {
    if (truckIndex === 1) {
      setTruckPlate('51D-992.14');
      setChassisPlate('51R-772.33');
      setDriverName('Trần Quốc Tuấn');
      setDriverPhone('0912.889.900');
      setTruckingCompany(POPULAR_TRUCKING_COMPANIES[1]);
    } else {
      setTruckPlate('60C-445.88');
      setChassisPlate('60R-119.04');
      setDriverName('Lê Văn Phát');
      setDriverPhone('0988.441.223');
      setTruckingCompany(POPULAR_TRUCKING_COMPANIES[2]);
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
    if (!bookingNo.trim()) {
      setErrorMsg('Vui lòng nhập Số Booking lệnh cấp vỏ');
      return;
    }

    onConfirmGateOut(container.id, {
      bookingNo,
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase font-mono">
                  TIẾP NHẬN XE ĐẾN LẤY VỎ &amp; THỰC HIỆN CẤP VỎ (GATE-OUT)
                </h3>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-xs font-mono font-bold">
                  AV GRADE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Container đã được Hãng tàu chấp thuận sửa chữa qua API &bull; Sẵn sàng gắp cont lên rơ-moóc cho tài xế.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carrier Authorization Ribbon */}
        <div className="px-6 py-3 bg-emerald-950/40 border-b border-emerald-800/40 flex items-center justify-between text-xs font-mono flex-wrap gap-2 text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Xác thực Hãng tàu: <strong>{container.carrierTransmission.ackReferenceNo}</strong> ({container.shippingLine})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Release Token:</span>
            <span className="px-2 py-0.5 bg-emerald-900/60 rounded text-white font-bold border border-emerald-700">
              {container.carrierTransmission.carrierReleaseToken}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-xl text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Container Specification & Yard Location */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-blue-400" />
                1. Thông Tin Container Sẽ Cấp Phát
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Số chứng chỉ QC: <strong>{container.qcCertificateNo}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Số Container</div>
                <div className="text-sm font-black text-white">{container.containerNo}</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Hãng Tàu / Loại</div>
                <div className="text-xs font-bold text-blue-400">
                  {container.shippingLine} - {container.size} {container.type}
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Phân Hạng Vỏ (Grade)</div>
                <div className="text-xs font-bold text-emerald-400">{container.grade}</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Vị Trí Trong Bãi</div>
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    Block {container.yardLocation.block} &bull; Bay {container.yardLocation.bay} &bull; Row {container.yardLocation.row} &bull; Tier {container.yardLocation.tier}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Truck Arrival & Booking Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                2. Thông Tin Xe Đến Lấy &amp; Lệnh Booking
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Nạp nhanh xe mẫu:</span>
                <button
                  type="button"
                  onClick={() => handleQuickFillSampleTruck(1)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold border border-slate-700 transition cursor-pointer"
                >
                  Xe Tân Cảng (51D)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillSampleTruck(2)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold border border-slate-700 transition cursor-pointer"
                >
                  Xe Đại Nam (60C)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Số Booking / Lệnh Cấp Vỏ (*)</label>
                <input
                  type="text"
                  value={bookingNo}
                  onChange={(e) => setBookingNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono uppercase focus:outline-none focus:border-indigo-500 font-bold"
                  placeholder="VD: BKG-MAE-882190"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Biển Số Xe Đầu Kéo (*)</label>
                <input
                  type="text"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono uppercase focus:outline-none focus:border-indigo-500 font-bold text-indigo-300"
                  placeholder="VD: 51C-889.42"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Biển Số Rơ-Moóc (Chassis)</label>
                <input
                  type="text"
                  value={chassisPlate}
                  onChange={(e) => setChassisPlate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono uppercase focus:outline-none focus:border-indigo-500"
                  placeholder="VD: 51R-048.91"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Tên Tài Xế Nhận Vỏ (*)</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  placeholder="VD: Nguyễn Văn Hùng"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Số Điện Thoại Tài Xế</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="0908.123.456"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Số CCCD / CMND Tài Xế</label>
                <input
                  type="text"
                  value={driverIdCard}
                  onChange={(e) => setDriverIdCard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="079088192031"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300 font-bold block">Đơn Vị Vận Tải / FWD (*)</label>
                <select
                  value={truckingCompany}
                  onChange={(e) => setTruckingCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  {POPULAR_TRUCKING_COMPANIES.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Số Chì Hãng Tàu (Seal No)</label>
                <input
                  type="text"
                  value={sealNo}
                  onChange={(e) => setSealNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-amber-300 rounded-xl font-mono focus:outline-none focus:border-indigo-500 font-bold"
                  placeholder="VD: MSK-SEAL-9982"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300 font-bold block">Cảng Đích / Tàu Chuyến</label>
                <input
                  type="text"
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-indigo-500"
                  placeholder="VD: Cảng Cát Lái - MAERSK MC-KINNEY MOLLER"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Làn Cổng Xuất</label>
                <select
                  value={gateLane}
                  onChange={(e) => setGateLane(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono focus:outline-none"
                >
                  <option value="LÀN 03 (CỔNG XUẤT HÀNG)">LÀN 03 (CỔNG XUẤT HÀNG)</option>
                  <option value="LÀN 04 (CỔNG XUẤT ƯU TIÊN)">LÀN 04 (CỔNG XUẤT ƯU TIÊN)</option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-slate-300 font-bold block">Điều Xe Nâng Bãi Gắp Cont Lên Xe (*)</label>
                <select
                  value={forkliftOperator}
                  onChange={(e) => setForkliftOperator(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none"
                >
                  <option value="Nguyễn Văn Ba (Xe nâng Reach Stacker #02 - Kalmar 45T)">
                    Xe nâng Reach Stacker #02 (Kalmar 45T) - Lái xe: Nguyễn Văn Ba
                  </option>
                  <option value="Trần Quốc Huy (Xe nâng vỏ #01 - Konecranes 10T)">
                    Xe nâng vỏ #01 (Konecranes 10T) - Lái xe: Trần Quốc Huy
                  </option>
                  <option value="Lê Văn Đạt (Xe nâng Reach Stacker #03 - Sany 45T)">
                    Xe nâng Reach Stacker #03 (Sany 45T) - Lái xe: Lê Văn Đạt
                  </option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-slate-300 font-bold block">Ghi Chú Nghiệp Vụ Cấp Vỏ</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-indigo-500"
                  placeholder="Ghi chú thêm nếu có..."
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-950 transition flex items-center gap-2 cursor-pointer"
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
