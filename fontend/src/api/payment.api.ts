import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

export interface PaymentLogItem {
  id: number;
  loggedAt: string;
  depotJobId?: number | null;
  jobNo?: string | null;
  containerNo?: string | null;
  serviceOrderNo?: string | null;
  invoiceNo?: string | null;
  method: string;
  status: 'SUCCESS' | 'REJECTED' | string;
  amount: number;
  orderTotal?: number | null;
  cashReceived?: number | null;
  changeAmount?: number | null;
  transactionRef?: string | null;
  notes?: string | null;
  cashierName?: string | null;
  message?: string | null;
}

export interface ProcessPaymentResult {
  success: boolean;
  message: string;
  transactionRef?: string | null;
  invoiceNo?: string | null;
  amount: number;
  cashierName?: string | null;
  paidAt?: string | null;
}

export const paymentApi = {
  getServiceOrders: async () => {
    const res = await apiClient.get<ApiResponse<unknown[]>>('/service-orders');
    return res.data;
  },
  /**
   * Thu tại quầy: method = 'CASH' | 'BANK_TRANSFER'. Chuyển khoản bắt buộc transactionRef (mã GD ngân hàng);
   * tiền mặt gửi cashReceived để backend kiểm đủ tiền. Từ chối → 400 kèm lý do (dùng getApiErrorMessage).
   */
  processPayment: async (
    jobId: string,
    method: 'CASH' | 'BANK_TRANSFER',
    amount: number,
    options: { transactionRef?: string; cashReceived?: number; notes?: string } = {}
  ) => {
    const res = await apiClient.post<ApiResponse<ProcessPaymentResult>>(API_ENDPOINTS.DEPOT_JOBS.PAYMENT(jobId), {
      method,
      amount,
      transactionRef: options.transactionRef,
      cashReceived: options.cashReceived,
      notes: options.notes
    });
    return res.data;
  },
  /** Nhật ký thanh toán riêng (PaymentLogs). */
  getLogs: async (params: { from?: string; to?: string; method?: string; status?: string; keyword?: string; take?: number } = {}): Promise<PaymentLogItem[]> => {
    const res = await apiClient.get<ApiResponse<PaymentLogItem[]>>('/payment-logs', { params });
    return (res.data as any)?.data || [];
  },
  processBankWebhook: async (content: string, amount: number) => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.WEBHOOKS.BANK_VIETQR, { content, amount });
    return res.data;
  },
};

