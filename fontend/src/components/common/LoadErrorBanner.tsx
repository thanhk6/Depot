import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface LoadErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

// Banner lỗi tải dữ liệu dùng chung — để người dùng phân biệt "lỗi kết nối/không có quyền" với "thật sự không có
// dữ liệu" (BUG-016). Nội dung lấy từ getApiErrorMessage (utils/apiError.ts).
export const LoadErrorBanner: React.FC<LoadErrorBannerProps> = ({ message, onRetry }) => (
  <div role="alert" className="flex items-start gap-3 p-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C] text-xs">
    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <div className="font-bold">Không tải được dữ liệu</div>
      <div className="break-words">{message}</div>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#FECACA] font-semibold hover:bg-[#FEE2E2] transition cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Thử lại
      </button>
    )}
  </div>
);
