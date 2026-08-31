import {
  NotificationEmployee,
  NotificationCustomer,
  NotificationTemplate,
  NotificationRecord,
  NotificationQueueItem,
  ZaloSettingsConfig,
  NotificationDashboardKPIs,
  SendNotificationRequest,
  CustomerNotificationPreference
} from '../models/notification.types';

import { MOCK_ZALO_SETTINGS } from '../mock/notification.mock';
import { notificationApi } from '../../../api';

// Cấu hình Zalo OA vẫn giữ dạng demo/simulator theo quyết định của người dùng (chưa tích hợp Zalo OA
// thật — xem docs/backend-progress/36-zalo-overview.md) — chỉ phần này còn dùng state cục bộ.
let zaloSettingsState: ZaloSettingsConfig = { ...MOCK_ZALO_SETTINGS };

const mapEmployeeDto = (e: any): NotificationEmployee => ({
  id: e.id,
  name: e.name,
  department: e.department || '',
  role: e.role || '',
  phone: e.phone || '',
  email: e.email || '',
  zaloId: e.zaloId || '',
  zaloName: e.zaloName || '',
  zaloConnected: e.zaloConnected || false,
  zaloStatus: e.zaloStatus || 'DISCONNECTED',
  notificationsToday: 0,
  totalReceived: 0,
  isActive: e.isActive !== false,
  subscribedEvents: e.subscribedEvents || []
});

const mapCustomerDto = (c: any): NotificationCustomer => ({
  id: c.id,
  code: c.code,
  name: c.name,
  customerType: c.customerType || 'TRUCKING',
  contactPerson: c.contactPerson || '',
  phone: c.phone || '',
  email: c.email || '',
  zaloId: '',
  zaloName: '',
  zaloConnected: c.zaloConnected || false,
  zaloStatus: c.zaloStatus || 'DISCONNECTED',
  notificationCount: 0,
  notificationsToday: 0,
  isActive: c.isActive !== false,
  preferences: {
    gateIn: c.preferences?.gateIn ?? true,
    inspection: c.preferences?.inspection ?? true,
    estimate: c.preferences?.estimate ?? true,
    repair: c.preferences?.repair ?? true,
    qc: c.preferences?.qc ?? true,
    gateOut: c.preferences?.gateOut ?? true,
    invoice: c.preferences?.invoice ?? true,
    payment: c.preferences?.payment ?? true,
    debtReminder: c.preferences?.debtReminder ?? true,
    preferredChannel: c.preferences?.preferredChannel || 'ZALO_ZNS',
    autoZnsEnabled: c.preferences?.autoZnsEnabled ?? true
  }
});

const mapTemplateDto = (t: any): NotificationTemplate => ({
  id: t.code,
  code: t.code,
  name: t.name,
  eventType: t.eventType,
  targetAudience: t.targetAudience,
  channel: t.channel,
  titleTemplate: t.titleTemplate,
  contentTemplate: t.contentTemplate,
  variables: t.variablesJson ? JSON.parse(t.variablesJson) : [],
  isActive: t.isActive !== false,
  createdAt: t.createdAt || '',
  updatedAt: t.lastModifiedAt || t.createdAt || '',
  ctaButtonText: t.ctaButtonText || undefined,
  ctaButtonUrl: t.ctaButtonUrl || undefined
});

const mapQueueItemDto = (n: any): NotificationQueueItem => ({
  id: n.id,
  queueCode: n.trackingCode,
  templateCode: n.templateCode,
  templateName: n.templateCode,
  eventType: n.eventType,
  recipientType: n.recipientType,
  recipientId: n.recipientId,
  recipientName: n.recipientName || '',
  recipientPhone: n.recipientPhone || '',
  channel: n.channel,
  priority: n.priority,
  status: n.status,
  retryCount: n.retryCount,
  maxRetries: n.maxRetries,
  scheduledAt: n.createdAt,
  createdAt: n.createdAt,
  title: n.title,
  content: n.content,
  entityType: n.entityType || undefined,
  entityId: n.entityId || undefined,
  entityReference: n.entityReference || undefined
});

/**
 * Notification Service — nối API thật cho Employees/Customers/Templates/Queue/Dashboard (mục #41-47).
 * Zalo Settings & test connection vẫn là demo (chưa tích hợp Zalo OA thật, theo quyết định người dùng).
 */
