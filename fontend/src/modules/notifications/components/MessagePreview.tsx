import React from 'react';
import {
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Clock,
  Sparkles,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { NotificationChannel } from '../models/notification.types';

interface MessagePreviewProps {
  channel: NotificationChannel;
  title: string;
  content: string;
  recipientName?: string;
  recipientPhone?: string;
  ctaText?: string;
  ctaUrl?: string;
  timeString?: string;
}

export const MessagePreview: React.FC<MessagePreviewProps> = ({
  channel,
  title,
  content,
  recipientName = 'Người nhận',
  recipientPhone = '',
  ctaText = 'Xem chi tiết trên Depot System',
  timeString = 'Vừa xong'
}) => {
  return (
    <div className="bg-[#070c1e] border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center justify-center">
      {/* Smartphone Frame Outer Mockup */}
      <div className="w-full max-w-[340px] bg-[#0e1626] border-4 border-slate-200 rounded-[36px] shadow-2xl overflow-hidden flex flex-col relative text-slate-100">
        {/* Notch / Speaker bar */}
        <div className="h-6 bg-white flex items-center justify-between px-6 text-[10px] text-slate-500 select-none">
          <span className="font-semibold text-slate-900">09:41</span>
          <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-700" />
            <Wifi className="w-3 h-3 text-slate-700" />
            <Battery className="w-3.5 h-3.5 text-slate-700" />
          </div>
        </div>

        {/* Zalo Top App Bar */}
        <div className="bg-[#0068ff] px-4 py-2.5 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow">
              <span className="text-[#0068ff] font-extrabold text-xs">EMR</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900">EMR Depot Official</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-700 fill-yellow-300" />
              </div>
              <span className="text-[10px] text-blue-100 block -mt-0.5">Tài khoản Doanh Nghiệp Xác Thực</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-white font-bold">
            {channel === 'ZALO_ZNS' ? 'ZNS Template' : 'Zalo OA'}
          </span>
        </div>

        {/* Recipient info indicator bar */}
        <div className="bg-white px-3 py-1.5 border-b border-slate-200 text-[10px] text-slate-700 flex items-center justify-between">
          <span className="truncate">Gửi đến: <strong className="text-sky-700">{recipientName}</strong></span>
          <span className="font-mono text-slate-500">{recipientPhone}</span>
        </div>

        {/* Chat Body Mockup Area */}
        <div className="p-3 bg-[#e8edf2] min-h-[380px] max-h-[460px] overflow-y-auto flex flex-col justify-start gap-2.5 text-slate-800 font-sans">
          {/* Date separator */}
          <div className="flex justify-center my-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-300/80 text-[9px] font-bold text-slate-600">
              Hôm nay, 17 tháng 8 2026
            </span>
          </div>

          {/* Official Zalo Notification Card Bubble */}
          <div className="bg-white rounded-2xl p-3.5 shadow-md border border-slate-200/90 flex flex-col gap-2 relative animate-fade-in">
            {/* Header / Title */}
            <div className="flex items-start gap-2 pb-2 border-b border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-snug">
                  {title || '🔔 [THÔNG BÁO TỰ ĐỘNG EMR DEPOT]'}
                </h4>
                <span className="text-[9px] text-slate-500 block mt-0.5">Thông báo hệ thống quản lý Depot Container</span>
              </div>
            </div>

            {/* Message Body Content */}
            <div className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed font-normal py-1">
              {content || 'Chọn mẫu thông báo hoặc nhập nội dung tùy chỉnh để xem trước tại đây...'}
            </div>

            {/* CTA Action Button */}
            {ctaText && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  className="w-full py-2 px-3 bg-[#0068ff] hover:bg-[#0057d6] text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98"
                >
                  <span>{ctaText}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Footer timestamp & security note */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Tin nhắn tự động bảo mật
              </span>
              <span>{timeString}</span>
            </div>
          </div>
        </div>

        {/* Phone Bottom Home Bar */}
        <div className="h-6 bg-white flex items-center justify-center">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
