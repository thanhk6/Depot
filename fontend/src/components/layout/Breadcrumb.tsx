import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  currentTabLabel: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentTabLabel }) => {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-500">
      <div className="flex items-center gap-1.5 hover:text-slate-900 transition cursor-pointer">
        <Home className="w-3.5 h-3.5 text-blue-600" />
        <span>Depot System</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
      <span className="font-semibold text-slate-900">{currentTabLabel}</span>
    </nav>
  );
};
