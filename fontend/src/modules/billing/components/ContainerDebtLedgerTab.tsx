import React, { useState } from 'react';
import { ShippingLineDebt, DebtStatus } from '../types';
import {
  Search,
  Filter,
  FileText,
  DollarSign,
  Receipt,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban
} from 'lucide-react';

interface ContainerDebtLedgerTabProps {
  debts: ShippingLineDebt[];
  selectedCarrier: string;
  onChangeCarrier: (carrier: string) => void;
  selectedStatus: string;
  onChangeStatus: (status: string) => void;
  searchContainerNo: string;
  onChangeSearchContainerNo: (val: string) => void;
  searchQuotationNo: string;
  onChangeSearchQuotationNo: (val: string) => void;
  searchInvoiceNo: string;
  onChangeSearchInvoiceNo: (val: string) => void;
  fromDate: string;
  onChangeFromDate: (val: string) => void;
  toDate: string;
  onChangeToDate: (val: string) => void;
  onResetFilters: () => void;
  onViewDebtDetail: (debt: ShippingLineDebt) => void;
  onPayForDebt: (debt: ShippingLineDebt) => void;
  onIssueInvoice: (debt: ShippingLineDebt) => void;
  currency: 'VND' | 'USD';
  // Danh sách hãng tàu thật (id = mã hãng tàu, khớp shippingLineId của khoản nợ).
  carriers?: Array<{ id: string; name: string }>;
}

