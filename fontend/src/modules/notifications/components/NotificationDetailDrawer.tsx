import React from 'react';
import {
  X,
  Send,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode,
  User,
  Phone,
  MessageCircle,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NotificationRecord } from '../models/notification.types';
import { StatusBadge, PriorityBadge, ChannelBadge } from './NotificationStatus';

interface NotificationDetailDrawerProps {
  notification: NotificationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onResend?: (id: string) => void;
  onNavigateEntity?: (entityType: string, entityId: string) => void;
}

export const NotificationDetailDrawer: React.FC<NotificationDetailDrawerProps> = ({
  notification,
  isOpen,
  onClose,
  onResend,
  onNavigateEntity
}) => {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-50 backdrop-blur-sm flex justify-end animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#091024] border-l border-slate-200 h-full shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#0d1633] border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Chi Tiết Thông Báo</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-sky-700">
                  {notification.trackingCode}
                </span>
              </h3>
              <p className="text-xs text-slate-500">Giao dịch gửi tin qua cổng Zalo Gateway</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {/* Status & Priority Ribbon */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StatusBadge status={notification.status} />
              <PriorityBadge priority={notification.priority} />
              <ChannelBadge channel={notification.channel} />
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Số lần thử lại:</span>
              <span className="font-mono font-bold text-xs text-slate-700">
                {notification.retryCount} / {notification.maxRetries} lần
              </span>
            </div>
          </div>

          {/* Error Message Alert (if Failed) */}
          {notification.status === 'FAILED' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-rose-200">Chi Tiết Lỗi Zalo Gateway</h5>
                  <p className="text-xs mt-1 text-rose-700 font-mono">
                    {notification.errorMessage || 'Lỗi không xác định khi kết nối cổng Zalo API.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recipient Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Người Nhận</span>
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{notification.recipientName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  <span>{notification.recipientPhone}</span>
                </p>
                {notification.recipientZaloId && (
                  <p className="text-xs text-blue-600 font-mono mt-0.5">
                    Zalo: {notification.recipientZaloId}
                  </p>
                )}
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {notification.recipientType === 'EMPLOYEE' ? 'Nhân Viên Depot' : 'Khách Hàng / Hãng Tàu'}
                </span>
              </div>
            </div>

            {/* Time & Schedule Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Thời Gian Xử Lý</span>
              </span>
              <div className="text-xs space-y-1">
                <p className="text-slate-700">
                  <span className="text-slate-500">Tạo lúc:</span> {notification.createdAt}
                </p>
                {notification.sentAt && (
                  <p className="text-emerald-600">
                    <span className="text-slate-500">Gửi lúc:</span> {notification.sentAt}
                  </p>
                )}
                {notification.failedAt && (
                  <p className="text-rose-600">
                    <span className="text-slate-500">Thất bại:</span> {notification.failedAt}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Linked Business Entity Box */}
          {notification.entityType && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-200/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 font-bold uppercase">Nghiệp Vụ Liên Kết (Entity)</span>
                  <p className="text-xs font-bold text-slate-900">
                    {notification.entityType}: <span className="text-sky-700 font-mono">{notification.entityReference || notification.entityId}</span>
                  </p>
                </div>
              </div>

              {onNavigateEntity && notification.entityId && (
                <button
                  type="button"
                  onClick={() => onNavigateEntity(notification.entityType!, notification.entityId!)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <span>Mở {notification.entityType}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Message Content Render */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span className="text-xs font-extrabold uppercase text-slate-700">Nội Dung Tin Nhắn Đã Gửi</span>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              <div className="font-bold text-sky-600 mb-2 pb-1 border-b border-slate-200">
                {notification.title}
              </div>
              {notification.content}
            </div>
          </div>

          {/* Raw Request / Response JSON Payloads */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-600" />
              <span>Dữ Liệu Kỹ Thuật (Payload API)</span>
            </span>

            <div className="space-y-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block mb-1">Request Body:</span>
                <pre className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sky-700 overflow-x-auto">
                  {JSON.stringify(
                    notification.requestPayload || {
                      recipient: notification.recipientZaloId || notification.recipientPhone,
                      template: notification.templateCode,
                      title: notification.title
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Gateway Response:</span>
                <pre className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-emerald-600 overflow-x-auto">
                  {JSON.stringify(
                    notification.responsePayload || {
                      error: notification.status === 'FAILED' ? 108 : 0,
                      message: notification.status === 'FAILED' ? 'Fail' : 'Success',
                      tracking_id: notification.trackingCode
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 bg-[#0d1633] border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Đóng
          </button>

          {notification.status === 'FAILED' && onResend && (
            <button
              onClick={() => {
                onResend(notification.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg "
            >
              <RotateCcw className="w-4 h-4" />
              <span>Gửi Lại Ngay (Resend)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
