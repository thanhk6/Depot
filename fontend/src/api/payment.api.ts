import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { PaymentRecord } from '../types/container';

export const paymentApi = {
  getServiceOrders: async () => {
    const res = await apiClient.get<ApiResponse<unknown[]>>('/service-orders');
    return res.data;
  },
  processPayment: async (jobId: string, method: string, txRef: string, amount: number) => {
    const res = await apiClient.post<ApiResponse<PaymentRecord>>(API_ENDPOINTS.DEPOT_JOBS.PAYMENT(jobId), { method, transactionRef: txRef, amount });
    return res.data;
  },
  processBankWebhook: async (content: string, amount: number) => {
    const res = await apiClient.post<ApiResponse<string>>(API_ENDPOINTS.WEBHOOKS.BANK_VIETQR, { content, amount });
    return res.data;
  },
};