export const ContainerDebtLedgerTab: React.FC<ContainerDebtLedgerTabProps> = ({
  debts,
  selectedCarrier,
  onChangeCarrier,
  selectedStatus,
  onChangeStatus,
  searchContainerNo,
  onChangeSearchContainerNo,
  searchQuotationNo,
  onChangeSearchQuotationNo,
  searchInvoiceNo,
  onChangeSearchInvoiceNo,
  fromDate,
  onChangeFromDate,
  toDate,
  onChangeToDate,
  carriers = [],
  onResetFilters,
  onViewDebtDetail,
  onPayForDebt,
  onIssueInvoice,
  currency
}) => {
  const [sortField, setSortField] = useState<keyof ShippingLineDebt>('debtDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedDebtsForBatchInvoice, setSelectedDebtsForBatchInvoice] = useState<string[]>([]);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  const handleSort = (field: keyof ShippingLineDebt) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedDebts = [...debts].sort((a, b) => {
    const valA = a[sortField] ?? '';
    const valB = b[sortField] ?? '';
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status: DebtStatus) => {
    switch (status) {
      case 'UNPAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            <span>Chưa thanh toán</span>
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Thanh toán 1 phần</span>
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã thanh toán</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
            <Ban className="w-3 h-3" />
            <span>Đã hủy</span>
          </span>
        );
    }
  };

  const totalAmountSum = sortedDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const paidAmountSum = sortedDebts.reduce((sum, d) => sum + d.paidAmount, 0);
  const remainingAmountSum = sortedDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

  return (
    <div className="space-y-4">
      {/* 1. Multi-Dimensional Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>Bộ lọc danh sách công nợ Container</span>
          </div>
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Hãng tàu */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Hãng tàu
            </label>
            <select
              value={selectedCarrier}
              onChange={(e) => onChangeCarrier(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
            >
              {/* Trước đây ghi cứng "Tất cả (MAERSK LINE)" + 1 lựa chọn "MAERSK" không khớp mã hãng tàu nào (BUG-033). */}
              <option value="ALL">Tất cả hãng tàu</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>

          {/* Container No */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Số Container
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="VD: MSKU1234567..."
                value={searchContainerNo}
                onChange={(e) => onChangeSearchContainerNo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 uppercase focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Số Báo giá (Quotation No) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Số Báo giá (Quotation)
            </label>
            <input
              type="text"
              placeholder="VD: BG-2026-00125..."
              value={searchQuotationNo}
              onChange={(e) => onChangeSearchQuotationNo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Số Hóa đơn (Invoice No) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Số Hóa đơn (Invoice)
            </label>
            <input
              type="text"
              placeholder="VD: HD-2026-00125..."
              value={searchInvoiceNo}
              onChange={(e) => onChangeSearchInvoiceNo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Trạng thái công nợ */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Trạng thái
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onChangeStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="UNPAID">🔴 Chưa thanh toán</option>
              <option value="PARTIAL">🟡 Thanh toán một phần</option>
              <option value="PAID">🟢 Đã thanh toán</option>
              <option value="CANCELLED">⚪ Đã hủy</option>
            </select>
          </div>

          {/* Ngày phát sinh (Từ ngày - Đến ngày) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Từ ngày
            </label>
            <input
              data-testid="billing-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => onChangeFromDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Đến ngày
            </label>
            <input
              data-testid="billing-to-date"
              type="date"
              value={toDate}
              onChange={(e) => onChangeToDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Container Debt DataGrid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                <th className="py-3 px-3.5 text-center w-12">STT</th>
                <th
                  onClick={() => handleSort('shippingLineId')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>HÃNG TÀU</span>
                    {sortField === 'shippingLineId' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('containerNo')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>CONTAINER NO</span>
                    {sortField === 'containerNo' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3.5">BÁO GIÁ</th>
                <th className="py-3 px-3.5">HÓA ĐƠN</th>
                <th
                  onClick={() => handleSort('debtDate')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>NGÀY PHÁT SINH</span>
                    {sortField === 'debtDate' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalAmount')}
                  className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>TỔNG TIỀN</span>
                    {sortField === 'totalAmount' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('paidAmount')}
                  className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>ĐÃ TRẢ</span>
                    {sortField === 'paidAmount' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('remainingAmount')}
                  className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>CÒN NỢ</span>
                    {sortField === 'remainingAmount' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">TRẠNG THÁI</th>
                <th className="py-3 px-3.5 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 text-xs">
              {sortedDebts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Không tìm thấy khoản công nợ container nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                sortedDebts.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-100 transition-colors group"
                  >
                    {/* STT */}
                    <td className="py-3 px-3.5 text-center text-slate-500 font-mono">
                      {idx + 1}
                    </td>

                    {/* Hãng tàu */}
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-sky-600 font-mono text-[11px] border border-slate-200">
                        {item.shippingLineId}
                      </span>
                    </td>

                    {/* Container No */}
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sky-700 group-hover:text-sky-600 transition">
                          {item.containerNo}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans truncate max-w-[170px]">
                        {item.description}
                      </div>
                    </td>

                    {/* Quotation No */}
                    <td className="py-3 px-3.5">
                      <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700">
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>{item.quotationNo}</span>
                      </div>
                      {item.approvalRef && (
                        <div className="text-[9px] text-emerald-600 font-mono">
                          {item.approvalRef}
                        </div>
                      )}
                    </td>

                    {/* Invoice No */}
                    <td className="py-3 px-3.5">
                      {item.invoiceNo ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[11px] border border-purple-200">
                          <Receipt className="w-3 h-3" />
                          <span>{item.invoiceNo}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onIssueInvoice(item)}
                          className="text-[10px] text-slate-500 hover:text-sky-700 underline cursor-pointer"
                          title="Gắn hóa đơn tài chính cho container này"
                        >
                          + Gắn hóa đơn
                        </button>
                      )}
                    </td>

                    {/* Ngày phát sinh */}
                    <td className="py-3 px-3.5 text-slate-700 font-mono text-[11px]">
                      {item.debtDate}
                    </td>

                    {/* Tổng tiền */}
                    <td className="py-3 px-3.5 text-right font-mono text-slate-700 font-medium">
                      {formatMoney(item.totalAmount)}
                    </td>

                    {/* Đã trả */}
                    <td className="py-3 px-3.5 text-right font-mono text-emerald-600">
                      {formatMoney(item.paidAmount)}
                    </td>

                    {/* Còn nợ */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-sky-600">
                      {formatMoney(item.remainingAmount)}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-3.5 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewDebtDetail(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                          title="Xem chi tiết khoản nợ container"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {item.remainingAmount > 0 && (
                          <button
                            onClick={() => onPayForDebt(item)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                            title="Thu tiền và phân bổ cho cont này"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Thu tiền</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer Summary */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                <td colSpan={6} className="py-3.5 px-4 text-slate-900 uppercase text-right">
                  TỔNG CỘNG ({sortedDebts.length} CONTAINER)
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono text-slate-700 font-black">
                  {formatMoney(totalAmountSum)}
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono text-emerald-600 font-black">
                  {formatMoney(paidAmountSum)}
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono text-sky-600 text-sm font-black">
                  {formatMoney(remainingAmountSum)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
