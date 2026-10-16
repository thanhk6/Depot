import React, { useState, useEffect } from 'react';
import { billingApi } from '../../../api';
import {
  X,
  RefreshCw,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface EligibleCandidate {
  jobNo: string;
  containerNo: string;
  shippingLineId: string;
  shippingLineName: string;
  quotationNo: string;
  repairNo: string;
  completedDate: string;
  description: string;
  amount: number;
  approvalRef?: string;
}

interface SyncDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncDebts: (jobNos: string[]) => void;
  currency: 'VND' | 'USD';
}

export const SyncDebtModal: React.FC<SyncDebtModalProps> = ({
  isOpen,
  onClose,
  onSyncDebts,
  currency
}) => {
  const [eligibleCandidates, setEligibleCandidates] = useState<EligibleCandidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setLoadError(null);
    billingApi.getSyncCandidates()
      .then((res) => {
        if (res.statusCode !== 200) throw new Error(res.message);
        const candidates: EligibleCandidate[] = (res.data || []).map((c: any) => ({
          jobNo: c.jobNo,
          containerNo: c.containerNo,
          shippingLineId: c.shippingLineCode,
          shippingLineName: c.shippingLineName,
          quotationNo: c.quotationNo,
          repairNo: c.repairNo,
          completedDate: (c.completedDate || '').substring(0, 10),
          description: c.description,
          amount: c.amount,
          approvalRef: c.approvalRef || undefined
        }));
        setEligibleCandidates(candidates);
        setSelectedCandidates(candidates.map((c) => c.jobNo));
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : 'Không thể tải danh sách ứng viên đồng bộ.'))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (jobNo: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(jobNo) ? prev.filter((c) => c !== jobNo) : [...prev, jobNo]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.length === eligibleCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(eligibleCandidates.map((c) => c.jobNo));
    }
  };

  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  const handleConfirmSync = () => {
    onSyncDebts(selectedCandidates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Đồng Bộ Công Nợ Từ Sửa Chữa Hoàn Thành
              </h2>
              <p className="text-xs text-slate-500">
                Tự động kiểm tra Báo giá đã duyệt & Container hoàn tất sửa chữa để ghi nhận vào sổ công nợ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Business rules verification badge */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-1.5 text-slate-600">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tiêu chí kiểm tra hợp lệ:</span>
            </div>
            <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-0.5">
              <li>Báo giá đã được hãng tàu phê duyệt (Status = APPROVED)</li>
              <li>Container đã thi công sửa chữa hoàn tất (RepairOrder.CompletedAt đã có)</li>
              <li>Có số tiền phải thu &gt; 0</li>
              <li>Chưa tạo công nợ trùng lặp (Anti-Duplicate Guard theo JobNo)</li>
            </ul>
          </div>

          {loadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs">{loadError}</div>
          )}

          {/* Candidates List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="font-bold text-slate-900 uppercase">
                Danh sách phát hiện ({eligibleCandidates.length} container mới)
              </div>
              {eligibleCandidates.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-blue-600 hover:text-blue-700 underline cursor-pointer"
                >
                  {selectedCandidates.length === eligibleCandidates.length
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl text-center text-xs text-slate-500">
                <RefreshCw className="w-6 h-6 mx-auto text-blue-500 mb-2 animate-spin" />
                Đang tải danh sách ứng viên...
              </div>
            ) : eligibleCandidates.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                Toàn bộ Container đã sửa chữa hoàn thành đều đã được đồng bộ vào Sổ công nợ. Không phát hiện bản ghi mới nào.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {eligibleCandidates.map((cand) => {
                  const isChecked = selectedCandidates.includes(cand.jobNo);
                  return (
                    <div
                      key={cand.jobNo}
                      onClick={() => toggleSelect(cand.jobNo)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 select-none ${
                        isChecked
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                            : 'bg-white border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {cand.containerNo}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-sky-600 font-mono text-[10px] border border-slate-200">
                              {cand.shippingLineId}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Báo giá: <strong className="text-slate-700 font-mono">{cand.quotationNo}</strong> | Job: <strong className="text-slate-700 font-mono">{cand.jobNo}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-600 text-sm">
                          {formatMoney(cand.amount)}
                        </div>
                        {cand.approvalRef && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {cand.approvalRef}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSync}
              disabled={selectedCandidates.length === 0}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg ${
                selectedCandidates.length > 0
                  ? 'bg-sky-600 hover:bg-sky-500 text-white '
                  : 'bg-slate-100 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Đồng Bộ {selectedCandidates.length} Khoản Công Nợ Mới</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
