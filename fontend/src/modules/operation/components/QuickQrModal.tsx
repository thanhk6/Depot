import React from 'react';
import { formatVND } from '../../../utils/format';
import {
  QrCode,
  X,
  Printer,
  ArrowRight,
  ShieldCheck,
  Building2,
  Truck,
  DollarSign,
  Receipt,
  FileCheck
} from 'lucide-react';

interface QuickQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNo: string;
  containerNo: string;
  shippingLine: string;
  customerName: string;
  driverName?: string;
  truckPlate?: string;
  grandTotal: number;
  onNavigateToPayment?: () => void;
}

export const QuickQrModal: React.FC<QuickQrModalProps> = ({
  isOpen,
  onClose,
  orderNo,
  containerNo,
  shippingLine,
  customerName,
  driverName,
  truckPlate,
  grandTotal,
  onNavigateToPayment
}) => {
  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=STB_DEPOT_NAPAS_${orderNo}_${containerNo}_${grandTotal}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                MÃ QR THANH TOÁN VIETQR
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">Phiếu: #{orderNo}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Body */}
        <div className="p-6 text-center space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs text-left">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Số Container:</span>
              <span className="font-mono font-black text-cyan-700 text-sm">{containerNo}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Hãng Tàu:</span>
              <span className="font-semibold text-slate-700">{shippingLine}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Khách Hàng / Xe Kéo:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                {customerName} {truckPlate ? `(${truckPlate})` : ''}
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl border-4 border-purple-500/30 shadow-2xl inline-block mx-auto">
            <img
              src={qrImageUrl}
              alt={`VietQR ${orderNo}`}
              className="w-48 h-48 object-contain mx-auto"
            />
            <div className="text-[10px] font-black font-mono text-slate-900 pt-1 tracking-wider">
              VIETQR NAPAS 24/7 &bull; AUTO
            </div>
          </div>

          {/* Price & Transfer Note */}
          <div className="space-y-1">
            <div className="text-xs text-slate-500">Số tiền thanh toán:</div>
            <div className="text-2xl font-black font-mono text-emerald-700">
              {formatVND(grandTotal)}
            </div>
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
              <div>
                Ngân hàng: <strong className="text-slate-900">Vietcombank - CN Tân Cảng</strong>
              </div>
              <div>
                STK: <strong className="font-mono text-slate-900">0071001234567</strong> &bull; Tên: <strong className="text-slate-700">STB DEPOT LOGISTICS</strong>
              </div>
              <div>
                Nội dung: <strong className="font-mono text-cyan-700 font-bold">STB {orderNo}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>In Mã QR</span>
          </button>

          <div className="flex items-center gap-2">
            {onNavigateToPayment && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToPayment();
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Mở Mục Thanh Toán</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
