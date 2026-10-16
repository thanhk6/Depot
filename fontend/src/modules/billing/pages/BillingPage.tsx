import React, { useState, useMemo, useEffect } from 'react';
import {
  ShippingLineDebt,
  DebtPeriod,
  Payment,
  PaymentAllocation,
  ShippingLineDebtSummary,
  DebtAgingBucket
} from '../types';
import { masterDataApi, billingApi } from '../../../api';
import { useAuth } from '../../../app/providers/AuthProvider';
import { mapDebtDto, mapPeriodDto, mapPaymentDto, mapAgingDto } from '../utils/mapBilling';
import { DebtDashboardKPI } from '../components/DebtDashboardKPI';
import { ShippingLineSummaryTab } from '../components/ShippingLineSummaryTab';
import { ContainerDebtLedgerTab } from '../components/ContainerDebtLedgerTab';
import { PeriodManagementTab } from '../components/PeriodManagementTab';
import { PaymentAllocationHistoryTab } from '../components/PaymentAllocationHistoryTab';
import { DebtAgingReportTab } from '../components/DebtAgingReportTab';
import { PaymentAllocationModal } from '../components/PaymentAllocationModal';
import { ContainerDebtDetailModal } from '../components/ContainerDebtDetailModal';
import { IssueInvoiceModal } from '../components/IssueInvoiceModal';
import { SyncDebtModal } from '../components/SyncDebtModal';
import { ClosePeriodModal } from '../components/ClosePeriodModal';
import { ReversePaymentModal } from '../components/ReversePaymentModal';

import {
  Building2,
  Container,
  CalendarCheck,
  CreditCard,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getApiErrorMessage } from '../../../utils/apiError';
import { LoadErrorBanner } from '../../../components/common/LoadErrorBanner';