export const notificationService = {
  // ==========================================
  // DASHBOARD & STATS
  // ==========================================
  getDashboardMetrics: async (): Promise<NotificationDashboardKPIs> => {
    const response: any = await notificationApi.getDashboardKpi();
    const k = response?.statusCode === 200 ? response.data : null;
    return {
      totalToday: k?.totalToday || 0,
      sentSuccess: k?.sentSuccess || 0,
      pendingQueue: k?.pendingQueue || 0,
      failedCount: k?.failedCount || 0,
      activeEmployeesZalo: k?.activeEmployeesZalo || 0,
      activeCustomersZalo: k?.activeCustomersZalo || 0,
      successRate: k?.successRate ?? 100,
      dailyTrend: [],
      audienceDistribution: { employees: k?.activeEmployeesZalo || 0, customers: k?.activeCustomersZalo || 0 },
      channelDistribution: { zaloOa: 0, zaloZns: 0, inApp: 0, sms: 0 },
      moduleDistribution: []
    };
  },

  // ==========================================
  // EMPLOYEES
  // ==========================================
  getEmployees: async (filters?: {
    department?: string;
    search?: string;
    zaloStatus?: string;
  }): Promise<NotificationEmployee[]> => {
    const response: any = await notificationApi.getEmployees();
    let list = response?.statusCode === 200 ? (response.data || []).map(mapEmployeeDto) : [];
    if (filters?.department && filters.department !== 'ALL') {
      list = list.filter((e: NotificationEmployee) => e.department.includes(filters.department!));
    }
    if (filters?.zaloStatus && filters.zaloStatus !== 'ALL') {
      list = list.filter((e: NotificationEmployee) => e.zaloStatus === filters.zaloStatus);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (e: NotificationEmployee) =>
          e.name.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.zaloName.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getEmployeeById: async (id: string): Promise<NotificationEmployee | undefined> => {
    const list = await notificationService.getEmployees();
    return list.find((e) => e.id === id);
  },

  updateEmployeeSubscribedEvents: async (
    id: string,
    events: NotificationEmployee['subscribedEvents']
  ): Promise<NotificationEmployee> => {
    const response: any = await notificationApi.updateEmployeeSubscription(id, events);
    if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể cập nhật đăng ký nhận thông báo.');
    return mapEmployeeDto(response.data);
  },

  // ==========================================
  // CUSTOMERS
  // ==========================================
  getCustomers: async (filters?: {
    customerType?: string;
    search?: string;
    zaloStatus?: string;
  }): Promise<NotificationCustomer[]> => {
    const response: any = await notificationApi.getCustomers();
    let list = response?.statusCode === 200 ? (response.data || []).map(mapCustomerDto) : [];
    if (filters?.customerType && filters.customerType !== 'ALL') {
      list = list.filter((c: NotificationCustomer) => c.customerType === filters.customerType);
    }
    if (filters?.zaloStatus && filters.zaloStatus !== 'ALL') {
      list = list.filter((c: NotificationCustomer) => c.zaloStatus === filters.zaloStatus);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c: NotificationCustomer) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getCustomerById: async (id: string): Promise<NotificationCustomer | undefined> => {
    const list = await notificationService.getCustomers();
    return list.find((c) => c.id === id || c.code === id);
  },

  updateCustomerPreferences: async (
    id: string,
    preferences: Partial<CustomerNotificationPreference>
  ): Promise<NotificationCustomer> => {
    const current = await notificationService.getCustomerById(id);
    const merged = { ...current?.preferences, ...preferences };
    const response: any = await notificationApi.updateCustomerPreference(id, merged);
    if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể cập nhật tuỳ chọn thông báo.');
    return mapCustomerDto(response.data);
  },

  // ==========================================
  // TEMPLATES
  // ==========================================
  getNotificationTemplates: async (search?: string): Promise<NotificationTemplate[]> => {
    const response: any = await notificationApi.getTemplates();
    let list = response?.statusCode === 200 ? (response.data || []).map(mapTemplateDto) : [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t: NotificationTemplate) =>
          t.name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.eventType.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getTemplateByIdOrCode: async (idOrCode: string): Promise<NotificationTemplate | undefined> => {
    const list = await notificationService.getNotificationTemplates();
    return list.find((t) => t.id === idOrCode || t.code === idOrCode);
  },

  createNotificationTemplate: async (
    template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NotificationTemplate> => {
    const response: any = await notificationApi.createTemplate(template);
    if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể tạo mẫu tin.');
    return mapTemplateDto(response.data);
  },

  updateNotificationTemplate: async (
    id: string,
    data: Partial<NotificationTemplate>
  ): Promise<NotificationTemplate> => {
    const current = await notificationService.getTemplateByIdOrCode(id);
    const merged = { ...current, ...data };
    const response: any = await notificationApi.updateTemplate(id, merged);
    if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể cập nhật mẫu tin.');
    return mapTemplateDto(response.data);
  },

  deleteNotificationTemplate: async (id: string): Promise<boolean> => {
    const response: any = await notificationApi.deleteTemplate(id);
    return response?.statusCode === 200;
  },

  // ==========================================
  // SEND NOTIFICATION
  // ==========================================
  sendNotification: async (
    req: SendNotificationRequest
  ): Promise<{ success: boolean; sentCount: number; records: NotificationRecord[] }> => {
    const templates = await notificationService.getNotificationTemplates();
    const resolvedTemplateCode =
      req.templateCode ||
      templates.find((t) => t.id === req.templateId || t.code === req.templateId)?.code ||
      'CUSTOM';
    const employees = await notificationService.getEmployees();
    const customers = await notificationService.getCustomers();
    const responses = await Promise.all(req.recipientIds.map((recipientId) => {
      const employee = employees.find((e) => e.id === recipientId);
      const customer = customers.find((c) => c.id === recipientId);
      return notificationApi.send({
        templateCode: resolvedTemplateCode, eventType: req.entityType || 'IN_APP', recipientType: req.targetAudience,
        recipientId, recipientName: employee?.name || customer?.name || '', recipientPhone: employee?.phone || customer?.phone || '',
        channel: req.channel, title: req.customTitle || 'Thông báo Depot', content: req.customContent || '',
        priority: req.priority || 'NORMAL', entityType: req.entityType, entityId: req.entityId, entityReference: req.entityReference
      });
    }));
    const createdRecords = responses.map((response: any) => response.data as NotificationRecord);
    return {
      success: responses.every((response: any) => response?.statusCode === 200),
      sentCount: createdRecords.length,
      records: createdRecords
    };
  },

  // ==========================================
  // NOTIFICATION HISTORY
  // ==========================================
  getNotificationHistory: async (filters?: {
    status?: string;
    channel?: string;
    recipientType?: string;
    eventType?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: NotificationRecord[]; total: number }> => {
    const response: any = await notificationApi.getAll({ status: filters?.status && filters.status !== 'ALL' ? filters.status : undefined });
    let list = response?.statusCode === 200 ? (response.data as NotificationRecord[]) : [];

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((h) => h.status === filters.status);
    }
    if (filters?.channel && filters.channel !== 'ALL') {
      list = list.filter((h) => h.channel === filters.channel);
    }
    if (filters?.recipientType && filters.recipientType !== 'ALL') {
      list = list.filter((h) => h.recipientType === filters.recipientType);
    }
    if (filters?.eventType && filters.eventType !== 'ALL') {
      list = list.filter((h) => h.eventType === filters.eventType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (h) =>
          h.recipientName.toLowerCase().includes(q) ||
          h.recipientPhone.includes(q) ||
          h.trackingCode.toLowerCase().includes(q) ||
          h.title.toLowerCase().includes(q) ||
          (h.entityReference && h.entityReference.toLowerCase().includes(q))
      );
    }

    return {
      items: list,
      total: list.length
    };
  },

  getNotificationById: async (id: string): Promise<NotificationRecord | undefined> => {
    const { items } = await notificationService.getNotificationHistory();
    return items.find((h) => h.id === id);
  },

  resendNotification: async (id: string): Promise<NotificationRecord> => {
    const response: any = await notificationApi.resend(id);
    if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể gửi lại thông báo.');
    return response.data as NotificationRecord;
  },

  // ==========================================
  // NOTIFICATION QUEUE
  // ==========================================
  getNotificationQueue: async (filters?: {
    priority?: string;
    status?: string;
    search?: string;
  }): Promise<NotificationQueueItem[]> => {
    const response: any = await notificationApi.getQueue();
    let list = response?.statusCode === 200 ? (response.data || []).map(mapQueueItemDto) : [];
    if (filters?.priority && filters.priority !== 'ALL') {
      list = list.filter((q: NotificationQueueItem) => q.priority === filters.priority);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((q: NotificationQueueItem) => q.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (item: NotificationQueueItem) =>
          item.queueCode.toLowerCase().includes(q) ||
          item.recipientName.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          (item.entityReference && item.entityReference.toLowerCase().includes(q))
      );
    }
    return list;
  },

  retryQueueItem: async (id: string): Promise<NotificationQueueItem> => {
    const response: any = await notificationApi.retry(id);
    if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể thử lại thông báo.');
    return mapQueueItemDto(response.data);
  },

  cancelQueueItem: async (id: string): Promise<boolean> => {
    const response: any = await notificationApi.cancel(id);
    return response?.statusCode === 200;
  },

  processAllQueue: async (): Promise<{ processedCount: number }> => {
    const response: any = await notificationApi.processAllQueue();
    return { processedCount: response?.data?.processedCount || 0 };
  },

  // ==========================================
  // ZALO SETTINGS & CONNECTION (demo — chưa tích hợp Zalo OA thật, xem 36-zalo-overview.md)
  // ==========================================
  getZaloSettings: async (): Promise<ZaloSettingsConfig> => {
    await new Promise((res) => setTimeout(res, 50));
    return { ...zaloSettingsState };
  },

  updateZaloSettings: async (settings: Partial<ZaloSettingsConfig>): Promise<ZaloSettingsConfig> => {
    await new Promise((res) => setTimeout(res, 120));
    zaloSettingsState = { ...zaloSettingsState, ...settings };
    return { ...zaloSettingsState };
  },

  testZaloConnection: async (): Promise<{
    success: boolean;
    oaName: string;
    oaId: string;
    followersCount: number;
    quotaRemaining: number;
    latencyMs: number;
    message: string;
  }> => {
    await new Promise((res) => setTimeout(res, 400));
    return {
      success: true,
      oaName: 'EMR DEPOT CONTAINER NOTIFICATION GATEWAY',
      oaId: zaloSettingsState.oaId || '38192847192837192',
      followersCount: 1485,
      quotaRemaining: 4872,
      latencyMs: 142,
      message: 'Kết nối Zalo Official Account & ZNS Gateway thành công 100%! (Chế độ demo)'
    };
  }
};
