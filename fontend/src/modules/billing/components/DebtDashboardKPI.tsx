import React from 'react';
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Scale,
  PlusCircle,
  RefreshCw,
  CalendarCheck,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface DebtDashboardKPIProps {
  totalReceivables: number;
  overdueAmount: number;
  periodDebit: number;
  periodCredit: number;
  closingBalance: number;
  currency: 'VND' | 'USD';
  onOpenPaymentModal: () => void;
  onOpenSyncModal: () => void;
  onOpenClosePeriodModal: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const DebtDashboardKPI: React.FC<DebtDashboardKPIProps> = ({
  totalReceivables,
  overdueAmount,
  periodDebit,
  periodCredit,
  closingBalance,
  currency,
  onOpenPaymentModal,
  onOpenSyncModal,
  onOpenClosePeriodModal,
  onExportExcel,
  onExportPDF
}) => {
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Quản Lý Công Nợ Hãng Tàu (Shipping Line AR)
              </h1>
              <p className="text-xs text-slate-500">
                Theo dõi phát sinh công nợ từ Báo giá & Sửa chữa hoàn thành, đối soát theo kỳ và phân bổ thanh toán
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer shadow-sm"
            title="Quét dữ liệu Báo giá đã duyệt & Container đã sửa xong để tạo công nợ"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Đồng bộ từ Sửa chữa</span>
          </button>

          <button
            onClick={onOpenClosePeriodModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer shadow-sm"
            title="Chốt kỳ công nợ hiện tại và chuyển số dư sang kỳ tiếp theo"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-violet-600" />
            <span>Chốt kỳ công nợ</span>
          </button>

          <button
            onClick={onOpenPaymentModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            title="Ghi nhận tiền thanh toán và phân bổ cho từng container"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Xác nhận & Phân bổ Thanh toán</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Tổng Phải Thu (Total Receivables) */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng nợ phải thu
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatMoney(totalReceivables)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Tổng các khoản nợ còn lại</span>
          </div>
        </div>

        {/* Card 2: Công nợ Quá Hạn (Overdue) */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-600 uppercase tracking-wider">
              Công nợ quá hạn
            </span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div data-testid="billing-overdue-kpi" className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
            {formatMoney(overdueAmount)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-red-500">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Quá hạn Net 30 ngày</span>
          </div>
        </div>

        {/* Card 3: Phát Sinh Kỳ Này (Period Debit) */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
              Phát sinh kỳ này (+)
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
            +{formatMoney(periodDebit)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Từ sửa chữa hoàn thành</span>
          </div>
        </div>

        {/* Card 4: Đã Thanh Toán Kỳ Này (Period Credit) */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
              Đã thu kỳ này (-)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
            -{formatMoney(periodCredit)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
            <span>Đã phân bổ cho container</span>
          </div>
        </div>

        {/* Card 5: Dư Cuối Kỳ (Closing Balance) */}
        <div className="bg-white border border-blue-200 p-4 rounded-2xl space-y-2 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Dư nợ cuối kỳ
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight">
            {formatMoney(closingBalance)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-600">
            <span>= Dư đầu + Phát sinh - Thu</span>
          </div>
        </div>
      </div>
    </div>
  );
};
