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
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-emerald-950/70 border-emerald-500/40 text-emerald-400 ${
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
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-amber-950/70 border-amber-500/40 text-amber-300 ${
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
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-rose-950/70 border-rose-500/40 text-rose-400 ${
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
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border bg-slate-800 border-slate-700 text-slate-400 ${
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-900/50 text-rose-300 border border-rose-600/40">
          <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
          HIGH
        </span>
      );
    case 'NORMAL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-sky-900/40 text-sky-300 border border-sky-600/30">
          NORMAL
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-slate-800 text-slate-400 border border-slate-700">
          LOW
        </span>
      );
  }
};

export const ChannelBadge: React.FC<{ channel: NotificationChannel }> = ({ channel }) => {
  switch (channel) {
    case 'ZALO_OA':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/40">
          <MessageCircle className="w-3 h-3 text-blue-400" />
          Zalo OA
        </span>
      );
    case 'ZALO_ZNS':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-sky-600/20 text-sky-300 border border-sky-500/40">
          <Smartphone className="w-3 h-3 text-sky-400" />
          Zalo ZNS
        </span>
      );
    case 'IN_APP':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40">
          <Bell className="w-3 h-3 text-indigo-400" />
          In-App
        </span>
      );
    case 'SMS':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40">
          <Smartphone className="w-3 h-3 text-emerald-400" />
          SMS
        </span>
      );
    case 'EMAIL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-purple-600/20 text-purple-300 border border-purple-500/40">
          <Mail className="w-3 h-3 text-purple-400" />
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
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500" />
          {showLabel && 'Đã kết nối'}
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          {showLabel && 'Chưa xác nhận'}
        </span>
      );
    case 'DISCONNECTED':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          {showLabel && 'Không hoạt động'}
        </span>
      );
  }
};
