import React, { useState } from 'react';
import { X, Copy, Check, CheckCircle2, AlertCircle, Send, Server } from 'lucide-react';
import type { ShippingSyncLogItem } from '../../../api';
import { logStatusLabel, formatLogTime, prettyJson } from '../utils/shippingLog';

interface ApiLogDetailModalProps {
  log: ShippingSyncLogItem;
  onClose: () => void;
}

// Chi tiết 1 lần gửi thật: nội dung JSON đã gửi + phản hồi nguyên văn của hãng tàu (lưu ở bảng ShippingSyncLogs).
export const ApiLogDetailModal: React.FC<ApiLogDetailModalProps> = ({ log, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'RESPONSE' | 'REQUEST'>('RESPONSE');
  const [copied, setCopied] = useState(false);
  const isSuccess = log.status === 'SENT';
  const content = activeSubTab === 'RESPONSE' ? prettyJson(log.responseBody) : prettyJson(log.requestBody);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
              {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {log.containerNo} → {log.carrierCode} <span className="font-mono text-sm text-slate-500">({log.eventType})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {logStatusLabel(log)} &bull; {formatLogTime(log.syncedAt)}
                {log.latencyMs != null && <> &bull; {log.latencyMs} ms</>}
                {log.triggeredBy && <> &bull; {log.triggeredBy}</>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 break-all">
              <span className="text-slate-500 block mb-0.5">Endpoint</span>
              <span className="font-mono text-slate-900">{log.endpointUrl ? `POST ${log.endpointUrl}` : '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Mã xác nhận từ hãng tàu</span>
              <span className="font-mono font-bold text-emerald-700">{log.ackToken || '—'}</span>
            </div>
          </div>

          {log.errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">{log.errorMessage}</div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {(['RESPONSE', 'REQUEST'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeSubTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab === 'RESPONSE' ? <Server className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{tab === 'RESPONSE' ? 'Phản hồi hãng tàu' : 'Nội dung đã gửi'}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              disabled={!content}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed max-h-96 overflow-auto whitespace-pre-wrap break-all">
            {content || (activeSubTab === 'RESPONSE' ? 'Không có phản hồi (không kết nối được hoặc hãng tàu không trả nội dung).' : 'Không có nội dung.')}
          </pre>
        </div>
      </div>
    </div>
  );
};
