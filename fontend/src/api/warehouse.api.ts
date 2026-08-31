import apiClient from './axios';
import { ApiResponse } from '../types/common';

export const warehouseApi = {
  getTransactions: async (materialCode?: string) => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/warehouse/transactions', { params: { materialCode } });
    return response.data;
  },
  recordTransaction: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>('/warehouse/transactions', request);
    return response.data;
  },
  getMaterialGroups: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/warehouse/material-groups');
    return response.data;
  },
  getSuppliers: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/warehouse/suppliers');
    return response.data;
  },
  getStockBalances: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/warehouse/stock-balances');
    return response.data;
  },
  getReceipts: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/warehouse/receipts');
    return response.data;
  },
  getIssues: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/warehouse/issues');
    return response.data;
  }
};
