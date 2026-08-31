import React, { useState, useEffect } from 'react';
import {
  NotificationHeader,
  NotificationSubTab
} from './components/NotificationHeader';
import { NotificationDashboard } from './pages/NotificationDashboard';
import { SendNotification } from './pages/SendNotification';
import { EmployeeNotifications } from './pages/EmployeeNotifications';
import { CustomerNotifications } from './pages/CustomerNotifications';
import { NotificationTemplates } from './pages/NotificationTemplates';
import { NotificationHistory } from './pages/NotificationHistory';
import { NotificationQueue } from './pages/NotificationQueue';
import { ZaloSettings } from './pages/ZaloSettings';
import { ZaloSimulatorPage } from './pages/ZaloSimulatorPage';
// Đã gộp module "ZALO GATEWAY & CHAT" (trước đây là màn riêng biệt `ZaloModule.tsx`, sidebar riêng)
// vào chung 1 hub "THÔNG BÁO & ZALO GATEWAY" theo yêu cầu người dùng — 3 trang này trước đây chỉ được
// `ZaloModule.tsx` (đã xoá) render, nay import chéo sang module `notifications`.
import { ZaloOverviewPage } from '../zalo/pages/ZaloOverviewPage';
import { ZaloTemplatesPage } from '../zalo/pages/ZaloTemplatesPage';
import { ZaloLogsPage } from '../zalo/pages/ZaloLogsPage';

interface NotificationModuleProps {
  initialSubTab?: NotificationSubTab;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationModule: React.FC<NotificationModuleProps> = ({
  initialSubTab = 'dashboard',
  onNavigateTab
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<NotificationSubTab>(initialSubTab);
  const [selectedTemplateForSend, setSelectedTemplateForSend] = useState<string | undefined>();
  const [selectedRecipientForSend, setSelectedRecipientForSend] = useState<string | undefined>();

  useEffect(() => {
    if (initialSubTab) {
      setCurrentSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSelectSendWithTemplate = (templateId: string) => {
    setSelectedTemplateForSend(templateId);
    setCurrentSubTab('send');
  };

  const handleQuickSendToRecipient = (recipientId: string) => {
    setSelectedRecipientForSend(recipientId);
    setCurrentSubTab('send');
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Header Navigation */}
      <NotificationHeader
        currentTab={currentSubTab}
        onSelectTab={(tab) => setCurrentSubTab(tab)}
      />

      {/* Sub-Views Router */}
      <div className="animate-fade-in">
        {currentSubTab === 'dashboard' && (
          <NotificationDashboard
            onNavigateTab={(tab) => setCurrentSubTab(tab as NotificationSubTab)}
          />
        )}

        {currentSubTab === 'send' && (
          <SendNotification
            initialTemplateId={selectedTemplateForSend}
            initialRecipientId={selectedRecipientForSend}
            onSuccessNavigate={() => {
              setSelectedTemplateForSend(undefined);
              setSelectedRecipientForSend(undefined);
              setCurrentSubTab('history');
            }}
          />
        )}

        {currentSubTab === 'employees' && (
          <EmployeeNotifications
            onQuickSend={handleQuickSendToRecipient}
          />
        )}

        {currentSubTab === 'customers' && (
          <CustomerNotifications
            onQuickSend={handleQuickSendToRecipient}
          />
        )}

        {currentSubTab === 'templates' && (
          <NotificationTemplates
            onSelectSendWithTemplate={handleSelectSendWithTemplate}
          />
        )}

        {currentSubTab === 'history' && <NotificationHistory />}

        {currentSubTab === 'queue' && <NotificationQueue />}

        {/* 5 sub-tab Zalo Gateway gộp từ ZaloModule.tsx cũ — xem NotificationHeader.tsx để biết vì sao
            id đặt trùng khớp `zalo_overview/zalo_simulator/zalo_templates/zalo_settings/zalo_logs`. */}
        {currentSubTab === 'zalo_overview' && (
          <ZaloOverviewPage onNavigateSubTab={(tab) => setCurrentSubTab(tab)} />
        )}

        {currentSubTab === 'zalo_simulator' && (
          <ZaloSimulatorPage onNavigateTab={onNavigateTab} />
        )}

        {currentSubTab === 'zalo_templates' && (
          <ZaloTemplatesPage onSelectSend={handleSelectSendWithTemplate} />
        )}

        {currentSubTab === 'zalo_settings' && <ZaloSettings />}

        {currentSubTab === 'zalo_logs' && <ZaloLogsPage />}
      </div>
    </div>
  );
};
