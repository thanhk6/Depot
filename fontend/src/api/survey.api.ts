import apiClient from './axios';
import { API_ENDPOINTS } from './endpoints';
import { ApiResponse } from '../types/common';
import { SurveyRecord } from '../types/container';

export const surveyApi = {
  submitSurvey: async (jobId: string, survey: SurveyRecord) => {
    const res = await apiClient.post<ApiResponse<SurveyRecord>>(API_ENDPOINTS.DEPOT_JOBS.SURVEY(jobId), survey);
    return res.data;
  },
  claimSurvey: async (jobId: string, staffId: number) => {
    const res = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.DEPOT_JOBS.SURVEY_CLAIM(jobId), { staffId });
    return res.data;
  },
  releaseSurveyClaim: async (jobId: string, staffId: number) => {
    const res = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.DEPOT_JOBS.SURVEY_RELEASE(jobId, staffId));
    return res.data;
  },
};

