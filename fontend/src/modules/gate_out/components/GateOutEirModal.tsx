import React from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  QrCode,
  Barcode,
  Truck,
  Ship,
  MapPin,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  User,
  Phone
} from 'lucide-react';
import { GateOutContainerRecord } from '../types/gateOut';

interface GateOutEirModalProps {
  container: GateOutContainerRecord;
  onClose: () => void;
}

export const GateOutEirModal: React.FC<GateOutEirModalProps> = ({ container, onClose }) => {
  const details = container.gateOutDetails;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <QrCode className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                PHIẾU GIAO NHẬN CONTAINER XUẤT BÃI (EQUIPMENT INTERCHANGE RECEIPT - EIR OUT)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Mã chứng từ: <strong className="text-amber-400">{details?.eirOutNo || 'EIR-OUT-2026-XXXX'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-indigo-950"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu EIR</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* EIR Printable Document Canvas */}
        <div className="p-6 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0">
          <div className="border-2 border-slate-900 p-6 rounded-xl space-y-5">
            {/* Depot Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <h1 className="text-base font-black uppercase text-slate-900 tracking-wide">
                  EMR CONTAINER LOGISTICS DEPOT CAT LAI (VNSGN)
                </h1>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Địa chỉ: Cụm Kho Bãi ICD Cát Lái, P. Cát Lái, TP. Thủ Đức, TP. Hồ Chí Minh
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  Hotline Điều Độ Cổng: 1900 8899 &bull; Website: www.emr-depot-vietnam.com
                </p>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-indigo-900 font-mono">
                  {details?.eirOutNo || 'EIR-OUT-99182'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Ngày xuất: {details?.gateOutTime || new Date().toISOString().slice(0, 19).replace('T', ' ')}
                </div>
                <div className="mt-1 inline-block px-2 py-0.5 bg-slate-100 border border-slate-400 font-mono text-[10px] font-bold uppercase text-slate-800">
                  {details?.gateLane || 'LÀN 03 (CỔNG XUẤT)'}
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-1">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                PHIẾU GIAO CONTAINER CHO CHỦ HÀNG (GATE-OUT EIR)
              </h2>
              <p className="text-xs italic text-slate-600 font-serif">
                (Container Equipment Interchange Receipt - Delivery Order For Export Loading)
              </p>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 border border-slate-300 p-3 rounded-lg bg-slate-50/50">
                <div className="font-bold text-slate-800 uppercase text-[11px] border-b border-slate-200 pb-1">
                  1. THÔNG TIN CONTAINER &amp; HÃNG TÀU
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Số Container:</span>
                    <strong className="text-sm text-indigo-900 font-black">{container.containerNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">ISO Code / Size:</span>
                    <strong>{container.isoCode} ({container.size} {container.type})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Hãng Tàu (Carrier):</span>
                    <strong className="text-blue-800">{container.shippingLine}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Phân Hạng (Grade):</span>
                    <strong className="text-emerald-700">{container.grade} (Sound / AV)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Số Chì (Seal No):</span>
                    <strong className="text-red-700">{details?.sealNo || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Số Lệnh Booking:</span>
                    <strong className="text-slate-900">{details?.bookingNo || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 border border-slate-300 p-3 rounded-lg bg-slate-50/50">
                <div className="font-bold text-slate-800 uppercase text-[11px] border-b border-slate-200 pb-1">
                  2. THÔNG TIN PHƯƠNG TIỆN &amp; TÀI XẾ NHẬN VỎ
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Xe Đầu Kéo:</span>
                    <strong className="text-indigo-900 text-xs font-bold">{details?.truckPlate || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Rơ-Moóc (Chassis):</span>
                    <strong>{details?.chassisPlate || 'N/A'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px] block">Đơn Vị Vận Tải (Trucking / FWD):</span>
                    <strong className="text-slate-900 font-sans">{details?.truckingCompany || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Họ Tên Tài Xế:</span>
                    <strong className="text-slate-900 font-sans">{details?.driverName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Số Điện Thoại / CCCD:</span>
                    <strong>{details?.driverPhone || ''} {details?.driverIdCard ? `(${details.driverIdCard})` : ''}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Carrier API Release Verification */}
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs flex items-center justify-between font-mono">
              <div className="space-y-0.5">
                <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  XÁC NHẬN M&amp;R HOÀN TẤT &amp; CẤP PHÁT HỆ THỐNG HÃNG TÀU (API ACKNOWLEDGED)
                </span>
                <p className="text-[11px] text-emerald-800 font-sans">
                  Mã truyền API: <strong>{container.carrierTransmission.transactionRef}</strong> &bull; Mã ACK: <strong>{container.carrierTransmission.ackReferenceNo}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-700 block">Release Token:</span>
                <span className="px-2 py-0.5 bg-emerald-800 text-white font-bold rounded text-[11px]">
                  {container.carrierTransmission.carrierReleaseToken}
                </span>
              </div>
            </div>

            {/* Inspection & Yard Position Note */}
            <div className="grid grid-cols-3 gap-3 text-xs border border-slate-300 p-3 rounded-lg">
              <div>
                <span className="text-slate-500 text-[10px] block">Vị trí gắp cont:</span>
                <strong>Block {container.yardLocation.block} - Bay {container.yardLocation.bay} - Row {container.yardLocation.row} - Tier {container.yardLocation.tier}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Xe nâng thực hiện:</span>
                <strong>{details?.forkliftOperator || 'Xe nâng #02'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Cảng hạ bãi / Đích đến:</span>
                <strong>{details?.destinationPort || 'Cảng Cát Lái (VNSGN)'}</strong>
              </div>
            </div>

            {/* Confirmation & Signature Blocks */}
            <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-4 text-center text-xs">
              <div className="space-y-12">
                <div>
                  <span className="font-bold uppercase block text-slate-800">TÀI XẾ NHẬN VỎ</span>
                  <span className="text-[10px] text-slate-500 italic block">(Đã kiểm tra vỏ đạt chuẩn)</span>
                </div>
                <div className="font-bold text-slate-900 font-sans">{details?.driverName || 'Nguyễn Văn Hùng'}</div>
              </div>

              <div className="space-y-12">
                <div>
                  <span className="font-bold uppercase block text-slate-800">LÁI XE NÂNG BÃI</span>
                  <span className="text-[10px] text-slate-500 italic block">(Gắp đúng số cont lên xe)</span>
                </div>
                <div className="font-bold text-slate-900 font-sans">Nguyễn Văn Ba</div>
              </div>

              <div className="space-y-12">
                <div>
                  <span className="font-bold uppercase block text-slate-800">CÁN BỘ CỔNG XUẤT</span>
                  <span className="text-[10px] text-slate-500 italic block">(Ký duyệt &amp; Đóng dấu cổng)</span>
                </div>
                <div className="font-bold text-slate-900 font-sans">{details?.gateStaff || 'Đặng Quốc Huy'}</div>
              </div>
            </div>

            {/* Footer Barcode / Security Hash */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <Barcode className="w-6 h-6" />
                <span>HASH: SHA256-EMR-GO-9918231-VERIFIED</span>
              </div>
              <span>Hệ thống ERP Quản Lý Container Depot EMR v2.6.4</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Trạng thái: <strong className="text-emerald-400">ĐÃ XUẤT KHỎI BÃI (GATE-OUT COMPLETED)</strong>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
