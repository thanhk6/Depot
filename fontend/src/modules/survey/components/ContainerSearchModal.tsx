import React, { useState } from 'react';
import { SurveyItemRecord } from '../types';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  X,
  PlusCircle,
  Truck,
  Ship,
  Sparkles
} from 'lucide-react';

interface ContainerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSurveys: SurveyItemRecord[];
  onStartSurvey: (containerNo: string, isPreSurvey: boolean, shippingLine: string, size: string) => void;
  onOpenFullCreateModal?: (prefilledContainerNo?: string) => void;
}

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (nền trắng) theo yêu cầu người dùng — backdrop
// ngoài cùng giữ nền tối mờ (quy ước modal chuẩn), panel bên trong chuyển sang nền trắng.
export const ContainerSearchModal: React.FC<ContainerSearchModalProps> = ({
  isOpen,
  onClose,
  existingSurveys,
  onStartSurvey,
  onOpenFullCreateModal
}) => {
  const [containerQuery, setContainerQuery] = useState('');
  const [shippingLine, setShippingLine] = useState('MAERSK');
  const [size, setSize] = useState('40HC');
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const cleanQuery = containerQuery.trim().toUpperCase();
  const matched = cleanQuery
    ? existingSurveys.find((s) => s.containerNo.toUpperCase() === cleanQuery)
    : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanQuery) return;
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tra Cứu Container &amp; Khởi Tạo Giám Định</h3>
              <p className="text-xs text-slate-500">
                Hỗ trợ tìm kiếm container đã Gate-In hoặc tạo Pre-Survey cho vỏ chuẩn bị hạ bãi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nhập Số Container (4 chữ cái + 7 chữ số)*
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                maxLength={11}
                placeholder="VD: MSCU1234567, MAEU9876543..."
                value={containerQuery}
                onChange={(e) => {
                  setContainerQuery(e.target.value);
                  setHasSearched(false);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-amber-700 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Tra Cứu
              </button>
            </div>
          </div>
        </form>

        {/* Search Results Display */}
        {hasSearched && (
          <div className="space-y-3 animate-fade-in">
            {matched ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-700">
                      Container đã Gate-In tại bãi
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono rounded font-bold">
                    {matched.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div>Số Cont: <strong className="font-mono text-slate-900">{matched.containerNo}</strong></div>
                  <div>Hãng tàu: <strong className="text-slate-900">{matched.shippingLine}</strong></div>
                  <div>Kích cỡ: <span className="text-slate-700">{matched.size} {matched.type}</span></div>
                  <div>Gate-In: <span className="font-mono text-slate-500">{matched.gateInTime}</span></div>
                </div>

                <button
                  onClick={() => {
                    onStartSurvey(matched.containerNo, false, matched.shippingLine, matched.size);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mở Phiếu Giám Định Container Này</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-amber-800">
                        Container Chưa Ghi Nhận Gate-In Trong Hệ Thống
                      </h4>
                      <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-bold rounded">
                        CHƯA GATE-IN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Hệ thống cho phép thực hiện <strong>Pre-Survey (Giám định trước)</strong> khi xe cont đang xếp hàng ngoài cổng hoặc kiểm tra trước khi cấp số EIR.
                    </p>
                  </div>
                </div>

                {/* Pre-survey quick setup */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Hãng Tàu (Shipping Line)*
                    </label>
                    <select
                      value={shippingLine}
                      onChange={(e) => setShippingLine(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                    >
                      <option value="MAERSK">MAERSK Line</option>
                      <option value="MSC">MSC Shipping</option>
                      <option value="ONE">ONE Network Express</option>
                      <option value="CMA-CGM">CMA CGM</option>
                      <option value="COSCO">COSCO Shipping</option>
                      <option value="EVERGREEN">EVERGREEN Line</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Kích Cỡ (Size / Type)*
                    </label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                    >
                      <option value="20DC">20DC - 20' Dry Container</option>
                      <option value="40DC">40DC - 40' Dry Container</option>
                      <option value="40HC">40HC - 40' High Cube Dry</option>
                      <option value="40HR">40HR - 40' Reefer High Cube</option>
                      <option value="45HC">45HC - 45' High Cube</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onStartSurvey(cleanQuery, true, shippingLine, size);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Tạo Nhanh Phiếu Pre-Survey ({cleanQuery})</span>
                  </button>

                  {onOpenFullCreateModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenFullCreateModal(cleanQuery);
                      }}
                      className="w-full py-2 bg-white hover:bg-amber-50 text-amber-700 font-semibold text-xs rounded-xl border border-amber-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Nhập Đầy Đủ Thông Số &amp; Tổn Thất (Form Chi Tiết)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
