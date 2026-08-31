import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Server,
  ArrowRight,
  ShieldCheck,
  Code,
  Download,
  Terminal,
  Activity
} from 'lucide-react';
import { CarrierApiLogRecord } from '../types/shippingApi';

interface ApiLogDetailModalProps {
  log: CarrierApiLogRecord;
  onClose: () => void;
}

export const ApiLogDetailModal: React.FC<ApiLogDetailModalProps> = ({ log, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'RESPONSE' | 'REQUEST' | 'HEADERS'>('RESPONSE');
  const [copied, setCopied] = useState(false);

  const isSuccess = log.responseStatusCode >= 200 && log.responseStatusCode < 300;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPayloadToCopy = () => {
    if (activeSubTab === 'RESPONSE') return JSON.stringify(log.responsePayload, null, 2);
    if (activeSubTab === 'REQUEST') return JSON.stringify(log.requestPayload, null, 2);
    return JSON.stringify(log.requestHeaders, null, 2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl border ${
                isSuccess
                  ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-600/20 border-rose-500/30 text-rose-400'
              }`}
            >
              {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  Chi Tiết Nhật Ký API Giao Dịch: {log.transactionRef}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${
                    isSuccess
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  HTTP {log.responseStatusCode} {log.responseStatusText}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>Hãng tàu: <strong className="text-blue-400">{log.carrierName}</strong></span>
                <span>&bull;</span>
                <span>Thời gian: <strong className="text-slate-300">{log.timestamp}</strong></span>
                <span>&bull;</span>
                <span>Độ trễ: <strong className="text-amber-400">{log.latencyMs} ms</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Endpoint & ACK Ribbon */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono flex-wrap gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 font-black rounded border border-blue-500/40">
              {log.httpMethod}
            </span>
            <span className="text-slate-400 break-all">{log.endpointUrl}</span>
          </div>

          {log.ackReferenceNo && (
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-800/50">
              <ShieldCheck className="w-4 h-4" />
              <span>ACK REF: <strong>{log.ackReferenceNo}</strong></span>
            </div>
          )}
        </div>

        {/* Container tags in this transmission */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Containers ({log.containerCount}):</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {log.containerNos.map((no) => (
              <span
                key={no}
                className="px-2 py-0.5 bg-slate-950 text-white font-mono text-[11px] font-bold rounded border border-slate-700"
              >
                {no}
              </span>
            ))}
          </div>
        </div>

        {/* Tab switchers */}
        <div className="px-6 pt-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('RESPONSE')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'RESPONSE'
                  ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>1. Kết Quả API Trả Về (Response JSON)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('REQUEST')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'REQUEST'
                  ? 'bg-slate-900 text-blue-400 border-t border-x border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>2. Dữ Liệu Đã Gửi Đi (Request Body)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('HEADERS')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'HEADERS'
                  ? 'bg-slate-900 text-purple-400 border-t border-x border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>3. HTTP Headers</span>
            </button>
          </div>

          <button
            onClick={() => handleCopy(getPayloadToCopy())}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700 mb-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã Sao Chép' : 'Sao Chép JSON'}</span>
          </button>
        </div>

        {/* Content Viewer Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-200 scrollbar-thin">
          {activeSubTab === 'RESPONSE' && (
            <div className="space-y-4">
              {/* Summary banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-2 ${
                  isSuccess
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">
                    Trạng thái kết nối API: {isSuccess ? 'Thành công (200 OK)' : 'Lỗi phản hồi'}
                  </span>
                </div>
                <span className="text-[11px] opacity-90">
                  Thời gian máy chủ hãng xử lý: {log.latencyMs} ms
                </span>
              </div>

              <pre className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-emerald-400 leading-relaxed overflow-x-auto select-all">
                {JSON.stringify(log.responsePayload, null, 2)}
              </pre>
            </div>
          )}

          {activeSubTab === 'REQUEST' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl text-xs text-blue-200 flex items-center justify-between">
                <span>Payload đóng gói theo chuẩn REST API Hãng tàu M&amp;R v3</span>
                <span className="text-[11px] text-blue-300 font-mono">Format: Application/JSON</span>
              </div>

              <pre className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-blue-300 leading-relaxed overflow-x-auto select-all">
                {JSON.stringify(log.requestPayload, null, 2)}
              </pre>
            </div>
          )}

          {activeSubTab === 'HEADERS' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 font-mono text-xs">
                {Object.entries(log.requestHeaders).map(([key, val]) => (
                  <div key={key} className="py-2.5 flex items-center justify-between gap-4">
                    <span className="text-purple-400 font-bold">{key}:</span>
                    <span className="text-slate-300 text-right break-all max-w-lg">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Người thực hiện truyền: <strong className="text-white">{log.triggeredBy}</strong>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
