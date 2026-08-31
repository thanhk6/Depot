export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  CUSTOMERS: {
    BASE: '/customers',
  },
  AUTH: {
    LOGIN: '/Users/authenticate',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
  },
  DEPOT_JOBS: {
    BASE: '/DepotJobs',
    STATS: '/DepotJobs/stats',
    GET_BY_ID: (id: string) => `/DepotJobs/${id}`,
    HISTORY: (id: string) => `/DepotJobs/${id}/history`,
    DELETE: (id: string) => `/DepotJobs/${id}`,
    UPDATE_STATUS: (id: string) => `/DepotJobs/${id}/status`,
    GATE_IN: '/DepotJobs/gate-in',
    SURVEY: (id: string) => `/DepotJobs/${id}/survey`,
    SURVEY_CLAIM: (id: string) => `/DepotJobs/${id}/survey/claim`,
    SURVEY_RELEASE: (id: string, staffId: number) => `/DepotJobs/${id}/survey/release?staffId=${staffId}`,
    ESTIMATE: (id: string) => `/DepotJobs/${id}/estimate`,
    APPROVE_ESTIMATE: (id: string, approverName = "Hãng Tàu Phê Duyệt") =>
      `/DepotJobs/${id}/approve-estimate?approverName=${encodeURIComponent(approverName)}`,
    REJECT_ESTIMATE: (id: string) => `/DepotJobs/${id}/reject-estimate`,
    QC_COMPLETE: (id: string) => `/DepotJobs/${id}/qc-complete`,
    FORKLIFT_MOVE: (id: string) => `/DepotJobs/${id}/forklift-move`,
    REPAIR_ASSIGN: (id: string) => `/DepotJobs/${id}/repair/assign`,
    REPAIR_START: (id: string) => `/DepotJobs/${id}/repair/start`,
    REPAIR_COMPLETE: (id: string) => `/DepotJobs/${id}/repair/complete`,
    GATE_OUT: (id: string) => `/DepotJobs/${id}/gate-out`,
    PAYMENT: (id: string) => `/depot/jobs/${id}/payment`,
  },
  SERVICE_ORDERS: {
    BASE: '/service-orders',
  },
  MASTER_DATA: {
    ALL: '/MasterData/all',
    CATALOG: '/MasterData/catalog',
    SHIPPING_LINES: '/MasterData/shipping-lines',
    MATERIALS: '/MasterData/materials',
    // Cước Nâng Hạ (LoLo) / Cước Lưu Bãi (Storage) — bảng riêng, tách khỏi catalog dùng chung cũ (xem
    // docs/frontend-tariff-catalog-split.md).
    SERVICE_TARIFFS: '/MasterData/service-tariffs',
    STORAGE_TARIFFS: '/MasterData/storage-tariffs',
  },
  WEBHOOKS: {
    BANK_VIETQR: '/Webhooks/bank-vietqr',
    PAYMENT: '/Webhooks/payment',
  },
  SHIPPING: {
    SYNC: '/shipping/sync',
  },
  SYSTEM: {
    USERS: '/system/users',
    USER_BY_ID: (id: string) => `/system/users/${id}`,
    ROLES: '/system/roles',
    PERMISSIONS: '/system/permissions',
    MENUS: '/system/menus',
    SECURITY_POLICY: '/system/security-policy',
    AUDIT_LOGS: '/system/audit-logs',
  },
  REPORTS: {
    KPI: '/reports/kpi',
    EXPORT_EXCEL: '/reports/export-excel',
    DASHBOARD_OVERVIEW: '/dashboard/overview',
  },
  YARD: {
    BASE: '/Yard',
    OCCUPANCY: '/Yard/occupancy',
  },
};
