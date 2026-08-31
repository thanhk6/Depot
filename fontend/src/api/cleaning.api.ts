import apiClient from './axios';
import { ApiResponse } from '../types/common';

export interface CleaningWorkItemDto {
  id: number;
  cleaningRecordCode: string;
  cleaningCode: string;
  cleaningName: string;
  chemicalRequired: boolean;
  chemicalName?: string | null;
  estimatedDurationMin: number;
  unitPrice: number;
  totalPrice: number;
  responsibleParty: string;
  notes?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  completedBy?: string | null;
}

export interface CleaningRecordDto {
  id: number;
  code: string;
  jobNo?: string | null;
  containerNo: string;
  isoCode?: string | null;
  sizeType?: string | null;
  typeName?: string | null;
  shippingLine?: string | null;
  eeirNo?: string | null;
  cleaningBay?: string | null;
  status: string;
  cleaningStaff?: string | null;
  waterPressureBar: number;
  chemicalUsed?: string | null;
  chemicalVolumeLiters?: number | null;
  temperatureCelsius?: number | null;
  targetQualityGrade: string;
  beforeCleaningPhotoUrl?: string | null;
  beforePhotoTimestamp?: string | null;
  afterCleaningPhotoUrl?: string | null;
  afterPhotoTimestamp?: string | null;
  totalCostVnd: number;
  cleaningNotes?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  handoverToOperationDate?: string | null;
  handoverActor?: string | null;
  items: CleaningWorkItemDto[];
}

export interface CreateCleaningWorkItemRequest {
  cleaningCode: string;
  cleaningName: string;
  chemicalRequired: boolean;
  chemicalName?: string;
  estimatedDurationMin?: number;
  unitPrice: number;
  responsibleParty?: string;
  notes?: string;
}

export interface CreateCleaningRecordRequest {
  containerNo: string;
  jobNo?: string;
  isoCode?: string;
  sizeType?: string;
  typeName?: string;
  shippingLine?: string;
  eeirNo?: string;
  cleaningBay?: string;
  cleaningStaff?: string;
  targetQualityGrade?: string;
  notes?: string;
  items: CreateCleaningWorkItemRequest[];
}

export const cleaningApi = {
  getAll: async (status?: string) => {
    const res = await apiClient.get<ApiResponse<CleaningRecordDto[]>>('/cleaning', { params: { status } });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<CleaningRecordDto>>(`/cleaning/${id}`);
    return res.data;
  },
  create: async (request: CreateCleaningRecordRequest) => {
    const res = await apiClient.post<ApiResponse<CleaningRecordDto>>('/cleaning', request);
    return res.data;
  },
  toggleItem: async (recordId: number, itemId: number, isCompleted: boolean, performedBy?: string) => {
    const res = await apiClient.patch<ApiResponse<CleaningRecordDto>>(`/cleaning/${recordId}/items/${itemId}`, { isCompleted, performedBy });
    return res.data;
  },
  completeAllItems: async (recordId: number, performedBy?: string) => {
    const res = await apiClient.patch<ApiResponse<CleaningRecordDto>>(`/cleaning/${recordId}/items/complete-all`, { performedBy });
    return res.data;
  },
  updateExecution: async (recordId: number, request: Partial<{
    cleaningStaff: string;
    waterPressureBar: number;
    chemicalUsed: string;
    chemicalVolumeLiters: number;
    temperatureCelsius: number;
    targetQualityGrade: string;
    cleaningNotes: string;
    afterCleaningPhotoUrl: string;
  }>) => {
    const res = await apiClient.put<ApiResponse<CleaningRecordDto>>(`/cleaning/${recordId}/execution`, request);
    return res.data;
  },
  handover: async (recordId: number, handoverActor: string) => {
    const res = await apiClient.post<ApiResponse<CleaningRecordDto>>(`/cleaning/${recordId}/handover`, { handoverActor });
    return res.data;
  }
};
