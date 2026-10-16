import React, { useState } from 'react';
import { EstimateApiTransaction } from '../types';
import { 
  Server, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  X, 
  Code, 
  Send, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ApiTransactionDetailModalProps {
  transaction: EstimateApiTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApiTransactionDetailModal: React.FC<ApiTransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const isSuccess = transaction.status === 'SUCCESS' && transaction.httpStatusCode === 200;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${
              isSuccess 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}>
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  HTTP {transaction.httpStatusCode} &bull; {transaction.status}
                </span>
                <span className="text-xs font-mono text-slate-500">Lần gửi #{transaction.attemptNo}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Chi Tiết Bản Tin API Transaction Maersk EMR
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Request ID</div>
              <div className="font-mono text-xs font-bold text-cyan-700 truncate" title={transaction.requestId}>
                {transaction.requestId}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Transaction ID</div>
              <div className="font-mono text-xs font-bold text-purple-700 truncate" title={transaction.transactionId}>
                {transaction.transactionId}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Thời Gian Gửi</div>
              <div className="font-mono text-xs text-slate-700">
                {transaction.timestamp}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Độ Trễ (Latency)</div>
              <div className="font-mono text-xs font-bold text-amber-700 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" />
                <span>{transaction.latencyMs} ms</span>
              </div>
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                {transaction.httpMethod}
              </span>
              <span className="text-slate-700">{transaction.endpoint}</span>
            </div>
            <span className="text-slate-500">Người gửi: {transaction.operator}</span>
          </div>

          {/* Error Banner if any */}
          {transaction.errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1 text-xs">
              <div className="font-bold text-rose-700 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Mã Lỗi: {transaction.errorCode || 'ERR_UNKNOWN'} (HTTP {transaction.httpStatusCode})</span>
              </div>
              <div className="text-rose-200">{transaction.errorMessage}</div>
            </div>
          )}

          {/* Side by Side: Request vs Response Payloads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Request */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 uppercase flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Payload (CEDEX / JSON)</span>
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(transaction.requestPayload, null, 2), 'REQ')}
                  className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedSection === 'REQ' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'REQ' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              <pre className="p-3 bg-white rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 overflow-x-auto max-h-80 leading-relaxed">
                {JSON.stringify(transaction.requestPayload, null, 2)}
              </pre>
            </div>

            {/* Response */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase flex items-center gap-1.5 ${
                  isSuccess ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Maersk API Response</span>
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(transaction.responsePayload, null, 2), 'RES')}
                  className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedSection === 'RES' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'RES' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              <pre className="p-3 bg-white rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 overflow-x-auto max-h-80 leading-relaxed">
                {JSON.stringify(transaction.responsePayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Dữ liệu API Transaction được lưu trữ phục vụ đối soát, tra cứu &amp; kiểm toán EMR.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
