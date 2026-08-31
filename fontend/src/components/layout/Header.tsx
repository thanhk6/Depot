import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { NotificationDropdown } from './NotificationDropdown';
import { UserMenu } from './UserMenu';
import { Menu, Sparkles, Cpu, GitBranch } from 'lucide-react';

interface HeaderProps {
  currentTabLabel: string;
  onToggleSidebar?: () => void;
  onOpenWorkflowModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTabLabel,
  onToggleSidebar,
  onOpenWorkflowModal
}) => {
  return (
    <header className="h-16 bg-white backdrop-blur-xl border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-900 lg:hidden rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Breadcrumb currentTabLabel={currentTabLabel} />
      </div>

      <div className="flex items-center gap-3">
        {/* Business Workflow Interactive Modal Button */}
        {onOpenWorkflowModal && (
          <button
            onClick={onOpenWorkflowModal}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Sơ Đồ Nghiệp Vụ Depot</span>
            <span className="sm:hidden">Quy Trình</span>
          </button>
        )}

        {/* System badge status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-emerald-600 font-semibold">AUTOMATED WORKFLOW ACTIVE</span>
        </div>

        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  );
};
