import React from 'react';
import { QrCode } from 'lucide-react';

// Thay cho mã QR + thông tin ngân hàng gõ cứng trước đây (Vietcombank CN Tân Cảng, STK 0071001234567, chủ TK
// "STB DEPOT LOGISTICS"). Mã cũ chỉ mã hoá chuỗi "STB_DEPOT_NAPAS_..." qua api.qrserver.com — không phải VietQR
// chuyển khoản được, và số tài khoản là bịa, có thể khiến khách chuyển nhầm. Hệ thống chưa có cấu hình tài khoản
// nhận tiền trong database nên không hiển thị QR; thu tiền rồi bấm xác nhận như thanh toán thủ công.
export const VietQrNotConfigured: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`mx-auto text-center rounded-2xl border border-dashed border-slate-300 bg-white ${compact ? 'p-3 max-w-[180px]' : 'p-5 max-w-xs'} space-y-2`}>
    <QrCode className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} mx-auto text-slate-300`} />
    <div className="text-xs font-bold text-slate-700">Chưa cấu hình tài khoản nhận tiền VietQR</div>
    {!compact && (
      <div className="text-[11px] text-slate-500">
        Chưa có tài khoản ngân hàng nhận thanh toán trong hệ thống nên không tạo mã QR. Thu tiền rồi bấm xác nhận thanh toán.
      </div>
    )}
  </div>
);
