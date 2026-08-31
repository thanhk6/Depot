import apiClient from './axios';

/** Hình dạng envelope thật của backend ({statusCode, message, data}) — khác `ApiResponse<T>` khai báo
 * trong types/common.ts (field success/errors/timestamp chưa từng được backend/frontend nào dùng thật). */
export interface BackendResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const billingApi = {
  getDebts: async (shippingLineCode?: string, status?: string) => {
    const res = await apiClient.get<BackendResponse<any[]>>('/billing/debts', { params: { shippingLineCode, status } });
    return res.data;
  },
  getPeriods: async (shippingLineCode?: string) => {
    const res = await apiClient.get<BackendResponse<any[]>>('/billing/periods', { params: { shippingLineCode } });
    return res.data;
  },
  getPayments: async (shippingLineCode?: string) => {
    const res = await apiClient.get<BackendResponse<any[]>>('/billing/payments', { params: { shippingLineCode } });
    return res.data;
  },
  getSyncCandidates: async () => {
    const res = await apiClient.get<BackendResponse<any[]>>('/billing/sync-candidates');
    return res.data;
  },
  syncDebts: async (jobNos: string[], performedBy?: string) => {
    const res = await apiClient.post<BackendResponse<any[]>>('/billing/sync', { jobNos, performedBy });
    return res.data;
  },
  issueInvoice: async (debtCode: string, invoiceNo: string) => {
    const res = await apiClient.post<BackendResponse<any>>(`/billing/debts/${debtCode}/invoice`, { invoiceNo });
    return res.data;
  },
  recordPayment: async (request: {
    shippingLineCode: string;
    paymentAmount: number;
    paymentMethod: string;
    bankName?: string;
    referenceNo?: string;
    paymentDate: string;
    notes?: string;
    recordedBy: string;
    allocations: { debtCode: string; containerNo: string; quotationNo: string; amount: number }[];
  }) => {
    const res = await apiClient.post<BackendResponse<any>>('/billing/payments', request);
    return res.data;
  },
  closePeriod: async (periodCode: string, closingNotes: string | undefined, closedBy: string) => {
    const res = await apiClient.post<BackendResponse<any>>(`/billing/periods/${periodCode}/close`, { closingNotes, closedBy });
    return res.data;
  },
  reversePayment: async (paymentCode: string, reason: string, reversedBy: string) => {
    const res = await apiClient.post<BackendResponse<any>>(`/billing/payments/${paymentCode}/reverse`, { reason, reversedBy });
    return res.data;
  },
  getAgingReport: async () => {
    const res = await apiClient.get<BackendResponse<any[]>>('/billing/aging');
    return res.data;
  }
};
