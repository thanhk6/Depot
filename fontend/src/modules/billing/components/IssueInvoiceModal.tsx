import React, { useState } from 'react';
import { ShippingLineDebt } from '../types';
import {
  X,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';

interface IssueInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: ShippingLineDebt | null;
  onSubmitIssueInvoice: (debtId: string, invoiceNo: string) => void;
  currency: 'VND' | 'USD';
}

export const IssueInvoiceModal: React.FC<IssueInvoiceModalProps> = ({
  isOpen,
  onClose,
  debt,
  onSubmitIssueInvoice,
  currency
}) => {
  const [invoiceNo, setInvoiceNo] = useState<string>(
    `HDDT-2026-08-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [taxRate, setTaxRate] = useState<number>(0.08);

  if (!isOpen || !debt) return null;

  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNo.trim()) return;
    onSubmitIssueInvoice(debt.id, invoiceNo.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Xuất Hóa Đơn Điện Tử (VAT Invoice)
              </h2>
              <p className="text-xs text-slate-500">
                Gắn số hóa đơn tài chính cho khoản nợ container
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Container Info */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Container:</span>
              <span className="font-mono font-bold text-slate-900">{debt.containerNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hãng tàu:</span>
              <span className="font-bold text-sky-600">{debt.shippingLineId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số Báo giá gốc:</span>
              <span className="font-mono text-slate-700">{debt.quotationNo}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Tổng tiền phải thu:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {formatMoney(debt.totalAmount)}
              </span>
            </div>
          </div>

          {/* CRITICAL WARNING: RULE 4 */}
          <div className="bg-rose-50 border border-rose-200/40 p-3.5 rounded-2xl text-xs text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-700">NGUYÊN TẮC KẾ TOÁN QUAN TRỌNG:</div>
              <div className="text-[11px] text-rose-200/90 mt-0.5">
                Xuất hóa đơn chỉ xác nhận khoản phải thu tài chính. <strong>KHI XUẤT HÓA ĐƠN KHÔNG ĐƯỢC TRỪ CÔNG NỢ</strong>. Công nợ chỉ giảm khi hãng tàu xác nhận thanh toán.
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Số Hóa Đơn Điện Tử (VAT Invoice No) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="VD: HDDT-2026-08-0192"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Ngày phát hành
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Thuế suất GTGT (VAT)
                </label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  <option value={0.08}>8% (Nghị quyết 110/2023)</option>
                  <option value={0.1}>10% (Thuế suất chuẩn)</option>
                  <option value={0}>0% (Miễn thuế / Không chịu thuế)</option>
                </select>
              </div>
            </div>
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
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg "
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Xuất Hóa Đơn</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
