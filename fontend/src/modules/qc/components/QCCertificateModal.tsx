import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Award, Calendar, User, QrCode } from 'lucide-react';
import { QCInspectionRecord } from '../types/qc';

interface QCCertificateModalProps {
  record: QCInspectionRecord;
  onClose: () => void;
}

export const QCCertificateModal: React.FC<QCCertificateModalProps> = ({ record, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const certificateDate = record.inspectedAt || new Date().toISOString().replace('T', ' ').substring(0, 16);
  const certNumber = record.certificateNo || `QC-CERT-${record.containerNo}-${Date.now().toString().slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Chứng Nhận Nghiệm Thu Kỹ Thuật EMR (QC Certificate)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" />
              <span>In Chứng Nhận (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet (Printable Style) */}
        <div className="p-8 overflow-y-auto space-y-6 bg-slate-950 text-slate-100">
          {/* Header Title */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight text-white uppercase">
                EMR CONTAINER DEPOT QUALITY CONTROL
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                PHÂN HỆ NGHIỆM THU CHẤT LƯỢNG SỬA CHỮA & CẤP VỎ CONTAINER SẠCH
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Tiêu chuẩn kiểm định: IICL-6 / ISO 1496-1 / Cargo Worthy Standard
              </p>
            </div>

            <div className="text-right font-mono space-y-1">
              <span className="inline-block px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 font-black text-xs rounded-lg uppercase">
                QC PASSED &bull; ĐẠT CHUẨN AV
              </span>
              <div className="text-[11px] text-slate-400">Số CC: <strong className="text-white">{certNumber}</strong></div>
              <div className="text-[11px] text-slate-500">{certificateDate}</div>
            </div>
          </div>

          {/* Container Specs Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Số Container:</span>
              <span className="text-base font-black font-mono text-white">{record.containerNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Hãng Tàu Quản Lý:</span>
              <span className="font-bold font-mono text-blue-400">{record.shippingLine}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Kích Cỡ & Phân Loại:</span>
              <span className="font-bold text-slate-200">{record.size} {record.type} ({record.isoCode})</span>
            </div>
            <div>
              <span className="text-slate-400 block">Lệnh Thi Công (WO):</span>
              <span className="font-mono font-bold text-slate-200">{record.workOrderNo}</span>
            </div>
          </div>

          {/* Checklist Verification Results */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              Kết Quả 7 Hạng Mục Nghiệm Thu Kỹ Thuật (7-Point Inspection):
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                  <tr>
                    <th className="p-2.5">Hạng mục kiểm tra</th>
                    <th className="p-2.5">Tiêu chuẩn kỹ thuật IICL</th>
                    <th className="p-2.5 text-center">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {record.checkItems.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/80'}>
                      <td className="p-2.5 font-bold text-white">{item.titleVi}</td>
                      <td className="p-2.5 text-slate-400 text-[11px]">{item.standardVi}</td>
                      <td className="p-2.5 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ĐẠT</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspector Remarks & Grade Released */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-800 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 uppercase">
                Đánh Giá & Phân Loại Cấp Vỏ Sạch:
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-black rounded text-[11px] font-mono">
                GRADE A &bull; CARGO WORTHY (SẴN SÀNG CẤP TRẢ)
              </span>
            </div>
            <p className="text-emerald-100 font-medium">
              &ldquo;{record.inspectorComments || 'Thử kín sáng hoàn hảo, không có tia sáng lọt qua. Mối hàn gọt phẳng sơn phủ chống rỉ đồng nhất. Sàn gỗ sạch phẳng, đủ tiêu chuẩn cấp hàng xuất khẩu.'}&rdquo;
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-800 text-xs">
            <div className="text-center space-y-8">
              <div>
                <span className="font-bold text-slate-200 block">ĐẠI DIỆN TỔ THỢ CƠ KHÍ EMR</span>
                <span className="text-[10px] text-slate-500">(Ký & ghi rõ họ tên)</span>
              </div>
              <div className="font-bold font-mono text-white pt-6">
                {record.technicianName || 'Hoàng Văn Sơn'}
              </div>
            </div>

            <div className="text-center space-y-8">
              <div>
                <span className="font-bold text-emerald-300 block">GIÁM SÁT NGHIỆM THU QC (CHÍNH THỨC)</span>
                <span className="text-[10px] text-slate-500">(Ký điện tử & đóng dấu chứng nhận)</span>
              </div>
              <div className="space-y-1">
                <div className="inline-block px-3 py-1 bg-emerald-600 text-white font-mono font-bold text-xs rounded tracking-widest uppercase">
                  VERIFIED BY QC
                </div>
                <div className="font-black font-mono text-white pt-1">
                  {record.inspectorName || 'Vũ Quốc Việt (IICL Certified)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
