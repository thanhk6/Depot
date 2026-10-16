import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Slash,
  MessageCircle,
  Smartphone,
  Bell,
  Mail,
  AlertTriangle
} from 'lucide-react';
import {
  NotificationStatus,
  NotificationPriority,
  NotificationChannel,
  ZaloConnectionStatus
} from '../models/notification.types';

export const StatusBadge: React.FC<{ status: NotificationStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md'
}) => {
  const isSm = size === 'sm';
  switch (status) {
    case 'SENT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-emerald-50 border-emerald-200 text-emerald-600 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>SENT</span>
        </span>
      );
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-amber-50 border-amber-200 text-amber-700 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Clock className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} animate-spin`} />
          <span>PENDING</span>
        </span>
      );
    case 'FAILED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-rose-50 border-rose-200 text-rose-600 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <XCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>FAILED</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-slate-100 border-slate-200 text-slate-500 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Slash className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>CANCELLED</span>
        </span>
      );
    default:
      return null;
  }
};

export const PriorityBadge: React.FC<{ priority: NotificationPriority }> = ({ priority }) => {
  switch (priority) {
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
          HIGH
        </span>
      );
    case 'NORMAL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-sky-100 text-sky-700 border border-sky-200">
          NORMAL
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-slate-100 text-slate-500 border border-slate-200">
          LOW
        </span>
      );
  }
};

export const ChannelBadge: React.FC<{ channel: NotificationChannel }> = ({ channel }) => {
  switch (channel) {
    case 'ZALO_OA':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <MessageCircle className="w-3 h-3 text-blue-600" />
          Zalo OA
        </span>
      );
    case 'ZALO_ZNS':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <Smartphone className="w-3 h-3 text-sky-600" />
          Zalo ZNS
        </span>
      );
    case 'IN_APP':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Bell className="w-3 h-3 text-indigo-600" />
          In-App
        </span>
      );
    case 'SMS':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Smartphone className="w-3 h-3 text-emerald-600" />
          SMS
        </span>
      );
    case 'EMAIL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Mail className="w-3 h-3 text-purple-600" />
          Email
        </span>
      );
  }
};

export const ZaloStatusBadge: React.FC<{ status: ZaloConnectionStatus; showLabel?: boolean }> = ({
  status,
  showLabel = true
}) => {
  switch (status) {
    case 'CONNECTED':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm " />
          {showLabel && 'Đã kết nối'}
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          {showLabel && 'Chưa xác nhận'}
        </span>
      );
    case 'DISCONNECTED':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          {showLabel && 'Không hoạt động'}
        </span>
      );
  }
};
