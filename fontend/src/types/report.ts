export interface KPIStats {
  totalContainersInYard?: number;
  totalGateInToday?: number;
  totalGateOutToday?: number;
  pendingSurveyCount?: number;
  pendingEstimateCount?: number;
  underRepairCount?: number;
  pendingQCCount?: number;
  occupancyRatePercentage?: number;
  revenueTodayVnd?: number;

  totalJobs?: number;
  activeJobs?: number;
  readyForOutJobs?: number;
  completedJobs?: number;
  totalRevenueVnd?: number;
  firstPassYieldPercent?: number;
}

export interface ReportFilter {
  fromDate: string;
  toDate: string;
  shippingLine?: string;
  isoSize?: string;
  status?: string;
}
