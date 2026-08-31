import React from 'react';
import { ShippingLineDebt, Payment } from '../types';
import {
  X,
  Container,
  FileText,
  Wrench,
  Receipt,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  ShieldCheck
} from 'lucide-react';

interface ContainerDebtDetailModalProps {
  debt: ShippingLineDebt | null;
  onClose: () => void;
  payments: Payment[];
  onOpenPayForDebt: (debt: ShippingLineDebt) => void;
  onOpenIssueInvoice: (debt: ShippingLineDebt) => void;
  currency: 'VND' | 'USD';
}

export const ContainerDebtDetailModal: React.FC<ContainerDebtDetailModalProps> = ({
  debt,
  onClose,
  payments,
  onOpenPayForDebt,
  onOpenIssueInvoice,
  currency
}) => {
  if (!debt) return null;

  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  // Find all payment allocations belonging to this debt
  const relatedAllocations: { payment: Payment; allocatedAmount: number; createdAt: string }[] = [];
  payments.forEach((p) => {
    p.allocations?.forEach((alc) => {
      if (alc.shippingLineDebtId === debt.id) {
        relatedAllocations.push({
          payment: p,
          allocatedAmount: alc.allocatedAmount,
          createdAt: alc.createdAt
        });
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Container className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
                  {debt.containerNo}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 font-mono text-xs border border-slate-700">
                  {debt.shippingLineId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chi tiết khoản công nợ phát sinh từ Báo giá & Sửa chữa hoàn thành
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Tổng tiền phải thu</div>
              <div className="text-lg font-mono font-bold text-white mt-1">
                {formatMoney(debt.totalAmount)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Theo báo giá được duyệt</div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase">Đã thanh toán</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {formatMoney(debt.paidAmount)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{relatedAllocations.length} lần phân bổ</div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-sky-800/40">
              <div className="text-[11px] font-bold text-sky-400 uppercase">Còn nợ hiện tại</div>
              <div className="text-xl font-mono font-black text-sky-400 mt-1">
                {formatMoney(debt.remainingAmount)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Trạng thái: <strong className="text-white">{debt.status}</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Nguồn gốc công nợ (Báo giá & Sửa chữa) */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Nguồn gốc phát sinh công nợ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Báo giá (Quotation Ref):</span>
                </div>
                <div className="font-mono font-bold text-white text-sm">{debt.quotationNo}</div>
                {debt.approvalRef && (
                  <div className="text-[11px] text-emerald-400 font-mono">
                    Mã duyệt EDI: {debt.approvalRef}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lệnh sửa chữa (Work Order):</span>
                </div>
                <div className="font-mono font-bold text-white text-sm">{debt.repairNo}</div>
                <div className="text-[11px] text-slate-400">
                  Ngày hoàn thành: <span className="text-slate-300 font-mono">{debt.debtDate}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 pt-2 border-t border-slate-800">
              <strong className="text-slate-400">Nội dung sửa chữa:</strong> {debt.description}
            </div>
          </div>

          {/* Section 2: Hóa đơn tài chính */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-400" />
                <span>Hóa đơn tài chính (VAT Invoice)</span>
              </div>
              {!debt.invoiceNo && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenIssueInvoice(debt);
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  + Xuất / Gắn Hóa đơn
                </button>
              )}
            </div>

            {debt.invoiceNo ? (
              <div className="flex items-center justify-between bg-purple-950/20 border border-purple-800/40 p-3 rounded-xl text-xs text-purple-200">
                <div>
                  Số Hóa Đơn: <strong className="font-mono text-white text-sm">{debt.invoiceNo}</strong>
                </div>
                <div className="text-[10px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-700/50">
                  Đã phát hành
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-1">
                Chưa phát hành hóa đơn tài chính cho khoản nợ này.
              </div>
            )}

            <div className="text-[11px] text-amber-300/80 bg-amber-950/20 border border-amber-800/30 p-2.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Lưu ý kế toán:</strong> Xuất hóa đơn chỉ xác nhận khoản phải thu, KHÔNG TRỪ CÔNG NỢ cho đến khi có phiếu thu/chuyển khoản xác nhận.
              </span>
            </div>
          </div>

          {/* Section 3: Lịch sử phân bổ thanh toán cho Container này */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Lịch sử các lần phân bổ thanh toán ({relatedAllocations.length})</span>
            </div>

            {relatedAllocations.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-500">
                Chưa phát sinh giao dịch thanh toán phân bổ nào cho container này.
              </div>
            ) : (
              <div className="space-y-2">
                {relatedAllocations.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{item.payment.id}</span>
                        <span className="text-[10px] text-slate-400">({item.payment.bankName})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Ngày: <span className="text-slate-300 font-mono">{item.payment.paymentDate}</span> | Ref: <span className="text-sky-300 font-mono">{item.payment.referenceNo}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        +{formatMoney(item.allocatedAmount)}
                      </div>
                      <div className="text-[9px] text-slate-500">Đã trừ công nợ</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>

          {debt.remainingAmount > 0 && (
            <button
              onClick={() => {
                onClose();
                onOpenPayForDebt(debt);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
            >
              <DollarSign className="w-4 h-4" />
              <span>Ghi Nhận Thanh Toán Cont Này</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
