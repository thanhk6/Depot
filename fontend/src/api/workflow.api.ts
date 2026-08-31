import apiClient from './axios';
import { ApiResponse } from '../types/common';

export interface WorkflowStepDto {
  id: string;
  number: string;
  title: string;
  moduleTarget: string;
  summary: string;
  details: string[];
  nextSteps: string[];
}

export interface WorkflowSummaryDto {
  totalJobs: number;
  gateInCount: number;
  surveyingCount: number;
  estimatingCount: number;
  awaitingApprovalCount: number;
  repairingCount: number;
  qcCount: number;
  readyForOutCount: number;
  gateOutCount: number;
}

export const workflowApi = {
  getDefinition: async () => {
    const res = await apiClient.get<ApiResponse<WorkflowStepDto[]>>('/workflow/definition');
    return res.data;
  },

  getSummary: async () => {
    const res = await apiClient.get<ApiResponse<WorkflowSummaryDto>>('/workflow/summary');
    return res.data;
  }
};