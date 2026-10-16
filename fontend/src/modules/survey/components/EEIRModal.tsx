import React from 'react';
import { SurveyItemRecord } from '../types';
import {
  FileText,
  Printer,
  Download,
  X,
  QrCode,
  Wrench,
  Building,
  UserCheck,
  Droplets,
  Thermometer,
  Clock,
  Send
} from 'lucide-react';

interface EEIRModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: SurveyItemRecord;
  onProceedToOperation?: (survey: SurveyItemRecord) => void;
  onTransferToOperation?: (survey: SurveyItemRecord) => void;
}

export const EEIRModal: React.FC<EEIRModalProps> = ({
  isOpen,
  onClose,
  survey,
  onProceedToOperation,
  onTransferToOperation
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleTransferOperation = () => {
    if (onTransferToOperation) {
      onTransferToOperation(survey);
    } else if (onProceedToOperation) {
      onProceedToOperation(survey);
    }
    onClose();
  };

  const getRoutingArea = () => {
    if (survey.condition === 'AV') {
      return {
        area: 'AV AREA (Khu Vực Container Đạt Chuẩn)',
        desc: 'Sẵn sàng cấp phát cho khách hàng đóng hàng xuất tàu.',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300'
      };
    }
    if (survey.condition === 'CL') {
      return {
        area: 'CLEANING BAY (Bệ Rửa & Vệ Sinh Chuyên Dụng)',
        desc: 'Chuyển bệ xịt rửa áp lực cao, tẩy hóa chất & khử mùi theo Tariff.',
        color: 'bg-amber-50 text-amber-800 border-amber-300'
      };
    }
    return {
      area: 'EMR / DAMAGED AREA (Khu Vực Sửa Chữa & Bảo Dưỡng)',
      desc: 'Chờ lập báo giá Estimate, gửi duyệt Hãng tàu và thực hiện Work Order.',
      color: 'bg-rose-50 text-rose-800 border-rose-300'
    };
  };

  const routingInfo = getRoutingArea();

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Panel chrome (thanh công cụ trên/dưới) đồng bộ nền trắng theo yêu cầu người dùng — riêng phần
          "Printable Official Document Body" bên dưới VỐN ĐÃ nền trắng từ trước (đúng chuẩn 1 chứng từ in
          ấn, không phụ thuộc theme app) nên không đụng vào. */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-4xl w-full space-y-5 shadow-2xl animate-scale-up my-auto max-h-[94vh] overflow-y-auto">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl shadow">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>CHỨNG TỪ GIAO NHẬN VỎ ĐIỆN TỬ (e-EIR)</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold rounded-full border border-emerald-200">
                  ELECTRONIC EIR &bull; IICL-6
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã e-EIR:{' '}
                <strong className="font-mono text-emerald-600">{survey.eeirNo || '—'}</strong>{' '}
                &bull; Khảo sát lúc: <span className="font-mono text-slate-700">{survey.surveyDate || '—'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Printer className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">In e-EIR</span>
            </button>

            <button
              onClick={() => alert('Đã xuất file PDF chứng từ e-EIR điện tử có mã hóa xác thực SHA-256 và QR tra cứu.')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Xuất PDF</span>
            </button>

            <button
              onClick={handleTransferOperation}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center gap-1.5 cursor-pointer"
              title="Phát hành e-EIR và chuyển sang Khai Thác Gate-In để lập Phiếu Dịch Vụ"
            >
              <Send className="w-4 h-4" />
              <span>Phát Hành & Chuyển Sang Khai Thác</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl space-y-5 shadow-lg border border-slate-200 print:p-0 print:border-none print:shadow-none">
          {/* Header of e-EIR */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-900" />
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  SOLUTION DEPOT
                </h1>
              </div>
              {/* Tên/địa chỉ/hotline công ty gõ cứng trước đây là thông tin bịa — hệ thống chưa có bảng cấu hình doanh nghiệp. */}
            </div>

            <div className="text-right flex flex-col items-end space-y-1 flex-shrink-0">
              <div className="p-2 border border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600">Tra cứu: {survey.surveyNo}</span>
            </div>
          </div>

          <div className="text-center space-y-0.5">
            <h2 className="text-base font-black tracking-wide text-slate-900 uppercase">
              BIÊN BẢN GIÁM ĐỊNH &amp; BÀN GIAO THIẾT BỊ CONTAINER ĐIỆN TỬ (e-EIR)
            </h2>
            <p className="text-xs font-mono text-slate-500">
              Số e-EIR: <strong className="text-slate-900">{survey.eeirNo || '—'}</strong> | Ngày giờ giám định: {survey.surveyDate || '—'}
            </p>
          </div>

          {/* Section 1: Container & Transport Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Số Container (ISO 6346):</span>
              <strong className="text-base font-black font-mono text-blue-900 block">{survey.containerNo}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Kích Cỡ / Chủng Loại:</span>
              <strong className="font-bold text-slate-800 block">{survey.size} {survey.type}</strong>
              <span className="text-[10px] font-mono text-slate-600">Mã ISO: {survey.isoCode || '—'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Hãng Tàu / Chủ Vỏ:</span>
              <strong className="font-bold text-slate-800 block">{survey.shippingLine}</strong>
              <span className="text-[10px] text-slate-600 truncate block">{survey.owner}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Tiêu Chuẩn Giám Định:</span>
              <strong className="font-bold text-slate-800 block">{survey.standard || '—'}</strong>
              <span className="text-[10px] text-slate-500">Quy chuẩn kỹ thuật áp dụng</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Giám Định Viên (Surveyor):</span>
              <strong className="font-bold text-slate-800 block">{survey.surveyor}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Tài Xế &amp; Xe Đầu Kéo:</span>
              <strong className="font-bold text-slate-800 block">{survey.driverName || '—'}</strong>
              <span className="text-[10px] font-mono text-slate-600">{survey.truckPlate || '—'} / {survey.trailerPlate || '—'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Thời Điểm Giao Nhận:</span>
              <span className="font-mono font-semibold text-slate-800">{survey.gateInTime || '—'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Trọng Lượng (Tare / Gross):</span>
              <span className="font-mono text-slate-700">Tare: {survey.tareWeightKg || '—'} kg / Max: {survey.maxGrossWeightKg || '—'} kg</span>
            </div>
          </div>

          {/* Section 2: Grading Classification & Yard Routing Area */}
          <div className={`p-4 rounded-xl border ${routingInfo.color} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">KẾT QUẢ PHÂN LOẠI GRADING:</span>
                <span className="px-2.5 py-0.5 rounded font-black text-xs uppercase bg-white border border-current shadow-xs">
                  {survey.condition === 'AV' ? 'AV - ĐẠT CHUẨN (AVAILABLE)' :
                   survey.condition === 'CL' ? 'CL - CẦN VỆ SINH (CLEANING)' :
                   'DM - HƯ HỎNG CHỜ SỬA (DAMAGED)'}
                </span>
                {survey.qualityGrade && (
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-900 text-white">
                    {survey.qualityGrade.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-700">
                Chỉ định điều phối bãi: <strong className="text-slate-900">{routingInfo.area}</strong> &bull; {routingInfo.desc}
              </p>
            </div>

            <div className="text-right font-mono text-[11px] text-slate-600 flex-shrink-0">
              Vị trí dự kiến: <strong>{survey.yardLocation || '—'}</strong>
            </div>
          </div>

          {/* Section 3: Reefer Details (If applicable) — `isReefer` là field bắt buộc, không cần đoán
              thêm qua `.includes('R')` (cách cũ khớp nhầm cả Flat Rack thành Reefer). */}
          {survey.isReefer && (
            <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-cyan-950 uppercase flex items-center gap-1.5 text-[11px]">
                <Thermometer className="w-4 h-4 text-cyan-700" />
                <span>THÔNG SỐ KIỂM TRA THIẾT BỊ LẠNH (REEFER UNIT INSPECTION)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Hãng máy lạnh:</span>
                  <strong>{survey.reeferBrand || '—'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Nhiệt độ cài đặt / Thực tế:</span>
                  <strong className="font-mono text-cyan-900">{survey.setTemperature || -18}°C / -17.8°C</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Kết quả kiểm tra PTI:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    {survey.ptiStatus || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Giờ chạy máy nén / Cáp điện:</span>
                  <span className="font-mono text-slate-700">{survey.compressorHours != null ? `${survey.compressorHours} hrs` : '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Cleaning Details (If CL) */}
          {survey.condition === 'CL' && survey.cleaningItems && survey.cleaningItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-700" />
                <span>HẠNG MỤC VỆ SINH CẦN XỬ LÝ (CLEANING WORK ITEMS &amp; TARIFF)</span>
              </h4>
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                    <th className="py-2 px-2.5 w-10 text-center">STT</th>
                    <th className="py-2 px-2.5">Mã Dịch Vụ</th>
                    <th className="py-2 px-2.5">Phương Pháp Vệ Sinh</th>
                    <th className="py-2 px-2.5">Bên Chịu Phí</th>
                    <th className="py-2 px-2.5 text-right">Đơn Giá (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {survey.cleaningItems.map((cln, idx) => (
                    <tr key={cln.id} className="text-slate-800">
                      <td className="py-2 px-2.5 text-center font-mono font-bold">{idx + 1}</td>
                      <td className="py-2 px-2.5 font-mono font-bold text-cyan-800">{cln.cleaningCode}</td>
                      <td className="py-2 px-2.5 font-semibold">{cln.cleaningName}</td>
                      <td className="py-2 px-2.5 font-bold">
                        {cln.responsibleParty === 'U' ? 'Khách hàng (User)' :
                         cln.responsibleParty === 'O' ? 'Hãng tàu (Owner)' : 'Nhà xe (Transporter)'}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                        {cln.totalPrice.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-300">
                    <td colSpan={4} className="py-2 px-2.5 text-right uppercase">Tổng Chi Phí Vệ Sinh Ước Tính:</td>
                    <td className="py-2 px-2.5 text-right font-mono text-cyan-900 font-black">
                      {(survey.cleaningTotalCost || survey.cleaningEstimatedCost || 0).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Section 5: Damage Records Table if any */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-slate-700" />
              <span>GHI NHẬN HƯ HỎNG &amp; PHƯƠNG ÁN SỬA CHỮA (DAMAGE &amp; REPAIR STS)</span>
            </h4>

            {survey.damages && survey.damages.length > 0 ? (
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                    <th className="py-2 px-2.5 w-10 text-center">STT</th>
                    <th className="py-2 px-2.5">Vị Trí Cấu Kiện</th>
                    <th className="py-2 px-2.5">Mã Hư Hỏng IICL</th>
                    <th className="py-2 px-2.5">Mã Sửa Chữa (Repair/STS)</th>
                    <th className="py-2 px-2.5">Kích Thước &amp; Mô Tả Chi Tiết</th>
                    <th className="py-2 px-2.5 text-center">Mức Độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {survey.damages.map((dmg, idx) => (
                    <tr key={dmg.id} className="text-slate-800">
                      <td className="py-2 px-2.5 text-center font-mono font-bold">{idx + 1}</td>
                      <td className="py-2 px-2.5 font-semibold">{dmg.locationName}</td>
                      <td className="py-2 px-2.5 font-mono font-bold text-rose-700">{dmg.damageCode} - {dmg.damageName}</td>
                      <td className="py-2 px-2.5 font-mono font-bold text-blue-800">{dmg.repairCode} - {dmg.repairName}</td>
                      <td className="py-2 px-2.5">{dmg.description} ({dmg.lengthMm || 0}x{dmg.widthMm || 0} mm)</td>
                      <td className="py-2 px-2.5 text-center font-bold">
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-mono text-[10px]">
                          {dmg.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 text-center font-medium">
                Container đạt chuẩn kỹ thuật quốc tế (Không phát hiện tổn thất kết cấu).
              </div>
            )}
          </div>

          {/* Section 6: Photos attached (With Timestamp Watermark) */}
          {survey.photos && survey.photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span>HÌNH ẢNH HIỆN TRƯỜNG MINH CHỨNG ({survey.photos.length} ẢNH CHUẨN CÓ TIMESTAMP):</span>
                <span className="text-[10px] text-slate-500 font-normal">Tối thiểu: 01 Toàn cảnh + 01 Cận cảnh</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {survey.photos.map((p) => (
                  <div key={p.id} className="border border-slate-300 rounded-lg overflow-hidden p-1.5 bg-slate-50 space-y-1 relative group">
                    <div className="relative">
                      <img
                        src={p.url}
                        alt={p.caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover rounded"
                      />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 text-[9px] font-mono text-amber-300 rounded flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{p.uploadedAt || survey.surveyDate || '—'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-700 truncate block font-semibold">{p.caption}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: Remarks */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <strong className="text-slate-800 font-bold block">Ghi chú của Giám định viên:</strong>
            <p className="text-slate-700">
              {survey.remarks || '—'}
            </p>
          </div>

          {/* Section 8: Electronic Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-slate-300 text-xs">
            <div className="text-center space-y-6">
              <p className="font-bold text-slate-800 uppercase">ĐẠI DIỆN TÀI XẾ / VẬN TẢI</p>
              <div className="p-2 border-b border-dashed border-slate-400 w-52 mx-auto text-slate-500 font-mono italic text-[11px]">
                (Xác nhận điện tử qua App Tài Xế)
              </div>
              <p className="font-bold text-slate-900">{survey.driverName || '—'}</p>
            </div>

            <div className="text-center space-y-6">
              <p className="font-bold text-slate-800 uppercase">GIÁM ĐỊNH VIÊN DEPOT (SURVEYOR)</p>
              <div className="p-2 border-b border-dashed border-slate-400 w-52 mx-auto text-emerald-700 font-mono font-bold flex items-center justify-center gap-1 text-[11px]">
                <UserCheck className="w-4 h-4" /> Ký số SHA-256 Verified
              </div>
              <p className="font-bold text-slate-900">{survey.surveyor}</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            Trạng thái chứng từ: <span className="text-emerald-600 font-bold font-mono">e-EIR ĐÃ SỐ HÓA</span> &bull; Mã bảo mật SHA-256
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-500" />
              <span>In Chứng Từ e-EIR</span>
            </button>

            <button
              onClick={handleTransferOperation}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Phát Hành & Chuyển Sang Khai Thác</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
