// Notification & Zalo Module Types for Depot Container Management System

export type NotificationChannel = 'ZALO_OA' | 'ZALO_ZNS' | 'IN_APP' | 'SMS' | 'EMAIL';

export type NotificationStatus = 'SENT' | 'PENDING' | 'FAILED' | 'CANCELLED';

export type NotificationPriority = 'HIGH' | 'NORMAL' | 'LOW';

export type RecipientType = 'EMPLOYEE' | 'CUSTOMER' | 'ALL';

export type ZaloConnectionStatus = 'CONNECTED' | 'PENDING' | 'DISCONNECTED';

export type BusinessEventType =
  | 'GATE_IN_COMPLETED'
  | 'INSPECTION_COMPLETED'
  | 'ESTIMATE_CREATED'
  | 'ESTIMATE_APPROVED'
  | 'ESTIMATE_REJECTED'
  | 'WORK_ORDER_CREATED'
  | 'MATERIAL_REQUESTED'
  | 'MATERIAL_ISSUED'
  | 'REPAIR_COMPLETED'
  | 'QC_PASSED'
  | 'QC_FAILED'
  | 'GATE_OUT_READY'
  | 'INVOICE_CREATED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'DEBT_REMINDER';

export type EntityType =
  | 'Gate'
  | 'Container'
  | 'Inspection'
  | 'Estimate'
  | 'MaintenanceOrder'
  | 'WorkOrder'
  | 'MaterialRequest'
  | 'MaterialIssue'
  | 'QC'
  | 'GateOut'
  | 'Invoice'
  | 'Payment'
  | 'Receivable';

export interface NotificationEmployee {
  id: string;
  name: string;
  department: string;
  role: string;
  phone: string;
  email: string;
  zaloId: string;
  zaloName: string;
  zaloConnected: boolean;
  zaloStatus: ZaloConnectionStatus;
  notificationsToday: number;
  totalReceived: number;
  isActive: boolean;
  avatar?: string;
  subscribedEvents: BusinessEventType[];
}

export interface CustomerNotificationPreference {
  gateIn: boolean;
  inspection: boolean;
  estimate: boolean;
  repair: boolean;
  qc: boolean;
  gateOut: boolean;
  invoice: boolean;
  payment: boolean;
  debtReminder: boolean;
  preferredChannel: NotificationChannel;
  autoZnsEnabled: boolean;
}

export interface NotificationCustomer {
  id: string;
  code: string;
  name: string;
  customerType: 'SHIPPING_LINE' | 'TRUCKING' | 'FORWARDER' | 'CONSIGNEE';
  contactPerson: string;
  phone: string;
  email: string;
  zaloId: string;
  zaloName: string;
  zaloConnected: boolean;
  zaloStatus: ZaloConnectionStatus;
  notificationCount: number;
  notificationsToday: number;
  isActive: boolean;
  avatar?: string;
  preferences: CustomerNotificationPreference;
}

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  eventType: BusinessEventType;
  targetAudience: RecipientType;
  channel: NotificationChannel;
  titleTemplate: string;
  contentTemplate: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sampleData?: Record<string, string>;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
}

export interface NotificationRecord {
  id: string;
  trackingCode: string;
  templateCode: string;
  templateName: string;
  eventType: BusinessEventType;
  recipientType: RecipientType;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  recipientZaloId?: string;
  channel: NotificationChannel;
  title: string;
  content: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  entityType?: EntityType;
  entityId?: string;
  entityReference?: string; // e.g. "MSKU1234567" or "WO-2026-00125"
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  sentAt?: string;
  failedAt?: string;
  errorMessage?: string;
  requestPayload?: any;
  responsePayload?: any;
  isRead?: boolean;
}

export interface NotificationQueueItem {
  id: string;
  queueCode: string;
  templateCode: string;
  templateName: string;
  eventType: BusinessEventType;
  recipientType: RecipientType;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  status: NotificationStatus;
  retryCount: number;
  maxRetries?: number;
  scheduledAt: string;
  scheduledTime?: string;
  createdAt: string;
  title: string;
  content: string;
  entityType?: EntityType;
  entityId?: string;
  entityReference?: string;
}

export interface ZaloSettingsConfig {
  provider: 'ZALO_OFFICIAL_ACCOUNT';
  environment: 'SANDBOX' | 'PRODUCTION';
  oaName?: string;
  oaId: string;
  appId: string;
  secretKey: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  webhookUrl: string;
  isConnected: boolean;
  lastConnectedAt: string;
  dailyQuota: number;
  monthlyUsage?: number;
  usedQuotaToday: number;
  znsTemplatesCount: number;
  webhookEventsEnabled: boolean;
  autoSendGateIn?: boolean;
  autoSendEstimateApproved?: boolean;
  autoSendQCPassed?: boolean;
  autoSendPaymentReceived?: boolean;
}

export interface SendNotificationRequest {
  channel: NotificationChannel;
  targetAudience: RecipientType;
  selectionMode: 'SINGLE' | 'MULTIPLE' | 'GROUP' | 'ALL';
  recipientIds: string[];
  templateId?: string;
  templateCode?: string;
  customTitle?: string;
  customContent?: string;
  parameters?: Record<string, string>;
  priority?: NotificationPriority;
  entityType?: EntityType;
  entityId?: string;
  entityReference?: string;
}

export interface NotificationDashboardKPIs {
  totalToday: number;
  sentSuccess: number;
  pendingQueue: number;
  failedCount: number;
  activeEmployeesZalo: number;
  activeCustomersZalo: number;
  successRate: number;
  dailyTrend: {
    date: string;
    sent: number;
    failed: number;
    pending: number;
  }[];
  audienceDistribution: {
    employees: number;
    customers: number;
  };
  channelDistribution: {
    zaloOa: number;
    zaloZns: number;
    inApp: number;
    sms: number;
  };
  moduleDistribution: {
    module: string;
    count: number;
  }[];
}
