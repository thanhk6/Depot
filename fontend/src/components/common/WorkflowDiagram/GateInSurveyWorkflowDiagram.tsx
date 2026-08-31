import React from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import {
  LogIn,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  FileCode,
  Camera,
  FileCheck2,
  Calculator,
  CreditCard,
  Truck,
  Grid3X3,
  ArrowDown,
  ArrowRight
} from 'lucide-react';

interface GateInSurveyWorkflowDiagramProps {
  containers: ContainerRecord[];
  onNavigateTab: (tabId: string) => void;
}

// Trước đây nền tối (slate-900/950) — đổi sang nền sáng theo yêu cầu người dùng ("giao diện Dashboard
// ERP màu sáng hơn, màu này tối"). Component này chỉ được Dashboard dùng (đã xác nhận không nơi nào
// khác import), nên đổi toàn bộ an toàn, không ảnh hưởng màn khác.
export const GateInSurveyWorkflowDiagram: React.FC<GateInSurveyWorkflowDiagramProps> = ({
  containers,
  onNavigateTab
}) => {
  // Counts at each step of the pipeline
  const gateInCount = containers.filter((c) => c.status === 'GATE_IN').length;
  const surveyCount = containers.filter((c) => c.status === 'SURVEYING').length;

  const avCount = containers.filter((c) => c.condition === 'AV').length;
  const clCount = containers.filter((c) => c.condition === 'CL').length;
  const dmCount = containers.filter((c) => c.condition === 'DM').length;

  const paymentCount = containers.filter((c) => c.status === 'WAITING_PAYMENT').length;
  const forkliftCount = containers.filter((c) => c.status === 'WAITING_FORKLIFT').length;
  const inYardCount = containers.filter((c) => c.status === 'IN_YARD' || c.status === 'READY_FOR_USE').length;

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold rounded-full font-mono mb-1">
            CORE OPERATIONAL FLOWCHART
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Sơ Đồ Quy Trình Tiếp Nhận &amp; Giám Định Container (Gate-In + Survey)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Trực quan hóa luồng dữ liệu 10 bước chuẩn ISO/IICL từ khi xe qua Cổng đến khi Hạ Bãi thành công.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('gate')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <LogIn className="w-4 h-4" />
          <span>Tạo Tiếp Nhận Gate-In Mới</span>
        </button>
      </div>

      {/* Visual Flowchart Nodes */}
      <div className="space-y-4">
        {/* Node 1: GATE-IN + SURVEY */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl p-4 bg-white border-2 border-blue-200 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-widest">BƯỚC 1</span>
                <h4 className="text-sm font-bold text-slate-900">GATE-IN + SURVEY (Tiếp nhận Container)</h4>
                <p className="text-[11px] text-slate-500">Đọc OCR biển số xe, số Cont, loại ISO &amp; kiểm tra phiếu lệnh</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {gateInCount} Cont ở Cổng
              </span>
            </div>
          </div>

          <div className="my-1.5 flex flex-col items-center text-blue-500">
            <ArrowDown className="w-5 h-5 animate-pulse" />
          </div>

          {/* Node 2: Kiểm Tra / Giám Định */}
          <div className="w-full max-w-xl p-4 bg-white border-2 border-amber-200 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest">BƯỚC 2</span>
                <h4 className="text-sm font-bold text-slate-900">Kiểm Tra / Giám Định Vỏ IICL</h4>
                <p className="text-[11px] text-slate-500">Giám định viên kiểm tra 6 mặt vỏ, sàn, đà, khóa cửa &amp; nóc</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {surveyCount} Đang Giám Định
              </span>
            </div>
          </div>
        </div>

        {/* Node 3: Split into 3 Conditions (AV, CL, DM) */}
        <div className="my-2 flex justify-center">
          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* AV */}
            <div
              onClick={() => onNavigateTab('container')}
              className="p-3.5 bg-white border border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-50 transition space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> AV (Available)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">{avCount} Cont</span>
              </div>
              <p className="text-[10px] text-slate-500">Đạt chuẩn, sạch đẹp, cấp trả chủ hàng ngay</p>
            </div>

            {/* CL */}
            <div
              onClick={() => onNavigateTab('container')}
              className="p-3.5 bg-white border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-50 transition space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                  <AlertTriangle className="w-4 h-4" /> CL (Cleaning)
                </span>
                <span className="text-xs font-mono font-bold text-amber-700">{clCount} Cont</span>
              </div>
              <p className="text-[10px] text-slate-500">Bẩn/Dính hóa chất, cần xịt rửa rửa nước áp lực</p>
            </div>

            {/* DM */}
            <div
              onClick={() => onNavigateTab('container')}
              className="p-3.5 bg-white border border-red-200 rounded-2xl cursor-pointer hover:bg-red-50 transition space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                  <Wrench className="w-4 h-4" /> DM (Damaged)
                </span>
                <span className="text-xs font-mono font-bold text-red-700">{dmCount} Cont</span>
              </div>
              <p className="text-[10px] text-slate-500">Hư hỏng cấu trúc, chuyển báo giá EMR &amp; sửa chữa</p>
            </div>
          </div>
        </div>

        <div className="my-1.5 flex flex-col items-center text-slate-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* Node 4 & 5 & 6: Ghi nhận Repair Code -> Chụp Ảnh -> e-EIR */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                <FileCode className="w-4 h-4" />
                <span>Ghi Nhận Repair Code</span>
              </div>
              <p className="text-[10px] text-slate-500">Nhập mã CEDEX (CUT, DENT, HOLE, BRK) &amp; vị trí chi tiết</p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                <Camera className="w-4 h-4" />
                <span>Chụp Ảnh Giám Định</span>
              </div>
              <p className="text-[10px] text-slate-500">Đính kèm ảnh hiện trạng tổn thất 4 góc &amp; bên trong vỏ</p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                <FileCheck2 className="w-4 h-4" />
                <span>Phát Hành e-EIR</span>
              </div>
              <p className="text-[10px] text-slate-500">Tạo phiếu giao nhận điện tử kèm Mã QR tra cứu</p>
            </div>
          </div>
        </div>

        <div className="my-1.5 flex flex-col items-center text-slate-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* Node 7 & 8: Tính Phí -> Payment */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-cyan-600 text-xs font-bold">
                <Calculator className="w-4 h-4" />
                <span>Tính Phí Tự Động (Tariff)</span>
              </div>
              <p className="text-[10px] text-slate-500">Áp biểu cước Nâng Hạ (Lift On/Off), Vệ Sinh &amp; Lưu Bãi</p>
            </div>

            <div
              onClick={() => onNavigateTab('payment')}
              className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-100 transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                  <CreditCard className="w-4 h-4" /> Payment (Thanh Toán VietQR)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">{paymentCount} Chờ</span>
              </div>
              <p className="text-[10px] text-slate-500">Quét mã VietQR động &amp; tự động gạch nợ qua Webhook</p>
            </div>
          </div>
        </div>

        <div className="my-1.5 flex flex-col items-center text-slate-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* Node 9 & 10: Forklift Dispatch -> Yard */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              onClick={() => onNavigateTab('forklift')}
              className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl cursor-pointer hover:bg-sky-100 transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sky-700 text-xs font-bold">
                  <Truck className="w-4 h-4" /> Forklift Dispatch (Lệnh Gắp)
                </span>
                <span className="text-xs font-mono font-bold text-sky-700">{forkliftCount} Lệnh</span>
              </div>
              <p className="text-[10px] text-slate-500">Phát lệnh không dây tới màn hình cabin tài xế xe nâng</p>
            </div>

            <div
              onClick={() => onNavigateTab('yard_map')}
              className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl cursor-pointer hover:bg-indigo-100 transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
                  <Grid3X3 className="w-4 h-4" /> Yard (Xếp Dỡ Bãi 2D)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-700">{inYardCount} Đã Hạ</span>
              </div>
              <p className="text-[10px] text-slate-500">Cập nhật tọa độ vị trí Block - Bay - Row - Tier thời gian thực</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
