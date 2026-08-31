import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';

export const customerApi = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(API_ENDPOINTS.CUSTOMERS.BASE);
    return response.data;
  },
  getDrivers: async (customerCode: string) => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/${encodeURIComponent(customerCode)}/drivers`);
    return response.data;
  },
  getVehicles: async (customerCode: string) => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/${encodeURIComponent(customerCode)}/vehicles`);
    return response.data;
  },
  getUsers: async (customerCode: string) => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/${encodeURIComponent(customerCode)}/users`);
    return response.data;
  },
  getBookings: async (customerCode: string) => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/${encodeURIComponent(customerCode)}/bookings`);
    return response.data;
  },
  create: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.CUSTOMERS.BASE, request);
    return response.data;
  },
  update: async (id: string, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`, request);
    return response.data;
  },
  deactivate: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`);
    return response.data;
  },
  createDriver: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/drivers`, request);
    return response.data;
  },
  updateDriver: async (id: string, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/drivers/${id}`, request);
    return response.data;
  },
  deactivateDriver: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/drivers/${id}`);
    return response.data;
  },
  createVehicle: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/vehicles`, request);
    return response.data;
  },
  updateVehicle: async (id: string, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/vehicles/${id}`, request);
    return response.data;
  },
  deactivateVehicle: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/vehicles/${id}`);
    return response.data;
  },
  createUser: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/users`, request);
    return response.data;
  },
  updateUser: async (id: string, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/users/${id}`, request);
    return response.data;
  },
  deactivateUser: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/users/${id}`);
    return response.data;
  },
  createBooking: async (request: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/bookings`, request);
    return response.data;
  },
  updateBooking: async (id: string, request: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/bookings/${id}`, request);
    return response.data;
  },
  deactivateBooking: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<string>>(`${API_ENDPOINTS.CUSTOMERS.BASE}/bookings/${id}`);
    return response.data;
  }
};
