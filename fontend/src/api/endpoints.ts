export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  CUSTOMERS: {
    BASE: '/customers',
  },
  AUTH: {
    LOGIN: '/Users/authenticate',
    // Backend không cấp refresh token (JWT 8 giờ) — bỏ endpoint /auth/refresh-token trước đây trỏ vào 404.
    ME: '/Users/me',
    LOGOUT: '/Users/logout',
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
    APPROVE_ESTIMATE: (id: string) => `/DepotJobs/${id}/approve-estimate`,
    REJECT_ESTIMATE: (id: string) => `/DepotJobs/${id}/reject-estimate`,
    QC_COMPLETE: (id: string) => `/DepotJobs/${id}/qc-complete`,
    FORKLIFT_MOVE: (id: string) => `/DepotJobs/${id}/forklift-move`,
    FORKLIFT_CLAIM: (id: string) => `/DepotJobs/${id}/forklift/claim`,
    FORKLIFT_START: (id: string, operatorId: string) => `/DepotJobs/${id}/forklift/start?operatorId=${encodeURIComponent(operatorId)}`,
    FORKLIFT_CANCEL_CLAIM: (id: string, operatorId: string) => `/DepotJobs/${id}/forklift/cancel-claim?operatorId=${encodeURIComponent(operatorId)}`,
    REPAIR_ASSIGN: (id: string) => `/DepotJobs/${id}/repair/assign`,
    REPAIR_START: (id: string) => `/DepotJobs/${id}/repair/start`,
    REPAIR_COMPLETE: (id: string) => `/DepotJobs/${id}/repair/complete`,
    REPAIR_PHOTOS: (id: string) => `/DepotJobs/${id}/repair/photos`,
    GATE_OUT: (id: string) => `/DepotJobs/${id}/gate-out`,
    STORAGE_FEE: (id: string) => `/DepotJobs/${id}/storage-fee`,
    GATE_OUT_BOOKING_CHECK: (id: string, bookingNo: string) => `/DepotJobs/${id}/gate-out/booking-check?bookingNo=${encodeURIComponent(bookingNo)}`,
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
    CLEANING_TARIFFS: '/MasterData/cleaning-tariffs',
    STORAGE_TARIFFS: '/MasterData/storage-tariffs',
  },

  WEBHOOKS: {
    BANK_VIETQR: '/Webhooks/bank-vietqr',
    PAYMENT: '/Webhooks/payment',
  },
  SHIPPING: {
    SYNC: '/shipping/sync',
    CARRIERS: '/shipping/carriers',
    LOGS: '/shipping/logs',
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
