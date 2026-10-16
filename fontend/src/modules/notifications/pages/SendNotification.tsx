import React, { useState, useEffect } from 'react';
import {
  Send,
  Save,
  Eye,
  CheckCircle2,
  Smartphone,
  MessageCircle,
  FileText,
  Users,
  Building2,
  Sliders,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  NotificationChannel,
  RecipientType,
  NotificationTemplate,
  NotificationEmployee,
  NotificationCustomer
} from '../models/notification.types';
import { notificationService } from '../services/notificationService';
import { RecipientSelector } from '../components/RecipientSelector';
import { TemplateSelector } from '../components/TemplateSelector';
import { MessagePreview } from '../components/MessagePreview';

interface SendNotificationProps {
  onSuccessNavigate?: () => void;
  initialTemplateId?: string;
  initialRecipientId?: string;
}

export const SendNotification: React.FC<SendNotificationProps> = ({
  onSuccessNavigate,
  initialTemplateId,
  initialRecipientId
}) => {
  const [channel, setChannel] = useState<NotificationChannel>('ZALO_OA');
  const [targetAudience, setTargetAudience] = useState<RecipientType>('CUSTOMER');
  const [employees, setEmployees] = useState<NotificationEmployee[]>([]);
  const [customers, setCustomers] = useState<NotificationCustomer[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);

  // Selection
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || 'TMPL-001');

  // Custom text override
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');

  // Variables state for parameter injection
  // Giá trị biến để người gửi tự nhập — trước đây điền sẵn container/tài xế/báo giá bịa.
  const [variablesState, setVariablesState] = useState<Record<string, string>>({
    '{{ContainerNumber}}': '',
    '{{CustomerName}}': '',
    '{{ContainerSize}}': '',
    '{{GateInTime}}': '',
    '{{YardLocation}}': '',
    '{{LicensePlate}}': '',
    '{{DriverName}}': '',
    '{{DriverPhone}}': '',
    '{{WorkOrderNo}}': '',
    '{{EstimateNo}}': '',
    '{{Amount}}': '',
    '{{Status}}': '',
    '{{InspectorName}}': ''
  });

  // UI state
  const [sending, setSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [empList, custList, tmplList] = await Promise.all([
        notificationService.getEmployees(),
        notificationService.getCustomers(),
        notificationService.getNotificationTemplates()
      ]);
      setEmployees(empList);
      setCustomers(custList);
      setTemplates(tmplList);

      // Handle initial recipient or template selection
      if (initialRecipientId) {
        setSelectedRecipientIds([initialRecipientId]);
        const isEmp = empList.some(e => e.id === initialRecipientId);
        if (isEmp) {
          setTargetAudience('EMPLOYEE');
        } else {
          setTargetAudience('CUSTOMER');
        }
      } else if (custList.length > 0 && selectedRecipientIds.length === 0) {
        setSelectedRecipientIds([custList[0].id]);
      }

      if (initialTemplateId) {
        setSelectedTemplateId(initialTemplateId);
        const tmpl = tmplList.find(t => t.id === initialTemplateId || t.code === initialTemplateId);
        if (tmpl) {
          setChannel(tmpl.channel);
          setCustomTitle(tmpl.titleTemplate);
          setCustomContent(tmpl.contentTemplate);
        }
      }
    };
    fetchData();
  }, [initialRecipientId, initialTemplateId]);

  const handleToggleRecipient = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedRecipientIds(ids);
  };

  const handleClearSelection = () => {
    setSelectedRecipientIds([]);
  };

  const handleSelectTemplate = (tmpl: NotificationTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setChannel(tmpl.channel);
    setCustomTitle(tmpl.titleTemplate);
    setCustomContent(tmpl.contentTemplate);
  };

  const handleChangeVariable = (key: string, value: string) => {
    setVariablesState((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const selectedTemplate = templates.find(
    (t) => t.id === selectedTemplateId || t.code === selectedTemplateId
  );

  // Compute live preview title & content
  const previewTitle = React.useMemo(() => {
    let t = customTitle || (selectedTemplate ? selectedTemplate.titleTemplate : 'Thông báo Depot EMR');
    Object.entries(variablesState).forEach(([k, v]) => {
      t = t.replaceAll(k, v);
    });
    return t;
  }, [customTitle, selectedTemplate, variablesState]);

  const previewContent = React.useMemo(() => {
    let c = customContent || (selectedTemplate ? selectedTemplate.contentTemplate : 'Nội dung thông báo');
    Object.entries(variablesState).forEach(([k, v]) => {
      c = c.replaceAll(k, v);
    });
    return c;
  }, [customContent, selectedTemplate, variablesState]);

  const firstRecipient = React.useMemo(() => {
    if (selectedRecipientIds.length === 0) return undefined;
    const rId = selectedRecipientIds[0];
    const emp = employees.find((e) => e.id === rId);
    const cust = customers.find((c) => c.id === rId);
    return emp || cust;
  }, [selectedRecipientIds, employees, customers]);

  const handleSend = async () => {
    if (selectedRecipientIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 người nhận thông báo!');
      return;
    }

    setSending(true);
    try {
      const res = await notificationService.sendNotification({
        channel,
        targetAudience,
        selectionMode: selectedRecipientIds.length === 1 ? 'SINGLE' : 'MULTIPLE',
        recipientIds: selectedRecipientIds,
        templateId: selectedTemplateId,
        customTitle: previewTitle,
        customContent: previewContent,
        parameters: variablesState,
        priority: 'HIGH',
        entityReference: variablesState['{{ContainerNumber}}'] || variablesState['{{WorkOrderNo}}']
      });

      setToastMessage(`🎉 Đã gửi thành công ${res.sentCount} thông báo qua Zalo Gateway!`);
      setTimeout(() => {
        setToastMessage(null);
        if (onSuccessNavigate) onSuccessNavigate();
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Channel Bar */}
      <div className="p-5 rounded-3xl bg-[#0b132b] border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            <span>GỬI THÔNG BÁO ZALO & HỆ THỐNG</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo và phát thông báo tức thì đến Nhân viên kỹ thuật hoặc Khách hàng hãng tàu
          </p>
        </div>

        {/* Channel Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Kênh Gửi:</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as NotificationChannel)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-sky-600 focus:outline-none focus:border-blue-500 cursor-pointer shadow"
          >
            <option value="ZALO_OA">🟢 Zalo Official Account (OA)</option>
            <option value="ZALO_ZNS">🔵 Zalo ZNS Template (CSKH)</option>
            <option value="IN_APP">🟣 In-App Notification</option>
            <option value="SMS">🟠 Tin Nhắn SMS Brandname</option>
            <option value="EMAIL">📧 Email Thông Báo</option>
          </select>
        </div>
      </div>

      {/* 3-Column Layout: Recipients | Template & Customization | Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Recipient Selector (4 Cols) */}
        <div className="lg:col-span-4 h-full">
          <RecipientSelector
            employees={employees}
            customers={customers}
            selectedAudience={targetAudience}
            onChangeAudience={(aud) => setTargetAudience(aud)}
            selectedIds={selectedRecipientIds}
            onToggleRecipient={handleToggleRecipient}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
          />
        </div>

        {/* Column 2: Template Selector & Dynamic Variables (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <TemplateSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            variablesState={variablesState}
            onChangeVariable={handleChangeVariable}
          />

          {/* Action Buttons Bar */}
          <div className="p-4 rounded-2xl bg-[#0b132b] border border-slate-200 flex items-center justify-between gap-2 shadow-xl">
            <button
              type="button"
              onClick={() => {
                alert('Đã lưu bản nháp thông báo vào bộ nhớ tạm.');
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Nháp</span>
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending || selectedRecipientIds.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg  active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Đang Gửi...' : `Gửi Thông Báo (${selectedRecipientIds.length})`}</span>
            </button>
          </div>
        </div>

        {/* Column 3: Live Smartphone Preview (4 Cols) */}
        <div className="lg:col-span-4 sticky top-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>Xem Trước Màn Hình Điện Thoại</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">Live Zalo Preview</span>
          </div>

          <MessagePreview
            channel={channel}
            title={previewTitle}
            content={previewContent}
            recipientName={firstRecipient?.name}
            recipientPhone={firstRecipient?.phone}
            ctaText={selectedTemplate?.ctaButtonText}
            ctaUrl={selectedTemplate?.ctaButtonUrl}
          />
        </div>
      </div>
    </div>
  );
};
