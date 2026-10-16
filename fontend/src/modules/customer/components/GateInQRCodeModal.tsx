import React from 'react';
import {
  X,
  QrCode,
  Truck,
  Download,
  Share2,
  Printer,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Building2,
  Smartphone
} from 'lucide-react';
import { GateInRegistration } from '../types/customerPortal';

interface GateInQRCodeModalProps {
  gateIn: GateInRegistration;
  onClose: () => void;
}

export const GateInQRCodeModal: React.FC<GateInQRCodeModalProps> = ({ gateIn, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-50 backdrop-blur-md z-60 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full my-auto space-y-5 shadow-2xl overflow-hidden animate-scale-up text-center">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-pink-600 font-bold text-sm">
            <QrCode className="w-5 h-5" />
            <span>MÃ QR GATE-IN TẠI CỔNG DEPOT</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Physical Pass Card */}
        <div className="px-6 space-y-4">
          <div className="p-5 bg-pink-50/50 border-2 border-pink-200 rounded-3xl text-left space-y-4 shadow-2xl relative overflow-hidden">
            
            {/* Top Tag */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-pink-600 font-bold tracking-wider">
                  DEPOT E-GATE PASS 2026
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                  {gateIn.customerName}
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold rounded">
                {gateIn.status}
              </span>
            </div>

            {/* Giant QR Code Display */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-4 bg-slate-50 rounded-2xl shadow-xl border-4 border-pink-200">
                <div className="w-44 h-44 bg-slate-50 flex flex-col items-center justify-center text-center p-2 rounded-xl">
                  <QrCode className="w-32 h-32 text-pink-600 mb-1" />
                  <span className="text-[10px] font-mono font-bold text-slate-900 tracking-widest">
                    {gateIn.gateInNo}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Đưa mã này trước Camera OCR tại trụ Check-in tự động ở cổng
              </p>
            </div>

            {/* Specs Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã Gate-In:</span>
                <span className="font-mono font-bold text-pink-600">{gateIn.gateInNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Container:</span>
                <span className="font-mono font-bold text-slate-900">{gateIn.containerNo} ({gateIn.size})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tài xế:</span>
                <span className="font-bold text-slate-900">{gateIn.driverName} ({gateIn.driverPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Xe đầu kéo:</span>
                <span className="font-mono font-bold text-amber-700">{gateIn.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lịch hẹn:</span>
                <span className="font-mono font-bold text-emerald-600">
                  {gateIn.appointmentTime} • {gateIn.appointmentDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Depot:</span>
                <span className="font-semibold text-slate-700">{gateIn.depot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => {
              alert(`Đã lưu ảnh mã QR thẻ Gate-In ${gateIn.gateInNo} về máy điện thoại của tài xế!`);
            }}
            className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Lưu QR Về Máy</span>
          </button>

          <button
            onClick={() => {
              alert(`Đã tạo liên kết chia sẻ thẻ Gate-In qua Zalo / SMS cho tài xế: ${gateIn.driverPhone}`);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Chia Sẻ Zalo/SMS</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
