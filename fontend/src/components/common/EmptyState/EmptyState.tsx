import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Khóa dữ liệu rỗng',
  description = 'Hiện chưa có bản ghi nào trong hệ thống',
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200 border-dashed my-4 space-y-3 shadow-sm">
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
        <PackageOpen className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