export const BillingPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'SUMMARY' | 'CONTAINER_LEDGER' | 'PERIODS' | 'PAYMENTS' | 'AGING'
  >('CONTAINER_LEDGER');

  // Master States
  const [debts, setDebts] = useState<ShippingLineDebt[]>([]);
  const [periods, setPeriods] = useState<DebtPeriod[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agingData, setAgingData] = useState<DebtAgingBucket[]>([]);
  const [shippingLines, setShippingLines] = useState<Array<{ id: string; name: string; logo: string }>>([]);

  useEffect(() => {
    masterDataApi.getShippingLines().then((response: any) => {
      if (response?.statusCode === 200) setShippingLines((response.data || []).map((line: any) => ({ id: line.code, name: line.name, logo: line.code })));
    }).catch((error) => console.error('Không thể tải hãng tàu cho Billing:', error));
  }, []);

  // Lỗi tải phải hiện rõ — trước đây nuốt lỗi, màn hiện "không có khoản nợ" + tổng 0đ như thể hết nợ (BUG-016).
  const [loadError, setLoadError] = useState<string | null>(null);

  const reloadBillingData = () => {
    setLoadError(null);
    Promise.all([
      billingApi.getDebts(),
      billingApi.getPeriods(),
      billingApi.getPayments(),
      billingApi.getAgingReport()
    ]).then(([debtsRes, periodsRes, paymentsRes, agingRes]) => {
      if (debtsRes.statusCode === 200) setDebts((debtsRes.data || []).map(mapDebtDto));
      if (periodsRes.statusCode === 200) setPeriods((periodsRes.data || []).map(mapPeriodDto));
      if (paymentsRes.statusCode === 200) setPayments((paymentsRes.data || []).map(mapPaymentDto));
      if (agingRes.statusCode === 200) setAgingData((agingRes.data || []).map(mapAgingDto));
    }).catch((error) => setLoadError(getApiErrorMessage(error, 'Không thể tải dữ liệu công nợ.')));
  };

  useEffect(() => {
    reloadBillingData();
  }, []);

  // Filters for Container Ledger
  const [selectedCarrier, setSelectedCarrier] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchContainerNo, setSearchContainerNo] = useState<string>('');
  const [searchQuotationNo, setSearchQuotationNo] = useState<string>('');
  const [searchInvoiceNo, setSearchInvoiceNo] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('2026-08-01');
  const [toDate, setToDate] = useState<string>('2026-08-31');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentModalDefaultCarrier, setPaymentModalDefaultCarrier] = useState<string>('');
  const [paymentModalDefaultDebtId, setPaymentModalDefaultDebtId] = useState<string | undefined>(undefined);

  const [detailModalDebt, setDetailModalDebt] = useState<ShippingLineDebt | null>(null);
  const [issueInvoiceDebt, setIssueInvoiceDebt] = useState<ShippingLineDebt | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [closingPeriod, setClosingPeriod] = useState<DebtPeriod | null>(null);
  const [reversingPayment, setReversingPayment] = useState<Payment | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Calculations
  const totalReceivables = useMemo(() => {
    return debts
      .filter((d) => d.status !== 'CANCELLED')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
  }, [debts]);

  const overdueAmount = useMemo(() => {
    const today = '2026-08-18';
    return debts
      .filter((d) => d.status !== 'CANCELLED' && d.remainingAmount > 0 && d.dueDate < today)
      .reduce((sum, d) => sum + d.remainingAmount, 0);
  }, [debts]);

  const currentPeriodDebit = useMemo(() => {
    return periods
      .filter((p) => p.status === 'OPEN')
      .reduce((sum, p) => sum + p.periodDebit, 0);
  }, [periods]);

  const currentPeriodCredit = useMemo(() => {
    return periods
      .filter((p) => p.status === 'OPEN')
      .reduce((sum, p) => sum + p.periodCredit, 0);
  }, [periods]);

  const currentClosingBalance = useMemo(() => {
    return periods
      .filter((p) => p.status === 'OPEN')
      .reduce((sum, p) => sum + p.closingBalance, 0);
  }, [periods]);

  // Summaries by Shipping Line
  const shippingLineSummaries: ShippingLineDebtSummary[] = useMemo(() => {
    return shippingLines.map((carrier) => {
      const carrierDebts = debts.filter((d) => d.shippingLineId === carrier.id && d.status !== 'CANCELLED');
      const openPeriod = periods.find((p) => p.shippingLineId === carrier.id && p.status === 'OPEN');
      const latestPeriod = periods
        .filter((p) => p.shippingLineId === carrier.id)
        .sort((a, b) => (a.toDate > b.toDate ? -1 : 1))[0];

      const unpaidCount = carrierDebts.filter((d) => d.status === 'UNPAID').length;
      const partialCount = carrierDebts.filter((d) => d.status === 'PARTIAL').length;
      const paidCount = carrierDebts.filter((d) => d.status === 'PAID').length;

      const overdue = carrierDebts
        .filter((d) => d.remainingAmount > 0 && d.dueDate < '2026-08-18')
        .reduce((sum, d) => sum + d.remainingAmount, 0);

      const openingBalance = openPeriod ? openPeriod.openingBalance : latestPeriod?.openingBalance || 0;
      const periodDebit = openPeriod ? openPeriod.periodDebit : latestPeriod?.periodDebit || 0;
      const periodCredit = openPeriod ? openPeriod.periodCredit : latestPeriod?.periodCredit || 0;
      const closingBalance = openPeriod ? openPeriod.closingBalance : latestPeriod?.closingBalance || 0;

      return {
        shippingLineId: carrier.id,
        shippingLineName: carrier.name,
        logoText: carrier.logo,
        containerCount: carrierDebts.length,
        unpaidCount,
        partialCount,
        paidCount,
        openingBalance,
        periodDebit,
        periodCredit,
        closingBalance,
        overdueAmount: overdue,
        currency: 'VND'
      };
    });
  }, [debts, periods, shippingLines]);

  // Filtered Debts for Container Ledger
  const filteredDebts = useMemo(() => {
    return debts.filter((d) => {
      if (selectedCarrier !== 'ALL' && d.shippingLineId !== selectedCarrier) return false;
      if (selectedStatus !== 'ALL' && d.status !== selectedStatus) return false;
      if (searchContainerNo.trim() !== '') {
        if (!d.containerNo.toLowerCase().includes(searchContainerNo.toLowerCase().trim())) {
          return false;
        }
      }
      if (searchQuotationNo.trim() !== '') {
        if (!d.quotationNo.toLowerCase().includes(searchQuotationNo.toLowerCase().trim())) {
          return false;
        }
      }
      if (searchInvoiceNo.trim() !== '') {
        if (!d.invoiceNo || !d.invoiceNo.toLowerCase().includes(searchInvoiceNo.toLowerCase().trim())) {
          return false;
        }
      }
      return true;
    });
  }, [debts, selectedCarrier, selectedStatus, searchContainerNo, searchQuotationNo, searchInvoiceNo]);

  // Handler 1: Submit Payment & Allocation
  const handleSubmitPayment = (
    carrierId: string,
    paymentAmount: number,
    paymentMethod: 'BANK_TRANSFER' | 'SWIFT' | 'CASH' | 'VIETQR' | 'CREDIT_CARD',
    bankName: string,
    referenceNo: string,
    paymentDate: string,
    notes: string,
    allocationList: { debtId: string; containerNo: string; quotationNo: string; amount: number }[]
  ) => {
    billingApi.recordPayment({
      shippingLineCode: carrierId,
      paymentAmount,
      paymentMethod,
      bankName,
      referenceNo,
      paymentDate,
      notes,
      recordedBy: currentUser?.name || 'Kế toán AR',
      allocations: allocationList.map((alc) => ({
        debtCode: alc.debtId,
        containerNo: alc.containerNo,
        quotationNo: alc.quotationNo,
        amount: alc.amount
      }))
    }).then((res) => {
      if (res.statusCode !== 200) throw new Error(res.message);
      reloadBillingData();
      showToast(res.message || `Đã ghi nhận thanh toán ${paymentAmount.toLocaleString('vi-VN')} đ thành công!`);
    }).catch((error) => showToast(`❌ ${error instanceof Error ? error.message : 'Không thể ghi nhận thanh toán.'}`));
  };

  // Handler 2: Sync Debts from Completed Repairs — nhận danh sách JobNo được chọn trong SyncDebtModal
  const handleSyncDebts = (jobNos: string[]) => {
    billingApi.syncDebts(jobNos, currentUser?.name).then((res) => {
      if (res.statusCode !== 200) throw new Error(res.message);
      reloadBillingData();
      showToast(`Đã đồng bộ thành công ${(res.data || []).length} khoản công nợ container mới vào sổ kế toán!`);
    }).catch((error) => showToast(`❌ ${error instanceof Error ? error.message : 'Không thể đồng bộ công nợ.'}`));
  };

  // Handler 3: Issue Invoice
  const handleSubmitIssueInvoice = (debtId: string, invoiceNo: string) => {
    billingApi.issueInvoice(debtId, invoiceNo).then((res) => {
      if (res.statusCode !== 200) throw new Error(res.message);
      reloadBillingData();
      showToast(`Đã xuất và gắn Hóa đơn VAT ${invoiceNo} thành công (Công nợ giữ nguyên theo quy định).`);
    }).catch((error) => showToast(`❌ ${error instanceof Error ? error.message : 'Không thể xuất hóa đơn.'}`));
  };

  // Handler 4: Close Period
  const handleConfirmClosePeriod = (periodId: string, closingNotes: string) => {
    const targetPeriod = periods.find((p) => p.id === periodId);
    if (!targetPeriod) return;

    billingApi.closePeriod(periodId, closingNotes, currentUser?.name || 'Kế toán trưởng').then((res) => {
      if (res.statusCode !== 200) throw new Error(res.message);
      reloadBillingData();
      showToast(res.message || `Đã khóa sổ kỳ ${targetPeriod.periodCode} thành công.`);
    }).catch((error) => showToast(`❌ ${error instanceof Error ? error.message : 'Không thể khoá sổ kỳ công nợ.'}`));
  };

  // Handler 5: Reverse Payment
  const handleConfirmReversePayment = (paymentId: string, reason: string) => {
    const targetPayment = payments.find((p) => p.id === paymentId);
    if (!targetPayment || targetPayment.status === 'REVERSED') return;

    billingApi.reversePayment(paymentId, reason, currentUser?.name || 'Kế toán trưởng').then((res) => {
      if (res.statusCode !== 200) throw new Error(res.message);
      reloadBillingData();
      showToast(res.message || `Đã hủy phiếu ${paymentId} và hoàn trả công nợ cho các container tương ứng!`);
    }).catch((error) => showToast(`❌ ${error instanceof Error ? error.message : 'Không thể hủy khoản thanh toán.'}`));
  };

  const handleResetFilters = () => {
    setSelectedCarrier('ALL');
    setSelectedStatus('ALL');
    setSearchContainerNo('');
    setSearchQuotationNo('');
    setSearchInvoiceNo('');
    setFromDate('2026-08-01');
    setToDate('2026-08-31');
    showToast('Đã đặt lại toàn bộ bộ lọc về mặc định.');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {loadError && <LoadErrorBanner message={loadError} onRetry={reloadBillingData} />}
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-200 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-sky-200" />
          <div className="text-xs font-bold">{toastMessage}</div>
        </div>
      )}

      {/* 1. TOP DASHBOARD KPI METRICS */}
      <DebtDashboardKPI
        totalReceivables={totalReceivables}
        overdueAmount={overdueAmount}
        periodDebit={currentPeriodDebit}
        periodCredit={currentPeriodCredit}
        closingBalance={currentClosingBalance}
        currency="VND"
        onOpenPaymentModal={() => {
          setPaymentModalDefaultCarrier('MAERSK');
          setPaymentModalDefaultDebtId(undefined);
          setIsPaymentModalOpen(true);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenClosePeriodModal={() => {
          const firstOpen = periods.find((p) => p.status === 'OPEN');
          if (firstOpen) setClosingPeriod(firstOpen);
          else showToast('Tất cả các kỳ công nợ đều đã được chốt.');
        }}
        onExportExcel={() => showToast('Đang tạo và tải về file Excel báo cáo công nợ hãng tàu...')}
        onExportPDF={() => showToast('Đang xuất báo cáo công nợ định dạng PDF...')}
      />

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x overscroll-x-contain pb-1 sm:pb-0 scrollbar-none select-none">
          <button
            onClick={() => setActiveTab('CONTAINER_LEDGER')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'CONTAINER_LEDGER'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Container className="w-3.5 h-3.5" />
            <span>Chi tiết Công Nợ Container</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-50 text-sky-700 border border-sky-200">
              {debts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'SUMMARY'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Tổng Hợp Theo Hãng Tàu</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
              {shippingLines.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PERIODS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'PERIODS'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Kỳ Công Nợ & Khóa Sổ</span>
          </button>

          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'PAYMENTS'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Thanh Toán & Phân Bổ</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
              {payments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AGING')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'AGING'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Báo Cáo Tuổi Nợ (Aging)</span>
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {/* Tab 1: Chi tiết công nợ Container (Container Debt Ledger) */}
      {activeTab === 'CONTAINER_LEDGER' && (
        <ContainerDebtLedgerTab
          debts={filteredDebts}
          selectedCarrier={selectedCarrier}
          carriers={shippingLines}
          onChangeCarrier={setSelectedCarrier}
          selectedStatus={selectedStatus}
          onChangeStatus={setSelectedStatus}
          searchContainerNo={searchContainerNo}
          onChangeSearchContainerNo={setSearchContainerNo}
          searchQuotationNo={searchQuotationNo}
          onChangeSearchQuotationNo={setSearchQuotationNo}
          searchInvoiceNo={searchInvoiceNo}
          onChangeSearchInvoiceNo={setSearchInvoiceNo}
          fromDate={fromDate}
          onChangeFromDate={setFromDate}
          toDate={toDate}
          onChangeToDate={setToDate}
          onResetFilters={handleResetFilters}
          onViewDebtDetail={(d) => setDetailModalDebt(d)}
          onPayForDebt={(d) => {
            setPaymentModalDefaultCarrier(d.shippingLineId);
            setPaymentModalDefaultDebtId(d.id);
            setIsPaymentModalOpen(true);
          }}
          onIssueInvoice={(d) => setIssueInvoiceDebt(d)}
          currency="VND"
        />
      )}

      {/* Tab 2: Tổng hợp theo hãng tàu */}
      {activeTab === 'SUMMARY' && (
        <ShippingLineSummaryTab
          summaries={shippingLineSummaries}
          onSelectCarrier={(carrierId) => {
            setSelectedCarrier(carrierId);
            setActiveTab('CONTAINER_LEDGER');
          }}
          onPayForCarrier={(carrierId) => {
            setPaymentModalDefaultCarrier(carrierId);
            setPaymentModalDefaultDebtId(undefined);
            setIsPaymentModalOpen(true);
          }}
          onClosePeriodForCarrier={(carrierId) => {
            const openP = periods.find((p) => p.shippingLineId === carrierId && p.status === 'OPEN');
            if (openP) setClosingPeriod(openP);
            else showToast(`Hãng tàu ${carrierId} không có kỳ công nợ mở nào.`);
          }}
          currency="VND"
        />
      )}

      {/* Tab 3: Quản lý kỳ công nợ */}
      {activeTab === 'PERIODS' && (
        <PeriodManagementTab
          periods={periods}
          onClosePeriod={(p) => setClosingPeriod(p)}
          currency="VND"
        />
      )}

      {/* Tab 4: Lịch sử thanh toán & phân bổ */}
      {activeTab === 'PAYMENTS' && (
        <PaymentAllocationHistoryTab
          payments={payments}
          onReversePayment={(p) => setReversingPayment(p)}
          currency="VND"
        />
      )}

      {/* Tab 5: Báo cáo tuổi nợ */}
      {activeTab === 'AGING' && (
        <DebtAgingReportTab
          agingData={agingData}
          currency="VND"
          onExportExcel={() => showToast('Đang tải file Excel Báo cáo Tuổi nợ AR...')}
        />
      )}

      {/* 4. MODALS */}
      {/* Modal 1: Thanh toán & Phân bổ */}
      <PaymentAllocationModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        debts={debts}
        defaultCarrierId={paymentModalDefaultCarrier}
        shippingLines={shippingLines}
        defaultDebtId={paymentModalDefaultDebtId}
        onSubmitPayment={handleSubmitPayment}
        currency="VND"
      />

      {/* Modal 2: Chi tiết khoản nợ container */}
      <ContainerDebtDetailModal
        debt={detailModalDebt}
        onClose={() => setDetailModalDebt(null)}
        payments={payments}
        onOpenPayForDebt={(d) => {
          setPaymentModalDefaultCarrier(d.shippingLineId);
          setPaymentModalDefaultDebtId(d.id);
          setIsPaymentModalOpen(true);
        }}
        onOpenIssueInvoice={(d) => setIssueInvoiceDebt(d)}
        currency="VND"
      />

      {/* Modal 3: Xuất / Gắn Hóa đơn */}
      <IssueInvoiceModal
        isOpen={!!issueInvoiceDebt}
        onClose={() => setIssueInvoiceDebt(null)}
        debt={issueInvoiceDebt}
        onSubmitIssueInvoice={handleSubmitIssueInvoice}
        currency="VND"
      />

      {/* Modal 4: Đồng bộ từ Báo giá & Sửa chữa hoàn thành */}
      <SyncDebtModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncDebts={handleSyncDebts}
        currency="VND"
      />

      {/* Modal 5: Chốt kỳ công nợ */}
      <ClosePeriodModal
        isOpen={!!closingPeriod}
        onClose={() => setClosingPeriod(null)}
        period={closingPeriod}
        onConfirmClosePeriod={handleConfirmClosePeriod}
        currency="VND"
      />

      {/* Modal 6: Hủy thanh toán / Hoàn tác */}
      <ReversePaymentModal
        isOpen={!!reversingPayment}
        onClose={() => setReversingPayment(null)}
        payment={reversingPayment}
        onConfirmReverse={handleConfirmReversePayment}
        currency="VND"
      />
    </div>
  );
};
